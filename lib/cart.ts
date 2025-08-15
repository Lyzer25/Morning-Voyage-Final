import { put, list } from '@vercel/blob';
import type { ShoppingCart } from './types';

/**
 * Helper to build blob key for carts.
 * - For user carts stored under carts/user/{userId}.json
 * - For guest carts stored under carts/{sessionId}.json
 */
function cartKey(cartId: string, isUser = false) {
  return isUser ? `carts/user/${cartId}.json` : `carts/${cartId}.json`;
}

/**
 * Structured logging for cart operations
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.CART_DEBUG === 'true';

function logCartOperation(operation: string, data: any) {
  if (isDevelopment || isDebugMode) {
    console.log(`[Cart ${operation}]:`, data);
  }
}

function logCartError(operation: string, error: any, context?: any) {
  console.error(`[Cart ${operation} Error]:`, error, context || '');
}

/**
 * Get cart by id (user or session).
 * Returns null if not found or expired.
 */
export async function getCart(cartId: string, isUser: boolean = false): Promise<ShoppingCart | null> {
  try {
    const key = cartKey(cartId, isUser);
    logCartOperation('get_start', { cartId, isUser, key });
    
    // Use list() to locate the cart blob (proven approach from lib/blob-accounts.ts)
    const blobs = await list({ prefix: key, limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    
    logCartOperation('blob_lookup', { found: !!blobItem, hasUrl: !!downloadUrl });
    
    if (!downloadUrl) {
      logCartOperation('get_not_found', { cartId });
      return null;
    }

    const res = await fetch(downloadUrl, { cache: 'no-store' });
    logCartOperation('blob_fetch', { status: res.status });
    
    if (!res.ok) {
      logCartError('fetch_failed', `HTTP ${res.status}`, { cartId, downloadUrl });
      return null;
    }
    
    const cart: ShoppingCart = await res.json();
    logCartOperation('get_success', { 
      cartId: cart.id, 
      items: cart.items.length, 
      total: cart.totals.total,
      expires_at: cart.expires_at 
    });

    // Expiration check
    if (new Date(cart.expires_at) < new Date()) {
      logCartOperation('cart_expired', { cartId, expires_at: cart.expires_at });
      return null;
    }
    
    return cart;
  } catch (err) {
    logCartError('get_failed', err, { cartId, isUser, key: cartKey(cartId, isUser) });
    return null;
  }
}

/**
 * Save cart to blob storage (overwrites).
 * Ensures totals are calculated.
 */
export async function saveCart(cart: ShoppingCart, isUser: boolean = false): Promise<void> {
  try {
    const key = cartKey(isUser ? (cart.user_id || cart.session_id) : cart.session_id, isUser);
    console.log('💾 [SAVE CART] Saving cart with key:', key);
    console.log('💾 [SAVE CART] Cart details:', { 
      id: cart.id, 
      user_id: cart.user_id, 
      session_id: cart.session_id, 
      items: cart.items.length,
      isUser 
    });
    
    cart.totals.subtotal = cart.items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.base_price), 0);
    cart.totals.total = cart.totals.subtotal;

    console.log('💾 [SAVE CART] Calculated totals:', cart.totals);

    await put(key, JSON.stringify(cart, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });
    
    console.log('✅ [SAVE CART] Cart saved successfully to blob storage');
  } catch (err) {
    const errorKey = cartKey(isUser ? (cart.user_id || cart.session_id) : cart.session_id, isUser);
    console.error('❌ [SAVE CART] Failed to save cart:', { cartId: cart.id, key: errorKey, isUser, error: (err as any)?.message || err });
    throw err;
  }
}

/**
 * Add (or increment) an item in the cart. Creates a new cart if none exists.
 * guest carts expire in 7 days; user carts expire in 30 days.
 */
export async function addToCart(
  cartId: string,
  productId: string,
  productName: string,
  basePrice: number,
  quantity = 1,
  isUser: boolean = false
): Promise<ShoppingCart> {
  try {
    console.log('🛒 [ADD TO CART] Starting addToCart with params:', { cartId, productId, productName, basePrice, quantity, isUser });
    
    let cart = await getCart(cartId, isUser);
    
    console.log('🛒 [ADD TO CART] Existing cart found:', cart ? { id: cart.id, items: cart.items.length, total: cart.totals.total } : 'null');

    if (!cart) {
      console.log('🛒 [ADD TO CART] No existing cart found, creating new cart');
      const now = new Date();
      const expires = new Date(Date.now() + (isUser ? 30 : 7) * 24 * 60 * 60 * 1000);
      cart = {
        id: crypto.randomUUID(),
        user_id: isUser ? cartId : undefined,
        session_id: cartId,
        items: [],
        totals: { subtotal: 0, total: 0 },
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        expires_at: expires.toISOString(),
      };
      console.log('🛒 [ADD TO CART] Created new cart:', { id: cart.id, user_id: cart.user_id, session_id: cart.session_id });
    } else {
      console.log('🛒 [ADD TO CART] Using existing cart with', cart.items.length, 'items');
    }

    const existingIndex = cart.items.findIndex(i => i.product_id === productId);
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].line_total = cart.items[existingIndex].quantity * basePrice;
    } else {
      cart.items.push({
        product_id: productId,
        product_name: productName,
        quantity,
        base_price: basePrice,
        line_total: quantity * basePrice,
      });
    }

    cart.updated_at = new Date().toISOString();
    await saveCart(cart, isUser);
    return cart;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to add to cart', { cartId, productId, error: (err as any)?.message || err });
    throw err;
  }
}

/**
 * Remove an item from cart. If item doesn't exist, returns the current cart or null.
 * If removing the last item, deletes the cart blob and returns null.
 */
export async function removeFromCart(cartId: string, productId: string, isUser: boolean = false): Promise<ShoppingCart | null> {
  try {
    const cart = await getCart(cartId, isUser);
    if (!cart) return null;

    const idx = cart.items.findIndex(i => i.product_id === productId);
    if (idx >= 0) {
      cart.items.splice(idx, 1);
      cart.updated_at = new Date().toISOString();
      
      // If cart is now empty, delete it entirely
      if (cart.items.length === 0) {
        console.log('🗑️ [REMOVE CART] Cart is empty after removal, deleting cart:', cartId);
        await deleteCart(cartId, isUser);
        return null; // Return null to indicate no cart exists
      }
      
      // Save cart with remaining items
      await saveCart(cart, isUser);
    }
    return cart;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove from cart', { cartId, productId, error: (err as any)?.message || err });
    return null;
  }
}

/**
 * Delete cart blob from storage
 */
export async function deleteCart(cartId: string, isUser: boolean = false): Promise<void> {
  try {
    const { del } = await import('@vercel/blob');
    const key = cartKey(cartId, isUser);
    console.log('🗑️ [DELETE CART] Deleting cart blob:', key);
    await del(key);
    console.log('✅ [DELETE CART] Cart blob deleted successfully');
  } catch (error) {
    console.error('❌ [DELETE CART] Failed to delete cart blob:', error);
    // Don't throw - deletion failure shouldn't break the remove operation
  }
}

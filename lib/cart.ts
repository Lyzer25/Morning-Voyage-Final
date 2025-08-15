import * as vercelBlob from '@vercel/blob';
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
 * Get cart by id (user or session).
 * Returns null if not found or expired.
 */
export async function getCart(cartId: string, isUser: boolean = false): Promise<ShoppingCart | null> {
  try {
    const key = cartKey(cartId, isUser);
    console.log('📦 [GET CART] Attempting to get cart with key:', key);
    console.log('📦 [GET CART] Cart params:', { cartId, isUser });
    
    const downloadUrl = await vercelBlob.getDownloadUrl(key);
    console.log('📦 [GET CART] Download URL:', downloadUrl ? 'found' : 'null');
    
    if (!downloadUrl) {
      console.log('📦 [GET CART] No download URL found, cart does not exist');
      return null;
    }

    const res = await fetch(downloadUrl);
    console.log('📦 [GET CART] Fetch response status:', res.status);
    
    if (!res.ok) {
      console.log('📦 [GET CART] Fetch failed with status:', res.status);
      return null;
    }
    
    const cart: ShoppingCart = await res.json();
    console.log('📦 [GET CART] Cart retrieved successfully:', { id: cart.id, items: cart.items.length, expires_at: cart.expires_at });

    // Expiration check
    if (new Date(cart.expires_at) < new Date()) {
      console.log('📦 [GET CART] Cart expired, returning null');
      return null;
    }
    
    console.log('📦 [GET CART] Returning valid cart with', cart.items.length, 'items');
    return cart;
  } catch (err) {
    console.error('❌ [GET CART] Failed to get cart:', { cartId, isUser, key: cartKey(cartId, isUser), error: (err as any)?.message || err });
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

    await vercelBlob.put(key, JSON.stringify(cart, null, 2), {
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
 */
export async function removeFromCart(cartId: string, productId: string, isUser: boolean = false): Promise<ShoppingCart | null> {
  try {
    const cart = await getCart(cartId, isUser);
    if (!cart) return null;

    const idx = cart.items.findIndex(i => i.product_id === productId);
    if (idx >= 0) {
      cart.items.splice(idx, 1);
      cart.updated_at = new Date().toISOString();
      await saveCart(cart, isUser);
    }
    return cart;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove from cart', { cartId, productId, error: (err as any)?.message || err });
    return null;
  }
}

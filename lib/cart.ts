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
    const downloadUrl = await vercelBlob.getDownloadUrl(key);
    if (!downloadUrl) return null;

    const res = await fetch(downloadUrl);
    if (!res.ok) return null;
    const cart: ShoppingCart = await res.json();

    // Expiration check
    if (new Date(cart.expires_at) < new Date()) return null;
    return cart;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to get cart', { cartId, isUser, error: (err as any)?.message || err });
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
    cart.totals.subtotal = cart.items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.base_price), 0);
    cart.totals.total = cart.totals.subtotal;

    await vercelBlob.put(key, JSON.stringify(cart, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to save cart', { cartId: cart.id, isUser, error: (err as any)?.message || err });
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
    let cart = await getCart(cartId, isUser);

    if (!cart) {
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

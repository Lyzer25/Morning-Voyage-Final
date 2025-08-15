import type { ShoppingCart, CartItem } from './types';

/**
 * Helper functions for cart operations
 */

export function generateCartId(userId?: string, guestSessionId?: string): string {
  if (userId) {
    return userId; // For user carts, cartId is userId
  }
  if (guestSessionId) {
    return guestSessionId; // For guest carts, cartId is sessionId
  }
  throw new Error('Either userId or guestSessionId required');
}

export function isCartExpired(cart: ShoppingCart): boolean {
  const now = new Date();
  const expiresAt = new Date(cart.expires_at);
  return now > expiresAt;
}

export function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.base_price);
  }, 0);
  
  return {
    subtotal,
    tax: 0,        // TODO: Implement tax calculation
    shipping: 0,   // TODO: Implement shipping calculation
    discount: 0,   // TODO: Implement discount calculation
    total: subtotal
  };
}

export function validateCartItem(item: Partial<CartItem>): string[] {
  const errors: string[] = [];
  
  if (!item.product_id) {
    errors.push('product_id is required');
  }
  
  if (!item.quantity || item.quantity < 1) {
    errors.push('quantity must be greater than 0');
  }
  
  if (!item.base_price || item.base_price < 0) {
    errors.push('base_price must be greater than or equal to 0');
  }
  
  return errors;
}

export function createEmptyCart(
  userId?: string, 
  guestSessionId?: string
): ShoppingCart {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (userId ? 30 : 7) * 24 * 60 * 60 * 1000); // 30 days for users, 7 for guests
  
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    session_id: guestSessionId || crypto.randomUUID(),
    items: [],
    totals: {
      subtotal: 0,
      total: 0
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  };
}

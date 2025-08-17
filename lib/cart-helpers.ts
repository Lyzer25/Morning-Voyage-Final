import type { Cart, CartItem, CartTotals } from '@/types/cart';

export function generateCartId(userId?: string, guestSessionId?: string): string {
  if (userId) {
    return `cart_user_${userId}`;
  }
  if (guestSessionId) {
    return `cart_guest_${guestSessionId}`;
  }
  throw new Error('Either userId or guestSessionId required');
}

export function isCartExpired(cart: Cart): boolean {
  const now = new Date();
  const expiresAt = new Date(cart.expires_at);
  return now > expiresAt;
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
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
): Cart {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  
  return {
    id: generateCartId(userId, guestSessionId),
    user_id: userId,
    guest_session_id: guestSessionId,
    items: [],
    totals: {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0
    },
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    metadata: {}
  };
}

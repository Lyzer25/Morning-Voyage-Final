import { getCart, saveCart, deleteCart } from './cart';
import type { ShoppingCart, CartItem } from './types';

/**
 * Merge guest cart into user cart on login
 * This should be called after successful authentication in a server action
 * Note: Cookie handling must be done in the calling server action/route handler
 */
export async function mergeGuestCartOnLogin(userId: string, guestSessionId?: string): Promise<void> {
  try {
    console.log('🔄 [CART MERGE] Starting merge for user:', userId);
    
    if (!guestSessionId) {
      console.log('🔄 [CART MERGE] No guest session provided, nothing to merge');
      return; // No guest cart to merge
    }
    
    console.log('🔄 [CART MERGE] Found guest session:', guestSessionId);
    
    // Get guest cart
    const guestCart = await getCart(guestSessionId, false);
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      console.log('🔄 [CART MERGE] Guest cart is empty or not found');
      return;
    }
    
    console.log('🔄 [CART MERGE] Guest cart has', guestCart.items.length, 'items');
    
    // Get user cart
    let userCart = await getCart(userId, true);
    
    if (!userCart) {
      console.log('🔄 [CART MERGE] No user cart exists, converting guest cart to user cart');
      // No user cart exists, convert guest cart to user cart
      userCart = {
        ...guestCart,
        id: crypto.randomUUID(),
        user_id: userId,
        session_id: userId,
        updated_at: new Date().toISOString()
      };
    } else {
      console.log('🔄 [CART MERGE] User cart exists with', userCart.items.length, 'items, merging');
      // Merge guest items into user cart
      const mergedItems = [...userCart.items];
      
      guestCart.items.forEach(guestItem => {
        const existingIndex = mergedItems.findIndex(
          item => item.product_id === guestItem.product_id
        );
        
        if (existingIndex >= 0) {
          // Combine quantities
          console.log('🔄 [CART MERGE] Combining quantities for product:', guestItem.product_id);
          mergedItems[existingIndex].quantity += guestItem.quantity;
          mergedItems[existingIndex].line_total = 
            mergedItems[existingIndex].quantity * mergedItems[existingIndex].base_price;
        } else {
          // Add new item
          console.log('🔄 [CART MERGE] Adding new item:', guestItem.product_id);
          mergedItems.push(guestItem);
        }
      });
      
      userCart.items = mergedItems;
      userCart.updated_at = new Date().toISOString();
    }
    
    // Recalculate totals (only subtotal and total exist in the type)
    const subtotal = userCart.items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.base_price), 0);
    userCart.totals = {
      subtotal,
      total: subtotal
    };
    
    console.log('🔄 [CART MERGE] Final merged cart has', userCart.items.length, 'items, total:', userCart.totals.total);
    
    // Save merged user cart
    await saveCart(userCart, true);
    
    // Clean up guest cart
    try {
      console.log('🔄 [CART MERGE] Cleaning up guest cart');
      await deleteCart(guestSessionId, false);
    } catch (error) {
      console.warn('🔄 [CART MERGE] Failed to clean up guest cart:', error);
      // Don't fail the merge on cleanup error
    }
    
    console.log('✅ [CART MERGE] Cart merge completed successfully:', {
      userId,
      guestItems: guestCart.items.length,
      mergedItems: userCart.items.length,
      finalTotal: userCart.totals.total
    });
    
  } catch (error) {
    console.error('❌ [CART MERGE] Cart merge failed:', error);
    // Don't fail login on merge error - this is a convenience feature
  }
}

/**
 * Calculate cart totals from items array
 */
function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.line_total || item.quantity * item.base_price), 0);
  
  return {
    subtotal,
    tax: 0,        // TODO: Add tax calculation later
    shipping: 0,   // TODO: Add shipping calculation later
    discount: 0,   // TODO: Add discount calculation later
    total: subtotal
  };
}

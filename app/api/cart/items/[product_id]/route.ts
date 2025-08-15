import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { removeFromCart } from '@/lib/cart';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { product_id: string } }
) {
  try {
    const { product_id } = params;
    
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;
    
    // Determine cart ID
    let cartId: string | null = null;
    let isUser: boolean = false;
    
    if (session?.userId) {
      cartId = session.userId;
      isUser = true;
    } else if (guestCookie) {
      cartId = guestCookie;
      isUser = false;
    }
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' },
        { status: 404 }
      );
    }
    
    // Remove item from cart
    const cart = await removeFromCart(cartId, product_id, isUser);
    
    // cart can be null in two cases:
    // 1. Cart didn't exist (legitimate case - already removed)
    // 2. Cart became empty after removal (legitimate case - cart deleted)
    // Both are success cases, not errors
    
    return NextResponse.json({
      success: true,
      cart: cart, // Will be null if cart was empty/deleted, or cart object if items remain
      message: cart === null 
        ? 'Item removed and cart is now empty' 
        : 'Item removed from cart successfully'
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

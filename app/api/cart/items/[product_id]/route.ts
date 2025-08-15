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
    
    if (cart === null) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      cart,
      message: 'Item removed from cart successfully'
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

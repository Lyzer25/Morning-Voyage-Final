import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getCart, saveCart } from '@/lib/cart';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [CART GET] GET /api/cart - Request received');
    
    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;
    
    console.log('📋 [CART GET] Session:', session ? { userId: session.userId, email: session.email, role: session.role } : 'null');
    console.log('📋 [CART GET] Guest cookie:', guestCookie ? 'present' : 'null');

    if (session) {
      console.log('📋 [CART GET] Fetching user cart for:', session.userId);
      const cart = await getCart(session.userId, true);
      console.log('📋 [CART GET] User cart result:', cart ? { items: cart.items.length, total: cart.totals.total } : 'null');
      return NextResponse.json({ success: true, cart: cart ?? null });
    }

    if (guestCookie) {
      console.log('📋 [CART GET] Fetching guest cart for:', guestCookie);
      const cart = await getCart(guestCookie, false);
      console.log('📋 [CART GET] Guest cart result:', cart ? { items: cart.items.length, total: cart.totals.total } : 'null');
      return NextResponse.json({ success: true, cart: cart ?? null });
    }

    console.log('📋 [CART GET] No session or guest cookie found, returning null cart');
    return NextResponse.json({ success: true, cart: null });
  } catch (err) {
    console.error('❌ [CART GET] Failed to fetch cart:', err);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { discount_codes, shipping_method, notes } = body;
    
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
    
    // Fetch existing cart
    const cart = await getCart(cartId, isUser);
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    // Update metadata - extend existing metadata object
    const updatedCart = {
      ...cart,
      metadata: {
        ...((cart as any).metadata || {}),
        ...(discount_codes !== undefined && { discount_codes }),
        ...(shipping_method !== undefined && { shipping_method }),
        ...(notes !== undefined && { notes })
      },
      updated_at: new Date().toISOString()
    };
    
    // Save updated cart
    await saveCart(updatedCart, isUser);
    
    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Cart updated successfully'
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

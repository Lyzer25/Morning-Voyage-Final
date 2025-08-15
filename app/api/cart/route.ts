import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getCart, saveCart } from '@/lib/cart';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;

    if (session) {
      const cart = await getCart(session.userId, true);
      return NextResponse.json({ success: true, cart: cart ?? null });
    }

    if (guestCookie) {
      const cart = await getCart(guestCookie, false);
      return NextResponse.json({ success: true, cart: cart ?? null });
    }

    return NextResponse.json({ success: true, cart: null });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch cart', err);
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

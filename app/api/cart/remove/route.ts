import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { removeFromCart } from '@/lib/cart';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body ?? {};
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;
    const cartId = session?.userId || guestCookie;
    if (!cartId) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const cart = await removeFromCart(cartId, productId, !!session);
    if (!cart) return NextResponse.json({ error: 'Cart not found or item not present' }, { status: 404 });

    return NextResponse.json({ success: true, cart });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove from cart', err);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}

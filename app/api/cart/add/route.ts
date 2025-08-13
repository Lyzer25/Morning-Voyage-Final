import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { addToCart } from '@/lib/cart';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, basePrice, quantity = 1 } = body ?? {};

    if (!productId || !productName || typeof basePrice !== 'number') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const session = await getServerSession();
    const guestCookie = request.cookies.get('mv_guest_session')?.value;
    const cartId = session?.userId || guestCookie || crypto.randomUUID();
    const isUser = !!session;

    const cart = await addToCart(cartId, productId, productName, basePrice, quantity, isUser);

    const res = NextResponse.json({ success: true, cart });
    if (!isUser && !guestCookie) {
      // Set guest cookie for 7 days
      res.cookies.set('mv_guest_session', cartId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }

    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to add to cart', err);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

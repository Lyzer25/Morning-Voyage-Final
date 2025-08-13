import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getCart } from '@/lib/cart';

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

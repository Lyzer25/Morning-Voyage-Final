import { NextRequest, NextResponse } from 'next/server';
import { createMagicLinkToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const token = await createMagicLinkToken(email);
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || `${request.nextUrl.origin}`;
    const magicLink = `${base}/api/auth/verify/${token}`;

    // Console-only delivery in Phase 1
    // Server logs will contain the magic link for testing.
    // Replace this with a proper email provider in Phase 2.
    // eslint-disable-next-line no-console
    console.log(`Magic link for ${email}: ${magicLink}`);

    return NextResponse.json({ success: true, message: 'Magic link sent (check server logs in Phase 1)' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create magic link', err);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}

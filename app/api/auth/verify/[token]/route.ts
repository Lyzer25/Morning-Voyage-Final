import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, createSessionToken, setSessionCookie } from '@/lib/auth';
import { getUserByEmail, saveUserAccount } from '@/lib/blob-accounts';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    const verified = await verifyMagicLinkToken(token);
    if (!verified) {
      return NextResponse.redirect(new URL('/account/login?error=invalid', request.url));
    }

    let user = await getUserByEmail(verified.email);

    if (!user) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      user = {
        id,
        email: verified.email,
        role: 'customer',
        status: 'active',
        subscriber: { is_subscriber: false, tier: null, expires_at: null },
        profile: { display_name: verified.email.split('@')[0], created_at: now, last_login: now },
      };
      await saveUserAccount(user);
    } else {
      user.profile.last_login = new Date().toISOString();
      await saveUserAccount(user);
    }

    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSubscriber: user.subscriber.is_subscriber,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.redirect(new URL('/account', request.url));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Magic link verification failed', err);
    return NextResponse.redirect(new URL('/account/login?error=failed', request.url));
  }
}

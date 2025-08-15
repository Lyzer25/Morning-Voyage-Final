import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { getUserByEmail, saveUserAccount } from '@/lib/blob-accounts';
import { mergeGuestCartOnLogin } from '@/lib/cart-merge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is suspended or inactive' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last login
    user.profile.last_login = new Date().toISOString();
    await saveUserAccount(user);

    // Create session
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isSubscriber: user.subscriber.is_subscriber
    };

    console.log('Login: creating session token for', user.email);
    const sessionToken = await createSessionToken(sessionData);
    console.log('Login: session token created:', !!sessionToken);

    // Check for guest cart to merge before setting session cookie
    const guestSessionId = request.cookies.get('mv_guest_session')?.value;
    console.log('Login: guest session found for merge:', !!guestSessionId);

    // Attempt to set cookie via the helper (server cookie store)
    try {
      console.log('Login: calling setSessionCookie');
      await setSessionCookie(sessionToken);
      console.log('Login: setSessionCookie call completed');
    } catch (err) {
      console.warn('Login: setSessionCookie failed:', (err as any)?.message || err);
    }

    // Merge guest cart into user cart after authentication
    if (guestSessionId) {
      try {
        console.log('Login: attempting cart merge for user:', user.id);
        await mergeGuestCartOnLogin(user.id, guestSessionId);
        console.log('Login: cart merge completed successfully');
      } catch (error) {
        console.error('Login: cart merge failed:', error);
        // Don't fail login on cart merge error
      }
    }

    // Build response and also set cookie on the NextResponse to ensure compatibility
    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        displayName: user.profile.display_name
      },
      debug: {
        sessionCreated: !!sessionToken,
        userId: user.id,
        email: user.email
      }
    });

    // Try both cookie APIs for compatibility across Next versions/runtimes
    try {
      const secure = process.env.NODE_ENV === 'production';
      // Preferred modern API
      if (res.cookies && typeof res.cookies.set === 'function') {
        try {
          // object form
          // @ts-ignore - runtime check
          res.cookies.set({
            name: 'mv_session',
            value: sessionToken,
            httpOnly: true,
            secure,
            sameSite: process.env.COOKIE_SAMESITE || 'lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/',
            maxAge: 7 * 24 * 60 * 60
          });
        } catch {
          try {
            // tuple form
            // @ts-ignore - runtime check
            res.cookies.set('mv_session', sessionToken, {
              httpOnly: true,
              secure,
              sameSite: process.env.COOKIE_SAMESITE || 'lax',
              domain: process.env.COOKIE_DOMAIN || undefined,
              path: '/',
              maxAge: 7 * 24 * 60 * 60
            });
          } catch (e) {
            console.warn('Login: res.cookies.set failed', (e as any)?.message || e);
          }
        }
      }
    } catch (err) {
      console.warn('Login: failed to set cookie on NextResponse', (err as any)?.message || err);
    }

    return res;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

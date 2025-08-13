import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { getUserByEmail, saveUserAccount } from '@/lib/blob-accounts';

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
    const sessionToken = await createSessionToken(sessionData);
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        displayName: user.profile.display_name
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

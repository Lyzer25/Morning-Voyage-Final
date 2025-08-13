import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, validatePassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { getUserByEmail, saveUserAccount } from '@/lib/blob-accounts';
import type { UserAccount } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').toLowerCase();
    const password = body.password;
    const displayName = body.displayName || '';

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors.join(', ') }, { status: 400 });
    }

    // Check existing user
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const newUser: UserAccount = {
      id: crypto.randomUUID(),
      email,
      role: 'customer',
      status: 'active',
      password_hash: passwordHash,
      email_verified: true, // auto-verify for now
      subscriber: {
        is_subscriber: false,
        tier: null,
        expires_at: null
      },
      profile: {
        display_name: displayName || email.split('@')[0],
        preferences: {},
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        password_changed_at: new Date().toISOString()
      }
    };

    await saveUserAccount(newUser);

    // create session and set cookie
    const sessionData = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      isSubscriber: newUser.subscriber.is_subscriber
    };

    const sessionToken = await createSessionToken(sessionData);
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email: newUser.email,
        displayName: newUser.profile.display_name
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Signup failed:', error);
    return NextResponse.json({ error: 'Account creation failed' }, { status: 500 });
  }
}

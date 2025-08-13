import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { SessionData } from './types';

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  // Fail fast during dev/build so the developer knows to set the env var.
  // This file is used on the server only.
  // eslint-disable-next-line no-console
  console.error('Missing AUTH_SECRET environment variable. Set AUTH_SECRET in your environment.');
}

/**
 * Create a short-lived magic link token (15 minutes).
 */
export async function createMagicLinkToken(email: string): Promise<string> {
  if (!AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
  const token = jwt.sign(
    { email, type: 'magic_link' },
    AUTH_SECRET,
    { expiresIn: '15m' }
  );
  return token;
}

/**
 * Verify a magic link token and return decoded payload (email) or null.
 */
export async function verifyMagicLinkToken(token: string): Promise<{ email: string } | null> {
  if (!AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as any;
    if (decoded && decoded.type === 'magic_link' && decoded.email) {
      return { email: decoded.email as string };
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Create a session JWT for a logged-in user (7 days).
 */
export async function createSessionToken(userData: SessionData): Promise<string> {
  if (!AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
  const token = jwt.sign(
    { ...userData },
    AUTH_SECRET,
    { expiresIn: '7d' }
  );
  return token;
}

/**
 * Set session cookie on the server (httpOnly).
 */
export async function setSessionCookie(token: string): Promise<void> {
  // cookies() is from next/headers and works in server components / route handlers.
  // Use options that align with production settings.
  const secure = process.env.NODE_ENV === 'production';
  try {
    // Some Next versions expose cookies() as an async API; normalize by awaiting and treating as any.
    const cookieStore: any = await (cookies as any)();
    cookieStore.set({
      name: 'mv_session',
      value: token,
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  } catch (err) {
    // Fallback to older signature if available
    try {
      const cookieStore: any = await (cookies as any)();
      // Some runtimes expect (name, value, options)
      cookieStore.set('mv_session', token, {
        httpOnly: true,
        secure,
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to set session cookie', e);
    }
  }
}

/**
 * Get server session data from cookie, or null if not present or invalid.
 */
export async function getServerSession(): Promise<SessionData | null> {
  if (!AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
  try {
    const cookieStore: any = await (cookies as any)();
    const cookie = cookieStore.get('mv_session');
    const token = cookie?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, AUTH_SECRET) as any;
    // Minimal validation of payload shape
    if (!decoded || !decoded.userId || !decoded.email) return null;
    const session: SessionData = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role === 'admin' ? 'admin' : 'customer',
      isSubscriber: !!decoded.isSubscriber,
    };
    return session;
  } catch {
    return null;
  }
}

/**
 * Clear session cookie.
 */
export async function clearSession(): Promise<void> {
  try {
    const cookieStore: any = await (cookies as any)();
    if (cookieStore.delete) {
      cookieStore.delete('mv_session');
    } else {
      // Fallback: overwrite with expired cookie
      cookieStore.set({
        name: 'mv_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
    }
  } catch (err) {
    // Some Next versions may not expose delete; attempt to overwrite with expired cookie
    try {
      const cookieStore: any = await (cookies as any)();
      cookieStore.set({
        name: 'mv_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear session cookie', e);
    }
  }
}

/**
 * Password utilities
 */

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Password reset token (JWT) helpers
 */
export async function createPasswordResetToken(userId: string, email: string): Promise<string> {
  if (!AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
  const token = jwt.sign(
    { userId, email, type: 'password_reset' },
    AUTH_SECRET,
    { expiresIn: '1h' }
  );
  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  if (!AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as any;
    if (decoded && decoded.type === 'password_reset' && decoded.userId && decoded.email) {
      return { userId: decoded.userId, email: decoded.email };
    }
    return null;
  } catch {
    return null;
  }
}

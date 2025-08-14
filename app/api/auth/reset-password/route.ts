import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';
import { getUserByEmail, savePasswordResetToken } from '@/lib/blob-accounts';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';
import type { PasswordResetToken } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { email: rawEmail } = await request.json();
    const email = (rawEmail || '').toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Check for an existing valid token for this user to prevent token spamming
    const existing = await (await import('@/lib/blob-accounts')).getPasswordResetTokens();
    const hasValid = existing.some(t => t.user_id === user.id && !t.used && new Date(t.expires_at) > new Date());
    if (hasValid) {
      // Don't issue a new token; respond success to avoid revealing state
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const resetTokenJWT = await createPasswordResetToken(user.id, user.email);

    const resetToken: PasswordResetToken = {
      token: resetTokenJWT,
      user_id: user.id,
      email: user.email,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      used: false
    };

    await savePasswordResetToken(resetToken);

    // Compose reset link using NEXTAUTH_URL or NEXT_PUBLIC_BASE_URL as fallback
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || '';
    const resetLink = `${baseUrl.replace(/\/$/, '')}/account/reset-password?token=${encodeURIComponent(resetTokenJWT)}`;

    // Send password reset email (best-effort). Do not reveal the result to the client.
    try {
      const displayName = user.profile?.display_name || user.email;
      const emailSent = await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - Morning Voyage',
        html: generatePasswordResetEmail(displayName, resetLink)
      });
      if (!emailSent) {
        // eslint-disable-next-line no-console
        console.warn('Password reset email failed to send for', user.email);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send password reset email', err);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      // include resetLink only in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Password reset request failed:', error);
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 });
  }
}

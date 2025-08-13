import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/auth';
import { getUserByEmail, savePasswordResetToken } from '@/lib/blob-accounts';
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

    // Log for testing in non-production
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      resetLink // Keep for testing; remove in production
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Password reset request failed:', error);
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 });
  }
}

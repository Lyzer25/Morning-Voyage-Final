import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, validatePassword, hashPassword } from '@/lib/auth';
import { getUserByEmail, saveUserAccount, markPasswordResetTokenUsed } from '@/lib/blob-accounts';
import { sendEmail, generatePasswordChangedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.errors.join(', ') }, { status: 400 });
    }

    const tokenData = await verifyPasswordResetToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const user = await getUserByEmail(tokenData.email);
    if (!user || user.id !== tokenData.userId) {
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    user.password_hash = passwordHash;
    user.profile.password_changed_at = new Date().toISOString();

    await saveUserAccount(user);
    await markPasswordResetTokenUsed(token);

    // Send password-changed notification (best-effort)
    try {
      const displayName = user.profile?.display_name || user.email;
      const emailed = await sendEmail({
        to: user.email,
        subject: 'Your Morning Voyage password has been changed',
        html: generatePasswordChangedEmail(displayName)
      });
      if (!emailed) {
        // eslint-disable-next-line no-console
        console.warn('Password change email failed to send to', user.email);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send password changed email', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Password reset failed:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

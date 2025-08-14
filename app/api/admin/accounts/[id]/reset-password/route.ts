import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hashPassword } from '@/lib/auth';
import { getUserById, saveUserAccount } from '@/lib/blob-accounts';
import { sendEmail, generatePasswordChangedEmail } from '@/lib/email';

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*';
  let password = '';

  // Ensure at least one of each type
  password += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]; // Uppercase
  password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)]; // Lowercase
  password += '23456789'[Math.floor(Math.random() * 8)]; // Number
  password += '@#$%&*'[Math.floor(Math.random() * 6)]; // Special

  // Fill rest with random chars
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const accountId = params.id;
    const body = await request.json().catch(() => ({}));
    const { sendEmail: shouldSendEmail = true, customPassword } = body as { sendEmail?: boolean; customPassword?: string };

    const account = await getUserById(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const newPassword = customPassword && customPassword.length >= 8 ? customPassword : generateSecurePassword();
    const passwordHash = await hashPassword(newPassword);

    const updatedAccount = {
      ...account,
      password_hash: passwordHash,
      profile: {
        ...account.profile,
        password_changed_at: new Date().toISOString()
      }
    };

    await saveUserAccount(updatedAccount);

    let emailSent = false;
    if (shouldSendEmail) {
      try {
        emailSent = await sendEmail({
          to: account.email,
          subject: 'Your Password Has Been Reset - Morning Voyage',
          html: generatePasswordChangedEmail(account.profile?.display_name || account.email)
        });
        if (!emailSent) {
          // eslint-disable-next-line no-console
          console.warn('Admin reset: failed to send password-changed email to', account.email);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Admin reset: error sending email', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword: newPassword,
      emailSent
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Admin password reset failed:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

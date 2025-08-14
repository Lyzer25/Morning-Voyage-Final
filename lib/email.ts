import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailTemplate): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@morningvoyage.co',
      to,
      subject,
      html
    });

    // eslint-disable-next-line no-console
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generatePasswordResetEmail(name: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - Morning Voyage</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Morning Voyage</h1>
        <p style="color: #7f8c8d; margin: 0;">Premium Coffee Experience</p>
      </div>
      
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      
      <p>Hi ${name},</p>
      
      <p>We received a request to reset your password for your Morning Voyage account. If you didn't make this request, you can safely ignore this email.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset My Password
        </a>
      </div>
      
      <p><strong>This link will expire in 1 hour</strong> for your security.</p>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 14px;">
        ${resetLink}
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #7f8c8d; font-size: 14px;">
        If you continue to have problems, please contact our support team.<br>
        This email was sent from an automated system, please do not reply.
      </p>
      
      <p style="color: #7f8c8d; font-size: 14px;">
        © ${new Date().getFullYear()} Morning Voyage. All rights reserved.
      </p>
    </body>
    </html>
  `;
}

export function generatePasswordChangedEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Changed - Morning Voyage</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Morning Voyage</h1>
        <p style="color: #7f8c8d; margin: 0;">Premium Coffee Experience</p>
      </div>
      
      <h2 style="color: #27ae60;">Password Successfully Changed</h2>
      
      <p>Hi ${name},</p>
      
      <p>Your password has been successfully changed. If you didn't make this change, please contact our support team immediately.</p>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #27ae60;"><strong>✓ Your account is now secure with your new password</strong></p>
      </div>
      
      <p>For your security:</p>
      <ul>
        <li>Use a unique, strong password</li>
        <li>Don't share your password with anyone</li>
        <li>Sign out of other devices if needed</li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #7f8c8d; font-size: 14px;">
        © ${new Date().getFullYear()} Morning Voyage. All rights reserved.
      </p>
    </body>
    </html>
  `;
}

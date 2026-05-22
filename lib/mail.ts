import { Resend } from 'resend';
import { SYSTEM_CONFIG } from './config/system';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

/**
 * Sends a 6-digit email verification code via Resend.
 * Falls back to logging to console if the Resend API key is missing or dummy.
 */
export async function sendVerificationEmail(email: string, firstName: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('your_')) {
    console.log(`\n==================================================`);
    console.log(`📬  [EMAIL SIMULATION] To: ${email}`);
    console.log(`🔑  Verification Code: ${code}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || `${SYSTEM_CONFIG.brand.name} Auth <onboarding@resend.dev>`;
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Verify your ${SYSTEM_CONFIG.brand.name} Account`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; rounded: 12px;">
          <h2 style="color: #00D9FF; font-weight: 300;">Welcome to <span style="font-weight: 700;">${SYSTEM_CONFIG.brand.name.toUpperCase()}</span></h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering with ${SYSTEM_CONFIG.brand.name}. To verify your email address, please use the following 6-digit verification code:</p>
          <div style="background: #0A0F14; color: #FFFFFF; font-family: monospace; font-size: 24px; font-weight: 700; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px; letter-spacing: 4px;">
            ${code}
          </div>
          <p style="color: #808A9D; font-size: 12px; margin-top: 30px;">
            This verification code is valid for 1 hour. If you did not register for a ${SYSTEM_CONFIG.brand.name} account, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Resend Exception]', err);
    return false;
  }
}


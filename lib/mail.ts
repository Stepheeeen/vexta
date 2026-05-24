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

/**
 * Sends a 6-digit email OTP for confirming account deletion.
 * Falls back to logging to console if the Resend API key is missing or dummy.
 */
export async function sendDeleteAccountOTPEmail(email: string, firstName: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('your_')) {
    console.log(`\n==================================================`);
    console.log(`📬  [EMAIL SIMULATION - DELETE ACCOUNT OTP] To: ${email}`);
    console.log(`🔑  Verification Code: ${code}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || `${SYSTEM_CONFIG.brand.name} Auth <onboarding@resend.dev>`;
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Confirm Account Deletion - ${SYSTEM_CONFIG.brand.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #0d1420; color: #ffffff;">
          <h2 style="color: #ff4a4a; font-weight: 300;">Account Deletion Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to permanently delete your ${SYSTEM_CONFIG.brand.name} account.</p>
          <p>To confirm this action, please enter the following 6-digit verification code in your account settings:</p>
          <div style="background: #1a2436; color: #ff4a4a; font-family: monospace; font-size: 24px; font-weight: 700; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px; letter-spacing: 4px; border: 1px solid rgba(255, 74, 74, 0.2);">
            ${code}
          </div>
          <p style="color: #ff4a4a; font-weight: bold;">
            WARNING: This action is permanent. Deleting your account will erase all your positions, investments, balances, and history. This cannot be undone.
          </p>
          <p style="color: #808A9D; font-size: 12px; margin-top: 30px;">
            This verification code is valid for 15 minutes. If you did not request this deletion, please secure your account immediately.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Delete Account OTP Error]', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Resend Delete Account OTP Exception]', err);
    return false;
  }
}

/**
 * Sends a 6-digit email OTP for confirming withdrawal requests.
 * Falls back to logging to console if the Resend API key is missing or dummy.
 */
export async function sendWithdrawalOTPEmail(email: string, firstName: string, code: string, amount: number, network: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('your_')) {
    console.log(`\n==================================================`);
    console.log(`📬  [EMAIL SIMULATION - WITHDRAWAL OTP] To: ${email}`);
    console.log(`💵  Amount: $${amount.toFixed(2)} via ${network}`);
    console.log(`🔑  Verification Code: ${code}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || `${SYSTEM_CONFIG.brand.name} Auth <onboarding@resend.dev>`;
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Confirm Withdrawal Request - ${SYSTEM_CONFIG.brand.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #0d1420; color: #ffffff;">
          <h2 style="color: #00D9FF; font-weight: 300;">Withdrawal Verification</h2>
          <p>Hi ${firstName},</p>
          <p>You requested a withdrawal of <strong>$${amount.toFixed(2)}</strong> via <strong>${network}</strong>.</p>
          <p>To confirm this transaction, please enter the following 6-digit verification code in your dashboard:</p>
          <div style="background: #1a2436; color: #00D9FF; font-family: monospace; font-size: 24px; font-weight: 700; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px; letter-spacing: 4px; border: 1px solid rgba(0, 217, 255, 0.2);">
            ${code}
          </div>
          <p style="color: #808A9D; font-size: 12px; margin-top: 30px;">
            This verification code is valid for 15 minutes. If you did not request this withdrawal, please secure your account and contact support immediately.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Withdrawal OTP Error]', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Resend Withdrawal OTP Exception]', err);
    return false;
  }
}

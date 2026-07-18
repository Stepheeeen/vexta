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

/**
 * Sends a 6-digit email OTP to an admin before batch payout execution.
 * This is the MFA gate for the Friday mass withdrawal payout action.
 */
export async function sendBatchPayoutOTPEmail(
  email: string,
  firstName: string,
  code: string,
  totalAmount: number,
  withdrawalCount: number
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('your_')) {
    console.log(`\n==================================================`);
    console.log(`📬  [EMAIL SIMULATION - BATCH PAYOUT OTP] To: ${email}`);
    console.log(`💵  Batch Total: $${totalAmount.toFixed(2)} USDT (${withdrawalCount} withdrawals)`);
    console.log(`🔑  OTP Code: ${code}`);
    console.log(`==================================================\n`);
    return true;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || `${SYSTEM_CONFIG.brand.name} Auth <onboarding@resend.dev>`;
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `⚠️ ADMIN BATCH PAYOUT AUTHORIZATION — ${SYSTEM_CONFIG.brand.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #f59e0b; border-radius: 12px; background-color: #0d1420; color: #ffffff;">
          <h2 style="color: #f59e0b; font-weight: 700;">⚠️ Batch Payout Authorization Required</h2>
          <p>Hi ${firstName},</p>
          <p>An administrator is requesting to execute the <strong>Friday Batch Payout</strong>.</p>
          <div style="background: #1a2436; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #9ca3af; font-size: 13px;">Total USDT to be distributed:</p>
            <p style="margin: 4px 0; font-size: 28px; font-weight: 800; color: #f59e0b;">$${totalAmount.toFixed(2)} USDT</p>
            <p style="margin: 4px 0; color: #9ca3af; font-size: 13px;">${withdrawalCount} withdrawal request(s) will be approved.</p>
          </div>
          <p>Enter the 6-digit authorization code in the admin panel to proceed:</p>
          <div style="background: #1a2436; color: #f59e0b; font-family: monospace; font-size: 28px; font-weight: 700; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 6px; border: 1px solid rgba(245, 158, 11, 0.4);">
            ${code}
          </div>
          <p style="color: #ef4444; font-weight: bold;">
            ⚠️ Ensure the Plisio wallet has been funded with exactly $${totalAmount.toFixed(2)} USDT before executing.
          </p>
          <p style="color: #808A9D; font-size: 12px; margin-top: 30px;">
            This code expires in 15 minutes. If you did not initiate this action, secure your admin account immediately.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Batch Payout OTP Error]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Resend Batch Payout OTP Exception]', err);
    return false;
  }
}


/**
 * Sends an email notification report for a cron job execution (success or failure).
 * Includes HTML + plain-text body for maximum deliverability (iCloud requires text/plain
 * to avoid spam filtering on emails from custom domains).
 */
export async function sendCronReportEmail(
  email: string,
  cronName: string,
  status: 'SUCCESS' | 'FAILURE',
  report: string,
  logs?: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 're_123456789' || apiKey.startsWith('your_')) {
    console.log(`\n==================================================`);
    console.log(`📬  [EMAIL SIMULATION - CRON REPORT] To: ${email}`);
    console.log(`📋  Cron: ${cronName} | Status: ${status}`);
    console.log(`📝  Report: ${report}`);
    if (logs) console.log(`🛑  Logs/Errors: ${logs}`);
    console.log(`==================================================\n`);
    return true;
  }

  const runTime = new Date().toUTCString();
  const statusIcon = status === 'SUCCESS' ? '✅' : '❌';
  const statusColor = status === 'SUCCESS' ? '#10B981' : '#EF4444';
  const subject = `${statusIcon} [${SYSTEM_CONFIG.brand.name}] Cron: ${cronName} — ${status}`;

  // Plain-text version — required for iCloud / Apple Mail to avoid spam filtering
  const plainText = [
    `${SYSTEM_CONFIG.brand.name} — Cron Job Report`,
    `Job: ${cronName}`,
    `Status: ${status}`,
    `Time: ${runTime}`,
    ``,
    `--- Execution Report ---`,
    report,
    logs ? `\n--- Error Details ---\n${logs}` : '',
    ``,
    `This is an automated notification from the ${SYSTEM_CONFIG.brand.name} network engine.`,
  ].join('\n');

  // Always use the configured from address — never fall back to resend.dev defaults
  const fromEmail = process.env.RESEND_FROM_EMAIL || `${SYSTEM_CONFIG.brand.name} System <noreply@vexta.network>`;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      text: plainText,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #0d1420; color: #ffffff;">
          <h2 style="color: ${statusColor}; font-weight: 700; margin-bottom: 4px;">Cron Job: ${cronName}</h2>
          <div style="display: inline-block; background: ${statusColor}22; color: ${statusColor}; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: bold; margin-bottom: 8px;">
            ${statusIcon} ${status}
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 0; margin-bottom: 20px;">Run time: ${runTime}</p>

          <div style="background: #1a2436; border: 1px solid rgba(229, 231, 235, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #9ca3af; font-size: 14px;">Execution Report</h3>
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e5e7eb; white-space: pre-wrap;">${report}</p>
          </div>

          ${logs ? `
            <div style="background: #1f2937; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px;">
              <h3 style="margin-top: 0; color: #ef4444; font-size: 14px;">Error Details &amp; Logs</h3>
              <pre style="margin: 0; font-family: monospace; font-size: 12px; line-height: 1.4; color: #f9fafb; white-space: pre-wrap; overflow-x: auto;">${logs}</pre>
            </div>
          ` : ''}

          <p style="color: #808A9D; font-size: 12px; margin-top: 30px; border-top: 1px solid rgba(229, 231, 235, 0.1); padding-top: 20px;">
            This is an automated system notification from the ${SYSTEM_CONFIG.brand.name} network engine.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Cron Report Error]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Resend Cron Report Exception]', err);
    return false;
  }
}

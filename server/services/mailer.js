// ==========================================================
// UniMart: Student Email Dispatch Service (Nodemailer)
// Supports custom SMTP (Gmail, Resend, Brevo, Uni SMTP)
// ==========================================================
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    return null;
  }

  if (process.env.GMAIL_USER && !process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendVerificationEmail({ email, fullName, university, actionLink, otp }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`ℹ️ [Mailer] SMTP not configured. Account activation link & OTP generated for instant web confirmation.`);
    return { sent: false, reason: 'no_smtp_configured' };
  }

  const senderAddress = process.env.SMTP_FROM || `"UniMart Verification" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
  const subject = otp 
    ? `UniMart Verification Code: ${otp}` 
    : `Verify Your University Email – UniMart Student Marketplace`;

  const text = `Hello ${fullName || 'Undergraduate Student'},

Your UniMart verification code is: ${otp || ''}

${actionLink ? `Or verify using this link: ${actionLink}\n\n` : ''}Enter this 6-digit code on UniMart to activate your student account for ${university || 'Rajarata University of Sri Lanka'}.

This code is valid for 15 minutes.

Best regards,
UniMart Student Marketplace Team`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 20px 24px; text-align: left; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #5eead4; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
          .content { padding: 24px; }
          .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .otp-box { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; color: #0f766e; letter-spacing: 6px; }
          .otp-label { font-size: 11px; text-transform: uppercase; color: #0d9488; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px; }
          .otp-hint { font-size: 11px; color: #64748b; margin-top: 8px; }
          .btn-container { text-align: center; margin: 20px 0; }
          .btn { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; }
          .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniMart Student Marketplace</h1>
            <p>Official Verification &bull; ${university || 'Rajarata University of Sri Lanka'}</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${fullName || 'Undergraduate Student'},</div>
            <div class="text">
              Thank you for signing up for <strong>UniMart</strong>. To complete your student account activation, please use the 6-digit verification code below:
            </div>
            ${otp ? `
              <div class="otp-box">
                <div class="otp-label">Your 6-Digit Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-hint">Enter this code on the UniMart verification screen to activate your account.</div>
              </div>
            ` : ''}
            ${actionLink ? `
              <div class="btn-container">
                <a href="${actionLink}" class="btn" target="_blank">Activate Student Account</a>
              </div>
            ` : ''}
            <div class="text" style="font-size: 12px; color: #64748b; margin-top: 16px;">
              This code will expire in 15 minutes. If you did not request this registration, you can safely ignore this email.
            </div>
          </div>
          <div class="footer">
            UniMart &bull; Verified Student Marketplace &bull; ICT 1108
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: senderAddress,
      to: email,
      subject,
      text,
      html
    });
    console.log(`✅ [Mailer] Confirmation email dispatched successfully to ${email} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Mailer] Failed to send email to ${email}:`, err.message);
    return { sent: false, error: err.message };
  }
}

export async function sendLoginNotificationEmail({ email, fullName, university, ip, userAgent }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`ℹ️ [Mailer] SMTP not configured. Skipped sending login notification email to ${email}.`);
    return { sent: false, reason: 'no_smtp_configured' };
  }

  const senderAddress = process.env.SMTP_FROM || `"UniMart Security" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
  const subject = `Security Alert: New sign-in to your UniMart account`;
  const nowStr = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 20px 24px; text-align: left; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #5eead4; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
          .content { padding: 24px; }
          .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 12px; }
          .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #64748b; }
          .detail-value { font-weight: 600; color: #0f172a; text-align: right; }
          .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-top: 16px; font-size: 12px; color: #991b1b; }
          .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniMart Security Alert</h1>
            <p>Smart Student Marketplace &bull; Sri Lanka</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${fullName || 'Student'},</div>
            <div class="text">
              We noticed a new sign-in to your UniMart account registered under <strong>${email}</strong>.
            </div>

            <div class="details-card">
              <div class="detail-row">
                <span class="detail-label">Date & Time (Sri Lanka):</span>
                <span class="detail-value">${nowStr}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">University / Institution:</span>
                <span class="detail-value">${university || 'State University of Sri Lanka'}</span>
              </div>
              ${ip ? `
              <div class="detail-row">
                <span class="detail-label">IP Address:</span>
                <span class="detail-value">${ip}</span>
              </div>
              ` : ''}
            </div>

            <div class="text" style="font-size: 12px; color: #64748b;">
              If this was you, you can safely disregard this email.
            </div>

            <div class="alert-box">
              <strong>Didn't sign in?</strong> If you did not perform this login, your account may be compromised. Please sign in immediately to change your password or delete your account in Profile Settings.
            </div>
          </div>
          <div class="footer">
            UniMart &bull; Verified Student Marketplace &bull; ICT 1108
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: senderAddress,
      to: email,
      subject,
      html
    });
    console.log(`✅ [Mailer] Login notification email dispatched to ${email} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [Mailer] Failed to send login notification to ${email}:`, err.message);
    return { sent: false, error: err.message };
  }
}

export async function sendPasswordResetEmail({ email, fullName, university, actionLink, otp }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Mailer] SMTP not configured for password reset email.');
    return { sent: false, reason: 'no_smtp_configured' };
  }

  const senderAddress = process.env.SMTP_FROM || `"UniMart Security" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
  const subject = `Reset Your UniMart Password - Student Account Recovery`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #5eead4; letter-spacing: -0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
          .content { padding: 24px; }
          .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .btn-container { text-align: center; margin: 24px 0; }
          .btn { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(13,148,136,0.2); }
          .otp-box { background: #f0fdfa; border: 1px dashed #0d9488; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0; }
          .otp-code { font-family: monospace; font-size: 24px; font-weight: 700; color: #0f766e; letter-spacing: 4px; }
          .otp-label { font-size: 11px; text-transform: uppercase; color: #0d9488; font-weight: 600; margin-bottom: 4px; }
          .alert-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 12px; margin-top: 20px; font-size: 12px; color: #92400e; }
          .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniMart Password Recovery</h1>
            <p>Smart Student Marketplace Sri Lanka</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${fullName || 'Student'},</div>
            <div class="text">
              We received a request to reset the password for your student account registered under <strong>${email}</strong> (${university || 'State University'}).
              <br><br>
              You can reset your password directly by clicking the button below:
            </div>
            ${actionLink ? `
              <div class="btn-container">
                <a href="${actionLink}" class="btn" target="_blank">Reset Student Password</a>
              </div>
            ` : ''}
            ${otp ? `
              <div class="otp-box">
                <div class="otp-label">Or enter this 6-digit recovery code on UniMart</div>
                <div class="otp-code">${otp}</div>
              </div>
            ` : ''}
            <div class="alert-box">
              <strong>Security Notice:</strong> This recovery link and 6-digit code will expire in 1 minute (60 seconds). If you did not request a password reset, please disregard this message; your account remains secure.
            </div>
          </div>
          <div class="footer">
            UniMart &bull; Verified Student Marketplace &bull; ICT 1108
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: senderAddress,
      to: email,
      subject,
      html
    });
    console.log(`[Mailer] Password reset email dispatched to ${email} (ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Mailer] Failed to send password reset email to ${email}:`, err.message);
    return { sent: false, error: err.message };
  }
}

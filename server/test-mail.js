import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

console.log('Using Gmail Account:', user);
console.log('Password length:', pass.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

async function run() {
  try {
    const verified = await transporter.verify();
    console.log('1. SMTP Connection Verified:', verified);

    const testOtp = '729401';
    const recipient = 'itt2024104@tec.rjt.ac.lk';

    console.log(`2. Sending verification email to ${recipient}...`);
    const info = await transporter.sendMail({
      from: `"UniMart Support" <${user}>`,
      to: recipient,
      subject: `UniMart Verification Code: ${testOtp}`,
      text: `Your verification code is: ${testOtp}\n\nEnter this code to complete registration.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0d9488;">UniMart Student Verification</h2>
          <p>Your 6-digit confirmation code is:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0f172a; padding: 12px; background: #f1f5f9; border-radius: 6px; display: inline-block;">
            ${testOtp}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you did not request this, please disregard.</p>
        </div>
      `
    });

    console.log('3. Send SUCCESS!');
    console.log('Response:', info.response);
    console.log('Accepted by Gmail:', info.accepted);
    console.log('Rejected by Gmail:', info.rejected);
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('FAILED to send email:', err);
  }
}
run();

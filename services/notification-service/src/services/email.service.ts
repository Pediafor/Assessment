import nodemailer from 'nodemailer';

const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'] as const;
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn(`⚠️ Email configuration incomplete. Missing: ${missing.join(', ')}`);
}

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  } : undefined,
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const from = process.env.EMAIL_FROM || 'no-reply@localhost';
  const mailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  } as const;

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Email sent:', { messageId: (info as any).messageId || 'unknown' });
  return info;
}

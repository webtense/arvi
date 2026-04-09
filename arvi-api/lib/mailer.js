const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const port = parseInt(process.env.SMTP_PORT || '25', 10);
  const secure = process.env.SMTP_SECURE === 'true';

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '127.0.0.1',
    port,
    secure,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        }
      : undefined,
  });

  return cachedTransporter;
};

const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'noreply@arvimanteniment.com';

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

module.exports = { sendMail };

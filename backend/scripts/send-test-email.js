import 'dotenv/config';
import nodemailer from 'nodemailer';

const recipient = process.argv[2] || 'temp@yopmail.com';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false') === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM;

if (!smtpHost) {
  console.error(
    'Please set the SMTP_HOST environment variable to send test emails. Exiting...',
  );
  process.exit(1);
}

if (!smtpFrom) {
  console.error(
    'Please set the SMTP_FROM environment variable to send test emails. Exiting...',
  );
  process.exit(1);
}

if (!smtpUser || !smtpPassword) {
  console.error(
    'Warning: SMTP_USER or SMTP_PASSWORD is not set. Email sending may fail without authentication credentials.',
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth:
    smtpUser || smtpPassword
      ? {
          user: smtpUser,
          pass: smtpPassword,
        }
      : undefined,
});

try {
  const result = await transporter.sendMail({
    from: smtpFrom,
    to: recipient,
    subject: 'Employee task management test email',
    text: 'This is a dummy test email to verify SMTP is working.',
  });

  console.log('Email send result:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Failed to send test email:');
  console.error(error);
  process.exitCode = 1;
}

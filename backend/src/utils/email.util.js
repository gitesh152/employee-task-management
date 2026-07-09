import nodemailer from 'nodemailer';

import logger from './logger.util.js';
import {
  smtpFrom,
  smtpHost,
  smtpPassword,
  smtpPort,
  smtpSecure,
  smtpUser,
} from '../config/env.config.js';

const transporter =
  smtpHost && smtpFrom
    ? nodemailer.createTransport({
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
      })
    : null;

export const isEmailEnabled = () => Boolean(transporter);

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.warn('Email notification skipped because SMTP is not configured.', {
      to,
      subject,
    });
    return null;
  }

  return transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  });
};

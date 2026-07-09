/** Centraized environment variable loader with default, required and optional values */

import 'dotenv/config';
import Joi from 'joi';

const databaseUrlSchema = Joi.string()
  .required()
  .custom((value, helpers) => {
    try {
      const parsedUrl = new URL(value);

      if (!parsedUrl.hostname) {
        return helpers.error('any.invalid');
      }

      const parsedPort = Number.parseInt(parsedUrl.port, 10);

      if (
        !parsedUrl.port ||
        Number.isNaN(parsedPort) ||
        parsedPort < 1 ||
        parsedPort > 65535
      ) {
        return helpers.error('any.invalid');
      }

      if (!parsedUrl.username || !parsedUrl.password) {
        return helpers.error('any.invalid');
      }

      if (!parsedUrl.pathname.replace(/^\/+/, '')) {
        return helpers.error('any.invalid');
      }
    } catch {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'database URL validation');

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: databaseUrlSchema,

  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),

  ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),

  JWT_ISSUER: Joi.string().default('myapp-jwt-auth'),
  JWT_AUDIENCE: Joi.string().default('myapp-jwt-auth-client'),

  SMTP_HOST: Joi.string().trim().optional(),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().trim().optional(),
  SMTP_PASSWORD: Joi.string().trim().optional(),
  SMTP_FROM: Joi.string().trim().optional(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  throw new Error(`❌ Environment variable validation error: ${error.message}`);
}

export const isProd = process.env.NODE_ENV === 'production';

const secretMin = isProd ? 64 : 32;

Joi.assert(envVars.ACCESS_TOKEN_SECRET, Joi.string().min(secretMin));
Joi.assert(envVars.REFRESH_TOKEN_SECRET, Joi.string().min(secretMin));

export const port = envVars.PORT;
export const databaseUrl = envVars.DATABASE_URL;

export const accessTokenSecret = envVars.ACCESS_TOKEN_SECRET;
export const accessTokenExpiry = envVars.ACCESS_TOKEN_EXPIRY;

export const refreshTokenSecret = envVars.REFRESH_TOKEN_SECRET;
export const refreshTokenExpiry = envVars.REFRESH_TOKEN_EXPIRY;

export const jwtIssuer = envVars.JWT_ISSUER;
export const jwtAudience = envVars.JWT_AUDIENCE;

export const smtpHost = envVars.SMTP_HOST;
export const smtpPort = envVars.SMTP_PORT;
export const smtpSecure = envVars.SMTP_SECURE;
export const smtpUser = envVars.SMTP_USER;
export const smtpPassword = envVars.SMTP_PASSWORD;
export const smtpFrom = envVars.SMTP_FROM;

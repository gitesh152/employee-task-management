import ms from 'ms';
import sanitize from 'sanitize-html';

import prisma from '../config/database.config.js';
import { refreshTokenExpiry } from '../config/env.config.js';
import logger from '../utils/logger.util.js';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/token.util.js';

const sanitizeUserAgent = (ua) => {
  if (!ua || typeof ua !== 'string') {
    return 'unknown';
  }

  return sanitize(ua, {
    allowedAttributes: [],
    allowedTags: [],
  }).slice(0, 255);
};

/**
 * Create a pair of access and refresh tokens, store refreshToken(hash) in persistance
 * @param {object} user - Prisma user record
 * @param {object} meta -  { ip, userAgent }
 * @returns {Promise<{ accessToken, refreshToken }>}  - { accessToken, refreshToken }
 */
export const createTokens = async (user, meta = {}, rememberMe = false) => {
  /** Create a new access/refresh token pair and persist the refresh token hash */
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    email: user.email,
  });

  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + ms(refreshTokenExpiry));

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
      rememberMe,
      ip: typeof meta?.ip === 'string' ? meta.ip.slice(0, 45) : undefined,
      userAgent: sanitizeUserAgent(meta?.userAgent),
    },
  });

  return { accessToken, refreshToken };
};

/**
 * Rotate refresh token - called when refresh endpoint receive a refresh token
 * - verify refresh token
 * - find refresh token hash in db
 * - if not found means re-use -> security event
 *   -> revoke all refresh token for that user (global logout)
 * - if found but not active (revoked or expired) -> throw error
 * - if found and active -> revoke current refresh token
 * -  -> create pair of access and refresh token,
 * -  -> store replacedByHash (hash of new refresh token) in cuurent(old) refresh token
 * @param {string} presentedToken - refresh token
 * @param {object} meta           - { ip, userAgent }
 * @returns {Promise<{ accessToken, refreshToken }>}     - { accessToken, refreshToken }
 */
export const rotateTokens = async (refreshToken, meta = {}) => {
  /** Validate and rotate the refresh token while protecting against reuse attacks */
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    const err = new Error('Invalid refresh token!');
    err.cause = error.message;
    err.status = 401;
    throw err;
  }

  const tokenHash = hashToken(refreshToken);

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!existing) {
    logger.warn(`Refresh token re-use detected`, {
      sub: payload?.sub,
      tokenHashPrefix: tokenHash.slice(0, 8),
    });
    if (payload?.sub) {
      await prisma.refreshToken.updateMany({
        where: {
          userId: payload.sub,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
    const err = new Error(
      `Refresh token re-use detected, all sessions revoked!`,
    );
    err.status = 401;
    throw err;
  }

  if (existing.revokedAt || existing.expiresAt <= new Date()) {
    logger.warn(`Refresh token is expired or revoked!`);
    const err = new Error(`Refresh token is expired or revoked!`);
    err.status = 401;
    throw err;
  }

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  const tokens = await createTokens(existing.user, meta, existing.rememberMe);

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: {
      replacedByHash: hashToken(tokens.refreshToken),
    },
  });

  return tokens;
};

/**
 * Revoked refresh token - called when user want to logout
 * @param {string} tokenHash - refresh token hash
 * @returns {Promise<boolean>} - was revoked or not
 */
export const revokeRefreshToken = async (tokenHash) => {
  const result = await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
  return result.count === 1;
};

/**
 * Revoke all refresh token of current user - called for global logout (all devices)
 * @param {string} userId - monoose document user ID
 * @returns {Promise<number>} - revoked refresh tokens count
 */
export const revokeAllRefreshToken = async (user) => {
  const result = await prisma.refreshToken.updateMany({
    where: {
      userId: user,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
  return result.count;
};

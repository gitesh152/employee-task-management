import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import {
  accessTokenExpiry,
  accessTokenSecret,
  jwtAudience,
  jwtIssuer,
  refreshTokenExpiry,
  refreshTokenSecret,
} from '../config/env.config.js';

export const signAccessToken = (payload = {}) => {
  /** Create a signed JWT used for authenticated API access */
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000) /** Issued at time */,
      jti: uuidv4() /** Unique id for future block list */,
      typ: 'access',
    },
    accessTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: accessTokenExpiry,
      issuer: jwtIssuer,
      audience: jwtAudience,
    },
  );
};

export const signRefreshToken = (payload = {}) => {
  /** Create a long-lived JWT used to rotate access tokens securely */
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000) /** Issued at time */,
      jti: uuidv4() /** Unique id for future block list */,
      typ: 'refresh',
    },
    refreshTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: refreshTokenExpiry,
      issuer: jwtIssuer,
      audience: jwtAudience,
    },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret, {
    algorithms: ['HS256'],
    issuer: jwtIssuer,
    audience: jwtAudience,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret, {
    algorithms: ['HS256'],
    issuer: jwtIssuer,
    audience: jwtAudience,
  });
};

export const hashToken = (token) => {
  /** Hash a token string so it can be safely stored and compared */
  return crypto.createHash('sha256').update(token).digest('hex');
};

import bcrypt from 'bcrypt';
import ms from 'ms';

import prisma from '../config/database.config.js';
import { accessTokenExpiry } from '../config/env.config.js';
import { authService } from '../services/index.js';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookie.util.js';
import logger from '../utils/logger.util.js';
import { hashToken } from '../utils/token.util.js';

export const buildUserResponse = (user) => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department ?? null,
  designation: user.designation ?? null,
});

export const createUserAccount = async ({
  name,
  email,
  password,
  department = null,
  designation = null,
  role = 'EMPLOYEE',
}) => {
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      fullName: name,
      email,
      password: passwordHash,
      role,
      department,
      designation,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    /** Collect registration input and normalize it for validation and storage */
    const email = String(req.body.email || '');
    const name = String(req.body.name || '');
    const password = req.body.password;
    const department = req.body.department;
    const designation = req.body.designation;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({
        message: 'Email already registered!',
      });
    }

    const user = await createUserAccount({
      name,
      email,
      password,
      department,
      designation,
      role: 'EMPLOYEE',
    });

    const userObj = buildUserResponse(user);

    logger.info(`User registered.`, userObj);

    const tokens = await authService.createTokens(
      user,
      {
        ip: req?.ip,
        userAgent: req.get('User-Agent'),
      },
      false,
    );

    setRefreshCookie(res, tokens.refreshToken, false);

    return res.status(201).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: ms(accessTokenExpiry) / 1000,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    /** Validate login credentials and issue a fresh auth token pair */
    const email = String(req.body.email || '');
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (!exists || !(await bcrypt.compare(password, exists.password))) {
      return res.status(401).json({
        message: 'Invalid Credentails!!!',
      });
    }

    const userObj = buildUserResponse(exists);

    const tokens = await authService.createTokens(
      exists,
      {
        ip: req?.ip,
        userAgent: req.get('User-Agent'),
      },
      rememberMe,
    );

    setRefreshCookie(res, tokens.refreshToken, rememberMe);

    return res.status(200).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: ms(accessTokenExpiry) / 1000,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    /** Rotate the existing refresh token and issue a new access token */
    const refreshToken = req.cookies?.refreshToken;
    const tokens = await authService.rotateTokens(refreshToken, {
      ip: req?.ip,
      userAgent: req.get('User-Agent'),
    });

    setRefreshCookie(res, tokens.refreshToken);
    return res.status(200).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: ms(accessTokenExpiry) / 1000,
      message: 'Token refreshed successfully...',
    });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    /** Revoke the current refresh token and clear the client-side cookie */
    const refreshToken = req.cookies?.refreshToken;
    const tokenHash = hashToken(refreshToken);

    const wasRevoked = await authService.revokeRefreshToken(tokenHash);

    if (wasRevoked) {
      logger.info(
        `Refresh token revoked successfully, tokenHashPrefix= ${tokenHash.slice(0, 8)}`,
      );
    } else {
      logger.error(
        `Attempt to revoke with invalid or already revoked refresh token, tokenHashPrefix= ${tokenHash.slice(0, 8)}`,
      );
    }

    clearRefreshCookie(res);

    /** Always respond with status 200, even If refresh token was not found in DB */
    return res.status(200).json({
      message: 'Logout Successfully...',
    });
  } catch (error) {
    /** Always clear cookie even If revokation fails. */
    clearRefreshCookie(res);
    logger.error(`Error during logout!`, { error: error.message });
    return res.status(500).json({
      message: `Error during logout!, error: ${error.message}`,
    });
  }
};

export const globalLogout = async (req, res, next) => {
  try {
    const userId = req.user.id.toString();
    const revokedCount = await authService.revokeAllRefreshToken(userId);

    let loggerMsg;
    let resMsg;
    if (revokedCount) {
      loggerMsg = `Revoked ${revokedCount} refresh tokens for user: ${userId}`;
      resMsg = `Logged out from all devices.`;
    } else {
      loggerMsg = `No active refresh tokens for user: ${userId}`;
      resMsg = `No active session to logout from.`;
    }

    clearRefreshCookie(res);
    logger.info(loggerMsg);
    return res.status(200).json({ message: resMsg });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

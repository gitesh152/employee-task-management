import ms from 'ms';

import { isProd, refreshTokenExpiry } from '../config/env.config.js';

export const setRefreshCookie = (res, refreshToken, rememberMe = false) => {
  const options = {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
  };

  if (rememberMe) {
    options.maxAge = ms(refreshTokenExpiry);
  }

  res.cookie('refreshToken', refreshToken, options);
};

export const clearRefreshCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    expires: new Date(0) /** past date to force expire */,
  });
};

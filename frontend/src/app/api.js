const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const BASE_URL = RAW_BASE_URL.replace(/\/$/, '');
let refreshPromise = null;

export const setStoredSession = ({ accessToken, user, rememberMe }) => {
  /** Persist the current auth session in either localStorage or sessionStorage */
  if (typeof window === 'undefined') {
    return;
  }

  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

  storage.setItem('auth_persist', rememberMe ? 'local' : 'session');
  storage.setItem('accessToken', accessToken || '');
  storage.setItem('user', JSON.stringify(user || null));
  otherStorage.removeItem('accessToken');
  otherStorage.removeItem('user');
  otherStorage.removeItem('auth_persist');
};

export const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('user');
  window.localStorage.removeItem('auth_persist');
  window.sessionStorage.removeItem('accessToken');
  window.sessionStorage.removeItem('user');
  window.sessionStorage.removeItem('auth_persist');
};

export const readStoredSession = () => {
  if (typeof window === 'undefined') {
    return { accessToken: null, user: null, rememberMe: false };
  }

  const localToken = window.localStorage.getItem('accessToken');
  const sessionToken = window.sessionStorage.getItem('accessToken');
  const storage = localToken ? window.localStorage : window.sessionStorage;
  const rawUser = storage.getItem('user');
  const rememberMe = storage === window.localStorage;

  return {
    accessToken: localToken || sessionToken,
    user: rawUser ? JSON.parse(rawUser) : null,
    rememberMe,
  };
};

const buildHeaders = (body, accessToken) => {
  const headers = new Headers();

  if (!(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
};

const parseResponsePayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
};

const getErrorMessage = (payload, fallback) => {
  if (payload && payload.message) {
    return payload.message;
  }

  if (typeof payload === 'string' && payload) {
    return payload;
  }

  return fallback;
};

const refreshAccessToken = async () => {
  /** Refresh the access token using the stored refresh cookie */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(undefined, null),
    });

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(payload, 'Session expired. Please sign in again.'));
    }

    if (!payload?.accessToken) {
      throw new Error('Unable to refresh session.');
    }

    const session = readStoredSession();
    setStoredSession({
      accessToken: payload.accessToken,
      user: session.user,
      rememberMe: session.rememberMe,
    });

    return payload.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const requestJson = async (path, options = {}) => {
  /** Send authenticated JSON requests and retry once after a token refresh */
  const session = readStoredSession();
  const isRefreshRequest = options.skipAuth || path === '/auth/refresh' || path === '/auth/refresh/';
  const requestOptions = {
    credentials: 'include',
    ...options,
    headers: buildHeaders(options.body, options.skipAuth ? null : options.accessToken || session.accessToken),
  };

  let response = await fetch(`${BASE_URL}${path}`, requestOptions);
  let payload = await parseResponsePayload(response);

  if (!response.ok && !options._retry && !isRefreshRequest && (response.status === 401 || response.status === 403)) {
    try {
      const refreshedAccessToken = await refreshAccessToken();
      const retriedResponse = await fetch(`${BASE_URL}${path}`, {
        ...requestOptions,
        headers: buildHeaders(options.body, refreshedAccessToken),
        _retry: true,
      });
      payload = await parseResponsePayload(retriedResponse);
      response = retriedResponse;
    } catch (error) {
      clearStoredSession();
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      } catch (e) {
        // ignore
      }
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Request failed'));
  }

  return payload;
};

export const api = {
  get: (path, options = {}) => requestJson(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) =>
    requestJson(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body, options = {}) =>
    requestJson(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  del: (path, options = {}) => requestJson(path, { ...options, method: 'DELETE' }),
};
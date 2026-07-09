import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { api, clearStoredSession, readStoredSession, setStoredSession } from '../../app/api';

const initialSession = readStoredSession();

const initialState = {
  user: initialSession.user,
  accessToken: initialSession.accessToken,
  status: 'idle',
  error: null,
  initialized: false,
};

const normalizeUser = (user) =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        designation: user.designation || '',
      }
    : null;

export const bootstrapSession = createAsyncThunk('auth/bootstrap', async () => {
  const refreshed = await api.post('/auth/refresh', {});
  const profile = await api.get('/users/me', { accessToken: refreshed.accessToken });
  return { accessToken: refreshed.accessToken, user: normalizeUser(profile.user) };
});

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const response = await api.post('/auth/login', credentials, { skipAuth: true });
  return { accessToken: response.accessToken, user: normalizeUser(response.user), rememberMe: Boolean(credentials.rememberMe) };
});

export const register = createAsyncThunk('auth/register', async (credentials) => {
  const response = await api.post('/auth/register', credentials, { skipAuth: true });
  return { accessToken: response.accessToken, user: normalizeUser(response.user), rememberMe: true };
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout', {});
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateSession: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.initialized = true;
      state.status = 'succeeded';
      state.error = null;
    },
    clearSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initialized = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.error = null;
        const session = readStoredSession();
        setStoredSession({
          accessToken: action.payload.accessToken,
          user: action.payload.user,
          rememberMe: session.rememberMe,
        });
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.status = 'idle';
        state.initialized = true;
        state.error = null;
        clearStoredSession();
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.initialized = true;
        setStoredSession(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.initialized = true;
        setStoredSession(action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'idle';
        state.error = null;
        clearStoredSession();
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Logout failed';
      });
  },
});

export const { hydrateSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
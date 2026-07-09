import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import appReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
  },
});
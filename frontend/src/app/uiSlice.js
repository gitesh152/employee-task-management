import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'app',
  initialState: {
    toast: null,
  },
  reducers: {
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

export const { setToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
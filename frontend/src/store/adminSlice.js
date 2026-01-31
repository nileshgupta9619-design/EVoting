import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  admin: localStorage.getItem('adminData') ? JSON.parse(localStorage.getItem('adminData')) : null,
  token: localStorage.getItem('adminToken') || null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.error = null;
    },
    clearAdmin: (state) => {
      state.admin = null;
      state.token = null;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAdmin, clearAdmin, setError } = adminSlice.actions;
export default adminSlice.reducer;
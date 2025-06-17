import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  username: '',
  is_admin: false,
  name: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.is_admin = action.payload.is_admin;
      state.name = action.payload.name;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.username = '';
      state.is_admin = false;
      state.name = '';
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

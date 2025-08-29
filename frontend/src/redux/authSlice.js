import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    login: { currentUser: null, isFetching: false, error: false },
    register: { isFetching: false, error: false, success: false },
  },
  reducers: {
    // LOGIN
    loginStart: (state) => { state.login.isFetching = true; state.login.error = false; },
    loginSuccess: (state, action) => {
      state.login.isFetching = false;
      state.login.currentUser = action.payload; // {user, token} hoặc user object
      state.login.error = false;
    },
    loginFail: (state) => { state.login.isFetching = false; state.login.error = true; },

    // REGISTER (nếu bạn đang dùng)
    registerStart:  (state) => { state.register.isFetching = true; state.register.error = false; state.register.success = false; },
    registerSuccess:(state) => { state.register.isFetching = false; state.register.success = true; },
    registerFail:   (state) => { state.register.isFetching = false; state.register.error = true; },

    // LOGOUT
    logout: (state) => {
      state.login.currentUser = null;
      state.login.isFetching = false;
      state.login.error = false;
    },
  },
});

export const {
  loginStart, loginSuccess, loginFail,
  registerStart, registerSuccess, registerFail,
  logout,                           // <-- nhớ export
} = authSlice.actions;

export default authSlice.reducer;

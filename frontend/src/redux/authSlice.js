import {createSlice} from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        login:{
            currentUser: null,
            isFetching: false,
            error: false,
        }
    },
    reducersL: {
        loginStart: (state) => {
            state.login.isFetching = true;
        },
        loginSuccess: (state, action) => {
            state.login.isFetching = false;
            state.login.currentUser = action.payload;
            state.login.error = false;
        },
        loginFail: (state, action) => {
            state.login.isFetching = false;
            state.login.error = true;
        },
    }
})

export const { loginStart, loginSuccess, loginFail } = authSlice.actions;
export default authSlice.reducer;
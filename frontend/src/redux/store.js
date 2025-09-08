import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";

export default configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
    },
    devTools: process.env.NODE_ENV !== 'production' ? {
        actionSanitizer: (action) => {
            if (action.type === 'auth/loginSuccess' && action.payload?.token) {
                // ẩn token trong log
                const safePayload = { ...action.payload, token: "***" };
                return { ...action, payload: safePayload };
            }
            return action;
        },
    } : false,
})
import axios from "axios";
import { loginStart, loginSuccess, loginFail, registerStart, registerSuccess, registerFail } from "./authSlice";

export const loginUser = async (user, dispatch, navigate) => {
    dispatch(loginStart());
    try {
        const res = await axios.post("/v1/auth/login", user);
        dispatch(loginSuccess(res.data));
        navigate("/");
    } catch (err) {
        dispatch(loginFail());
    }
};

export const registerUser = async (user, dispatch, navigate) => {
    dispatch(registerStart());
    try {
        const res = await axios.post("/v1/auth/register", user);
        dispatch(registerSuccess());
        navigate("/login");
    } catch (err) {
        dispatch(registerFail());
    }
}
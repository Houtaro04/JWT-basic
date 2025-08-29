import axios from "axios";
import { loginStart, loginSuccess, loginFail } from "./authSlice";

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

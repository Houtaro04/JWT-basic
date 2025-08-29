import axios from "axios";
import { 
    loginStart, 
    loginSuccess, 
    loginFail, 
    registerStart, 
    registerSuccess, 
    registerFail
} from "./authSlice";
import { 
    getUsersStart,
    getUsersSuccess,
    getUsersFail,
    getMeStart,
    getMeSuccess,
    getMeFail
} from "./userSlice";

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

export const getAllUsers = async (token, dispatch) => {
  dispatch(getUsersStart());
  try {
    const { data } = await axios.get("/v1/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = Array.isArray(data) ? data : data.items || [];
    dispatch(getUsersSuccess({
      items,
      page: data.page,
      limit: data.limit,
      total: data.total,
    }));
  } catch (e) {
    dispatch(getUsersFail(e.response?.data || e.message));
  }
};

// Lấy thông tin chính mình (user thường)
export const getMe = async (token, id, dispatch) => {
  dispatch(getMeStart());
  try {
    const { data } = await axios.get(`/v1/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(getMeSuccess(data)); // có thể là 1 object user
  } catch (err) {
    dispatch(getMeFail(err.response?.data || err.message));
  }
};
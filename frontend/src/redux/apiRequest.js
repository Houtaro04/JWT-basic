import axios from "../redux/axios";
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
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFail,
} from "./userSlice";

export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const basic = btoa(`${user.username}:${user.password}`); // base64, KHÔNG mã hoá
    const res = await axios.post(
      "/v1/auth/login",
      { username: user.username },                // <-- body chỉ có username
      { headers: { Authorization: `Basic ${basic}` } } // <-- password nằm ở header
    );
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
        dispatch(registerSuccess(res.data));
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
  } catch (err) {
    const payload = {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
    };
    dispatch(getUsersFail(payload));
  }
};

export const deleteUser = async (token, id, dispatch) => {
  dispatch(deleteUserStart());
  try {
    await axios.delete(`/v1/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(deleteUserSuccess({ id }));
  } catch (err) {
    dispatch(deleteUserFail({
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      type: "error",
    }));
  }
};

import { useEffect } from "react";
import "./home.css";
import { getAllUsers, deleteUser } from "../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMsg, setMsg } from "../../redux/userSlice";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { logout, loginSuccess } from "../../redux/authSlice";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // auth
  const auth    = useSelector(s => s.auth.login);
  const token   = auth?.token ?? auth?.currentUser?.token;
  const profile = auth?.user  ?? auth?.currentUser?.user;
  const isAdmin = !!profile?.admin;
  const selfId  = profile?._id || profile?.id || null;

  // users slice
  const { items: userList = [], error: usersError, status: usersStatus } =
    useSelector(s => s.users.list);
  const msg     = useSelector(s => s.users.msg);
  const msgType = useSelector(s => s.users.msgType);

  let axiosJWT = axios.create();
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    getAllUsers(token, dispatch);
  }, [token, dispatch, navigate]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => dispatch(clearMsg()), 3000);
    return () => clearTimeout(t);
  }, [msg, dispatch]);

  const canDelete = (u) => isAdmin || (selfId && u._id === selfId);

  const handleDelete = (u) => {
    const id = u?._id;
    if (!id) return;

    if (!canDelete(u)) {
      // show thông báo thay vì gọi API
      dispatch(setMsg({ text: "Bạn không có quyền làm điều đó", type: "error" }));
      return;
    }
    deleteUser(token, id, dispatch);
  };

  const refreshToken = async () => {
    try {
      const res = await axios.post("/v1/auth/refresh", {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      console.log("Refresh token error:", err);
      navigate("/login");
    }
  }

  axiosJWT.interceptors.request.use(
    async (config) => {
      let date = new Date();
      const decodedToken = jwt_decode(token);
      if(decodedToken.exp < date.getTime() / 1000) {
        const data = await refreshToken();
        const refreshUser = {
          ...profile,
          token: data.token,
        };
        dispatch(loginSuccess(refreshUser));
        config.headers["Authorization"] = "Bearer " + data.token;
      }
      return config;
    },
    (err) => {
        return Promise.reject(err);
    }
  );

  return (
    <main className="home-container">
      <div className="home-title">User List</div>
      <div className="home-role">{`Your role: ${isAdmin ? "Admin" : "User"}`}</div>

      {usersError && (
        <div className="err">
          {usersStatus === 401 || usersStatus === 403
            ? "Bạn không có quyền xem danh sách user"
            : String(usersError)}
        </div>
      )}

      <div className="home-userlist">
        {userList.length === 0 ? (
          <div>Không có user</div>
        ) : (
          userList.map(u => (
            <div key={u._id} className="user-container">
              <div className="home-user">{u.username}</div>
              <button
                className={`delete-user ${!canDelete(u) ? "is-disabled" : ""}`}
                title={canDelete(u) ? "Xoá tài khoản" : "Chỉ có thể xoá chính mình"}
                onClick={() => handleDelete(u)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {msg && <div className={`msg ${msgType}`}>{msg}</div>}
    </main>
  );
};

export default HomePage;

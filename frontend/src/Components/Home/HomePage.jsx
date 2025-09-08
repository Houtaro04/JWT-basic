import { useEffect } from "react";
import "./home.css";
import { getAllUsers, deleteUser } from "../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMsg, setMsg } from "../../redux/userSlice";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // auth
  const auth    = useSelector(s => s.auth.login);
  const token   = auth?.token ?? auth?.currentUser?.token;
  const profile = auth?.user  ?? auth?.currentUser?.user; // từ login
  const isAdmin = !!profile?.admin;
  const selfId  = profile?._id || profile?.id || null;

  // users slice
  const { items: userList = [], error: usersError, status: usersStatus } =
    useSelector(s => s.users.list);
  const msg     = useSelector(s => s.users.msg);
  const msgType = useSelector(s => s.users.msgType);

  // luôn fetch list cho mọi user
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    getAllUsers(token, dispatch);
  }, [token, dispatch, navigate]);

  // auto-clear message
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
      dispatch(setMsg({ message: "Bạn không có quyền làm điều đó", type: "error" }));
      return; // KHÔNG gọi API
    }
    deleteUser(token, id, dispatch);
  };

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
                className="delete-user"
                disabled={!canDelete(u)}
                title={canDelete(u) ? "Xoá tài khoản" : "Chỉ có thể xoá chính mình"}
                onClick={() => handleDelete(u._id)}
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

import { useEffect } from "react";
import "./home.css";
import { getAllUsers, getMe, deleteUser } from "../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearMsg } from "../../redux/userSlice"; // nhớ có action này

const HomePage = () => {
  // 1) Hooks ở đầu component
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2) State
  const auth    = useSelector(s => s.auth.login);
  const token   = auth?.token ?? auth?.currentUser?.token;
  const profile = auth?.user  ?? auth?.currentUser?.user;
  const isAdmin = profile?.admin === true;

  const { items: userList, error: usersError, status: usersStatus } = useSelector(s => s.users.list);
  const me      = useSelector(s => s.users.me.profile);
  const msg     = useSelector(s => s.users.msg);
  const msgType = useSelector(s => s.users.msgType);

  // 3) Gọi API đúng chỗ
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (isAdmin) getAllUsers(token, dispatch);
    else if (profile?._id) getMe(token, profile._id, dispatch);
  }, [token, isAdmin, profile?._id, dispatch, navigate]);

  // 4) Tự ẩn thông báo sau 3s (side-effect, KHÔNG đặt trong JSX)
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => dispatch(clearMsg()), 3000);
    return () => clearTimeout(t);
  }, [msg, dispatch]);

  // 5) Handlers
  const handleDelete = (id) => {
    if (!id) return;
    deleteUser(token, id, dispatch);
  };

  // 6) JSX
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
        {isAdmin ? (
          userList.length === 0 ? (
            <div>Không có user</div>
          ) : (
            userList.map(u => (
              <div key={u._id} className="user-container">
                <div className="home-user">{u.username}</div>
                <button className="delete-user" onClick={() => handleDelete(u._id)}>
                  Delete
                </button>
              </div>
            ))
          )
        ) : me ? (
          <div className="user-container">
            <div className="home-user">{me.username}</div>
            <button className="delete-user" onClick={() => handleDelete(me._id)}>
              Delete
            </button>
          </div>
        ) : (
          <div>Bạn không có quyền xem danh sách user</div>
        )}
      </div>

      {msg && <div className={`msg ${msgType}`}>{msg}</div>}
    </main>
  );
};

export default HomePage;

import { useEffect } from "react";
import "./home.css";
import { getAllUsers, getMe } from "../../redux/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const auth    = useSelector(s => s.auth.login);
  const token   = auth?.token ?? auth?.currentUser?.token;
  const profile = auth?.user  ?? auth?.currentUser?.user;
  const isAdmin = profile?.admin === true;

  const userList = useSelector(s => s.users.list.items);   // <-- sửa
  const me       = useSelector(s => s.users.me.profile);   // <-- OK

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (isAdmin) getAllUsers(token, dispatch);
    else if (profile?._id) getMe(token, profile._id, dispatch);
  }, [token, isAdmin, profile?._id, dispatch, navigate]);

  return (
    <main className="home-container">
      <div className="home-title">User List</div>

      <div className="home-userlist">
        {isAdmin ? (
          !userList.length ? (
            <div>Không có user</div>
          ) : (
            userList.map(u => (
              <div key={u._id} className="user-container">
                <div className="home-user">{u.username}</div>
                <div className="delete-user">Delete</div>
              </div>
            ))
          )
        ) : me ? (
          <div className="user-container">
            <div className="home-user">{me.username}</div>
            <div className="delete-user">Delete</div>
          </div>
        ) : (
          <div>Bạn không có quyền xem danh sách user</div>
        )}
      </div>
    </main>
  );
};

export default HomePage;

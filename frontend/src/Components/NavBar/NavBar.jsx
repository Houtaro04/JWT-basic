import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useDispatch } from "react-redux";

const NavBar = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // clear redux state
    dispatch(logout());

    // nếu có lưu token/user ở localStorage thì xoá luôn
    localStorage.removeItem("persist:root"); // nếu dùng redux-persist
    localStorage.removeItem("token");        // hoặc key bạn đặt riêng

    // điều hướng về trang login
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      <Link to="/" className="navbar-home"> Home </Link>
      {user? (
        <>
        <p className="navbar-user">Hi, <span> {user.username} </span> </p>
        <button className="navbar-logout" onClick={handleLogout}>
            Log out
          </button>
        </>
      ) : (    
        <>
      <Link to="/login" className="navbar-login"> Login </Link>
      <Link to="/register" className="navbar-register"> Register</Link>
      </>
)}
    </nav>
  );
};

export default NavBar;

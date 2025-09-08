// src/Components/NavBar/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice"; // đảm bảo slice có action này

const NavBar = () => {
  const current = useSelector(s => s.auth.login.currentUser); // có thể null | user | {user, token}
  const me      = useSelector(s => s.users?.me?.profile);     // nếu bạn có getMe

  // Lấy tên theo các trường hợp có thể có, dùng optional chaining
  const displayName =
    me?.username ??
    current?.user?.username ??   // khi current = { user, token }
    current?.username ?? null;   // khi current = user thuần

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("persist:root"); // nếu dùng redux-persist
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      <Link to="/" className="navbar-home">Home</Link>

      {displayName ? (
        <>
          <p className="navbar-user">Hi, <span>{displayName}</span></p>
          <button className="navbar-logout" onClick={handleLogout} style={{color: 'white'}}>Log out</button>
        </>
      ) : (
        <>
          <Link to="/login" className="navbar-login">Login</Link>
          <Link to="/register" className="navbar-register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;

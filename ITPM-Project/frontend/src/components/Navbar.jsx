import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LogOut, LayoutDashboard, User } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div>
                    <Link to="/" className="navbar-brand">
                        <BookOpen size={28} />
                        <span className="navbar-brand-text">StudyTracker</span>
                    </Link>
                </div>

                <div className="navbar-right">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="navbar-link">
                                <LayoutDashboard size={16} />
                                <span>Dashboard</span>
                            </Link>
                            <div className="navbar-user">
                                <User size={16} className="navbar-user-icon" />
                                <span className="navbar-username">{user.firstName}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="navbar-logout-btn"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link">Login</Link>
                            <Link to="/register" className="navbar-register-btn">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

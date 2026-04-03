import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, Target, Trophy, Settings, GraduationCap, LogOut } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const role = user?.role;
    const isAdminOrLecturer = role === "admin" || role === "lecturer";

    // ── Nav links ─────────────────────────────────────────────────────
    // Build dynamically based on role so students never see restricted pages.
    const mainLinks = [
        // Only admin / lecturer can access User Management
        ...(isAdminOrLecturer
            ? [{ name: "User Management", path: "/users", icon: Users }]
            : []),
        { name: "Study Goals", path: "/dashboard", icon: Target },
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    ];


    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">

            {/* Top Section */}
            <div>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-inner">
                        <div className="sidebar-logo-icon">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <h1 className="sidebar-logo-title">EduNexus</h1>
                            <p className="sidebar-logo-subtitle">Academic System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="sidebar-nav">

                    {/* Main Links */}
                    <div className="sidebar-nav-section">
                        <p className="sidebar-nav-label">Main</p>
                        {mainLinks.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`sidebar-link${active ? " active" : ""}`}
                                >
                                    <div className="sidebar-link-left">
                                        <Icon className="sidebar-link-icon" size={18} />
                                        <span>{link.name}</span>
                                    </div>
                                    {link.badge && (
                                        <span className="sidebar-badge">{link.badge}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>



                </div>
            </div>

            {/* Bottom Profile Section */}
            {user && (
                <div className="sidebar-profile">
                    <div className="sidebar-profile-card">
                        <div className="sidebar-profile-left">
                            <div className="sidebar-avatar">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <p className="sidebar-profile-name">{user.firstName} {user.lastName}</p>
                                <p className="sidebar-profile-role" style={{ textTransform: "capitalize" }}>{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="sidebar-logout-btn"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Sidebar;

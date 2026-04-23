import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!user) return null;

    return (
        <nav className="hp-nav authenticated-nav">
            <Link to="/home2" className="nav-logo">
                <div className="nav-logo-icon">🚀</div>
                <span className="nav-logo-text">Study<em>Nexus</em></span>
            </Link>

            <ul className="nav-links">
                <li><Link to="/home2">Home</Link></li>
                <li><Link to="/academic-resources">Resources</Link></li>
                <li><Link to="/ai-summary">AI Summary</Link></li>
                <li><Link to="/dashboard">Goals</Link></li>
                <li><Link to="/all-groups">Groups</Link></li>
            </ul>

            <div className="nav-actions">
                <div className="user-pill">
                    <span className="user-name-short">{user.firstName}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost logout-link">
                    <LogOut size={16} style={{ marginRight: '8px' }} />
                    Logout
                </button>
            </div>

            <style>{`
                .authenticated-nav {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 68px;
                    padding: 0 5%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #0f1b6b; /* Exact StudyNexus Navy */
                    box-shadow: 0 2px 20px rgba(15, 27, 107, 0.3);
                    z-index: 1000;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .authenticated-nav .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }

                .authenticated-nav .nav-logo-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #2563eb, #0ea5e9);
                    font-size: 20px;
                }

                .authenticated-nav .nav-logo-text {
                    color: #ffffff;
                    font-size: 1.35rem;
                    font-weight: 700;
                }

                .authenticated-nav .nav-logo-text em {
                    color: #22d3ee; /* Aqua accent */
                    font-style: normal;
                }

                .authenticated-nav .nav-links {
                    display: flex;
                    list-style: none;
                    gap: 32px;
                    margin: 0;
                    padding: 0;
                }

                .authenticated-nav .nav-links a {
                    text-decoration: none;
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }

                .authenticated-nav .nav-links a:hover {
                    color: #22d3ee;
                }

                .authenticated-nav .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .user-pill {
                    padding: 6px 14px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }

                .logout-link {
                    padding: 8px 18px;
                    border: 1.5px solid rgba(255, 255, 255, 0.3);
                    color: #ffffff;
                    font-size: 0.88rem;
                    font-weight: 600;
                    border-radius: 10px;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }

                .logout-link:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #f87171;
                    color: #f87171;
                }
                
                @media (max-width: 1024px) {
                    .authenticated-nav { padding: 0 5%; }
                    .authenticated-nav .nav-links { gap: 20px; }
                }

                @media (max-width: 768px) {
                    .nav-links { display: none; }
                }
            `}</style>
        </nav>
    );
};

export default Header;

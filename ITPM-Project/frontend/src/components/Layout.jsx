import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const Layout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Do not show the sidebar/dashboard layout on Home, Login, or Register pages
    const isPublicPage = ["/", "/login", "/register", "/home"].includes(location.pathname);

    if (!user || isPublicPage) {
        return <div className="layout-root">{children}</div>;
    }

    return (
        <div className="layout-root layout-root--authenticated">
            <Sidebar />
            <div className="layout-content">
                <main className="layout-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

import { useLocation } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const Layout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Do not show the navigation header on landing page, login, or register
    const isAuthPage = ["/login", "/register", "/"].includes(location.pathname);

    // If it's a public/auth page, just render children (the page handles its own layout)
    if (isAuthPage) {
        return <div className="layout-root">{children}</div>;
    }

    return (
        <div className="layout-root layout-root--authenticated">
            {user && <Header />}
            <div className="layout-content">
                <main className="layout-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

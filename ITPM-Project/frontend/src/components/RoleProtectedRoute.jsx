import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleProtectedRoute
 * Wraps a route that requires BOTH authentication AND a specific role.
 *
 * Usage:
 *   <RoleProtectedRoute allowedRoles={["admin", "lecturer"]}>
 *     <UserManagement />
 *   </RoleProtectedRoute>
 *
 * Behaviour:
 *   - Loading → show spinner
 *   - Not logged in → redirect to /login
 *   - Logged in but wrong role → redirect to /dashboard
 *   - Logged in + correct role → render children
 */
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RoleProtectedRoute;

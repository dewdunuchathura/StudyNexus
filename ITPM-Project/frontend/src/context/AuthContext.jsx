import { createContext, useState, useEffect, useContext } from "react";
import apiClient, { getPayload, setAuthToken } from "../services/apiClient";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setAuthToken(storedToken);
      setToken(storedToken);
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
      
      // Refresh user data from server
      fetchCurrentUser();
      return;
    }

    setLoading(false);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get("/api/auth/me");
      const fetchedUser = getPayload(response);
      setUser(fetchedUser);
      localStorage.setItem("user", JSON.stringify(fetchedUser));
    } catch (error) {
      console.error("Fetch user error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await apiClient.post("/api/auth/login", { email, password });
    const payload = getPayload(response);
    const { token: newToken, user: loggedInUser } = payload;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(loggedInUser);

    return payload;
  };

  const register = async (userData) => {
    const response = await apiClient.post("/api/auth/register", userData);
    const payload = getPayload(response);
    
    // Some register APIs return user/token directly
    if (payload.token) {
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      setAuthToken(payload.token);
      setToken(payload.token);
      setUser(payload.user);
    }
    
    return payload;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register, 
      logout, 
      loading,
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

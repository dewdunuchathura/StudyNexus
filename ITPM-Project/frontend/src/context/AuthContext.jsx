import { createContext, useState, useEffect, useContext } from "react";
import apiClient, { getPayload, setAuthToken } from "../services/apiClient";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthToken(token);
      fetchCurrentUser();
      return;
    }

    setLoading(false);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get("/api/auth/me");
      setUser(getPayload(response));
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
    const { token, user: loggedInUser } = payload;

    localStorage.setItem("token", token);
    setAuthToken(token);
    setUser(loggedInUser);

    return payload;
  };

  const register = async (userData) => {
    await apiClient.post("/api/auth/register", userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

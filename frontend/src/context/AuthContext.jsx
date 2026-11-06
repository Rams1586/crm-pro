import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("crm_admin")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("crm_token");
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get("/api/auth/me");
        setAdmin(data.admin);
      } catch {
        localStorage.removeItem("crm_token");
        localStorage.removeItem("crm_admin");
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("crm_token", data.token);
    localStorage.setItem("crm_admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_admin");
    setAdmin(null);
  };

  return <AuthCtx.Provider value={{ admin, login, logout, loading }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(null);
const STORAGE_KEY = "admin_session_v1";

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (username, password) => {
    if (!username || !password) {
      throw new Error("Please enter both username and password.");
    }
    if (password.length < 3) {
      throw new Error("Password is too short.");
    }
    setUser({
      username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      role: "Administrator",
      loggedAt: new Date().toISOString(),
    });
  };

  const logout = () => setUser(null);

  return (
    <AdminAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

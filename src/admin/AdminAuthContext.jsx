import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi, tokenStore, usersApi, AUTH_FAILED_EVENT } from "../services/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [authNotice, setAuthNotice] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onInvalid = (e) => {
      setUser(null);
      const reason = e?.detail?.reason || "Your session has expired. Please sign in again.";
      setAuthNotice(reason);
      const onAdmin = location.pathname.startsWith("/admin");
      const target = onAdmin ? "/admin/login" : "/register";
      navigate(target, {
        replace: true,
        state: { from: location.pathname, authNotice: reason },
      });
    };
    window.addEventListener(AUTH_FAILED_EVENT, onInvalid);
    return () => window.removeEventListener(AUTH_FAILED_EVENT, onInvalid);
  }, [navigate, location.pathname]);

  // On mount: if a token exists, validate it against the backend.
  // A 401 will be intercepted by api.js and trigger the AUTH_FAILED_EVENT.
  useEffect(() => {
    const stored = tokenStore.getUser();
    if (!stored || !stored.id || !tokenStore.get()) return;
    usersApi.getFavoriteCountries(stored.id).catch(() => {
      // Non-401 errors are ignored — only invalid tokens trigger logout (handled in api.js).
    });
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }
    const result = await authApi.login(email.trim(), password);
    if (!result || !result.token) {
      throw new Error("Login failed: no token returned.");
    }
    tokenStore.set(result.token);
    const stored = {
      id: result.id,
      username: result.email,
      email: result.email,
      displayName: result.name || result.email,
      role: result.role,
      avatarUrl: result.avatarUrl,
      phone: result.phone,
      loggedAt: new Date().toISOString(),
    };
    tokenStore.setUser(stored);
    setUser(stored);
    return stored;
  };

  const register = async (name, email, password) => {
    const result = await authApi.register(name, email, password);
    if (!result || !result.token) {
      throw new Error("Registration failed.");
    }
    tokenStore.set(result.token);
    const stored = {
      id: result.id,
      username: result.email,
      email: result.email,
      displayName: result.name || result.email,
      role: result.role,
      avatarUrl: result.avatarUrl,
      phone: result.phone,
      loggedAt: new Date().toISOString(),
    };
    tokenStore.setUser(stored);
    setUser(stored);
    return stored;
  };

  const logout = () => {
    tokenStore.set(null);
    tokenStore.setUser(null);
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : prev;
      tokenStore.setUser(next);
      return next;
    });
  };

  const clearAuthNotice = () => setAuthNotice("");

  return (
    <AdminAuthContext.Provider
      value={{ user, login, register, logout, updateUser, authNotice, clearAuthNotice }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

export const useAuth = useAdminAuth;

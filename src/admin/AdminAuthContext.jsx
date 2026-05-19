import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  authApi,
  tokenStore,
  usersApi,
  AUTH_FAILED_EVENT,
  getTokenExpiry,
  isTokenExpired,
  handleInvalidToken,
  decodeJwt,
} from "../services/api";

// The backend doesn't echo the user id back in the login/register response —
// fish it out of the JWT's nameidentifier claim instead.
const NAME_ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

const buildStoredUser = (result, token) => {
  const claims = decodeJwt(token) || {};
  const claimId = claims[NAME_ID_CLAIM];
  const id =
    result?.id ??
    (claimId != null && !Number.isNaN(Number(claimId)) ? Number(claimId) : null);
  return {
    id,
    username: result?.email,
    email: result?.email,
    displayName: result?.name || claims[NAME_CLAIM] || result?.email,
    role: result?.role || claims[ROLE_CLAIM],
    avatarUrl: result?.avatarUrl,
    phone: result?.phone,
    loggedAt: new Date().toISOString(),
  };
};

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // If a stored token is already expired at load time, drop the session immediately.
    if (tokenStore.get() && isTokenExpired()) {
      tokenStore.set(null);
      tokenStore.setUser(null);
      return null;
    }
    const stored = tokenStore.getUser();
    // Back-fill id from the JWT for sessions that were saved before id-from-claim landed.
    if (stored && (stored.id == null || stored.id === "")) {
      const claims = decodeJwt(tokenStore.get()) || {};
      const claimId = claims[NAME_ID_CLAIM];
      if (claimId != null && !Number.isNaN(Number(claimId))) {
        const patched = { ...stored, id: Number(claimId) };
        tokenStore.setUser(patched);
        return patched;
      }
    }
    return stored;
  });
  const [authNotice, setAuthNotice] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const expiryTimerRef = useRef(null);

  useEffect(() => {
    const onInvalid = (e) => {
      setUser(null);
      const reason = e?.detail?.reason || "Your session has expired. Please sign in again.";
      setAuthNotice(reason);
      const onAdmin = location.pathname.startsWith("/admin");
      const target = onAdmin ? "/admin/login" : "/login";
      navigate(target, {
        replace: true,
        state: { from: location.pathname, authNotice: reason },
      });
    };
    window.addEventListener(AUTH_FAILED_EVENT, onInvalid);
    return () => window.removeEventListener(AUTH_FAILED_EVENT, onInvalid);
  }, [navigate, location.pathname]);

  // Schedule a forced logout right when the JWT's `exp` claim elapses, so users
  // are kicked out the moment their session expires even if they make no requests.
  useEffect(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (!user) return;
    const exp = getTokenExpiry();
    if (exp == null) return;
    const delay = exp - Date.now();
    if (delay <= 0) {
      handleInvalidToken();
      return;
    }
    const MAX_DELAY = 2_147_483_000;
    expiryTimerRef.current = setTimeout(
      () => handleInvalidToken(),
      Math.min(delay, MAX_DELAY)
    );
    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };
  }, [user]);

  // Cross-tab sync: if another tab logs in/out, mirror the change here.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "auth_token_v1" || e.key === "auth_user_v1") {
        const next = tokenStore.get() && !isTokenExpired() ? tokenStore.getUser() : null;
        setUser(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // On window focus: re-check expiry in case the laptop was asleep past the deadline.
  useEffect(() => {
    const onFocus = () => {
      if (tokenStore.get() && isTokenExpired()) handleInvalidToken();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

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
    const stored = buildStoredUser(result, result.token);
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
    const stored = buildStoredUser(result, result.token);
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

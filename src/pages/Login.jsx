import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../admin/AdminAuthContext";
import "../styles/auth.css";

export default function Login() {
  const { user, login, authNotice, clearAuthNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/profile";
  const notice = location.state?.authNotice || authNotice;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      clearAuthNotice && clearAuthNotice();
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Welcome back to Eurasia</p>

        {notice && !error && (
          <div className="auth-error" style={{ background: "#fff3cd", color: "#664d03", borderColor: "#ffecb5" }}>
            {notice}
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            required
          />
        </label>

        <label className="auth-label">
          Password
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" state={{ from: redirectTo }} className="auth-link">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}

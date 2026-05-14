import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../admin/AdminAuthContext";
import "../styles/auth.css";

export default function Register() {
  const { user, register, authNotice, clearAuthNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/profile";
  const notice = location.state?.authNotice || authNotice;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      clearAuthNotice && clearAuthNotice();
      await register(name.trim(), email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join Eurasia to save favourites and play the quiz</p>

        {notice && !error && (
          <div className="auth-error" style={{ background: "#fff3cd", color: "#664d03", borderColor: "#ffecb5" }}>
            {notice}
          </div>
        )}
        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label">
          Full name
          <input
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            autoFocus
            required
          />
        </label>

        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="auth-label">
          Confirm password
          <input
            type="password"
            className="auth-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" state={{ from: redirectTo }} className="auth-link">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

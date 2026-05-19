import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAdminAuth } from "../AdminAuthContext";
import "../../styles/admin.css";

export default function AdminLogin() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && user.role === "Admin") return <Navigate to="/admin" replace />;
  // A signed-in non-admin has no business on the admin login screen — send them home.
  if (user && user.role !== "Admin") return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const logged = await login(email.trim(), password);
      if (logged.role !== "Admin") {
        throw new Error("This account does not have admin access.");
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <div className="admin-login-card__head">
          <h1>Eurasia Administration</h1>
          <p>Sign in to manage the site</p>
        </div>
        <div className="admin-login-card__body">
          {error && <div className="admin-alert admin-alert--danger">{error}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            autoComplete="email"
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button className="admin-login-card__submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Log in"}
          </button>
          <div className="admin-login-card__hint">
            Use an account with the <b>Admin</b> role.
          </div>
        </div>
      </form>
    </div>
  );
}

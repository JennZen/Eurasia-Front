import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAdminAuth } from "../AdminAuthContext";
import "../../styles/admin.css";

export default function AdminLogin() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/admin" replace />;

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    try {
      login(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
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
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button className="admin-login-card__submit" type="submit">
            Log in
          </button>
          <div className="admin-login-card__hint">
            Demo: any username and a password ≥ 3 characters.
          </div>
        </div>
      </form>
    </div>
  );
}

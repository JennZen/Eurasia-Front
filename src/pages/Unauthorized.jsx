import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/ErrorPage.css";

export default function Unauthorized() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const next = encodeURIComponent(pathname + search);

  return (
    <section className="error-page">
      <div className="error-card">
        <h1 className="error-code">401</h1>
        <h2 className="error-title">Unauthorized</h2>
        <p className="error-text">
          You need to sign in to view this page. If you're already signed in,
          your session may have expired or you don't have permission to access
          this resource.
        </p>
        <div className="error-actions">
          <Link
            to={`/admin/login?next=${next}`}
            className="error-btn error-btn--primary"
          >
            Sign in
          </Link>
          <button
            type="button"
            className="error-btn error-btn--ghost"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
          <Link to="/" className="error-btn error-btn--ghost">
            Home
          </Link>
        </div>
        <div className="error-meta">
          Blocked path: <code>{pathname}</code>
        </div>
      </div>
    </section>
  );
}

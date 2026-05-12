import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/ErrorPage.css";

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <section className="error-page">
      <div className="error-card">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page not found</h2>
        <p className="error-text">
          The route you tried to reach doesn't exist on Eurasia. It may have
          been moved, renamed, or never existed at all.
        </p>
        <div className="error-actions">
          <Link to="/" className="error-btn error-btn--primary">
            ← Back to home
          </Link>
          <button
            type="button"
            className="error-btn error-btn--ghost"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
          <Link to="/countries" className="error-btn error-btn--ghost">
            Browse countries
          </Link>
        </div>
        <div className="error-meta">
          Requested path: <code>{pathname}</code>
        </div>
      </div>
    </section>
  );
}

import { NavLink, Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";
import { APPS, SCHEMAS } from "./schemas";
import "../styles/admin.css";

function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (segments[0] !== "admin") return null;

  const crumbs = [{ label: "Home", to: "/admin" }];
  if (segments.length >= 2) {
    const modelKey = segments[1];
    const schema = SCHEMAS[modelKey];
    if (schema) {
      crumbs.push({ label: schema.app, to: "/admin" });
      crumbs.push({
        label: schema.label,
        to: `/admin/${modelKey}`,
      });
      if (segments[2] === "add") crumbs.push({ label: "Add", to: null });
      else if (segments[2]) crumbs.push({ label: `Change #${segments[2]}`, to: null });
    }
  }

  return (
    <div className="admin-breadcrumbs">
      {crumbs.map((c, i) => (
        <span key={i}>
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          {i < crumbs.length - 1 && <span className="sep">›</span>}
        </span>
      ))}
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-root">
      <header className="admin-header">
        <Link to="/admin" className="admin-header__brand">
          <span className="admin-header__brand-mark">⚙</span>
          Eurasia Administration
        </Link>
        <div className="admin-header__user">
          <span>
            Welcome, <span className="admin-header__user-name">{user.displayName}</span>.
          </span>
          <Link to="/" target="_blank" rel="noreferrer">View site</Link>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); logout(); }}
          >
            Log out
          </a>
        </div>
      </header>

      <Breadcrumbs />

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__group">
            <div className="admin-sidebar__title">Site</div>
            <NavLink end to="/admin" className={({ isActive }) =>
              `admin-sidebar__link${isActive ? " is-active" : ""}`}>
              <span className="admin-sidebar__icon">🏠</span> Dashboard
            </NavLink>
          </div>

          {APPS.map((app) => (
            <div className="admin-sidebar__group" key={app.name}>
              <div className="admin-sidebar__title">{app.name}</div>
              {app.models.map((m) => {
                const s = SCHEMAS[m];
                return (
                  <NavLink
                    key={m}
                    to={`/admin/${m}`}
                    className={({ isActive }) =>
                      `admin-sidebar__link${isActive ? " is-active" : ""}`
                    }
                  >
                    <span className="admin-sidebar__icon">{s.icon}</span>
                    {s.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

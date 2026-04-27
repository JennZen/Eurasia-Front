import { Link } from "react-router-dom";
import { useMemo } from "react";
import { APPS, SCHEMAS } from "../schemas";
import { STORE, getActionLog } from "../adminStore";

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
  const stats = useMemo(() => ({
    countries: STORE.countries.get().length,
    attractions: STORE.attractions.get().length,
    news: STORE.news.get().length,
    users: STORE.users.get().length,
  }), []);

  const log = useMemo(() => getActionLog(), []);

  return (
    <>
      <div className="admin-page-head">
        <h1>Site administration</h1>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__label">Countries</div>
          <div className="admin-stat__value">{stats.countries}</div>
          <div className="admin-stat__hint">Records in the geography app</div>
        </div>
        <div className="admin-stat admin-stat--success">
          <div className="admin-stat__label">Attractions</div>
          <div className="admin-stat__value">{stats.attractions}</div>
          <div className="admin-stat__hint">Across all countries</div>
        </div>
        <div className="admin-stat admin-stat--warning">
          <div className="admin-stat__label">News items</div>
          <div className="admin-stat__value">{stats.news}</div>
          <div className="admin-stat__hint">Published &amp; drafts</div>
        </div>
        <div className="admin-stat admin-stat--danger">
          <div className="admin-stat__label">Users</div>
          <div className="admin-stat__value">{stats.users}</div>
          <div className="admin-stat__hint">Staff and standard accounts</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 24 }}>
        <div>
          {APPS.map((app) => (
            <div className="admin-card" key={app.name}>
              <div className="admin-card__head">
                <span>{app.icon} &nbsp; {app.name}</span>
              </div>
              <div className="admin-card__body admin-card__body--flush">
                <table className="admin-applist">
                  <thead>
                    <tr>
                      <th style={{ width: "60%" }}>Model</th>
                      <th style={{ width: "20%" }}>Records</th>
                      <th style={{ width: "20%", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {app.models.map((m) => {
                      const s = SCHEMAS[m];
                      const count = STORE[m].get().length;
                      return (
                        <tr key={m}>
                          <td className="admin-applist__model">
                            <Link to={`/admin/${m}`}>{s.label}</Link>
                          </td>
                          <td>{count}</td>
                          <td className="admin-applist__actions">
                            <Link className="admin-applist__action-link" to={`/admin/${m}/add`}>+ Add</Link>
                            <Link className="admin-applist__action-link" to={`/admin/${m}`}>Change</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="admin-card">
            <div className="admin-card__head">Recent actions</div>
            {log.length === 0 ? (
              <div className="admin-empty">No actions yet — your changes will appear here.</div>
            ) : (
              <ul className="admin-recent">
                {log.map((entry, i) => (
                  <li key={i}>
                    <span className={`admin-recent__icon admin-recent__icon--${entry.type}`}>
                      {entry.type === "add" ? "+" : entry.type === "edit" ? "✎" : "✕"}
                    </span>
                    <span>
                      <strong style={{ textTransform: "capitalize" }}>{entry.type}</strong>{" "}
                      {SCHEMAS[entry.model]?.labelOne ?? entry.model}
                      {entry.label ? <>: <em>{entry.label}</em></> : null}
                    </span>
                    <span className="admin-recent__time">{timeAgo(entry.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SCHEMAS } from "../schemas";
import { STORE, logAction } from "../adminStore";

const PAGE_SIZE = 12;

function CellRenderer({ col, row }) {
  const v = row[col.key];
  if (col.type === "image") {
    if (!v) return <span style={{ color: "#bbb" }}>—</span>;
    const src = typeof v === "string" && v.startsWith("//") ? `https:${v}` : v;
    return <img className={col.key === "flag" ? "admin-table__flag" : "admin-table__thumb"} src={src} alt="" />;
  }
  if (col.type === "badge") {
    return v ? <span className="admin-badge">{String(v)}</span> : <span style={{ color: "#bbb" }}>—</span>;
  }
  if (col.type === "bool") {
    return v
      ? <span className="admin-badge admin-badge--success">Yes</span>
      : <span className="admin-badge admin-badge--muted">No</span>;
  }
  if (v === undefined || v === null || v === "") return <span style={{ color: "#bbb" }}>—</span>;
  const s = String(v);
  return s.length > 80 ? s.slice(0, 80) + "…" : s;
}

export default function AdminList() {
  const { model } = useParams();
  const schema = SCHEMAS[model];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState(() => (schema ? STORE[model].get() : []));
  const [selected, setSelected] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [flash, setFlash] = useState(searchParams.get("flash") || "");

  useEffect(() => {
    if (!schema) return;
    setRows(STORE[model].get());
    setSelected(new Set());
  }, [model, schema]);

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => {
        setFlash("");
        searchParams.delete("flash");
        setSearchParams(searchParams, { replace: true });
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [flash]);

  if (!schema) return <div className="admin-alert admin-alert--danger">Unknown model: {model}</div>;

  const q = (searchParams.get("q") || "").toLowerCase();
  const filterValues = {};
  schema.filters.forEach((f) => {
    const v = searchParams.get(`f_${f.key}`);
    if (v) filterValues[f.key] = v;
  });
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q) {
        const hit = schema.searchFields.some((f) =>
          String(r[f] ?? "").toLowerCase().includes(q)
        );
        if (!hit) return false;
      }
      for (const [k, v] of Object.entries(filterValues)) {
        if (String(r[k] ?? "") !== v) return false;
      }
      return true;
    });
  }, [rows, q, JSON.stringify(filterValues)]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace: true });
  };

  const onSearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.q.value.trim();
    updateParams({ q: value || null, page: null });
  };

  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(slice.map((r) => r.id)));
    else setSelected(new Set());
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const runBulk = () => {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === "delete") {
      if (!window.confirm(`Delete ${selected.size} ${schema.label.toLowerCase()}? This cannot be undone.`)) return;
      const remaining = rows.filter((r) => !selected.has(r.id));
      STORE[model].set(remaining);
      setRows(remaining);
      logAction({ type: "del", model, label: `${selected.size} item(s)` });
      setFlash(`Deleted ${selected.size} ${schema.label.toLowerCase()}.`);
      setSelected(new Set());
      setBulkAction("");
    }
  };

  const headerLabel = (s) => `Select ${s.label.toLowerCase()} to change`;

  return (
    <>
      <div className="admin-page-head">
        <h1>{headerLabel(schema)}</h1>
        <div className="actions">
          <Link to={`/admin/${model}/add`} className="admin-btn admin-btn--success">
            + Add {schema.labelOne.toLowerCase()}
          </Link>
        </div>
      </div>

      {flash && <div className="admin-alert admin-alert--success">{flash}</div>}

      <form className="admin-toolbar" onSubmit={onSearch}>
        <div className="admin-search">
          <input
            name="q"
            type="search"
            placeholder={`Search ${schema.searchFields.join(", ")}…`}
            defaultValue={q}
          />
          <button type="submit">Search</button>
        </div>
        {schema.filters.map((f) => (
          <div className="admin-filter" key={f.key}>
            <span>By {f.label}:</span>
            <select
              value={searchParams.get(`f_${f.key}`) || ""}
              onChange={(e) => updateParams({ [`f_${f.key}`]: e.target.value || null, page: null })}
            >
              <option value="">All</option>
              {f.options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
        {(q || Object.keys(filterValues).length > 0) && (
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => setSearchParams({}, { replace: true })}
          >
            Clear
          </button>
        )}
      </form>

      <div className="admin-table-wrap">
        {selected.size > 0 && (
          <div className="admin-bulk-bar">
            <strong>{selected.size}</strong> selected.
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">Action…</option>
              <option value="delete">Delete selected {schema.label.toLowerCase()}</option>
            </select>
            <button type="button" className="admin-btn admin-btn--sm" onClick={runBulk} disabled={!bulkAction}>
              Go
            </button>
          </div>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__check">
                <input
                  type="checkbox"
                  checked={slice.length > 0 && slice.every((r) => selected.has(r.id))}
                  onChange={(e) => toggleAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              {schema.listColumns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={schema.listColumns.length + 1} className="admin-empty">
                  No {schema.label.toLowerCase()} found.
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr key={row.id}>
                  <td className="admin-table__check">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                    />
                  </td>
                  {schema.listColumns.map((c, idx) => (
                    <td key={c.key}>
                      {idx === 0 || c.primary ? (
                        <Link
                          to={`/admin/${model}/${row.id}`}
                          className="admin-table__cell-link"
                        >
                          <CellRenderer col={c} row={row} />
                        </Link>
                      ) : (
                        <CellRenderer col={c} row={row} />
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="admin-pagination">
          <span>
            {filtered.length} {schema.label.toLowerCase()} •
            page {safePage} of {totalPages}
          </span>
          <div className="admin-pagination__pages">
            <button onClick={() => updateParams({ page: 1 })} disabled={safePage === 1}>«</button>
            <button onClick={() => updateParams({ page: String(safePage - 1) })} disabled={safePage === 1}>‹</button>
            {Array.from({ length: totalPages }).slice(
              Math.max(0, safePage - 3),
              Math.max(0, safePage - 3) + 5
            ).map((_, i) => {
              const p = Math.max(0, safePage - 3) + i + 1;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  className={p === safePage ? "is-active" : ""}
                  onClick={() => updateParams({ page: String(p) })}
                >
                  {p}
                </button>
              );
            })}
            <button onClick={() => updateParams({ page: String(safePage + 1) })} disabled={safePage === totalPages}>›</button>
            <button onClick={() => updateParams({ page: String(totalPages) })} disabled={safePage === totalPages}>»</button>
          </div>
        </div>
      </div>
    </>
  );
}

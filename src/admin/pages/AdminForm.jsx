import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { SCHEMAS } from "../schemas";
import { STORE, nextId, logAction } from "../adminStore";

function emptyValue(field) {
  if (field.type === "checkbox") return false;
  if (field.type === "multiselect" || field.type === "tags-input") return [];
  if (field.type === "number") return "";
  return "";
}

function buildInitial(schema) {
  const obj = {};
  schema.fields.forEach((f) => { obj[f.key] = emptyValue(f); });
  return obj;
}

function coerceIncoming(field, raw) {
  if (raw == null) return emptyValue(field);
  if (field.type === "multiselect" || field.type === "tags-input") {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }
  return raw;
}

function applyAliases(schema, source) {
  const out = { ...source };
  schema.fields.forEach((f) => {
    if (out[f.key] !== undefined && out[f.key] !== null && out[f.key] !== "") return;
    if (!f.aliases) return;
    for (const alias of f.aliases) {
      const v = source[alias];
      if (v !== undefined && v !== null && v !== "") {
        out[f.key] = v;
        break;
      }
    }
  });
  return out;
}

export default function AdminForm() {
  const { model, id } = useParams();
  const schema = SCHEMAS[model];
  const navigate = useNavigate();
  const isAdd = id === "add";

  const [rows, setRows] = useState(() => (schema ? STORE[model].get() : []));
  const existing = useMemo(() => {
    if (isAdd || !schema) return null;
    return rows.find((r) => String(r.id) === String(id)) ?? null;
  }, [rows, id, isAdd, schema]);

  const [values, setValues] = useState(() => (schema ? buildInitial(schema) : {}));
  const [errors, setErrors] = useState({});
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!schema) return;
    if (isAdd) {
      setValues(buildInitial(schema));
      return;
    }
    if (existing) {
      const aliased = applyAliases(schema, existing);
      const initial = buildInitial(schema);
      schema.fields.forEach((f) => {
        if (aliased[f.key] !== undefined && aliased[f.key] !== null) {
          initial[f.key] = coerceIncoming(f, aliased[f.key]);
        }
      });
      setValues({ ...existing, ...initial });
    }
  }, [model, id, schema, existing, isAdd]);

  if (!schema) return <div className="admin-alert admin-alert--danger">Unknown model: {model}</div>;
  if (!isAdd && !existing) {
    return (
      <>
        <div className="admin-page-head"><h1>Not found</h1></div>
        <div className="admin-alert admin-alert--danger">
          {schema.labelOne} #{id} doesn't exist. <Link to={`/admin/${model}`}>Back to list</Link>.
        </div>
      </>
    );
  }

  const groups = schema.fields.reduce((acc, f) => {
    const g = f.group || "Details";
    (acc[g] = acc[g] || []).push(f);
    return acc;
  }, {});

  const setField = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
  };

  const validate = () => {
    const errs = {};
    schema.fields.forEach((f) => {
      const v = values[f.key];
      const isList = f.type === "multiselect" || f.type === "tags-input";
      if (f.required) {
        if (isList) {
          if (!Array.isArray(v) || v.length === 0) errs[f.key] = "Pick at least one option.";
        } else if (v === "" || v == null) {
          errs[f.key] = "This field is required.";
        }
      }
      if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        errs[f.key] = "Enter a valid email address.";
      }
      if (f.type === "number" && v !== "" && v != null && isNaN(Number(v))) {
        errs[f.key] = "Enter a number.";
      }
      if (f.type === "number" && v !== "" && v != null) {
        const n = Number(v);
        const min = typeof f.min === "number" ? f.min : 0;
        if (n < min) errs[f.key] = `Must be ${min} or greater.`;
        if (typeof f.max === "number" && n > f.max) errs[f.key] = `Must be ${f.max} or less.`;
      }
      if (f.type === "url" && v && !/^https?:\/\/|^\/\//i.test(String(v))) {
        errs[f.key] = "URL must start with http://, https:// or //.";
      }
      if (typeof f.maxLength === "number" && typeof v === "string" && v.length > f.maxLength) {
        errs[f.key] = `Must be ${f.maxLength} characters or fewer.`;
      }
      if ((f.type === "date" || f.type === "datetime-local") && v) {
        if (Number.isNaN(Date.parse(v))) errs[f.key] = "Enter a valid date.";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const persistAndGo = (extraNav) => {
    if (!validate()) {
      setFlash("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const current = STORE[model].get();
    const cleaned = { ...values };
    schema.fields.forEach((f) => {
      if (f.type === "number") {
        cleaned[f.key] = cleaned[f.key] === "" || cleaned[f.key] == null ? null : Number(cleaned[f.key]);
      }
      if (f.type === "multiselect" || f.type === "tags-input") {
        const list = Array.isArray(cleaned[f.key]) ? cleaned[f.key] : [];
        cleaned[f.key] = list.map((s) => String(s).trim()).filter(Boolean);
      }
      if (f.type === "text" || f.type === "url" || f.type === "email" || f.type === "textarea") {
        if (typeof cleaned[f.key] === "string") cleaned[f.key] = cleaned[f.key].trim();
      }
    });
    let nextRows;
    let savedId;
    let label =
      cleaned.name || cleaned.title || cleaned.username || cleaned.label || `#${cleaned.id ?? "?"}`;

    if (isAdd) {
      savedId = nextId(current);
      nextRows = [...current, { ...cleaned, id: savedId }];
      logAction({ type: "add", model, label });
    } else {
      savedId = existing.id;
      nextRows = current.map((r) => (r.id === existing.id ? { ...cleaned, id: existing.id } : r));
      logAction({ type: "edit", model, label });
    }
    STORE[model].set(nextRows);
    setRows(nextRows);

    if (extraNav === "another") {
      navigate(`/admin/${model}/add?flash=${encodeURIComponent(`The ${schema.labelOne.toLowerCase()} "${label}" was ${isAdd ? "added" : "changed"} successfully. You may add another below.`)}`);
    } else if (extraNav === "continue") {
      setFlash(`The ${schema.labelOne.toLowerCase()} "${label}" was changed successfully. You may edit it again below.`);
      if (isAdd) navigate(`/admin/${model}/${savedId}`, { replace: true });
    } else {
      navigate(`/admin/${model}?flash=${encodeURIComponent(`The ${schema.labelOne.toLowerCase()} "${label}" was ${isAdd ? "added" : "changed"} successfully.`)}`);
    }
  };

  const onDelete = () => {
    if (!existing) return;
    const label = existing.name || existing.title || existing.username || `#${existing.id}`;
    if (!window.confirm(`Are you sure you want to delete this ${schema.labelOne.toLowerCase()}: "${label}"? This cannot be undone.`)) return;
    const remaining = STORE[model].get().filter((r) => r.id !== existing.id);
    STORE[model].set(remaining);
    logAction({ type: "del", model, label });
    navigate(`/admin/${model}?flash=${encodeURIComponent(`The ${schema.labelOne.toLowerCase()} "${label}" was deleted.`)}`);
  };

  const renderControl = (f) => {
    const val = values[f.key] ?? "";
    const common = {
      id: `f-${f.key}`,
      name: f.key,
      value: f.type === "checkbox" ? undefined : val,
      onChange: (e) => {
        if (f.type === "checkbox") setField(f.key, e.target.checked);
        else setField(f.key, e.target.value);
      },
    };
    if (f.type === "textarea") {
      const taExtra = typeof f.maxLength === "number" ? { maxLength: f.maxLength } : {};
      return <textarea rows={5} {...taExtra} {...common} />;
    }
    if (f.type === "select") {
      return (
        <select {...common}>
          <option value="">— Select —</option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (f.type === "multiselect") {
      const selected = Array.isArray(values[f.key]) ? values[f.key] : [];
      const toggle = (opt) => {
        const next = selected.includes(opt)
          ? selected.filter((s) => s !== opt)
          : [...selected, opt];
        setField(f.key, next);
      };
      return (
        <div className="admin-multiselect">
          <div className="admin-multiselect__options">
            {f.options.map((o) => (
              <label key={o} className={`admin-chip${selected.includes(o) ? " is-active" : ""}`}>
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={() => toggle(o)}
                />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    if (f.type === "tags-input") {
      const tags = Array.isArray(values[f.key]) ? values[f.key] : [];
      const addTag = (raw) => {
        const t = String(raw || "").trim().replace(/^,|,$/g, "").trim();
        if (!t) return;
        if (tags.includes(t)) return;
        setField(f.key, [...tags, t]);
      };
      const removeTag = (t) => setField(f.key, tags.filter((x) => x !== t));
      return (
        <div className="admin-tags-input">
          <div className="admin-tags-input__list">
            {tags.map((t) => (
              <span key={t} className="admin-chip is-active">
                {t}
                <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(t)}>×</button>
              </span>
            ))}
          </div>
          <input
            id={common.id}
            type="text"
            placeholder="Type and press Enter…"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = "";
              } else if (e.key === "Backspace" && !e.currentTarget.value && tags.length > 0) {
                removeTag(tags[tags.length - 1]);
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget.value.trim()) {
                addTag(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      );
    }
    if (f.type === "checkbox") {
      return (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 400 }}>
          <input
            id={common.id}
            type="checkbox"
            checked={!!values[f.key]}
            onChange={(e) => setField(f.key, e.target.checked)}
          />
          <span style={{ fontSize: 13 }}>Yes</span>
        </label>
      );
    }
    const typeMap = {
      number: "number",
      email: "email",
      url: "url",
      date: "date",
      "datetime-local": "datetime-local",
    };
    const inputType = typeMap[f.type] || "text";
    const extra = {};
    if (f.type === "number") {
      if (typeof f.min === "number") extra.min = f.min;
      if (typeof f.max === "number") extra.max = f.max;
      if (typeof f.step === "number") extra.step = f.step;
    }
    if (typeof f.maxLength === "number" && (inputType === "text" || inputType === "email" || inputType === "url")) {
      extra.maxLength = f.maxLength;
    }
    return <input type={inputType} {...extra} {...common} />;
  };

  const heading = isAdd
    ? `Add ${schema.labelOne.toLowerCase()}`
    : `Change ${schema.labelOne.toLowerCase()}`;

  return (
    <>
      <div className="admin-page-head">
        <h1>{heading}</h1>
        <div className="actions">
          <Link to={`/admin/${model}`} className="admin-btn admin-btn--ghost">
            ← Back to list
          </Link>
        </div>
      </div>

      {flash && <div className="admin-alert admin-alert--success">{flash}</div>}
      {Object.keys(errors).length > 0 && (
        <div className="admin-alert admin-alert--danger">
          Please correct the errors below.
        </div>
      )}

      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          persistAndGo("save");
        }}
      >
        {Object.entries(groups).map(([groupName, fields]) => (
          <fieldset className="admin-fieldset" key={groupName}>
            <div className="admin-fieldset__title">{groupName}</div>
            {fields.map((f) => (
              <div className="admin-field" key={f.key}>
                <label htmlFor={`f-${f.key}`}>
                  {f.label}
                  {f.required && <span className="req">*</span>}
                </label>
                <div className="admin-field__control">
                  {renderControl(f)}
                  {f.hint && <div className="admin-field__hint">{f.hint}</div>}
                  {errors[f.key] && <div className="admin-field__error">{errors[f.key]}</div>}
                </div>
              </div>
            ))}
          </fieldset>
        ))}

        <div className="admin-form__footer">
          {!isAdd && (
            <button type="button" className="admin-btn admin-btn--danger left" onClick={onDelete}>
              Delete
            </button>
          )}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => persistAndGo("another")}>
            Save and add another
          </button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => persistAndGo("continue")}>
            Save and continue editing
          </button>
          <button type="submit" className="admin-btn admin-btn--success">
            Save
          </button>
        </div>
      </form>
    </>
  );
}

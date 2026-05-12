const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "admin_token_v1";

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
}

async function request(path, init = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`API ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("API unreachable — got non-JSON response (is the backend running?).");
  }
  return res.json();
}

export const adminApi = {
  getDashboardStats: () => request("/admin/stats"),
};

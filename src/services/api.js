const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "auth_token_v1";
const USER_KEY = "auth_user_v1";

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {}
  },
};

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const toCamel = (key) => {
  if (!key) return key;
  // Detect runs of capitals (e.g. "BGUrl", "ID") and convert sensibly
  if (/^[A-Z0-9]+$/.test(key)) return key.toLowerCase();
  return key.charAt(0).toLowerCase() + key.slice(1);
};

const camelizeKeys = (value) => {
  if (Array.isArray(value)) return value.map(camelizeKeys);
  if (value && typeof value === "object" && value.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[toCamel(k)] = camelizeKeys(v);
    }
    return out;
  }
  return value;
};

const AUTH_FAILED_EVENT = "auth:invalid-token";

export function handleInvalidToken(reason = "Session expired. Please sign in again.") {
  tokenStore.set(null);
  tokenStore.setUser(null);
  try {
    window.dispatchEvent(new CustomEvent(AUTH_FAILED_EVENT, { detail: { reason } }));
  } catch {}
}

async function request(path, init = {}) {
  const token = tokenStore.get();
  const headers = { ...(init.headers || {}) };
  if (init.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch (e) {
    throw new ApiError(`Network error: ${e.message}`, 0, null);
  }

  // 401 = bearer token missing/invalid/expired. Treat as forced logout for any
  // request EXCEPT the login/register endpoints (where 401 just means bad creds).
  const isAuthEndpoint = path.startsWith("/api/auth/");
  if (res.status === 401 && !isAuthEndpoint) {
    handleInvalidToken();
    throw new ApiError("Your session has expired. Please sign in again.", 401, null);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const rawPayload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");
  const payload = isJson ? camelizeKeys(rawPayload) : rawPayload;

  if (!res.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        (payload.message || payload.title)) ||
      (typeof payload === "string" && payload) ||
      `API ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload;
}

export { AUTH_FAILED_EVENT };

const qs = (params) => {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((x) => search.append(k, x));
    else search.append(k, v);
  });
  const s = search.toString();
  return s ? `?${s}` : "";
};

export const authApi = {
  token: "",
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, token: authApi.token }),
    }),

  register: (name, email, password) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, token: authApi.token }),
    }),
};

export const countriesApi = {
  getAll: (continentIds) => request(`/api/countries${qs({ continentIds })}`),
  getList: () => request("/api/countries/list"),
  getById: (id) => request(`/api/countries/${id}`),
  create: (dto) =>
    request("/api/countries", { method: "POST", body: JSON.stringify(dto) }),
  update: (id, dto) =>
    request(`/api/countries/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  remove: (id) => request(`/api/countries/${id}`, { method: "DELETE" }),
};

export const attractionsApi = {
  getAll: () => request("/api/attractions"),
  getCards: () => request("/api/attractions/cards"),
  getById: (id) => request(`/api/attractions/${id}`),
  create: (dto) =>
    request("/api/attractions", { method: "POST", body: JSON.stringify(dto) }),
  update: (id, dto) =>
    request(`/api/attractions/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  remove: (id) => request(`/api/attractions/${id}`, { method: "DELETE" }),
};

export const newsApi = {
  getAll: () => request("/api/news"),
  getById: (id) => request(`/api/news/${id}`),
  create: (dto) =>
    request("/api/news", { method: "POST", body: JSON.stringify(dto) }),
  update: (id, dto) =>
    request(`/api/news/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  remove: (id) => request(`/api/news/${id}`, { method: "DELETE" }),
};

export const bannersApi = {
  getAll: (count = 4) => request(`/api/banners${qs({ count })}`),
  getById: (id) => request(`/api/banners/${id}`),
};

export const usersApi = {
  getAll: () => request("/api/users"),
  getById: (id) => request(`/api/users/${id}`),
  update: (id, dto) =>
    request(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  remove: (id) => request(`/api/users/${id}`, { method: "DELETE" }),
  getFavoriteCountries: (id) => request(`/api/users/${id}/favorites/countries`),
  addFavoriteCountry: (id, countryId) =>
    request(`/api/users/${id}/favorites/countries/${countryId}`, {
      method: "POST",
    }),
  removeFavoriteCountry: (id, countryId) =>
    request(`/api/users/${id}/favorites/countries/${countryId}`, {
      method: "DELETE",
    }),
  getFavoriteAttractions: (id) =>
    request(`/api/users/${id}/favorites/attractions`),
  addFavoriteAttraction: (id, attractionId) =>
    request(`/api/users/${id}/favorites/attractions/${attractionId}`, {
      method: "POST",
    }),
  removeFavoriteAttraction: (id, attractionId) =>
    request(`/api/users/${id}/favorites/attractions/${attractionId}`, {
      method: "DELETE",
    }),
};

export const quizApi = {
  getUserBestRecord: (userId) => request(`/api/quiz/record/${userId}`),
  updateResult: (dto) =>
    request("/api/quiz/result", { method: "PUT", body: JSON.stringify(dto) }),
};

export const adminApi = {
  getDashboardStats: () => request("/api/admin/stats"),
  getRecentActions: (take = 10) => request(`/api/admin/recent${qs({ take })}`),
};

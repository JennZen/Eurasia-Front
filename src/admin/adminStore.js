import { allCountries } from "../data/allCountries";
import { attractions as attractionsData } from "../data/attractions";

const NEWS_KEY = "admin_news_v1";
const COUNTRIES_KEY = "admin_countries_v1";
const ATTRACTIONS_KEY = "admin_attractions_v1";
const USERS_KEY = "admin_users_v1";
const LOG_KEY = "admin_actionlog_v1";

const seedNews = [
  { id: 1, title: "New direct flights connect Europe and Central Asia", description: "New routes link European cities with Central Asia destinations.", imageUrl: "", publishedAt: "2026-05-10T09:00:00" },
  { id: 2, title: "Japan sees record tourism numbers in early 2026",   description: "Cherry blossom season draws millions of travellers.",            imageUrl: "", publishedAt: "2026-05-08T12:00:00" },
  { id: 3, title: "European trains add more cross-border night routes", description: "Night-train networks expand across Europe.",                     imageUrl: "", publishedAt: "2026-05-01T08:00:00" },
];

const seedUsers = [
  { id: 1, name: "admin", email: "admin@eurasia.local", role: "Admin",  avatarUrl: "", phone: "", token: "" },
  { id: 2, name: "anna",  email: "anna@example.com",    role: "Editor", avatarUrl: "", phone: "", token: "" },
  { id: 3, name: "mike",  email: "mike@example.com",    role: "User",   avatarUrl: "", phone: "", token: "" },
  { id: 4, name: "olga",  email: "olga@example.com",    role: "Editor", avatarUrl: "", phone: "", token: "" },
];

function loadOrSeed(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(key, JSON.stringify(seed));
  return JSON.parse(JSON.stringify(seed));
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureIds(items) {
  return items.map((it, idx) => ({ id: it.id ?? idx + 1, ...it }));
}

const seedCountries = ensureIds(allCountries.map((c, i) => ({ id: i + 1, ...c })));
const seedAttractions = ensureIds(attractionsData);

export function getCountries() { return loadOrSeed(COUNTRIES_KEY, seedCountries); }
export function saveCountries(rows) { save(COUNTRIES_KEY, rows); }

export function getAttractions() { return loadOrSeed(ATTRACTIONS_KEY, seedAttractions); }
export function saveAttractions(rows) { save(ATTRACTIONS_KEY, rows); }

export function getNews() { return loadOrSeed(NEWS_KEY, seedNews); }
export function saveNews(rows) { save(NEWS_KEY, rows); }

export function getUsers() { return loadOrSeed(USERS_KEY, seedUsers); }
export function saveUsers(rows) { save(USERS_KEY, rows); }

export function getActionLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function logAction(entry) {
  const log = getActionLog();
  log.unshift({ ...entry, at: new Date().toISOString() });
  save(LOG_KEY, log.slice(0, 25));
}

export function nextId(rows) {
  return rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
}

export const STORE = {
  countries:   { get: getCountries,   set: saveCountries,   label: "Countries",   labelOne: "Country" },
  attractions: { get: getAttractions, set: saveAttractions, label: "Attractions", labelOne: "Attraction" },
  news:        { get: getNews,        set: saveNews,        label: "News",        labelOne: "News item" },
  users:       { get: getUsers,       set: saveUsers,       label: "Users",       labelOne: "User" },
};

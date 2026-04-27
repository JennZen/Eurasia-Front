import { allCountries } from "../data/allCountries";
import { attractions as attractionsData } from "../data/attractions";

const NEWS_KEY = "admin_news_v1";
const COUNTRIES_KEY = "admin_countries_v1";
const ATTRACTIONS_KEY = "admin_attractions_v1";
const USERS_KEY = "admin_users_v1";
const LOG_KEY = "admin_actionlog_v1";

const seedNews = [
  { id: 1, title: "New direct flights connect Europe and Central Asia", tag: "Travel", time: "2 hrs ago", description: "New routes link European cities with Central Asia destinations." },
  { id: 2, title: "Japan sees record tourism numbers in early 2026", tag: "Tourism", time: "5 hrs ago", description: "Cherry blossom season draws millions of travellers." },
  { id: 3, title: "European trains add more cross-border night routes", tag: "Transport", time: "1 day ago", description: "Night-train networks expand across Europe." },
];

const seedUsers = [
  { id: 1, username: "admin", email: "admin@eurasia.local", role: "Administrator", isStaff: true, isActive: true, joined: "2026-01-12" },
  { id: 2, username: "anna",  email: "anna@example.com",     role: "Editor",        isStaff: true, isActive: true, joined: "2026-02-04" },
  { id: 3, username: "mike",  email: "mike@example.com",     role: "Viewer",        isStaff: false, isActive: true, joined: "2026-03-15" },
  { id: 4, username: "olga",  email: "olga@example.com",     role: "Editor",        isStaff: true, isActive: false, joined: "2026-03-21" },
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

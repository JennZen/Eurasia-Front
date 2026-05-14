import {
  countriesApi,
  attractionsApi,
  newsApi,
  usersApi,
} from "../services/api";

const countryToReadForm = (c) => ({
  id: c.id,
  name: c.name,
  formalName: c.formalName,
  capital: c.capital,
  continents: c.continents || [],
  regions: c.regions || [],
  population: c.population,
  geographicalSize: c.geographicalSize,
  currency: c.currency,
  languages: c.languages || [],
  flagUrl: c.flagUrl,
  summary: c.summary || "",
});

const countryToCreateDto = (form) => ({
  name: form.name,
  formalName: form.formalName || null,
  capital: form.capital,
  continents: Array.isArray(form.continents) ? form.continents : [],
  regions: Array.isArray(form.regions) ? form.regions : [],
  population: Number(form.population) || 0,
  geographicalSize: Number(form.geographicalSize) || 0,
  currency: form.currency || null,
  languages: Array.isArray(form.languages) ? form.languages : [],
  flagUrl: form.flagUrl || null,
  summary: form.summary || null,
});

const countryToUpdateDto = (form) => ({
  id: form.id,
  ...countryToCreateDto(form),
});

const attractionToReadForm = (a) => ({
  id: a.id,
  name: a.name,
  description: a.description,
  fullDescription: a.fullDescription,
  price: a.price,
  bGUrl: a.bGUrl,
  imageUrl: a.imageUrl,
  city: a.city,
  duration: a.duration,
  bestTimeToVisit: a.bestTimeToVisit,
  openingHours: a.openingHours,
  rating: a.rating,
  numberOfReviews: a.numberOfReviews,
  countryId: a.countryId,
  countryName: a.countryName,
});

const attractionToDto = (form) => ({
  id: form.id || 0,
  name: form.name,
  description: form.description,
  fullDescription: form.fullDescription || null,
  price: Number(form.price) || 0,
  bGUrl: form.bGUrl || null,
  imageUrl: form.imageUrl || null,
  city: form.city || null,
  duration: form.duration || null,
  bestTimeToVisit: form.bestTimeToVisit || null,
  openingHours: form.openingHours || null,
  rating: Number(form.rating) || 0,
  numberOfReviews: Number(form.numberOfReviews) || 0,
  countryId: Number(form.countryId) || 0,
  countryName: form.countryName || null,
});

const newsToReadForm = (n) => ({
  id: n.id,
  title: n.title,
  description: n.description,
  imageUrl: n.imageUrl,
  publishedAt: n.publishedAt,
});

const newsToDto = (form) => ({
  id: form.id || 0,
  title: form.title,
  description: form.description,
  imageUrl: form.imageUrl || "",
  publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
});

const userToReadForm = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  avatarUrl: u.avatarUrl,
  role: u.role,
  token: u.token,
});

const userToUpdateDto = (form) => ({
  name: form.name,
  phone: form.phone || null,
  avatarUrl: form.avatarUrl || null,
});

export const RESOURCES = {
  countries: {
    list: async () => (await countriesApi.getAll()).map(countryToReadForm),
    get: async (id) => countryToReadForm(await countriesApi.getById(id)),
    create: async (form) => countriesApi.create(countryToCreateDto(form)),
    update: async (id, form) => countriesApi.update(id, countryToUpdateDto({ ...form, id })),
    remove: async (id) => countriesApi.remove(id),
    bulkRemove: async (ids) => Promise.all(ids.map((id) => countriesApi.remove(id))),
  },
  attractions: {
    list: async () => (await attractionsApi.getAll()).map(attractionToReadForm),
    get: async (id) => attractionToReadForm(await attractionsApi.getById(id)),
    create: async (form) => attractionsApi.create(attractionToDto(form)),
    update: async (id, form) => attractionsApi.update(id, attractionToDto({ ...form, id })),
    remove: async (id) => attractionsApi.remove(id),
    bulkRemove: async (ids) => Promise.all(ids.map((id) => attractionsApi.remove(id))),
  },
  news: {
    list: async () => (await newsApi.getAll()).map(newsToReadForm),
    get: async (id) => newsToReadForm(await newsApi.getById(id)),
    create: async (form) => newsApi.create(newsToDto(form)),
    update: async (id, form) => newsApi.update(id, newsToDto({ ...form, id })),
    remove: async (id) => newsApi.remove(id),
    bulkRemove: async (ids) => Promise.all(ids.map((id) => newsApi.remove(id))),
  },
  users: {
    list: async () => (await usersApi.getAll()).map(userToReadForm),
    get: async (id) => userToReadForm(await usersApi.getById(id)),
    create: async () => {
      throw new Error("Creating users via admin is not supported. Use /api/auth/register.");
    },
    update: async (id, form) => usersApi.update(id, userToUpdateDto(form)),
    remove: async (id) => usersApi.remove(id),
    bulkRemove: async (ids) => Promise.all(ids.map((id) => usersApi.remove(id))),
  },
};

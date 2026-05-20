import { useState, useEffect, useCallback, useRef } from "react";
import { usersApi, countriesApi, attractionsApi } from "../services/api";
import { useAuth } from "../admin/AdminAuthContext";

// `options.countries` / `options.attractions` let the caller opt out of loading
// the other side. Default = both (back-compat). A page that only renders a
// country heart-button (e.g. /countries, /asia, /europe) should pass
// `{ countries: true, attractions: false }` to avoid two pointless requests:
// GET /api/users/{id}/favorites/attractions  and  GET /api/attractions.
export const useLikes = (options = {}) => {
  const loadCountries = options.countries !== false;
  const loadAttractions = options.attractions !== false;
  const [likes, setLikes] = useState([]); // attraction ids
  const [likedAttractionsData, setLikedAttractionsData] = useState([]); // full DTOs
  const [countryLikes, setCountryLikes] = useState([]); // country names (UI keys)
  const [countryIds, setCountryIds] = useState([]); // country ids (backend keys)
  const [likedCountriesData, setLikedCountriesData] = useState([]); // CountryLikedCardDto[]
  const [loaded, setLoaded] = useState(false);
  const nameToIdRef = useRef(new Map());
  const idToNameRef = useRef(new Map());

  // Subscribe to auth context so userId updates when the user logs in/out
  // within the same session (previously read once from tokenStore — stale).
  const { user: authUser } = useAuth();
  const userId = authUser?.id ?? null;

  // Build name<->id map from /api/countries/list (UI toggles by name).
  // Skip entirely when the caller doesn't need country likes.
  useEffect(() => {
    if (!loadCountries) return;
    let active = true;
    countriesApi
      .getList()
      .then((list) => {
        if (!active || !Array.isArray(list)) return;
        list.forEach((c) => {
          if (c && c.name && c.id != null) {
            nameToIdRef.current.set(c.name.toLowerCase(), c.id);
            idToNameRef.current.set(c.id, c.name);
          }
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [loadCountries]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLikes([]);
      setLikedAttractionsData([]);
      setCountryLikes([]);
      setCountryIds([]);
      setLikedCountriesData([]);
      setLoaded(true);
      return;
    }
    // Only fetch the favorites endpoints the caller actually uses — saves
    // /api/users/{id}/favorites/attractions (and /api/attractions below) on
    // pages that don't render attraction hearts.
    const [favCountries, favAttrIds] = await Promise.all([
      loadCountries ? usersApi.getFavoriteCountries(userId).catch(() => null) : Promise.resolve(null),
      loadAttractions ? usersApi.getFavoriteAttractions(userId).catch(() => null) : Promise.resolve(null),
    ]);

    if (loadCountries && Array.isArray(favCountries)) {
      favCountries.forEach((c) => {
        if (c && c.name && c.id != null) {
          nameToIdRef.current.set(c.name.toLowerCase(), c.id);
          idToNameRef.current.set(c.id, c.name);
        }
      });
      setLikedCountriesData(favCountries);
      setCountryLikes(favCountries.map((c) => c.name).filter(Boolean));
      setCountryIds(favCountries.map((c) => c.id).filter((x) => x != null));
    }

    if (loadAttractions && Array.isArray(favAttrIds)) {
      // The backend may return a list of ints OR a list of objects {id, ...}.
      // Normalize both shapes so `likes` is always a clean number[].
      const ids = favAttrIds
        .map((x) => {
          if (x == null) return null;
          if (typeof x === "number") return x;
          if (typeof x === "object" && x.id != null) return Number(x.id);
          const n = Number(x);
          return Number.isFinite(n) ? n : null;
        })
        .filter((x) => x != null);
      setLikes(ids);
      if (ids.length === 0) {
        setLikedAttractionsData([]);
      } else {
        try {
          const all = await attractionsApi.getAll();
          if (Array.isArray(all)) {
            const idSet = new Set(ids);
            setLikedAttractionsData(all.filter((a) => idSet.has(Number(a.id))));
          }
        } catch {
          setLikedAttractionsData([]);
        }
      }
    }
    setLoaded(true);
  }, [userId, loadCountries, loadAttractions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleLike = useCallback(
    async (attractionId) => {
      if (!userId) {
        alert("Please sign in to save favorite attractions.");
        return;
      }
      const id = Number(attractionId);
      if (!Number.isFinite(id) || id <= 0) {
        console.warn("toggleLike: invalid attraction id", attractionId);
        return;
      }
      // Re-sync from the server before deciding add vs remove — the local `likes`
      // array can lag behind (other tab, slow initial load) and lead to a 409.
      // Accept either a list of ints OR a list of objects with an `id` field so
      // the toggle stays correct regardless of the backend's response shape.
      let serverLikes = likes;
      try {
        const fresh = await usersApi.getFavoriteAttractions(userId);
        if (Array.isArray(fresh)) {
          serverLikes = fresh
            .map((x) => {
              if (x == null) return null;
              if (typeof x === "number") return x;
              if (typeof x === "object" && x.id != null) return Number(x.id);
              const n = Number(x);
              return Number.isFinite(n) ? n : null;
            })
            .filter((x) => x != null);
        }
      } catch {
        /* fall back to local state */
      }
      const has = serverLikes.includes(id);
      try {
        if (has) await usersApi.removeFavoriteAttraction(userId, id);
        else await usersApi.addFavoriteAttraction(userId, id);
        await refresh();
      } catch (err) {
        // 409 (already exists) / 404 (not found) just means our local view was stale —
        // pull the truth from the server instead of alerting the user.
        if (err && (err.status === 409 || err.status === 404)) {
          await refresh();
          return;
        }
        console.error("Favorite attraction sync failed:", err);
        alert(`Failed to ${has ? "remove" : "add"} favorite: ${err.message}`);
      }
    },
    [userId, likes, refresh]
  );

  const isLiked = useCallback(
    (attractionId) => likes.includes(Number(attractionId)),
    [likes]
  );

  const toggleCountryLike = useCallback(
    async (countryOrName) => {
      if (!userId) {
        alert("Please sign in to save favorite countries.");
        return;
      }
      if (!countryOrName) return;

      let id = null;
      let name = null;
      if (typeof countryOrName === "number") {
        id = countryOrName;
        name = idToNameRef.current.get(id) || null;
      } else if (typeof countryOrName === "object") {
        id = countryOrName.id != null ? Number(countryOrName.id) : null;
        name = countryOrName.name || null;
      } else {
        name = String(countryOrName);
        id = nameToIdRef.current.get(name.toLowerCase());
      }

      // Fallback: refetch list if we have a name but no id yet.
      if (id == null && name) {
        try {
          const list = await countriesApi.getList();
          if (Array.isArray(list)) {
            list.forEach((c) => {
              if (c && c.name && c.id != null) {
                nameToIdRef.current.set(c.name.toLowerCase(), c.id);
                idToNameRef.current.set(c.id, c.name);
              }
            });
            id = nameToIdRef.current.get(name.toLowerCase()) ?? null;
          }
        } catch {
          /* ignore */
        }
      }

      if (id == null) {
        console.warn(`Cannot toggle favorite: no id for country`, countryOrName);
        alert(`Cannot save favorite — country id not found for "${name || countryOrName}".`);
        return;
      }
      if (!name) name = idToNameRef.current.get(id) || `Country #${id}`;

      // Re-sync country favorites before deciding — same staleness concern as attractions.
      let serverIds = countryIds;
      try {
        const fresh = await usersApi.getFavoriteCountries(userId);
        if (Array.isArray(fresh)) {
          serverIds = fresh
            .map((c) => (c && c.id != null ? Number(c.id) : null))
            .filter((x) => x != null);
        }
      } catch {
        /* fall back to local state */
      }
      const has = serverIds.includes(id);
      try {
        if (has) await usersApi.removeFavoriteCountry(userId, id);
        else await usersApi.addFavoriteCountry(userId, id);
        await refresh();
      } catch (err) {
        if (err && (err.status === 409 || err.status === 404)) {
          await refresh();
          return;
        }
        console.error("Favorite country sync failed:", err);
        alert(`Failed to ${has ? "remove" : "add"} favorite: ${err.message}`);
      }
    },
    [userId, countryIds, refresh]
  );

  const isCountryLiked = useCallback(
    (countryOrName) => {
      if (countryOrName == null) return false;
      if (typeof countryOrName === "number") return countryIds.includes(countryOrName);
      if (typeof countryOrName === "object") {
        if (countryOrName.id != null && countryIds.includes(Number(countryOrName.id))) return true;
        if (countryOrName.name && countryLikes.includes(countryOrName.name)) return true;
        return false;
      }
      const name = String(countryOrName);
      if (countryLikes.includes(name)) return true;
      const id = nameToIdRef.current.get(name.toLowerCase());
      return id != null && countryIds.includes(id);
    },
    [countryLikes, countryIds]
  );

  return {
    loaded,
    likes,
    likedAttractionsData,
    toggleLike,
    isLiked,
    countryLikes,
    countryIds,
    likedCountriesData,
    toggleCountryLike,
    isCountryLiked,
    refresh,
  };
};

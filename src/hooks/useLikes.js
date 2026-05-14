import { useState, useEffect, useCallback, useRef } from "react";
import { usersApi, countriesApi, attractionsApi, tokenStore } from "../services/api";

export const useLikes = () => {
  const [likes, setLikes] = useState([]); // attraction ids
  const [likedAttractionsData, setLikedAttractionsData] = useState([]); // full DTOs
  const [countryLikes, setCountryLikes] = useState([]); // country names (UI keys)
  const [countryIds, setCountryIds] = useState([]); // country ids (backend keys)
  const [likedCountriesData, setLikedCountriesData] = useState([]); // CountryLikedCardDto[]
  const [loaded, setLoaded] = useState(false);
  const nameToIdRef = useRef(new Map());
  const idToNameRef = useRef(new Map());

  const authUser = tokenStore.getUser();
  const userId = authUser?.id || null;

  // Build name<->id map from /api/countries/list (UI toggles by name).
  useEffect(() => {
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
  }, []);

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
    const [favCountries, favAttrIds] = await Promise.all([
      usersApi.getFavoriteCountries(userId).catch(() => null),
      usersApi.getFavoriteAttractions(userId).catch(() => null),
    ]);

    if (Array.isArray(favCountries)) {
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

    if (Array.isArray(favAttrIds)) {
      const ids = favAttrIds.map(Number);
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
  }, [userId]);

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
      const has = likes.includes(id);
      try {
        if (has) await usersApi.removeFavoriteAttraction(userId, id);
        else await usersApi.addFavoriteAttraction(userId, id);
        await refresh();
      } catch (err) {
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

      const has = countryIds.includes(id);
      try {
        if (has) await usersApi.removeFavoriteCountry(userId, id);
        else await usersApi.addFavoriteCountry(userId, id);
        await refresh();
      } catch (err) {
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

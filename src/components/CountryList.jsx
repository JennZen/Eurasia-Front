import { useEffect, useMemo, useState } from "react";
import { allCountries as fallbackCountries } from "../data/allCountries";
import { countriesApi, CONTINENT_IDS } from "../services/api";
import { Link } from "react-router-dom";
import "../styles/country-list.css";

const formatPopulation = (n) => {
  if (n === null || n === undefined) return "—";
  if (typeof n === "string") return n;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const formatArea = (n) => {
  if (n === null || n === undefined) return "—";
  if (typeof n === "string") return n;
  return `${n.toLocaleString()} km²`;
};

const normalize = (c) => {
  // If item already has frontend-shaped string fields, pass through
  if (typeof c.population === "string" && typeof c.area === "string" && c.continent) return c;
  const continent = Array.isArray(c.continents) && c.continents.length ? c.continents[0] : c.continent || "";
  const region = Array.isArray(c.regions) && c.regions.length ? c.regions[0] : c.region || "";
  return {
    id: c.id,
    name: c.name,
    capital: c.capital || "",
    population: typeof c.population === "number" ? formatPopulation(c.population) : c.population || "",
    area: typeof c.geographicalSize === "number" ? formatArea(c.geographicalSize) : c.area || "",
    continent,
    region,
    flag: c.flagUrl || c.flag || "",
  };
};

const CountryList = ({ continent }) => {
  // Fallback dataset is filtered by continent name; once the API responds we replace it
  // with the server-filtered list (already restricted to this continent via continentIds).
  const [allItems, setAllItems] = useState(() =>
    fallbackCountries.map(normalize).filter((c) => c.continent === continent)
  );
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Request only the rows for this continent — server-side filter via continentIds.
        const data = CONTINENT_IDS[continent]
          ? await countriesApi.getByContinent(continent)
          : await countriesApi.getAll();
        if (!active || !Array.isArray(data)) return;
        setAllItems(data.map(normalize));
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      active = false;
    };
  }, [continent]);

  // Server already restricted by continentIds; no client-side continent filter needed.
  const countries = allItems;

  const regions = useMemo(() => {
    const set = new Set(countries.map((c) => c.region).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [countries]);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        String(c.population).toLowerCase().includes(q) ||
        String(c.area).toLowerCase().includes(q);
      const matchRegion = selectedRegion === "All" || c.region === selectedRegion;
      return matchSearch && matchRegion;
    });
  }, [countries, search, selectedRegion]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, filtered.length);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleRegion = (e) => {
    setSelectedRegion(e.target.value);
    setPage(1);
  };
  const handleClear = () => {
    setSearch("");
    setSelectedRegion("All");
    setPage(1);
  };

  return (
    <div className="country-list-section">
      <div className="country-list-layout">
        {/* Sidebar filters */}
        <aside className="country-list-filters">
          <div className="filters-header">
            <h4>Filter by</h4>
          </div>

          <div className="filter-group">
            <label htmlFor="country-search">Keywords</label>
            <input
              id="country-search"
              type="text"
              placeholder="Country, capital, population..."
              value={search}
              onChange={handleSearch}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="region-select">Region</label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={handleRegion}
              className="filter-select"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="filter-btn filter-btn--clear"
              onClick={handleClear}
            >
              Clear filters
            </button>
          </div>
        </aside>

        {/* Country list */}
        <div className="country-list-main">
          <div className="country-list-header">
            <h4>
              <span>{continent} countries</span>
              <span> ({filtered.length})</span>
            </h4>
          </div>

          <p className="country-list-showing">
            Showing {filtered.length > 0 ? `${startIdx} to ${endIdx}` : "0"} of {filtered.length} results
          </p>

          <div className="country-cards-grid">
            {paginated.map((country) => (
              <Link
                key={country.id ?? country.name}
                to={`/country/${country.name.toLowerCase()}`}
                className="country-card-link"
              >
                <article className="country-card-item">
                  <div className="country-card-flag">
                    <img
                      src={country.flag}
                      alt={`Flag of ${country.name}`}
                      loading="lazy"
                    />
                  </div>
                  <div className="country-card-body">
                    <h5 className="country-card-name">{country.name}</h5>
                    <p className="country-card-meta">
                      {country.capital} &middot; {country.population} &middot;{" "}
                      {country.area}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="country-list-empty">No countries match your filters.</p>
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                className="pagination__btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>

              <ul className="pagination__list">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p}>
                    <button
                      className={`pagination__page ${p === page ? "pagination__page--active" : ""}`}
                      onClick={() => setPage(p)}
                      aria-current={p === page ? "true" : undefined}
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                className="pagination__btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryList;

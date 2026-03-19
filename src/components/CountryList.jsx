import { useState, useMemo } from "react";
import { allCountries } from "../data/allCountries";
import { Link } from "react-router-dom";
import "../styles/country-list.css";

const CountryList = ({ continent }) => {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const countries = useMemo(
    () => allCountries.filter((c) => c.continent === continent),
    [continent]
  );

  const regions = useMemo(() => {
    const set = new Set(countries.map((c) => c.region));
    return ["All", ...Array.from(set).sort()];
  }, [countries]);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.population.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q);
      const matchRegion = selectedRegion === "All" || c.region === selectedRegion;
      return matchSearch && matchRegion;
    });
  }, [countries, search, selectedRegion]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, filtered.length);

  // Reset page when filters change
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
                key={country.name}
                to={`/countries/${country.name}`}
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

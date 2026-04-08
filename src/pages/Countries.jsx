import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { allCountries } from "../data/allCountries";
import { useLikes } from "../hooks/useLikes";
import "../styles/countries.css";

const parsePopulation = (str) => {
  const num = parseFloat(str.replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
};

const parseArea = (str) => {
  const num = parseFloat(str.replace(/,/g, "").replace(" km²", ""));
  return isNaN(num) ? 0 : num;
};

const Countries = () => {
  const { toggleCountryLike, isCountryLiked } = useLikes();
  const [search, setSearch] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const continents = ["All", "Europe", "Asia"];

  const regions = useMemo(() => {
    if (selectedContinent === "All") {
      return ["All", ...new Set(allCountries.map((c) => c.region))];
    }
    return [
      "All",
      ...new Set(
        allCountries
          .filter((c) => c.continent === selectedContinent)
          .map((c) => c.region)
      ),
    ];
  }, [selectedContinent]);

  const filtered = useMemo(() => {
    const result = allCountries.filter((country) => {
      const matchSearch =
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.capital.toLowerCase().includes(search.toLowerCase());
      const matchContinent =
        selectedContinent === "All" || country.continent === selectedContinent;
      const matchRegion =
        selectedRegion === "All" || country.region === selectedRegion;
      return matchSearch && matchContinent && matchRegion;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "population") return parsePopulation(b.population) - parsePopulation(a.population);
      if (sortBy === "area") return parseArea(b.area) - parseArea(a.area);
      return 0;
    });
  }, [search, selectedContinent, selectedRegion, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setSelectedContinent("All");
    setSelectedRegion("All");
    setSortBy("name");
  };

  const hasActiveFilters =
    search || selectedContinent !== "All" || selectedRegion !== "All" || sortBy !== "name";

  return (
    <div className="countries-page">
      <h1 className="countries-title">Countries of Eurasia</h1>

      <div className="countries-filters">
        <div className="filter-row">
          <div className="filter-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name or capital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-select">
            <label>Continent</label>
            <div className="filter-buttons">
              {continents.map((c) => (
                <button
                  key={c}
                  className={selectedContinent === c ? "active" : ""}
                  onClick={() => {
                    setSelectedContinent(c);
                    setSelectedRegion("All");
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-select">
            <label>Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <label>Sort by</label>
            <div className="filter-buttons">
              <button
                className={sortBy === "name" ? "active" : ""}
                onClick={() => setSortBy("name")}
              >
                Name
              </button>
              <button
                className={sortBy === "population" ? "active" : ""}
                onClick={() => setSortBy("population")}
              >
                Population
              </button>
              <button
                className={sortBy === "area" ? "active" : ""}
                onClick={() => setSortBy("area")}
              >
                Area
              </button>
            </div>
          </div>
        </div>

        <div className="filter-status">
          <span className="result-count">
            {filtered.length} {filtered.length === 1 ? "country" : "countries"} found
          </span>
          {hasActiveFilters && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="countries-list">
        {filtered.map((country) => (
          <article key={country.name} className="country-item">
            <Link
              to={`/country/${country.name.toLowerCase()}`}
              className="country-item-picture"
            >
              <img src={country.flag} alt={`Flag of ${country.name}`} />
            </Link>
            <div className="country-item-content">
              <div className="country-item-top">
                <h3 className="country-item-title">
                  <Link to={`/country/${country.name.toLowerCase()}`}>
                    {country.name}
                  </Link>
                </h3>
                <button
                  className={`country-like-btn ${isCountryLiked(country.name) ? "liked" : ""}`}
                  onClick={() => toggleCountryLike(country.name)}
                  title={isCountryLiked(country.name) ? "Remove from favorites" : "Add to favorites"}
                >
                  <i className="fas fa-heart"></i>
                </button>
              </div>
              <div className="country-item-stats">
                <span><i className="fas fa-users"></i> {country.population}</span>
                <span><i className="fas fa-expand-arrows-alt"></i> {country.area}</span>
                <span><i className="fas fa-landmark"></i> {country.capital}</span>
              </div>
              <p className="country-item-description">{country.description}</p>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="countries-empty">
          <p>No countries match your filters.</p>
          <button onClick={clearFilters}>Clear filters</button>
        </div>
      )}
    </div>
  );
};

export default Countries;

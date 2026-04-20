import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { attractions } from "../data/attractions";
import { useLikes } from "../hooks/useLikes";
import "../styles/Attractions.css";

const uniqueCountries = ["All", ...new Set(attractions.map((a) => a.country))];

const Attractions = () => {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All");
  const { isLiked, toggleLike } = useLikes();

  const filtered = useMemo(() => {
    return attractions.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        item.description.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCountry = country === "All" || item.country === country;
      return matchesSearch && matchesCountry;
    });
  }, [query, country]);

  const formatCountryName = (country) => {
    if (country === "All") return "All countries";
    return country.charAt(0).toUpperCase() + country.slice(1);
  };

  return (
    <div className="attractions-catalog-page">
      <section className="attractions-catalog-header">
        <h1>Explore Attractions</h1>
        <p>Find landmarks by name, country, or experience type.</p>
      </section>

      <section className="attractions-catalog-controls">
        <div className="search-group">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search attractions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="select-group">
          <label>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {uniqueCountries.map((item) => (
              <option key={item} value={item}>
                {formatCountryName(item)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="attractions-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No attractions found. Try a different search or filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="attraction-card">
              <div className="attraction-image" style={{ backgroundImage: `url(${item.image})` }} />
              <div className="attraction-body">
                <h2>{item.name}</h2>
                <p className="attraction-country">{item.country.toUpperCase()}</p>
                <p className="attraction-desc">{item.description}</p>
                <div className="attraction-meta">
                  <span>{item.rating} ★</span>
                  <span>{item.reviews} reviews</span>
                  <span>{item.hours}</span>
                </div>
                <div className="attraction-actions">
                  <Link
                    to={`/attractions/${item.country}/${item.id}`}
                    state={{ via: "catalog" }}
                    className="attraction-link"
                  >
                    Open details
                  </Link>
                  <button
                    className={`like-btn ${isLiked(item.id) ? "liked" : ""}`}
                    onClick={() => toggleLike(item.id)}
                    title={isLiked(item.id) ? "Remove from likes" : "Add to likes"}
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default Attractions;

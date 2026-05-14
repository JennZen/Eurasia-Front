import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLikes } from "../hooks/useLikes";
import { useAuth } from "../admin/AdminAuthContext";
import "../styles/LikedAttractions.css";

const fmtNumber = (n) => (typeof n === "number" ? n.toLocaleString() : n || "—");
const fmtArea = (n) => (typeof n === "number" ? `${n.toLocaleString()} km²` : n || "—");
const fmtPrice = (p) => (typeof p === "number" ? `$${p}` : p || "—");

const LikedAttractions = () => {
  const { user } = useAuth();
  const {
    loaded,
    likedAttractionsData,
    likedCountriesData,
    toggleLike,
    toggleCountryLike,
  } = useLikes();
  const [activeTab, setActiveTab] = useState("countries");

  const groupedAttractions = useMemo(() => {
    return likedAttractionsData.reduce((acc, item) => {
      const country = (item.countryName || "Other").trim();
      const cap = country.charAt(0).toUpperCase() + country.slice(1);
      if (!acc[cap]) acc[cap] = [];
      acc[cap].push(item);
      return acc;
    }, {});
  }, [likedAttractionsData]);

  const totalCount = likedCountriesData.length + likedAttractionsData.length;

  if (!user) {
    return (
      <div className="liked-attractions-page">
        <section className="liked-header">
          <h1>My Favorites</h1>
        </section>
        <div className="empty-liked">
          <i className="fas fa-lock"></i>
          <h2>Sign in to see your favorites</h2>
          <Link to="/login" state={{ from: "/liked" }} className="primary-btn">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="liked-attractions-page">
      <section className="liked-header">
        <h1>My Favorites</h1>
        <p>
          {totalCount} item{totalCount !== 1 ? "s" : ""} saved
        </p>
      </section>

      <div className="liked-tabs">
        <button
          className={`liked-tab ${activeTab === "countries" ? "active" : ""}`}
          onClick={() => setActiveTab("countries")}
        >
          <i className="fas fa-globe"></i>
          Countries
          {likedCountriesData.length > 0 && (
            <span className="tab-count">{likedCountriesData.length}</span>
          )}
        </button>
        <button
          className={`liked-tab ${activeTab === "attractions" ? "active" : ""}`}
          onClick={() => setActiveTab("attractions")}
        >
          <i className="fas fa-map-marker-alt"></i>
          Attractions
          {likedAttractionsData.length > 0 && (
            <span className="tab-count">{likedAttractionsData.length}</span>
          )}
        </button>
      </div>

      {!loaded && <div className="empty-liked"><p>Loading…</p></div>}

      {loaded && activeTab === "countries" && (
        <section className="liked-section">
          {likedCountriesData.length === 0 ? (
            <div className="empty-liked">
              <i className="fas fa-globe"></i>
              <h2>No countries saved yet</h2>
              <p>Start adding your favorite countries by clicking the heart icon!</p>
              <Link to="/countries" className="primary-btn">
                Explore Countries
              </Link>
            </div>
          ) : (
            <div className="liked-countries-grid">
              {likedCountriesData.map((country) => (
                <div key={country.id} className="country-liked-card">
                  <div className="country-liked-flag-area">
                    <img
                      src={country.flagUrl}
                      alt={`${country.name} flag`}
                      className="country-liked-flag"
                    />
                    <div
                      className="country-liked-flag-blur"
                      style={{ backgroundImage: `url(${country.flagUrl})` }}
                    />
                    <button
                      className="unlike-btn"
                      onClick={() => toggleCountryLike(country.name)}
                      title="Remove from likes"
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                  <div className="country-liked-body">
                    <h3 className="country-liked-name">{country.name}</h3>
                    <div className="country-liked-region">{country.region || "—"}</div>
                    <div className="country-liked-stats">
                      <div className="country-liked-stat">
                        <i className="fas fa-landmark"></i>
                        <div>
                          <span className="stat-value">{country.capital || "—"}</span>
                          <span className="stat-label">Capital</span>
                        </div>
                      </div>
                      <div className="country-liked-stat">
                        <i className="fas fa-users"></i>
                        <div>
                          <span className="stat-value">{fmtNumber(country.population)}</span>
                          <span className="stat-label">Population</span>
                        </div>
                      </div>
                      <div className="country-liked-stat">
                        <i className="fas fa-ruler-combined"></i>
                        <div>
                          <span className="stat-value">{fmtArea(country.geographicalSize)}</span>
                          <span className="stat-label">Area</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/country/${country.name.toLowerCase()}`}
                      className="view-btn"
                    >
                      Explore Country
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {loaded && activeTab === "attractions" && (
        <section className="liked-section">
          {likedAttractionsData.length === 0 ? (
            <div className="empty-liked">
              <i className="fas fa-heart"></i>
              <h2>No attractions saved yet</h2>
              <p>Start adding your favorite attractions by clicking the heart icon!</p>
              <Link to="/attractions" className="primary-btn">
                Explore Attractions
              </Link>
            </div>
          ) : (
            Object.entries(groupedAttractions).map(([country, items]) => (
              <div key={country} className="country-group">
                <div className="country-group-header">
                  <h2>{country}</h2>
                  <span className="country-group-count">
                    {items.length} attraction{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="liked-grid">
                  {items.map((item) => {
                    const countrySlug = (item.countryName || "").toLowerCase();
                    return (
                      <div key={item.id} className="liked-card">
                        <div
                          className="liked-image"
                          style={{ backgroundImage: `url(${item.imageUrl || item.bGUrl || ""})` }}
                        >
                          <button
                            className="unlike-btn"
                            onClick={() => toggleLike(item.id)}
                            title="Remove from likes"
                          >
                            <i className="fas fa-heart"></i>
                          </button>
                        </div>
                        <div className="liked-content">
                          <h3>{item.name}</h3>
                          <div className="liked-location">
                            <span className="location-label">
                              <i className="fas fa-map-pin" style={{ marginRight: 6 }} />
                              City
                            </span>
                            <span className="location-value">{item.city || "—"}</span>
                          </div>
                          <div className="liked-meta">
                            <span>
                              <i
                                className="fas fa-star"
                                style={{ marginRight: 4, color: "#fbbf24" }}
                              />
                              {item.rating ?? "—"}
                            </span>
                            <span>{fmtPrice(item.price)}</span>
                          </div>
                          <Link
                            to={`/attractions/${countrySlug}/${item.id}`}
                            state={{ via: "catalog" }}
                            className="view-btn"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
};

export default LikedAttractions;

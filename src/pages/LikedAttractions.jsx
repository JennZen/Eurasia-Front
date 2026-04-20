import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { attractions } from "../data/attractions";
import { allCountries } from "../data/allCountries";
import { useLikes } from "../hooks/useLikes";
import "../styles/LikedAttractions.css";

const LikedAttractions = () => {
  const { likes, toggleLike, countryLikes, toggleCountryLike } = useLikes();
  const [likedAttractions, setLikedAttractions] = useState([]);
  const [likedCountryData, setLikedCountryData] = useState([]);
  const [activeTab, setActiveTab] = useState("countries");

  useEffect(() => {
    const liked = attractions.filter((a) => likes.includes(a.id));
    setLikedAttractions(liked);
  }, [likes]);

  useEffect(() => {
    const countries = allCountries.filter((c) =>
      countryLikes.includes(c.name)
    );
    setLikedCountryData(countries);
  }, [countryLikes]);

  // Group attractions by country
  const groupedAttractions = likedAttractions.reduce((acc, item) => {
    const country =
      item.country.charAt(0).toUpperCase() + item.country.slice(1);
    if (!acc[country]) acc[country] = [];
    acc[country].push(item);
    return acc;
  }, {});

  const totalCount = likedCountryData.length + likedAttractions.length;

  return (
    <div className="liked-attractions-page">
      <section className="liked-header">
        <h1>My Favorites</h1>
        <p>{totalCount} item{totalCount !== 1 ? "s" : ""} saved</p>
      </section>

      <div className="liked-tabs">
        <button
          className={`liked-tab ${activeTab === "countries" ? "active" : ""}`}
          onClick={() => setActiveTab("countries")}
        >
          <i className="fas fa-globe"></i>
          Countries
          {likedCountryData.length > 0 && (
            <span className="tab-count">{likedCountryData.length}</span>
          )}
        </button>
        <button
          className={`liked-tab ${activeTab === "attractions" ? "active" : ""}`}
          onClick={() => setActiveTab("attractions")}
        >
          <i className="fas fa-map-marker-alt"></i>
          Attractions
          {likedAttractions.length > 0 && (
            <span className="tab-count">{likedAttractions.length}</span>
          )}
        </button>
      </div>

      {activeTab === "countries" && (
        <section className="liked-section">
          {likedCountryData.length === 0 ? (
            <div className="empty-liked">
              <i className="fas fa-globe"></i>
              <h2>No countries saved yet</h2>
              <p>
                Start adding your favorite countries by clicking the heart icon!
              </p>
              <Link to="/countries" className="primary-btn">
                Explore Countries
              </Link>
            </div>
          ) : (
            <div className="liked-countries-grid">
              {likedCountryData.map((country) => (
                <div key={country.name} className="country-liked-card">
                  <div className="country-liked-flag-area">
                    <img
                      src={country.flag}
                      alt={`${country.name} flag`}
                      className="country-liked-flag"
                    />
                    <div className="country-liked-flag-blur"
                      style={{ backgroundImage: `url(${country.flag})` }}
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
                    <div className="country-liked-region">{country.region}</div>
                    <div className="country-liked-stats">
                      <div className="country-liked-stat">
                        <i className="fas fa-landmark"></i>
                        <div>
                          <span className="stat-value">{country.capital}</span>
                          <span className="stat-label">Capital</span>
                        </div>
                      </div>
                      <div className="country-liked-stat">
                        <i className="fas fa-users"></i>
                        <div>
                          <span className="stat-value">{country.population}</span>
                          <span className="stat-label">Population</span>
                        </div>
                      </div>
                      <div className="country-liked-stat">
                        <i className="fas fa-ruler-combined"></i>
                        <div>
                          <span className="stat-value">{country.area}</span>
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

      {activeTab === "attractions" && (
        <section className="liked-section">
          {likedAttractions.length === 0 ? (
            <div className="empty-liked">
              <i className="fas fa-heart"></i>
              <h2>No attractions saved yet</h2>
              <p>
                Start adding your favorite attractions by clicking the heart
                icon!
              </p>
              <Link to="/attractions" className="primary-btn">
                Explore Attractions
              </Link>
            </div>
          ) : (
            Object.entries(groupedAttractions).map(
              ([country, countryAttractions]) => (
                <div key={country} className="country-group">
                  <div className="country-group-header">
                    <h2>{country}</h2>
                    <span className="country-group-count">
                      {countryAttractions.length} attraction
                      {countryAttractions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="liked-grid">
                    {countryAttractions.map((item) => (
                      <div key={item.id} className="liked-card">
                        <div
                          className="liked-image"
                          style={{ backgroundImage: `url(${item.image})` }}
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
                              <i
                                className="fas fa-map-pin"
                                style={{ marginRight: 6 }}
                              />
                              City
                            </span>
                            <span className="location-value">{item.city}</span>
                          </div>
                          <div className="liked-meta">
                            <span>
                              <i
                                className="fas fa-star"
                                style={{ marginRight: 4, color: "#fbbf24" }}
                              />
                              {item.rating}
                            </span>
                            <span>{item.price}</span>
                          </div>
                          <Link
                            to={`/attractions/${item.country}/${item.id}`}
                            state={{ via: "catalog" }}
                            className="view-btn"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </section>
      )}
    </div>
  );
};

export default LikedAttractions;

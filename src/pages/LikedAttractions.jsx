import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { attractions } from "../data/attractions";
import { useLikes } from "../hooks/useLikes";
import "./LikedAttractions.css";

const LikedAttractions = () => {
  const { likes, toggleLike } = useLikes();
  const [likedAttractions, setLikedAttractions] = useState([]);

  useEffect(() => {
    const liked = attractions.filter((a) => likes.includes(a.id));
    setLikedAttractions(liked);
  }, [likes]);

  return (
    <div className="liked-attractions-page">
      <section className="liked-header">
        <h1>My Liked Attractions</h1>
        <p>
          {likedAttractions.length} attraction
          {likedAttractions.length !== 1 ? "s" : ""} saved
        </p>
      </section>

      <section className="liked-grid">
        {likedAttractions.length === 0 ? (
          <div className="empty-liked">
            <i className="fas fa-heart"></i>
            <h2>No attractions saved yet</h2>
            <p>
              Start adding your favorite attractions by clicking the heart icon!
            </p>
            <Link to="/attractions" className="primary-btn">
              Explore Attractions
            </Link>
          </div>
        ) : (
          likedAttractions.map((item) => (
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
                    <i className="fas fa-globe" style={{ marginRight: 6 }} />
                    Country
                  </span>
                  <span className="location-value">
                    {item.country.charAt(0).toUpperCase() +
                      item.country.slice(1)}
                  </span>
                </div>
                <div className="liked-location">
                  <span className="location-label">
                    <i className="fas fa-map-pin" style={{ marginRight: 6 }} />
                    City
                  </span>
                  <span className="location-value">{item.city}</span>
                </div>
                <div className="liked-meta">
                  <span>
                    <i className="fas fa-star" style={{ marginRight: 4, color: "#fbbf24" }} />
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
          ))
        )}
      </section>
    </div>
  );
};

export default LikedAttractions;

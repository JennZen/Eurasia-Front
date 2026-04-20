import { Link, useLocation, useParams } from "react-router-dom";
import { attractions } from "../data/attractions";
import { useLikes } from "../hooks/useLikes";
import "../styles/AttractionPage.css";

const AttractionPage = () => {
  const location = useLocation();
  const { country, id } = useParams();
  const attractionId = Number(id);
  const { isLiked, toggleLike } = useLikes();

  const attraction = attractions.find(
    (item) => item.id === attractionId && item.country === country
  );

  const arrivedFrom = location.state?.via;
  const canSee = arrivedFrom === "country" || arrivedFrom === "catalog";

  if (!canSee) {
    return (
      <div className="attraction-page" style={{ padding: "60px" }}>
        <h2>Access denied</h2>
        <p>Вы можете просмотреть достопримечательность только через страницу страны или каталог.</p>
        <Link to="/attractions" className="primary-btn" style={{ marginTop: "20px" }}>
          Go to attractions catalog
        </Link>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="attraction-page">
        <div className="not-found">
          <h2>Attraction not found</h2>
          <p>Try the attractions catalog or select a country first.</p>
          <Link to="/attractions" className="primary-btn">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const otherAttractions = attractions
    .filter((item) => item.country === attraction.country && item.id !== attraction.id)
    .slice(0, 3);

  return (
    <div className="attraction-page">
      <section
        className="attraction-hero"
        style={{ backgroundImage: `url(${attraction.heroImage})` }}
      >
        <div className="attraction-hero-overlay">
          <button
            className={`like-btn-hero ${isLiked(attraction.id) ? "liked" : ""}`}
            onClick={() => toggleLike(attraction.id)}
            title={isLiked(attraction.id) ? "Remove from likes" : "Add to likes"}
          >
            <i className="fas fa-heart"></i>
          </button>
          <h1>{attraction.name}</h1>
          <div className="rating-row">
            <span className="rating">{attraction.rating}</span>
            <span className="stars">
              {Array.from({ length: 5 }).map((_, idx) => (
                <i
                  key={idx}
                  className={`fas ${idx < Math.floor(attraction.rating) ? "fa-star" : "fa-star-half-alt"}`}
                ></i>
              ))}
            </span>
            <span className="reviews">({attraction.reviews} reviews)</span>
          </div>
          <p className="hero-subtext" style={{ fontSize: "1.4rem" }}>
            {attraction.fullDescription}
          </p>
        </div>
      </section>

      <section className="attraction-main">
        <div className="attraction-left">
          <h2>About the attraction</h2>
          <p className="about-text" style={{ fontSize: "1.25rem" }}>
            {attraction.fullDescription}
          </p>

          <div className="location-info">
            <div>
              <h3>Travel details</h3>
              <p style={{ fontSize: "1.1rem" }}>Duration: {attraction.duration}</p>
              <p style={{ fontSize: "1.1rem" }}>Best time to visit: {attraction.bestTime}</p>
            </div>
            <div className="gallery">
              <img src={attraction.heroImage} alt={`${attraction.name} 1`} />
              <img src={attraction.image} alt={`${attraction.name} 2`} />
            </div>
          </div>

          <div className="featured-section">
            <h2>Other attractions</h2>
            <div className="experience-grid">
              {otherAttractions.map((exp) => (
                <article className="experience-card" key={exp.id}>
                  <img src={exp.image} alt={exp.name} />
                  <div className="experience-content">
                    <h3>{exp.name}</h3>
                    <p>{exp.description}</p>
                    <span className="exp-meta">Duration: {exp.duration}</span>
                    <span className="exp-price">★ {exp.rating}</span>
                    <Link
                      to={`/attractions/${exp.country}/${exp.id}`}
                      state={{ via: "catalog" }}
                      className="secondary-btn"
                    >
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="attraction-right">
          <div className="hours-box simple-hours">
            <h3>Working Hours</h3>
            <span>{attraction.hours}</span>
          </div>

          <div className="info-box">
            <h3>Location</h3>
            <p>
              <strong>Country:</strong> {attraction.country.charAt(0).toUpperCase() + attraction.country.slice(1)}
            </p>
            <p>
              <strong>City:</strong> {attraction.city}
            </p>
          </div>

          <div className="price-box">
            <h3>Price</h3>
            <span className="price-value">{attraction.price}</span>
            <p className="price-desc">Per person</p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AttractionPage;


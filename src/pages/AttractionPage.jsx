import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { attractions as fallbackAttractions } from "../data/attractions";
import { attractionsApi } from "../services/api";
import { useLikes } from "../hooks/useLikes";
import "../styles/AttractionPage.css";

const normalizeAttraction = (a) => ({
  id: a.id,
  name: a.name,
  description: a.description,
  fullDescription: a.fullDescription || a.description,
  image: a.imageUrl || a.image,
  imageUrl: a.imageUrl || a.image,
  bgUrl: a.bGUrl || a.bgUrl || a.heroImage || a.image,
  heroImage: a.bGUrl || a.heroImage || a.imageUrl || a.image,
  country: (a.countryName || a.country || "").toString().toLowerCase(),
  countryName: a.countryName || a.country,
  city: a.city,
  price: typeof a.price === "number" ? `$${a.price}` : a.price,
  duration: a.duration,
  bestTime: a.bestTimeToVisit || a.bestTime,
  hours: a.openingHours || a.hours,
  rating: a.rating,
  reviews: a.numberOfReviews ?? a.reviews,
});

const AttractionPage = () => {
  const location = useLocation();
  const { country, id } = useParams();
  const attractionId = Number(id);
  const { isLiked, toggleLike } = useLikes();
  const [allAttractions, setAllAttractions] = useState(() => fallbackAttractions.map(normalizeAttraction));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await attractionsApi.getAll();
        if (!active || !Array.isArray(data) || data.length === 0) return;
        setAllAttractions(data.map(normalizeAttraction));
      } catch {
        /* keep fallback */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const attraction = useMemo(
    () => allAttractions.find((item) => item.id === attractionId && item.country === country),
    [allAttractions, attractionId, country]
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
    if (loading) return <div className="attraction-page"><p style={{ padding: 40 }}>Loading…</p></div>;
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

  const otherAttractions = allAttractions
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
              <img src={attraction.bgUrl} alt={`${attraction.name} 1`} />
              <img src={attraction.imageUrl} alt={`${attraction.name} 2`} />
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

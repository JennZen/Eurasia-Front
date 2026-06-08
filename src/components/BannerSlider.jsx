import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bannersApi } from "../services/api";

// Backend returns Population/Territory as raw numeric strings (e.g. "1430000000", "9596961").
// Convert to a "X.XX Mil" / "X.XX Bil" representation, leaving non-numeric strings untouched.
const formatMillions = (value, { unit = "" } = {}) => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(num)) return String(value);
  const suffix = unit ? ` ${unit}` : "";
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)} Bil${suffix}`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(2)} Mil${suffix}`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(0)} K${suffix}`;
  return `${num}${suffix}`;
};

const normalize = (b) => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle || "Take a Glimpse Into The Beautiful Country Of:",
  image: b.imageUrl || b.image,
  population: formatMillions(b.population, { unit: "People" }),
  territory: formatMillions(b.territory, { unit: "km²" }),
  capital: b.capital || "",
  link: b.link || `/country/${String(b.title || "").toLowerCase()}`,
});

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const slideDuration = 4000;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await bannersApi.getAll(4);
        if (!active || !Array.isArray(data)) return;
        setBanners(data.map(normalize));
      } catch {
        /* backend unreachable — slider stays hidden */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / (slideDuration / 50);
      });
    }, 50);

    const slideTimer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setProgress(0);
    }, slideDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(slideTimer);
    };
  }, [currentSlide, banners.length]);

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  if (banners.length === 0) return null;

  return (
    <section id="section-1">
      <div className="content-slider">
        <div className="slider">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner ${currentSlide === index ? "active" : ""}`}
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              <div className="banner-inner-wrapper">
                <div className="main-caption">
                  <h2>{banner.subtitle}</h2>
                  <h1>{banner.title}</h1>
                  <div className="border-button">
                    <Link to={banner.link}>Go There</Link>
                  </div>
                </div>
                <div className="more-info">
                  <div className="info-items">
                    <div className="info-item">
                      <i className="fa fa-user"></i>
                      <div>
                        <h4>
                          <span>Population:</span>
                          <br />
                          {banner.population}
                        </h4>
                      </div>
                    </div>
                    <div className="info-item">
                      <i className="fa fa-globe"></i>
                      <div>
                        <h4>
                          <span>Territory:</span>
                          <br />
                          {banner.territory}
                        </h4>
                      </div>
                    </div>
                    <div className="info-item">
                      <i className="fa fa-city"></i>
                      <div>
                        <h4>
                          <span>Capital:</span>
                          <br />
                          {banner.capital}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="more-info-button">
                    <Link to={banner.link}>Explore More</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="progress-bars">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`progress-item ${currentSlide === index ? "active" : ""}`}
              onClick={() => handleSlideClick(index)}
            >
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: currentSlide === index ? `${progress}%` : "0%",
                  }}
                ></div>
              </div>
              <span className="progress-number">{banner.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerSlider;

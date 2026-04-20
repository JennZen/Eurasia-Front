import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { banners } from "../data/banners";

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const slideDuration = 4000;

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
  }, [currentSlide]);

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

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

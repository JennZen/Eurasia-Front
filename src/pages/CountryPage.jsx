import { countryData } from "../data/countryData";
import "./CountryPage.css";

const CountryPage = () => {
  const { name, heroImage, heroDescription, generalInfo, attractions, culture } =
    countryData;

  return (
    <div className="country-page">
      <section
        className="country-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="country-hero-overlay">
          <h1>{name}</h1>
          <p className="country-hero-desc">{heroDescription}</p>
          <a href="#attractions" className="country-hero-btn">
            Explore Attractions
          </a>
        </div>
      </section>

      <section className="country-info-section">
        <h2 className="section-title">General Information</h2>
        <div className="country-info-grid">
          {generalInfo.map((item, index) => (
            <div className="country-info-card" key={index}>
              <div className="country-info-icon">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <span className="country-info-label">{item.label}</span>
              <span className="country-info-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="country-attractions" id="attractions">
        <h2 className="section-title">Top Attractions</h2>
        <div className="attractions-grid">
          {attractions.map((attraction) => (
            <div className="attraction-card" key={attraction.id}>
              <div className="attraction-img-wrapper">
                <img src={attraction.image} alt={attraction.name} />
              </div>
              <div className="attraction-content">
                <h3>{attraction.name}</h3>
                <p>{attraction.description}</p>
                <a
                  href={`https://en.wikipedia.org/wiki/${attraction.name.replace(/ /g, "_")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attraction-btn"
                >
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="country-culture">
        <h2 className="section-title">Culture & Traditions</h2>
        <div className="culture-grid">
          {culture.map((item, index) => (
            <div className="culture-card" key={index}>
              <div className="culture-icon">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CountryPage;

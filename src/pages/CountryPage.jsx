import { Link, useParams } from "react-router-dom";
import { attractions } from "../data/attractions";
import "./CountryPage.css";

const CountryPage = () => {
  const { country } = useParams();
  const countryKey = country ? country.toLowerCase() : "austria";
  const countryAttractions = attractions.filter((item) => item.country === countryKey);

  // Mock data
  const name = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);

  const heroImage = "https://via.placeholder.com/1600x800/cccccc/000000?text=Austria+Hero+Image";
  const heroDescription = "A beautiful country in Central Europe known for its stunning landscapes, rich history, and vibrant culture.";
  const flagImage = "https://via.placeholder.com/100x60/FF0000/FFFFFF?text=Flag";

  const generalInfo = [
    {
      icon: "fa-landmark",
      label: "Capital",
      value: "Vienna",
    },
    {
      icon: "fa-map-marker-alt",
      label: "Region",
      value: "Central Europe",
    },
    {
      icon: "fa-language",
      label: "Official language(s)",
      value: "German",
    },
    {
      icon: "fa-euro-sign",
      label: "Currency",
      value: "euro (€)",
    },
    {
      icon: "fa-globe",
      label: "Geographical size",
      value: "83 882 km²",
    },
    {
      icon: "fa-users",
      label: "Population",
      value: "9 197 213",
    },
  ];

  const interestingFacts = [
    "Austria is home to the world's oldest zoo, Tiergarten Schönbrunn, founded in 1752.",
    "The country has more than 8,000 lakes, making it a paradise for water sports enthusiasts.",
    "Austria produces some of the finest wines in the world, with vineyards dating back to Roman times.",
    "The Vienna Philharmonic Orchestra is one of the world's most prestigious musical ensembles.",
    "Austria has hosted the Eurovision Song Contest twice, in 1967 and 2015.",
  ];

  const defaultAttractions = [
    {
      id: 1,
      name: "Schönbrunn Palace",
      image: "https://via.placeholder.com/600x400/cccccc/000000?text=Schonbrunn+Palace",
      description: "A former imperial summer residence, now a major tourist attraction and UNESCO World Heritage Site.",
      country: "austria",
    },
    {
      id: 2,
      name: "Hofburg Palace",
      image: "https://via.placeholder.com/600x400/cccccc/000000?text=Hofburg+Palace",
      description: "The residence of the President of Austria and a symbol of the country's imperial past.",
      country: "austria",
    },
    {
      id: 3,
      name: "St. Stephen's Cathedral",
      image: "https://via.placeholder.com/600x400/cccccc/000000?text=St.+Stephens+Cathedral",
      description: "Vienna's most important religious building, featuring stunning Gothic architecture.",
      country: "austria",
    },
    {
      id: 4,
      name: "Hallstatt",
      image: "https://via.placeholder.com/600x400/cccccc/000000?text=Hallstatt",
      description: "A picturesque village often called the 'most photographed' in Austria.",
      country: "austria",
    },
    {
      id: 5,
      name: "Grossglockner",
      image: "https://via.placeholder.com/600x400/cccccc/000000?text=Grossglockner",
      description: "Austria's highest mountain, offering breathtaking views and hiking opportunities.",
      country: "austria",
    },
  ];

  const attractionsList = countryAttractions.length > 0 ? countryAttractions : defaultAttractions;

  return (
    <div className="country-page">
      <section
        className="country-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="country-hero-overlay">
          <img src={flagImage} alt="Austria Flag" className="country-flag" />
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
        <div className="interesting-facts">
          <h3>Interesting Facts</h3>
          <ul>
            {interestingFacts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="country-attractions" id="attractions">
        <h2 className="section-title">Top Attractions</h2>
        <div className="attractions-grid">
          {attractionsList.map((attraction) => (
            <div className="attraction-card" key={attraction.id}>
              <div className="attraction-img-wrapper">
                <img src={attraction.image} alt={attraction.name} />
              </div>
              <div className="attraction-content">
                <h3>{attraction.name}</h3>
                <p>{attraction.description}</p>
                <Link
                  to={`/attractions/${attraction.country}/${attraction.id}`}
                  state={{ via: "country" }}
                  className="attraction-btn"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="country-news">
        <h2 className="section-title">Latest News</h2>
        <div className="news-grid">
          {[
            {
              id: 1,
              title: "Vienna Concert Season Opens",
              excerpt: "Rediscover classical music with this year’s opening gala at the Vienna State Opera.",
              image: "https://via.placeholder.com/600x400/cccccc/000000?text=Vienna+Concert"
            },
            {
              id: 2,
              title: "New Alpine Hiking Routes",
              excerpt: "A new set of trail renovations across the Tyrol Alps makes summer trekking even more scenic.",
              image: "https://via.placeholder.com/600x400/cccccc/000000?text=Alpine+Trails"
            },
            {
              id: 3,
              title: "Gastronomy Week in Salzburg",
              excerpt: "Experience traditional Austrian cuisine and contemporary chefs at the annual festival.",
              image: "https://via.placeholder.com/600x400/cccccc/000000?text=Salzburg+Food+Week"
            }
          ].map((newsItem) => (
            <div className="news-card" key={newsItem.id}>
              <div className="news-img-wrapper">
                <img src={newsItem.image} alt={newsItem.title} />
              </div>
              <div className="news-content">
                <h3>{newsItem.title}</h3>
                <p>{newsItem.excerpt}</p>
                <Link
                  to="/latest-news"
                  state={{ source: "country", selectedNewsId: newsItem.id }}
                  className="attraction-btn"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CountryPage;

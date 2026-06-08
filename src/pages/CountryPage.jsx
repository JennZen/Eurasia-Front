import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { attractionsApi, countriesApi, newsApi } from "../services/api";
import { useLikes } from "../hooks/useLikes";
import "../styles/CountryPage.css";

const formatNewsDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const CountryPage = () => {
  const { country } = useParams();
  const { toggleCountryLike, isCountryLiked } = useLikes({ attractions: false });
  const countryKey = country ? country.toLowerCase() : "austria";

  const [apiCountry, setApiCountry] = useState(null);
  const [apiAttractions, setApiAttractions] = useState(null);
  const [apiNews, setApiNews] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Two-step lookup: route param is country slug (name), but the detail endpoint
        // wants an ID. The list endpoint omits `Summary` in CountryFlow.GetAllCountriesMainInfoDtos,
        // while GetById returns the full DTO — so we resolve id from list, then refetch detail.
        const all = await countriesApi.getAll();
        if (!active || !Array.isArray(all)) return;
        const found = all.find((c) => (c.name || "").toLowerCase() === countryKey);
        if (!found) {
          setApiCountry(null);
          return;
        }
        // Render list-DTO immediately so non-summary fields don't flash.
        setApiCountry(found);
        try {
          const detail = await countriesApi.getById(found.id);
          if (active && detail) setApiCountry(detail);
        } catch {
          /* keep list-DTO; summary section is simply omitted */
        }
      } catch {
        /* backend unreachable — page renders minimal header */
      }
    })();
    (async () => {
      try {
        const all = await attractionsApi.getAll();
        if (!active || !Array.isArray(all)) return;
        setApiAttractions(all);
      } catch {
        if (active) setApiAttractions([]);
      }
    })();
    (async () => {
      try {
        const all = await newsApi.getAll();
        if (!active || !Array.isArray(all)) return;
        setApiNews(all);
      } catch {
        if (active) setApiNews([]);
      } finally {
        if (active) setNewsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [countryKey]);

  const name = apiCountry?.name || (countryKey.charAt(0).toUpperCase() + countryKey.slice(1));

  const heroImage = apiCountry?.backgroundUrl || apiCountry?.flagUrl || "https://via.placeholder.com/1600x800/cccccc/000000?text=Country";
  const heroDescription = apiCountry?.formalName || `Explore ${name}.`;
  const flagImage = apiCountry?.flagUrl || "";

  const countryAttractions = (apiAttractions || [])
    .filter((a) => (a.countryName || "").toLowerCase() === countryKey)
    .map((a) => ({
      id: a.id,
      name: a.name,
      image: a.imageUrl,
      description: a.description,
      country: (a.countryName || "").toLowerCase(),
    }));

  const fmtNumber = (n) => (typeof n === "number" ? n.toLocaleString() : n || "—");

  const generalInfo = [
    { icon: "fa-landmark", label: "Capital", value: apiCountry?.capital || "—" },
    {
      icon: "fa-map-marker-alt",
      label: "Region",
      value: (apiCountry?.regions?.[0]) || "—",
    },
    {
      icon: "fa-language",
      label: "Official language(s)",
      value: (apiCountry?.languages || []).join(", ") || "—",
    },
    { icon: "fa-euro-sign", label: "Currency", value: apiCountry?.currency || "—" },
    {
      icon: "fa-globe",
      label: "Geographical size",
      value: apiCountry ? `${fmtNumber(apiCountry.geographicalSize)} km²` : "—",
    },
    {
      icon: "fa-users",
      label: "Population",
      value: apiCountry ? fmtNumber(apiCountry.population) : "—",
    },
  ];

  const attractionsList = countryAttractions;

  const countryNews = useMemo(() => {
    if (!Array.isArray(apiNews) || apiNews.length === 0) return [];
    const needles = [name, countryKey].filter(Boolean).map((s) => s.toLowerCase());
    const matches = apiNews.filter((n) => {
      const haystack = `${n.title || ""} ${n.description || ""}`.toLowerCase();
      return needles.some((needle) => haystack.includes(needle));
    });
    return matches.slice(0, 3);
  }, [apiNews, name, countryKey]);

  return (
    <div className="country-page">
      <section
        className="country-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="country-hero-overlay">
          <button
            className={`like-btn-hero ${isCountryLiked(apiCountry || name) ? "liked" : ""}`}
            onClick={() => toggleCountryLike(apiCountry || name)}
            title={isCountryLiked(apiCountry || name) ? "Remove from favorites" : "Add to favorites"}
          >
            <i className="fas fa-heart"></i>
          </button>
          <img src={flagImage} alt={`${name} Flag`} className="country-flag" />
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
        {apiCountry?.summary && (
          <div className="interesting-facts">
            <h3>Interesting Facts</h3>
            {/* Backend stores Summary as HTML (rich-text editor in admin panel),
                so we render it as-is. Trusted source: only Admin role can write this field. */}
            <div
              className="interesting-facts-content"
              dangerouslySetInnerHTML={{ __html: apiCountry.summary }}
            />
          </div>
        )}
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
        {newsLoading ? (
          <p style={{ textAlign: "center", opacity: 0.6 }}>Loading news…</p>
        ) : countryNews.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.6 }}>
            No news about {name} yet.
          </p>
        ) : (
          <div className="news-grid">
            {countryNews.map((newsItem) => (
              <div className="news-card" key={newsItem.id}>
                <div className="news-img-wrapper">
                  <img src={newsItem.imageUrl} alt={newsItem.title} />
                </div>
                <div className="news-content">
                  <h3>{newsItem.title}</h3>
                  <p>{newsItem.description}</p>
                  {newsItem.publishedAt && (
                    <span
                      style={{
                        display: "block",
                        marginBottom: 8,
                        fontSize: 12,
                        opacity: 0.6,
                      }}
                    >
                      {formatNewsDate(newsItem.publishedAt)}
                    </span>
                  )}
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
        )}
      </section>
    </div>
  );
};

export default CountryPage;

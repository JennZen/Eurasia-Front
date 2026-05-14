import { useEffect, useState } from "react";
import "../styles/latest-news.css";
import { Link } from "react-router-dom";
import newsFallback from "../data/latestNewsData";
import { newsApi } from "../services/api";

const formatTime = (iso) => {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

const normalize = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  image: item.imageUrl || item.image,
  time: item.publishedAt ? formatTime(item.publishedAt) : item.time,
  tag: item.tag || "News",
});

const LatestNews = () => {
  const [items, setItems] = useState(() => newsFallback.map(normalize));
  const [source, setSource] = useState("local");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await newsApi.getAll();
        if (!active || !Array.isArray(data)) return;
        setItems(data.map(normalize));
        setSource("live");
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  const featured = items[0];
  const sideNews = items.slice(1, 4);
  const bottomNews = items.slice(4, 9);
  const baseState = { source: "home" };

  return (
    <section className="latest-news">
      <div className="latest-news__container">
        <h2 className="latest-news__title">Latest News</h2>

        <div className="latest-news__grid">
          <div className="latest-news__featured">
            <Link
              to="/latest-news"
              state={{ ...baseState, selectedNewsId: featured.id }}
              className="latest-news__featured-link"
            >
              <div className="latest-news__featured-image">
                <img src={featured.image} alt={featured.title} />
              </div>
              <div className="latest-news__featured-content">
                <span className="latest-news__tag">{featured.tag}</span>
                <h3 className="latest-news__featured-headline">{featured.title}</h3>
                <p className="latest-news__featured-desc">{featured.description}</p>
                <span className="latest-news__time">{featured.time}</span>
              </div>
            </Link>
          </div>

          <div className="latest-news__side">
            {sideNews.map((item) => (
              <Link
                key={item.id}
                to="/latest-news"
                state={{ ...baseState, selectedNewsId: item.id }}
                className="latest-news__side-card"
              >
                <div className="latest-news__side-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="latest-news__side-content">
                  <span className="latest-news__tag">{item.tag}</span>
                  <h3 className="latest-news__side-headline">{item.title}</h3>
                  <p className="latest-news__side-desc">{item.description}</p>
                  <span className="latest-news__time">{item.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="latest-news__bottom">
          {bottomNews.map((item) => (
            <Link
              key={item.id}
              to="/latest-news"
              state={{ ...baseState, selectedNewsId: item.id }}
              className="latest-news__bottom-card"
            >
              <div className="latest-news__bottom-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="latest-news__bottom-content">
                <span className="latest-news__tag">{item.tag}</span>
                <h3 className="latest-news__bottom-headline">{item.title}</h3>
                <p className="latest-news__bottom-desc">{item.description}</p>
                <span className="latest-news__time">{item.time}</span>
              </div>
            </Link>
          ))}
        </div>
        {source === "local" && (
          <p style={{ textAlign: "center", opacity: 0.5, fontSize: 12, marginTop: 8 }}>
            Showing offline news (backend unreachable)
          </p>
        )}
      </div>
    </section>
  );
};

export default LatestNews;

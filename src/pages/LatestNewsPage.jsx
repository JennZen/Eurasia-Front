import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newsFallback from "../data/latestNewsData";
import { newsApi } from "../services/api";
import "../styles/latest-news.css";

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
  detailed_description: item.detailed_description || `<p>${item.description || ""}</p>`,
});

const LatestNewsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [items, setItems] = useState(() => newsFallback.map(normalize));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await newsApi.getAll();
        if (!active || !Array.isArray(data)) return;
        setItems(data.map(normalize));
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.source || !state.selectedNewsId) {
      navigate("/", { replace: true });
    }
  }, [navigate, state]);

  const selected = items.find((item) => item.id === state.selectedNewsId) || items[0];
  if (!selected) return null;

  return (
    <section className="latest-news">
      <div className="latest-news__container">
        <h2 className="latest-news__title">Latest News Detail</h2>

        <div className="latest-news__featured" style={{ borderRight: "none", paddingRight: 0 }}>
          <div className="latest-news__featured-image" style={{ height: 360 }}>
            <img src={selected.image} alt={selected.title} />
          </div>
          <div className="latest-news__featured-content">
            <div dangerouslySetInnerHTML={{ __html: selected.detailed_description }} />
          </div>
        </div>

        <div className="latest-news__bottom" style={{ marginTop: 14 }}>
          {items
            .filter((item) => item.id !== selected.id)
            .map((item) => (
              <Link
                key={item.id}
                to="/latest-news"
                state={{ source: state.source, selectedNewsId: item.id }}
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
      </div>
    </section>
  );
};

export default LatestNewsPage;

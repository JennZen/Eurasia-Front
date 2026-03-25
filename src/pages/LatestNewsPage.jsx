import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newsData from "../data/latestNewsData";
import "../styles/latest-news.css";

const LatestNewsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  useEffect(() => {
    if (!state.source || !state.selectedNewsId) {
      navigate("/", { replace: true });
    }
  }, [navigate, state]);

  const selected = newsData.find((item) => item.id === state.selectedNewsId) || newsData[0];

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
          {newsData
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

import BannerSlider from "../components/BannerSlider";
import ContinentSection from "../components/ContinentSection";
import LatestNews from "../components/LatestNews";
import "../styles/index.css";

const Home = () => {
  return (
    <>
      <BannerSlider />
      <div className="visit-country">
        <div className="container">
          <div className="row">
            <div className="section-heading">
              <p>
                Explore the Wonders of Europe and Asia
                <br />
                Master Geography with us!
              </p>
            </div>
          </div>
        </div>
      </div>
      <ContinentSection />
      <LatestNews />
    </>
  );
};

export default Home;

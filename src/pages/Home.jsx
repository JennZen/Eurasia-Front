import BannerSlider from "../components/BannerSlider";
import ContinentSection from "../components/ContinentSection";
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                <br />
                eiusmod tempor incididunt ut labore.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ContinentSection />
    </>
  );
};

export default Home;

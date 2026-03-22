import AsiaMap from "../components/AsiaMap";
import CountryList from "../components/CountryList";
import "../styles/asia.css";

const Asia = () => {
  return (
    <div className="asia-page">
      <h1 className="page-title"><span>Asia</span></h1>
      <p className="page-description">
        From the Himalayas to the Pacific archipelagos — discover the vast landscapes, ancient cultures, and modern cities of the Asian continent.
      </p>

      <AsiaMap />

      <CountryList continent="Asia" />
    </div>
  );
};

export default Asia;
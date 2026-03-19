import EuropeMap from "../components/EuropeMap";
import CountryList from "../components/CountryList";
import "../styles/europe.css";

const Europe = () => {
  return (
    <div className="europe-page">
      <h1 className="page-title"><span>Europe</span></h1>
      <p className="page-description">
        From the fjords of Scandinavia to the shores of the Mediterranean — explore the countries, borders, and regions that shape the European continent.
      </p>

      <EuropeMap />

      <CountryList continent="Europe" />
    </div>
  );
};

export default Europe;

import EuropeMap from "../components/EuropeMap";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/europe.css";

const Europe = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const openCountryPopup = (countryName, event) => {
    setSelectedCountry(countryName);
    
    // If event is provided (from map click), position popup near click
    if (event && event.clientX && event.clientY) {
      setPopupPosition({
        x: event.clientX,
        y: event.clientY
      });
    } else {
      // Center popup if no event (from flag click)
      setPopupPosition({ x: 0, y: 0 });
    }
  };

  const closeCountryPopup = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="europe-page">
      <div className="europe-header">
        <h1>Explore Europe</h1>
        <p className="subtitle">
          Discover the diversity and beauty of the European continent
        </p>
      </div>

      <div className="europe-content">
        <div className="europe-description">
          <p>
            Europe unfolds as a rich tapestry of culture, history, and terrain —
            from sunlit coastal towns to mist‑shrouded highlands, from ancient
            city squares to quiet, winding lanes.
          </p>
          <p>
            Explore the map to move between countries, trace population patterns,
            and discover the regional character that makes each place distinct.
            Click any country for a closer look at its story and data.
          </p>
        </div>
      </div>

      <EuropeMap onCountryClick={openCountryPopup} />

      {/* Floating Country Popup */}
      {selectedCountry && (
        <div 
          className="country-popup" 
          style={{ 
            zIndex: 1000,
            top: popupPosition.y ? `${popupPosition.y}px` : '50%',
            left: popupPosition.x ? `${popupPosition.x}px` : '50%',
            transform: popupPosition.y ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)'
          }}
        >
          <div className="country-popup-content">
            <button className="country-popup-close" onClick={closeCountryPopup}>
              ×
            </button>
            <div className="country-popup-header">
              <h2><b>{selectedCountry}</b></h2>
            </div>
            <div className="country-popup-actions">
              <Link 
                to={`/country/${selectedCountry.toLowerCase()}`}
                className="country-popup-btn"
                onClick={closeCountryPopup}
              >
                Read more about {selectedCountry}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="europe-tips">
        <h3>💡 Tips for Using the Map</h3>
        <ul>
          <li>
            Click on any country to see its name and add it to your history
          </li>
          <li>
            Use the mode buttons to switch between population heatmap and
            regional views
          </li>
          <li>
            Expand region panels to see all countries in each European region
          </li>
          <li>
            Click on country flags in the panels to fly to that country on the
            map
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Europe;

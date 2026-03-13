import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { regions, regionColors } from "../data/regions";

const EuropeMap = ({ onCountryClick }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const [colorMode, setColorMode] = useState("heat");
  const colorModeRef = useRef(colorMode);
  const [countryHistory, setCountryHistory] = useState([]);
  const [openRegions, setOpenRegions] = useState({});
  const [visibleRegionButtons, setVisibleRegionButtons] = useState(true);
  const [activeRegionButton, setActiveRegionButton] = useState(null);

  const getHeatColor = (pop) => {
    return pop > 80000000
      ? "#800026"
      : pop > 40000000
        ? "#BD0026"
        : pop > 20000000
          ? "#E31A1C"
          : pop > 10000000
            ? "#FC4E2A"
            : "#FD8D3C";
  };

  const getRegionByCountry = (name) => {
    for (const [region, list] of Object.entries(regions)) {
      if (list.some((c) => c.name === name)) return region;
    }
    return null;
  };

  const getRegionColor = (name) => {
    const r = getRegionByCountry(name);
    return r ? regionColors[r] : "#FEEF70";
  };

  const getFlagByCountry = (name) => {
    for (const list of Object.values(regions)) {
      const country = list.find((c) => c.name === name);
      if (country) return country.flag;
    }
    return "";
  };

  const getCountryFill = (feature) => {
    if (colorMode === "heat") {
      return getHeatColor(feature.properties.POP2005);
    }
    return getRegionColor(feature.properties.NAME);
  };

  const getCountryFillRef = (feature) => {
    if (colorModeRef.current === "heat") {
      return getHeatColor(feature.properties.POP2005);
    }
    return getRegionColor(feature.properties.NAME);
  };

  const addCountryToHistory = (feature) => {
    const { NAME, POP2005 } = feature.properties;
    const flag = getFlagByCountry(NAME);
    const region = getRegionByCountry(NAME);
    const color = regionColors[region] || "#FFD700";

    const newCountry = {
      name: NAME,
      population: POP2005,
      flag,
      color,
    };

    setCountryHistory((prev) => {
      const filtered = prev.filter((c) => c.name !== NAME);
      return [newCountry, ...filtered].slice(0, 5);
    });
  };

  const toggleRegion = (regionName) => {
    setOpenRegions((prev) => {
      // If clicking the same region again, close it
      if (prev[regionName]) {
        const newState = { ...prev };
        delete newState[regionName];
        return newState;
      }
      // Otherwise, close all other regions and open this one (exclusive selection)
      return { [regionName]: true };
    });

    // Toggle region button visibility
    setActiveRegionButton((prev) => {
      if (prev === regionName) {
        // If clicking the same button again, show all buttons
        return null;
      } else {
        // If clicking a different button, hide all buttons except this one
        return regionName;
      }
    });
  };

  const flyToCountry = (countryName, center) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, 5);

      // Find and add country to history
      fetch("/src/data/europe.geojson")
        .then((r) => r.json())
        .then((data) => {
          const feature = data.features.find(
            (f) => f.properties.NAME === countryName,
          );
          if (feature) {
            addCountryToHistory(feature);
          }
        });
    }
  };

  const openCountryModal = (feature, event) => {
    const { NAME } = feature.properties;
    
    // Call parent component to open popup
    if (onCountryClick) {
      onCountryClick(NAME);
    }
  };


  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([54, 15], 4);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    mapInstanceRef.current = map;

    // Load GeoJSON
    fetch("/src/data/europe.geojson")
      .then((r) => r.json())
      .then((data) => {
        const geoLayer = L.geoJSON(data, {
          style: (f) => ({
            fillColor: getCountryFill(f),
            weight: 1,
            color: "#444",
            fillOpacity: 0.9,
          }),
          onEachFeature: (feature, layer) => {
            const highlightStyle = {
              fillColor: "#FFD700",
              weight: 2,
              color: "#FF8C00",
              fillOpacity: 0.8,
            };

            layer.on("mouseover", () => layer.setStyle(highlightStyle));
            layer.on("mouseout", () => {
              layer.setStyle({
                fillColor: getCountryFillRef(feature),
                weight: 1,
                color: "#444",
                fillOpacity: 0.9,
              });
            });

            layer.on("click", (e) => {
              addCountryToHistory(feature);
              openCountryModal(feature, e);
            });
          },
        }).addTo(map);

        geoLayerRef.current = geoLayer;
      });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    colorModeRef.current = colorMode;
    if (geoLayerRef.current) {
      geoLayerRef.current.eachLayer((layer) => {
        layer.setStyle({
          fillColor: getCountryFillRef(layer.feature),
          weight: 1,
          color: "#444",
          fillOpacity: 0.9,
        });
      });
    }
  }, [colorMode]);

  return (
    <div className="main-container">
      <div className="map-container" ref={mapContainerRef}>
        <div className="country-info">
          <h2 className="history-title">History</h2>
          {countryHistory.map((country, index) => (
            <div
              key={`${country.name}-${index}`}
              className="country-card-info"
              style={{ borderLeft: `4px solid ${country.color}` }}
            >
              <div className="flag">
                <img src={country.flag} alt={country.name} />
              </div>
              <div className="info">
                <h3>{country.name}</h3>
                <p>
                  <strong>Population:</strong>{" "}
                  {country.population.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="map" ref={mapRef} id="map"></div>

        <div className={`map-section ${activeRegionButton ? "has-active-region" : ""}`}>
          {activeRegionButton ? (
            <>
              <button
                onClick={() => toggleRegion(activeRegionButton)}
                className="region-btn region-btn-active"
              >
                <span className="btn-text">
                  {activeRegionButton.charAt(0).toUpperCase() +
                    activeRegionButton.slice(1)}{" "}
                  Europe
                </span>
                <i
                  className="fas fa-arrow-up arrow-icon rotated"
                  style={{ transform: "rotate(180deg)" }}
                ></i>
              </button>
              <div className="region-panel open">
                {regions[activeRegionButton].map((country) => (
                  <div
                    key={country.name}
                    className="country-flag"
                    onClick={(e) => {
                      // Call parent component to open popup
                      if (onCountryClick) {
                        onCountryClick(country.name);
                      }
                      flyToCountry(country.name, country.center);
                    }}
                  >
                    <img src={country.flag} alt={country.name} />
                    <span>{country.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            Object.keys(regions).map((regionKey) => (
              <button
                key={regionKey}
                onClick={() => toggleRegion(regionKey)}
                className="region-btn"
              >
                <span className="btn-text">
                  {regionKey.charAt(0).toUpperCase() + regionKey.slice(1)}{" "}
                  Europe
                </span>
                <i
                  className="fas fa-arrow-up arrow-icon"
                  style={{ transform: "rotate(0deg)" }}
                ></i>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Mode Control Buttons */}
      <div className="mode-control-container">
        <button
          className={`mode-btn ${colorMode === "heat" ? "active" : ""}`}
          onClick={() => {
            setColorMode("heat");
            mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          🔥 Heat
        </button>
        <button
          className={`mode-btn ${colorMode === "region" ? "active" : ""}`}
          onClick={() => {
            setColorMode("region");
            mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          🌍 Groups
        </button>
      </div>

    </div>
  );
};

export default EuropeMap;

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { asiaRegions, asiaRegionColors } from "../data/asiaRegions";

const AsiaMap = () => {
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
    return pop > 500000000
      ? "#800026"
      : pop > 200000000
        ? "#BD0026"
        : pop > 100000000
          ? "#E31A1C"
          : pop > 50000000
            ? "#FC4E2A"
            : "#FD8D3C";
  };

  const getRegionByCountry = (name) => {
    for (const [region, list] of Object.entries(asiaRegions)) {
      if (list.some((c) => c.name === name)) return region;
    }
    return null;
  };

  const getRegionColor = (name) => {
    const r = getRegionByCountry(name);
    return r ? asiaRegionColors[r] : "#FEEF70";
  };

  const getFlagByCountry = (name) => {
    for (const list of Object.values(asiaRegions)) {
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
    const color = asiaRegionColors[region] || "#FFD700";

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
      if (prev[regionName]) {
        const newState = { ...prev };
        delete newState[regionName];
        return newState;
      }
      return { [regionName]: true };
    });

    setActiveRegionButton((prev) => {
      if (prev === regionName) {
        return null;
      } else {
        return regionName;
      }
    });
  };

  const regionLabels = {
    eastern: "East",
    southeastern: "Southeast",
    southern: "South",
    central: "Central",
    western: "West",
  };

  const flyToCountry = (countryName, center) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, 5);

      fetch("/src/data/asia.geojson")
        .then((r) => r.json())
        .then((data) => {
          const feature = data.features.find(
            (f) => f.properties.NAME === countryName,
          );
          if (feature) {
            addCountryToHistory(feature);
            openCountryPopup(feature, center);
          }
        });
    }
  };

  const openCountryPopup = (feature, latlng) => {
    const { NAME } = feature.properties;
    const slug = NAME.toLowerCase().replace(/\s+/g, "%20");

    L.popup({ className: "country-leaflet-popup" })
      .setLatLng(latlng)
      .setContent(
        `<div class="country-popup-content">
          <div class="country-popup-header"><h2><b>${NAME}</b></h2></div>
          <div class="country-popup-actions">
            <a href="/country/${slug}" class="country-popup-btn">Read more about ${NAME}</a>
          </div>
        </div>`
      )
      .openOn(mapInstanceRef.current);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([30, 80], 3);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    mapInstanceRef.current = map;

    fetch("/src/data/asia.geojson")
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
              openCountryPopup(feature, e.latlng);
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

        <div className="map" ref={mapRef} id="asia-map"></div>

        <div className={`map-section ${activeRegionButton ? "has-active-region" : ""}`}>
          {activeRegionButton ? (
            <>
              <button
                onClick={() => toggleRegion(activeRegionButton)}
                className="region-btn region-btn-active"
              >
                <span className="btn-text">
                  {regionLabels[activeRegionButton]} Asia
                </span>
                <i
                  className="fas fa-arrow-up arrow-icon rotated"
                  style={{ transform: "rotate(180deg)" }}
                ></i>
              </button>
              <div className="region-panel open">
                {asiaRegions[activeRegionButton].map((country) => (
                  <div
                    key={country.name}
                    className="country-flag"
                    onClick={() => {
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
            Object.keys(asiaRegions).map((regionKey) => (
              <button
                key={regionKey}
                onClick={() => toggleRegion(regionKey)}
                className="region-btn"
              >
                <span className="btn-text">
                  {regionLabels[regionKey]} Asia
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
          Heat
        </button>
        <button
          className={`mode-btn ${colorMode === "region" ? "active" : ""}`}
          onClick={() => {
            setColorMode("region");
            mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          Groups
        </button>
      </div>

    </div>
  );
};

export default AsiaMap;

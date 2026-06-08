import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { countriesApi } from "../services/api";

const regionColors = {
  northern: "#4FC3F7",
  western: "#81C784",
  southern: "#FFB74D",
  eastern: "#BA68C8",
  central: "#E57373",
};

const buildRegionsFromApi = (apiCountries) => {
  const grouped = {};
  // Server already filtered by continentIds=Europe — no need to re-check c.continents.
  apiCountries.forEach((c) => {
      const region = Array.isArray(c.regions) && c.regions.length
        ? String(c.regions[0]).toLowerCase()
        : null;
      if (!region) return;
      const entry = {
        name: c.name,
        // DTO has no lat/lng — flyToCountry resolves the real polygon bounds;
        // this is only the last-resort anchor when no polygon exists.
        center: [54, 15],
        flag: c.flagUrl || "",
      };
      if (!grouped[region]) grouped[region] = [];
      grouped[region].push(entry);
    });
  return grouped;
};

// Forgiving "title case" — used for region button labels when the DB returns
// a multi-word key (e.g. "south-eastern" -> "South Eastern").
const prettifyRegionKey = (key) =>
  String(key)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const EuropeMap = () => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const geoDataRef = useRef(null);
  const continentBoundsRef = useRef(null);
  const [colorMode, setColorMode] = useState("heat");
  const colorModeRef = useRef(colorMode);
  const [countryHistory, setCountryHistory] = useState([]);
  const [openRegions, setOpenRegions] = useState({});
  const [visibleRegionButtons, setVisibleRegionButtons] = useState(true);
  const [activeRegionButton, setActiveRegionButton] = useState(null);
  const [apiRegions, setApiRegions] = useState(null);

  const regions = useMemo(() => apiRegions || {}, [apiRegions]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await countriesApi.getByContinent("Europe");
        if (!active || !Array.isArray(data)) return;
        const built = buildRegionsFromApi(data);
        if (Object.keys(built).length) setApiRegions(built);
      } catch {
        /* backend unreachable — region panel stays empty */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
    const map = mapInstanceRef.current;
    const geoLayer = geoLayerRef.current;
    if (!map) return;

    map.closePopup();

    // Find the country's polygon layer — its bounds are the source of truth for
    // both the destination and the popup anchor. Using the polygon means we
    // never fly into a spot where the country isn't actually drawn.
    let targetLayer = null;
    let targetFeature = null;
    if (geoLayer) {
      geoLayer.eachLayer((layer) => {
        if (!targetLayer && layer.feature?.properties?.NAME === countryName) {
          targetLayer = layer;
          targetFeature = layer.feature;
        }
      });
    }

    const finish = (latlng) => {
      if (targetFeature) {
        addCountryToHistory(targetFeature);
        openCountryPopup(targetFeature, latlng);
      }
    };

    if (targetLayer) {
      const layerBounds = targetLayer.getBounds();
      const anchor = layerBounds.getCenter();
      // flyToBounds frames the whole country with a small padding — every
      // neighbouring polygon stays in view and painted.
      map.flyToBounds(layerBounds, {
        padding: [40, 40],
        maxZoom: 6,
        duration: 1.2,
        easeLinearity: 0.25,
      });
      map.once("moveend", () => finish(anchor));
      return;
    }

    // Fallback: no polygon in our continent geojson — clamp the fallback centre
    // to continent bounds so we still stay in painted territory.
    const cBounds = continentBoundsRef.current;
    let targetLatLng = L.latLng(center[0], center[1]);
    if (cBounds && !cBounds.contains(targetLatLng)) {
      targetLatLng = L.latLng(
        Math.min(Math.max(targetLatLng.lat, cBounds.getSouth()), cBounds.getNorth()),
        Math.min(Math.max(targetLatLng.lng, cBounds.getWest()), cBounds.getEast()),
      );
    }
    map.flyTo(targetLatLng, 5, {
      animate: true,
      duration: 1.2,
      easeLinearity: 0.25,
    });
    map.once("moveend", () => finish(targetLatLng));
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

    // SVG renderer (Leaflet's default) keeps every country polygon painted as a
    // separate element — it doesn't get repainted on pan/zoom, so colours stay
    // visible during motion. Canvas was tried and caused a noticeable
    // "uncoloured flash" because Leaflet redraws the whole canvas per frame.
    //
    // The SVG renderer only paints polygons inside a "padding" buffer around the
    // current viewport (default 0.1 = 10%). While dragging, the freshly exposed
    // edge of the map falls outside that buffer and shows up blank/uncoloured —
    // Leaflet only re-renders the SVG on `moveend` (when you release the cursor).
    // Bumping the padding to 2 pre-renders an area ~2x the viewport on every side,
    // so the colours stay painted throughout the drag instead of after it.
    const map = L.map(mapRef.current, {
      zoomAnimation: true,
      fadeAnimation: false,
      renderer: L.svg({ padding: 2 }),
    }).setView([54, 15], 4);

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
        geoDataRef.current = data;
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

        // Lock the map to the continent so flyTo / pan / scroll-zoom can't drift
        // into territory that has no painted features (Asia, Africa, ocean).
        const bounds = geoLayer.getBounds();
        if (bounds.isValid()) {
          const padded = bounds.pad(0.08);
          continentBoundsRef.current = padded;
          map.setMaxBounds(padded);
          const fitZoom = map.getBoundsZoom(padded);
          map.setMinZoom(fitZoom);
          // Snap to the continent immediately — every painted country is in view
          // from frame one, so the user never sees the half-rendered default
          // [54, 15] zoom-4 viewport.
          map.fitBounds(padded, { animate: false });
        }
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
                  {prettifyRegionKey(activeRegionButton)}
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
            Object.keys(regions).map((regionKey) => (
              <button
                key={regionKey}
                onClick={() => toggleRegion(regionKey)}
                className="region-btn"
              >
                <span className="btn-text">
                  {prettifyRegionKey(regionKey)}
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

export default EuropeMap;

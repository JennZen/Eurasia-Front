import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { quizApi, countriesApi } from "../services/api";
import { useAuth } from "../admin/AdminAuthContext";
import "../styles/quiz.css";

const TOTAL_TIME = 15 * 60;

const aliases = {
  uk: "United Kingdom",
  england: "United Kingdom",
  britain: "United Kingdom",
  "great britain": "United Kingdom",
  "south korea": "South Korea",
  "north korea": "North Korea",
  "sri lanka": "Sri Lanka",
  uae: "United Arab Emirates",
  czech: "Czech Republic",
  czechia: "Czech Republic",
  "bosnia": "Bosnia and Herzegovina",
  "herzegovina": "Bosnia and Herzegovina",
  "timor-leste": "East Timor",
  "timor leste": "East Timor",
  "north macedonia": "North Macedonia",
  "macedonia": "North Macedonia",
};

// GeoJSON names not present in our quiz data — skip them
const geoExclusions = new Set([
  "Holy See (Vatican City)",
  "San Marino",
  "Faroe Islands",
  "Andorra",
  "Liechtenstein",
  "Malta",
  "Monaco",
  "Palestine",
  "Hong Kong S.A.R.",
]);

// GeoJSON NAME -> quiz name (where they differ)
const geoNameMap = {
  "Republic of Moldova": "Moldova",
  "The former Yugoslav Republic of Macedonia": "North Macedonia",
};

const DEFAULT_STYLE = {
  fillColor: "transparent",
  fillOpacity: 0,
  weight: 1,
  color: "rgba(255,255,255,0.15)",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const Quiz = () => {
  const { user } = useAuth();
  const [guessed, setGuessed] = useState(new Set());
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [gameStatus, setGameStatus] = useState("idle");
  const [lastGuessed, setLastGuessed] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [bestRecord, setBestRecord] = useState(null);
  // Backend-supplied quiz dataset: name, continent and flag per country.
  const [quizCountries, setQuizCountries] = useState([]);

  useEffect(() => {
    let active = true;
    countriesApi
      .getAll()
      .then((list) => {
        if (!active || !Array.isArray(list)) return;
        setQuizCountries(
          list.map((c) => ({
            name: c.name,
            continent:
              Array.isArray(c.continents) && c.continents.length
                ? c.continents[0]
                : c.continent || "",
            flag: c.flagUrl || "",
          }))
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const totalCount = quizCountries.length;

  const nameLookup = useMemo(() => {
    const map = {};
    quizCountries.forEach((c) => {
      map[c.name.toLowerCase()] = c.name;
    });
    Object.entries(aliases).forEach(([alias, en]) => {
      if (map[en.toLowerCase()]) map[alias.toLowerCase()] = en;
    });
    return map;
  }, [quizCountries]);

  // resolveGeoName is called from Leaflet callbacks created in initMap (stable
  // closure), so the quiz-name set lives in a ref to stay current.
  const quizNameSetRef = useRef(new Set());
  useEffect(() => {
    quizNameSetRef.current = new Set(quizCountries.map((c) => c.name));
  }, [quizCountries]);

  const resolveGeoName = useCallback((geoName) => {
    if (geoExclusions.has(geoName)) return null;
    const mapped = geoNameMap[geoName] || geoName;
    return quizNameSetRef.current.has(mapped) ? mapped : null;
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    quizApi
      .getUserBestRecord(user.id)
      .then((r) => active && setBestRecord(r))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.id]);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayersRef = useRef({});
  const guessedRef = useRef(new Set());
  const gameStatusRef = useRef("idle");
  const timeLeftRef = useRef(TOTAL_TIME);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback(() => {
    stopTimer();
    setGameStatus("ended");
    gameStatusRef.current = "ended";
    if (user?.id) {
      const elapsed = TOTAL_TIME - timeLeftRef.current;
      void quizApi
        .updateResult({
          countriesGuessed: guessedRef.current.size,
          timeSpentSeconds: elapsed,
          totalCountries: totalCount,
        })
        .then((r) => setBestRecord(r))
        .catch(() => {});
    }
  }, [stopTimer, user?.id, totalCount]);

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft <= 0) endGame();
  }, [timeLeft, gameStatus, endGame]);

  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          timeLeftRef.current = next;
          return next;
        });
      }, 1000);
      return stopTimer;
    }
  }, [gameStatus, stopTimer]);

  useEffect(() => {
    if (gameStatus === "playing" && totalCount > 0 && guessed.size === totalCount)
      endGame();
  }, [guessed, gameStatus, endGame, totalCount]);

  // Initialize map only once the game has started (div is visible)
  const initMap = useCallback(() => {
    if (mapInstanceRef.current) {
      // Map already exists — just invalidate size and reset styles
      setTimeout(() => mapInstanceRef.current.invalidateSize(), 100);
      return;
    }
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [45, 60],
      zoom: 3,
      minZoom: 2,
      maxZoom: 7,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; CARTO", subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    mapInstanceRef.current = map;

    const loadGeo = (url) =>
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          L.geoJSON(data, {
            style: () => DEFAULT_STYLE,
            onEachFeature: (feature, layer) => {
              const quizName = resolveGeoName(feature.properties.NAME);
              if (quizName) {
                if (!geoLayersRef.current[quizName]) {
                  geoLayersRef.current[quizName] = [];
                }
                geoLayersRef.current[quizName].push(layer);

                layer.on("click", (e) => {
                  const status = gameStatusRef.current;
                  const wasGuessed = guessedRef.current.has(quizName);
                  // During the game: popup only for already guessed (blue) countries.
                  // After the game: popup for all countries (guessed + missed).
                  if (status !== "ended" && !wasGuessed) return;
                  L.popup({ className: "quiz-popup" })
                    .setLatLng(e.latlng)
                    .setContent(
                      `<div class="quiz-popup-content ${wasGuessed ? "quiz-popup-guessed" : "quiz-popup-missed"}">
                        <strong>${quizName}</strong>
                        <span>${wasGuessed ? "✓" : "✗"}</span>
                      </div>`
                    )
                    .openOn(map);
                });
              }
            },
          }).addTo(map);
        });

    Promise.all([
      loadGeo("/src/data/europe.geojson"),
      loadGeo("/src/data/asia.geojson"),
    ]).then(() => setMapReady(true));
  }, [resolveGeoName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Highlight guessed countries on map
  useEffect(() => {
    guessedRef.current = guessed;
    if (!mapReady) return;
    guessed.forEach((name) => {
      const layers = geoLayersRef.current[name];
      if (layers) {
        layers.forEach((layer) => {
          layer.setStyle({
            fillColor: "#22b3c1",
            fillOpacity: 0.7,
            weight: 1.5,
            color: "#4fc3f7",
          });
          const el = layer.getElement && layer.getElement();
          if (el) el.classList.add("quiz-country-clickable");
        });
      }
    });
  }, [guessed, mapReady]);

  // On game end, show missed countries in red
  useEffect(() => {
    if (gameStatus === "ended" && mapReady) {
      Object.entries(geoLayersRef.current).forEach(([name, layers]) => {
        if (!guessedRef.current.has(name)) {
          layers.forEach((layer) => {
            layer.setStyle({
              fillColor: "#e74c3c",
              fillOpacity: 0.5,
              weight: 1,
              color: "#c0392b",
            });
            const el = layer.getElement && layer.getElement();
            if (el) el.classList.add("quiz-country-clickable");
          });
        }
      });
    }
  }, [gameStatus, mapReady]);

  const resetMap = () => {
    Object.values(geoLayersRef.current).forEach((layers) => {
      layers.forEach((layer) => {
        layer.setStyle(DEFAULT_STYLE);
        const el = layer.getElement && layer.getElement();
        if (el) el.classList.remove("quiz-country-clickable");
      });
    });
    if (mapInstanceRef.current) mapInstanceRef.current.closePopup();
  };

  const startGame = () => {
    setGuessed(new Set());
    guessedRef.current = new Set();
    setInput("");
    setTimeLeft(TOTAL_TIME);
    timeLeftRef.current = TOTAL_TIME;
    setGameStatus("playing");
    gameStatusRef.current = "playing";
    setLastGuessed(null);
    resetMap();
    // Init map after React renders the visible div
    setTimeout(() => {
      initMap();
      inputRef.current?.focus();
    }, 50);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);

    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return;

    const matched = nameLookup[trimmed];
    if (matched && !guessed.has(matched)) {
      setGuessed((prev) => new Set(prev).add(matched));
      setLastGuessed(matched);
      setInput("");
    }
  };

  const giveUp = () => endGame();

  const grouped = {
    Europe: quizCountries.filter((c) => c.continent === "Europe"),
    Asia: quizCountries.filter((c) => c.continent === "Asia"),
  };

  const isEnded = gameStatus === "ended";
  const isPlaying = gameStatus === "playing";
  const isIdle = gameStatus === "idle";
  const showMap = isPlaying || isEnded;

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <h1 className="quiz-title">Countries of Eurasia</h1>
        <p className="quiz-subtitle">
          Can you name all {totalCount} countries of Europe and Asia?
        </p>

        {isIdle && (
          <div className="quiz-start-section">
            <p className="quiz-rules">
              You have <strong>15 minutes</strong> to name as many countries as
              you can. Type the country name in English.
            </p>
            {user?.id && bestRecord && (
              <p className="quiz-best-record">
                <i className="fas fa-trophy"></i> Your best:{" "}
                <strong>{bestRecord.maxCountriesGuessed}</strong> /{" "}
                {totalCount} in{" "}
                <strong>{formatTime(bestRecord.bestTimeSeconds)}</strong>
              </p>
            )}
            <button
              className="quiz-btn quiz-btn-start"
              onClick={startGame}
              disabled={totalCount === 0}
            >
              <i className="fas fa-play"></i>{" "}
              {totalCount === 0 ? "Loading countries…" : "Start Quiz"}
            </button>
          </div>
        )}

        {showMap && (
          <>
            <div className="quiz-stats-bar">
              <div
                className={`quiz-timer ${timeLeft <= 60 ? "timer-warning" : ""}`}
              >
                <i className="fas fa-clock"></i> {formatTime(timeLeft)}
              </div>
              <div className="quiz-score">
                <i className="fas fa-check-circle"></i> {guessed.size} /{" "}
                {totalCount}
              </div>
              <div className="quiz-progress-bar">
                <div
                  className="quiz-progress-fill"
                  style={{
                    width: `${(guessed.size / totalCount) * 100}%`,
                  }}
                />
              </div>
            </div>

            {isPlaying && (
              <div className="quiz-input-section">
                <input
                  ref={inputRef}
                  type="text"
                  className="quiz-input"
                  placeholder="Type a country name..."
                  value={input}
                  onChange={handleInput}
                  autoComplete="off"
                  autoFocus
                />
                <button className="quiz-btn quiz-btn-giveup" onClick={giveUp}>
                  <i className="fas fa-flag"></i> Give Up
                </button>
              </div>
            )}

            {isEnded && (
              <div className="quiz-end-section">
                {guessed.size === totalCount ? (
                  <p className="quiz-result quiz-result-perfect">
                    <i className="fas fa-trophy"></i> Congratulations! You named
                    all {totalCount} countries!
                  </p>
                ) : (
                  <p className="quiz-result">
                    You named <strong>{guessed.size}</strong> out of{" "}
                    <strong>{totalCount}</strong> countries in{" "}
                    {formatTime(TOTAL_TIME - timeLeft)}
                  </p>
                )}
                {user?.id && bestRecord && (
                  <p className="quiz-best-record">
                    <i className="fas fa-trophy"></i> Personal best:{" "}
                    <strong>{bestRecord.maxCountriesGuessed}</strong> /{" "}
                    {totalCount} in{" "}
                    <strong>{formatTime(bestRecord.bestTimeSeconds)}</strong>
                  </p>
                )}
                <button className="quiz-btn quiz-btn-start" onClick={startGame}>
                  <i className="fas fa-redo"></i> Play Again
                </button>
              </div>
            )}

            {lastGuessed && isPlaying && (
              <div className="quiz-last-guessed">+ {lastGuessed}</div>
            )}

            <div className="quiz-map-wrapper">
              <div ref={mapRef} className="quiz-map"></div>
            </div>

            {Object.entries(grouped).map(([continent, countries]) => (
              <div key={continent} className="quiz-continent-section">
                <h2 className="quiz-continent-title">
                  {continent}
                  <span className="quiz-continent-count">
                    {countries.filter((c) => guessed.has(c.name)).length} /{" "}
                    {countries.length}
                  </span>
                </h2>
                <div className="quiz-countries-grid">
                  {countries.map((c) => {
                    const isGuessed = guessed.has(c.name);
                    const isMissed = isEnded && !isGuessed;
                    return (
                      <div
                        key={c.name}
                        className={`quiz-country-cell ${
                          isGuessed ? "guessed" : ""
                        } ${isMissed ? "missed" : ""}`}
                      >
                        {isGuessed || isEnded ? (
                          <>
                            <img src={c.flag} alt="" className="quiz-flag" />
                            <span>{c.name}</span>
                          </>
                        ) : (
                          <span className="quiz-hidden">???</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;

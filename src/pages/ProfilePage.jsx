import React, { useState, useEffect } from "react";
import {
  getUserProfile,
  getFavoriteCountries,
  getFavoriteAttractions,
  updateUserProfile,
} from "../services/mockUserService";

const regionColor = {
  "East Asia": "region-asia",
  "Southern Europe": "region-europe",
  "Western Europe": "region-europe",
  "Southeast Asia": "region-southeastasia",
};

const regionMapping = {
  Japan: "East Asia",
  "South Korea": "East Asia",
  Thailand: "Southeast Asia",
  France: "Western Europe",
  Germany: "Western Europe",
  Italy: "Southern Europe",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("countries");
  const [countries, setCountries] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, favCountries, favAttractions] = await Promise.all([
          getUserProfile(),
          getFavoriteCountries(),
          getFavoriteAttractions(),
        ]);

        setUser(userData);
        setAttractions(favAttractions);

        const adapted = favCountries.map((c) => ({
          id: c.id,
          code: c.name.substring(0, 2).toUpperCase(),
          name: c.name,
          city: c.capital,
          region: regionMapping[c.name] || "Default",
          description: c.summary,
          population: `${(c.population / 1000000).toFixed(0)}M`,
          currency: c.currency,
          flagUrl: c.flagUrl,
        }));

        setCountries(adapted);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const removeCountry = (id) => {
    setCountries((prev) => prev.filter((c) => c.id !== id));
  };

  const removeAttraction = (id) => {
    setAttractions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEditOpen = () => {
    setFormData({ name: user.name, phone: user.phone || "", avatarUrl: user.avatarUrl || "" });
    setIsEditing(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
    }
  };

  const handleSave = async () => {
    try {
      const updated = await updateUserProfile(formData);
      setUser(updated);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="card profile-header loading-skeleton">
            <div className="skeleton-row">
              <div className="skeleton-avatar" />
              <div className="skeleton-lines">
                <div className="skeleton-line w60" />
                <div className="skeleton-line w40" />
              </div>
            </div>
            <div className="profile-stats">
              <div className="skeleton-line w30" />
              <div className="skeleton-line w30" />
              <div className="skeleton-line w30" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* HEADER */}
        <div className="card profile-header">
          <div className="profile-top">
            <div className="profile-user">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
              ) : (
                <div className="avatar">{initials}</div>
              )}
              <div>
                <div className="profile-name-row">
                  <h1 className="profile-name">{user.name}</h1>
                  <span className="badge">Traveler</span>
                </div>
                <div className="profile-meta">
                  <span>{user.email}</span>
                  {user.phone && <span> &middot; {user.phone}</span>}
                </div>
              </div>
            </div>
            <button className="btn btn-ghost" onClick={handleEditOpen}>
              Edit Profile
            </button>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-number">{countries.length}</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat">
              <div className="stat-number">{attractions.length}</div>
              <div className="stat-label">Attractions</div>
            </div>
            <div className="stat">
              <div className="stat-number">2025</div>
              <div className="stat-label">Member Since</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          {[
            { id: "countries", label: "Countries", icon: "fa-globe-americas" },
            { id: "attractions", label: "Attractions", icon: "fa-map-marker-alt" },
            { id: "info", label: "About", icon: "fa-user" },
          ].map((t) => (
            <div
              key={t.id}
              className={`tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <i className={`fas ${t.icon}`} style={{ marginRight: 8, fontSize: 14 }} />
              {t.label}
            </div>
          ))}
        </div>

        {/* COUNTRIES TAB */}
        {activeTab === "countries" && (
          <div className="country-grid">
            {countries.length === 0 ? (
              <div className="empty-state">
                No favorite countries yet. Start exploring!
              </div>
            ) : (
              countries.map((c) => (
                <div
                  key={c.id}
                  className="card card-hover country-card-v2"
                >
                  <div className="country-card-img-wrap">
                    <img
                      src={c.flagUrl}
                      alt={`${c.name} flag`}
                      className="country-card-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="country-card-img-overlay" />
                    <span className="country-card-region">{c.region}</span>
                    <button
                      className="country-card-remove"
                      onClick={() => removeCountry(c.id)}
                      title="Remove"
                    >
                      &times;
                    </button>
                    <div className="country-card-img-bottom">
                      <h3 className="country-card-name">{c.name}</h3>
                      <p className="country-card-capital">
                        <i className="fas fa-map-pin" style={{ marginRight: 6 }} />
                        {c.city}
                      </p>
                    </div>
                  </div>
                  <div className="country-card-body">
                    <p className="country-card-desc">{c.description}</p>
                    <div className="country-card-meta">
                      <div className="country-card-meta-item">
                        <i className="fas fa-users" />
                        <div>
                          <span className="country-card-meta-label">Population</span>
                          <span className="country-card-meta-value">{c.population}</span>
                        </div>
                      </div>
                      <div className="country-card-meta-item">
                        <i className="fas fa-coins" />
                        <div>
                          <span className="country-card-meta-label">Currency</span>
                          <span className="country-card-meta-value">{c.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ATTRACTIONS TAB */}
        {activeTab === "attractions" && (
          <div className="attractions-grid">
            {attractions.length === 0 ? (
              <div className="empty-state">
                No favorite attractions yet.
              </div>
            ) : (
              attractions.map((a) => (
                <div key={a.id} className="card card-hover attraction-card">
                  <div className="attraction-img-wrap">
                    <img
                      src={a.imageUrl}
                      alt={a.name}
                      className="attraction-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="attraction-img-overlay" />
                    <span className="attraction-rating">
                      <i className="fas fa-star" style={{ marginRight: 4 }} />
                      {a.rating}
                    </span>
                    <button
                      className="attraction-remove"
                      onClick={() => removeAttraction(a.id)}
                      title="Remove"
                    >
                      &times;
                    </button>
                    <div className="attraction-img-bottom">
                      <h3 className="attraction-title">{a.name}</h3>
                      <p className="attraction-location">
                        <i className="fas fa-map-pin" style={{ marginRight: 6 }} />
                        {a.city}
                      </p>
                    </div>
                  </div>
                  <div className="attraction-body">
                    <p className="attraction-desc">{a.description}</p>
                    <div className="attraction-meta">
                      <div className="attraction-meta-item">
                        <i className="fas fa-clock" />
                        <span>{a.duration}</span>
                      </div>
                      <div className="attraction-meta-item">
                        <i className="fas fa-sun" />
                        <span>{a.bestTimeToVisit}</span>
                      </div>
                      <div className="attraction-meta-item">
                        <i className="fas fa-door-open" />
                        <span>{a.openingHours}</span>
                      </div>
                    </div>
                    <div className="attraction-footer">
                      <span className="attraction-price-tag">
                        <span className="attraction-price-label">from</span>
                        ${a.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="info-section">
            <div className="card info-card">
              <h3 className="info-title">Profile Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{user.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEditing && (
          <div className="modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Edit Profile</h2>

              <div className="modal-avatar-section">
                <div className="modal-avatar-preview">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="modal-avatar-img" />
                  ) : (
                    <div className="modal-avatar-placeholder">{initials}</div>
                  )}
                </div>
                <div className="modal-avatar-actions">
                  <label className="btn btn-secondary btn-sm modal-avatar-btn">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      hidden
                    />
                  </label>
                  {formData.avatarUrl && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: "" }))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <label className="modal-label">
                Full Name
                <input
                  type="text"
                  className="profile-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>

              <label className="modal-label">
                Phone
                <input
                  type="tel"
                  className="profile-input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </label>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

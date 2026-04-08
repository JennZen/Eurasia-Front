import React, { useState, useEffect } from "react";
import { getUserProfile, getFavoriteCountries } from '../services/mockUserService';

/* ================= REGION COLORS ================= */

const regionColor = {
  "Восточная Азия": "region-asia",
  "Южная Европа": "region-europe",
  "Западная Европа": "region-europe",
  "Юго-Восточная Азия": "region-southeastasia",
};

/* ================= COMPONENTS ================= */

const ProfileHeader = () => (
  <div className="card profile-header">
    <div className="profile-top">
      <div className="profile-user">
        <div className="avatar">
          AK
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 className="profile-name">
              Алексей Куртев
            </h1>

            <span className="badge">
              Участник
            </span>
          </div>

          <div className="profile-meta">
            <div>alexey.kurtev@mail.ru</div>
            <div>+373 69 123 456</div>
          </div>
        </div>
      </div>

      <button className="edit-btn">
        Редактировать
      </button>
    </div>

    {/* STATS */}
    <div className="profile-stats">
      {[
        ["4", "Стран"],
        ["7", "Мест"],
        ["2025", "С нами с"],
      ].map(([value, label]) => (
        <div key={label}>
          <div className="stat-number">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  </div>
);

const Tabs = ({ active, setActive }) => {
  const tabs = [
    { id: "countries", label: "Страны" },
    { id: "places", label: "Достопримечательности" },
    { id: "info", label: "Информация" },
  ];

  return (
    <div className="tabs">
      {tabs.map(t => (
        <div
          key={t.id}
          onClick={() => setActive(t.id)}
          className={`tab ${active === t.id ? 'active' : ''}`}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
};

const CountryCard = ({ country }) => (
  <div className={`card card-hover country-card ${regionColor[country.region] || 'region-default'}`}>

    <div className="country-top">
      <div className="country-code">
        {country.code}
      </div>

      <button className="country-remove">
        ×
      </button>
    </div>

    <h3 className="country-title">
      {country.name}
    </h3>

    <p className="country-subtitle">
      {country.city} · {country.region}
    </p>

    <p className="country-description">
      {country.description}
    </p>

    <div className="pills">
      <span className="pill">{country.population}</span>
      <span className="pill">{country.currency}</span>
      <span className="pill">{country.area}</span>

      <span className="date-added">
        + {country.date}
      </span>
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("countries");
  const [countries, setCountries] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, favCountries] = await Promise.all([
          getUserProfile(),
          getFavoriteCountries()
        ]);

        setUser(userData);

        // Адаптируем данные стран к формату компонента
        const adaptedCountries = favCountries.map(country => {
          // Маппинг стран к регионам
          const regionMapping = {
            'Japan': 'Восточная Азия',
            'South Korea': 'Восточная Азия',
            'Thailand': 'Юго-Восточная Азия',
            'France': 'Западная Европа',
            'Germany': 'Западная Европа',
            'Italy': 'Южная Европа',
          };

          const region = regionMapping[country.name] || 'Default';

          return {
            id: country.id,
            code: country.name.substring(0, 2).toUpperCase(), // JP, IT, etc.
            name: country.name,
            city: country.capital,
            region: region,
            description: country.summary,
            population: `${(country.population / 1000000).toFixed(0)} млн`,
            currency: country.currency,
            area: 'Unknown', // Нет данных
            date: 'Unknown', // Нет данных
          };
        });

        setCountries(adaptedCountries);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const removeCountry = (id) => {
    setCountries((prev) => prev.filter((c) => c.id !== id));
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card p-8 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="flex gap-5 items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-56 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 text-center mt-10">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ProfileHeader />
      <Tabs active={activeTab} setActive={setActiveTab} />

      {activeTab === "countries" && (
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {countries.map(c =>
            <CountryCard key={c.id} country={c} />
          )}
        </div>
      )}

      {activeTab === "places" && (
        <div className="mt-10 text-gray-500">
          Здесь будут достопримечательности
        </div>
      )}

      {activeTab === "info" && (
        <div className="mt-10 text-gray-500">
          Информация о пользователе
        </div>
      )}
    </div>
  );
}
              <h1 className="text-3xl font-semibold text-slate-900 truncate">
                {user.name}
              </h1>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Traveler
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Curated trips, destination inspiration, and personal travel notes in a calm, well-organized profile.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Email</p>
                <p className="mt-2 truncate">{user.email}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Phone</p>
                <p className="mt-2 truncate">{user.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Public view
          </span>
          <button
            onClick={onEditClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Experience', value: '3+ Years', subtitle: 'Travel planning' },
          { title: 'Certificates', value: '5', subtitle: 'Verified journeys' },
          { title: 'Internships', value: '2', subtitle: 'Completed trips' }
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200/70 bg-slate-50 px-5 py-5 text-sm text-slate-600">
            <p className="uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm text-slate-500">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeader;
export const SCHEMAS = {
  countries: {
    key: "countries",
    label: "Countries",
    labelOne: "Country",
    app: "Geography",
    icon: "🌍",
    searchFields: ["name", "formalName", "capital", "currency"],
    listColumns: [
      { key: "flagUrl", label: "Flag", type: "image", aliases: ["flag"] },
      { key: "name", label: "Name", primary: true },
      { key: "capital", label: "Capital" },
      { key: "continents", label: "Continents", type: "tags", aliases: ["continent"] },
      { key: "regions", label: "Regions", type: "tags", aliases: ["region"] },
      { key: "population", label: "Population", type: "number" },
      { key: "geographicalSize", label: "Area (km²)", type: "number", aliases: ["area"] },
    ],
    filters: [
      { key: "continents", label: "Continent", options: ["Europe", "Asia"], matchType: "listIncludes", aliases: ["continent"] },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true, group: "Basic", hint: "Short, common country name (e.g. \"Germany\")." },
      { key: "formalName", label: "Formal name", type: "text", group: "Basic", hint: "Official long-form name (e.g. \"Federal Republic of Germany\")." },
      { key: "capital", label: "Capital", type: "text", required: true, group: "Basic" },
      { key: "continents", label: "Continents", type: "multiselect", required: true, options: ["Europe", "Asia"], group: "Geography", hint: "Pick one or more. Transcontinental countries (e.g. Russia, Turkey) may have several." },
      { key: "regions", label: "Regions", type: "multiselect", options: [
          "Northern Europe", "Western Europe", "Southern Europe", "Eastern Europe",
          "Southeastern Europe", "Central Europe",
          "East Asia", "Southeast Asia", "South Asia", "Central Asia", "West Asia"
        ], group: "Geography", hint: "Sub-regions the country belongs to." },
      { key: "population", label: "Population", type: "number", required: true, group: "Demographics", hint: "Integer — total number of people (e.g. 83200000)." },
      { key: "geographicalSize", label: "Geographical size (km²)", type: "number", required: true, group: "Demographics", hint: "Integer — total area in square kilometres (e.g. 357022)." },
      { key: "currency", label: "Currency", type: "text", group: "Economy", hint: "Currency name or ISO code (e.g. \"Euro\" or \"EUR\")." },
      { key: "languages", label: "Languages", type: "tags-input", group: "Culture", hint: "Press Enter or comma to add a language. Official + widely-spoken languages." },
      { key: "flagUrl", label: "Flag URL", type: "url", group: "Media", hint: "Direct link to the flag image. Wikipedia commons URLs work." },
    ],
  },

  attractions: {
    key: "attractions",
    label: "Attractions",
    labelOne: "Attraction",
    app: "Geography",
    icon: "🏛️",
    searchFields: ["name", "city", "countryName"],
    listColumns: [
      { key: "imageUrl", label: "Image", type: "image", aliases: ["image"] },
      { key: "name", label: "Name", primary: true },
      { key: "city", label: "City" },
      { key: "countryName", label: "Country", type: "badge", aliases: ["country"] },
      { key: "price", label: "Price", type: "number" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "numberOfReviews", label: "Reviews", type: "number", aliases: ["reviews"] },
    ],
    filters: [],
    fields: [
      { key: "name", label: "Name", type: "text", required: true, group: "Basic" },
      { key: "countryId", label: "Country ID", type: "number", required: true, group: "Basic", hint: "Integer FK pointing to the parent country (Countries.Id)." },
      { key: "countryName", label: "Country name", type: "text", group: "Basic", aliases: ["country"], hint: "Display name of the country (synced with Country ID)." },
      { key: "city", label: "City", type: "text", group: "Basic" },
      { key: "price", label: "Price", type: "number", required: true, group: "Visit", hint: "Ticket price. Decimal allowed (e.g. 12.50). Use 0 for free." },
      { key: "duration", label: "Duration", type: "text", group: "Visit", hint: "Free text — e.g. \"1–2 hours\"." },
      { key: "bestTimeToVisit", label: "Best time to visit", type: "text", group: "Visit", aliases: ["bestTime"], hint: "Free text — e.g. \"April–June\"." },
      { key: "openingHours", label: "Opening hours", type: "text", group: "Visit", aliases: ["hours"], hint: "Free text — e.g. \"09:00–18:00\"." },
      { key: "rating", label: "Rating", type: "number", group: "Reviews", min: 0, max: 5, step: 0.1, hint: "Decimal from 0 to 5 (e.g. 4.7)." },
      { key: "numberOfReviews", label: "Number of reviews", type: "number", group: "Reviews", aliases: ["reviews"], hint: "Integer ≥ 0." },
      { key: "imageUrl", label: "Image URL", type: "url", group: "Media", aliases: ["image"], hint: "Card thumbnail." },
      { key: "bGUrl", label: "Background / hero image URL", type: "url", group: "Media", aliases: ["bgUrl", "heroImage"], hint: "Large hero banner on the detail page." },
      { key: "description", label: "Short description", type: "textarea", required: true, group: "Content", hint: "Card teaser — one or two sentences." },
      { key: "fullDescription", label: "Full description", type: "textarea", group: "Content", hint: "Long-form description shown on the detail page." },
    ],
  },

  news: {
    key: "news",
    label: "News",
    labelOne: "News item",
    app: "Content",
    icon: "📰",
    searchFields: ["title", "description"],
    listColumns: [
      { key: "imageUrl", label: "Image", type: "image", aliases: ["image"] },
      { key: "title", label: "Title", primary: true },
      { key: "publishedAt", label: "Published", type: "datetime", aliases: ["time"] },
    ],
    filters: [],
    fields: [
      { key: "title", label: "Title", type: "text", required: true, group: "Basic", maxLength: 100, hint: "Up to 100 characters." },
      { key: "publishedAt", label: "Published at", type: "datetime-local", required: true, group: "Basic", aliases: ["time"], hint: "Date & time the article goes live." },
      { key: "description", label: "Description", type: "textarea", required: true, group: "Content", maxLength: 500, hint: "Up to 500 characters." },
      { key: "imageUrl", label: "Image URL", type: "url", group: "Media", aliases: ["image"], hint: "Cover image. Up to 500 characters." },
    ],
  },

  users: {
    key: "users",
    label: "Users",
    labelOne: "User",
    app: "Authentication & Authorization",
    icon: "👤",
    searchFields: ["name", "email", "phone", "role"],
    listColumns: [
      { key: "avatarUrl", label: "Avatar", type: "image" },
      { key: "name", label: "Name", primary: true },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role", type: "badge" },
    ],
    filters: [
      { key: "role", label: "Role", options: ["Admin", "User"] },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true, group: "Account", hint: "Display name. 2–50 characters." },
      { key: "email", label: "Email", type: "email", required: true, group: "Account", hint: "5–100 characters." },
      { key: "phone", label: "Phone", type: "text", group: "Account", hint: "International format, e.g. +380 50 123 45 67. Up to 20 characters." },
      { key: "avatarUrl", label: "Avatar URL", type: "url", group: "Account", hint: "Direct link to profile picture." },
      { key: "role", label: "Role", type: "select", required: true, options: ["Admin", "User"], group: "Permissions" },
      { key: "token", label: "Token", type: "text", group: "Permissions", hint: "JWT issued at login. Read-only field." },
    ],
  },
};

export const APPS = [
  {
    name: "Geography",
    icon: "🌍",
    models: ["countries", "attractions"],
  },
  {
    name: "Content",
    icon: "📰",
    models: ["news"],
  },
  {
    name: "Authentication & Authorization",
    icon: "🔐",
    models: ["users"],
  },
];

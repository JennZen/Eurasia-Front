// @ts-nocheck
import React from 'react';

const CountryCardSkeleton = () => (
  <div className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-xl overflow-hidden animate-pulse">
    <div className="h-48 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 w-2/3 rounded-full bg-slate-200" />
      <div className="h-4 w-1/2 rounded-full bg-slate-200" />
      <div className="h-3 rounded-full bg-slate-200" />
      <div className="h-3 rounded-full bg-slate-200 w-5/6" />
    </div>
  </div>
);

const CountryCard = ({ country }) => (
  <article className="rounded-3xl border border-slate-200/70 bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      <img
        src={country.flagUrl}
        alt={`${country.name} flag`}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x250?text=Flag';
        }}
      />
      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
        Top pick
      </div>
    </div>
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-slate-900">{country.name}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          {country.formalName}
        </span>
      </div>
      <p className="text-sm text-slate-500">Capital: {country.capital}</p>
      <p className="text-sm leading-6 text-slate-600">{country.summary}</p>
      <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <span className="font-semibold text-slate-900">Currency</span>
          <p className="mt-1">{country.currency}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <span className="font-semibold text-slate-900">Population</span>
          <p className="mt-1">{(country.population / 1000000).toFixed(1)}M</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-500">Fast facts for your next visit</span>
        <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          View country
        </button>
      </div>
    </div>
  </article>
);

const FavoriteCountries = ({ countries, isLoading = false, error = null }) => {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-xl p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Favorite Countries
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Destinations you love and want to revisit.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <i className="fas fa-globe-americas" />
          Browse all countries
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-rose-200/80 bg-rose-50 p-4 text-rose-700">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-circle text-xl" />
            <div>
              <p className="font-semibold">Unable to load favorites.</p>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <CountryCardSkeleton key={index} />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          <p className="text-xl font-semibold">No favorites yet ✈️</p>
          <p className="mt-2 text-sm">Your saved countries will show here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoriteCountries;

// @ts-nocheck
import React from 'react';

const AttractionCardSkeleton = () => (
  <div className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-xl overflow-hidden animate-pulse">
    <div className="h-56 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="h-6 w-3/4 rounded-full bg-slate-200" />
      <div className="h-4 w-1/2 rounded-full bg-slate-200" />
      <div className="h-3 rounded-full bg-slate-200" />
      <div className="h-3 rounded-full bg-slate-200 w-5/6" />
    </div>
  </div>
);

const AttractionCard = ({ attraction }) => (
  <article className="rounded-3xl border border-slate-200/70 bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
    <div className="relative overflow-hidden bg-slate-100">
      <img
        src={attraction.imageUrl}
        alt={attraction.name}
        className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x250?text=Attraction';
        }}
      />
      <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
        <i className="fas fa-star text-amber-500 mr-1" />
        {attraction.rating}
      </div>
      <div className="absolute top-4 right-4 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm">
        ${attraction.price}
      </div>
    </div>

    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{attraction.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{attraction.city}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
          {attraction.duration}
        </span>
      </div>
      <p className="text-sm leading-6 text-slate-600">{attraction.description}</p>

      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <span className="font-semibold text-slate-900">Best time</span>
          <p className="mt-1">{attraction.bestTimeToVisit}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <span className="font-semibold text-slate-900">Opening</span>
          <p className="mt-1">{attraction.openingHours}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <i className="fas fa-users" />
          {attraction.numberOfReviews} reviews
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">
            <i className="fas fa-location-dot text-slate-500" />
            {attraction.city}
          </span>
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            View details
          </button>
        </div>
      </div>
    </div>
  </article>
);

const FavoriteAttractions = ({ attractions, isLoading = false, error = null }) => {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-xl p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Favorite Attractions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Curated travel experiences you have saved.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <i className="fas fa-map-marker-alt" />
          See all attractions
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-rose-200/80 bg-rose-50 p-4 text-rose-700">
          <div className="flex items-center gap-3">
            <i className="fas fa-exclamation-circle text-xl" />
            <div>
              <p className="font-semibold">Unable to load attractions.</p>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <AttractionCardSkeleton key={index} />
          ))}
        </div>
      ) : attractions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          <p className="text-xl font-semibold">No favorites yet ✈️</p>
          <p className="mt-2 text-sm">Saved attractions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {attractions.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoriteAttractions;

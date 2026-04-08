// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserUpdatePayload {
  name: string;
  phone?: string;
  avatarUrl?: string;
}

// Country Types
export interface Country {
  id: number;
  name: string;
  formalName: string;
  flagUrl: string;
  capital: string;
  population: number;
  currency: string;
  summary: string;
}

// Attraction Types
export interface Attraction {
  id: number;
  name: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  bgUrl?: string;
  city: string;
  duration: string;
  bestTimeToVisit: string;
  openingHours: string;
  rating: number;
  numberOfReviews: number;
  price: number;
  countryId: number;
}

import { User, Country, Attraction, UserUpdatePayload } from '../types/index';
import { mockUser as initialUser, mockCountries, mockAttractions } from '../mock/mockData';

// Simulate backend storage with mutable state
let userState: User = { ...initialUser };

/**
 * Simulate async delay to mimic API response time
 */
const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<User> => {
  await simulateDelay(500);
  return { ...userState };
};

/**
 * Update user profile with validation
 */
export const updateUserProfile = async (
  data: UserUpdatePayload
): Promise<User> => {
  // Validation
  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }

  if (data.name.length > 50) {
    throw new Error('Name cannot exceed 50 characters');
  }

  // Simulate API delay
  await simulateDelay(500);

  // Update mock data
  userState = {
    ...userState,
    name: data.name.trim(),
    phone: data.phone || userState.phone,
    avatarUrl: data.avatarUrl || userState.avatarUrl
  };

  return { ...userState };
};

/**
 * Get favorite countries for the user
 */
export const getFavoriteCountries = async (): Promise<Country[]> => {
  await simulateDelay(600);
  // Return a subset of countries as favorites
  return mockCountries.slice(0, 4);
};

/**
 * Get favorite attractions for the user
 */
export const getFavoriteAttractions = async (): Promise<Attraction[]> => {
  await simulateDelay(700);
  // Return "liked" attractions
  return mockAttractions;
};

/**
 * Reset user to initial state (for testing)
 */
export const resetUserProfile = (): void => {
  userState = { ...initialUser };
};

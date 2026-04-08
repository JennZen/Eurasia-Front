# User Profile Page - Implementation Guide

This implementation provides a complete User Profile page for a React + TypeScript application using mock data instead of backend API calls.

## 📁 File Structure

```
src/
├── types/
│   └── index.ts              # TypeScript interfaces (User, Country, Attraction)
├── mock/
│   └── mockData.ts           # Mock data (users, countries, attractions)
├── services/
│   └── mockUserService.ts    # Service layer with async simulation
├── components/
│   ├── ProfileHeader.tsx     # User profile header with avatar and info
│   ├── EditProfileModal.tsx  # Modal for editing profile
│   ├── FavoriteCountries.tsx # Grid of favorite countries
│   └── FavoriteAttractions.tsx # Cards of favorite attractions
├── pages/
│   └── UserProfile.jsx       # Main profile page (entry point)
└── styles/
    └── user-profile.css      # CSS utilities and animations
```

## 🎯 Features Implemented

### 1. **Profile Header**
- Display avatar with fallback to default placeholder
- Show name, email, and phone number
- Edit Profile button to open modal
- Loading skeleton state

### 2. **Edit Profile Modal**
- Editable fields: name, phone, avatarUrl
- Form validation:
  - Name required (2-50 characters)
  - Phone: optional, validates format
  - Avatar URL: optional, validates URL format
- Error messages for invalid input
- Save/Cancel buttons
- Loading state during submission

### 3. **Favorite Countries**
- Grid layout (4 columns on desktop, responsive on mobile)
- Country cards showing:
  - Flag image
  - Country name
  - Capital city
  - Summary/description
  - Currency and population
- Loading skeleton state
- Empty state message
- Hover animations

### 4. **Favorite Attractions**
- Grid layout (3 columns on desktop, responsive)
- Attraction cards showing:
  - Hero image
  - Name and city with icon
  - Description preview
  - Star rating badge
  - Price badge
  - Duration, best time to visit, review count
  - View Details button
- Loading skeleton state
- Empty state message
- Smooth animations and transitions

### 5. **UX Features**
- ✅ Loading skeleton states for all sections
- ✅ Error handling with user-friendly messages
- ✅ Fully responsive layout (mobile, tablet, desktop)
- ✅ Hover animations and transitions
- ✅ Clean, modern design with Tailwind CSS
- ✅ Gradient backgrounds and shadows for depth

## 🔧 TypeScript Types

### User
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}
```

### Country
```typescript
interface Country {
  id: number;
  name: string;
  formalName: string;
  flagUrl: string;
  capital: string;
  population: number;
  currency: string;
  summary: string;
}
```

### Attraction
```typescript
interface Attraction {
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
```

## 🎨 Mock Data

### Mock User
```typescript
{
  id: 1,
  name: "Alex Carter",
  email: "alex.carter@example.com",
  avatarUrl: "https://i.pravatar.cc/300?img=15",
  phone: "+37360000000"
}
```

### Mock Countries (4 examples)
- Japan
- South Korea
- Thailand
- France

### Mock Attractions (8 examples)
- Mount Fuji Tour (Japan)
- Kyoto Temple Walk (Japan)
- Seoul Night Market (South Korea)
- DMZ Tour (South Korea)
- Bangkok Grand Palace (Thailand)
- Floating Markets Tour (Thailand)
- Eiffel Tower & Seine Cruise (France)
- Louvre Museum Tour (France)

## 🚀 Service Layer

The `mockUserService.ts` provides the following functions:

### `getUserProfile(): Promise<User>`
- Gets current user profile
- Simulates 500ms API delay

### `updateUserProfile(data: UserUpdatePayload): Promise<User>`
- Updates user profile with validation
- Validates name (2-50 chars required)
- Simulates 500ms API delay
- Returns updated user and stores in local state

### `getFavoriteCountries(): Promise<Country[]>`
- Returns user's favorite countries
- Simulates 600ms API delay

### `getFavoriteAttractions(): Promise<Attraction[]>`
- Returns user's favorite attractions
- Simulates 700ms API delay

## 💾 State Management

Uses React Hooks:
- **useState**: Manage user, countries, attractions, and modal state
- **useEffect**: Fetch data on component mount

No Redux needed - simple and clean state management.

## 🎯 Integration Steps

1. **Import the component in your main app:**
```jsx
import { UserProfile } from './pages/UserProfile';

// In your router or App component:
<Route path="/profile" element={<UserProfile />} />
```

2. **Ensure TailwindCSS is configured:**
The component uses Tailwind utility classes. Make sure TailwindCSS is installed and configured in your `vite.config.js` or `tailwind.config.js`.

3. **Install lucide-react for icons:**
```bash
npm install lucide-react
```

4. **Import styles (optional):**
```jsx
import '../styles/user-profile.css';
```

## 🔄 Mock Data Updates

When you save the profile:
1. Data is validated
2. Async operation simulates API call (500ms)
3. Mock data state is updated
4. Component re-renders with new data
5. Modal closes

The data persists during the session. Refreshing the page resets to initial mock data.

## 🎨 Styling

All styling uses **TailwindCSS** utility classes:
- Responsive design with mobile-first approach
- Gradient backgrounds
- Shadow effects
- Smooth transitions and animations
- Clean, modern aesthetic

## ✨ Best Practices Implemented

✅ Functional components with hooks
✅ TypeScript for type safety
✅ Separation of concerns (components, services, types)
✅ Error handling at service and component level
✅ Loading states with skeleton screens
✅ Form validation with user feedback
✅ Async service simulation
✅ Responsive and accessible UI
✅ No real API calls - all mock data
✅ Reusable components

## 🧪 Testing Mock Data

To modify mock data:
1. Edit `/src/mock/mockData.ts`
2. Update arrays or individual objects
3. Changes reflect immediately in dev mode

To reset profile to initial state:
```typescript
import { resetUserProfile } from '../services/mockUserService';
resetUserProfile();
```

## 📱 Responsive Breakpoints

- **Mobile**: Single column layout
- **Tablet (md)**: 2 columns for countries, 2 columns for attractions
- **Desktop (lg)**: 4 columns for countries, 3 columns for attractions

## 🎭 Component Props

All components are fully typed with TypeScript. Props include:
- Data objects (user, countries, attractions)
- Loading states
- Error messages
- Callbacks (onEditClick, onSave, onClose)

## 📝 Notes

- ⚠️ `passwordHash` is never exposed in the frontend
- ✅ All data comes from mock files
- ✅ No backend API calls
- ✅ Async operations simulated with setTimeout
- ✅ Full TypeScript support with strict typing

---

**Ready to use!** Import and integrate `UserProfile` component into your React app. All styling and functionality is self-contained.

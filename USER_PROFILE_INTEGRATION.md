// @ts-nocheck
/**
 * Example: How to integrate UserProfile into your React app
 * 
 * This file demonstrates different ways to use the UserProfile component
 * in your routing setup.
 */

// ========================================
// Option 1: React Router (Recommended)
// ========================================

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProfile } from './pages/UserProfile';
import { Home } from './pages/Home';
import { Attractions } from './pages/Attractions';

function AppWithRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/attractions" element={<Attractions />} />
        {/* Add other routes */}
      </Routes>
    </Router>
  );
}

// ========================================
// Option 2: Direct Component Usage
// ========================================

import { UserProfile } from './pages/UserProfile';

function AppDirectUsage() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div>
      <header>
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('profile')}>Profile</button>
        <button onClick={() => setCurrentPage('attractions')}>Attractions</button>
      </header>

      <main>
        {currentPage === 'profile' && <UserProfile />}
        {currentPage === 'home' && <Home />}
        {currentPage === 'attractions' && <Attractions />}
      </main>
    </div>
  );
}

// ========================================
// Option 3: With Context/Layout
// ========================================

import { UserProfile } from './pages/UserProfile';
import { Layout } from './components/Layout';

function AppWithLayout() {
  return (
    <Layout>
      <UserProfile />
    </Layout>
  );
}

// ========================================
// Option 4: Navigation Example
// ========================================

import { Link } from 'react-router-dom';

function ProfileLink() {
  return (
    <Link to="/profile" className="btn btn-primary">
      Go to Profile
    </Link>
  );
}

// ========================================
// Usage in Headers/Navigation
// ========================================

function Navigation() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/attractions">Attractions</Link>
      <Link to="/profile">My Profile</Link>
      {/* More nav items */}
    </nav>
  );
}

// ========================================
// Full App Example
// ========================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProfile } from './pages/UserProfile';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/profile" element={<UserProfile />} />
          {/* Other routes */}
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

// ========================================
// Using Mock Service Directly
// ========================================

import {
  getUserProfile,
  updateUserProfile,
  getFavoriteCountries,
  getFavoriteAttractions
} from './services/mockUserService';

async function testMockService() {
  // Get user
  const user = await getUserProfile();
  console.log('User:', user);

  // Update user
  try {
    const updated = await updateUserProfile({
      name: 'John Doe',
      phone: '+1234567890',
      avatarUrl: 'https://example.com/avatar.jpg'
    });
    console.log('Updated user:', updated);
  } catch (error) {
    console.error('Update failed:', error);
  }

  // Get favorites
  const countries = await getFavoriteCountries();
  const attractions = await getFavoriteAttractions();
  console.log('Countries:', countries);
  console.log('Attractions:', attractions);
}

// ========================================
// Type-Safe Usage
// ========================================

import { User, Country, Attraction } from './types/index';

interface ProfileState {
  user: User | null;
  countries: Country[];
  attractions: Attraction[];
}

const initialState: ProfileState = {
  user: null,
  countries: [],
  attractions: []
};

// ========================================
// Important Notes
// ========================================

/*
 * 1. Install Dependencies:
 *    npm install lucide-react
 *    npm install react-router-dom (if using routing)
 * 
 * 2. Ensure TailwindCSS is set up:
 *    - Check your tailwind.config.js or vite.config.js
 *    - Include src/**/*.{jsx,tsx,js,ts} in content paths
 * 
 * 3. Import the component:
 *    import { UserProfile } from './pages/UserProfile';
 * 
 * 4. Add route or conditionally render:
 *    <Route path="/profile" element={<UserProfile />} />
 * 
 * 5. No additional setup needed:
 *    - Types are included ✓
 *    - Mock data is included ✓
 *    - Service layer is included ✓
 *    - Components are self-contained ✓
 * 
 * 6. Customize mock data:
 *    Edit src/mock/mockData.ts
 * 
 * 7. Change styling:
 *    All classes use Tailwind utilities
 *    Edit TailwindCSS config or override with custom CSS
 */

export { AppWithRouter, AppDirectUsage, AppWithLayout };

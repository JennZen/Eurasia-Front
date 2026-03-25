import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Europe from "./pages/Europe";
import CountryPage from "./pages/CountryPage";
import About from "./pages/About";
import Asia from "./pages/Asia";
import Countries from "./pages/Countries";
import LatestNewsPage from "./pages/LatestNewsPage";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/europe" element={<Europe />} />
            <Route path="/asia" element={<Asia />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/country/:country" element={<CountryPage />} />
            <Route path="/latest-news" element={<LatestNewsPage />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/deals"
              element={<div>Deals Page (Coming Soon)</div>}
            />
            <Route
              path="/reservation"
              element={<div>Reservation Page (Coming Soon)</div>}
            />
            <Route path="/book" element={<div>Book Page (Coming Soon)</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

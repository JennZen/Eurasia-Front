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
import Attractions from "./pages/Attractions";
import AttractionPage from "./pages/AttractionPage";
import LikedAttractions from "./pages/LikedAttractions";
import Quiz from "./pages/Quiz";
import ProfilePage from "./pages/ProfilePage";

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
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/attractions/:country/:id" element={<AttractionPage />} />
            <Route path="/liked" element={<LikedAttractions />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/latest-news" element={<LatestNewsPage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

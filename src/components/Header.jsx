import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/header-footer.css";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/countries", label: "Countries" },
    { path: "/attractions", label: "Attractions" },
    { path: "/liked", label: "LikedAttractions" },
    { path: "/about", label: "About" },
    { path: "/deals", label: "Deals" },
    { path: "/reservation", label: "Reservation" },
    { path: "/book", label: "Book Yours" },
  ];

  return (
    <header className="header">
      <nav>
        <div className="logo">
          <Link to="/" className="logo-link">
            <p>ProjectEurasia</p>
          </Link>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>

        <ul className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

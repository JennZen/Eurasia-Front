import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../styles/header-footer.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/countries", label: "Countries" },
    { path: "/attractions", label: "Attractions" },
    { path: "/liked", label: "Liked" },
    { path: "/about", label: "About" },
    { path: "/quiz", label: "Quiz" },
    { path: "/profile", label: "Profile", special: true },
  ];

  return (
    <header className="header">
      <nav>
        <div className="logo">
          <NavLink to="/" className="logo-link">
            <p>ProjectEurasia</p>
          </NavLink>
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
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${item.special ? 'profile-button' : ''} ${isActive ? 'active' : ''}`.trim()
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}

        </ul>
      </nav>
    </header>
  );
};

export default Header;

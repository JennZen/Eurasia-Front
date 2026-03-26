import { Link } from "react-router-dom";
import "../styles/header-footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            ProjectEurasia
          </Link>
          <p className="footer-desc">
            Discover the beauty of Europe and Asia. Plan your perfect journey
            with us and explore the world's most fascinating destinations.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-x-twitter"></i>
            </a>
            <a href="#" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Navigation</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/europe">Europe</Link>
            </li>
            <li>
              <Link to="/asia">Asia</Link>
            </li>
            <li>
              <Link to="/countries">Countries</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Services</h4>
          <ul>
            <li>
              <Link to="/deals">Deals</Link>
            </li>
            <li>
              <Link to="/reservation">Reservation</Link>
            </li>
            <li>
              <Link to="/book">Book a Trip</Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <ul>
            <li>
              <i className="fas fa-envelope"></i> info@projecteurasia.com
            </li>
            <li>
              <i className="fas fa-phone"></i> +380 (686) 354-8970
            </li>
            <li>
              <i className="fas fa-map-marker-alt"></i> Chisinau, Moldova
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 ProjectEurasia. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

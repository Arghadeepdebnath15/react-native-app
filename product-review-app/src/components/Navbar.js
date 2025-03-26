import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar-container">
      <div className="container navbar">
        <Link to="/" className="navbar-brand">
          Product Reviews
        </Link>
        
        <div className="nav-buttons">
          <Link to="/" className="nav-button">
            Home
          </Link>
          <Link to="/products" className="nav-button">
            Products
          </Link>
          <Link to="/contact" className="nav-button">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
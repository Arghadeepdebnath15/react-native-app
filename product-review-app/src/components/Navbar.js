import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <div className="container navbar">
        <Link to="/" className="navbar-brand">
          Product Reviews
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/AddProduct.css'; // Import the existing styles

const Navbar = ({ onAddProductClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          {isMobile ? 'PR' : 'Product Reviews'}
        </Link>
        <div className="nav-items">
          <button 
            className="toggle-form-button"
            onClick={onAddProductClick}
          >
            {isMobile ? '+' : 'Add New Product'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
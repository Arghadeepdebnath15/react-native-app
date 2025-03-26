import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
    // This would typically filter products or navigate, but for now we'll just set active state
    console.log(`Button clicked: ${buttonName}`);
  };

  return (
    <nav>
      <div className="container navbar">
        <Link to="/" className="navbar-brand">
          Product Reviews
        </Link>
        <div className="navbar-buttons">
          <button 
            className={`nav-btn ${activeButton === 'new' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('new')}
          >
            {isMobile ? 'New' : 'New'}
          </button>
          <button 
            className={`nav-btn ${activeButton === 'popular' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('popular')}
          >
            {isMobile ? 'Pop.' : 'Popular'}
          </button>
          <button 
            className={`nav-btn ${activeButton === 'categories' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('categories')}
          >
            {isMobile ? 'Cat.' : 'Categories'}
          </button>
          <button 
            className={`nav-btn ${activeButton === 'contact' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('contact')}
          >
            {isMobile ? 'Contact' : 'Contact'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
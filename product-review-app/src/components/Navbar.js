import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [activeButton, setActiveButton] = useState(null);
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

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          {isMobile ? 'PR' : 'Product Reviews'}
        </Link>
        <div className="nav-items">
          <button className={`nav-button ${activeButton === 'new' ? 'active' : ''}`}
                 onClick={() => handleButtonClick('new')}>
            {isMobile ? 'N' : 'New'}
          </button>
          <button className={`nav-button ${activeButton === 'popular' ? 'active' : ''}`}
                 onClick={() => handleButtonClick('popular')}>
            {isMobile ? 'P' : 'Popular'}
          </button>
          <button className={`nav-button ${activeButton === 'cat' ? 'active' : ''}`}
                 onClick={() => handleButtonClick('cat')}>
            {isMobile ? 'C' : 'Cat'}
          </button>
          <button className={`nav-button ${activeButton === 'help' ? 'active' : ''}`}
                 onClick={() => handleButtonClick('help')}>
            {isMobile ? 'H' : 'Help'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
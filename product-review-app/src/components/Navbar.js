import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [activeButton, setActiveButton] = useState(null);

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
            New
          </button>
          <button 
            className={`nav-btn ${activeButton === 'popular' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('popular')}
          >
            Popular
          </button>
          <button 
            className={`nav-btn ${activeButton === 'categories' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('categories')}
          >
            Categories
          </button>
          <button 
            className={`nav-btn ${activeButton === 'contact' ? 'nav-btn-active' : ''}`}
            onClick={() => handleButtonClick('contact')}
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const Navbar = ({ onAddProductClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { products } = useContext(ProductContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const searchRef = useRef(null);
  const { currentUser, logout } = useAuth();

  // Handle click outside search suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSuggestionClick = (productName) => {
    setSearchTerm(productName);
    navigate(`/?search=${encodeURIComponent(productName)}`);
    setShowSuggestions(false);
  };

  const getSuggestions = () => {
    if (!searchTerm.trim()) return [];
    
    const searchQuery = searchTerm.toLowerCase().trim();
    const exactMatches = [];
    const startingMatches = [];
    const containingMatches = [];

    products.forEach(product => {
      const productName = product.name.toLowerCase();
      
      if (productName === searchQuery) {
        exactMatches.push(product);
      } else if (productName.startsWith(searchQuery)) {
        startingMatches.push(product);
      } else if (productName.includes(searchQuery)) {
        containingMatches.push(product);
      }
    });

    return [...exactMatches, ...startingMatches, ...containingMatches].slice(0, 8);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <button 
            className="home-btn"
            onClick={() => navigate('/')}
            title="Go to Home"
            aria-label="Go to Home"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
              </svg>
            )}
          </button>
          <form className="search-form" onSubmit={handleSearch} ref={searchRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              aria-label="Search products"
            />
            <button 
            style={{width: '10%'}}
            type="submit" className="search-button" aria-label="Submit search">
              <svg className="search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </form>
        </div>
        <div className="nav-right">
          {currentUser && (
            <>
              <button 
                className="add-product-btn" 
                onClick={onAddProductClick}
                aria-label="Add new product"
              >
                Add Product
              </button>
              <div className="user-section">
                <span className="user-email">{currentUser.email}</span>
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showSuggestions && searchTerm && (
        <div className="search-suggestions">
          {getSuggestions().map((product) => (
            <div
              key={product._id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(product.name)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSuggestionClick(product.name);
                }
              }}
            >
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="suggestion-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.svg';
                }}
              />
              <div className="suggestion-info">
                <div className="suggestion-name">{product.name}</div>
                <div className="suggestion-price">${product.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 
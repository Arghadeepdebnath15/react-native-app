import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/AddProduct.css'; // Import the existing styles

const Navbar = ({ onAddProductClick }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { products } = useContext(ProductContext);
  const searchRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Only show suggestions if there's a search term
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
      
      // Exact match goes first
      if (productName === searchQuery) {
        exactMatches.push(product);
      }
      // Starting with search query goes second
      else if (productName.startsWith(searchQuery)) {
        startingMatches.push(product);
      }
      // Contains search query goes last
      else if (productName.includes(searchQuery)) {
        containingMatches.push(product);
      }
    });

    // Combine all matches in priority order
    return [...exactMatches, ...startingMatches, ...containingMatches].slice(0, 8); // Show up to 8 suggestions
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="home-link">
          <svg className="home-icon" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </Link>
        <Link to="/" className="nav-logo">
          {isMobile ? 'PR' : 'Product Reviews'}
        </Link>
        <div className="search-form" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={(e) => {
                // Only show suggestions if there's text when focused
                if (e.target.value.trim()) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Add a small delay before hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="search-input"
            />
            <button type="submit" className="search-button" aria-label="Search">
              <svg viewBox="0 0 24 24" className="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </form>
          {showSuggestions && searchTerm.trim() && (
            <div className="search-suggestions">
              {getSuggestions().length > 0 ? (
                getSuggestions().map((product) => (
                  <div
                    key={product._id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(product.name)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur from hiding suggestions
                  >
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.svg';
                      }}
                    />
                    <div className="suggestion-item-info">
                      <div className="suggestion-item-name">{product.name}</div>
                      <div className="suggestion-item-price">${product.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-suggestions">No products found</div>
              )}
            </div>
          )}
        </div>
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
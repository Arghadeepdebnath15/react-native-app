import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/userProfileService';
import '../styles/Navbar.css';

const Navbar = ({ onAddProductClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useContext(ProductContext);
  const { toggleTheme } = useTheme();
  const searchRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Check if we're on the message page or dashboard
  const isMessagePage = location.pathname.includes('/message');
  const isDashboardPage = location.pathname === '/';

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

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
        } catch (err) {
          console.error('Error loading profile:', err);
        }
      }
    };

    loadProfile();
  }, [currentUser]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar ${isDashboardPage ? 'dashboard-nav' : ''}`}>
      <div className="nav-container">
        <div className="nav-left">
          <button className="home-btn" onClick={() => navigate('/')} aria-label="Go to home">
            <svg className="home-icon" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <svg viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          </button>
        </div>
        {!isMessagePage && !isDashboardPage && (
          <div className="nav-center">
            <form className="search-form" onSubmit={handleSearch} ref={searchRef}>
              <div className="search-input-container">
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
                  type="submit" 
                  className="search-button" 
                  aria-label="Submit search"
                >
                  <svg className="search-icon" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="nav-right">
          {currentUser && (
            <>
              {!isMessagePage && !isDashboardPage && (
                <button 
                  className="add-product-btn" 
                  onClick={() => {
                    console.log('Add Product button clicked');
                    console.log('onAddProductClick prop:', onAddProductClick);
                    onAddProductClick();
                  }}
                  aria-label="Add new product"
                >
                  Add Product
                </button>
              )}
              <div className="user-section">
                <div className="navbar-profile-section">
                  <button 
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  <Link to="/profile">
                    <img 
                      src={profile?.profilePicture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                      alt="Profile" 
                      className="navbar-profile-pic"
                    />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {!isMessagePage && !isDashboardPage && showSuggestions && searchTerm && (
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
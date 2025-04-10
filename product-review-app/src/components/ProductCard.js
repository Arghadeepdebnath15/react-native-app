import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import Messaging from './Messaging';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showMessaging, setShowMessaging] = useState(false);

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffc107' : '#e4e5e9' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Handle navigation with scroll
  const handleViewDetails = (e) => {
    if (e) {
      e.preventDefault();
    }

    // Set a flag in sessionStorage to indicate we're navigating to product details
    sessionStorage.setItem('scrollToTop', 'true');
    sessionStorage.setItem('productId', product._id);
    
    // Navigate to the product page
    navigate(`/product/${product._id}`);
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }
    setShowMessaging(true);
  };

  return (
    <div className="product-card">
      <img 
        src={getImageUrl(product.imageUrl)} 
        alt={product.name} 
        className="product-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.svg';
        }}
      />
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <div className="rating">
          {renderStars(Math.round(product.avgRating))}
          <span> ({product.reviews.length} reviews)</span>
        </div>
        <p className="product-description">
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </p>
        <div className="product-actions">
          <button 
            onClick={handleViewDetails}
            className="view-btn"
          >
            View Details
          </button>
          <button 
            className="message-button"
            onClick={handleMessageClick}
          >
            Message Seller
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </button>
        </div>
      </div>

      {showMessaging && (
        <Messaging
          otherUserId={product.userId} // Make sure product has userId field
          otherUserName={product.userName} // Make sure product has userName field
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  );
};

export default ProductCard; 
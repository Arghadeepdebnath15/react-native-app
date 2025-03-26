import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

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

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" />
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
        <button 
          onClick={handleViewDetails}
          className="view-btn"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 
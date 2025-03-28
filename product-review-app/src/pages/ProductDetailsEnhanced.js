import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { getImageUrl } from '../utils/imageUtils';
import SuccessPopup from '../components/SuccessPopup';
import '../styles/ProductDetailsEnhanced.css';

const ProductDetailsEnhanced = ({ showForm, setShowForm }) => {
  const { id } = useParams();
  const { getProduct, submitReview, loading: contextLoading, error } = useContext(ProductContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const reviewFormRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, getProduct]);

  const handleSubmitReview = async (reviewData) => {
    try {
      setLoading(true);
      setSubmitError(null);
      
      if (!product || !product._id) {
        throw new Error('Cannot submit review - product data is invalid');
      }
      
      const updatedProduct = await submitReview(product._id, reviewData);
      
      if (!updatedProduct || !updatedProduct._id) {
        throw new Error('Received invalid product data from server');
      }
      
      setProduct(updatedProduct);
      setShowReviewForm(false);
      setSuccessMessage('Review submitted successfully! 🎉');
      setShowSuccess(true);
      
      // Scroll to review list after submission
      if (reviewFormRef.current) {
        reviewFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
      return updatedProduct;
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError(err.message || 'Failed to submit review. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // Implement cart functionality
    setSuccessMessage(`Added ${quantity} ${product.name}(s) to cart!`);
    setShowSuccess(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffc107' : '#e4e5e9', fontSize: '24px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading || contextLoading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading product details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container error-container">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container error-container">
        <h2>Product not found</h2>
      </div>
    );
  }

  return (
    <div className="product-detail-enhanced">
      {showSuccess && (
        <SuccessPopup 
          message={successMessage} 
          isVisible={showSuccess} 
          onClose={() => setShowSuccess(false)} 
        />
      )}

      <div className="product-detail-grid">
        <div className="product-images-section">
          <div className="main-image-container">
            <img 
              src={getImageUrl(product.imageUrl)} 
              alt={product.name} 
              className="main-product-image"
            />
          </div>
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className="thumbnail-container">
              {product.additionalImages.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`${product.name} view ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> / 
            <Link to={`/category/${product.category}`}>{product.category}</Link> / 
            <span>{product.name}</span>
          </nav>

          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <div className="rating-container">
              {renderStars(Math.round(product.avgRating))}
              <span className="review-count">({product.reviews.length} reviews)</span>
            </div>
            <span className="product-sku">SKU: {product._id}</span>
          </div>

          <div className="product-price">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-specs">
            <h3>Specifications</h3>
            <ul>
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>Brand:</strong> {product.brand || 'Generic'}</li>
              <li><strong>Availability:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}</li>
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          <div className="product-additional-info">
            <div className="shipping-info">
              <h3>Shipping</h3>
              <p>Free shipping on orders over $50</p>
              <p>Estimated delivery: 3-5 business days</p>
            </div>
            <div className="warranty-info">
              <h3>Warranty</h3>
              <p>30-day money-back guarantee</p>
              <p>1-year limited warranty</p>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-section" ref={reviewFormRef}>
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)} 
            className="write-review-btn"
          >
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </button>
        </div>

        {showReviewForm && (
          <ReviewForm
            productId={product._id}
            onReviewSubmitted={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        )}

        {submitError && (
          <div className="error-message">
            {submitError}
          </div>
        )}

        <ReviewList reviews={product.reviews} />
      </div>

      {/* Related Products Section */}
      <div className="related-products">
        <h2>Related Products</h2>
        <div className="related-products-grid">
          {/* Add related products here */}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsEnhanced; 
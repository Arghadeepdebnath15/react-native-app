import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { getProduct, submitReview, loading: contextLoading, error } = useContext(ProductContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewFormRef = useRef(null);
  const shouldScrollToTop = useRef(sessionStorage.getItem('scrollToTop') === 'true');

  // Handle scroll behavior
  useEffect(() => {
    const forceScrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    if (shouldScrollToTop.current) {
      // Clear the flag immediately
      sessionStorage.removeItem('scrollToTop');
      shouldScrollToTop.current = false;

      // Force scroll in multiple ways
      forceScrollToTop();
      
      // Also scroll after a small delay to ensure it works
      setTimeout(forceScrollToTop, 0);
      setTimeout(forceScrollToTop, 100);
      
      // And on the next animation frame
      requestAnimationFrame(forceScrollToTop);
    }
  }, [id, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);

        // If this is the product we navigated to, ensure we're at the top
        if (sessionStorage.getItem('productId') === id) {
          sessionStorage.removeItem('productId');
          window.scrollTo(0, 0);
        }
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

  const toggleReviewForm = () => {
    setShowReviewForm(prevState => !prevState);
    
    // If opening the form, scroll to it
    if (!showReviewForm && reviewFormRef.current) {
      reviewFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate star rating display
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
    <div className="container product-detail-container">
      <div className="product-detail">
        <div className="product-detail-image-container">
          <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
        </div>
        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="rating">
            {renderStars(Math.round(product.avgRating))}
            <span> ({product.reviews.length} reviews)</span>
          </div>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <p className="product-detail-description">{product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
        </div>
      </div>

      <div className="reviews-section" ref={reviewFormRef}>
        <div className="reviews-header">
          <h2 className="reviews-title">Customer Reviews</h2>
          <button 
            onClick={toggleReviewForm} 
            className="write-review-btn"
            type="button"
          >
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </button>
        </div>
        
        {submitError && <div className="error-message">{submitError}</div>}
        
        {showReviewForm && (
          <div className="review-form-container">
            <ReviewForm onSubmitReview={handleSubmitReview} productName={product.name} />
          </div>
        )}
        
        <ReviewList reviews={product.reviews} />
      </div>
    </div>
  );
};

export default ProductDetailPage; 
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
    
    // Add a slight delay to ensure navbar height is accounted for
    setTimeout(() => {
      const navbarHeight = 64; // Fixed navbar height in pixels
      const yOffset = -navbarHeight - 10; // Additional 10px padding
      window.scrollTo({
        top: yOffset,
        behavior: 'smooth'
      });
    }, 100);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with URL ID:', id);
        const data = await getProduct(id);
        console.log('Fetched product:', data);
        console.log('Product ID type:', typeof data._id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        // Ensure loading is set to false even if there's an error
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
        const errorMsg = 'Cannot submit review - product data is invalid';
        console.error(errorMsg, product);
        setSubmitError(errorMsg);
        setLoading(false);
        throw new Error(errorMsg);
      }
      
      // Log detailed product information for debugging
      console.log('Product before review submission:', product);
      console.log('Product name:', product.name);
      console.log('Product ID:', product._id);
      console.log('Product ID type:', typeof product._id);
      
      // For problematic products, try extra safeguards
      let productId = product._id;
      
      console.log('Submitting review for product:', productId);
      
      const updatedProduct = await submitReview(productId, reviewData);
      
      // Check if we got a valid response
      if (!updatedProduct || !updatedProduct._id) {
        throw new Error('Received invalid product data from server');
      }
      
      console.log('Updated product after review:', updatedProduct);
      
      // Update the local product state with the new data
      setProduct(updatedProduct);

      // Hide the review form after successful submission
      setShowReviewForm(false);
      
      // Scroll to review list after submission
      setTimeout(() => {
        if (reviewFormRef.current) {
          window.scrollTo({
            top: reviewFormRef.current.offsetTop - 20,
            behavior: 'smooth'
          });
        }
      }, 500);
      
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
    console.log('Toggle review form clicked. Current state:', showReviewForm);
    setShowReviewForm(prevState => !prevState);
    
    // If opening the form, scroll to it
    if (!showReviewForm) {
      setTimeout(() => {
        if (reviewFormRef.current) {
          reviewFormRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
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

  // Log product information on each render for debugging
  console.log(`Rendering product: ${product.name} with ID: ${product._id}`);

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
          <p><strong>Product ID:</strong> {product._id}</p>
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
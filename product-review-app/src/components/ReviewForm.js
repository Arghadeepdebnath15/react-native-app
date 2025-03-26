import React, { useState, useEffect } from 'react';
// Test comment to verify GitHub sync is working

const ReviewForm = ({ onSubmitReview, productName = '' }) => {
  const [formData, setFormData] = useState({
    userName: '',
    rating: null,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Special handling for problematic products
  const isProblematicProduct = productName && 
    (productName.includes('Headphone') || productName.includes('Watch'));

  useEffect(() => {
    if (isProblematicProduct) {
      console.log(`Special handling enabled for problematic product: ${productName}`);
    }
  }, [productName, isProblematicProduct]);

  const { userName, rating, comment } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'rating' ? parseInt(e.target.value) : e.target.value
    });
  };

  const handleRatingChange = (newRating) => {
    setFormData({
      ...formData,
      rating: newRating
    });
  };

  const handleRatingHover = (hoveredValue) => {
    setHoveredRating(hoveredValue);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if rating is selected
    if (rating === null) {
      alert('Please select a rating before submitting your review');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    console.log(`Attempting to submit review for: ${productName}`);
    
    try {
      setIsSubmitting(true);
      
      // Add extra debugging for problematic products
      if (isProblematicProduct) {
        console.log('Using special handling for problematic product');
        
        // Add a small delay for problematic products
        // This can help with race conditions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Submit the review
      await onSubmitReview(formData);
      
      // Reset form after submission
      setFormData({
        userName: '',
        rating: null,
        comment: ''
      });
      
      // Show success feedback
      alert(`Review for ${productName} submitted successfully!`);
    } catch (err) {
      console.error(`Error submitting review for ${productName}:`, err);
      alert(`Failed to submit review for ${productName}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star rating component
  const renderStarRating = () => {
    const stars = [];
    const activeRating = hoveredRating || rating || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star-rating-input ${i <= activeRating ? 'star-filled' : 'star-empty'}`}
          onClick={() => handleRatingChange(i)}
          onMouseEnter={() => handleRatingHover(i)}
          onMouseLeave={handleRatingLeave}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className="review-form">
      <h3>Write a Review for {productName}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userName">Your Name</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={userName}
            onChange={handleChange}
            required
            autoComplete="name"
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <div className="star-rating-container">
            {renderStarRating()}
            <span className="rating-text">
              {rating ? `(${rating} ${rating === 1 ? 'Star' : 'Stars'})` : '(Select a rating)'}
            </span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="comment">Your Review</label>
          <textarea
            id="comment"
            name="comment"
            rows="4"
            value={comment}
            onChange={handleChange}
            required
            placeholder="Share your thoughts about this product..."
          ></textarea>
        </div>
        <button 
          type="submit" 
          className={`submit-btn ${isProblematicProduct ? 'submit-btn-special' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 
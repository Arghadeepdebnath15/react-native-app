import React from 'react';

const ReviewList = ({ reviews }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  return (
    <div className="review-list">
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to leave a review!</p>
      ) : (
        reviews.map((review, index) => (
          <div key={index} className="review-card">
            <div className="review-header">
              <span className="review-user">{review.userName}</span>
              <span className="review-date">{formatDate(review.date)}</span>
            </div>
            <div className="review-rating">{renderStars(review.rating)}</div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList; 
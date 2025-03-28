import React, { useState, useEffect, useRef } from 'react';

const ReviewList = ({ reviews }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (selectedReview && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedReview]);

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
    <div className="reviews-grid">
      {reviews.map((review, index) => (
        <div 
          key={index} 
          className="review-card"
          onClick={() => setSelectedReview(review)}
        >
          <div className="review-header">
            <span className="review-author">{review.userName}</span>
            <span className="review-date">
              {new Date(review.date).toLocaleDateString()}
            </span>
          </div>
          <div className="review-rating">
            {renderStars(review.rating)}
          </div>
          {review.title && (
            <h3 className="review-title">{review.title}</h3>
          )}
          <p className="review-content">{review.comment}</p>
        </div>
      ))}

      {selectedReview && (
        <div className="review-detail-modal" onClick={() => setSelectedReview(null)}>
          <div className="review-detail-content" onClick={e => e.stopPropagation()} ref={modalRef}>
            <button className="review-detail-close" onClick={() => setSelectedReview(null)}>×</button>
            <div className="review-detail-header">
              <h3 className="review-detail-title">{selectedReview.title}</h3>
              <div className="review-detail-meta">
                <span className="review-author">{selectedReview.userName}</span>
                <span className="review-date">
                  {new Date(selectedReview.date).toLocaleDateString()}
                </span>
              </div>
              <div className="review-rating">
                {renderStars(selectedReview.rating)}
              </div>
            </div>
            <p>{selectedReview.comment}</p>
            {selectedReview.photos && selectedReview.photos.length > 0 && (
              <div className="review-photos">
                {selectedReview.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Review ${index + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 
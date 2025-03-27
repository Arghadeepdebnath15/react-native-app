import React, { useState } from 'react';

const ReviewList = ({ reviews }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  // Debug log to check reviews data
  console.log('Reviews data:', reviews);

  return (
    <div className="review-list">
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to leave a review!</p>
      ) : (
        reviews.map((review, index) => {
          // Debug log for each review
          console.log(`Review ${index} photos:`, review.photos);
          
          return (
            <div key={index} className="review-card">
              <div className="review-header">
                <span className="review-user">{review.userName}</span>
                <span className="review-date">{formatDate(review.date)}</span>
              </div>
              <div className="review-rating">{renderStars(review.rating)}</div>
              <div className="review-content">
                <p className="review-comment">{review.comment}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="review-photos">
                    {review.photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="review-photo" onClick={() => handlePhotoClick(photo)}>
                        <img 
                          src={photo} 
                          alt={`Review ${photoIndex + 1} by ${review.userName}`}
                          onError={(e) => {
                            console.error('Error loading image:', photo);
                            e.target.src = '/placeholder-image.svg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={handleClosePhoto}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedPhoto} 
              alt={`Review by ${reviews.find(r => r.photos?.includes(selectedPhoto))?.userName || 'User'}`}
              onError={(e) => {
                console.error('Error loading modal image:', selectedPhoto);
                e.target.src = '/placeholder-image.svg';
              }}
            />
            <button className="close-modal" onClick={handleClosePhoto}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 
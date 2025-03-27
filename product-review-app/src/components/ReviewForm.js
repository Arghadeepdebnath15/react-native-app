import React, { useState, useEffect } from 'react';
import '../styles/ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    userName: '',
    rating: null,
    comment: '',
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    console.log('ReviewForm - productId prop changed:', productId);
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleRatingHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        // Validate file sizes
        for (const file of files) {
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Each photo must be less than 10MB');
          }
          if (!file.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
          }
        }

        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
          }

          const data = await response.json();
          console.log('Uploaded photo URL:', data.secure_url);
          return data.secure_url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        console.log('All uploaded photo URLs:', uploadedUrls);
        
        setUploadedPhotos(prev => [...prev, ...uploadedUrls]);
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...uploadedUrls]
        }));
      } catch (error) {
        console.error('Error uploading photos:', error);
        setError(error.message || 'Failed to upload photos. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('ReviewForm - Product ID received:', productId);
      if (!productId) {
        console.error('ReviewForm - Product ID is missing');
        throw new Error('Product ID is required');
      }

      // Validate the form data before submission
      if (!formData.userName.trim()) {
        throw new Error('Please enter your name');
      }
      if (!formData.comment.trim()) {
        throw new Error('Please enter your review');
      }
      if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
        throw new Error('Please select a valid rating');
      }

      // Prepare the review data with proper types
      const reviewData = {
        userName: formData.userName.trim(),
        rating: parseInt(formData.rating, 10),
        comment: formData.comment.trim(),
        photos: Array.isArray(formData.photos) ? formData.photos : []
      };

      // Log the review data before submission
      console.log('ReviewForm - Prepared review data:', reviewData);

      // Call the onReviewSubmitted callback with the review data
      if (onReviewSubmitted) {
        const response = await onReviewSubmitted(reviewData);
        console.log('ReviewForm - Review submitted successfully:', response);

        // Reset form
        if (response) {
          setFormData({
            userName: '',
            rating: null,
            comment: '',
            photos: []
          });
          setUploadedPhotos([]);
        }
      }
    } catch (err) {
      console.error('ReviewForm - Error submitting review:', err);
      
      // Extract the error message from the response
      let errorMessage = 'Error submitting review. Please try again.';
      if (err.response) {
        console.error('Error response data:', err.response.data);
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      } else if (err.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-section">
      <h3>Write a Review</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="userName">Your Name</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Rating</label>
          <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star-rating-input ${star <= (hoveredRating || formData.rating) ? 'star-filled' : 'star-empty'}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => handleRatingHover(star)}
                onMouseLeave={handleRatingLeave}
              >
                ★
              </span>
            ))}
            <span className="rating-text">
              {formData.rating ? `${formData.rating} ${formData.rating === 1 ? 'star' : 'stars'}` : 'Select a rating'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Your Review</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="photos">Add Photos (Optional)</label>
          <input
            type="file"
            id="photos"
            name="photos"
            onChange={handlePhotoUpload}
            accept="image/*"
            multiple
          />
        </div>

        {uploadedPhotos.length > 0 && (
          <div className="uploaded-photos">
            <h4>Uploaded Photos:</h4>
            <div className="photo-grid">
              {uploadedPhotos.map((url, index) => (
                <div key={index} className="photo-item">
                  <img 
                    src={url} 
                    alt={`Review content ${index + 1}`}
                    onError={(e) => {
                      console.error('Error loading image:', url);
                      e.target.src = '/placeholder-image.svg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
                      setFormData(prev => ({
                        ...prev,
                        photos: prev.photos.filter((_, i) => i !== index)
                      }));
                    }}
                    className="remove-photo"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProductPage.css';
import ReviewForm from '../components/ReviewForm';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    brand: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        const response = await axios.get(`/api/products/${id}`);
        console.log('Fetched product data:', response.data);
        setProduct(response.data);
        setEditForm({
          name: response.data.name,
          description: response.data.description,
          category: response.data.category,
          price: response.data.price,
          brand: response.data.brand
        });
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    console.log('Product state updated:', product);
  }, [product]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    try {
      await axios.post(`/api/products/${id}/reviews`, review);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setReview({ rating: 5, comment: '' });
      setReviewSuccess('Review submitted successfully!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        navigate('/');
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/products/${id}`, editForm);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update product');
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!product) return <div className="container mt-5">Product not found</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="img-fluid rounded product-image"
          />
        </div>
        <div className="col-md-6">
          {isEditing ? (
            <form onSubmit={handleEdit} className="edit-form">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  required
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Books">Books</option>
                  <option value="Sports">Sports</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Toys">Toys</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="product-title">{product.name}</h1>
              <p className="product-brand">Brand: {product.brand}</p>
              <p className="product-category">Category: {product.category}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <div className="product-rating">
                <span className="rating-stars">
                  {[...Array(5)].map((_, index) => (
                    <i
                      key={index}
                      className={`bi bi-star${index < product.rating ? '-fill' : ''}`}
                    />
                  ))}
                </span>
                <span className="rating-count">({product.numReviews} reviews)</span>
              </div>
              <p className="product-description">{product.description}</p>
              {user && (user.id === product.user || user.isAdmin) && (
                <div className="product-actions">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Product
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete Product
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!isEditing && product && (
        <div className="review-section">
          <h3>Reviews</h3>
          {console.log('Rendering ReviewForm with product:', product)}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="reviews-list">
              {product.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{review.userName}</span>
                    <span className="review-rating">{'★'.repeat(review.rating)}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {review.photos && review.photos.length > 0 && (
                    <div className="review-photos">
                      {review.photos.map((photo, photoIndex) => (
                        <img key={photoIndex} src={photo} alt={`Review photo ${photoIndex + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
          <ReviewForm 
            productId={id} 
            onReviewSubmitted={async (newReview) => {
              try {
                console.log('Review submitted, refreshing product data for ID:', id);
                const response = await axios.get(`/api/products/${id}`);
                setProduct(response.data);
              } catch (error) {
                console.error('Error refreshing product data:', error);
              }
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default ProductPage; 
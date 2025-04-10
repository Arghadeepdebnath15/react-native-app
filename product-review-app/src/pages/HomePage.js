import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import SuccessPopup from '../components/SuccessPopup';
import api from '../services/api';
import '../styles/AddProduct.css';
import '../styles/HomePage.css';

const HomePage = ({ showForm, setShowForm }) => {
  const { products, loading, error, refreshProducts } = useContext(ProductContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imageUrl: '',
    imagePreview: null,
    category: '',
    price: '',
    useImageUrl: false
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get search query from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageTypeChange = (e) => {
    const useImageUrl = e.target.value === 'url';
    setFormData(prev => ({
      ...prev,
      useImageUrl,
      // Clear the other type of image input
      image: useImageUrl ? null : prev.image,
      imageUrl: useImageUrl ? prev.imageUrl : '',
      imagePreview: useImageUrl ? prev.imageUrl : prev.imagePreview
    }));
    setImageError(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      setImageError(false);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    let error = '';
    
    try {
      new URL(url); // Basic URL validation
    } catch (e) {
      error = 'Please enter a valid URL';
    }
    
    setFormData(prev => ({
      ...prev,
      imageUrl: url,
      imagePreview: error ? null : url
    }));
    setImageError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      // Validate form
      if (!formData.name.trim()) {
        setFormError('Product name is required');
        setFormLoading(false);
        return;
      }

      let imageUrl = formData.imageUrl;

      // Handle image upload to Cloudinary if a file was selected
      if (!formData.useImageUrl && formData.image) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.image);
          uploadFormData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

          const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: uploadFormData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to Cloudinary');
          }

          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.secure_url;
          console.log('Uploaded image URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          setFormError('Failed to upload image. Please try again.');
          setFormLoading(false);
          return;
        }
      }

      // Create product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        imageUrl: imageUrl
      };

      // Send to backend
      const response = await api.post('/products', productData);

      if (!response.data) {
        throw new Error('Failed to create product');
      }

      // Reset form and show success
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
        imageUrl: '',
        imagePreview: '',
        useImageUrl: false
      });
      setShowForm(false);
      setSuccessMessage('Product added successfully! 🎉');
      setShowSuccess(true);
      refreshProducts(); // Refresh product list
    } catch (error) {
      console.error('Error adding product:', error);
      setFormError(error.message || 'Failed to add product. Please try again.');
      setTimeout(() => setFormError(''), 5000);
    } finally {
      setFormLoading(false);
    }
  };

  const ImageUrlInput = () => (
    <div className="form-group">
      <input
        type="text"
        id="imageUrl"
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleImageUrlChange}
        placeholder="Enter image URL"
        className={`form-control ${imageError ? 'is-invalid' : ''}`}
      />
      {imageError && <div className="invalid-feedback">{imageError}</div>}
      <small className="form-text text-muted">
        Enter a direct URL to an image (JPG, PNG, GIF, etc.)
      </small>
      <div className="alert alert-info mt-2">
        <small>
          <strong>Note:</strong> Images are stored securely in Cloudinary. Make sure you have an unsigned upload preset named 'rcwfhnbx' in your Cloudinary account.
        </small>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover Amazing Products</h1>
          <p className="hero-subtitle">Find the best products reviewed by our community</p>
        </div>
      </section>

      {showSuccess && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      {showForm && (
        <div className="floating-form-overlay" onClick={(e) => {
          if (e.target.className === 'floating-form-overlay') {
            setShowForm(false);
          }
        }}>
          <div className="add-product-container">
            <button 
              className="close-form-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            <h2>Add New Product for Review</h2>
            
            {formError && (
              <div className="alert alert-danger">
                <div className="d-flex align-items-center">
                  <svg className="me-2" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"/>
                  </svg>
                  <span>{formError}</span>
                </div>
                {formError.includes('Failed to upload image') && (
                  <div className="mt-2 small">
                    <strong>Troubleshooting:</strong>
                    <ul className="mb-0 ps-3">
                      <li>Make sure you have an unsigned upload preset named 'rcwfhnbx' in your Cloudinary account</li>
                      <li>Check that your image is less than 10MB</li>
                      <li>Try a different image format (JPG, PNG)</li>
                      <li>Use the Image URL option instead</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="add-product-form">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <div className="d-flex">
                  <label className="radio-label me-3">
                    <input
                      type="radio"
                      name="imageOption"
                      value="upload"
                      checked={!formData.useImageUrl}
                      onChange={handleImageTypeChange}
                    />
                    <span>Upload Image</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="imageOption"
                      value="url"
                      checked={formData.useImageUrl}
                      onChange={handleImageTypeChange}
                    />
                    <span>Image URL</span>
                  </label>
                </div>
                <small className="form-text text-info">
                  <strong>Note:</strong> Both options will store your images permanently. Upload Image uses Cloudinary, while Image URL lets you use any external image link.
                </small>
              </div>

              {!formData.useImageUrl ? (
                <div className="form-group">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control-file"
                  />
                  {formData.imagePreview && (
                    <div className="image-preview">
                      <img src={formData.imagePreview} alt="Preview" />
                    </div>
                  )}
                  <div className="alert alert-info mt-2">
                    <small>
                      <svg className="me-1" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      Images are stored in your Cloudinary account. To make uploads work, please create an unsigned upload preset named 'rcwfhnbx' in your Cloudinary dashboard.
                      <a href="https://cloudinary.com/console/settings/upload" target="_blank" rel="noopener noreferrer" className="ms-1 text-primary">
                        Cloudinary Upload Settings →
                      </a>
                    </small>
                  </div>
                </div>
              ) : (
                <ImageUrlInput />
              )}

              <button 
                type="submit" 
                disabled={formLoading || (formData.useImageUrl && imageError)}
              >
                {formLoading ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      <h1 style={{ textAlign: 'center', marginTop: '1rem' }}>
        {location.search ? 'Search Results' : 'Featured Products'}
      </h1>
      
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>
            {location.search 
              ? 'No products found matching your search. Please try a different search term.' 
              : 'No products found. Please check back later.'}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="product-image"
              />
              <div className="product-content">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">${product.price}</div>
                <span className="product-category">{product.category}</span>
                <div className="product-actions">
                  <button 
                    className="view-details-button"
                    onClick={() => window.location.href = `/product/${product._id}`}
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage; 
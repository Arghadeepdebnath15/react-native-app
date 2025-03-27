import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import '../styles/AddProduct.css';

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

  const validateImageUrl = (url) => {
    try {
      const urlObj = new URL(url);
      
      // Check common image extensions
      const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i;
      if (imageExtensions.test(urlObj.pathname)) {
        return true;
      }
      
      // Check for image-related keywords
      const urlString = url.toLowerCase();
      if (urlString.includes('image') || 
          urlString.includes('photo') || 
          urlString.includes('picture') ||
          urlString.includes('media')) {
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
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
      if (!validateImageUrl(url)) {
        error = 'URL does not appear to be an image. Please check the URL.';
      }
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

      if (formData.useImageUrl && !validateImageUrl(formData.imageUrl)) {
        setFormError('Please enter a valid image URL');
        setFormLoading(false);
        return;
      }

      // Create FormData object for API request
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);

      // Handle image upload
      if (!formData.useImageUrl && formData.image) {
        // Update to use the correct Cloudinary cloud name
        const cloudName = 'dbhl52bav'; // Your Cloudinary cloud name
        const uploadPreset = 'rcwfhnbx'; // Your unsigned upload preset
        
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', formData.image);
        cloudinaryData.append('upload_preset', uploadPreset);
        
        try {
          // Upload to Cloudinary using the correct endpoint
          const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
          console.log('Uploading to Cloudinary:', cloudinaryUrl);
          
          const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: cloudinaryData
          });
          
          if (!cloudinaryResponse.ok) {
            const errorText = await cloudinaryResponse.text();
            console.error('Cloudinary error response:', errorText);
            throw new Error(`Failed to upload to Cloudinary: ${cloudinaryResponse.status}`);
          }
          
          const cloudinaryJson = await cloudinaryResponse.json();
          
          // Use the secure URL from Cloudinary
          if (cloudinaryJson.secure_url) {
            formDataToSend.append('imageUrl', cloudinaryJson.secure_url);
          } else {
            throw new Error('No image URL returned from Cloudinary');
          }
          
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          setFormError('Failed to upload image. Please try using an image URL instead.');
          setFormLoading(false);
          return;
        }
      } else if (formData.useImageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      } else {
        // No image provided
        setFormError('Please provide an image or image URL');
        setFormLoading(false);
        return;
      }

      // Send to your backend
      const response = await fetch(`${api.defaults.baseURL}/products`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
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
      setSuccessMessage('Product added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
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
      <div className="container loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading products...</h2>
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

  return (
    <div className="container">
      {/* Show success message if present */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')} aria-label="Close"></button>
        </div>
      )}
      
      {showForm && (
        <div className="floating-form-overlay" onClick={(e) => {
          // Close form when clicking overlay (outside form)
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
                      <li>Make sure you have an unsigned upload preset named 'product_review_app' in your Cloudinary account</li>
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
                      Images are stored in your Cloudinary account. To make uploads work, please create an unsigned upload preset named 'product_review_app' in your Cloudinary dashboard.
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

      <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>
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
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage; 
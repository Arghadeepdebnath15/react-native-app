import React, { useContext, useState } from 'react';
import { ProductContext } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import '../styles/AddProduct.css';

const HomePage = ({ showForm, setShowForm }) => {
  const { products, loading, error, refreshProducts } = useContext(ProductContext);
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

  const handleImageError = () => {
    setImageError(true);
    setFormData(prev => ({
      ...prev,
      imagePreview: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.useImageUrl && !validateImageUrl(formData.imageUrl)) {
      setFormError('Please enter a valid image URL');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      
      // Handle image based on type selection
      if (formData.useImageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      } else if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await api.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        image: null,
        imageUrl: '',
        imagePreview: null,
        category: '',
        price: '',
        useImageUrl: false
      });
      setShowForm(false);
      setImageError(false);
      
      // Refresh products list
      refreshProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error adding product. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

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
            {formError && <div className="error-message">{formError}</div>}
            
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

              <div className="form-group">
                <label>Image Source</label>
                <div className="image-source-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="imageSource"
                      value="file"
                      checked={!formData.useImageUrl}
                      onChange={handleImageTypeChange}
                    />
                    <span>Upload Image</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="imageSource"
                      value="url"
                      checked={formData.useImageUrl}
                      onChange={handleImageTypeChange}
                    />
                    <span>Image URL</span>
                  </label>
                </div>

                {formData.useImageUrl ? (
                  <div>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleImageUrlChange}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      className={imageError ? 'error' : ''}
                      required
                    />
                    {imageError && (
                      <div className="input-error">
                        {imageError}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    required
                  />
                )}

                {formData.imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      onError={handleImageError}
                    />
                  </div>
                )}
              </div>

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

      <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>Featured Products</h1>
      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Please check back later.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage; 
import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the production URL
    return process.env.REACT_APP_API_URL || 'https://newrepo-pk31.onrender.com/api';
  } else {
    // In development, use localhost
    return 'http://localhost:8080/api';
  }
};

// Log the API URL being used
console.log('API URL:', getApiUrl());

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Reduced timeout for faster error feedback
  timeout: 5000,
  // Add retry logic
  retry: 2,
  retryDelay: 1000
});

// Add retry interceptor
api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  
  config.retryCount = config.retryCount || 0;
  
  if (config.retryCount >= config.retry) {
    return Promise.reject(err);
  }
  
  config.retryCount += 1;
  const backoff = new Promise(resolve => {
    setTimeout(() => resolve(), config.retryDelay || 1000);
  });
  
  await backoff;
  return api(config);
});

// API methods for products
export const fetchProducts = async (page = 1, limit = 12) => {
  try {
    const response = await api.get('/products', {
      params: {
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    console.log('Fetching product by ID:', id);
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

export const addReview = async (productId, reviewData) => {
  try {
    console.log('API sending review to server for product ID:', productId);
    console.log('Review data:', reviewData);
    
    // Ensure consistent ID format
    const idToUse = productId ? productId.toString() : productId;
    
    // Validate the review data before sending
    if (!idToUse) {
      throw new Error('Product ID is required');
    }
    
    if (!reviewData || typeof reviewData !== 'object') {
      throw new Error('Invalid review data format');
    }
    
    // Validate required fields
    const requiredFields = ['userName', 'rating', 'comment'];
    const missingFields = requiredFields.filter(field => !reviewData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Ensure rating is a number and within valid range
    const rating = Number(reviewData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5');
    }
    
    // Prepare the review data
    const preparedReviewData = {
      userName: reviewData.userName.trim(),
      rating: rating,
      comment: reviewData.comment.trim(),
      photos: Array.isArray(reviewData.photos) ? reviewData.photos : []
    };
    
    // Log the full request details
    console.log('API - Full request details:', {
      url: `/products/${idToUse}/reviews`,
      method: 'POST',
      data: preparedReviewData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.post(`/products/${idToUse}/reviews`, preparedReviewData);
    console.log('API received response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    
    // Log the full error details
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // If the server provided a specific error message, use it
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw error;
  }
};

export const addProduct = async (productData) => {
  try {
    console.log('Adding new product:', productData);
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export default api; 
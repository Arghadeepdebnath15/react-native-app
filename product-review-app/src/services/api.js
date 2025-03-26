import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // First check for production environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Get current hostname for development environment
  const currentHostname = window.location.hostname;
  
  // Use the same host for API calls, but with port 5000
  if (currentHostname !== 'localhost') {
    return `http://${currentHostname}:5000/api`;
  }
  
  // Default for localhost development
  return 'http://localhost:5000/api';
};

// Log the API URL being used
console.log('API URL:', getApiUrl());

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for slow connections
  timeout: 10000,
});

// Helper function to determine if a product is problematic
const isProblematicProduct = (productId, productName = '') => {
  if (productName && (productName.includes('Headphone') || productName.includes('Watch'))) {
    return true;
  }
  // If we don't have a name but have an ID, try to detect based on ID
  if (productId && typeof productId === 'string') {
    // Log the ID for debugging
    console.log('Checking if product ID is problematic:', productId);
    return true;
  }
  return false;
};

// API methods for products
export const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
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
    
    // Special handling for problematic products
    const problematic = isProblematicProduct(productId);
    
    // Ensure consistent ID format
    const idToUse = productId ? productId.toString() : productId;
    
    if (problematic) {
      console.log('Using special handling for problematic product with ID:', idToUse);
      
      // Apply multiple attempts for problematic products
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Attempt ${attempts} for problematic product`);
          
          // Add a small delay between attempts
          if (attempts > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          const response = await api.post(`/products/${idToUse}/reviews`, reviewData);
          console.log('API received response:', response.data);
          return response.data;
        } catch (err) {
          console.error(`Attempt ${attempts} failed:`, err);
          lastError = err;
          
          // If this is not the last attempt, continue to the next one
          if (attempts < maxAttempts) {
            continue;
          }
          
          // Otherwise, re-throw the error
          throw lastError;
        }
      }
    } else {
      // Normal handling for non-problematic products
      const response = await api.post(`/products/${idToUse}/reviews`, reviewData);
      console.log('API received response:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export default api; 
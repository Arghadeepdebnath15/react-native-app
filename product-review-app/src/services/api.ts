import axios from 'axios';
import { Product } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('API URL:', API_URL); // Log the API URL being used

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const api = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get('/api/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id: string): Promise<Product> => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Add review to product
  addReview: async (productId: string, review: {
    rating: number;
    comment: string;
    userName: string;
  }): Promise<Product> => {
    try {
      const response = await axiosInstance.post(`/products/${productId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
}; 
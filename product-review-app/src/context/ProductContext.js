import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProducts, fetchProductById, addReview } from '../services/api';

// Create a context for products
export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch products
  const getProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    getProducts();
  }, []);

  // Refresh products function
  const refreshProducts = useCallback(async () => {
    await getProducts();
  }, []);

  // Get a single product by ID using useCallback to prevent unnecessary re-renders
  const getProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await fetchProductById(id);
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch product with ID ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a review to a product using useCallback
  const submitReview = useCallback(async (productId, reviewData) => {
    try {
      setLoading(true);
      console.log('Submitting review for product ID:', productId);
      const updatedProduct = await addReview(productId, reviewData);
      
      // Update products state with the updated product
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          // Compare by string _id instead of object reference
          if (product._id && product._id.toString() === productId.toString()) {
            console.log('Found matching product to update:', product._id);
            return updatedProduct;
          }
          return product;
        });
      });
      
      console.log('Updated product data:', updatedProduct);
      return updatedProduct;
    } catch (err) {
      console.error('Error submitting review:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    products,
    loading,
    error,
    getProduct,
    submitReview,
    refreshProducts
  }), [products, loading, error, getProduct, submitReview, refreshProducts]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProducts, fetchProductById, addReview } from '../services/api';

// Create a context for products
export const ProductContext = createContext();

// Cache implementation
const cache = {
  data: {},
  timestamp: {},
  maxAge: 5 * 60 * 1000, // 5 minutes
};

const isCacheValid = (key) => {
  const timestamp = cache.timestamp[key];
  if (!timestamp) return false;
  return Date.now() - timestamp < cache.maxAge;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 12;

  // Function to fetch products with pagination
  const getProducts = async (pageNum = 1, refresh = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setIsLoadingMore(true);

      // Check cache first
      const cacheKey = `products_page_${pageNum}`;
      if (!refresh && isCacheValid(cacheKey)) {
        const cachedData = cache.data[cacheKey];
        setProducts(prev => pageNum === 1 ? cachedData : [...prev, ...cachedData]);
        setHasMore(cachedData.length === itemsPerPage);
      } else {
        const data = await fetchProducts(pageNum, itemsPerPage);
        
        // Update cache
        cache.data[cacheKey] = data;
        cache.timestamp[cacheKey] = Date.now();
        
        setProducts(prev => pageNum === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === itemsPerPage);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    getProducts(1);
  }, []);

  // Refresh products function
  const refreshProducts = useCallback(async () => {
    await getProducts(1, true);
  }, []);

  // Load more products
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setPage(prev => prev + 1);
    getProducts(page + 1);
  }, [hasMore, isLoadingMore, page]);

  // Get a single product by ID with caching
  const getProduct = useCallback(async (id) => {
    try {
      const cacheKey = `product_${id}`;
      if (isCacheValid(cacheKey)) {
        return cache.data[cacheKey];
      }

      setLoading(true);
      const data = await fetchProductById(id);
      
      // Update cache
      cache.data[cacheKey] = data;
      cache.timestamp[cacheKey] = Date.now();
      
      return data;
    } catch (err) {
      setError(err.message || `Failed to fetch product with ID ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a review to a product
  const submitReview = useCallback(async (productId, reviewData) => {
    try {
      setLoading(true);
      const updatedProduct = await addReview(productId, reviewData);
      
      // Update cache
      const cacheKey = `product_${productId}`;
      cache.data[cacheKey] = updatedProduct;
      cache.timestamp[cacheKey] = Date.now();
      
      // Update products list
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === productId ? updatedProduct : product
        )
      );
      
      return updatedProduct;
    } catch (err) {
      console.error('Error submitting review:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the context value
  const value = useMemo(() => ({
    products,
    loading,
    error,
    getProduct,
    submitReview,
    refreshProducts,
    loadMore,
    hasMore,
    isLoadingMore
  }), [products, loading, error, getProduct, submitReview, refreshProducts, loadMore, hasMore, isLoadingMore]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 
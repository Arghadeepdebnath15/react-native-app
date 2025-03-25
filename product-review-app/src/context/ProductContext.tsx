import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Review } from '../types';

interface ProductContextType {
  oppoReviews: Review[];
  averageRating: number;
  addOppoReview: (review: Omit<Review, 'id' | 'productId' | 'date'>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'oppo-product-reviews';

// Initialize state from localStorage
const getInitialReviews = (): Review[] => {
  if (typeof window === 'undefined') return [];
  
  const savedReviews = localStorage.getItem(STORAGE_KEY);
  if (savedReviews) {
    try {
      return JSON.parse(savedReviews);
    } catch (error) {
      console.error('Error parsing saved reviews:', error);
      return [];
    }
  }
  return [];
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [oppoReviews, setOppoReviews] = useState<Review[]>(getInitialReviews());
  const [averageRating, setAverageRating] = useState(() => {
    const reviews = getInitialReviews();
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      return sum / reviews.length;
    }
    return 0;
  });

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oppoReviews));
  }, [oppoReviews]);

  // Calculate average rating whenever reviews change
  useEffect(() => {
    if (oppoReviews.length > 0) {
      const sum = oppoReviews.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / oppoReviews.length;
      setAverageRating(average);
    } else {
      setAverageRating(0);
    }
  }, [oppoReviews]);

  const addOppoReview = (review: Omit<Review, 'id' | 'productId' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      productId: 'oppo-product',
      date: new Date().toISOString(),
    };
    setOppoReviews(prev => [...prev, newReview]);
  };

  return (
    <ProductContext.Provider value={{ oppoReviews, averageRating, addOppoReview }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}; 
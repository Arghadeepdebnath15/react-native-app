import React, { useEffect, useRef } from 'react';
import { useProduct } from '../context/ProductContext';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import '../styles/ProductsList.css';

const ProductsList = () => {
  const { products, loading, error, loadMore, hasMore, isLoadingMore } = useProduct();
  const observer = useRef();
  const lastProductRef = useRef();

  useEffect(() => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    });

    if (lastProductRef.current) {
      observer.current.observe(lastProductRef.current);
    }
  }, [loading, hasMore, isLoadingMore, loadMore]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="products-container">
      <div className="products-grid">
        {products.map((product, index) => (
          <div
            key={product._id}
            ref={index === products.length - 1 ? lastProductRef : null}
          >
            <ProductCard product={product} />
          </div>
        ))}
        {(loading || isLoadingMore) && (
          <>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsList; 
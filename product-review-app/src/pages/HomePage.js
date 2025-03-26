import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const { products, loading, error } = useContext(ProductContext);

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
      <h1 style={{ textAlign: 'center' }}>Featured Products</h1>
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
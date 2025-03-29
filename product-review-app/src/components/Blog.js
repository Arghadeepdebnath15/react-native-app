import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Blog.css';

const Blog = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Product Review Blog</h1>
        <button className="home-button" onClick={handleHomeClick}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="home-icon">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          Back to Home
        </button>
      </div>
      
      <div className="blog-content">
        <article className="blog-post">
          <h2>Latest Product Reviews</h2>
          <div className="post-meta">
            <span className="date">March 15, 2024</span>
            <span className="author">By Review Team</span>
          </div>
          <p>
            Welcome to our product review blog! Here you'll find detailed insights,
            comparisons, and honest reviews of the latest products in the market.
          </p>
        </article>

        <article className="blog-post">
          <h2>How to Write a Good Review</h2>
          <div className="post-meta">
            <span className="date">March 14, 2024</span>
            <span className="author">By Review Team</span>
          </div>
          <p>
            Learn the best practices for writing helpful and informative product reviews
            that will help other shoppers make better decisions.
          </p>
        </article>

        <article className="blog-post">
          <h2>Top Rated Products This Month</h2>
          <div className="post-meta">
            <span className="date">March 13, 2024</span>
            <span className="author">By Review Team</span>
          </div>
          <p>
            Discover the most highly rated products from our community of reviewers
            this month.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Blog; 
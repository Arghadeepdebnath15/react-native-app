import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MessageButton from '../components/MessageButton';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleViewProducts = () => {
    navigate('/products');
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <h1>Welcome to Product Reviews</h1>
        <p>Discover and review the latest products</p>
      </div>
      
      <div className="dashboard-actions">
        <button 
          className="view-products-btn"
          onClick={handleViewProducts}
        >
          View All Products
        </button>
        <MessageButton />
      </div>
    </div>
  );
};

export default DashboardPage; 
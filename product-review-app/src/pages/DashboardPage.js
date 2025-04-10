import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import MessageButton from '../components/MessageButton';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showProducts, setShowProducts] = useState(false);

  const handleViewProducts = () => {
    setShowProducts(true);
    navigate('/products');
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <p>Discover and manage your products in one place</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
            </svg>
          </div>
          <h2>Product Management</h2>
          <p>View and manage all your products in one place</p>
          <button className="dashboard-button" onClick={handleViewProducts}>
            View Products
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h2>Analytics</h2>
          <p>Track your product performance and reviews</p>
          <button className="dashboard-button">
            View Analytics
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h2>Profile</h2>
          <p>Manage your account settings and preferences</p>
          <button className="dashboard-button" onClick={() => navigate('/profile')}>
            View Profile
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </div>
          <h2>Messages</h2>
          <p>Connect with other users and manage your conversations</p>
          <MessageButton />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 
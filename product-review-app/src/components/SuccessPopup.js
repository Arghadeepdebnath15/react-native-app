import React, { useEffect } from 'react';
import '../styles/SuccessPopup.css';

const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-popup">
      <div className="success-content">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="success-message">{message}</div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default SuccessPopup; 
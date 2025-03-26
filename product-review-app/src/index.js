import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Improve scroll performance with passive scroll listeners
document.addEventListener('DOMContentLoaded', () => {
  // Use passive event listeners for touch and wheel events
  const supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (e) {}

  // Apply passive listeners to all scroll events
  const wheelOpt = supportsPassive ? { passive: true } : false;
  const wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
  
  // Prevent scrolling slowdowns by making events passive
  window.addEventListener('scroll', function() {}, wheelOpt);
  window.addEventListener(wheelEvent, function() {}, wheelOpt);
  window.addEventListener('touchstart', function() {}, wheelOpt);
  window.addEventListener('touchmove', function() {}, wheelOpt);
  
  // Apply content visibility auto to elements outside the viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('product-card') || 
            entry.target.classList.contains('review-card')) {
          if (!entry.isIntersecting) {
            entry.target.style.contentVisibility = 'auto';
          } else {
            entry.target.style.contentVisibility = 'visible';
          }
        }
      });
    }, { rootMargin: '100px' });
    
    // Apply after components are loaded
    setTimeout(() => {
      document.querySelectorAll('.product-card, .review-card').forEach(el => {
        observer.observe(el);
      });
    }, 1000);
  }
  
  // Add smooth scroll stopping behavior
  let isScrolling;
  window.addEventListener('scroll', function() {
    // Clear our timeout throughout the scroll
    window.clearTimeout(isScrolling);
    
    // Set a timeout to run after scrolling ends
    isScrolling = setTimeout(function() {
      // Smooth snap to nearest element when scrolling stops
      const scrollables = document.querySelectorAll('.product-card, .review-card, section, .product-detail');
      if (scrollables.length > 0) {
        let closest = null;
        let closestDistance = Infinity;
        const scrollPosition = window.scrollY + 70; // Adjust for header
        
        scrollables.forEach(element => {
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const distance = Math.abs(elementTop - scrollPosition);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = element;
          }
        });
        
        // Only snap if we're not too far away (prevents snapping when scrolling quickly)
        if (closest && closestDistance < 100) {
          const elementTop = closest.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementTop - 70, // Adjust for header
            behavior: 'smooth'
          });
        }
      }
    }, 66); // Adjust timing for optimal experience
  }, wheelOpt);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

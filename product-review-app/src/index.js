import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Improve scroll performance with passive scroll listeners
document.addEventListener('DOMContentLoaded', () => {
  // Use passive event listeners for touch and wheel events
  let supportsPassive = false;
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
  
  // Enable smooth reloading
  window.addEventListener('beforeunload', () => {
    // Remove scroll behavior temporarily to enable smooth reloading
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    // Reset scroll position on reload
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
  });
  
  // Restore scroll position after reloading
  const savedPosition = sessionStorage.getItem('scrollPosition');
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition, 10));
    sessionStorage.removeItem('scrollPosition');
  }
  
  // Simplify scroll stopping to prevent reload issues
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(function() {
      // Do minimal work on scroll stop to avoid breaking reload
    }, 66);
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

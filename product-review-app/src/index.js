import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Improve scroll performance with passive scroll listeners and handle mobile devices
document.addEventListener('DOMContentLoaded', () => {
  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Add mobile class to html element
  if (isMobile) {
    document.documentElement.classList.add('mobile-device');
    // Force disable smooth scrolling on mobile
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.style.scrollSnapType = 'none';
  }
  
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
  
  // Special handling for orientation change on mobile devices
  if (isMobile) {
    window.addEventListener('orientationchange', function() {
      // Force disable smooth scrolling during orientation changes
      document.documentElement.classList.add('reloading');
      setTimeout(() => {
        document.documentElement.classList.remove('reloading');
      }, 1000);
    });
    
    // Additional fix for Safari on iOS
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        // Page was restored from cache (back/forward navigation)
        document.documentElement.classList.add('reloading');
        setTimeout(() => {
          document.documentElement.classList.remove('reloading');
        }, 1000);
      }
    });
  }
  
  // Only apply IntersectionObserver on desktop devices
  if (!isMobile && 'IntersectionObserver' in window) {
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
    document.documentElement.classList.add('reloading');
    
    // Reset scroll position on reload
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    if (isMobile) {
      sessionStorage.setItem('isMobileReload', 'true');
    }
  });
  
  // Restore scroll position after reloading
  const savedPosition = sessionStorage.getItem('scrollPosition');
  if (savedPosition) {
    const scrollPos = parseInt(savedPosition, 10);
    
    // Clear storage
    sessionStorage.removeItem('scrollPosition');
    
    // Wait for page to be fully loaded, especially important on mobile
    const scrollDelay = isMobile ? 500 : 0;
    setTimeout(() => {
      // Scroll to the saved position
      window.scrollTo(0, scrollPos);
      
      // Only re-enable smooth scrolling on desktop after a delay
      setTimeout(() => {
        document.documentElement.classList.remove('reloading');
        if (!isMobile) {
          document.documentElement.style.scrollBehavior = 'smooth';
        }
      }, 1000);
    }, scrollDelay);
  } else {
    setTimeout(() => {
      document.documentElement.classList.remove('reloading');
    }, 500);
  }
  
  // Simple scroll handler that won't interfere with reloading
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(function() {
      // Minimal work on scroll stop to avoid breaking reload
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

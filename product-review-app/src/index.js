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
    document.documentElement.style.overscrollBehavior = 'none';
    document.documentElement.style.webkitOverflowScrolling = 'touch';
    
    // Reset any problematic styles
    document.documentElement.style.position = 'static';
    document.body.style.position = 'static';
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    
    // Set viewport height for mobile
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update viewport height on resize and orientation change
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
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
  
  if (isMobile) {
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
      document.documentElement.classList.add('reloading');
      // Force redraw after orientation change
      setTimeout(() => {
        document.body.style.display = 'none';
        // Force reflow by reading offsetHeight
        // eslint-disable-next-line no-unused-vars
        const forceReflow = document.body.offsetHeight;
        document.body.style.display = '';
        document.documentElement.classList.remove('reloading');
      }, 100);
    });
    
    // Handle page show events (back/forward navigation)
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        document.documentElement.classList.add('reloading');
        // Force redraw for cached pages
        setTimeout(() => {
          document.body.style.display = 'none';
          // Force reflow by reading offsetHeight
          // eslint-disable-next-line no-unused-vars
          const forceReflow = document.body.offsetHeight;
          document.body.style.display = '';
          document.documentElement.classList.remove('reloading');
        }, 100);
      }
    });
    
    // Handle beforeunload events
    window.addEventListener('beforeunload', () => {
      // Disable smooth scrolling before unload
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      // Save scroll position
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      sessionStorage.setItem('isMobileReload', 'true');
    });
    
    // Restore scroll position if needed
    const savedPosition = sessionStorage.getItem('scrollPosition');
    const isMobileReload = sessionStorage.getItem('isMobileReload');
    
    if (savedPosition && isMobileReload) {
      const scrollPos = parseInt(savedPosition, 10);
      sessionStorage.removeItem('scrollPosition');
      sessionStorage.removeItem('isMobileReload');
      
      // Wait for page to be fully loaded
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
        // Keep scroll behavior disabled
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';
      }, 500);
    }
  }
  
  // Simple scroll handler that won't interfere with reloading
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      // Minimal work on scroll stop
      if (isMobile) {
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';
      }
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

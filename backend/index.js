const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const { networkInterfaces } = require('os');
const path = require('path');

// Load environment variables
dotenv.config();

// Get local IP address for display purposes
const getLocalIpAddress = () => {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Return the first found IP address or fallback
  for (const name of Object.keys(results)) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }
  
  return 'unknown';
};

const app = express();
const PORT = process.env.PORT || 8080; // Use PORT from environment or default to 8080 instead of fixed 5000
const localIp = getLocalIpAddress();
const isProduction = process.env.NODE_ENV === 'production';

// CORS config with proper origins for production
const corsOptions = {
  origin: [
    'https://product-review-site.netlify.app',
    'https://argha15.netlify.app',  // Add your actual Netlify domain
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.0.103:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Routes
app.use('/api/products', productRoutes);
// Also expose directly at /products for compatibility
app.use('/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://debnatharghadeep:0Hr48knsIqg0VbSI@cluster0.kuoaoaz.mongodb.net/product-reviews?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create server with port handling - explicitly binding to 0.0.0.0 to make accessible on the network
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
  
  if (!isProduction) {
    console.log(`Local:            http://localhost:${PORT}/api/products`);
    console.log(`On Your Network:  http://${localIp}:${PORT}/api/products`);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Closing previous instance...`);
    console.log(`Please manually close the application using port ${PORT} or change the PORT in .env`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
}); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// MongoDB connection with better error handling
mongoose.connect('mongodb+srv://aarghadeepdebnath:Arghadeep15@cluster0.bpxus.mongodb.net/product_reviews?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// CORS configuration with more detailed logging
const corsOptions = {
  origin: ['http://localhost:3000', 'https://arghadeep15.netlify.app', 'https://react-native-app-f5dz.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Enhanced debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  rating: Number,
  reviews: [{
    rating: Number,
    comment: String,
    userName: String,
    date: { type: Date, default: Date.now }
  }]
});

const Product = mongoose.model('Product', productSchema);

// Routes
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product details' });
  }
});

// Add review to product
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { rating, comment, userName } = req.body;
    
    // Validate review data
    if (!rating || !comment || !userName) {
      return res.status(400).json({ message: 'Missing required review fields' });
    }

    product.reviews.push({ rating, comment, userName });
    
    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
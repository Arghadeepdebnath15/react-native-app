const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const axios = require('axios');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Basic URL validation
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Check if URL likely points to an image based on extension or content type
const isLikelyImageUrl = (url) => {
  // Common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i;
  
  try {
    const urlObj = new URL(url);
    // Check pathname for image extension
    if (imageExtensions.test(urlObj.pathname)) {
      return true;
    }
    
    // Check if URL contains image-related keywords
    const urlString = url.toLowerCase();
    if (urlString.includes('image') || 
        urlString.includes('photo') || 
        urlString.includes('picture') ||
        urlString.includes('media')) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a product with image upload or URL
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl;

    // Check if an image URL was provided
    if (req.body.imageUrl) {
      // Basic URL validation
      if (!isValidUrl(req.body.imageUrl)) {
        return res.status(400).json({ 
          message: 'Please enter a valid URL' 
        });
      }

      // Additional check for likely image URL
      if (!isLikelyImageUrl(req.body.imageUrl)) {
        return res.status(400).json({ 
          message: 'The URL does not appear to be an image. Please check the URL and try again.' 
        });
      }

      imageUrl = req.body.imageUrl;
    } 
    // Otherwise use the uploaded file
    else if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Either an image file or image URL is required' });
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      imageUrl: imageUrl
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    // If there's an error and we uploaded a file, remove it
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error removing uploaded file:', unlinkErr);
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// Add a review to a product
router.post('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const { userName, rating, comment } = req.body;
    
    product.reviews.push({ userName, rating, comment });
    await product.save();
    
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If the product has an uploaded image (not a URL), delete it from the uploads folder
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve uploaded files statically
router.use('/uploads', express.static('uploads'));

module.exports = router; 
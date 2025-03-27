const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const axios = require('axios');

// Basic URL validation
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Check if URL is from Cloudinary
const isCloudinaryUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cloudinary.com');
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

// Create a product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !imageUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate image URL
    if (!isValidUrl(imageUrl)) {
      return res.status(400).json({ message: 'Invalid image URL' });
    }

    // Validate that the image URL is from Cloudinary
    if (!isCloudinaryUrl(imageUrl)) {
      return res.status(400).json({ message: 'Image must be uploaded to Cloudinary first' });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a review to a product
router.post('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const { userName, rating, comment, photos } = req.body;
    
    // Validate review data
    if (!userName || !rating || !comment) {
      return res.status(400).json({ message: 'Name, rating, and comment are required' });
    }

    // Validate photos if provided
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (!isValidUrl(photo)) {
          return res.status(400).json({ message: 'Invalid photo URL' });
        }
        if (!isCloudinaryUrl(photo)) {
          return res.status(400).json({ message: 'Photos must be uploaded to Cloudinary first' });
        }
      }
    }
    
    product.reviews.push({ userName, rating, comment, photos: photos || [] });
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

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 
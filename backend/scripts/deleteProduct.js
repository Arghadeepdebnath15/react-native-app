require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Function to list all products
async function listProducts() {
  try {
    console.log('\nFetching products from database...');
    const products = await Product.find({});
    
    if (!products || products.length === 0) {
      console.log('\nNo products found in the database.');
      return [];
    }

    console.log(`\nFound ${products.length} products:`);
    console.log('------------------');
    products.forEach(product => {
      console.log(`ID: ${product._id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Price: $${product.price}`);
      console.log(`Category: ${product.category}`);
      console.log('------------------');
    });
    return products;
  } catch (err) {
    console.error('Error listing products:', err);
    return [];
  }
}

// Function to delete a product
async function deleteProduct(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found with ID:', productId);
      return false;
    }

    // Delete associated image file if it exists
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Associated image file deleted');
      }
    }

    await Product.findByIdAndDelete(productId);
    console.log(`Product "${product.name}" deleted successfully`);
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    return false;
  }
}

// Main function
async function main() {
  try {
    // MongoDB Connection URL
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI not found in .env file');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get product ID from command line argument
    const productId = process.argv[2];

    if (!productId) {
      // If no ID provided, list products and exit
      await listProducts();
      console.log('\nUsage: node deleteProduct.js <product-id>');
      console.log('Please copy an ID from the list above and run the command again');
    } else {
      // If ID provided, delete the product
      await deleteProduct(productId);
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Start the script
main(); 
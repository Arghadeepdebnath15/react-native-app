require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

// MongoDB Connection URL - use MONGO_URI from .env
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI not found in .env file');
  process.exit(1);
}

// Function to list all products with detailed logging
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
      console.log(`Image URL: ${product.imageUrl}`);
      console.log('------------------');
    });
    return products;
  } catch (err) {
    console.error('Error listing products:', err);
    console.error('Full error:', err.stack);
    if (err.name === 'MongooseError') {
      console.error('Database connection error. Please check your MongoDB connection.');
    }
    return [];
  }
}

// Function to delete a product
async function deleteProduct(productId) {
  try {
    console.log(`\nAttempting to delete product with ID: ${productId}`);
    const product = await Product.findById(productId);
    
    if (!product) {
      console.log('Product not found with ID:', productId);
      return false;
    }

    // Delete associated image file if it exists
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.imageUrl);
      console.log('Checking for associated image file at:', imagePath);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Associated image file deleted successfully');
      } else {
        console.log('No associated image file found');
      }
    }

    await Product.findByIdAndDelete(productId);
    console.log(`Product "${product.name}" deleted successfully`);
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    if (err.name === 'CastError') {
      console.error('Invalid product ID format');
    }
    return false;
  }
}

// Function to handle user input with Promise
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Main menu function
async function showMenu() {
  try {
    console.log('\nProduct Management Script');
    console.log('1. List all products');
    console.log('2. Delete a product');
    console.log('3. Exit');

    const answer = await askQuestion('\nSelect an option (1-3): ');

    switch (answer) {
      case '1':
        await listProducts();
        await showMenu();
        break;

      case '2':
        const products = await listProducts();
        if (products.length === 0) {
          console.log('No products available to delete');
          await showMenu();
          return;
        }

        const productId = await askQuestion('\nEnter the ID of the product to delete: ');
        const confirmation = await askQuestion('Are you sure you want to delete this product? (yes/no): ');
        
        if (confirmation.toLowerCase() === 'yes') {
          await deleteProduct(productId);
        } else {
          console.log('Deletion cancelled');
        }
        await showMenu();
        break;

      case '3':
        console.log('Exiting...');
        rl.close();
        mongoose.connection.close();
        process.exit(0);
        break;

      default:
        console.log('Invalid option. Please try again.');
        await showMenu();
        break;
    }
  } catch (error) {
    console.error('An error occurred:', error);
    await showMenu();
  }
}

// Connect to MongoDB and start the application
async function start() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // Start the menu
    console.log('\nDeveloper Product Management Tool');
    console.log('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Hide credentials
    await showMenu();
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nClosing MongoDB connection...');
  mongoose.connection.close();
  process.exit(0);
});

// Start the application
start(); 
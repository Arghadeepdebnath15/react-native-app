require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://debnatharghadeep:0Hr48knsIqg0VbSI@cluster0.kuoaoaz.mongodb.net/product-reviews?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Function to delete a product
async function deleteProduct(productId, productName) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found with ID:', productId);
      return false;
    }

    // Delete associated image file if it exists
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Associated image file deleted');
      }
    }

    await Product.findByIdAndDelete(productId);
    console.log(`Product "${productName}" deleted successfully`);
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectDB();

    // Find products with "argha" or "anything" in their name or description
    const targetKeywords = ['argha', 'anything'];
    
    const products = await Product.find({
      $or: [
        { name: { $regex: new RegExp(targetKeywords.join('|'), 'i') } },
        { description: { $regex: new RegExp(targetKeywords.join('|'), 'i') } }
      ]
    });

    if (products.length === 0) {
      console.log('No products found matching the criteria.');
    } else {
      console.log(`Found ${products.length} products to delete:`);
      
      for (const product of products) {
        console.log(`Deleting: ${product.name} (ID: ${product._id})`);
        await deleteProduct(product._id, product.name);
      }
      
      console.log('Deletion process complete.');
    }

    // Close DB connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node update-product-image.js productId newImageUrl');
  console.error('Example: node update-product-image.js 67e3f490d6e04386796cf857 https://images.unsplash.com/new-image-url');
  process.exit(1);
}

// Parse arguments
const [productId, newImageUrl] = args;

// Update the product image directly in MongoDB
async function updateProductImage() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://debnatharghadeep:0Hr48knsIqg0VbSI@cluster0.kuoaoaz.mongodb.net/product-reviews?retryWrites=true&w=majority');
    
    console.log(`Looking up product with ID: ${productId}`);
    
    // Find the product
    const product = await Product.findById(productId);
    
    if (!product) {
      console.error(`Product with ID ${productId} not found!`);
      process.exit(1);
    }
    
    console.log('Current product data:');
    console.log(`Name: ${product.name}`);
    console.log(`Current image URL: ${product.imageUrl}`);
    
    // Update the image URL
    console.log(`Updating image URL to: ${newImageUrl}`);
    
    product.imageUrl = newImageUrl;
    await product.save();
    
    console.log('Product image updated successfully!');
    console.log(`Product ID: ${product._id}`);
    console.log(`New image URL: ${product.imageUrl}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error updating product:', error.message);
    // Close the connection if open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(1);
  }
}

// Run the function
updateProductImage(); 
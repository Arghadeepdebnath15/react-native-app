const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node update-product-details.js productId fieldName newValue');
  console.error('Example: node update-product-details.js 67e3f490d6e04386796cf857 name "New Product Name"');
  console.error('Example: node update-product-details.js 67e3f490d6e04386796cf857 price 99.99');
  console.error('Example: node update-product-details.js 67e3f490d6e04386796cf857 category Electronics');
  console.error('\nAvailable fields: name, description, price, category, imageUrl');
  process.exit(1);
}

// Parse arguments
const [productId, fieldName, newValue] = args;

// Validate field name
const validFields = ['name', 'description', 'price', 'category', 'imageUrl'];
if (!validFields.includes(fieldName)) {
  console.error(`Invalid field name. Available fields: ${validFields.join(', ')}`);
  process.exit(1);
}

// Convert price to number if updating price
const valueToUpdate = fieldName === 'price' ? parseFloat(newValue) : newValue;

// Update the product details directly in MongoDB
async function updateProductDetails() {
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
    console.log(`Price: $${product.price}`);
    console.log(`Category: ${product.category}`);
    console.log(`Description: ${product.description}`);
    console.log(`Image URL: ${product.imageUrl}`);
    
    // Update the specified field
    console.log(`\nUpdating ${fieldName} to: ${newValue}`);
    
    product[fieldName] = valueToUpdate;
    await product.save();
    
    console.log('\nProduct updated successfully!');
    console.log('\nUpdated product data:');
    console.log(`Name: ${product.name}`);
    console.log(`Price: $${product.price}`);
    console.log(`Category: ${product.category}`);
    console.log(`Description: ${product.description}`);
    console.log(`Image URL: ${product.imageUrl}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    
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
updateProductDetails(); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// New product data - modify these details to customize your product
const newProduct = {
  name: 'Bluetooth Speaker',
  description: 'Portable Bluetooth speaker with waterproof design and 20-hour battery life.',
  imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=2069&auto=format&fit=crop',
  price: 89.99,
  category: 'Audio',
  reviews: []
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://debnatharghadeep:0Hr48knsIqg0VbSI@cluster0.kuoaoaz.mongodb.net/product-reviews?retryWrites=true&w=majority')
  .then(async () => {
    console.log('MongoDB connected for adding product');
    
    try {
      // Create and save the new product
      const product = new Product(newProduct);
      const savedProduct = await product.save();
      
      console.log('New product added successfully:');
      console.log(JSON.stringify(savedProduct, null, 2));
      
      mongoose.connection.close();
    } catch (error) {
      console.error('Error adding product:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 
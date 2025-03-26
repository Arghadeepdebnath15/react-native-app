const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Sample products data
const products = [
  {
    name: 'Smartphone X',
    description: 'The latest smartphone with high-end features and stunning display.',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2042&auto=format&fit=crop',
    price: 899.99,
    category: 'Electronics',
    reviews: []
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones with long battery life.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    price: 199.99,
    category: 'Audio',
    reviews: []
  },
  {
    name: 'Smart Watch',
    description: 'Advanced smart watch with health tracking and smart notifications.',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1928&auto=format&fit=crop',
    price: 249.99,
    category: 'Wearables',
    reviews: []
  },
  {
    name: 'Gaming Laptop',
    description: 'Powerful gaming laptop with high refresh rate display and premium graphics.',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2068&auto=format&fit=crop',
    price: 1299.99,
    category: 'Computers',
    reviews: []
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://debnatharghadeep:0Hr48knsIqg0VbSI@cluster0.kuoaoaz.mongodb.net/product-reviews?retryWrites=true&w=majority')
  .then(async () => {
    console.log('MongoDB connected for seeding');
    
    try {
      // Delete existing products
      await Product.deleteMany({});
      console.log('Previous products deleted');
      
      // Insert new products
      const insertedProducts = await Product.insertMany(products);
      console.log(`${insertedProducts.length} products inserted`);
      
      console.log('Database seeded successfully');
      mongoose.connection.close();
    } catch (error) {
      console.error('Error seeding database:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 
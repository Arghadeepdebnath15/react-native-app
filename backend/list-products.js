const axios = require('axios');

// Base API URL - your Render deployment URL
const API_URL = 'https://newrepo-pk31.onrender.com';

// List all products
async function listProducts() {
  try {
    console.log(`Fetching products from API: ${API_URL}`);
    
    const response = await axios.get(`${API_URL}/products`);
    const products = response.data;
    
    console.log('\n=== All Products ===\n');
    
    products.forEach((product, index) => {
      console.log(`[${index + 1}] ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ${product.imageUrl}`);
      console.log('');
    });
    
    console.log(`Total products: ${products.length}`);
    console.log('\nTo update a product image, copy the ID and use:');
    console.log('node update-product.js PRODUCT_ID NEW_IMAGE_URL');
    
  } catch (error) {
    console.error('Error fetching products:');
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error message:', error.message);
    }
  }
}

// Run the function
listProducts(); 
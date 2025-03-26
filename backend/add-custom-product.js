const axios = require('axios');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 5) {
  console.error('Usage: node add-custom-product.js "Product Name" "Product Description" "Image URL" price category');
  console.error('Example: node add-custom-product.js "Coffee Maker" "Premium coffee maker with timer" "https://example.com/coffee.jpg" 59.99 "Kitchen"');
  process.exit(1);
}

// Parse arguments
const [name, description, imageUrl, priceStr, category] = args;
const price = parseFloat(priceStr);

if (isNaN(price)) {
  console.error('Price must be a number');
  process.exit(1);
}

// Base API URL - update this to your Render deployment URL
const API_URL = 'https://newrepo-pk31.onrender.com';

// New product data from command line arguments
const newProduct = {
  name,
  description,
  imageUrl,
  price,
  category,
  reviews: []
};

// Add the product using the API
async function addProduct() {
  try {
    console.log('Adding product to API:', API_URL);
    console.log('Product data:', JSON.stringify(newProduct, null, 2));
    
    // Make the API request
    const response = await axios.post(`${API_URL}/products`, newProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Product added successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error adding product:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the function
addProduct(); 
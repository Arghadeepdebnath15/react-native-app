const axios = require('axios');

// Base API URL - update this to your Render deployment URL
const API_URL = 'https://newrepo-pk31.onrender.com';

// New product data - modify these details as needed
const newProduct = {
  name: 'Fitness Tracker',
  description: 'Advanced fitness band with heart rate monitoring, sleep tracking, and smartphone notifications.',
  imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=2070&auto=format&fit=crop',
  price: 79.99,
  category: 'Wearables',
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
const axios = require('axios');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node update-product.js productId newImageUrl');
  console.error('Example: node update-product.js 67e3f40ed6e04386796cf853 https://images.unsplash.com/new-image-url');
  process.exit(1);
}

// Parse arguments
const [productId, newImageUrl] = args;

// Base API URL - your Render deployment URL
const API_URL = 'https://newrepo-pk31.onrender.com';

// Update the product image
async function updateProductImage() {
  try {
    // First, get the current product data
    console.log(`Fetching product ${productId} from API: ${API_URL}`);
    const getResponse = await axios.get(`${API_URL}/products/${productId}`);
    const product = getResponse.data;
    
    console.log('Current product data:');
    console.log(`Name: ${product.name}`);
    console.log(`Current image: ${product.imageUrl}`);
    
    // Update the image URL
    const updatedProduct = {
      ...product,
      imageUrl: newImageUrl
    };
    
    console.log(`Updating product image to: ${newImageUrl}`);
    
    // Send update request
    const updateResponse = await axios.post(`${API_URL}/products`, updatedProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Product image updated successfully!');
    console.log(`Product ID: ${updateResponse.data._id}`);
    console.log(`New image URL: ${updateResponse.data.imageUrl}`);
  } catch (error) {
    console.error('Error updating product:');
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
updateProductImage(); 
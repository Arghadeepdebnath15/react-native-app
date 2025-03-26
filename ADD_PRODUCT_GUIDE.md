# Guide to Adding New Products

This guide explains all the methods to add new products to your deployed application.

## Method 1: Using the Custom Product Script

The most flexible way to add products is using the `add-custom-product.js` script:

```bash
cd backend
node add-custom-product.js "Product Name" "Product Description" "Image URL" price category
```

Example:
```bash
node add-custom-product.js "Coffee Maker" "Premium coffee maker with timer" "https://images.unsplash.com/photo-1621156229730-275c521f5764?q=80&w=2070&auto=format&fit=crop" 59.99 "Kitchen"
```

## Method 2: Using Pre-Configured Scripts

### For a Smart Home Camera:
```bash
cd backend
node add-product-api.js
```

### For a Fitness Tracker:
```bash
cd backend
node add-another-product.js
```

## Method 3: Custom Product API Endpoint

For advanced users, you can make a direct API call:

```bash
curl -X POST https://newrepo-pk31.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Product",
    "description": "Your description",
    "imageUrl": "https://example.com/image.jpg",
    "price": 99.99,
    "category": "Your Category",
    "reviews": []
  }'
```

## Finding Good Product Images

For high-quality product images, use Unsplash:

1. Visit [Unsplash](https://unsplash.com/)
2. Search for the type of product (e.g., "headphones", "laptop", "coffee maker")
3. Click on an image you like
4. Click the "Download" button
5. Copy the URL from the browser address bar

## Product Schema

Each product has the following fields:

```javascript
{
  name: String,         // Product name
  description: String,  // Product description
  imageUrl: String,     // URL to product image
  price: Number,        // Product price
  category: String,     // Product category
  reviews: []           // Array of reviews (starts empty)
}
```

## Viewing Products

After adding products, visit your frontend application at:
[https://argha15.netlify.app](https://argha15.netlify.app)

The new products should appear in the product listing. 
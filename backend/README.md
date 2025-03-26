# Product Review App Backend

This is the backend server for the Product Review application that allows users to view and submit reviews for various products.

## Setup

1. Create a MongoDB Atlas account and set up a cluster
2. Update the `.env` file with your MongoDB connection string
3. Install dependencies:
   ```
   npm install
   ```
4. Seed the database with initial product data:
   ```
   npm run seed
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables:
   - `PORT`: 5000 (or let Render assign one)
   - `MONGO_URI`: Your MongoDB Atlas connection string
5. Deploy the service

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product by ID
- `POST /api/products/:id/reviews` - Add a review to a product

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose 
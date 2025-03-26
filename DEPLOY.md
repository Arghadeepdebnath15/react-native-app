# Deployment Instructions

## GitHub Repository
The code has been successfully pushed to:
https://github.com/Arghadeepdebnath15/newrepo.git

## Netlify Deployment (Frontend)

1. Go to [Netlify](https://www.netlify.com/) and sign in
2. Click "Add new site" > "Import an existing project"
3. Select GitHub and authorize Netlify to access your GitHub account
4. Select the repository: `Arghadeepdebnath15/newrepo`
5. Configure the deployment with these settings:
   - Base directory: `product-review-app`
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"
7. Go to "Site settings" > "Environment variables" and add:
   ```
   REACT_APP_API_URL=https://product-reviews-api.onrender.com/api
   ```
8. Trigger a new deployment for the environment variable to take effect

## Render Deployment (Backend)

1. Go to [Render](https://render.com/) and sign in
2. Click "New" > "Web Service"
3. Select GitHub and authorize Render to access your GitHub account
4. Select the repository: `Arghadeepdebnath15/newrepo`
5. Configure the deployment with these settings:
   - Name: `product-reviews-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Under "Advanced" > "Environment Variables", add:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://debnatharghadeep:0Hr48knsIqg0VbSI@cluster0.kuoaoaz.mongodb.net/product-reviews?retryWrites=true&w=majority
   CORS_ORIGIN=https://your-netlify-app-name.netlify.app
   ```
   (Replace the CORS_ORIGIN with your actual Netlify domain once deployed)
7. Click "Create Web Service"

## Connecting Frontend to Backend

After both deployments are complete:
1. Note the URL of your Render backend (e.g., `https://product-reviews-api.onrender.com`)
2. Update the CORS_ORIGIN environment variable in Render to match your Netlify domain
3. Update the REACT_APP_API_URL environment variable in Netlify to point to your Render backend API
4. Trigger a new deployment on both platforms

## Verifying the Deployment

1. Visit your Netlify site URL
2. You should see the product listing loaded from the backend
3. Try adding a review to verify that the API connection is working correctly 
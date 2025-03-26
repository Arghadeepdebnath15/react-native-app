# Product Review Application

A full-stack application for product reviews with a React frontend and Node.js/Express backend.

## Live Demo

- Frontend: [https://product-review-site.netlify.app](https://product-review-site.netlify.app)
- API: [https://product-reviews-api.onrender.com/api/products](https://product-reviews-api.onrender.com/api/products)

## Project Structure

```
product-review-app/     # Frontend React application
├── public/
├── src/
└── ...
backend/                # Backend Express API
├── routes/
├── models/
└── ...
```

## Frontend (React)

### Setup & Installation

```bash
cd product-review-app
npm install
```

### Development

```bash
npm start
```

### Production Build

```bash
npm run build
```

### Environment Variables

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings with API endpoint

## Backend (Node.js/Express)

### Setup & Installation

```bash
cd backend
npm install
```

### Development

```bash
npm run dev
```

### Seed Database

```bash
npm run seed
```

### Production Start

```bash
npm start
```

### Environment Variables

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

## Deployment

### Frontend (Netlify)

The frontend is configured for deployment on Netlify with:
- `netlify.toml` configuration file
- `_redirects` file for SPA routing

### Backend (Render)

The backend is configured for deployment on Render with:
- `render.yaml` configuration file
- `Procfile` for process management

## Features

- View product listings
- View detailed product information
- Submit and view product reviews
- Responsive design for all devices

## Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS Modules

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS 
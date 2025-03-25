import React from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Rating, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Product } from '../types';

// Temporary mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone X',
    description: 'Latest smartphone with amazing features',
    price: 999.99,
    image: 'https://via.placeholder.com/300',
    category: 'Electronics',
    rating: 4.5,
    reviews: [],
  },
  {
    id: '2',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1499.99,
    image: 'https://via.placeholder.com/300',
    category: 'Electronics',
    rating: 4.8,
    reviews: [],
  },
];

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Featured Products
      </Typography>
      <Grid container spacing={4}>
        {mockProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <Rating value={product.rating} precision={0.1} readOnly />
                <Button
                  component={RouterLink}
                  to={`/product/${product.id}`}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 
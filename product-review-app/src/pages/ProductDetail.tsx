import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  Rating,
  Button,
  Divider,
  Box,
} from '@mui/material';
import { Product } from '../types';
import { api } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        const data = await api.getProduct(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" color="error">
          {error || 'Product not found'}
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.image}
              alt={product.name}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price}
          </Typography>
          <Rating value={product.rating} precision={0.1} readOnly />
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {product.description}
          </Typography>
          <Button
            component={RouterLink}
            to={`/review/${product._id}`}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Write a Review
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review) => (
            <Box key={review.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" component="div">
                {review.userName}
              </Typography>
              <Rating value={review.rating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary" paragraph>
                {review.comment}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(review.date).toLocaleDateString()}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No reviews yet</Typography>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetail; 
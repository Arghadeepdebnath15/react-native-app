import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Rating,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { Product } from '../types';
import { api } from '../services/api';
import { useProductContext } from '../context/ProductContext';

const AddReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addOppoReview } = useProductContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          // Check if it's the OPPO product
          if (id === 'oppo-product') {
            const oppoProduct: Product = {
              _id: 'oppo-product',
              name: 'OPPO Find X6 Pro',
              description: 'The OPPO Find X6 Pro is a flagship smartphone featuring a powerful camera system, stunning display, and premium build quality. With its innovative design and cutting-edge technology, it offers an exceptional mobile experience.',
              price: 999.99,
              image: 'https://bbs.oppo.com/upload/image/front/thread/20221109/732870724/1195894509256048649/1195894509256048649.jpg?x-ocs-process=image/format,webp/resize,w_1584',
              category: 'Smartphones',
              rating: 4.8,
              reviews: [],
            };
            setProduct(oppoProduct);
          } else {
            const data = await api.getProduct(id);
            setProduct(data);
          }
        }
      } catch (err) {
        setError('Failed to fetch product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rating || !comment || !userName) return;

    try {
      // For the OPPO product, use the context to add the review
      if (id === 'oppo-product') {
        addOppoReview({
          rating,
          comment,
          userName,
        });
      } else {
        await api.addReview(id, {
          rating,
          comment,
          userName,
        });
      }
      navigate(`/product/${id}`);
    } catch (err) {
      setError('Failed to submit review');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography>Loading...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" color="error">
            {error || 'Product not found'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Write a Review for {product.name}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Typography component="legend">Rating</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
          />
          <TextField
            fullWidth
            label="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Your Review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Submit Review
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddReview; 
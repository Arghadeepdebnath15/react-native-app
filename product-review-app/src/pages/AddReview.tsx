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
          } else if (id === 'samsung-product') {
            // Create the Samsung product
            const samsungProduct: Product = {
              _id: 'samsung-product',
              name: 'Samsung Galaxy S24 Ultra',
              description: 'The Samsung Galaxy S24 Ultra is a premium smartphone featuring a titanium frame, advanced AI capabilities, and a stunning display. With its innovative design and cutting-edge technology, it delivers an exceptional mobile experience.',
              price: 1199.99,
              image: 'https://images.samsung.com/in/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-kv.jpg?imbypass=true',
              category: 'Smartphones',
              rating: 4.8,
              reviews: [],
            };
            setProduct(samsungProduct);
          } else if (id === 'redmi-product') {
            // Create the Redmi product
            const redmiProduct: Product = {
              _id: 'redmi-product',
              name: 'Redmi Note 13 Pro',
              description: 'The Redmi Note 13 Pro is a powerful smartphone featuring a high-performance processor, stunning display, and versatile camera system. With its sleek design and advanced features, it offers an exceptional mobile experience at an affordable price.',
              price: 299.99,
              image: 'https://i02.appmifile.com/266_operatorx_operatorx_uploadTiptapImage/26/10/2023/ff155b10a1fdb8177d05eb5fc282bde5.png',
              category: 'Smartphones',
              rating: 4.8,
              reviews: [],
            };
            setProduct(redmiProduct);
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
      } else if (id === 'samsung-product') {
        // For Samsung product, we'll use localStorage like OPPO
        const newReview = {
          id: Date.now().toString(),
          productId: 'samsung-product',
          rating,
          comment,
          userName,
          date: new Date().toISOString(),
        };
        
        // Get existing reviews from localStorage
        const existingReviews = localStorage.getItem('samsung-product-reviews');
        const reviews = existingReviews ? JSON.parse(existingReviews) : [];
        
        // Add new review
        reviews.push(newReview);
        
        // Save back to localStorage
        localStorage.setItem('samsung-product-reviews', JSON.stringify(reviews));
      } else if (id === 'redmi-product') {
        // For Redmi product, we'll use localStorage like Samsung
        const newReview = {
          id: Date.now().toString(),
          productId: 'redmi-product',
          rating,
          comment,
          userName,
          date: new Date().toISOString(),
        };
        
        // Get existing reviews from localStorage
        const existingReviews = localStorage.getItem('redmi-product-reviews');
        const reviews = existingReviews ? JSON.parse(existingReviews) : [];
        
        // Add new review
        reviews.push(newReview);
        
        // Save back to localStorage
        localStorage.setItem('redmi-product-reviews', JSON.stringify(reviews));
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
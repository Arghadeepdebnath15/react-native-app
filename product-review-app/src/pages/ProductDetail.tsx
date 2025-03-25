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
import { useProductContext } from '../context/ProductContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { oppoReviews, averageRating, } = useProductContext();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        // Check if it's the OPPO product
        if (id === 'oppo-product') {
          // Create the OPPO product with the latest reviews from context
          const oppoProduct: Product = {
            _id: 'oppo-product',
            name: 'OPPO Find X6 Pro',
            description: 'The OPPO Find X6 Pro is a flagship smartphone featuring a powerful camera system, stunning display, and premium build quality. With its innovative design and cutting-edge technology, it offers an exceptional mobile experience.',
            price: 999.99,
            image: 'https://static1.anpoimages.com/wordpress/wp-content/uploads/2023/03/oppo-find-x6-pro-3.jpg?q=50&fit=crop&w=480&dpr=1.5',
            category: 'Smartphones',
            rating: averageRating || 0,
            reviews: oppoReviews || [],
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

          // Load reviews from localStorage
          const savedReviews = localStorage.getItem('samsung-product-reviews');
          if (savedReviews) {
            try {
              samsungProduct.reviews = JSON.parse(savedReviews);
              // Calculate average rating from reviews
              if (samsungProduct.reviews.length > 0) {
                const sum = samsungProduct.reviews.reduce((acc, review) => acc + review.rating, 0);
                samsungProduct.rating = sum / samsungProduct.reviews.length;
              }
            } catch (error) {
              console.error('Error parsing saved Samsung reviews:', error);
            }
          }

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

          // Load reviews from localStorage
          const savedReviews = localStorage.getItem('redmi-product-reviews');
          if (savedReviews) {
            try {
              redmiProduct.reviews = JSON.parse(savedReviews);
              // Calculate average rating from reviews
              if (redmiProduct.reviews.length > 0) {
                const sum = redmiProduct.reviews.reduce((acc, review) => acc + review.rating, 0);
                redmiProduct.rating = sum / redmiProduct.reviews.length;
              }
            } catch (error) {
              console.error('Error parsing saved Redmi reviews:', error);
            }
          }

          setProduct(redmiProduct);
        } else {
          const data = await api.getProduct(id);
          setProduct(data);
        }
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    

    fetchProduct();
  }, [id, oppoReviews, averageRating]);

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
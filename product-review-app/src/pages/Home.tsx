import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Rating, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../services/api';
import { useProductContext } from '../context/ProductContext';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { oppoReviews, averageRating } = useProductContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        // Add the OPPO product to the products list
        const oppoProduct: Product = {
          _id: 'oppo-product',
          name: 'OPPO Find X6 Pro',
          description: 'The OPPO Find X6 Pro is a flagship smartphone featuring a powerful camera system, stunning display, and premium build quality. With its innovative design and cutting-edge technology, it offers an exceptional mobile experience.',
          price: 999.99,
          image: 'https://bbs.oppo.com/upload/image/front/thread/20221109/732870724/1195894509256048649/1195894509256048649.jpg?x-ocs-process=image/format,webp/resize,w_1584',
          category: 'Smartphones',
          rating: averageRating,
          reviews: oppoReviews,
        };
        setProducts([...data, oppoProduct]);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [oppoReviews, averageRating]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container  style={{marginLeft:'0'}}  maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography  variant="h4" component="h1" gutterBottom>
        Featured Products:
      </Typography>
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4}>
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
                  to={`/product/${product._id}`}
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
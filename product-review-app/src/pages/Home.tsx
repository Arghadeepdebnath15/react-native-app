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
        // Update the test product description to be 3 lines
        if (data && data.length > 0) {
          data[0].description = 'This is a test product featuring high-quality components and innovative design. With its advanced features and premium build quality, it delivers an exceptional user experience. Perfect for those who want to explore cutting-edge technology.';
        }
        
        // Add the OPPO product to the products list
        const oppoProduct: Product = {
          _id: 'oppo-product',
          name: 'OPPO Find X6 Pro',
          description: 'The OPPO Find X6 Pro is a flagship smartphone featuring a powerful camera system, stunning display, and premium build quality. With its innovative design and cutting-edge technology, it offers an exceptional mobile experience.',
          price: 999.99,
          image: 'https://static1.anpoimages.com/wordpress/wp-content/uploads/2023/03/oppo-find-x6-pro-3.jpg?q=50&fit=crop&w=480&dpr=1.5',
          category: 'Smartphones',
          rating: averageRating,
          reviews: oppoReviews,
        };

        // Add the Samsung product
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


        setProducts([...data, oppoProduct, samsungProduct,redmiProduct]);
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
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Featured Products:
      </Typography>
      <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={3} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{ objectFit: 'contain', p: 2 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  paragraph 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
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
                  fullWidth
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
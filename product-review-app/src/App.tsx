import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { ProductProvider } from './context/ProductContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AddReview from './pages/AddReview';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProductProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/review/:id" element={<AddReview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProductProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

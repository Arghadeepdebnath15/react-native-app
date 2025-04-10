import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './styles/fixes.css';
import HomePage from './pages/HomePage';
import ProductDetailsEnhanced from './pages/ProductDetailsEnhanced';
import AddProduct from './components/AddProduct';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';
import Blog from './components/Blog';
import MessagesListPage from './pages/MessagesListPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';

const AppContent = () => {
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname === '/messages' || location.pathname.startsWith('/chat/');

  console.log('AppContent - showAddProductForm:', showAddProductForm);

  return (
    <div className="app">
      <Navbar onAddProductClick={() => {
        console.log('Setting showAddProductForm to true');
        setShowAddProductForm(true);
      }} />
      <main className={`main-content ${isMessagesPage ? 'messages-page' : ''}`}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<HomePage showForm={showAddProductForm} setShowForm={setShowAddProductForm} />} />
          <Route path="/product/:id" element={<ProductDetailsEnhanced />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/blog" element={<Blog />} />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isMessagesPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ProductProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default App;

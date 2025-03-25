import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false); // Default to registration
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Check if email exists when user types
  const checkEmailExists = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const existingUser = registeredUsers.find((user: any) => user.email === email);
    
    if (existingUser && !isLogin) {
      setEmailError('This email is already registered. Please use a different email or login.');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!isLogin) {
      checkEmailExists(newEmail);
    }
  };

  const validateForm = () => {
    let isValid = true;
    setError('');
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    }

    if (!password) {
      setError('Password is required');
      isValid = false;
    }

    if (!isLogin) {
      if (!username) {
        setError('Username is required');
        isValid = false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        isValid = false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        isValid = false;
      }
      if (emailError) {
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            {isLogin ? 'Sign In' : 'Register'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!isLogin && !username}
                helperText={!isLogin && !username ? 'Username is required' : ''}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!password || (!isLogin && password.length < 6)}
              helperText={
                !password 
                  ? 'Password is required' 
                  : (!isLogin && password.length < 6)
                  ? 'Password must be at least 6 characters long'
                  : ''
              }
            />
            {!isLogin && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!isLogin && password !== confirmPassword}
                helperText={
                  !isLogin && password !== confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isLogin ? 'Sign In' : 'Register'}
            </Button>
            
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmailError('');
              }}
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Sign In'}
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth; 
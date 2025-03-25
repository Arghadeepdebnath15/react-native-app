import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ px: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 0,
            marginRight: 'auto',
            paddingLeft: 0,
          }}
        >
          Product Review
        </Typography>
        {isAuthenticated ? (
          <>
            <Typography sx={{ mr: 2 }}>Welcome, {user?.username}</Typography>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              sx={{ ml: 2 }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            color="inherit"
            component={RouterLink}
            to="/auth"
            sx={{ ml: 2 }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
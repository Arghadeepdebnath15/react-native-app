import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
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
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ ml: 2 }}
        >
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
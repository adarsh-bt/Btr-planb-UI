// src/components/LoadingScreen.js
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Loading data...' }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      minHeight="250px"
      my={4}
    >
      <CircularProgress size={60} thickness={4.5} />
      <Typography
        variant="h6"
        sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;

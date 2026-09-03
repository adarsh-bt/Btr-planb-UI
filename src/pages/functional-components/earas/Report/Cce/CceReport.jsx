import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';

import { keyframes } from '@mui/system';
import { Link } from 'react-router-dom';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

function CceReport() {
  const theme = useTheme();
  // const role = authservice.getrole()?.trim(); // Unused in this snippet but kept from your code

  return (
    <Grid container spacing={3}>
      {/* <Breadcrumb/> */}
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Crop Cutting Experiment Reports
        </Typography>

        <MainCard title="">
          <Grid
            container
            spacing={4}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '400px' }} // Give it height to look good
          >

            <Grid item>
              {/* Optional: Add an illustration or Icon here */}
              <Box
                component="img"
                src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" // Example placeholder icon
                alt="No Data"
                sx={{ width: 120, height: 120, marginBottom: 2, opacity: 0.8 }}
              />
            </Grid>

            <Grid item>
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: 'bold',
                  // The Reflection Effect Styles:
                  background: `linear-gradient(
                    to right, 
                    ${theme.palette.text.secondary} 20%, 
                    ${theme.palette.primary.main} 40%, 
                    ${theme.palette.primary.main} 60%, 
                    ${theme.palette.text.secondary} 80%
                  )`,
                  backgroundSize: '200% auto',
                  color: '#000',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${shimmer} 3s linear infinite`,
                }}
              >
                Please Complete the Crop Data Collection
              </Typography>

              <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 1 }}>
                No reports generated yet. Complete the collection process to view data here.
              </Typography>
            </Grid>

          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default CceReport;
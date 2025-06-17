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

import { Link } from 'react-router-dom';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

import { useContext } from 'react';
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
// import { flattenPermissions } from 'contexts/auth-reducer/permissionHelpers';

import plot_listing from 'assets/images/logo/plot_listing.png';
import pre_harvest from 'assets/images/logo/pre_harvest.png';
import data_collection from 'assets/images/logo/data_collection.png';
import forecast_report from 'assets/images/logo/forecast_report.png';

function CceMenus() {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          EARAS
        </Typography>
        <MainCard title="">
          <Grid container spacing={4} alignItems="stretch">
            {/* {canViewZoneDetails && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/CCE_plotlist"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(79, 208, 170, 0.45), rgb(98, 218, 182))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  height: '100%', // Ensure card takes full height of the grid item
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5rem',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image={plot_listing}
                  alt="plot listing"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Plot Listing
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>
            {/* )} */}

            {/* {canViewBTR && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/btr"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(180, 146, 254, 0.45), rgb(155, 120, 250))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  height: '100%', // Ensure card takes full height of the grid item
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5rem',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image={pre_harvest}
                  alt="Pre Harvest"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Pre Harvest
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/keyplots"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.45), rgb(77, 182, 172))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  height: '100%', // Ensure card takes full height of the grid item
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5rem',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image={data_collection}
                  alt="data collection logo"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Data Collection
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/clusters"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(150, 0, 0, 0.63), rgb(182, 77, 77))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  height: '100%', // Ensure card takes full height of the grid item
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5rem',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image={forecast_report}
                  alt="forecast report logo"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Forecast Report
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            {/* {canViewCCE && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/CCEmenus"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(160, 190, 120, 0.45), rgb(140, 180, 110))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  height: '100%', // Ensure card takes full height of the grid item
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Preharvest Report
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>
            {/* )} */}
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default CceMenus;

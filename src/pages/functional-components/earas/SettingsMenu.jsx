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

import zonesettings from 'assets/images/logo/zonesettings.png';
import ccecropselection from 'assets/images/logo/ccecropselection.png';
import zonedetails from 'assets/images/logo/zonedetails.png';

const SettingsMenu = () => {
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          EARAS Management
        </Typography>
        <MainCard title="">
          <Grid container spacing={4} alignItems="stretch">
            {/* {canViewZoneDetails && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/earas_management/zonesettings"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(71, 92, 86, 0.45), rgb(72, 218, 39))', // Gradient color
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
                  image={zonesettings}
                  alt="zonesettings"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Plot
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{
                        color: '#f3f3f3',
                        fontStyle: 'italic',
                        fontWeight: 'lighter',
                        marginTop: '0.5rem'
                      }}
                    >
                     Settings
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
            {/* )} */}

            {/* {canViewBTR && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/earas_management/CCE_crop_selection"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(146, 254, 252, 0.45), rgb(155, 120, 250))', // Gradient color
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
                  image={ccecropselection}
                  alt="ccecropselection"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      CCE Crops Management
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>

  <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/earas_management/crops_management"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(146, 254, 252, 0.45), rgb(155, 120, 250))', // Gradient color
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
                  image={ccecropselection}
                  alt="ccecropselection"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Crops Management
                    </Typography>
                    {/* Subtitle removed from here */}
                  </CardContent>
                </Box>
              </Card>
            </Grid>
            {/* )} */}

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/zone_season_shedule_list"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(222, 213, 191, 0.45), rgb(100, 78, 143))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(247, 40, 40, 0.2)', // Box shadow
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #8b5951, #ff6f61)', // Darker gradient on hover
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
                  image={zonedetails} // <-- Use the imported image here
                  alt="zone details"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Schedule List
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{
                        color: '#f3f3f3',
                        fontStyle: 'italic',
                        fontWeight: 'lighter',
                        marginTop: '0.5rem'
                      }}
                    >
                     Details
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
            
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default SettingsMenu
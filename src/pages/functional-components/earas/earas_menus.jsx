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
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
// import { flattenPermissions } from 'contexts/auth-reducer/permissionHelpers';

//permissions
import { useUserAccess } from 'contexts/auth-reducer/universal/UserAccessContext';

import cluster from 'assets/images/logo/cluster.png';
import keyplot from 'assets/images/logo/keyplot.png';
import zonedetails from 'assets/images/logo/zonedetails.png';
import eBTR from 'assets/images/logo/eBTR.png';

function Earas_menus() {
  //permissions
  const { userAccess, loading } = useUserAccess();
  const theme = useTheme();
  // const { permissions, loading, error } = useContext(PermissionsContext);

  // // Flatten permissions for easy checking
  // const userPermissions = flattenPermissions(permissions);

  // // Check if user has "View BTR"

  // const canViewZoneDetails = userPermissions.includes('View Zone Details');
  // const canViewBTR = userPermissions.includes('View BTR');
  // const canViewKeyPlot = userPermissions.includes('Download Key Plot List');
  // const canViewCluster = userPermissions.includes('Cluster View');
  // const canViewReports = userPermissions.includes('View Progress Report');
  // const canViewCCE = userPermissions.includes('Download CCE Report');
  // const canViewFormI = userPermissions.includes('Download Form I');

  return (
    
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Earas
        </Typography>
        <MainCard title="">
          <Grid container spacing={4}>
            {/* {canViewZoneDetails && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Zone_Details"
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                      Zone Details
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
                      Investigator
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image={eBTR} // <-- Use the imported image here
                  alt="eBTR Logo"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      e-BTR
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
                      View
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Key_Plots"
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Key Plots
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
                      Formation
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Key_plot_entry"
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Key Plot Entry
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
                      Manual Entry
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Non_BTR_Key_plot_entry"
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Non BTR Keyplot Entry
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
                      Manual Entry
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Clusters"
                // /schemes/earas/cluster_manual_entry
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Cluster list
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
                      Manual Entry
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Clusters"
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Cluster
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
                      Formation
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/zonesettings"
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
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      EARAS Admin
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
                      Formation
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            {/* {canViewCCE && ( */}
            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/CCE_Menus"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', // Muted gray gradient
                  // opacity: 0.6, // Makes it look inactive
                  // filter: 'grayscale(100%)', // Grays out the card
                  // boxShadow: 'none', // No shadow
                  cursor: 'not-allowed', // Indicate non-clickable
                  pointerEvents: 'none', // Disable interaction
                  // minHeight: '8rem', // Match others for consistency

                  // background: 'linear-gradient(135deg, rgba(160, 190, 120, 0.45), rgb(140, 180, 110))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                      GCES
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
                      survey
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}
            {/* )} */}

            {/* {canViewFormI && ( */}
            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',

                  background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', // Muted gray gradient
                  opacity: 0.6, // Makes it look inactive
                  filter: 'grayscale(100%)', // Grays out the card
                  boxShadow: 'none', // No shadow
                  cursor: 'not-allowed', // Indicate non-clickable
                  pointerEvents: 'none', // Disable interaction
                  minHeight: '8rem' // Match others for consistency

                  // background: 'linear-gradient(135deg, rgba(255, 150, 89, 0.45), rgb(255, 174, 129))', // Gradient color
                  // transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  // '&:hover': {
                  //   transform: 'scale(1.05)', // Hover scale effect
                  //   // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
                  //   boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  // }
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
                  image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Form 1
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
                      Entry
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}
            {/* )} */}

            {/* {canViewReports && ( */}
            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',

                  background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', // Muted gray gradient
                  opacity: 0.6, // Makes it look inactive
                  filter: 'grayscale(100%)', // Grays out the card
                  boxShadow: 'none', // No shadow
                  cursor: 'not-allowed', // Indicate non-clickable
                  pointerEvents: 'none', // Disable interaction
                  minHeight: '8rem' // Match others for consistency

                  // background: 'linear-gradient(135deg, rgba(115, 140, 255, 0.45), rgb(105, 120, 250))', // Gradient color
                  // transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  // '&:hover': {
                  //   transform: 'scale(1.05)', // Hover scale effect
                  //   // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
                  //   boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  // }
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
                  image="https://cdn-icons-png.flaticon.com/512/977/977464.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Reports
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
                      View
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}
            {/* )} */}


            {/* {canViewZoneSettings && ( */}
            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/settings_menu"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  cursor: 'not-allowed',
                   pointerEvents: 'none',
                  borderRadius: '1rem',
                   background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', 
                  // background: 'linear-gradient(135deg, rgba(79, 101, 94, 0.45), rgba(210, 197, 83, 1))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
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
                      EARAS Administration
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
                      EARAS Admin
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}
            {/* )} */}

            {/* <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(255, 94, 98, 0.57), rgb(241, 39, 85))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn-icons-png.flaticon.com/512/4615/4615903.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>

    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Cardr
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(255, 223, 138, 0.57), rgb(255, 193, 7))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn-icons-png.flaticon.com/512/977/977464.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>


    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(123, 239, 178, 0.57), rgb(46, 204, 113))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>    */}
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default Earas_menus;

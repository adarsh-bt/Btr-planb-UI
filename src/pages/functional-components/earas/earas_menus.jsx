import React, { useState, useEffect } from 'react'; 
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


import cluster from 'assets/images/logo/cluster.png';
import keyplot from 'assets/images/logo/keyplot.png';
import zonedetails from 'assets/images/logo/zonedetails.png';
import eBTR from 'assets/images/logo/eBTR.png';

 //for permissions line
// import { useUserAccess, PermissionGate } from 'contexts/auth-reducer/universal/UserAccessContext';
import mainapi from 'api/mainapi';


function Earas_menus() {

    //for permissions line
  // const { userAccessData, loading, hasPermission, hasPermissionByName } = useUserAccess();

  // Add state management
  const [btrData, setBtrData] = useState(null);
  const [btrLoading, setBtrLoading] = useState(true); // Rename to avoid conflict with permissions loading

  const zoneId = localStorage.getItem('activeZone');
  console.log(zoneId);

  useEffect(() => {
    const fetchBtrType = async () => {
      if (!zoneId) {
        setBtrLoading(false);
        return;
      }
      
      try {
        const BASE_URL = mainapi.BASE_URL;
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/btr-service/localbodies/${zoneId}/btr-type`,{
        headers: {
          Authorization: `Bearer ${token}`
        }}
        );
        // const response = await fetch(`http://localhost:8082/btr-service/localbodies/3/btr-type`);

        if (!response.ok) {
          throw new Error('Failed to fetch BTR type');
        }
        const data = await response.json();
        console.log("jjjj ",data)
        setBtrData(data);
      } catch (error) {
        console.error('Error fetching BTR type:', error);
      } finally {
        setBtrLoading(false);
      }
    };

    fetchBtrType();
  }, [zoneId]);

  const renderKeyPlotGrids = () => {
console.log("okk",btrData)
    if (!btrData) return null;

    const { btrTypeId } = btrData;

    const gridConfigs = [
      {
        id: 1,
        title: "Key Plot Entry",
        subtitle: "BTR",
        route: "/schemes/earas/Key_plot_entry",
        background: "linear-gradient(135deg, rgba(0, 150, 136, 0.45), rgb(77, 182, 172))"
      },
      {
        id: 2,
        title: "Key Plot Entry",
        subtitle: "Non-BTR",
        route: "/schemes/earas/Non_BTR_Key_plot_entry",
        background: "linear-gradient(135deg, rgba(150, 0, 0, 0.63), rgb(182, 77, 77))"
      },
      {
        id: 3,
        title: "Key Plot Entry",
        subtitle: "BTR with Minor Circuit",
        route: "/schemes/earas/BTR_Minor_Circuit_Key_plot_entry",
        background: "linear-gradient(135deg, rgba(255, 152, 0, 0.45), rgb(255, 183, 77))"
      }
    ];

    // Find the matching grid configuration
    const activeGrid = gridConfigs.find(config => config.id === btrTypeId);

    if (!activeGrid) return null;

    return (
      <Grid item xs={12} sm={4} md={3} lg={3}>
        <Card
          component={Link}
          to={activeGrid.route}
          sx={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            borderRadius: '1rem',
            background: activeGrid.background,
            transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
            }
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: '5rem',
              height: '5rem',
              borderRadius: '.5rem',
              marginRight: '1rem'
            }}
            image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
            alt="Key Plot Entry Icon"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
              <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                {activeGrid.title}
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
                {activeGrid.subtitle}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      </Grid>
    );
  };

  // console.log('Dashboard Debug:');
  // console.log('Loading:', loading);
  // console.log('UserAccessData:', userAccessData);
  // console.log('HasPermission function:', hasPermission);
  // console.log('Permission 11 result:', hasPermission && hasPermission(11));

  // if (loading) {
  //   return <div>Loading permissions...</div>;
  // }

  // if (loading || btrLoading) {
  //   return <div>Loading...</div>;
  // }
  
  return (
    
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Earas
        </Typography>
        {/* Check by permission ID
      {hasPermission(11) && (
        <button>Cluster Formation</button>
      )} */}
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
                      Zone
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
            {/* )} */}

            {/* {LocalBody to Village Mapping && ( */}
            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="schemes/earas/Mapping"
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
                      Local Body - Village
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
                      Mapping
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}
            {/* )} */}

            {/* {canViewBTR && ( */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                // to="/schemes/earas/btr_list"
                to="/schemes/earas/btr/btr_classify_wrapper"
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

            {/* {canViewBTR && ( */}
            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
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
            </Grid> */}

            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
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
            </Grid> */}

            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
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
                      BTR
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
                      Key plot Entry
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
                      Non-BTR
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}

            {/* Dynamic Key Plot Entry Grid */}
            {renderKeyPlotGrids()}

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Key_plot_Listing"
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
                      Key Plot
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
                      Lists
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
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
                      Non BTR
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
                      Key plot Entry
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}

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
                // to="/schemes/earas/form1"
                // /schemes/earas/cluster_manual_entry
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(150, 80, 0, 0.45), rgba(182, 137, 77, 1))', // Gradient color
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
                      View
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
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
            </Grid> */}

            {/* <Grid item xs={12} sm={4} md={3} lg={3}>
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
            </Grid> */}

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

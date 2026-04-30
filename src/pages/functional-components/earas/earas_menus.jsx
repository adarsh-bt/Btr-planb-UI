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

// Import MUI Charts components
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useTheme as useMuiTheme } from '@mui/material/styles';

import cluster from 'assets/images/logo/cluster.png';
import keyplot from 'assets/images/logo/keyplot.png';
import zonedetails from 'assets/images/logo/zonedetails.png';
import ZoneSettings from 'assets/images/logo/ZoneSettings.png';
import eBTR from 'assets/images/logo/eBTR.png';

import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';

function Earas_menus() {
  const theme = useMuiTheme();
  const [btrData, setBtrData] = useState(null);
  const [btrLoading, setBtrLoading] = useState(true);

  // Dummy data for the chart - remove the API call and use this directly
  const [chartData, setChartData] = useState({
    cluster: { complete: 30, ongoing: 20, notStarted: 15, underReview: 5 },
    form1: { complete: 38, ongoing: 42, notStarted: 12, underReview: 8 },
    cce: { complete: 20, ongoing: 30, notStarted: 20, underReview: 10 }
  });

  const zoneId = localStorage.getItem('activeZone');
  const role = authservice.getrole();

  // Prepare data for StackedBarChart
  const dataset = [
    {
      category: 'Cluster Status',
      Complete: chartData.cluster.complete,
      Ongoing: chartData.cluster.ongoing,
      'Not Started': chartData.cluster.notStarted,
      'Under Review': chartData.cluster.underReview,
    },
    {
      category: 'Form 1 Status',
      Complete: chartData.form1.complete,
      Ongoing: chartData.form1.ongoing,
      'Not Started': chartData.form1.notStarted,
      'Under Review': chartData.form1.underReview,
    },
    {
      category: 'CCE Status',
      Complete: chartData.cce.complete,
      Ongoing: chartData.cce.ongoing,
      'Not Started': chartData.cce.notStarted,
      'Under Review': chartData.cce.underReview,
    },
  ];

  const valueFormatter = (value) => `${value} Projects`;

  const chartSetting = {
    xAxis: [
      {
        scaleType: 'band',
        dataKey: 'category',
        tickLabelStyle: {
          fontSize: 13,
          fontWeight: 600,
          fill: '#2c3e50',
          angle: 0,
        },
        label: 'Categories',
        labelStyle: {
          fontSize: 14,
          fontWeight: 600,
          fill: '#34495e',
        },
      },
    ],
    yAxis: [
      {
        label: 'Number of Projects',
        tickLabelStyle: { 
          fontSize: 12,
          fill: '#7f8c8d',
        },
        labelStyle: {
          fontSize: 13,
          fontWeight: 600,
          fill: '#34495e',
        },
      },
    ],
    series: [
      { 
        dataKey: 'Complete', 
        label: 'Complete', 
        valueFormatter, 
        stack: 'total', 
        color: '#4caf50',
        highlightScope: { highlighted: 'series', faded: 'global' },
        faded: { color: 'gray', additional: 0.6 },
      },
      { 
        dataKey: 'Ongoing', 
        label: 'Ongoing', 
        valueFormatter, 
        stack: 'total', 
        color: '#ff9800',
        highlightScope: { highlighted: 'series', faded: 'global' },
        faded: { color: 'gray', additional: 0.6 },
      },
      { 
        dataKey: 'Not Started', 
        label: 'Not Started', 
        valueFormatter, 
        stack: 'total', 
        color: '#f44336',
        highlightScope: { highlighted: 'series', faded: 'global' },
        faded: { color: 'gray', additional: 0.6 },
      },
      { 
        dataKey: 'Under Review', 
        label: 'Under Review', 
        valueFormatter, 
        stack: 'total', 
        color: '#2196f3',
        highlightScope: { highlighted: 'series', faded: 'global' },
        faded: { color: 'gray', additional: 0.6 },
      },
    ],
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'bottom', horizontal: 'middle' },
        padding: 20,
        labelStyle: { 
          fontSize: 12,
          fontWeight: 500,
          fill: '#2c3e50',
        },
        itemMarkWidth: 20,
        itemMarkHeight: 12,
        markGap: 8,
      },
    },
    height: 450,
    margin: { left: 70, right: 40, top: 40, bottom: 70 },
    borderRadius: 12,
    barLabel: {
      style: {
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#ffffff',
        textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
      },
    },
    skipAnimation: false,
    layout: 'vertical',
    grid: {
      horizontal: true,
      vertical: false,
    },
    tooltip: {
      trigger: 'item',
      axisTooltip: {
        content: ({ series, dataIndex }) => {
          const value = series.data[dataIndex];
          return `${series.label}: ${value} projects`;
        },
      },
    },
  };

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
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch BTR type');
        }
        const data = await response.json();
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
  
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Earas
        </Typography>

        {/* Stacked Bar Chart Section */}
        <MainCard title="Project Status Overview" sx={{ marginBottom: 3 }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <BarChart
              dataset={dataset}
              {...chartSetting}
              sx={{
                [`.${axisClasses.left} .${axisClasses.label}`]: {
                  transform: 'translate(-10px, 0)',
                },
              }}
            />
          </Box>
        </MainCard>
        
        <MainCard title="">
          <Grid container spacing={4}>
            {/* Zone Details Card */}
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
                  background: 'linear-gradient(135deg, rgba(79, 208, 170, 0.45), rgb(98, 218, 182))',
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
                  image={zonedetails}
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

            {(role === 'IT Admin' || role === 'EARAS Admin') && (
              <Grid item xs={12} sm={4} md={3} lg={3}>
                <Card
                  component={Link}
                  to="/schemes/earas/Mapping_Management"
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgba(79, 81, 208, 0.45), rgb(106, 98, 218))',
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
                    image={ZoneSettings}
                    alt="zone details"
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                      <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                        Mapping
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
                        Management
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            )}

            {role === 'EARAS Admin' && (
              <Grid item xs={12} sm={4} md={3} lg={3}>
                <Card
                  component={Link}
                  to="/schemes/earas/earas_management"
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgba(208, 79, 79, 0.45), rgba(218, 98, 98, 1))',
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
                    image={ZoneSettings}
                    alt="zone details"
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                      <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                        Earas
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
                        Management
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            )}

            {role === 'Field Data Collector' && (
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
                    background: 'linear-gradient(135deg, rgba(180, 146, 254, 0.45), rgb(155, 120, 250))',
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
                    image={eBTR}
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
            )}

            {/* Dynamic Key Plot Entry Grid */}
            {renderKeyPlotGrids()}
            
            {role === 'Field Data Collector' && (
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
                    background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.45), rgb(77, 182, 172))',
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
            )}
            
            {role === 'Field Data Collector' && (
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
                    background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.45), rgb(77, 182, 172))',
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
            )}
            
            {role === 'Field Data Collector' && (
              <Grid item xs={12} sm={4} md={3} lg={3}>
                <Card
                  component={Link}
                  to="/schemes/earas/Clusters_Form"
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgba(150, 80, 0, 0.45), rgba(182, 137, 77, 1))',
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
            )}

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/earas_management"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(150, 0, 0, 0.63), rgb(182, 77, 77))',
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
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default Earas_menus;
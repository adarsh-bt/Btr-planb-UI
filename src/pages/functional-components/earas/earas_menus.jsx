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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme as useMuiTheme } from '@mui/material/styles';

import cluster from 'assets/images/logo/cluster.png';
import keyplot from 'assets/images/logo/keyplot.png';
import zonedetails from 'assets/images/logo/zonedetails.png';
import ZoneSettings from 'assets/images/logo/ZoneSettings.png';
import eBTR from 'assets/images/logo/eBTR.png';

import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

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

  const chartDataConfig = {
    labels: ['Cluster Status', 'Form 1 Status', 'CCE Status'],
    datasets: [
      {
        label: 'Complete',
        data: [
          chartData.cluster.complete,
          chartData.form1.complete,
          chartData.cce.complete
        ],
        backgroundColor: '#4caf50',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Ongoing',
        data: [
          chartData.cluster.ongoing,
          chartData.form1.ongoing,
          chartData.cce.ongoing
        ],
        backgroundColor: '#ff9800',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Not Started',
        data: [
          chartData.cluster.notStarted,
          chartData.form1.notStarted,
          chartData.cce.notStarted
        ],
        backgroundColor: '#9e9e9e',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Under Review',
        data: [
          chartData.cluster.underReview,
          chartData.form1.underReview,
          chartData.cce.underReview
        ],
        backgroundColor: '#2196f3',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    
    interaction: {
      mode: 'index',
      intersect: false,
    },

    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#2c3e50',
          font: {
            size: 13,
            weight: '700',
            family: "'Poppins', 'Roboto', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10,
        },
      },

      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        titleFont: {
          size: 14,
          weight: 'bold',
          family: "'Poppins', sans-serif"
        },
        bodyColor: '#e0e0e0',
        bodyFont: {
          size: 13,
          family: "'Poppins', sans-serif"
        },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },

      datalabels: {
        color: '#fff',
        anchor: 'center',
        align: 'center',
        offset: 0,
        font: {
          weight: 'bold',
          size: 12,
          family: "'Poppins', sans-serif"
        },
        formatter: (value, context) => {
          if (value === 0) return '';
          return value;
        },
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: {
          left: 6,
          right: 6,
          top: 4,
          bottom: 4
        }
      }
    },

    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#2c3e50',
          font: {
            size: 13,
            weight: '600',
            family: "'Poppins', sans-serif"
          },
          padding: 10,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.06)',
          borderDash: [5, 5],
        },
        ticks: {
          color: '#546e7a',
          font: {
            size: 12,
            weight: '500',
            family: "'Poppins', sans-serif"
          },
          stepSize: 20,
          padding: 10,
        },
        title: {
          display: true,
          text: '📈 Number of Projects',
          color: '#37474f',
          font: {
            size: 13,
            weight: '600',
            family: "'Poppins', sans-serif"
          },
        }
      }
    },

    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },

    elements: {
      bar: {
        borderRadius: 12,
        borderSkipped: false,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
      }
    },

    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      }
    }
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

{/* Stacked Bar Chart Section with 3D Effect */}
        {/* Stacked Bar Chart Section with 3D Effect - Compact Version */}
<MainCard 
  title="" 
  sx={{ 
    marginBottom: 3,
    background: 'linear-gradient(135deg, #8989de 0%, #bb8ce1 100%)',
    borderRadius: 3,
    boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  }}
>
  {/* Decorative header - Compact */}
  <Box sx={{ 
    p: 1.5, 
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  }}>
    <Typography variant="h5" sx={{ 
      color: '#fff', 
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontSize: '1.3rem'
    }}>
      STATUS OVERVIEW
    </Typography>
  </Box>
  
  {/* Chart Container - Reduced Size */}
  <Box sx={{ 
    width: '100%', 
    overflowX: 'auto',
    p: 2,
    position: 'relative',
  }}>
    <Box
      sx={{
        width: '100%',
        minWidth: '500px',
        height: 350, // Reduced from 500 to 350
        p: 2, // Reduced padding
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
        position: 'relative',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <Bar
        data={chartDataConfig}
        options={chartOptions}
      />
    </Box>
  </Box>
  
  {/* Stats summary - Compact
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-around', 
    p: 1.5, 
    background: 'rgba(255,255,255,0.1)',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    flexWrap: 'wrap',
    gap: 1
  }}>
    {[
      { label: 'Total Projects', value: Object.values(chartData).reduce((sum, item) => 
        sum + item.complete + item.ongoing + item.notStarted + item.underReview, 0), 
        color: '#fff', icon: '📋' },
      { label: 'Completion Rate', value: Math.round((Object.values(chartData).reduce((sum, item) => sum + item.complete, 0) / 
        Object.values(chartData).reduce((sum, item) => sum + item.complete + item.ongoing + item.notStarted + item.underReview, 0)) * 100), 
        color: '#4caf50', icon: '✅' },
      { label: 'Active Projects', value: Object.values(chartData).reduce((sum, item) => sum + item.ongoing, 0), 
        color: '#ff9800', icon: '🔄' }
    ].map((stat, idx) => (
      <Box key={idx} sx={{ textAlign: 'center', p: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{stat.icon}</span> {stat.label}
        </Typography>
        <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold', fontSize: '1.3rem' }}>
          {stat.value}{stat.label === 'Completion Rate' ? '%' : ''}
        </Typography>
      </Box>
    ))}
  </Box> */}
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
                  background: 'linear-gradient(135deg, rgba(208, 79, 79, 0.45), rgba(218, 98, 98, 1))', // Gradient color
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
                  image={ZoneSettings} // <-- Use the imported image here
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
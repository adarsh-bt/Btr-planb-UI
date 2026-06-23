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
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import GroupIcon from '@mui/icons-material/Hub';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { BarChart } from '@mui/x-charts/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';

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
  title: "Key Plot",
  subtitle: "Entry",
  route: "/schemes/earas/Key_plot_entry",
  background: "linear-gradient(135deg, #FF6B6B 0%, #FFE89E 100%)",
  icon: AddLocationIcon, // Optional: add icon
},
{
  id: 2,
  title: "Non-BTR",
  subtitle: "Key Plot Entry",
  route: "/schemes/earas/Non_BTR_Key_plot_entry",
  background: "linear-gradient(135deg, #FF6B6B 0%, #FFE89E 100%)",
  icon: AssignmentIcon, // Optional: add icon
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
      <Grid item xs={12} sm={6} md={4} lg={3}>
  <Card
    component={Link}
    to={activeGrid.route}
    sx={{
      textDecoration: 'none',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: '1.2rem', sm: '1.5rem' },
      borderRadius: '1.5rem',
      background: activeGrid.background,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: { xs: '120px', sm: '130px' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
        '&::before': {
          left: '100%',
        },
      },
    }}
  >
    {/* Icon Box - Replacing CardMedia for better control */}
    <Box
      sx={{
        width: { xs: '4rem', sm: '5rem' },
        height: { xs: '4rem', sm: '5rem' },
        borderRadius: '1rem',
        marginRight: { xs: 0, sm: '1.2rem' },
        marginBottom: { xs: '0.8rem', sm: 0 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05) rotate(5deg)',
        },
      }}
    >
      {activeGrid.icon ? (
        <activeGrid.icon 
          sx={{ 
            fontSize: { xs: '2.5rem', sm: '3rem' }, 
            color: '#ffffff',
          }} 
        />
      ) : (
        <img
          src={activeGrid.image || ""}
          alt={activeGrid.title}
          style={{
            width: '70%',
            height: '70%',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />
      )}
    </Box>

    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography 
        component="div" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#fff',
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.3rem' },
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          mb: 0.5,
          letterSpacing: '0.3px',
        }}
      >
        {activeGrid.title}
      </Typography>
      <Typography
        variant="subtitle2"
        component="div"
        sx={{
          color: 'rgba(255,255,255,0.85)',
          fontWeight: '400',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
        }}
      >
        {activeGrid.subtitle}
      </Typography>
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



<MainCard 
  title="" 
  sx={{ 
    marginBottom: 3,
    background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
    borderRadius: 4,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)'
  }}
>
  <Box sx={{ 
    p: 2.5, 
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2
  }}>
    <Typography variant="h5" sx={{ 
      fontWeight: 'bold',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontSize: '1.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <AssessmentIcon sx={{ fontSize: '2rem', color: '#4facfe' }} />
      STATUS OVERVIEW
    </Typography>
    
    {/* Status Summary Cards */}
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {[
        { label: 'Complete', color: '#00E676', value: 88 },
        { label: 'Ongoing', color: '#FFD54F', value: 92 },
        { label: 'Not Started', color: '#FF5252', value: 37 },
        { label: 'Under Review', color: '#7C4DFF', value: 24 }
      ].map((status) => (
        <Box 
          key={status.label}
          sx={{ 
            textAlign: 'center',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography sx={{ color: status.color, fontWeight: 'bold', fontSize: '1.1rem' }}>
            {status.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>
            {status.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
  
  <Box sx={{ 
    width: '100%', 
    overflowX: 'auto',
    p: 3,
    background: 'rgba(0,0,0,0.2)'
  }}>
    <Box
      sx={{
        width: '100%',
        minWidth: '600px',
        height: 400,
        p: 2,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
        }
      }}
    >
      <BarChart
        dataset={[
          { status: 'Complete', cluster: 30, form1: 38, cce: 20 },
          { status: 'Ongoing', cluster: 20, form1: 42, cce: 30 },
          { status: 'Not Started', cluster: 15, form1: 12, cce: 10 },
          { status: 'Under Review', cluster: 6, form1: 8, cce: 10 },
        ]}
        xAxis={[{ 
          scaleType: 'band', 
          dataKey: 'status',
          tickLabelStyle: { fill: '#fff', fontSize: 12, fontWeight: 500 }
        }]}
        yAxis={[{ 
          label: 'Number of Projects',
          labelStyle: { fill: 'rgba(255,255,255,0.8)' },
          tickLabelStyle: { fill: '#fff' }
        }]}
        series={[
          { dataKey: 'cluster', label: 'Cluster Status', color: '#00E676' },
          { dataKey: 'form1', label: 'Form 1 Status', color: '#FFD54F' },
          { dataKey: 'cce', label: 'CCE Status', color: '#7C4DFF' },
        ]}
        borderRadius={12}
        slotProps={{
          legend: {
            labelStyle: { fill: '#fff', fontSize: 12 },
            itemMarkWidth: 12,
            itemMarkHeight: 12,
          }
        }}
        sx={{
          '& .MuiBarElement-root': {
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          },
          '& .MuiChartsAxis-line': {
            stroke: 'rgba(255,255,255,0.2)',
          },
          '& .MuiChartsAxis-tick': {
            stroke: 'rgba(255,255,255,0.2)',
          },
        }}
        margin={{ left: 70, right: 50, top: 60, bottom: 50 }}
        height={350}
      />
    </Box>
  </Box>
</MainCard>
      
      <MainCard title="">
       <Grid container spacing={3}>
  {/* Zone Details Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/Zone_Details"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        borderRadius: '1.3rem',
        background: 'linear-gradient(135deg, #5B86E5 0%, #36D1DC 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '130px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          transition: 'left 0.6s ease',
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
          '&::before': { left: '100%' },
        },
      }}
    >
      <Box sx={{
        width: { xs: '4rem', sm: '5rem' },
        height: { xs: '4rem', sm: '5rem' },
        borderRadius: '1.2rem',
        marginRight: { xs: 0, sm: '1.5rem' },
        marginBottom: { xs: '1rem', sm: 0 },
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ShareLocationIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
          Zone
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Details
        </Typography>
      </Box>
    </Card>
  </Grid>

  {/* Mapping Management Card - Admin Only */}
  {(role === 'IT Admin' || role === 'EARAS Admin') && (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        component={Link}
        to="/schemes/earas/Mapping_Management"
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          borderRadius: '1.3rem',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE89E 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '130px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
            '&::before': { left: '100%' },
          },
        }}
      >
        <Box sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1.2rem',
          marginRight: { xs: 0, sm: '1.5rem' },
          marginBottom: { xs: '1rem', sm: 0 },
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MapIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
            Mapping
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Management
          </Typography>
        </Box>
      </Card>
    </Grid>
  )}

  {/* EARAS Management Card - Admin Only */}
  {(role === 'IT Admin' || role === 'EARAS Admin') && (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        component={Link}
        to="/schemes/earas/earas_management"
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          borderRadius: '1.3rem',
          background: 'linear-gradient(135deg, #A8C0FF 0%, #3F2B96 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '130px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
            '&::before': { left: '100%' },
          },
        }}
      >
        <Box sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1.2rem',
          marginRight: { xs: 0, sm: '1.5rem' },
          marginBottom: { xs: '1rem', sm: 0 },
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <SettingsIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
            Earas
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Management
          </Typography>
        </Box>
      </Card>
    </Grid>
  )}

  {/* e-BTR Card */}
  {role === 'Field Data Collector' && (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        component={Link}
        to="/schemes/earas/btr"
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          borderRadius: '1.3rem',
          background: 'linear-gradient(135deg, #43C6AC 0%, #191654 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '130px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
            '&::before': { left: '100%' },
          },
        }}
      >
        <Box sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1.2rem',
          marginRight: { xs: 0, sm: '1.5rem' },
          marginBottom: { xs: '1rem', sm: 0 },
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CalendarViewMonthIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
            e-BTR
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View
          </Typography>
        </Box>
      </Card>
    </Grid>
  )}

  {/* Key Plot Entry Card */}
  {renderKeyPlotGrids()}

  {/* Key Plot Lists Card */}
  {role === 'Field Data Collector' && (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        component={Link}
        to="/schemes/earas/Key_plot_Listing"
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          borderRadius: '1.3rem',
          background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '130px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
            '&::before': { left: '100%' },
          },
        }}
      >
        <Box sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1.2rem',
          marginRight: { xs: 0, sm: '1.5rem' },
          marginBottom: { xs: '1rem', sm: 0 },
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FormatListBulletedIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
            Key Plot
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Lists
          </Typography>
        </Box>
      </Card>
    </Grid>
  )}

  {/* Cluster Formation Card */}
  {role === 'Field Data Collector' && (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        component={Link}
        to="/schemes/earas/Clusters"
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          borderRadius: '1.3rem',
          background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '130px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
            '&::before': { left: '100%' },
          },
        }}
      >
        <Box sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1.2rem',
          marginRight: { xs: 0, sm: '1.5rem' },
          marginBottom: { xs: '1rem', sm: 0 },
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GroupIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
            Cluster
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Formation
          </Typography>
        </Box>
      </Card>
    </Grid>
  )}

  {/* Form 1 View Card */}
  {role === 'Field Data Collector' && (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        component={Link}
        to="/schemes/earas/Clusters_Form"
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          borderRadius: '1.3rem',
          background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '130px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
            '&::before': { left: '100%' },
          },
        }}
      >
        <Box sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1.2rem',
          marginRight: { xs: 0, sm: '1.5rem' },
          marginBottom: { xs: '1rem', sm: 0 },
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AssignmentIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
        </Box>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
            Form 1
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            View
          </Typography>
        </Box>
      </Card>
    </Grid>
  )}

  {/* GCES View Card */}
            {role === 'Field Data Collector' && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card
                  component={Link}
                  to="/schemes/earas/GCESDashboard"
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    borderRadius: '1.3rem',
                    background: 'linear-gradient(135deg, #8fdb39ff 0%, #e04e00ff 100%)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '130px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.6s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
                      '&::before': { left: '100%' },
                    },
                  }}
                >
                  <Box sx={{
                    width: { xs: '4rem', sm: '5rem' },
                    height: { xs: '4rem', sm: '5rem' },
                    borderRadius: '1.2rem',
                    marginRight: { xs: 0, sm: '1.5rem' },
                    marginBottom: { xs: '1rem', sm: 0 },
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <AssignmentIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                  </Box>
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
                      GCES
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      View
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            )}
          </Grid>
      </MainCard>
    </Grid>
  </Grid>
);
}

export default Earas_menus;
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import axios from 'axios';

function ClusterSeatMap() {
  const [clusters, setClusters] = useState([]);
  const [summary, setSummary] = useState({ completed: 0, ongoing: 0, notStarted: 0 });
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
      const token = localStorage.getItem('token');
    axios.get('http://localhost:8080/btr-service/cluster-api/user-cluster-summary/3bc4b01d-8d4b-4c2c-94ab-50bf4fdce924',
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                })
      .then(res => {
        setClusters(res.data.payload || []);
        setSummary({
          completed: res.data.completed || 0,
          ongoing: res.data.ongoing || 0,
          notStarted: res.data.notStarted || 0,
        });
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setClusters([]);
        setSummary({ completed: 0, ongoing: 0, notStarted: 0 });
      });
  }, []);

  // Status is indicated by border color
  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Completed': return '#4caf50'; // Green
      case 'Ongoing': return '#ffc107';   // Amber
      case 'On Going': return '#ffc107';  // Amber
      default: return '#9e9e9e';         // Grey for Not Started
    }
  };

  // Background gradient by cluster type
  const getClusterTypeBackgroundGradient = (type) => {
    switch (type.toLowerCase()) {
      case 'wet': return 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)'; // Light green to medium green
      case 'dry': return 'linear-gradient(135deg, #ffebee 0%, #ef9a9a 100%)'; // Light red to medium red
      default: return 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'; // Default light grey gradient
    }
  };

  const cardContentTextColor = '#333'; // Dark text color for content on light gradients

  // Animated border style for ongoing clusters
  const ongoingBorderAnimation = {
    animation: 'borderPulse 2s infinite',
    '@keyframes borderPulse': {
      '0%': {
        boxShadow: '0 0 0px 0px rgba(255,193,7, 0.5)',
      },
      '50%': {
        boxShadow: '0 0 12px 4px rgba(255,193,7, 0.8)',
      },
      '100%': {
        boxShadow: '0 0 0px 0px rgba(255,193,7, 0.5)',
      },
    },
  };

  const statuses = ['All', 'Completed', 'On Going', 'Not Started'];

  return (
 <Box
  sx={{
    padding: { xs: 3, sm: 4 },
    maxWidth: 'lg',
    margin: 'auto',
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  }}
>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#3f51b5' }}>
        Cluster Operations Map
      </Typography>

      {/* --- Status Tabs --- */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          marginBottom: 6,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {statuses.map((status) => {
          let count = 0;
          if (status === 'All') {
            count = summary.completed + summary.ongoing + summary.notStarted;
          } else if (status === 'Completed') count = summary.completed;
          else if (status === 'On Going') count = summary.ongoing;
          else if (status === 'Not Started') count = summary.notStarted;

          const isActive = selectedStatus === status;

          return (
           <Chip
  key={status}
  label={`${status}${status !== 'All' ? `: ${count}` : ''}`}
  onClick={() => setSelectedStatus(status)}
  sx={{
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    padding: '6px 16px',
    borderRadius: '20px', // Pill shape
    backgroundColor: isActive ? '#2C3E50' : '#BDC3C7',
    color: isActive ? 'white' : '#2C3E50',
    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: isActive ? '#1A252F' : '#AAB7B8',
    },
  }}
/>

          );
        })}
      </Stack>

      {/* --- Filtered Cluster Grid --- */}
      <Grid container spacing={1.5} justifyContent="center">
        {clusters
          .filter(cluster => selectedStatus === 'All' || cluster.status === selectedStatus)
          .map((cluster, index) => {
            const cardBackgroundGradient = getClusterTypeBackgroundGradient(cluster.clusterType);
            const cardBorderColor = getStatusBorderColor(cluster.status);

            return (
              <Grid item xs={4} sm={3} md={2} lg={1} xl={1} key={cluster.keyplotId}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.8rem' }}>
                        ID: **{cluster.clusterId}**
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.8rem' }}>
                        Type: **{cluster.clusterType.toUpperCase()}**
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.8rem' }}>
                        Status: **{cluster.status}**
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                 <Card
  sx={{
    background: '#FFFFFF',
    border: `2px solid ${cardBorderColor}`,
    borderRadius: 2,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    ...(cluster.status === 'Ongoing' || cluster.status === 'On Going' ? ongoingBorderAnimation : {}),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
    minHeight: { xs: 70, sm: 80 },
    p: 0.5,
  }}
>
                    <CardContent sx={{
                      padding: '4px',
                      '&:last-child': { paddingBottom: '4px' },
                      width: '100%',
                    }}>
                     <Typography
  variant="h6"
  component="div"
  sx={{
    fontWeight: 'bold',
    color: '#2C3E50',
    lineHeight: 1,
  }}
>
  {index + 1}
</Typography>
<Typography
  variant="caption"
  sx={{
    display: 'block',
    mt: 0.5,
    color: '#7F8C8D',
    borderRadius: '3px',
    padding: '1px 4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }}
>
  {cluster.clusterType}
</Typography>

                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
}

export default ClusterSeatMap;

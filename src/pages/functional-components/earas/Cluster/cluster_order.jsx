import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip,
  Button,
  Paper,
  Container,
  LinearProgress,
  alpha
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import axios from 'axios';
import Breadcrumb from 'routes/Breadcrumb';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

function ClusterSeatMap({ zoneId }) {
  const BTR_URL = mainapi.BASE_URL;
  const [clusters, setClusters] = useState([]);
  const [summary, setSummary] = useState({ completed: 0, ongoing: 0, notStarted: 0, underreview: 0 });
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [resolvedZoneId, setResolvedZoneId] = useState(() => {
    const role = authservice.getrole();
    return role === 'Field Data Collector' ? authservice.getzone() : zoneId;
  });

  const BASE_URL = mainapi.BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);

    axios.get(`${BASE_URL}/btr-service/cluster-api/user-cluster-summary/${resolvedZoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setClusters(res.data.payload || []);
        console.log("cluster data  ", res.data.payload);
        setSummary({
          completed: res.data.completed || 0,
          ongoing: res.data.ongoing || 0,
          notStarted: res.data.notStarted || 0,
          underreview: res.data.underreview || 0,
        });
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setClusters([]);
        setSummary({ completed: 0, ongoing: 0, notStarted: 0, underreview: 0 });
        setError('Failed to load cluster data. Please try again later.');
        setLoading(false);
      });
  }, [resolvedZoneId]);

  // Calculate crop counts
  const getCropCounts = () => {
    const cropCounts = {};
    clusters.forEach(cluster => {
      if (cluster.cceCrops && Array.isArray(cluster.cceCrops)) {
        cluster.cceCrops.forEach(crop => {
          cropCounts[crop] = (cropCounts[crop] || 0) + 1;
        });
      }
    });
    return cropCounts;
  };

  const cropCounts = getCropCounts();
  const totalCrops = Object.values(cropCounts).reduce((sum, count) => sum + count, 0);

  // Enhanced status color mapping with better colors
  const statusColors = {
    'Completed': {
      main: '#2e7d32',
      light: '#e8f5e8',
      border: '#4caf50',
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
    },
    'On Going': {
      main: '#ed6c02',
      light: '#fff8e1',
      border: '#ff9800',
      icon: <PlayCircleIcon sx={{ fontSize: 16 }} />
    },
    'Ongoing': {
      main: '#ed6c02',
      light: '#fff8e1',
      border: '#ff9800',
      icon: <PlayCircleIcon sx={{ fontSize: 16 }} />
    },
    'Under Review': {
      main: '#1976d2',
      light: '#e3f2fd',
      border: '#2196f3',
      icon: <RateReviewIcon sx={{ fontSize: 16 }} />
    },
    'Not Started': {
      main: '#757575',
      light: '#f5f5f5',
      border: '#9e9e9e',
      icon: <PendingIcon sx={{ fontSize: 16 }} />
    }
  };

  const getStatusBorderColor = (status) => {
    return statusColors[status]?.border || '#9e9e9e';
  };

  const getClusterTypeBackgroundColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'wet': return '#e8f5e8';
      case 'dry': return '#ffebee';
      default: return '#fafafa';
    }
  };

  const navigate = useNavigate();

  const handleClusterClick = (syNo, slNo) => {
    const encodedSyNo = encodeURIComponent(syNo);
    const encodedSlNo = encodeURIComponent(slNo);
    navigate(`/schemes/earas/cluster-route-wrapper?No=${encodedSyNo}&slno=${encodedSlNo}`);
  };

  const ongoingBorderAnimation = {
    animation: 'borderPulse 2s infinite',
    '@keyframes borderPulse': {
      '0%': { boxShadow: '0 0 0px 0px rgba(255,193,7, 0.5)' },
      '50%': { boxShadow: '0 0 12px 4px rgba(255,193,7, 0.8)' },
      '100%': { boxShadow: '0 0 0px 0px rgba(255,193,7, 0.5)' },
    },
  };

  const statuses = ['All', 'Completed', 'On Going', 'Not Started', 'Under Review'];

  // Calculate total clusters for progress
  const totalClusters = summary.completed + summary.ongoing + summary.notStarted + summary.underreview;
  const completionRate = totalClusters > 0 ? (summary.completed / totalClusters) * 100 : 0;

  // Enhanced StatusChip component
  const StatusChip = ({ status, count, isActive, onClick }) => {
    const statusConfig = status === 'All' 
      ? { main: '#556B2F', light: '#E0E0E0', icon: <AllInclusiveIcon sx={{ fontSize: 16 }} /> }
      : statusColors[status];

    return (
      <Chip
        icon={statusConfig?.icon}
        label={`${status}${status !== 'All' ? `: ${count}` : `: ${totalClusters}`}`}
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          padding: '8px 16px',
          borderRadius: '20px',
          backgroundColor: isActive ? statusConfig?.main : statusConfig?.light,
          color: isActive ? 'white' : statusConfig?.main,
          border: `2px solid ${statusConfig?.main}`,
          transition: 'all 0.3s ease',
          boxShadow: isActive 
            ? `0 4px 12px ${alpha(statusConfig?.main, 0.4)}`
            : '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 16px ${alpha(statusConfig?.main, 0.3)}`,
            backgroundColor: isActive ? statusConfig?.main : alpha(statusConfig?.main, 0.1),
          },
          '& .MuiChip-icon': {
            color: isActive ? 'white' : statusConfig?.main,
          }
        }}
      />
    );
  };

  // Crop Chip component
  const CropChip = ({ crop, count, isActive, onClick }) => (
    <Chip
      icon={<AgricultureIcon sx={{ fontSize: 16 }} />}
      label={`${crop}: ${count}`}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        padding: '8px 16px',
        borderRadius: '20px',
        backgroundColor: isActive ? '#4caf50' : '#e8f5e8',
        color: isActive ? 'white' : '#2e7d32',
        border: `2px solid #4caf50`,
        transition: 'all 0.3s ease',
        boxShadow: isActive 
          ? '0 4px 12px rgba(76, 175, 80, 0.4)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(76, 175, 80, 0.3)',
          backgroundColor: isActive ? '#4caf50' : 'rgba(76, 175, 80, 0.1)',
        },
        '& .MuiChip-icon': {
          color: isActive ? 'white' : '#2e7d32',
        }
      }}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Breadcrumb />
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" width="100%">
          <LoadingScreen message="Loading cluster data..." />
        </Box>
      ) : error ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          textAlign="center"
          width="100%"
        >
          <DotLottieReact
            style={{ width: '50rem', maxWidth: '100%' }}
            src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
            loop
            autoplay
          />
          <Typography variant="h5" gutterBottom color="error">
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {error}
          </Typography>
          <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {/* Header Section */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                fontWeight: '800',
                mb: 2
              }}
            >
              Cluster Operations Map
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                opacity: 0.9,
                mb: 3
              }}
            >
              Manage and monitor your agricultural clusters efficiently
            </Typography>

            {/* Progress Section */}
            <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Overall Progress
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {completionRate.toFixed(1)}% Complete
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionRate} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4caf50',
                    borderRadius: 4,
                  }
                }}
              />
            </Box>

            {/* Summary Stats */}
            <Grid container spacing={2} justifyContent="center">
              {Object.entries(summary).map(([key, value]) => (
                <Grid item xs={6} sm={3} key={key}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                      {value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              {/* Crop Summary */}
              <Grid item xs={6} sm={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                    {totalCrops}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Crops
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Status Filter Section */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: '600', color: 'text.primary' }}>
              Filter by Status
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {statuses.map((status) => {
                let count = 0;
                if (status === 'All') count = totalClusters;
                else if (status === 'Completed') count = summary.completed;
                else if (status === 'On Going') count = summary.ongoing;
                else if (status === 'Not Started') count = summary.notStarted;
                else if (status === 'Under Review') count = summary.underreview;

                return (
                  <StatusChip
                    key={status}
                    status={status}
                    count={count}
                    isActive={selectedStatus === status}
                    onClick={() => setSelectedStatus(status)}
                  />
                );
              })}
            </Stack>
          </Paper>

          {/* Crop Filter Section */}
          {Object.keys(cropCounts).length > 0 && (
            <Paper
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                backgroundColor: '#f8f9fa',
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: '600', color: 'text.primary' }}>
                Crops Overview
              </Typography>
              
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {Object.entries(cropCounts).map(([crop, count]) => (
                  <CropChip
                    key={crop}
                    crop={crop}
                    count={count}
                    isActive={false}
                    onClick={() => {}}
                  />
                ))}
              </Stack>
            </Paper>
          )}

          {/* Cluster Grid Section */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              backgroundColor: '#f8f9fa',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: '600', color: 'text.primary' }}>
              {selectedStatus === 'All' ? 'All Clusters' : `${selectedStatus} Clusters`} 
              <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                ({clusters.filter(cluster => selectedStatus === 'All' || cluster.status === selectedStatus).length})
              </Typography>
            </Typography>

            <Grid container spacing={2} justifyContent="flex-start">
              {clusters
                .filter(cluster => selectedStatus === 'All' || cluster.status === selectedStatus)
                .map((cluster, index) => {
                  const cardBackgroundColor = getClusterTypeBackgroundColor(cluster.clusterType);
                  const cardBorderColor = getStatusBorderColor(cluster.status);
                  const statusConfig = statusColors[cluster.status];

                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} xl={1} key={cluster.keyplotId}>
                      <Tooltip
                        title={
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                              Cluster #{cluster.clusterNo}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                              Type: <strong>{cluster.clusterType}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                              Local Body: <strong>{cluster.localbody}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                              Crops: <strong>{cluster.cceCrops?.join(', ') || 'N/A'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.8)' }}>
                              Status: <strong>{cluster.status}</strong>
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Card
                          sx={{
                            background: cardBackgroundColor,
                            border: `3px solid ${cardBorderColor}`,
                            borderRadius: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            ...((cluster.status === 'Ongoing' || cluster.status === 'On Going') && ongoingBorderAnimation),
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 24px ${alpha(cardBorderColor, 0.3)}`,
                            },
                            height: '120px', // Fixed height for all boxes
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                          }}
                          onClick={() => handleClusterClick(cluster.keyplotId, index + 1)}
                        >
                          <CardContent sx={{ 
                            p: 2, 
                            '&:last-child': { pb: 2 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {statusConfig?.icon}
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#2C3E50',
                                  ml: 0.5,
                                }}
                              >
                                {cluster.clusterNo}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  color: statusConfig?.main,
                                  borderRadius: '12px',
                                  padding: '2px 8px',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  backgroundColor: alpha(statusConfig?.main, 0.1),
                                  mb: 0.5,
                                }}
                              >
                                {cluster.clusterType}
                              </Typography>

                              {cluster.cce && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <LocalFloristIcon 
                                    sx={{ 
                                      fontSize: 14, 
                                      color: statusConfig?.main,
                                    }} 
                                  />
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontSize: '0.6rem',
                                      color: statusConfig?.main,
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    CCE
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Crop badges for multiple crops */}
                            {cluster.cceCrops && cluster.cceCrops.length > 0 && (
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                flexWrap: 'wrap',
                                gap: 0.5,
                                mt: 0.5
                              }}>
                                {cluster.cceCrops.slice(0, 2).map((crop, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      backgroundColor: alpha('#4caf50', 0.2),
                                      borderRadius: '8px',
                                      padding: '1px 6px',
                                    }}
                                  >
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontSize: '0.55rem',
                                        color: '#2e7d32',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {crop}
                                    </Typography>
                                  </Box>
                                ))}
                                {cluster.cceCrops.length > 2 && (
                                  <Box
                                    sx={{
                                      backgroundColor: alpha('#757575', 0.2),
                                      borderRadius: '8px',
                                      padding: '1px 6px',
                                    }}
                                  >
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontSize: '0.55rem',
                                        color: '#757575',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      +{cluster.cceCrops.length - 2}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Tooltip>
                    </Grid>
                  );
                })}
            </Grid>

            {clusters.filter(cluster => selectedStatus === 'All' || cluster.status === selectedStatus).length === 0 && (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No clusters found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStatus === 'All' 
                    ? 'There are no clusters available.' 
                    : `No clusters with status "${selectedStatus}" found.`}
                </Typography>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
}

export default ClusterSeatMap;
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
  Container,
  Paper,
  Alert
} from '@mui/material';
import {
  LocalFlorist,
  Refresh,
  FilterList,
  Dashboard,
  TrendingUp,
  PendingActions,
  CheckCircle,
  PlayCircle,
  NewReleases
} from '@mui/icons-material';
import axios from 'axios';
import Breadcrumb from 'routes/Breadcrumb';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

function ClusterSeatForm({ zoneId, btrType }) {
  const BTR_URL = mainapi.BTR_API;
  const [clusters, setClusters] = useState([]);
  const [summary, setSummary] = useState({ 
    completed: 0, 
    ongoing: 0, 
    notStarted: 0, 
    underreview: 0 
  });
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [resolvedZoneId, setResolvedZoneId] = useState(() => {
    const role = authservice.getrole();
    return role === 'Field Data Collector' ? authservice.getzone() : zoneId;
  });

  const BASE_URL = mainapi.BTR_API;

  useEffect(() => {
    fetchClusterData();
  }, [resolvedZoneId]);

  const fetchClusterData = () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    
    axios.get(`${BASE_URL}/btr-service/cluster-api/user-cluster-summary/${resolvedZoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      setClusters(res.data.payload || []);
      setSummary({
        completed: res.data.completed || 0,
        ongoing: res.data.ongoing || 0,
        notStarted: res.data.notStarted || 0,
        underreview: res.data.underreview || 0,
      });
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch data:', err);
      setClusters([]);
      setSummary({ completed: 0, ongoing: 0, notStarted: 0, underreview: 0 });
      setError('Failed to load cluster data. Please try again later.');
      setLoading(false);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#4caf50';
      case 'Ongoing':
      case 'On Going': return '#ff9800';
      case 'Under Review': return '#2196f3';
      case 'Not Started': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'Ongoing':
      case 'On Going': return <PlayCircle sx={{ fontSize: 16 }} />;
      case 'Under Review': return <PendingActions sx={{ fontSize: 16 }} />;
      case 'Not Started': return <NewReleases sx={{ fontSize: 16 }} />;
      default: return <Dashboard sx={{ fontSize: 16 }} />;
    }
  };

  const getClusterTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'wet': return { bg: '#E8F5E8', color: '#2E7D32', border: '#4CAF50' };
      case 'dry': return { bg: '#FFEBEE', color: '#C62828', border: '#F44336' };
      default: return { bg: '#F5F5F5', color: '#424242', border: '#9E9E9E' };
    }
  };

  const getStatusCount = (status) => {
    switch (status) {
      case 'All': return summary.completed + summary.ongoing + summary.notStarted + summary.underreview;
      case 'Completed': return summary.completed;
      case 'On Going': return summary.ongoing;
      case 'Not Started': return summary.notStarted;
      case 'Under Review': return summary.underreview;
      default: return 0;
    }
  };

  const navigate = useNavigate();

  const handleClusterClick = (syNo, slNo) => {
    const encodedSyNo = encodeURIComponent(syNo);
    const encodedSlNo = encodeURIComponent(slNo);
    navigate(`/schemes/earas/Clusters_Form/ClusterFormView?No=${encodedSyNo}&slno=${encodedSlNo}`);
  };

  const filteredClusters = clusters.filter(cluster => {
    const matchesStatus = selectedStatus === 'All' || cluster.status === selectedStatus;
    const matchesSearch = cluster.clusterNo?.toString().includes(searchTerm) || 
                         cluster.localbody?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = ['All', 'Completed', 'On Going', 'Not Started', 'Under Review'];

  return (
 <Grid container spacing={3}>
      <Breadcrumb />
    <Container maxWidth="xl" sx={{ py: 3 }}>
     
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
        >
          <DotLottieReact
            style={{ width: '300px', maxWidth: '100%' }}
            src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
            loop
            autoplay
          />
          <Typography variant="h5" gutterBottom color="error">
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 400 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchClusterData}
            sx={{ borderRadius: 3 }}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #4682f3ff 0%, #5b86e2ff 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Cluster Form Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  textAlign: 'center',
                  opacity: 0.9,
                  mb: 3
                }}
              >
                Manage and monitor your cluster form submissions
              </Typography>
            </Box>
            
            {/* Background decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)'
              }}
            />
          </Paper>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { status: 'All', label: 'Total Clusters', icon: <Dashboard />, color: '#666' },
              { status: 'Completed', label: 'Completed', icon: <CheckCircle />, color: '#4caf50' },
              { status: 'On Going', label: 'In Progress', icon: <PlayCircle />, color: '#ff9800' },
              { status: 'Under Review', label: 'Under Review', icon: <PendingActions />, color: '#2196f3' },
              { status: 'Not Started', label: 'Not Started', icon: <NewReleases />, color: '#9e9e9e' },
            ].map((item) => (
              <Grid item xs={12} sm={6} md={2.4} key={item.status}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    borderLeft: `4px solid ${item.color}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '50%',
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {getStatusCount(item.status)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    {item.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Filter Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Filter Clusters
              </Typography>
            </Box>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {statuses.map((status) => (
                  <Chip
                    key={status}
                    label={`${status} ${status !== 'All' ? `(${getStatusCount(status)})` : ''}`}
                    onClick={() => setSelectedStatus(status)}
                    icon={status !== 'All' ? getStatusIcon(status) : undefined}
                    variant={selectedStatus === status ? 'filled' : 'outlined'}
                    color={
                      selectedStatus === status ? 
                      (status === 'Completed' ? 'success' : 
                       status === 'On Going' ? 'warning' : 
                       status === 'Under Review' ? 'info' : 
                       status === 'Not Started' ? 'default' : 'primary') : 
                      'default'
                    }
                    sx={{
                      fontWeight: 'bold',
                      borderRadius: 2,
                      minWidth: 120,
                      ...(selectedStatus === status && {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      })
                    }}
                  />
                ))}
              </Stack>
              
              <Button
                startIcon={<Refresh />}
                onClick={fetchClusterData}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Stack>
          </Paper>

          {/* Clusters Grid */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <LocalFlorist sx={{ mr: 1 }} />
              {selectedStatus === 'All' ? 'All Clusters' : `${selectedStatus} Clusters`} 
              <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                ({filteredClusters.length})
              </Typography>
            </Typography>

            {filteredClusters.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No clusters found matching the current filters.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredClusters.map((cluster, index) => {
                  const typeColors = getClusterTypeColor(cluster.clusterType);
                  const statusColor = getStatusColor(cluster.status);
                  
                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={cluster.keyplotId || index}>
                      <Tooltip
                        title={
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                              Cluster {cluster.clusterNo}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'white', mt: 0.5 }}>
                              Local Body: <strong>{cluster.localbody}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                              Type: <strong>{cluster.clusterType}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                              Status: <strong>{cluster.status}</strong>
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Card
                          elevation={2}
                          sx={{
                            background: typeColors.bg,
                            border: `2px solid ${typeColors.border}`,
                            borderRadius: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'visible',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            }
                          }}
                          onClick={() => handleClusterClick(cluster.keyplotId, index + 1)}
                        >
                          {/* Status Indicator */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: statusColor,
                              border: '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                          
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography
                              variant="h5"
                              component="div"
                              sx={{
                                fontWeight: 'bold',
                                color: typeColors.color,
                                mb: 1,
                                fontSize: { xs: '1.5rem', sm: '1.75rem' }
                              }}
                            >
                              {cluster.clusterNo}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 2,
                                  backgroundColor: `${typeColors.color}15`,
                                  border: `1px solid ${typeColors.border}30`
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: typeColors.color,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  {cluster.clusterType}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt: 1
                              }}
                            >
                              {getStatusIcon(cluster.status)}
                              <Typography
                                variant="caption"
                                sx={{
                                  ml: 0.5,
                                  color: statusColor,
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {cluster.status}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </>
      )}
    </Container>
    </Grid>
  );
}

export default ClusterSeatForm;
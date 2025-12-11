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
  Alert,TextField,InputAdornment
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
  NewReleases,Search
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
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zonestatus, setZonestatus] = useState(false);
  // const { hasPermission } = usePermission();
  // const { roles, hasRole } = usePermission();

 const [resolvedZoneId, setResolvedZoneId] = useState(() => {
    const role = authservice.getrole();
    return role === 'Field Data Collector' ? authservice.getzone() : zoneId;
  });

  const BASE_URL = mainapi.BTR_API;

  // Season options
  const seasonOptions = [
    { id: 'All', name: 'All Seasons' },
    { id: 1, name: 'Autumn' },
    { id: 2, name: 'Winter' },
    { id: 3, name: 'Summer' }
  ];

  useEffect(() => {
    fetchClusterData();
  }, [resolvedZoneId]);

  const fetchClusterData = () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    
    if (!resolvedZoneId || resolvedZoneId === "null") {
      setError("No zones are assigned to you. Please contact your administrator.");
      setZonestatus(true);
      setLoading(false);
      return;
    }
    
    // Use the new API endpoint
    axios.get(`${BASE_URL}/btr-service/cluster-api/cluster-form-status/${resolvedZoneId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      // Map status to match your existing format
      const formattedClusters = (res.data.payload || []).map(cluster => ({
        ...cluster,
        status: normalizeStatus(cluster.status)
      }));
      
      setClusters(formattedClusters);
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

  // Helper function to normalize status values
  const normalizeStatus = (status) => {
    if (!status) return 'Not Started';
    
    const statusMap = {
      'ON GOING': 'On Going',
      'ONGOING': 'On Going',
      'COMPLETED': 'Completed',
      'UNDER REVIEW': 'Under Review',
      'NOT STARTED': 'Not Started',
      'Not Started': 'Not Started'
    };
    
    return statusMap[status.toUpperCase()] || status;
  };

  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'Completed': return '#4caf50';
      case 'On Going': return '#ff9800';
      case 'Under Review': return '#2196f3';
      case 'Not Started': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'Completed': return <CheckCircle sx={{ fontSize: 16 }} />;
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

  const getSeasonCount = (seasonId) => {
    if (seasonId === 'All') return clusters.length;
    return clusters.filter(cluster => cluster.seasonId === seasonId).length;
  };

  const navigate = useNavigate();

  const handleClusterClick = (syNo, slNo) => {
    const encodedSyNo = encodeURIComponent(syNo);
    const encodedSlNo = encodeURIComponent(slNo);
    navigate(`/schemes/earas/Clusters_Form/ClusterFormView?No=${encodedSyNo}&slno=${encodedSlNo}`);
  };

  const filteredClusters = clusters.filter(cluster => {
    const matchesStatus = selectedStatus === 'All' || normalizeStatus(cluster.status) === selectedStatus;
    const matchesSeason = selectedSeason === 'All' || cluster.seasonId === parseInt(selectedSeason);
    const matchesSearch = cluster.clusterNo?.toString().includes(searchTerm) || 
                         cluster.localbody?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cluster.village?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSeason && matchesSearch;
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
            minHeight="100%"
            textAlign="center"
          >
            <DotLottieReact
              style={{ width: '50rem', maxWidth: '100%' }}
              src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
              loop
              autoplay
            />
            {zonestatus && (
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: "#f5a123ff",
                  color: "#faf9f7ff",
                  border: "1px solid #FFEEBA",
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  width: "60%",
                  mx: "auto",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "-150px",
                    width: "120px",
                    height: "100%",
                    background:
                      "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255,255,255,0) 100%)",
                    transform: "skewX(-20deg)",
                    animation: "shine 2.5s infinite",
                  }}
                />

                <Typography variant="h5" sx={{ position: "relative", zIndex: 2 }}>
                  {error} 
                </Typography>

                <style>
                  {`
                    @keyframes shine {
                      0% { left: -150px; }
                      60% { left: 100%; }
                      100% { left: 100%; }
                    }
                  `}
                </style>
              </Box>
            )}
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
              
              <Grid container spacing={3} sx={{ mb: 2 }}>
                {/* Status Filter */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                    Filter by Status
                  </Typography>
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
                </Grid>

                {/* Season Filter */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                    Filter by Season
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {seasonOptions.map((season) => (
                      <Chip
                        key={season.id}
                        label={`${season.name} ${season.id !== 'All' ? `(${getSeasonCount(season.id)})` : ''}`}
                        onClick={() => setSelectedSeason(season.id)}
                        variant={selectedSeason === season.id ? 'filled' : 'outlined'}
                        color={selectedSeason === season.id ? 'primary' : 'default'}
                        sx={{
                          fontWeight: 'bold',
                          borderRadius: 2,
                          minWidth: 100,
                          ...(selectedSeason === season.id && {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          })
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>

              {/* Search and Action Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <TextField
                  placeholder="Search by cluster number, local body, or village..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ 
                    flexGrow: 1,
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <LocalFlorist sx={{ mr: 1 }} />
                  {selectedStatus === 'All' ? 'All Clusters' : `${selectedStatus} Clusters`} 
                  {selectedSeason !== 'All' && 
                    ` • ${seasonOptions.find(s => s.id === selectedSeason)?.name} Season`}
                  <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                    ({filteredClusters.length})
                  </Typography>
                </Typography>
                
                {/* CCE Indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: '#4caf50', 
                    mr: 1 
                  }} />
                  {/* <Typography variant="caption" color="text.secondary">
                    Green dot indicates CCE required
                  </Typography> */}
                </Box>
              </Box>

              {filteredClusters.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No clusters found matching the current filters.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {filteredClusters.map((cluster, index) => {
                    const typeColors = getClusterTypeColor(cluster.clusterType);
                    const statusColor = getStatusColor(cluster.status);
                    const seasonName = seasonOptions.find(s => s.id === cluster.seasonId)?.name || 'Unknown';
                    
                    return (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={cluster.keyplotId || index}>
                        <Tooltip
                          title={
                            <Box sx={{ p: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'white' }}>
                                Cluster {cluster.clusterNo}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: 'white', mt: 0.5 }}>
                                Village: <strong>{cluster.village}</strong>
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                                Local Body: <strong>{cluster.localbody}</strong>
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                                Type: <strong>{cluster.clusterType}</strong>
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                                Season: <strong>{seasonName}</strong>
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                                Status: <strong>{cluster.status}</strong>
                              </Typography>
                              {cluster.cce && (
                                <Typography variant="caption" sx={{ display: 'block', color: '#4caf50', mt: 0.5 }}>
                                  CCE Required: {cluster.cceCrops?.join(', ')}
                                </Typography>
                              )}
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
                            
                            {/* CCE Indicator */}
                            {cluster.cce && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -6,
                                  left: -6,
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: '#4caf50',
                                  border: '2px solid white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            )}
                            
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
                              
                              {/* Season Badge */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <Chip
                                  label={seasonName}
                                  size="small"
                                  sx={{
                                    fontSize: '0.6rem',
                                    height: 20,
                                    bgcolor: cluster.seasonId === 1 ? '#FFF3E0' : 
                                            cluster.seasonId === 2 ? '#E3F2FD' : 
                                            cluster.seasonId === 3 ? '#E8F5E9' : '#F5F5F5',
                                    color: cluster.seasonId === 1 ? '#EF6C00' : 
                                          cluster.seasonId === 2 ? '#1565C0' : 
                                          cluster.seasonId === 3 ? '#2E7D32' : '#757575'
                                  }}
                                />
                              </Box>
                              
                              {/* Cluster Type Badge */}
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
                              
                              {/* Status */}
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
                                  {normalizeStatus(cluster.status)}
                                </Typography>
                              </Box>
                              
                              {/* Village Info */}
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  mt: 1,
                                  color: 'text.secondary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {cluster.village}
                              </Typography>
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
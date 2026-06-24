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
  Alert,
  TextField,
  InputAdornment,
  Divider,
  Badge
} from '@mui/material';
import {
  LocalFlorist,
  Refresh,
  FilterList,
  Dashboard,
  PendingActions,
  CheckCircle,
  PlayCircle,
  NewReleases,
  Search,
  Grass,
  AcUnit,
  WbSunny
} from '@mui/icons-material';
import axios from 'axios';
import Breadcrumb from 'routes/Breadcrumb'; // Ensure this path is correct for your project
import LoadingScreen from 'utils/loadingscreen'; // Ensure this path is correct
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

function ClusterSeatForm({ zoneId }) {
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
  const [zonestatus, setZonestatus] = useState(false);

  const [resolvedZoneId] = useState(() => {
    const role = authservice.getrole();
 
    return role === 'Field Data Collector' ? authservice.getzone() : zoneId;
  });

  const BASE_URL = mainapi.BTR_API;
  const navigate = useNavigate();

  // Season Definitions
  const SEASONS = [
    { id: 1, name: 'Autumn', short: 'Aut', icon: <Grass fontSize="small" /> },
    { id: 2, name: 'Winter', short: 'Win', icon: <AcUnit fontSize="small" /> },
    { id: 3, name: 'Summer', short: 'Sum', icon: <WbSunny fontSize="small" /> }
  ];

  useEffect(() => {
    fetchClusterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedZoneId]);

  const startYear = 2025;
  const endYear = 2026;
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

    api.get(`${BASE_URL}/btr-service/cluster-api/cluster-form-status/${resolvedZoneId}/${authservice.agriyear()}`)
      .then(res => {
        // Store the raw payload directly - One object per cluster
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

  // --- Helper Functions ---

  const normalizeStatus = (status) => {
    if (!status) return 'Not Started';
    const map = {
      'ON GOING': 'On Going',
      'ONGOING': 'On Going',
      'COMPLETED': 'Completed',
      'UNDER REVIEW': 'Under Review',
      'NOT STARTED': 'Not Started'
    };
    return map[status.toUpperCase()] || status;
  };

  const getStatusColorConfig = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'Completed': return { main: '#4caf50', light: '#e8f5e9', border: '#a5d6a7' }; // Green
      case 'On Going': return { main: '#ff9800', light: '#fff3e0', border: '#ffcc80' }; // Orange
      case 'Under Review': return { main: '#2196f3', light: '#e3f2fd', border: '#90caf9' }; // Blue
      default: return { main: '#9e9e9e', light: '#f5f5f5', border: '#e0e0e0' }; // Grey
    }
  };

  const getStatusIcon = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'Completed': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'On Going': return <PlayCircle sx={{ fontSize: 16 }} />;
      case 'Under Review': return <PendingActions sx={{ fontSize: 16 }} />;
      default: return <NewReleases sx={{ fontSize: 16 }} />;
    }
  };

  const getClusterTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'wet': return { bg: '#F1F8E9', color: '#33691E', border: '#C5E1A5' };
      case 'dry': return { bg: '#FFFDE7', color: '#F57F17', border: '#FFF59D' };
      default: return { bg: '#FFFFFF', color: '#424242', border: '#E0E0E0' };
    }
  };

  // --- Navigation & Actions ---

  const handleSeasonClick = (e, cluster, seasonId) => {
    e.stopPropagation(); // Prevent triggering parent card click if any
    const encodedSyNo = encodeURIComponent(cluster.keyplotId); // keyplotId maps to 'No'
    const encodedSlNo = encodeURIComponent(cluster.clusterNo);          // seasonId maps to 'slno'
console.Console
    // Check if we have a resolvedZoneId (Admin context or specific zone view)
    if (resolvedZoneId) {
      navigate(`/schemes/earas/Clusters_Form/${resolvedZoneId}/ClusterFormView?No=${encodedSyNo}&slno=${encodedSlNo}`);
    } else {
      navigate(`/schemes/earas/Clusters_Form/ClusterFormView?No=${encodedSyNo}&slno=${encodedSlNo}`);
    }
  };
  // --- Filtering ---
  const filteredClusters = clusters.filter(cluster => {
    // 1. Filter by Status (Check Root Status)
    const normalizedRootStatus = normalizeStatus(cluster.status);
    const matchesStatus = selectedStatus === 'All' || normalizedRootStatus === selectedStatus;

    // 2. Filter by Search
    const matchesSearch =
      cluster.clusterNo?.toString().includes(searchTerm) ||
      cluster.localbody?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.village?.toLowerCase().includes(searchTerm.toLowerCase());

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
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={5}>
            <DotLottieReact
              style={{ width: '300px' }}
              src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
              loop
              autoplay
            />
            {zonestatus && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
            )}
            <Button variant="contained" startIcon={<Refresh />} onClick={fetchClusterData}>
              Retry
            </Button>
          </Box>
        ) : (
          <>
            <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  textAlign: 'center',
                  opacity: 0.9,
                  mb: 3
                }}
              >
                Form Status of Clusters
              </Typography>
            {/* --- Summary Cards --- */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { status: 'All', count: clusters.length, label: 'Total Clusters', icon: <Dashboard />, color: '#666' },
                { status: 'Completed', count: summary.completed, label: 'Completed', icon: <CheckCircle />, color: '#4caf50' },
                { status: 'On Going', count: summary.ongoing, label: 'In Progress', icon: <PlayCircle />, color: '#ff9800' },
                { status: 'Under Review', count: summary.underreview, label: 'Under Review', icon: <PendingActions />, color: '#2196f3' },
                { status: 'Not Started', count: summary.notStarted, label: 'Not Started', icon: <NewReleases />, color: '#9e9e9e' },
              ].map((item) => (
                <Grid item xs={12} sm={6} md={2.4} key={item.status}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 2, borderColor: item.color }
                    }}
                  >
                    <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${item.color}15`, color: item.color, mr: 2 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{item.count}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* --- Filters & Search --- */}
        
            {/* --- Cluster Grid --- */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocalFlorist sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                {selectedStatus === 'All' ? 'All Clusters' : `${selectedStatus} Clusters`}
                <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.9rem' }}>
                  ({filteredClusters.length} found)
                </Typography>
              </Typography>
            </Box>

            {filteredClusters.length === 0 ? (
              <Alert severity="info">No clusters found matching your criteria.</Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredClusters.map((cluster) => {
                  const typeStyles = getClusterTypeColor(cluster.clusterType);
                  const rootStatusConfig = getStatusColorConfig(cluster.status);

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={cluster.keyplotId}>
                      <Card
                        elevation={0}
                        sx={{
                          border: `1px solid ${typeStyles.border}`,
                          background: `linear-gradient(180deg, ${typeStyles.bg} 0%, #ffffff 60%)`,
                          borderRadius: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                          }
                        }}
                      >
                        {/* CCE Badge if applicable */}
                        {cluster.cce && (
                          <Tooltip title={`CCE Required: ${cluster.cceCrops?.join(', ')}`}>
                            <Badge
                              badgeContent="CCE"
                              color="error"
                              sx={{
                                position: 'absolute',
                                top: 15,
                                right: 15,
                                '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18 }
                              }}
                            />
                          </Tooltip>
                        )}

                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          {/* Header: ID and Status */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box>
                              <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                Cluster
                              </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 800, color: typeStyles.color }}>
                                {cluster.clusterNo}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={normalizeStatus(cluster.status)}
                              sx={{
                                bgcolor: rootStatusConfig.main,
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                height: 22
                              }}
                            />
                          </Box>

                          {/* Details */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="bold" noWrap title={cluster.localbody}>
                              {cluster.localbody}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Village: {cluster.village}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                              <Chip
                                label={cluster.clusterType}
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: `${typeStyles.color}20`,
                                  color: typeStyles.color,
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase'
                                }}
                              />
                              {/* <Typography variant="caption" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                                        Area: {cluster.area} 
                                    </Typography> */}
                            </Stack>
                          </Box>

                          <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                          {/* Seasons Action Area */}
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1, display: 'block' }}>
                            SELECT SEASON TO VIEW:
                          </Typography>

                          <Grid container spacing={1}>
                            {SEASONS.map((seasonDef) => {
                              // Find status for this season from the 'seasons' array
                              const seasonData = cluster.seasons?.find(s => s.seasonId === seasonDef.id);
                              const sStatus = seasonData ? seasonData.status : 'NOT STARTED';
                              const sConfig = getStatusColorConfig(sStatus);

                              return (
                                <Grid item xs={4} key={seasonDef.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                                  <Tooltip title={`${seasonDef.name}: ${normalizeStatus(sStatus)}`}>
                                    <Button
                                      fullWidth
                                      variant="outlined"
                                      size="small"
                                      onClick={(e) => handleSeasonClick(e, cluster, seasonDef.id)}
                                      sx={{
                                        flexDirection: 'column',
                                        p: 0.5,
                                        borderColor: sConfig.border,
                                        bgcolor: sConfig.light,
                                        color: '#444',
                                        minHeight: 55,
                                        '&:hover': {
                                          bgcolor: sConfig.border,
                                          borderColor: sConfig.main
                                        }
                                      }}
                                    >
                                      <Box sx={{ color: sConfig.main, mb: 0.5 }}>
                                        {seasonDef.icon}
                                      </Box>
                                      <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 'bold', fontSize: '0.65rem' }}>
                                        {seasonDef.short}<br></br>
                                        {seasonData.status}
                                      </Typography>
                                      <Box
                                        sx={{
                                          mt: 0.5,
                                          width: 6,
                                          height: 6,
                                          borderRadius: '50%',
                                          bgcolor: sConfig.main
                                        }}
                                      />
                                    </Button>
                                  </Tooltip>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Grid>
  );
}

export default ClusterSeatForm;
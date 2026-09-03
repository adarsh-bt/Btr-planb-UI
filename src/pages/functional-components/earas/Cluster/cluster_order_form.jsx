import React, { useEffect, useState, useMemo } from 'react';
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
  WbSunny,
  Clear
} from '@mui/icons-material';
import axios from 'axios';
import Breadcrumb from 'routes/Breadcrumb';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

function ClusterSeatForm({ zoneId }) {
  const [clusters, setClusters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All'); // 'All', '1', '2', '3'
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
        setClusters(res.data.payload || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setClusters([]);
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

  // --- Dynamic Season-Wise Summary Calculation ---
  const seasonSummary = useMemo(() => {
    if (!clusters || clusters.length === 0) {
      return { total: 0, completed: 0, ongoing: 0, notStarted: 0, underreview: 0 };
    }

    let completed = 0;
    let ongoing = 0;
    let underreview = 0;
    let notStarted = 0;

    clusters.forEach(cluster => {
      let statusToUse = cluster.status;

      if (selectedSeason !== 'All') {
        const seasonId = Number(selectedSeason);
        const seasonData = cluster.seasons?.find(s => s.seasonId === seasonId);
        statusToUse = seasonData ? seasonData.status : 'NOT STARTED';
      }

      const norm = normalizeStatus(statusToUse);
      if (norm === 'Completed') completed++;
      else if (norm === 'On Going') ongoing++;
      else if (norm === 'Under Review') underreview++;
      else notStarted++;
    });

    return { total: clusters.length, completed, ongoing, notStarted, underreview };
  }, [clusters, selectedSeason]);

  // --- Navigation & Actions ---

  const handleSeasonClick = (e, cluster, seasonId) => {
    e.stopPropagation();
    const encodedSyNo = encodeURIComponent(cluster.keyplotId);
    const encodedSlNo = encodeURIComponent(cluster.clusterNo);

    if (resolvedZoneId) {
      navigate(`/schemes/earas/Clusters_Form/${resolvedZoneId}/ClusterFormView?No=${encodedSyNo}&slno=${encodedSlNo}`);
    } else {
      navigate(`/schemes/earas/Clusters_Form/ClusterFormView?No=${encodedSyNo}&slno=${encodedSlNo}`);
    }
  };

  // --- Filtering ---
  const filteredClusters = useMemo(() => {
    return clusters.filter(cluster => {
      // 1. Filter by Status & Season
      let matchesStatus = true;

      if (selectedStatus !== 'All') {
        let statusToMatch = cluster.status;

        if (selectedSeason !== 'All') {
          const seasonId = Number(selectedSeason);
          const seasonData = cluster.seasons?.find(s => s.seasonId === seasonId);
          statusToMatch = seasonData ? seasonData.status : 'NOT STARTED';
        }

        const normalizedStatus = normalizeStatus(statusToMatch);
        matchesStatus = normalizedStatus === selectedStatus;
      }

      // 2. Filter by Search
      const matchesSearch =
        !searchTerm ||
        cluster.clusterNo?.toString().includes(searchTerm) ||
        cluster.localbody?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cluster.village?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [clusters, selectedStatus, selectedSeason, searchTerm]);

  const selectedSeasonLabel = useMemo(() => {
    if (selectedSeason === 'All') return 'All Seasons';
    const s = SEASONS.find(item => item.id === Number(selectedSeason));
    return s ? `${s.name} Season` : 'Season';
  }, [selectedSeason]);

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

            {/* --- Season Wise Filter Tabs --- */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                bgcolor: '#fafafa'
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box display="flex" alignItems="center">
                  <FilterList sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#333' }}>
                    Select Season:
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    icon={<Dashboard fontSize="small" />}
                    label="All Seasons"
                    clickable
                    color={selectedSeason === 'All' ? 'primary' : 'default'}
                    variant={selectedSeason === 'All' ? 'filled' : 'outlined'}
                    onClick={() => setSelectedSeason('All')}
                    sx={{ fontWeight: 'bold', px: 1, py: 2 }}
                  />
                  {SEASONS.map((season) => (
                    <Chip
                      key={season.id}
                      icon={season.icon}
                      label={`${season.name}`}
                      clickable
                      color={selectedSeason === String(season.id) ? 'primary' : 'default'}
                      variant={selectedSeason === String(season.id) ? 'filled' : 'outlined'}
                      onClick={() => setSelectedSeason(String(season.id))}
                      sx={{ fontWeight: 'bold', px: 1, py: 2 }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {/* --- Summary Cards (Season-wise Dynamic Counts) --- */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {[
                { status: 'All', count: seasonSummary.total, label: 'Total Clusters', icon: <Dashboard />, color: '#666' },
                { status: 'Completed', count: seasonSummary.completed, label: 'Completed', icon: <CheckCircle />, color: '#4caf50' },
                { status: 'On Going', count: seasonSummary.ongoing, label: 'In Progress', icon: <PlayCircle />, color: '#ff9800' },
                { status: 'Under Review', count: seasonSummary.underreview, label: 'Under Review', icon: <PendingActions />, color: '#2196f3' },
                { status: 'Not Started', count: seasonSummary.notStarted, label: 'Not Started', icon: <NewReleases />, color: '#9e9e9e' },
              ].map((item) => {
                const isSelected = selectedStatus === item.status;
                return (
                  <Grid item xs={12} sm={6} md={2.4} key={item.status}>
                    <Paper
                      elevation={isSelected ? 4 : 0}
                      onClick={() => setSelectedStatus(item.status)}
                      sx={{
                        p: 2,
                        border: isSelected ? `2px solid ${item.color}` : '1px solid #e0e0e0',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        bgcolor: isSelected ? `${item.color}08` : '#ffffff',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2, borderColor: item.color }
                      }}
                    >
                      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: `${item.color}15`, color: item.color, mr: 2 }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{item.count}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={isSelected ? 'bold' : 'normal'}>
                          {item.label} ({selectedSeasonLabel})
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* --- Search and Reset Controls --- */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by Cluster No, Village or Localbody..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <Button size="small" onClick={() => setSearchTerm('')} sx={{ p: 0, minWidth: 24 }}>
                            <Clear fontSize="small" />
                          </Button>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} alignItems="center" flexWrap="wrap" gap={1}>
                    {(selectedStatus !== 'All' || selectedSeason !== 'All' || searchTerm) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          setSelectedStatus('All');
                          setSelectedSeason('All');
                          setSearchTerm('');
                        }}
                      >
                        Reset Filters
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* --- Cluster Grid Header --- */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocalFlorist sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                {selectedSeasonLabel} - {selectedStatus === 'All' ? 'All Clusters' : `${selectedStatus} Clusters`}
                <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.9rem' }}>
                  ({filteredClusters.length} found)
                </Typography>
              </Typography>
            </Box>

            {filteredClusters.length === 0 ? (
              <Alert severity="info">No clusters found matching your selected season and status criteria.</Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredClusters.map((cluster) => {
                  const typeStyles = getClusterTypeColor(cluster.clusterType);

                  // Determine display status based on selected season
                  let displayStatus = cluster.status;
                  if (selectedSeason !== 'All') {
                    const seasonId = Number(selectedSeason);
                    const seasonData = cluster.seasons?.find(s => s.seasonId === seasonId);
                    displayStatus = seasonData ? seasonData.status : 'NOT STARTED';
                  }

                  const rootStatusConfig = getStatusColorConfig(displayStatus);

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
                              label={`${selectedSeason !== 'All' ? selectedSeasonLabel.split(' ')[0] + ': ' : ''}${normalizeStatus(displayStatus)}`}
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
                            </Stack>
                          </Box>

                          <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                          {/* Seasons Action Area */}
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1, display: 'block' }}>
                            SELECT SEASON TO VIEW:
                          </Typography>

                          <Grid container spacing={1}>
                            {SEASONS.map((seasonDef) => {
                              const seasonData = cluster.seasons?.find(s => s.seasonId === seasonDef.id);
                              const sStatus = seasonData ? seasonData.status : 'NOT STARTED';
                              const sConfig = getStatusColorConfig(sStatus);
                              const isSeasonActive = selectedSeason === String(seasonDef.id);

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
                                        borderColor: isSeasonActive ? sConfig.main : sConfig.border,
                                        bgcolor: isSeasonActive ? sConfig.border : sConfig.light,
                                        borderWidth: isSeasonActive ? 2 : 1,
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
                                        {normalizeStatus(sStatus)}
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
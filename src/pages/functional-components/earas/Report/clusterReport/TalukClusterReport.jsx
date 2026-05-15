import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  alpha,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';

// API base URL - adjust based on your environment
const BASE_URL = mainapi.BTR_API;

function TalukClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtId: routeDistrictId } = useParams();
  const location = useLocation();
  const stateData = location.state || {};

  // API state
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [seasonTab, setSeasonTab] = useState(stateData.seasonTab || 'ALL');
  const [landType, setLandType] = useState(stateData.landType || null);
  const [filterType, setFilterType] = useState(stateData.filterType || 'range');
  const [fromMonth, setFromMonth] = useState(stateData.fromMonth || '');
  const [toMonth, setToMonth] = useState(stateData.toMonth || '');
  const [singleMonth, setSingleMonth] = useState(stateData.singleMonth || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month name to number mapping for API
  const monthToNumber = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };

  // Get current year
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  // Format month for API (YYYY-MM)
  const formatMonthForApi = (monthName) => {
    if (!monthName) return null;
    const year = getCurrentYear();
    const monthNum = monthToNumber[monthName];
    return `${year}-${monthNum}`;
  };

  // Helper function to get taluk statistics based on land type
  const getTalukStats = (talukDetails) => {
    if (!talukDetails) {
      return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 };
    }

    // If land type is WET, use wet statistics
    if (landType === 'WET') {
      return {
        completed: talukDetails.wetCompleted || 0,
        ongoing: talukDetails.wetOngoing || 0,
        notStarted: talukDetails.wetNotStarted || 0,
        underReview: talukDetails.wetUnderView || 0
      };
    } 
    // If land type is DRY, use dry statistics
    else if (landType === 'DRY') {
      return {
        completed: talukDetails.dryCompleted || 0,
        ongoing: talukDetails.dryOngoing || 0,
        notStarted: talukDetails.dryNotStarted || 0,
        underReview: talukDetails.dryUnderView || 0
      };
    }
    // If ALL, combine both wet and dry statistics
    else {
      return {
        completed: (talukDetails.wetCompleted || 0) + (talukDetails.dryCompleted || 0),
        ongoing: (talukDetails.wetOngoing || 0) + (talukDetails.dryOngoing || 0),
        notStarted: (talukDetails.wetNotStarted || 0) + (talukDetails.dryNotStarted || 0),
        underReview: (talukDetails.wetUnderView || 0) + (talukDetails.dryUnderView || 0)
      };
    }
  };

  // Get district ID from various sources
  const getDistrictId = () => {
    // Try to get from state first
    if (stateData.districtId) return stateData.districtId;
    // Try from route params
    if (routeDistrictId && !isNaN(routeDistrictId)) return parseInt(routeDistrictId);
    // Try to find by district name from allSubDetails
    if (stateData.districtName && apiData?.allSubDetails) {
      const entry = Object.entries(apiData.allSubDetails).find(
        ([name]) => name.toLowerCase() === stateData.districtName.toLowerCase()
      );
      if (entry) return entry[1].id;
    }
    return null;
  };

  // Fetch taluk-wise data from API
  const fetchTalukWiseData = async () => {
    const districtIdValue = getDistrictId();
    
    if (!districtIdValue) {
      setError('District ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token missing');
      }
      
      let url = `${BASE_URL}/btr-service/api/report/clusters/district/taluk-wise?districtId=${districtIdValue}`;

      // Add landType filter
      if (landType && seasonTab !== 'ALL') {
        url += `&landType=${landType.toLowerCase()}`;
      }

      // Add date filters
      if (filterType === 'single' && singleMonth) {
        const formattedMonth = formatMonthForApi(singleMonth);
        if (formattedMonth) {
          url += `&startMonth=${formattedMonth}&endMonth=${formattedMonth}`;
        }
      } else if (filterType === 'range') {
        if (fromMonth) {
          url += `&startMonth=${formatMonthForApi(fromMonth)}`;
        }
        if (toMonth) {
          url += `&endMonth=${formatMonthForApi(toMonth)}`;
        }
      }

      console.log('Fetching taluk data from:', url);
      
      // Make request with authorization header
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setApiData(response.data);
      }
    } catch (err) {
      console.error('Error fetching taluk data:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to access this data.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch taluk data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform API data for table display with proper wet/dry handling
  const talukData = useMemo(() => {
    if (!apiData || !apiData.allSubDetails) {
      return [];
    }

    return Object.entries(apiData.allSubDetails).map(([talukName, details]) => {
      const stats = getTalukStats(details);
      return {
        id: details.id,
        taluk: talukName,
        total: stats.completed + stats.ongoing + stats.notStarted + stats.underReview,
        completed: stats.completed,
        ongoing: stats.ongoing,
        notStarted: stats.notStarted,
        underReview: stats.underReview
      };
    });
  }, [apiData, landType]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: talukData.reduce((sum, row) => sum + row.total, 0),
    completed: talukData.reduce((sum, row) => sum + row.completed, 0),
    ongoing: talukData.reduce((sum, row) => sum + row.ongoing, 0),
    notStarted: talukData.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: talukData.reduce((sum, row) => sum + row.underReview, 0)
  }), [talukData]);

  // Filter data based on search term
  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return talukData;
    return talukData.filter(row =>
      row.taluk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [talukData, searchTerm]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return searchFilteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

  // Fetch data when filters change
  useEffect(() => {
    fetchTalukWiseData();
  }, [landType, fromMonth, toMonth, singleMonth, filterType, routeDistrictId]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSingleMonth('');
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('range');
    setPage(0);
  };

  const handleSeasonTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSeasonTab(newValue);
      if (newValue === 'ALL') {
        setLandType(null);
      } else {
        setLandType(newValue);
      }
      setPage(0);
    }
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setFilterType(newValue);
      setFromMonth('');
      setToMonth('');
      setSingleMonth('');
      setPage(0);
    }
  };

  const handleViewTalukDetails = (talukName, talukId) => {
    // Navigate to zone level
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const districtName = stateData.districtName || 
      (apiData && Object.keys(apiData.allSubDetails || {})[0]?.replace(/[^a-zA-Z]/g, '-')) || 
      'district';
    
    navigate(`/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${formattedTalukName}-${talukId}`, {
      state: { 
        talukId: talukId,
        talukName: talukName,
        districtId: getDistrictId(),
        districtName: stateData.districtName,
        landType: landType,
        seasonTab: seasonTab,
        startMonth: filterType === 'single' ? formatMonthForApi(singleMonth) : formatMonthForApi(fromMonth),
        endMonth: filterType === 'single' ? formatMonthForApi(singleMonth) : formatMonthForApi(toMonth),
        filterType,
        fromMonth,
        toMonth,
        singleMonth
      }
    });
  };

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card sx={{
      bgcolor: bgColor,
      borderRadius: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  // Loading state
  if (loading && !apiData) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
        <Grid item>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading taluk data...</Typography>
        </Grid>
      </Grid>
    );
  }

  const displayDistrictName = stateData.districtName || 
    (apiData && Object.keys(apiData.allSubDetails || {})[0]?.replace(/[^a-zA-Z]/g, '')) || 
    'District';

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* Header with district name */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {displayDistrictName} - Taluk wise Cluster Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {apiData && ` • Total Clusters: ${apiData.totalCluster || 0}`}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth || toMonth || singleMonth || seasonTab !== 'ALL') && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Error Message */}
      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        </Grid>
      )}

      {/* Filter Section */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
              <Tabs
                value={seasonTab}
                onChange={handleSeasonTabChange}
                sx={{ minHeight: 40 }}
              >
                <Tab label="ALL" value="ALL" />
                <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
                <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
              </Tabs>

              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={handleFilterTypeChange}
                size="small"
              >
                <ToggleButton value="range">
                  <ViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Month Range
                </ToggleButton>
                <ToggleButton value="single">
                  <ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Single Month
                </ToggleButton>
              </ToggleButtonGroup>

              {filterType === 'range' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select value={fromMonth} label="From Month" onChange={(e) => { setFromMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={(e) => { setToMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={singleMonth}
                    label="Select Month"
                    onChange={(e) => { setSingleMonth(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3
          }}
        >
          <Chip
            label={`${displayDistrictName} - District Report Summary`}
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              zIndex: 10,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1
            }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                label="Total Clusters"
                value={stats.total}
                color="#1565c0"
                bgColor={alpha('#1565c0', 0.08)}
                icon={<AssessmentIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                label="Completed"
                value={stats.completed}
                color="#2e7d32"
                bgColor={alpha('#2e7d32', 0.08)}
                icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                label="Ongoing"
                value={stats.ongoing}
                color="#ed6c02"
                bgColor={alpha('#ed6c02', 0.08)}
                icon={<PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                label="Not Started"
                value={stats.notStarted}
                color="#757575"
                bgColor={alpha('#757575', 0.08)}
                icon={<ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                label="Under Review"
                value={stats.underReview}
                color="#b76e00"
                bgColor={alpha('#b76e00', 0.08)}
                icon={<RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} />}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Taluk Table */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3
          }}
        >
          <Chip
            label="Taluk Report Summary"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              zIndex: 10,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1,
              boxShadow: 2
            }}
          />

          <MainCard
            title={`Taluks in ${displayDistrictName}`}
            secondary={
              <TextField
                placeholder="Search taluk..."
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            }
            sx={{ borderRadius: 3 }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {[
                      'Taluk',
                      'Total',
                      'Completed',
                      'Ongoing',
                      'Not Started',
                      'Under Review',
                      'Actions'
                    ].map((label, idx) => (
                      <TableCell
                        key={idx}
                        align={idx === 0 ? 'left' : 'center'}
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          py: 1.5
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: alpha('#04255e', 0.04)
                          },
                          transition: '0.2s'
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <LocationOnIcon
                              sx={{
                                fontSize: 18,
                                color: '#04255e',
                                opacity: 0.7
                              }}
                            />
                            <Typography fontWeight={500}>
                              {row.taluk}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={row.total}
                            size="small"
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                              bgcolor: alpha('#04255e', 0.1)
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          {row.completed > 0 ? (
                            <Chip
                              label={row.completed}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            row.completed
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {row.ongoing > 0 ? (
                            <Chip
                              label={row.ongoing}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            row.ongoing
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {row.notStarted > 0 ? (
                            <Chip
                              label={row.notStarted}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            row.notStarted
                          )}
                        </TableCell>

                        <TableCell align="center">
                          {row.underReview > 0 ? (
                            <Chip
                              label={row.underReview}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ) : (
                            row.underReview
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="View Zone Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewTalukDetails(row.taluk, row.id)}
                              sx={{
                                color: '#04255e',
                                '&:hover': {
                                  bgcolor: alpha('#04255e', 0.1)
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 6 }}
                      >
                        <Typography color="text.secondary">
                          {searchTerm
                            ? `No taluks found matching "${searchTerm}"`
                            : 'No data available for selected filters'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {searchFilteredData.length > 0 && !loading && (
              <TablePagination
                component="div"
                count={searchFilteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default TalukClusterReport;
import React, { useState, useMemo, useEffect } from 'react';
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
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';

// API base URL - adjust based on your environment
// const API_BASE_URL = 'http://localhost:8082/btr-service';
const BASE_URL = mainapi.BTR_API;

function KeralaReportList() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [seasonTab, setSeasonTab] = useState('ALL');
  const [landType, setLandType] = useState(null); // 'WET' or 'DRY' or null for ALL
  const [filterType, setFilterType] = useState('single');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState(getCurrentMonth());
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function getCurrentMonth() {
    const currentDate = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[currentDate.getMonth()];
  }

  // Month name to number mapping for API
  const monthToNumber = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };

  // Get current year (assuming current year or you can make it configurable)
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

  // Helper function to get district statistics based on land type
  const getDistrictStats = (districtDetails) => {
    if (!districtDetails) {
      return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 };
    }

    // If land type is WET, use wet statistics
    if (landType === 'WET') {
      return {
        completed: districtDetails.wetCompleted || 0,
        ongoing: districtDetails.wetOngoing || 0,
        notStarted: districtDetails.wetNotStarted || 0,
        underReview: districtDetails.wetUnderView || 0
      };
    } 
    // If land type is DRY, use dry statistics
    else if (landType === 'DRY') {
      return {
        completed: districtDetails.dryCompleted || 0,
        ongoing: districtDetails.dryOngoing || 0,
        notStarted: districtDetails.dryNotStarted || 0,
        underReview: districtDetails.dryUnderView || 0
      };
    }
    // If ALL, combine both wet and dry statistics
    else {
      return {
        completed: (districtDetails.wetCompleted || 0) + (districtDetails.dryCompleted || 0),
        ongoing: (districtDetails.wetOngoing || 0) + (districtDetails.dryOngoing || 0),
        notStarted: (districtDetails.wetNotStarted || 0) + (districtDetails.dryNotStarted || 0),
        underReview: (districtDetails.wetUnderView || 0) + (districtDetails.dryUnderView || 0)
      };
    }
  };

  // Fetch data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token missing');
      }
      
      let url = `${BASE_URL}/btr-service/api/report/clusters/AllDistricts`;
      const params = new URLSearchParams();
      
      // Add landType filter
      if (landType && seasonTab !== 'ALL') {
        params.append('landType', landType.toLowerCase());
      }
      
      // Add date filters - ALWAYS include startMonth (backend requires it)
      if (filterType === 'single' && singleMonth) {
        const formattedMonth = formatMonthForApi(singleMonth);
        if (formattedMonth) {
          params.append('startMonth', formattedMonth);
          params.append('endMonth', formattedMonth);
        }
      } else if (filterType === 'range') {
        // For range filter, we need at least startMonth
        if (fromMonth) {
          params.append('startMonth', formatMonthForApi(fromMonth));
        } else {
          // If no fromMonth selected, default to current month
          params.append('startMonth', formatMonthForApi(getCurrentMonth()));
        }
        
        if (toMonth) {
          params.append('endMonth', formatMonthForApi(toMonth));
        }
      } else {
        // Fallback - should not happen, but just in case
        const currentMonth = formatMonthForApi(getCurrentMonth());
        params.append('startMonth', currentMonth);
        params.append('endMonth', currentMonth);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log('Fetching data from:', url);
      
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
      console.error('Error fetching dashboard data:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Optionally redirect to login page
        // navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to access this data.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check your filters.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to district data format with proper wet/dry handling
  const transformApiDataToDistricts = useMemo(() => {
    if (!apiData || !apiData.allSubDetails) {
      return [];
    }
    
    return Object.entries(apiData.allSubDetails).map(([districtName, details]) => {
      const stats = getDistrictStats(details);
      return {
        id: details.id,
        district: districtName,
        total: stats.completed + stats.ongoing + stats.notStarted + stats.underReview,
        completed: stats.completed,
        ongoing: stats.ongoing,
        notStarted: stats.notStarted,
        underReview: stats.underReview
      };
    });
  }, [apiData, landType]);

  // Stats calculation
  const stats = useMemo(() => ({
    all: transformApiDataToDistricts.reduce((sum, row) => sum + row.total, 0),
    completed: transformApiDataToDistricts.reduce((sum, row) => sum + row.completed, 0),
    ongoing: transformApiDataToDistricts.reduce((sum, row) => sum + row.ongoing, 0),
    notStarted: transformApiDataToDistricts.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: transformApiDataToDistricts.reduce((sum, row) => sum + row.underReview, 0)
  }), [transformApiDataToDistricts]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return transformApiDataToDistricts;
    return transformApiDataToDistricts.filter(row => 
      row.district.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transformApiDataToDistricts, searchTerm]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handle filter changes
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
      if (newValue === 'single') {
        // When switching to single month, set to current month
        setSingleMonth(getCurrentMonth());
        setFromMonth('');
        setToMonth('');
      } else {
        // When switching to range, set fromMonth to current month
        setFromMonth(getCurrentMonth());
        setSingleMonth('');
        setToMonth('');
      }
      setPage(0);
    }
  };

  const handleFromMonthChange = (event) => {
    setFromMonth(event.target.value);
    setPage(0);
  };

  const handleToMonthChange = (event) => {
    setToMonth(event.target.value);
    setPage(0);
  };

  const handleSingleMonthChange = (event) => {
    setSingleMonth(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSingleMonth(getCurrentMonth());
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('single');
    setPage(0);
    setSearchTerm('');
  };

  const handleViewDetails = (districtName) => {
    // Find district ID from data
    const district = transformApiDataToDistricts.find(d => d.district === districtName);
    if (district) {
      navigate(`/kerala_cluster_report/taluk_cluster_report/${district.id}`, {
        state: { 
          districtId: district.id,
          districtName: districtName,
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
    } else {
      navigate(`/kerala_cluster_report/taluk_cluster_report/${districtName.toLowerCase()}`, {
        state: { 
          districtName,
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
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [landType, fromMonth, toMonth, singleMonth, filterType]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          <Typography sx={{ mt: 2 }}>Loading dashboard data...</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AssessmentIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
<<<<<<< HEAD:src/pages/functional-components/earas/Report/KeralaReportList.jsx
                Cluster Report
=======
                Cluster Formation Progress Report
>>>>>>> a22e88c9546b017638c11df9b01a746c7e03b955:src/pages/functional-components/earas/Report/clusterReport/KeralaClusterReportList.jsx
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

      {/* Filters */}
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

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              </Box>

              {filterType === 'range' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select value={fromMonth} label="From Month" onChange={handleFromMonthChange}>
                      <MenuItem value="">None</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={handleToMonthChange}>
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
                    onChange={handleSingleMonthChange}
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
            border: `1px solid ${alpha('#04255e', 0.15)}`,
            borderRadius: 3,
            p: 2,
            pt: 3,
            bgcolor: '#fff'
          }}
        >
          <Chip
            label="State Report Summary"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
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
                value={stats.all}
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

      {/* Main Table */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3
          }}
        >
          <Chip
            label="District Report Summary"
            color="primary"
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

          <MainCard
            title="District-wise Status"
            secondary={
              <TextField
                placeholder="Search district..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end">
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
                    {['District', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx} align={idx === 0 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
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
                        sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                            <Typography fontWeight={500}>{row.district}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.total} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                        </TableCell>
                        <TableCell align="center">
                          {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                        </TableCell>
                        <TableCell align="center">
                          {row.ongoing > 0 ? <Chip label={row.ongoing} size="small" color="primary" variant="outlined" /> : row.ongoing}
                        </TableCell>
                        <TableCell align="center">
                          {row.notStarted > 0 ? <Chip label={row.notStarted} size="small" variant="outlined" /> : row.notStarted}
                        </TableCell>
                        <TableCell align="center">
                          {row.underReview > 0 ? <Chip label={row.underReview} size="small" color="warning" variant="outlined" /> : row.underReview}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDetails(row.district)}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No districts found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredData.length > 0 && !loading && (
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default KeralaReportList;
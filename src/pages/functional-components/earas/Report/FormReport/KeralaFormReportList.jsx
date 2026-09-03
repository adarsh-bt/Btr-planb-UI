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
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

function KeralaFormReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month to number mapping
  const monthToNumber = useMemo(() => ({
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  }), []);

  // Get current month name
  const getCurrentMonth = () => {
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };
  const BASE_URL = mainapi.BASE_URL;
  // State for filters - initialized to requirement specifications
  const [seasonTab, setSeasonTab] = useState('ALL'); // Initially 'ALL'
  const [filterType, setFilterType] = useState('single');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState(getCurrentMonth()); // Initially current month
  const [selectedSeason, setSelectedSeason] = useState('');
  
  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Season to ID mapping
  const seasonToId = {
    'Winter': 1,
    'Summer': 2,
    'Autumn': 3
  };

  // Fetch data from API
  // Fetch data from API
  const fetchDistrictData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine correct start and end month indices based on selection rules
      let startMonthVal = 1;
      let endMonthVal = 12;

      if (filterType === 'single') {
        if (singleMonth) {
          startMonthVal = monthToNumber[singleMonth];
          endMonthVal = monthToNumber[singleMonth];
        }
      } else {
        if (fromMonth) startMonthVal = monthToNumber[fromMonth];
        if (toMonth) endMonthVal = monthToNumber[toMonth];
      }

      // Build precise API request body context
      const requestBody = {
        agriYear: AuthService.agriyear() || "2025-2026",
        seasonId: selectedSeason ? seasonToId[selectedSeason] : 3, // Defaults to 3 (Autumn) if none specified
        startMonth: startMonthVal,
        endMonth: endMonthVal,
        landType: seasonTab // Maps directly to 'ALL', 'WET', or 'DRY'
      };

      console.log('Fetching data with payload:', requestBody);

      // 1. Retrieve your authentication token safely
      // Note: Modify this based on how your AuthService exposes the token (e.g., AuthService.getToken())
      const token = AuthService.getToken ? AuthService.getToken() : localStorage.getItem('token'); 

      if (!token) {
        throw new Error('Authentication session token missing. Please log in again.');
      }

      // 2. Execute request passing the Authorization header
      const response = await axios.post(
        `${BASE_URL}/earas-form1-entry/form1/district-wise-status-summary`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Dynamically appends your Postman bearer token configuration
          }
        }
      );

      if (response.data && response.data.payload) {
        setApiData(response.data.payload);
      } else {
        setError('Invalid response format received from server');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      // Fallback fallback verification for detailed error capture
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch district data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data cleanly whenever operational filters transform
  useEffect(() => {
    fetchDistrictData();
  }, [fromMonth, toMonth, singleMonth, seasonTab, filterType, selectedSeason]);

  // Map backend structure safely into UI schema
  const districtData = useMemo(() => {
    if (!apiData || !apiData.formStatusSummaryResponseList) {
      return [];
    }

    return apiData.formStatusSummaryResponseList.map(district => ({
      id: district.districtId,
      district: district.districtName,
      total: (district.completedCount || 0) + (district.ongoingCount || 0) + (district.underReviewCount || 0) + (district.notStartedCount || 0),
      completed: district.completedCount || 0,
      ongoing: district.ongoingCount || 0,
      notStarted: district.notStartedCount || 0,
      underReview: district.underReviewCount || 0
    }));
  }, [apiData]);

  // Aggregate stats payload
  const stats = useMemo(() => ({
    all: apiData?.totalClusterCount || 0,
    completed: apiData?.totalCompletedCount || 0,
    ongoing: apiData?.totalOngoingCount || 0,
    notStarted: apiData?.totalNotStartedCount || 0,
    underReview: apiData?.totalUnderReviewCount || 0
  }), [apiData]);

  // FIXED: Resolved search box reference crash (`searchToken` -> `searchTerm`)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return districtData;
    return districtData.filter(row => 
      row.district.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [districtData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

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
    setSingleMonth(getCurrentMonth());
    setSeasonTab('ALL');
    setFilterType('single');
    setSelectedSeason('');
    setPage(0);
  };

  const handleViewDetails = (districtId, districtName) => {
    navigate(`/kerala_form_report/taluk_form_report/${districtName.toLowerCase()}`, {
      state: { 
        districtId: districtId,
        fromMonth, 
        toMonth, 
        seasonTab, 
        filterType, 
        singleMonth, 
        selectedSeason 
      }
    });
  };

  const StatCard = ({ label, value, color, bgColor, icon, subtext }) => (
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
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>
              {label}
              {subtext && (
                <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                  | {subtext}
                </span>
              )}
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '60vh' }}>
        <Grid item xs={12} textAlign="center">
          <Typography color="error" variant="h6">Error: {error}</Typography>
          <Button variant="contained" onClick={fetchDistrictData} sx={{ mt: 2 }}>
            Retry Connection
          </Button>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      {/* Header View */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AssessmentIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Cluster Enumeration Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Land`}
                {selectedSeason && ` • ${selectedSeason} Season`}
                {loading && ' • Refreshing...'}
              </Typography>
            </Box>
          </Stack>
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Reset Filters
          </Button>
        </Stack>
      </Grid>

      {/* Filter Control Section */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
              <Tabs 
                value={seasonTab} 
                onChange={(e, newValue) => { setSeasonTab(newValue); setPage(0); }}
                sx={{ minHeight: 40 }}
              >
                <Tab label="ALL" value="ALL" />
                <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
                <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
              </Tabs>

              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setFilterType(newValue);
                    setFromMonth('');
                    setToMonth('');
                    setSingleMonth(getCurrentMonth());
                    setPage(0);
                  }
                }}
                size="small"
              >
                <ToggleButton value="range">
                  <ViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Range
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
                      <MenuItem value="">None (Jan)</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={(e) => { setToMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None (Dec)</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select 
                    value={singleMonth} 
                    label="Select Month" 
                    onChange={(e) => { setSingleMonth(e.target.value); setPage(0); }}
                  >
                    {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Season</InputLabel>
                <Select
                  value={selectedSeason}
                  label="Season"
                  onChange={(e) => { setSelectedSeason(e.target.value); setPage(0); }}
                >
                  <MenuItem value="">Default (Autumn)</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Autumn">Autumn</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* Dashboard Matrix Cards */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', border: `1px solid ${alpha('#04255e', 0.15)}`, borderRadius: 3, p: 2, pt: 3, bgcolor: '#fff' }}>
          <Chip label="State Summary" color="primary" size="small" sx={{ position: 'absolute', top: -12, left: 20, fontWeight: 600, bgcolor: '#04255e', px: 1 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Total Clusters" value={stats.all} color="#1565c0" bgColor={alpha('#1565c0', 0.08)} icon={<AssessmentIcon sx={{ color: '#1565c0', opacity: 0.7 }} />} /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Completed" value={stats.completed} color="#2e7d32" bgColor={alpha('#2e7d32', 0.08)} icon={<CheckCircleIcon sx={{ color: '#2e7d32', opacity: 0.7 }} />} /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Ongoing" value={stats.ongoing} color="#ed6c02" bgColor={alpha('#ed6c02', 0.08)} icon={<PendingIcon sx={{ color: '#ed6c02', opacity: 0.7 }} />} /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Not Started" value={stats.notStarted} color="#757575" bgColor={alpha('#757575', 0.08)} icon={<ScheduleIcon sx={{ color: '#757575', opacity: 0.7 }} />} /></Grid>
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Under Review" value={stats.underReview} color="#b76e00" bgColor={alpha('#b76e00', 0.08)} icon={<RateReviewIcon sx={{ color: '#b76e00', opacity: 0.7 }} />} /></Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Tabular Data View */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
          <Chip label="District Status Table" color="primary" size="small" sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', px: 1 }} />
          <MainCard 
            title="District-wise Summary" 
            secondary={
              <TextField
                placeholder="Search district..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                sx={{ width: 230 }}
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
                        <CircularProgress size={32} sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Fetching up-to-date data...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                            <Typography fontWeight={500}>{row.district}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.total} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
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
                              onClick={() => handleViewDetails(row.id, row.district)}
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
                        <Typography color="text.secondary">No matching districts found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {!loading && filteredData.length > 0 && (
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

export default KeralaFormReportList;
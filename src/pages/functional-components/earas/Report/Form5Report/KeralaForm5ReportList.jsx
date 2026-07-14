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
import CancelIcon from '@mui/icons-material/Cancel';
import HubIcon from '@mui/icons-material/Hub';
import GrassIcon from '@mui/icons-material/Grass';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
// API base URL - adjust based on your environment
// const API_BASE_URL = 'http://localhost:9114/earas-form1-entry';
const BASE_URL = mainapi.EARAS_FORM1_API; // TODO: point this to your earas-form1-entry service base URL

// ============================================================
// DUMMY DATA - remove this block and set USE_DUMMY_DATA = false
// once the backend is ready
// ============================================================
const USE_DUMMY_DATA = true;

const DUMMY_API_RESPONSE = {
  totalCCECrops: 275,
  cropList: ['Paddy', 'Coconut', 'Banana', 'Tapioca'],
  allSubDetails: {
    Thiruvananthapuram: {
      id: 1,
      allowtedCce: 120,
      selectedCce: 95,
      completed: 40,
      ongoing: 25,
      notAvailable: 5,
      notStarted: 20,
      underReview: 5
    },
    Kollam: {
      id: 2,
      allowtedCce: 155,
      selectedCce: 110,
      completed: 60,
      ongoing: 20,
      notAvailable: 8,
      notStarted: 15,
      underReview: 7
    }
  }
};
// ============================================================

/* ─────────────── agricultural year months ─────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Builds the month list for the active agricultural year (July → June).
// e.g. '2025-2026' → July 2025 ... December 2025, January 2026 ... June 2026
// Each entry: { label: 'July 2025', value: '2025-07' } (value is API-ready YYYY-MM)
function getAgriYearMonths(agriYear) {
  const [startYear, endYear] = (agriYear || '2025-2026').split('-').map(Number);
  const months = [];
  for (let m = 6; m < 12; m++) {
    months.push({ label: `${MONTH_NAMES[m]} ${startYear}`, value: `${startYear}-${String(m + 1).padStart(2, '0')}` });
  }
  for (let m = 0; m < 6; m++) {
    months.push({ label: `${MONTH_NAMES[m]} ${endYear}`, value: `${endYear}-${String(m + 1).padStart(2, '0')}` });
  }
  return months;
}

// Current month as 'YYYY-MM' if it falls inside the agri year, else July (first month)
function getDefaultSingleMonth(agriYearMonths) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return agriYearMonths.some((m) => m.value === current) ? current : agriYearMonths[0]?.value || '';
}

function KeralaForm5ReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states - single filter: Crop Name
  const [cropName, setCropName] = useState('ALL');
  const [cropOptions, setCropOptions] = useState([]);

  // Agricultural year from AuthService (e.g. '2025-2026')
  const agriculturalYear = AuthService.agriyear() || '2025-2026';
  const agriYearMonths = getAgriYearMonths(agriculturalYear);
  const monthLabel = (value) => agriYearMonths.find((m) => m.value === value)?.label || '';

  // Month filter states (values are API-ready 'YYYY-MM')
  const [filterType, setFilterType] = useState('single');
  const [singleMonth, setSingleMonth] = useState(getDefaultSingleMonth(agriYearMonths));
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    // ---- DUMMY DATA MODE (remove after backend integration) ----
    if (USE_DUMMY_DATA) {
      setTimeout(() => {
        setApiData(DUMMY_API_RESPONSE);
        if (cropName === 'ALL' && Array.isArray(DUMMY_API_RESPONSE.cropList)) {
          setCropOptions(DUMMY_API_RESPONSE.cropList);
        }
        setLoading(false);
      }, 400); // small delay to mimic network
      return;
    }
    // ------------------------------------------------------------

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token missing');
      }

      // TODO: confirm the state-level (all districts) CCE summary endpoint with backend
      let url = `${BASE_URL}/earas-form1-entry/cce-crop-details/cce-summary/AllDistricts/${agriculturalYear}`;
      const params = new URLSearchParams();

      // Add cropName filter (skip when ALL)
      if (cropName && cropName !== 'ALL') {
        params.append('cropName', cropName);
      }

      // Add month filters (values already in YYYY-MM)
      if (filterType === 'single' && singleMonth) {
        params.append('startMonth', singleMonth);
        params.append('endMonth', singleMonth);
      } else if (filterType === 'range') {
        if (fromMonth) params.append('startMonth', fromMonth);
        if (toMonth) params.append('endMonth', toMonth);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log('Fetching data from:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setApiData(response.data);

        // Build the crop dropdown options from the API (only refresh on unfiltered load
        // so the list doesn't shrink to the currently selected crop)
        if (cropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
    } catch (err) {
      console.error('Error fetching Form 5 dashboard data:', err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Optionally redirect to login page
        // navigate('/login');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this data.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check your filters.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform API data to district rows
  // Expected shape (mirrors cluster report): apiData.allSubDetails = {
  //   "Thiruvananthapuram": { id, allowtedCce, selectedCce, completed, ongoing, notAvailable, notStarted, underReview },
  //   ...
  // }
  const transformApiDataToDistricts = useMemo(() => {
    if (!apiData || !apiData.allSubDetails) {
      return [];
    }

    return Object.entries(apiData.allSubDetails).map(([districtName, details]) => ({
      id: details.id,
      district: districtName,
      allowtedCce: details.allowtedCce || 0,
      selectedCce: details.selectedCce || 0,
      completed: details.completed || 0,
      ongoing: details.ongoing || 0,
      notAvailable: details.notAvailable || 0,
      notStarted: details.notStarted || 0,
      underReview: details.underReview || 0
    }));
  }, [apiData]);

  // State-level stats calculation
  const stats = useMemo(
    () => ({
      allowtedCce: transformApiDataToDistricts.reduce((sum, row) => sum + row.allowtedCce, 0),
      selectedCce: transformApiDataToDistricts.reduce((sum, row) => sum + row.selectedCce, 0),
      completed: transformApiDataToDistricts.reduce((sum, row) => sum + row.completed, 0),
      ongoing: transformApiDataToDistricts.reduce((sum, row) => sum + row.ongoing, 0),
      notAvailable: transformApiDataToDistricts.reduce((sum, row) => sum + row.notAvailable, 0),
      notStarted: transformApiDataToDistricts.reduce((sum, row) => sum + row.notStarted, 0),
      underReview: transformApiDataToDistricts.reduce((sum, row) => sum + row.underReview, 0)
    }),
    [transformApiDataToDistricts]
  );

  // Filter data based on district search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return transformApiDataToDistricts;
    return transformApiDataToDistricts.filter((row) => row.district.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [transformApiDataToDistricts, searchTerm]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handle filter changes
  const handleCropNameChange = (event) => {
    setCropName(event.target.value);
    setPage(0);
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue === null) return;
    setFilterType(newValue);
    if (newValue === 'single') {
      setSingleMonth(getDefaultSingleMonth(agriYearMonths));
      setFromMonth('');
      setToMonth('');
    } else {
      // range: default from July (first month of the agri year)
      setFromMonth(agriYearMonths[0]?.value || '');
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleClearFilters = () => {
    setCropName('ALL');
    setFilterType('single');
    setSingleMonth(getDefaultSingleMonth(agriYearMonths));
    setFromMonth('');
    setToMonth('');
    setPage(0);
    setSearchTerm('');
  };

  const handleViewDetails = (districtName) => {
    // Find district ID from data
    const district = transformApiDataToDistricts.find((d) => d.district === districtName);
    if (district) {
      navigate(`/kerala_form5_report/taluk_form5_report/${district.id}`, {
        state: {
          districtId: district.id,
          districtName: districtName,
          cropName: cropName !== 'ALL' ? cropName : null,
          agriculturalYear,
          filterType,
          singleMonth,
          fromMonth,
          toMonth,
          startMonth: filterType === 'single' ? singleMonth : fromMonth,
          endMonth: filterType === 'single' ? singleMonth : toMonth
        }
      });
    } else {
      navigate(`/kerala_form5_report/taluk_form5_report/${districtName.toLowerCase()}`, {
        state: {
          districtName,
          cropName: cropName !== 'ALL' ? cropName : null,
          agriculturalYear,
          filterType,
          singleMonth,
          fromMonth,
          toMonth,
          startMonth: filterType === 'single' ? singleMonth : fromMonth,
          endMonth: filterType === 'single' ? singleMonth : toMonth
        }
      });
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropName, filterType, singleMonth, fromMonth, toMonth]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card
      sx={{
        bgcolor: bgColor,
        borderRadius: 3,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
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

  // Stat cards configuration
  const statCards = [
    {
      label: 'Allowted CCE',
      value: stats.allowtedCce,
      color: '#1565c0',
      icon: <HubIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />
    },
    {
      label: 'Selected CCE',
      value: stats.selectedCce,
      color: '#04255e',
      icon: <AssessmentIcon sx={{ fontSize: 32, color: '#04255e', opacity: 0.7 }} />
    },
    {
      label: 'Completed',
      value: stats.completed,
      color: '#2e7d32',
      icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} />
    },
    {
      label: 'Ongoing',
      value: stats.ongoing,
      color: '#ed6c02',
      icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} />
    },
    {
      label: 'Not Available',
      value: stats.notAvailable,
      color: '#c62828',
      icon: <CancelIcon sx={{ fontSize: 32, color: '#c62828', opacity: 0.7 }} />
    },
    {
      label: 'Not Started',
      value: stats.notStarted,
      color: '#757575',
      icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} />
    },
    {
      label: 'Under Review',
      value: stats.underReview,
      color: '#b76e00',
      icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} />
    }
  ];

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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AssessmentIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Form 5 - CCE Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`Agricultural Year: ${agriculturalYear}`}
                {filterType === 'single' && singleMonth && ` • ${monthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${monthLabel(fromMonth)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${monthLabel(toMonth)}`}
                {cropName !== 'ALL' && ` • Crop: ${cropName}`}
                {apiData && ` • Total CCE Crops: ${apiData.totalCCECrops || 0}`}
              </Typography>
            </Box>
          </Stack>
          {(cropName !== 'ALL' || fromMonth || toMonth || singleMonth) && (
            <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />} size="small" sx={{ borderRadius: 2 }}>
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

      {/* Filters - single filter: Crop Name */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <GrassIcon sx={{ color: '#2e7d32' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Filters
              </Typography>
            </Stack>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Crop Name</InputLabel>
              <Select value={cropName} label="Crop Name" onChange={handleCropNameChange}>
                <MenuItem value="ALL">ALL</MenuItem>
                {cropOptions.map((crop) => (
                  <MenuItem key={crop} value={crop}>
                    {crop}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterTypeChange} size="small">
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
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>From Month</InputLabel>
                  <Select
                    value={fromMonth}
                    label="From Month"
                    onChange={(e) => {
                      setFromMonth(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {agriYearMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>To Month</InputLabel>
                  <Select
                    value={toMonth}
                    label="To Month"
                    onChange={(e) => {
                      setToMonth(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {agriYearMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={singleMonth}
                  label="Select Month"
                  onChange={(e) => {
                    setSingleMonth(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {agriYearMonths.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
            {statCards.map((card) => (
              <Grid item xs={12} sm={6} md={true} key={card.label}>
                <StatCard
                  label={card.label}
                  value={card.value}
                  color={card.color}
                  bgColor={alpha(card.color, 0.08)}
                  icon={card.icon}
                />
              </Grid>
            ))}
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
            title="District-wise CCE Status"
            secondary={
              <TextField
                placeholder="Search district..."
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
                    {[
                      'District',
                      'Allowted CCE',
                      'Selected CCE',
                      'Completed',
                      'Ongoing',
                      'Not Available',
                      'Not Started',
                      'Under Review',
                      'Actions'
                    ].map((label, idx) => (
                      <TableCell
                        key={idx}
                        align={idx === 0 ? 'left' : 'center'}
                        sx={{ color: 'white', fontWeight: 600, py: 1.5, whiteSpace: 'nowrap' }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
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
                          <Chip label={row.allowtedCce} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                        </TableCell>
                        <TableCell align="center">
                          {row.selectedCce > 0 ? (
                            <Chip
                              label={row.selectedCce}
                              size="small"
                              variant="outlined"
                              sx={{ color: '#04255e', borderColor: alpha('#04255e', 0.4), fontWeight: 600 }}
                            />
                          ) : (
                            row.selectedCce
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                        </TableCell>
                        <TableCell align="center">
                          {row.ongoing > 0 ? <Chip label={row.ongoing} size="small" color="primary" variant="outlined" /> : row.ongoing}
                        </TableCell>
                        <TableCell align="center">
                          {row.notAvailable > 0 ? (
                            <Chip label={row.notAvailable} size="small" color="error" variant="outlined" />
                          ) : (
                            row.notAvailable
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.notStarted > 0 ? <Chip label={row.notStarted} size="small" variant="outlined" /> : row.notStarted}
                        </TableCell>
                        <TableCell align="center">
                          {row.underReview > 0 ? (
                            <Chip label={row.underReview} size="small" color="warning" variant="outlined" />
                          ) : (
                            row.underReview
                          )}
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
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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

export default KeralaForm5ReportList;
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import api from 'api/api';
import AuthService from 'pages/authentication/services/authservice';


// API base URL - adjust based on your environment
// const API_BASE_URL = 'http://localhost:8082/btr-service';
const BASE_URL = mainapi.BTR_API;

function KeralaClusterReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [seasonTab, setSeasonTab] = useState('ALL');
  const [landType, setLandType] = useState(null); // 'WET' or 'DRY' or null for ALL
  const [filterType, setFilterType] = useState('single');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState('');

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [agriculturalYear, setAgriculturalYear] = useState(null);

  // Agricultural year months (July to June)
  const agriYearMonths = [
    'July', 'August', 'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April', 'May', 'June'
  ];

  // Get current agricultural year from AuthService
  const getAgriculturalYear = () => {
    try {
      const agriYear = AuthService.agriyear();
      if (agriYear) {
        // Parse the agricultural year string like "2025-2026"
        const years = agriYear.split('-');
        if (years.length === 2) {
          const startYear = parseInt(years[0]);
          const endYear = parseInt(years[1]);
          return { startYear, endYear, display: agriYear };
        }
      }
    } catch (error) {
      console.error('Error getting agricultural year:', error);
    }

    // Fallback: calculate current agricultural year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed

    // If month is July (6) or later, agricultural year starts this year
    if (currentMonth >= 6) {
      return { startYear: currentYear, endYear: currentYear + 1, display: `${currentYear}-${currentYear + 1}` };
    } else {
      return { startYear: currentYear - 1, endYear: currentYear, display: `${currentYear - 1}-${currentYear}` };
    }
  };

  // Get current month in agricultural year context
  const getCurrentAgriMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-indexed (0 = January)
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[currentMonth];
  };

  // Month name to number mapping for API (with year context)
  const getMonthYearForApi = (monthName) => {
    if (!monthName || !agriculturalYear) return null;

    const monthIndex = agriYearMonths.indexOf(monthName);
    if (monthIndex === -1) return null;

    // Months July (0) to December (5) belong to startYear
    // Months January (6) to June (11) belong to endYear
    let year;
    if (monthIndex <= 5) {
      year = agriculturalYear.startYear;
    } else {
      year = agriculturalYear.endYear;
    }

    const monthNumber = monthIndex + 1; // 1-indexed for API
    const monthStr = String(monthNumber).padStart(2, '0');
    return `${year}-${monthStr}`;
  };

  // Helper function to get district statistics based on land type
  const getDistrictStats = (districtDetails) => {
    if (!districtDetails) {
      return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0, hasData: false };
    }

    // If land type is WET, use wet statistics
    if (landType === 'WET') {
      const stats = {
        completed: districtDetails.wetCompleted || 0,
        ongoing: districtDetails.wetOngoing || 0,
        notStarted: districtDetails.wetNotStarted || 0,
        underReview: districtDetails.wetUnderView || 0
      };
      return {
        ...stats,
        hasData: stats.completed > 0 || stats.ongoing > 0 || stats.notStarted > 0 || stats.underReview > 0
      };
    }
    // If land type is DRY, use dry statistics
    else if (landType === 'DRY') {
      const stats = {
        completed: districtDetails.dryCompleted || 0,
        ongoing: districtDetails.dryOngoing || 0,
        notStarted: districtDetails.dryNotStarted || 0,
        underReview: districtDetails.dryUnderView || 0
      };
      return {
        ...stats,
        hasData: stats.completed > 0 || stats.ongoing > 0 || stats.notStarted > 0 || stats.underReview > 0
      };
    }
    // If ALL, combine both wet and dry statistics
    else {
      const stats = {
        completed: (districtDetails.wetCompleted || 0) + (districtDetails.dryCompleted || 0),
        ongoing: (districtDetails.wetOngoing || 0) + (districtDetails.dryOngoing || 0),
        notStarted: (districtDetails.wetNotStarted || 0) + (districtDetails.dryNotStarted || 0),
        underReview: (districtDetails.wetUnderView || 0) + (districtDetails.dryUnderView || 0)
      };
      return {
        ...stats,
        hasData: stats.completed > 0 || stats.ongoing > 0 || stats.notStarted > 0 || stats.underReview > 0
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
        const formattedMonth = getMonthYearForApi(singleMonth);
        if (formattedMonth) {
          params.append('startMonth', formattedMonth);
          params.append('endMonth', formattedMonth);
        }
      } else if (filterType === 'range') {
        // For range filter, we need at least startMonth
        if (fromMonth) {
          const formattedFromMonth = getMonthYearForApi(fromMonth);
          if (formattedFromMonth) {
            params.append('startMonth', formattedFromMonth);
          }
        }

        if (toMonth) {
          const formattedToMonth = getMonthYearForApi(toMonth);
          if (formattedToMonth) {
            params.append('endMonth', formattedToMonth);
          }
        }
      }

      // If no valid date params, use current month as default
      if (!params.has('startMonth')) {
        const currentMonth = getCurrentAgriMonth();
        const formattedMonth = getMonthYearForApi(currentMonth);
        if (formattedMonth) {
          params.append('startMonth', formattedMonth);
          params.append('endMonth', formattedMonth);
        }
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log('Fetching data from:', url);
      console.log('Agricultural Year:', agriculturalYear);

      // Make request with authorization header
      const response = await api.get(url);
      console.log('Response data:', response.data);

      if (response.data) {
        setApiData(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
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

  // Transform API data to district data format with proper wet/dry handling and all master districts included
  const transformApiDataToDistricts = useMemo(() => {
    if (!apiData || !apiData.allSubDetails) {
      return [];
    }

    const subDetailsMap = apiData.allSubDetails || {};
    const normalizeName = (name) => (name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '') : '');

    if (districtsList && districtsList.length > 0) {
      return districtsList.map((dist) => {
        const distId = dist.distId || dist.id;
        const distName = dist.distNameEn || dist.districtName || dist.name;

        // Find matching entry in allSubDetails by distId or normalized district name
        const matchedKey = Object.keys(subDetailsMap).find((key) => {
          const details = subDetailsMap[key];
          return (
            (details && (details.id === distId || details.distId === distId)) ||
            normalizeName(key) === normalizeName(distName)
          );
        });

        if (matchedKey && subDetailsMap[matchedKey]) {
          const details = subDetailsMap[matchedKey];
          const stats = getDistrictStats(details);
          return {
            id: details.id || distId,
            district: distName || matchedKey,
            total: stats.completed + stats.ongoing + stats.notStarted + stats.underReview,
            completed: stats.completed,
            ongoing: stats.ongoing,
            notStarted: stats.notStarted,
            underReview: stats.underReview,
            hasData: stats.hasData
          };
        } else {
          return {
            id: distId,
            district: distName,
            total: 0,
            completed: 0,
            ongoing: 0,
            notStarted: 0,
            underReview: 0,
            hasData: false
          };
        }
      });
    }

    // Fallback if master districtsList is not loaded yet
    return Object.entries(subDetailsMap).map(([districtName, details]) => {
      const stats = getDistrictStats(details);
      return {
        id: details.id,
        district: districtName,
        total: stats.completed + stats.ongoing + stats.notStarted + stats.underReview,
        completed: stats.completed,
        ongoing: stats.ongoing,
        notStarted: stats.notStarted,
        underReview: stats.underReview,
        hasData: stats.hasData
      };
    });
  }, [apiData, districtsList, landType]);

  // Stats calculation
  const stats = useMemo(() => ({
    all: transformApiDataToDistricts.reduce((sum, row) => sum + row.total, 0),
    completed: transformApiDataToDistricts.reduce((sum, row) => sum + row.completed, 0),
    ongoing: transformApiDataToDistricts.reduce((sum, row) => sum + row.ongoing, 0),
    notStarted: transformApiDataToDistricts.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: transformApiDataToDistricts.reduce((sum, row) => sum + row.underReview, 0),
    districtsWithData: transformApiDataToDistricts.filter(row => row.hasData).length,
    districtsWithoutData: transformApiDataToDistricts.filter(row => !row.hasData).length
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
        // When switching to single month, set to current agricultural month
        setSingleMonth(getCurrentAgriMonth());
        setFromMonth('');
        setToMonth('');
      } else {
        // When switching to range, set fromMonth to July (start of agricultural year)
        setFromMonth('July');
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
    setSingleMonth(getCurrentAgriMonth());
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('single');
    setPage(0);
    setSearchTerm('');
  };

  const handleViewDetails = (districtName) => {
    // Find district ID from data
    const district = transformApiDataToDistricts.find(d => d.district === districtName);
    const startMonthParam = filterType === 'single' ? singleMonth : fromMonth;
    const endMonthParam = filterType === 'single' ? singleMonth : toMonth;

    if (district) {
      navigate(`/Report/kerala_cluster_report/district/taluk_cluster_report/${district.id}`, {
        state: {
          districtId: district.id,
          districtName: districtName,
          landType: landType,
          seasonTab: seasonTab,
          startMonth: startMonthParam ? getMonthYearForApi(startMonthParam) : null,
          endMonth: endMonthParam ? getMonthYearForApi(endMonthParam) : null,
          filterType,
          fromMonth,
          toMonth,
          singleMonth,
          agriculturalYear: agriculturalYear
        }
      });
    } else {
      navigate(`/Report/kerala_cluster_report/taluk_cluster_report/${districtName.toLowerCase()}`, {
        state: {
          districtName,
          landType: landType,
          seasonTab: seasonTab,
          startMonth: startMonthParam ? getMonthYearForApi(startMonthParam) : null,
          endMonth: endMonthParam ? getMonthYearForApi(endMonthParam) : null,
          filterType,
          fromMonth,
          toMonth,
          singleMonth,
          agriculturalYear: agriculturalYear
        }
      });
    }
  };

  // Initialize agricultural year and months
  useEffect(() => {
    const agriYear = getAgriculturalYear();
    setAgriculturalYear(agriYear);

    // Set initial month based on current date
    const currentAgriMonth = getCurrentAgriMonth();
    setSingleMonth(currentAgriMonth);

    // Store in localStorage for other components
    localStorage.setItem('agriculturalYear', JSON.stringify(agriYear));
  }, []);

  // Fetch master districts list on mount
  useEffect(() => {
    const fetchMasterDistricts = async () => {
      try {
        const response = await api.get(`${BASE_URL}/btr-service/btr-api/districts`);
        if (response.data && response.data.data) {
          setDistrictsList(response.data.data);
        } else if (Array.isArray(response.data)) {
          setDistrictsList(response.data);
        }
      } catch (err) {
        console.error('Error fetching master districts list:', err);
      }
    };

    fetchMasterDistricts();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (agriculturalYear) {
      fetchDashboardData();
    }
  }, [landType, fromMonth, toMonth, singleMonth, filterType, agriculturalYear]);

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
                Cluster Formation Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {agriculturalYear && `Agricultural Year: ${agriculturalYear.display}`}
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {apiData && ` • Total Clusters: ${apiData.totalCluster || 0}`}
                {stats.districtsWithoutData > 0 && ` • ${stats.districtsWithoutData} districts with no data`}
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

      {/* Info Banner for districts with no data */}
      {stats.districtsWithoutData > 0 && !loading && (
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 1.5,
              bgcolor: alpha('#ff9800', 0.08),
              borderRadius: 2,
              border: `1px solid ${alpha('#ff9800', 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <InfoOutlinedIcon sx={{ color: '#ff9800', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>{stats.districtsWithoutData}</strong> district{stats.districtsWithoutData > 1 ? 's' : ''} have no data available for the selected filters.
              {landType ? ` This may be because no ${landType.toLowerCase()} season clusters were formed in these districts.` : ''}
            </Typography>
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
                      {agriYearMonths.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={handleToMonthChange}>
                      <MenuItem value="">None</MenuItem>
                      {agriYearMonths.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
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
                    {agriYearMonths.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
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
                    {['#', 'District', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx} align={idx === 0 ? 'center' : idx === 1 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => {
                      const serialNumber = page * rowsPerPage + index + 1;
                      const hasNoData = !row.hasData && row.total === 0;

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: alpha('#04255e', 0.04) },
                            transition: '0.2s',
                            ...(hasNoData && {
                              bgcolor: alpha('#ff9800', 0.03),
                              '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                            })
                          }}
                        >
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              {serialNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOnIcon sx={{ fontSize: 18, color: hasNoData ? '#ff9800' : '#04255e', opacity: 0.7 }} />
                              <Typography fontWeight={hasNoData ? 400 : 500} color={hasNoData ? 'text.secondary' : 'text.primary'}>
                                {row.district}
                                {hasNoData && (
                                  <Chip
                                    label="No Data"
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: 18,
                                      fontSize: '0.6rem',
                                      bgcolor: alpha('#ff9800', 0.15),
                                      color: '#e65100',
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : (
                              <Chip label={row.total} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.completed > 0 ? (
                              <Chip label={row.completed} size="small" color="success" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.ongoing > 0 ? (
                              <Chip label={row.ongoing} size="small" color="primary" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.notStarted > 0 ? (
                              <Chip label={row.notStarted} size="small" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.underReview > 0 ? (
                              <Chip label={row.underReview} size="small" color="warning" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">0</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={hasNoData ? "No data available for this district" : "View Details"}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(row.district)}
                                sx={{
                                  color: hasNoData ? '#ff9800' : '#04255e',
                                  '&:hover': { bgcolor: alpha(hasNoData ? '#ff9800' : '#04255e', 0.1) },
                                  opacity: hasNoData ? 0.7 : 1
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
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
                rowsPerPageOptions={[5, 10, 15, 25, 50]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default KeralaClusterReportList;
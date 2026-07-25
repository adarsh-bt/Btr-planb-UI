import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import AuthService from 'pages/authentication/services/authservice';
import api from 'api/api';

/* ─────────────────────────── session persistence ─────────────────────────── */

const SESSION_KEY = 'talukFormReportState';

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function TalukFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName } = useParams();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month to number mapping
  const monthToNumber = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  // Season to ID mapping
  const seasonToId = {
    'Winter': 1,
    'Summer': 2,
    'Autumn': 3
  };

  // ID to Season mapping
  const idToSeason = {
    1: 'Winter',
    2: 'Summer',
    3: 'Autumn'
  };

  // Land type mapping
  const landTypeMapping = {
    'ALL': null,
    'WET': 'WET',
    'DRY': 'DRY'
  };

  // Get current month
  const getCurrentMonth = () => {
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };

  // Get current month number
  const getCurrentMonthNumber = () => {
    return new Date().getMonth() + 1;
  };

  /* ── merge location.state with saved sessionStorage state.
        location.state wins when present (fresh navigation); saved state
        is the fallback on refresh / breadcrumb return with no state. ── */
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── resolve district ID once, keep in a ref ──
        Priority:
        1. stateData.districtId        (normal drill-down OR direct access)
        2. stateData.districtOfficeId  (direct access from ReportMenuWrapper)  */
  const resolvedDistrictId = useRef(null);

  const resolveDistrictId = () => {
    if (stateData.districtId !== undefined && stateData.districtId !== null) {
      return stateData.districtId;
    }
    if (stateData.districtOfficeId !== undefined && stateData.districtOfficeId !== null) {
      return stateData.districtOfficeId;
    }
    return null;
  };

  if (resolvedDistrictId.current === null) {
    resolvedDistrictId.current = resolveDistrictId();
  }

  // Initialize filters from merged state or defaults
  const getInitialFilters = () => {
    return {
      districtId: resolvedDistrictId.current,
      filterType: stateData.filterType || 'single',
      fromMonth: stateData.fromMonth || '',
      toMonth: stateData.toMonth || '',
      singleMonth: stateData.singleMonth !== undefined && stateData.singleMonth !== ''
        ? stateData.singleMonth
        : getCurrentMonth(),
      seasonTab: stateData.seasonTab || 'ALL',
      selectedSeason: stateData.selectedSeason || ''
    };
  };

  const initialFilters = getInitialFilters();

  // Filter states with initial values
  const [districtId, setDistrictId] = useState(initialFilters.districtId);
  const [seasonTab, setSeasonTab] = useState(initialFilters.seasonTab);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);
  const [selectedSeason, setSelectedSeason] = useState(initialFilters.selectedSeason);

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ── display name: URL param (normal navigation) → state (direct access) → fallback ── */
  const displayDistrictName =
  (districtName && districtName !== 'direct' &&
    districtName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) ||
  stateData.districtName ||
  'District';

  /* ── persist district context so refresh / breadcrumb back still works ── */
  useEffect(() => {
    if (resolvedDistrictId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId: resolvedDistrictId.current,
          districtOfficeId: resolvedDistrictId.current,
          districtName: stateData.districtName || displayDistrictName || '',
          isDirectAccess: stateData.isDirectAccess || false,
          filterType: stateData.filterType || 'single',
          fromMonth: stateData.fromMonth || '',
          toMonth: stateData.toMonth || '',
          singleMonth: stateData.singleMonth || getCurrentMonth(),
          seasonTab: stateData.seasonTab || 'ALL',
          selectedSeason: stateData.selectedSeason || ''
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data from API - Using resolved districtId
  const fetchTalukData = async () => {
    try {
      setLoading(true);
      setError(null);

      const districtIdValue = resolvedDistrictId.current || districtId;

      if (!districtIdValue) {
        setError('District ID is required. Please navigate from the district report page.');
        setLoading(false);
        return;
      }

      let requestBody = {
        agriYear: AuthService.agriyear() || "2025-2026",
        seasonId: selectedSeason ? seasonToId[selectedSeason] : 3,
        landType: landTypeMapping[seasonTab] || 'WET',
        distId: districtIdValue
      };

      // Handle different filter types
      if (filterType === 'single' && singleMonth) {
        requestBody.startMonth = monthToNumber[singleMonth];
        requestBody.endMonth = monthToNumber[singleMonth];
      } else if (filterType === 'range') {
        if (fromMonth && toMonth) {
          requestBody.startMonth = monthToNumber[fromMonth];
          requestBody.endMonth = monthToNumber[toMonth];
        } else if (fromMonth) {
          requestBody.startMonth = monthToNumber[fromMonth];
          requestBody.endMonth = 12;
        } else if (toMonth) {
          requestBody.startMonth = 1;
          requestBody.endMonth = monthToNumber[toMonth];
        } else {
          const currentMonthNum = getCurrentMonthNumber();
          requestBody.startMonth = currentMonthNum;
          requestBody.endMonth = currentMonthNum;
        }
      } else {
        const currentMonthNum = getCurrentMonthNumber();
        requestBody.startMonth = currentMonthNum;
        requestBody.endMonth = currentMonthNum;
      }

      console.log('Taluk API Request:', requestBody);

      const response = await api.post(
  '/earas-form1-entry/form1/taluk-wise-status-summary',
  requestBody,
  {
    headers: {
      'Content-Type': 'application/json',
    }
  }
);

      if (response.data && response.data.payload) {
        setApiData(response.data.payload);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching taluk data:', err);
      setError(err.message || 'Failed to fetch taluk data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchTalukData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMonth, toMonth, singleMonth, seasonTab, filterType, selectedSeason, districtId]);

  // Transform API data to match the table format
  const talukData = useMemo(() => {
    if (!apiData || !apiData.formStatusSummaryResponseList) {
      return [];
    }

    return apiData.formStatusSummaryResponseList.map(taluk => ({
      id: taluk.districtId, // The API maps the Taluk identifier onto this property name
      taluk: taluk.districtName, // The API maps the Taluk name string onto this property name
      total: (taluk.completedCount || 0) + (taluk.ongoingCount || 0) + (taluk.underReviewCount || 0) + (taluk.notStartedCount || 0),
      completed: taluk.completedCount || 0,
      ongoing: taluk.ongoingCount || 0,
      notStarted: taluk.notStartedCount || 0,
      underReview: taluk.underReviewCount || 0
    }));
  }, [apiData]);

  // Stats from API
  const stats = useMemo(() => ({
    total: apiData?.totalClusterCount || 0,
    completed: apiData?.totalCompletedCount || 0,
    ongoing: apiData?.totalOngoingCount || 0,
    notStarted: apiData?.totalNotStartedCount || 0,
    underReview: apiData?.totalUnderReviewCount || 0
  }), [apiData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return talukData;
    return talukData.filter(row =>
      row.taluk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [talukData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return searchFilteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

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
    const currentMonth = getCurrentMonth();
    setFromMonth('');
    setToMonth('');
    setSingleMonth(currentMonth);
    setSeasonTab('ALL');
    setFilterType('single');
    setSelectedSeason('');
    setPage(0);
  };

  const handleGoBack = () => {
    // Pass current filter state back to the state-level district page
    navigate('/FormReport/Kerala', {
      state: {
        fromMonth,
        toMonth,
        seasonTab,
        filterType,
        singleMonth,
        selectedSeason
      }
    });
  };

  const handleViewBlockDetails = (talukName, talukId) => {
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    // districtName param is undefined on the /direct route — fall back to the display name
    const safeDistrictName = districtName || displayDistrictName || 'district';
    const formattedDistrictName = safeDistrictName.toLowerCase().replace(/\s+/g, '-');

    navigate(`/kerala_form_report/zone_form_report/${formattedDistrictName}/${formattedTalukName}`, {
      state: {
        districtId: resolvedDistrictId.current || districtId,  // Passed down as distId to your API call
        districtName: displayDistrictName,
        talukId: talukId,        // CRITICAL: Pinpoints the selected Taluk context
        talukName: talukName,
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

  // Show loading state
  if (loading && !apiData) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '60vh' }}>
        <Grid item>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>Loading taluk data...</Typography>
        </Grid>
      </Grid>
    );
  }

  // Show error state
  if (error) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '60vh' }}>
        <Grid item>
          <Typography color="error" variant="h6">Error: {error}</Typography>
          <Button
            variant="contained"
            onClick={fetchTalukData}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Grid>
      </Grid>
    );
  }

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
                {displayDistrictName} - Taluk wise Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {selectedSeason && ` • ${selectedSeason}`}
                {loading && ' • Loading...'}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth || toMonth || singleMonth || seasonTab !== 'ALL' || selectedSeason) && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Reset to Current Month
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Filter Section */}
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
                    if (newValue === 'single') {
                      setSingleMonth(getCurrentMonth());
                      setFromMonth('');
                      setToMonth('');
                    } else {
                      setFromMonth('');
                      setToMonth('');
                      setSingleMonth('');
                    }
                    setPage(0);
                  }
                }}
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
                    <Select
                      value={fromMonth}
                      label="From Month"
                      onChange={(e) => {
                        setFromMonth(e.target.value);
                        setPage(0);
                        if (e.target.value && !toMonth) {
                          setToMonth(getCurrentMonth());
                        }
                      }}
                    >
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select
                      value={toMonth}
                      label="To Month"
                      onChange={(e) => {
                        setToMonth(e.target.value);
                        setPage(0);
                        if (e.target.value && !fromMonth) {
                          setFromMonth('January');
                        }
                      }}
                    >
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
                    {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Season</InputLabel>
                <Select
                  value={selectedSeason}
                  label="Season"
                  onChange={(e) => {
                    setSelectedSeason(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Seasons</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Autumn">Autumn</MenuItem>
                </Select>
              </FormControl>
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
            label={`${displayDistrictName} - District Report Summary`}
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
            title={`Taluks in ${displayDistrictName}`}
            secondary={
              <TextField
                placeholder="Search taluk..."
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#04255e' }}>
                        {['Taluk', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                          <TableCell key={idx} align={idx === 0 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
                            {label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row) => (
                          <TableRow
                            key={row.id}
                            hover
                            sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}
                          >
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                                <Typography fontWeight={500}>{row.taluk}</Typography>
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
                              <Tooltip title="View Block Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewBlockDetails(row.taluk, row.id)}
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
                            <Typography color="text.secondary">
                              {searchTerm ? `No taluks found matching "${searchTerm}"` : 'No data available for selected filters'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {searchFilteredData.length > 0 && (
                  <TablePagination
                    component="div"
                    count={searchFilteredData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                  />
                )}
              </>
            )}
          </MainCard>
        </Box>
      </Grid>

      {/* Back Button — hidden for direct-access (district approver) users,
          who have no state-level page to go back to */}
      {!stateData.isDirectAccess && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleGoBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: '#04255e',
                borderColor: '#04255e',
                borderRadius: 2,
                px: 4,
                '&:hover': {
                  borderColor: '#04255e',
                  bgcolor: alpha('#04255e', 0.04)
                }
              }}
            >
              Back to Kerala Report
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default TalukFormReport;
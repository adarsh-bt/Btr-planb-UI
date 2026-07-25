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

// Builds the "July <startYear> → June <startYear + 1>" agricultural-year
// month list used by the Single Month / From Month / To Month dropdowns.
// Each option's `value` is sent to the API in "MM-YYYY" form (e.g. "07-2025"),
// matching /form1-status/state?startMonth=07-2025&endMonth=09-2026&landType=WET.
function buildAgriMonthOptions() {
  const agriYear = AuthService.agriyear() || '2025-2026';
  const startYear = parseInt(agriYear.split('-')[0], 10) || new Date().getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const options = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (6 + i) % 12; // start from July (index 6)
    const year = startYear + Math.floor((6 + i) / 12);
    const mm = String(monthIndex + 1).padStart(2, '0');
    options.push({ label: `${monthNames[monthIndex]} ${year}`, value: `${mm}-${year}` });
  }
  return options;
}

// Per-district metrics come split into wet*/dry* fields (e.g. wetCompleted,
// dryCompleted). This picks the right one — or sums both — based on the
// active WET / DRY / ALL tab. `metric` is one of:
// 'Completed' | 'Ongoing' | 'NotStarted' | 'UnderReview' | 'ClusterArea'
function pickMetric(district, metric, seasonTab) {
  if (seasonTab === 'WET') return Number(district[`wet${metric}`]) || 0;
  if (seasonTab === 'DRY') return Number(district[`dry${metric}`]) || 0;
  return (Number(district[`wet${metric}`]) || 0) + (Number(district[`dry${metric}`]) || 0);
}

const formatArea = (num) =>
  Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function KeralaFormReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  const BASE_URL = mainapi.FORM_API;

  const MONTH_OPTIONS = buildAgriMonthOptions();
  const getMonthLabel = (value) => MONTH_OPTIONS.find((o) => o.value === value)?.label || value;

  // State for filters
  const [seasonTab, setSeasonTab] = useState('ALL'); // 'ALL' | 'WET' | 'DRY' → landType query param
  const [filterType, setFilterType] = useState('single');
  const [fromMonth, setFromMonth] = useState(() => MONTH_OPTIONS[0]?.value || '');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState(() => MONTH_OPTIONS[0]?.value || '');

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data from API
  const fetchDistrictData = async () => {
    try {
      setLoading(true);
      setError(null);

      let startMonthVal = MONTH_OPTIONS[0]?.value;
      let endMonthVal = MONTH_OPTIONS[MONTH_OPTIONS.length - 1]?.value;

      if (filterType === 'single') {
        if (singleMonth) {
          startMonthVal = singleMonth;
          endMonthVal = singleMonth;
        }
      } else {
        if (fromMonth) startMonthVal = fromMonth;
        if (toMonth) endMonthVal = toMonth;
      }

      const token = AuthService.getToken ? AuthService.getToken() : localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication session token missing. Please log in again.');
      }

      const params = new URLSearchParams({ startMonth: startMonthVal });
      if (endMonthVal) params.append('endMonth', endMonthVal);
      if (seasonTab && seasonTab !== 'ALL') params.append('landType', seasonTab);

      const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form1-status/state?${params.toString()}`;
      console.log('Fetching Form1 status data from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApiData(response.data || null);
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch district data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever operational filters change
  useEffect(() => {
    fetchDistrictData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMonth, toMonth, singleMonth, seasonTab, filterType]);

  // Map allSubDetails (keyed by district name) into UI rows, applying the
  // WET/DRY/ALL split via pickMetric. `area` is the cluster area behind the
  // Completed count for that district, shown as a pinned label in the table.
  const districtData = useMemo(() => {
    if (!apiData || !apiData.allSubDetails) return [];
    return Object.entries(apiData.allSubDetails).map(([districtName, d]) => {
      const completed = pickMetric(d, 'Completed', seasonTab);
      const ongoing = pickMetric(d, 'Ongoing', seasonTab);
      const notStarted = pickMetric(d, 'NotStarted', seasonTab);
      const underReview = pickMetric(d, 'UnderReview', seasonTab);
      const area = pickMetric(d, 'ClusterArea', seasonTab);
      return {
        id: d.id,
        district: districtName,
        total: completed + ongoing + notStarted + underReview,
        completed,
        ongoing,
        notStarted,
        underReview,
        area
      };
    });
  }, [apiData, seasonTab]);

  // Aggregate stats payload. Counts come straight from the API's top-level
  // totals (already filtered server-side by landType); completedArea is
  // summed client-side since the API only returns area at the district level.
  const stats = useMemo(
    () => ({
      all: apiData?.totalCluster || 0,
      completed: apiData?.completed || 0,
      ongoing: apiData?.ongoing || 0,
      notStarted: apiData?.notStarted || 0,
      underReview: apiData?.underView || 0,
      completedArea: districtData.reduce((sum, d) => sum + d.area, 0)
    }),
    [apiData, districtData]
  );

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
    setFromMonth(MONTH_OPTIONS[0]?.value || '');
    setToMonth('');
    setSingleMonth(MONTH_OPTIONS[0]?.value || '');
    setSeasonTab('ALL');
    setFilterType('single');
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
        singleMonth
      }
    });
  };

  const StatCard = ({ label, value, color, bgColor, icon, subtext, areaValue }) => (
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>
                {loading ? <CircularProgress size={24} /> : value}
              </Typography>
              {!loading && areaValue !== undefined && areaValue > 0 && (
                <Chip
                  label={`${formatArea(areaValue)} cents`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22, borderColor: alpha(color, 0.4), color }}
                />
              )}
            </Stack>
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
                {filterType === 'single' && singleMonth && ` • ${getMonthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && ` • ${getMonthLabel(fromMonth)}${toMonth ? ` - ${getMonthLabel(toMonth)}` : ''}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Land`}
                {loading && ' • Refreshing...'}
              </Typography>
            </Box>
          </Stack>
          {/* <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Reset Filters
          </Button> */}
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
                    setFromMonth(MONTH_OPTIONS[0]?.value || '');
                    setToMonth('');
                    setSingleMonth(MONTH_OPTIONS[0]?.value || '');
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
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select value={fromMonth} label="From Month" onChange={(e) => { setFromMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">{`None (${MONTH_OPTIONS[0]?.label})`}</MenuItem>
                      {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={(e) => { setToMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">{`None (${MONTH_OPTIONS[MONTH_OPTIONS.length - 1]?.label})`}</MenuItem>
                      {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select 
                    value={singleMonth} 
                    label="Select Month" 
                    onChange={(e) => { setSingleMonth(e.target.value); setPage(0); }}
                  >
                    {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
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
            <Grid item xs={12} sm={6} md={2.4}><StatCard label="Completed" value={stats.completed} color="#2e7d32" bgColor={alpha('#2e7d32', 0.08)} icon={<CheckCircleIcon sx={{ color: '#2e7d32', opacity: 0.7 }} />} areaValue={stats.completedArea} /></Grid>
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
                          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                            {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                            {row.area > 0 && (
                              <Chip
                                label={formatArea(row.area)}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem', height: 20, borderColor: alpha('#04255e', 0.3), color: '#04255e' }}
                              />
                            )}
                          </Stack>
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
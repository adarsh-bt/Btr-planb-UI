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
  CircularProgress,
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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';

const BASE_URL = mainapi.BTR_API;

const SESSION_KEY = 'talukReportState';

/* ─────────────────────────── helpers ─────────────────────────── */

function getCurrentMonthName() {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return names[new Date().getMonth()];
}

const monthToNumber = {
  January: '01', February: '02', March: '03', April: '04',
  May: '05', June: '06', July: '07', August: '08',
  September: '09', October: '10', November: '11', December: '12',
};

function formatMonthForApi(monthName) {
  if (!monthName) return null;
  const year = new Date().getFullYear();
  return `${year}-${monthToNumber[monthName]}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

/* ─────────────────────────── component ─────────────────────────── */

function TalukClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtId: routeDistrictId } = useParams();
  const location = useLocation();

  // Merge location.state with any saved sessionStorage state.
  // location.state wins when present (fresh navigation); saved state is
  // used as a fallback when returning via the breadcrumb with no state.
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── resolved district ID stored in a ref so it is always current ── */
  const resolvedDistrictId = useRef(null);

  const resolveDistrictId = () => {
    if (stateData.districtId) return stateData.districtId;
    if (stateData.districtOfficeId) return stateData.districtOfficeId;
    if (routeDistrictId && routeDistrictId !== 'direct' && !isNaN(routeDistrictId)) {
      return parseInt(routeDistrictId, 10);
    }
    return null;
  };

  if (resolvedDistrictId.current === null) {
    resolvedDistrictId.current = resolveDistrictId();
  }

  /* ── filter state ── */
  const [seasonTab, setSeasonTab] = useState(stateData.seasonTab || 'ALL');
  const [landType, setLandType]   = useState(stateData.landType  || null);
  const [filterType, setFilterType] = useState(stateData.filterType || 'single');
  const [fromMonth, setFromMonth]   = useState(stateData.fromMonth   || '');
  const [toMonth, setToMonth]       = useState(stateData.toMonth     || '');
  const [singleMonth, setSingleMonth] = useState(
    stateData.singleMonth || getCurrentMonthName()
  );

  /* ── ui state ── */
  const [apiData, setApiData]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ── persist district context to sessionStorage so breadcrumb back works ── */
  useEffect(() => {
    if (resolvedDistrictId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId:   resolvedDistrictId.current,
          districtName: stateData.districtName || '',
          landType:     stateData.landType     || null,
          seasonTab:    stateData.seasonTab    || 'ALL',
          filterType:   stateData.filterType   || 'single',
          fromMonth:    stateData.fromMonth    || '',
          toMonth:      stateData.toMonth      || '',
          singleMonth:  stateData.singleMonth  || getCurrentMonthName(),
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────── fetch ─────────────────────────── */

  const fetchTalukWiseData = async (overrides = {}) => {
    const districtIdValue = resolvedDistrictId.current;

    if (!districtIdValue) {
      setError('District ID is required. Please navigate from the district report page.');
      return;
    }

    setLoading(true);
    setError(null);

    const effectiveLandType    = overrides.landType    !== undefined ? overrides.landType    : landType;
    const effectiveSeasonTab   = overrides.seasonTab   !== undefined ? overrides.seasonTab   : seasonTab;
    const effectiveFilterType  = overrides.filterType  !== undefined ? overrides.filterType  : filterType;
    const effectiveSingleMonth = overrides.singleMonth !== undefined ? overrides.singleMonth : singleMonth;
    const effectiveFromMonth   = overrides.fromMonth   !== undefined ? overrides.fromMonth   : fromMonth;
    const effectiveToMonth     = overrides.toMonth     !== undefined ? overrides.toMonth     : toMonth;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      let url = `${BASE_URL}/btr-service/api/report/clusters/district/taluk-wise?districtId=${districtIdValue}`;

      if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
        url += `&landType=${effectiveLandType.toLowerCase()}`;
      }

      if (effectiveFilterType === 'single' && effectiveSingleMonth) {
        const fmt = formatMonthForApi(effectiveSingleMonth);
        if (fmt) url += `&startMonth=${fmt}&endMonth=${fmt}`;
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) url += `&startMonth=${formatMonthForApi(effectiveFromMonth)}`;
        if (effectiveToMonth)   url += `&endMonth=${formatMonthForApi(effectiveToMonth)}`;
      }

      console.log('Fetching taluk data from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) setApiData(response.data);
    } catch (err) {
      console.error('Error fetching taluk data:', err);
      if      (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('District not found.');
      else setError(err.response?.data?.message || 'Failed to fetch taluk data');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    fetchTalukWiseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTalukWiseData({ landType, seasonTab, filterType, singleMonth, fromMonth, toMonth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landType, filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const getTalukStats = (details) => {
    if (!details) return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 };
    if (landType === 'WET') return {
      completed: details.wetCompleted || 0, ongoing: details.wetOngoing || 0,
      notStarted: details.wetNotStarted || 0, underReview: details.wetUnderView || 0,
    };
    if (landType === 'DRY') return {
      completed: details.dryCompleted || 0, ongoing: details.dryOngoing || 0,
      notStarted: details.dryNotStarted || 0, underReview: details.dryUnderView || 0,
    };
    return {
      completed:   (details.wetCompleted  || 0) + (details.dryCompleted  || 0),
      ongoing:     (details.wetOngoing    || 0) + (details.dryOngoing    || 0),
      notStarted:  (details.wetNotStarted || 0) + (details.dryNotStarted || 0),
      underReview: (details.wetUnderView  || 0) + (details.dryUnderView  || 0),
    };
  };

  const talukData = useMemo(() => {
    if (!apiData?.allSubDetails) return [];
    return Object.entries(apiData.allSubDetails).map(([talukName, details]) => {
      const s = getTalukStats(details);
      return {
        id: details.id,
        taluk: talukName,
        total: s.completed + s.ongoing + s.notStarted + s.underReview,
        ...s,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiData, landType]);

  const stats = useMemo(() => ({
    total:       talukData.reduce((sum, r) => sum + r.total,       0),
    completed:   talukData.reduce((sum, r) => sum + r.completed,   0),
    ongoing:     talukData.reduce((sum, r) => sum + r.ongoing,     0),
    notStarted:  talukData.reduce((sum, r) => sum + r.notStarted,  0),
    underReview: talukData.reduce((sum, r) => sum + r.underReview, 0),
  }), [talukData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return talukData;
    return talukData.filter(r => r.taluk.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [talukData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return searchFilteredData.slice(start, start + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleSeasonTabChange = (_, newValue) => {
    if (newValue === null) return;
    const newLandType = newValue === 'ALL' ? null : newValue;
    setSeasonTab(newValue);
    setLandType(newLandType);
    setPage(0);
  };

  const handleFilterTypeChange = (_, newValue) => {
    if (newValue === null) return;
    setFilterType(newValue);
    if (newValue === 'single') {
      setSingleMonth(getCurrentMonthName());
      setFromMonth('');
      setToMonth('');
    } else {
      setFromMonth(getCurrentMonthName());
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setSingleMonth(getCurrentMonthName());
    setFromMonth('');
    setToMonth('');
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('single');
    setPage(0);
  };

  const handleViewTalukDetails = (talukName, talukId) => {
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const districtName = stateData.districtName || 'district';

    navigate(
      `/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${formattedTalukName}-${talukId}`,
      {
        state: {
          talukId,
          talukName,
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName,
          landType,
          seasonTab,
          startMonth: filterType === 'single' ? formatMonthForApi(singleMonth) : formatMonthForApi(fromMonth),
          endMonth:   filterType === 'single' ? formatMonthForApi(singleMonth) : formatMonthForApi(toMonth),
          filterType,
          fromMonth,
          toMonth,
          singleMonth,
        },
      }
    );
  };

  /* ─────────────────────────── sub-components ─────────────────────────── */

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card sx={{
      bgcolor: bgColor, borderRadius: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] },
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>{value}</Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>{label}</Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  /* ─────────────────────────── display name ─────────────────────────── */

  const displayDistrictName =
    stateData.districtName ||
    (apiData && Object.keys(apiData.allSubDetails || {})[0]?.replace(/[^a-zA-Z\s]/g, '')) ||
    'District';

  /* ─────────────────────────── render ─────────────────────────── */

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

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {displayDistrictName} – Taluk wise Cluster Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} – ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {apiData && ` • Total Clusters: ${apiData.totalCluster || 0}`}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth || toMonth || singleMonth || seasonTab !== 'ALL') && (
            <Button variant="outlined" onClick={handleClearFilters}
              startIcon={<ClearIcon />} size="small" sx={{ borderRadius: 2 }}>
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Error */}
      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Grid>
      )}

      {/* Filters */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <Tabs value={seasonTab} onChange={handleSeasonTabChange} sx={{ minHeight: 40 }}>
              <Tab label="ALL" value="ALL" />
              <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
              <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
            </Tabs>

            <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterTypeChange} size="small">
              <ToggleButton value="range"><ViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} />Month Range</ToggleButton>
              <ToggleButton value="single"><ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />Single Month</ToggleButton>
            </ToggleButtonGroup>

            {filterType === 'range' ? (
              <>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>From Month</InputLabel>
                  <Select value={fromMonth} label="From Month" onChange={e => { setFromMonth(e.target.value); setPage(0); }}>
                    <MenuItem value="">None</MenuItem>
                    {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">→</Typography>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>To Month</InputLabel>
                  <Select value={toMonth} label="To Month" onChange={e => { setToMonth(e.target.value); setPage(0); }}>
                    <MenuItem value="">None</MenuItem>
                    {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            ) : (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Month</InputLabel>
                <Select value={singleMonth} label="Select Month" onChange={e => { setSingleMonth(e.target.value); setPage(0); }}>
                  <MenuItem value="">None</MenuItem>
                  {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', border: `1px solid ${alpha('#04255e', 0.15)}`, borderRadius: 3, p: 2, pt: 3, bgcolor: '#fff' }}>
          <Chip label={`${displayDistrictName} – District Report Summary`} size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1 }} />
          <Grid container spacing={2}>
            {[
              { label: 'Total Clusters', value: stats.total,       color: '#1565c0', icon: <AssessmentIcon  sx={{ fontSize: 32, color: '#1565c0',  opacity: 0.7 }} /> },
              { label: 'Completed',      value: stats.completed,   color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32',  opacity: 0.7 }} /> },
              { label: 'Ongoing',        value: stats.ongoing,     color: '#ed6c02', icon: <PendingIcon     sx={{ fontSize: 32, color: '#ed6c02',  opacity: 0.7 }} /> },
              { label: 'Not Started',    value: stats.notStarted,  color: '#757575', icon: <ScheduleIcon   sx={{ fontSize: 32, color: '#757575',  opacity: 0.7 }} /> },
              { label: 'Under Review',   value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon  sx={{ fontSize: 32, color: '#b76e00',  opacity: 0.7 }} /> },
            ].map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={2.4} key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Taluk Table */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
          <Chip label="Taluk Report Summary" size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1, boxShadow: 2 }} />

          <MainCard
            title={`Taluks in ${displayDistrictName}`}
            secondary={
              <TextField placeholder="Search taluk..." size="small" value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(0); }} sx={{ width: 250 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }} edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            }
            sx={{ borderRadius: 3 }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {['Taluk', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx} align={idx === 0 ? 'left' : 'center'}
                        sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={40} /></TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map(row => (
                      <TableRow key={row.id} hover
                        sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                            <Typography fontWeight={500}>{row.taluk}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.total} size="small" variant="filled"
                            sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
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
                          <Tooltip title="View Zone Details">
                            <IconButton size="small" onClick={() => handleViewTalukDetails(row.taluk, row.id)}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}>
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

            {searchFilteredData.length > 0 && !loading && (
              <TablePagination component="div" count={searchFilteredData.length}
                page={page} onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }} />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default TalukClusterReport;
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
const BASE_URL = mainapi.EARAS_FORM1_API; // TODO: point this to your earas-form1-entry service base URL

const SESSION_KEY = 'talukForm5ReportState';

/* ─────────────────────────── dummy data ───────────────────────────
   Remove this block and set USE_DUMMY_DATA = false once the backend
   is ready.                                                          */

const USE_DUMMY_DATA = true;

const DUMMY_API_RESPONSE = {
  totalCCECrops: 120,
  cropList: ['Paddy', 'Coconut', 'Banana', 'Tapioca'],
  allSubDetails: {
    Neyyattinkara: {
      id: 101,
      allowtedCce: 45,
      selectedCce: 38,
      completed: 18,
      ongoing: 9,
      notAvailable: 2,
      notStarted: 7,
      underReview: 2
    },
    Chirayinkeezhu: {
      id: 102,
      allowtedCce: 35,
      selectedCce: 27,
      completed: 12,
      ongoing: 6,
      notAvailable: 1,
      notStarted: 6,
      underReview: 2
    }
  }
};

/* ─────────────────────────── helpers ─────────────────────────── */

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

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

/* ─────────────────────────── component ─────────────────────────── */

function TalukForm5Report() {
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

  /* ── filter state - Crop Name + months ── */
  const [cropName, setCropName] = useState(stateData.cropName || 'ALL');
  const [cropOptions, setCropOptions] = useState([]);

  // Agricultural year from AuthService (e.g. '2025-2026')
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';
  const agriYearMonths = getAgriYearMonths(agriculturalYear);
  const monthLabel = (value) => agriYearMonths.find((m) => m.value === value)?.label || '';

  // Month filter states (values are API-ready 'YYYY-MM'), carried over from the district page
  const [filterType, setFilterType] = useState(stateData.filterType || 'single');
  const [singleMonth, setSingleMonth] = useState(
    stateData.singleMonth !== undefined && stateData.filterType
      ? stateData.singleMonth
      : getDefaultSingleMonth(agriYearMonths)
  );
  const [fromMonth, setFromMonth] = useState(stateData.fromMonth || '');
  const [toMonth, setToMonth] = useState(stateData.toMonth || '');

  /* ── ui state ── */
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ── persist district context to sessionStorage so breadcrumb back works ── */
  useEffect(() => {
    if (resolvedDistrictId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName || '',
          cropName: stateData.cropName || 'ALL',
          agriculturalYear: stateData.agriculturalYear || '2025-2026',
          filterType: stateData.filterType || 'single',
          singleMonth: stateData.singleMonth || '',
          fromMonth: stateData.fromMonth || '',
          toMonth: stateData.toMonth || ''
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

    const effectiveCropName = overrides.cropName !== undefined ? overrides.cropName : cropName;
    const effectiveFilterType = overrides.filterType !== undefined ? overrides.filterType : filterType;
    const effectiveSingleMonth = overrides.singleMonth !== undefined ? overrides.singleMonth : singleMonth;
    const effectiveFromMonth = overrides.fromMonth !== undefined ? overrides.fromMonth : fromMonth;
    const effectiveToMonth = overrides.toMonth !== undefined ? overrides.toMonth : toMonth;

    /* ---- DUMMY DATA MODE (remove after backend integration) ---- */
    if (USE_DUMMY_DATA) {
      setTimeout(() => {
        setApiData(DUMMY_API_RESPONSE);
        if (effectiveCropName === 'ALL' && Array.isArray(DUMMY_API_RESPONSE.cropList)) {
          setCropOptions(DUMMY_API_RESPONSE.cropList);
        }
        setLoading(false);
      }, 400); // small delay to mimic network
      return;
    }
    /* ------------------------------------------------------------ */

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      // TODO: confirm the taluk-wise CCE summary endpoint with backend
      let url = `${BASE_URL}/earas-form1-entry/cce-crop-details/cce-summary/district/taluk-wise?districtId=${districtIdValue}&agriculturalYear=${agriculturalYear}`;

      if (effectiveCropName && effectiveCropName !== 'ALL') {
        url += `&cropName=${encodeURIComponent(effectiveCropName)}`;
      }

      // Add month filters (values already in YYYY-MM)
      if (effectiveFilterType === 'single' && effectiveSingleMonth) {
        url += `&startMonth=${effectiveSingleMonth}&endMonth=${effectiveSingleMonth}`;
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) url += `&startMonth=${effectiveFromMonth}`;
        if (effectiveToMonth) url += `&endMonth=${effectiveToMonth}`;
      }

      console.log('Fetching taluk Form 5 data from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setApiData(response.data);

        // Build the crop dropdown options from the API (only refresh on
        // unfiltered load so the list doesn't shrink to the selected crop)
        if (effectiveCropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
    } catch (err) {
      console.error('Error fetching taluk Form 5 data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('District not found.');
      else setError(err.response?.data?.message || 'Failed to fetch taluk data');
    } finally {
      if (!USE_DUMMY_DATA) setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    fetchTalukWiseData({ cropName, filterType, singleMonth, fromMonth, toMonth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropName, filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  // Expected shape (mirrors district-level report): apiData.allSubDetails = {
  //   "Neyyattinkara": { id, allowtedCce, selectedCce, completed, ongoing,
  //                      notAvailable, notStarted, underReview },
  //   ...
  // }
  const talukData = useMemo(() => {
    if (!apiData?.allSubDetails) return [];
    return Object.entries(apiData.allSubDetails).map(([talukName, details]) => ({
      id: details.id,
      taluk: talukName,
      allowtedCce: details.allowtedCce || 0,
      selectedCce: details.selectedCce || 0,
      completed: details.completed || 0,
      ongoing: details.ongoing || 0,
      notAvailable: details.notAvailable || 0,
      notStarted: details.notStarted || 0,
      underReview: details.underReview || 0
    }));
  }, [apiData]);

  const stats = useMemo(
    () => ({
      allowtedCce: talukData.reduce((sum, r) => sum + r.allowtedCce, 0),
      selectedCce: talukData.reduce((sum, r) => sum + r.selectedCce, 0),
      completed: talukData.reduce((sum, r) => sum + r.completed, 0),
      ongoing: talukData.reduce((sum, r) => sum + r.ongoing, 0),
      notAvailable: talukData.reduce((sum, r) => sum + r.notAvailable, 0),
      notStarted: talukData.reduce((sum, r) => sum + r.notStarted, 0),
      underReview: talukData.reduce((sum, r) => sum + r.underReview, 0)
    }),
    [talukData]
  );

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return talukData;
    return talukData.filter((r) => r.taluk.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [talukData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return searchFilteredData.slice(start, start + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

  /* ─────────────────────────── handlers ─────────────────────────── */

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

  const handleClearFilters = () => {
    setCropName('ALL');
    setFilterType('single');
    setSingleMonth(getDefaultSingleMonth(agriYearMonths));
    setFromMonth('');
    setToMonth('');
    setPage(0);
    setSearchTerm('');
  };

  const handleViewTalukDetails = (talukName, talukId) => {
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const districtName = stateData.districtName || 'district';

    navigate(
      `/kerala_form5_report/taluk_form5_report/zone_form5_report/${districtName}/${formattedTalukName}-${talukId}`,
      {
        state: {
          talukId,
          talukName,
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName,
          cropName: cropName !== 'ALL' ? cropName : null,
          agriculturalYear,
          filterType,
          singleMonth,
          fromMonth,
          toMonth,
          startMonth: filterType === 'single' ? singleMonth : fromMonth,
          endMonth: filterType === 'single' ? singleMonth : toMonth
        }
      }
    );
  };

  /* ─────────────────────────── sub-components ─────────────────────────── */

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card
      sx={{
        bgcolor: bgColor,
        borderRadius: 3,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
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

  /* ─────────────────────────── display name ─────────────────────────── */

  const displayDistrictName = stateData.districtName || 'District';

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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {displayDistrictName} – Taluk wise CCE Progress Report
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

      {/* Error */}
      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
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
            label={`${displayDistrictName} – District Report Summary`}
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
            {[
              { label: 'Allowted CCE', value: stats.allowtedCce, color: '#1565c0', icon: <HubIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
              { label: 'Selected CCE', value: stats.selectedCce, color: '#04255e', icon: <AssessmentIcon sx={{ fontSize: 32, color: '#04255e', opacity: 0.7 }} /> },
              { label: 'Completed', value: stats.completed, color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} /> },
              { label: 'Ongoing', value: stats.ongoing, color: '#ed6c02', icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} /> },
              { label: 'Not Available', value: stats.notAvailable, color: '#c62828', icon: <CancelIcon sx={{ fontSize: 32, color: '#c62828', opacity: 0.7 }} /> },
              { label: 'Not Started', value: stats.notStarted, color: '#757575', icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} /> },
              { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} /> }
            ].map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={true} key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Taluk Table */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
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
                        onClick={() => {
                          setSearchTerm('');
                          setPage(0);
                        }}
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
                            <Typography fontWeight={500}>{row.taluk}</Typography>
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
                          <Tooltip title="View Zone Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewTalukDetails(row.taluk, row.id)}
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
              <TablePagination
                component="div"
                count={searchFilteredData.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
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

export default TalukForm5Report;
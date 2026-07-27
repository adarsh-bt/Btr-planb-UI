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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import api from 'api/api';
import AuthService from 'pages/authentication/services/authservice';


const BASE_URL = mainapi.BTR_API;

const SESSION_KEY = 'talukReportState';

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/* ─────────────────────────── helpers ─────────────────────────── */

function getCurrentMonthName() {
  return MONTH_NAMES[new Date().getMonth()];
}

// Get agricultural year
function getAgriculturalYear() {
  try {
    const agriYear = AuthService.agriyear();
    if (agriYear) {
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
  const currentMonth = currentDate.getMonth();

  if (currentMonth >= 6) {
    return { startYear: currentYear, endYear: currentYear + 1, display: `${currentYear}-${currentYear + 1}` };
  } else {
    return { startYear: currentYear - 1, endYear: currentYear, display: `${currentYear - 1}-${currentYear}` };
  }
}

// Build agricultural year months with years
function buildAgriYearMonths(startYear, endYear) {
  const months = [];
  // July to December of start year
  for (let m = 6; m < 12; m++) {
    months.push({
      label: `${MONTH_NAMES[m]} ${startYear}`,
      value: `${startYear}-${String(m + 1).padStart(2, '0')}`
    });
  }
  // January to June of end year
  for (let m = 0; m < 6; m++) {
    months.push({
      label: `${MONTH_NAMES[m]} ${endYear}`,
      value: `${endYear}-${String(m + 1).padStart(2, '0')}`
    });
  }
  return months;
}

// Get default month (current month if in agricultural year, else first month)
function getDefaultMonth(months) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const exists = months.some(m => m.value === current);
  return exists ? current : (months[0]?.value || '');
}

// Get month label from value
function getMonthLabel(value, agriYearMonths) {
  if (!value) return '';
  const found = agriYearMonths.find(m => m.value === value);
  return found ? found.label : value;
}

// Format month for API - already in YYYY-MM format
function formatMonthForApi(monthValue) {
  if (!monthValue) return null;
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(monthValue)) {
    return monthValue;
  }
  return null;
}

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
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []);

  /* ── resolved district ID stored in a ref so it is always current ── */
  const resolvedDistrictId = useRef(null);
  const agriculturalYear = useRef(null);
  const agriYearMonths = useRef([]);

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

  // Initialize agricultural year
  if (agriculturalYear.current === null) {
    agriculturalYear.current = getAgriculturalYear();
    if (agriculturalYear.current) {
      agriYearMonths.current = buildAgriYearMonths(
        agriculturalYear.current.startYear,
        agriculturalYear.current.endYear
      );
    }
  }

  /* ── filter state ── */
  const [seasonTab, setSeasonTab] = useState(stateData.seasonTab || 'ALL');
  const [landType, setLandType] = useState(stateData.landType || null);
  const [filterType, setFilterType] = useState(stateData.filterType || 'single');
  const [fromMonth, setFromMonth] = useState(stateData.fromMonth || '');
  const [toMonth, setToMonth] = useState(stateData.toMonth || '');
  const [singleMonth, setSingleMonth] = useState(
    stateData.singleMonth || getDefaultMonth(agriYearMonths.current)
  );

  /* ── ui state ── */
  const [apiData, setApiData] = useState(null);
  const [taluksList, setTaluksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ── persist district context to sessionStorage ── */
  useEffect(() => {
    if (resolvedDistrictId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName || '',
          landType: stateData.landType || null,
          seasonTab: stateData.seasonTab || 'ALL',
          filterType: stateData.filterType || 'single',
          fromMonth: stateData.fromMonth || '',
          toMonth: stateData.toMonth || '',
          singleMonth: stateData.singleMonth || getDefaultMonth(agriYearMonths.current),
        })
      );
    }
  }, []);

  /* ─────────────────────────── fetch master taluks ─────────────────────────── */

  const fetchMasterTaluks = async (districtId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get(`${BASE_URL}/btr-service/btr-api/taluks?distId=${districtId}`);
      console.log('Master Taluks Response:', response.data);

      if (response.data && response.data.data) {
        setTaluksList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTaluksList(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          setTaluksList(possibleArrays[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching master taluks list:', err);
    }
  };

  /* ─────────────────────────── fetch taluk data ─────────────────────────── */

  const fetchTalukWiseData = async (overrides = {}) => {
    const districtIdValue = resolvedDistrictId.current;

    if (!districtIdValue) {
      setError('District ID is required. Please navigate from the district report page.');
      return;
    }

    setLoading(true);
    setError(null);

    const effectiveLandType = overrides.landType !== undefined ? overrides.landType : landType;
    const effectiveSeasonTab = overrides.seasonTab !== undefined ? overrides.seasonTab : seasonTab;
    const effectiveFilterType = overrides.filterType !== undefined ? overrides.filterType : filterType;
    const effectiveSingleMonth = overrides.singleMonth !== undefined ? overrides.singleMonth : singleMonth;
    const effectiveFromMonth = overrides.fromMonth !== undefined ? overrides.fromMonth : fromMonth;
    const effectiveToMonth = overrides.toMonth !== undefined ? overrides.toMonth : toMonth;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      let url = `${BASE_URL}/btr-service/api/report/clusters/district/taluk-wise?districtId=${districtIdValue}`;

      if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
        url += `&landType=${effectiveLandType.toLowerCase()}`;
      }

      if (effectiveFilterType === 'single') {
        if (effectiveSingleMonth) {
          url += `&startMonth=${effectiveSingleMonth}&endMonth=${effectiveSingleMonth}`;
        }
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) {
          url += `&startMonth=${effectiveFromMonth}`;
        }
        if (effectiveToMonth) {
          url += `&endMonth=${effectiveToMonth}`;
        }
      }

      // Safety fallback: ensure startMonth is ALWAYS present
      if (!url.includes('startMonth=')) {
        const fallbackFmt = getDefaultMonth(agriYearMonths.current);
        if (fallbackFmt) {
          url += `&startMonth=${fallbackFmt}&endMonth=${fallbackFmt}`;
        }
      }

      console.log('Fetching taluk data from:', url);

      const response = await api.get(url);
      console.log('Taluk API Response:', response.data);

      if (response.data) {
        setApiData(response.data);
      }
    } catch (err) {
      console.error('Error fetching taluk data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('District not found.');
      else setError(err.response?.data?.message || 'Failed to fetch taluk data');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    if (resolvedDistrictId.current) {
      fetchMasterTaluks(resolvedDistrictId.current);
      fetchTalukWiseData();
    }
  }, []);

  useEffect(() => {
    fetchTalukWiseData({ landType, seasonTab, filterType, singleMonth, fromMonth, toMonth });
  }, [landType, filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const getTalukStats = (details) => {
    if (!details) return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0, hasData: false };

    let stats;
    if (landType === 'WET') {
      stats = {
        completed: details.wetCompleted || 0,
        ongoing: details.wetOngoing || 0,
        notStarted: details.wetNotStarted || 0,
        underReview: details.wetUnderView || 0,
      };
    } else if (landType === 'DRY') {
      stats = {
        completed: details.dryCompleted || 0,
        ongoing: details.dryOngoing || 0,
        notStarted: details.dryNotStarted || 0,
        underReview: details.dryUnderView || 0,
      };
    } else {
      stats = {
        completed: (details.wetCompleted || 0) + (details.dryCompleted || 0),
        ongoing: (details.wetOngoing || 0) + (details.dryOngoing || 0),
        notStarted: (details.wetNotStarted || 0) + (details.dryNotStarted || 0),
        underReview: (details.wetUnderView || 0) + (details.dryUnderView || 0),
      };
    }

    return {
      ...stats,
      hasData: stats.completed > 0 || stats.ongoing > 0 || stats.notStarted > 0 || stats.underReview > 0
    };
  };

  const talukData = useMemo(() => {
    if (!apiData?.allSubDetails) {
      if (taluksList && taluksList.length > 0) {
        return taluksList.map(taluk => ({
          id: taluk.id || taluk.talukId,
          taluk: taluk.talukNameEn || taluk.name || taluk.talukName || `Taluk ${taluk.id}`,
          total: 0,
          completed: 0,
          ongoing: 0,
          notStarted: 0,
          underReview: 0,
          hasData: false
        }));
      }
      return [];
    }

    const subDetailsMap = apiData.allSubDetails || {};
    const normalizeName = (name) => (name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '') : '');

    if (taluksList && taluksList.length > 0) {
      return taluksList.map((taluk) => {
        const talukId = taluk.id || taluk.talukId;
        const talukName = taluk.talukNameEn || taluk.name || taluk.talukName || `Taluk ${talukId}`;

        const matchedKey = Object.keys(subDetailsMap).find((key) => {
          const details = subDetailsMap[key];
          return (
            (details && (details.id === talukId || details.talukId === talukId)) ||
            normalizeName(key) === normalizeName(talukName)
          );
        });

        if (matchedKey && subDetailsMap[matchedKey]) {
          const details = subDetailsMap[matchedKey];
          const stats = getTalukStats(details);
          return {
            id: talukId,
            taluk: talukName,
            total: stats.completed + stats.ongoing + stats.notStarted + stats.underReview,
            completed: stats.completed,
            ongoing: stats.ongoing,
            notStarted: stats.notStarted,
            underReview: stats.underReview,
            hasData: stats.hasData
          };
        } else {
          return {
            id: talukId,
            taluk: talukName,
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

    return Object.entries(subDetailsMap).map(([talukName, details]) => {
      const stats = getTalukStats(details);
      return {
        id: details.id || details.talukId,
        taluk: talukName,
        total: stats.completed + stats.ongoing + stats.notStarted + stats.underReview,
        completed: stats.completed,
        ongoing: stats.ongoing,
        notStarted: stats.notStarted,
        underReview: stats.underReview,
        hasData: stats.hasData
      };
    });
  }, [apiData, taluksList, landType]);

  const stats = useMemo(() => ({
    total: talukData.reduce((sum, r) => sum + r.total, 0),
    completed: talukData.reduce((sum, r) => sum + r.completed, 0),
    ongoing: talukData.reduce((sum, r) => sum + r.ongoing, 0),
    notStarted: talukData.reduce((sum, r) => sum + r.notStarted, 0),
    underReview: talukData.reduce((sum, r) => sum + r.underReview, 0),
    taluksWithData: talukData.filter(r => r.hasData).length,
    taluksWithoutData: talukData.filter(r => !r.hasData).length
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
      setSingleMonth(getDefaultMonth(agriYearMonths.current));
      setFromMonth('');
      setToMonth('');
    } else {
      setFromMonth(agriYearMonths.current[0]?.value || '');
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
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

  const handleClearFilters = () => {
    setSingleMonth(getDefaultMonth(agriYearMonths.current));
    setFromMonth('');
    setToMonth('');
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('single');
    setPage(0);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleViewTalukDetails = (talukName, talukId) => {
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const districtName = stateData.districtName || 'district';
    const startMonthParam = filterType === 'single' ? singleMonth : fromMonth;
    const endMonthParam = filterType === 'single' ? singleMonth : toMonth;

    navigate(
      `/Report/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${formattedTalukName}-${talukId}`,
      {
        state: {
          talukId,
          talukName,
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName,
          landType,
          seasonTab,
          startMonth: startMonthParam,
          endMonth: endMonthParam,
          filterType,
          fromMonth,
          toMonth,
          singleMonth,
          agriculturalYear: agriculturalYear.current
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

  if (loading && !apiData && taluksList.length === 0) {
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
                {agriculturalYear.current && `Agricultural Year: ${agriculturalYear.current.display}`}
                {filterType === 'single' && singleMonth && ` • ${getMonthLabel(singleMonth, agriYearMonths.current)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${getMonthLabel(fromMonth, agriYearMonths.current)} – ${getMonthLabel(toMonth, agriYearMonths.current)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${getMonthLabel(fromMonth, agriYearMonths.current)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${getMonthLabel(toMonth, agriYearMonths.current)}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {apiData && ` • Total Clusters: ${apiData.totalCluster || 0}`}
                {stats.taluksWithoutData > 0 && ` • ${stats.taluksWithoutData} taluks with no data`}
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

      {/* Info Banner for taluks with no data */}
      {stats.taluksWithoutData > 0 && !loading && (
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
              <strong>{stats.taluksWithoutData}</strong> taluk{stats.taluksWithoutData > 1 ? 's' : ''} have no data available for the selected filters.
              {landType ? ` This may be because no ${landType.toLowerCase()} season clusters were formed in these taluks.` : ''}
            </Typography>
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
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>From Month</InputLabel>
                  <Select
                    value={fromMonth}
                    label="From Month"
                    onChange={handleFromMonthChange}
                  >
                    {agriYearMonths.current.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">→</Typography>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>To Month</InputLabel>
                  <Select
                    value={toMonth}
                    label="To Month"
                    onChange={handleToMonthChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {agriYearMonths.current.map((m) => (
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
                  onChange={handleSingleMonthChange}
                >
                  {agriYearMonths.current.map((m) => (
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
        <Box sx={{ position: 'relative', border: `1px solid ${alpha('#04255e', 0.15)}`, borderRadius: 3, p: 2, pt: 3, bgcolor: '#fff' }}>
          <Chip label={`${displayDistrictName} – District Report Summary`} size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1 }} />
          <Grid container spacing={2}>
            {[
              { label: 'Total Clusters', value: stats.total, color: '#1565c0', icon: <AssessmentIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
              { label: 'Completed', value: stats.completed, color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} /> },
              { label: 'Ongoing', value: stats.ongoing, color: '#ed6c02', icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} /> },
              { label: 'Not Started', value: stats.notStarted, color: '#757575', icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} /> },
              { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} /> },
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
                      <IconButton size="small" onClick={handleClearSearch} edge="end">
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
                    {['#', 'Taluk', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx} align={idx === 0 ? 'center' : idx === 1 ? 'left' : 'center'}
                        sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={40} /></TableCell>
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
                                {row.taluk}
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
                              <Chip label={row.total} size="small" variant="filled"
                                sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
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
                            <Tooltip title={hasNoData ? "No data available for this taluk" : "View Zone Details"}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewTalukDetails(row.taluk, row.id)}
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
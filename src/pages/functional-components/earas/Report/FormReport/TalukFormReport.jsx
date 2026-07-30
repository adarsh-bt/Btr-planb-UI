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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
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

// Builds the "July <startYear> → June <startYear + 1>" agricultural-year
// month list used by the Single Month / From Month / To Month dropdowns.
// Each option's `value` is sent to the API in "MM-YYYY" form (e.g. "07-2025"),
// matching /form1-status/district?districtId=1&startMonth=07-2025&endMonth=09-2025&landType=WET.
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

// Resolves a month string (e.g. 'July', 'July 2025', '07-2025') to a valid MM-YYYY value in MONTH_OPTIONS
function resolveMonthValue(val, monthOptions) {
  if (!monthOptions || monthOptions.length === 0) return '';
  if (!val) return monthOptions[0]?.value || '';

  // 1. Exact match with option value (e.g. '07-2025' or '02-2026')
  const exactMatch = monthOptions.find((o) => o.value === val);
  if (exactMatch) return exactMatch.value;

  // 2. Exact match with label (e.g. 'July 2025')
  const labelMatch = monthOptions.find((o) => o.label.toLowerCase() === val.toLowerCase());
  if (labelMatch) return labelMatch.value;

  // 3. Match month name prefix (e.g. val is 'July' or 'Feb')
  const monthNameMatch = monthOptions.find((o) => o.label.toLowerCase().startsWith(val.toLowerCase()));
  if (monthNameMatch) return monthNameMatch.value;

  // 4. Fallback to first month in options
  return monthOptions[0]?.value || '';
}

// Per-taluk metrics come split into wet*/dry* fields (e.g. wetCompleted,
// dryCompleted). This picks the right one — or sums both — based on the
// active WET / DRY / ALL tab. `metric` is one of:
// 'Completed' | 'Ongoing' | 'NotStarted' | 'UnderReview' | 'ClusterArea'
function pickMetric(taluk, metric, seasonTab) {
  if (seasonTab === 'WET') return Number(taluk[`wet${metric}`]) || 0;
  if (seasonTab === 'DRY') return Number(taluk[`dry${metric}`]) || 0;
  return (Number(taluk[`wet${metric}`]) || 0) + (Number(taluk[`dry${metric}`]) || 0);
}

const formatArea = (num) =>
  Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Fallback taluks for a district
function getFallbackTaluks(districtId) {
  const taluksByDistrict = {
    1: ['Thiruvananthapuran', 'Neyyattinkara', 'Nedumangad', 'Chirayinkeezhu'],
    2: ['Kollam', 'Karunagappally', 'Kottarakkara', 'Pathanapuram', 'Punalur'],
    3: ['Pathanamthitta', 'Kozhencherry', 'Ranni', 'Mallappally', 'Thiruvalla', 'Adoor'],
    4: ['Alappuzha', 'Chengannur', 'Mavelikkara', 'Kuttanad', 'Ambalappuzha'],
    5: ['Kottayam', 'Changanassery', 'Meenachil', 'Vaikom', 'Kanjirappally'],
    6: ['Idukki', 'Udumbanchola', 'Thodupuzha', 'Peermade', 'Devikulam'],
    7: ['Ernakulam', 'Aluva', 'Kothamangalam', 'Muvattupuzha', 'Kochi', 'Paravur', 'Kanayannur'],
    8: ['Thrissur', 'Chalakudy', 'Kodungallur', 'Mukundapuram', 'Talappilly', 'Irungattukottai'],
    9: ['Palakkad', 'Alathur', 'Chittur', 'Mannarkkad', 'Ottapalam'],
    10: ['Malappuram', 'Eranad', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Nilambur', 'Kondotty'],
    11: ['Kozhikode', 'Vadakara', 'Quilandy', 'Thamarassery', 'Koyilandy'],
    12: ['Wayanad', 'Mananthavady', 'Sulthan Bathery', 'Vythiri'],
    13: ['Kannur', 'Thalassery', 'Payyanur', 'Iritty', 'Taliparamba'],
    14: ['Kasaragod', 'Hosdurg', 'Vellarikundu']
  };

  const districtTaluks = taluksByDistrict[districtId] || [];
  return districtTaluks.map((name, index) => ({
    id: index + 1,
    talukNameEn: name
  }));
}

function TalukFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName } = useParams();

  const BASE_URL = mainapi.FORM_API;

  const MONTH_OPTIONS = buildAgriMonthOptions();
  const getMonthLabel = (value) => MONTH_OPTIONS.find((o) => o.value === value)?.label || value;

  /* ── merge location.state with saved sessionStorage state. ── */
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []);

  /* ── resolve district ID once, keep in a ref ── */
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
      fromMonth: resolveMonthValue(stateData.fromMonth, MONTH_OPTIONS),
      toMonth: stateData.toMonth ? resolveMonthValue(stateData.toMonth, MONTH_OPTIONS) : '',
      singleMonth: resolveMonthValue(stateData.singleMonth, MONTH_OPTIONS),
      seasonTab: stateData.seasonTab || 'ALL'
    };
  };

  const initialFilters = getInitialFilters();

  // Filter states with initial values
  const [btrData, setBtrData] = useState(null);

  const [districtId, setDistrictId] = useState(initialFilters.districtId);
  const [seasonTab, setSeasonTab] = useState(initialFilters.seasonTab);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [taluksList, setTaluksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterTaluksLoading, setMasterTaluksLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ── display name ── */
  const displayDistrictName =
    (districtName && districtName !== 'direct' &&
      districtName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) ||
    stateData.districtName ||
    'District';

  /* ── persist district context ── */
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
          fromMonth: stateData.fromMonth || MONTH_OPTIONS[0]?.value || '',
          toMonth: stateData.toMonth || '',
          singleMonth: stateData.singleMonth || MONTH_OPTIONS[0]?.value || '',
          seasonTab: stateData.seasonTab || 'ALL'
        })
      );
    }
  }, []);

  // Fetch master taluks list
  const fetchMasterTaluks = async (districtIdValue) => {
    setMasterTaluksLoading(true);
    try {
      const response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/taluks?distId=${districtIdValue}`);
      console.log('Master Taluks Response:', response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Setting taluks list:', response.data.data);
        setTaluksList(response.data.data);
      } else {
        console.warn('No taluks found, using fallback');
        setTaluksList(getFallbackTaluks(districtIdValue));
      }
    } catch (err) {
      console.error('Error fetching master taluks:', err);
      setTaluksList(getFallbackTaluks(districtIdValue));
    } finally {
      setMasterTaluksLoading(false);
    }
  };

  // Fetch data from API
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

    let startMonthVal = resolveMonthValue(MONTH_OPTIONS[0]?.value, MONTH_OPTIONS);
    let endMonthVal = resolveMonthValue(MONTH_OPTIONS[MONTH_OPTIONS.length - 1]?.value, MONTH_OPTIONS);

    if (filterType === 'single') {
      if (singleMonth) {
        const resolved = resolveMonthValue(singleMonth, MONTH_OPTIONS);
        startMonthVal = resolved;
        endMonthVal = resolved;
      }
    } else {
      if (fromMonth) startMonthVal = resolveMonthValue(fromMonth, MONTH_OPTIONS);
      if (toMonth) endMonthVal = resolveMonthValue(toMonth, MONTH_OPTIONS);
    }

    const token = AuthService.getToken ? AuthService.getToken() : localStorage.getItem('token');
    if (!token) throw new Error('Authentication session token missing. Please log in again.');

    // Form-status API params (no districtId here — it's a path-style query param already used below)
    const formParams = new URLSearchParams({ districtId: districtIdValue, startMonth: startMonthVal });
    if (endMonthVal) formParams.append('endMonth', endMonthVal);
    if (seasonTab && seasonTab !== 'ALL') formParams.append('landType', seasonTab);

    // BTR completed-clusters (taluk) API params
    const btrParams = new URLSearchParams({ districtId: districtIdValue, startMonth: startMonthVal });
    if (endMonthVal) btrParams.append('endMonth', endMonthVal);
    if (seasonTab && seasonTab !== 'ALL') btrParams.append('landType', seasonTab);

    const formStatusUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/form1-status/district?${formParams.toString()}`;
    const completedClustersUrl = `${mainapi.BTR_API}/btr-service/api/report/dashboard/completed/taluk?${btrParams.toString()}`;

    console.log('Taluk API Request:', formStatusUrl);
    console.log('BTR Taluk Completed-Clusters Request:', completedClustersUrl);

    const [formStatusRes, completedClustersRes] = await Promise.all([
      axios.get(formStatusUrl, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(completedClustersUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    console.log('Taluk API Response:', formStatusRes.data);
    console.log('BTR Taluk Completed-Clusters Response:', completedClustersRes.data);

    setApiData(formStatusRes.data || null);
    setBtrData(completedClustersRes.data || null);
  } catch (err) {
    console.error('Error fetching taluk data:', err);
    setError(err.response?.data?.message || err.message || 'Failed to fetch taluk data');
  } finally {
    setLoading(false);
  }
};

  // Fetch master taluks on mount
  useEffect(() => {
    if (resolvedDistrictId.current) {
      fetchMasterTaluks(resolvedDistrictId.current);
    }
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchTalukData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMonth, toMonth, singleMonth, seasonTab, filterType, districtId]);

  // Map allSubDetails into UI rows, merging with master taluks list
  const talukData = useMemo(() => {
  const apiTaluks = apiData?.allSubDetails || {};
  const btrTaluks = btrData?.allSubDetails || {};

  const apiDataMapById = {};
  const apiDataMapByName = {};
  Object.entries(apiTaluks).forEach(([name, details]) => {
    if (details.id) apiDataMapById[details.id] = { name, details };
    const key = name?.toLowerCase()?.trim() || '';
    if (key) apiDataMapByName[key] = { name, details };
  });

  const btrMapById = {};
  const btrMapByName = {};
  Object.entries(btrTaluks).forEach(([name, details]) => {
    if (details.id) btrMapById[details.id] = { name, details };
    const key = name?.toLowerCase()?.trim() || '';
    if (key) btrMapByName[key] = { name, details };
  });

  const resolveBtrDetails = (talukId, talukName) => {
    if (talukId && btrMapById[talukId]) return btrMapById[talukId].details;
    const key = talukName?.toLowerCase()?.trim() || '';
    if (key && btrMapByName[key]) return btrMapByName[key].details;
    return {};
  };

  if (taluksList && taluksList.length > 0) {
    return taluksList.map((taluk) => {
      const talukId = taluk.id;
      const talukName = taluk.talukNameEn || '';

      let apiMatch = null;
      if (talukId && apiDataMapById[talukId]) apiMatch = apiDataMapById[talukId];
      if (!apiMatch) {
        const key = talukName?.toLowerCase()?.trim() || '';
        if (key && apiDataMapByName[key]) apiMatch = apiDataMapByName[key];
      }
      const apiDetails = apiMatch ? apiMatch.details : {};

      const completed = pickMetric(apiDetails, 'Completed', seasonTab); // unchanged source
      const ongoing = pickMetric(apiDetails, 'Ongoing', seasonTab);
      const underReview = pickMetric(apiDetails, 'UnderReview', seasonTab);
      const area = pickMetric(apiDetails, 'ClusterArea', seasonTab);

      // NEW: Total comes from the BTR taluk completed-clusters API
      const btrDetails = resolveBtrDetails(talukId, talukName);
      const total = pickMetric(btrDetails, 'Completed', seasonTab); // wetCompleted/dryCompleted

      // NEW: Not Started = new total - existing completed
      const notStarted = Math.max(total - completed, 0);

      const hasData = completed > 0 || ongoing > 0 || notStarted > 0 || underReview > 0 || area > 0 || total > 0;

      return {
        id: talukId || apiDetails.id || `taluk_${Math.random()}`,
        taluk: talukName || apiMatch?.name || 'Unknown Taluk',
        total,
        completed,
        ongoing,
        notStarted,
        underReview,
        area,
        hasData
      };
    });
  }

  // Fallback (no master taluks list)
  return Object.entries(apiTaluks).map(([talukName, t]) => {
    const completed = pickMetric(t, 'Completed', seasonTab);
    const ongoing = pickMetric(t, 'Ongoing', seasonTab);
    const underReview = pickMetric(t, 'UnderReview', seasonTab);
    const area = pickMetric(t, 'ClusterArea', seasonTab);

    const btrDetails = resolveBtrDetails(t.id, talukName);
    const total = pickMetric(btrDetails, 'Completed', seasonTab);
    const notStarted = Math.max(total - completed, 0);
    const hasData = completed > 0 || ongoing > 0 || notStarted > 0 || underReview > 0 || area > 0 || total > 0;

    return {
      id: t.id || `taluk_${Math.random()}`,
      taluk: talukName || 'Unknown Taluk',
      total,
      completed,
      ongoing,
      notStarted,
      underReview,
      area,
      hasData
    };
  });
}, [apiData, btrData, taluksList, seasonTab]);

  // Count taluks with no data
  const taluksWithNoData = useMemo(() => {
    return talukData.filter(d => !d.hasData).length;
  }, [talukData]);

  // Stats from API
  const stats = useMemo(() => {
  const totalCompletedClusters = btrData?.totalClusterCompleted || 0; // NEW source for "Total Clusters"
  const existingCompleted = apiData?.completed || 0; // unchanged

  return {
    total: totalCompletedClusters,
    completed: existingCompleted,
    ongoing: apiData?.ongoing || 0,
    notStarted: Math.max(totalCompletedClusters - existingCompleted, 0), // NEW derivation
    underReview: apiData?.underView || 0,
    completedArea: talukData.reduce((sum, t) => sum + t.area, 0)
  };
}, [apiData, btrData, talukData]);

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
    setFromMonth(MONTH_OPTIONS[0]?.value || '');
    setToMonth('');
    setSingleMonth(MONTH_OPTIONS[0]?.value || '');
    setSeasonTab('ALL');
    setFilterType('single');
    setPage(0);
  };

  const handleGoBack = () => {
    navigate('/FormReport/Kerala', {
      state: {
        fromMonth,
        toMonth,
        seasonTab,
        filterType,
        singleMonth
      }
    });
  };

  const handleViewBlockDetails = (talukName, talukId, hasData) => {
    // Only navigate if taluk has data
    if (!hasData) return;

    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const safeDistrictName = districtName || displayDistrictName || 'district';
    const formattedDistrictName = safeDistrictName.toLowerCase().replace(/\s+/g, '-');

    navigate(`/kerala_form_report/zone_form_report/${formattedDistrictName}/${formattedTalukName}`, {
      state: {
        districtId: resolvedDistrictId.current || districtId,
        districtName: displayDistrictName,
        talukId: talukId,
        talukName: talukName,
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

  // Show loading state
  if ((loading || masterTaluksLoading) && !apiData && taluksList.length === 0) {
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
                {filterType === 'single' && singleMonth && ` • ${getMonthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && ` • ${getMonthLabel(fromMonth)}${toMonth ? ` - ${getMonthLabel(toMonth)}` : ''}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Land`}
                {loading && ' • Loading...'}
                {taluksWithNoData > 0 && ` • ${taluksWithNoData} taluks with no data`}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth !== MONTH_OPTIONS[0]?.value || toMonth || seasonTab !== 'ALL') && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Reset Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Info Banner for taluks with no data */}
      {taluksWithNoData > 0 && !loading && (
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
              <strong>{taluksWithNoData}</strong> taluk{taluksWithNoData > 1 ? 's' : ''} have no data available for the selected filters.
              <strong> View details is disabled for taluks without data.</strong>
            </Typography>
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
                  Month Range
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
                    <Select
                      value={fromMonth}
                      label="From Month"
                      onChange={(e) => { setFromMonth(e.target.value); setPage(0); }}
                    >
                      <MenuItem value="">{`None (${MONTH_OPTIONS[0]?.label})`}</MenuItem>
                      {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select
                      value={toMonth}
                      label="To Month"
                      onChange={(e) => { setToMonth(e.target.value); setPage(0); }}
                    >
                      <MenuItem value="">{`None (${MONTH_OPTIONS[MONTH_OPTIONS.length - 1]?.label})`}</MenuItem>
                      {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
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
                    {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
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
                areaValue={stats.completedArea}
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
                        {['#', 'Taluk', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                          <TableCell key={idx} align={idx === 0 ? 'center' : idx === 1 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
                            {label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => {
                          const serialNumber = page * rowsPerPage + index + 1;
                          const hasNoData = !row.hasData;

                          return (
                            <TableRow
                              key={row.id || index}
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
                                  <Chip label={row.total} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {hasNoData ? (
                                  <Typography variant="body2" color="text.secondary">NA</Typography>
                                ) : (
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
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {hasNoData ? (
                                  <Typography variant="body2" color="text.secondary">NA</Typography>
                                ) : row.ongoing > 0 ? (
                                  <Chip label={row.ongoing} size="small" color="primary" variant="outlined" />
                                ) : (
                                  row.ongoing
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {hasNoData ? (
                                  <Typography variant="body2" color="text.secondary">NA</Typography>
                                ) : row.notStarted > 0 ? (
                                  <Chip label={row.notStarted} size="small" variant="outlined" />
                                ) : (
                                  row.notStarted
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {hasNoData ? (
                                  <Typography variant="body2" color="text.secondary">NA</Typography>
                                ) : row.underReview > 0 ? (
                                  <Chip label={row.underReview} size="small" color="warning" variant="outlined" />
                                ) : (
                                  row.underReview
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {row.hasData ? (
                                  <Tooltip title="View Block Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewBlockDetails(row.taluk, row.id, row.hasData)}
                                      sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="No data available - View disabled">
                                    <IconButton
                                      size="small"
                                      disabled
                                      sx={{ color: '#bdbdbd', cursor: 'not-allowed' }}
                                    >
                                      <VisibilityOffIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
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

      {/* Back Button */}
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
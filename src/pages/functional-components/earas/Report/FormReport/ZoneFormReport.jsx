// ZoneFormReport.js - With API integration and navigation support
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

// Builds the "July <startYear> → June <startYear + 1>" agricultural-year
// month list used by the Single Month / From Month / To Month dropdowns.
// Each option's `value` is sent to the API in "MM-YYYY" form (e.g. "07-2025"),
// matching /form1-status/taluk?talukId=10&startMonth=07-2025&endMonth=09-2025&landType=DRY.
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

// Per-zone metrics come split into wet*/dry* fields (e.g. wetCompleted,
// dryCompleted). This picks the right one — or sums both — based on the
// active WET / DRY / ALL tab. `metric` is one of:
// 'Completed' | 'Ongoing' | 'NotStarted' | 'UnderReview' | 'ClusterArea'
function pickMetric(zone, metric, seasonTab) {
  if (seasonTab === 'WET') return Number(zone[`wet${metric}`]) || 0;
  if (seasonTab === 'DRY') return Number(zone[`dry${metric}`]) || 0;
  return (Number(zone[`wet${metric}`]) || 0) + (Number(zone[`dry${metric}`]) || 0);
}

// Resolve the block a zone belongs to.
//   zoneName contains 'Municipality' / 'Corporation' → that keyword, regardless of blockId
//   otherwise: real block → blockName (when blockId & blockName present), else Unassigned
function resolveBlockName(blockId, blockName, zoneName) {
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;
  return 'Unassigned';
}

const formatArea = (num) =>
  Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function ZoneFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // routeTalukId comes from the TALUK-approver direct route:
  //   kerala_form_report/zone_form_report/direct/:talukId
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = location.state || {};

  const BASE_URL = mainapi.FORM_API;

  const MONTH_OPTIONS = buildAgriMonthOptions();
  const getMonthLabel = (value) => MONTH_OPTIONS.find((o) => o.value === value)?.label || value;

  /* ── resolve taluk ID once and keep in a ref ──
        Priority:
        1. state.talukId        (normal drill-down from TalukFormReport)
        2. state.talukOfficeId  (direct access from ReportMenuWrapper)
        3. :talukId route param (direct route — survives page refresh)      */
  const resolvedTalukId = useRef(null);

  const resolveTalukId = () => {
    if (stateData.talukId !== undefined && stateData.talukId !== null) {
      return stateData.talukId;
    }
    if (stateData.talukOfficeId !== undefined && stateData.talukOfficeId !== null) {
      return stateData.talukOfficeId;
    }
    if (routeTalukId && !isNaN(routeTalukId)) {
      return parseInt(routeTalukId, 10);
    }
    return null;
  };

  if (resolvedTalukId.current === null) {
    resolvedTalukId.current = resolveTalukId();
  }

  // Get initial filters from navigation state (always merge with defaults)
  const getInitialFilters = () => {
    return {
      districtId: stateData.districtId || null,
      talukId: resolvedTalukId.current,
      filterType: stateData.filterType || 'single',
      fromMonth: stateData.fromMonth || MONTH_OPTIONS[0]?.value || '',
      toMonth: stateData.toMonth || '',
      singleMonth: stateData.singleMonth || MONTH_OPTIONS[0]?.value || '',
      seasonTab: stateData.seasonTab || 'ALL'
    };
  };

  const initialFilters = getInitialFilters();

  // Filter states
  const [districtId, setDistrictId] = useState(initialFilters.districtId);
  const [talukId, setTalukId] = useState(initialFilters.talukId);
  const [seasonTab, setSeasonTab] = useState(initialFilters.seasonTab);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // API states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);

  // Fetch data from API
  const fetchZoneData = async () => {
    try {
      setLoading(true);
      setError(null);

      // The resolved taluk ID covers all entry points:
      // normal drill-down (state), direct access (state), and refresh (URL param).
      const targetQueryId = resolvedTalukId.current;

      if (!targetQueryId) {
        setError('Taluk ID is required. Please navigate from the taluk report page.');
        setLoading(false);
        return;
      }

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

      console.log('Zone API Request Payload executed:', requestBody);

      const response = await axios.post(
        'http://localhost:8080/earas-form1-entry/form1/block-wise-status-summary',
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
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchZoneData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, talukId, seasonTab, filterType, fromMonth, toMonth, singleMonth]);

  // Group allSubDetails entries into blocks. Each value already carries its
  // own blockId/blockName/zoneId/zoneName, so grouping uses those directly
  // rather than parsing the "Block - Zone" key string.
  const processedData = useMemo(() => {
    if (!apiData || !apiData.allSubDetails) return [];

    const blockMap = new Map();
    const municipalityZones = [];
    const corporationZones = [];

    Object.values(apiData.allSubDetails).forEach((d) => {
      const resolvedBlock = resolveBlockName(d.blockId, d.blockName, d.zoneName);

      const zoneData = {
        zoneId: d.zoneId,
        zoneName: d.zoneName || 'Unassigned',
        completed: pickMetric(d, 'Completed', seasonTab),
        ongoing: pickMetric(d, 'Ongoing', seasonTab),
        notStarted: pickMetric(d, 'NotStarted', seasonTab),
        underReview: pickMetric(d, 'UnderReview', seasonTab),
        area: pickMetric(d, 'ClusterArea', seasonTab)
      };

      if (resolvedBlock === 'Municipality') {
        municipalityZones.push(zoneData);
        return;
      }
      if (resolvedBlock === 'Corporation') {
        corporationZones.push(zoneData);
        return;
      }

      const key = d.blockId ?? resolvedBlock;
      if (!blockMap.has(key)) {
        blockMap.set(key, { blockId: key, blockName: resolvedBlock, zones: [] });
      }
      blockMap.get(key).zones.push(zoneData);
    });

    const blocks = Array.from(blockMap.values()).sort((a, b) => a.blockName.localeCompare(b.blockName));
    blocks.forEach((block) => block.zones.sort((a, b) => a.zoneName.localeCompare(b.zoneName)));

    if (municipalityZones.length > 0) {
      blocks.push({
        blockId: 'municipality',
        blockName: 'Municipality',
        isMunicipality: true,
        zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }
    if (corporationZones.length > 0) {
      blocks.push({
        blockId: 'corporation',
        blockName: 'Corporation',
        isCorporation: true,
        zones: corporationZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    return blocks;
  }, [apiData, seasonTab]);

  // Overall statistics — counts come straight from the top-level totals
  // (already filtered server-side by landType); completedArea is summed
  // client-side since the API only returns area at the zone level.
  const stats = useMemo(() => {
    if (!apiData) {
      return { total: 0, completed: 0, ongoing: 0, notStarted: 0, underReview: 0, completedArea: 0 };
    }
    const completedArea = processedData.reduce(
      (sum, block) => sum + block.zones.reduce((s, z) => s + z.area, 0),
      0
    );
    return {
      total: apiData.totalCluster || 0,
      completed: apiData.completed || 0,
      ongoing: apiData.ongoing || 0,
      notStarted: apiData.notStarted || 0,
      underReview: apiData.underView || 0,
      completedArea
    };
  }, [apiData, processedData]);

  // Flatten data for table display with subtotals
  const flattenedTableData = useMemo(() => {
    const result = [];

    processedData.forEach((block) => {
      let blockTotal = 0;
      let blockCompleted = 0;
      let blockOngoing = 0;
      let blockNotStarted = 0;
      let blockUnderReview = 0;
      let blockArea = 0;

      // Add each zone in the block
      block.zones.forEach((zone, zoneIndex) => {
        const zoneTotal =
          zone.completed +
          zone.ongoing +
          zone.notStarted +
          zone.underReview;

        blockTotal += zoneTotal;
        blockCompleted += zone.completed;
        blockOngoing += zone.ongoing;
        blockNotStarted += zone.notStarted;
        blockUnderReview += zone.underReview;
        blockArea += zone.area;

        result.push({
          type: 'zone',
          id: `${block.blockId}_zone_${zone.zoneId}`,
          blockId: block.blockId,
          blockName: block.blockName,
          isFirstZoneInBlock: zoneIndex === 0,
          zoneName: zone.zoneName,
          total: zoneTotal,
          completed: zone.completed,
          ongoing: zone.ongoing,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          area: zone.area,
          zoneId: zone.zoneId,
          isCorporation: block.isCorporation || false,
          isMunicipality: block.isMunicipality || false
        });
      });

      // Add subtotal for all blocks
      result.push({
        type: 'subtotal',
        id: `block_${block.blockId}_subtotal`,
        blockId: block.blockId,
        blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        total: blockTotal,
        completed: blockCompleted,
        ongoing: blockOngoing,
        notStarted: blockNotStarted,
        underReview: blockUnderReview,
        area: blockArea,
        isSubtotal: true,
        isCorporation: block.isCorporation || false,
        isMunicipality: block.isMunicipality || false
      });
    });

    return result;
  }, [processedData]);

  // Filter data based on search term
  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return flattenedTableData;
    return flattenedTableData.filter(row =>
      row.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedTableData, searchTerm]);

  // Paginate data
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

  const handleSeasonTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSeasonTab(newValue);
      setPage(0);
    }
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setFilterType(newValue);
      setFromMonth(MONTH_OPTIONS[0]?.value || '');
      setToMonth('');
      setSingleMonth(MONTH_OPTIONS[0]?.value || '');
      setPage(0);
    }
  };

  const handleViewZoneDetails = (zoneName, zoneId) => {
    console.log(`View details for ${zoneName}`, zoneId);
    // Navigate to zone details page if needed
    navigate(`/kerala_form_report/zone-details/${zoneId}`, {
      state: {
        zoneName,
        zoneId,
        districtId,
        talukId: resolvedTalukId.current,
        fromMonth,
        toMonth,
        seasonTab,
        filterType,
        singleMonth
      }
    });
  };

  const handleGoBack = () => {
    // Navigate back to taluk report with current filters.
    // districtName param is undefined on the /direct route — fall back to state.
    const safeDistrictName = districtName || stateData.districtName || '';
    const formattedDistrictName = safeDistrictName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/kerala_form_report/taluk_form_report/${formattedDistrictName}`, {
      state: {
        districtId: districtId,
        districtName: stateData.districtName || '',
        fromMonth,
        toMonth,
        seasonTab,
        filterType,
        singleMonth
      }
    });
  };

  const StatCard = ({ label, value, color, bgColor, icon, areaValue }) => (
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
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  // Format display names — URL param (normal navigation) → state (direct access) → fallback
  const formattedTaluk =
    (talukName && talukName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) ||
    stateData.talukName ||
    'Taluk';

  // Show loading state
  if (loading && !apiData) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>Loading zone data...</Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // Show error state
  if (error && !apiData) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchZoneData}
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

      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} Taluk - Zone Form Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(districtName || stateData.districtName) &&
                  `District: ${(districtName || stateData.districtName).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Land`}
                {filterType === 'single' && singleMonth && ` • ${getMonthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && ` • ${getMonthLabel(fromMonth)}${toMonth ? ` - ${getMonthLabel(toMonth)}` : ''}`}
                {apiData && ` • Total Zones: ${Object.keys(apiData.allSubDetails || {}).length}`}
                {loading && ' • Loading...'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
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
            {/* <Button
              variant="contained"
              onClick={fetchZoneData}
              size="small"
              sx={{ borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button> */}
          </Stack>
        </Stack>
      </Grid>

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
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
          <Chip
            label={`${formattedTaluk} - Taluk Report Summary`}
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                label="Total Clusters"
                value={stats.total}
                color="#1565c0"
                bgColor={alpha('#1565c0', 0.08)}
                icon={<StoreIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />}
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

      {/* Zone Table with Block Grouping */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
          <Chip
            label="Zone Report Summary"
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
            title={`Blocks and Zones in ${formattedTaluk}`}
            secondary={
              <TextField
                placeholder="Search block/zone..."
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#04255e' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600, py: 1.5, minWidth: 200, textAlign: 'center', border: 'none' }}>Block</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, py: 1.5, minWidth: 200, border: 'none' }}>Zone</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Total</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Completed</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Ongoing</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Not Started</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Under Review</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedData.length > 0 ? (
                        (() => {
                          const rows = [];
                          let lastBlockName = '';
                          let blockRowCount = 0;

                          for (let i = 0; i < paginatedData.length; i++) {
                            const row = paginatedData[i];
                            const isNewBlock = row.blockName !== lastBlockName;
                            const isCurrentRowSubtotal = row.type === 'subtotal';

                            if (isNewBlock) {
                              blockRowCount = paginatedData.filter(r => r.blockName === row.blockName).length;
                              lastBlockName = row.blockName;
                            }

                            const isFirstRowOfBlock = isNewBlock;

                            rows.push(
                              <TableRow
                                key={row.id}
                                hover
                                sx={{
                                  '&:hover': { bgcolor: alpha('#04255e', 0.04) },
                                  transition: '0.2s',
                                  '& td': {
                                    borderBottom: isCurrentRowSubtotal ? `1px solid ${theme.palette.primary.main}` : 'none',
                                    borderTop: isCurrentRowSubtotal ? `0.01px solid ${theme.palette.primary.main}` : 'none',
                                    backgroundColor: isCurrentRowSubtotal ? alpha('#728ab4', 0.08) : 'transparent'
                                  }
                                }}
                              >
                                {/* Block Column - Merged for all zones in block */}
                                {isFirstRowOfBlock && !isCurrentRowSubtotal && (
                                  <TableCell
                                    rowSpan={blockRowCount}
                                    align="center"
                                    sx={{
                                      verticalAlign: 'middle',
                                      backgroundColor: alpha('#04255e', 0.04),
                                      borderRight: 'none',
                                      borderLeft: 'none',
                                      fontWeight: 'bold',
                                      color: '#04255e',
                                      fontSize: '1rem'
                                    }}
                                  >
                                    <Stack direction="column" spacing={1} alignItems="center">
                                      <LocationOnIcon
                                        sx={{ fontSize: 24, color: '#04255e', opacity: 0.7 }}
                                      />
                                      <Typography fontWeight={700} sx={{ color: '#04255e' }}>
                                        {row.blockName}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                )}

                                {/* Zone Column */}
                                <TableCell sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {row.type === 'subtotal' ? (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 'bold',
                                        color: '#04255e',
                                        fontStyle: 'italic'
                                      }}
                                    >
                                      {row.zoneName}
                                    </Typography>
                                  ) : (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <StoreIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                                      <Typography fontWeight={500}>{row.zoneName}</Typography>
                                    </Stack>
                                  )}
                                </TableCell>

                                {/* Total */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  <Chip
                                    label={row.total}
                                    size="small"
                                    variant={row.type === 'subtotal' ? "filled" : "outlined"}
                                    sx={{
                                      fontWeight: row.type === 'subtotal' ? 700 : 600,
                                      bgcolor: row.type === 'subtotal' ? alpha('#04255e', 0.15) : 'transparent',
                                      color: row.type === 'subtotal' ? '#04255e' : 'inherit'
                                    }}
                                  />
                                </TableCell>

                                {/* Completed (+ pinned area label) */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                    {row.completed > 0 ? (
                                      <Chip
                                        label={row.completed}
                                        size="small"
                                        color="success"
                                        variant={row.type === 'subtotal' ? "filled" : "outlined"}
                                        sx={{ fontWeight: row.type === 'subtotal' ? 700 : 500 }}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">{row.completed}</Typography>
                                    )}
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

                                {/* Ongoing */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {row.ongoing > 0 ? (
                                    <Chip
                                      label={row.ongoing}
                                      size="small"
                                      color="primary"
                                      variant={row.type === 'subtotal' ? "filled" : "outlined"}
                                      sx={{ fontWeight: row.type === 'subtotal' ? 700 : 500 }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">{row.ongoing}</Typography>
                                  )}
                                </TableCell>

                                {/* Not Started */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {row.notStarted > 0 ? (
                                    <Chip
                                      label={row.notStarted}
                                      size="small"
                                      variant={row.type === 'subtotal' ? "filled" : "outlined"}
                                      sx={{
                                        fontWeight: row.type === 'subtotal' ? 700 : 500,
                                        bgcolor: row.type === 'subtotal' ? alpha('#757575', 0.15) : 'transparent'
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">{row.notStarted}</Typography>
                                  )}
                                </TableCell>

                                {/* Under Review */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {row.underReview > 0 ? (
                                    <Chip
                                      label={row.underReview}
                                      size="small"
                                      color="warning"
                                      variant={row.type === 'subtotal' ? "filled" : "outlined"}
                                      sx={{ fontWeight: row.type === 'subtotal' ? 700 : 500 }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">{row.underReview}</Typography>
                                  )}
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {row.type !== 'subtotal' && (
                                    <Tooltip title="View Details">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId)}
                                        sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                          return rows;
                        })()
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">
                              {searchTerm ? `No blocks/zones found matching "${searchTerm}"` : 'No data available for selected filters'}
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
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                  />
                )}
              </>
            )}
          </MainCard>
        </Box>
      </Grid>

      {/* Back Button — hidden for direct-access (taluk approver) users,
          who have no taluk-level page to go back to */}
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
              Back to Taluk Report
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default ZoneFormReport;
// ZoneClusterReport.js
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
import StoreIcon from '@mui/icons-material/Store';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';

const BASE_URL = mainapi.BTR_API;

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

/* ─────────────────────────── component ─────────────────────────── */

function ZoneClusterReport() {
  const theme    = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = location.state || {};

  /* ── resolve taluk ID once and keep in a ref ── */
  // Priority:
  //  1. state.talukId / state.talukOfficeId  (set by both TalukClusterReport and ReportMenuWrapper)
  //  2. :talukId route param  (direct route: zone_cluster_report/direct/:talukId)
  //  3. last segment of :talukName  (nested route: .../:districtName/:talukName-{id})
  const resolvedTalukId = useRef(null);

  const resolveTalukId = () => {
    if (stateData.talukId)       return stateData.talukId;
    if (stateData.talukOfficeId) return stateData.talukOfficeId;
    // direct route param
    if (routeTalukId && !isNaN(routeTalukId)) return parseInt(routeTalukId, 10);
    // nested route: talukName ends with "-{id}"
    if (talukName && talukName.includes('-')) {
      const parts    = talukName.split('-');
      const possible = parts[parts.length - 1];
      if (!isNaN(possible)) return parseInt(possible, 10);
    }
    return null;
  };

  if (resolvedTalukId.current === null) {
    resolvedTalukId.current = resolveTalukId();
  }

  /* ── filter state ── */
  const [seasonTab, setSeasonTab]     = useState(stateData.seasonTab  || 'ALL');
  const [landType, setLandType]       = useState(stateData.landType   || null);
  const [filterType, setFilterType]   = useState(stateData.filterType || 'single');
  const [fromMonth, setFromMonth]     = useState(stateData.fromMonth  || '');
  const [toMonth, setToMonth]         = useState(stateData.toMonth    || '');
  const [singleMonth, setSingleMonth] = useState(stateData.singleMonth || getCurrentMonthName());

  /* ── ui state ── */
  const [apiData, setApiData]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm]       = useState('');
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(5);

  /* ─────────────────────────── fetch ─────────────────────────── */

  const fetchZoneWiseData = async (overrides = {}) => {
    const talukIdValue = resolvedTalukId.current;

    if (!talukIdValue) {
      setError('Taluk ID is required. Please navigate from the taluk report page.');
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

      const params = new URLSearchParams();
      params.append('page', 0);
      params.append('size', 100);

      if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
        params.append('landType', effectiveLandType.toLowerCase());
      }

      if (effectiveFilterType === 'single' && effectiveSingleMonth) {
        const fmt = formatMonthForApi(effectiveSingleMonth);
        if (fmt) params.append('startMonth', fmt);
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) params.append('startMonth', formatMonthForApi(effectiveFromMonth));
        if (effectiveToMonth)   params.append('endMonth',   formatMonthForApi(effectiveToMonth));
      } else {
        // fallback – always send startMonth
        params.append('startMonth', formatMonthForApi(getCurrentMonthName()));
      }

      const url = `${BASE_URL}/btr-service/api/report/clusters/taluk/${talukIdValue}/zones?${params.toString()}`;
      console.log('Fetching zone data from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
console.log('API response:', response.data);
      if (response.data) {
        setApiData(response.data);
        setTotalElements(
          response.data.totalElements ||
          Object.keys(response.data.allSubDetails || {}).length
        );
      }
    } catch (err) {
      console.error('Error fetching zone data:', err);
      if      (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('Taluk not found.');
      else setError(err.response?.data?.message || 'Failed to fetch zone data');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    fetchZoneWiseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchZoneWiseData({ landType, seasonTab, filterType, singleMonth, fromMonth, toMonth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landType, filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const getZoneStats = (details) => {
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

  const processedData = useMemo(() => {
    const allSubDetails =
      apiData?.content ?? apiData?.allSubDetails ?? null;

    if (!allSubDetails) return [];

    const blockMap          = new Map();
    const municipalityZones = [];
    const corporationZones  = [];
    const unassignedZones   = [];

    Object.entries(allSubDetails).forEach(([zoneName, details]) => {
      const stats = getZoneStats(details);
      const zoneData = {
        zoneId:      details.zoneId,
        zoneName,
        completed:   stats.completed,
        ongoing:     stats.ongoing,
        notStarted:  stats.notStarted,
        underReview: stats.underReview,
      };

      if (!details.blockId || !details.blockName) {
        const lower = zoneName.toLowerCase();
        if (lower.includes('municipality')) municipalityZones.push(zoneData);
        else if (lower.includes('corporation')) corporationZones.push(zoneData);
        else unassignedZones.push(zoneData);
        return;
      }

      if (!blockMap.has(details.blockName)) {
        blockMap.set(details.blockName, { blockId: details.blockId, blockName: details.blockName, zones: [] });
      }
      blockMap.get(details.blockName).zones.push(zoneData);
    });

    const blocks = Array.from(blockMap.values()).sort((a, b) => a.blockName.localeCompare(b.blockName));
    blocks.forEach(b => b.zones.sort((a, z) => a.zoneName.localeCompare(z.zoneName)));

    if (municipalityZones.length) blocks.push({ blockId: null, blockName: 'Municipality', isMunicipality: true, zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName)) });
    if (corporationZones.length)  blocks.push({ blockId: null, blockName: 'Corporation',  isCorporation: true,  zones: corporationZones.sort((a, b)  => a.zoneName.localeCompare(b.zoneName)) });
    if (unassignedZones.length)   blocks.push({ blockId: null, blockName: 'Unassigned',   isUnassigned: true,   zones: unassignedZones.sort((a, b)   => a.zoneName.localeCompare(b.zoneName)) });

    return blocks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiData, landType]);

  const stats = useMemo(() => {
    let total = 0, completed = 0, ongoing = 0, notStarted = 0, underReview = 0;
    processedData.forEach(block => block.zones.forEach(zone => {
      total       += zone.completed + zone.ongoing + zone.notStarted + zone.underReview;
      completed   += zone.completed;
      ongoing     += zone.ongoing;
      notStarted  += zone.notStarted;
      underReview += zone.underReview;
    }));
    return { total, completed, ongoing, notStarted, underReview };
  }, [processedData]);

  const flattenedTableData = useMemo(() => {
    const result = [];
    processedData.forEach(block => {
      let bTotal = 0, bCompleted = 0, bOngoing = 0, bNotStarted = 0, bUnderReview = 0;

      block.zones.forEach((zone, idx) => {
        const zTotal = zone.completed + zone.ongoing + zone.notStarted + zone.underReview;
        bTotal       += zTotal;
        bCompleted   += zone.completed;
        bOngoing     += zone.ongoing;
        bNotStarted  += zone.notStarted;
        bUnderReview += zone.underReview;

        result.push({
          type: 'zone',
          id:   `${block.blockId || 'nb'}_zone_${zone.zoneId}`,
          blockId: block.blockId, blockName: block.blockName,
          isFirstZoneInBlock: idx === 0,
          zoneName: zone.zoneName,
          total: zTotal,
          completed: zone.completed, ongoing: zone.ongoing,
          notStarted: zone.notStarted, underReview: zone.underReview,
          zoneId: zone.zoneId,
          isUnassigned:   block.isUnassigned   || false,
          isMunicipality: block.isMunicipality || false,
          isCorporation:  block.isCorporation  || false,
        });
      });

      result.push({
        type: 'subtotal',
        id:   `block_${block.blockId || block.blockName}_sub`,
        blockId: block.blockId, blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        total: bTotal, completed: bCompleted, ongoing: bOngoing,
        notStarted: bNotStarted, underReview: bUnderReview,
        isSubtotal: true,
        isMunicipality: block.isMunicipality || false,
        isCorporation:  block.isCorporation  || false,
        isUnassigned:   block.isUnassigned   || false,
      });
    });
    return result;
  }, [processedData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return flattenedTableData;
    return flattenedTableData.filter(r =>
      r.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedTableData, searchTerm]);

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
      setSingleMonth(getCurrentMonthName()); setFromMonth(''); setToMonth('');
    } else {
      setFromMonth(getCurrentMonthName()); setSingleMonth(''); setToMonth('');
    }
    setPage(0);
  };

  useEffect(() => {
    if (resolvedTalukId.current) {
      try {
        sessionStorage.setItem(
          'zoneReportState',
          JSON.stringify({
            talukId: resolvedTalukId.current,
            talukName: stateData.talukName || talukName || '',
            districtName: stateData.districtName || districtName || '',
            districtId: stateData.districtId || null,
            landType,
            seasonTab,
            filterType,
            fromMonth,
            toMonth,
            singleMonth,
          })
        );
      } catch (e) {
        console.error('Failed to save zoneReportState:', e);
      }
    }
  }, [landType, seasonTab, filterType, fromMonth, toMonth, stateData, districtName, talukName]);

  const handleClearFilters = () => {
    setSingleMonth(getCurrentMonthName()); setFromMonth(''); setToMonth('');
    setSeasonTab('ALL'); setLandType(null); setFilterType('single'); setPage(0);
  };

 const handleViewZoneDetails = (zoneName, clickedZoneId) => {
    // Navigate to the exact same page, but append the clickedZoneId to the URL
    navigate(`/Report/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${talukName}/clusters/${clickedZoneId}`);
    
    // Optional: Smooth scroll down to where the component will render
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
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

  const formattedTaluk =
    stateData.talukName ||
    (talukName
      ? talukName
          .replace(/-\d+$/, '')           // strip trailing -id
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Taluk');

  /* ─────────────────────────── render ─────────────────────────── */

  if (loading && !apiData) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
        <Grid item>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading zone data...</Typography>
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
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} Taluk – Zone wise Cluster Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {landType && landType !== 'ALL' && ` • ${landType} Season`}
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} – ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {apiData && ` • Total Zones: ${totalElements}`}
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
            <Typography color="error">Error: {error}</Typography>
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
          <Chip label={`${formattedTaluk} – Taluk Report Summary`} size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1, boxShadow: 2 }} />
          <Grid container spacing={2}>
            {[
              { label: 'Total Zones',  value: stats.total,       color: '#1565c0', icon: <StoreIcon       sx={{ fontSize: 32, color: '#1565c0',  opacity: 0.7 }} /> },
              { label: 'Completed',    value: stats.completed,   color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32',  opacity: 0.7 }} /> },
              { label: 'Ongoing',      value: stats.ongoing,     color: '#ed6c02', icon: <PendingIcon     sx={{ fontSize: 32, color: '#ed6c02',  opacity: 0.7 }} /> },
              { label: 'Not Started',  value: stats.notStarted,  color: '#757575', icon: <ScheduleIcon   sx={{ fontSize: 32, color: '#757575',  opacity: 0.7 }} /> },
              { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon  sx={{ fontSize: 32, color: '#b76e00',  opacity: 0.7 }} /> },
            ].map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={2.4} key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Zone Table */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
          <Chip label="Zone Report Summary" size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1, boxShadow: 2 }} />

          <MainCard
            title={`Blocks and Zones in ${formattedTaluk}`}
            secondary={
              <TextField placeholder="Search block/zone..." size="small" value={searchTerm}
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
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {['Block', 'Zone', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx}
                        align={idx === 0 ? 'center' : idx === 1 ? 'left' : 'center'}
                        sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none',
                          ...(idx === 0 && { minWidth: 200 }),
                          ...(idx === 1 && { minWidth: 200 }),
                        }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress size={40} /></TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (() => {
                    const rows = [];
                    let lastBlockName = '';

                    for (let i = 0; i < paginatedData.length; i++) {
                      const row = paginatedData[i];
                      const isNewBlock        = row.blockName !== lastBlockName;
                      const isSubtotalRow     = row.type === 'subtotal';
                      if (isNewBlock) lastBlockName = row.blockName;

                      const blockRowCount = isSubtotalRow
                        ? 0
                        : paginatedData.filter(r => r.blockName === row.blockName).length;

                      rows.push(
                        <TableRow key={row.id} hover sx={{
                          '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s',
                          '& td': {
                            borderBottom: isSubtotalRow ? `1px solid ${theme.palette.primary.main}` : 'none',
                            borderTop:    isSubtotalRow ? `0.01px solid ${theme.palette.primary.main}` : 'none',
                            backgroundColor: isSubtotalRow ? alpha('#728ab4', 0.08) : 'transparent',
                          },
                        }}>
                          {/* Block cell – merged across all zone rows */}
                          {isNewBlock && !isSubtotalRow && (
                            <TableCell rowSpan={blockRowCount} align="center"
                              sx={{ verticalAlign: 'middle', backgroundColor: alpha('#04255e', 0.04),
                                fontWeight: 'bold', color: '#04255e', fontSize: '1rem', border: 'none' }}>
                              <Stack direction="column" spacing={1} alignItems="center">
                                <LocationOnIcon sx={{ fontSize: 24, color: '#04255e', opacity: 0.7 }} />
                                <Typography fontWeight={700} sx={{ color: '#04255e' }}>{row.blockName}</Typography>
                              </Stack>
                            </TableCell>
                          )}

                          {/* Zone name */}
                          <TableCell sx={{ border: 'none' }}>
                            {isSubtotalRow ? (
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#04255e', fontStyle: 'italic' }}>
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
                          <TableCell align="center" sx={{ border: 'none' }}>
                            <Chip label={row.total} size="small"
                              variant={isSubtotalRow ? 'filled' : 'outlined'}
                              sx={{ fontWeight: isSubtotalRow ? 700 : 600,
                                bgcolor: isSubtotalRow ? alpha('#04255e', 0.15) : 'transparent',
                                color:   isSubtotalRow ? '#04255e' : 'inherit' }} />
                          </TableCell>

                          {/* Completed */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {row.completed > 0
                              ? <Chip label={row.completed} size="small" color="success" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              : <Typography variant="body2" color="text.secondary">{row.completed}</Typography>}
                          </TableCell>

                          {/* Ongoing */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {row.ongoing > 0
                              ? <Chip label={row.ongoing} size="small" color="primary" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              : <Typography variant="body2" color="text.secondary">{row.ongoing}</Typography>}
                          </TableCell>

                          {/* Not Started */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {row.notStarted > 0
                              ? <Chip label={row.notStarted} size="small" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500, bgcolor: isSubtotalRow ? alpha('#757575', 0.15) : 'transparent' }} />
                              : <Typography variant="body2" color="text.secondary">{row.notStarted}</Typography>}
                          </TableCell>

                          {/* Under Review */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {row.underReview > 0
                              ? <Chip label={row.underReview} size="small" color="warning" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              : <Typography variant="body2" color="text.secondary">{row.underReview}</Typography>}
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {!isSubtotalRow && (
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId)}
                                  sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}>
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return rows;
                  })() : (
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

            {searchFilteredData.length > 0 && !loading && (
              <TablePagination component="div" count={searchFilteredData.length}
                page={page} onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }} />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneClusterReport;
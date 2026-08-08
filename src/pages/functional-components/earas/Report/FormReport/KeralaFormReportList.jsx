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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

// Builds the "July <startYear> → June <startYear + 1>" agricultural-year
// month list used by the Single Month / From Month / To Month dropdowns.
function buildAgriMonthOptions() {
  const agriYear = AuthService.agriyear() || '2025-2026';
  const startYear = parseInt(agriYear.split('-')[0], 10) || new Date().getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const options = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (6 + i) % 12;
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

function pickMetric(district, metric, seasonTab) {
  if (seasonTab === 'WET') return Number(district[`wet${metric}`]) || 0;
  if (seasonTab === 'DRY') return Number(district[`dry${metric}`]) || 0;
  return (Number(district[`wet${metric}`]) || 0) + (Number(district[`dry${metric}`]) || 0);
}

const formatArea = (num) =>
  Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Fallback districts list with correct field names
function getFallbackDistricts() {
  return [
    { distId: 1, distNameEn: 'Thiruvananthapuram' },
    { distId: 2, distNameEn: 'Kollam' },
    { distId: 3, distNameEn: 'Pathanamthitta' },
    { distId: 4, distNameEn: 'Alappuzha' },
    { distId: 5, distNameEn: 'Kottayam' },
    { distId: 6, distNameEn: 'Idukki' },
    { distId: 7, distNameEn: 'Ernakulam' },
    { distId: 8, distNameEn: 'Thrissur' },
    { distId: 9, distNameEn: 'Palakkad' },
    { distId: 10, distNameEn: 'Malappuram' },
    { distId: 11, distNameEn: 'Kozhikode' },
    { distId: 12, distNameEn: 'Wayanad' },
    { distId: 13, distNameEn: 'Kannur' },
    { distId: 14, distNameEn: 'Kasaragod' }
  ];
}

function KeralaFormReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  const BASE_URL = mainapi.FORM_API;

  const MONTH_OPTIONS = buildAgriMonthOptions();
  const getMonthLabel = (value) => MONTH_OPTIONS.find((o) => o.value === value)?.label || value;

  const [btrData, setBtrData] = useState(null);

  const [seasonTab, setSeasonTab] = useState('ALL');
  const [filterType, setFilterType] = useState('single');
  const [fromMonth, setFromMonth] = useState(() => MONTH_OPTIONS[0]?.value || '');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState(() => MONTH_OPTIONS[0]?.value || '');

  const [apiData, setApiData] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterDistrictsLoading, setMasterDistrictsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch master districts list
  const fetchMasterDistricts = async () => {
    setMasterDistrictsLoading(true);
    try {
      // Use the BTR API endpoint directly
      const response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/districts`);
      console.log('Master Districts Response:', response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Map the districts to use distId and distNameEn
        const mappedDistricts = response.data.data.map(d => ({
          distId: d.distId,
          distNameEn: d.distNameEn || d.districtName || d.name || ''
        }));
        console.log('Mapped Districts:', mappedDistricts);
        setDistrictsList(mappedDistricts);
      } else {
        console.warn('No districts found, using fallback');
        setDistrictsList(getFallbackDistricts());
      }
    } catch (err) {
      console.error('Error fetching master districts:', err);
      setDistrictsList(getFallbackDistricts());
    } finally {
      setMasterDistrictsLoading(false);
    }
  };

  // Fetch data from API
  const fetchDistrictData = async () => {
    try {
      setLoading(true);
      setError(null);

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
      if (!token) {
        throw new Error('Authentication session token missing. Please log in again.');
      }

      const params = new URLSearchParams({ startMonth: startMonthVal });
      if (endMonthVal) params.append('endMonth', endMonthVal);
      if (seasonTab && seasonTab !== 'ALL') params.append('landType', seasonTab);

      const formStatusUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/form1-status/state?${params.toString()}`;
      const completedClustersUrl = `${mainapi.BTR_API}/btr-service/api/report/completed-clusters?${params.toString()}`;

      console.log('Fetching Form1 status data from:', formStatusUrl);
      console.log('Fetching BTR completed-clusters data from:', completedClustersUrl);

      const [formStatusRes, completedClustersRes] = await Promise.all([
      axios.get(formStatusUrl, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(completedClustersUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);


      setApiData(formStatusRes.data || null);
    setBtrData(completedClustersRes.data || null);
  } catch (err) {
    console.error('Error fetching data:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch district data';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDistrictData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMonth, toMonth, singleMonth, seasonTab, filterType]);

  useEffect(() => {
    fetchMasterDistricts();
  }, []);

  // Map allSubDetails into UI rows, merging with master districts list
  const districtData = useMemo(() => {
  const apiDistricts = apiData?.allSubDetails || {};
  const btrDistricts = btrData?.allSubDetails || {};

  const apiDataMapById = {};
  const apiDataMapByName = {};
  Object.entries(apiDistricts).forEach(([name, details]) => {
    if (details.id) apiDataMapById[details.id] = { name, details };
    const key = name?.toLowerCase()?.trim() || '';
    if (key) apiDataMapByName[key] = { name, details };
  });

  const btrMapById = {};
  const btrMapByName = {};
  Object.entries(btrDistricts).forEach(([name, details]) => {
    if (details.id) btrMapById[details.id] = { name, details };
    const key = name?.toLowerCase()?.trim() || '';
    if (key) btrMapByName[key] = { name, details };
  });

  const resolveBtrDetails = (districtId, districtName) => {
    if (districtId && btrMapById[districtId]) return btrMapById[districtId].details;
    const key = districtName?.toLowerCase()?.trim() || '';
    if (key && btrMapByName[key]) return btrMapByName[key].details;
    return {};
  };

  if (districtsList && districtsList.length > 0) {
    return districtsList.map((district) => {
      const districtId = district.distId;
      const districtName = district.distNameEn || '';

      let apiMatch = null;
      if (districtId && apiDataMapById[districtId]) apiMatch = apiDataMapById[districtId];
      if (!apiMatch) {
        const key = districtName?.toLowerCase()?.trim() || '';
        if (key && apiDataMapByName[key]) apiMatch = apiDataMapByName[key];
      }
      const apiDetails = apiMatch ? apiMatch.details : {};

      const completed = pickMetric(apiDetails, 'Completed', seasonTab); // unchanged source
      const ongoing = pickMetric(apiDetails, 'Ongoing', seasonTab);
      const underReview = pickMetric(apiDetails, 'UnderReview', seasonTab);
      const area = pickMetric(apiDetails, 'ClusterArea', seasonTab);

      // NEW: Total now comes from the BTR completed-clusters API
      const btrDetails = resolveBtrDetails(districtId, districtName);
      const total = pickMetric(btrDetails, 'Completed', seasonTab); // wetCompleted/dryCompleted

      // NEW: Not Started = new total - existing completed
      const notStarted = Math.max(total - completed, 0);

      const hasData = completed > 0 || ongoing > 0 || notStarted > 0 || underReview > 0 || area > 0 || total > 0;

      return {
        id: districtId || apiDetails.id || `dist_${Math.random()}`,
        district: districtName || apiMatch?.name || 'Unknown District',
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

  // Fallback (no master districts list) — same idea, keyed off apiDistricts
  return Object.entries(apiDistricts).map(([districtName, d]) => {
    const completed = pickMetric(d, 'Completed', seasonTab);
    const ongoing = pickMetric(d, 'Ongoing', seasonTab);
    const underReview = pickMetric(d, 'UnderReview', seasonTab);
    const area = pickMetric(d, 'ClusterArea', seasonTab);

    const btrDetails = resolveBtrDetails(d.id, districtName);
    const total = pickMetric(btrDetails, 'Completed', seasonTab);
    const notStarted = Math.max(total - completed, 0);
    const hasData = completed > 0 || ongoing > 0 || notStarted > 0 || underReview > 0 || area > 0 || total > 0;

    return {
      id: d.id || `dist_${Math.random()}`,
      district: districtName || 'Unknown District',
      total,
      completed,
      ongoing,
      notStarted,
      underReview,
      area,
      hasData
    };
  });
}, [apiData, btrData, districtsList, seasonTab]);

  const districtsWithNoData = useMemo(() => {
    return districtData.filter(d => !d.hasData).length;
  }, [districtData]);

  const stats = useMemo(() => {
  const totalCompletedClusters = btrData?.totalClusterCompleted || 0; // NEW source for "Total Clusters"
  const existingCompleted = apiData?.completed || 0; // unchanged

  return {
    all: totalCompletedClusters,
    completed: existingCompleted,
    ongoing: apiData?.ongoing || 0,
    notStarted: Math.max(totalCompletedClusters - existingCompleted, 0), // NEW derivation
    underReview: apiData?.underView || 0,
    completedArea: districtData.reduce((sum, d) => sum + d.area, 0)
  };
}, [apiData, btrData, districtData]);

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

  // Build a meaningful filename from the active filters
  const generateExcelFileName = () => {
    const parts = ['District_Report'];

    if (seasonTab !== 'ALL') parts.push(seasonTab);

    if (filterType === 'single' && singleMonth) {
      parts.push(getMonthLabel(singleMonth).replace(/\s+/g, '_'));
    } else if (filterType === 'range') {
      if (fromMonth) parts.push(getMonthLabel(fromMonth).replace(/\s+/g, '_'));
      if (toMonth) parts.push('to', getMonthLabel(toMonth).replace(/\s+/g, '_'));
    }

    if (searchTerm.trim()) {
      parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    }

    parts.push(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    return `${parts.join('_')}.xlsx`;
  };

  // Export the FULL filtered dataset (not just the current page) to Excel
  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) return;

    const exportRows = filteredData.map((row, index) => ({
      '#': index + 1,
      District: row.district,
      Total: row.hasData ? row.total : 'NA',
      Completed: row.hasData ? row.completed : 'NA',
      'Area Completed': row.hasData ? row.area : 'NA',
      Ongoing: row.hasData ? row.ongoing : 'NA',
      'Not Started': row.hasData ? row.notStarted : 'NA',
      'Under Review': row.hasData ? row.underReview : 'NA'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Reasonable column widths so it doesn't open looking cramped
    worksheet['!cols'] = [
      { wch: 5 },  { wch: 25 }, { wch: 10 },
      { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const handleViewDetails = (districtId, districtName, hasData) => {
    if (!hasData) return;

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

  if ((loading || masterDistrictsLoading) && !apiData && districtsList.length === 0) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
        <Grid item>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading district data...</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

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
                {districtsWithNoData > 0 && ` • ${districtsWithNoData} districts with no data`}
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

      {districtsWithNoData > 0 && !loading && (
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
              <strong>{districtsWithNoData}</strong> district{districtsWithNoData > 1 ? 's' : ''} have no data available for the selected filters.
              <strong> View details is disabled for districts without data.</strong>
            </Typography>
          </Paper>
        </Grid>
      )}

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

      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            border: `1px solid ${alpha('#04255e', 0.15)}`,
            borderRadius: 3,
            pt: 3,
            bgcolor: '#fff'
          }}
        >
          <Chip
            label="District Status Table"
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

          {/* Search + Export row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2, pb: 2 }}
          >
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
            <Tooltip
              title={
                filteredData.length === 0
                  ? 'No data available to export'
                  : `Export ${filteredData.length} district${filteredData.length > 1 ? 's' : ''} to Excel`
              }
            >
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={filteredData.length === 0 || loading}
                  sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                >
                  Download Excel
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <MainCard
            title="District-wise Summary"
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
                        <CircularProgress size={32} sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">Fetching up-to-date data...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
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
                              <Chip label={row.total} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
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
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(row.id, row.district, row.hasData)}
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
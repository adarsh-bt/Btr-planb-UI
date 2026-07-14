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

function ZoneFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // routeTalukId comes from the TALUK-approver direct route:
  //   kerala_form_report/zone_form_report/direct/:talukId
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = location.state || {};

  // Month helpers
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthToNumber = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  const seasonToId = {
    'Winter': 1,
    'Summer': 2,
    'Autumn': 3
  };

  const getCurrentMonth = () => {
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };

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

  // Filter states
  const [districtId, setDistrictId] = useState(initialFilters.districtId);
  const [talukId, setTalukId] = useState(initialFilters.talukId);
  const [seasonTab, setSeasonTab] = useState(initialFilters.seasonTab);
  const [landType, setLandType] = useState(initialFilters.seasonTab === 'ALL' ? null : initialFilters.seasonTab);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);
  const [selectedSeason, setSelectedSeason] = useState(initialFilters.selectedSeason);

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

      // The backend expects the selected Taluk ID to be passed into the "distId" field.
      // The resolved taluk ID covers all entry points:
      // normal drill-down (state), direct access (state), and refresh (URL param).
      const targetQueryId = resolvedTalukId.current;

      if (!targetQueryId) {
        setError('Taluk ID is required. Please navigate from the taluk report page.');
        setLoading(false);
        return;
      }

      let requestBody = {
        agriYear: AuthService.agriyear() || "2025-2026",
        seasonId: selectedSeason ? seasonToId[selectedSeason] : 3,
        landType: seasonTab === 'ALL' ? 'WET' : seasonTab,
        distId: Number(targetQueryId) // Maps to the selected/logged-in Taluk ID
      };

      // Handle month filters
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
          const currentMonthNum = new Date().getMonth() + 1;
          requestBody.startMonth = currentMonthNum;
          requestBody.endMonth = currentMonthNum;
        }
      } else {
        const currentMonthNum = new Date().getMonth() + 1;
        requestBody.startMonth = currentMonthNum;
        requestBody.endMonth = currentMonthNum;
      }

      console.log('Zone API Request Payload executed:', requestBody);

      const response = await axios.post(
        'http://localhost:9114/earas-form1-entry/form1/block-wise-status-summary',
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
  }, [districtId, talukId, seasonTab, filterType, fromMonth, toMonth, singleMonth, selectedSeason]);

  // Process API data to match the expected format
  const processedData = useMemo(() => {
    if (!apiData || !apiData.formStatusSummaryResponseList) {
      return [];
    }

    const blockMap = new Map();
    const corporationZones = [];
    const municipalityZones = [];

    apiData.formStatusSummaryResponseList.forEach(item => {
      // 1. If a specific taluk filter is present, filter rows matching it here if needed
      // (Note: If your backend endpoint returns all blocks for a district, this filter keeps it pristine)
      if (talukId && item.talukId && item.talukId !== talukId) {
        return;
      }

      let blockName = '';
      let isCorporation = false;
      let isMunicipality = false;

      // 2. FIXED MAPPER: Read 'districtName' from your API payload to extract the Block Name string safely
      if (item.districtName) {
        blockName = item.districtName; // e.g. "Chittumala", "Ithikara", "Mukhathala"
      } else if (item.localBodyName) {
        blockName = item.localBodyName.trim();
      } else {
        blockName = 'Unassigned';
      }

      // Check if it belongs to urban collections based on zoneName nomenclature strings
      const zoneNameLower = (item.zoneName || '').toLowerCase();
      if (zoneNameLower.includes('corporation') || zoneNameLower.includes('corp')) {
        isCorporation = true;
        blockName = 'Corporation';
      } else if (zoneNameLower.includes('municipality') || zoneNameLower.includes('municipal')) {
        isMunicipality = true;
        blockName = 'Municipality';
      }

      const zoneData = {
        zoneId: item.zoneId,
        zoneName: item.zoneName,
        completed: item.completedCount || 0,
        ongoing: item.ongoingCount || 0,
        notStarted: item.notStartedCount || 0,
        underReview: item.underReviewCount || 0,
        talukId: item.talukId || null,
        talukName: item.talukName || null
      };

      if (isCorporation) {
        corporationZones.push(zoneData);
        return;
      }

      if (isMunicipality) {
        municipalityZones.push(zoneData);
        return;
      }

      // Append into grouped map layout cleanly
      if (!blockMap.has(blockName)) {
        blockMap.set(blockName, {
          blockId: `block_${blockName.replace(/\s+/g, '_')}`,
          blockName: blockName,
          zones: []
        });
      }

      blockMap.get(blockName).zones.push(zoneData);
    });

    // Structure list presentation
    const blocks = Array.from(blockMap.values()).sort((a, b) =>
      a.blockName.localeCompare(b.blockName)
    );

    blocks.forEach(block => {
      block.zones.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
    });

    if (corporationZones.length > 0) {
      blocks.push({
        blockId: 'corporation',
        blockName: 'Corporation',
        isCorporation: true,
        zones: corporationZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    if (municipalityZones.length > 0) {
      blocks.push({
        blockId: 'municipality',
        blockName: 'Municipality',
        isMunicipality: true,
        zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    return blocks;
  }, [apiData, talukId]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    if (!apiData) {
      return { total: 0, completed: 0, ongoing: 0, notStarted: 0, underReview: 0 };
    }

    return {
      total: apiData.totalClusterCount || 0,
      completed: apiData.totalCompletedCount || 0,
      ongoing: apiData.totalOngoingCount || 0,
      notStarted: apiData.totalNotStartedCount || 0,
      underReview: apiData.totalUnderReviewCount || 0
    };
  }, [apiData]);

  // Flatten data for table display with subtotals
  const flattenedTableData = useMemo(() => {
    const result = [];

    processedData.forEach((block) => {
      let blockTotal = 0;
      let blockCompleted = 0;
      let blockOngoing = 0;
      let blockNotStarted = 0;
      let blockUnderReview = 0;

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
    const currentMonth = getCurrentMonth();
    setFromMonth('');
    setToMonth('');
    setSingleMonth(currentMonth);
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('single');
    setSelectedSeason('');
    setPage(0);
  };

  const handleSeasonTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSeasonTab(newValue);
      setLandType(newValue === 'ALL' ? null : newValue);
      setPage(0);
    }
  };

  const handleFilterTypeChange = (event, newValue) => {
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
        singleMonth,
        selectedSeason
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
        singleMonth,
        selectedSeason
      }
    });
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
              {loading ? <CircularProgress size={24} /> : value}
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
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {selectedSeason && ` • ${selectedSeason}`}
                {apiData && ` • Total Zones: ${apiData.formStatusSummaryResponseList?.length || 0}`}
                {loading && ' • Loading...'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
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
            <Button
              variant="contained"
              onClick={fetchZoneData}
              size="small"
              sx={{ borderRadius: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
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

                                {/* Completed */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
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
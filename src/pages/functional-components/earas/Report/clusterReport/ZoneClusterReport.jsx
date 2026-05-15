// ZoneClusterReport.js - With backend integration and wet/dry filter support
import React, { useState, useEffect, useMemo } from 'react';
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
import StoreIcon from '@mui/icons-material/Store';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';

// API base URL
const BASE_URL = mainapi.BTR_API;

function ZoneClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName } = useParams();

  // API state
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [seasonTab, setSeasonTab] = useState(location.state?.seasonTab || 'ALL');
  const [landType, setLandType] = useState(location.state?.landType || null);
  const [filterType, setFilterType] = useState(location.state?.filterType || 'range');
  const [fromMonth, setFromMonth] = useState(location.state?.fromMonth || '');
  const [toMonth, setToMonth] = useState(location.state?.toMonth || '');
  const [singleMonth, setSingleMonth] = useState(location.state?.singleMonth || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // API pagination state
  const [apiPage, setApiPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month name to number mapping for API
  const monthToNumber = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };

  // Get current year
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  // Format month for API (YYYY-MM)
  const formatMonthForApi = (monthName) => {
    if (!monthName) return null;
    const year = getCurrentYear();
    const monthNum = monthToNumber[monthName];
    return `${year}-${monthNum}`;
  };

  // Get taluk ID from location state or params
  const getTalukId = () => {
    // Try to get from state first
    if (location.state?.talukId) return location.state.talukId;
    // Try to get from params (if talukName contains ID)
    if (talukName && talukName.includes('-')) {
      const parts = talukName.split('-');
      const possibleId = parts[parts.length - 1];
      if (!isNaN(possibleId)) return parseInt(possibleId);
    }
    return null;
  };

  // Fetch zone-wise data from API
  const fetchZoneWiseData = async () => {
    const talukIdValue = getTalukId();
    
    if (!talukIdValue) {
      setError('Taluk ID is required. Please navigate from the taluk report page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token missing');
      }
      
      let url = `${BASE_URL}/btr-service/api/report/clusters/taluk/${talukIdValue}/zones`;

      const params = new URLSearchParams();

      // Add pagination parameters
      params.append('page', apiPage);
      params.append('size', 100); // Fetch more records to avoid multiple API calls

      // Add land type filter (wet/dry)
      if (landType && landType !== 'ALL') {
        params.append('landType', landType.toLowerCase());
      }

      // Add date filter (always include startMonth)
      if (filterType === 'single' && singleMonth) {
        const formattedMonth = formatMonthForApi(singleMonth);
        if (formattedMonth) {
          params.append('startMonth', formattedMonth);
        }
      } else if (filterType === 'range') {
        if (fromMonth) {
          params.append('startMonth', formatMonthForApi(fromMonth));
        } else {
          // Default to current month if no fromMonth
          params.append('startMonth', formatMonthForApi(getCurrentMonth()));
        }
        
        if (toMonth) {
          params.append('endMonth', formatMonthForApi(toMonth));
        }
      } else {
        // Fallback - use current month
        params.append('startMonth', formatMonthForApi(getCurrentMonth()));
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      console.log('Fetching zone data from:', url);
      
      // Make request with authorization header
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        // Handle paginated response if it exists
        if (response.data.content) {
          setApiData(response.data);
          setTotalElements(response.data.totalElements || 0);
        } else {
          setApiData(response.data);
          setTotalElements(Object.keys(response.data.allSubDetails || {}).length);
        }
      }
    } catch (err) {
      console.error('Error fetching zone data:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You don\'t have permission to access this data.');
      } else if (err.response?.status === 404) {
        setError('Taluk not found. Please check if the taluk ID is correct.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch zone data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get current month name
  const getCurrentMonth = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[new Date().getMonth()];
  };

  // Helper function to get zone statistics based on land type
  const getZoneStats = (zoneDetails) => {
    if (!zoneDetails) {
      return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 };
    }

    // If land type is WET, use wet statistics
    if (landType === 'WET') {
      return {
        completed: zoneDetails.wetCompleted || 0,
        ongoing: zoneDetails.wetOngoing || 0,
        notStarted: zoneDetails.wetNotStarted || 0,
        underReview: zoneDetails.wetUnderView || 0
      };
    } 
    // If land type is DRY, use dry statistics
    else if (landType === 'DRY') {
      return {
        completed: zoneDetails.dryCompleted || 0,
        ongoing: zoneDetails.dryOngoing || 0,
        notStarted: zoneDetails.dryNotStarted || 0,
        underReview: zoneDetails.dryUnderView || 0
      };
    }
    // If ALL, combine both wet and dry statistics
    else {
      return {
        completed: (zoneDetails.wetCompleted || 0) + (zoneDetails.dryCompleted || 0),
        ongoing: (zoneDetails.wetOngoing || 0) + (zoneDetails.dryOngoing || 0),
        notStarted: (zoneDetails.wetNotStarted || 0) + (zoneDetails.dryNotStarted || 0),
        underReview: (zoneDetails.wetUnderView || 0) + (zoneDetails.dryUnderView || 0)
      };
    }
  };

  // Transform API data to grouped by block format
  const processedData = useMemo(() => {
    // Handle both paginated and non-paginated responses
    let allSubDetails = null;
    if (apiData) {
      if (apiData.content) {
        // Paginated response
        allSubDetails = apiData.content;
      } else if (apiData.allSubDetails) {
        // Non-paginated response
        allSubDetails = apiData.allSubDetails;
      }
    }

    if (!allSubDetails) {
      return [];
    }

    const blockMap = new Map();
    const municipalityZones = [];
    const corporationZones = [];
    const unassignedZones = [];

    Object.entries(allSubDetails).forEach(([zoneName, details]) => {
      const blockName = details.blockName;
      const blockId = details.blockId;

      const stats = getZoneStats(details);

      const zoneData = {
        zoneId: details.zoneId,
        zoneName: zoneName,
        completed: stats.completed,
        ongoing: stats.ongoing,
        notStarted: stats.notStarted,
        underReview: stats.underReview
      };

      // If block is null, categorize as Municipality or Corporation
      if (!blockId || !blockName) {
        // Check if zone name contains Municipality or Corporation keyword
        const zoneNameLower = zoneName.toLowerCase();
        if (zoneNameLower.includes('municipality')) {
          municipalityZones.push(zoneData);
        } else if (zoneNameLower.includes('corporation')) {
          corporationZones.push(zoneData);
        } else {
          // If no keyword found, default to Unassigned
          unassignedZones.push(zoneData);
        }
        return;
      }

      if (!blockMap.has(blockName)) {
        blockMap.set(blockName, {
          blockId: blockId,
          blockName: blockName,
          zones: []
        });
      }

      blockMap.get(blockName).zones.push(zoneData);
    });

    // Convert grouped blocks
    const blocks = Array.from(blockMap.values()).sort((a, b) =>
      a.blockName.localeCompare(b.blockName)
    );

    // Sort zones inside blocks
    blocks.forEach(block => {
      block.zones.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
    });

    // Add Municipality group if exists
    if (municipalityZones.length > 0) {
      blocks.push({
        blockId: null,
        blockName: 'Municipality',
        isUnassigned: false,
        isMunicipality: true,
        zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    // Add Corporation group if exists
    if (corporationZones.length > 0) {
      blocks.push({
        blockId: null,
        blockName: 'Corporation',
        isUnassigned: false,
        isCorporation: true,
        zones: corporationZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    // Add Unassigned group if exists
    if (unassignedZones.length > 0) {
      blocks.push({
        blockId: null,
        blockName: 'Unassigned',
        isUnassigned: true,
        zones: unassignedZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    return blocks;
  }, [apiData, landType]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let ongoing = 0;
    let notStarted = 0;
    let underReview = 0;

    processedData.forEach(block => {
      block.zones.forEach(zone => {
        total += (zone.completed + zone.ongoing + zone.notStarted + zone.underReview);
        completed += zone.completed;
        ongoing += zone.ongoing;
        notStarted += zone.notStarted;
        underReview += zone.underReview;
      });
    });

    return { total, completed, ongoing, notStarted, underReview };
  }, [processedData]);

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
          id: `${block.blockId || 'no_block'}_zone_${zone.zoneId}`,
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
          isUnassigned: block.isUnassigned || false,
          isMunicipality: block.isMunicipality || false,
          isCorporation: block.isCorporation || false
        });
      });

      // Add subtotal for all blocks (including Municipality, Corporation, Unassigned)
      result.push({
        type: 'subtotal',
        id: `block_${block.blockId || block.blockName}_subtotal`,
        blockId: block.blockId,
        blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        total: blockTotal,
        completed: blockCompleted,
        ongoing: blockOngoing,
        notStarted: blockNotStarted,
        underReview: blockUnderReview,
        isSubtotal: true,
        isMunicipality: block.isMunicipality || false,
        isCorporation: block.isCorporation || false,
        isUnassigned: block.isUnassigned || false
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

  // Fetch data when filters change
  useEffect(() => {
    fetchZoneWiseData();
  }, [landType, fromMonth, toMonth, singleMonth, filterType, apiPage]);

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
    setFromMonth('');
    setToMonth('');
    setSingleMonth('');
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('range');
    setPage(0);
    setApiPage(0);
  };

  const handleSeasonTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSeasonTab(newValue);
      if (newValue === 'ALL') {
        setLandType(null);
      } else {
        setLandType(newValue);
      }
      setPage(0);
      setApiPage(0);
    }
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setFilterType(newValue);
      setFromMonth('');
      setToMonth('');
      setSingleMonth('');
      setPage(0);
      setApiPage(0);
    }
  };

  const handleViewZoneDetails = (zoneName, zoneId) => {
    // Navigate to cluster level or show details
    console.log(`View details for ${zoneName}`, zoneId);
    // You can implement navigation to cluster details page here
    alert(`Viewing details for ${zoneName} (Feature coming soon)`);
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

  // Format display names
  const formattedTaluk = talukName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 
                         location.state?.talukName || 'Taluk';

  // Loading state
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
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} Taluk - Zone wise Cluster Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {landType && landType !== 'ALL' && ` • ${landType} Season`}
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {apiData && ` • Total Zones: ${totalElements || Object.keys(apiData.allSubDetails || {}).length}`}
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

      {/* Error Message */}
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
                    <Select value={fromMonth} label="From Month" onChange={(e) => { setFromMonth(e.target.value); setPage(0); setApiPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={(e) => { setToMonth(e.target.value); setPage(0); setApiPage(0); }}>
                      <MenuItem value="">None</MenuItem>
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
                    onChange={(e) => { setSingleMonth(e.target.value); setPage(0); setApiPage(0); }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
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
                label="Total Zones"
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
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

            {searchFilteredData.length > 0 && !loading && (
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
          </MainCard>
        </Box>
      </Grid>

    </Grid>
  );
}

export default ZoneClusterReport;
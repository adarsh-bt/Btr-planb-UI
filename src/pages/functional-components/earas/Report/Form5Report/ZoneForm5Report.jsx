// ZoneForm5Report.js
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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import CancelIcon from '@mui/icons-material/Cancel';
import HubIcon from '@mui/icons-material/Hub';
import GrassIcon from '@mui/icons-material/Grass';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import api from 'api/api';

// Gateway root
const BASE_URL = mainapi.FORM_API;

/* ─────────────────────────── helpers ─────────────────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

function getDefaultSingleMonth(agriYearMonths) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return agriYearMonths.some((m) => m.value === current) ? current : agriYearMonths[0]?.value || '';
}

function monthNum(value) {
  return value ? parseInt(value.split('-')[1], 10) : null;
}

const SESSION_KEY = 'zoneForm5ReportState';

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Fallback zones for a taluk
function getFallbackZones(talukId) {
  return [
    { zoneId: 1, zoneName: 'Zone 1', blockName: 'Block A' },
    { zoneId: 2, zoneName: 'Zone 2', blockName: 'Block A' },
    { zoneId: 3, zoneName: 'Zone 3', blockName: 'Block B' },
    { zoneId: 4, zoneName: 'Zone 4', blockName: 'Block B' },
    { zoneId: 5, zoneName: 'Zone 5', blockName: 'Block C' }
  ];
}

/* ─────────────────────────── component ─────────────────────────── */

function ZoneForm5Report() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, [location.state]);

  const resolvedTalukId = useRef(null);

  const resolveTalukId = () => {
    if (stateData.talukId) return stateData.talukId;
    if (stateData.talukOfficeId) return stateData.talukOfficeId;
    if (routeTalukId && !isNaN(routeTalukId)) return parseInt(routeTalukId, 10);
    if (talukName && talukName.includes('-')) {
      const parts = talukName.split('-');
      const possible = parts[parts.length - 1];
      if (!isNaN(possible)) return parseInt(possible, 10);
    }
    return null;
  };

  if (resolvedTalukId.current === null) {
    resolvedTalukId.current = resolveTalukId();
  }

  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';
  const agriYearMonths = useMemo(() => getAgriYearMonths(agriculturalYear), [agriculturalYear]);
  const defaultSingleMonth = useMemo(() => getDefaultSingleMonth(agriYearMonths), [agriYearMonths]);
  const monthLabel = (value) => agriYearMonths.find((m) => m.value === value)?.label || '';

  const [cropName, setCropName] = useState(stateData.cropName || 'ALL');
  const [cropOptions, setCropOptions] = useState([]);

  const [filterType, setFilterType] = useState(stateData.filterType || 'single');
  const [singleMonth, setSingleMonth] = useState(
    stateData.singleMonth !== undefined && stateData.filterType ? stateData.singleMonth : defaultSingleMonth
  );
  const [fromMonth, setFromMonth] = useState(stateData.fromMonth || '');
  const [toMonth, setToMonth] = useState(stateData.toMonth || '');

  const [apiData, setApiData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterZonesLoading, setMasterZonesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (resolvedTalukId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId: resolvedTalukId.current,
          talukName: stateData.talukName || talukName || '',
          districtId: stateData.districtId || null,
          districtName: stateData.districtName || districtName || '',
          cropName: stateData.cropName || 'ALL',
          agriculturalYear: stateData.agriculturalYear || '2025-2026',
          filterType: stateData.filterType || 'single',
          singleMonth: stateData.singleMonth || '',
          fromMonth: stateData.fromMonth || '',
          toMonth: stateData.toMonth || ''
        })
      );
    }
  }, []);

  /* ─────────────────────────── fetch master zones ─────────────────────────── */

  const fetchMasterZones = async (talukId) => {
    setMasterZonesLoading(true);
    try {
      let response = null;

      try {
        response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/zones?desTalukId=${talukId}`);
        console.log('Master Zones Response (attempt 1):', response.data);
      } catch (err) {
        console.log('Attempt 1 failed, trying alternative endpoint...');
      }

      if (!response || !response.data) {
        try {
          response = await api.get(`${BASE_URL}/earas-form1-entry/api/zones?talukId=${talukId}`);
          console.log('Master Zones Response (attempt 2):', response.data);
        } catch (err) {
          console.log('Attempt 2 failed, trying alternative endpoint...');
        }
      }

      if (response && response.data) {
        let zones = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          zones = response.data.data;
        } else if (Array.isArray(response.data)) {
          zones = response.data;
        } else if (response.data.zones && Array.isArray(response.data.zones)) {
          zones = response.data.zones;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          zones = response.data.content;
        }

        if (zones.length > 0) {
          console.log('Setting zones list:', zones);
          setZonesList(zones);
        } else {
          console.warn('No zones found in response, using fallback');
          setZonesList(getFallbackZones(talukId));
        }
      } else {
        console.warn('No response data received, using fallback');
        setZonesList(getFallbackZones(talukId));
      }
    } catch (err) {
      console.error('Error fetching master zones list:', err);
      setZonesList(getFallbackZones(talukId));
    } finally {
      setMasterZonesLoading(false);
    }
  };

  /* ─────────────────────────── fetch ─────────────────────────── */

  const fetchZoneWiseData = async () => {
    const talukIdValue = resolvedTalukId.current;

    if (!talukIdValue) {
      setError('Taluk ID is required. Please navigate from the taluk report page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      let url = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary`;
      const params = new URLSearchParams();

      params.append('agriYear', agriculturalYear);

      if (filterType === 'single') {
        const start = monthNum(singleMonth) || monthNum(defaultSingleMonth);
        params.append('startMonth', start);
      } else {
        const start = monthNum(fromMonth) || monthNum(agriYearMonths[0]?.value);
        params.append('startMonth', start);
        if (toMonth) params.append('endMonth', monthNum(toMonth));
      }

      params.append('talukId', talukIdValue);

      url += `?${params.toString()}`;
      console.log('Fetching zone Form 5 data from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('API response:', response.data);

      if (response.data) {
        setApiData(response.data);
        setTotalElements(Array.isArray(response.data.zones) ? response.data.zones.length : 0);

        if (cropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
    } catch (err) {
      console.error('Error fetching zone Form 5 data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('Taluk not found.');
      else setError(err.response?.data?.message || err.message || 'Failed to fetch zone data');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    if (resolvedTalukId.current) {
      fetchMasterZones(resolvedTalukId.current);
    }
  }, []);

  useEffect(() => {
    fetchZoneWiseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const processedData = useMemo(() => {
    const apiZones = Array.isArray(apiData?.zones) ? apiData.zones : [];

    const apiDataMap = {};
    apiZones.forEach(z => {
      const key = z.zoneName?.toLowerCase() || '';
      apiDataMap[key] = z;
    });

    let mergedZones = [];
    if (zonesList && zonesList.length > 0) {
      mergedZones = zonesList.map((zone) => {
        const zoneName = zone.zoneName || zone.zoneNameEn || zone.name || '';
        const apiData = apiDataMap[zoneName.toLowerCase()] || {};

        const hasData = (apiData.allowedCCECrops || 0) > 0 ||
          (apiData.selectedCce || 0) > 0 ||
          (apiData.completed || 0) > 0 ||
          (apiData.ongoing || 0) > 0 ||
          (apiData.notAvailable || 0) > 0 ||
          (apiData.notStarted || 0) > 0 ||
          (apiData.underReview || 0) > 0;

        return {
          zoneId: zone.zoneId || zone.id || apiData.zoneId || `zone_${Math.random()}`,
          zoneName: zoneName || 'Unknown Zone',
          blockId: zone.blockId || apiData.blockId || null,
          blockName: zone.blockName || apiData.blockName || 'Unassigned',
          allowtedCce: apiData.allowedCCECrops || 0,
          selectedCce: apiData.selectedCce || 0,
          completed: apiData.completed || 0,
          ongoing: apiData.ongoing || 0,
          notAvailable: apiData.notAvailable || 0,
          notStarted: apiData.notStarted || 0,
          underReview: apiData.underReview || 0,
          hasData: hasData
        };
      });
    } else {
      mergedZones = apiZones.map((z) => ({
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        blockId: z.blockId,
        blockName: z.blockName || 'Unassigned',
        allowtedCce: z.allowedCCECrops || 0,
        selectedCce: z.selectedCce || 0,
        completed: z.completed || 0,
        ongoing: z.ongoing || 0,
        notAvailable: z.notAvailable || 0,
        notStarted: z.notStarted || 0,
        underReview: z.underReview || 0,
        hasData: (z.allowedCCECrops || 0) > 0 ||
          (z.selectedCce || 0) > 0 ||
          (z.completed || 0) > 0 ||
          (z.ongoing || 0) > 0 ||
          (z.notAvailable || 0) > 0 ||
          (z.notStarted || 0) > 0 ||
          (z.underReview || 0) > 0
      }));
    }

    // Group by block - only zones, no subtotals
    const blockMap = new Map();
    const municipalityZones = [];
    const corporationZones = [];
    const unassignedZones = [];

    mergedZones.forEach((z) => {
      const zoneData = {
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        allowtedCce: z.allowtedCce,
        selectedCce: z.selectedCce,
        completed: z.completed,
        ongoing: z.ongoing,
        notAvailable: z.notAvailable,
        notStarted: z.notStarted,
        underReview: z.underReview,
        hasData: z.hasData
      };

      if (!z.blockId || !z.blockName || z.blockName === 'Unassigned') {
        const lower = (z.zoneName || '').toLowerCase();
        if (lower.includes('municipality')) municipalityZones.push(zoneData);
        else if (lower.includes('corporation')) corporationZones.push(zoneData);
        else unassignedZones.push(zoneData);
        return;
      }

      if (!blockMap.has(z.blockName)) {
        blockMap.set(z.blockName, { blockId: z.blockId, blockName: z.blockName, zones: [] });
      }
      blockMap.get(z.blockName).zones.push(zoneData);
    });

    const blocks = Array.from(blockMap.values()).sort((a, b) => a.blockName.localeCompare(b.blockName));
    blocks.forEach((b) => b.zones.sort((a, z) => a.zoneName.localeCompare(z.zoneName)));

    if (municipalityZones.length)
      blocks.push({
        blockId: null,
        blockName: 'Municipality',
        isMunicipality: true,
        zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    if (corporationZones.length)
      blocks.push({
        blockId: null,
        blockName: 'Corporation',
        isCorporation: true,
        zones: corporationZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    if (unassignedZones.length)
      blocks.push({
        blockId: null,
        blockName: 'Unassigned',
        isUnassigned: true,
        zones: unassignedZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });

    return blocks;
  }, [apiData, zonesList]);

  const zonesWithNoData = useMemo(() => {
    let count = 0;
    processedData.forEach(block => {
      block.zones.forEach(zone => {
        if (!zone.hasData) count++;
      });
    });
    return count;
  }, [processedData]);

  const stats = useMemo(
    () => ({
      allowtedCce: apiData?.allowedCCECrops || 0,
      selectedCce: apiData?.selectedCce || 0,
      completed: apiData?.completed || 0,
      ongoing: apiData?.ongoing || 0,
      notAvailable: apiData?.notAvailable || 0,
      notStarted: apiData?.notStarted || 0,
      underReview: apiData?.underReview || 0
    }),
    [apiData]
  );

  // Flatten table data - only zones, no subtotals
  const flattenedTableData = useMemo(() => {
    const result = [];
    processedData.forEach((block) => {
      block.zones.forEach((zone) => {
        result.push({
          type: 'zone',
          id: `${block.blockId || 'nb'}_zone_${zone.zoneId}`,
          blockId: block.blockId,
          blockName: block.blockName,
          zoneName: zone.zoneName,
          allowtedCce: zone.allowtedCce,
          selectedCce: zone.selectedCce,
          completed: zone.completed,
          ongoing: zone.ongoing,
          notAvailable: zone.notAvailable,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          zoneId: zone.zoneId,
          hasData: zone.hasData,
          isUnassigned: block.isUnassigned || false,
          isMunicipality: block.isMunicipality || false,
          isCorporation: block.isCorporation || false
        });
      });
    });
    return result;
  }, [processedData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return flattenedTableData;
    return flattenedTableData.filter(
      (r) =>
        r.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedTableData, searchTerm]);

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
      setSingleMonth(defaultSingleMonth);
      setFromMonth('');
      setToMonth('');
    } else {
      setFromMonth(agriYearMonths[0]?.value || '');
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setCropName('ALL');
    setFilterType('single');
    setSingleMonth(defaultSingleMonth);
    setFromMonth('');
    setToMonth('');
    setPage(0);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleViewZoneDetails = (zoneName, clickedZoneId, hasData) => {
    if (!hasData) return;

    navigate('/schemes/earas/cce/Form5', {
      state: {
        zoneId: clickedZoneId,
        zoneName,
        talukId: resolvedTalukId.current,
        talukName: stateData.talukName,
        districtId: stateData.districtId,
        districtName: stateData.districtName,
        cropName: cropName !== 'ALL' ? cropName : null,
        agriculturalYear,
        filterType,
        singleMonth,
        fromMonth,
        toMonth,
        startMonth: filterType === 'single' ? singleMonth : fromMonth,
        endMonth: filterType === 'single' ? singleMonth : toMonth,
        from: 'zoneForm5Report'
      }
    });
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

  const formattedTaluk =
    stateData.talukName ||
    (talukName
      ? talukName
        .replace(/-\d+$/, '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : 'Taluk');

  if ((loading || masterZonesLoading) && !apiData && zonesList.length === 0) {
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

      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} Taluk – Zone wise CCE Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`Agricultural Year: ${agriculturalYear}`}
                {filterType === 'single' && singleMonth && ` • ${monthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${monthLabel(fromMonth)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${monthLabel(toMonth)}`}
                {cropName !== 'ALL' && ` • Crop: ${cropName}`}
                {apiData && ` • Total Zones: ${totalElements}`}
                {zonesWithNoData > 0 && ` • ${zonesWithNoData} zones with no data`}
              </Typography>
            </Box>
          </Stack>
          {(cropName !== 'ALL' || fromMonth || toMonth || (filterType === 'single' && singleMonth !== defaultSingleMonth)) && (
            <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />} size="small" sx={{ borderRadius: 2 }}>
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        </Grid>
      )}

      {zonesWithNoData > 0 && !loading && (
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
              <strong>{zonesWithNoData}</strong> zone{zonesWithNoData > 1 ? 's' : ''} have no data available for the selected filters.
              <strong> View details is disabled for zones without data.</strong>
            </Typography>
          </Paper>
        </Grid>
      )}

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

      <Grid item xs={12}>
        <Box sx={{ position: 'relative', border: `1px solid ${alpha('#04255e', 0.15)}`, borderRadius: 3, p: 2, pt: 3, bgcolor: '#fff' }}>
          <Chip
            label={`${formattedTaluk} – Taluk Report Summary`}
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
            {[
              { label: 'Allowted CCE', value: stats.allowtedCce, color: '#1565c0', icon: <HubIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
              { label: 'Selected CCE', value: stats.selectedCce, color: '#04255e', icon: <AssessmentIcon sx={{ fontSize: 32, color: '#04255e', opacity: 0.7 }} /> },
              { label: 'Completed', value: stats.completed, color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} /> },
              { label: 'Ongoing', value: stats.ongoing, color: '#ed6c02', icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} /> },
              { label: 'Not Available', value: stats.notAvailable, color: '#c62828', icon: <CancelIcon sx={{ fontSize: 32, color: '#c62828', opacity: 0.7 }} /> },
              { label: 'Not Started', value: stats.notStarted, color: '#757575', icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} /> },
              { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} /> }
            ].map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={4} lg key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

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
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
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
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {[
                      '#',
                      'Block',
                      'Zone',
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
                        align={idx === 0 ? 'center' : idx === 1 ? 'center' : idx === 2 ? 'left' : 'center'}
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          py: 1.5,
                          border: 'none',
                          whiteSpace: 'nowrap',
                          ...(idx === 1 && { minWidth: 160 }),
                          ...(idx === 2 && { minWidth: 180 })
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    (() => {
                      const rows = [];
                      let lastBlockName = '';
                      let serialNumber = page * rowsPerPage;

                      for (let i = 0; i < paginatedData.length; i++) {
                        const row = paginatedData[i];
                        const isNewBlock = row.blockName !== lastBlockName;
                        const hasNoData = !row.hasData;

                        if (isNewBlock) lastBlockName = row.blockName;
                        serialNumber++;

                        const blockRowCount = paginatedData.filter((r) => r.blockName === row.blockName).length;

                        rows.push(
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
                            <TableCell align="center" sx={{ border: 'none' }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {serialNumber}
                              </Typography>
                            </TableCell>

                            {isNewBlock ? (
                              <TableCell
                                rowSpan={blockRowCount}
                                align="center"
                                sx={{
                                  verticalAlign: 'middle',
                                  backgroundColor: alpha('#04255e', 0.04),
                                  fontWeight: 'bold',
                                  color: '#04255e',
                                  fontSize: '1rem',
                                  border: 'none'
                                }}
                              >
                                <Stack direction="column" spacing={1} alignItems="center">
                                  <LocationOnIcon sx={{ fontSize: 24, color: '#04255e', opacity: 0.7 }} />
                                  <Typography fontWeight={700} sx={{ color: '#04255e' }}>
                                    {row.blockName}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            ) : null}

                            <TableCell sx={{ border: 'none' }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <StoreIcon sx={{ fontSize: 18, color: hasNoData ? '#ff9800' : '#04255e', opacity: 0.7 }} />
                                <Typography fontWeight={hasNoData ? 400 : 500} color={hasNoData ? 'text.secondary' : 'text.primary'}>
                                  {row.zoneName}
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

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : (
                                <Chip
                                  label={row.allowtedCce}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.selectedCce > 0 ? (
                                <Chip
                                  label={row.selectedCce}
                                  size="small"
                                  variant="outlined"
                                  sx={{ color: '#04255e', borderColor: alpha('#04255e', 0.4), fontWeight: 600 }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {row.selectedCce}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.completed > 0 ? (
                                <Chip label={row.completed} size="small" color="success" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {row.completed}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.ongoing > 0 ? (
                                <Chip label={row.ongoing} size="small" color="primary" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {row.ongoing}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.notAvailable > 0 ? (
                                <Chip label={row.notAvailable} size="small" color="error" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {row.notAvailable}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.notStarted > 0 ? (
                                <Chip label={row.notStarted} size="small" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {row.notStarted}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.underReview > 0 ? (
                                <Chip label={row.underReview} size="small" color="warning" variant="outlined" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {row.underReview}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {row.hasData ? (
                                <Tooltip title="View CCE Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId, row.hasData)}
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
                      }
                      return rows;
                    })()
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
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
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
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

export default ZoneForm5Report;
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
  IconButton,
  TablePagination
} from '@mui/material';
import { LocationOn, ArrowBack } from '@mui/icons-material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import WaterIcon from '@mui/icons-material/Water';
import GrassIcon from '@mui/icons-material/Grass';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;
const SESSION_KEY = 'clusterForm3AState';

// Column widths
const CLUSTER_W = 160;
const AREA_W = 120;
const CROP_W = 150;

// Land type filter — WET / DRY / ALL
const DEFAULT_LAND_TYPE = 'ALL';
const LAND_TYPE_PARAM = { WET: 'Wet', DRY: 'Dry' };

// Season filter
const SEASONS = [
  { id: 1, name: 'Autumn' },
  { id: 2, name: 'Winter' },
  { id: 3, name: 'Summer' }
];
const DEFAULT_SEASON_ID = 1;

// Irrigation filter
const DEFAULT_IRRIGATION = 'ALL';
const IRRIGATION_PARAM = { IRRIGATED: 'true', UNIRRIGATED: 'false' };
const IRRIGATION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'IRRIGATED', label: 'Irrigated' },
  { value: 'UNIRRIGATED', label: 'Unirrigated' }
];

// Static crop groups
const CROP_GROUPS = [
  { id: 1, name: 'Food crops' },
  { id: 2, name: 'Non food crops' },
  { id: 3, name: 'Trees' },
  { id: 4, name: 'Aromatic plants' },
  { id: 5, name: 'Drugs and Narcotics' },
  { id: 6, name: 'Cereals' },
  { id: 7, name: 'Fibre' },
  { id: 8, name: 'Flowers' },
  { id: 9, name: 'Fodder crops' },
  { id: 10, name: 'Fruits' },
  { id: 11, name: 'Grains' },
  { id: 12, name: 'Green manure crops' },
  { id: 13, name: 'Medicinal plants' },
  { id: 14, name: 'Oil seeds' },
  { id: 15, name: 'Other medicinal plants' },
  { id: 16, name: 'Other trees' },
  { id: 17, name: 'Plantation crops' },
  { id: 18, name: 'Pulses' },
  { id: 19, name: 'Spices' },
  { id: 20, name: 'Sugar crops' },
  { id: 21, name: 'Tubers' },
  { id: 22, name: 'Vegetables' },
  { id: 23, name: 'Dry fruit' }
];

const ALL_CROP_GROUPS = -1;
const ALL_CROP_GROUPS_LABEL = 'All Crop Groups';
const FETCH_BATCH_SIZE = 6;

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Merge one or more crop-group responses into a single cluster list
function mergeGroupResponses(responses) {
  const clusters = new Map();

  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((c) => {
      const key = c.clusterId ?? `num:${c.clusterNumber || 'Unassigned'}`;
      if (!clusters.has(key)) {
        clusters.set(key, {
          clusterId: c.clusterId ?? null,
          clusterNumber: c.clusterNumber,
          clusterArea: Number(c.clusterArea) || 0,
          nucArea: Number(c.nucArea) || 0,
          ffsArea: Number(c.ffsArea) || 0,
          cosArea: Number(c.cosArea) || 0,
          crops: new Map()
        });
      }
      const entry = clusters.get(key);
      if (!entry.clusterArea && c.clusterArea) entry.clusterArea = Number(c.clusterArea) || 0;
      if (!entry.nucArea && c.nucArea) entry.nucArea = Number(c.nucArea) || 0;
      if (!entry.ffsArea && c.ffsArea) entry.ffsArea = Number(c.ffsArea) || 0;
      if (!entry.cosArea && c.cosArea) entry.cosArea = Number(c.cosArea) || 0;

      (c.crops || []).forEach((crop) => {
        const existing = entry.crops.get(crop.cropId);
        if (existing) {
          existing.areaInCents = (Number(existing.areaInCents) || 0) + (Number(crop.areaInCents) || 0);
        } else {
          entry.crops.set(crop.cropId, {
            cropId: crop.cropId,
            cropName: crop.cropName,
            areaInCents: Number(crop.areaInCents) || 0
          });
        }
      });
    });
  });

  return Array.from(clusters.values()).map((c) => ({
    clusterId: c.clusterId,
    clusterNumber: c.clusterNumber,
    clusterArea: c.clusterArea,
    nucArea: c.nucArea,
    ffsArea: c.ffsArea,
    cosArea: c.cosArea,
    crops: Array.from(c.crops.values())
  }));
}

const ClusterForm3A = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const officeInfo = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('userOfficeInfo') || '{}');
    } catch {
      return {};
    }
  }, []);

  const districtId = stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null;
  const districtName = stateData.districtName || stateData.selectedDistrict || officeInfo.districtName || 'District';
  const talukId = stateData.talukId || officeInfo.talukOfficeId || officeInfo.talukId || null;
  const talukName = stateData.talukName || stateData.selectedTaluk || officeInfo.talukName || 'Taluk';
  const blockId = stateData.blockId || null;
  const blockName = stateData.blockName || stateData.selectedBlock || 'Block';
  const zoneId = stateData.zoneId || null;
  const zoneName = stateData.zoneName || stateData.selectedZone || 'Zone';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? 0);
  const [landTypeTab, setLandTypeTab] = useState(stateData.landType ?? DEFAULT_LAND_TYPE);
  const [seasonId, setSeasonId] = useState(stateData.seasonId ?? DEFAULT_SEASON_ID);
  const [irrigation, setIrrigation] = useState(stateData.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const isAllCropGroups = activeTab === ALL_CROP_GROUPS;
  const cropGroupId = isAllCropGroups ? null : CROP_GROUPS[activeTab]?.id;
  const cropGroupName = isAllCropGroups ? ALL_CROP_GROUPS_LABEL : CROP_GROUPS[activeTab]?.name;
  const seasonName = SEASONS.find((s) => s.id === seasonId)?.name || '';
  const irrigationLabel = IRRIGATION_OPTIONS.find((o) => o.value === irrigation)?.label || '';

  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        officeType: stateData.officeType,
        districtId,
        districtName,
        talukId,
        talukName,
        blockId,
        blockName,
        zoneId,
        zoneName,
        agriculturalYear,
        activeTab,
        landType: landTypeTab,
        seasonId,
        irrigation
      })
    );
  }, [stateData.officeType, districtId, districtName, talukId, talukName, blockId, blockName, zoneId, zoneName, agriculturalYear, activeTab, landTypeTab, seasonId, irrigation]);

  /* ─────────────────── fetch cluster report data ─────────────────── */

  useEffect(() => {
    if (!zoneId) return;
    if (!isAllCropGroups && !cropGroupId) return;

    let cancelled = false;

    const buildUrl = (groupId) => {
      const params = new URLSearchParams({
        agriYear: agriculturalYear,
        cropGroupId: String(groupId),
        zoneId: String(zoneId)
      });
      const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
      if (landTypeParam) params.append('landType', landTypeParam);
      params.append('seasonId', String(seasonId));

      const irrigationParam = IRRIGATION_PARAM[irrigation];
      if (irrigationParam) params.append('isIrrigated', irrigationParam);
      console.log("api >>  ", `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/cluster?${params.toString()}`)
      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/cluster?${params.toString()}`;
    };

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const headers = { Authorization: `Bearer ${token}` };
        const groupIds = isAllCropGroups ? CROP_GROUPS.map((g) => g.id) : [cropGroupId];

        const payloads = [];
        for (let i = 0; i < groupIds.length; i += FETCH_BATCH_SIZE) {
          const batch = groupIds.slice(i, i + FETCH_BATCH_SIZE);
          // eslint-disable-next-line no-await-in-loop
          const responses = await Promise.all(batch.map((id) => axios.get(buildUrl(id), { headers })));
          if (cancelled) return;
          responses.forEach((r) => payloads.push(r.data));
        }

        if (cancelled) return;
        setApiData(mergeGroupResponses(payloads));
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching Cluster Form 3A data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Zone data not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGroupData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, isAllCropGroups, zoneId, agriculturalYear, landTypeTab, seasonId, irrigation]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((c) =>
      (c.crops || []).forEach((crop) => {
        if (!map.has(crop.cropId)) map.set(crop.cropId, { cropId: crop.cropId, cropName: cleanName(crop.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  const clusterRows = useMemo(() => {
    const list = apiData.map((c) => {
      const byId = {};
      (c.crops || []).forEach((crop) => {
        byId[crop.cropId] = Number(crop.areaInCents) || 0;
      });
      return {
        clusterId: c.clusterId ?? null,
        clusterNumber: c.clusterNumber || 'Unassigned',
        clusterArea: Number(c.clusterArea) || 0,
        nucArea: Number(c.nucArea) || 0,
        ffsArea: Number(c.ffsArea) || 0,
        cosArea: Number(c.cosArea) || 0,
        byId
      };
    });

    return list.sort((a, b) => {
      const numA = parseInt(a.clusterNumber, 10);
      const numB = parseInt(b.clusterNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.clusterNumber.localeCompare(b.clusterNumber);
    });
  }, [apiData]);

  const areaTotals = useMemo(() => {
    let clusterArea = 0;
    let nucArea = 0;
    let ffsArea = 0;
    let cosArea = 0;
    clusterRows.forEach((row) => {
      clusterArea += row.clusterArea || 0;
      nucArea += row.nucArea || 0;
      ffsArea += row.ffsArea || 0;
      cosArea += row.cosArea || 0;
    });
    return { clusterArea, nucArea, ffsArea, cosArea };
  }, [clusterRows]);

  const cropTotals = useMemo(() => {
    const totals = {};
    cropColumns.forEach((c) => (totals[c.cropId] = 0));
    clusterRows.forEach((row) => {
      cropColumns.forEach((c) => {
        if (row.byId[c.cropId] !== undefined) totals[c.cropId] += row.byId[c.cropId];
      });
    });
    return totals;
  }, [clusterRows, cropColumns]);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleCropGroupChange = (event) => {
    setActiveTab(Number(event.target.value));
    setPage(0);
  };

  const handleLandTypeChange = (event, newValue) => {
    if (newValue === null || newValue === undefined) return;
    setLandTypeTab(newValue);
    setPage(0);
  };

  const handleSeasonChange = (event) => {
    setSeasonId(Number(event.target.value));
    setPage(0);
  };

  const handleIrrigationChange = (event) => {
    setIrrigation(event.target.value);
    setPage(0);
  };

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = useMemo(
    () => clusterRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [clusterRows, page, rowsPerPage]
  );

  const handleBack = () => {
    navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId,
        districtName,
        selectedDistrict: districtName,
        talukId,
        talukName,
        selectedTaluk: talukName,
        blockId,
        blockName,
        selectedBlock: blockName,
        cropGroupId,
        cropGroupName,
        agriculturalYear,
        landType: landTypeTab,
        seasonId,
        irrigation,
        activeTab
      }
    });
  };

  const TABLE_MIN_W = CLUSTER_W + 4 * AREA_W + Math.max(cropColumns.length, 1) * CROP_W;

  /* ─────────────────────────── render ─────────────────────────── */

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Breadcrumb />
      </Box>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <IconButton onClick={handleBack} size="small" sx={{ color: themeColor }}>
              <ArrowBack />
            </IconButton>
            <LocationOn sx={{ fontSize: 32, color: themeColor }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
              {zoneName} Zone ({blockName} Block, {talukName} Taluk, {districtName} District) - Cluster-wise Crop Area Report (Form 3A)
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
              Agricultural Year: {agriculturalYear} • Area in Cents
              {cropGroupName && ` • ${cropGroupName}`}
              {landTypeTab !== 'ALL' && ` • ${landTypeTab} Land`}
              {seasonName && ` • ${seasonName} Season`}
              {irrigation !== 'ALL' && ` • ${irrigationLabel}`}
            </Typography>
          </Box>

          {/* Filters — crop group + land type + season + irrigation */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Land type filter — ALL / WET / DRY */}
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                display: 'inline-block'
              }}
            >
              <Tabs
                value={landTypeTab}
                onChange={handleLandTypeChange}
                sx={{
                  minHeight: 40,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 40,
                    '&.Mui-selected': { color: themeColor }
                  },
                  '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
                }}
              >
                <Tab label="ALL" value="ALL" />
                <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
                <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
              </Tabs>
            </Paper>

            {/* Crop group filter — All + one entry per tbl_master_crop_group row */}
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel id="cluster-form3a-cropgroup-label">Crop Group</InputLabel>
              <Select
                labelId="cluster-form3a-cropgroup-label"
                id="cluster-form3a-cropgroup"
                value={activeTab}
                label="Crop Group"
                onChange={handleCropGroupChange}
                MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GrassIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                    {value === ALL_CROP_GROUPS ? ALL_CROP_GROUPS_LABEL : CROP_GROUPS[value]?.name || ''}
                  </Box>
                )}
              >
                <MenuItem value={ALL_CROP_GROUPS}>All</MenuItem>
                {CROP_GROUPS.map((g, index) => (
                  <MenuItem key={g.id} value={index}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Season filter — Autumn / Winter / Summer */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="cluster-form3a-season-label">Season</InputLabel>
              <Select
                labelId="cluster-form3a-season-label"
                id="cluster-form3a-season"
                value={seasonId}
                label="Season"
                onChange={handleSeasonChange}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EnergySavingsLeafIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                    {SEASONS.find((s) => s.id === value)?.name || ''}
                  </Box>
                )}
              >
                {SEASONS.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Irrigation filter — All / Irrigated / Unirrigated */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="cluster-form3a-irrigation-label">Irrigation</InputLabel>
              <Select
                labelId="cluster-form3a-irrigation-label"
                id="cluster-form3a-irrigation"
                value={irrigation}
                label="Irrigation"
                onChange={handleIrrigationChange}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WaterIcon sx={{ fontSize: 20, color: value === 'UNIRRIGATED' ? '#9e9e9e' : '#0288d1' }} />
                    {IRRIGATION_OPTIONS.find((o) => o.value === value)?.label || ''}
                  </Box>
                )}
              >
                {IRRIGATION_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Error */}
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
              <Typography color="error">Error: {error}</Typography>
            </Paper>
          )}

          {/* Table Section — Cluster Number, Cluster Area, Nuc Area, Ffs Area, Cos Area, <crop columns...> */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(themeColor, 0.1)}`,
              position: 'relative'
            }}
          >
            {loading && (
              <LinearProgress
                sx={{
                  backgroundColor: alpha(themeColor, 0.15),
                  '& .MuiLinearProgress-bar': { backgroundColor: themeColor }
                }}
              />
            )}
            <Box sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  size="small"
                  sx={{ width: '100%', minWidth: TABLE_MIN_W, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
                >
                  <colgroup>
                    <col style={{ width: CLUSTER_W }} />
                    <col style={{ width: AREA_W }} />
                    <col style={{ width: AREA_W }} />
                    <col style={{ width: AREA_W }} />
                    <col style={{ width: AREA_W }} />
                    {cropColumns.map((c) => (
                      <col key={c.cropId} style={{ width: CROP_W }} />
                    ))}
                    <col style={{ width: 'auto' }} />
                  </colgroup>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="left"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5,
                          position: 'sticky',
                          left: 0,
                          zIndex: 3
                        }}
                      >
                        Cluster No.
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5
                        }}
                      >
                        Cluster Area
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5
                        }}
                      >
                        Nuc Area
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5
                        }}
                      >
                        Ffs Area
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5
                        }}
                      >
                        Cos Area
                      </TableCell>
                      {cropColumns.map((crop) => (
                        <TableCell
                          key={crop.cropId}
                          align="right"
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            py: 1.5
                          }}
                        >
                          {crop.cropName}
                        </TableCell>
                      ))}
                      <TableCell aria-hidden sx={{ backgroundColor: themeColor, padding: 0 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={Math.max(cropColumns.length + 6, 8)} align="center" sx={{ py: 10 }}>
                          <Stack alignItems="center" spacing={2} sx={{ my: 2 }}>
                            <CircularProgress size={44} thickness={4} sx={{ color: themeColor }} />
                            <Box textAlign="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColor }}>
                                Loading Cluster Form 3A Report...
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Please wait while we fetch the latest progress details.
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : clusterRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={cropColumns.length + 6} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No data available for {cropGroupName}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedRows.map((row, index) => (
                          <TableRow key={row.clusterId ?? `row-${index}`}>
                            <TableCell
                              align="left"
                              sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: theme.palette.background.paper }}
                            >
                              <Chip
                                label={`Cluster ${row.clusterNumber}`}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(themeColor, 0.1),
                                  color: themeColor,
                                  fontWeight: 600,
                                  borderRadius: 1.5
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={numericCellSx}>
                              {row.clusterArea ? formatNumber(row.clusterArea) : '—'}
                            </TableCell>
                            <TableCell align="right" sx={numericCellSx}>
                              {row.nucArea ? formatNumber(row.nucArea) : '—'}
                            </TableCell>
                            <TableCell align="right" sx={numericCellSx}>
                              {row.ffsArea ? formatNumber(row.ffsArea) : '—'}
                            </TableCell>
                            <TableCell align="right" sx={numericCellSx}>
                              {row.cosArea ? formatNumber(row.cosArea) : '—'}
                            </TableCell>
                            {cropColumns.map((crop) => {
                              const val = row.byId[crop.cropId];
                              return (
                                <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                                  {val ? formatNumber(val) : '—'}
                                </TableCell>
                              );
                            })}
                            <TableCell aria-hidden />
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                          <TableCell
                            align="left"
                            sx={{ fontWeight: 700, color: themeColor, position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#eef1f7' }}
                          >
                            TOTAL
                          </TableCell>
                          <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                            {areaTotals.clusterArea ? formatNumber(areaTotals.clusterArea) : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                            {areaTotals.nucArea ? formatNumber(areaTotals.nucArea) : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                            {areaTotals.ffsArea ? formatNumber(areaTotals.ffsArea) : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                            {areaTotals.cosArea ? formatNumber(areaTotals.cosArea) : '—'}
                          </TableCell>
                          {cropColumns.map((crop) => (
                            <TableCell key={crop.cropId} align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                              {cropTotals[crop.cropId] ? formatNumber(cropTotals[crop.cropId]) : '—'}
                            </TableCell>
                          ))}
                          <TableCell aria-hidden sx={{ backgroundColor: alpha(themeColor, 0.08) }} />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={clusterRows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{ borderTop: `1px solid ${alpha(themeColor, 0.1)}` }}
              />
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClusterForm3A;

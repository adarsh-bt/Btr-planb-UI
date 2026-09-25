import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, Box, Typography, useTheme, alpha, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Stack, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, LinearProgress, IconButton, TablePagination,
  Tooltip, Divider, Avatar, Grid, Button, TextField, InputAdornment
} from '@mui/material';
import {
  LocationOn, ArrowBack, Store as StoreIcon,
  WaterDrop as WaterDropIcon, WbSunny as WbSunnyIcon,
  EnergySavingsLeaf as EnergySavingsLeafIcon, Water as WaterIcon,
  Grass as GrassIcon, Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon, VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon, Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;
const SESSION_KEY = 'clusterForm3AState';

const CLUSTER_W = 220;
const AREA_W = 120;
const CROP_W = 150;

const DEFAULT_LAND_TYPE = 'ALL';
const LAND_TYPE_PARAM = { WET: 'Wet', DRY: 'Dry' };

const SEASONS = [
  { id: 1, name: 'Autumn' },
  { id: 2, name: 'Winter' },
  { id: 3, name: 'Summer' }
];
const DEFAULT_SEASON_ID = 1;

const DEFAULT_IRRIGATION = 'ALL';
const IRRIGATION_PARAM = { IRRIGATED: 'true', UNIRRIGATED: 'false' };
const IRRIGATION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'IRRIGATED', label: 'Irrigated' },
  { value: 'UNIRRIGATED', label: 'Unirrigated' }
];

const CROP_GROUPS = [
  { id: 6, name: 'Cereals' },
  { id: 16, name: 'Other trees' },
  { id: 18, name: 'Pulses' },
  { id: 21, name: 'Tubers' },
  { id: 22, name: 'Vegetables' }
];

const ALL_CROP_GROUPS = -1;
const ALL_CROP_GROUPS_LABEL = 'All Crop Groups';
const FETCH_BATCH_SIZE = 6;

const themeColor = '#05307a';
const themeColorAlt = '#0b4ea2';

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Merge report responses + master cluster list (already master-merged — kept as-is)
function mergeGroupResponses(responses, masterClusterList = [], landTypeTab = 'ALL') {
  const clusters = new Map();

  (Array.isArray(masterClusterList) ? masterClusterList : []).forEach((mc) => {
    const mcLandType = (mc.landType || '').toUpperCase();
    if (landTypeTab !== 'ALL' && mcLandType && mcLandType !== landTypeTab.toUpperCase()) return;

    const key = mc.clusterId != null ? String(mc.clusterId) : `num:${mc.clusterNumber}`;
    clusters.set(key, {
      clusterId: mc.clusterId ?? null,
      clusterNumber: mc.clusterNumber,
      landType: mc.landType || null,
      clusterArea: 0, nucArea: 0, ffsArea: 0, cosArea: 0,
      crops: new Map()
    });
  });

  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((c) => {
      let key = c.clusterId != null ? String(c.clusterId) : `num:${c.clusterNumber || 'Unassigned'}`;
      let entry = clusters.get(key);

      if (!entry && c.clusterNumber != null) {
        for (const [k, item] of clusters.entries()) {
          if (String(item.clusterNumber) === String(c.clusterNumber)) { entry = item; key = k; break; }
        }
      }

      if (!entry) {
        const cLandType = (c.landType || '').toUpperCase();
        if (landTypeTab !== 'ALL' && cLandType && cLandType !== landTypeTab.toUpperCase()) return;
        entry = {
          clusterId: c.clusterId ?? null,
          clusterNumber: c.clusterNumber,
          landType: c.landType || null,
          clusterArea: Number(c.clusterArea) || 0,
          nucArea: Number(c.nucArea) || 0,
          ffsArea: Number(c.ffsArea) || 0,
          cosArea: Number(c.cosArea) || 0,
          crops: new Map()
        };
        clusters.set(key, entry);
      }

      if (!entry.clusterArea && c.clusterArea) entry.clusterArea = Number(c.clusterArea) || 0;
      if (!entry.nucArea && c.nucArea) entry.nucArea = Number(c.nucArea) || 0;
      if (!entry.ffsArea && c.ffsArea) entry.ffsArea = Number(c.ffsArea) || 0;
      if (!entry.cosArea && c.cosArea) entry.cosArea = Number(c.cosArea) || 0;
      if (!entry.landType && c.landType) entry.landType = c.landType;

      (c.crops || []).forEach((crop) => {
        const existing = entry.crops.get(crop.cropId);
        if (existing) existing.areaInCents = (Number(existing.areaInCents) || 0) + (Number(crop.areaInCents) || 0);
        else entry.crops.set(crop.cropId, {
          cropId: crop.cropId, cropName: crop.cropName, areaInCents: Number(crop.areaInCents) || 0
        });
      });
    });
  });

  return Array.from(clusters.values()).map((c) => ({
    clusterId: c.clusterId, clusterNumber: c.clusterNumber, landType: c.landType,
    clusterArea: c.clusterArea, nucArea: c.nucArea, ffsArea: c.ffsArea, cosArea: c.cosArea,
    crops: Array.from(c.crops.values())
  }));
}

const ClusterForm3A = () => {
  const theme = useTheme();
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
  const zoneId = stateData.zoneId || officeInfo.zoneId || officeInfo.zoneOfficeId || AuthService.getzone() || null;
  const zoneName = stateData.zoneName || stateData.selectedZone || officeInfo.zoneName || 'Zone';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(() => (location.state?.isDirectAccess ? ALL_CROP_GROUPS : (location.state?.activeTab ?? stateData.activeTab ?? ALL_CROP_GROUPS)));
  const [landTypeTab, setLandTypeTab] = useState(() => (location.state?.isDirectAccess ? DEFAULT_LAND_TYPE : (location.state?.landType ?? stateData.landType ?? DEFAULT_LAND_TYPE)));
  const [seasonId, setSeasonId] = useState(() => (location.state?.isDirectAccess ? DEFAULT_SEASON_ID : (location.state?.seasonId ?? stateData.seasonId ?? DEFAULT_SEASON_ID)));
  const [irrigation, setIrrigation] = useState(() => location.state?.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      officeType: stateData.officeType, districtId, districtName,
      talukId, talukName, blockId, blockName, zoneId, zoneName,
      agriculturalYear, activeTab, landType: landTypeTab, seasonId, irrigation
    }));
  }, [stateData.officeType, districtId, districtName, talukId, talukName, blockId, blockName, zoneId, zoneName, agriculturalYear, activeTab, landTypeTab, seasonId, irrigation]);

  // ── Fetch cluster report data ──
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

      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/cluster?${params.toString()}`;
    };

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        // Master cluster list (already handled)
        let masterClusters = [];
        try {
          const clusterListUrl = `${mainapi.BTR_API}/btr-service/cluster-api/cluster-list?zoneId=${zoneId}&agriYear=${agriculturalYear}`;
          const clusterListRes = await axios.get(clusterListUrl, { headers });
          if (Array.isArray(clusterListRes.data)) masterClusters = clusterListRes.data;
        } catch (e) {
          console.warn('Could not fetch master cluster list:', e);
        }

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
        setApiData(mergeGroupResponses(payloads, masterClusters, landTypeTab));
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
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, isAllCropGroups, zoneId, agriculturalYear, landTypeTab, seasonId, irrigation]);

  // ── Derived data ──
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
      const hasData =
        (Number(c.clusterArea) || 0) > 0 ||
        (Number(c.nucArea) || 0) > 0 ||
        (Number(c.ffsArea) || 0) > 0 ||
        (Number(c.cosArea) || 0) > 0 ||
        Object.keys(byId).length > 0;
      return {
        clusterId: c.clusterId ?? null,
        clusterNumber: c.clusterNumber || 'Unassigned',
        landType: c.landType || '',
        clusterArea: Number(c.clusterArea) || 0,
        nucArea: Number(c.nucArea) || 0,
        ffsArea: Number(c.ffsArea) || 0,
        cosArea: Number(c.cosArea) || 0,
        byId,
        hasData
      };
    });

    return list.sort((a, b) => {
      const numA = parseInt(a.clusterNumber, 10);
      const numB = parseInt(b.clusterNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.clusterNumber).localeCompare(String(b.clusterNumber));
    });
  }, [apiData]);

  const searchFilteredRows = useMemo(() => {
    if (!searchTerm.trim()) return clusterRows;
    const q = searchTerm.toLowerCase().trim();
    return clusterRows.filter((r) =>
      String(r.clusterNumber).toLowerCase().includes(q) ||
      (r.landType || '').toLowerCase().includes(q)
    );
  }, [clusterRows, searchTerm]);

  const clustersWithNoData = useMemo(
    () => clusterRows.filter((r) => !r.hasData && r.clusterId != null).length,
    [clusterRows]
  );

  const areaTotals = useMemo(() => {
    let clusterArea = 0, nucArea = 0, ffsArea = 0, cosArea = 0;
    searchFilteredRows.forEach((row) => {
      clusterArea += row.clusterArea || 0;
      nucArea += row.nucArea || 0;
      ffsArea += row.ffsArea || 0;
      cosArea += row.cosArea || 0;
    });
    return { clusterArea, nucArea, ffsArea, cosArea };
  }, [searchFilteredRows]);

  const cropTotals = useMemo(() => {
    const totals = {};
    cropColumns.forEach((c) => (totals[c.cropId] = 0));
    searchFilteredRows.forEach((row) => {
      cropColumns.forEach((c) => {
        if (row.byId[c.cropId] !== undefined) totals[c.cropId] += row.byId[c.cropId];
      });
    });
    return totals;
  }, [searchFilteredRows, cropColumns]);

  // ── Handlers ──
  const handleCropGroupChange = (e) => { setActiveTab(Number(e.target.value)); setPage(0); };
  const handleLandTypeChange = (_, v) => { if (v != null) { setLandTypeTab(v); setPage(0); } };
  const handleSeasonChange = (e) => { setSeasonId(Number(e.target.value)); setPage(0); };
  const handleIrrigationChange = (e) => { setIrrigation(e.target.value); setPage(0); };
  const formatNumber = (num) => Number(num || 0).toFixed(2);
  const handleChangePage = (_, p) => setPage(p);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
  const handleClearSearch = () => { setSearchTerm(''); setPage(0); };

  const paginatedRows = useMemo(
    () => searchFilteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [searchFilteredRows, page, rowsPerPage]
  );

  const handleBack = () => {
    const tokenRole = AuthService.getrole();
    const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
    const des = localStorage.getItem('des') || '';
    const isFdc = roles.includes('Field Data Collector') || des.includes('Field Data Collector') || stateData.officeType === 'FIELD_DATA_COLLECTOR';

    if (isFdc) { navigate('/Report'); return; }

    navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId, districtName, selectedDistrict: districtName,
        talukId, talukName, selectedTaluk: talukName,
        blockId, blockName, selectedBlock: blockName,
        cropGroupId, cropGroupName, agriculturalYear,
        landType: landTypeTab, seasonId, irrigation, activeTab
      }
    });
  };

  // ── Excel export ──
  const generateExcelFileName = () => {
    const parts = ['Form3A_ClusterReport', (zoneName || 'Zone').replace(/\s+/g, '_')];
    parts.push((cropGroupName || 'All').replace(/\s+/g, '_'));
    if (landTypeTab !== 'ALL') parts.push(landTypeTab);
    if (seasonName) parts.push(seasonName);
    if (irrigation !== 'ALL') parts.push(irrigationLabel.replace(/\s+/g, '_'));
    parts.push(agriculturalYear);
    if (searchTerm.trim()) parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.xlsx`;
  };

  const handleExportExcel = () => {
    if (!searchFilteredRows || searchFilteredRows.length === 0) return;

    const headerMeta = [
      ['Form 3A — Cluster-wise Seasonal Crop Report'],
      ['District', districtName],
      ['Taluk', talukName],
      ['Block', blockName],
      ['Zone', zoneName],
      ['Agricultural Year', agriculturalYear],
      ['Crop Group', cropGroupName || '—'],
      ['Land Type', landTypeTab === 'ALL' ? 'All' : landTypeTab],
      ['Season', seasonName || '—'],
      ['Irrigation', irrigationLabel || '—'],
      ['Area Unit', 'Cents'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    const headerRow = [
      '#', 'Cluster No.', 'Land Type', 'Cluster Area', 'NUC Area', 'FFS Area', 'CoS Area',
      ...cropColumns.map((c) => c.cropName)
    ];

    let serial = 0;
    const dataRows = searchFilteredRows.map((row) => {
      serial += 1;
      const cells = [serial, `Cluster ${row.clusterNumber}`, row.landType || '—'];
      if (!row.hasData) {
        cells.push('NA', 'NA', 'NA', 'NA');
        cropColumns.forEach(() => cells.push('NA'));
      } else {
        cells.push(
          row.clusterArea ? Number(row.clusterArea) : '—',
          row.nucArea ? Number(row.nucArea) : '—',
          row.ffsArea ? Number(row.ffsArea) : '—',
          row.cosArea ? Number(row.cosArea) : '—'
        );
        cropColumns.forEach((c) => {
          const v = row.byId[c.cropId];
          cells.push(v ? Number(v) : '—');
        });
      }
      return cells;
    });

    const totalsRow = [
      '', '', 'GRAND TOTAL',
      Number(areaTotals.clusterArea.toFixed(2)),
      Number(areaTotals.nucArea.toFixed(2)),
      Number(areaTotals.ffsArea.toFixed(2)),
      Number(areaTotals.cosArea.toFixed(2)),
      ...cropColumns.map((c) => Number((cropTotals[c.cropId] || 0).toFixed(2)))
    ];

    const aoa = [...headerMeta, headerRow, ...dataRows, totalsRow];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      ...cropColumns.map(() => ({ wch: 16 }))
    ];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cluster Form 3A');
    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const TABLE_MIN_W = CLUSTER_W + 4 * AREA_W + Math.max(cropColumns.length, 1) * CROP_W;
  const exportDisabled = searchFilteredRows.length === 0 || loading;

  // ─────────────────────────── RENDER ───────────────────────────

  return (
    <Box>
      <Box sx={{ mb: 2 }}><Breadcrumb /></Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 4px 20px rgba(5,48,122,0.06)'
        }}
      >
        {/* ── Header band ── */}
        <Box
          sx={{
            background: `linear-gradient(120deg, ${themeColor} 0%, ${themeColorAlt} 55%, #1a6fc4 100%)`,
            color: '#fff',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2.5, sm: 3 },
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.16)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' }
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.35)',
                width: 54, height: 54
              }}
            >
              <AssessmentIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.2 }}>
                Form 3A — Cluster-wise Crop Area Report {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {zoneName} Zone • {blockName} Block • {talukName} Taluk • {districtName} District • AY {agriculturalYear}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {cropGroupName && (
              <Chip
                icon={<GrassIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={cropGroupName}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
            {landTypeTab !== 'ALL' && (
              <Chip label={`${landTypeTab} Land`} size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            )}
            {seasonName && (
              <Chip
                icon={<EnergySavingsLeafIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={seasonName}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
            {irrigation !== 'ALL' && (
              <Chip
                icon={<WaterIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={irrigationLabel}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}>
          {/* ── KPI strip ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Clusters', value: clusterRows.length, icon: <StoreIcon />, color: '#1565c0' },
              { label: 'Cluster Area', value: formatNumber(areaTotals.clusterArea), icon: <StoreIcon />, color: '#2e7d32' },
              { label: 'Nuc Area', value: formatNumber(areaTotals.nucArea), icon: <GrassIcon />, color: '#6a1b9a' },
              { label: 'FFS Area', value: formatNumber(areaTotals.ffsArea), icon: <EnergySavingsLeafIcon />, color: '#ef6c00' },
              { label: 'COS Area', value: formatNumber(areaTotals.cosArea), icon: <CheckCircleIcon />, color: '#0277bd' }
            ].map((k) => (
              <Grid item xs={6} sm={4} md={2.4} key={k.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75, borderRadius: 2.5,
                    border: `1px solid ${alpha(k.color, 0.15)}`,
                    background: `linear-gradient(135deg, ${alpha(k.color, 0.06)} 0%, ${alpha(k.color, 0.02)} 100%)`,
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${alpha(k.color, 0.14)}` }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ bgcolor: alpha(k.color, 0.12), color: k.color, width: 38, height: 38 }}>
                      {React.cloneElement(k.icon, { sx: { fontSize: 20 } })}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.4 }}>
                        {k.label.toUpperCase()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: k.color, lineHeight: 1.1 }}>
                        {loading ? <CircularProgress size={16} /> : k.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* ── Filters ── */}
          <Paper
            elevation={0}
            sx={{
              p: 2, mb: 3, borderRadius: 3,
              border: `1px solid ${alpha(themeColor, 0.12)}`,
              bgcolor: alpha(themeColor, 0.015)
            }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }} flexWrap="wrap">
              <Box sx={{ minWidth: 260 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  LAND TYPE
                </Typography>
                <Tabs
                  value={landTypeTab}
                  onChange={handleLandTypeChange}
                  variant="fullWidth"
                  sx={{
                    minHeight: 40, mt: 0.5,
                    border: `1px solid ${alpha(themeColor, 0.2)}`,
                    borderRadius: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none', fontWeight: 700, minHeight: 40, color: 'text.secondary',
                      '&.Mui-selected': { color: themeColor }
                    },
                    '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3, borderRadius: '3px 3px 0 0' }
                  }}
                >
                  <Tab label="ALL" value="ALL" />
                  <Tab label="WET" value="WET" icon={<WaterDropIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                  <Tab label="DRY" value="DRY" icon={<WbSunnyIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                </Tabs>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' } }} />

              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id="cluster-crop-group-label">Crop Group</InputLabel>
                <Select
                  labelId="cluster-crop-group-label"
                  value={activeTab}
                  label="Crop Group"
                  onChange={handleCropGroupChange}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                  renderValue={(v) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GrassIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                      {v === ALL_CROP_GROUPS ? ALL_CROP_GROUPS_LABEL : CROP_GROUPS[v]?.name || ''}
                    </Box>
                  )}
                >
                  <MenuItem value={ALL_CROP_GROUPS}>All</MenuItem>
                  {CROP_GROUPS.map((g, i) => (
                    <MenuItem key={g.id} value={i}>{g.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="cluster-season-label">Season</InputLabel>
                <Select
                  labelId="cluster-season-label"
                  value={seasonId}
                  label="Season"
                  onChange={handleSeasonChange}
                  renderValue={(v) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EnergySavingsLeafIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                      {SEASONS.find((s) => s.id === v)?.name || ''}
                    </Box>
                  )}
                >
                  {SEASONS.map((s) => (<MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="cluster-irrigation-label">Irrigation</InputLabel>
                <Select
                  labelId="cluster-irrigation-label"
                  value={irrigation}
                  label="Irrigation"
                  onChange={handleIrrigationChange}
                  renderValue={(v) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterIcon sx={{ fontSize: 18, color: v === 'UNIRRIGATED' ? '#9e9e9e' : '#0288d1' }} />
                      {IRRIGATION_OPTIONS.find((o) => o.value === v)?.label || ''}
                    </Box>
                  )}
                >
                  {IRRIGATION_OPTIONS.map((o) => (<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>))}
                </Select>
              </FormControl>
            </Stack>

            {clustersWithNoData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${clustersWithNoData} cluster${clustersWithNoData > 1 ? 's' : ''} with no data`}
                  size="small"
                  sx={{ bgcolor: alpha('#ff9800', 0.14), color: '#e65100', fontWeight: 600 }}
                />
              </Box>
            )}
          </Paper>

          {/* ── Error ── */}
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
              <Typography color="error">Error: {error}</Typography>
            </Paper>
          )}

          {/* ── Search + Export toolbar ── */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5, mb: 2, borderRadius: 3,
              border: `1px solid ${alpha(themeColor, 0.12)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 2, flexWrap: 'wrap'
            }}
          >
            <TextField
              placeholder="Search cluster..."
              size="small"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              sx={{ width: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
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
            <Chip label="All area in Cents" size="small" sx={{ bgcolor: alpha('#2e7d32', 0.08), color: '#2e7d32', fontWeight: 600 }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${searchFilteredRows.length} row${searchFilteredRows.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: alpha(themeColor, 0.08), color: themeColor, fontWeight: 600 }}
              />
              <Tooltip
                title={
                  exportDisabled
                    ? 'No data available to export'
                    : `Download ${searchFilteredRows.length} row${searchFilteredRows.length > 1 ? 's' : ''} as Excel`
                }
              >
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportExcel}
                    disabled={exportDisabled}
                    sx={{
                      borderRadius: 2, bgcolor: themeColor, textTransform: 'none',
                      fontWeight: 600, whiteSpace: 'nowrap', px: 2,
                      '&:hover': { bgcolor: themeColorAlt },
                      '&.Mui-disabled': { bgcolor: alpha(themeColor, 0.3), color: '#fff' }
                    }}
                  >
                    Download Excel
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Paper>

          {/* ── Table ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3, overflow: 'hidden',
              border: `1px solid ${alpha(themeColor, 0.12)}`,
              position: 'relative',
              boxShadow: '0 2px 12px rgba(5,48,122,0.05)'
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
            <Box sx={{ p: 0, position: 'relative' }}>
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    width: '100%',
                    minWidth: TABLE_MIN_W,
                    tableLayout: 'fixed',
                    borderCollapse: 'separate',
                    borderSpacing: 0
                  }}
                >
                  <colgroup>
                    <col style={{ width: CLUSTER_W }} />
                    <col style={{ width: AREA_W }} />
                    <col style={{ width: AREA_W }} />
                    <col style={{ width: AREA_W }} />
                    <col style={{ width: AREA_W }} />
                    {cropColumns.map((c) => (<col key={c.cropId} style={{ width: CROP_W }} />))}
                    <col style={{ width: 'auto' }} />
                  </colgroup>

                  <TableHead>
                    <TableRow>
                      {[
                        { key: 'cluster', label: 'Cluster No.', align: 'left', sticky: true },
                        { key: 'clusterArea', label: 'Cluster Area', align: 'right' },
                        { key: 'nuc', label: 'NUC Area', align: 'right' },
                        { key: 'ffs', label: 'FFS Area', align: 'right' },
                        { key: 'cos', label: 'CoS Area', align: 'right' }
                      ].map((h) => (
                        <TableCell
                          key={h.key}
                          align={h.align}
                          sx={{
                            backgroundColor: themeColor,
                            color: '#fff',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            py: 1.6,
                            fontSize: '0.82rem',
                            letterSpacing: 0.3,
                            borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                            ...(h.sticky && {
                              position: 'sticky',
                              left: 0,
                              zIndex: 6
                            })
                          }}
                        >
                          {h.label}
                        </TableCell>
                      ))}
                      {cropColumns.map((crop) => (
                        <TableCell
                          key={crop.cropId}
                          align="right"
                          sx={{
                            backgroundColor: themeColor,
                            color: '#fff',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            py: 1.6,
                            fontSize: '0.82rem',
                            letterSpacing: 0.3,
                            borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                            zIndex: 3
                          }}
                        >
                          {crop.cropName}
                        </TableCell>
                      ))}
                      <TableCell aria-hidden sx={{ backgroundColor: themeColor, padding: 0, zIndex: 3 }} />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={Math.max(cropColumns.length + 6, 8)} align="center" sx={{ py: 10 }}>
                          <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={44} thickness={4} sx={{ color: themeColor }} />
                            <Box textAlign="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: themeColor }}>
                                Loading Cluster Form 3A Report...
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Please wait while we fetch the latest progress details.
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={cropColumns.length + 6} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">
                            {searchTerm
                              ? `No clusters found matching "${searchTerm}"`
                              : `No data available for ${cropGroupName}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedRows.map((row, index) => (
                          <TableRow
                            key={row.clusterId ?? `row-${index}`}
                            sx={{
                              backgroundColor: !row.hasData
                                ? alpha('#ff9800', 0.03)
                                : (index % 2 === 1 ? alpha(themeColor, 0.015) : 'transparent')
                            }}
                          >
                            <TableCell
                              align="left"
                              sx={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 2,
                                backgroundColor: !row.hasData
                                  ? '#fffaf2'
                                  : (index % 2 === 1 ? '#f8fafc' : '#ffffff'),
                                borderRight: `1px solid ${alpha(themeColor, 0.06)}`
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                {/* <Avatar
                                  sx={{
                                    width: 26, height: 26, fontSize: '0.72rem', fontWeight: 700,
                                    bgcolor: row.hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.15),
                                    color: row.hasData ? themeColor : '#e65100'
                                  }}
                                >
                                  {String(row.clusterNumber).charAt(0)}
                                </Avatar> */}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: row.hasData ? 600 : 400,
                                    color: row.hasData ? 'text.primary' : 'text.secondary'
                                  }}
                                >
                                  Cluster {row.clusterNumber}
                                </Typography>
                                {row.landType && (
                                  <Chip
                                    label={row.landType}
                                    size="small"
                                    color={row.landType.toUpperCase() === 'WET' ? 'info' : 'warning'}
                                    variant="outlined"
                                    sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem' }}
                                  />
                                )}
                                {!row.hasData && row.clusterId != null && (
                                  <Chip
                                    label="NA"
                                    size="small"
                                    sx={{
                                      height: 18, fontSize: '0.62rem',
                                      bgcolor: alpha('#ff9800', 0.15), color: '#e65100', fontWeight: 700
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>

                            {['clusterArea', 'nucArea', 'ffsArea', 'cosArea'].map((key) => (
                              <TableCell key={key} align="right" sx={numericCellSx}>
                                {!row.hasData ? (
                                  <Typography variant="body2" color="text.secondary">NA</Typography>
                                ) : row[key] ? (
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(row[key])}</Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                              </TableCell>
                            ))}

                            {cropColumns.map((crop) => {
                              const val = row.byId[crop.cropId];
                              return (
                                <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                                  {!row.hasData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : val ? (
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(val)}</Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                  )}
                                </TableCell>
                              );
                            })}
                            <TableCell aria-hidden />
                          </TableRow>
                        ))}

                        {/* Grand Total */}
                        <TableRow
                          sx={{
                            backgroundColor: alpha(themeColor, 0.09),
                            '& .MuiTableCell-root': {
                              borderTop: `2px solid ${alpha(themeColor, 0.35)}`,
                              fontWeight: 800,
                              color: themeColor
                            }
                          }}
                        >
                          <TableCell
                            align="left"
                            sx={{
                              position: 'sticky', left: 0, zIndex: 2,
                              backgroundColor: '#eef1f7',
                              fontWeight: 800, color: themeColor, letterSpacing: 0.5,
                              borderRight: `1px solid ${alpha(themeColor, 0.15)}`
                            }}
                          >
                            GRAND TOTAL
                          </TableCell>
                          <TableCell align="right" sx={numericCellSx}>{formatNumber(areaTotals.clusterArea)}</TableCell>
                          <TableCell align="right" sx={numericCellSx}>{formatNumber(areaTotals.nucArea)}</TableCell>
                          <TableCell align="right" sx={numericCellSx}>{formatNumber(areaTotals.ffsArea)}</TableCell>
                          <TableCell align="right" sx={numericCellSx}>{formatNumber(areaTotals.cosArea)}</TableCell>
                          {cropColumns.map((crop) => (
                            <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                              {cropTotals[crop.cropId] ? formatNumber(cropTotals[crop.cropId]) : '—'}
                            </TableCell>
                          ))}
                          <TableCell aria-hidden sx={{ backgroundColor: alpha(themeColor, 0.09) }} />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={searchFilteredRows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{
                  borderTop: `1px solid ${alpha(themeColor, 0.1)}`,
                  '& .MuiTablePagination-toolbar': { minHeight: 48 }
                }}
              />
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClusterForm3A;
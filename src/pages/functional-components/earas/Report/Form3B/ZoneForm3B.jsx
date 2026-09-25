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
  IconButton,
  CircularProgress,
  TablePagination,
  LinearProgress,
  Tooltip,
  Divider,
  Avatar,
  Grid,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  LocationOn,
  Store as StoreIcon,
  ArrowBack,
  WaterDrop as WaterDropIcon,
  WbSunny as WbSunnyIcon,
  Water as WaterIcon,
  Grass as GrassIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import mainapi from 'api/mainapi';
import api from 'api/api';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;
const SESSION_KEY = 'zoneForm3BState';

// Column widths
const BLOCK_W = 180;
const ZONE_W = 200;
const AREA_W = 140;
const CROP_W = 150;

const DEFAULT_LAND_TYPE = 'ALL';
const LAND_TYPE_PARAM = { WET: 'wet', DRY: 'dry' };

const DEFAULT_IRRIGATION = 'ALL';
const IRRIGATION_PARAM = { IRRIGATED: 'true', UNIRRIGATED: 'false' };
const IRRIGATION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'IRRIGATED', label: 'Irrigated' },
  { value: 'UNIRRIGATED', label: 'Unirrigated' }
];

const themeColor = '#05307a';
const themeColorAlt = '#0b4ea2';
const stickyTintLight = '#eef1f7';
const stickyTintSubtotal = '#e4e9f2';
const stickyTintGrand = '#d2dbe9';

const CROP_TYPES = [
  { id: 3, name: 'Annual' },
  { id: 2, name: 'Perennial' }
];

const ALL_CROP_TYPES = -1;
const ALL_CROP_TYPES_LABEL = 'All Type';
const DEFAULT_CROP_TYPE = ALL_CROP_TYPES;
const FETCH_BATCH_SIZE = 6;

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function mergeGroupResponses(responses) {
  const zones = new Map();

  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((z) => {
      const key = z.zoneId ?? `name:${z.blockId ?? ''}:${z.zoneName || 'Unknown'}`;
      if (!zones.has(key)) {
        zones.set(key, {
          blockId: z.blockId ?? null,
          blockName: z.blockName,
          zoneId: z.zoneId,
          zoneName: z.zoneName,
          clusterArea: Number(z.clusterArea) || 0,
          crops: new Map()
        });
      }
      const entry = zones.get(key);
      if (!entry.clusterArea && z.clusterArea) entry.clusterArea = Number(z.clusterArea) || 0;

      (z.crops || []).forEach((c) => {
        const existing = entry.crops.get(c.cropId);
        if (existing) {
          existing.areaInCents = (Number(existing.areaInCents) || 0) + (Number(c.areaInCents) || 0);
        } else {
          entry.crops.set(c.cropId, {
            cropId: c.cropId,
            cropName: c.cropName,
            areaInCents: Number(c.areaInCents) || 0
          });
        }
      });
    });
  });

  return Array.from(zones.values()).map((z) => ({
    blockId: z.blockId,
    blockName: z.blockName,
    zoneId: z.zoneId,
    zoneName: z.zoneName,
    clusterArea: z.clusterArea,
    crops: Array.from(z.crops.values())
  }));
}

function resolveBlockName(blockId, blockName, zoneName) {
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;
  return 'Unassigned';
}

function buildOrderedGroups(rows) {
  const real = new Map();
  const muni = [];
  const corp = [];
  const un = [];
  rows.forEach((r) => {
    if (r.block === 'Municipality') muni.push(r);
    else if (r.block === 'Corporation') corp.push(r);
    else if (r.block === 'Unassigned') un.push(r);
    else {
      if (!real.has(r.block)) real.set(r.block, []);
      real.get(r.block).push(r);
    }
  });
  const ordered = {};
  Array.from(real.keys())
    .sort((a, b) => a.localeCompare(b))
    .forEach((k) => (ordered[k] = real.get(k)));
  if (muni.length) ordered['Municipality'] = muni;
  if (corp.length) ordered['Corporation'] = corp;
  if (un.length) ordered['Unassigned'] = un;
  return ordered;
}

const ZoneForm3B = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []);

  const officeInfo = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('userOfficeInfo') || '{}');
    } catch {
      return {};
    }
  }, []);

  const talukId = stateData.talukId || officeInfo.talukOfficeId || officeInfo.talukId || null;
  const talukName = stateData.talukName || stateData.selectedTaluk || officeInfo.talukName || 'Taluk';
  const districtId = stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null;
  const districtName = stateData.districtName || stateData.selectedDistrict || officeInfo.districtName || 'District';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? DEFAULT_CROP_TYPE);
  const [landTypeTab, setLandTypeTab] = useState(stateData.landType ?? DEFAULT_LAND_TYPE);
  const [irrigation, setIrrigation] = useState(stateData.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [masterZones, setMasterZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const isAllCropTypes = activeTab === ALL_CROP_TYPES;
  const cropTypeId = isAllCropTypes ? null : CROP_TYPES[activeTab]?.id;
  const cropTypeName = isAllCropTypes ? ALL_CROP_TYPES_LABEL : CROP_TYPES[activeTab]?.name;

  const numericCellSx = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

  // ── Fetch master zones list ──
  useEffect(() => {
    const fetchMasterZones = async () => {
      if (talukId == null) {
        setMasterLoading(false);
        return;
      }
      setMasterLoading(true);
      try {
        const response = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/zones?desTalukId=${talukId}`);
        if (response.data && Array.isArray(response.data.data)) {
          setMasterZones(response.data.data);
        } else if (Array.isArray(response.data)) {
          setMasterZones(response.data);
        } else {
          setMasterZones([]);
        }
      } catch (err) {
        console.warn('Error fetching master zones list:', err);
        setMasterZones([]);
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterZones();
  }, [talukId]);

  // ── Role auto-redirection ──
  useEffect(() => {
    try {
      const tokenRole = AuthService.getrole();
      const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
      const des = localStorage.getItem('des') || '';

      if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
        const zoneId = officeInfo.zoneId || AuthService.getzone();
        navigate('/schemes/earas/Report/Form3B/ClusterForm3B', {
          replace: true,
          state: {
            officeType: 'FIELD_DATA_COLLECTOR',
            viewLevel: 'cluster',
            zoneId,
            zoneName: officeInfo.zoneName || '',
            talukId: officeInfo.talukOfficeId || officeInfo.talukId || talukId,
            talukName: officeInfo.talukName || talukName || '',
            districtId: officeInfo.districtOfficeId || officeInfo.districtId || districtId,
            districtName: officeInfo.districtName || districtName || '',
            isDirectAccess: true,
            landType: landTypeTab,
            irrigation,
            activeTab
          }
        });
      }
    } catch (e) { }
  }, [officeInfo, stateData, districtId, districtName, talukId, talukName, navigate]);

  // ── Persist session state ──
  useEffect(() => {
    if (talukId != null) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId,
          talukName,
          districtId,
          districtName,
          agriculturalYear,
          landType: landTypeTab,
          irrigation,
          activeTab: stateData.activeTab ?? DEFAULT_CROP_TYPE
        })
      );
    }
  }, [landTypeTab, irrigation, activeTab]);

  // ── Fetch Form 3B Zone data ──
  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the taluk report page.');
      return;
    }
    if (!isAllCropTypes && !cropTypeId) return;

    let cancelled = false;

    const buildUrl = (typeId) => {
      const params = new URLSearchParams({
        agriYear: agriculturalYear,
        talukId: String(talukId),
        cropTypeId: String(typeId)
      });
      const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
      if (landTypeParam) params.append('landType', landTypeParam);

      const irrigationParam = IRRIGATION_PARAM[irrigation];
      if (irrigationParam) params.append('isIrrigated', irrigationParam);

      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3B/taluk?${params.toString()}`;
    };

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const headers = { Authorization: `Bearer ${token}` };
        const typeIds = isAllCropTypes ? CROP_TYPES.map((g) => g.id) : [cropTypeId];

        const payloads = [];
        for (let i = 0; i < typeIds.length; i += FETCH_BATCH_SIZE) {
          const batch = typeIds.slice(i, i + FETCH_BATCH_SIZE);
          // eslint-disable-next-line no-await-in-loop
          const responses = await Promise.all(batch.map((id) => axios.get(buildUrl(id), { headers })));
          if (cancelled) return;
          responses.forEach((r) => payloads.push(r.data));
        }

        if (cancelled) return;
        setApiData(mergeGroupResponses(payloads));
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching Zone Form 3B data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
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
  }, [cropTypeId, isAllCropTypes, talukId, agriculturalYear, landTypeTab, irrigation]);

  // ── Crop columns ──
  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((z) =>
      (z.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  // ── Combine Master Zones with API Data ──
  const zoneRows = useMemo(() => {
    const apiById = new Map();
    const apiByName = new Map();
    apiData.forEach((z) => {
      if (z.zoneId != null) apiById.set(z.zoneId, z);
      if (z.zoneName) apiByName.set(z.zoneName.toLowerCase().trim(), z);
    });

    const createRowFromApi = (z) => {
      const byId = {};
      (z.crops || []).forEach((c) => {
        byId[c.cropId] = Number(c.areaInCents) || 0;
      });
      const clusterArea = Number(z.clusterArea) || 0;
      const hasData = clusterArea > 0 || Object.keys(byId).length > 0;
      return {
        block: resolveBlockName(z.blockId, z.blockName, z.zoneName),
        zone: z.zoneName || 'Unknown',
        zoneId: z.zoneId,
        clusterArea,
        byId,
        hasData
      };
    };

    if (masterZones && masterZones.length > 0) {
      const processedZoneIds = new Set();
      const rows = [];

      masterZones.forEach((mz) => {
        const mzId = mz.id ?? mz.zoneId;
        const mzName = mz.zoneNameEn || mz.zoneName || mz.name || '';
        const mzBlockId = mz.desBlockId || mz.blockId || null;
        const mzBlockName = mz.desBlockName || mz.blockName || null;

        const apiMatch = (mzId != null ? apiById.get(mzId) : null) || (mzName ? apiByName.get(mzName.toLowerCase().trim()) : null);
        if (apiMatch?.zoneId) processedZoneIds.add(apiMatch.zoneId);

        const byId = {};
        (apiMatch?.crops || []).forEach((c) => {
          byId[c.cropId] = Number(c.areaInCents) || 0;
        });
        const clusterArea = Number(apiMatch?.clusterArea) || 0;
        const hasData = clusterArea > 0 || Object.keys(byId).length > 0;

        rows.push({
          block: resolveBlockName(mzBlockId, mzBlockName, mzName),
          zone: mzName || apiMatch?.zoneName || 'Unknown',
          zoneId: mzId ?? apiMatch?.zoneId ?? null,
          clusterArea,
          byId,
          hasData
        });
      });

      apiData.forEach((z) => {
        if (z.zoneId && !processedZoneIds.has(z.zoneId)) {
          rows.push(createRowFromApi(z));
        }
      });

      return rows;
    }

    return apiData.map(createRowFromApi);
  }, [apiData, masterZones]);

  // ── Search filter ──
  const searchFilteredRows = useMemo(() => {
    if (!searchTerm.trim()) return zoneRows;
    const q = searchTerm.toLowerCase().trim();
    return zoneRows.filter((r) => r.zone?.toLowerCase().includes(q) || r.block?.toLowerCase().includes(q));
  }, [zoneRows, searchTerm]);

  const zonesWithNoData = useMemo(() => zoneRows.filter((r) => !r.hasData && r.zoneId != null).length, [zoneRows]);

  const { grouped, blockTotals, grandTotals } = useMemo(() => {
    const g = buildOrderedGroups(searchFilteredRows);
    const bt = {};
    const grand = { clusterArea: 0 };
    cropColumns.forEach((c) => (grand[c.cropId] = 0));
    Object.entries(g).forEach(([bn, rows]) => {
      const t = { clusterArea: 0 };
      cropColumns.forEach((c) => (t[c.cropId] = 0));
      rows.forEach((r) => {
        t.clusterArea += r.clusterArea || 0;
        cropColumns.forEach((c) => {
          if (r.byId[c.cropId] !== undefined) t[c.cropId] += r.byId[c.cropId];
        });
      });
      bt[bn] = t;
      grand.clusterArea += t.clusterArea;
      cropColumns.forEach((c) => (grand[c.cropId] += t[c.cropId]));
    });
    return { grouped: g, blockTotals: bt, grandTotals: grand };
  }, [searchFilteredRows, cropColumns]);

  // ── Event Handlers ──
  const handleCropTypeChange = (event) => {
    setActiveTab(Number(event.target.value));
    setPage(0);
  };

  const handleLandTypeChange = (event, newValue) => {
    if (newValue === null || newValue === undefined) return;
    setLandTypeTab(newValue);
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
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const groupedEntries = useMemo(() => Object.entries(grouped), [grouped]);
  const paginatedEntries = useMemo(
    () => groupedEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [groupedEntries, page, rowsPerPage]
  );

  const handleBack = () => {
    navigate('/schemes/earas/Report/Form3B/TalukForm3B', {
      state: { districtId, districtName, selectedDistrict: districtName, landType: landTypeTab, irrigation, activeTab }
    });
  };

  const handleZoneClick = (zoneRow) => {
    if (zoneRow.zoneId == null || !zoneRow.hasData) return;
    navigate('/schemes/earas/Report/Form3B/ClusterForm3B', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId,
        districtName,
        selectedDistrict: districtName,
        talukId,
        talukName,
        selectedTaluk: talukName,
        blockName: zoneRow.block,
        zoneId: zoneRow.zoneId,
        zoneName: zoneRow.zone,
        selectedZone: zoneRow.zone,
        cropTypeId,
        cropTypeName,
        agriculturalYear,
        landType: landTypeTab,
        irrigation,
        activeTab
      }
    });
  };

  // ── Excel Export ──
  const generateExcelFileName = () => {
    const parts = ['Form3B_ZoneReport', (talukName || 'Taluk').replace(/\s+/g, '_')];
    parts.push((cropTypeName || 'AllType').replace(/\s+/g, '_'));
    if (landTypeTab !== 'ALL') parts.push(landTypeTab);
    if (irrigation !== 'ALL') parts.push(irrigation.replace(/\s+/g, '_'));
    parts.push(agriculturalYear);
    if (searchTerm.trim()) parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.xlsx`;
  };

  const handleExportExcel = () => {
    if (!searchFilteredRows || searchFilteredRows.length === 0) return;

    const headerMeta = [
      ['Form 3B — Zone-wise Crop Area Report'],
      ['District', districtName],
      ['Taluk', talukName],
      ['Agricultural Year', agriculturalYear],
      ['Crop Type', cropTypeName || '—'],
      ['Land Type', landTypeTab === 'ALL' ? 'All' : landTypeTab],
      ['Irrigation', IRRIGATION_OPTIONS.find((o) => o.value === irrigation)?.label || '—'],
      ['Area Unit', 'Cents'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    const headerRow = ['#', 'Block', 'Zone', 'Cluster Area', ...cropColumns.map((c) => c.cropName)];

    let serial = 0;
    const dataRows = [];
    Object.entries(grouped).forEach(([blockName, zones]) => {
      zones.forEach((z) => {
        serial += 1;
        const row = [serial, blockName, z.zone];
        if (!z.hasData) {
          row.push('NA');
          cropColumns.forEach(() => row.push('NA'));
        } else {
          row.push(z.clusterArea ? Number(z.clusterArea) : '—');
          cropColumns.forEach((c) => {
            const v = z.byId[c.cropId];
            row.push(v ? Number(v) : '—');
          });
        }
        dataRows.push(row);
      });
      const bt = blockTotals[blockName];
      const subtotalRow = [
        '',
        `Total for ${blockName}`,
        '',
        bt.clusterArea ? Number(bt.clusterArea.toFixed(2)) : '—',
        ...cropColumns.map((c) => (bt[c.cropId] ? Number(bt[c.cropId].toFixed(2)) : '—'))
      ];
      dataRows.push(subtotalRow);
    });

    const grandTotalRow = [
      '',
      'GRAND TOTAL',
      '',
      grandTotals.clusterArea ? Number(grandTotals.clusterArea.toFixed(2)) : '—',
      ...cropColumns.map((c) => (grandTotals[c.cropId] ? Number(grandTotals[c.cropId].toFixed(2)) : '—'))
    ];

    const aoa = [...headerMeta, headerRow, ...dataRows, grandTotalRow];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 24 }, { wch: 14 }, ...cropColumns.map(() => ({ wch: 16 }))];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form 3B Zone');
    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const stickyCellSx = (leftPx, bg, extra = {}) => ({
    position: 'sticky',
    left: leftPx,
    boxSizing: 'border-box',
    backgroundColor: bg,
    whiteSpace: 'nowrap',
    ...extra
  });

  const TABLE_MIN_W = BLOCK_W + ZONE_W + AREA_W + Math.max(cropColumns.length, 1) * CROP_W;
  const exportDisabled = searchFilteredRows.length === 0 || loading;

  // ─────────────────────────── RENDER ───────────────────────────

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
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 4px 20px rgba(5,48,122,0.06)'
        }}
      >
        {/* ── Header Band ── */}
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
                bgcolor: 'rgba(255,255,255,0.16)',
                color: '#fff',
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
                width: 54,
                height: 54
              }}
            >
              <AssessmentIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.2 }}>
                Form 3B — Annual & Perennial Zone-wise Crop Area Report - {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {talukName} Taluk ({districtName} District) • AY {agriculturalYear} • Area in Cents
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {cropTypeName && (
              <Chip
                icon={<GrassIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={cropTypeName}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
            {landTypeTab !== 'ALL' && (
              <Chip label={`${landTypeTab} Land`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            )}
            {irrigation !== 'ALL' && (
              <Chip
                icon={<WaterIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={IRRIGATION_OPTIONS.find((o) => o.value === irrigation)?.label || ''}
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
              { label: 'Zones', value: zoneRows.length, icon: <LocationOn />, color: '#1565c0' },
              { label: 'Cluster Area', value: formatNumber(grandTotals.clusterArea), icon: <StoreIcon />, color: '#2e7d32' },
              { label: 'Crops', value: cropColumns.length, icon: <GrassIcon />, color: '#6a1b9a' },
              { label: 'With Data', value: zoneRows.filter((r) => r.hasData).length, icon: <CheckCircleIcon />, color: '#0277bd' },
              { label: 'No Data', value: zonesWithNoData, icon: <VisibilityOffIcon />, color: '#ef6c00' }
            ].map((k) => (
              <Grid item xs={6} sm={4} md={2.4} key={k.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: 2.5,
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

          {/* ── Filters Toolbar ── */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
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
                    minHeight: 40,
                    mt: 0.5,
                    border: `1px solid ${alpha(themeColor, 0.2)}`,
                    borderRadius: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      minHeight: 40,
                      color: 'text.secondary',
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
                <InputLabel id="zone-form3b-crop-type-label">Crop Type</InputLabel>
                <Select
                  labelId="zone-form3b-crop-type-label"
                  value={activeTab}
                  label="Crop Type"
                  onChange={handleCropTypeChange}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                  renderValue={(v) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GrassIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                      {v === ALL_CROP_TYPES ? ALL_CROP_TYPES_LABEL : CROP_TYPES[v]?.name || ''}
                    </Box>
                  )}
                >
                  <MenuItem value={ALL_CROP_TYPES}>All Type</MenuItem>
                  {CROP_TYPES.map((g, i) => (
                    <MenuItem key={g.id} value={i}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="zone-form3b-irrigation-label">Irrigation</InputLabel>
                <Select
                  labelId="zone-form3b-irrigation-label"
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
                  {IRRIGATION_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {zonesWithNoData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${zonesWithNoData} zone${zonesWithNoData > 1 ? 's' : ''} with no data`}
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

          {/* ── Search & Download Toolbar ── */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(themeColor, 0.12)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <TextField
              placeholder="Search zone or block..."
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{ width: 280 }}
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

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${searchFilteredRows.length} zone${searchFilteredRows.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: alpha(themeColor, 0.08), color: themeColor, fontWeight: 600 }}
              />
              <Tooltip
                title={
                  exportDisabled
                    ? 'No data available to export'
                    : `Download ${searchFilteredRows.length} zone${searchFilteredRows.length > 1 ? 's' : ''} as Excel`
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
                      borderRadius: 2,
                      bgcolor: themeColor,
                      textTransform: 'none',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      px: 2,
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

          {/* ── Table Section ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
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
                  sx={{ width: '100%', minWidth: TABLE_MIN_W, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
                >
                  <colgroup>
                    <col style={{ width: BLOCK_W }} />
                    <col style={{ width: ZONE_W }} />
                    <col style={{ width: AREA_W }} />
                    {cropColumns.map((c) => (
                      <col key={c.cropId} style={{ width: CROP_W }} />
                    ))}
                    <col style={{ width: 'auto' }} />
                  </colgroup>

                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{ ...stickyCellSx(0, themeColor, { color: 'white' }), top: 0, fontWeight: 700, zIndex: 4 }}
                      >
                        Block
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ ...stickyCellSx(BLOCK_W, themeColor, { color: 'white' }), top: 0, fontWeight: 700, zIndex: 4 }}
                      >
                        Zone
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5,
                          position: 'sticky',
                          top: 0,
                          zIndex: 3
                        }}
                      >
                        Cluster Area
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
                            py: 1.5,
                            position: 'sticky',
                            top: 0,
                            zIndex: 3
                          }}
                        >
                          {crop.cropName}
                        </TableCell>
                      ))}
                      <TableCell aria-hidden sx={{ backgroundColor: themeColor, position: 'sticky', top: 0, zIndex: 3, padding: 0 }} />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={cropColumns.length + 4} align="center" sx={{ py: 8 }}>
                          <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={44} thickness={4} sx={{ color: themeColor }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColor }}>
                              Loading Zone Form 3B Report...
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : Object.keys(grouped).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={cropColumns.length + 4} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No data available for {cropTypeName}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedEntries.map(([blockName, zones]) => {
                          const rows = [];

                          zones.forEach((zoneRow, idx) => {
                            const isLastInGroup = idx === zones.length - 1;
                            const clickable = zoneRow.zoneId != null && zoneRow.hasData;
                            rows.push(
                              <TableRow
                                key={`${blockName}-${zoneRow.zoneId || idx}`}
                                hover={clickable}
                                onClick={() => handleZoneClick(zoneRow)}
                                sx={{
                                  cursor: clickable ? 'pointer' : 'default',
                                  opacity: zoneRow.hasData ? 1 : 0.75,
                                  '&:hover': clickable
                                    ? { backgroundColor: alpha(themeColor, 0.08), transition: '0.2s' }
                                    : undefined
                                }}
                              >
                                {idx === 0 && (
                                  <TableCell
                                    rowSpan={zones.length}
                                    align="center"
                                    sx={{
                                      ...stickyCellSx(0, stickyTintLight),
                                      verticalAlign: 'middle',
                                      fontWeight: 700,
                                      borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                      zIndex: 2
                                    }}
                                  >
                                    <Stack alignItems="center" spacing={0.5}>
                                      <StoreIcon sx={{ fontSize: 24, color: themeColor, opacity: 0.8 }} />
                                      <Typography fontWeight={700} color={themeColor}>
                                        {blockName}
                                      </Typography>
                                      <Chip
                                        label={`${zones.length} Zones`}
                                        size="small"
                                        sx={{ fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.1), color: themeColor }}
                                      />
                                    </Stack>
                                  </TableCell>
                                )}
                                <TableCell
                                  align="left"
                                  sx={{
                                    ...stickyCellSx(BLOCK_W, theme.palette.background.paper),
                                    zIndex: 1,
                                    borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                                    borderBottom: isLastInGroup ? undefined : 'none'
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      label={zoneRow.zone}
                                      size="small"
                                      sx={{
                                        bgcolor: zoneRow.hasData ? alpha(themeColor, 0.1) : alpha('#9e9e9e', 0.15),
                                        color: zoneRow.hasData ? themeColor : 'text.secondary',
                                        fontWeight: zoneRow.hasData ? 600 : 500,
                                        borderRadius: 1.5,
                                        '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.2) } : undefined
                                      }}
                                    />
                                    {!zoneRow.hasData && (
                                      <Chip
                                        label="NA"
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: '0.65rem',
                                          fontWeight: 700,
                                          bgcolor: alpha('#ff9800', 0.15),
                                          color: '#e65100'
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell align="right" sx={numericCellSx}>
                                  {!zoneRow.hasData ? (
                                    <Chip label="NA" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                  ) : zoneRow.clusterArea ? (
                                    formatNumber(zoneRow.clusterArea)
                                  ) : (
                                    '—'
                                  )}
                                </TableCell>
                                {cropColumns.map((crop) => {
                                  const val = zoneRow.byId[crop.cropId];
                                  return (
                                    <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                                      {!zoneRow.hasData ? (
                                        <Chip label="NA" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                      ) : val ? (
                                        formatNumber(val)
                                      ) : (
                                        '—'
                                      )}
                                    </TableCell>
                                  );
                                })}
                                <TableCell aria-hidden sx={{ borderBottom: isLastInGroup ? undefined : 'none' }} />
                              </TableRow>
                            );
                          });

                          // Block subtotal
                          const bt = blockTotals[blockName];
                          rows.push(
                            <TableRow key={`${blockName}-subtotal`} sx={{ bgcolor: stickyTintSubtotal }}>
                              <TableCell
                                colSpan={2}
                                sx={{ ...stickyCellSx(0, stickyTintSubtotal), fontWeight: 700, color: themeColor, py: 1, zIndex: 2 }}
                              >
                                <strong>📊 Total for {blockName}</strong>
                              </TableCell>
                              <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}>
                                {bt.clusterArea ? formatNumber(bt.clusterArea) : '—'}
                              </TableCell>
                              {cropColumns.map((crop) => (
                                <TableCell
                                  key={crop.cropId}
                                  align="right"
                                  sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}
                                >
                                  {bt[crop.cropId] ? formatNumber(bt[crop.cropId]) : '—'}
                                </TableCell>
                              ))}
                              <TableCell aria-hidden sx={{ bgcolor: stickyTintSubtotal }} />
                            </TableRow>
                          );

                          return rows;
                        })}

                        {/* Grand total */}
                        <TableRow sx={{ bgcolor: stickyTintGrand }}>
                          <TableCell
                            colSpan={2}
                            sx={{
                              ...stickyCellSx(0, stickyTintGrand),
                              fontWeight: 800,
                              color: themeColor,
                              fontSize: '1rem',
                              py: 1.5,
                              zIndex: 2
                            }}
                          >
                            <strong>🏆 GRAND TOTAL</strong>
                          </TableCell>
                          <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 800, bgcolor: stickyTintGrand }}>
                            {grandTotals.clusterArea ? formatNumber(grandTotals.clusterArea) : '—'}
                          </TableCell>
                          {cropColumns.map((crop) => (
                            <TableCell key={crop.cropId} align="right" sx={{ ...numericCellSx, fontWeight: 800, bgcolor: stickyTintGrand }}>
                              {grandTotals[crop.cropId] ? formatNumber(grandTotals[crop.cropId]) : '—'}
                            </TableCell>
                          ))}
                          <TableCell aria-hidden sx={{ bgcolor: stickyTintGrand }} />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={groupedEntries.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Blocks per page"
                sx={{ borderTop: `1px solid ${alpha(themeColor, 0.1)}` }}
              />
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ZoneForm3B;
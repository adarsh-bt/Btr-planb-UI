import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, Box, Typography, useTheme, alpha, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Stack, FormControl, InputLabel, Select, MenuItem,
  IconButton, CircularProgress, TablePagination, LinearProgress,
  Tooltip, Divider, Avatar, Grid, Button, TextField, InputAdornment
} from '@mui/material';
import {
  LocationOn, ArrowBack, WaterDrop as WaterDropIcon,
  WbSunny as WbSunnyIcon, Water as WaterIcon, Grass as GrassIcon,
  Assessment as AssessmentIcon, Store as StoreIcon,
  CheckCircle as CheckCircleIcon, VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon, Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
import api from 'api/api';

const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;
const SESSION_KEY = 'talukForm3BState';

const TALUK_W = 220;
const AREA_W = 140;
const CROP_W = 150;

const DEFAULT_LAND_TYPE = 'ALL';
const LAND_TYPE_PARAM = { WET: 'Wet', DRY: 'Dry' };

const DEFAULT_IRRIGATION = 'ALL';
const IRRIGATION_PARAM = { IRRIGATED: 'true', UNIRRIGATED: 'false' };
const IRRIGATION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'IRRIGATED', label: 'Irrigated' },
  { value: 'UNIRRIGATED', label: 'Unirrigated' }
];

const CROP_TYPES = [
  { id: 3, name: 'Annual' },
  { id: 2, name: 'Perennial' }
];

const ALL_CROP_TYPES = -1;
const ALL_CROP_TYPES_LABEL = 'All Type';
const DEFAULT_CROP_TYPE = ALL_CROP_TYPES;
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

// Fallback taluks per district (only used if master API fails)
function getFallbackTaluks(districtId) {
  const map = {
    1: ['Thiruvananthapuran', 'Neyyattinkara', 'Nedumangad', 'Chirayinkeezhu'],
    2: ['Kollam', 'Karunagappally', 'Kottarakkara', 'Pathanapuram', 'Punalur'],
    3: ['Pathanamthitta', 'Kozhencherry', 'Ranni', 'Mallappally', 'Thiruvalla', 'Adoor'],
    4: ['Alappuzha', 'Chengannur', 'Mavelikkara', 'Kuttanad', 'Ambalappuzha'],
    5: ['Kottayam', 'Changanassery', 'Meenachil', 'Vaikom', 'Kanjirappally'],
    6: ['Idukki', 'Udumbanchola', 'Thodupuzha', 'Peermade', 'Devikulam'],
    7: ['Ernakulam', 'Aluva', 'Kothamangalam', 'Muvattupuzha', 'Kochi', 'Paravur', 'Kanayannur'],
    8: ['Thrissur', 'Chalakudy', 'Kodungallur', 'Mukundapuram', 'Talappilly'],
    9: ['Palakkad', 'Alathur', 'Chittur', 'Mannarkkad', 'Ottapalam'],
    10: ['Malappuram', 'Eranad', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Nilambur', 'Kondotty'],
    11: ['Kozhikode', 'Vadakara', 'Quilandy', 'Thamarassery', 'Koyilandy'],
    12: ['Wayanad', 'Mananthavady', 'Sulthan Bathery', 'Vythiri'],
    13: ['Kannur', 'Thalassery', 'Payyanur', 'Iritty', 'Taliparamba'],
    14: ['Kasaragod', 'Hosdurg', 'Vellarikundu']
  };
  return (map[districtId] || []).map((name, i) => ({ id: i + 1, talukNameEn: name }));
}

function mergeGroupResponses(responses) {
  const taluks = new Map();
  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((t) => {
      const key = t.talukId ?? `name:${t.talukName || 'Unassigned'}`;
      if (!taluks.has(key)) {
        taluks.set(key, {
          talukId: t.talukId ?? null,
          talukName: t.talukName,
          clusterArea: Number(t.clusterArea) || 0,
          crops: new Map()
        });
      }
      const entry = taluks.get(key);
      if (!entry.clusterArea && t.clusterArea) entry.clusterArea = Number(t.clusterArea) || 0;

      (t.crops || []).forEach((c) => {
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

  return Array.from(taluks.values()).map((t) => ({
    talukId: t.talukId,
    talukName: t.talukName,
    clusterArea: t.clusterArea,
    crops: Array.from(t.crops.values())
  }));
}

const TalukForm3B = () => {
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
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? DEFAULT_CROP_TYPE);
  const [landTypeTab, setLandTypeTab] = useState(stateData.landType ?? DEFAULT_LAND_TYPE);
  const [irrigation, setIrrigation] = useState(stateData.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [taluksList, setTaluksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');

  const isAllCropTypes = activeTab === ALL_CROP_TYPES;
  const cropTypeId = isAllCropTypes ? null : CROP_TYPES[activeTab]?.id;
  const cropTypeName = isAllCropTypes ? ALL_CROP_TYPES_LABEL : CROP_TYPES[activeTab]?.name;

  const numericCellSx = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

  // ── Fetch master taluks ──
  useEffect(() => {
    const fetchMasterTaluks = async () => {
      if (districtId == null) {
        setMasterLoading(false);
        return;
      }
      setMasterLoading(true);
      try {
        const res = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/taluks?distId=${districtId}`);
        const rows = res.data?.data;
        if (Array.isArray(rows) && rows.length > 0) {
          setTaluksList(
            rows.map((t) => ({
              id: t.id ?? t.talukId,
              talukNameEn: t.talukNameEn || t.talukName || t.name || ''
            }))
          );
        } else {
          setTaluksList(getFallbackTaluks(districtId));
        }
      } catch (e) {
        console.error('Error fetching master taluks:', e);
        setTaluksList(getFallbackTaluks(districtId));
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterTaluks();
  }, [districtId]);

  // ── Role auto-redirection ──
  useEffect(() => {
    let currentOfficeType = stateData.officeType || officeInfo.officeType;
    const tokenRole = AuthService.getrole();
    const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
    const des = localStorage.getItem('des') || '';

    if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
      const zoneId = officeInfo.zoneId || AuthService.getzone();
      navigate('/schemes/earas/Report/Form3B/ClusterForm3B', {
        replace: true,
        state: {
          officeType: 'FIELD_DATA_COLLECTOR', viewLevel: 'cluster', zoneId,
          zoneName: officeInfo.zoneName || '',
          talukId: officeInfo.talukOfficeId || officeInfo.talukId,
          talukName: officeInfo.talukName || '',
          districtId: officeInfo.districtOfficeId || officeInfo.districtId || districtId,
          districtName: officeInfo.districtName || districtName || '',
          isDirectAccess: true, landType: landTypeTab, irrigation, activeTab
        }
      });
      return;
    }

    if (!currentOfficeType) {
      try {
        if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
          currentOfficeType = 'TALUK';
        }
      } catch (e) { }
    }

    if (currentOfficeType === 'TALUK') {
      const tId = stateData.talukId || officeInfo.talukOfficeId || officeInfo.talukId;
      const tName = stateData.talukName || officeInfo.talukName || '';
      if (tId) {
        navigate('/schemes/earas/Report/Form3B/ZoneForm3B', {
          replace: true,
          state: {
            officeType: 'TALUK', viewLevel: 'taluk',
            talukId: tId, talukName: tName, selectedTaluk: tName,
            districtId, districtName, isDirectAccess: true,
            landType: landTypeTab, irrigation,
            activeTab: stateData.activeTab || 0
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeInfo, stateData, districtId, districtName, navigate]);

  useEffect(() => {
    if (districtId != null) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        districtId, districtName, selectedDistrict: districtName, agriculturalYear,
        landType: landTypeTab, irrigation, activeTab: stateData.activeTab ?? DEFAULT_CROP_TYPE
      }));
    }
  }, [landTypeTab, irrigation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch Form 3B data ──
  useEffect(() => {
    if (districtId == null) {
      setError('District is required. Please navigate from the state (district) report page.');
      return;
    }
    if (!isAllCropTypes && !cropTypeId) return;

    let cancelled = false;

    const buildUrl = (typeId) => {
      const params = new URLSearchParams({
        agriYear: agriculturalYear,
        districtId: String(districtId),
        cropTypeId: String(typeId)
      });
      const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
      if (landTypeParam) params.append('landType', landTypeParam);
      const irrigationParam = IRRIGATION_PARAM[irrigation];
      if (irrigationParam) params.append('isIrrigated', irrigationParam);
      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3B/district?${params.toString()}`;
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
        console.error('Error fetching Taluk Form 3B data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('District not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGroupData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropTypeId, isAllCropTypes, districtId, agriculturalYear, landTypeTab, irrigation]);

  // ── Crop columns ──
  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((t) =>
      (t.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  // ── Merge master taluks with API data (master order preserved) ──
  const talukRows = useMemo(() => {
    const apiById = new Map();
    const apiByName = new Map();
    apiData.forEach((t) => {
      if (t.talukId != null) apiById.set(t.talukId, t);
      if (t.talukName) apiByName.set(t.talukName.toLowerCase().trim(), t);
    });

    const buildRow = (talukId, talukName, api) => {
      const byId = {};
      (api?.crops || []).forEach((c) => { byId[c.cropId] = Number(c.areaInCents) || 0; });
      const clusterArea = Number(api?.clusterArea) || 0;
      const hasData = clusterArea > 0 || Object.keys(byId).length > 0;
      return {
        talukId: talukId ?? api?.talukId ?? null,
        taluk: talukName || api?.talukName || 'Unknown',
        clusterArea, byId, hasData
      };
    };

    if (taluksList && taluksList.length > 0) {
      return taluksList.map((t) => {
        const apiRow = apiById.get(t.id) || apiByName.get(t.talukNameEn?.toLowerCase().trim());
        return buildRow(t.id, t.talukNameEn, apiRow);
      });
    }
    return apiData.map((t) => buildRow(t.talukId, t.talukName, t));
  }, [apiData, taluksList]);

  // ── Search filter ──
  const searchFilteredRows = useMemo(() => {
    if (!searchTerm.trim()) return talukRows;
    const q = searchTerm.toLowerCase().trim();
    return talukRows.filter((r) => r.taluk?.toLowerCase().includes(q));
  }, [talukRows, searchTerm]);

  const taluksWithNoData = useMemo(
    () => talukRows.filter((r) => !r.hasData && r.talukId != null).length,
    [talukRows]
  );

  const areaTotals = useMemo(() => {
    let clusterArea = 0;
    searchFilteredRows.forEach((row) => { clusterArea += row.clusterArea || 0; });
    return { clusterArea };
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
  const handleCropTypeChange = (e) => { setActiveTab(Number(e.target.value)); setPage(0); };
  const handleLandTypeChange = (_, v) => { if (v != null) { setLandTypeTab(v); setPage(0); } };
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
    navigate('/schemes/earas/Report/Form3B/KeralaForm3B', {
      state: { activeTab, landType: landTypeTab, irrigation }
    });
  };

  const handleTalukClick = (talukName, talukId, hasData) => {
    if (talukId == null || !hasData) return;
    navigate('/schemes/earas/Report/Form3B/ZoneForm3B', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId, districtName, selectedDistrict: districtName,
        talukId, talukName, selectedTaluk: talukName,
        cropTypeId, cropTypeName, agriculturalYear,
        landType: landTypeTab, irrigation, activeTab
      }
    });
  };

  // ── Excel export ──
  const generateExcelFileName = () => {
    const parts = ['Form3B_TalukReport', (districtName || 'District').replace(/\s+/g, '_')];
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
      ['Form 3B — Taluk-wise Crop Area Report'],
      ['District', districtName],
      ['Agricultural Year', agriculturalYear],
      ['Crop Type', cropTypeName || '—'],
      ['Land Type', landTypeTab === 'ALL' ? 'All' : landTypeTab],
      ['Irrigation', IRRIGATION_OPTIONS.find((o) => o.value === irrigation)?.label || '—'],
      ['Area Unit', 'Cents'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    const headerRow = ['#', 'Taluk', 'Cluster Area', ...cropColumns.map((c) => c.cropName)];

    let serial = 0;
    const dataRows = searchFilteredRows.map((row) => {
      serial += 1;
      const cells = [serial, row.taluk];
      if (!row.hasData) {
        cells.push('NA');
        cropColumns.forEach(() => cells.push('NA'));
      } else {
        cells.push(row.clusterArea ? Number(row.clusterArea) : '—');
        cropColumns.forEach((c) => {
          const v = row.byId[c.cropId];
          cells.push(v ? Number(v) : '—');
        });
      }
      return cells;
    });

    const totalsRow = [
      '', 'GRAND TOTAL',
      Number(areaTotals.clusterArea.toFixed(2)),
      ...cropColumns.map((c) => Number((cropTotals[c.cropId] || 0).toFixed(2)))
    ];

    const aoa = [...headerMeta, headerRow, ...dataRows, totalsRow];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 24 }, { wch: 14 },
      ...cropColumns.map(() => ({ wch: 16 }))
    ];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form 3B Taluk');
    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const TABLE_MIN_W = TALUK_W + AREA_W + Math.max(cropColumns.length, 1) * CROP_W;
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
                Form 3B — Annual & Perennial Taluk-wise Crop Area Report - {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {districtName} District • AY {agriculturalYear} • Area in Cents
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
              <Chip label={`${landTypeTab} Land`} size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
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
              { label: 'Taluks', value: talukRows.length, icon: <LocationOn />, color: '#1565c0' },
              { label: 'Cluster Area', value: formatNumber(areaTotals.clusterArea), icon: <StoreIcon />, color: '#2e7d32' },
              { label: 'Crops', value: cropColumns.length, icon: <GrassIcon />, color: '#6a1b9a' },
              { label: 'With Data', value: talukRows.filter((r) => r.hasData).length, icon: <CheckCircleIcon />, color: '#0277bd' },
              { label: 'No Data', value: taluksWithNoData, icon: <VisibilityOffIcon />, color: '#ef6c00' }
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
                <InputLabel id="taluk-form3b-crop-type-label">Crop Type</InputLabel>
                <Select
                  labelId="taluk-form3b-crop-type-label"
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
                    <MenuItem key={g.id} value={i}>{g.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="taluk-form3b-irrigation-label">Irrigation</InputLabel>
                <Select
                  labelId="taluk-form3b-irrigation-label"
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

            {taluksWithNoData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${taluksWithNoData} taluk${taluksWithNoData > 1 ? 's' : ''} with no data`}
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
              placeholder="Search taluk..."
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
                    <col style={{ width: TALUK_W }} />
                    <col style={{ width: AREA_W }} />
                    {cropColumns.map((c) => (<col key={c.cropId} style={{ width: CROP_W }} />))}
                    <col style={{ width: 'auto' }} />
                  </colgroup>

                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="left"
                        sx={{
                          backgroundColor: themeColor, color: '#fff', fontWeight: 700,
                          whiteSpace: 'nowrap', py: 1.6, fontSize: '0.82rem', letterSpacing: 0.3,
                          borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                          position: 'sticky', left: 0, top: 0, zIndex: 6
                        }}
                      >
                        Taluk
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: themeColor, color: '#fff', fontWeight: 700,
                          whiteSpace: 'nowrap', py: 1.6, fontSize: '0.82rem', letterSpacing: 0.3,
                          borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                          position: 'sticky', top: 0, zIndex: 3
                        }}
                      >
                        Cluster Area
                      </TableCell>
                      {cropColumns.map((crop) => (
                        <TableCell
                          key={crop.cropId}
                          align="right"
                          sx={{
                            backgroundColor: themeColor, color: '#fff', fontWeight: 700,
                            whiteSpace: 'nowrap', py: 1.6, fontSize: '0.82rem', letterSpacing: 0.3,
                            borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                            position: 'sticky', top: 0, zIndex: 3
                          }}
                        >
                          {crop.cropName}
                        </TableCell>
                      ))}
                      <TableCell aria-hidden sx={{ backgroundColor: themeColor, padding: 0, position: 'sticky', top: 0, zIndex: 3 }} />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={cropColumns.length + 3} align="center" sx={{ py: 10 }}>
                          <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={44} thickness={4} sx={{ color: themeColor }} />
                            <Box textAlign="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: themeColor }}>
                                Loading Taluk Form 3B Report...
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
                        <TableCell colSpan={cropColumns.length + 3} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">
                            {searchTerm
                              ? `No taluks found matching "${searchTerm}"`
                              : `No data available for ${cropTypeName}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedRows.map((row, index) => {
                          const clickable = row.talukId != null && row.hasData;
                          return (
                            <TableRow
                              key={row.talukId ?? `row-${index}`}
                              hover={clickable}
                              onClick={() => handleTalukClick(row.taluk, row.talukId, row.hasData)}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                backgroundColor: !row.hasData
                                  ? alpha('#ff9800', 0.03)
                                  : (index % 2 === 1 ? alpha(themeColor, 0.015) : 'transparent'),
                                '&:hover': clickable
                                  ? { backgroundColor: alpha(themeColor, 0.08), transition: '0.2s' }
                                  : undefined
                              }}
                            >
                              <TableCell
                                align="left"
                                sx={{
                                  position: 'sticky', left: 0, zIndex: 2,
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
                                    {row.taluk?.charAt(0)?.toUpperCase()}
                                  </Avatar> */}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: row.hasData ? 600 : 400,
                                      color: row.hasData ? 'text.primary' : 'text.secondary'
                                    }}
                                  >
                                    {row.taluk}
                                  </Typography>
                                  {!row.hasData && row.talukId != null && (
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
                              <TableCell align="right" sx={numericCellSx}>
                                {!row.hasData ? (
                                  <Typography variant="body2" color="text.secondary">NA</Typography>
                                ) : row.clusterArea ? (
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(row.clusterArea)}</Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">—</Typography>
                                )}
                              </TableCell>
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
                          );
                        })}

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

export default TalukForm3B;
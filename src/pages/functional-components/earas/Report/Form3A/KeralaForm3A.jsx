import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, Box, Typography, useTheme, alpha, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Stack, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, LinearProgress, TablePagination, IconButton,
  Tooltip, Divider, Avatar, Grid, Button, TextField, InputAdornment
} from '@mui/material';
import {
  LocationOn, WaterDrop as WaterDropIcon, WbSunny as WbSunnyIcon,
  EnergySavingsLeaf as EnergySavingsLeafIcon, Water as WaterIcon,
  Grass as GrassIcon, Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon, Store as StoreIcon,
  Assessment as AssessmentIcon, CheckCircle as CheckCircleIcon,
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
const SESSION_KEY = 'keralaForm3AState';

const DISTRICT_W = 220;
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

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

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

function mergeGroupResponses(responses) {
  const districts = new Map();
  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((d) => {
      const key = d.districtId ?? `name:${d.districtName || 'Unassigned'}`;
      if (!districts.has(key)) {
        districts.set(key, {
          districtId: d.districtId ?? null,
          districtName: d.districtName,
          clusterArea: Number(d.clusterArea) || 0,
          nucArea: Number(d.nucArea) || 0,
          ffsArea: Number(d.ffsArea) || 0,
          cosArea: Number(d.cosArea) || 0,
          crops: new Map()
        });
      }
      const entry = districts.get(key);
      if (Number(d.clusterArea) > 0) {
        entry.clusterArea = Number(d.clusterArea);
      }
      if (!entry.nucArea && d.nucArea) entry.nucArea = Number(d.nucArea) || 0;
      if (!entry.ffsArea && d.ffsArea) entry.ffsArea = Number(d.ffsArea) || 0;
      if (!entry.cosArea && d.cosArea) entry.cosArea = Number(d.cosArea) || 0;

      (d.crops || []).forEach((c) => {
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

  return Array.from(districts.values()).map((d) => ({
    districtId: d.districtId,
    districtName: d.districtName,
    clusterArea: d.clusterArea,
    nucArea: d.nucArea,
    ffsArea: d.ffsArea,
    cosArea: d.cosArea,
    crops: Array.from(d.crops.values())
  }));
}

const KeralaForm3A = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const themeColorAlt = '#0b4ea2';
  const navigate = useNavigate();
  const location = useLocation();

  const agriculturalYear = AuthService.agriyear() || '2025-2026';

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTab, setActiveTab] = useState(() => (location.state?.isDirectAccess ? ALL_CROP_GROUPS : (location.state?.activeTab ?? stateData.activeTab ?? ALL_CROP_GROUPS)));
  const [landTypeTab, setLandTypeTab] = useState(() => (location.state?.isDirectAccess ? DEFAULT_LAND_TYPE : (location.state?.landType ?? location.state?.landTypeTab ?? stateData.landTypeTab ?? DEFAULT_LAND_TYPE)));
  const [seasonId, setSeasonId] = useState(() => (location.state?.isDirectAccess ? DEFAULT_SEASON_ID : (location.state?.seasonId ?? stateData.seasonId ?? DEFAULT_SEASON_ID)));
  const [irrigation, setIrrigation] = useState(() => location.state?.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
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

  // ── Fetch master districts ──
  useEffect(() => {
    const fetchMasterDistricts = async () => {
      setMasterLoading(true);
      try {
        const res = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/districts`);
        const rows = res.data?.data;
        if (Array.isArray(rows) && rows.length > 0) {
          setDistrictsList(
            rows.map((d) => ({
              distId: d.distId ?? d.id,
              distNameEn: d.distNameEn || d.districtName || d.name || ''
            }))
          );
        } else {
          setDistrictsList(getFallbackDistricts());
        }
      } catch (e) {
        console.error('Error fetching master districts:', e);
        setDistrictsList(getFallbackDistricts());
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterDistricts();
  }, []);

  // ── Role-based redirection ──
  useEffect(() => {
    try {
      const officeInfo = JSON.parse(sessionStorage.getItem('userOfficeInfo') || '{}');
      let officeType = location.state?.officeType || officeInfo.officeType;
      const tokenRole = AuthService.getrole();
      const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
      const des = localStorage.getItem('des') || '';

      if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
        officeType = 'FIELD_DATA_COLLECTOR';
      } else if (!officeType) {
        if (roles.some((r) => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
          officeType = 'TALUK';
        } else if (roles.some((r) => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
          officeType = 'DISTRICT';
        }
      }

      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = officeInfo.zoneId || AuthService.getzone();
        navigate('/schemes/earas/Report/Form3A/ClusterForm3A', {
          replace: true,
          state: {
            officeType: 'FIELD_DATA_COLLECTOR', viewLevel: 'cluster', zoneId,
            zoneName: officeInfo.zoneName || '',
            talukId: officeInfo.talukOfficeId || officeInfo.talukId,
            talukName: officeInfo.talukName || '',
            districtId: officeInfo.districtOfficeId || officeInfo.districtId || localStorage.getItem('dis'),
            districtName: officeInfo.districtName || '',
            isDirectAccess: true, landType: landTypeTab, seasonId, irrigation,
            activeTab: ALL_CROP_GROUPS
          }
        });
      } else if (officeType === 'DISTRICT') {
        const distId = location.state?.districtId || officeInfo.districtOfficeId || officeInfo.districtId || localStorage.getItem('dis');
        const distName = location.state?.districtName || officeInfo.districtName || '';
        if (distId) {
          navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
            replace: true,
            state: {
              officeType: 'DISTRICT', viewLevel: 'district',
              districtId: distId, districtName: distName, selectedDistrict: distName,
              isDirectAccess: true, landType: landTypeTab, seasonId, irrigation,
              activeTab: ALL_CROP_GROUPS
            }
          });
        }
      } else if (officeType === 'TALUK') {
        const tId = location.state?.talukId || officeInfo.talukOfficeId || officeInfo.talukId;
        const tName = location.state?.talukName || officeInfo.talukName || '';
        const distId = location.state?.districtId || officeInfo.districtOfficeId || officeInfo.districtId || localStorage.getItem('dis');
        const distName = location.state?.districtName || officeInfo.districtName || '';
        if (tId) {
          navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
            replace: true,
            state: {
              officeType: 'TALUK', viewLevel: 'taluk',
              talukId: tId, talukName: tName, selectedTaluk: tName,
              districtId: distId, districtName: distName,
              isDirectAccess: true, landType: landTypeTab, seasonId, irrigation,
              activeTab: ALL_CROP_GROUPS
            }
          });
        }
      }
    } catch (e) {
      console.error('Error during role check redirection in KeralaForm3A:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, navigate]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ activeTab, landTypeTab, seasonId, irrigation }));
  }, [activeTab, landTypeTab, seasonId, irrigation]);

  // ── Fetch Form 3A data ──
  useEffect(() => {
    if (!isAllCropGroups && !cropGroupId) return;
    let cancelled = false;

    const buildUrl = (groupId) => {
      const params = new URLSearchParams({ agriYear: agriculturalYear, cropGroupId: String(groupId) });
      const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
      if (landTypeParam) params.append('landType', landTypeParam);
      params.append('seasonId', String(seasonId));
      const irrigationParam = IRRIGATION_PARAM[irrigation];
      if (irrigationParam) params.append('isIrrigated', irrigationParam);
      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/state?${params.toString()}`;
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
        console.error('Error fetching Form 3A data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGroupData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, isAllCropGroups, agriculturalYear, landTypeTab, seasonId, irrigation]);

  // ── Crop columns (union) ──
  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((d) =>
      (d.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  // ── Merge master districts with API data (master order preserved) ──
  const districtRows = useMemo(() => {
    const apiMapById = new Map();
    const apiMapByName = new Map();
    apiData.forEach((d) => {
      if (d.districtId != null) apiMapById.set(d.districtId, d);
      if (d.districtName) apiMapByName.set(d.districtName.toLowerCase().trim(), d);
    });

    const buildRow = (distId, distName, api) => {
      const byId = {};
      (api?.crops || []).forEach((c) => { byId[c.cropId] = Number(c.areaInCents) || 0; });
      const clusterArea = Number(api?.clusterArea) || 0;
      const nucArea = Number(api?.nucArea) || 0;
      const ffsArea = Number(api?.ffsArea) || 0;
      const cosArea = Number(api?.cosArea) || 0;
      const hasData = clusterArea > 0 || nucArea > 0 || ffsArea > 0 || cosArea > 0 || Object.keys(byId).length > 0;
      return {
        districtId: distId ?? api?.districtId ?? null,
        district: distName || api?.districtName || 'Unknown',
        clusterArea, nucArea, ffsArea, cosArea, byId, hasData
      };
    };

    if (districtsList && districtsList.length > 0) {
      return districtsList.map((d) => {
        const api = apiMapById.get(d.distId) || apiMapByName.get(d.distNameEn?.toLowerCase().trim());
        return buildRow(d.distId, d.distNameEn, api);
      });
    }

    return apiData.map((d) => buildRow(d.districtId, d.districtName, d));
  }, [apiData, districtsList]);

  // ── Search-filtered rows (used for table + export) ──
  const searchFilteredRows = useMemo(() => {
    if (!searchTerm.trim()) return districtRows;
    const q = searchTerm.toLowerCase().trim();
    return districtRows.filter((r) => r.district?.toLowerCase().includes(q));
  }, [districtRows, searchTerm]);

  const districtsWithNoData = useMemo(
    () => districtRows.filter((r) => !r.hasData && r.districtId != null).length,
    [districtRows]
  );

  const areaTotals = useMemo(() => {
    let clusterArea = 0, nucArea = 0, ffsArea = 0, cosArea = 0;
    searchFilteredRows.forEach((r) => {
      clusterArea += r.clusterArea || 0;
      nucArea += r.nucArea || 0;
      ffsArea += r.ffsArea || 0;
      cosArea += r.cosArea || 0;
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

  const handleDistrictClick = (districtName, districtId, hasData) => {
    if (districtId == null || !hasData) return;
    navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
      state: {
        officeType: location.state?.officeType || 'DIRECTORATE',
        districtId, districtName, selectedDistrict: districtName,
        cropGroupId, cropGroupName, agriculturalYear,
        landType: landTypeTab, seasonId, irrigation, activeTab
      }
    });
  };

  // ── Excel filename builder ──
  const generateExcelFileName = () => {
    const parts = ['Form3A_SeasonalCropReport'];
    parts.push((cropGroupName || 'All').replace(/\s+/g, '_'));
    if (landTypeTab !== 'ALL') parts.push(landTypeTab);
    if (seasonName) parts.push(seasonName);
    if (irrigation !== 'ALL') parts.push(irrigationLabel.replace(/\s+/g, '_'));
    parts.push(agriculturalYear);
    if (searchTerm.trim()) parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.xlsx`;
  };

  // ── Export the search-filtered dataset (all districts + totals) to Excel ──
  const handleExportExcel = () => {
    if (!searchFilteredRows || searchFilteredRows.length === 0) return;

    const headerMeta = [
      ['Form 3A — Report of Seasonal Crop'],
      ['Agricultural Year', agriculturalYear],
      ['Crop Group', cropGroupName || '—'],
      ['Land Type', landTypeTab === 'ALL' ? 'All' : landTypeTab],
      ['Season', seasonName || '—'],
      ['Irrigation', irrigationLabel || '—'],
      ['Area Unit', 'Cents'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    // Build header row
    const headerRow = [
      '#',
      'District',
      'Cluster Area',
      'NUC Area',
      'FFS Area',
      'COS Area',
      ...cropColumns.map((c) => c.cropName)
    ];

    // Build data rows
    let serial = 0;
    const dataRows = searchFilteredRows.map((row) => {
      serial += 1;
      const cells = [serial, row.district];
      if (!row.hasData) {
        // NA for districts with no data
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

    // Totals row
    const totalsRow = [
      '',
      'GRAND TOTAL',
      Number(areaTotals.clusterArea.toFixed(2)),
      Number(areaTotals.nucArea.toFixed(2)),
      Number(areaTotals.ffsArea.toFixed(2)),
      Number(areaTotals.cosArea.toFixed(2)),
      ...cropColumns.map((c) => Number((cropTotals[c.cropId] || 0).toFixed(2)))
    ];

    const aoa = [
      ...headerMeta,
      headerRow,
      ...dataRows,
      totalsRow
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Column widths
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 24 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      ...cropColumns.map(() => ({ wch: 16 }))
    ];

    // Merges for metadata section
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form 3A Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const TABLE_MIN_W = DISTRICT_W + 4 * AREA_W + Math.max(cropColumns.length, 1) * CROP_W;
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
        {/* ── Header band with gradient ── */}
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
                Form 3A — Seasonal Crop Report {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                Kerala State • Agricultural Year {agriculturalYear} • Area in Cents
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
              <Chip
                label={`${landTypeTab} Land`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
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
              { label: 'Districts', value: districtRows.length, icon: <LocationOn />, color: '#1565c0' },
              { label: 'Cluster Area', value: formatNumber(areaTotals.clusterArea), icon: <StoreIcon />, color: '#2e7d32' },
              { label: 'Nuc Area', value: formatNumber(areaTotals.nucArea), icon: <GrassIcon />, color: '#6a1b9a' },
              { label: 'FFS Area', value: formatNumber(areaTotals.ffsArea), icon: <EnergySavingsLeafIcon />, color: '#ef6c00' },
              { label: 'CoS Area', value: formatNumber(areaTotals.cosArea), icon: <CheckCircleIcon />, color: '#0277bd' }
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

          {/* ── Filters ── */}
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
                <InputLabel id="crop-group-label">Crop Group</InputLabel>
                <Select
                  labelId="crop-group-label"
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
                <InputLabel id="season-label">Season</InputLabel>
                <Select
                  labelId="season-label"
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
                <InputLabel id="irrigation-label">Irrigation</InputLabel>
                <Select
                  labelId="irrigation-label"
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

            {districtsWithNoData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${districtsWithNoData} district${districtsWithNoData > 1 ? 's' : ''} with no data`}
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
              placeholder="Search district..."
              size="small"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
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
            <Typography variant="p" color="text.secondary" sx={{ fontSize: '0.8rem' }}>All area in Cents</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${searchFilteredRows.length} row${searchFilteredRows.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: alpha(themeColor, 0.08),
                  color: themeColor,
                  fontWeight: 600
                }}
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

          {/* ── Table ── */}
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
                    <col style={{ width: DISTRICT_W }} />
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
                        { key: 'district', label: 'District', align: 'left' },
                        { key: 'cluster', label: 'Cluster Area', align: 'right' },
                        { key: 'nuc', label: 'NUC Area', align: 'right' },
                        { key: 'ffs', label: 'FFS Area', align: 'right' },
                        { key: 'cos', label: 'CoS Area', align: 'right' }
                      ].map((h) => {
                        const isDistrict = h.key === 'district';
                        return (
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
                              // Sticky header cell for District only.
                              // zIndex must be HIGHER than the sticky body cell (which uses 2)
                              // so scrolled data never renders on top of this header.
                              ...(isDistrict && {
                                position: 'sticky',
                                left: 0,
                                zIndex: 6,               // > body sticky (2) and regular header cells
                                backgroundColor: themeColor // solid, so it fully covers scrolled content behind it
                              })
                            }}
                          >
                            {h.label}
                          </TableCell>
                        );
                      })}
                      {cropColumns.map((crop) => (
                        <TableCell
                          key={crop.cropId}
                          align="right"
                          sx={{
                            backgroundColor: themeColor, color: '#fff', fontWeight: 700,
                            whiteSpace: 'nowrap', py: 1.6, fontSize: '0.82rem', letterSpacing: 0.3,
                            borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                            zIndex: 3 // keep header cells above regular body cells during scroll
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
                                Loading Kerala State Form 3A Report...
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
                              ? `No districts found matching "${searchTerm}"`
                              : `No data available for ${cropGroupName}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedRows.map((row, index) => {
                          const clickable = row.districtId != null && row.hasData;
                          return (
                            <TableRow
                              key={row.districtId ?? `row-${index}`}
                              hover={clickable}
                              onClick={() => handleDistrictClick(row.district, row.districtId, row.hasData)}
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
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1,
                                  backgroundColor: !row.hasData ? '#fffaf2' : (index % 2 === 1 ? '#f8fafc' : theme.palette.background.paper)
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
                                    {row.district?.charAt(0)?.toUpperCase()}
                                  </Avatar> */}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: row.hasData ? 600 : 400,
                                      color: row.hasData ? 'text.primary' : 'text.secondary'
                                    }}
                                  >
                                    {row.district}
                                  </Typography>
                                  {!row.hasData && row.districtId != null && (
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
                              fontWeight: 800, color: themeColor, letterSpacing: 0.5
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

export default KeralaForm3A;
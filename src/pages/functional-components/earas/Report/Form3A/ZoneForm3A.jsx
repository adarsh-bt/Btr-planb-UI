import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardContent, Box, Typography, useTheme, alpha, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Stack, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, LinearProgress, TablePagination, IconButton,
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
import api from 'api/api';

const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;
const SESSION_KEY = 'zoneForm3AState';

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

const BLOCK_W = 160;
const ZONE_W = 200;
const AREA_W = 120;
const CROP_COL_W = 150;

const themeColor = '#05307a';
const themeColorAlt = '#0b4ea2';
const stickyTintLight = '#eef1f7';
const stickyTintSubtotal = '#e4e9f2';

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function resolveBlockName(blockId, blockName, zoneName) {
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;
  return 'Unassigned';
}

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function getFallbackZones() {
  return [
    { zoneId: 1, zoneNameEn: 'Zone 1', blockName: 'Block A', blockId: 1 },
    { zoneId: 2, zoneNameEn: 'Zone 2', blockName: 'Block A', blockId: 1 },
    { zoneId: 3, zoneNameEn: 'Zone 3', blockName: 'Block B', blockId: 2 },
    { zoneId: 4, zoneNameEn: 'Zone 4', blockName: 'Block B', blockId: 2 },
    { zoneId: 5, zoneNameEn: 'Zone 5', blockName: 'Block C', blockId: 3 }
  ];
}

function mergeGroupResponses(responses) {
  const zones = new Map();
  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((z) => {
      const key = z.zoneId ?? `name:${z.blockId ?? ''}:${z.zoneName || 'Unassigned'}`;
      if (!zones.has(key)) {
        zones.set(key, {
          blockId: z.blockId ?? null,
          blockName: z.blockName,
          zoneId: z.zoneId ?? null,
          zoneName: z.zoneName,
          clusterArea: Number(z.clusterArea) || 0,
          nucArea: Number(z.nucArea) || 0,
          ffsArea: Number(z.ffsArea) || 0,
          cosArea: Number(z.cosArea) || 0,
          crops: new Map()
        });
      }
      const entry = zones.get(key);
      if (Number(z.clusterArea) > 0) {
        entry.clusterArea = Number(z.clusterArea);
      }
      if (!entry.nucArea && z.nucArea) entry.nucArea = Number(z.nucArea) || 0;
      if (!entry.ffsArea && z.ffsArea) entry.ffsArea = Number(z.ffsArea) || 0;
      if (!entry.cosArea && z.cosArea) entry.cosArea = Number(z.cosArea) || 0;

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
    nucArea: z.nucArea,
    ffsArea: z.ffsArea,
    cosArea: z.cosArea,
    crops: Array.from(z.crops.values())
  }));
}

const ZoneForm3A = () => {
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
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? ALL_CROP_GROUPS);
  const [landTypeTab, setLandTypeTab] = useState(stateData.landType ?? DEFAULT_LAND_TYPE);
  const [seasonId, setSeasonId] = useState(stateData.seasonId ?? DEFAULT_SEASON_ID);
  const [irrigation, setIrrigation] = useState(stateData.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  // ── Fetch master zones ──
  useEffect(() => {
    const fetchMasterZones = async () => {
      if (talukId == null) {
        setMasterLoading(false);
        return;
      }
      setMasterLoading(true);
      try {
        const res = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/zones?desTalukId=${talukId}`);
        const rows = res.data?.data;
        if (Array.isArray(rows) && rows.length > 0) {
          setZonesList(
            rows.map((z) => ({
              zoneId: z.zoneId ?? z.id,
              zoneNameEn: z.zoneNameEn || z.zoneName || z.name || '',
              blockId: z.blockId ?? null,
              blockName: z.blockName || null,
              blockType: z.blockType || null
            }))
          );
        } else {
          setZonesList(getFallbackZones());
        }
      } catch (e) {
        console.error('Error fetching master zones:', e);
        setZonesList(getFallbackZones());
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterZones();
  }, [talukId]);

  // ── Role auto-redirection for FDC ──
  useEffect(() => {
    try {
      const tokenRole = AuthService.getrole();
      const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
      const des = localStorage.getItem('des') || '';

      if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
        const zoneId = officeInfo.zoneId || AuthService.getzone();
        navigate('/schemes/earas/Report/Form3A/ClusterForm3A', {
          replace: true,
          state: {
            officeType: 'FIELD_DATA_COLLECTOR', viewLevel: 'cluster', zoneId,
            zoneName: officeInfo.zoneName || '',
            talukId: officeInfo.talukOfficeId || officeInfo.talukId || talukId,
            talukName: officeInfo.talukName || talukName || '',
            districtId: officeInfo.districtOfficeId || officeInfo.districtId || districtId,
            districtName: officeInfo.districtName || districtName || '',
            isDirectAccess: true, landType: landTypeTab, seasonId, irrigation,
            activeTab: ALL_CROP_GROUPS
          }
        });
      }
    } catch (e) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeInfo, stateData, districtId, districtName, talukId, talukName, navigate]);

  // ── Persist context ──
  useEffect(() => {
    if (talukId != null) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        districtId, districtName, selectedDistrict: districtName,
        talukId, talukName, selectedTaluk: talukName, agriculturalYear,
        landType: landTypeTab, seasonId, irrigation,
        activeTab: stateData.activeTab ?? ALL_CROP_GROUPS
      }));
    }
  }, [talukId, talukName, districtId, districtName, agriculturalYear, landTypeTab, seasonId, irrigation, stateData.activeTab]);

  useEffect(() => {
    const saved = getSavedState();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...saved, activeTab, landType: landTypeTab, seasonId, irrigation }));
  }, [activeTab, landTypeTab, seasonId, irrigation]);

  // ── Fetch Form 3A zone data ──
  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the District (Taluk) report page.');
      return;
    }
    if (!isAllCropGroups && !cropGroupId) return;

    let cancelled = false;

    const buildUrl = (groupId) => {
      const params = new URLSearchParams({
        agriYear: agriculturalYear,
        talukId: String(talukId),
        cropGroupId: String(groupId)
      });
      const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
      if (landTypeParam) params.append('landType', landTypeParam);
      params.append('seasonId', String(seasonId));
      const irrigationParam = IRRIGATION_PARAM[irrigation];
      if (irrigationParam) params.append('isIrrigated', irrigationParam);
      console.log(`${BASE_URL}/earas-form1-entry/api/progress-report/form3A/taluk?${params.toString()}`);
      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/taluk?${params.toString()}`;
    };

    const fetchZoneData = async () => {
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
        console.error('Error fetching Zone Form 3A data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchZoneData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, isAllCropGroups, talukId, agriculturalYear, landTypeTab, seasonId, irrigation]);

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

  // ── Merge master zones with API data (master order preserved) ──
  const blocksData = useMemo(() => {
    // Build lookup of API data by zoneId and by name
    const apiById = new Map();
    const apiByName = new Map();
    apiData.forEach((z) => {
      if (z.zoneId != null) apiById.set(z.zoneId, z);
      if (z.zoneName) apiByName.set(z.zoneName.toLowerCase().trim(), z);
    });

    const buildZoneRow = (zoneId, zoneName, blockId, blockName, api) => {
      const byId = {};
      (api?.crops || []).forEach((c) => { byId[c.cropId] = Number(c.areaInCents) || 0; });
      const clusterArea = Number(api?.clusterArea) || 0;
      const nucArea = Number(api?.nucArea) || 0;
      const ffsArea = Number(api?.ffsArea) || 0;
      const cosArea = Number(api?.cosArea) || 0;
      const hasData = clusterArea > 0 || nucArea > 0 || ffsArea > 0 || cosArea > 0 || Object.keys(byId).length > 0;
      const resolvedBlock = resolveBlockName(blockId, blockName, zoneName);
      return {
        zoneId: zoneId ?? api?.zoneId ?? null,
        zoneName: zoneName || api?.zoneName || 'Unknown',
        blockId: blockId ?? api?.blockId ?? null,
        blockName: resolvedBlock,
        clusterArea, nucArea, ffsArea, cosArea, byId, hasData
      };
    };

    // Compose list of zone rows (merge master + API)
    let zoneRows = [];
    if (zonesList && zonesList.length > 0) {
      zoneRows = zonesList.map((z) => {
        const api = apiById.get(z.zoneId) || apiByName.get(z.zoneNameEn?.toLowerCase().trim());
        return buildZoneRow(z.zoneId, z.zoneNameEn, z.blockId, z.blockName, api);
      });
    } else {
      zoneRows = apiData.map((z) => buildZoneRow(z.zoneId, z.zoneName, z.blockId, z.blockName, z));
    }

    // Group by block (order-of-first-appearance, then sort)
    const order = [];
    const map = new Map();
    zoneRows.forEach((z) => {
      if (!map.has(z.blockName)) {
        order.push(z.blockName);
        map.set(z.blockName, []);
      }
      map.get(z.blockName).push(z);
    });

    // Sort: real blocks alphabetically, then Municipality, Corporation, Unassigned at end
    const tailOrder = ['Municipality', 'Corporation', 'Unassigned'];
    order.sort((a, b) => {
      const ai = tailOrder.indexOf(a);
      const bi = tailOrder.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }
      return a.localeCompare(b);
    });

    return order.map((bName) => ({
      blockName: bName,
      zones: map.get(bName)
    }));
  }, [apiData, zonesList]);

  // Count zones with no data
  const zonesWithNoData = useMemo(() => {
    let c = 0;
    blocksData.forEach((b) => b.zones.forEach((z) => { if (!z.hasData) c++; }));
    return c;
  }, [blocksData]);

  // ── Search filter on block/zone ──
  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) return blocksData;
    const q = searchTerm.toLowerCase().trim();
    return blocksData
      .map((b) => ({
        ...b,
        zones: b.zones.filter(
          (z) => z.zoneName.toLowerCase().includes(q) || b.blockName.toLowerCase().includes(q)
        )
      }))
      .filter((b) => b.zones.length > 0);
  }, [blocksData, searchTerm]);

  // ── Per-block crop & area totals ──
  const blockTotals = useMemo(() => {
    const map = new Map();
    filteredBlocks.forEach((b) => {
      const totals = {};
      cropColumns.forEach((c) => (totals[c.cropId] = 0));
      let clusterArea = 0, nucArea = 0, ffsArea = 0, cosArea = 0;

      b.zones.forEach((z) => {
        clusterArea += z.clusterArea || 0;
        nucArea += z.nucArea || 0;
        ffsArea += z.ffsArea || 0;
        cosArea += z.cosArea || 0;
        cropColumns.forEach((c) => {
          if (z.byId && z.byId[c.cropId] !== undefined) totals[c.cropId] += z.byId[c.cropId];
        });
      });
      map.set(b.blockName, { totals, clusterArea, nucArea, ffsArea, cosArea });
    });
    return map;
  }, [filteredBlocks, cropColumns]);

  // ── Grand totals ──
  const grandTotals = useMemo(() => {
    const totals = {};
    cropColumns.forEach((c) => (totals[c.cropId] = 0));
    let clusterArea = 0, nucArea = 0, ffsArea = 0, cosArea = 0;

    filteredBlocks.forEach((b) => {
      const bt = blockTotals.get(b.blockName) || {};
      clusterArea += bt.clusterArea || 0;
      nucArea += bt.nucArea || 0;
      ffsArea += bt.ffsArea || 0;
      cosArea += bt.cosArea || 0;
      cropColumns.forEach((c) => {
        totals[c.cropId] += bt.totals?.[c.cropId] || 0;
      });
    });
    return { totals, clusterArea, nucArea, ffsArea, cosArea };
  }, [filteredBlocks, blockTotals, cropColumns]);

  const TABLE_MIN_W = BLOCK_W + ZONE_W + 4 * AREA_W + Math.max(cropColumns.length, 1) * CROP_COL_W;

  // ── Handlers ──
  const handleCropGroupChange = (e) => { setActiveTab(Number(e.target.value)); setPage(0); };
  const handleLandTypeChange = (_, v) => { if (v != null) { setLandTypeTab(v); setPage(0); } };
  const handleSeasonChange = (e) => { setSeasonId(Number(e.target.value)); setPage(0); };
  const handleIrrigationChange = (e) => { setIrrigation(e.target.value); setPage(0); };
  const formatNumber = (num) => Number(num || 0).toFixed(2);
  const handleChangePage = (_, p) => setPage(p);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
  const handleClearSearch = () => { setSearchTerm(''); setPage(0); };

  const paginatedBlocks = useMemo(
    () => filteredBlocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredBlocks, page, rowsPerPage]
  );

  const handleBack = () => {
    let effectiveOfficeType = stateData.officeType || officeInfo.officeType;
    if (!effectiveOfficeType) {
      try {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';
        if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
          effectiveOfficeType = 'TALUK';
        } else if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
          effectiveOfficeType = 'DISTRICT';
        }
      } catch (e) { }
    }

    if (effectiveOfficeType === 'TALUK' || stateData.isDirectAccess) {
      navigate('/Report');
    } else {
      navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
        state: {
          officeType: effectiveOfficeType, districtId, districtName,
          selectedDistrict: districtName, landType: landTypeTab,
          seasonId, irrigation, activeTab
        }
      });
    }
  };

  const handleZoneClick = (blockId, blockName, zoneId, zoneName, hasData) => {
    if (zoneId == null || !hasData) return;
    navigate('/schemes/earas/Report/Form3A/ClusterForm3A', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId, districtName, selectedDistrict: districtName,
        talukId, talukName, selectedTaluk: talukName,
        blockId, blockName, selectedBlock: blockName,
        zoneId, zoneName, selectedZone: zoneName,
        cropGroupId, cropGroupName, agriculturalYear,
        landType: landTypeTab, seasonId, irrigation, activeTab
      }
    });
  };

  // ── Excel export ──
  const generateExcelFileName = () => {
    const parts = ['Form3A_ZoneReport', (talukName || 'Taluk').replace(/\s+/g, '_')];
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
    if (!filteredBlocks || filteredBlocks.length === 0) return;

    const headerMeta = [
      ['Form 3A — Zone-wise Seasonal Crop Report'],
      ['District', districtName],
      ['Taluk', talukName],
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
      '#', 'Block', 'Zone', 'Cluster Area', 'NUC Area', 'FFS Area', 'COS Area',
      ...cropColumns.map((c) => c.cropName)
    ];

    const aoa = [...headerMeta, headerRow];
    let serial = 0;

    filteredBlocks.forEach((block) => {
      block.zones.forEach((zone) => {
        serial += 1;
        const row = [serial, block.blockName, zone.zoneName];
        if (!zone.hasData) {
          row.push('NA', 'NA', 'NA', 'NA');
          cropColumns.forEach(() => row.push('NA'));
        } else {
          row.push(
            zone.clusterArea ? Number(zone.clusterArea) : '—',
            zone.nucArea ? Number(zone.nucArea) : '—',
            zone.ffsArea ? Number(zone.ffsArea) : '—',
            zone.cosArea ? Number(zone.cosArea) : '—'
          );
          cropColumns.forEach((c) => {
            const v = zone.byId[c.cropId];
            row.push(v ? Number(v) : '—');
          });
        }
        aoa.push(row);
      });

      const bt = blockTotals.get(block.blockName) || {};
      aoa.push([
        '', block.blockName, `Total for ${block.blockName}`,
        Number((bt.clusterArea || 0).toFixed(2)),
        Number((bt.nucArea || 0).toFixed(2)),
        Number((bt.ffsArea || 0).toFixed(2)),
        Number((bt.cosArea || 0).toFixed(2)),
        ...cropColumns.map((c) => Number(((bt.totals?.[c.cropId]) || 0).toFixed(2)))
      ]);
    });

    aoa.push([
      '', '', 'GRAND TOTAL',
      Number(grandTotals.clusterArea.toFixed(2)),
      Number(grandTotals.nucArea.toFixed(2)),
      Number(grandTotals.ffsArea.toFixed(2)),
      Number(grandTotals.cosArea.toFixed(2)),
      ...cropColumns.map((c) => Number(((grandTotals.totals?.[c.cropId]) || 0).toFixed(2)))
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      ...cropColumns.map(() => ({ wch: 16 }))
    ];
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zone Form 3A');
    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const exportDisabled = filteredBlocks.length === 0 || loading;

  // Sticky cell helper
  const stickyCellSx = (leftPx, bg, extra = {}) => ({
    position: 'sticky',
    left: leftPx,
    boxSizing: 'border-box',
    backgroundColor: bg,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...extra
  });

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
                Form 3A — Zone-wise Seasonal Crop Report {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {talukName} Taluk • {districtName} District • AY {agriculturalYear} • Area in Cents
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
              { label: 'Blocks', value: blocksData.length, icon: <StoreIcon />, color: '#1565c0' },
              { label: 'Cluster Area', value: formatNumber(grandTotals.clusterArea), icon: <StoreIcon />, color: '#2e7d32' },
              { label: 'Nuc Area', value: formatNumber(grandTotals.nucArea), icon: <GrassIcon />, color: '#6a1b9a' },
              { label: 'FFS Area', value: formatNumber(grandTotals.ffsArea), icon: <EnergySavingsLeafIcon />, color: '#ef6c00' },
              { label: 'CoS Area', value: formatNumber(grandTotals.cosArea), icon: <CheckCircleIcon />, color: '#0277bd' }
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
                <InputLabel id="zone-crop-group-label">Crop Group</InputLabel>
                <Select
                  labelId="zone-crop-group-label"
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
                <InputLabel id="zone-season-label">Season</InputLabel>
                <Select
                  labelId="zone-season-label"
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
                <InputLabel id="zone-irrigation-label">Irrigation</InputLabel>
                <Select
                  labelId="zone-irrigation-label"
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
              placeholder="Search block/zone..."
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
              {/* <Chip
                label={`${filteredBlocks.length} block${filteredBlocks.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: alpha(themeColor, 0.08), color: themeColor, fontWeight: 600 }}
              /> */}
              <Tooltip
                title={
                  exportDisabled
                    ? 'No data available to export'
                    : `Download ${filteredBlocks.length} block${filteredBlocks.length > 1 ? 's' : ''} as Excel`
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
            <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
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
                  <col style={{ width: BLOCK_W }} />
                  <col style={{ width: ZONE_W }} />
                  <col style={{ width: AREA_W }} />
                  <col style={{ width: AREA_W }} />
                  <col style={{ width: AREA_W }} />
                  <col style={{ width: AREA_W }} />
                  {cropColumns.map((c) => (<col key={c.cropId} style={{ width: CROP_COL_W }} />))}
                  <col style={{ width: 'auto' }} />
                </colgroup>

                <TableHead>
                  <TableRow>
                    {[
                      { key: 'block', label: 'Block', align: 'center', left: 0, isSticky: true },
                      { key: 'zone', label: 'Zone', align: 'left', left: BLOCK_W, isSticky: true },
                      { key: 'cluster', label: 'Cluster Area', align: 'right' },
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
                          py: 1.5,
                          fontSize: '0.82rem',
                          letterSpacing: 0.3,
                          borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                          position: 'sticky',
                          top: 0,
                          zIndex: h.isSticky ? 6 : 3,
                          ...(h.isSticky && { left: h.left })
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
                          py: 1.5,
                          fontSize: '0.82rem',
                          letterSpacing: 0.3,
                          borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                          position: 'sticky',
                          top: 0,
                          zIndex: 3
                        }}
                      >
                        {crop.cropName}
                      </TableCell>
                    ))}
                    <TableCell
                      aria-hidden
                      sx={{
                        backgroundColor: themeColor,
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                        p: 0
                      }}
                    />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 8} align="center" sx={{ py: 10 }}>
                        <Stack alignItems="center" spacing={2}>
                          <CircularProgress size={44} thickness={4} sx={{ color: themeColor }} />
                          <Box textAlign="center">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: themeColor }}>
                              Loading Zone Form 3A Report...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Please wait while we fetch the latest progress details.
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : paginatedBlocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {searchTerm
                            ? `No blocks/zones found matching "${searchTerm}"`
                            : `No data available for ${cropGroupName}`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paginatedBlocks.map((block) => {
                        const trs = [];
                        const blockKey = block.blockName;

                        block.zones.forEach((zone, idx) => {
                          const isLastInGroup = idx === block.zones.length - 1;
                          const clickable = zone.zoneId != null && zone.hasData;

                          trs.push(
                            <TableRow
                              key={`${blockKey}-${zone.zoneId ?? zone.zoneName}`}
                              hover={clickable}
                              onClick={() => handleZoneClick(zone.blockId, zone.blockName, zone.zoneId, zone.zoneName, zone.hasData)}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                backgroundColor: !zone.hasData
                                  ? alpha('#ff9800', 0.03)
                                  : 'transparent',
                                '&:hover': clickable
                                  ? { backgroundColor: alpha(themeColor, 0.06), transition: '0.2s' }
                                  : undefined
                              }}
                            >
                              <TableCell
                                align="center"
                                sx={{
                                  ...stickyCellSx(0, stickyTintLight),
                                  verticalAlign: 'middle',
                                  fontWeight: 700,
                                  borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                  borderBottom: isLastInGroup ? undefined : 'none',
                                  zIndex: 2
                                }}
                              >
                                {idx === 0 && (
                                  <Stack alignItems="center" spacing={0.5}>
                                    <StoreIcon sx={{ fontSize: 26, color: themeColor, opacity: 0.8 }} />
                                    <Typography fontWeight={700} color={themeColor} variant="subtitle2">
                                      {block.blockName}
                                    </Typography>
                                    <Chip
                                      label={`${block.zones.length} Zones`}
                                      size="small"
                                      sx={{ fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.1), color: themeColor }}
                                    />
                                  </Stack>
                                )}
                              </TableCell>
                              <TableCell
                                align="left"
                                sx={{
                                  ...stickyCellSx(BLOCK_W, !zone.hasData ? '#fffaf2' : '#ffffff'),
                                  zIndex: 2,
                                  borderRight: `1px solid ${alpha(themeColor, 0.1)}`
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    label={zone.zoneName}
                                    size="small"
                                    sx={{
                                      bgcolor: zone.hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                      color: zone.hasData ? themeColor : '#e65100',
                                      fontWeight: 600,
                                      borderRadius: 1.5
                                    }}
                                  />
                                  {!zone.hasData && zone.zoneId != null && (
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
                                  {!zone.hasData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : zone[key] ? (
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(zone[key])}</Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">—</Typography>
                                  )}
                                </TableCell>
                              ))}
                              {cropColumns.map((crop) => {
                                const val = zone.byId?.[crop.cropId];
                                return (
                                  <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                                    {!zone.hasData ? (
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
                        });

                        const bInfo = blockTotals.get(block.blockName) || {};

                        trs.push(
                          <TableRow key={`${blockKey}-subtotal`} sx={{ bgcolor: stickyTintSubtotal }}>
                            <TableCell
                              colSpan={2}
                              sx={{
                                ...stickyCellSx(0, stickyTintSubtotal),
                                fontWeight: 700,
                                color: themeColor,
                                py: 1,
                                zIndex: 2
                              }}
                            >
                              <strong>📊 Total for {block.blockName}</strong>
                            </TableCell>
                            <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}>
                              {bInfo.clusterArea ? formatNumber(bInfo.clusterArea) : '—'}
                            </TableCell>
                            <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}>
                              {bInfo.nucArea ? formatNumber(bInfo.nucArea) : '—'}
                            </TableCell>
                            <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}>
                              {bInfo.ffsArea ? formatNumber(bInfo.ffsArea) : '—'}
                            </TableCell>
                            <TableCell align="right" sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}>
                              {bInfo.cosArea ? formatNumber(bInfo.cosArea) : '—'}
                            </TableCell>
                            {cropColumns.map((crop) => {
                              const val = bInfo.totals?.[crop.cropId];
                              return (
                                <TableCell
                                  key={crop.cropId}
                                  align="right"
                                  sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}
                                >
                                  {val ? formatNumber(val) : '—'}
                                </TableCell>
                              );
                            })}
                            <TableCell aria-hidden sx={{ bgcolor: stickyTintSubtotal, p: 0 }} />
                          </TableRow>
                        );

                        return trs;
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
                          colSpan={2}
                          sx={{
                            position: 'sticky', left: 0, zIndex: 2,
                            backgroundColor: '#eef1f7',
                            fontWeight: 800, color: themeColor, letterSpacing: 0.5
                          }}
                        >
                          🏆 GRAND TOTAL
                        </TableCell>
                        <TableCell align="right" sx={numericCellSx}>{formatNumber(grandTotals.clusterArea)}</TableCell>
                        <TableCell align="right" sx={numericCellSx}>{formatNumber(grandTotals.nucArea)}</TableCell>
                        <TableCell align="right" sx={numericCellSx}>{formatNumber(grandTotals.ffsArea)}</TableCell>
                        <TableCell align="right" sx={numericCellSx}>{formatNumber(grandTotals.cosArea)}</TableCell>
                        {cropColumns.map((crop) => (
                          <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                            {grandTotals.totals[crop.cropId] ? formatNumber(grandTotals.totals[crop.cropId]) : '—'}
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
              count={filteredBlocks.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Blocks per page"
              sx={{
                borderTop: `1px solid ${alpha(themeColor, 0.1)}`,
                '& .MuiTablePagination-toolbar': { minHeight: 48 }
              }}
            />
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ZoneForm3A;
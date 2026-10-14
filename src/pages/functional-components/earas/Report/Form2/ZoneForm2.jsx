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
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  Store,
  ArrowBack,
  WbSunny,
  Visibility,
  VisibilityOff,
  InfoOutlined,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Grass as GrassIcon,
  Water as WaterIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
import api from 'api/api';

// =====================================================================
// COLUMN WIDTHS — single source of truth.
// =====================================================================

// Land Utilization tab
const LU_BLOCK_W = 160;
const LU_ZONE_W = 200;

// Irrigation tab
const IRR_BLOCK_W = 140;
const IRR_ZONE_W = 170;
const IRR_COUNT_W = 70;
const IRR_AREA_W = 90;
const IRR_HEADER_ROW1_H = 44;

// ---- Solid (non-transparent) tint colors for sticky cells ----
const themeColor = '#05307a';
const themeColorAlt = '#0b4ea2';
const stickyTintLight = '#eef1f7';
const stickyTintSubtotal = '#e4e9f2';
const stickyTintGrand = '#d2dbe9';
const stickyHeaderSub = '#22528b';

// Gateway root
const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;

const SESSION_KEY = 'zoneForm2State';

// Internal column id → API field name
const LAND_FIELD_MAP = {
  buildingCourtyard: 'buildingArea',
  otherNonAgri: 'nonAgriculturalArea',
  barrenUncultivable: 'barrenArea',
  miscTreeCrops: 'miscellaneousTreesArea',
  permanentPastures: 'permanentPasturesArea',
  cultivableWaste: 'cultivableWasteArea',
  otherFallow: 'otherFallowArea',
  currentFallow: 'currentFallowArea',
  socialForestry: 'areaUnderSocialForestry',
  waterLogged: 'waterloggedArea',
  stillWater: 'stillWaterLand',
  marshyLand: 'marshyLand',
  netAreaSown: 'netAreasSown'
};

// Wet/Dry classification for irrigation sources
const IRRIGATION_SOURCE_CATEGORY = {
  1: 'wet',
  2: 'wet',
  3: 'wet',
  4: 'wet',
  5: 'dry',
  6: 'dry',
  7: 'dry',
  9: 'wet',
  10: 'wet',
  11: 'wet'
};

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Resolve the block a zone belongs to
function resolveBlockName(blockId, blockName, zoneName) {
  if (blockId && blockName) return blockName;
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  return 'Unassigned';
}

// Group rows by block
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

// Fallback zones for a taluk
function getFallbackZones(talukId) {
  return [
    { zoneId: 1, zoneNameEn: 'Zone 1', blockName: 'Block A' },
    { zoneId: 2, zoneNameEn: 'Zone 2', blockName: 'Block A' },
    { zoneId: 3, zoneNameEn: 'Zone 3', blockName: 'Block B' },
    { zoneId: 4, zoneNameEn: 'Zone 4', blockName: 'Block B' },
    { zoneId: 5, zoneNameEn: 'Zone 5', blockName: 'Block C' }
  ];
}

const ZoneForm2 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Merge saved sessionStorage state with location.state
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
  const selectedDistrict = stateData.districtName || stateData.selectedDistrict || officeInfo.districtName || 'District';
  const selectedTaluk = stateData.talukName || stateData.selectedTaluk || officeInfo.talukName || 'Taluk';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab || 0);
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // API data
  const [landZonesApi, setLandZonesApi] = useState([]);
  const [irrZonesApi, setIrrZonesApi] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterZonesLoading, setMasterZonesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch master zones list
  const fetchMasterZones = async (talukIdValue) => {
    setMasterZonesLoading(true);
    try {
      const response = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/zones?desTalukId=${talukIdValue}`);


      if (response.data && response.data.data && Array.isArray(response.data.data)) {

        setZonesList(response.data.data);
      } else {
        console.warn('No zones found, using fallback');
        setZonesList(getFallbackZones(talukIdValue));
      }
    } catch (err) {
      console.error('Error fetching master zones:', err);
      setZonesList(getFallbackZones(talukIdValue));
    } finally {
      setMasterZonesLoading(false);
    }
  };

  /* ── persist taluk context ── */
  useEffect(() => {
    if (talukId != null) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId,
          talukName: selectedTaluk,
          districtId: stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null,
          districtName: selectedDistrict,
          agriculturalYear,
          activeTab: stateData.activeTab || 0
        })
      );
    }
  }, [talukId, selectedTaluk, stateData.districtId, officeInfo, selectedDistrict, agriculturalYear, stateData.activeTab]);

  const [searchTerm, setSearchTerm] = useState('');

  // Role auto-redirection if FIELD_DATA_COLLECTOR visits ZoneForm2 directly
  useEffect(() => {
    let currentOfficeType = stateData.officeType || officeInfo.officeType;
    if (!currentOfficeType) {
      try {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';
        if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
          currentOfficeType = 'FIELD_DATA_COLLECTOR';
        }
      } catch (e) { }
    }

    if (currentOfficeType === 'FIELD_DATA_COLLECTOR') {
      const zoneId = officeInfo.zoneId || AuthService.getzone();
      navigate('/schemes/earas/cce/Form2', {
        replace: true,
        state: {
          officeType: 'FIELD_DATA_COLLECTOR',
          viewLevel: 'cluster',
          zoneId,
          zoneName: officeInfo.zoneName || '',
          talukId: officeInfo.talukOfficeId || officeInfo.talukId || talukId,
          talukName: officeInfo.talukName || selectedTaluk,
          districtId: officeInfo.districtOfficeId || officeInfo.districtId || stateData.districtId,
          districtName: officeInfo.districtName || selectedDistrict,
          agriculturalYear,
          activeTab
        }
      });
    }
  }, [stateData, officeInfo, talukId, selectedTaluk, selectedDistrict, agriculturalYear, activeTab, navigate]);

  // Fetch master zones on mount
  useEffect(() => {
    if (talukId != null) {
      fetchMasterZones(talukId);
    }
  }, [talukId]);

  /* ─────────────────────────── fetch ─────────────────────────── */

  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the taluk report page.');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        const landUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/zone-summary?agriYear=${agriculturalYear}&talukId=${talukId}`;
        const irrUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/zone?agriYear=${agriculturalYear}&talukId=${talukId}`;

        const [landRes, irrRes] = await Promise.all([axios.get(landUrl, { headers }), axios.get(irrUrl, { headers })]);


        setLandZonesApi(Array.isArray(landRes.data) ? landRes.data : []);
        setIrrZonesApi(Array.isArray(irrRes.data) ? irrRes.data : []);
      } catch (err) {
        console.error('Error fetching Zone Form 2 data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talukId, agriculturalYear]);

  /* ─────────────────── land utilization derived data ─────────────────── */

  const landRows = useMemo(() => {
    // Create a map for quick lookup of API data by zone name or ID
    const apiDataMap = {};
    landZonesApi.forEach((z) => {
      const name = z.zoneName || '';
      const id = z.zoneId;
      if (name) apiDataMap[name.toLowerCase().trim()] = z;
      if (id) apiDataMap[`id_${id}`] = z;
    });

    let mergedData = [];

    // If we have master zones list, merge with API data
    if (zonesList && zonesList.length > 0) {
      mergedData = zonesList.map((zone) => {
        const zoneId = zone.zoneId;
        const zoneName = zone.zoneNameEn || '';

        // Try to find API data by ID first, then by name
        let apiData = null;
        if (zoneId && apiDataMap[`id_${zoneId}`]) {
          apiData = apiDataMap[`id_${zoneId}`];
        } else if (zoneName && apiDataMap[zoneName.toLowerCase().trim()]) {
          apiData = apiDataMap[zoneName.toLowerCase().trim()];
        }

        const row = {
          block: apiData ? resolveBlockName(apiData.blockId, apiData.blockName, zoneName) : 'Unassigned',
          zone: zoneName || 'Unknown',
          zoneId: zoneId
        };

        // Populate land utilization fields
        Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
          row[colId] = apiData ? Number(apiData[apiKey]) || 0 : 0;
        });

        return row;
      });
    } else {
      // Fallback: use only API data
      mergedData = landZonesApi.map((z) => {
        const row = {
          block: resolveBlockName(z.blockId, z.blockName, z.zoneName),
          zone: z.zoneName || 'Unknown',
          zoneId: z.zoneId
        };
        Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
          row[colId] = Number(z[apiKey]) || 0;
        });
        return row;
      });
    }

    const targetZoneId = location.state?.zoneId || (location.state?.officeType === 'FIELD_DATA_COLLECTOR' ? AuthService.getzone() : null);
    if (targetZoneId) {
      mergedData = mergedData.filter((r) => String(r.zoneId) === String(targetZoneId));
    }

    // Sort by block then zone
    return mergedData.sort((a, b) => {
      if (a.block === 'Unassigned') return 1;
      if (b.block === 'Unassigned') return -1;
      if (a.block === b.block) return a.zone.localeCompare(b.zone);
      return a.block.localeCompare(b.block);
    });
  }, [landZonesApi, zonesList, location.state]);

  // Check if a zone has any land data
  const hasLandData = (row) => {
    let hasData = false;
    Object.keys(LAND_FIELD_MAP).forEach((colId) => {
      if (row[colId] > 0) hasData = true;
    });
    return hasData;
  };

  // Count zones with no land data
  const zonesWithNoLandData = useMemo(() => {
    return landRows.filter(row => !hasLandData(row) && row.zoneId !== null).length;
  }, [landRows]);

  const { landGrouped, landBlockTotals, landGrandTotals } = useMemo(() => {
    const grouped = buildOrderedGroups(landRows);
    const fields = Object.keys(LAND_FIELD_MAP);
    const blockTotals = {};
    const grand = {};
    fields.forEach((f) => (grand[f] = 0));
    Object.entries(grouped).forEach(([bn, rows]) => {
      const bt = { zoneCount: 0 };
      fields.forEach((f) => (bt[f] = 0));
      rows.forEach((r) => {
        fields.forEach((f) => (bt[f] += r[f]));
        bt.zoneCount += 1;
      });
      blockTotals[bn] = bt;
      fields.forEach((f) => (grand[f] += bt[f]));
    });
    return { landGrouped: grouped, landBlockTotals: blockTotals, landGrandTotals: grand };
  }, [landRows]);

  /* ─────────────────── irrigation derived data ─────────────────── */

  const irrigationSources = useMemo(() => {
    const map = new Map();
    irrZonesApi.forEach((z) =>
      (z.sources || []).forEach((s) => {
        if (!map.has(s.sourceId)) map.set(s.sourceId, { sourceId: s.sourceId, sourceName: s.sourceName });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.sourceId - b.sourceId);
  }, [irrZonesApi]);

  const irrRows = useMemo(() => {
    // Create a map for quick lookup of irrigation API data by zone name or ID
    const apiDataMap = {};
    irrZonesApi.forEach((z) => {
      const name = z.zoneName || '';
      const id = z.zoneId;
      if (name) apiDataMap[name.toLowerCase().trim()] = z;
      if (id) apiDataMap[`id_${id}`] = z;
    });

    let mergedData = [];

    if (zonesList && zonesList.length > 0) {
      mergedData = zonesList.map((zone) => {
        const zoneId = zone.zoneId;
        const zoneName = zone.zoneNameEn || '';

        let apiData = null;
        if (zoneId && apiDataMap[`id_${zoneId}`]) {
          apiData = apiDataMap[`id_${zoneId}`];
        } else if (zoneName && apiDataMap[zoneName.toLowerCase().trim()]) {
          apiData = apiDataMap[zoneName.toLowerCase().trim()];
        }

        const byId = {};
        if (apiData && apiData.sources) {
          apiData.sources.forEach((s) => {
            byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
          });
        }

        return {
          block: apiData ? resolveBlockName(apiData.blockId, apiData.blockName, zoneName) : 'Unassigned',
          zone: zoneName || 'Unknown',
          zoneId: zoneId,
          byId: byId
        };
      });
    } else {
      // Fallback: use only API data
      mergedData = irrZonesApi.map((z) => {
        const byId = {};
        (z.sources || []).forEach((s) => {
          byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
        });
        return {
          block: resolveBlockName(z.blockId, z.blockName, z.zoneName),
          zone: z.zoneName || 'Unknown',
          zoneId: z.zoneId,
          byId: byId
        };
      });
    }

    const targetZoneId = location.state?.zoneId || (location.state?.officeType === 'FIELD_DATA_COLLECTOR' ? AuthService.getzone() : null);
    if (targetZoneId) {
      mergedData = mergedData.filter((r) => String(r.zoneId) === String(targetZoneId));
    }

    // Sort by block then zone
    return mergedData.sort((a, b) => {
      if (a.block === 'Unassigned') return 1;
      if (b.block === 'Unassigned') return -1;
      if (a.block === b.block) return a.zone.localeCompare(b.zone);
      return a.block.localeCompare(b.block);
    });
  }, [irrZonesApi, zonesList, location.state]);

  // Check if a zone has any irrigation data
  const hasIrrData = (row) => {
    return Object.keys(row.byId).length > 0;
  };

  // Count zones with no irrigation data
  const zonesWithNoIrrData = useMemo(() => {
    return irrRows.filter(row => !hasIrrData(row) && row.zoneId !== null).length;
  }, [irrRows]);

  const { irrGrouped, irrBlockTotals, irrGrandTotals } = useMemo(() => {
    const grouped = buildOrderedGroups(irrRows);
    const blockTotals = {};
    const grand = {};
    irrigationSources.forEach((s) => (grand[s.sourceId] = { count: 0, area: 0 }));
    Object.entries(grouped).forEach(([bn, rows]) => {
      const bt = {};
      irrigationSources.forEach((s) => (bt[s.sourceId] = { count: 0, area: 0 }));
      rows.forEach((r) =>
        irrigationSources.forEach((s) => {
          const c = r.byId[s.sourceId];
          if (c) {
            bt[s.sourceId].count += c.count;
            bt[s.sourceId].area += c.area;
          }
        })
      );
      blockTotals[bn] = bt;
      irrigationSources.forEach((s) => {
        grand[s.sourceId].count += bt[s.sourceId].count;
        grand[s.sourceId].area += bt[s.sourceId].area;
      });
    });
    return { irrGrouped: grouped, irrBlockTotals: blockTotals, irrGrandTotals: grand };
  }, [irrRows, irrigationSources]);

  /* ─────────────────────────── column config ─────────────────────────── */

  const landUtilizationColumns = [
    { id: 'block', label: 'Block', align: 'center', minWidth: LU_BLOCK_W, category: 'always' },
    { id: 'zone', label: 'Zone', align: 'left', minWidth: LU_ZONE_W, category: 'always' },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', align: 'right', minWidth: 150, category: 'dry' },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', align: 'right', minWidth: 180, category: 'dry' },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', align: 'right', minWidth: 190, category: 'dry' },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', align: 'right', minWidth: 210, category: 'dry' },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', align: 'right', minWidth: 240, category: 'dry' },
    { id: 'cultivableWaste', label: 'Cultivable waste', align: 'right', minWidth: 130, category: 'dry' },
    { id: 'otherFallow', label: 'Other Fallow', align: 'right', minWidth: 110, category: 'dry' },
    { id: 'currentFallow', label: 'Current Fallow', align: 'right', minWidth: 120, category: 'dry' },
    { id: 'socialForestry', label: 'Area under Social Forestry', align: 'right', minWidth: 170, category: 'dry' },
    { id: 'waterLogged', label: 'Water logged area', align: 'right', minWidth: 140, category: 'wet' },
    { id: 'stillWater', label: 'Still water land (Water bodies)', align: 'right', minWidth: 190, category: 'wet' },
    { id: 'marshyLand', label: 'Marshy land', align: 'right', minWidth: 110, category: 'wet' },
    { id: 'netAreaSown', label: 'Net areas sown', align: 'right', minWidth: 130, category: 'always' }
  ];

  const landUtilizationDataColumns = landUtilizationColumns.slice(2);

  const isColumnActive = (col) => col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  const isSourceActive = (sourceId) => {
    const cat = IRRIGATION_SOURCE_CATEGORY[sourceId];
    if (!cat) return true;
    return landTypeFilter === 'all' || cat === landTypeFilter;
  };

  const LU_TABLE_W = landUtilizationColumns.reduce((sum, c) => sum + c.minWidth, 0);
  const IRR_TABLE_W = IRR_BLOCK_W + IRR_ZONE_W + (irrigationSources.length || 1) * (IRR_COUNT_W + IRR_AREA_W);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const formatNumber = (num) => Number(num || 0).toFixed(2);

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
      navigate('/schemes/earas/cce/TalukForm2', {
        state: {
          officeType: effectiveOfficeType,
          districtId: stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId,
          districtName: selectedDistrict,
          selectedDistrict,
          activeTab
        }
      });
    }
  };

  const handleZoneClick = (zoneName, zoneId, blockName) => {
    if (zoneId == null) return;
    navigate(`/schemes/earas/cce/Form2`, {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId: stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null,
        districtName: selectedDistrict,
        selectedDistrict,
        talukId,
        talukName: selectedTaluk,
        selectedTaluk,
        blockName,
        selectedBlock: blockName,
        zoneId,
        zoneName,
        selectedZone: zoneName,
        agriculturalYear,
        activeTab,
        landType: landTypeFilter
      }
    });
  };

  const filteredLandRows = useMemo(() => {
    if (!searchTerm.trim()) return landRows;
    const term = searchTerm.toLowerCase().trim();
    return landRows.filter((r) => r.zone.toLowerCase().includes(term) || r.block.toLowerCase().includes(term));
  }, [landRows, searchTerm]);

  const filteredIrrRows = useMemo(() => {
    if (!searchTerm.trim()) return irrRows;
    const term = searchTerm.toLowerCase().trim();
    return irrRows.filter((r) => r.zone.toLowerCase().includes(term) || r.block.toLowerCase().includes(term));
  }, [irrRows, searchTerm]);

  const filteredLandGrouped = useMemo(() => {
    return buildOrderedGroups(filteredLandRows);
  }, [filteredLandRows]);

  const filteredIrrGrouped = useMemo(() => {
    return buildOrderedGroups(filteredIrrRows);
  }, [filteredIrrRows]);

  const totalIrrigationArea = useMemo(() => {
    let sum = 0;
    Object.values(irrGrandTotals || {}).forEach((t) => {
      sum += Number(t.area) || 0;
    });
    return sum;
  }, [irrGrandTotals]);

  const handleExportExcel = () => {
    const isLand = activeTab === 0;
    const fileNameParts = [
      'Form2_ZoneReport',
      (selectedTaluk || 'Taluk').replace(/\s+/g, '_'),
      isLand ? 'LandUtilization' : 'Irrigation',
      agriculturalYear,
      new Date().toISOString().slice(0, 10)
    ];

    const headerMeta = [
      [`Form 2 — Zone-wise ${isLand ? 'Land Utilization' : 'Irrigation'} Report`],
      ['Taluk', `${selectedTaluk} (${selectedDistrict} District)`],
      ['Agricultural Year', agriculturalYear],
      ['Land Type Filter', landTypeFilter.toUpperCase()],
      ['Area Unit', 'Hectares'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    if (isLand) {
      const headerRow = ['#', 'Block', 'Zone', ...landUtilizationDataColumns.map((c) => c.label)];
      const dataRows = [];
      let rowNum = 1;

      Object.entries(filteredLandGrouped).forEach(([blockName, zones]) => {
        zones.forEach((r) => {
          dataRows.push([
            rowNum++,
            r.block,
            r.zone,
            ...landUtilizationDataColumns.map((c) => Number((r[c.id] || 0).toFixed(2)))
          ]);
        });
        const bt = landBlockTotals[blockName];
        if (bt) {
          dataRows.push([
            '',
            `Total for ${blockName}`,
            '',
            ...landUtilizationDataColumns.map((c) => Number((bt[c.id] || 0).toFixed(2)))
          ]);
        }
      });

      const totalRow = [
        '',
        'GRAND TOTAL',
        '',
        ...landUtilizationDataColumns.map((c) => Number((landGrandTotals[c.id] || 0).toFixed(2)))
      ];

      const worksheet = XLSX.utils.aoa_to_sheet([...headerMeta, headerRow, ...dataRows, totalRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Land Utilization');
      XLSX.writeFile(workbook, `${fileNameParts.join('_')}.xlsx`);
    } else {
      const headerRow1 = ['#', 'Block', 'Zone'];
      const headerRow2 = ['', '', ''];
      irrigationSources.forEach((s) => {
        headerRow1.push(s.sourceName, '');
        headerRow2.push('Count', 'Area (Ha)');
      });

      const dataRows = [];
      let rowNum = 1;
      Object.entries(filteredIrrGrouped).forEach(([blockName, zones]) => {
        zones.forEach((r) => {
          const row = [rowNum++, r.block, r.zone];
          irrigationSources.forEach((s) => {
            const cell = r.byId[s.sourceId] || { count: 0, area: 0 };
            row.push(cell.count, Number(cell.area.toFixed(2)));
          });
          dataRows.push(row);
        });

        const bt = irrBlockTotals[blockName];
        if (bt) {
          const subtotalRow = ['', `Total for ${blockName}`, ''];
          irrigationSources.forEach((s) => {
            const t = bt[s.sourceId] || { count: 0, area: 0 };
            subtotalRow.push(t.count, Number(t.area.toFixed(2)));
          });
          dataRows.push(subtotalRow);
        }
      });

      const totalRow = ['', 'GRAND TOTAL', ''];
      irrigationSources.forEach((s) => {
        const t = irrGrandTotals[s.sourceId] || { count: 0, area: 0 };
        totalRow.push(t.count, Number(t.area.toFixed(2)));
      });

      const worksheet = XLSX.utils.aoa_to_sheet([...headerMeta, headerRow1, headerRow2, ...dataRows, totalRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Irrigation');
      XLSX.writeFile(workbook, `${fileNameParts.join('_')}.xlsx`);
    }
  };

  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

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

  const tableSx = (widthPx) => ({
    width: widthPx,
    minWidth: widthPx,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  });

  /* ─────────────────────────── render ─────────────────────────── */

  if ((loading || masterZonesLoading) && landZonesApi.length === 0 && irrZonesApi.length === 0 && zonesList.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading zone report...
        </Typography>
      </Box>
    );
  }

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
                Form 2 — Zone-wise Land Utilization &amp; Irrigation Report - {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {selectedTaluk} Taluk ({selectedDistrict} District) • AY {agriculturalYear} • Area in Hectares
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={activeTab === 0 ? <GrassIcon sx={{ fontSize: 16, color: '#fff !important' }} /> : <WaterDrop sx={{ fontSize: 16, color: '#fff !important' }} />}
              label={activeTab === 0 ? 'Land Utilization' : 'Irrigation Details'}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
            />
            {landTypeFilter !== 'all' && (
              <Chip
                label={`${landTypeFilter.toUpperCase()} Land`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
            <Chip
              label={`AY: ${agriculturalYear}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}>
          {/* ── KPI Strip ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Zones', value: activeTab === 0 ? landRows.length : irrRows.length, icon: <LocationOn />, color: '#1565c0' },
              {
                label: activeTab === 0 ? 'Net Area Sown (Ha)' : 'Total Irrigated Area (Ha)',
                value: formatNumber(activeTab === 0 ? landGrandTotals.netAreaSown : totalIrrigationArea),
                icon: activeTab === 0 ? <Agriculture /> : <WaterDrop />,
                color: '#2e7d32'
              },
              {
                label: activeTab === 0 ? 'Categories' : 'Sources',
                value: activeTab === 0 ? Object.keys(LAND_FIELD_MAP).length : irrigationSources.length,
                icon: <GrassIcon />,
                color: '#6a1b9a'
              },
              {
                label: 'With Data',
                value: activeTab === 0 ? landRows.filter(hasLandData).length : irrRows.filter(hasIrrData).length,
                icon: <CheckCircleIcon />,
                color: '#0277bd'
              },
              {
                label: 'No Data',
                value: activeTab === 0 ? zonesWithNoLandData : zonesWithNoIrrData,
                icon: <VisibilityOffIcon />,
                color: '#ef6c00'
              }
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
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 16px ${alpha(k.color, 0.14)}`
                    }
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

          {/* ── Filters Paper ── */}
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
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
              flexWrap="wrap"
            >
              {/* Land Type Filter */}
              <Box sx={{ minWidth: 260 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  LAND TYPE
                </Typography>
                <Tabs
                  value={landTypeFilter}
                  onChange={(e, val) => setLandTypeFilter(val)}
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
                    '& .MuiTabs-indicator': {
                      backgroundColor: themeColor,
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab label="ALL" value="all" />
                  <Tab label="WET" value="wet" icon={<WaterDrop sx={{ fontSize: 18 }} />} iconPosition="start" />
                  <Tab label="DRY" value="dry" icon={<WbSunny sx={{ fontSize: 18 }} />} iconPosition="start" />
                </Tabs>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

              {/* Report Tab Selector */}
              <Box sx={{ minWidth: 300, flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  REPORT SECTION
                </Typography>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
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
                    '& .MuiTabs-indicator': {
                      backgroundColor: themeColor,
                      height: 3,
                      borderRadius: '3px 3px 0 0'
                    }
                  }}
                >
                  <Tab icon={<GrassIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Land Utilization" value={0} />
                  <Tab icon={<WaterDrop sx={{ fontSize: 18 }} />} iconPosition="start" label="Irrigation Details" value={1} />
                </Tabs>
              </Box>
            </Stack>

            {(zonesWithNoLandData > 0 || zonesWithNoIrrData > 0) && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${Math.max(zonesWithNoLandData, zonesWithNoIrrData)} zone${Math.max(zonesWithNoLandData, zonesWithNoIrrData) > 1 ? 's' : ''} have no data`}
                  size="small"
                  sx={{ bgcolor: alpha('#ff9800', 0.14), color: '#e65100', fontWeight: 600 }}
                />
              </Box>
            )}
          </Paper>

          {/* ── Error Banner ── */}
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
              <Typography color="error">Error: {error}</Typography>
            </Paper>
          )}

          {/* ── Search + Export Toolbar ── */}
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
              placeholder="Search block or zone..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${activeTab === 0 ? filteredLandRows.length : filteredIrrRows.length} zone${(activeTab === 0 ? filteredLandRows.length : filteredIrrRows.length) !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: alpha(themeColor, 0.08), color: themeColor, fontWeight: 600 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
                disabled={activeTab === 0 ? filteredLandRows.length === 0 : filteredIrrRows.length === 0}
                sx={{
                  borderColor: alpha(themeColor, 0.4),
                  color: themeColor,
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: themeColor,
                    bgcolor: alpha(themeColor, 0.06)
                  }
                }}
              >
                Export to Excel
              </Button>
            </Stack>
          </Paper>

          {/* ── Table Container ── */}
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
            {/* ==================== LAND UTILIZATION TAB ==================== */}
            {activeTab === 0 && (
              <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
                <Table stickyHeader sx={tableSx(LU_TABLE_W)}>
                  <colgroup>
                    {landUtilizationColumns.map((col) => (
                      <col key={col.id} style={{ width: col.minWidth }} />
                    ))}
                  </colgroup>

                  <TableHead>
                    <TableRow>
                      {landUtilizationColumns.map((col, index) => {
                        const isBlock = index === 0;
                        const isZone = index === 1;
                        const active = isColumnActive(col);
                        const baseSx = {
                          bgcolor: themeColor,
                          color: active ? 'white' : alpha('#ffffff', 0.5),
                          fontWeight: 700,
                          boxSizing: 'border-box',
                          py: 1.5,
                          borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                          '&:last-child': { borderRight: 'none' },
                          position: 'sticky',
                          top: 0,
                          zIndex: isBlock || isZone ? 4 : 3
                        };
                        return (
                          <TableCell
                            key={col.id}
                            align={col.align}
                            sx={isBlock ? { ...baseSx, left: 0 } : isZone ? { ...baseSx, left: LU_BLOCK_W } : baseSx}
                          >
                            {col.label}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(filteredLandGrouped).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={landUtilizationColumns.length} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {Object.entries(filteredLandGrouped).map(([blockName, zones]) => {
                      const rows = [];
                      const blockTotal = landBlockTotals[blockName];

                      zones.forEach((zone, idx) => {
                        const isLastInGroup = idx === zones.length - 1;
                        const hasData = hasLandData(zone);
                        const isClickable = zone.zoneId != null;

                        rows.push(
                          <TableRow
                            key={`${blockName}-${zone.zone}-${zone.zoneId}`}
                            hover={isClickable}
                            onClick={() => isClickable && handleZoneClick(zone.zone, zone.zoneId, blockName)}
                            sx={{
                              cursor: isClickable ? 'pointer' : 'default',
                              '&:hover': isClickable ? { bgcolor: alpha(themeColor, 0.08) } : undefined,
                              ...(!hasData && isClickable && {
                                bgcolor: alpha('#ff9800', 0.03),
                                '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                              })
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
                                  <Store sx={{ fontSize: 28, color: themeColor, opacity: 0.8 }} />
                                  <Typography fontWeight={700} color={themeColor} variant="subtitle1">
                                    {blockName}
                                  </Typography>
                                  <Chip
                                    label={`${zones.length} Zones`}
                                    size="small"
                                    sx={{ fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.1), color: themeColor }}
                                  />
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{
                                ...stickyCellSx(LU_BLOCK_W, '#ffffff'),
                                zIndex: 1,
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={zone.zone}
                                  size="small"
                                  sx={{
                                    bgcolor: hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                    color: hasData ? themeColor : '#e65100',
                                    fontWeight: 600,
                                    borderRadius: 1.5,
                                    '&:hover': isClickable ? { bgcolor: hasData ? alpha(themeColor, 0.2) : alpha('#ff9800', 0.2) } : undefined
                                  }}
                                />
                                {!hasData && isClickable && (
                                  <Chip
                                    label="No Data"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.6rem',
                                      bgcolor: alpha('#ff9800', 0.15),
                                      color: '#e65100',
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>
                            {landUtilizationDataColumns.map((col) => {
                              const active = isColumnActive(col);
                              return (
                                <TableCell
                                  key={col.id}
                                  align="right"
                                  sx={{
                                    fontWeight: col.id === 'netAreaSown' ? 600 : 400,
                                    color: active && hasData ? 'inherit' : 'text.disabled'
                                  }}
                                >
                                  {active && hasData ? formatNumber(zone[col.id]) : '—'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      });

                      rows.push(
                        <TableRow key={`${blockName}-subtotal`} sx={{ bgcolor: stickyTintSubtotal }}>
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
                            <strong>📊 Total for {blockName}</strong>
                          </TableCell>
                          {landUtilizationDataColumns.map((col) => {
                            const active = isColumnActive(col);
                            return (
                              <TableCell
                                key={col.id}
                                align="right"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: stickyTintSubtotal,
                                  color: active ? 'inherit' : 'text.disabled'
                                }}
                              >
                                {active && blockTotal ? formatNumber(blockTotal[col.id]) : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );

                      return rows;
                    })}

                    {/* Grand Total Row */}
                    {filteredLandRows.length > 0 && (
                      <TableRow sx={{ bgcolor: stickyTintGrand }}>
                        <TableCell
                          colSpan={2}
                          align="center"
                          sx={{
                            ...stickyCellSx(0, stickyTintGrand),
                            fontWeight: 800,
                            color: themeColor,
                            zIndex: 2,
                            borderRight: `1px solid ${alpha(themeColor, 0.2)}`
                          }}
                        >
                          GRAND TOTAL
                        </TableCell>
                        {landUtilizationDataColumns.map((col) => {
                          const active = isColumnActive(col);
                          return (
                            <TableCell
                              key={col.id}
                              align="right"
                              sx={{
                                fontWeight: 800,
                                color: active ? themeColor : 'text.disabled',
                                bgcolor: stickyTintGrand
                              }}
                            >
                              {active ? formatNumber(landGrandTotals[col.id]) : '—'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* ==================== IRRIGATION DETAILS TAB ==================== */}
            {activeTab === 1 && (
              <TableContainer sx={{ maxHeight: 550, overflow: 'auto' }}>
                <Table stickyHeader sx={{ ...tableSx(IRR_TABLE_W), width: '100%' }}>
                  <colgroup>
                    <col style={{ width: IRR_BLOCK_W }} />
                    <col style={{ width: IRR_ZONE_W }} />
                    {irrigationSources.map((s) => (
                      <React.Fragment key={s.sourceId}>
                        <col />
                        <col />
                      </React.Fragment>
                    ))}
                  </colgroup>

                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          ...stickyCellSx(0, themeColor, { color: 'white' }),
                          top: 0,
                          fontWeight: 700,
                          verticalAlign: 'middle',
                          zIndex: 4
                        }}
                      >
                        Block
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          ...stickyCellSx(IRR_BLOCK_W, themeColor, { color: 'white' }),
                          top: 0,
                          fontWeight: 700,
                          verticalAlign: 'middle',
                          zIndex: 4
                        }}
                      >
                        Zone
                      </TableCell>
                      {irrigationSources.map((source) => {
                        const active = isSourceActive(source.sourceId);
                        return (
                          <TableCell
                            key={source.sourceId}
                            colSpan={2}
                            align="center"
                            sx={{
                              bgcolor: themeColor,
                              color: active ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              height: IRR_HEADER_ROW1_H,
                              py: 0,
                              position: 'sticky',
                              top: 0,
                              zIndex: 3
                            }}
                          >
                            {source.sourceName}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      {irrigationSources.flatMap((source) => {
                        const active = isSourceActive(source.sourceId);
                        return ['Count', 'Area (Ha)'].map((label, i) => (
                          <TableCell
                            key={`${source.sourceId}-${i}`}
                            align="center"
                            sx={{
                              bgcolor: stickyHeaderSub,
                              color: active ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              position: 'sticky',
                              top: IRR_HEADER_ROW1_H,
                              zIndex: 3
                            }}
                          >
                            {label}
                          </TableCell>
                        ));
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(filteredIrrGrouped).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={(irrigationSources.length || 1) * 2 + 2} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {Object.entries(filteredIrrGrouped).map(([blockName, zones]) => {
                      const rows = [];

                      zones.forEach((zone, idx) => {
                        const isLastInGroup = idx === zones.length - 1;
                        const hasData = hasIrrData(zone);
                        const isClickable = zone.zoneId != null;

                        rows.push(
                          <TableRow
                            key={`${blockName}-${zone.zone}-${zone.zoneId}`}
                            hover={isClickable}
                            onClick={() => isClickable && handleZoneClick(zone.zone, zone.zoneId, blockName)}
                            sx={{
                              cursor: isClickable ? 'pointer' : 'default',
                              '&:hover': isClickable ? { bgcolor: alpha(themeColor, 0.08) } : undefined,
                              ...(!hasData && isClickable && {
                                bgcolor: alpha('#ff9800', 0.03),
                                '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                              })
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
                                  <Store sx={{ fontSize: 24, color: themeColor }} />
                                  <Typography fontWeight={700} color={themeColor}>
                                    {blockName}
                                  </Typography>
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                ...stickyCellSx(IRR_BLOCK_W, '#ffffff'),
                                zIndex: 1,
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={zone.zone}
                                  size="small"
                                  sx={{
                                    bgcolor: hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                    color: hasData ? themeColor : '#e65100',
                                    fontWeight: 500,
                                    '&:hover': isClickable ? { bgcolor: hasData ? alpha(themeColor, 0.2) : alpha('#ff9800', 0.2) } : undefined
                                  }}
                                />
                                {!hasData && isClickable && (
                                  <Chip
                                    label="No Data"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.6rem',
                                      bgcolor: alpha('#ff9800', 0.15),
                                      color: '#e65100',
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>
                            {irrigationSources.map((source) => {
                              const active = isSourceActive(source.sourceId);
                              const data = zone.byId[source.sourceId] || { count: 0, area: 0 };
                              return (
                                <React.Fragment key={source.sourceId}>
                                  <TableCell align="center" sx={{ color: active && hasData ? 'inherit' : 'text.disabled' }}>
                                    {active && hasData && data.count > 0 ? (
                                      <Chip
                                        label={data.count}
                                        size="small"
                                        sx={{ bgcolor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 600, minWidth: 40 }}
                                      />
                                    ) : (
                                      <Box component="span">-</Box>
                                    )}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 500, color: active && hasData ? 'inherit' : 'text.disabled' }}>
                                    {active && hasData && data.area > 0 ? formatNumber(data.area) : '-'}
                                  </TableCell>
                                </React.Fragment>
                              );
                            })}
                          </TableRow>
                        );
                      });

                      const blockTotal = irrBlockTotals[blockName];
                      rows.push(
                        <TableRow key={`${blockName}-subtotal-irr`} sx={{ bgcolor: stickyTintSubtotal }}>
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
                            <strong>📊 Total for {blockName}</strong>
                          </TableCell>
                          {irrigationSources.map((source) => {
                            const active = isSourceActive(source.sourceId);
                            const t = blockTotal ? blockTotal[source.sourceId] : { count: 0, area: 0 };
                            return (
                              <React.Fragment key={source.sourceId}>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: stickyTintSubtotal, color: active ? 'inherit' : 'text.disabled' }}>
                                  {active && t && t.count > 0 ? t.count : '-'}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: stickyTintSubtotal, color: active ? 'inherit' : 'text.disabled' }}>
                                  {active && t && t.area > 0 ? formatNumber(t.area) : '-'}
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                        </TableRow>
                      );

                      return rows;
                    })}

                    {/* Grand Total Row */}
                    {filteredIrrRows.length > 0 && (
                      <TableRow sx={{ bgcolor: stickyTintGrand }}>
                        <TableCell
                          colSpan={2}
                          align="center"
                          sx={{
                            ...stickyCellSx(0, stickyTintGrand),
                            fontWeight: 800,
                            color: themeColor,
                            zIndex: 2,
                            borderRight: `1px solid ${alpha(themeColor, 0.2)}`
                          }}
                        >
                          GRAND TOTAL
                        </TableCell>
                        {irrigationSources.map((source) => {
                          const active = isSourceActive(source.sourceId);
                          const t = irrGrandTotals[source.sourceId] || { count: 0, area: 0 };
                          return (
                            <React.Fragment key={source.sourceId}>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: stickyTintGrand,
                                  color: active ? themeColor : 'text.disabled'
                                }}
                              >
                                {active && t.count > 0 ? t.count : '—'}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: stickyTintGrand,
                                  color: active ? themeColor : 'text.disabled'
                                }}
                              >
                                {active && t.area > 0 ? formatNumber(t.area) : '—'}
                              </TableCell>
                            </React.Fragment>
                          );
                        })}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ZoneForm2;
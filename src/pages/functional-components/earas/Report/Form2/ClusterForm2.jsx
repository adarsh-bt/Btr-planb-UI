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
  TablePagination,
  Tooltip,
  Divider,
  Avatar,
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  LocationOn,
  Store as StoreIcon,
  ArrowBack,
  WaterDrop,
  WbSunny,
  Agriculture,
  Water as WaterIcon,
  Grass as GrassIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  InfoOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;
const SESSION_KEY = 'clusterForm2State';

// Column widths
const CLUSTER_NUM_W = 140;
const LAND_TYPE_W = 120;
const CLUSTER_AREA_W = 140;
const PANCHAYATH_W = 180;
const IRR_COUNT_W = 80;
const IRR_AREA_W = 100;
const IRR_HEADER_ROW1_H = 44;

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

const themeColor = '#05307a';
const themeColorAlt = '#0b4ea2';
const stickyTintLight = '#eef1f7';
const stickyTintGrand = '#d2dbe9';
const stickyHeaderSub = '#22528b';

// Field mapping for Land Utilization
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
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem('form2State') || '{}');
  } catch {
    return {};
  }
}

const ClusterForm2 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, [location.state]);

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
  const zoneId = stateData.zoneId || officeInfo.zoneId || AuthService.getzone() || null;
  const zoneName = stateData.zoneName || stateData.selectedZone || officeInfo.zoneName || 'Zone';
  const blockName = stateData.blockName || stateData.selectedBlock || '';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab || 0);
  const [landTypeFilter, setLandTypeFilter] = useState(stateData.landType || 'all');
  const [selectedPanchayath, setSelectedPanchayath] = useState(stateData.selectedPanchayath || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [landClusterApi, setLandClusterApi] = useState([]);
  const [irrClusterApi, setIrrClusterApi] = useState([]);
  const [masterClusters, setMasterClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

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

  // Save state to sessionStorage
  useEffect(() => {
    if (zoneId) {
      const stateToSave = {
        districtId,
        districtName,
        talukId,
        talukName,
        zoneId,
        zoneName,
        blockName,
        agriculturalYear,
        activeTab,
        landType: landTypeFilter,
        selectedPanchayath,
        officeType: stateData.officeType
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
      sessionStorage.setItem('form2State', JSON.stringify(stateToSave));
    }
  }, [districtId, districtName, talukId, talukName, zoneId, zoneName, blockName, agriculturalYear, activeTab, landTypeFilter, selectedPanchayath, stateData.officeType]);

  // Fetch cluster data
  useEffect(() => {
    if (!zoneId) {
      setError('Zone is required. Please navigate from the Zone report page.');
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Master cluster list (optional fallback / reference)
        let masterList = [];
        try {
          const clusterListUrl = `${BTR_BASE_URL}/btr-service/cluster-api/cluster-list?zoneId=${zoneId}&agriYear=${agriculturalYear}`;
          const clusterListRes = await axios.get(clusterListUrl, { headers });
          if (Array.isArray(clusterListRes.data)) {
            masterList = clusterListRes.data;
          }
        } catch (e) {
          console.warn('Could not fetch master cluster list:', e);
        }
        if (cancelled) return;
        setMasterClusters(masterList);

        // 2. Fetch Land Utilization cluster-wise
        let landResults = [];
        if (landTypeFilter === 'all') {
          const [dryRes, wetRes] = await Promise.allSettled([
            axios.get(`${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/cluster?agriYear=${agriculturalYear}&zoneId=${zoneId}&landType=dry`, { headers }),
            axios.get(`${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/cluster?agriYear=${agriculturalYear}&zoneId=${zoneId}&landType=wet`, { headers })
          ]);
          if (dryRes.status === 'fulfilled' && Array.isArray(dryRes.value.data)) {
            landResults.push(...dryRes.value.data.map(item => ({ ...item, landType: item.landType || 'dry' })));
          }
          if (wetRes.status === 'fulfilled' && Array.isArray(wetRes.value.data)) {
            landResults.push(...wetRes.value.data.map(item => ({ ...item, landType: item.landType || 'wet' })));
          }
        } else {
          const res = await axios.get(`${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/cluster?agriYear=${agriculturalYear}&zoneId=${zoneId}&landType=${landTypeFilter}`, { headers });
          if (Array.isArray(res.data)) {
            landResults = res.data.map(item => ({ ...item, landType: item.landType || landTypeFilter }));
          }
        }
        if (cancelled) return;
        setLandClusterApi(landResults);

        // 3. Fetch Irrigation cluster-wise
        let irrResults = [];
        if (landTypeFilter === 'all') {
          const [dryIrrRes, wetIrrRes] = await Promise.allSettled([
            axios.get(`${BASE_URL}/earas-form1-entry/api/progress-report/irrigation/cluster?agriYear=${agriculturalYear}&zoneId=${zoneId}&landType=dry`, { headers }),
            axios.get(`${BASE_URL}/earas-form1-entry/api/progress-report/irrigation/cluster?agriYear=${agriculturalYear}&zoneId=${zoneId}&landType=wet`, { headers })
          ]);
          if (dryIrrRes.status === 'fulfilled' && Array.isArray(dryIrrRes.value.data)) {
            irrResults.push(...dryIrrRes.value.data.map(item => ({ ...item, landType: item.landType || 'dry' })));
          }
          if (wetIrrRes.status === 'fulfilled' && Array.isArray(wetIrrRes.value.data)) {
            irrResults.push(...wetIrrRes.value.data.map(item => ({ ...item, landType: item.landType || 'wet' })));
          }
        } else {
          const res = await axios.get(`${BASE_URL}/earas-form1-entry/api/progress-report/irrigation/cluster?agriYear=${agriculturalYear}&zoneId=${zoneId}&landType=${landTypeFilter}`, { headers });
          if (Array.isArray(res.data)) {
            irrResults = res.data.map(item => ({ ...item, landType: item.landType || landTypeFilter }));
          }
        }
        if (cancelled) return;
        setIrrClusterApi(irrResults);
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching cluster Form 2 data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else setError(err.response?.data?.message || err.message || 'Failed to fetch cluster report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [zoneId, agriculturalYear, landTypeFilter]);

  // Quick lookup from master cluster list
  const masterClusterLookup = useMemo(() => {
    const map = new Map();
    (masterClusters || []).forEach((mc) => {
      if (mc.clusterId != null) map.set(String(mc.clusterId), mc);
      if (mc.clusterNumber != null) map.set(`no_${mc.clusterNumber}`, mc);
    });
    return map;
  }, [masterClusters]);

  // Derived Land Utilization Rows
  const landRows = useMemo(() => {
    const clusterMap = new Map();

    // Incorporate master cluster list if available
    if (Array.isArray(masterClusters) && masterClusters.length > 0) {
      masterClusters.forEach((mc) => {
        const mcLandType = (mc.landType || '').toLowerCase();
        if (landTypeFilter !== 'all' && mcLandType && mcLandType !== landTypeFilter.toLowerCase()) {
          return;
        }
        const key = mc.clusterId != null ? String(mc.clusterId) : `no_${mc.clusterNumber}`;
        const cleanLb = cleanName(mc.localbodyname);
        clusterMap.set(key, {
          clusterId: mc.clusterId ?? null,
          clusterNo: mc.clusterNumber != null ? String(mc.clusterNumber) : '',
          landType: mc.landType ? mc.landType.toUpperCase() : '—',
          clusterArea: 0,
          lbid: mc.lbid ?? null,
          localbodyname: cleanLb,
          lbcode: mc.lbcode ?? '',
          hasData: false
        });
      });
    }

    // Populate with API data
    (landClusterApi || []).forEach((c) => {
      const key = c.clusterId != null ? String(c.clusterId) : `no_${c.clusterNo}`;
      let entry = clusterMap.get(key);

      if (!entry) {
        const mcMatch = masterClusterLookup.get(key) || masterClusterLookup.get(String(c.clusterId)) || masterClusterLookup.get(`no_${c.clusterNo}`);
        const cleanLb = cleanName(c.localbodyname || mcMatch?.localbodyname);
        entry = {
          clusterId: c.clusterId ?? null,
          clusterNo: c.clusterNo != null ? String(c.clusterNo) : '',
          landType: c.landType ? String(c.landType).toUpperCase() : '—',
          clusterArea: Number(c.clusterArea) || 0,
          lbid: c.lbid ?? mcMatch?.lbid ?? null,
          localbodyname: cleanLb,
          lbcode: c.lbcode ?? mcMatch?.lbcode ?? '',
          hasData: false
        };
        clusterMap.set(key, entry);
      } else {
        if (!entry.localbodyname && (c.localbodyname || c.lbid != null)) {
          entry.localbodyname = cleanName(c.localbodyname);
          entry.lbid = c.lbid ?? entry.lbid;
          entry.lbcode = c.lbcode ?? entry.lbcode;
        }
      }

      if (c.clusterArea != null) {
        entry.clusterArea = Number(c.clusterArea) || 0;
      }
      if (c.landType && (!entry.landType || entry.landType === '—')) {
        entry.landType = String(c.landType).toUpperCase();
      }

      let hasAny = false;
      Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
        const val = Number(c[apiKey]) || 0;
        entry[colId] = val;
        if (val > 0) hasAny = true;
      });
      entry.hasData = hasAny;
    });

    // Ensure all 13 columns are defined
    const rows = Array.from(clusterMap.values()).map((row) => {
      Object.keys(LAND_FIELD_MAP).forEach((colId) => {
        if (row[colId] == null) row[colId] = 0;
      });
      return row;
    });

    // Sort by cluster number
    return rows.sort((a, b) => {
      const numA = parseInt(a.clusterNo, 10);
      const numB = parseInt(b.clusterNo, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.clusterNo).localeCompare(String(b.clusterNo));
    });
  }, [landClusterApi, masterClusters, masterClusterLookup, landTypeFilter]);

  // Derived Irrigation Sources
  const irrigationSources = useMemo(() => {
    const map = new Map();
    (irrClusterApi || []).forEach((c) => {
      (c.sources || []).forEach((s) => {
        if (!map.has(s.sourceId)) {
          map.set(s.sourceId, { sourceId: s.sourceId, sourceName: s.sourceName || `Source ${s.sourceId}` });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.sourceId - b.sourceId);
  }, [irrClusterApi]);

  // Derived Irrigation Rows
  const irrRows = useMemo(() => {
    const clusterMap = new Map();

    if (Array.isArray(masterClusters) && masterClusters.length > 0) {
      masterClusters.forEach((mc) => {
        const mcLandType = (mc.landType || '').toLowerCase();
        if (landTypeFilter !== 'all' && mcLandType && mcLandType !== landTypeFilter.toLowerCase()) {
          return;
        }
        const key = mc.clusterId != null ? String(mc.clusterId) : `no_${mc.clusterNumber}`;
        const cleanLb = cleanName(mc.localbodyname);
        clusterMap.set(key, {
          clusterId: mc.clusterId ?? null,
          clusterNo: mc.clusterNumber != null ? String(mc.clusterNumber) : '',
          landType: mc.landType ? mc.landType.toUpperCase() : '—',
          clusterArea: 0,
          lbid: mc.lbid ?? null,
          localbodyname: cleanLb,
          lbcode: mc.lbcode ?? '',
          byId: {},
          hasData: false
        });
      });
    }

    (irrClusterApi || []).forEach((c) => {
      const key = c.clusterId != null ? String(c.clusterId) : `no_${c.clusterNo}`;
      let entry = clusterMap.get(key);

      if (!entry) {
        const mcMatch = masterClusterLookup.get(key) || masterClusterLookup.get(String(c.clusterId)) || masterClusterLookup.get(`no_${c.clusterNo}`);
        const cleanLb = cleanName(c.localbodyname || mcMatch?.localbodyname);
        entry = {
          clusterId: c.clusterId ?? null,
          clusterNo: c.clusterNo != null ? String(c.clusterNo) : '',
          landType: c.landType ? String(c.landType).toUpperCase() : '—',
          clusterArea: Number(c.clusterArea) || 0,
          lbid: c.lbid ?? mcMatch?.lbid ?? null,
          localbodyname: cleanLb,
          lbcode: c.lbcode ?? mcMatch?.lbcode ?? '',
          byId: {},
          hasData: false
        };
        clusterMap.set(key, entry);
      } else {
        if (!entry.localbodyname && (c.localbodyname || c.lbid != null)) {
          entry.localbodyname = cleanName(c.localbodyname);
          entry.lbid = c.lbid ?? entry.lbid;
          entry.lbcode = c.lbcode ?? entry.lbcode;
        }
      }

      if (c.clusterArea != null) {
        entry.clusterArea = Number(c.clusterArea) || 0;
      }
      if (c.landType && (!entry.landType || entry.landType === '—')) {
        entry.landType = String(c.landType).toUpperCase();
      }

      let hasAny = false;
      const byId = { ...(entry.byId || {}) };
      (c.sources || []).forEach((s) => {
        const count = Number(s.sourceCount ?? s.count) || 0;
        const area = Number(s.irrigationArea ?? s.area) || 0;
        byId[s.sourceId] = { count, area };
        if (count > 0 || area > 0) hasAny = true;
      });
      entry.byId = byId;
      entry.hasData = hasAny;
    });

    const rows = Array.from(clusterMap.values());
    return rows.sort((a, b) => {
      const numA = parseInt(a.clusterNo, 10);
      const numB = parseInt(b.clusterNo, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.clusterNo).localeCompare(String(b.clusterNo));
    });
  }, [irrClusterApi, masterClusters, masterClusterLookup, landTypeFilter]);

  // Land utilization column definitions
  const landUtilizationColumns = [
    { id: 'clusterNo', label: 'Cluster No.', align: 'center', minWidth: CLUSTER_NUM_W, category: 'always' },
    { id: 'landType', label: 'Land Type', align: 'center', minWidth: LAND_TYPE_W, category: 'always' },
    { id: 'clusterArea', label: 'Cluster Area (Ha)', align: 'right', minWidth: CLUSTER_AREA_W, category: 'always' },
    { id: 'panchayath', label: 'Panchayath', align: 'left', minWidth: PANCHAYATH_W, category: 'always' },
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

  const landUtilizationDataColumns = landUtilizationColumns.slice(4);

  const isColumnActive = (col) => col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;
  const isSourceActive = (sourceId) => {
    const cat = IRRIGATION_SOURCE_CATEGORY[sourceId];
    if (!cat) return true;
    return landTypeFilter === 'all' || cat === landTypeFilter;
  };

  const LU_TABLE_W = CLUSTER_NUM_W + LAND_TYPE_W + CLUSTER_AREA_W + PANCHAYATH_W + landUtilizationDataColumns.reduce((sum, c) => sum + c.minWidth, 0);
  const IRR_TABLE_W = CLUSTER_NUM_W + LAND_TYPE_W + CLUSTER_AREA_W + PANCHAYATH_W + Math.max(irrigationSources.length, 1) * (IRR_COUNT_W + IRR_AREA_W);

  // Panchayath dropdown options derived from both landRows and irrRows
  const panchayathOptions = useMemo(() => {
    const combined = [...landRows, ...irrRows];
    const map = new Map();
    combined.forEach((row) => {
      const rawName = cleanName(row.localbodyname);
      if (!rawName) return;
      const key = row.lbid != null ? String(row.lbid) : rawName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          lbid: row.lbid ?? null,
          lbcode: row.lbcode ?? '',
          name: rawName
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [landRows, irrRows]);

  const selectedPanchayathName = useMemo(() => {
    if (selectedPanchayath === 'ALL') return '';
    const match = panchayathOptions.find((opt) => opt.key === String(selectedPanchayath));
    return match ? match.name : String(selectedPanchayath);
  }, [selectedPanchayath, panchayathOptions]);

  // Filtered rows for Search and Panchayath
  const filteredLandRows = useMemo(() => {
    let rows = landRows;
    if (selectedPanchayath !== 'ALL') {
      rows = rows.filter((r) => {
        const key = r.lbid != null ? String(r.lbid) : cleanName(r.localbodyname).toLowerCase();
        return key === String(selectedPanchayath);
      });
    }
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase().trim();
    return rows.filter(
      (r) =>
        String(r.clusterNo).toLowerCase().includes(term) ||
        String(r.landType).toLowerCase().includes(term) ||
        cleanName(r.localbodyname).toLowerCase().includes(term)
    );
  }, [landRows, selectedPanchayath, searchTerm]);

  const filteredIrrRows = useMemo(() => {
    let rows = irrRows;
    if (selectedPanchayath !== 'ALL') {
      rows = rows.filter((r) => {
        const key = r.lbid != null ? String(r.lbid) : cleanName(r.localbodyname).toLowerCase();
        return key === String(selectedPanchayath);
      });
    }
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase().trim();
    return rows.filter(
      (r) =>
        String(r.clusterNo).toLowerCase().includes(term) ||
        String(r.landType).toLowerCase().includes(term) ||
        cleanName(r.localbodyname).toLowerCase().includes(term)
    );
  }, [irrRows, selectedPanchayath, searchTerm]);

  // Grand Totals based on filtered rows
  const landGrandTotals = useMemo(() => {
    const totals = { clusterArea: 0 };
    Object.keys(LAND_FIELD_MAP).forEach((f) => (totals[f] = 0));
    filteredLandRows.forEach((r) => {
      totals.clusterArea += Number(r.clusterArea) || 0;
      Object.keys(LAND_FIELD_MAP).forEach((f) => {
        totals[f] += Number(r[f]) || 0;
      });
    });
    return totals;
  }, [filteredLandRows]);

  const irrGrandTotals = useMemo(() => {
    const grand = { clusterArea: 0, totalArea: 0 };
    irrigationSources.forEach((s) => {
      grand[s.sourceId] = { count: 0, area: 0 };
    });
    filteredIrrRows.forEach((r) => {
      grand.clusterArea += Number(r.clusterArea) || 0;
      irrigationSources.forEach((s) => {
        const cell = r.byId[s.sourceId];
        if (cell) {
          grand[s.sourceId].count += cell.count;
          grand[s.sourceId].area += cell.area;
          grand.totalArea += cell.area;
        }
      });
    });
    return grand;
  }, [filteredIrrRows, irrigationSources]);

  // KPIs based on filtered rows
  const clustersCount = activeTab === 0 ? filteredLandRows.length : filteredIrrRows.length;
  const clustersWithData = activeTab === 0 ? filteredLandRows.filter((r) => r.hasData).length : filteredIrrRows.filter((r) => r.hasData).length;
  const clustersWithNoData = clustersCount - clustersWithData;
  const totalClusterArea = activeTab === 0 ? landGrandTotals.clusterArea : irrGrandTotals.clusterArea;
  const primaryMetric = activeTab === 0 ? landGrandTotals.netAreaSown : irrGrandTotals.totalArea;

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  const handleBack = () => {
    let effectiveOfficeType = stateData.officeType || officeInfo.officeType;
    if (!effectiveOfficeType) {
      try {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';
        if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
          effectiveOfficeType = 'FIELD_DATA_COLLECTOR';
        }
      } catch (e) {}
    }

    if (effectiveOfficeType === 'FIELD_DATA_COLLECTOR' || stateData.isDirectAccess) {
      navigate('/Report');
    } else {
      navigate('/schemes/earas/cce/ZoneForm2', {
        state: {
          officeType: effectiveOfficeType,
          districtId,
          districtName,
          selectedDistrict: districtName,
          talukId,
          talukName,
          selectedTaluk: talukName,
          zoneId,
          zoneName,
          selectedZone: zoneName,
          agriculturalYear,
          activeTab
        }
      });
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    const isLand = activeTab === 0;
    const currentRows = isLand ? filteredLandRows : filteredIrrRows;
    if (!currentRows || currentRows.length === 0) return;

    const fileNameParts = [
      'Form2_ClusterReport',
      (zoneName || 'Zone').replace(/\s+/g, '_'),
      ...(selectedPanchayath !== 'ALL' && selectedPanchayathName ? [selectedPanchayathName.replace(/\s+/g, '_')] : []),
      isLand ? 'LandUtilization' : 'Irrigation',
      agriculturalYear,
      new Date().toISOString().slice(0, 10)
    ];

    const headerMeta = [
      [`Form 2 — Cluster-wise ${isLand ? 'Land Utilization' : 'Irrigation'} Report`],
      ['District', districtName],
      ['Taluk', talukName],
      ['Block', blockName || '—'],
      ['Zone', zoneName],
      ['Panchayath Filter', selectedPanchayath === 'ALL' ? 'All Panchayaths' : selectedPanchayathName],
      ['Agricultural Year', agriculturalYear],
      ['Land Type Filter', landTypeFilter.toUpperCase()],
      ['Area Unit', 'Hectares'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    if (isLand) {
      const headerRow = [
        '#',
        'Cluster No.',
        'Land Type',
        'Cluster Area (Ha)',
        'Panchayath',
        ...landUtilizationDataColumns.map((c) => c.label)
      ];

      let serial = 0;
      const dataRows = currentRows.map((r) => {
        serial += 1;
        return [
          serial,
          `Cluster ${r.clusterNo}`,
          r.landType,
          r.clusterArea ? Number(r.clusterArea.toFixed(2)) : 0,
          r.localbodyname || '—',
          ...landUtilizationDataColumns.map((c) => Number((r[c.id] || 0).toFixed(2)))
        ];
      });

      const totalRow = [
        '',
        'GRAND TOTAL',
        '',
        Number(landGrandTotals.clusterArea.toFixed(2)),
        '',
        ...landUtilizationDataColumns.map((c) => Number((landGrandTotals[c.id] || 0).toFixed(2)))
      ];

      const aoa = [...headerMeta, headerRow, ...dataRows, totalRow];
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Land Utilization');
      XLSX.writeFile(workbook, `${fileNameParts.join('_')}.xlsx`);
    } else {
      const headerRow1 = [
        '#',
        'Cluster No.',
        'Land Type',
        'Cluster Area (Ha)',
        'Panchayath'
      ];
      const headerRow2 = ['', '', '', '', ''];

      irrigationSources.forEach((s) => {
        headerRow1.push(s.sourceName, '');
        headerRow2.push('Count', 'Area (Ha)');
      });

      let serial = 0;
      const dataRows = currentRows.map((r) => {
        serial += 1;
        const rowData = [
          serial,
          `Cluster ${r.clusterNo}`,
          r.landType,
          r.clusterArea ? Number(r.clusterArea.toFixed(2)) : 0,
          r.localbodyname || '—'
        ];
        irrigationSources.forEach((s) => {
          const cell = r.byId[s.sourceId] || { count: 0, area: 0 };
          rowData.push(cell.count, Number(cell.area.toFixed(2)));
        });
        return rowData;
      });

      const totalRow = [
        '',
        'GRAND TOTAL',
        '',
        Number(irrGrandTotals.clusterArea.toFixed(2)),
        ''
      ];
      irrigationSources.forEach((s) => {
        const cell = irrGrandTotals[s.sourceId] || { count: 0, area: 0 };
        totalRow.push(cell.count, Number(cell.area.toFixed(2)));
      });

      const aoa = [...headerMeta, headerRow1, headerRow2, ...dataRows, totalRow];
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Irrigation');
      XLSX.writeFile(workbook, `${fileNameParts.join('_')}.xlsx`);
    }
  };

  const paginatedRows = useMemo(() => {
    const list = activeTab === 0 ? filteredLandRows : filteredIrrRows;
    return list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [activeTab, filteredLandRows, filteredIrrRows, page, rowsPerPage]);

  const exportDisabled = (activeTab === 0 ? filteredLandRows.length === 0 : filteredIrrRows.length === 0) || loading;

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
              <StoreIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.2 }}>
                Form 2 — Cluster-wise Land Utilization &amp; Irrigation Report - {agriculturalYear}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {zoneName} Zone • {talukName} Taluk ({districtName} District) • AY {agriculturalYear} • Area in Hectares
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
            {selectedPanchayath !== 'ALL' && selectedPanchayathName && (
              <Chip
                label={`Panchayath: ${selectedPanchayathName}`}
                size="small"
                onDelete={() => {
                  setSelectedPanchayath('ALL');
                  setPage(0);
                }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.22)',
                  color: '#fff',
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }
                }}
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
              { label: 'Clusters', value: clustersCount, icon: <StoreIcon />, color: '#1565c0' },
              { label: 'Cluster Area (Ha)', value: formatNumber(totalClusterArea), icon: <LocationOn />, color: '#2e7d32' },
              {
                label: activeTab === 0 ? 'Net Area Sown (Ha)' : 'Total Irrigated Area (Ha)',
                value: formatNumber(primaryMetric),
                icon: activeTab === 0 ? <Agriculture /> : <WaterDrop />,
                color: '#6a1b9a'
              },
              { label: 'With Data', value: clustersWithData, icon: <CheckCircleIcon />, color: '#0277bd' },
              { label: 'No Data', value: clustersWithNoData, icon: <VisibilityOffIcon />, color: '#ef6c00' }
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
                  onChange={(e, val) => {
                    setLandTypeFilter(val);
                    setPage(0);
                  }}
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

              {/* Panchayath Filter */}
              <Box sx={{ minWidth: { xs: '100%', sm: 220, md: 240 } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  PANCHAYATH
                </Typography>
                <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                  <Select
                    value={selectedPanchayath}
                    onChange={(e) => {
                      setSelectedPanchayath(e.target.value);
                      setPage(0);
                    }}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      height: 40,
                      fontWeight: 600,
                      border: `1px solid ${alpha(themeColor, 0.2)}`,
                      bgcolor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                    }}
                  >
                    <MenuItem value="ALL">
                      <em>All Panchayaths ({panchayathOptions.length})</em>
                    </MenuItem>
                    {panchayathOptions.map((opt) => (
                      <MenuItem key={opt.key} value={opt.key}>
                        {opt.name} {opt.lbcode ? `(${opt.lbcode})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

              {/* Report Tab Selector */}
              <Box sx={{ minWidth: 300, flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  REPORT SECTION
                </Typography>
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => {
                    setActiveTab(val);
                    setPage(0);
                  }}
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

            {clustersWithNoData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${clustersWithNoData} cluster${clustersWithNoData > 1 ? 's' : ''} have no data`}
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
              placeholder="Search cluster..."
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
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${activeTab === 0 ? filteredLandRows.length : filteredIrrRows.length} cluster${(activeTab === 0 ? filteredLandRows.length : filteredIrrRows.length) !== 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: alpha(themeColor, 0.08), color: themeColor, fontWeight: 600 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExportExcel}
                disabled={exportDisabled}
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

          {/* ── Tables ── */}
          {loading && paginatedRows.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <CircularProgress size={36} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading cluster report...
              </Typography>
            </Box>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
              {/* TAB 0: LAND UTILIZATION */}
              {activeTab === 0 && (
                <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <Table stickyHeader sx={tableSx(LU_TABLE_W)}>
                    <TableHead>
                      <TableRow>
                        {landUtilizationColumns.map((col, index) => {
                          const isCluster = index === 0;
                          const isType = index === 1;
                          const isArea = index === 2;
                          const active = isColumnActive(col);

                          let left = null;
                          let zIndex = 3;
                          if (isCluster) {
                            left = 0;
                            zIndex = 4;
                          } else if (isType) {
                            left = CLUSTER_NUM_W;
                            zIndex = 4;
                          } else if (isArea) {
                            left = CLUSTER_NUM_W + LAND_TYPE_W;
                            zIndex = 4;
                          }

                          const cellStyle = {
                            bgcolor: themeColor,
                            color: active ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 700,
                            boxSizing: 'border-box',
                            py: 1.5,
                            borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                            '&:last-child': { borderRight: 'none' },
                            position: 'sticky',
                            top: 0,
                            zIndex,
                            ...(left != null ? { left } : {})
                          };

                          return (
                            <TableCell key={col.id} align={col.align} sx={cellStyle}>
                              {col.label}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredLandRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={landUtilizationColumns.length} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">
                              {searchTerm
                                ? `No clusters found matching "${searchTerm}"`
                                : selectedPanchayath !== 'ALL'
                                  ? `No clusters found for Panchayath "${selectedPanchayathName}"`
                                  : 'No cluster data available'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row) => (
                          <TableRow
                            key={`${row.clusterId}-${row.clusterNo}-${row.landType}`}
                            hover
                            sx={{
                              ...(!row.hasData && {
                                bgcolor: alpha('#ff9800', 0.03),
                                '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                              })
                            }}
                          >
                            <TableCell
                              align="center"
                              sx={{
                                ...stickyCellSx(0, stickyTintLight),
                                fontWeight: 700,
                                borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                zIndex: 2
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                <Typography variant="body2" sx={{ fontWeight: 700, color: themeColor }}>
                                  Cluster {row.clusterNo}
                                </Typography>
                                {!row.hasData && (
                                  <Chip
                                    label="No Data"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.62rem',
                                      bgcolor: alpha('#ff9800', 0.15),
                                      color: '#e65100',
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                ...stickyCellSx(CLUSTER_NUM_W, '#ffffff'),
                                fontWeight: 600,
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                                zIndex: 1
                              }}
                            >
                              <Chip
                                label={row.landType}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  bgcolor: row.landType === 'WET' ? alpha('#0288d1', 0.12) : alpha('#ed6c02', 0.12),
                                  color: row.landType === 'WET' ? '#0288d1' : '#ed6c02'
                                }}
                              />
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                ...stickyCellSx(CLUSTER_NUM_W + LAND_TYPE_W, '#ffffff'),
                                ...numericCellSx,
                                fontWeight: 700,
                                color: '#1565c0',
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                                zIndex: 1
                              }}
                            >
                              {row.clusterArea ? formatNumber(row.clusterArea) : '—'}
                            </TableCell>

                            <TableCell
                              align="left"
                              sx={{
                                whiteSpace: 'nowrap',
                                fontWeight: 500,
                                color: row.localbodyname ? 'text.primary' : 'text.secondary'
                              }}
                            >
                              {row.localbodyname || '—'}
                            </TableCell>

                            {landUtilizationDataColumns.map((col) => {
                              const active = isColumnActive(col);
                              const val = row[col.id];
                              return (
                                <TableCell
                                  key={col.id}
                                  align="right"
                                  sx={{
                                    ...numericCellSx,
                                    color: active ? 'text.primary' : alpha('#000', 0.28),
                                    bgcolor: active ? 'inherit' : alpha('#000', 0.02)
                                  }}
                                >
                                  {val > 0 ? formatNumber(val) : '—'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))
                      )}

                      {/* Grand Totals */}
                      {filteredLandRows.length > 0 && (
                        <TableRow sx={{ bgcolor: stickyTintGrand }}>
                          <TableCell
                            align="center"
                            sx={{
                              ...stickyCellSx(0, stickyTintGrand),
                              fontWeight: 800,
                              color: themeColor,
                              borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                              zIndex: 2
                            }}
                          >
                            TOTAL
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              ...stickyCellSx(CLUSTER_NUM_W, stickyTintGrand),
                              fontWeight: 800,
                              color: themeColor,
                              borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                              zIndex: 1
                            }}
                          >
                            —
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              ...stickyCellSx(CLUSTER_NUM_W + LAND_TYPE_W, stickyTintGrand),
                              ...numericCellSx,
                              fontWeight: 800,
                              color: themeColor,
                              borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                              zIndex: 1
                            }}
                          >
                            {formatNumber(landGrandTotals.clusterArea)}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 800,
                              color: themeColor
                            }}
                          >
                            —
                          </TableCell>
                          {landUtilizationDataColumns.map((col) => (
                            <TableCell
                              key={`total-${col.id}`}
                              align="right"
                              sx={{
                                ...numericCellSx,
                                fontWeight: 800,
                                color: themeColor
                              }}
                            >
                              {formatNumber(landGrandTotals[col.id])}
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* TAB 1: IRRIGATION */}
              {activeTab === 1 && (
                <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <Table stickyHeader sx={tableSx(IRR_TABLE_W)}>
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
                            zIndex: 4,
                            minWidth: CLUSTER_NUM_W,
                            borderRight: `1px solid ${alpha('#fff', 0.15)}`
                          }}
                        >
                          Cluster No.
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{
                            ...stickyCellSx(CLUSTER_NUM_W, themeColor, { color: 'white' }),
                            top: 0,
                            fontWeight: 700,
                            verticalAlign: 'middle',
                            zIndex: 4,
                            minWidth: LAND_TYPE_W,
                            borderRight: `1px solid ${alpha('#fff', 0.15)}`
                          }}
                        >
                          Land Type
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="right"
                          sx={{
                            ...stickyCellSx(CLUSTER_NUM_W + LAND_TYPE_W, themeColor, { color: 'white' }),
                            top: 0,
                            fontWeight: 700,
                            verticalAlign: 'middle',
                            zIndex: 4,
                            minWidth: CLUSTER_AREA_W,
                            borderRight: `1px solid ${alpha('#fff', 0.15)}`
                          }}
                        >
                          Cluster Area (Ha)
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          align="left"
                          sx={{
                            bgcolor: themeColor,
                            color: 'white',
                            top: 0,
                            fontWeight: 700,
                            verticalAlign: 'middle',
                            zIndex: 3,
                            minWidth: PANCHAYATH_W,
                            borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                            position: 'sticky'
                          }}
                        >
                          Panchayath
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
                                zIndex: 3,
                                borderRight: `1px solid ${alpha('#fff', 0.15)}`
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
                                zIndex: 3,
                                borderRight: i === 1 ? `1px solid ${alpha('#fff', 0.15)}` : 'none'
                              }}
                            >
                              {label}
                            </TableCell>
                          ));
                        })}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredIrrRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={Math.max(irrigationSources.length, 1) * 2 + 4} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">
                              {searchTerm
                                ? `No clusters found matching "${searchTerm}"`
                                : selectedPanchayath !== 'ALL'
                                  ? `No clusters found for Panchayath "${selectedPanchayathName}"`
                                  : 'No cluster irrigation data available'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row) => (
                          <TableRow
                            key={`${row.clusterId}-${row.clusterNo}-${row.landType}`}
                            hover
                            sx={{
                              ...(!row.hasData && {
                                bgcolor: alpha('#ff9800', 0.03),
                                '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                              })
                            }}
                          >
                            <TableCell
                              align="center"
                              sx={{
                                ...stickyCellSx(0, stickyTintLight),
                                fontWeight: 700,
                                borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                zIndex: 2
                              }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                <Typography variant="body2" sx={{ fontWeight: 700, color: themeColor }}>
                                  Cluster {row.clusterNo}
                                </Typography>
                                {!row.hasData && (
                                  <Chip
                                    label="No Data"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.62rem',
                                      bgcolor: alpha('#ff9800', 0.15),
                                      color: '#e65100',
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell
                              align="center"
                              sx={{
                                ...stickyCellSx(CLUSTER_NUM_W, '#ffffff'),
                                fontWeight: 600,
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                                zIndex: 1
                              }}
                            >
                              <Chip
                                label={row.landType}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  bgcolor: row.landType === 'WET' ? alpha('#0288d1', 0.12) : alpha('#ed6c02', 0.12),
                                  color: row.landType === 'WET' ? '#0288d1' : '#ed6c02'
                                }}
                              />
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                ...stickyCellSx(CLUSTER_NUM_W + LAND_TYPE_W, '#ffffff'),
                                ...numericCellSx,
                                fontWeight: 700,
                                color: '#1565c0',
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                                zIndex: 1
                              }}
                            >
                              {row.clusterArea ? formatNumber(row.clusterArea) : '—'}
                            </TableCell>

                            <TableCell
                              align="left"
                              sx={{
                                whiteSpace: 'nowrap',
                                fontWeight: 500,
                                color: row.localbodyname ? 'text.primary' : 'text.secondary'
                              }}
                            >
                              {row.localbodyname || '—'}
                            </TableCell>

                            {irrigationSources.flatMap((source) => {
                              const active = isSourceActive(source.sourceId);
                              const cell = row.byId[source.sourceId];
                              const countVal = cell ? cell.count : 0;
                              const areaVal = cell ? cell.area : 0;

                              return [
                                <TableCell
                                  key={`${row.clusterNo}-${source.sourceId}-count`}
                                  align="center"
                                  sx={{
                                    ...numericCellSx,
                                    color: active ? 'text.primary' : alpha('#000', 0.28),
                                    bgcolor: active ? 'inherit' : alpha('#000', 0.02)
                                  }}
                                >
                                  {countVal > 0 ? countVal : '—'}
                                </TableCell>,
                                <TableCell
                                  key={`${row.clusterNo}-${source.sourceId}-area`}
                                  align="right"
                                  sx={{
                                    ...numericCellSx,
                                    color: active ? 'text.primary' : alpha('#000', 0.28),
                                    bgcolor: active ? 'inherit' : alpha('#000', 0.02),
                                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                  }}
                                >
                                  {areaVal > 0 ? formatNumber(areaVal) : '—'}
                                </TableCell>
                              ];
                            })}
                          </TableRow>
                        ))
                      )}

                      {/* Grand Totals */}
                      {filteredIrrRows.length > 0 && (
                        <TableRow sx={{ bgcolor: stickyTintGrand }}>
                          <TableCell
                            align="center"
                            sx={{
                              ...stickyCellSx(0, stickyTintGrand),
                              fontWeight: 800,
                              color: themeColor,
                              borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                              zIndex: 2
                            }}
                          >
                            TOTAL
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              ...stickyCellSx(CLUSTER_NUM_W, stickyTintGrand),
                              fontWeight: 800,
                              color: themeColor,
                              borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                              zIndex: 1
                            }}
                          >
                            —
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              ...stickyCellSx(CLUSTER_NUM_W + LAND_TYPE_W, stickyTintGrand),
                              ...numericCellSx,
                              fontWeight: 800,
                              color: themeColor,
                              borderRight: `1px solid ${alpha(themeColor, 0.1)}`,
                              zIndex: 1
                            }}
                          >
                            {formatNumber(irrGrandTotals.clusterArea)}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 800,
                              color: themeColor
                            }}
                          >
                            —
                          </TableCell>
                          {irrigationSources.flatMap((source) => {
                            const tot = irrGrandTotals[source.sourceId] || { count: 0, area: 0 };
                            return [
                              <TableCell
                                key={`total-${source.sourceId}-count`}
                                align="center"
                                sx={{
                                  ...numericCellSx,
                                  fontWeight: 800,
                                  color: themeColor
                                }}
                              >
                                {tot.count}
                              </TableCell>,
                              <TableCell
                                key={`total-${source.sourceId}-area`}
                                align="right"
                                sx={{
                                  ...numericCellSx,
                                  fontWeight: 800,
                                  color: themeColor,
                                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                }}
                              >
                                {formatNumber(tot.area)}
                              </TableCell>
                            ];
                          })}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={activeTab === 0 ? filteredLandRows.length : filteredIrrRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClusterForm2;

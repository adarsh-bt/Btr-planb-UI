// ZoneFormReport.js - With API integration and navigation support
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import GrassIcon from '@mui/icons-material/Grass';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

/* ─────────────────────────── season (crop season) ─────────────────────────── */

// Crop seasons supported by the backend. seasonId is MANDATORY on the
// form1-status endpoints, so there is deliberately no "ALL"/empty option.
// TODO: SEASON_OPTIONS / DEFAULT_SEASON_ID / normalizeSeasonId are now duplicated
// across the state, taluk and zone report pages — move them into a shared
// constants module (e.g. utils/cropSeason.js) before a fourth copy appears.
const SEASON_OPTIONS = [
  { value: 1, label: 'Autumn' },
  { value: 2, label: 'Winter' },
  { value: 3, label: 'Summer' }
];

const DEFAULT_SEASON_ID = 1; // Autumn

// The BTR zone completed-clusters endpoint is a different service. If it also
// understands seasonId, keep this true so "Total" is season-scoped and the
// Not Started math stays correct. Unknown query params are ignored by Spring,
// so if BTR doesn't support it the behaviour is identical to before.
const BTR_SUPPORTS_SEASON_ID = true;

const getSeasonLabel = (value) =>
  SEASON_OPTIONS.find((o) => o.value === Number(value))?.label || 'Autumn';

// Accepts anything (number from location.state, string from a serialized source,
// undefined on direct access) and always returns a valid season id.
const normalizeSeasonId = (value) => {
  const n = Number(value);
  return SEASON_OPTIONS.some((o) => o.value === n) ? n : DEFAULT_SEASON_ID;
};

// Builds the "July <startYear> → June <startYear + 1>" agricultural-year
// month list used by the Single Month / From Month / To Month dropdowns.
function buildAgriMonthOptions() {
  const agriYear = AuthService.agriyear() || '2025-2026';
  const startYear = parseInt(agriYear.split('-')[0], 10) || new Date().getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const options = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (6 + i) % 12;
    const year = startYear + Math.floor((6 + i) / 12);
    const mm = String(monthIndex + 1).padStart(2, '0');
    options.push({ label: `${monthNames[monthIndex]} ${year}`, value: `${mm}-${year}` });
  }
  return options;
}

// Resolves a month string (e.g. 'July', 'July 2025', '07-2025') to a valid MM-YYYY value in MONTH_OPTIONS
function resolveMonthValue(val, monthOptions) {
  if (!monthOptions || monthOptions.length === 0) return '';
  if (!val) return monthOptions[0]?.value || '';

  // 1. Exact match with option value (e.g. '07-2025' or '02-2026')
  const exactMatch = monthOptions.find((o) => o.value === val);
  if (exactMatch) return exactMatch.value;

  // 2. Exact match with label (e.g. 'July 2025')
  const labelMatch = monthOptions.find((o) => o.label.toLowerCase() === val.toLowerCase());
  if (labelMatch) return labelMatch.value;

  // 3. Match month name prefix (e.g. val is 'July' or 'Feb')
  const monthNameMatch = monthOptions.find((o) => o.label.toLowerCase().startsWith(val.toLowerCase()));
  if (monthNameMatch) return monthNameMatch.value;

  // 4. Fallback to first month in options
  return monthOptions[0]?.value || '';
}

// Per-zone metrics come split into wet*/dry* fields.
// NOTE: `landType` here is WET / DRY / ALL — land type, NOT crop season.
// Crop season is the separate, mandatory seasonId (Autumn / Winter / Summer).
function pickMetric(zone, metric, landType) {
  if (!zone) return 0;
  if (metric === 'ClusterArea') {
    const wetComp = Number(zone.wetCompleted) || 0;
    const dryComp = Number(zone.dryCompleted) || 0;
    const wetArea = wetComp > 0 ? (Number(zone.wetClusterArea) || 0) : 0;
    const dryArea = dryComp > 0 ? (Number(zone.dryClusterArea) || 0) : 0;
    if (landType === 'WET') return wetArea;
    if (landType === 'DRY') return dryArea;
    return wetArea + dryArea;
  }
  if (landType === 'WET') return Number(zone[`wet${metric}`]) || 0;
  if (landType === 'DRY') return Number(zone[`dry${metric}`]) || 0;
  return (Number(zone[`wet${metric}`]) || 0) + (Number(zone[`dry${metric}`]) || 0);
}

// Loose (substring) name matching is only safe when it is UNAMBIGUOUS.
// "Pothencode 1" is a substring of "Pothencode 10", "Pothencode 11", ... so a
// naive .includes() fallback can silently attach one zone's numbers to another
// zone's row. Return a match only when exactly one candidate qualifies.
function findUniqueLooseMatch(mapByName, searchKey) {
  if (!searchKey) return null;
  const candidates = Object.keys(mapByName).filter(
    (k) => k === searchKey || k.includes(searchKey) || searchKey.includes(k)
  );
  return candidates.length === 1 ? mapByName[candidates[0]] : null;
}

// Resolve the block a zone belongs to.
function resolveBlockName(blockId, blockName, zoneName) {
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;
  return 'Unassigned';
}

const formatArea = (num) =>
  Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

function ZoneFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = location.state || {};

  const BASE_URL = mainapi.FORM_API;

  const MONTH_OPTIONS = buildAgriMonthOptions();
  const getMonthLabel = (value) => MONTH_OPTIONS.find((o) => o.value === value)?.label || value;

  // Display name — declared up here because generateExcelFileName() closes over it.
  const formattedTaluk =
    (talukName && talukName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) ||
    stateData.talukName ||
    'Taluk';

  /* ── resolve taluk ID once and keep in a ref ── */
  const resolvedTalukId = useRef(null);

  const resolveTalukId = () => {
    if (stateData.talukId !== undefined && stateData.talukId !== null) {
      return stateData.talukId;
    }
    if (stateData.talukOfficeId !== undefined && stateData.talukOfficeId !== null) {
      return stateData.talukOfficeId;
    }
    if (routeTalukId && !isNaN(routeTalukId)) {
      return parseInt(routeTalukId, 10);
    }
    return null;
  };

  if (resolvedTalukId.current === null) {
    resolvedTalukId.current = resolveTalukId();
  }

  // Get initial filters from navigation state
  const getInitialFilters = () => {
    return {
      districtId: stateData.districtId || null,
      talukId: resolvedTalukId.current,
      filterType: stateData.filterType || 'single',
      fromMonth: resolveMonthValue(stateData.fromMonth, MONTH_OPTIONS),
      toMonth: stateData.toMonth ? resolveMonthValue(stateData.toMonth, MONTH_OPTIONS) : '',
      singleMonth: resolveMonthValue(stateData.singleMonth, MONTH_OPTIONS),
      // `landType` is the new key; `seasonTab` is the legacy key still sent by
      // older callers. Both carry WET / DRY / ALL.
      landTypeTab: stateData.landType || stateData.seasonTab || 'ALL',
      // Mandatory crop season — falls back to Autumn on direct access.
      seasonId: normalizeSeasonId(stateData.seasonId)
    };
  };

  const initialFilters = getInitialFilters();

  // Filter states
  const [btrData, setBtrData] = useState(null);

  const [districtId, setDistrictId] = useState(initialFilters.districtId);
  const [talukId, setTalukId] = useState(initialFilters.talukId);
  const [landTypeTab, setLandTypeTab] = useState(initialFilters.landTypeTab);
  const [seasonId, setSeasonId] = useState(initialFilters.seasonId);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // API states
  const [loading, setLoading] = useState(false);
  const [masterZonesLoading, setMasterZonesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [zonesList, setZonesList] = useState([]);


  // Fetch master zones list
  const fetchMasterZones = async (talukIdValue) => {
    setMasterZonesLoading(true);
    try {
      const response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/zones?desTalukId=${talukIdValue}`);
      console.log('Master Zones Response:', response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Setting zones list:', response.data.data);
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

  // Fetch data from API
  // Fetch data from API
  const fetchZoneData = async () => {
    try {
      setLoading(true);
      setError(null);

      const targetQueryId = resolvedTalukId.current;

      if (!targetQueryId) {
        setError('Taluk ID is required. Please navigate from the taluk report page.');
        setLoading(false);
        return;
      }

      let startMonthVal = resolveMonthValue(MONTH_OPTIONS[0]?.value, MONTH_OPTIONS);
      let endMonthVal = resolveMonthValue(MONTH_OPTIONS[MONTH_OPTIONS.length - 1]?.value, MONTH_OPTIONS);

      if (filterType === 'single') {
        if (singleMonth) {
          const resolved = resolveMonthValue(singleMonth, MONTH_OPTIONS);
          startMonthVal = resolved;
          endMonthVal = resolved;
        }
      } else {
        if (fromMonth) startMonthVal = resolveMonthValue(fromMonth, MONTH_OPTIONS);
        if (toMonth) endMonthVal = resolveMonthValue(toMonth, MONTH_OPTIONS);
      }

      const token = AuthService.gettoken ? AuthService.gettoken() : localStorage.getItem('token');
      if (!token) throw new Error('Authentication session token missing. Please log in again.');

      // seasonId is mandatory — guard against it ever reaching the URL empty.
      const effectiveSeasonId = normalizeSeasonId(seasonId);

      // form1-status: taluk + month range + land type + season.
      const params = new URLSearchParams({ talukId: targetQueryId, startMonth: startMonthVal });
      if (endMonthVal) params.append('endMonth', endMonthVal);
      if (landTypeTab && landTypeTab !== 'ALL') params.append('landType', landTypeTab);
      params.append('seasonId', String(effectiveSeasonId));

      // BTR zone completed-clusters: agri-year scoped now. No months, no seasonId.
      const btrParams = new URLSearchParams({ talukId: targetQueryId });
      if (landTypeTab && landTypeTab !== 'ALL') btrParams.append('landType', landTypeTab);
      btrParams.append('agriYear', AuthService.agriyear() || '2025-2026');

      const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form1-status/taluk?${params.toString()}`;
      const completedClustersUrl = `${mainapi.BTR_API}/btr-service/api/report/dashboard/completed/zone?${btrParams.toString()}`;

      console.log('Zone API Request:', url);
      console.log('BTR Zone Completed-Clusters Request:', completedClustersUrl);

      const [formStatusRes, completedClustersRes] = await Promise.all([
        axios.get(url, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(completedClustersUrl, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      console.log('Zone API Response:', formStatusRes.data);
      console.log('BTR Zone Completed-Clusters Response:', completedClustersRes.data);

      setApiData(formStatusRes.data || null);
      console.log("resposne dataaaa  " + formStatusRes.data)
      setBtrData(completedClustersRes.data || null);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch master zones on mount
  useEffect(() => {
    if (resolvedTalukId.current) {
      fetchMasterZones(resolvedTalukId.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchZoneData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, talukId, landTypeTab, seasonId, filterType, fromMonth, toMonth, singleMonth]);

  // Merge API data with master zones list
  // Merge API data with master zones list
  const processedData = useMemo(() => {
    const apiZones = apiData?.allSubDetails || {};
    const btrZones = btrData?.allSubDetails || {};

    console.log('API Zones:', apiZones);
    console.log('Master Zones List:', zonesList);
    console.log('BTR Zones:', btrZones);

    const apiDataMapById = {};
    const apiDataMapByName = {};
    Object.entries(apiZones).forEach(([key, details]) => {
      if (details.zoneId) apiDataMapById[details.zoneId] = details;
      const name = details.zoneName || key;
      const nameKey = name?.toLowerCase()?.trim() || '';
      if (nameKey) apiDataMapByName[nameKey] = details;
    });

    // BTR completed-clusters lookup, by id and by name
    const btrMapById = {};
    const btrMapByName = {};
    Object.entries(btrZones).forEach(([name, details]) => {
      if (details.id) btrMapById[details.id] = details;
      if (details.zoneId) btrMapById[details.zoneId] = details;
      const key = name?.toLowerCase()?.trim() || '';
      if (key) btrMapByName[key] = details;
    });

    const resolveBtrDetails = (zoneId, zoneName) => {
      if (zoneId && btrMapById[zoneId]) return btrMapById[zoneId];
      const key = zoneName?.toLowerCase()?.trim() || '';
      if (key && btrMapByName[key]) return btrMapByName[key];
      return findUniqueLooseMatch(btrMapByName, key) || {};
    };

    let mergedZones = [];

    if (zonesList && zonesList.length > 0) {
      mergedZones = zonesList.map((zone) => {
        const zoneId = zone.zoneId;
        const zoneName = zone.zoneNameEn || '';

        // IMPORTANT: Get block info from master zones list
        const masterBlockId = zone.blockId || null;
        const masterBlockName = zone.blockName || null;
        const masterBlockType = zone.blockType || null;

        let apiDetails = null;
        if (zoneId && apiDataMapById[zoneId]) {
          apiDetails = apiDataMapById[zoneId];
        }
        if (!apiDetails) {
          const key = zoneName?.toLowerCase()?.trim() || '';
          if (key && apiDataMapByName[key]) apiDetails = apiDataMapByName[key];
        }
        if (!apiDetails) {
          const searchKey = zoneName?.toLowerCase()?.trim() || '';
          apiDetails = findUniqueLooseMatch(apiDataMapByName, searchKey);
        }

        const completed = apiDetails ? pickMetric(apiDetails, 'Completed', landTypeTab) : 0;
        const ongoing = apiDetails ? pickMetric(apiDetails, 'Ongoing', landTypeTab) : 0;
        const underReview = apiDetails ? pickMetric(apiDetails, 'UnderReview', landTypeTab) : 0;
        const area = apiDetails ? pickMetric(apiDetails, 'ClusterArea', landTypeTab) : 0;

        // Total from BTR completed-clusters API, Not Started derived from it
        const btrDetails = resolveBtrDetails(zoneId, zoneName);
        const total = pickMetric(btrDetails, 'Completed', landTypeTab);
        const notStarted = Math.max(total - completed - ongoing - underReview, 0);

        const hasData = completed > 0 || ongoing > 0 || notStarted > 0 || underReview > 0 || area > 0 || total > 0;

        // Use block info from master zones list FIRST (this is the key fix)
        // Fallback to API details if master doesn't have it
        let blockId = masterBlockId;
        let blockName = masterBlockName;

        // If master doesn't have block info, try to get it from API details
        if (!blockId && !blockName && apiDetails) {
          blockId = apiDetails.blockId || null;
          blockName = apiDetails.blockName || null;
        }

        // If we have block type from master but no block name, use block type as name
        if (!blockName && masterBlockType) {
          blockName = masterBlockType;
        }

        // Fallback to 'Unassigned' if still no block info
        const resolvedBlock = resolveBlockName(blockId, blockName, zoneName);

        return {
          zoneId: zoneId,
          zoneName: zoneName || 'Unknown Zone',
          blockId: blockId,
          blockName: resolvedBlock,
          masterBlockType: masterBlockType, // Keep for reference
          total,
          completed,
          ongoing,
          notStarted,
          underReview,
          area,
          hasData,
          originalBlockName: apiDetails?.blockName,
          isMunicipality: resolvedBlock === 'Municipality',
          isCorporation: resolvedBlock === 'Corporation'
        };
      });
    } else {
      // Fallback: use only API data
      mergedZones = Object.entries(apiZones).map(([key, details]) => {
        const completed = pickMetric(details, 'Completed', landTypeTab);
        const ongoing = pickMetric(details, 'Ongoing', landTypeTab);
        const underReview = pickMetric(details, 'UnderReview', landTypeTab);
        const area = pickMetric(details, 'ClusterArea', landTypeTab);

        const zoneName = details.zoneName || key;
        const zoneIdVal = details.zoneId;

        const btrDetails = resolveBtrDetails(zoneIdVal, zoneName);
        const total = pickMetric(btrDetails, 'Completed', landTypeTab);
        const notStarted = Math.max(total - completed - ongoing - underReview, 0);

        const hasData = completed > 0 || ongoing > 0 || notStarted > 0 || underReview > 0 || area > 0 || total > 0;

        const blockId = details.blockId || null;
        const blockName = details.blockName || 'Unassigned';
        const resolvedBlock = resolveBlockName(blockId, blockName, zoneName);

        return {
          zoneId: zoneIdVal || `zone_${Math.random()}`,
          zoneName: zoneName,
          blockId: blockId,
          blockName: resolvedBlock,
          total,
          completed,
          ongoing,
          notStarted,
          underReview,
          area,
          hasData,
          isMunicipality: resolvedBlock === 'Municipality',
          isCorporation: resolvedBlock === 'Corporation'
        };
      });
    }

    // Group by block — unchanged, just carry `total` through zoneData
    const blockMap = new Map();
    const municipalityZones = [];
    const corporationZones = [];

    mergedZones.forEach((zone) => {
      const zoneData = {
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        total: zone.total,
        completed: zone.completed,
        ongoing: zone.ongoing,
        notStarted: zone.notStarted,
        underReview: zone.underReview,
        area: zone.area,
        hasData: zone.hasData
      };

      if (zone.isMunicipality) {
        municipalityZones.push(zoneData);
        return;
      }
      if (zone.isCorporation) {
        corporationZones.push(zoneData);
        return;
      }

      // Use the block name from the zone (which now correctly comes from master)
      const key = zone.blockId || zone.blockName;
      if (!blockMap.has(key)) {
        blockMap.set(key, {
          blockId: zone.blockId,
          blockName: zone.blockName,
          zones: []
        });
      }
      blockMap.get(key).zones.push(zoneData);
    });

    const blocks = Array.from(blockMap.values()).sort((a, b) => a.blockName.localeCompare(b.blockName));
    blocks.forEach((block) => block.zones.sort((a, b) => a.zoneName.localeCompare(b.zoneName)));

    if (municipalityZones.length > 0) {
      blocks.push({
        blockId: 'municipality',
        blockName: 'Municipality',
        isMunicipality: true,
        zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }
    if (corporationZones.length > 0) {
      blocks.push({
        blockId: 'corporation',
        blockName: 'Corporation',
        isCorporation: true,
        zones: corporationZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    }

    return blocks;
  }, [apiData, btrData, zonesList, landTypeTab]);

  // Count zones with no data
  const zonesWithNoData = useMemo(() => {
    let count = 0;
    processedData.forEach(block => {
      block.zones.forEach(zone => {
        if (!zone.hasData) count++;
      });
    });
    return count;
  }, [processedData]);

  // Overall statistics
  const stats = useMemo(() => {
    if (!apiData) {
      return { total: 0, completed: 0, ongoing: 0, notStarted: 0, underReview: 0, completedArea: 0 };
    }
    const completedArea = processedData.reduce(
      (sum, block) => sum + block.zones.reduce((s, z) => s + z.area, 0),
      0
    );

    const totalCompletedClusters = btrData?.totalClusterCompleted || 0; // source for "Total Clusters"
    const existingCompleted = apiData.completed || 0;
    const existingOngoing = apiData.ongoing || 0;
    const existingUnderReview = apiData.underView || apiData.underReview || 0;

    return {
      total: totalCompletedClusters,
      completed: existingCompleted,
      ongoing: existingOngoing,
      notStarted: Math.max(totalCompletedClusters - existingCompleted - existingOngoing - existingUnderReview, 0),
      underReview: existingUnderReview,
      completedArea
    };
  }, [apiData, btrData, processedData]);

  // Flatten data for table display with subtotals
  const flattenedTableData = useMemo(() => {
    const result = [];

    processedData.forEach((block) => {
      let blockTotal = 0;
      let blockCompleted = 0;
      let blockOngoing = 0;
      let blockNotStarted = 0;
      let blockUnderReview = 0;
      let blockArea = 0;

      block.zones.forEach((zone, zoneIndex) => {
        const zoneTotal = zone.total; // BTR-derived total, not a re-sum

        blockTotal += zoneTotal;
        blockCompleted += zone.completed;
        blockOngoing += zone.ongoing;
        blockNotStarted += zone.notStarted;
        blockUnderReview += zone.underReview;
        blockArea += zone.area;

        result.push({
          type: 'zone',
          id: `${block.blockId}_zone_${zone.zoneId}`,
          blockId: block.blockId,
          blockName: block.blockName,
          isFirstZoneInBlock: zoneIndex === 0,
          zoneName: zone.zoneName,
          total: zoneTotal,
          completed: zone.completed,
          ongoing: zone.ongoing,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          area: zone.area,
          zoneId: zone.zoneId,
          hasData: zone.hasData,
          isCorporation: block.isCorporation || false,
          isMunicipality: block.isMunicipality || false
        });
      });

      result.push({
        type: 'subtotal',
        id: `block_${block.blockId}_subtotal`,
        blockId: block.blockId,
        blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        total: blockTotal,
        completed: blockCompleted,
        ongoing: blockOngoing,
        notStarted: blockNotStarted,
        underReview: blockUnderReview,
        area: blockArea,
        isSubtotal: true,
        hasData: blockTotal > 0,
        isCorporation: block.isCorporation || false,
        isMunicipality: block.isMunicipality || false
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
    setFromMonth(MONTH_OPTIONS[0]?.value || '');
    setToMonth('');
    setSingleMonth(MONTH_OPTIONS[0]?.value || '');
    setLandTypeTab('ALL');
    setSeasonId(DEFAULT_SEASON_ID); // reset to Autumn, never blank
    setFilterType('single');
    setPage(0);
  };

  const filtersAreDirty =
    fromMonth !== MONTH_OPTIONS[0]?.value ||
    Boolean(toMonth) ||
    landTypeTab !== 'ALL' ||
    Number(seasonId) !== DEFAULT_SEASON_ID;

  const handleLandTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setLandTypeTab(newValue);
      setPage(0);
    }
  };

  const handleSeasonChange = (event) => {
    setSeasonId(Number(event.target.value));
    setPage(0);
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setFilterType(newValue);
      setFromMonth(MONTH_OPTIONS[0]?.value || '');
      setToMonth('');
      setSingleMonth(MONTH_OPTIONS[0]?.value || '');
      setPage(0);
    }
  };

  const handleViewZoneDetails = (zoneName, zoneId, hasData) => {
    // Only navigate if zone has data
    if (!hasData) return;

    console.log(`View details for ${zoneName}`, zoneId);
    navigate(`/kerala_form_report/zone-details/${zoneId}`, {
      state: {
        zoneName,
        zoneId,
        districtId,
        talukId: resolvedTalukId.current,
        fromMonth,
        toMonth,
        seasonTab: landTypeTab, // legacy key
        landType: landTypeTab,
        seasonId: normalizeSeasonId(seasonId),
        filterType,
        singleMonth
      }
    });
  };

  // Build a meaningful filename from the active filters
  const generateExcelFileName = () => {
    const parts = ['Zone_Report', formattedTaluk.replace(/\s+/g, '_')];

    parts.push(getSeasonLabel(seasonId));

    if (landTypeTab !== 'ALL') parts.push(landTypeTab);

    if (filterType === 'single' && singleMonth) {
      parts.push(getMonthLabel(singleMonth).replace(/\s+/g, '_'));
    } else if (filterType === 'range') {
      if (fromMonth) parts.push(getMonthLabel(fromMonth).replace(/\s+/g, '_'));
      if (toMonth) parts.push('to', getMonthLabel(toMonth).replace(/\s+/g, '_'));
    }

    if (searchTerm.trim()) {
      parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    }

    parts.push(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    return `${parts.join('_')}.xlsx`;
  };

  // Export the FULL search-filtered dataset (blocks, zones, and subtotal rows) to Excel
  const handleExportExcel = () => {
    if (!searchFilteredData || searchFilteredData.length === 0) return;

    const seasonLabel = getSeasonLabel(seasonId);

    let serial = 0;
    const exportRows = searchFilteredData.map((row) => {
      const isSubtotalRow = row.type === 'subtotal';
      if (!isSubtotalRow) serial++;

      const hasNoData = !row.hasData && !isSubtotalRow;

      return {
        '#': isSubtotalRow ? '' : serial,
        Season: seasonLabel,
        Block: row.blockName,
        Zone: row.zoneName,
        Total: hasNoData ? 'NA' : row.total,
        Completed: hasNoData ? 'NA' : row.completed,
        'Area Completed': hasNoData ? 'NA' : row.area,
        Ongoing: hasNoData ? 'NA' : row.ongoing,
        'Not Started': hasNoData ? 'NA' : row.notStarted,
        'Under Review': hasNoData ? 'NA' : row.underReview
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Reasonable column widths so it doesn't open looking cramped
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 10 },
      { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zone Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const handleGoBack = () => {
    const safeDistrictName = districtName || stateData.districtName || '';
    const formattedDistrictName = safeDistrictName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/kerala_form_report/taluk_form_report/${formattedDistrictName}`, {
      state: {
        districtId: districtId,
        districtName: stateData.districtName || '',
        fromMonth,
        toMonth,
        seasonTab: landTypeTab, // legacy key
        landType: landTypeTab,
        seasonId: normalizeSeasonId(seasonId),
        filterType,
        singleMonth
      }
    });
  };

  const StatCard = ({ label, value, color, bgColor, icon, areaValue }) => (
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>
                {loading ? <CircularProgress size={24} /> : value}
              </Typography>
              {!loading && areaValue !== undefined && areaValue > 0 && (
                <Chip
                  label={`${formatArea(areaValue)} cents`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22, borderColor: alpha(color, 0.4), color }}
                />
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  // Show loading state
  if ((loading || masterZonesLoading) && !apiData && zonesList.length === 0) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>Loading zone data...</Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // Show error state
  if (error && !apiData) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchZoneData}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
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
                {formattedTaluk} Taluk - Zone Form Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(districtName || stateData.districtName) &&
                  `District: ${(districtName || stateData.districtName).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} • `}
                {`${getSeasonLabel(seasonId)} season`}
                {landTypeTab !== 'ALL' && ` • ${landTypeTab} Land`}
                {filterType === 'single' && singleMonth && ` • ${getMonthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && ` • ${getMonthLabel(fromMonth)}${toMonth ? ` - ${getMonthLabel(toMonth)}` : ''}`}
                {apiData && ` • Total Zones: ${Object.keys(apiData.allSubDetails || {}).length}`}
                {zonesWithNoData > 0 && ` • ${zonesWithNoData} zones with no data`}
                {loading && ' • Loading...'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            {filtersAreDirty && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Reset Filters
              </Button>
            )}
          </Stack>
        </Stack>
      </Grid>

      {/* Info Banner for zones with no data */}
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

      {/* Filters */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="zone-season-select-label">Season</InputLabel>
                <Select
                  labelId="zone-season-select-label"
                  value={seasonId}
                  label="Season"
                  onChange={handleSeasonChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <GrassIcon fontSize="small" sx={{ color: '#2e7d32' }} />
                    </InputAdornment>
                  }
                >
                  {SEASON_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tabs
                value={landTypeTab}
                onChange={handleLandTypeChange}
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
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select
                      value={fromMonth}
                      label="From Month"
                      onChange={(e) => { setFromMonth(e.target.value); setPage(0); }}
                    >
                      <MenuItem value="">{`None (${MONTH_OPTIONS[0]?.label})`}</MenuItem>
                      {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select
                      value={toMonth}
                      label="To Month"
                      onChange={(e) => { setToMonth(e.target.value); setPage(0); }}
                    >
                      <MenuItem value="">{`None (${MONTH_OPTIONS[MONTH_OPTIONS.length - 1]?.label})`}</MenuItem>
                      {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={singleMonth}
                    label="Select Month"
                    onChange={(e) => { setSingleMonth(e.target.value); setPage(0); }}
                  >
                    {MONTH_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
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
            label={`${formattedTaluk} - Taluk Report Summary • ${getSeasonLabel(seasonId)}`}
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
                label="Total Clusters"
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
                areaValue={stats.completedArea}
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
        <Box
          sx={{
            position: 'relative',
            border: `1px solid ${alpha('#04255e', 0.15)}`,
            borderRadius: 3,
            pt: 3,
            bgcolor: '#fff'
          }}
        >
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

          {/* Search + Export row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2, pb: 2 }}
          >
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
            <Tooltip
              title={
                searchFilteredData.length === 0
                  ? 'No data available to export'
                  : `Export ${searchFilteredData.length} row${searchFilteredData.length > 1 ? 's' : ''} to Excel`
              }
            >
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={searchFilteredData.length === 0 || loading}
                  sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                >
                  Download Excel
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <MainCard
            title={`Blocks and Zones in ${formattedTaluk} — ${getSeasonLabel(seasonId)}`}
            sx={{ borderRadius: 3 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#04255e' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 600, py: 1.5, minWidth: 60, textAlign: 'center', border: 'none' }}>#</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, py: 1.5, minWidth: 180, textAlign: 'center', border: 'none' }}>Block</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 600, py: 1.5, minWidth: 180, border: 'none' }}>Zone</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Total</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Completed</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Ongoing</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Not Started</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Under Review</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 600, py: 1.5, border: 'none' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedData.length > 0 ? (
                        (() => {
                          const rows = [];
                          let lastBlockName = '';
                          let blockRowCount = 0;
                          let serialNumber = page * rowsPerPage;

                          for (let i = 0; i < paginatedData.length; i++) {
                            const row = paginatedData[i];
                            const isNewBlock = row.blockName !== lastBlockName;
                            const isCurrentRowSubtotal = row.type === 'subtotal';
                            const hasNoData = !row.hasData && !isCurrentRowSubtotal;

                            if (isNewBlock) {
                              blockRowCount = paginatedData.filter(r => r.blockName === row.blockName && r.type !== 'subtotal').length;
                              lastBlockName = row.blockName;
                            }

                            if (!isCurrentRowSubtotal) {
                              serialNumber++;
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
                                  },
                                  ...(hasNoData && {
                                    bgcolor: alpha('#ff9800', 0.03),
                                    '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                                  })
                                }}
                              >
                                {/* Serial Number */}
                                <TableCell align="center" sx={{ border: 'none' }}>
                                  {!isCurrentRowSubtotal && (
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                      {serialNumber}
                                    </Typography>
                                  )}
                                </TableCell>

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
                                <TableCell
                                  colSpan={isCurrentRowSubtotal ? 2 : 1}
                                  sx={{ borderRight: 'none', borderLeft: 'none' }}
                                >
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
                                  )}
                                </TableCell>

                                {/* Total */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {hasNoData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : (
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
                                  )}
                                </TableCell>

                                {/* Completed */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {hasNoData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : (
                                    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
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
                                      {row.area > 0 && (
                                        <Chip
                                          label={formatArea(row.area)}
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.65rem', height: 20, borderColor: alpha('#04255e', 0.3), color: '#04255e' }}
                                        />
                                      )}
                                    </Stack>
                                  )}
                                </TableCell>

                                {/* Ongoing */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {hasNoData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : row.ongoing > 0 ? (
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
                                  {hasNoData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : row.notStarted > 0 ? (
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
                                  {hasNoData ? (
                                    <Typography variant="body2" color="text.secondary">NA</Typography>
                                  ) : row.underReview > 0 ? (
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

                                {/* Actions
                                    NOTE: the enabled branch is still hard-disabled (`disabled` prop on the
                                    IconButton) — the zone-details drill-down is not live yet. Remove the
                                    `disabled` prop when /kerala_form_report/zone-details/:zoneId is ready. */}
                                <TableCell align="center" sx={{ borderRight: 'none', borderLeft: 'none' }}>
                                  {row.type !== 'subtotal' && (
                                    row.hasData ? (
                                      <Tooltip title="View Details">
                                        <IconButton
                                          size="small"
                                          disabled
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
                                    )
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                          return rows;
                        })()
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">
                              {searchTerm
                                ? `No blocks/zones found matching "${searchTerm}"`
                                : `No data available for ${getSeasonLabel(seasonId)} season with the selected filters`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {searchFilteredData.length > 0 && (
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
              </>
            )}
          </MainCard>
        </Box>
      </Grid>

      {/* Back Button */}
      {!stateData.isDirectAccess && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleGoBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: '#04255e',
                borderColor: '#04255e',
                borderRadius: 2,
                px: 4,
                '&:hover': {
                  borderColor: '#04255e',
                  bgcolor: alpha('#04255e', 0.04)
                }
              }}
            >
              Back to Taluk Report
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default ZoneFormReport;
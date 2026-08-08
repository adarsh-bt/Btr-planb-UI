// ZoneClusterReport.js
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
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
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import api from 'api/api';
import AuthService from 'pages/authentication/services/authservice';


const BASE_URL = mainapi.BTR_API;

/* ─────────────────────────── helpers ─────────────────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getCurrentMonthName() {
  return MONTH_NAMES[new Date().getMonth()];
}

// Agricultural year months (July to June)
const AGRI_YEAR_MONTHS = [
  'July', 'August', 'September', 'October', 'November', 'December',
  'January', 'February', 'March', 'April', 'May', 'June'
];

function getAgriculturalYear() {
  try {
    const agriYear = AuthService.agriyear();
    if (agriYear) {
      const years = agriYear.split('-');
      if (years.length === 2) {
        const startYear = parseInt(years[0]);
        const endYear = parseInt(years[1]);
        return { startYear, endYear, display: agriYear };
      }
    }
  } catch (error) {
    console.error('Error getting agricultural year:', error);
  }

  // Fallback: calculate current agricultural year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  if (currentMonth >= 6) {
    return { startYear: currentYear, endYear: currentYear + 1, display: `${currentYear}-${currentYear + 1}` };
  } else {
    return { startYear: currentYear - 1, endYear: currentYear, display: `${currentYear - 1}-${currentYear}` };
  }
}

// Build agricultural year months with years
function buildAgriYearMonths(startYear, endYear) {
  const months = [];
  // July to December of start year
  for (let m = 6; m < 12; m++) {
    months.push({
      label: `${MONTH_NAMES[m]} ${startYear}`,
      value: `${startYear}-${String(m + 1).padStart(2, '0')}`
    });
  }
  // January to June of end year
  for (let m = 0; m < 6; m++) {
    months.push({
      label: `${MONTH_NAMES[m]} ${endYear}`,
      value: `${endYear}-${String(m + 1).padStart(2, '0')}`
    });
  }
  return months;
}

// Get default month (current month if in agricultural year, else first month)
function getDefaultMonth(months) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const exists = (months || []).some(m => m.value === current);
  return exists ? current : (months && months[0]?.value ? months[0].value : '');
}

// Get month label from value (e.g. "2025-07" -> "July 2025")
function getMonthLabel(value, agriYearMonths) {
  if (!value) return '';
  const found = (agriYearMonths || []).find(m => m.value === value);
  if (found) return found.label;

  if (/^\d{4}-\d{2}$/.test(value)) {
    const [yyyy, mm] = value.split('-');
    const mIdx = parseInt(mm, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${MONTH_NAMES[mIdx]} ${yyyy}`;
    }
  }
  return value;
}

function formatMonthForApi(monthName, agriculturalYear) {
  if (!agriculturalYear) {
    agriculturalYear = getAgriculturalYear();
  }
  if (!monthName) {
    return null;
  }

  // Case 1: Already in YYYY-MM format (e.g. "2025-07")
  if (/^\d{4}-\d{2}$/.test(monthName)) {
    return monthName;
  }

  // Case 2: In MM-YYYY format (e.g. "07-2025")
  if (/^\d{2}-\d{4}$/.test(monthName)) {
    const [mm, yyyy] = monthName.split('-');
    return `${yyyy}-${mm}`;
  }

  // Case 3: Month name string (e.g. "July", "July 2025", "February", etc.)
  let cleanName = monthName;
  if (typeof monthName === 'string') {
    cleanName = monthName.split(' ')[0].split('-')[0];
  }

  let monthIndex = AGRI_YEAR_MONTHS.indexOf(cleanName);
  if (monthIndex === -1) {
    monthIndex = AGRI_YEAR_MONTHS.findIndex((m) => m.toLowerCase().startsWith(cleanName.toLowerCase()));
  }

  if (monthIndex === -1) {
    const currentName = getCurrentMonthName();
    monthIndex = AGRI_YEAR_MONTHS.indexOf(currentName);
  }

  if (monthIndex === -1) {
    monthIndex = 0; // July fallback
  }

  let year;
  let monthNumber;
  if (monthIndex <= 5) { // July (0) to Dec (5)
    year = agriculturalYear.startYear;
    monthNumber = monthIndex + 7;
  } else { // Jan (6) to June (11)
    year = agriculturalYear.endYear;
    monthNumber = monthIndex - 5;
  }

  const monthStr = String(monthNumber).padStart(2, '0');
  return `${year}-${monthStr}`;
}

/**
 * Dropdown options for the agricultural year, labelled with the calendar year:
 * July 2025 … December 2025, then January 2026 … June 2026.
 */
function buildMonthOptions(agriculturalYear) {
  const agriYear = agriculturalYear || getAgriculturalYear();

  return AGRI_YEAR_MONTHS.map((monthName, idx) => {
    const year = idx <= 5 ? agriYear.startYear : agriYear.endYear;
    return {
      monthName,
      year,
      value: `${monthName} ${year}`,
      label: `${monthName} ${year}`
    };
  });
}

/**
 * MUI renders an EMPTY Select when its value matches no MenuItem value. Month
 * state can arrive from anywhere (route state from the taluk page, defaults,
 * older stored filters) as "July", "July 2025", "2025-07" or "07-2025", so
 * normalise it to the exact option value before it reaches the Select.
 */
function toMonthOptionValue(raw, agriculturalYear) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return '';

  const agriYear = agriculturalYear || getAgriculturalYear();
  const options = buildMonthOptions(agriYear);
  const target = formatMonthForApi(raw, agriYear);

  const hit = options.find((option) => formatMonthForApi(option.monthName, agriYear) === target);
  return hit ? hit.value : '';
}

/**
 * Grouping key for a block.
 * The API returns the same block with inconsistent whitespace/casing
 * (e.g. "Chalakudy" and "Chalakudy "), so normalise the name before grouping.
 *
 * If block panchayats and municipalities that share a name must appear as
 * SEPARATE blocks, key this on blockId instead — the table's row-merge logic
 * reads `blockKey`, so nothing else needs to change.
 */
function normalizeBlockKey(blockName) {
  const normalized = (blockName ? String(blockName) : '').trim().replace(/\s+/g, ' ').toLowerCase();
  return normalized || 'unassigned';
}

function cleanBlockName(blockName) {
  return (blockName ? String(blockName) : '').trim().replace(/\s+/g, ' ') || 'Unassigned';
}

function normalizeZoneName(name) {
  return name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
}

/* ─────────────────────────── component ─────────────────────────── */

function ZoneClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = location.state || {};
  const agriculturalYear = useRef(null);
  const agriYearMonths = useRef([]);

  /* ── resolve taluk ID once and keep in a ref ── */
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

  // Initialize agricultural year & months
  if (agriculturalYear.current === null) {
    agriculturalYear.current = getAgriculturalYear();
  }

  /* ── month dropdown options (July 2025 … June 2026) ── */
  const monthOptions = useMemo(() => buildMonthOptions(agriculturalYear.current), []);

  /* ── filter state ── */
  const [seasonTab, setSeasonTab] = useState(stateData.seasonTab || 'ALL');
  const [landType, setLandType] = useState(stateData.landType || null);
  const [filterType, setFilterType] = useState(stateData.filterType || 'single');
  const [fromMonth, setFromMonth] = useState(() => toMonthOptionValue(stateData.fromMonth, agriculturalYear.current));
  const [toMonth, setToMonth] = useState(() => toMonthOptionValue(stateData.toMonth, agriculturalYear.current));
  const [singleMonth, setSingleMonth] = useState(() =>
    toMonthOptionValue(stateData.singleMonth || getCurrentMonthName(), agriculturalYear.current)
  );

  /* ── ui state ── */
  const [apiData, setApiData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* ─────────────────────────── fetch master zones ─────────────────────────── */

  /**
   * The master list is the SKELETON of the table: every zone in the taluk,
   * whether or not it reported clusters. Without it, zones with no data simply
   * disappear from the report instead of showing as "No Data".
   */
  const fetchMasterZones = async (talukId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get(`${BASE_URL}/btr-service/btr-api/zones?desTalukId=${talukId}`);
      console.log('Master Zones Response:', response.data);

      if (response.data && response.data.data) {
        setZonesList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setZonesList(response.data);
      }
    } catch (err) {
      console.error('Error fetching master zones list:', err);
    }
  };

  /* ─────────────────────────── fetch zone data ─────────────────────────── */

  const fetchZoneWiseData = async (overrides = {}) => {
    const talukIdValue = resolvedTalukId.current;

    if (!talukIdValue) {
      setError('Taluk ID is required. Please navigate from the taluk report page.');
      return;
    }

    setLoading(true);
    setError(null);

    const effectiveLandType = overrides.landType !== undefined ? overrides.landType : landType;
    const effectiveSeasonTab = overrides.seasonTab !== undefined ? overrides.seasonTab : seasonTab;
    const effectiveFilterType = overrides.filterType !== undefined ? overrides.filterType : filterType;
    const effectiveSingleMonth = overrides.singleMonth !== undefined ? overrides.singleMonth : singleMonth;
    const effectiveFromMonth = overrides.fromMonth !== undefined ? overrides.fromMonth : fromMonth;
    const effectiveToMonth = overrides.toMonth !== undefined ? overrides.toMonth : toMonth;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      const params = new URLSearchParams();
      params.append('page', 0);
      params.append('size', 100);

      if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
        params.append('landType', effectiveLandType.toLowerCase());
      }

      if (effectiveFilterType === 'single') {
        const fmt = formatMonthForApi(effectiveSingleMonth || getCurrentMonthName(), agriculturalYear.current);
        if (fmt) {
          params.append('startMonth', fmt);
          params.append('endMonth', fmt);
        }
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) {
          const fmt = formatMonthForApi(effectiveFromMonth, agriculturalYear.current);
          if (fmt) params.append('startMonth', fmt);
        }
        if (effectiveToMonth) {
          const fmt = formatMonthForApi(effectiveToMonth, agriculturalYear.current);
          if (fmt) params.append('endMonth', fmt);
        }
      }

      // Safety fallback: ensure startMonth is ALWAYS present
      if (!params.has('startMonth')) {
        const fallbackFmt = formatMonthForApi(getCurrentMonthName(), agriculturalYear.current);
        if (fallbackFmt) {
          params.append('startMonth', fallbackFmt);
          params.append('endMonth', fallbackFmt);
        }
      }

      const url = `${BASE_URL}/btr-service/api/report/clusters/taluk/${talukIdValue}/zones?${params.toString()}`;
      console.log('Fetching zone data from:', url);

      const response = await api.get(url);
      console.log('Zone API Response:', response.data);

      if (response.data) {
        setApiData(response.data);
        setTotalElements(
          response.data.totalElements ||
          Object.keys(response.data.allSubDetails || {}).length
        );
      }
    } catch (err) {
      console.error('Error fetching zone data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('Taluk not found.');
      else setError(err.response?.data?.message || 'Failed to fetch zone data');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    if (resolvedTalukId.current) {
      fetchMasterZones(resolvedTalukId.current);
      fetchZoneWiseData();
    }
  }, []);

  useEffect(() => {
    fetchZoneWiseData({ landType, seasonTab, filterType, singleMonth, fromMonth, toMonth });
  }, [landType, filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const getZoneStats = (details) => {
    if (!details) return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0, hasData: false };

    let stats;
    if (landType === 'WET') {
      stats = {
        completed: details.wetCompleted || 0,
        ongoing: details.wetOngoing || 0,
        notStarted: details.wetNotStarted || 0,
        underReview: details.wetUnderView || 0,
      };
    } else if (landType === 'DRY') {
      stats = {
        completed: details.dryCompleted || 0,
        ongoing: details.dryOngoing || 0,
        notStarted: details.dryNotStarted || 0,
        underReview: details.dryUnderView || 0,
      };
    } else {
      stats = {
        completed: (details.wetCompleted || 0) + (details.dryCompleted || 0),
        ongoing: (details.wetOngoing || 0) + (details.dryOngoing || 0),
        notStarted: (details.wetNotStarted || 0) + (details.dryNotStarted || 0),
        underReview: (details.wetUnderView || 0) + (details.dryUnderView || 0),
      };
    }

    return {
      ...stats,
      hasData: stats.completed > 0 || stats.ongoing > 0 || stats.notStarted > 0 || stats.underReview > 0
    };
  };

  /**
   * Zones are grouped under `blockName` coming from the report API.
   *
   * Master zone list = the skeleton (every zone in the taluk, so zones that
   * reported nothing still render as "No Data").
   * allSubDetails    = the stats, overlaid onto the skeleton by zoneId.
   *
   * If the master list is unavailable, the API response alone drives the table.
   */
  const processedData = useMemo(() => {
    const subDetailsMap = apiData?.allSubDetails || {};
    const apiEntries = Object.entries(subDetailsMap).filter(([, details]) => !!details);

    // Stat lookups: zoneId is authoritative, name is only a fallback
    const byZoneId = new Map();
    const byZoneName = new Map();
    apiEntries.forEach(([zoneName, details]) => {
      if (details.zoneId !== undefined && details.zoneId !== null) {
        byZoneId.set(String(details.zoneId), { zoneName, details });
      }
      byZoneName.set(normalizeZoneName(zoneName), { zoneName, details });
    });

    const blockMap = new Map();

    const addZone = (blockNameRaw, blockId, zone) => {
      const blockKey = normalizeBlockKey(blockNameRaw);
      if (!blockMap.has(blockKey)) {
        blockMap.set(blockKey, {
          blockKey,
          blockId: blockId ?? null,
          blockName: cleanBlockName(blockNameRaw),
          zones: []
        });
      }
      blockMap.get(blockKey).zones.push(zone);
    };

    if (zonesList && zonesList.length > 0) {
      const matchedApiKeys = new Set();

      zonesList.forEach((zone) => {
        const zoneId = zone.zoneId || zone.id;
        const zoneName = zone.zoneNameEn || zone.name || zone.zoneName || `Zone ${zoneId}`;

        const match =
          (zoneId !== undefined && zoneId !== null ? byZoneId.get(String(zoneId)) : null) ||
          byZoneName.get(normalizeZoneName(zoneName)) ||
          null;

        if (match) matchedApiKeys.add(match.zoneName);

        const stats = getZoneStats(match ? match.details : null);

        // Block comes from the API when this zone reported; master list otherwise
        const blockNameRaw = (match && match.details.blockName) || zone.blockName || 'Unassigned';
        const blockId = (match && match.details.blockId) ?? zone.blockId ?? null;

        addZone(blockNameRaw, blockId, {
          zoneId,
          zoneName,
          completed: stats.completed,
          ongoing: stats.ongoing,
          notStarted: stats.notStarted,
          underReview: stats.underReview,
          hasData: stats.hasData
        });
      });

      // Anything the API reported that the master list doesn't know about still
      // gets shown — dropping real clusters is worse than an unexpected row
      apiEntries.forEach(([zoneName, details]) => {
        if (matchedApiKeys.has(zoneName)) return;
        const stats = getZoneStats(details);
        addZone(details.blockName || 'Unassigned', details.blockId ?? null, {
          zoneId: details.zoneId,
          zoneName,
          completed: stats.completed,
          ongoing: stats.ongoing,
          notStarted: stats.notStarted,
          underReview: stats.underReview,
          hasData: stats.hasData
        });
      });
    } else {
      // No skeleton available — group straight from the API response
      apiEntries.forEach(([zoneName, details]) => {
        const stats = getZoneStats(details);
        addZone(details.blockName || 'Unassigned', details.blockId ?? null, {
          zoneId: details.zoneId,
          zoneName,
          completed: stats.completed,
          ongoing: stats.ongoing,
          notStarted: stats.notStarted,
          underReview: stats.underReview,
          hasData: stats.hasData
        });
      });
    }

    const blocks = Array.from(blockMap.values());

    // Natural sort inside a block so Chalakkudy1 … Chalakkudy5 stay in order
    blocks.forEach((block) => {
      block.zones.sort((a, b) =>
        String(a.zoneName).localeCompare(String(b.zoneName), undefined, { numeric: true, sensitivity: 'base' })
      );
    });

    return blocks.sort((a, b) => a.blockName.localeCompare(b.blockName));
  }, [apiData, zonesList, landType]);

  const stats = useMemo(() => {
    let total = 0, completed = 0, ongoing = 0, notStarted = 0, underReview = 0;
    let zonesWithData = 0, zonesWithoutData = 0;

    processedData.forEach(block => {
      block.zones.forEach(zone => {
        total += zone.completed + zone.ongoing + zone.notStarted + zone.underReview;
        completed += zone.completed;
        ongoing += zone.ongoing;
        notStarted += zone.notStarted;
        underReview += zone.underReview;

        if (zone.hasData) {
          zonesWithData++;
        } else {
          zonesWithoutData++;
        }
      });
    });

    return {
      total, completed, ongoing, notStarted, underReview,
      zonesWithData, zonesWithoutData,
      totalZones: processedData.reduce((sum, block) => sum + block.zones.length, 0)
    };
  }, [processedData]);

  const flattenedTableData = useMemo(() => {
    const result = [];
    processedData.forEach(block => {
      let bTotal = 0, bCompleted = 0, bOngoing = 0, bNotStarted = 0, bUnderReview = 0;

      block.zones.forEach((zone, idx) => {
        const zTotal = zone.completed + zone.ongoing + zone.notStarted + zone.underReview;
        bTotal += zTotal;
        bCompleted += zone.completed;
        bOngoing += zone.ongoing;
        bNotStarted += zone.notStarted;
        bUnderReview += zone.underReview;

        result.push({
          type: 'zone',
          id: `${block.blockKey}_zone_${zone.zoneId}`,
          blockKey: block.blockKey,
          blockId: block.blockId,
          blockName: block.blockName,
          isFirstZoneInBlock: idx === 0,
          zoneName: zone.zoneName,
          total: zTotal,
          completed: zone.completed,
          ongoing: zone.ongoing,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          zoneId: zone.zoneId,
          hasData: zone.hasData
        });
      });

      result.push({
        type: 'subtotal',
        id: `block_${block.blockKey}_sub`,
        blockKey: block.blockKey,
        blockId: block.blockId,
        blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        total: bTotal,
        completed: bCompleted,
        ongoing: bOngoing,
        notStarted: bNotStarted,
        underReview: bUnderReview,
        isSubtotal: true,
        hasData: bTotal > 0
      });
    });
    return result;
  }, [processedData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return flattenedTableData;
    return flattenedTableData.filter(r =>
      r.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedTableData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return searchFilteredData.slice(start, start + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleSeasonTabChange = (_, newValue) => {
    if (newValue === null) return;
    const newLandType = newValue === 'ALL' ? null : newValue;
    setSeasonTab(newValue);
    setLandType(newLandType);
    setPage(0);
  };

  const handleFilterTypeChange = (_, newValue) => {
    if (newValue === null) return;
    setFilterType(newValue);
    if (newValue === 'single') {
      setSingleMonth(toMonthOptionValue(getCurrentMonthName(), agriculturalYear.current));
      setFromMonth('');
      setToMonth('');
    } else {
      setFromMonth(toMonthOptionValue('July', agriculturalYear.current));
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setSingleMonth(toMonthOptionValue(getCurrentMonthName(), agriculturalYear.current));
    setFromMonth('');
    setToMonth('');
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('single');
    setPage(0);
  };

  const handleViewZoneDetails = (zoneName, clickedZoneId) => {
    navigate(`/Report/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${talukName}/clusters/${clickedZoneId}`);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  /* ─────────────────────────── excel export ─────────────────────────── */

  // Build a meaningful filename from the active filters
  const generateExcelFileName = () => {
    const parts = ['Zone_Report', formattedTaluk.replace(/\s+/g, '_')];

    if (seasonTab !== 'ALL') parts.push(seasonTab);

    if (filterType === 'single' && singleMonth) {
      parts.push(String(singleMonth).replace(/\s+/g, '_'));
    } else if (filterType === 'range') {
      if (fromMonth) parts.push(String(fromMonth).replace(/\s+/g, '_'));
      if (toMonth) parts.push('to', String(toMonth).replace(/\s+/g, '_'));
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

    let serial = 0;
    const exportRows = searchFilteredData.map((row) => {
      const isSubtotalRow = row.type === 'subtotal';
      if (!isSubtotalRow) serial++;

      const hasNoData = !row.hasData && row.total === 0;

      return {
        '#': isSubtotalRow ? '' : serial,
        Block: row.blockName,
        Zone: row.zoneName,
        Total: hasNoData && !isSubtotalRow ? 'NA' : row.total,
        Completed: hasNoData && !isSubtotalRow ? 'NA' : row.completed,
        Ongoing: hasNoData && !isSubtotalRow ? 'NA' : row.ongoing,
        'Not Started': hasNoData && !isSubtotalRow ? 'NA' : row.notStarted,
        'Under Review': hasNoData && !isSubtotalRow ? 'NA' : row.underReview
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Reasonable column widths so it doesn't open looking cramped
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 22 }, { wch: 10 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 14 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  /* ─────────────────────────── sub-components ─────────────────────────── */

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card sx={{
      bgcolor: bgColor, borderRadius: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] },
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>{value}</Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>{label}</Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  /* ─────────────────────────── display name ─────────────────────────── */

  const formattedTaluk =
    stateData.talukName ||
    (talukName
      ? talukName
        .replace(/-\d+$/, '')
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : 'Taluk');

  /* ─────────────────────────── render ─────────────────────────── */

  if (loading && !apiData && zonesList.length === 0) {
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

      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} Taluk – Zone wise Cluster Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {agriculturalYear.current && `Agricultural Year: ${agriculturalYear.current.display}`}
                {landType && landType !== 'ALL' && ` • ${landType} Season`}
                {filterType === 'single' && singleMonth && ` • ${getMonthLabel(singleMonth, agriYearMonths.current)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${getMonthLabel(fromMonth, agriYearMonths.current)} – ${getMonthLabel(toMonth, agriYearMonths.current)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${getMonthLabel(fromMonth, agriYearMonths.current)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${getMonthLabel(toMonth, agriYearMonths.current)}`}
                {apiData && ` • Total Clusters: ${apiData.totalCluster || 0}`}
                {stats.zonesWithoutData > 0 && ` • ${stats.zonesWithoutData} zones with no data`}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth || toMonth || singleMonth || seasonTab !== 'ALL') && (
            <Button variant="outlined" onClick={handleClearFilters}
              startIcon={<ClearIcon />} size="small" sx={{ borderRadius: 2 }}>
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Error */}
      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        </Grid>
      )}

      {/* Info Banner for zones with no data */}
      {stats.zonesWithoutData > 0 && !loading && (
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
              <strong>{stats.zonesWithoutData}</strong> zone{stats.zonesWithoutData > 1 ? 's' : ''} have no data available for the selected filters.
              {landType ? ` This may be because no ${landType.toLowerCase()} season clusters were formed in these zones.` : ''}
              <strong> View details is disabled for zones without data.</strong>
            </Typography>
          </Paper>
        </Grid>
      )}

      {/* Filters */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <Tabs value={seasonTab} onChange={handleSeasonTabChange} sx={{ minHeight: 40 }}>
              <Tab label="ALL" value="ALL" />
              <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
              <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
            </Tabs>

            <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterTypeChange} size="small">
              <ToggleButton value="range"><ViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} />Month Range</ToggleButton>
              <ToggleButton value="single"><ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />Single Month</ToggleButton>
            </ToggleButtonGroup>

            {filterType === 'range' ? (
              <>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>From Month</InputLabel>
                  <Select value={fromMonth} label="From Month" onChange={e => { setFromMonth(e.target.value); setPage(0); }}>
                    <MenuItem value="">None</MenuItem>
                    {monthOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">→</Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>To Month</InputLabel>
                  <Select value={toMonth} label="To Month" onChange={e => { setToMonth(e.target.value); setPage(0); }}>
                    <MenuItem value="">None</MenuItem>
                    {monthOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Month</InputLabel>
                <Select value={singleMonth} label="Select Month" onChange={e => { setSingleMonth(e.target.value); setPage(0); }}>
                  <MenuItem value="">None</MenuItem>
                  {monthOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', border: `1px solid ${alpha('#04255e', 0.15)}`, borderRadius: 3, p: 2, pt: 3, bgcolor: '#fff' }}>
          <Chip label={`${formattedTaluk} – Taluk Report Summary`} size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1, boxShadow: 2 }} />
          <Grid container spacing={2}>
            {[
              { label: 'Total Zones', value: stats.totalZones, color: '#1565c0', icon: <StoreIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
              { label: 'Total Clusters', value: stats.total, color: '#1565c0', icon: <AssessmentIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
              { label: 'Completed', value: stats.completed, color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} /> },
              { label: 'Ongoing', value: stats.ongoing, color: '#ed6c02', icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} /> },
              { label: 'Not Started', value: stats.notStarted, color: '#757575', icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} /> },
              { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} /> },
            ].map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={2} key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Zone Table */}
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
          <Chip label="Zone Report Summary" size="small"
            sx={{ position: 'absolute', top: -12, left: 20, zIndex: 10, fontWeight: 600, bgcolor: '#04255e', color: '#fff', px: 1, boxShadow: 2 }} />

          {/* Search + Export row — sits inside the same bordered box, above MainCard */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2, pb: 2 }}
          >
            <TextField placeholder="Search block/zone..." size="small" value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }} sx={{ width: 250 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
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
            title={`Blocks and Zones in ${formattedTaluk}`}
            sx={{ borderRadius: 3 }}
          >
            <TableContainer>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {['#', 'Block', 'Zone', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx}
                        align={idx === 0 ? 'center' : idx === 1 ? 'center' : idx === 2 ? 'left' : 'center'}
                        sx={{
                          color: 'white', fontWeight: 600, py: 1.5, border: 'none',
                          ...(idx === 1 && { minWidth: 180 }),
                          ...(idx === 2 && { minWidth: 200 }),
                        }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}><CircularProgress size={40} /></TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (() => {
                    const rows = [];
                    let lastBlockKey = null;
                    let serialNumber = page * rowsPerPage;

                    for (let i = 0; i < paginatedData.length; i++) {
                      const row = paginatedData[i];
                      const isNewBlock = row.blockKey !== lastBlockKey;
                      const isSubtotalRow = row.type === 'subtotal';
                      const hasNoData = !row.hasData && row.total === 0;

                      if (isNewBlock) {
                        lastBlockKey = row.blockKey;
                      }

                      if (!isSubtotalRow) {
                        serialNumber++;
                      }

                      const blockRowCount = isSubtotalRow
                        ? 0
                        : paginatedData.filter(r => r.blockKey === row.blockKey && r.type !== 'subtotal').length;

                      rows.push(
                        <TableRow key={row.id} hover sx={{
                          '&:hover': { bgcolor: alpha('#04255e', 0.04) },
                          transition: '0.2s',
                          '& td': {
                            borderBottom: isSubtotalRow ? `1px solid ${theme.palette.primary.main}` : 'none',
                            borderTop: isSubtotalRow ? `0.01px solid ${theme.palette.primary.main}` : 'none',
                            backgroundColor: isSubtotalRow ? alpha('#728ab4', 0.08) : 'transparent',
                          },
                          ...(hasNoData && !isSubtotalRow && {
                            bgcolor: alpha('#ff9800', 0.03),
                            '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                          })
                        }}>
                          {/* Serial Number
                              Subtotal rows have no Block cell, so this cell absorbs
                              that column — keeps all 9 columns filled and the
                              subtotal border running the full table width. */}
                          <TableCell
                            align="center"
                            colSpan={isSubtotalRow ? 2 : 1}
                            sx={{ border: 'none' }}
                          >
                            {!isSubtotalRow && (
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {serialNumber}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Block cell – merged across all zone rows */}
                          {isNewBlock && !isSubtotalRow && (
                            <TableCell rowSpan={blockRowCount} align="center"
                              sx={{
                                verticalAlign: 'middle',
                                backgroundColor: alpha('#04255e', 0.04),
                                fontWeight: 'bold',
                                color: '#04255e',
                                fontSize: '1rem',
                                border: 'none'
                              }}>
                              <Stack direction="column" spacing={1} alignItems="center">
                                <LocationOnIcon sx={{ fontSize: 24, color: '#04255e', opacity: 0.7 }} />
                                <Typography fontWeight={700} sx={{ color: '#04255e' }}>{row.blockName}</Typography>
                              </Stack>
                            </TableCell>
                          )}

                          {/* Zone name */}
                          <TableCell sx={{ border: 'none' }}>
                            {isSubtotalRow ? (
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#04255e', fontStyle: 'italic' }}>
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
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {hasNoData && !isSubtotalRow ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : (
                              <Chip label={row.total} size="small"
                                variant={isSubtotalRow ? 'filled' : 'outlined'}
                                sx={{
                                  fontWeight: isSubtotalRow ? 700 : 600,
                                  bgcolor: isSubtotalRow ? alpha('#04255e', 0.15) : 'transparent',
                                  color: isSubtotalRow ? '#04255e' : 'inherit'
                                }} />
                            )}
                          </TableCell>

                          {/* Completed */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {hasNoData && !isSubtotalRow ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.completed > 0 ? (
                              <Chip label={row.completed} size="small" color="success"
                                variant={isSubtotalRow ? 'filled' : 'outlined'}
                                sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                            ) : (
                              <Typography variant="body2" color="text.secondary">{row.completed}</Typography>
                            )}
                          </TableCell>

                          {/* Ongoing */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {hasNoData && !isSubtotalRow ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.ongoing > 0 ? (
                              <Chip label={row.ongoing} size="small" color="primary"
                                variant={isSubtotalRow ? 'filled' : 'outlined'}
                                sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                            ) : (
                              <Typography variant="body2" color="text.secondary">{row.ongoing}</Typography>
                            )}
                          </TableCell>

                          {/* Not Started */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {hasNoData && !isSubtotalRow ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.notStarted > 0 ? (
                              <Chip label={row.notStarted} size="small"
                                variant={isSubtotalRow ? 'filled' : 'outlined'}
                                sx={{
                                  fontWeight: isSubtotalRow ? 700 : 500,
                                  bgcolor: isSubtotalRow ? alpha('#757575', 0.15) : 'transparent'
                                }} />
                            ) : (
                              <Typography variant="body2" color="text.secondary">{row.notStarted}</Typography>
                            )}
                          </TableCell>

                          {/* Under Review */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {hasNoData && !isSubtotalRow ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.underReview > 0 ? (
                              <Chip label={row.underReview} size="small" color="warning"
                                variant={isSubtotalRow ? 'filled' : 'outlined'}
                                sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                            ) : (
                              <Typography variant="body2" color="text.secondary">{row.underReview}</Typography>
                            )}
                          </TableCell>

                          {/* Actions - Disabled for zones with no data */}
                          <TableCell align="center" sx={{ border: 'none' }}>
                            {!isSubtotalRow && (
                              row.hasData ? (
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId)}
                                    sx={{
                                      color: '#04255e',
                                      '&:hover': { bgcolor: alpha('#04255e', 0.1) }
                                    }}>
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="No data available - View disabled">
                                  <IconButton
                                    size="small"
                                    disabled
                                    sx={{
                                      color: '#bdbdbd',
                                      cursor: 'not-allowed'
                                    }}>
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
                  })() : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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
              <TablePagination component="div" count={searchFilteredData.length}
                page={page} onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }} />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneClusterReport;
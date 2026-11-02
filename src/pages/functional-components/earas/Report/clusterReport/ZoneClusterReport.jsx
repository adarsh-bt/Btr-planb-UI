// ZoneClusterReport.jsx
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
  LinearProgress,
  Avatar,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi';
import api from 'api/api';
import AuthService from 'pages/authentication/services/authservice';

const BASE_URL = mainapi.BTR_API;
const themeColor = '#05307a';
const themeColorAlt = '#0b4ea2';

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

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN');
};

function getAgriculturalYear(explicitYear) {
  try {
    const agriYear = explicitYear || AuthService.agriyear() || localStorage.getItem('activeAgriYear');
    if (agriYear) {
      const years = agriYear.split('-');
      if (years.length === 2) {
        const startYear = parseInt(years[0], 10);
        const endYear = parseInt(years[1], 10);
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
  const exists = (months || []).some((m) => m.value === current);
  return exists ? current : (months && months[0]?.value ? months[0].value : '');
}

// Get month label from value (e.g. "2025-07" -> "July 2025")
function getMonthLabel(value, agriYearMonths) {
  if (!value) return '';
  const found = (agriYearMonths || []).find((m) => m.value === value);
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
    if (stateData.agriculturalYear && typeof stateData.agriculturalYear === 'object' && stateData.agriculturalYear.display) {
      agriculturalYear.current = stateData.agriculturalYear;
    } else {
      const passedYear = typeof stateData.agriculturalYear === 'string'
        ? stateData.agriculturalYear
        : stateData.agriYear;
      agriculturalYear.current = getAgriculturalYear(passedYear);
    }
  }

  const getAgriYearString = () => {
    return agriculturalYear.current?.display || AuthService.agriyear() || localStorage.getItem('activeAgriYear') || '2025-2026';
  };

  /* ── month dropdown options (July 2025 … June 2026) ── */
  const monthOptions = useMemo(() => buildMonthOptions(agriculturalYear.current), []);

  /* ── filter state ── */
  const [seasonTab, setSeasonTab] = useState(stateData.seasonTab || 'ALL');
  const [landType, setLandType] = useState(stateData.landType || null);
  const [filterType, setFilterType] = useState(stateData.filterType || 'range');
  const [fromMonth, setFromMonth] = useState(() =>
    toMonthOptionValue(stateData.fromMonth, agriculturalYear.current) || toMonthOptionValue('July', agriculturalYear.current)
  );
  const [toMonth, setToMonth] = useState(() =>
    toMonthOptionValue(stateData.toMonth, agriculturalYear.current) || toMonthOptionValue(getCurrentMonthName(), agriculturalYear.current)
  );
  const [singleMonth, setSingleMonth] = useState(() =>
    toMonthOptionValue(stateData.singleMonth || getCurrentMonthName(), agriculturalYear.current)
  );

  /* ── ui state ── */
  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  /* ─────────────────────────── fetch master zones ─────────────────────────── */

  const fetchMasterZones = async (talukId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get(`${BASE_URL}/btr-service/btr-api/zones?desTalukId=${talukId}`);

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
    const effectiveAgriYear =
      overrides.agriYear !== undefined
        ? overrides.agriYear
        : getAgriYearString();

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      const params = new URLSearchParams();
      params.append('page', 0);
      params.append('size', 100);
      if (effectiveAgriYear) {
        params.append('agriYear', effectiveAgriYear);
      }

      if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
        params.append('landType', effectiveLandType.toLowerCase());
      }

      let startM = null;
      let endM = null;

      if (effectiveFilterType === 'single') {
        const fmt = formatMonthForApi(effectiveSingleMonth || getCurrentMonthName(), agriculturalYear.current);
        if (fmt) {
          startM = fmt;
          endM = fmt;
          params.append('startMonth', fmt);
          params.append('endMonth', fmt);
        }
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) {
          const fmt = formatMonthForApi(effectiveFromMonth, agriculturalYear.current);
          if (fmt) {
            startM = fmt;
            params.append('startMonth', fmt);
          }
        }
        if (effectiveToMonth) {
          const fmt = formatMonthForApi(effectiveToMonth, agriculturalYear.current);
          if (fmt) {
            endM = fmt;
            params.append('endMonth', fmt);
          }
        }
      }

      // Safety fallback: ensure startMonth is ALWAYS present
      if (!params.has('startMonth')) {
        const fallbackFmt = formatMonthForApi(getCurrentMonthName(), agriculturalYear.current);
        if (fallbackFmt) {
          startM = fallbackFmt;
          endM = fallbackFmt;
          params.append('startMonth', fallbackFmt);
          params.append('endMonth', fallbackFmt);
        }
      }

      const url = `${BASE_URL}/btr-service/api/report/clusters/taluk/${talukIdValue}/zones?${params.toString()}`;
      const response = await api.get(url);

      if (response.data) {
        setApiData(response.data);
      }

      // If range filter active, fetch single-month stats for last month of range
      if (effectiveFilterType === 'range') {
        const lastM = endM || startM;
        if (lastM) {
          const lmParams = new URLSearchParams();
          lmParams.append('page', 0);
          lmParams.append('size', 100);
          if (effectiveAgriYear) {
            lmParams.append('agriYear', effectiveAgriYear);
          }
          lmParams.append('startMonth', lastM);
          lmParams.append('endMonth', lastM);
          if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
            lmParams.append('landType', effectiveLandType.toLowerCase());
          }
          const lmUrl = `${BASE_URL}/btr-service/api/report/clusters/taluk/${talukIdValue}/zones?${lmParams.toString()}`;
          try {
            const lmResponse = await api.get(lmUrl);
            setLastMonthApiData(lmResponse.data);
          } catch (lmErr) {
            console.error('Error fetching last month zone data:', lmErr);
            setLastMonthApiData(null);
          }
        } else {
          setLastMonthApiData(null);
        }
      } else {
        setLastMonthApiData(null);
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
    if (!details) return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0, totalCluster: 0, hasData: false };

    let stats;
    if (landType === 'WET') {
      stats = {
        completed: details.wetCompleted || 0,
        ongoing: details.wetOngoing || 0,
        notStarted: details.wetNotStarted || 0,
        underReview: details.wetUnderView || 0
      };
    } else if (landType === 'DRY') {
      stats = {
        completed: details.dryCompleted || 0,
        ongoing: details.dryOngoing || 0,
        notStarted: details.dryNotStarted || 0,
        underReview: details.dryUnderView || 0
      };
    } else {
      stats = {
        completed: (details.wetCompleted || 0) + (details.dryCompleted || 0),
        ongoing: (details.wetOngoing || 0) + (details.dryOngoing || 0),
        notStarted: (details.wetNotStarted || 0) + (details.dryNotStarted || 0),
        underReview: (details.wetUnderView || 0) + (details.dryUnderView || 0)
      };
    }

    const seasonTotalCluster = landType === 'WET'
      ? details.wetTotalCluster
      : landType === 'DRY'
        ? details.dryTotalCluster
        : null;

    const fallbackTotal = stats.completed + stats.ongoing + stats.notStarted + stats.underReview;
    const totalCluster = (seasonTotalCluster !== undefined && seasonTotalCluster !== null)
      ? Number(seasonTotalCluster)
      : (details.totalCluster !== undefined && details.totalCluster !== null)
        ? Number(details.totalCluster)
        : fallbackTotal;

    return {
      ...stats,
      totalCluster,
      hasData: stats.completed > 0 || stats.ongoing > 0 || stats.notStarted > 0 || stats.underReview > 0 || totalCluster > 0
    };
  };

  const processedData = useMemo(() => {
    const subDetailsMap = apiData?.allSubDetails || {};
    const lastMonthSubDetailsMap = (filterType === 'range' && lastMonthApiData) ? (lastMonthApiData.allSubDetails || {}) : null;
    const apiEntries = Object.entries(subDetailsMap).filter(([, details]) => !!details);

    const byZoneId = new Map();
    const byZoneName = new Map();
    apiEntries.forEach(([zoneName, details]) => {
      if (details.zoneId !== undefined && details.zoneId !== null) {
        byZoneId.set(String(details.zoneId), { zoneName, details });
      }
      byZoneName.set(normalizeZoneName(zoneName), { zoneName, details });
    });

    const lmByZoneId = new Map();
    const lmByZoneName = new Map();
    if (lastMonthSubDetailsMap) {
      Object.entries(lastMonthSubDetailsMap).forEach(([zName, details]) => {
        if (!details) return;
        if (details.zoneId !== undefined && details.zoneId !== null) {
          lmByZoneId.set(String(details.zoneId), details);
        }
        lmByZoneName.set(normalizeZoneName(zName), details);
      });
    }

    const getLastMonthCompleted = (zId, zName) => {
      if (!lastMonthSubDetailsMap) return 0;
      const match = (zId !== undefined && zId !== null ? lmByZoneId.get(String(zId)) : null) || lmByZoneName.get(normalizeZoneName(zName));
      if (match) {
        const stats = getZoneStats(match);
        return stats.completed;
      }
      return 0;
    };

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
        const currentMonthCompleted = getLastMonthCompleted(zoneId, zoneName);

        const blockNameRaw = (match && match.details.blockName) || zone.blockName || 'Unassigned';
        const blockId = (match && match.details.blockId) ?? zone.blockId ?? null;

        addZone(blockNameRaw, blockId, {
          zoneId,
          zoneName,
          total: stats.totalCluster,
          totalCluster: stats.totalCluster,
          completed: stats.completed,
          currentMonthCompleted,
          ongoing: stats.ongoing,
          notStarted: stats.notStarted,
          underReview: stats.underReview,
          hasData: stats.hasData
        });
      });

      apiEntries.forEach(([zoneName, details]) => {
        if (matchedApiKeys.has(zoneName)) return;
        const stats = getZoneStats(details);
        const currentMonthCompleted = getLastMonthCompleted(details.zoneId, zoneName);
        addZone(details.blockName || 'Unassigned', details.blockId ?? null, {
          zoneId: details.zoneId,
          zoneName,
          total: stats.totalCluster,
          totalCluster: stats.totalCluster,
          completed: stats.completed,
          currentMonthCompleted,
          ongoing: stats.ongoing,
          notStarted: stats.notStarted,
          underReview: stats.underReview,
          hasData: stats.hasData
        });
      });
    } else {
      apiEntries.forEach(([zoneName, details]) => {
        const stats = getZoneStats(details);
        const currentMonthCompleted = getLastMonthCompleted(details.zoneId, zoneName);
        addZone(details.blockName || 'Unassigned', details.blockId ?? null, {
          zoneId: details.zoneId,
          zoneName,
          total: stats.totalCluster,
          totalCluster: stats.totalCluster,
          completed: stats.completed,
          currentMonthCompleted,
          ongoing: stats.ongoing,
          notStarted: stats.notStarted,
          underReview: stats.underReview,
          hasData: stats.hasData
        });
      });
    }

    let blocks = Array.from(blockMap.values());

    blocks.forEach((block) => {
      block.zones.sort((a, b) =>
        String(a.zoneName).localeCompare(String(b.zoneName), undefined, { numeric: true, sensitivity: 'base' })
      );
    });

    const targetZoneId = stateData.zoneId || (stateData.officeType === 'FIELD_DATA_COLLECTOR' ? AuthService.getzone() : null);
    if (targetZoneId) {
      const filteredBlocks = [];
      blocks.forEach((block) => {
        const matchingZones = block.zones.filter((z) => String(z.zoneId) === String(targetZoneId));
        if (matchingZones.length > 0) {
          filteredBlocks.push({ ...block, zones: matchingZones });
        }
      });
      blocks = filteredBlocks;
    }

    return blocks.sort((a, b) => a.blockName.localeCompare(b.blockName));
  }, [apiData, lastMonthApiData, zonesList, landType, filterType, stateData.zoneId, stateData.officeType]);

  const stats = useMemo(() => {
    let total = 0, completed = 0, currentMonthCompleted = 0, ongoing = 0, notStarted = 0, underReview = 0;
    let zonesWithData = 0, zonesWithoutData = 0;

    processedData.forEach((block) => {
      block.zones.forEach((zone) => {
        total += zone.totalCluster !== undefined ? zone.totalCluster : (zone.total !== undefined ? zone.total : (zone.completed + zone.ongoing + zone.notStarted + zone.underReview));
        completed += zone.completed;
        currentMonthCompleted += (zone.currentMonthCompleted || 0);
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

    const targetZoneId = stateData.zoneId || (stateData.officeType === 'FIELD_DATA_COLLECTOR' ? AuthService.getzone() : null);
    const overallTotal = (!targetZoneId && apiData?.totalCluster !== undefined && apiData?.totalCluster !== null)
      ? Number(apiData.totalCluster)
      : total;

    return {
      total: overallTotal,
      completed,
      currentMonthCompleted,
      ongoing,
      notStarted,
      underReview,
      zonesWithData,
      zonesWithoutData,
      totalZones: processedData.reduce((sum, block) => sum + block.zones.length, 0)
    };
  }, [processedData, apiData, stateData.zoneId, stateData.officeType]);

  const flattenedTableData = useMemo(() => {
    const result = [];
    processedData.forEach((block) => {
      let bTotal = 0, bCompleted = 0, bCurrentMonthCompleted = 0, bOngoing = 0, bNotStarted = 0, bUnderReview = 0;

      block.zones.forEach((zone, idx) => {
        const zTotal = zone.totalCluster !== undefined ? zone.totalCluster : (zone.total !== undefined ? zone.total : (zone.completed + zone.ongoing + zone.notStarted + zone.underReview));
        bTotal += zTotal;
        bCompleted += zone.completed;
        bCurrentMonthCompleted += (zone.currentMonthCompleted || 0);
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
          totalCluster: zTotal,
          completed: zone.completed,
          currentMonthCompleted: zone.currentMonthCompleted || 0,
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
        totalCluster: bTotal,
        completed: bCompleted,
        currentMonthCompleted: bCurrentMonthCompleted,
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
    const term = searchTerm.toLowerCase();
    return flattenedTableData.filter((r) =>
      r.zoneName.toLowerCase().includes(term) ||
      r.blockName.toLowerCase().includes(term)
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
      setToMonth(toMonthOptionValue(getCurrentMonthName(), agriculturalYear.current));
      setSingleMonth('');
    }
    setPage(0);
  };

  const handleFromMonthChange = (event) => {
    setFromMonth(event.target.value);
    setPage(0);
  };

  const handleToMonthChange = (event) => {
    setToMonth(event.target.value);
    setPage(0);
  };

  const handleSingleMonthChange = (event) => {
    setSingleMonth(event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    const curMonthVal = toMonthOptionValue(getCurrentMonthName(), agriculturalYear.current);
    const julyVal = toMonthOptionValue('July', agriculturalYear.current);
    setSingleMonth(curMonthVal);
    setFromMonth(julyVal);
    setToMonth(curMonthVal);
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('range');
    setPage(0);
    setSearchTerm('');
  };

  const handleViewZoneDetails = (zoneName, clickedZoneId) => {
    navigate(`/Report/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${talukName}/clusters/${clickedZoneId}`, {
      state: {
        zoneId: clickedZoneId,
        zoneName,
        talukId: resolvedTalukId.current,
        talukName: formattedTaluk,
        districtName: displayDistrictName,
        landType,
        seasonTab,
        startMonth: filterType === 'single' ? singleMonth : fromMonth,
        endMonth: filterType === 'single' ? singleMonth : toMonth,
        filterType,
        fromMonth,
        toMonth,
        singleMonth,
        agriYear: getAgriYearString(),
        agriculturalYear: agriculturalYear.current
      }
    });

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /* ─────────────────────────── display names ─────────────────────────── */

  const displayDistrictName =
    stateData.districtName ||
    (districtName
      ? districtName
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'District');

  const formattedTaluk =
    stateData.talukName ||
    (talukName
      ? talukName
          .replace(/-\d+$/, '')
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Taluk');

  /* ─────────────────────────── excel export ─────────────────────────── */

  const generateExcelFileName = () => {
    const parts = ['Zone_Cluster_Report', displayDistrictName.replace(/\s+/g, '_'), formattedTaluk.replace(/\s+/g, '_')];

    if (seasonTab !== 'ALL') parts.push(`${seasonTab}_Land`);

    if (filterType === 'single' && singleMonth) {
      parts.push(String(singleMonth).replace(/\s+/g, '_'));
    } else if (filterType === 'range') {
      if (fromMonth) parts.push(String(fromMonth).replace(/\s+/g, '_'));
      if (toMonth) parts.push('to', String(toMonth).replace(/\s+/g, '_'));
    }

    parts.push(getAgriYearString());

    if (searchTerm.trim()) {
      parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    }

    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.xlsx`;
  };

  const handleExportExcel = () => {
    if (!searchFilteredData || searchFilteredData.length === 0) return;

    const periodStr =
      filterType === 'range'
        ? `${fromMonth || '—'} – ${toMonth || '—'}`
        : (singleMonth || '—');

    const headerMeta = [
      [`Zone Cluster Formation Progress Report — ${formattedTaluk} Taluk (${displayDistrictName})`],
      ['Agricultural Year', getAgriYearString()],
      ['Land Type / Season', seasonTab === 'ALL' ? 'All' : `${seasonTab} Land`],
      ['Period', periodStr || '—'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    const headerRow =
      filterType === 'range'
        ? ['#', 'Block', 'Zone', 'Total', 'During the Month', 'Up to the Month', 'Ongoing', 'Not Started', 'Under Review']
        : ['#', 'Block', 'Zone', 'Total', 'Up to the Month', 'Ongoing', 'Not Started', 'Under Review'];

    let serial = 0;
    const dataRows = searchFilteredData.map((row) => {
      const isSubtotalRow = row.type === 'subtotal';
      if (!isSubtotalRow) serial += 1;

      const slNo = isSubtotalRow ? '' : serial;
      const blockCol = isSubtotalRow ? '' : row.blockName;
      const zoneCol = row.zoneName;

      if (!row.hasData && !isSubtotalRow) {
        return filterType === 'range'
          ? [slNo, blockCol, zoneCol, 'NA', 'NA', 'NA', 'NA', 'NA', 'NA']
          : [slNo, blockCol, zoneCol, 'NA', 'NA', 'NA', 'NA', 'NA'];
      }
      return filterType === 'range'
        ? [slNo, blockCol, zoneCol, row.total, row.currentMonthCompleted, row.completed, row.ongoing, row.notStarted, row.underReview]
        : [slNo, blockCol, zoneCol, row.total, row.completed, row.ongoing, row.notStarted, row.underReview];
    });

    const totalsRow =
      filterType === 'range'
        ? ['', '', 'GRAND TOTAL', stats.total, stats.currentMonthCompleted, stats.completed, stats.ongoing, stats.notStarted, stats.underReview]
        : ['', '', 'GRAND TOTAL', stats.total, stats.completed, stats.ongoing, stats.notStarted, stats.underReview];

    const aoa = [...headerMeta, headerRow, ...dataRows, totalsRow];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    worksheet['!cols'] = filterType === 'range'
      ? [{ wch: 6 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }]
      : [{ wch: 6 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];

    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zone Report');
    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const tableHeaders = useMemo(() => {
    if (filterType === 'range') {
      return [
        { key: 'slno', label: '#', align: 'center', width: 60 },
        { key: 'block', label: 'Block', align: 'center', minWidth: 160 },
        { key: 'zone', label: 'Zone', align: 'left', minWidth: 200 },
        { key: 'total', label: 'Total', align: 'center' },
        { key: 'duringMonth', label: 'During the Month', align: 'center' },
        { key: 'upToMonth', label: 'Up to the Month', align: 'center' },
        { key: 'ongoing', label: 'Ongoing', align: 'center' },
        { key: 'notStarted', label: 'Not Started', align: 'center' },
        { key: 'underReview', label: 'Under Review', align: 'center' },
        { key: 'actions', label: 'Actions', align: 'center', width: 80 }
      ];
    }
    return [
      { key: 'slno', label: '#', align: 'center', width: 60 },
      { key: 'block', label: 'Block', align: 'center', minWidth: 160 },
      { key: 'zone', label: 'Zone', align: 'left', minWidth: 200 },
      { key: 'total', label: 'Total', align: 'center' },
      { key: 'upToMonth', label: 'Up to the Month', align: 'center' },
      { key: 'ongoing', label: 'Ongoing', align: 'center' },
      { key: 'notStarted', label: 'Not Started', align: 'center' },
      { key: 'underReview', label: 'Under Review', align: 'center' },
      { key: 'actions', label: 'Actions', align: 'center', width: 80 }
    ];
  }, [filterType]);

  const kpiItems = useMemo(() => {
    const items = [
      { label: 'Zones', value: formatNumber(stats.totalZones), icon: <StoreIcon />, color: '#1565c0' },
      { label: 'Total Clusters', value: formatNumber(stats.total), icon: <AssessmentIcon />, color: '#1565c0' }
    ];

    if (filterType === 'range') {
      items.push({
        label: 'During the Month',
        value: formatNumber(stats.currentMonthCompleted),
        icon: <CalendarMonthIcon />,
        color: '#0288d1'
      });
    }

    items.push(
      {
        label: filterType === 'range' ? 'Up to the Month' : 'During the Month',
        value: formatNumber(stats.completed),
        icon: <CheckCircleIcon />,
        color: '#2e7d32'
      },
      {
        label: 'Ongoing',
        value: formatNumber(stats.ongoing),
        icon: <PendingIcon />,
        color: '#ed6c02'
      },
      {
        label: 'Not Started',
        value: formatNumber(stats.notStarted),
        icon: <ScheduleIcon />,
        color: '#757575'
      },
      {
        label: 'Under Review',
        value: formatNumber(stats.underReview),
        icon: <RateReviewIcon />,
        color: '#b76e00'
      }
    );

    return items;
  }, [stats, filterType]);

  const exportDisabled = searchFilteredData.length === 0 || loading;

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
                width: 54,
                height: 54
              }}
            >
              <AssessmentIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.2, lineHeight: 1.2 }}>
                Zone Cluster Progress Report: {formattedTaluk}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {displayDistrictName} • {formattedTaluk} Taluk • Agricultural Year {getAgriYearString()} • Zone-wise Cluster Progress Details
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {seasonTab !== 'ALL' && (
              <Chip
                label={`${seasonTab} Season`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
            <Chip
              icon={<CalendarMonthIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
              label={
                filterType === 'range'
                  ? `${fromMonth || '—'} – ${toMonth || '—'}`
                  : (singleMonth || '—')
              }
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
            />
            {apiData && (
              <Chip
                label={`Total Clusters: ${stats.total ?? (apiData.totalCluster || 0)}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3, md: 3.5 } }}>
          {/* ── KPI strip ── */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {kpiItems.map((k) => (
              <Grid
                item
                xs={6}
                sm={4}
                md={filterType === 'range' ? 1.71 : 2}
                key={k.label}
              >
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
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          letterSpacing: 0.4,
                          display: 'block',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
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
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', lg: 'center' }}
              flexWrap="wrap"
            >
              {/* Land Type Tabs */}
              <Box sx={{ minWidth: 260 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  LAND TYPE / SEASON
                </Typography>
                <Tabs
                  value={seasonTab}
                  onChange={handleSeasonTabChange}
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

              {/* Mode Toggle Button */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
                  FILTER MODE
                </Typography>
                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  onChange={handleFilterTypeChange}
                  size="small"
                  sx={{
                    minHeight: 40,
                    mt: 0.5,
                    border: `1px solid ${alpha(themeColor, 0.2)}`,
                    borderRadius: 2,
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      border: 'none',
                      px: 2,
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        backgroundColor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 800
                      }
                    }
                  }}
                >
                  <ToggleButton value="range">
                    <ViewWeekIcon sx={{ mr: 0.75, fontSize: 18 }} />
                    Month Range
                  </ToggleButton>
                  <ToggleButton value="single">
                    <ViewModuleIcon sx={{ mr: 0.75, fontSize: 18 }} />
                    Single Month
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' } }} />

              {/* Month Selects */}
              {filterType === 'range' ? (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: { xs: 1, lg: 2.5 } }}>
                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select
                      value={fromMonth}
                      label="From Month"
                      onChange={handleFromMonthChange}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                    >
                      {monthOptions.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    →
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select
                      value={toMonth}
                      label="To Month"
                      onChange={handleToMonthChange}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {monthOptions.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              ) : (
                <Box sx={{ mt: { xs: 1, lg: 2.5 } }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Month</InputLabel>
                    <Select
                      value={singleMonth}
                      label="Select Month"
                      onChange={handleSingleMonthChange}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                    >
                      {monthOptions.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {(fromMonth ||
                toMonth ||
                (filterType === 'single' && singleMonth) ||
                seasonTab !== 'ALL' ||
                searchTerm) && (
                <Box sx={{ mt: { xs: 1, lg: 2.5 }, ml: { lg: 'auto' } }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    size="small"
                    sx={{
                      height: 40,
                      borderRadius: 2,
                      borderColor: alpha(themeColor, 0.3),
                      color: themeColor,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { borderColor: themeColor, bgcolor: alpha(themeColor, 0.04) }
                    }}
                  >
                    Reset Filters
                  </Button>
                </Box>
              )}
            </Stack>

            {stats.zonesWithoutData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${stats.zonesWithoutData} zone${stats.zonesWithoutData > 1 ? 's' : ''} with no data`}
                  size="small"
                  sx={{ bgcolor: alpha('#ff9800', 0.14), color: '#e65100', fontWeight: 600 }}
                />
              </Box>
            )}
          </Paper>

          {/* ── Error Message ── */}
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
              placeholder="Search block or zone..."
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
                label={`${searchFilteredData.length} row${searchFilteredData.length !== 1 ? 's' : ''}`}
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
                    : `Download ${searchFilteredData.length} row${searchFilteredData.length > 1 ? 's' : ''} as Excel`
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
                <Table stickyHeader size="small" sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((h) => (
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
                            width: h.width,
                            minWidth: h.minWidth
                          }}
                        >
                          {h.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 10 }}>
                          <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={44} thickness={4} sx={{ color: themeColor }} />
                            <Box textAlign="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: themeColor }}>
                                Loading Zone Cluster Progress Report...
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Please wait while we fetch the latest progress details.
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">
                            {searchTerm ? `No blocks/zones found matching "${searchTerm}"` : 'No data available'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {(() => {
                          const renderedRows = [];
                          let lastBlockKey = null;
                          let serialNumber = page * rowsPerPage;

                          for (let i = 0; i < paginatedData.length; i++) {
                            const row = paginatedData[i];
                            const isNewBlock = row.blockKey !== lastBlockKey;
                            const isSubtotalRow = row.type === 'subtotal';
                            const hasNoData = !row.hasData && row.total === 0;
                            const clickable = !isSubtotalRow && row.hasData;

                            if (isNewBlock) {
                              lastBlockKey = row.blockKey;
                            }
                            if (!isSubtotalRow) {
                              serialNumber++;
                            }

                            const blockRowCount = isSubtotalRow
                              ? 0
                              : paginatedData.filter((r) => r.blockKey === row.blockKey && r.type !== 'subtotal').length;

                            renderedRows.push(
                              <TableRow
                                key={row.id}
                                hover={clickable}
                                onClick={() => clickable && handleViewZoneDetails(row.zoneName, row.zoneId)}
                                sx={{
                                  cursor: clickable ? 'pointer' : 'default',
                                  backgroundColor: isSubtotalRow
                                    ? alpha(themeColor, 0.05)
                                    : !row.hasData
                                      ? alpha('#ff9800', 0.03)
                                      : serialNumber % 2 === 1
                                        ? alpha(themeColor, 0.015)
                                        : 'transparent',
                                  ...(isSubtotalRow && {
                                    '& .MuiTableCell-root': {
                                      borderTop: `1px solid ${alpha(themeColor, 0.2)}`,
                                      borderBottom: `1px solid ${alpha(themeColor, 0.2)}`
                                    }
                                  }),
                                  '&:hover': clickable
                                    ? { backgroundColor: alpha(themeColor, 0.08), transition: '0.2s' }
                                    : undefined
                                }}
                              >
                                {/* Serial Number */}
                                <TableCell
                                  align="center"
                                  colSpan={isSubtotalRow ? 2 : 1}
                                  sx={{
                                    borderRight: `1px solid ${alpha(themeColor, 0.06)}`
                                  }}
                                >
                                  {isSubtotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: themeColor }}>
                                      —
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                      {serialNumber}
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Block cell – grouped across zone rows */}
                                {isNewBlock && !isSubtotalRow && (
                                  <TableCell
                                    rowSpan={blockRowCount}
                                    align="center"
                                    sx={{
                                      verticalAlign: 'middle',
                                      backgroundColor: alpha(themeColor, 0.03),
                                      borderRight: `1px solid ${alpha(themeColor, 0.08)}`,
                                      borderBottom: `1px solid ${alpha(themeColor, 0.08)}`
                                    }}
                                  >
                                    <Stack direction="column" spacing={0.5} alignItems="center">
                                      <LocationOnIcon sx={{ fontSize: 20, color: themeColor, opacity: 0.8 }} />
                                      <Typography variant="body2" fontWeight={700} sx={{ color: themeColor }}>
                                        {row.blockName}
                                      </Typography>
                                    </Stack>
                                  </TableCell>
                                )}

                                {/* Zone name */}
                                <TableCell
                                  align="left"
                                  sx={{
                                    borderRight: `1px solid ${alpha(themeColor, 0.06)}`
                                  }}
                                >
                                  {isSubtotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: themeColor }}>
                                      Total for {row.blockName}
                                    </Typography>
                                  ) : (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <StoreIcon
                                        sx={{
                                          fontSize: 18,
                                          color: !row.hasData ? '#ff9800' : themeColor,
                                          opacity: 0.8
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: row.hasData ? 600 : 400,
                                          color: row.hasData ? 'text.primary' : 'text.secondary'
                                        }}
                                      >
                                        {row.zoneName}
                                      </Typography>
                                      {!row.hasData && (
                                        <Chip
                                          label="NA"
                                          size="small"
                                          sx={{
                                            height: 18,
                                            fontSize: '0.62rem',
                                            bgcolor: alpha('#ff9800', 0.15),
                                            color: '#e65100',
                                            fontWeight: 700
                                          }}
                                        />
                                      )}
                                    </Stack>
                                  )}
                                </TableCell>

                                {/* Total */}
                                <TableCell align="center">
                                  {hasNoData && !isSubtotalRow ? (
                                    <Typography variant="body2" color="text.secondary">
                                      NA
                                    </Typography>
                                  ) : (
                                    <Chip
                                      label={formatNumber(row.total)}
                                      size="small"
                                      variant="filled"
                                      sx={{
                                        fontWeight: 700,
                                        bgcolor: isSubtotalRow ? alpha(themeColor, 0.15) : alpha(themeColor, 0.1),
                                        color: themeColor
                                      }}
                                    />
                                  )}
                                </TableCell>

                                {/* During Month (if range) */}
                                {filterType === 'range' && (
                                  <TableCell align="center">
                                    {hasNoData && !isSubtotalRow ? (
                                      <Typography variant="body2" color="text.secondary">
                                        NA
                                      </Typography>
                                    ) : isSubtotalRow ? (
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0288d1' }}>
                                        {formatNumber(row.currentMonthCompleted)}
                                      </Typography>
                                    ) : row.currentMonthCompleted > 0 ? (
                                      <Chip
                                        label={formatNumber(row.currentMonthCompleted)}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        0
                                      </Typography>
                                    )}
                                  </TableCell>
                                )}

                                {/* Up to Month */}
                                <TableCell align="center">
                                  {hasNoData && !isSubtotalRow ? (
                                    <Typography variant="body2" color="text.secondary">
                                      NA
                                    </Typography>
                                  ) : isSubtotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                                      {formatNumber(row.completed)}
                                    </Typography>
                                  ) : row.completed > 0 ? (
                                    <Chip
                                      label={formatNumber(row.completed)}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      0
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Ongoing */}
                                <TableCell align="center">
                                  {hasNoData && !isSubtotalRow ? (
                                    <Typography variant="body2" color="text.secondary">
                                      NA
                                    </Typography>
                                  ) : isSubtotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                                      {formatNumber(row.ongoing)}
                                    </Typography>
                                  ) : row.ongoing > 0 ? (
                                    <Chip
                                      label={formatNumber(row.ongoing)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600, color: '#ed6c02', borderColor: '#ed6c02' }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      0
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Not Started */}
                                <TableCell align="center">
                                  {hasNoData && !isSubtotalRow ? (
                                    <Typography variant="body2" color="text.secondary">
                                      NA
                                    </Typography>
                                  ) : isSubtotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#757575' }}>
                                      {formatNumber(row.notStarted)}
                                    </Typography>
                                  ) : row.notStarted > 0 ? (
                                    <Chip
                                      label={formatNumber(row.notStarted)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600, color: 'text.secondary' }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      0
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Under Review */}
                                <TableCell align="center">
                                  {hasNoData && !isSubtotalRow ? (
                                    <Typography variant="body2" color="text.secondary">
                                      NA
                                    </Typography>
                                  ) : isSubtotalRow ? (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#b76e00' }}>
                                      {formatNumber(row.underReview)}
                                    </Typography>
                                  ) : row.underReview > 0 ? (
                                    <Chip
                                      label={formatNumber(row.underReview)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600, color: '#b76e00', borderColor: '#b76e00' }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      0
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                  {!isSubtotalRow && (
                                    <Tooltip
                                      title={!row.hasData ? 'No data available for this zone' : 'View Cluster Details'}
                                    >
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId)}
                                          disabled={!row.hasData}
                                          sx={{
                                            color: !row.hasData ? alpha('#000', 0.26) : themeColor,
                                            '&:hover': { bgcolor: alpha(themeColor, 0.1) }
                                          }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                          return renderedRows;
                        })()}

                        {/* ── GRAND TOTAL ── */}
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
                          <TableCell align="center" colSpan={2} sx={{ fontWeight: 800, color: themeColor }}>
                            —
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              fontWeight: 800,
                              color: themeColor,
                              letterSpacing: 0.5
                            }}
                          >
                            GRAND TOTAL
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                            {formatNumber(stats.total)}
                          </TableCell>
                          {filterType === 'range' && (
                            <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                              {formatNumber(stats.currentMonthCompleted)}
                            </TableCell>
                          )}
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                            {formatNumber(stats.completed)}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                            {formatNumber(stats.ongoing)}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                            {formatNumber(stats.notStarted)}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                            {formatNumber(stats.underReview)}
                          </TableCell>
                          <TableCell align="center" />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {searchFilteredData.length > 0 && !loading && (
                <TablePagination
                  component="div"
                  count={searchFilteredData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[15, 25, 50, 100]}
                  sx={{
                    borderTop: `1px solid ${alpha(themeColor, 0.1)}`,
                    '& .MuiTablePagination-toolbar': { minHeight: 48 }
                  }}
                />
              )}
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ZoneClusterReport;

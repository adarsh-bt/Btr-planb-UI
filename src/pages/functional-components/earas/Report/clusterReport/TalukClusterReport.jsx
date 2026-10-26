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
const SESSION_KEY = 'talukReportState';

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN');
};

/* ─────────────────────────── helpers ─────────────────────────── */

function getCurrentMonthName() {
  return MONTH_NAMES[new Date().getMonth()];
}

// Get agricultural year
function getAgriculturalYear() {
  try {
    const agriYear = AuthService.agriyear() || localStorage.getItem('activeAgriYear');
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
function getDefaultMonth(months = []) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const exists = (months || []).some((m) => m.value === current);
  return exists ? current : (months?.[0]?.value || '');
}

// Get month label from value
function getMonthLabel(value, agriYearMonths = []) {
  if (!value) return '';
  const found = (agriYearMonths || []).find((m) => m.value === value);
  return found ? found.label : value;
}

function resolveMonthValue(val, months, agriculturalYear) {
  if (!val) return '';
  const valStr = String(val).trim();
  if (Array.isArray(months) && months.length > 0) {
    // 1. Exact match with value (e.g. '2025-07')
    const exactMatch = months.find((o) => o.value === valStr);
    if (exactMatch) return exactMatch.value;

    // 2. In MM-YYYY format (e.g. '07-2025')
    if (/^\d{2}-\d{4}$/.test(valStr)) {
      const [mm, yyyy] = valStr.split('-');
      const formatted = `${yyyy}-${mm}`;
      const match = months.find((o) => o.value === formatted);
      if (match) return match.value;
      return formatted;
    }

    // 3. Match month name prefix or label (e.g. val is 'July' or 'July 2025')
    const valLower = valStr.toLowerCase();
    const labelMatch = months.find((o) => o.label.toLowerCase() === valLower);
    if (labelMatch) return labelMatch.value;

    const monthNameMatch = months.find((o) => o.label.toLowerCase().startsWith(valLower));
    if (monthNameMatch) return monthNameMatch.value;
  }

  // Fallback: parse month name string directly
  if (!agriculturalYear) {
    agriculturalYear = getAgriculturalYear();
  }
  let cleanName = valStr.split(' ')[0].split('-')[0];
  const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(cleanName.toLowerCase()));
  if (monthIndex !== -1) {
    const yr = monthIndex >= 6 ? agriculturalYear.startYear : agriculturalYear.endYear;
    const mm = String(monthIndex + 1).padStart(2, '0');
    return `${yr}-${mm}`;
  }

  return '';
}

// Format month for API - convert monthName/value to YYYY-MM format
function formatMonthForApi(monthValue, agriculturalYear, agriYearMonths = []) {
  if (!monthValue) return null;
  const valStr = String(monthValue).trim();
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(valStr)) {
    return valStr;
  }
  const resolved = resolveMonthValue(valStr, agriYearMonths, agriculturalYear);
  if (resolved && /^\d{4}-\d{2}$/.test(resolved)) {
    return resolved;
  }
  return null;
}

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

/* ─────────────────────────── component ─────────────────────────── */

function TalukClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtId: routeDistrictId } = useParams();
  const location = useLocation();

  // Merge location.state with any saved sessionStorage state.
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, [location.state]);

  /* ── resolved district ID stored in a ref so it is always current ── */
  const resolvedDistrictId = useRef(null);
  const agriculturalYear = useRef(null);
  const agriYearMonths = useRef([]);

  const resolveDistrictId = () => {
    if (stateData.districtId) return stateData.districtId;
    if (stateData.districtOfficeId) return stateData.districtOfficeId;
    if (routeDistrictId && routeDistrictId !== 'direct' && !isNaN(routeDistrictId)) {
      return parseInt(routeDistrictId, 10);
    }
    return null;
  };

  if (resolvedDistrictId.current === null) {
    resolvedDistrictId.current = resolveDistrictId();
  }

  // Initialize agricultural year
  if (agriculturalYear.current === null) {
    agriculturalYear.current = stateData.agriculturalYear || getAgriculturalYear();
    if (agriculturalYear.current) {
      agriYearMonths.current = buildAgriYearMonths(
        agriculturalYear.current.startYear,
        agriculturalYear.current.endYear
      );
    }
  }

  // Helper to get active agriYear string
  const getAgriYearString = () => {
    return (
      agriculturalYear.current?.display ||
      stateData.agriYear ||
      stateData.agriculturalYear?.display ||
      AuthService.agriyear() ||
      localStorage.getItem('activeAgriYear') ||
      '2025-2026'
    );
  };

  /* ── filter state ── */
  const [seasonTab, setSeasonTab] = useState(stateData.seasonTab || 'ALL');
  const [landType, setLandType] = useState(stateData.landType || null);
  const [filterType, setFilterType] = useState(stateData.filterType || 'range');
  const [fromMonth, setFromMonth] = useState(() => {
    const raw = stateData.fromMonth || stateData.startMonth;
    return formatMonthForApi(raw, agriculturalYear.current, agriYearMonths.current) || agriYearMonths.current[0]?.value || '';
  });
  const [toMonth, setToMonth] = useState(() => {
    const raw = stateData.toMonth || stateData.endMonth;
    return formatMonthForApi(raw, agriculturalYear.current, agriYearMonths.current) || getDefaultMonth(agriYearMonths.current);
  });
  const [singleMonth, setSingleMonth] = useState(() => {
    const raw = stateData.singleMonth;
    const formatted = formatMonthForApi(raw, agriculturalYear.current, agriYearMonths.current);
    return formatted || getDefaultMonth(agriYearMonths.current);
  });

  /* ── ui state ── */
  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [taluksList, setTaluksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  /* ── persist district context to sessionStorage ── */
  useEffect(() => {
    if (resolvedDistrictId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName || '',
          landType: stateData.landType || null,
          seasonTab: stateData.seasonTab || 'ALL',
          filterType: stateData.filterType || 'range',
          fromMonth: fromMonth || '',
          toMonth: toMonth || '',
          singleMonth: singleMonth || getDefaultMonth(agriYearMonths.current),
          agriYear: getAgriYearString(),
          agriculturalYear: agriculturalYear.current
        })
      );
    }
  }, [fromMonth, toMonth, singleMonth, seasonTab, landType, filterType]);

  /* ─────────────────────────── fetch master taluks ─────────────────────────── */

  const fetchMasterTaluks = async (districtId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get(`${BASE_URL}/btr-service/btr-api/taluks?distId=${districtId}`);

      if (response.data && response.data.data) {
        setTaluksList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTaluksList(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          setTaluksList(possibleArrays[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching master taluks list:', err);
    }
  };

  /* ─────────────────────────── fetch taluk data ─────────────────────────── */

  const fetchTalukWiseData = async (overrides = {}) => {
    const districtIdValue = resolvedDistrictId.current;

    if (!districtIdValue) {
      setError('District ID is required. Please navigate from the district report page.');
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
    const activeAgriYear = overrides.agriYear || getAgriYearString();

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      const params = new URLSearchParams();
      params.append('districtId', districtIdValue);
      params.append('agriYear', activeAgriYear);

      if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
        params.append('landType', effectiveLandType.toLowerCase());
      }

      let startM = null;
      let endM = null;

      if (effectiveFilterType === 'single') {
        const fmt =
          formatMonthForApi(effectiveSingleMonth, agriculturalYear.current, agriYearMonths.current) ||
          getDefaultMonth(agriYearMonths.current);
        startM = fmt;
        endM = fmt;
        params.append('startMonth', fmt);
        params.append('endMonth', fmt);
      } else if (effectiveFilterType === 'range') {
        if (effectiveFromMonth) {
          startM = formatMonthForApi(effectiveFromMonth, agriculturalYear.current, agriYearMonths.current);
          if (startM) params.append('startMonth', startM);
        }
        if (effectiveToMonth) {
          endM = formatMonthForApi(effectiveToMonth, agriculturalYear.current, agriYearMonths.current);
          if (endM) params.append('endMonth', endM);
        }
      }

      if (!params.has('startMonth')) {
        const defM = getDefaultMonth(agriYearMonths.current);
        if (defM) {
          startM = defM;
          endM = defM;
          params.append('startMonth', defM);
          params.append('endMonth', defM);
        }
      }

      const url = `${BASE_URL}/btr-service/api/report/clusters/district/taluk-wise?${params.toString()}`;
      const response = await api.get(url);

      if (response.data) {
        setApiData(response.data);
      }

      // If range filter active, fetch single-month stats for the last month of range
      if (effectiveFilterType === 'range') {
        const lastM = endM || startM || getDefaultMonth(agriYearMonths.current);
        if (lastM) {
          const lmParams = new URLSearchParams();
          lmParams.append('districtId', districtIdValue);
          lmParams.append('agriYear', activeAgriYear);
          lmParams.append('startMonth', lastM);
          lmParams.append('endMonth', lastM);
          if (effectiveLandType && effectiveSeasonTab !== 'ALL') {
            lmParams.append('landType', effectiveLandType.toLowerCase());
          }
          const lmUrl = `${BASE_URL}/btr-service/api/report/clusters/district/taluk-wise?${lmParams.toString()}`;
          try {
            const lmResponse = await api.get(lmUrl);
            setLastMonthApiData(lmResponse.data);
          } catch (lmErr) {
            console.error('Error fetching last month taluk data:', lmErr);
            setLastMonthApiData(null);
          }
        } else {
          setLastMonthApiData(null);
        }
      } else {
        setLastMonthApiData(null);
      }
    } catch (err) {
      console.error('Error fetching taluk data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('District not found.');
      else setError(err.response?.data?.message || 'Failed to fetch taluk data');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    if (resolvedDistrictId.current) {
      fetchMasterTaluks(resolvedDistrictId.current);
      fetchTalukWiseData();
    }
  }, []);

  useEffect(() => {
    fetchTalukWiseData({ landType, seasonTab, filterType, singleMonth, fromMonth, toMonth });
  }, [landType, filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const getTalukStats = (details) => {
    if (!details) return { completed: 0, ongoing: 0, notStarted: 0, underReview: 0, totalCluster: 0, hasData: false };

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

  const talukData = useMemo(() => {
    if (!apiData?.allSubDetails) {
      if (taluksList && taluksList.length > 0) {
        return taluksList.map((taluk) => ({
          id: taluk.id || taluk.talukId,
          taluk: taluk.talukNameEn || taluk.name || taluk.talukName || `Taluk ${taluk.id}`,
          total: 0,
          totalCluster: 0,
          completed: 0,
          currentMonthCompleted: 0,
          ongoing: 0,
          notStarted: 0,
          underReview: 0,
          hasData: false
        }));
      }
      return [];
    }

    const subDetailsMap = apiData.allSubDetails || {};
    const lastMonthSubDetailsMap = (filterType === 'range' && lastMonthApiData) ? (lastMonthApiData.allSubDetails || {}) : null;
    const normalizeName = (name) => (name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '') : '');

    const getLastMonthCompleted = (talukId, talukName) => {
      if (!lastMonthSubDetailsMap) return 0;
      const matchedKey = Object.keys(lastMonthSubDetailsMap).find((key) => {
        const details = lastMonthSubDetailsMap[key];
        return (
          (details && (details.id === talukId || details.talukId === talukId)) ||
          normalizeName(key) === normalizeName(talukName)
        );
      });
      if (matchedKey && lastMonthSubDetailsMap[matchedKey]) {
        const stats = getTalukStats(lastMonthSubDetailsMap[matchedKey]);
        return stats.completed;
      }
      return 0;
    };

    if (taluksList && taluksList.length > 0) {
      return taluksList.map((taluk) => {
        const talukId = taluk.id || taluk.talukId;
        const talukName = taluk.talukNameEn || taluk.name || taluk.talukName || `Taluk ${talukId}`;

        const matchedKey = Object.keys(subDetailsMap).find((key) => {
          const details = subDetailsMap[key];
          return (
            (details && (details.id === talukId || details.talukId === talukId)) ||
            normalizeName(key) === normalizeName(talukName)
          );
        });

        const currentMonthCompleted = getLastMonthCompleted(talukId, talukName);

        if (matchedKey && subDetailsMap[matchedKey]) {
          const details = subDetailsMap[matchedKey];
          const stats = getTalukStats(details);
          return {
            id: talukId,
            taluk: talukName,
            total: stats.totalCluster,
            totalCluster: stats.totalCluster,
            completed: stats.completed,
            currentMonthCompleted,
            ongoing: stats.ongoing,
            notStarted: stats.notStarted,
            underReview: stats.underReview,
            hasData: stats.hasData
          };
        } else {
          return {
            id: talukId,
            taluk: talukName,
            total: 0,
            totalCluster: 0,
            completed: 0,
            currentMonthCompleted: 0,
            ongoing: 0,
            notStarted: 0,
            underReview: 0,
            hasData: false
          };
        }
      });
    }

    return Object.entries(subDetailsMap).map(([talukName, details]) => {
      const stats = getTalukStats(details);
      const currentMonthCompleted = getLastMonthCompleted(details.id || details.talukId, talukName);
      return {
        id: details.id || details.talukId,
        taluk: talukName,
        total: stats.totalCluster,
        totalCluster: stats.totalCluster,
        completed: stats.completed,
        currentMonthCompleted,
        ongoing: stats.ongoing,
        notStarted: stats.notStarted,
        underReview: stats.underReview,
        hasData: stats.hasData
      };
    });
  }, [apiData, lastMonthApiData, taluksList, landType, filterType]);

  const stats = useMemo(() => {
    const calculatedTotal = talukData.reduce((sum, r) => sum + r.total, 0);
    const overallTotal = (apiData?.totalCluster !== undefined && apiData?.totalCluster !== null)
      ? Number(apiData.totalCluster)
      : calculatedTotal;

    return {
      total: overallTotal,
      completed: talukData.reduce((sum, r) => sum + r.completed, 0),
      currentMonthCompleted: talukData.reduce((sum, r) => sum + (r.currentMonthCompleted || 0), 0),
      ongoing: talukData.reduce((sum, r) => sum + r.ongoing, 0),
      notStarted: talukData.reduce((sum, r) => sum + r.notStarted, 0),
      underReview: talukData.reduce((sum, r) => sum + r.underReview, 0),
      taluksWithData: talukData.filter(r => r.hasData).length,
      taluksWithoutData: talukData.filter(r => !r.hasData).length
    };
  }, [talukData, apiData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return talukData;
    return talukData.filter((r) => r.taluk.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [talukData, searchTerm]);

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
      const defaultMonth = getDefaultMonth(agriYearMonths.current);
      setSingleMonth(defaultMonth);
      setFromMonth('');
      setToMonth('');
    } else {
      const defaultMonth = getDefaultMonth(agriYearMonths.current);
      setFromMonth(agriYearMonths.current[0]?.value || '');
      setToMonth(defaultMonth);
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
    const defaultMonth = getDefaultMonth(agriYearMonths.current);
    setSingleMonth(defaultMonth);
    setFromMonth(agriYearMonths.current[0]?.value || '');
    setToMonth(defaultMonth);
    setSeasonTab('ALL');
    setLandType(null);
    setFilterType('range');
    setPage(0);
    setSearchTerm('');
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

  const displayDistrictName =
    stateData.districtName ||
    (apiData && Object.keys(apiData.allSubDetails || {})[0]?.replace(/[^a-zA-Z\s]/g, '')) ||
    'District';

  const handleViewTalukDetails = (talukName, talukId) => {
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const districtName = (stateData.districtName || displayDistrictName).toLowerCase().replace(/\s+/g, '-');
    const startMonthParam = filterType === 'single' ? singleMonth : fromMonth;
    const endMonthParam = filterType === 'single' ? singleMonth : toMonth;
    const activeAgriYear = getAgriYearString();

    navigate(
      `/Report/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName}/${formattedTalukName}-${talukId}`,
      {
        state: {
          talukId,
          talukName,
          districtId: resolvedDistrictId.current,
          districtName: displayDistrictName,
          landType,
          seasonTab,
          startMonth: startMonthParam,
          endMonth: endMonthParam,
          filterType,
          fromMonth,
          toMonth,
          singleMonth,
          agriYear: activeAgriYear,
          agriculturalYear: agriculturalYear.current
        }
      }
    );
  };

  /* ─────────────────────────── excel export ─────────────────────────── */

  // Build a meaningful filename from the active filters
  const generateExcelFileName = () => {
    const parts = ['Taluk_Cluster_Report', displayDistrictName.replace(/\s+/g, '_')];

    if (seasonTab !== 'ALL') parts.push(`${seasonTab}_Land`);

    if (filterType === 'single' && singleMonth) {
      parts.push(getMonthLabel(singleMonth, agriYearMonths.current).replace(/\s+/g, '_'));
    } else if (filterType === 'range') {
      if (fromMonth) parts.push(getMonthLabel(fromMonth, agriYearMonths.current).replace(/\s+/g, '_'));
      if (toMonth) parts.push('to', getMonthLabel(toMonth, agriYearMonths.current).replace(/\s+/g, '_'));
    }

    const yearStr = getAgriYearString();
    if (yearStr) parts.push(yearStr);
    if (searchTerm.trim()) parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    parts.push(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    return `${parts.join('_')}.xlsx`;
  };

  // Export the search-filtered dataset to Excel with rich header metadata
  const handleExportExcel = () => {
    if (!searchFilteredData || searchFilteredData.length === 0) return;

    const periodStr =
      filterType === 'range'
        ? `${fromMonth ? getMonthLabel(fromMonth, agriYearMonths.current) : 'Start'} – ${toMonth ? getMonthLabel(toMonth, agriYearMonths.current) : 'End'}`
        : getMonthLabel(singleMonth, agriYearMonths.current);

    const headerMeta = [
      [`District Cluster Progress Report — ${displayDistrictName} District`],
      ['Agricultural Year', getAgriYearString()],
      ['Land Type / Season', seasonTab === 'ALL' ? 'All' : `${seasonTab} Land`],
      ['Period', periodStr || '—'],
      ['Exported On', new Date().toLocaleString()],
      []
    ];

    const headerRow =
      filterType === 'range'
        ? ['#', 'Taluk', 'Total', 'During the Month', 'Up to the Month', 'Ongoing', 'Not Started', 'Under Review']
        : ['#', 'Taluk', 'Total', 'During the Month', 'Ongoing', 'Not Started', 'Under Review'];

    let serial = 0;
    const dataRows = searchFilteredData.map((row) => {
      serial += 1;
      if (!row.hasData) {
        return filterType === 'range'
          ? [serial, row.taluk, 'NA', 'NA', 'NA', 'NA', 'NA', 'NA']
          : [serial, row.taluk, 'NA', 'NA', 'NA', 'NA', 'NA'];
      }
      return filterType === 'range'
        ? [serial, row.taluk, row.total, row.currentMonthCompleted, row.completed, row.ongoing, row.notStarted, row.underReview]
        : [serial, row.taluk, row.total, row.completed, row.ongoing, row.notStarted, row.underReview];
    });

    const totalsRow =
      filterType === 'range'
        ? ['', 'GRAND TOTAL', stats.total, stats.currentMonthCompleted, stats.completed, stats.ongoing, stats.notStarted, stats.underReview]
        : ['', 'GRAND TOTAL', stats.total, stats.completed, stats.ongoing, stats.notStarted, stats.underReview];

    const aoa = [...headerMeta, headerRow, ...dataRows, totalsRow];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    worksheet['!cols'] =
      filterType === 'range'
        ? [{ wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }]
        : [{ wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];

    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');
    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const tableHeaders = useMemo(() => {
    if (filterType === 'range') {
      return [
        { key: 'slno', label: '#', align: 'center', width: 60 },
        { key: 'taluk', label: 'Taluk', align: 'left', minWidth: 200, sticky: true },
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
      { key: 'taluk', label: 'Taluk', align: 'left', minWidth: 200, sticky: true },
      { key: 'total', label: 'Total', align: 'center' },
      { key: 'duringMonth', label: 'During the Month', align: 'center' },
      { key: 'ongoing', label: 'Ongoing', align: 'center' },
      { key: 'notStarted', label: 'Not Started', align: 'center' },
      { key: 'underReview', label: 'Under Review', align: 'center' },
      { key: 'actions', label: 'Actions', align: 'center', width: 80 }
    ];
  }, [filterType]);

  const kpiItems = useMemo(() => {
    const items = [
      { label: 'Taluks', value: formatNumber(talukData.length), icon: <LocationOnIcon />, color: '#1565c0' },
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
  }, [talukData.length, stats, filterType]);

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
                District Cluster Progress Report: {displayDistrictName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {displayDistrictName} District • Agricultural Year {getAgriYearString()} • Taluk-wise Cluster Progress Details
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
            {filterType === 'single' && singleMonth && (
              <Chip
                icon={<CalendarMonthIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={getMonthLabel(singleMonth, agriYearMonths.current)}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
            {filterType === 'range' && fromMonth && toMonth && (
              <Chip
                icon={<CalendarMonthIcon sx={{ fontSize: 16, color: '#fff !important' }} />}
                label={`${getMonthLabel(fromMonth, agriYearMonths.current)} – ${getMonthLabel(toMonth, agriYearMonths.current)}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            )}
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
                      {agriYearMonths.current.map((m) => (
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
                      {agriYearMonths.current.map((m) => (
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
                      {agriYearMonths.current.map((m) => (
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
                (filterType === 'single' && singleMonth !== getDefaultMonth(agriYearMonths.current)) ||
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

            {stats.taluksWithoutData > 0 && !loading && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label={`${stats.taluksWithoutData} taluk${stats.taluksWithoutData > 1 ? 's' : ''} with no data`}
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
              placeholder="Search taluk..."
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
                      {tableHeaders.map((h) => {
                        const isTaluk = h.sticky;
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
                              width: h.width,
                              minWidth: h.minWidth,
                              ...(isTaluk && {
                                position: 'sticky',
                                left: 0,
                                zIndex: 6,
                                backgroundColor: themeColor
                              })
                            }}
                          >
                            {h.label}
                          </TableCell>
                        );
                      })}
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
                                Loading Taluk Cluster Progress Report...
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
                            {searchTerm ? `No taluks found matching "${searchTerm}"` : 'No data available'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginatedData.map((row, index) => {
                          const serialNumber = page * rowsPerPage + index + 1;
                          const clickable = row.hasData;

                          return (
                            <TableRow
                              key={row.id ?? `row-${index}`}
                              hover={clickable}
                              onClick={() => clickable && handleViewTalukDetails(row.taluk, row.id)}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                backgroundColor: !row.hasData
                                  ? alpha('#ff9800', 0.03)
                                  : index % 2 === 1
                                    ? alpha(themeColor, 0.015)
                                    : 'transparent',
                                '&:hover': clickable
                                  ? { backgroundColor: alpha(themeColor, 0.08), transition: '0.2s' }
                                  : undefined
                              }}
                            >
                              {/* Serial Number */}
                              <TableCell align="center">
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  {serialNumber}
                                </Typography>
                              </TableCell>

                              {/* Taluk Name (Sticky) */}
                              <TableCell
                                align="left"
                                sx={{
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 1,
                                  backgroundColor: !row.hasData
                                    ? '#fffaf2'
                                    : index % 2 === 1
                                      ? '#f8fafc'
                                      : theme.palette.background.paper
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <LocationOnIcon
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
                                    {row.taluk}
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
                              </TableCell>

                              {/* Total */}
                              <TableCell align="center">
                                {!row.hasData ? (
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
                                      bgcolor: alpha(themeColor, 0.1),
                                      color: themeColor
                                    }}
                                  />
                                )}
                              </TableCell>

                              {/* During Month (for range) */}
                              {filterType === 'range' && (
                                <TableCell align="center">
                                  {!row.hasData ? (
                                    <Typography variant="body2" color="text.secondary">
                                      NA
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

                              {/* Up to Month / During Month */}
                              <TableCell align="center">
                                {!row.hasData ? (
                                  <Typography variant="body2" color="text.secondary">
                                    NA
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
                                {!row.hasData ? (
                                  <Typography variant="body2" color="text.secondary">
                                    NA
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
                                {!row.hasData ? (
                                  <Typography variant="body2" color="text.secondary">
                                    NA
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
                                {!row.hasData ? (
                                  <Typography variant="body2" color="text.secondary">
                                    NA
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
                                <Tooltip
                                  title={!row.hasData ? 'No data available for this taluk' : 'View Zone Details'}
                                >
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewTalukDetails(row.taluk, row.id)}
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
                              </TableCell>
                            </TableRow>
                          );
                        })}

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
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor }}>
                            —
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 2,
                              backgroundColor: '#eef1f7',
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

export default TalukClusterReport;
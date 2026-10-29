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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
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
import CancelIcon from '@mui/icons-material/Cancel';
import HubIcon from '@mui/icons-material/Hub';
import GrassIcon from '@mui/icons-material/Grass';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import api from 'api/api';

// Gateway root (e.g. http://localhost:8080). The '/earas-form1-entry' service
// prefix is added on the request path below.
// NOTE: if mainapi.FORM_API already ends in '/earas-form1-entry',
// drop the duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'talukForm5ReportState';

/* ─────────────────────────── helpers ─────────────────────────── */

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function buildAgriMonthOptions() {
  const agriYear =
    (AuthService && AuthService.agriyear ? AuthService.agriyear() : null) ||
    localStorage.getItem('activeAgriYear') ||
    '2025-2026';

  const startYear = parseInt(String(agriYear).split('-')[0], 10) || new Date().getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const options = [];

  for (let i = 0; i < 12; i += 1) {
    const monthIndex = (6 + i) % 12;
    const year = startYear + Math.floor((6 + i) / 12);
    const mm = String(monthIndex + 1).padStart(2, '0');

    options.push({
      label: `${monthNames[monthIndex]} ${year}`,
      value: `${mm}-${year}`
    });
  }

  return options;
}

function monthNum(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts[0].length === 4) return parseInt(parts[1], 10);
    if (parts[1].length === 4) return parseInt(parts[0], 10);
    return parseInt(parts[0], 10);
  }
  const num = parseInt(str, 10);
  return Number.isNaN(num) ? null : num;
}

function resolveMonthValue(value, monthOptions) {
  if (!monthOptions?.length) return '';
  if (!value) return monthOptions[0]?.value || '';

  const exactMatch = monthOptions.find((option) => option.value === value);
  if (exactMatch) return exactMatch.value;

  const normalized = String(value).toLowerCase();

  const labelMatch = monthOptions.find((option) => option.label.toLowerCase() === normalized);
  if (labelMatch) return labelMatch.value;

  const monthNameMatch = monthOptions.find((option) =>
    option.label.toLowerCase().startsWith(normalized)
  );
  if (monthNameMatch) return monthNameMatch.value;

  if (String(value).includes('-')) {
    const num = monthNum(value);
    if (num) {
      const numMatch = monthOptions.find((opt) => monthNum(opt.value) === num);
      if (numMatch) return numMatch.value;
    }
  }

  return monthOptions[0]?.value || '';
}

function getCurrentMonthValue(monthOptions) {
  if (!monthOptions?.length) return '';

  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const currentValue = `${mm}-${yyyy}`;

  return (
    monthOptions.find((option) => option.value === currentValue)?.value ||
    monthOptions.find((option) => monthNum(option.value) === now.getMonth() + 1)?.value ||
    monthOptions[monthOptions.length - 1]?.value ||
    monthOptions[0]?.value ||
    ''
  );
}

// Fallback taluks for a district
function getFallbackTaluks(districtId) {
  const taluksByDistrict = {
    1: ['Thiruvananthapuran', 'Neyyattinkara', 'Nedumangad', 'Chirayinkeezhu'],
    2: ['Kollam', 'Karunagappally', 'Kottarakkara', 'Pathanapuram', 'Punalur'],
    3: ['Pathanamthitta', 'Kozhencherry', 'Ranni', 'Mallappally', 'Thiruvalla', 'Adoor'],
    4: ['Alappuzha', 'Chengannur', 'Mavelikkara', 'Kuttanad', 'Ambalappuzha'],
    5: ['Kottayam', 'Changanassery', 'Meenachil', 'Vaikom', 'Kanjirappally'],
    6: ['Idukki', 'Udumbanchola', 'Thodupuzha', 'Peermade', 'Devikulam'],
    7: ['Ernakulam', 'Aluva', 'Kothamangalam', 'Muvattupuzha', 'Kochi', 'Paravur', 'Kanayannur'],
    8: ['Thrissur', 'Chalakudy', 'Kodungallur', 'Mukundapuram', 'Talappilly', 'Irungattukottai'],
    9: ['Palakkad', 'Palakkad', 'Alathur', 'Chittur', 'Mannarkkad', 'Ottapalam'],
    10: ['Malappuram', 'Eranad', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Nilambur', 'Kondotty'],
    11: ['Kozhikode', 'Vadakara', 'Quilandy', 'Thamarassery', 'Koyilandy'],
    12: ['Wayanad', 'Mananthavady', 'Sulthan Bathery', 'Vythiri'],
    13: ['Kannur', 'Kannur', 'Thalassery', 'Payyanur', 'Iritty', 'Taliparamba'],
    14: ['Kasaragod', 'Kasaragod', 'Hosdurg', 'Vellarikundu']
  };

  const districtTaluks = taluksByDistrict[districtId] || [];
  return districtTaluks.map((name, index) => ({
    id: index + 1,
    talukName: name,
    talukNameEn: name
  }));
}

/* ─────────────────────────── component ─────────────────────────── */

function TalukForm5Report() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtId: routeDistrictId } = useParams();
  const location = useLocation();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedDistrictId = useRef(null);

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

  // Agricultural year from AuthService (e.g. '2025-2026'), and its month options.
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';
  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = getCurrentMonthValue(monthOptions);
  const monthLabel = (value) => monthOptions.find((m) => m.value === value)?.label || '';

  const [cropName, setCropName] = useState(stateData.cropName || 'ALL');
  const [cropOptions, setCropOptions] = useState([]);

  // Month filter states
  const [filterType, setFilterType] = useState(stateData.filterType || 'range');
  const [singleMonth, setSingleMonth] = useState(
    stateData.singleMonth ? resolveMonthValue(stateData.singleMonth, monthOptions) : defaultSingleMonth
  );
  const [fromMonth, setFromMonth] = useState(
    stateData.fromMonth || stateData.startMonth
      ? resolveMonthValue(stateData.fromMonth || stateData.startMonth, monthOptions)
      : defaultFromMonth
  );
  const [toMonth, setToMonth] = useState(
    stateData.toMonth || stateData.endMonth
      ? resolveMonthValue(stateData.toMonth || stateData.endMonth, monthOptions)
      : defaultToMonth
  );

  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [taluksList, setTaluksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterTaluksLoading, setMasterTaluksLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    if (resolvedDistrictId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName || '',
          cropName: stateData.cropName || 'ALL',
          agriculturalYear: stateData.agriculturalYear || '2025-2026',
          filterType,
          singleMonth,
          fromMonth,
          toMonth
        })
      );
    }
  }, [filterType, singleMonth, fromMonth, toMonth]);

  /* ─────────────────────────── fetch master taluks ─────────────────────────── */

  const fetchMasterTaluks = async (districtId) => {
    setMasterTaluksLoading(true);
    try {
      // Try multiple possible endpoints
      let response = null;

      // Try 1: BTR API endpoint
      try {
        response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/taluks?distId=${districtId}`);
        console.log('Master Taluks Response (attempt 1):', response.data);
      } catch (err) {
        console.log('Attempt 1 failed, trying alternative endpoint...');
      }

      // Try 2: Form API endpoint
      if (!response || !response.data) {
        try {
          response = await api.get(`${BASE_URL}/earas-form1-entry/api/taluks?districtId=${districtId}`);
          console.log('Master Taluks Response (attempt 2):', response.data);
        } catch (err) {
          console.log('Attempt 2 failed, trying alternative endpoint...');
        }
      }

      // Process response
      if (response && response.data) {
        let taluks = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          taluks = response.data.data;
        } else if (Array.isArray(response.data)) {
          taluks = response.data;
        } else if (response.data.taluks && Array.isArray(response.data.taluks)) {
          taluks = response.data.taluks;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          taluks = response.data.content;
        }

        if (taluks.length > 0) {
          console.log('Setting taluks list:', taluks);
          setTaluksList(taluks);
        } else {
          console.warn('No taluks found in response, using fallback');
          setTaluksList(getFallbackTaluks(districtId));
        }
      } else {
        console.warn('No response data received, using fallback');
        setTaluksList(getFallbackTaluks(districtId));
      }
    } catch (err) {
      console.error('Error fetching master taluks list:', err);
      setTaluksList(getFallbackTaluks(districtId));
    } finally {
      setMasterTaluksLoading(false);
    }
  };

  /* ─────────────────────────── fetch ─────────────────────────── */

  const fetchTalukWiseData = async () => {
    const districtIdValue = resolvedDistrictId.current;

    if (!districtIdValue) {
      setError('District ID is required. Please navigate from the district report page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      let url = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary`;
      const params = new URLSearchParams();

      // agriYear (mandatory) — e.g. '2025-2026'
      params.append('agriYear', agriculturalYear);

      // Month filters — API expects a numeric month (1–12). startMonth is mandatory.
      if (filterType === 'single') {
        const start = monthNum(singleMonth) || monthNum(defaultSingleMonth);
        params.append('startMonth', start);
        params.append('endMonth', start);
      } else {
        const start = monthNum(fromMonth) || monthNum(defaultFromMonth);
        const end = monthNum(toMonth) || monthNum(defaultToMonth);
        params.append('startMonth', start);
        if (end) params.append('endMonth', end);
      }

      // District drill-down → backend returns the taluks for this district.
      params.append('districtId', districtIdValue);

      // Crop filter — backend now accepts cropId
      if (cropName !== 'ALL') {
        const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
        if (selectedCrop) params.append('cropId', selectedCrop.cropId);
      }

      url += `?${params.toString()}`;
      console.log('Fetching taluk Form 5 data from:', url);

      const mainRequest = axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let lastMonthRequest = Promise.resolve(null);
      if (filterType === 'range') {
        const lastMonth = monthNum(toMonth) || monthNum(fromMonth) || monthNum(defaultToMonth);
        if (lastMonth) {
          const lmParams = new URLSearchParams();
          lmParams.append('agriYear', agriculturalYear);
          lmParams.append('startMonth', lastMonth);
          lmParams.append('endMonth', lastMonth);
          lmParams.append('districtId', districtIdValue);

          if (cropName !== 'ALL') {
            const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
            if (selectedCrop) lmParams.append('cropId', selectedCrop.cropId);
          }

          const lmUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary?${lmParams.toString()}`;
          console.log('Fetching last month taluk Form 5 data from:', lmUrl);
          lastMonthRequest = axios.get(lmUrl, {
            headers: { Authorization: `Bearer ${token}` }
          }).then((res) => res.data).catch((err) => {
            console.error('Error fetching last month taluk Form 5 data:', err);
            return null;
          });
        }
      }

      const [response, lmData] = await Promise.all([mainRequest, lastMonthRequest]);

      if (response.data) {
        setApiData(response.data);

        if (cropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
      setLastMonthApiData(lmData);
    } catch (err) {
      console.error('Error fetching taluk Form 5 data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('District not found.');
      else setError(err.response?.data?.message || err.message || 'Failed to fetch taluk data');
    } finally {
      setLoading(false);
    }
  };

  // Index of selected fromMonth in monthOptions
  const fromMonthIndex = useMemo(
    () => monthOptions.findIndex((option) => option.value === fromMonth),
    [fromMonth, monthOptions]
  );

  const handleFromMonthChange = (event) => {
    const nextFromMonth = event.target.value;
    setFromMonth(nextFromMonth);
    setPage(0);

    const nextFromIndex = monthOptions.findIndex(
      (option) => option.value === nextFromMonth
    );
    const currentToIndex = monthOptions.findIndex(
      (option) => option.value === toMonth
    );

    if (nextFromIndex > currentToIndex) {
      setToMonth(nextFromMonth);
    }
  };

  // Fetch crop list for the dropdown filter
const fetchCropsList = async () => {
  try {
    const response = await api.get(
      `${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-logs?agriYear=${agriculturalYear}`
    );
    if (response.data && Array.isArray(response.data)) {
      setCropOptions(response.data); // { cropId, cropName, ... } objects
    }
  } catch (err) {
    console.error('Error fetching crops list:', err);
  }
};

  /* ─────────────────────────── effects ─────────────────────────── */

  // Fetch master taluks on mount
  useEffect(() => {
    if (resolvedDistrictId.current) {
      fetchMasterTaluks(resolvedDistrictId.current);
    }
    fetchCropsList();
  }, []);

  // Fetch data when month filters change.
  useEffect(() => {
    fetchTalukWiseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, singleMonth, fromMonth, toMonth, cropName]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const talukData = useMemo(() => {
    const apiTaluks = apiData?.taluks || [];
    const lastMonthTaluks = (filterType === 'range' && lastMonthApiData?.taluks) || [];

    const apiDataMap = {};
    apiTaluks.forEach((t) => {
      const key = t.talukName?.toLowerCase().trim() || '';
      apiDataMap[key] = t;
    });

    const lastMonthDataMap = {};
    lastMonthTaluks.forEach((t) => {
      const key = t.talukName?.toLowerCase().trim() || '';
      lastMonthDataMap[key] = t;
    });

    const getLastMonthTaluk = (tId, tName) => {
      if (!lastMonthTaluks.length) return null;
      if (tId) {
        const byId = lastMonthTaluks.find((t) => String(t.talukId) === String(tId));
        if (byId) return byId;
      }
      const norm = (tName || '').toLowerCase().trim();
      if (norm && lastMonthDataMap[norm]) {
        return lastMonthDataMap[norm];
      }
      return null;
    };

    if (taluksList && taluksList.length > 0) {
      const merged = taluksList.map((taluk) => {
        const talukName = taluk.talukName || taluk.talukNameEn || taluk.name || '';
        const tData = apiDataMap[talukName.toLowerCase().trim()] || {};
        const talukId = taluk.id || taluk.talukId || tData.talukId || `taluk_${Math.random()}`;
        const lmTaluk = getLastMonthTaluk(talukId, talukName);
        const currentMonthCompleted = lmTaluk?.completed || 0;

        const hasData = (tData.allowedCCECrops || 0) > 0 ||
          (tData.selectedCce || 0) > 0 ||
          (tData.completed || 0) > 0 ||
          currentMonthCompleted > 0 ||
          (tData.ongoing || 0) > 0 ||
          (tData.notAvailable || 0) > 0 ||
          (tData.notStarted || 0) > 0 ||
          (tData.underReview || 0) > 0;

        return {
          id: talukId,
          taluk: talukName || 'Unknown Taluk',
          allowtedCce: tData.allowedCCECrops || 0,
          selectedCce: tData.selectedCce || 0,
          currentMonthCompleted: currentMonthCompleted,
          completed: tData.completed || 0,
          ongoing: tData.ongoing || 0,
          notAvailable: tData.notAvailable || 0,
          notStarted: tData.notStarted || 0,
          underReview: tData.underReview || 0,
          hasData: hasData
        };
      });

      return merged;
    }

    return apiTaluks.map((t) => {
      const lmTaluk = getLastMonthTaluk(t.talukId, t.talukName);
      const currentMonthCompleted = lmTaluk?.completed || 0;

      return {
        id: t.talukId || `taluk_${Math.random()}`,
        taluk: t.talukName || 'Unknown Taluk',
        allowtedCce: t.allowedCCECrops || 0,
        selectedCce: t.selectedCce || 0,
        currentMonthCompleted: currentMonthCompleted,
        completed: t.completed || 0,
        ongoing: t.ongoing || 0,
        notAvailable: t.notAvailable || 0,
        notStarted: t.notStarted || 0,
        underReview: t.underReview || 0,
        hasData: (t.allowedCCECrops || 0) > 0 ||
          (t.selectedCce || 0) > 0 ||
          (t.completed || 0) > 0 ||
          currentMonthCompleted > 0 ||
          (t.ongoing || 0) > 0 ||
          (t.notAvailable || 0) > 0 ||
          (t.notStarted || 0) > 0 ||
          (t.underReview || 0) > 0
      };
    });
  }, [apiData, lastMonthApiData, taluksList, filterType]);

  // Count taluks with no data
  const taluksWithNoData = useMemo(() => {
    return talukData.filter((d) => !d.hasData).length;
  }, [talukData]);

  // Dynamic summary stats derived from taluk data
  const stats = useMemo(() => {
    const allowtedCceSum = talukData.reduce((sum, t) => sum + (t.allowtedCce || 0), 0);
    const selectedCceSum = talukData.reduce((sum, t) => sum + (t.selectedCce || 0), 0);
    const currentMonthCompletedSum = talukData.reduce((sum, t) => sum + (t.currentMonthCompleted || 0), 0);
    const completedSum = talukData.reduce((sum, t) => sum + (t.completed || 0), 0);
    const ongoingSum = talukData.reduce((sum, t) => sum + (t.ongoing || 0), 0);
    const notAvailableSum = talukData.reduce((sum, t) => sum + (t.notAvailable || 0), 0);
    const notStartedSum = talukData.reduce((sum, t) => sum + (t.notStarted || 0), 0);
    const underReviewSum = talukData.reduce((sum, t) => sum + (t.underReview || 0), 0);

    return {
      allowtedCce: allowtedCceSum > 0 ? allowtedCceSum : (apiData?.allowedCCECrops || 0),
      selectedCce: selectedCceSum > 0 ? selectedCceSum : (apiData?.selectedCce || 0),
      currentMonthCompleted: currentMonthCompletedSum,
      completed: completedSum,
      ongoing: ongoingSum,
      notAvailable: notAvailableSum,
      notStarted: notStartedSum,
      underReview: underReviewSum
    };
  }, [apiData, talukData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return talukData;
    return talukData.filter((r) => r.taluk.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [talukData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return searchFilteredData.slice(start, start + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleCropNameChange = (event) => {
    setCropName(event.target.value);
    setPage(0);
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue === null) return;
    setFilterType(newValue);
    if (newValue === 'single') {
      setSingleMonth(singleMonth || defaultSingleMonth);
    } else {
      setFromMonth(fromMonth || defaultFromMonth);
      setToMonth(toMonth || defaultToMonth);
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setCropName('ALL');
    setFilterType('range');
    setFromMonth(defaultFromMonth);
    setToMonth(defaultToMonth);
    setSingleMonth(defaultSingleMonth);
    setPage(0);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Build a meaningful filename from the active filters
  const generateExcelFileName = () => {
    const parts = ['CCE_Taluk_Report', displayDistrictName.replace(/\s+/g, '_')];

    if (cropName !== 'ALL') parts.push(cropName.replace(/\s+/g, '_'));

    if (filterType === 'single' && singleMonth) {
      parts.push(monthLabel(singleMonth).replace(/\s+/g, '_'));
    } else if (filterType === 'range') {
      if (fromMonth) parts.push(monthLabel(fromMonth).replace(/\s+/g, '_'));
      if (toMonth) parts.push('to', monthLabel(toMonth).replace(/\s+/g, '_'));
    }

    if (searchTerm.trim()) {
      parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    }

    parts.push(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    return `${parts.join('_')}.xlsx`;
  };

  // Export the FULL search-filtered dataset (not just the current page) to Excel
  const handleExportExcel = () => {
    if (!searchFilteredData || searchFilteredData.length === 0) return;

    const exportRows = searchFilteredData.map((row, index) => {
      const rowObj = {
        '#': index + 1,
        Taluk: row.taluk,
        'Allowted CCE': row.hasData ? row.allowtedCce : 'NA',
        'Selected CCE': row.hasData ? row.selectedCce : 'NA'
      };

      if (filterType === 'range') {
        rowObj['During the Month'] = row.hasData ? row.currentMonthCompleted : 'NA';
        rowObj['Up to the Month'] = row.hasData ? row.completed : 'NA';
      } else {
        rowObj['Completed'] = row.hasData ? row.completed : 'NA';
      }

      rowObj['Ongoing'] = row.hasData ? row.ongoing : 'NA';
      rowObj['Not Available'] = row.hasData ? row.notAvailable : 'NA';
      rowObj['Not Started'] = row.hasData ? row.notStarted : 'NA';
      rowObj['Under Review'] = row.hasData ? row.underReview : 'NA';

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Reasonable column widths so it doesn't open looking cramped
    worksheet['!cols'] = filterType === 'range'
      ? [
          { wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
          { wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }
        ]
      : [
          { wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
          { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }
        ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const handleViewTalukDetails = (talukName, talukId, hasData) => {
    // Only navigate if taluk has data
    if (!hasData) return;

    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const districtName = stateData.districtName || 'district';

    navigate(
      `/kerala_form5_report/taluk_form5_report/zone_form5_report/${districtName}/${formattedTalukName}-${talukId}`,
      {
        state: {
          talukId,
          talukName,
          districtId: resolvedDistrictId.current,
          districtName: stateData.districtName,
          cropName: cropName !== 'ALL' ? cropName : null,
          agriculturalYear,
          filterType,
          singleMonth,
          fromMonth,
          toMonth,
          startMonth: filterType === 'single' ? singleMonth : fromMonth,
          endMonth: filterType === 'single' ? singleMonth : toMonth
        }
      }
    );
  };

  /* ─────────────────────────── sub-components ─────────────────────────── */

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card
      sx={{
        bgcolor: bgColor,
        borderRadius: 3,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  /* ─────────────────────────── display name ─────────────────────────── */

  const displayDistrictName = stateData.districtName || 'District';

  // Table headers based on filter type
  const tableHeaders = useMemo(() => {
    if (filterType === 'range') {
      return [
        '#',
        'Taluk',
        'Allowted CCE',
        'Selected CCE',
        'During the Month',
        'Up to the Month',
        'Ongoing',
        'Not Available',
        'Not Started',
        'Under Review',
        'Actions'
      ];
    }
    return [
      '#',
      'Taluk',
      'Allowted CCE',
      'Selected CCE',
      'Completed',
      'Ongoing',
      'Not Available',
      'Not Started',
      'Under Review',
      'Actions'
    ];
  }, [filterType]);

  // Stat cards configuration
  const statCards = [
    { label: 'Allowted CCE', value: stats.allowtedCce, color: '#1565c0', icon: <HubIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
    { label: 'Selected CCE', value: stats.selectedCce, color: '#04255e', icon: <AssessmentIcon sx={{ fontSize: 32, color: '#04255e', opacity: 0.7 }} /> },
    ...(filterType === 'range'
      ? [
          {
            label: 'During the Month',
            value: stats.currentMonthCompleted,
            color: '#0288d1',
            icon: <CalendarMonthIcon sx={{ fontSize: 32, color: '#0288d1', opacity: 0.7 }} />
          }
        ]
      : []),
    {
      label: filterType === 'range' ? 'Up to the Month' : 'Completed',
      value: stats.completed,
      color: '#2e7d32',
      icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} />
    },
    { label: 'Ongoing', value: stats.ongoing, color: '#ed6c02', icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} /> },
    { label: 'Not Available', value: stats.notAvailable, color: '#c62828', icon: <CancelIcon sx={{ fontSize: 32, color: '#c62828', opacity: 0.7 }} /> },
    { label: 'Not Started', value: stats.notStarted, color: '#757575', icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} /> },
    { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} /> }
  ];

  /* ─────────────────────────── render ─────────────────────────── */

  if ((loading || masterTaluksLoading) && !apiData && taluksList.length === 0) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
        <Grid item>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading taluk data...</Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* Header */}
      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {displayDistrictName} – Taluk wise CCE Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`Agricultural Year: ${agriculturalYear}`}
                {filterType === 'single' && singleMonth && ` • ${monthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${monthLabel(fromMonth)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${monthLabel(toMonth)}`}
                {cropName !== 'ALL' && ` • Crop: ${cropName}`}
                {apiData?.allowedCCECrops != null && ` • Total Allowted CCE: ${apiData.allowedCCECrops}`}
                {taluksWithNoData > 0 && ` • ${taluksWithNoData} taluks with no data`}
              </Typography>
            </Box>
          </Stack>
          {(cropName !== 'ALL' || fromMonth || toMonth || (filterType === 'single' && singleMonth !== defaultSingleMonth)) && (
            <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />} size="small" sx={{ borderRadius: 2 }}>
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Error */}
      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Grid>
      )}

      {/* Info Banner for taluks with no data */}
      {taluksWithNoData > 0 && !loading && (
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
              <strong>{taluksWithNoData}</strong> taluk{taluksWithNoData > 1 ? 's' : ''} have no data available for the selected filters.
              <strong> View details is disabled for taluks without data.</strong>
            </Typography>
          </Paper>
        </Grid>
      )}

      {/* Filters - Crop Name (UI only for now) + month single / range */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <GrassIcon sx={{ color: '#2e7d32' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Filters
              </Typography>
            </Stack>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Crop Name</InputLabel>
              <Select value={cropName} label="Crop Name" onChange={handleCropNameChange}>
                <MenuItem value="ALL">ALL</MenuItem>
                {cropOptions.map((crop) => (
                  <MenuItem key={crop.cropId} value={crop.cropName}>
                    {crop.cropName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterTypeChange} size="small">
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
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>From Month</InputLabel>
                  <Select
                    value={fromMonth}
                    label="From Month"
                    onChange={handleFromMonthChange}
                  >
                    {monthOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>To Month</InputLabel>
                  <Select
                    value={toMonth}
                    label="To Month"
                    onChange={(e) => {
                      setToMonth(e.target.value);
                      setPage(0);
                    }}
                  >
                    {monthOptions.map((option, index) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        disabled={index < fromMonthIndex}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={singleMonth}
                  label="Select Month"
                  onChange={(e) => {
                    setSingleMonth(e.target.value);
                    setPage(0);
                  }}
                >
                  {monthOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            border: `1px solid ${alpha('#04255e', 0.15)}`,
            borderRadius: 3,
            p: 2,
            pt: 3,
            bgcolor: '#fff'
          }}
        >
          <Chip
            label={`${displayDistrictName} – District Report Summary`}
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              zIndex: 10,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1
            }}
          />
          <Grid container spacing={2}>
            {statCards.map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={4} lg key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Taluk Table */}
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
            label="Taluk Report Summary"
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
              placeholder="Search taluk..."
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
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
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
                  : `Export ${searchFilteredData.length} taluk${searchFilteredData.length > 1 ? 's' : ''} to Excel`
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
            title={`Taluks in ${displayDistrictName}`}
            sx={{ borderRadius: 3 }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {tableHeaders.map((label, idx) => (
                      <TableCell
                        key={idx}
                        align={idx === 0 ? 'center' : idx === 1 ? 'left' : 'center'}
                        sx={{ color: 'white', fontWeight: 600, py: 1.5, whiteSpace: 'nowrap' }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => {
                      const serialNumber = page * rowsPerPage + index + 1;
                      const hasNoData = !row.hasData;

                      return (
                        <TableRow
                          key={row.id || index}
                          hover
                          sx={{
                            '&:hover': { bgcolor: alpha('#04255e', 0.04) },
                            transition: '0.2s',
                            ...(hasNoData && {
                              bgcolor: alpha('#ff9800', 0.03),
                              '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
                            })
                          }}
                        >
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              {serialNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOnIcon sx={{ fontSize: 18, color: hasNoData ? '#ff9800' : '#04255e', opacity: 0.7 }} />
                              <Typography fontWeight={hasNoData ? 400 : 500} color={hasNoData ? 'text.secondary' : 'text.primary'}>
                                {row.taluk}
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
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : (
                              <Chip label={row.allowtedCce} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.selectedCce > 0 ? (
                              <Chip
                                label={row.selectedCce}
                                size="small"
                                variant="outlined"
                                sx={{ color: '#04255e', borderColor: alpha('#04255e', 0.4), fontWeight: 600 }}
                              />
                            ) : (
                              row.selectedCce
                            )}
                          </TableCell>
                          {filterType === 'range' && (
                            <TableCell align="center">
                              {hasNoData ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.currentMonthCompleted > 0 ? (
                                <Chip label={row.currentMonthCompleted} size="small" color="success" variant="outlined" />
                              ) : (
                                row.currentMonthCompleted
                              )}
                            </TableCell>
                          )}
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.completed > 0 ? (
                              <Chip label={row.completed} size="small" color="success" variant="outlined" />
                            ) : (
                              row.completed
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.ongoing > 0 ? (
                              <Chip label={row.ongoing} size="small" color="primary" variant="outlined" />
                            ) : (
                              row.ongoing
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.notAvailable > 0 ? (
                              <Chip label={row.notAvailable} size="small" color="error" variant="outlined" />
                            ) : (
                              row.notAvailable
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.notStarted > 0 ? (
                              <Chip label={row.notStarted} size="small" variant="outlined" />
                            ) : (
                              row.notStarted
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasNoData ? (
                              <Typography variant="body2" color="text.secondary">NA</Typography>
                            ) : row.underReview > 0 ? (
                              <Chip label={row.underReview} size="small" color="warning" variant="outlined" />
                            ) : (
                              row.underReview
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.hasData ? (
                              <Tooltip title="View Zone Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewTalukDetails(row.taluk, row.id, row.hasData)}
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
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? `No taluks found matching "${searchTerm}"` : 'No data available for selected filters'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {searchFilteredData.length > 0 && !loading && (
              <TablePagination
                component="div"
                count={searchFilteredData.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[15, 25, 50, 100]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default TalukForm5Report;
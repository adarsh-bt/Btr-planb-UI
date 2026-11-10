import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import GrassIcon from '@mui/icons-material/Grass';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PendingIcon from '@mui/icons-material/Pending';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CancelIcon from '@mui/icons-material/Cancel';

import axios from 'axios';
import api from 'api/api';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

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

function getFallbackTaluks(districtId) {
  const taluksByDistrict = {
    1: ['Thiruvananthapuram', 'Neyyattinkara', 'Nedumangad', 'Chirayinkeezhu'],
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

function MetricText({
  value,
  noData = false,
  color = 'text.primary',
  strong = false
}) {
  if (noData) {
    return (
      <Typography component="span" variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  const numericValue = Number(value || 0);

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        color: numericValue > 0 ? color : 'text.secondary',
        fontWeight: strong ? 700 : numericValue > 0 ? 600 : 400,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}
    >
      {numericValue.toLocaleString()}
    </Typography>
  );
}

function StatCard({ label, value, color, icon, badge, tooltip }) {
  const content = (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2,
        border: `1px solid ${alpha(color, 0.13)}`,
        bgcolor: alpha(color, 0.03),
        transition: 'all 0.18s ease-in-out',
        '&:hover': {
          bgcolor: alpha(color, 0.06),
          borderColor: alpha(color, 0.3),
          transform: 'translateY(-1px)',
          boxShadow: `0 2px 8px ${alpha(color, 0.08)}`
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.1, sm: 1.25 }, '&:last-child': { pb: { xs: 1.1, sm: 1.25 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} sx={{ mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.675rem',
              letterSpacing: '0.35px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {label}
          </Typography>

          <Box
            sx={{
              color,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.85,
              flexShrink: 0
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography
            variant="h5"
            sx={{
              color: color || 'text.primary',
              fontWeight: 750,
              lineHeight: 1.15,
              fontSize: { xs: '1.2rem', sm: '1.35rem' },
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {Number(value || 0).toLocaleString()}
          </Typography>

          {badge && (
            <Box
              component="span"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 750,
                color: color || 'success.dark',
                bgcolor: alpha(color || '#2e7d32', 0.12),
                px: 0.6,
                py: 0.1,
                borderRadius: 1,
                lineHeight: 1.2
              }}
            >
              {badge}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement="top" enterDelay={250}>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

function FilterLabel({ children }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}
    >
      {children}
    </Typography>
  );
}

function MobileMetric({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.2 }}>{children}</Box>
    </Box>
  );
}

/* ─────────────────────────── component ─────────────────────────── */

function TalukForm5Report() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';
  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = defaultToMonth;

  const monthLabel = useCallback(
    (value) => monthOptions.find((m) => m.value === value)?.label || value || '',
    [monthOptions]
  );

  const [cropName, setCropName] = useState(stateData.cropName || 'ALL');
  const [cropOptions, setCropOptions] = useState([]);

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
  const [exporting, setExporting] = useState(false);
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

  const fetchMasterTaluks = useCallback(async (districtId) => {
    setMasterTaluksLoading(true);
    try {
      let response = null;

      try {
        response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/taluks?distId=${districtId}`);
      } catch (err) {
        // try fallback endpoint
      }

      if (!response || !response.data) {
        try {
          response = await api.get(`${BASE_URL}/earas-form1-entry/api/taluks?districtId=${districtId}`);
        } catch (err) {
          // fallback
        }
      }

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
          setTaluksList(taluks);
        } else {
          setTaluksList(getFallbackTaluks(districtId));
        }
      } else {
        setTaluksList(getFallbackTaluks(districtId));
      }
    } catch (err) {
      console.error('Error fetching master taluks list:', err);
      setTaluksList(getFallbackTaluks(districtId));
    } finally {
      setMasterTaluksLoading(false);
    }
  }, []);

  /* ─────────────────────────── fetch ─────────────────────────── */

  const fetchTalukWiseData = useCallback(async () => {
    const districtIdValue = resolvedDistrictId.current;

    if (!districtIdValue) {
      setError('District ID is required. Please navigate from the district report page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = AuthService.gettoken ? AuthService.gettoken() : localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      let url = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary`;
      const params = new URLSearchParams();

      params.append('agriYear', agriculturalYear);

      if (filterType === 'single') {
        const start = monthNum(singleMonth) || monthNum(defaultSingleMonth);
        params.append('startMonth', String(start));
        params.append('endMonth', String(start));
      } else {
        const start = monthNum(fromMonth) || monthNum(defaultFromMonth);
        const end = monthNum(toMonth) || monthNum(defaultToMonth);
        params.append('startMonth', String(start));
        if (end) params.append('endMonth', String(end));
      }

      params.append('districtId', String(districtIdValue));

      if (cropName !== 'ALL') {
        const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
        if (selectedCrop?.cropId) params.append('cropId', String(selectedCrop.cropId));
      }

      url += `?${params.toString()}`;

      const mainRequest = axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let lastMonthRequest = Promise.resolve(null);
      if (filterType === 'range') {
        const lastMonth = monthNum(toMonth) || monthNum(fromMonth) || monthNum(defaultToMonth);
        if (lastMonth) {
          const lmParams = new URLSearchParams();
          lmParams.append('agriYear', agriculturalYear);
          lmParams.append('startMonth', String(lastMonth));
          lmParams.append('endMonth', String(lastMonth));
          lmParams.append('districtId', String(districtIdValue));

          if (cropName !== 'ALL') {
            const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
            if (selectedCrop?.cropId) lmParams.append('cropId', String(selectedCrop.cropId));
          }

          const lmUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary?${lmParams.toString()}`;
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
  }, [agriculturalYear, cropName, cropOptions, defaultFromMonth, defaultSingleMonth, defaultToMonth, filterType, fromMonth, singleMonth, toMonth]);

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

  const fetchCropsList = useCallback(async () => {
    try {
      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-logs?agriYear=${agriculturalYear}`
      );
      if (response.data && Array.isArray(response.data)) {
        setCropOptions(response.data);
      }
    } catch (err) {
      console.error('Error fetching crops list:', err);
    }
  }, [agriculturalYear]);

  useEffect(() => {
    if (resolvedDistrictId.current) {
      fetchMasterTaluks(resolvedDistrictId.current);
    }
    fetchCropsList();
  }, [fetchCropsList, fetchMasterTaluks]);

  useEffect(() => {
    fetchTalukWiseData();
  }, [fetchTalukWiseData]);

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
          (tData.missedCce || tData.missed || tData.missedCCE || 0) > 0 ||
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
          missedCce: tData.missedCce || tData.missed || tData.missedCCE || 0,
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
        missedCce: t.missedCce || t.missed || t.missedCCE || 0,
        notAvailable: t.notAvailable || 0,
        notStarted: t.notStarted || 0,
        underReview: t.underReview || 0,
        hasData: (t.allowedCCECrops || 0) > 0 ||
          (t.selectedCce || 0) > 0 ||
          (t.completed || 0) > 0 ||
          currentMonthCompleted > 0 ||
          (t.ongoing || 0) > 0 ||
          (t.missedCce || t.missed || t.missedCCE || 0) > 0 ||
          (t.notAvailable || 0) > 0 ||
          (t.notStarted || 0) > 0 ||
          (t.underReview || 0) > 0
      };
    });
  }, [apiData, lastMonthApiData, taluksList, filterType]);

  const taluksWithNoData = useMemo(() => {
    return talukData.filter((d) => !d.hasData).length;
  }, [talukData]);

  const stats = useMemo(() => {
    const allowtedCceSum = talukData.reduce((sum, t) => sum + (t.allowtedCce || 0), 0);
    const selectedCceSum = talukData.reduce((sum, t) => sum + (t.selectedCce || 0), 0);
    const currentMonthCompletedSum = talukData.reduce((sum, t) => sum + (t.currentMonthCompleted || 0), 0);
    const completedSum = talukData.reduce((sum, t) => sum + (t.completed || 0), 0);
    const ongoingSum = talukData.reduce((sum, t) => sum + (t.ongoing || 0), 0);
    const missedCceSum = talukData.reduce((sum, t) => sum + (t.missedCce || 0), 0);
    const notAvailableSum = talukData.reduce((sum, t) => sum + (t.notAvailable || 0), 0);
    const notStartedSum = talukData.reduce((sum, t) => sum + (t.notStarted || 0), 0);
    const underReviewSum = talukData.reduce((sum, t) => sum + (t.underReview || 0), 0);

    return {
      allowtedCce: allowtedCceSum > 0 ? allowtedCceSum : (apiData?.allowedCCECrops || 0),
      selectedCce: selectedCceSum > 0 ? selectedCceSum : (apiData?.selectedCce || 0),
      currentMonthCompleted: currentMonthCompletedSum,
      completed: completedSum,
      ongoing: ongoingSum,
      missedCce: missedCceSum > 0 ? missedCceSum : (apiData?.missedCce || apiData?.missed || apiData?.missedCCE || 0),
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

  const filtersAreDirty =
    cropName !== 'ALL' ||
    filterType !== 'range' ||
    fromMonth !== defaultFromMonth ||
    toMonth !== defaultToMonth ||
    singleMonth !== defaultSingleMonth ||
    Boolean(searchTerm);

  const displayDistrictName = stateData.districtName || 'District';

  const reportPeriodText =
    filterType === 'single'
      ? monthLabel(singleMonth)
      : `${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`;

  const endMonthText =
    monthLabel(
      filterType === 'single'
        ? singleMonth
        : toMonth
    );

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

    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.xlsx`;
  };

  const handleExportExcel = async () => {
    if (!searchFilteredData || searchFilteredData.length === 0 || exporting) return;

    setExporting(true);

    try {
      const XLSX = await import('xlsx');

      const exportRows = searchFilteredData.map((row, index) => {
        const rowObj = {
          '#': index + 1,
          Taluk: row.taluk,
          'Allowed CCE': row.hasData ? row.allowtedCce : 'NA',
          'Selected CCE': row.hasData ? row.selectedCce : 'NA'
        };

        if (filterType === 'range') {
          rowObj[`During the Month ${endMonthText}`] = row.hasData ? row.currentMonthCompleted : 'NA';
          rowObj[`Up to the Month ${endMonthText}`] = row.hasData ? row.completed : 'NA';
        } else {
          rowObj[`During the Month ${endMonthText}`] = row.hasData ? row.completed : 'NA';
        }

        rowObj['Ongoing'] = row.hasData ? row.ongoing : 'NA';
        rowObj['Missed CCE'] = row.hasData ? row.missedCce : 'NA';
        rowObj['Not Available'] = row.hasData ? row.notAvailable : 'NA';
        rowObj['Not Started'] = row.hasData ? row.notStarted : 'NA';
        rowObj['Under Review'] = row.hasData ? row.underReview : 'NA';

        return rowObj;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);

      worksheet['!cols'] = [
        { wch: 5 }, { wch: 24 }, { wch: 14 }, { wch: 14 },
        { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Taluk Report');

      XLSX.writeFile(workbook, generateExcelFileName());
    } catch (err) {
      console.error('Excel export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleViewTalukDetails = (talukName, talukId, hasData) => {
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

  const initialLoading =
    (loading || masterTaluksLoading) && !apiData && taluksList.length === 0;

  const headerBackground = theme.palette.primary.dark;
  const selectedColor = theme.palette.primary.main;
  const completedColor = theme.palette.success.main;
  const currentColor = theme.palette.info.main;
  const reviewColor = theme.palette.warning.dark;
  const errorColor = theme.palette.error.main;

  if (initialLoading) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: 420 }}>
        <Grid item>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading taluk CCE progress…
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  if (error && !apiData) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchTalukWiseData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
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
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08)
              }}
            >
              <LocationOnIcon fontSize="small" />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750, lineHeight: 1.2 }}>
                {displayDistrictName} — Taluk-wise CCE Report
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Agricultural Year {agriculturalYear} • {reportPeriodText}
                {cropName !== 'ALL' ? ` • ${cropName}` : ' • All crops'}
                {loading ? ' • Refreshing…' : ''}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {filtersAreDirty && (
              <Button
                variant="text"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Reset filters
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/kerala_form5_report', { state: { ...stateData } })}
              sx={{ textTransform: 'none', minHeight: 36 }}
            >
              Back to Kerala Report
            </Button>
          </Stack>
        </Stack>
      </Grid>

      {error && apiData && (
        <Grid item xs={12}>
          <Alert severity="warning">
            The latest refresh failed. Showing the last successfully loaded data. {error}
          </Alert>
        </Grid>
      )}

      {/* Filters Card */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select crop and reporting period for taluk CCE progress in {displayDistrictName}.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'minmax(220px, 1fr) minmax(200px, 1fr)'
                },
                gap: 1.5,
                alignItems: 'end'
              }}
            >
              <Box>
                <FilterLabel>Crop</FilterLabel>
                <FormControl size="small" fullWidth>
                  <InputLabel id="crop-label">Crop</InputLabel>
                  <Select
                    labelId="crop-label"
                    value={cropName}
                    label="Crop"
                    onChange={handleCropNameChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <GrassIcon fontSize="small" color="success" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="ALL">All crops</MenuItem>
                    {cropOptions.map((crop) => (
                      <MenuItem key={crop.cropId ?? crop.cropName} value={crop.cropName}>
                        {crop.cropName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FilterLabel>Period</FilterLabel>
                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  fullWidth
                  size="small"
                  aria-label="Report period"
                  onChange={handleFilterTypeChange}
                >
                  <ToggleButton value="range">
                    <ViewWeekIcon sx={{ mr: 0.75, fontSize: 18 }} />
                    Range
                  </ToggleButton>
                  <ToggleButton value="single">
                    <ViewModuleIcon sx={{ mr: 0.75, fontSize: 18 }} />
                    Single Month
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Divider />

            {filterType === 'range' ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr auto 1fr' },
                  gap: 1.5,
                  alignItems: 'end',
                  maxWidth: 620
                }}
              >
                <Box>
                  <FilterLabel>From Month</FilterLabel>
                  <FormControl size="small" fullWidth>
                    <InputLabel>From Month</InputLabel>
                    <Select value={fromMonth} label="From Month" onChange={handleFromMonthChange}>
                      {monthOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Typography
                  aria-hidden="true"
                  color="text.secondary"
                  sx={{ pb: 1.1, display: { xs: 'none', sm: 'block' } }}
                >
                  →
                </Typography>

                <Box>
                  <FilterLabel>To Month</FilterLabel>
                  <FormControl size="small" fullWidth>
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
                </Box>
              </Box>
            ) : (
              <Box sx={{ maxWidth: { xs: '100%', sm: 300 } }}>
                <FilterLabel>Month</FilterLabel>
                <FormControl size="small" fullWidth>
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
              </Box>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Summary Section */}
      <Grid item xs={12}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            borderColor: theme.palette.divider
          }}
        >
          {(() => {
            const safeAllowed = Math.max(Number(stats.allowtedCce || 0), 0);
            const safeSelected = Math.max(Number(stats.selectedCce || 0), 0);
            const safeCompleted = Math.max(Number(stats.completed || 0), 0);
            const selectionRate = safeAllowed > 0 ? Math.min((safeSelected / safeAllowed) * 100, 100) : 0;
            const completionRate = safeSelected > 0 ? Math.min((safeCompleted / safeSelected) * 100, 100) : 0;
            const remainingSelected = Math.max(safeSelected - safeCompleted, 0);

            return (
              <>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                  sx={{ mb: 1.25, px: 0.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '0.2px' }}
                    >
                      {displayDistrictName} Summary
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {cropName === 'ALL' ? 'All crops' : cropName} • {reportPeriodText} • {talukData.length} taluks
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: { sm: 220 } }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 650, color: 'text.secondary', whiteSpace: 'nowrap' }}
                    >
                      Completion: <strong style={{ color: theme.palette.success.dark }}>{completionRate.toFixed(1)}%</strong>
                      {remainingSelected > 0 ? ` (${remainingSelected.toLocaleString()} left)` : ''}
                    </Typography>
                    <Box sx={{ width: { xs: 70, sm: 90 } }}>
                      <LinearProgress
                        variant="determinate"
                        value={completionRate}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.12),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: 'success.main'
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      sm: 'repeat(3, minmax(0, 1fr))',
                      md:
                        filterType === 'range'
                          ? 'repeat(5, minmax(0, 1fr))'
                          : 'repeat(4, minmax(0, 1fr))',
                      lg:
                        filterType === 'range'
                          ? 'repeat(9, minmax(0, 1fr))'
                          : 'repeat(8, minmax(0, 1fr))'
                    },
                    gap: 1,
                    opacity: loading ? 0.7 : 1,
                    transition: theme.transitions.create('opacity')
                  }}
                >
                  <StatCard
                    label="Allowed CCE"
                    value={stats.allowtedCce}
                    color={theme.palette.primary.main}
                    icon={<AssessmentIcon sx={{ fontSize: 17 }} />}
                    tooltip="Total CCE plots allowed for survey"
                  />

                  <StatCard
                    label="Selected CCE"
                    value={stats.selectedCce}
                    badge={safeAllowed > 0 ? `${selectionRate.toFixed(1)}%` : undefined}
                    color={theme.palette.primary.main}
                    icon={<AssessmentIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE plots selected for survey"
                  />

                  {filterType === 'range' && (
                    <StatCard
                      label="During the Month"
                      value={stats.currentMonthCompleted}
                      color={theme.palette.info.main}
                      icon={<CalendarMonthIcon sx={{ fontSize: 17 }} />}
                      tooltip={`CCE completed during the month of ${endMonthText}`}
                    />
                  )}

                  <StatCard
                    label={filterType === 'range' ? 'Up to the Month' : 'Completed'}
                    value={stats.completed}
                    badge={`${completionRate.toFixed(1)}%`}
                    color={theme.palette.success.main}
                    icon={<CheckCircleIcon sx={{ fontSize: 17 }} />}
                    tooltip={
                      filterType === 'range'
                        ? `Cumulative CCE completed up to ${endMonthText}`
                        : `CCE completed during ${endMonthText}`
                    }
                  />

                  <StatCard
                    label="Ongoing"
                    value={stats.ongoing}
                    color={theme.palette.info.dark}
                    icon={<PendingIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE currently in progress"
                  />

                  <StatCard
                    label="Missed CCE"
                    value={stats.missedCce}
                    color={theme.palette.error.main}
                    icon={<EventBusyIcon sx={{ fontSize: 17 }} />}
                    tooltip="Missed CCE plots"
                  />

                  <StatCard
                    label="Not Available"
                    value={stats.notAvailable}
                    color={theme.palette.error.dark}
                    icon={<CancelIcon sx={{ fontSize: 17 }} />}
                    tooltip="Plots not available for CCE"
                  />

                  <StatCard
                    label="Not Started"
                    value={stats.notStarted}
                    color={theme.palette.text.secondary}
                    icon={<ScheduleIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE plots not yet started"
                  />

                  <StatCard
                    label="Under Review"
                    value={stats.underReview}
                    color={theme.palette.warning.dark}
                    icon={<RateReviewIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE entries under verification"
                  />
                </Box>
              </>
            );
          })()}
        </Paper>
      </Grid>

      {/* Taluk Table Card */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          {loading && <LinearProgress aria-label="Refreshing taluk data" />}

          <Box sx={{ p: { xs: 2, md: 2.5 }, pb: 1.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Taluk Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {searchFilteredData.length} taluk{searchFilteredData.length === 1 ? '' : 's'} shown
                  {taluksWithNoData > 0 ? ` • ${taluksWithNoData} without data` : ''}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <TextField
                  placeholder="Search taluk..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                          aria-label="Clear taluk search"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
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
                      startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                      onClick={handleExportExcel}
                      disabled={searchFilteredData.length === 0 || loading || exporting}
                      sx={{
                        minHeight: 40,
                        width: { xs: '100%', sm: 'auto' },
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {exporting ? 'Preparing…' : 'Export Excel'}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              opacity: loading ? 0.62 : 1,
              pointerEvents: loading ? 'none' : 'auto',
              transition: theme.transitions.create('opacity')
            }}
          >
            {searchFilteredData.length === 0 ? (
              <Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No matching taluks
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Try changing the search term or report filters.
                </Typography>
              </Box>
            ) : isMobile ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedData.map((row) => (
                  <Card
                    key={row.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      bgcolor: row.hasData ? 'background.paper' : alpha(theme.palette.warning.main, 0.035)
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnIcon fontSize="small" sx={{ color: row.hasData ? 'primary.main' : 'warning.main' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {row.taluk}
                          </Typography>
                        </Stack>

                        {!row.hasData && (
                          <Chip label="No Data" size="small" color="warning" variant="outlined" />
                        )}
                      </Stack>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          gap: 1.5,
                          mt: 2
                        }}
                      >
                        <MobileMetric label="Allowed">
                          <MetricText value={row.allowtedCce} noData={!row.hasData} />
                        </MobileMetric>

                        <MobileMetric label="Selected">
                          <MetricText value={row.selectedCce} noData={!row.hasData} color={selectedColor} />
                        </MobileMetric>

                        {filterType === 'range' && (
                          <MobileMetric label={`During Month (${endMonthText})`}>
                            <MetricText value={row.currentMonthCompleted} noData={!row.hasData} color={currentColor} />
                          </MobileMetric>
                        )}

                        <MobileMetric
                          label={filterType === 'range' ? `Up to Month (${endMonthText})` : `During Month (${endMonthText})`}
                        >
                          <MetricText value={row.completed} noData={!row.hasData} color={completedColor} />
                        </MobileMetric>

                        <MobileMetric label="Ongoing">
                          <MetricText value={row.ongoing} noData={!row.hasData} color={currentColor} />
                        </MobileMetric>

                        <MobileMetric label="Missed CCE">
                          <MetricText value={row.missedCce} noData={!row.hasData} color={errorColor} />
                        </MobileMetric>

                        <MobileMetric label="Not Available">
                          <MetricText value={row.notAvailable} noData={!row.hasData} color={errorColor} />
                        </MobileMetric>

                        <MobileMetric label="Not Started">
                          <MetricText value={row.notStarted} noData={!row.hasData} />
                        </MobileMetric>

                        <MobileMetric label="Under Review">
                          <MetricText value={row.underReview} noData={!row.hasData} color={reviewColor} />
                        </MobileMetric>
                      </Box>

                      <Button
                        fullWidth
                        size="small"
                        variant="text"
                        startIcon={row.hasData ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        disabled={!row.hasData}
                        onClick={() => handleViewTalukDetails(row.taluk, row.id, row.hasData)}
                        sx={{ mt: 1.5 }}
                      >
                        {row.hasData ? 'View zone details' : 'Details unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: '68vh', overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  size="small"
                  aria-label="Taluk CCE progress"
                  sx={{
                    minWidth: filterType === 'range' ? 1160 : 1020,
                    '& .MuiTableCell-root': {
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          width: 56,
                          minWidth: 56,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          position: 'sticky',
                          left: 0,
                          top: 0,
                          zIndex: 7
                        }}
                      >
                        #
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: 200,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          position: 'sticky',
                          left: 56,
                          top: 0,
                          zIndex: 7,
                          boxShadow: `2px 0 0 ${alpha(theme.palette.common.white, 0.12)}`
                        }}
                      >
                        Taluk
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Allowed
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Selected
                      </TableCell>

                      {filterType === 'range' && (
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                        >
                          During the Month
                          <Typography variant="caption" display="block" sx={{ color: 'inherit', opacity: 0.82 }}>
                            {endMonthText}
                          </Typography>
                        </TableCell>
                      )}

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        {filterType === 'range' ? 'Up to the Month' : 'Completed In'}
                        <Typography variant="caption" display="block" sx={{ color: 'inherit', opacity: 0.82 }}>
                          {endMonthText}
                        </Typography>
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Ongoing
                      </TableCell>

                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.18)}`
                        }}
                      >
                        Exceptions
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Not Started
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Review
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Action
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          top: 41,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      >
                        Missed
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          top: 41,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      >
                        Unavailable
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedData.map((row, index) => {
                      const serialNumber = page * rowsPerPage + index + 1;
                      const rowBackground = row.hasData
                        ? theme.palette.background.paper
                        : alpha(theme.palette.warning.main, 0.035);

                      return (
                        <TableRow
                          key={row.id || index}
                          hover
                          sx={{
                            bgcolor: rowBackground,
                            '&:hover': {
                              bgcolor: row.hasData
                                ? alpha(theme.palette.primary.main, 0.035)
                                : alpha(theme.palette.warning.main, 0.075)
                            }
                          }}
                        >
                          <TableCell
                            align="center"
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 3,
                              bgcolor: 'inherit',
                              width: 56,
                              minWidth: 56
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                              {serialNumber}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 56,
                              zIndex: 3,
                              bgcolor: 'inherit',
                              minWidth: 200,
                              boxShadow: `2px 0 0 ${theme.palette.divider}`
                            }}
                          >
                            <Stack direction="row" spacing={0.8} alignItems="center">
                              <LocationOnIcon
                                sx={{
                                  fontSize: 17,
                                  color: row.hasData ? 'primary.main' : 'warning.main',
                                  opacity: 0.85
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: row.hasData ? 600 : 500,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {row.taluk}
                              </Typography>
                              {!row.hasData && (
                                <Chip
                                  label="No Data"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.allowtedCce} noData={!row.hasData} />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.selectedCce} noData={!row.hasData} color={selectedColor} />
                          </TableCell>

                          {filterType === 'range' && (
                            <TableCell align="center">
                              <MetricText value={row.currentMonthCompleted} noData={!row.hasData} color={currentColor} />
                            </TableCell>
                          )}

                          <TableCell align="center">
                            <MetricText value={row.completed} noData={!row.hasData} color={completedColor} />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.ongoing} noData={!row.hasData} color={currentColor} />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.missedCce} noData={!row.hasData} color={errorColor} />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.notAvailable} noData={!row.hasData} color={errorColor} />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.notStarted} noData={!row.hasData} />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.underReview} noData={!row.hasData} color={reviewColor} />
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip
                              title={
                                row.hasData ? `View ${row.taluk} zone details` : 'No data available for this taluk'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!row.hasData}
                                  onClick={() => handleViewTalukDetails(row.taluk, row.id, row.hasData)}
                                  aria-label={
                                    row.hasData
                                      ? `View details for ${row.taluk}`
                                      : `Details unavailable for ${row.taluk}`
                                  }
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                      bgcolor: (t) => alpha(t.palette.primary.main, 0.08)
                                    }
                                  }}
                                >
                                  {row.hasData ? (
                                    <VisibilityIcon fontSize="small" />
                                  ) : (
                                    <VisibilityOffIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {searchFilteredData.length > 0 && (
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
                labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    gap: { xs: 0.5, sm: 0 }
                  }
                }}
              />
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default TalukForm5Report;

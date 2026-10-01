import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import GrassIcon from '@mui/icons-material/Grass';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PendingIcon from '@mui/icons-material/Pending';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

import axios from 'axios';
import api from 'api/api';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const SEASON_OPTIONS = [
  { value: 1, label: 'Autumn' },
  { value: 2, label: 'Winter' },
  { value: 3, label: 'Summer' }
];

const DEFAULT_SEASON_ID = 1;
const BTR_SUPPORTS_SEASON_ID = true;
const SESSION_KEY = 'talukFormReportState';

const getSeasonLabel = (value) =>
  SEASON_OPTIONS.find((option) => option.value === Number(value))?.label || 'Autumn';

const normalizeSeasonId = (value) => {
  const number = Number(value);
  return SEASON_OPTIONS.some((option) => option.value === number)
    ? number
    : DEFAULT_SEASON_ID;
};

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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
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

  return monthNameMatch?.value || monthOptions[0]?.value || '';
}

function getCurrentMonthValue(monthOptions) {
  if (!monthOptions?.length) return '';

  const now = new Date();
  const currentValue = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  return (
    monthOptions.find((option) => option.value === currentValue)?.value ||
    monthOptions[monthOptions.length - 1]?.value ||
    monthOptions[0]?.value ||
    ''
  );
}

function normalizeTalukName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/taluk/gi, '')
    .replace(/[^a-z0-9]/gi, '');
}

function pickMetric(taluk, metric, landType) {
  if (!taluk || typeof taluk !== 'object') return 0;

  const getValue = (key) => {
    if (!key || taluk[key] === undefined || taluk[key] === null) return null;
    const number = Number(taluk[key]);
    return Number.isNaN(number) ? null : number;
  };

  const wetValue =
    getValue(`wet${metric}`) ?? getValue(`wet_${metric.toLowerCase()}`) ?? 0;
  const dryValue =
    getValue(`dry${metric}`) ?? getValue(`dry_${metric.toLowerCase()}`) ?? 0;
  const directValue =
    getValue(metric) ?? getValue(metric.toLowerCase()) ?? getValue(metric.toUpperCase()) ?? 0;

  if (landType === 'WET') return wetValue || directValue;
  if (landType === 'DRY') return dryValue || directValue;
  if (wetValue > 0 || dryValue > 0) return wetValue + dryValue;
  return directValue;
}

const formatArea = (number) =>
  Number(number || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

// Preserved from the supplied page as an API fallback.
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
    9: ['Palakkad', 'Alathur', 'Chittur', 'Mannarkkad', 'Ottapalam'],
    10: ['Malappuram', 'Eranad', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Nilambur', 'Kondotty'],
    11: ['Kozhikode', 'Vadakara', 'Quilandy', 'Thamarassery', 'Koyilandy'],
    12: ['Wayanad', 'Mananthavady', 'Sulthan Bathery', 'Vythiri'],
    13: ['Kannur', 'Thalassery', 'Payyanur', 'Iritty', 'Taliparamba'],
    14: ['Kasaragod', 'Hosdurg', 'Vellarikundu']
  };

  return (taluksByDistrict[districtId] || []).map((name, index) => ({
    id: index + 1,
    talukNameEn: name
  }));
}

function MetricText({ value, noData = false, color = 'text.primary', area = false }) {
  if (noData) {
    return (
      <Typography component="span" variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        color: value > 0 ? color : 'text.secondary',
        fontWeight: value > 0 ? 600 : 400,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}
    >
      {area ? formatArea(value) : Number(value || 0).toLocaleString()}
    </Typography>
  );
}

function StatCard({ label, value, color, icon, areaValue, tooltip }) {
  const theme = useTheme();

  const content = (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.16)}`,
        bgcolor: alpha(color, 0.055),
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color']),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[3],
          borderColor: alpha(color, 0.28)
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{
                color,
                fontWeight: 700,
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {Number(value || 0).toLocaleString()}
            </Typography>

            <Typography variant="body2" sx={{ mt: 0.7, color: 'text.primary', fontWeight: 600 }}>
              {label}
            </Typography>

            {areaValue !== undefined && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatArea(areaValue)} cents
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              flex: '0 0 auto',
              width: 38,
              height: 38,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(color, 0.12),
              color
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement="top">
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

function TalukFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const latestRequestRef = useRef(0);

  const baseUrl = mainapi.FORM_API;
  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = defaultToMonth;

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, [location.state]);

  const resolvedDistrictId = useMemo(
    () => stateData.districtId ?? stateData.districtOfficeId ?? null,
    [stateData]
  );

  const displayDistrictName = useMemo(() => {
    if (districtName && districtName !== 'direct') {
      return districtName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return stateData.districtName || 'District';
  }, [districtName, stateData.districtName]);

  const initialFilters = useMemo(
    () => ({
      filterType: stateData.filterType || 'range',
      fromMonth: stateData.fromMonth
        ? resolveMonthValue(stateData.fromMonth, monthOptions)
        : defaultFromMonth,
      toMonth: stateData.toMonth
        ? resolveMonthValue(stateData.toMonth, monthOptions)
        : defaultToMonth,
      singleMonth: stateData.singleMonth
        ? resolveMonthValue(stateData.singleMonth, monthOptions)
        : defaultSingleMonth,
      landTypeTab: stateData.landType || stateData.seasonTab || 'ALL',
      seasonId: normalizeSeasonId(stateData.seasonId)
    }),
    [defaultFromMonth, defaultSingleMonth, defaultToMonth, monthOptions, stateData]
  );

  const getMonthLabel = useCallback(
    (value) => monthOptions.find((option) => option.value === value)?.label || value,
    [monthOptions]
  );

  const [btrData, setBtrData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [taluksList, setTaluksList] = useState([]);

  const [landTypeTab, setLandTypeTab] = useState(initialFilters.landTypeTab);
  const [seasonId, setSeasonId] = useState(initialFilters.seasonId);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);

  const [loading, setLoading] = useState(false);
  const [masterTaluksLoading, setMasterTaluksLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const fromMonthIndex = useMemo(
    () => monthOptions.findIndex((option) => option.value === fromMonth),
    [fromMonth, monthOptions]
  );

  useEffect(() => {
    if (!resolvedDistrictId) return;

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        districtId: resolvedDistrictId,
        districtOfficeId: resolvedDistrictId,
        districtName: stateData.districtName || displayDistrictName || '',
        isDirectAccess: Boolean(stateData.isDirectAccess),
        filterType,
        fromMonth,
        toMonth,
        singleMonth,
        seasonTab: landTypeTab,
        landType: landTypeTab,
        seasonId: normalizeSeasonId(seasonId)
      })
    );
  }, [
    displayDistrictName,
    filterType,
    fromMonth,
    landTypeTab,
    resolvedDistrictId,
    seasonId,
    singleMonth,
    stateData.districtName,
    stateData.isDirectAccess,
    toMonth
  ]);

  const fetchMasterTaluks = useCallback(async () => {
    if (!resolvedDistrictId) {
      setMasterTaluksLoading(false);
      return;
    }

    setMasterTaluksLoading(true);

    try {
      const response = await api.get(
        `${mainapi.BTR_API}/btr-service/btr-api/taluks?distId=${resolvedDistrictId}`
      );
      const source = response?.data?.data;

      if (Array.isArray(source) && source.length > 0) {
        setTaluksList(source);
      } else {
        setTaluksList(getFallbackTaluks(resolvedDistrictId));
      }
    } catch (fetchError) {
      console.error('Error fetching master taluks:', fetchError);
      setTaluksList(getFallbackTaluks(resolvedDistrictId));
    } finally {
      setMasterTaluksLoading(false);
    }
  }, [resolvedDistrictId]);

  const fetchTalukData = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    if (!resolvedDistrictId) {
      setError('District ID is required. Please navigate from the district report page.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let startMonthValue = defaultFromMonth;
      let endMonthValue = monthOptions[monthOptions.length - 1]?.value || defaultToMonth;

      if (filterType === 'single') {
        const resolved = resolveMonthValue(singleMonth, monthOptions);
        startMonthValue = resolved;
        endMonthValue = resolved;
      } else {
        startMonthValue = resolveMonthValue(fromMonth, monthOptions);
        endMonthValue = resolveMonthValue(toMonth, monthOptions);
      }

      const token = AuthService.gettoken
        ? AuthService.gettoken()
        : localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication session token missing. Please log in again.');
      }

      const effectiveSeasonId = normalizeSeasonId(seasonId);
      const currentAgriYear =
        (AuthService && AuthService.agriyear ? AuthService.agriyear() : null) ||
        localStorage.getItem('activeAgriYear') ||
        '2025-2026';

      const formParams = new URLSearchParams({
        agriYear: currentAgriYear,
        districtId: String(resolvedDistrictId),
        startMonth: startMonthValue,
        endMonth: endMonthValue,
        seasonId: String(effectiveSeasonId)
      });

      if (landTypeTab !== 'ALL') formParams.append('landType', landTypeTab);

      const btrParams = new URLSearchParams({
        agriYear: currentAgriYear,
        districtId: String(resolvedDistrictId)
      });

      if (BTR_SUPPORTS_SEASON_ID) {
        btrParams.append('seasonId', String(effectiveSeasonId));
      }

      if (landTypeTab !== 'ALL') btrParams.append('landType', landTypeTab);

      const formStatusUrl = `${baseUrl}/earas-form1-entry/api/progress-report/form1-status/district?${formParams.toString()}`;
      const completedClustersUrl = `${mainapi.BTR_API}/btr-service/api/report/dashboard/completed/taluk?${btrParams.toString()}`;
      const headers = { Authorization: `Bearer ${token}` };

      const btrRequest = (async () => {
        try {
          const response = await axios.get(completedClustersUrl, { headers });
          return response.data || null;
        } catch (btrError) {
          console.warn('BTR taluk completed-clusters request failed:', btrError?.message);
          return null;
        }
      })();

      const lastMonthRequest = (async () => {
        if (filterType !== 'range') return null;

        const lastMonthValue = resolveMonthValue(toMonth || fromMonth, monthOptions);
        if (!lastMonthValue) return null;

        const lastMonthParams = new URLSearchParams({
          agriYear: currentAgriYear,
          districtId: String(resolvedDistrictId),
          startMonth: lastMonthValue,
          endMonth: lastMonthValue,
          seasonId: String(effectiveSeasonId)
        });

        if (landTypeTab !== 'ALL') lastMonthParams.append('landType', landTypeTab);

        const lastMonthUrl = `${baseUrl}/earas-form1-entry/api/progress-report/form1-status/district?${lastMonthParams.toString()}`;

        try {
          const response = await axios.get(lastMonthUrl, { headers });
          return response.data || null;
        } catch (lastMonthError) {
          console.error('Error fetching last-month taluk data:', lastMonthError);
          return null;
        }
      })();

      const [formResponse, btrResponseData, lastMonthResponseData] = await Promise.all([
        axios.get(formStatusUrl, { headers }),
        btrRequest,
        lastMonthRequest
      ]);

      if (requestId !== latestRequestRef.current) return;

      setApiData(formResponse?.data || null);
      setBtrData(btrResponseData);
      setLastMonthApiData(lastMonthResponseData);
    } catch (fetchError) {
      if (requestId !== latestRequestRef.current) return;

      console.error('Error fetching taluk data:', fetchError);
      setError(
        fetchError.response?.data?.message ||
        fetchError.message ||
        'Failed to fetch taluk data'
      );
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [
    baseUrl,
    defaultFromMonth,
    defaultToMonth,
    filterType,
    fromMonth,
    landTypeTab,
    monthOptions,
    resolvedDistrictId,
    seasonId,
    singleMonth,
    toMonth
  ]);

  useEffect(() => {
    fetchMasterTaluks();
  }, [fetchMasterTaluks]);

  useEffect(() => {
    fetchTalukData();
  }, [fetchTalukData]);

  const talukData = useMemo(() => {
    const apiTaluks = apiData?.allSubDetails || {};
    const btrTaluks = btrData?.allSubDetails || {};
    const lastMonthTaluks =
      filterType === 'range' && lastMonthApiData
        ? lastMonthApiData.allSubDetails || {}
        : {};

    const createLookup = (source) => {
      const byId = {};
      const byName = {};

      Object.entries(source).forEach(([name, details]) => {
        const id = details?.id || details?.talukId;
        if (id) byId[id] = { name, details };

        const normalizedName = normalizeTalukName(name);
        if (normalizedName) byName[normalizedName] = { name, details };
      });

      return { byId, byName };
    };

    const apiLookup = createLookup(apiTaluks);
    const btrLookup = createLookup(btrTaluks);
    const lastMonthLookup = createLookup(lastMonthTaluks);

    const resolveDetails = (lookup, talukId, talukName) => {
      if (talukId && lookup.byId[talukId]) return lookup.byId[talukId];

      const normalizedName = normalizeTalukName(talukName);
      return normalizedName ? lookup.byName[normalizedName] || null : null;
    };

    const getLastMonthMetrics = (talukId, talukName) => {
      const match = resolveDetails(lastMonthLookup, talukId, talukName)?.details;
      if (!match) return { count: 0, area: 0 };

      const count = pickMetric(match, 'Completed', landTypeTab);
      const rawArea = pickMetric(match, 'ClusterArea', landTypeTab);

      return {
        count,
        area: count > 0 ? rawArea : 0
      };
    };

    const buildRow = (talukId, talukName, apiDetails, apiDisplayName) => {
      const completed = pickMetric(apiDetails, 'Completed', landTypeTab);
      const ongoing = pickMetric(apiDetails, 'Ongoing', landTypeTab);
      const underReview = pickMetric(apiDetails, 'UnderReview', landTypeTab);
      const rawArea = pickMetric(apiDetails, 'ClusterArea', landTypeTab);
      const area = completed > 0 ? rawArea : 0;
      const currentMonth = getLastMonthMetrics(talukId, talukName);

      const btrDetails = resolveDetails(btrLookup, talukId, talukName)?.details || {};
      const total = pickMetric(btrDetails, 'Completed', landTypeTab);
      const notStarted = Math.max(total - completed, 0);

      const hasData =
        completed > 0 ||
        ongoing > 0 ||
        notStarted > 0 ||
        underReview > 0 ||
        area > 0 ||
        total > 0;

      return {
        id: talukId || apiDetails?.id || normalizeTalukName(talukName) || talukName,
        taluk: talukName || apiDisplayName || 'Unknown Taluk',
        total,
        completed,
        currentMonthCompleted: currentMonth.count,
        currentMonthArea: currentMonth.area,
        ongoing,
        notStarted,
        underReview,
        area,
        hasData
      };
    };

    if (taluksList?.length) {
      return taluksList.map((taluk) => {
        const talukId = taluk.id || taluk.talukId;
        const talukName = taluk.talukNameEn || taluk.talukName || '';
        const apiMatch = resolveDetails(apiLookup, talukId, talukName);

        return buildRow(
          talukId,
          talukName,
          apiMatch?.details || {},
          apiMatch?.name
        );
      });
    }

    return Object.entries(apiTaluks).map(([talukName, details]) =>
      buildRow(details?.id || details?.talukId, talukName, details, talukName)
    );
  }, [apiData, btrData, filterType, landTypeTab, lastMonthApiData, taluksList]);

  const taluksWithNoData = useMemo(
    () => talukData.filter((taluk) => !taluk.hasData).length,
    [talukData]
  );

  const stats = useMemo(() => {
    const totalFromTaluks = talukData.reduce((sum, taluk) => sum + (taluk.total || 0), 0);

    return {
      total: totalFromTaluks > 0 ? totalFromTaluks : btrData?.totalClusterCompleted || 0,
      completed: talukData.reduce((sum, taluk) => sum + (taluk.completed || 0), 0),
      currentMonthCompleted: talukData.reduce(
        (sum, taluk) => sum + (taluk.currentMonthCompleted || 0),
        0
      ),
      currentMonthArea: talukData.reduce(
        (sum, taluk) => sum + (taluk.currentMonthArea || 0),
        0
      ),
      ongoing: talukData.reduce((sum, taluk) => sum + (taluk.ongoing || 0), 0),
      notStarted: talukData.reduce((sum, taluk) => sum + (taluk.notStarted || 0), 0),
      underReview: talukData.reduce(
        (sum, taluk) => sum + (taluk.underReview || 0),
        0
      ),
      completedArea: talukData.reduce((sum, taluk) => sum + (taluk.area || 0), 0)
    };
  }, [btrData, talukData]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return talukData;

    return talukData.filter((row) => row.taluk.toLowerCase().includes(normalizedSearch));
  }, [searchTerm, talukData]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  useEffect(() => {
    const maxPage = Math.max(Math.ceil(filteredData.length / rowsPerPage) - 1, 0);
    if (page > maxPage) setPage(maxPage);
  }, [filteredData.length, page, rowsPerPage]);

  const filtersAreDirty =
    filterType !== 'range' ||
    fromMonth !== defaultFromMonth ||
    toMonth !== defaultToMonth ||
    singleMonth !== defaultSingleMonth ||
    landTypeTab !== 'ALL' ||
    Number(seasonId) !== DEFAULT_SEASON_ID;

  const handleFromMonthChange = (event) => {
    const nextFromMonth = event.target.value;
    setFromMonth(nextFromMonth);
    setPage(0);

    const nextFromIndex = monthOptions.findIndex((option) => option.value === nextFromMonth);
    const currentToIndex = monthOptions.findIndex((option) => option.value === toMonth);

    if (nextFromIndex > currentToIndex) {
      setToMonth(nextFromMonth);
    }
  };

  const handleClearFilters = () => {
    setFromMonth(defaultFromMonth);
    setToMonth(defaultToMonth);
    setSingleMonth(defaultSingleMonth);
    setLandTypeTab('ALL');
    setSeasonId(DEFAULT_SEASON_ID);
    setFilterType('range');
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const generateExcelFileName = () => {
    const parts = [
      'Taluk_Report',
      displayDistrictName.replace(/\s+/g, '_'),
      getSeasonLabel(seasonId)
    ];

    if (landTypeTab !== 'ALL') parts.push(landTypeTab);

    if (filterType === 'single') {
      parts.push(getMonthLabel(singleMonth).replace(/\s+/g, '_'));
    } else {
      parts.push(getMonthLabel(fromMonth).replace(/\s+/g, '_'));
      parts.push('to');
      parts.push(getMonthLabel(toMonth).replace(/\s+/g, '_'));
    }

    if (searchTerm.trim()) {
      parts.push(`Search-${searchTerm.trim().replace(/\s+/g, '_')}`);
    }

    parts.push(new Date().toISOString().slice(0, 10));
    return `${parts.join('_')}.xlsx`;
  };

  const handleExportExcel = async () => {
    if (!filteredData.length || exporting) return;

    setExporting(true);

    try {
      const XLSX = await import('xlsx');

      const exportRows = filteredData.map((row, index) => {
        const rowObject = {
          '#': index + 1,
          District: displayDistrictName,
          Season: getSeasonLabel(seasonId),
          'Land Type': landTypeTab,
          Taluk: row.taluk,
          Total: row.hasData ? row.total : 'NA'
        };

        if (filterType === 'range') {
          rowObject['During the Month'] = row.hasData ? row.currentMonthCompleted : 'NA';
          rowObject['During Month Area (cents)'] = row.hasData ? row.currentMonthArea : 'NA';
          rowObject['Up to the Month'] = row.hasData ? row.completed : 'NA';
        } else {
          rowObject['During the Month'] = row.hasData ? row.completed : 'NA';
        }

        rowObject['Area Completed (cents)'] = row.hasData ? row.area : 'NA';
        rowObject.Ongoing = row.hasData ? row.ongoing : 'NA';
        rowObject['Not Started'] = row.hasData ? row.notStarted : 'NA';
        rowObject['Under Review'] = row.hasData ? row.underReview : 'NA';

        return rowObject;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] = [
        { wch: 5 },
        { wch: 22 },
        { wch: 12 },
        { wch: 12 },
        { wch: 25 },
        { wch: 10 },
        { wch: 18 },
        { wch: 24 },
        { wch: 18 },
        { wch: 24 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Taluk Report');
      XLSX.writeFile(workbook, generateExcelFileName());
    } catch (exportError) {
      console.error('Excel export failed:', exportError);
    } finally {
      setExporting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/FormReport/Kerala', {
      state: {
        fromMonth,
        toMonth,
        seasonTab: landTypeTab,
        landType: landTypeTab,
        seasonId: normalizeSeasonId(seasonId),
        filterType,
        singleMonth
      }
    });
  };

  const handleViewBlockDetails = (talukName, talukId, hasData) => {
    if (!hasData) return;

    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const safeDistrictName = districtName || displayDistrictName || 'district';
    const formattedDistrictName = safeDistrictName.toLowerCase().replace(/\s+/g, '-');

    navigate(
      `/kerala_form_report/zone_form_report/${formattedDistrictName}/${formattedTalukName}`,
      {
        state: {
          districtId: resolvedDistrictId,
          districtName: displayDistrictName,
          talukId,
          talukName,
          fromMonth,
          toMonth,
          seasonTab: landTypeTab,
          landType: landTypeTab,
          seasonId: normalizeSeasonId(seasonId),
          filterType,
          singleMonth
        }
      }
    );
  };

  const reportPeriodText =
    filterType === 'single'
      ? getMonthLabel(singleMonth)
      : `${getMonthLabel(fromMonth)} – ${getMonthLabel(toMonth)}`;

  const isInitialLoading =
    (loading || masterTaluksLoading) && !apiData && taluksList.length === 0;

  const headerBackground = theme.palette.primary.dark;
  const completedColor = theme.palette.success.main;
  const ongoingColor = theme.palette.info.main;
  const notStartedColor = theme.palette.text.secondary;
  const reviewColor = theme.palette.warning.dark;

  if (isInitialLoading) {
    return (
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: 420 }}
      >
        <Grid item>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading taluk progress report…
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
              <Button color="inherit" size="small" onClick={fetchTalukData}>
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

      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.1)
              }}
            >
              <LocationOnIcon />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {displayDistrictName} — Taluk-wise Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {getSeasonLabel(seasonId)} • {reportPeriodText}
                {landTypeTab !== 'ALL' ? ` • ${landTypeTab} Land` : ' • All Land'}
                {loading ? ' • Refreshing…' : ''}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {filtersAreDirty && (
              <Button
                variant="text"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Reset filters
              </Button>
            )}

            {!stateData.isDirectAccess && (
              <Button
                variant="outlined"
                onClick={handleGoBack}
                startIcon={<ArrowBackIcon />}
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Back to Kerala Report
              </Button>
            )}
          </Stack>
        </Stack>
      </Grid>

      {error && apiData && (
        <Grid item xs={12}>
          <Alert severity="warning">
            The latest refresh failed. The last successfully loaded data is still shown. {error}
          </Alert>
        </Grid>
      )}

      {taluksWithNoData > 0 && !loading && (
        <Grid item xs={12}>
          <Alert severity="warning">
            {taluksWithNoData} taluk{taluksWithNoData === 1 ? '' : 's'} have no data for
            the selected filters. Detail view is unavailable for those taluks.
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Choose the crop season, land type and reporting period for this district.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(160px, 0.8fr) minmax(250px, 1.2fr) minmax(250px, 1.2fr)'
                },
                gap: 2,
                alignItems: 'end'
              }}
            >
              <Box>
                <FilterLabel>Season</FilterLabel>
                <FormControl size="small" fullWidth>
                  <InputLabel id="taluk-season-select-label">Season</InputLabel>
                  <Select
                    labelId="taluk-season-select-label"
                    value={seasonId}
                    label="Season"
                    onChange={(event) => {
                      setSeasonId(Number(event.target.value));
                      setPage(0);
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <GrassIcon fontSize="small" color="success" />
                      </InputAdornment>
                    }
                  >
                    {SEASON_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FilterLabel>Land Type</FilterLabel>
                <Tabs
                  value={landTypeTab}
                  onChange={(_, newValue) => {
                    setLandTypeTab(newValue);
                    setPage(0);
                  }}
                  aria-label="Land type"
                  variant="fullWidth"
                  sx={{
                    minHeight: 40,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    '& .MuiTabs-indicator': { height: 3 },
                    '& .MuiTab-root': { minHeight: 38, minWidth: 0, px: 1 }
                  }}
                >
                  <Tab label="All" value="ALL" />
                  <Tab
                    label="Wet"
                    value="WET"
                    icon={<WaterDropIcon fontSize="small" />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Dry"
                    value="DRY"
                    icon={<WbSunnyIcon fontSize="small" />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <Box>
                <FilterLabel>Period</FilterLabel>
                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  fullWidth
                  size="small"
                  aria-label="Report period"
                  onChange={(_, newValue) => {
                    if (!newValue) return;
                    setFilterType(newValue);
                    setPage(0);
                  }}
                >
                  <ToggleButton value="range" aria-label="Month range">
                    <ViewWeekIcon sx={{ mr: 0.75, fontSize: 18 }} />
                    Range
                  </ToggleButton>
                  <ToggleButton value="single" aria-label="Single month">
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
                      onChange={(event) => {
                        setToMonth(event.target.value);
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
                    onChange={(event) => {
                      setSingleMonth(event.target.value);
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

      <Grid item xs={12}>
        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={0.5}
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {displayDistrictName} Summary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getSeasonLabel(seasonId)} • {reportPeriodText}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl:
                  filterType === 'range'
                    ? 'repeat(6, minmax(0, 1fr))'
                    : 'repeat(5, minmax(0, 1fr))'
              },
              gap: 2,
              opacity: loading ? 0.7 : 1,
              transition: theme.transitions.create('opacity')
            }}
          >
            <StatCard
              label="Total Clusters"
              value={stats.total}
              color={theme.palette.primary.main}
              icon={<AssessmentIcon fontSize="small" />}
              tooltip="Total clusters allocated for survey in the selected season"
            />

            {filterType === 'range' && (
              <StatCard
                label="During the Month"
                value={stats.currentMonthCompleted}
                areaValue={stats.currentMonthArea}
                color={theme.palette.info.main}
                icon={<CalendarMonthIcon fontSize="small" />}
                tooltip="Clusters completed during the selected end month"
              />
            )}

            <StatCard
              label={filterType === 'range' ? 'Up to the Month' : 'During the Month'}
              value={stats.completed}
              areaValue={stats.completedArea}
              color={theme.palette.success.main}
              icon={<CheckCircleIcon fontSize="small" />}
              tooltip={
                filterType === 'range'
                  ? 'Cumulative clusters completed up to the selected end month'
                  : 'Clusters completed during the selected month'
              }
            />

            <StatCard
              label="Ongoing"
              value={stats.ongoing}
              color={theme.palette.info.dark}
              icon={<PendingIcon fontSize="small" />}
              tooltip="Clusters currently ongoing"
            />

            <StatCard
              label="Not Started"
              value={stats.notStarted}
              color={theme.palette.text.secondary}
              icon={<ScheduleIcon fontSize="small" />}
              tooltip="Clusters not yet started"
            />

            <StatCard
              label="Under Review"
              value={stats.underReview}
              color={theme.palette.warning.dark}
              icon={<RateReviewIcon fontSize="small" />}
              tooltip="Clusters currently under review"
            />
          </Box>
        </Box>
      </Grid>

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
                  {filteredData.length} taluk{filteredData.length === 1 ? '' : 's'} shown in {displayDistrictName}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <TextField
                  label="Search taluks"
                  placeholder="e.g. Neyyattinkara"
                  size="small"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(0);
                  }}
                  sx={{ width: { xs: '100%', sm: 280 } }}
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
                    filteredData.length
                      ? `Export ${filteredData.length} taluk${filteredData.length === 1 ? '' : 's'} to Excel`
                      : 'No data available to export'
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                      onClick={handleExportExcel}
                      disabled={!filteredData.length || loading || exporting}
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
            {paginatedData.length === 0 ? (
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
                      bgcolor: row.hasData
                        ? 'background.paper'
                        : alpha(theme.palette.warning.main, 0.035)
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOnIcon
                            fontSize="small"
                            sx={{ color: row.hasData ? 'primary.main' : 'warning.main' }}
                          />
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
                        <MobileMetric label="Total">
                          <MetricText value={row.total} noData={!row.hasData} />
                        </MobileMetric>

                        {filterType === 'range' && (
                          <MobileMetric label="During Month">
                            <MetricText
                              value={row.currentMonthCompleted}
                              noData={!row.hasData}
                              color={ongoingColor}
                            />
                          </MobileMetric>
                        )}

                        {filterType === 'range' && (
                          <MobileMetric label="Month Area (cents)">
                            <MetricText value={row.currentMonthArea} noData={!row.hasData} area />
                          </MobileMetric>
                        )}

                        <MobileMetric label={filterType === 'range' ? 'Up to Month' : 'During Month'}>
                          <MetricText
                            value={row.completed}
                            noData={!row.hasData}
                            color={completedColor}
                          />
                        </MobileMetric>

                        <MobileMetric label="Area (cents)">
                          <MetricText value={row.area} noData={!row.hasData} area />
                        </MobileMetric>

                        <MobileMetric label="Ongoing">
                          <MetricText
                            value={row.ongoing}
                            noData={!row.hasData}
                            color={ongoingColor}
                          />
                        </MobileMetric>

                        <MobileMetric label="Not Started">
                          <MetricText
                            value={row.notStarted}
                            noData={!row.hasData}
                            color={notStartedColor}
                          />
                        </MobileMetric>

                        <MobileMetric label="Under Review">
                          <MetricText
                            value={row.underReview}
                            noData={!row.hasData}
                            color={reviewColor}
                          />
                        </MobileMetric>
                      </Box>

                      <Button
                        fullWidth
                        size="small"
                        variant="text"
                        startIcon={row.hasData ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        disabled={!row.hasData}
                        onClick={() => handleViewBlockDetails(row.taluk, row.id, row.hasData)}
                        sx={{ mt: 1.5 }}
                      >
                        {row.hasData ? 'View block details' : 'Details unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: '65vh', overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  size="small"
                  aria-label={`${displayDistrictName} taluk cluster enumeration progress`}
                  sx={{
                    minWidth: filterType === 'range' ? 1120 : 920,
                    '& .MuiTableCell-root': {
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    },
                    '& .MuiTableCell-root:last-of-type': { borderRight: 'none' }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 6,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          width: 56,
                          minWidth: 56
                        }}
                      >
                        #
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        sx={{
                          position: 'sticky',
                          left: 56,
                          zIndex: 6,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          minWidth: 210,
                          boxShadow: `2px 0 0 ${alpha(theme.palette.common.white, 0.18)}`
                        }}
                      >
                        Taluk
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}
                      >
                        Total
                      </TableCell>

                      {filterType === 'range' && (
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
                          During the Month
                        </TableCell>
                      )}

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
                        {filterType === 'range' ? 'Up to the Month' : 'During the Month'}
                      </TableCell>

                      <TableCell rowSpan={2} align="center" sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}>
                        Ongoing
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}>
                        Not Started
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}>
                        Under Review
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 700 }}>
                        Action
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      {filterType === 'range' && (
                        <>
                          <TableCell
                            align="center"
                            sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 600, fontSize: '0.75rem', top: 41 }}
                          >
                            Count
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 600, fontSize: '0.75rem', top: 41 }}
                          >
                            Area (cents)
                          </TableCell>
                        </>
                      )}

                      <TableCell
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 600, fontSize: '0.75rem', top: 41 }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: 'primary.contrastText', bgcolor: headerBackground, fontWeight: 600, fontSize: '0.75rem', top: 41 }}
                      >
                        Area (cents)
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
                          key={row.id}
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
                            sx={{ position: 'sticky', left: 0, zIndex: 3, bgcolor: 'inherit', width: 56, minWidth: 56 }}
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
                              minWidth: 210,
                              boxShadow: `2px 0 0 ${theme.palette.divider}`
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOnIcon
                                sx={{
                                  fontSize: 17,
                                  color: row.hasData ? 'primary.main' : 'warning.main',
                                  opacity: 0.8
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: row.hasData ? 600 : 500, whiteSpace: 'nowrap' }}>
                                {row.taluk}
                              </Typography>
                              {!row.hasData && (
                                <Chip label="No Data" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.total} noData={!row.hasData} />
                          </TableCell>

                          {filterType === 'range' && (
                            <>
                              <TableCell align="center">
                                <MetricText value={row.currentMonthCompleted} noData={!row.hasData} color={ongoingColor} />
                              </TableCell>
                              <TableCell align="center">
                                <MetricText value={row.currentMonthArea} noData={!row.hasData} area />
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            <MetricText value={row.completed} noData={!row.hasData} color={completedColor} />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText value={row.area} noData={!row.hasData} area />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText value={row.ongoing} noData={!row.hasData} color={ongoingColor} />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText value={row.notStarted} noData={!row.hasData} color={notStartedColor} />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText value={row.underReview} noData={!row.hasData} color={reviewColor} />
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title={row.hasData ? 'View block details' : 'No data available'}>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!row.hasData}
                                  onClick={() => handleViewBlockDetails(row.taluk, row.id, row.hasData)}
                                  aria-label={row.hasData ? `View block details for ${row.taluk}` : `No data available for ${row.taluk}`}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                  }}
                                >
                                  {row.hasData ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
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

            {filteredData.length > 0 && (
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[15, 25, 50, 100]}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  '.MuiTablePagination-toolbar': { flexWrap: 'wrap' }
                }}
              />
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default TalukFormReport;

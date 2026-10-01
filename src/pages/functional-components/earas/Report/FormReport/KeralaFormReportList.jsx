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
import { useNavigate } from 'react-router-dom';

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

// Keep this true while the BTR endpoint supports seasonId.
const BTR_SUPPORTS_SEASON_ID = true;

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
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const currentValue = `${mm}-${yyyy}`;

  return (
    monthOptions.find((option) => option.value === currentValue)?.value ||
    monthOptions[monthOptions.length - 1]?.value ||
    monthOptions[0]?.value ||
    ''
  );
}

function normalizeDistrictName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/district/gi, '')
    .replace(/[^a-z0-9]/gi, '');
}

function pickMetric(district, metric, landType) {
  if (!district || typeof district !== 'object') return 0;

  const getValue = (key) => {
    if (!key || district[key] === undefined || district[key] === null) return null;
    const number = Number(district[key]);
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

function getFallbackDistricts() {
  return [
    { distId: 1, distNameEn: 'Thiruvananthapuram' },
    { distId: 2, distNameEn: 'Kollam' },
    { distId: 3, distNameEn: 'Pathanamthitta' },
    { distId: 4, distNameEn: 'Alappuzha' },
    { distId: 5, distNameEn: 'Kottayam' },
    { distId: 6, distNameEn: 'Idukki' },
    { distId: 7, distNameEn: 'Ernakulam' },
    { distId: 8, distNameEn: 'Thrissur' },
    { distId: 9, distNameEn: 'Palakkad' },
    { distId: 10, distNameEn: 'Malappuram' },
    { distId: 11, distNameEn: 'Kozhikode' },
    { distId: 12, distNameEn: 'Wayanad' },
    { distId: 13, distNameEn: 'Kannur' },
    { distId: 14, distNameEn: 'Kasaragod' }
  ];
}

const formatArea = (number) =>
  Number(number || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const getSeasonLabel = (value) =>
  SEASON_OPTIONS.find((option) => option.value === Number(value))?.label || 'Season';

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

            <Typography
              variant="body2"
              sx={{ mt: 0.7, color: 'text.primary', fontWeight: 600 }}
            >
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

function KeralaFormReportList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const latestRequestRef = useRef(0);

  const baseUrl = mainapi.FORM_API;

  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = defaultToMonth;

  const getMonthLabel = useCallback(
    (value) => monthOptions.find((option) => option.value === value)?.label || value,
    [monthOptions]
  );

  const [btrData, setBtrData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);

  const [landTypeTab, setLandTypeTab] = useState('ALL');
  const [seasonId, setSeasonId] = useState(DEFAULT_SEASON_ID);
  const [filterType, setFilterType] = useState('range');
  const [fromMonth, setFromMonth] = useState(defaultFromMonth);
  const [toMonth, setToMonth] = useState(defaultToMonth);
  const [singleMonth, setSingleMonth] = useState(defaultSingleMonth);

  const [loading, setLoading] = useState(false);
  const [masterDistrictsLoading, setMasterDistrictsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const fromMonthIndex = useMemo(
    () => monthOptions.findIndex((option) => option.value === fromMonth),
    [fromMonth, monthOptions]
  );

  const fetchMasterDistricts = useCallback(async () => {
    setMasterDistrictsLoading(true);

    try {
      const response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/districts`);
      const source = response?.data?.data;

      if (Array.isArray(source) && source.length > 0) {
        setDistrictsList(
          source.map((district) => ({
            distId: district.distId,
            distNameEn: district.distNameEn || district.districtName || district.name || ''
          }))
        );
      } else {
        setDistrictsList(getFallbackDistricts());
      }
    } catch (fetchError) {
      console.error('Error fetching master districts:', fetchError);
      setDistrictsList(getFallbackDistricts());
    } finally {
      setMasterDistrictsLoading(false);
    }
  }, []);

  const fetchDistrictData = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

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

      const effectiveSeasonId = Number(seasonId) || DEFAULT_SEASON_ID;
      const currentAgriYear =
        (AuthService && AuthService.agriyear ? AuthService.agriyear() : null) ||
        localStorage.getItem('activeAgriYear') ||
        '2025-2026';

      const formStatusParams = new URLSearchParams({
        agriYear: currentAgriYear,
        startMonth: startMonthValue,
        endMonth: endMonthValue,
        seasonId: String(effectiveSeasonId)
      });

      if (landTypeTab !== 'ALL') {
        formStatusParams.append('landType', landTypeTab);
      }

      const btrParams = new URLSearchParams({ agriYear: currentAgriYear });

      if (BTR_SUPPORTS_SEASON_ID) {
        btrParams.append('seasonId', String(effectiveSeasonId));
      }

      if (landTypeTab !== 'ALL') {
        btrParams.append('landType', landTypeTab);
      }

      const formStatusUrl = `${baseUrl}/earas-form1-entry/api/progress-report/form1-status/state?${formStatusParams.toString()}`;
      const completedClustersUrlPrimary = `${mainapi.BTR_API}/btr-service/api/report/dashboard/completed/state?${btrParams.toString()}`;
      const completedClustersUrlFallback = `${mainapi.BTR_API}/btr-service/api/report/completed-clusters?${btrParams.toString()}`;
      const headers = { Authorization: `Bearer ${token}` };

      const btrRequest = (async () => {
        try {
          const response = await axios.get(completedClustersUrlPrimary, { headers });
          return response.data || null;
        } catch (primaryError) {
          console.warn(
            'BTR primary endpoint failed; attempting fallback:',
            primaryError?.message
          );

          try {
            const fallbackResponse = await axios.get(completedClustersUrlFallback, { headers });
            return fallbackResponse.data || null;
          } catch (fallbackError) {
            console.warn(
              'BTR completed clusters fallback endpoint also failed:',
              fallbackError?.message
            );
            return null;
          }
        }
      })();

      const lastMonthRequest = (async () => {
        if (filterType !== 'range') return null;

        const lastMonthValue = resolveMonthValue(toMonth || fromMonth, monthOptions);
        if (!lastMonthValue) return null;

        const lastMonthParams = new URLSearchParams({
          agriYear: currentAgriYear,
          startMonth: lastMonthValue,
          endMonth: lastMonthValue,
          seasonId: String(effectiveSeasonId)
        });

        if (landTypeTab !== 'ALL') {
          lastMonthParams.append('landType', landTypeTab);
        }

        const lastMonthUrl = `${baseUrl}/earas-form1-entry/api/progress-report/form1-status/state?${lastMonthParams.toString()}`;

        try {
          const response = await axios.get(lastMonthUrl, { headers });
          return response.data || null;
        } catch (lastMonthError) {
          console.error('Error fetching last-month data:', lastMonthError);
          return null;
        }
      })();

      // These requests are independent, so run them together to reduce perceived loading time.
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

      console.error('Error fetching district data:', fetchError);
      setError(
        fetchError.response?.data?.message ||
        fetchError.message ||
        'Failed to fetch district data'
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
    seasonId,
    singleMonth,
    toMonth
  ]);

  useEffect(() => {
    fetchMasterDistricts();
  }, [fetchMasterDistricts]);

  useEffect(() => {
    fetchDistrictData();
  }, [fetchDistrictData]);

  const districtData = useMemo(() => {
    const apiDistricts = apiData?.allSubDetails || {};
    const btrDistricts = btrData?.allSubDetails || {};
    const lastMonthDistricts =
      filterType === 'range' && lastMonthApiData
        ? lastMonthApiData.allSubDetails || {}
        : {};

    const createLookup = (source) => {
      const byId = {};
      const byName = {};

      Object.entries(source).forEach(([name, details]) => {
        const id = details?.id || details?.distId || details?.districtId;
        if (id) byId[id] = { name, details };

        const normalizedName = normalizeDistrictName(name);
        if (normalizedName) byName[normalizedName] = { name, details };
      });

      return { byId, byName };
    };

    const apiLookup = createLookup(apiDistricts);
    const btrLookup = createLookup(btrDistricts);
    const lastMonthLookup = createLookup(lastMonthDistricts);

    const resolveDetails = (lookup, districtId, districtName) => {
      if (districtId && lookup.byId[districtId]) {
        return lookup.byId[districtId];
      }

      const normalizedName = normalizeDistrictName(districtName);
      return normalizedName ? lookup.byName[normalizedName] || null : null;
    };

    const getLastMonthMetrics = (districtId, districtName) => {
      const match = resolveDetails(lastMonthLookup, districtId, districtName)?.details;
      if (!match) return { count: 0, area: 0 };

      const count = pickMetric(match, 'Completed', landTypeTab);
      const rawArea = pickMetric(match, 'ClusterArea', landTypeTab);

      return {
        count,
        area: count > 0 ? rawArea : 0
      };
    };

    const buildRow = (districtId, districtName, apiDetails, apiDisplayName) => {
      const completed = pickMetric(apiDetails, 'Completed', landTypeTab);
      const ongoing = pickMetric(apiDetails, 'Ongoing', landTypeTab);
      const underReview = pickMetric(apiDetails, 'UnderReview', landTypeTab);
      const rawArea = pickMetric(apiDetails, 'ClusterArea', landTypeTab);
      const area = completed > 0 ? rawArea : 0;
      const currentMonth = getLastMonthMetrics(districtId, districtName);

      const btrDetails =
        resolveDetails(btrLookup, districtId, districtName)?.details || {};
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
        id: districtId || apiDetails?.id || normalizeDistrictName(districtName) || districtName,
        district: districtName || apiDisplayName || 'Unknown District',
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

    if (districtsList?.length) {
      return districtsList.map((district) => {
        const districtId = district.distId;
        const districtName = district.distNameEn || '';
        const apiMatch = resolveDetails(apiLookup, districtId, districtName);

        return buildRow(
          districtId,
          districtName,
          apiMatch?.details || {},
          apiMatch?.name
        );
      });
    }

    return Object.entries(apiDistricts).map(([districtName, details]) =>
      buildRow(
        details?.id || details?.distId || details?.districtId,
        districtName,
        details,
        districtName
      )
    );
  }, [
    apiData,
    btrData,
    districtsList,
    filterType,
    landTypeTab,
    lastMonthApiData
  ]);

  const districtsWithNoData = useMemo(
    () => districtData.filter((district) => !district.hasData).length,
    [districtData]
  );

  const stats = useMemo(() => {
    const totalFromDistricts = districtData.reduce(
      (sum, district) => sum + (district.total || 0),
      0
    );

    return {
      all:
        totalFromDistricts > 0
          ? totalFromDistricts
          : btrData?.totalClusterCompleted || 0,
      completed: districtData.reduce(
        (sum, district) => sum + (district.completed || 0),
        0
      ),
      currentMonthCompleted: districtData.reduce(
        (sum, district) => sum + (district.currentMonthCompleted || 0),
        0
      ),
      currentMonthArea: districtData.reduce(
        (sum, district) => sum + (district.currentMonthArea || 0),
        0
      ),
      ongoing: districtData.reduce(
        (sum, district) => sum + (district.ongoing || 0),
        0
      ),
      notStarted: districtData.reduce(
        (sum, district) => sum + (district.notStarted || 0),
        0
      ),
      underReview: districtData.reduce(
        (sum, district) => sum + (district.underReview || 0),
        0
      ),
      completedArea: districtData.reduce(
        (sum, district) => sum + (district.area || 0),
        0
      )
    };
  }, [btrData, districtData]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return districtData;

    return districtData.filter((row) =>
      row.district.toLowerCase().includes(normalizedSearch)
    );
  }, [districtData, searchTerm]);

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
    const parts = ['District_Report', getSeasonLabel(seasonId)];

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
      // Lazy-load XLSX so it does not increase the initial page bundle unnecessarily.
      const XLSX = await import('xlsx');

      const exportRows = filteredData.map((row, index) => {
        const rowObject = {
          '#': index + 1,
          Season: getSeasonLabel(seasonId),
          'Land Type': landTypeTab,
          District: row.district,
          Total: row.hasData ? row.total : 'NA'
        };

        if (filterType === 'range') {
          rowObject['During the Month'] = row.hasData
            ? row.currentMonthCompleted
            : 'NA';
          rowObject['During Month Area (cents)'] = row.hasData
            ? row.currentMonthArea
            : 'NA';
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');
      XLSX.writeFile(workbook, generateExcelFileName());
    } catch (exportError) {
      console.error('Excel export failed:', exportError);
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (districtId, districtName, hasData) => {
    if (!hasData) return;

    navigate(`/kerala_form_report/taluk_form_report/${districtName.toLowerCase()}`, {
      state: {
        districtId,
        fromMonth,
        toMonth,
        // Backward compatibility with the taluk page.
        seasonTab: landTypeTab,
        landType: landTypeTab,
        seasonId: Number(seasonId) || DEFAULT_SEASON_ID,
        filterType,
        singleMonth
      }
    });
  };

  const reportPeriodText =
    filterType === 'single'
      ? getMonthLabel(singleMonth)
      : `${getMonthLabel(fromMonth)} – ${getMonthLabel(toMonth)}`;

  const isInitialLoading =
    (loading || masterDistrictsLoading) && !apiData && districtsList.length === 0;

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
              Loading district progress report…
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
              <Button color="inherit" size="small" onClick={fetchDistrictData}>
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
              <AssessmentIcon />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Cluster Enumeration Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {getSeasonLabel(seasonId)} • {reportPeriodText}
                {landTypeTab !== 'ALL' ? ` • ${landTypeTab} Land` : ' • All Land'}
                {loading ? ' • Refreshing…' : ''}
              </Typography>
            </Box>
          </Stack>

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
        </Stack>
      </Grid>

      {error && apiData && (
        <Grid item xs={12}>
          <Alert severity="warning">
            The latest refresh failed. The last successfully loaded data is still shown. {error}
          </Alert>
        </Grid>
      )}

      {districtsWithNoData > 0 && !loading && (
        <Grid item xs={12}>
          <Alert severity="warning">
            {districtsWithNoData} district{districtsWithNoData === 1 ? '' : 's'} have no
            data for the selected filters. Detail view is unavailable for those districts.
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
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Filters
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose the season, land type and reporting period.
                </Typography>
              </Box>
            </Stack>

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
                  <InputLabel id="season-select-label">Season</InputLabel>
                  <Select
                    labelId="season-select-label"
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
                    '& .MuiTab-root': {
                      minHeight: 38,
                      minWidth: 0,
                      px: 1
                    }
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
                State Summary
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
              value={stats.all}
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
          {loading && <LinearProgress aria-label="Refreshing district data" />}

          <Box sx={{ p: { xs: 2, md: 2.5 }, pb: 1.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  District Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredData.length} district{filteredData.length === 1 ? '' : 's'} shown
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.25}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <TextField
                  label="Search districts"
                  placeholder="e.g. Kollam"
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
                          aria-label="Clear district search"
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
                      ? `Export ${filteredData.length} district${filteredData.length === 1 ? '' : 's'
                      } to Excel`
                      : 'No data available to export'
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        exporting ? <CircularProgress size={16} /> : <DownloadIcon />
                      }
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
                  No matching districts
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
                            sx={{
                              color: row.hasData
                                ? 'primary.main'
                                : 'warning.main'
                            }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {row.district}
                          </Typography>
                        </Stack>

                        {!row.hasData && (
                          <Chip
                            label="No Data"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
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
                            <MetricText
                              value={row.currentMonthArea}
                              noData={!row.hasData}
                              area
                            />
                          </MobileMetric>
                        )}

                        <MobileMetric
                          label={filterType === 'range' ? 'Up to Month' : 'During Month'}
                        >
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
                        onClick={() =>
                          handleViewDetails(row.id, row.district, row.hasData)
                        }
                        sx={{ mt: 1.5 }}
                      >
                        {row.hasData ? 'View district details' : 'Details unavailable'}
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
                  aria-label="District cluster enumeration progress"
                  sx={{
                    minWidth: filterType === 'range' ? 1120 : 920,
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
                          minWidth: 210,
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
                        District
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700
                        }}
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
                            borderBottom: `1px solid ${alpha(
                              theme.palette.common.white,
                              0.18
                            )}`
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
                          borderBottom: `1px solid ${alpha(
                            theme.palette.common.white,
                            0.18
                          )}`
                        }}
                      >
                        {filterType === 'range' ? 'Up to the Month' : 'During the Month'}
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Ongoing
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Not Started
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Under Review
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      {filterType === 'range' && (
                        <>
                          <TableCell
                            align="center"
                            sx={{
                              color: 'primary.contrastText',
                              bgcolor: headerBackground,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              top: 41
                            }}
                          >
                            Count
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: 'primary.contrastText',
                              bgcolor: headerBackground,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              top: 41
                            }}
                          >
                            Area (cents)
                          </TableCell>
                        </>
                      )}

                      <TableCell
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          top: 41
                        }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          top: 41
                        }}
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
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 3,
                              bgcolor: 'inherit',
                              width: 56,
                              minWidth: 56
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
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
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: row.hasData ? 600 : 500,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {row.district}
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
                            <MetricText value={row.total} noData={!row.hasData} />
                          </TableCell>

                          {filterType === 'range' && (
                            <>
                              <TableCell align="center">
                                <MetricText
                                  value={row.currentMonthCompleted}
                                  noData={!row.hasData}
                                  color={ongoingColor}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <MetricText
                                  value={row.currentMonthArea}
                                  noData={!row.hasData}
                                  area
                                />
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            <MetricText
                              value={row.completed}
                              noData={!row.hasData}
                              color={completedColor}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText value={row.area} noData={!row.hasData} area />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText
                              value={row.ongoing}
                              noData={!row.hasData}
                              color={ongoingColor}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText
                              value={row.notStarted}
                              noData={!row.hasData}
                              color={notStartedColor}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <MetricText
                              value={row.underReview}
                              noData={!row.hasData}
                              color={reviewColor}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip
                              title={
                                row.hasData
                                  ? `View ${row.district} details`
                                  : 'No data available for this district'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={!row.hasData}
                                  aria-label={
                                    row.hasData
                                      ? `View details for ${row.district}`
                                      : `Details unavailable for ${row.district}`
                                  }
                                  onClick={() =>
                                    handleViewDetails(row.id, row.district, row.hasData)
                                  }
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                      bgcolor: (currentTheme) =>
                                        alpha(currentTheme.palette.primary.main, 0.08)
                                    }
                                  }}
                                >
                                  {row.hasData ? <VisibilityIcon /> : <VisibilityOffIcon />}
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
          </Box>

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
        </Paper>
      </Grid>
    </Grid>
  );
}

export default KeralaFormReportList;

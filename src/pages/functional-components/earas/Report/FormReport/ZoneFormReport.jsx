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
import StoreIcon from '@mui/icons-material/Store';
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

// The supplied page deliberately disables zone-details navigation.
// Set this to true only after /kerala_form_report/zone-details/:zoneId is live.
const ZONE_DETAILS_ENABLED = false;

const getSeasonLabel = (value) =>
  SEASON_OPTIONS.find((option) => option.value === Number(value))?.label || 'Autumn';

const normalizeSeasonId = (value) => {
  const number = Number(value);
  return SEASON_OPTIONS.some((option) => option.value === number)
    ? number
    : DEFAULT_SEASON_ID;
};

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

function normalizeZoneName(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function titleFromRoute(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function pickMetric(zone, metric, landType) {
  if (!zone || typeof zone !== 'object') return 0;

  const getValue = (key) => {
    if (!key || zone[key] === undefined || zone[key] === null) return null;
    const number = Number(zone[key]);
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

// Keep loose matching ambiguity-safe.
// Example: "Pothencode 1" must not accidentally match "Pothencode 10".
function findUniqueLooseMatch(mapByName, searchKey) {
  if (!searchKey) return null;

  const candidates = Object.keys(mapByName).filter(
    (key) =>
      key === searchKey ||
      key.includes(searchKey) ||
      searchKey.includes(key)
  );

  return candidates.length === 1 ? mapByName[candidates[0]] : null;
}

function resolveBlockName(blockId, blockName, zoneName) {
  const lowerName = String(zoneName || '').toLowerCase();

  if (lowerName.includes('municipality')) return 'Municipality';
  if (lowerName.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;

  return blockName || 'Unassigned';
}

const formatArea = (number) =>
  Number(number || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

// Preserved from the supplied page as a fallback if the master-zone endpoint fails.
function getFallbackZones() {
  return [
    { zoneId: 1, zoneNameEn: 'Zone 1', blockName: 'Block A' },
    { zoneId: 2, zoneNameEn: 'Zone 2', blockName: 'Block A' },
    { zoneId: 3, zoneNameEn: 'Zone 3', blockName: 'Block B' },
    { zoneId: 4, zoneNameEn: 'Zone 4', blockName: 'Block B' },
    { zoneId: 5, zoneNameEn: 'Zone 5', blockName: 'Block C' }
  ];
}

function MetricText({
  value,
  noData = false,
  color = 'text.primary',
  area = false,
  strong = false
}) {
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
        color: Number(value || 0) > 0 ? color : 'text.secondary',
        fontWeight: strong ? 700 : Number(value || 0) > 0 ? 600 : 400,
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

function ZoneFormReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName, talukId: routeTalukId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const latestRequestRef = useRef(0);

  const baseUrl = mainapi.FORM_API;
  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = defaultToMonth;

  const stateData = useMemo(() => location.state || {}, [location.state]);

  const resolvedTalukId = useMemo(() => {
    if (stateData.talukId !== undefined && stateData.talukId !== null) {
      return stateData.talukId;
    }

    if (stateData.talukOfficeId !== undefined && stateData.talukOfficeId !== null) {
      return stateData.talukOfficeId;
    }

    if (routeTalukId && !Number.isNaN(Number(routeTalukId))) {
      return Number(routeTalukId);
    }

    return null;
  }, [routeTalukId, stateData.talukId, stateData.talukOfficeId]);

  const resolvedDistrictId = stateData.districtId ?? null;

  const formattedTaluk = useMemo(
    () => (talukName ? titleFromRoute(talukName) : stateData.talukName || 'Taluk'),
    [stateData.talukName, talukName]
  );

  const displayDistrictName = useMemo(
    () =>
      districtName
        ? titleFromRoute(districtName)
        : stateData.districtName
          ? titleFromRoute(stateData.districtName)
          : '',
    [districtName, stateData.districtName]
  );

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
    [
      defaultFromMonth,
      defaultSingleMonth,
      defaultToMonth,
      monthOptions,
      stateData.filterType,
      stateData.fromMonth,
      stateData.landType,
      stateData.seasonId,
      stateData.seasonTab,
      stateData.singleMonth,
      stateData.toMonth
    ]
  );

  const getMonthLabel = useCallback(
    (value) => monthOptions.find((option) => option.value === value)?.label || value,
    [monthOptions]
  );

  const [btrData, setBtrData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [zonesList, setZonesList] = useState([]);

  const [landTypeTab, setLandTypeTab] = useState(initialFilters.landTypeTab);
  const [seasonId, setSeasonId] = useState(initialFilters.seasonId);
  const [filterType, setFilterType] = useState(initialFilters.filterType);
  const [fromMonth, setFromMonth] = useState(initialFilters.fromMonth);
  const [toMonth, setToMonth] = useState(initialFilters.toMonth);
  const [singleMonth, setSingleMonth] = useState(initialFilters.singleMonth);

  const [loading, setLoading] = useState(false);
  const [masterZonesLoading, setMasterZonesLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const fromMonthIndex = useMemo(
    () => monthOptions.findIndex((option) => option.value === fromMonth),
    [fromMonth, monthOptions]
  );

  const fetchMasterZones = useCallback(async () => {
    if (!resolvedTalukId) {
      setMasterZonesLoading(false);
      return;
    }

    setMasterZonesLoading(true);

    try {
      const response = await api.get(
        `${mainapi.BTR_API}/btr-service/btr-api/zones?desTalukId=${resolvedTalukId}`
      );
      const source = response?.data?.data;

      if (Array.isArray(source) && source.length > 0) {
        setZonesList(source);
      } else {
        setZonesList(getFallbackZones(resolvedTalukId));
      }
    } catch (fetchError) {
      console.error('Error fetching master zones:', fetchError);
      setZonesList(getFallbackZones(resolvedTalukId));
    } finally {
      setMasterZonesLoading(false);
    }
  }, [resolvedTalukId]);

  const fetchZoneData = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    if (!resolvedTalukId) {
      setError('Taluk ID is required. Please navigate from the taluk report page.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let startMonthValue = defaultFromMonth;
      let endMonthValue = monthOptions[monthOptions.length - 1]?.value || defaultToMonth;

      if (filterType === 'single') {
        const resolvedMonth = resolveMonthValue(singleMonth, monthOptions);
        startMonthValue = resolvedMonth;
        endMonthValue = resolvedMonth;
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
        talukId: String(resolvedTalukId),
        startMonth: startMonthValue,
        endMonth: endMonthValue,
        seasonId: String(effectiveSeasonId)
      });

      if (landTypeTab !== 'ALL') formParams.append('landType', landTypeTab);

      const btrParams = new URLSearchParams({
        agriYear: currentAgriYear,
        talukId: String(resolvedTalukId)
      });

      if (BTR_SUPPORTS_SEASON_ID) {
        btrParams.append('seasonId', String(effectiveSeasonId));
      }

      if (landTypeTab !== 'ALL') btrParams.append('landType', landTypeTab);

      const formStatusUrl =
        `${baseUrl}/earas-form1-entry/api/progress-report/form1-status/taluk?${formParams.toString()}`;
      const completedClustersUrl =
        `${mainapi.BTR_API}/btr-service/api/report/dashboard/completed/zone?${btrParams.toString()}`;

      const headers = { Authorization: `Bearer ${token}` };

      const btrRequest = (async () => {
        try {
          const response = await axios.get(completedClustersUrl, { headers });
          return response.data || null;
        } catch (btrError) {
          console.warn('BTR zone completed-clusters request failed:', btrError?.message);
          return null;
        }
      })();

      const lastMonthRequest = (async () => {
        if (filterType !== 'range') return null;

        const lastMonthValue = resolveMonthValue(toMonth || fromMonth, monthOptions);
        if (!lastMonthValue) return null;

        const lastMonthParams = new URLSearchParams({
          agriYear: currentAgriYear,
          talukId: String(resolvedTalukId),
          startMonth: lastMonthValue,
          endMonth: lastMonthValue,
          seasonId: String(effectiveSeasonId)
        });

        if (landTypeTab !== 'ALL') {
          lastMonthParams.append('landType', landTypeTab);
        }

        const lastMonthUrl =
          `${baseUrl}/earas-form1-entry/api/progress-report/form1-status/taluk?${lastMonthParams.toString()}`;

        try {
          const response = await axios.get(lastMonthUrl, { headers });
          return response.data || null;
        } catch (lastMonthError) {
          console.error('Error fetching last-month zone data:', lastMonthError);
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

      console.error('Error fetching zone data:', fetchError);
      setError(
        fetchError.response?.data?.message ||
        fetchError.message ||
        'Failed to fetch zone data'
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
    resolvedTalukId,
    seasonId,
    singleMonth,
    toMonth
  ]);

  useEffect(() => {
    fetchMasterZones();
  }, [fetchMasterZones]);

  useEffect(() => {
    fetchZoneData();
  }, [fetchZoneData]);

  const processedData = useMemo(() => {
    const apiZones = apiData?.allSubDetails || {};
    const btrZones = btrData?.allSubDetails || {};
    const lastMonthZones =
      filterType === 'range' && lastMonthApiData
        ? lastMonthApiData.allSubDetails || {}
        : {};

    const createLookup = (source) => {
      const byId = {};
      const byName = {};

      Object.entries(source).forEach(([key, details]) => {
        const zoneId = details?.zoneId || details?.id;
        if (zoneId) byId[zoneId] = details;

        const name = details?.zoneName || details?.zoneNameEn || key;
        const normalizedName = normalizeZoneName(name);
        if (normalizedName) byName[normalizedName] = details;
      });

      return { byId, byName };
    };

    const apiLookup = createLookup(apiZones);
    const btrLookup = createLookup(btrZones);
    const lastMonthLookup = createLookup(lastMonthZones);

    const resolveDetails = (lookup, zoneId, zoneName, loose = true) => {
      if (zoneId && lookup.byId[zoneId]) return lookup.byId[zoneId];

      const normalizedName = normalizeZoneName(zoneName);
      if (normalizedName && lookup.byName[normalizedName]) {
        return lookup.byName[normalizedName];
      }

      return loose
        ? findUniqueLooseMatch(lookup.byName, normalizedName)
        : null;
    };

    const getLastMonthMetrics = (zoneId, zoneName) => {
      const details = resolveDetails(lastMonthLookup, zoneId, zoneName);
      if (!details) return { count: 0, area: 0 };

      const count = pickMetric(details, 'Completed', landTypeTab);
      const rawArea = pickMetric(details, 'ClusterArea', landTypeTab);

      return {
        count,
        area: count > 0 ? rawArea : 0
      };
    };

    const buildZone = ({
      zoneId,
      zoneName,
      masterBlockId,
      masterBlockName,
      apiDetails
    }) => {
      const details = apiDetails || {};
      const completed = pickMetric(details, 'Completed', landTypeTab);
      const ongoing = pickMetric(details, 'Ongoing', landTypeTab);
      const underReview = pickMetric(details, 'UnderReview', landTypeTab);
      const rawArea = pickMetric(details, 'ClusterArea', landTypeTab);
      const area = completed > 0 ? rawArea : 0;

      const currentMonth = getLastMonthMetrics(zoneId, zoneName);

      const btrDetails = resolveDetails(btrLookup, zoneId, zoneName) || {};
      const total = pickMetric(btrDetails, 'Completed', landTypeTab);
      const notStarted = Math.max(total - completed, 0);

      const hasData =
        completed > 0 ||
        ongoing > 0 ||
        notStarted > 0 ||
        underReview > 0 ||
        area > 0 ||
        total > 0;

      const blockId = details?.blockId ?? masterBlockId ?? null;
      const rawBlockName = details?.blockName || masterBlockName || 'Unassigned';
      const blockName = resolveBlockName(blockId, rawBlockName, zoneName);

      return {
        zoneId:
          zoneId ||
          details?.zoneId ||
          details?.id ||
          normalizeZoneName(zoneName) ||
          zoneName,
        zoneName: zoneName || details?.zoneName || 'Unknown Zone',
        blockId,
        blockName,
        total,
        completed,
        currentMonthCompleted: currentMonth.count,
        currentMonthArea: currentMonth.area,
        ongoing,
        notStarted,
        underReview,
        area,
        hasData,
        isMunicipality: blockName === 'Municipality',
        isCorporation: blockName === 'Corporation'
      };
    };

    let mergedZones;

    if (zonesList?.length) {
      mergedZones = zonesList.map((zone) => {
        const zoneId = zone.zoneId || zone.id;
        const zoneName = zone.zoneNameEn || zone.zoneName || '';
        const apiDetails = resolveDetails(apiLookup, zoneId, zoneName);

        return buildZone({
          zoneId,
          zoneName,
          masterBlockId: zone.blockId,
          masterBlockName: zone.blockName,
          apiDetails
        });
      });
    } else {
      mergedZones = Object.entries(apiZones).map(([key, details]) => {
        const zoneName = details?.zoneName || key;

        return buildZone({
          zoneId: details?.zoneId || details?.id,
          zoneName,
          masterBlockId: details?.blockId,
          masterBlockName: details?.blockName,
          apiDetails: details
        });
      });
    }

    const blockMap = new Map();
    const municipalityZones = [];
    const corporationZones = [];

    mergedZones.forEach((zone) => {
      if (zone.isMunicipality) {
        municipalityZones.push(zone);
        return;
      }

      if (zone.isCorporation) {
        corporationZones.push(zone);
        return;
      }

      const blockKey = zone.blockId || zone.blockName || 'Unassigned';

      if (!blockMap.has(blockKey)) {
        blockMap.set(blockKey, {
          blockId: zone.blockId || blockKey,
          blockName: zone.blockName || 'Unassigned',
          zones: []
        });
      }

      blockMap.get(blockKey).zones.push(zone);
    });

    const blocks = Array.from(blockMap.values()).sort((a, b) =>
      a.blockName.localeCompare(b.blockName)
    );

    blocks.forEach((block) => {
      block.zones.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
    });

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
  }, [apiData, btrData, filterType, landTypeTab, lastMonthApiData, zonesList]);

  const zoneCount = useMemo(
    () => processedData.reduce((sum, block) => sum + block.zones.length, 0),
    [processedData]
  );

  const zonesWithNoData = useMemo(
    () =>
      processedData.reduce(
        (sum, block) => sum + block.zones.filter((zone) => !zone.hasData).length,
        0
      ),
    [processedData]
  );

  const stats = useMemo(() => {
    const totals = {
      total: 0,
      completed: 0,
      currentMonthCompleted: 0,
      currentMonthArea: 0,
      ongoing: 0,
      notStarted: 0,
      underReview: 0,
      completedArea: 0
    };

    processedData.forEach((block) => {
      block.zones.forEach((zone) => {
        totals.total += zone.total || 0;
        totals.completed += zone.completed || 0;
        totals.currentMonthCompleted += zone.currentMonthCompleted || 0;
        totals.currentMonthArea += zone.currentMonthArea || 0;
        totals.ongoing += zone.ongoing || 0;
        totals.notStarted += zone.notStarted || 0;
        totals.underReview += zone.underReview || 0;
        totals.completedArea += zone.area || 0;
      });
    });

    if (totals.total <= 0) {
      totals.total = btrData?.totalClusterCompleted || 0;
    }

    return totals;
  }, [btrData, processedData]);

  const flattenedTableData = useMemo(() => {
    const rows = [];

    processedData.forEach((block) => {
      const subtotal = {
        total: 0,
        completed: 0,
        currentMonthCompleted: 0,
        currentMonthArea: 0,
        ongoing: 0,
        notStarted: 0,
        underReview: 0,
        area: 0
      };

      block.zones.forEach((zone) => {
        subtotal.total += zone.total || 0;
        subtotal.completed += zone.completed || 0;
        subtotal.currentMonthCompleted += zone.currentMonthCompleted || 0;
        subtotal.currentMonthArea += zone.currentMonthArea || 0;
        subtotal.ongoing += zone.ongoing || 0;
        subtotal.notStarted += zone.notStarted || 0;
        subtotal.underReview += zone.underReview || 0;
        subtotal.area += zone.area || 0;

        rows.push({
          type: 'zone',
          id: `${block.blockId}_zone_${zone.zoneId}`,
          blockId: block.blockId,
          blockName: block.blockName,
          zoneName: zone.zoneName,
          zoneId: zone.zoneId,
          total: zone.total,
          completed: zone.completed,
          currentMonthCompleted: zone.currentMonthCompleted,
          currentMonthArea: zone.currentMonthArea,
          ongoing: zone.ongoing,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          area: zone.area,
          hasData: zone.hasData,
          isMunicipality: Boolean(block.isMunicipality),
          isCorporation: Boolean(block.isCorporation)
        });
      });

      rows.push({
        type: 'subtotal',
        id: `block_${block.blockId}_subtotal`,
        blockId: block.blockId,
        blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        ...subtotal,
        hasData: block.zones.some((zone) => zone.hasData),
        isMunicipality: Boolean(block.isMunicipality),
        isCorporation: Boolean(block.isCorporation)
      });
    });

    return rows;
  }, [processedData]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return flattenedTableData;

    return flattenedTableData.filter(
      (row) =>
        row.zoneName.toLowerCase().includes(query) ||
        row.blockName.toLowerCase().includes(query)
    );
  }, [flattenedTableData, searchTerm]);

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(filteredData.length / rowsPerPage) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [filteredData.length, page, rowsPerPage]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const zoneSerialById = useMemo(() => {
    const map = new Map();
    let serial = 0;

    filteredData.forEach((row) => {
      if (row.type !== 'subtotal') {
        serial += 1;
        map.set(row.id, serial);
      }
    });

    return map;
  }, [filteredData]);

  const reportPeriodText =
    filterType === 'single'
      ? getMonthLabel(singleMonth)
      : `${getMonthLabel(fromMonth)} – ${getMonthLabel(toMonth)}`;

  const filtersAreDirty =
    filterType !== 'range' ||
    fromMonth !== defaultFromMonth ||
    toMonth !== defaultToMonth ||
    singleMonth !== defaultSingleMonth ||
    landTypeTab !== 'ALL' ||
    Number(seasonId) !== DEFAULT_SEASON_ID;

  const handleFromMonthChange = (event) => {
    const nextFrom = event.target.value;
    const nextFromIndex = monthOptions.findIndex((option) => option.value === nextFrom);
    const currentToIndex = monthOptions.findIndex((option) => option.value === toMonth);

    setFromMonth(nextFrom);

    if (nextFromIndex >= 0 && (currentToIndex < 0 || currentToIndex < nextFromIndex)) {
      setToMonth(nextFrom);
    }

    setPage(0);
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

  const generateExcelFileName = () => {
    const parts = ['Zone_Report', formattedTaluk.replace(/\s+/g, '_')];

    parts.push(getSeasonLabel(seasonId));

    if (landTypeTab !== 'ALL') parts.push(landTypeTab);

    if (filterType === 'single') {
      parts.push(getMonthLabel(singleMonth).replace(/\s+/g, '_'));
    } else {
      parts.push(
        getMonthLabel(fromMonth).replace(/\s+/g, '_'),
        'to',
        getMonthLabel(toMonth).replace(/\s+/g, '_')
      );
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
      const seasonLabel = getSeasonLabel(seasonId);

      const exportRows = filteredData.map((row) => {
        const isSubtotal = row.type === 'subtotal';
        const hasNoData = !row.hasData && !isSubtotal;

        const exportRow = {
          '#': isSubtotal ? '' : zoneSerialById.get(row.id) || '',
          Season: seasonLabel,
          Block: row.blockName,
          Zone: row.zoneName,
          Total: hasNoData ? 'NA' : row.total
        };

        if (filterType === 'range') {
          exportRow['During the Month'] = hasNoData ? 'NA' : row.currentMonthCompleted;
          exportRow['During Month Area'] = hasNoData
            ? 'NA'
            : row.currentMonthCompleted > 0
              ? row.currentMonthArea
              : 0;
        }

        exportRow['Up to the Month'] = hasNoData ? 'NA' : row.completed;
        exportRow['Area Completed'] = hasNoData
          ? 'NA'
          : row.completed > 0
            ? row.area
            : 0;
        exportRow.Ongoing = hasNoData ? 'NA' : row.ongoing;
        exportRow['Not Started'] = hasNoData ? 'NA' : row.notStarted;
        exportRow['Under Review'] = hasNoData ? 'NA' : row.underReview;

        return exportRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      worksheet['!cols'] =
        filterType === 'range'
          ? [
            { wch: 5 },
            { wch: 12 },
            { wch: 22 },
            { wch: 28 },
            { wch: 10 },
            { wch: 16 },
            { wch: 18 },
            { wch: 16 },
            { wch: 18 },
            { wch: 12 },
            { wch: 14 },
            { wch: 14 }
          ]
          : [
            { wch: 5 },
            { wch: 12 },
            { wch: 22 },
            { wch: 28 },
            { wch: 10 },
            { wch: 16 },
            { wch: 18 },
            { wch: 12 },
            { wch: 14 },
            { wch: 14 }
          ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Zone Report');
      XLSX.writeFile(workbook, generateExcelFileName());
    } catch (exportError) {
      console.error('Excel export failed:', exportError);
      setError('Could not create the Excel file. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleViewZoneDetails = (row) => {
    if (!ZONE_DETAILS_ENABLED || !row?.hasData || row?.type === 'subtotal') return;

    navigate(`/kerala_form_report/zone-details/${row.zoneId}`, {
      state: {
        zoneName: row.zoneName,
        zoneId: row.zoneId,
        districtId: resolvedDistrictId,
        talukId: resolvedTalukId,
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

  const handleGoBack = () => {
    const safeDistrictName = districtName || stateData.districtName || '';
    const formattedDistrictName = safeDistrictName.toLowerCase().replace(/\s+/g, '-');

    navigate(`/kerala_form_report/taluk_form_report/${formattedDistrictName}`, {
      state: {
        districtId: resolvedDistrictId,
        districtName: stateData.districtName || displayDistrictName || '',
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

  const headerBackground = theme.palette.primary.dark;
  const completedColor = theme.palette.success.main;
  const ongoingColor = theme.palette.info.dark;
  const notStartedColor = theme.palette.text.secondary;
  const reviewColor = theme.palette.warning.dark;

  if ((loading || masterZonesLoading) && !apiData && zonesList.length === 0) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              minHeight: 420,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center'
            }}
          >
            <Box>
              <CircularProgress size={34} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading zone data…
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (error && !apiData) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchZoneData}>
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
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                flex: '0 0 auto'
              }}
            >
              <StoreIcon />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {formattedTaluk} Taluk — Zone Report
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {displayDistrictName && `District: ${displayDistrictName} • `}
                {getSeasonLabel(seasonId)} season • {reportPeriodText}
                {landTypeTab !== 'ALL' && ` • ${landTypeTab} land`}
                {zoneCount > 0 && ` • ${zoneCount} zones`}
                {zonesWithNoData > 0 && ` • ${zonesWithNoData} without data`}
                {loading && ' • Refreshing…'}
              </Typography>
            </Box>
          </Stack>

          {filtersAreDirty && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Reset filters
            </Button>
          )}
        </Stack>
      </Grid>

      {error && apiData && (
        <Grid item xs={12}>
          <Alert severity="warning">{error}</Alert>
        </Grid>
      )}

      {zonesWithNoData > 0 && !loading && (
        <Grid item xs={12}>
          <Alert severity="warning">
            {zonesWithNoData} zone{zonesWithNoData === 1 ? '' : 's'} have no data for the
            selected filters. Their detail actions remain unavailable.
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 3
          }}
        >
          {loading && <LinearProgress sx={{ mx: -2, mt: -2, mb: 2 }} />}

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Report Filters
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Choose the crop season, land type and reporting period for this taluk.
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
                  <InputLabel id="zone-season-select-label">Season</InputLabel>
                  <Select
                    labelId="zone-season-select-label"
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
                {formattedTaluk} Summary
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
              icon={<StoreIcon fontSize="small" />}
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
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {loading && <LinearProgress />}

          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              spacing={1.5}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Block and Zone Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredData.length} report row{filteredData.length === 1 ? '' : 's'}
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ width: { xs: '100%', md: 'auto' } }}
              >
                <TextField
                  label="Search block or zone"
                  placeholder="e.g. Pothencode"
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
                          edge="end"
                          aria-label="Clear block or zone search"
                          onClick={() => {
                            setSearchTerm('');
                            setPage(0);
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />

                <Tooltip
                  title={
                    filteredData.length === 0
                      ? 'No rows available to export'
                      : `Export ${filteredData.length} report row${filteredData.length === 1 ? '' : 's'}`
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
                  No matching blocks or zones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Try changing the search term or report filters.
                </Typography>
              </Box>
            ) : isMobile ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedData.map((row) => {
                  const isSubtotal = row.type === 'subtotal';
                  const noData = !row.hasData && !isSubtotal;
                  const canOpen = ZONE_DETAILS_ENABLED && row.hasData && !isSubtotal;

                  if (isSubtotal) {
                    return (
                      <Card
                        key={row.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2.5,
                          borderColor: alpha(theme.palette.primary.main, 0.22),
                          bgcolor: alpha(theme.palette.primary.main, 0.045)
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Block subtotal
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {row.blockName}
                              </Typography>
                            </Box>
                            <Chip label="Subtotal" size="small" color="primary" variant="outlined" />
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
                              <MetricText value={row.total} strong />
                            </MobileMetric>

                            {filterType === 'range' && (
                              <MobileMetric label="During Month">
                                <MetricText
                                  value={row.currentMonthCompleted}
                                  color={ongoingColor}
                                  strong
                                />
                              </MobileMetric>
                            )}

                            {filterType === 'range' && (
                              <MobileMetric label="Month Area (cents)">
                                <MetricText value={row.currentMonthArea} area strong />
                              </MobileMetric>
                            )}

                            <MobileMetric
                              label={filterType === 'range' ? 'Up to Month' : 'During Month'}
                            >
                              <MetricText value={row.completed} color={completedColor} strong />
                            </MobileMetric>

                            <MobileMetric label="Area (cents)">
                              <MetricText value={row.area} area strong />
                            </MobileMetric>

                            <MobileMetric label="Ongoing">
                              <MetricText value={row.ongoing} color={ongoingColor} strong />
                            </MobileMetric>

                            <MobileMetric label="Not Started">
                              <MetricText value={row.notStarted} color={notStartedColor} strong />
                            </MobileMetric>

                            <MobileMetric label="Under Review">
                              <MetricText value={row.underReview} color={reviewColor} strong />
                            </MobileMetric>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
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
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <LocationOnIcon
                                sx={{ fontSize: 16, color: 'text.secondary' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {row.blockName}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <StoreIcon
                                fontSize="small"
                                sx={{ color: row.hasData ? 'primary.main' : 'warning.main' }}
                              />
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, wordBreak: 'break-word' }}
                              >
                                {row.zoneName}
                              </Typography>
                            </Stack>
                          </Box>

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
                            <MetricText value={row.total} noData={noData} />
                          </MobileMetric>

                          {filterType === 'range' && (
                            <MobileMetric label="During Month">
                              <MetricText
                                value={row.currentMonthCompleted}
                                noData={noData}
                                color={ongoingColor}
                              />
                            </MobileMetric>
                          )}

                          {filterType === 'range' && (
                            <MobileMetric label="Month Area (cents)">
                              <MetricText
                                value={row.currentMonthArea}
                                noData={noData}
                                area
                              />
                            </MobileMetric>
                          )}

                          <MobileMetric
                            label={filterType === 'range' ? 'Up to Month' : 'During Month'}
                          >
                            <MetricText
                              value={row.completed}
                              noData={noData}
                              color={completedColor}
                            />
                          </MobileMetric>

                          <MobileMetric label="Area (cents)">
                            <MetricText value={row.area} noData={noData} area />
                          </MobileMetric>

                          <MobileMetric label="Ongoing">
                            <MetricText
                              value={row.ongoing}
                              noData={noData}
                              color={ongoingColor}
                            />
                          </MobileMetric>

                          <MobileMetric label="Not Started">
                            <MetricText
                              value={row.notStarted}
                              noData={noData}
                              color={notStartedColor}
                            />
                          </MobileMetric>

                          <MobileMetric label="Under Review">
                            <MetricText
                              value={row.underReview}
                              noData={noData}
                              color={reviewColor}
                            />
                          </MobileMetric>
                        </Box>

                        <Tooltip
                          title={
                            !ZONE_DETAILS_ENABLED
                              ? 'Zone details are not enabled yet'
                              : row.hasData
                                ? 'View zone details'
                                : 'No data available'
                          }
                        >
                          <span>
                            <Button
                              fullWidth
                              size="small"
                              variant="text"
                              startIcon={
                                canOpen ? <VisibilityIcon /> : <VisibilityOffIcon />
                              }
                              disabled={!canOpen}
                              onClick={() => handleViewZoneDetails(row)}
                              sx={{ mt: 1.5 }}
                            >
                              {!ZONE_DETAILS_ENABLED
                                ? 'Zone details not enabled'
                                : row.hasData
                                  ? 'View zone details'
                                  : 'Details unavailable'}
                            </Button>
                          </span>
                        </Tooltip>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <TableContainer sx={{ maxHeight: '68vh', overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  size="small"
                  aria-label={`${formattedTaluk} block and zone cluster enumeration progress`}
                  sx={{
                    minWidth: filterType === 'range' ? 1280 : 1080,
                    '& .MuiTableCell-root': {
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    },
                    '& .MuiTableCell-root:last-of-type': {
                      borderRight: 'none'
                    }
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
                          zIndex: 7,
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
                          zIndex: 7,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          width: 180,
                          minWidth: 180
                        }}
                      >
                        Block
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        sx={{
                          position: 'sticky',
                          left: 236,
                          zIndex: 7,
                          color: 'primary.contrastText',
                          bgcolor: headerBackground,
                          fontWeight: 700,
                          minWidth: 220,
                          boxShadow: `2px 0 0 ${alpha(theme.palette.common.white, 0.18)}`
                        }}
                      >
                        Zone
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
                              top: 41,
                              color: 'primary.contrastText',
                              bgcolor: headerBackground,
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          >
                            Count
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
                            Area (cents)
                          </TableCell>
                        </>
                      )}

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
                        Count
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
                        Area (cents)
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedData.map((row) => {
                      const isSubtotal = row.type === 'subtotal';
                      const noData = !row.hasData && !isSubtotal;
                      const rowBackground = isSubtotal
                        ? alpha(theme.palette.primary.main, 0.055)
                        : row.hasData
                          ? theme.palette.background.paper
                          : alpha(theme.palette.warning.main, 0.035);
                      const canOpen =
                        ZONE_DETAILS_ENABLED && row.hasData && !isSubtotal;

                      return (
                        <TableRow
                          key={row.id}
                          hover={!isSubtotal}
                          sx={{
                            bgcolor: rowBackground,
                            '&:hover': {
                              bgcolor: isSubtotal
                                ? rowBackground
                                : row.hasData
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
                            {!isSubtotal && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {zoneSerialById.get(row.id)}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 56,
                              zIndex: 3,
                              bgcolor: 'inherit',
                              width: 180,
                              minWidth: 180
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSubtotal ? 700 : 600,
                                color: isSubtotal ? 'primary.main' : 'text.primary',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {row.blockName}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 236,
                              zIndex: 3,
                              bgcolor: 'inherit',
                              minWidth: 220,
                              boxShadow: `2px 0 0 ${theme.palette.divider}`
                            }}
                          >
                            {isSubtotal ? (
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: 'primary.main' }}
                              >
                                {row.zoneName}
                              </Typography>
                            ) : (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <StoreIcon
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
                                  {row.zoneName}
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
                            )}
                          </TableCell>

                          <TableCell align="center">
                            <MetricText
                              value={row.total}
                              noData={noData}
                              strong={isSubtotal}
                            />
                          </TableCell>

                          {filterType === 'range' && (
                            <>
                              <TableCell align="center">
                                <MetricText
                                  value={row.currentMonthCompleted}
                                  noData={noData}
                                  color={ongoingColor}
                                  strong={isSubtotal}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <MetricText
                                  value={row.currentMonthArea}
                                  noData={noData}
                                  area
                                  strong={isSubtotal}
                                />
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            <MetricText
                              value={row.completed}
                              noData={noData}
                              color={completedColor}
                              strong={isSubtotal}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText
                              value={row.area}
                              noData={noData}
                              area
                              strong={isSubtotal}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText
                              value={row.ongoing}
                              noData={noData}
                              color={ongoingColor}
                              strong={isSubtotal}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText
                              value={row.notStarted}
                              noData={noData}
                              color={notStartedColor}
                              strong={isSubtotal}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <MetricText
                              value={row.underReview}
                              noData={noData}
                              color={reviewColor}
                              strong={isSubtotal}
                            />
                          </TableCell>

                          <TableCell align="center">
                            {!isSubtotal && (
                              <Tooltip
                                title={
                                  !ZONE_DETAILS_ENABLED
                                    ? 'Zone details are not enabled yet'
                                    : row.hasData
                                      ? 'View zone details'
                                      : 'No data available'
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!canOpen}
                                    onClick={() => handleViewZoneDetails(row)}
                                    aria-label={
                                      canOpen
                                        ? `View details for ${row.zoneName}`
                                        : `Details unavailable for ${row.zoneName}`
                                    }
                                    sx={{
                                      color: 'primary.main',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                                      }
                                    }}
                                  >
                                    {canOpen ? (
                                      <VisibilityIcon fontSize="small" />
                                    ) : (
                                      <VisibilityOffIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
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
                  '.MuiTablePagination-toolbar': {
                    flexWrap: 'wrap'
                  }
                }}
              />
            )}
          </Box>
        </Paper>
      </Grid>

      {!stateData.isDirectAccess && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{ px: 3 }}
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

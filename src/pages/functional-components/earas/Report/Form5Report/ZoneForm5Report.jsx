// ZoneForm5Report.js
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import CancelIcon from '@mui/icons-material/Cancel';
import HubIcon from '@mui/icons-material/Hub';
import GrassIcon from '@mui/icons-material/Grass';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import api from 'api/api';

// Gateway root
const BASE_URL = mainapi.FORM_API;

/* ─────────────────────────── helpers ─────────────────────────── */

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

const SESSION_KEY = 'zoneForm5ReportState';

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Fallback zones for a taluk
// eslint-disable-next-line no-unused-vars
function getFallbackZones(talukId) {
  return [
    { zoneId: 1, zoneName: 'Zone 1', blockName: 'Block A' },
    { zoneId: 2, zoneName: 'Zone 2', blockName: 'Block A' },
    { zoneId: 3, zoneName: 'Zone 3', blockName: 'Block B' },
    { zoneId: 4, zoneName: 'Zone 4', blockName: 'Block B' },
    { zoneId: 5, zoneName: 'Zone 5', blockName: 'Block C' }
  ];
}

/* ─────────────────────────── component ─────────────────────────── */

function ZoneForm5Report() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName, talukId: routeTalukId } = useParams();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, [location.state]);

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

  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';
  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = getCurrentMonthValue(monthOptions);
  const monthLabel = (value) => monthOptions.find((m) => m.value === value)?.label || '';

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
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterZonesLoading, setMasterZonesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    if (resolvedTalukId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId: resolvedTalukId.current,
          talukName: stateData.talukName || talukName || '',
          districtId: stateData.districtId || null,
          districtName: stateData.districtName || districtName || '',
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

  /* ─────────────────────────── fetch master zones ─────────────────────────── */

  const fetchMasterZones = async (talukId) => {
    setMasterZonesLoading(true);
    try {
      let response = null;

      try {
        response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/zones?desTalukId=${talukId}`);
        console.log('Master Zones Response (attempt 1):', response.data);
      } catch (err) {
        console.log('Attempt 1 failed, trying alternative endpoint...');
      }

      if (!response || !response.data) {
        try {
          response = await api.get(`${BASE_URL}/earas-form1-entry/api/zones?talukId=${talukId}`);
          console.log('Master Zones Response (attempt 2):', response.data);
        } catch (err) {
          console.log('Attempt 2 failed, trying alternative endpoint...');
        }
      }

      if (response && response.data) {
        let zones = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          zones = response.data.data;
        } else if (Array.isArray(response.data)) {
          zones = response.data;
        } else if (response.data.zones && Array.isArray(response.data.zones)) {
          zones = response.data.zones;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          zones = response.data.content;
        }

        if (zones.length > 0) {
          console.log('Setting zones list:', zones);
          setZonesList(zones);
        } else {
          console.warn('No zones found in response, using fallback');
          setZonesList(getFallbackZones(talukId));
        }
      } else {
        console.warn('No response data received, using fallback');
        setZonesList(getFallbackZones(talukId));
      }
    } catch (err) {
      console.error('Error fetching master zones list:', err);
      setZonesList(getFallbackZones(talukId));
    } finally {
      setMasterZonesLoading(false);
    }
  };

  /* ─────────────────────────── fetch ─────────────────────────── */

  const fetchZoneWiseData = async () => {
    const talukIdValue = resolvedTalukId.current;

    if (!talukIdValue) {
      setError('Taluk ID is required. Please navigate from the taluk report page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization token missing');

      let url = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary`;
      const params = new URLSearchParams();

      params.append('agriYear', agriculturalYear);

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

      params.append('talukId', talukIdValue);

      // Crop filter — backend now accepts cropId
      if (cropName !== 'ALL') {
        const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
        if (selectedCrop) params.append('cropId', selectedCrop.cropId);
      }

      url += `?${params.toString()}`;
      console.log('Fetching zone Form 5 data from:', url);

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
          lmParams.append('talukId', talukIdValue);

          if (cropName !== 'ALL') {
            const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
            if (selectedCrop) lmParams.append('cropId', selectedCrop.cropId);
          }

          const lmUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary?${lmParams.toString()}`;
          console.log('Fetching last month zone Form 5 data from:', lmUrl);
          lastMonthRequest = axios.get(lmUrl, {
            headers: { Authorization: `Bearer ${token}` }
          }).then((res) => res.data).catch((err) => {
            console.error('Error fetching last month zone Form 5 data:', err);
            return null;
          });
        }
      }

      const [response, lmData] = await Promise.all([mainRequest, lastMonthRequest]);
      console.log('API response:', response.data);

      if (response.data) {
        setApiData(response.data);
        setTotalElements(Array.isArray(response.data.zones) ? response.data.zones.length : 0);

        if (cropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
      setLastMonthApiData(lmData);
    } catch (err) {
      console.error('Error fetching zone Form 5 data:', err);
      if (err.response?.status === 401) setError('Session expired. Please login again.');
      else if (err.response?.status === 403) setError("You don't have permission to access this data.");
      else if (err.response?.status === 404) setError('Taluk not found.');
      else setError(err.response?.data?.message || err.message || 'Failed to fetch zone data');
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

  useEffect(() => {
    if (resolvedTalukId.current) {
      fetchMasterZones(resolvedTalukId.current);
    }
    fetchCropsList();
  }, []);

  useEffect(() => {
    fetchZoneWiseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, singleMonth, fromMonth, toMonth, cropName]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const processedData = useMemo(() => {
    const apiZones = Array.isArray(apiData?.zones) ? apiData.zones : [];
    const lastMonthZones = (filterType === 'range' && Array.isArray(lastMonthApiData?.zones)) ? lastMonthApiData.zones : [];

    const apiDataMap = {};
    apiZones.forEach((z) => {
      const key = z.zoneName?.toLowerCase().trim() || '';
      apiDataMap[key] = z;
    });

    const lastMonthDataMap = {};
    lastMonthZones.forEach((z) => {
      const key = z.zoneName?.toLowerCase().trim() || '';
      lastMonthDataMap[key] = z;
    });

    const getLastMonthZone = (zId, zName) => {
      if (!lastMonthZones.length) return null;
      if (zId) {
        const byId = lastMonthZones.find((z) => String(z.zoneId) === String(zId));
        if (byId) return byId;
      }
      const norm = (zName || '').toLowerCase().trim();
      if (norm && lastMonthDataMap[norm]) {
        return lastMonthDataMap[norm];
      }
      return null;
    };

    let mergedZones = [];
    if (zonesList && zonesList.length > 0) {
      mergedZones = zonesList.map((zone) => {
        const zoneName = zone.zoneName || zone.zoneNameEn || zone.name || '';
        const aData = apiDataMap[zoneName.toLowerCase().trim()] || {};
        const zoneId = zone.zoneId || zone.id || aData.zoneId || `zone_${Math.random()}`;
        const lmZone = getLastMonthZone(zoneId, zoneName);
        const currentMonthCompleted = lmZone?.completed || 0;

        const hasData = (aData.allowedCCECrops || 0) > 0 ||
          (aData.selectedCce || 0) > 0 ||
          (aData.completed || 0) > 0 ||
          currentMonthCompleted > 0 ||
          (aData.ongoing || 0) > 0 ||
          (aData.notAvailable || 0) > 0 ||
          (aData.notStarted || 0) > 0 ||
          (aData.underReview || 0) > 0;

        return {
          zoneId: zoneId,
          zoneName: zoneName || 'Unknown Zone',
          blockId: zone.blockId || aData.blockId || null,
          blockName: zone.blockName || aData.blockName || 'Unassigned',
          allowtedCce: aData.allowedCCECrops || 0,
          selectedCce: aData.selectedCce || 0,
          currentMonthCompleted: currentMonthCompleted,
          completed: aData.completed || 0,
          ongoing: aData.ongoing || 0,
          notAvailable: aData.notAvailable || 0,
          notStarted: aData.notStarted || 0,
          underReview: aData.underReview || 0,
          hasData: hasData
        };
      });
    } else {
      mergedZones = apiZones.map((z) => {
        const lmZone = getLastMonthZone(z.zoneId, z.zoneName);
        const currentMonthCompleted = lmZone?.completed || 0;

        return {
          zoneId: z.zoneId,
          zoneName: z.zoneName,
          blockId: z.blockId,
          blockName: z.blockName || 'Unassigned',
          allowtedCce: z.allowedCCECrops || 0,
          selectedCce: z.selectedCce || 0,
          currentMonthCompleted: currentMonthCompleted,
          completed: z.completed || 0,
          ongoing: z.ongoing || 0,
          notAvailable: z.notAvailable || 0,
          notStarted: z.notStarted || 0,
          underReview: z.underReview || 0,
          hasData: (z.allowedCCECrops || 0) > 0 ||
            (z.selectedCce || 0) > 0 ||
            (z.completed || 0) > 0 ||
            currentMonthCompleted > 0 ||
            (z.ongoing || 0) > 0 ||
            (z.notAvailable || 0) > 0 ||
            (z.notStarted || 0) > 0 ||
            (z.underReview || 0) > 0
        };
      });
    }

    // Group by block - only zones, no subtotals
    const blockMap = new Map();
    const municipalityZones = [];
    const corporationZones = [];
    const unassignedZones = [];

    mergedZones.forEach((z) => {
      const zoneData = {
        zoneId: z.zoneId,
        zoneName: z.zoneName,
        allowtedCce: z.allowtedCce,
        selectedCce: z.selectedCce,
        currentMonthCompleted: z.currentMonthCompleted,
        completed: z.completed,
        ongoing: z.ongoing,
        notAvailable: z.notAvailable,
        notStarted: z.notStarted,
        underReview: z.underReview,
        hasData: z.hasData
      };

      if (!z.blockId || !z.blockName || z.blockName === 'Unassigned') {
        const lower = (z.zoneName || '').toLowerCase();
        if (lower.includes('municipality')) municipalityZones.push(zoneData);
        else if (lower.includes('corporation')) corporationZones.push(zoneData);
        else unassignedZones.push(zoneData);
        return;
      }

      if (!blockMap.has(z.blockName)) {
        blockMap.set(z.blockName, { blockId: z.blockId, blockName: z.blockName, zones: [] });
      }
      blockMap.get(z.blockName).zones.push(zoneData);
    });

    const blocks = Array.from(blockMap.values()).sort((a, b) => a.blockName.localeCompare(b.blockName));
    blocks.forEach((b) => b.zones.sort((a, z) => a.zoneName.localeCompare(z.zoneName)));

    if (municipalityZones.length)
      blocks.push({
        blockId: null,
        blockName: 'Municipality',
        isMunicipality: true,
        zones: municipalityZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    if (corporationZones.length)
      blocks.push({
        blockId: null,
        blockName: 'Corporation',
        isCorporation: true,
        zones: corporationZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });
    if (unassignedZones.length)
      blocks.push({
        blockId: null,
        blockName: 'Unassigned',
        isUnassigned: true,
        zones: unassignedZones.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
      });

    return blocks;
  }, [apiData, lastMonthApiData, zonesList, filterType]);

  const zonesWithNoData = useMemo(() => {
    let count = 0;
    processedData.forEach(block => {
      block.zones.forEach(zone => {
        if (!zone.hasData) count++;
      });
    });
    return count;
  }, [processedData]);

  // Dynamic summary stats derived from zone data
  const stats = useMemo(() => {
    let allowtedCceSum = 0;
    let selectedCceSum = 0;
    let currentMonthCompletedSum = 0;
    let completedSum = 0;
    let ongoingSum = 0;
    let notAvailableSum = 0;
    let notStartedSum = 0;
    let underReviewSum = 0;

    processedData.forEach((block) => {
      block.zones.forEach((z) => {
        allowtedCceSum += (z.allowtedCce || 0);
        selectedCceSum += (z.selectedCce || 0);
        currentMonthCompletedSum += (z.currentMonthCompleted || 0);
        completedSum += (z.completed || 0);
        ongoingSum += (z.ongoing || 0);
        notAvailableSum += (z.notAvailable || 0);
        notStartedSum += (z.notStarted || 0);
        underReviewSum += (z.underReview || 0);
      });
    });

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
  }, [apiData, processedData]);

  // Flatten table data - only zones, no subtotals
  const flattenedTableData = useMemo(() => {
    const result = [];
    processedData.forEach((block) => {
      let bAllowtedCce = 0, bSelectedCce = 0, bCurrentMonthCompleted = 0, bCompleted = 0, bOngoing = 0, bNotAvailable = 0, bNotStarted = 0, bUnderReview = 0;

      block.zones.forEach((zone) => {
        bAllowtedCce += zone.allowtedCce;
        bSelectedCce += zone.selectedCce;
        bCurrentMonthCompleted += (zone.currentMonthCompleted || 0);
        bCompleted += zone.completed;
        bOngoing += zone.ongoing;
        bNotAvailable += zone.notAvailable;
        bNotStarted += zone.notStarted;
        bUnderReview += zone.underReview;

        result.push({
          type: 'zone',
          id: `${block.blockId || 'nb'}_zone_${zone.zoneId}`,
          blockId: block.blockId,
          blockName: block.blockName,
          zoneName: zone.zoneName,
          allowtedCce: zone.allowtedCce,
          selectedCce: zone.selectedCce,
          currentMonthCompleted: zone.currentMonthCompleted || 0,
          completed: zone.completed,
          ongoing: zone.ongoing,
          notAvailable: zone.notAvailable,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          zoneId: zone.zoneId,
          hasData: zone.hasData,
          isUnassigned: block.isUnassigned || false,
          isMunicipality: block.isMunicipality || false,
          isCorporation: block.isCorporation || false
        });
      });

      result.push({
        type: 'subtotal',
        id: `block_${block.blockId || 'nb'}_sub`,
        blockId: block.blockId,
        blockName: block.blockName,
        zoneName: `Total for ${block.blockName}`,
        allowtedCce: bAllowtedCce,
        selectedCce: bSelectedCce,
        currentMonthCompleted: bCurrentMonthCompleted,
        completed: bCompleted,
        ongoing: bOngoing,
        notAvailable: bNotAvailable,
        notStarted: bNotStarted,
        underReview: bUnderReview,
        isSubtotal: true,
        hasData:
          bAllowtedCce > 0 || bSelectedCce > 0 || bCurrentMonthCompleted > 0 || bCompleted > 0 ||
          bOngoing > 0 || bNotAvailable > 0 || bNotStarted > 0 || bUnderReview > 0
      });
    });
    return result;
  }, [processedData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return flattenedTableData;
    return flattenedTableData.filter(
      (r) =>
        r.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedTableData, searchTerm]);

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
    const parts = ['CCE_Zone_Report', formattedTaluk.replace(/\s+/g, '_')];

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

  // Export the FULL search-filtered dataset (blocks and zones) to Excel
  const handleExportExcel = () => {
    if (!searchFilteredData || searchFilteredData.length === 0) return;

    const exportRows = searchFilteredData.map((row, index) => {
      const rowObj = {
        '#': index + 1,
        Block: row.blockName,
        Zone: row.zoneName,
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
          { wch: 5 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
          { wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }
        ]
      : [
          { wch: 5 }, { wch: 20 }, { wch: 22 }, { wch: 12 },
          { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }
        ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const handleViewZoneDetails = (zoneName, clickedZoneId, hasData) => {
    if (!hasData) return;

    navigate('/schemes/earas/cce/Form5', {
      state: {
        zoneId: clickedZoneId,
        zoneName,
        talukId: resolvedTalukId.current,
        talukName: stateData.talukName,
        districtId: stateData.districtId,
        districtName: stateData.districtName,
        cropName: cropName !== 'ALL' ? cropName : null,
        agriculturalYear,
        filterType,
        singleMonth,
        fromMonth,
        toMonth,
        startMonth: filterType === 'single' ? singleMonth : fromMonth,
        endMonth: filterType === 'single' ? singleMonth : toMonth,
        from: 'zoneForm5Report'
      }
    });
  };

  /* ─────────────────────────── sub-components ─────────────────────────── */

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card
      sx={{
        bgcolor: bgColor,
        borderRadius: 2.5,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[3] }
      }}
    >
      <CardContent sx={{ p: { xs: 1.25, md: 1.5 }, '&:last-child': { pb: { xs: 1.25, md: 1.5 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', lineHeight: 1.1, fontSize: { xs: '1.25rem', sm: '1.35rem', lg: '1.45rem' } }}>
              {value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: alpha(color, 0.85),
                mt: 0.25,
                fontWeight: 600,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: { xs: '0.68rem', sm: '0.72rem' }
              }}
              title={label}
            >
              {label}
            </Typography>
          </Box>
          {icon && React.cloneElement(icon, { sx: { fontSize: { xs: 24, md: 28 }, color, opacity: 0.7, flexShrink: 0 } })}
        </Stack>
      </CardContent>
    </Card>
  );

  const formattedTaluk =
    stateData.talukName ||
    (talukName
      ? talukName
        .replace(/-\d+$/, '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : 'Taluk');

  // Table headers based on filter type
  const tableHeaders = useMemo(() => {
    if (filterType === 'range') {
      return [
        '#',
        'Block',
        'Zone',
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
      'Block',
      'Zone',
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

  if ((loading || masterZonesLoading) && !apiData && zonesList.length === 0) {
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
    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
      <Breadcrumb />

      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} Taluk – Zone wise CCE Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`Agricultural Year: ${agriculturalYear}`}
                {filterType === 'single' && singleMonth && ` • ${monthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${monthLabel(fromMonth)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${monthLabel(toMonth)}`}
                {cropName !== 'ALL' && ` • Crop: ${cropName}`}
                {apiData && ` • Total Zones: ${totalElements}`}
                {zonesWithNoData > 0 && ` • ${zonesWithNoData} zones with no data`}
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

      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        </Grid>
      )}

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

      <Grid item xs={12}>
        <Box sx={{ position: 'relative', border: `1px solid ${alpha('#04255e', 0.15)}`, borderRadius: 3, p: 2, pt: 3, bgcolor: '#fff' }}>
          <Chip
            label={`${formattedTaluk} – Taluk Report Summary`}
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
          <Grid container spacing={1.5}>
            {statCards.map(({ label, value, color, icon }) => (
              <Grid item xs={6} sm={4} md={3} lg key={label}>
                <StatCard label={label} value={value} color={color} bgColor={alpha(color, 0.08)} icon={icon} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

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
            contentSX={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: 1.5 } }}
          >
            <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
              <Table size="small" sx={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'auto' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {tableHeaders.map((label, idx) => (
                      <TableCell
                        key={idx}
                        align={idx === 0 ? 'center' : idx === 1 ? 'center' : idx === 2 ? 'left' : 'center'}
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          py: 1,
                          px: 0.75,
                          border: 'none',
                          fontSize: '0.75rem',
                          lineHeight: 1.2,
                          textAlign: idx === 2 ? 'left' : 'center',
                          whiteSpace: idx === 0 || idx === 1 || idx === 2 || idx === tableHeaders.length - 1 ? 'nowrap' : 'normal',
                          ...(idx === 0 && { width: 36, px: 0.5 }),
                          ...(idx === 1 && { minWidth: 90, maxWidth: 110 }),
                          ...(idx === 2 && { minWidth: 100, maxWidth: 140 }),
                          ...(idx >= 3 && idx < tableHeaders.length - 1 && { minWidth: 68, maxWidth: 88 }),
                          ...(idx === tableHeaders.length - 1 && { width: 50, px: 0.5 })
                        }}
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
                    (() => {
  const rows = [];
  let lastBlockName = '';
  let serialNumber = page * rowsPerPage;

  for (let i = 0; i < paginatedData.length; i++) {
    const row = paginatedData[i];
    const isSubtotalRow = row.type === 'subtotal';
    const isNewBlock = row.blockName !== lastBlockName;
    const hasNoData = !row.hasData;

    if (isNewBlock) lastBlockName = row.blockName;
    if (!isSubtotalRow) serialNumber++;

    const blockRowCount = isSubtotalRow
      ? 0
      : paginatedData.filter((r) => r.blockName === row.blockName && r.type !== 'subtotal').length;

    rows.push(
      <TableRow
        key={row.id}
        hover
        sx={{
          '&:hover': { bgcolor: alpha('#04255e', 0.04) },
          transition: '0.2s',
          '& td': {
            borderBottom: isSubtotalRow ? `1px solid ${theme.palette.primary.main}` : 'none',
            borderTop: isSubtotalRow ? `0.01px solid ${theme.palette.primary.main}` : 'none',
            backgroundColor: isSubtotalRow ? alpha('#728ab4', 0.08) : 'transparent'
          },
          ...(hasNoData && !isSubtotalRow && {
            bgcolor: alpha('#ff9800', 0.03),
            '&:hover': { bgcolor: alpha('#ff9800', 0.08) }
          })
        }}
      >
        {/* Serial number — subtotal rows have no Block cell, so this cell
            absorbs that column, keeping the row's border running full width */}
        <TableCell align="center" colSpan={isSubtotalRow ? 2 : 1} sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {!isSubtotalRow && (
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
              {serialNumber}
            </Typography>
          )}
        </TableCell>

        {isNewBlock && !isSubtotalRow ? (
          <TableCell
            rowSpan={blockRowCount}
            align="center"
            sx={{
              verticalAlign: 'middle',
              backgroundColor: alpha('#04255e', 0.04),
              fontWeight: 'bold',
              color: '#04255e',
              border: 'none',
              py: 0.75,
              px: 0.75,
              maxWidth: 110
            }}
          >
            <Stack direction="column" spacing={0.5} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
              <Typography fontWeight={700} sx={{ color: '#04255e', fontSize: '0.82rem', wordBreak: 'break-word', lineHeight: 1.2 }}>
                {row.blockName}
              </Typography>
            </Stack>
          </TableCell>
        ) : null}

        <TableCell sx={{ border: 'none', py: 0.75, px: 0.75, maxWidth: 140 }}>
          {isSubtotalRow ? (
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#04255e', fontStyle: 'italic', fontSize: '0.82rem' }}>
              {row.zoneName}
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <StoreIcon sx={{ fontSize: 16, color: hasNoData ? '#ff9800' : '#04255e', opacity: 0.7, flexShrink: 0 }} />
              <Typography
                fontWeight={hasNoData ? 400 : 500}
                color={hasNoData ? 'text.secondary' : 'text.primary'}
                sx={{ fontSize: '0.82rem', lineHeight: 1.2, wordBreak: 'break-word' }}
              >
                {row.zoneName}
                {hasNoData && (
                  <Chip
                    label="No Data"
                    size="small"
                    sx={{ ml: 0.5, height: 16, fontSize: '0.55rem', bgcolor: alpha('#ff9800', 0.15), color: '#e65100', fontWeight: 600 }}
                  />
                )}
              </Typography>
            </Stack>
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : (
            <Chip
              label={row.allowtedCce}
              size="small"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{
                fontWeight: isSubtotalRow ? 700 : 600,
                bgcolor: isSubtotalRow ? alpha('#04255e', 0.15) : undefined,
                color: isSubtotalRow ? '#04255e' : undefined,
                height: 22,
                fontSize: '0.75rem',
                minWidth: 28
              }}
            />
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : row.selectedCce > 0 ? (
            <Chip
              label={row.selectedCce}
              size="small"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{
                color: '#04255e',
                borderColor: alpha('#04255e', 0.4),
                fontWeight: isSubtotalRow ? 700 : 600,
                bgcolor: isSubtotalRow ? alpha('#04255e', 0.15) : undefined,
                height: 22,
                fontSize: '0.75rem',
                minWidth: 28
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{row.selectedCce}</Typography>
          )}
        </TableCell>

        {filterType === 'range' && (
          <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
            {hasNoData && !isSubtotalRow ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
            ) : row.currentMonthCompleted > 0 ? (
              <Chip
                label={row.currentMonthCompleted}
                size="small"
                color="success"
                variant={isSubtotalRow ? 'filled' : 'outlined'}
                sx={{ fontWeight: isSubtotalRow ? 700 : 500, height: 22, fontSize: '0.75rem', minWidth: 28 }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{row.currentMonthCompleted}</Typography>
            )}
          </TableCell>
        )}

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : row.completed > 0 ? (
            <Chip
              label={row.completed}
              size="small"
              color="success"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{ fontWeight: isSubtotalRow ? 700 : 500, height: 22, fontSize: '0.75rem', minWidth: 28 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{row.completed}</Typography>
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : row.ongoing > 0 ? (
            <Chip
              label={row.ongoing}
              size="small"
              color="primary"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{ fontWeight: isSubtotalRow ? 700 : 500, height: 22, fontSize: '0.75rem', minWidth: 28 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{row.ongoing}</Typography>
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : row.notAvailable > 0 ? (
            <Chip
              label={row.notAvailable}
              size="small"
              color="error"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{ fontWeight: isSubtotalRow ? 700 : 500, height: 22, fontSize: '0.75rem', minWidth: 28 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{row.notAvailable}</Typography>
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : row.notStarted > 0 ? (
            <Chip
              label={row.notStarted}
              size="small"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{
                fontWeight: isSubtotalRow ? 700 : 500,
                bgcolor: isSubtotalRow ? alpha('#757575', 0.15) : undefined,
                height: 22,
                fontSize: '0.75rem',
                minWidth: 28
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{row.notStarted}</Typography>
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5 }}>
          {hasNoData && !isSubtotalRow ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>NA</Typography>
          ) : row.underReview > 0 ? (
            <Chip
              label={row.underReview}
              size="small"
              color="warning"
              variant={isSubtotalRow ? 'filled' : 'outlined'}
              sx={{ fontWeight: isSubtotalRow ? 700 : 500, height: 22, fontSize: '0.75rem', minWidth: 28 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">{row.underReview}</Typography>
          )}
        </TableCell>

        <TableCell align="center" sx={{ border: 'none', py: 0.75, px: 0.5, width: 50 }}>
          {!isSubtotalRow && (
            row.hasData ? (
              <Tooltip title="View CCE Details">
                <IconButton
                  size="small"
                  onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId, row.hasData)}
                  sx={{ color: '#04255e', p: 0.5, '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                >
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="No data available - View disabled">
                <IconButton size="small" disabled sx={{ color: '#bdbdbd', p: 0.5, cursor: 'not-allowed' }}>
                  <VisibilityOffIcon sx={{ fontSize: 18 }} />
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
                      <TableCell colSpan={tableHeaders.length} align="center" sx={{ py: 6 }}>
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
                sx={{ borderTop: `1px solid ${theme.palette.divider}`, '& .MuiTablePagination-toolbar': { minHeight: 44, px: 1 } }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneForm5Report;
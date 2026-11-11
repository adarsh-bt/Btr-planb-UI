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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import * as XLSX from 'xlsx';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import api from 'api/api';

// Gateway root
const BASE_URL = mainapi.FORM_API;

/* ─────────────────────────── helpers ─────────────────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getAgriYearMonths(agriYear) {
  const [startYear, endYear] = (agriYear || '2025-2026').split('-').map(Number);
  const months = [];
  for (let m = 6; m < 12; m++) {
    months.push({ label: `${MONTH_NAMES[m]} ${startYear}`, value: `${startYear}-${String(m + 1).padStart(2, '0')}` });
  }
  for (let m = 0; m < 6; m++) {
    months.push({ label: `${MONTH_NAMES[m]} ${endYear}`, value: `${endYear}-${String(m + 1).padStart(2, '0')}` });
  }
  return months;
}

function getDefaultSingleMonth(agriYearMonths) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return agriYearMonths.some((m) => m.value === current) ? current : agriYearMonths[0]?.value || '';
}

function monthNum(value) {
  return value ? parseInt(value.split('-')[1], 10) : null;
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
  const agriYearMonths = useMemo(() => getAgriYearMonths(agriculturalYear), [agriculturalYear]);
  const defaultSingleMonth = useMemo(() => getDefaultSingleMonth(agriYearMonths), [agriYearMonths]);
  const monthLabel = (value) => agriYearMonths.find((m) => m.value === value)?.label || '';

  // Selected crop composite key: "ALL" or `${cropId}_${selectionFromOutOfCluster}`
  const initialCropKey = useMemo(() => {
    if (stateData.cropKey) return stateData.cropKey;
    if (stateData.cropId != null && stateData.selectionFromOutOfCluster !== undefined) {
      return `${stateData.cropId}_${stateData.selectionFromOutOfCluster}`;
    }
    return 'ALL';
  }, [stateData]);

  const [selectedCropKey, setSelectedCropKey] = useState(initialCropKey);
  const [cropName, setCropName] = useState(stateData.cropName || 'ALL');
  const [cropOptions, setCropOptions] = useState([]);

  const [filterType, setFilterType] = useState(stateData.filterType || 'single');
  const [singleMonth, setSingleMonth] = useState(
    stateData.singleMonth !== undefined && stateData.filterType ? stateData.singleMonth : defaultSingleMonth
  );
  const [fromMonth, setFromMonth] = useState(stateData.fromMonth || '');
  const [toMonth, setToMonth] = useState(stateData.toMonth || '');

  const [apiData, setApiData] = useState(null);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterZonesLoading, setMasterZonesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Role check: Field Data Collector cannot view Taluk – Zone Wise CCE Progress Report
  const isFdcUser = useMemo(() => {
    const tokenRole = AuthService.getrole();
    const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
    const des = localStorage.getItem('des') || '';
    return (
      roles.includes('Field Data Collector') ||
      des.includes('Field Data Collector') ||
      stateData.officeType === 'FIELD_DATA_COLLECTOR' ||
      location.state?.officeType === 'FIELD_DATA_COLLECTOR'
    );
  }, [stateData.officeType, location.state]);

  useEffect(() => {
    if (isFdcUser) {
      const zoneId = location.state?.zoneId || stateData.zoneId || AuthService.getzone();
      navigate('/schemes/earas/cce/Form5', {
        replace: true,
        state: {
          ...stateData,
          officeType: 'FIELD_DATA_COLLECTOR',
          zoneId,
          zoneName: location.state?.zoneName || stateData.zoneName || '',
          talukId: location.state?.talukId || resolvedTalukId.current,
          talukName: location.state?.talukName || stateData.talukName || '',
          districtId: location.state?.districtId || stateData.districtId || null,
          districtName: location.state?.districtName || stateData.districtName || '',
          agriculturalYear: location.state?.agriculturalYear || agriculturalYear,
          from: 'zoneForm5Report'
        }
      });
    }
  }, [isFdcUser]);

  useEffect(() => {
    if (resolvedTalukId.current) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId: resolvedTalukId.current,
          talukName: stateData.talukName || talukName || '',
          districtId: stateData.districtId || null,
          districtName: stateData.districtName || districtName || '',
          cropId: stateData.cropId || null,
          selectionFromOutOfCluster: stateData.selectionFromOutOfCluster ?? null,
          cropKey: stateData.cropKey || 'ALL',
          cropName: stateData.cropName || 'ALL',
          agriculturalYear: stateData.agriculturalYear || '2025-2026',
          filterType: stateData.filterType || 'single',
          singleMonth: stateData.singleMonth || '',
          fromMonth: stateData.fromMonth || '',
          toMonth: stateData.toMonth || ''
        })
      );
    }
  }, []);

  /* ─────────────────────────── fetch master zones ─────────────────────────── */

  const fetchMasterZones = async (talukId) => {
    setMasterZonesLoading(true);
    try {
      let response = null;

      try {
        response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/zones?desTalukId=${talukId}`);

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
      } else {
        const start = monthNum(fromMonth) || monthNum(agriYearMonths[0]?.value);
        params.append('startMonth', start);
        if (toMonth) params.append('endMonth', monthNum(toMonth));
      }
      params.append('talukId', talukIdValue);

      // Crop filter — pass both cropId and selectionFromOutOfCluster to progress report cce-summary
      if (selectedCropKey !== 'ALL') {
        let selectedCrop = cropOptions.find((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === selectedCropKey);
        if (!selectedCrop && stateData.cropId != null) {
          selectedCrop = {
            cropId: stateData.cropId,
            selectionFromOutOfCluster: stateData.selectionFromOutOfCluster
          };
        }
        if (selectedCrop && selectedCrop.cropId != null) {
          params.append('cropId', selectedCrop.cropId);
          params.append(
            'selectionFromOutOfCluster',
            Boolean(selectedCrop.selectionFromOutOfCluster === true || selectedCrop.selectionFromOutOfCluster === 'true')
          );
        }
      }

      url += `?${params.toString()}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("url  ", url)
      if (response.data) {
        setApiData(response.data);
        setTotalElements(Array.isArray(response.data.zones) ? response.data.zones.length : 0);

        if (selectedCropKey === 'ALL' && Array.isArray(response.data.cropList) && cropOptions.length === 0) {
          setCropOptions(response.data.cropList);
        }
      }
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

  // Fetch crop list for the dropdown filter
  const fetchCropsList = async () => {
    try {
      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-logs?agriYear=${agriculturalYear}`
      );
      if (response.data && Array.isArray(response.data)) {
        setCropOptions(response.data); // [{ cropId, cropName, selectionFromOutOfCluster }, ...]

        if (selectedCropKey === 'ALL') {
          if (stateData.cropId != null && stateData.selectionFromOutOfCluster !== undefined) {
            const key = `${stateData.cropId}_${stateData.selectionFromOutOfCluster}`;
            const found = response.data.find((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === key);
            if (found) {
              setSelectedCropKey(key);
              setCropName(found.cropName);
            }
          } else if (stateData.cropName && stateData.cropName !== 'ALL') {
            const found = response.data.find((c) => c.cropName?.toLowerCase() === stateData.cropName?.toLowerCase());
            if (found) {
              setSelectedCropKey(`${found.cropId}_${found.selectionFromOutOfCluster}`);
              setCropName(found.cropName);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching crops list:', err);
    }
  };

  /* ─────────────────────────── effects ─────────────────────────── */

  useEffect(() => {
    if (isFdcUser) return;
    if (resolvedTalukId.current) {
      fetchMasterZones(resolvedTalukId.current);
    }
    fetchCropsList();
  }, [agriculturalYear, isFdcUser]);

  useEffect(() => {
    if (isFdcUser) return;
    fetchZoneWiseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, singleMonth, fromMonth, toMonth, selectedCropKey, agriculturalYear, isFdcUser]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const processedData = useMemo(() => {
    const apiZones = Array.isArray(apiData?.zones) ? apiData.zones : [];

    // Map by zoneId (primary) and zoneName (secondary) for robust matching
    const apiDataMap = {};
    const apiDataIdMap = {};
    apiZones.forEach((z) => {
      const nameKey = (z.zoneName || '').toLowerCase().trim();
      if (nameKey) apiDataMap[nameKey] = z;
      const idKey = z.zoneId ?? z.id;
      if (idKey != null) apiDataIdMap[String(idKey)] = z;
    });

    let mergedZones = [];
    if (zonesList && zonesList.length > 0) {
      mergedZones = zonesList.map((zone) => {
        const zoneName = zone.zoneName || zone.zoneNameEn || zone.name || '';
        const zId = zone.zoneId ?? zone.id;
        const zApi = (zId != null ? apiDataIdMap[String(zId)] : null) || apiDataMap[zoneName.toLowerCase().trim()] || {};

        const allowtedCce = zApi.allowedCCECrops ?? zApi.allowtedCce ?? zApi.allotedCce ?? zApi.totalCCECrops ?? 0;
        const selectedCce = zApi.selectedCce ?? zApi.selectedCCE ?? zApi.selected ?? 0;
        const completed = zApi.completed ?? zApi.completedCce ?? 0;
        const ongoing = zApi.ongoing ?? zApi.ongoingCce ?? 0;
        const notAvailable = zApi.notAvailable ?? zApi.notAvailableCce ?? 0;
        const notStarted = zApi.notStarted ?? zApi.notStartedCce ?? 0;
        const underReview = zApi.underReview ?? zApi.underReviewCce ?? 0;
        const missing = zApi.missing ?? zApi.missingCrops ?? zApi.missingCce ?? 0;

        const hasData =
          allowtedCce > 0 ||
          selectedCce > 0 ||
          completed > 0 ||
          ongoing > 0 ||
          notAvailable > 0 ||
          notStarted > 0 ||
          underReview > 0 ||
          missing > 0;

        return {
          zoneId: zId || zApi.zoneId || `zone_${Math.random()}`,
          zoneName: zoneName || zApi.zoneName || 'Unknown Zone',
          blockId: zone.blockId || zApi.blockId || null,
          blockName: zone.blockName || zApi.blockName || 'Unassigned',
          allowtedCce,
          selectedCce,
          completed,
          ongoing,
          notAvailable,
          notStarted,
          underReview,
          missing,
          hasData
        };
      });
    } else {
      mergedZones = apiZones.map((z) => {
        const allowtedCce = z.allowedCCECrops ?? z.allowtedCce ?? z.allotedCce ?? z.totalCCECrops ?? 0;
        const selectedCce = z.selectedCce ?? z.selectedCCE ?? z.selected ?? 0;
        const completed = z.completed ?? z.completedCce ?? 0;
        const ongoing = z.ongoing ?? z.ongoingCce ?? 0;
        const notAvailable = z.notAvailable ?? z.notAvailableCce ?? 0;
        const notStarted = z.notStarted ?? z.notStartedCce ?? 0;
        const underReview = z.underReview ?? z.underReviewCce ?? 0;
        const missing = z.missing ?? z.missingCrops ?? z.missingCce ?? 0;

        return {
          zoneId: z.zoneId ?? z.id,
          zoneName: z.zoneName || 'Unknown Zone',
          blockId: z.blockId,
          blockName: z.blockName || 'Unassigned',
          allowtedCce,
          selectedCce,
          completed,
          ongoing,
          notAvailable,
          notStarted,
          underReview,
          missing,
          hasData:
            allowtedCce > 0 ||
            selectedCce > 0 ||
            completed > 0 ||
            ongoing > 0 ||
            notAvailable > 0 ||
            notStarted > 0 ||
            underReview > 0 ||
            missing > 0
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
        completed: z.completed,
        ongoing: z.ongoing,
        notAvailable: z.notAvailable,
        notStarted: z.notStarted,
        underReview: z.underReview,
        missing: z.missing,
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
    const targetZoneId = location.state?.zoneId || null;
    if (targetZoneId) {
      const filteredBlocks = [];
      blocks.forEach((block) => {
        const matchingZones = block.zones.filter((z) => String(z.zoneId) === String(targetZoneId));
        if (matchingZones.length > 0) {
          filteredBlocks.push({ ...block, zones: matchingZones });
        }
      });
      return filteredBlocks;
    }

    return blocks;
  }, [apiData, zonesList, location.state]);

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
    let completedSum = 0;
    let ongoingSum = 0;
    let notAvailableSum = 0;
    let notStartedSum = 0;
    let underReviewSum = 0;
    let missingSum = 0;

    processedData.forEach((block) => {
      block.zones.forEach((z) => {
        allowtedCceSum += (z.allowtedCce || 0);
        selectedCceSum += (z.selectedCce || 0);
        completedSum += (z.completed || 0);
        ongoingSum += (z.ongoing || 0);
        notAvailableSum += (z.notAvailable || 0);
        notStartedSum += (z.notStarted || 0);
        underReviewSum += (z.underReview || 0);
        missingSum += (z.missing || 0);
      });
    });

    const topAllowted = apiData?.allowedCCECrops ?? apiData?.allowtedCce ?? apiData?.allotedCce ?? apiData?.totalCCECrops ?? 0;
    const topSelected = apiData?.selectedCce ?? apiData?.selectedCCE ?? 0;
    const topCompleted = apiData?.completed ?? apiData?.completedCce ?? 0;
    const topOngoing = apiData?.ongoing ?? apiData?.ongoingCce ?? 0;
    const topNotAvailable = apiData?.notAvailable ?? apiData?.notAvailableCce ?? 0;
    const topNotStarted = apiData?.notStarted ?? apiData?.notStartedCce ?? 0;
    const topUnderReview = apiData?.underReview ?? apiData?.underReviewCce ?? 0;
    const topMissing = apiData?.missing ?? apiData?.missingCrops ?? apiData?.missingCce ?? 0;

    return {
      allowtedCce: allowtedCceSum > 0 ? allowtedCceSum : topAllowted,
      selectedCce: selectedCceSum > 0 ? selectedCceSum : topSelected,
      completed: completedSum > 0 ? completedSum : topCompleted,
      ongoing: ongoingSum > 0 ? ongoingSum : topOngoing,
      notAvailable: notAvailableSum > 0 ? notAvailableSum : topNotAvailable,
      notStarted: notStartedSum > 0 ? notStartedSum : topNotStarted,
      underReview: underReviewSum > 0 ? underReviewSum : topUnderReview,
      missing: missingSum > 0 ? missingSum : topMissing
    };
  }, [apiData, processedData]);

  // Flatten table data - only zones, no subtotals
  const flattenedTableData = useMemo(() => {
    const result = [];
    processedData.forEach((block) => {
      let bAllowtedCce = 0, bSelectedCce = 0, bCompleted = 0, bOngoing = 0, bNotAvailable = 0, bNotStarted = 0, bUnderReview = 0, bMissing = 0;

      block.zones.forEach((zone) => {
        bAllowtedCce += zone.allowtedCce;
        bSelectedCce += zone.selectedCce;
        bCompleted += zone.completed;
        bOngoing += zone.ongoing;
        bNotAvailable += zone.notAvailable;
        bNotStarted += zone.notStarted;
        bUnderReview += zone.underReview;
        bMissing += (zone.missing || 0);

        result.push({
          type: 'zone',
          id: `${block.blockId || 'nb'}_zone_${zone.zoneId}`,
          blockId: block.blockId,
          blockName: block.blockName,
          zoneName: zone.zoneName,
          allowtedCce: zone.allowtedCce,
          selectedCce: zone.selectedCce,
          completed: zone.completed,
          ongoing: zone.ongoing,
          notAvailable: zone.notAvailable,
          notStarted: zone.notStarted,
          underReview: zone.underReview,
          missing: zone.missing,
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
        completed: bCompleted,
        ongoing: bOngoing,
        notAvailable: bNotAvailable,
        notStarted: bNotStarted,
        underReview: bUnderReview,
        missing: bMissing,
        isSubtotal: true,
        hasData:
          bAllowtedCce > 0 || bSelectedCce > 0 || bCompleted > 0 ||
          bOngoing > 0 || bNotAvailable > 0 || bNotStarted > 0 || bUnderReview > 0 || bMissing > 0
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
    const val = event.target.value;
    setSelectedCropKey(val);
    if (val === 'ALL') {
      setCropName('ALL');
    } else {
      const found = cropOptions.find((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === val);
      if (found) {
        setCropName(found.cropName);
      }
    }
    setPage(0);
  };

  const handleFilterTypeChange = (event, newValue) => {
    if (newValue === null) return;
    setFilterType(newValue);
    if (newValue === 'single') {
      setSingleMonth(defaultSingleMonth);
      setFromMonth('');
      setToMonth('');
    } else {
      setFromMonth(agriYearMonths[0]?.value || '');
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setSelectedCropKey('ALL');
    setCropName('ALL');
    setFilterType('single');
    setSingleMonth(defaultSingleMonth);
    setFromMonth('');
    setToMonth('');
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

    if (selectedCropKey !== 'ALL') {
      const found = cropOptions.find((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === selectedCropKey);
      const cLabel = found ? found.cropName : cropName;
      if (cLabel && cLabel !== 'ALL') parts.push(cLabel.replace(/\s+/g, '_'));
    }

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

    const exportRows = searchFilteredData.map((row, index) => ({
      '#': index + 1,
      Block: row.blockName,
      Zone: row.zoneName,
      'Alloted CCE': row.hasData ? row.allowtedCce : 'NA',
      'Selected CCE': row.hasData ? row.selectedCce : 'NA',
      Completed: row.hasData ? row.completed : 'NA',
      Ongoing: row.hasData ? row.ongoing : 'NA',
      'Not Available': row.hasData ? row.notAvailable : 'NA',
      'Not Started': row.hasData ? row.notStarted : 'NA',
      'Under Review': row.hasData ? row.underReview : 'NA',
      'Missing': row.hasData ? row.missing : 'NA'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Reasonable column widths so it doesn't open looking cramped
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 22 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Report');

    XLSX.writeFile(workbook, generateExcelFileName());
  };

  const handleViewZoneDetails = (zoneName, clickedZoneId, hasData) => {
    if (!hasData) return;

    const selectedCrop = selectedCropKey !== 'ALL'
      ? cropOptions.find((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === selectedCropKey)
      : null;

    navigate('/schemes/earas/cce/Form5', {
      state: {
        zoneId: clickedZoneId,
        zoneName,
        talukId: resolvedTalukId.current,
        talukName: stateData.talukName,
        districtId: stateData.districtId,
        districtName: stateData.districtName,
        cropId: selectedCrop ? selectedCrop.cropId : (stateData.cropId || null),
        selectionFromOutOfCluster: selectedCrop ? selectedCrop.selectionFromOutOfCluster : (stateData.selectionFromOutOfCluster ?? null),
        cropKey: selectedCropKey,
        cropName: selectedCrop ? selectedCrop.cropName : (cropName !== 'ALL' ? cropName : null),
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

  const formattedTaluk =
    stateData.talukName ||
    (talukName
      ? talukName
        .replace(/-\d+$/, '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : 'Taluk');

  if (isFdcUser) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
        <Grid item sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Redirecting to CCE Progress Status Overview...
          </Typography>
        </Grid>
      </Grid>
    );
  }

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
    <Grid container spacing={3}>
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
                {selectedCropKey !== 'ALL' && (
                  (() => {
                    const found = cropOptions.find((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === selectedCropKey);
                    const label = found ? found.cropName : cropName;
                    return ` • Crop: ${label}`;
                  })()
                )}
                {apiData && ` • Total Zones: ${totalElements}`}
                {zonesWithNoData > 0 && ` • ${zonesWithNoData} zones with no data`}
              </Typography>
            </Box>
          </Stack>
          {(selectedCropKey !== 'ALL' || fromMonth || toMonth || (filterType === 'single' && singleMonth !== defaultSingleMonth)) && (
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
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Crop Name</InputLabel>
              <Select value={selectedCropKey} label="Crop Name" onChange={handleCropNameChange}>
                <MenuItem value="ALL">ALL</MenuItem>
                {selectedCropKey !== 'ALL' && !cropOptions.some((c) => `${c.cropId}_${c.selectionFromOutOfCluster}` === selectedCropKey) && (
                  <MenuItem value={selectedCropKey}>
                    {cropName || 'Selected Crop'}
                  </MenuItem>
                )}
                {cropOptions.map((crop, idx) => {
                  const key = `${crop.cropId}_${crop.selectionFromOutOfCluster}`;
                  return (
                    <MenuItem key={`${key}_${idx}`} value={key}>
                      {crop.cropName}
                    </MenuItem>
                  );
                })}
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
                    onChange={(e) => {
                      setFromMonth(e.target.value);
                      setPage(0);
                    }}
                  >
                    {agriYearMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
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
                    <MenuItem value="">None</MenuItem>
                    {agriYearMonths.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
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
                  {agriYearMonths.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
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
          <Grid container spacing={2}>
            {[
              { label: 'Alloted CCE', value: stats.allowtedCce, color: '#1565c0', icon: <HubIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} /> },
              { label: 'Selected CCE', value: stats.selectedCce, color: '#04255e', icon: <AssessmentIcon sx={{ fontSize: 32, color: '#04255e', opacity: 0.7 }} /> },
              { label: 'Completed', value: stats.completed, color: '#2e7d32', icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} /> },
              { label: 'Ongoing', value: stats.ongoing, color: '#ed6c02', icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} /> },
              { label: 'Not Available', value: stats.notAvailable, color: '#c62828', icon: <CancelIcon sx={{ fontSize: 32, color: '#c62828', opacity: 0.7 }} /> },
              { label: 'Not Started', value: stats.notStarted, color: '#757575', icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} /> },
              { label: 'Under Review', value: stats.underReview, color: '#b76e00', icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} /> },
              { label: 'Missing', value: stats.missing, color: '#c2185b', icon: <HelpOutlineIcon sx={{ fontSize: 32, color: '#c2185b', opacity: 0.7 }} /> }
            ].map(({ label, value, color, icon }) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
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
          >
            <TableContainer>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {[
                      '#',
                      'Block',
                      'Zone',
                      'Alloted CCE',
                      'Selected CCE',
                      'Completed',
                      'Ongoing',
                      'Not Available',
                      'Not Started',
                      'Under Review',
                      'Missing',
                      'Actions'
                    ].map((label, idx) => (
                      <TableCell
                        key={idx}
                        align={idx === 0 ? 'center' : idx === 1 ? 'center' : idx === 2 ? 'left' : 'center'}
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          py: 1.5,
                          border: 'none',
                          whiteSpace: 'nowrap',
                          ...(idx === 1 && { minWidth: 160 }),
                          ...(idx === 2 && { minWidth: 180 })
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
                      <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
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
                            <TableCell align="center" colSpan={isSubtotalRow ? 2 : 1} sx={{ border: 'none' }}>
                              {!isSubtotalRow && (
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
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
                                  fontSize: '1rem',
                                  border: 'none'
                                }}
                              >
                                <Stack direction="column" spacing={1} alignItems="center">
                                  <LocationOnIcon sx={{ fontSize: 24, color: '#04255e', opacity: 0.7 }} />
                                  <Typography fontWeight={700} sx={{ color: '#04255e' }}>
                                    {row.blockName}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            ) : null}

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
                                        sx={{ ml: 1, height: 18, fontSize: '0.6rem', bgcolor: alpha('#ff9800', 0.15), color: '#e65100', fontWeight: 600 }}
                                      />
                                    )}
                                  </Typography>
                                </Stack>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : (
                                <Chip
                                  label={row.allowtedCce}
                                  size="small"
                                  variant={isSubtotalRow ? 'filled' : 'outlined'}
                                  sx={{
                                    fontWeight: isSubtotalRow ? 700 : 600,
                                    bgcolor: isSubtotalRow ? alpha('#04255e', 0.15) : undefined,
                                    color: isSubtotalRow ? '#04255e' : undefined
                                  }}
                                />
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.selectedCce > 0 ? (
                                <Chip
                                  label={row.selectedCce}
                                  size="small"
                                  variant={isSubtotalRow ? 'filled' : 'outlined'}
                                  sx={{
                                    color: '#04255e',
                                    borderColor: alpha('#04255e', 0.4),
                                    fontWeight: isSubtotalRow ? 700 : 600,
                                    bgcolor: isSubtotalRow ? alpha('#04255e', 0.15) : undefined
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.selectedCce}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.completed > 0 ? (
                                <Chip label={row.completed} size="small" color="success" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.completed}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.ongoing > 0 ? (
                                <Chip label={row.ongoing} size="small" color="primary" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.ongoing}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.notAvailable > 0 ? (
                                <Chip label={row.notAvailable} size="small" color="error" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.notAvailable}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.notStarted > 0 ? (
                                <Chip
                                  label={row.notStarted}
                                  size="small"
                                  variant={isSubtotalRow ? 'filled' : 'outlined'}
                                  sx={{ fontWeight: isSubtotalRow ? 700 : 500, bgcolor: isSubtotalRow ? alpha('#757575', 0.15) : undefined }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.notStarted}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.underReview > 0 ? (
                                <Chip label={row.underReview} size="small" color="warning" variant={isSubtotalRow ? 'filled' : 'outlined'} sx={{ fontWeight: isSubtotalRow ? 700 : 500 }} />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.underReview}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {hasNoData && !isSubtotalRow ? (
                                <Typography variant="body2" color="text.secondary">NA</Typography>
                              ) : row.missing > 0 ? (
                                <Chip
                                  label={row.missing}
                                  size="small"
                                  variant={isSubtotalRow ? 'filled' : 'outlined'}
                                  sx={{
                                    fontWeight: isSubtotalRow ? 700 : 500,
                                    bgcolor: isSubtotalRow ? alpha('#c2185b', 0.15) : alpha('#c2185b', 0.1),
                                    color: '#c2185b',
                                    borderColor: alpha('#c2185b', 0.4)
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">{row.missing}</Typography>
                              )}
                            </TableCell>

                            <TableCell align="center" sx={{ border: 'none' }}>
                              {!isSubtotalRow && (
                                row.hasData ? (
                                  <Tooltip title="View CCE Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewZoneDetails(row.zoneName, row.zoneId, row.hasData)}
                                      sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="No data available - View disabled">
                                    <IconButton size="small" disabled sx={{ color: '#bdbdbd', cursor: 'not-allowed' }}>
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
                      <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
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
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneForm5Report;
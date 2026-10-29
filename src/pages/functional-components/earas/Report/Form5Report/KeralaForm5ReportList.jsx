import React, { useState, useMemo, useEffect } from 'react';
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
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import api from 'api/api';

// Gateway root (e.g. http://localhost:8080). The '/earas-form1-entry' service
// prefix is added on the request path below.
// NOTE: if mainapi.EARAS_FORM_API already ends in '/earas-form1-entry',
// drop the duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

/* ─────────────── agricultural year months ─────────────── */

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

function KeralaForm5ReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Agricultural year from AuthService (e.g. '2025-2026'), and its month options.
  const agriculturalYear = AuthService.agriyear() || '2025-2026';
  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);
  const defaultFromMonth = monthOptions[0]?.value || '';
  const defaultToMonth = getCurrentMonthValue(monthOptions);
  const defaultSingleMonth = getCurrentMonthValue(monthOptions);
  const monthLabel = (value) => monthOptions.find((m) => m.value === value)?.label || '';

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [lastMonthApiData, setLastMonthApiData] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [masterDistrictsLoading, setMasterDistrictsLoading] = useState(true);

  // Crop Name filter
  const [cropName, setCropName] = useState('ALL');
  const [cropOptions, setCropOptions] = useState([]);

  // Month filter states
  const [filterType, setFilterType] = useState('range');
  const [fromMonth, setFromMonth] = useState(defaultFromMonth);
  const [toMonth, setToMonth] = useState(defaultToMonth);
  const [singleMonth, setSingleMonth] = useState(defaultSingleMonth);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Fetch master districts list
  const fetchMasterDistricts = async () => {
    setMasterDistrictsLoading(true);
    try {
      // Try multiple possible endpoints
      let response = null;

      // Try 1: Standard endpoint
      try {
        response = await api.get(`${BASE_URL}/earas-form1-entry/api/districts`);
        console.log('Master Districts Response (attempt 1):', response.data);
      } catch (err) {
        console.log('Attempt 1 failed, trying alternative endpoint...');
      }

      // Try 2: Alternative endpoint without the service prefix
      if (!response || !response.data) {
        try {
          response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/districts`);
          console.log('Master Districts Response (attempt 2):', response.data);
        } catch (err) {
          console.log('Attempt 2 failed, trying alternative endpoint...');
        }
      }

      // Try 3: Direct API call
      if (!response || !response.data) {
        try {
          response = await api.get(`/api/districts`);
          console.log('Master Districts Response (attempt 3):', response.data);
        } catch (err) {
          console.log('Attempt 3 failed');
        }
      }

      // Process response
      if (response && response.data) {
        let districts = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          districts = response.data.data;
        } else if (Array.isArray(response.data)) {
          districts = response.data;
        } else if (response.data.districts && Array.isArray(response.data.districts)) {
          districts = response.data.districts;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          districts = response.data.content;
        }

        if (districts.length > 0) {
          console.log('Setting districts list:', districts);
          setDistrictsList(districts);
        } else {
          console.warn('No districts found in response');
          // Use fallback districts list
          setDistrictsList(getFallbackDistricts());
        }
      } else {
        console.warn('No response data received');
        // Use fallback districts list
        setDistrictsList(getFallbackDistricts());
      }
    } catch (err) {
      console.error('Error fetching master districts list:', err);
      // Use fallback districts list
      setDistrictsList(getFallbackDistricts());
    } finally {
      setMasterDistrictsLoading(false);
    }
  };

  // Fallback districts list (common Kerala districts)
  const getFallbackDistricts = () => {
    return [
      { id: 1, districtName: 'Thiruvananthapuram' },
      { id: 2, districtName: 'Kollam' },
      { id: 3, districtName: 'Pathanamthitta' },
      { id: 4, districtName: 'Alappuzha' },
      { id: 5, districtName: 'Kottayam' },
      { id: 6, districtName: 'Idukki' },
      { id: 7, districtName: 'Ernakulam' },
      { id: 8, districtName: 'Thrissur' },
      { id: 9, districtName: 'Palakkad' },
      { id: 10, districtName: 'Malappuram' },
      { id: 11, districtName: 'Kozhikode' },
      { id: 12, districtName: 'Wayanad' },
      { id: 13, districtName: 'Kannur' },
      { id: 14, districtName: 'Kasaragod' }
    ];
  };

  // Fetch crop list for the dropdown filter
  const fetchCropsList = async () => {
    try {
      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-logs?agriYear=${agriculturalYear}`
      );
      if (response.data && Array.isArray(response.data)) {
        setCropOptions(response.data); // now holds { cropId, cropName, ... } objects
      }
    } catch (err) {
      console.error('Error fetching crops list:', err);
    }
  };

  // Fetch data from API
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token missing');
      }

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

      // TODO: enable when the backend controller accepts a cropName param.
      // if (cropName && cropName !== 'ALL') params.append('cropName', cropName);

      // Crop filter — backend now accepts cropId
      if (cropName !== 'ALL') {
        const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
        if (selectedCrop) params.append('cropId', selectedCrop.cropId);
      }

      url += `?${params.toString()}`;
      console.log('Fetching data from:', url);

      const mainRequest = api.get(url);

      let lastMonthRequest = Promise.resolve(null);
      if (filterType === 'range') {
        const lastMonth = monthNum(toMonth) || monthNum(fromMonth) || monthNum(defaultToMonth);
        if (lastMonth) {
          const lmParams = new URLSearchParams();
          lmParams.append('agriYear', agriculturalYear);
          lmParams.append('startMonth', lastMonth);
          lmParams.append('endMonth', lastMonth);

          if (cropName !== 'ALL') {
            const selectedCrop = cropOptions.find((c) => c.cropName === cropName);
            if (selectedCrop) lmParams.append('cropId', selectedCrop.cropId);
          }

          const lmUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary?${lmParams.toString()}`;
          console.log('Fetching last month Form 5 data from:', lmUrl);
          lastMonthRequest = api.get(lmUrl).then((res) => res.data).catch((err) => {
            console.error('Error fetching last month Form 5 data:', err);
            return null;
          });
        }
      }

      const [response, lmData] = await Promise.all([mainRequest, lastMonthRequest]);

      if (response && response.data) {
        setApiData(response.data);

        // Populate the crop dropdown if/when the endpoint returns a cropList.
        if (cropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
      setLastMonthApiData(lmData);
    } catch (err) {
      console.error('Error fetching CCE Progress dashboard data:', err);

      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access this data.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check your filters.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      }
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

  // Transform API data to district rows.
  // Merges master districts list with API data
  const transformApiDataToDistricts = useMemo(() => {
    const apiDistricts = apiData?.districts || [];
    const lastMonthDistricts = (filterType === 'range' && lastMonthApiData?.districts) || [];

    const apiDataMap = {};
    apiDistricts.forEach((d) => {
      const key = d.districtName?.toLowerCase().trim() || '';
      apiDataMap[key] = d;
    });

    const lastMonthDataMap = {};
    lastMonthDistricts.forEach((d) => {
      const key = d.districtName?.toLowerCase().trim() || '';
      lastMonthDataMap[key] = d;
    });

    const getLastMonthDistrict = (distId, distName) => {
      if (!lastMonthDistricts.length) return null;
      if (distId) {
        const byId = lastMonthDistricts.find((d) => String(d.districtId) === String(distId));
        if (byId) return byId;
      }
      const norm = (distName || '').toLowerCase().trim();
      if (norm && lastMonthDataMap[norm]) {
        return lastMonthDataMap[norm];
      }
      return null;
    };

    if (districtsList && districtsList.length > 0) {
      const merged = districtsList.map((district) => {
        const districtName = district.districtName || district.name || district.distNameEn || '';
        const districtData = apiDataMap[districtName.toLowerCase().trim()] || {};
        const districtId = district.id || district.districtId || districtData.districtId || `dist_${Math.random()}`;
        const lmDistrict = getLastMonthDistrict(districtId, districtName);
        const currentMonthCompleted = lmDistrict?.completed || 0;

        const hasData = (districtData.allowedCCECrops || 0) > 0 ||
          (districtData.selectedCce || 0) > 0 ||
          (districtData.completed || 0) > 0 ||
          currentMonthCompleted > 0 ||
          (districtData.ongoing || 0) > 0 ||
          (districtData.notAvailable || 0) > 0 ||
          (districtData.notStarted || 0) > 0 ||
          (districtData.underReview || 0) > 0;

        return {
          id: districtId,
          district: districtName || 'Unknown District',
          allowtedCce: districtData.allowedCCECrops || 0,
          selectedCce: districtData.selectedCce || 0,
          currentMonthCompleted: currentMonthCompleted,
          completed: districtData.completed || 0,
          ongoing: districtData.ongoing || 0,
          notAvailable: districtData.notAvailable || 0,
          notStarted: districtData.notStarted || 0,
          underReview: districtData.underReview || 0,
          hasData: hasData
        };
      });

      return merged;
    }

    return apiDistricts.map((d) => {
      const lmDistrict = getLastMonthDistrict(d.districtId, d.districtName);
      const currentMonthCompleted = lmDistrict?.completed || 0;

      return {
        id: d.districtId || `dist_${Math.random()}`,
        district: d.districtName || 'Unknown District',
        allowtedCce: d.allowedCCECrops || 0,
        selectedCce: d.selectedCce || 0,
        currentMonthCompleted: currentMonthCompleted,
        completed: d.completed || 0,
        ongoing: d.ongoing || 0,
        notAvailable: d.notAvailable || 0,
        notStarted: d.notStarted || 0,
        underReview: d.underReview || 0,
        hasData: (d.allowedCCECrops || 0) > 0 ||
          (d.selectedCce || 0) > 0 ||
          (d.completed || 0) > 0 ||
          currentMonthCompleted > 0 ||
          (d.ongoing || 0) > 0 ||
          (d.notAvailable || 0) > 0 ||
          (d.notStarted || 0) > 0 ||
          (d.underReview || 0) > 0
      };
    });
  }, [apiData, lastMonthApiData, districtsList, filterType]);

  // Dynamic summary stats derived from transformed district data
  const stats = useMemo(() => {
    const allowtedCceSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.allowtedCce || 0), 0);
    const selectedCceSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.selectedCce || 0), 0);
    const currentMonthCompletedSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.currentMonthCompleted || 0), 0);
    const completedSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.completed || 0), 0);
    const ongoingSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.ongoing || 0), 0);
    const notAvailableSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.notAvailable || 0), 0);
    const notStartedSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.notStarted || 0), 0);
    const underReviewSum = transformApiDataToDistricts.reduce((sum, d) => sum + (d.underReview || 0), 0);

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
  }, [apiData, transformApiDataToDistricts]);

  // Count districts with no data
  const districtsWithNoData = useMemo(() => {
    return transformApiDataToDistricts.filter(d => !d.hasData).length;
  }, [transformApiDataToDistricts]);

  // Filter data based on district search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return transformApiDataToDistricts;
    return transformApiDataToDistricts.filter((row) => row.district.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [transformApiDataToDistricts, searchTerm]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handle filter changes
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

  const handleClearSearch = () => {
    setSearchTerm('');
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

  // Build a meaningful filename from the active filters
  const generateExcelFileName = () => {
    const parts = ['CCE_District_Report'];

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

  // Export the FULL filtered dataset (not just the current page) to Excel
  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) return;

    const exportRows = filteredData.map((row, index) => {
      const rowObj = {
        '#': index + 1,
        District: row.district,
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

  const handleViewDetails = (districtName, hasData) => {
    if (!hasData) return;

    const district = transformApiDataToDistricts.find((d) => d.district === districtName);
    if (district) {
      navigate(`/kerala_form5_report/taluk_form5_report/${district.id}`, {
        state: {
          districtId: district.id,
          districtName: districtName,
          cropName: cropName !== 'ALL' ? cropName : null,
          agriculturalYear,
          filterType,
          singleMonth,
          fromMonth,
          toMonth,
          startMonth: filterType === 'single' ? singleMonth : fromMonth,
          endMonth: filterType === 'single' ? singleMonth : toMonth
        }
      });
    } else {
      navigate(`/kerala_form5_report/taluk_form5_report/${districtName.toLowerCase()}`, {
        state: {
          districtName,
          cropName: cropName !== 'ALL' ? cropName : null,
          agriculturalYear,
          filterType,
          singleMonth,
          fromMonth,
          toMonth,
          startMonth: filterType === 'single' ? singleMonth : fromMonth,
          endMonth: filterType === 'single' ? singleMonth : toMonth
        }
      });
    }
  };

  // Fetch master districts and data when component mounts
  useEffect(() => {
    fetchMasterDistricts();
    fetchCropsList();
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when month filters change
  useEffect(() => {
    if (agriculturalYear) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, singleMonth, fromMonth, toMonth, cropName]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card
      sx={{
        bgcolor: bgColor,
        borderRadius: 3,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
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

  // Table headers based on filter type
  const tableHeaders = useMemo(() => {
    if (filterType === 'range') {
      return [
        '#',
        'District',
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
      'District',
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
    {
      label: 'Allowted CCE',
      value: stats.allowtedCce,
      color: '#1565c0',
      icon: <HubIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />
    },
    {
      label: 'Selected CCE',
      value: stats.selectedCce,
      color: '#04255e',
      icon: <AssessmentIcon sx={{ fontSize: 32, color: '#04255e', opacity: 0.7 }} />
    },
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
    {
      label: 'Ongoing',
      value: stats.ongoing,
      color: '#ed6c02',
      icon: <PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} />
    },
    {
      label: 'Not Available',
      value: stats.notAvailable,
      color: '#c62828',
      icon: <CancelIcon sx={{ fontSize: 32, color: '#c62828', opacity: 0.7 }} />
    },
    {
      label: 'Not Started',
      value: stats.notStarted,
      color: '#757575',
      icon: <ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} />
    },
    {
      label: 'Under Review',
      value: stats.underReview,
      color: '#b76e00',
      icon: <RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} />
    }
  ];

  // Loading state
  if ((loading || masterDistrictsLoading) && !apiData && districtsList.length === 0) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '400px' }}>
        <Grid item>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading dashboard data...</Typography>
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
            <AssessmentIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                CCE Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`Agricultural Year: ${agriculturalYear}`}
                {filterType === 'single' && singleMonth && ` • ${monthLabel(singleMonth)}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${monthLabel(fromMonth)}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${monthLabel(toMonth)}`}
                {cropName !== 'ALL' && ` • Crop: ${cropName}`}
                {apiData?.allowedCCECrops != null && ` • Total Allowted CCE: ${apiData.allowedCCECrops}`}
                {districtsWithNoData > 0 && ` • ${districtsWithNoData} districts with no data`}
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

      {/* Error Message */}
      {error && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">
              {error}
            </Typography>
          </Paper>
        </Grid>
      )}

      {/* Info Banner for districts with no data */}
      {districtsWithNoData > 0 && !loading && (
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
              <strong>{districtsWithNoData}</strong> district{districtsWithNoData > 1 ? 's' : ''} have no data available for the selected filters.
              <strong> View details is disabled for districts without data.</strong>
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
            label="State Report Summary"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1
            }}
          />

          <Grid container spacing={2}>
            {statCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} lg key={card.label}>
                <StatCard
                  label={card.label}
                  value={card.value}
                  color={card.color}
                  bgColor={alpha(card.color, 0.08)}
                  icon={card.icon}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Main Table */}
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
            label="District Report Summary"
            color="primary"
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

          {/* Search + Export row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2, pb: 2 }}
          >
            <TextField
              placeholder="Search district..."
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
                    <IconButton size="small" onClick={handleClearSearch} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Tooltip
              title={
                filteredData.length === 0
                  ? 'No data available to export'
                  : `Export ${filteredData.length} district${filteredData.length > 1 ? 's' : ''} to Excel`
              }
            >
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={filteredData.length === 0 || loading}
                  sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                >
                  Download Excel
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <MainCard
            title="District-wise CCE Status"
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
                                {row.district}
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
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(row.district, row.hasData)}
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
                        <Typography color="text.secondary">No districts found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredData.length > 0 && !loading && (
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
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

export default KeralaForm5ReportList;
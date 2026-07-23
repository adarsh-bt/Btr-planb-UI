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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CancelIcon from '@mui/icons-material/Cancel';
import HubIcon from '@mui/icons-material/Hub';
import GrassIcon from '@mui/icons-material/Grass';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';

// Gateway root (e.g. http://localhost:8080). The '/earas-form1-entry' service
// prefix is added on the request path below.
// NOTE: if mainapi.EARAS_FORM_API already ends in '/earas-form1-entry',
// drop the duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

/* ─────────────── agricultural year months ─────────────── */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Builds the month list for the active agricultural year (July → June).
// e.g. '2025-2026' → July 2025 ... December 2025, January 2026 ... June 2026
// Each entry: { label: 'July 2025', value: '2025-07' } (value is API-ready YYYY-MM)
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

// Current month as 'YYYY-MM' if it falls inside the agri year, else July (first month)
function getDefaultSingleMonth(agriYearMonths) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return agriYearMonths.some((m) => m.value === current) ? current : agriYearMonths[0]?.value || '';
}

// Extract the API-ready month number (1–12) from a 'YYYY-MM' value.
// e.g. '2025-07' → 7
function monthNum(value) {
  return value ? parseInt(value.split('-')[1], 10) : null;
}

function KeralaForm5ReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Agricultural year from AuthService (e.g. '2025-2026'), and its month list.
  const agriculturalYear = AuthService.agriyear() || '2025-2026';
  const agriYearMonths = useMemo(() => getAgriYearMonths(agriculturalYear), [agriculturalYear]);
  const defaultSingleMonth = useMemo(() => getDefaultSingleMonth(agriYearMonths), [agriYearMonths]);
  const monthLabel = (value) => agriYearMonths.find((m) => m.value === value)?.label || '';

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crop Name filter (UI kept). Backend does not accept cropName yet, so the
  // param is not sent — see the TODO in fetchDashboardData to enable it later.
  const [cropName, setCropName] = useState('ALL');
  const [cropOptions, setCropOptions] = useState([]);

  // Month filter states (values are API-ready 'YYYY-MM')
  const [filterType, setFilterType] = useState('single');
  const [singleMonth, setSingleMonth] = useState(defaultSingleMonth);
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
        // Single month: send only startMonth (backend defaults endMonth = startMonth).
        const start = monthNum(singleMonth) || monthNum(defaultSingleMonth);
        params.append('startMonth', start);
      } else {
        // Month range: startMonth mandatory, endMonth optional.
        const start = monthNum(fromMonth) || monthNum(agriYearMonths[0]?.value);
        params.append('startMonth', start);
        if (toMonth) params.append('endMonth', monthNum(toMonth));
      }

      // TODO: enable when the backend controller accepts a cropName param.
      // if (cropName && cropName !== 'ALL') params.append('cropName', cropName);

      url += `?${params.toString()}`;
      console.log('Fetching data from:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setApiData(response.data);

        // Populate the crop dropdown if/when the endpoint returns a cropList.
        // (Currently not returned, so the dropdown stays at ALL.)
        if (cropName === 'ALL' && Array.isArray(response.data.cropList)) {
          setCropOptions(response.data.cropList);
        }
      }
    } catch (err) {
      console.error('Error fetching CCE Progress dashboard data:', err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Optionally redirect to login page
        // navigate('/login');
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

  // Transform API data to district rows.
  // Live shape: apiData.districts = [
  //   { districtId, districtName, allowedCCECrops, ongoing, completed,
  //     notStarted, underReview, notAvailable, selectedCce },
  //   ...
  // ]
  // Internal key stays `allowtedCce` so downstream table/stat config is unchanged.
  const transformApiDataToDistricts = useMemo(() => {
    if (!apiData || !Array.isArray(apiData.districts)) {
      return [];
    }

    return apiData.districts.map((d) => ({
      id: d.districtId,
      district: d.districtName,
      allowtedCce: d.allowedCCECrops || 0,
      selectedCce: d.selectedCce || 0,
      completed: d.completed || 0,
      ongoing: d.ongoing || 0,
      notAvailable: d.notAvailable || 0,
      notStarted: d.notStarted || 0,
      underReview: d.underReview || 0
    }));
  }, [apiData]);

  // State-level stats come straight from the top-level totals returned by the API
  // (authoritative — do not re-sum the district rows).
  const stats = useMemo(
    () => ({
      allowtedCce: apiData?.allowedCCECrops || 0,
      selectedCce: apiData?.selectedCce || 0,
      completed: apiData?.completed || 0,
      ongoing: apiData?.ongoing || 0,
      notAvailable: apiData?.notAvailable || 0,
      notStarted: apiData?.notStarted || 0,
      underReview: apiData?.underReview || 0
    }),
    [apiData]
  );

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
      setSingleMonth(defaultSingleMonth);
      setFromMonth('');
      setToMonth('');
    } else {
      // range: default from July (first month of the agri year)
      setFromMonth(agriYearMonths[0]?.value || '');
      setSingleMonth('');
      setToMonth('');
    }
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleClearFilters = () => {
    setCropName('ALL');
    setFilterType('single');
    setSingleMonth(defaultSingleMonth);
    setFromMonth('');
    setToMonth('');
    setPage(0);
    setSearchTerm('');
  };

  const handleViewDetails = (districtName) => {
    // Find district ID from data
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

  // Fetch data when month filters change.
  // (cropName is intentionally excluded — it is not sent to the API yet.)
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, singleMonth, fromMonth, toMonth]);

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
    {
      label: 'Completed',
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
  if (loading && !apiData) {
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
            <Typography color="error">Error: {error}</Typography>
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
                  <MenuItem key={crop} value={crop}>
                    {crop}
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
            borderRadius: 3
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

          <MainCard
            title="District-wise CCE Status"
            secondary={
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
            }
            sx={{ borderRadius: 3 }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {[
                      'District',
                      'Allowted CCE',
                      'Selected CCE',
                      'Completed',
                      'Ongoing',
                      'Not Available',
                      'Not Started',
                      'Under Review',
                      'Actions'
                    ].map((label, idx) => (
                      <TableCell
                        key={idx}
                        align={idx === 0 ? 'left' : 'center'}
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
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                            <Typography fontWeight={500}>{row.district}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.allowtedCce} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                        </TableCell>
                        <TableCell align="center">
                          {row.selectedCce > 0 ? (
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
                        <TableCell align="center">
                          {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                        </TableCell>
                        <TableCell align="center">
                          {row.ongoing > 0 ? <Chip label={row.ongoing} size="small" color="primary" variant="outlined" /> : row.ongoing}
                        </TableCell>
                        <TableCell align="center">
                          {row.notAvailable > 0 ? (
                            <Chip label={row.notAvailable} size="small" color="error" variant="outlined" />
                          ) : (
                            row.notAvailable
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.notStarted > 0 ? <Chip label={row.notStarted} size="small" variant="outlined" /> : row.notStarted}
                        </TableCell>
                        <TableCell align="center">
                          {row.underReview > 0 ? (
                            <Chip label={row.underReview} size="small" color="warning" variant="outlined" />
                          ) : (
                            row.underReview
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(row.district)}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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
                rowsPerPageOptions={[5, 10, 25]}
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
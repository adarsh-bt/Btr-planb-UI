import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RefreshIcon from '@mui/icons-material/Refresh';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';
import api from 'api/api';
import AuthService from 'pages/authentication/services/authservice';
import { getCurrentUserJurisdiction } from '../workAllocationReport/userJurisdiction';
import {
  SEASON_OPTIONS,
  buildAgriMonthOptions,
  getMonthNumber,
  getMonthLabel,
  getSeasonLabel,
  categorizeDesignationCounts,
  generateSingleModuleExcelReport
} from './inspectionReportUtils';

const ALL_KERALA_DISTRICTS = [
  { districtId: 1, districtName: 'Thiruvananthapuram' },
  { districtId: 2, districtName: 'Kollam' },
  { districtId: 3, districtName: 'Pathanamthitta' },
  { districtId: 4, districtName: 'Alappuzha' },
  { districtId: 5, districtName: 'Kottayam' },
  { districtId: 6, districtName: 'Idukki' },
  { districtId: 7, districtName: 'Ernakulam' },
  { districtId: 8, districtName: 'Thrissur' },
  { districtId: 9, districtName: 'Palakkad' },
  { districtId: 10, districtName: 'Malappuram' },
  { districtId: 11, districtName: 'Kozhikode' },
  { districtId: 12, districtName: 'Wayanad' },
  { districtId: 13, districtName: 'Kannur' },
  { districtId: 14, districtName: 'Kasaragod' }
];

function mergeWithMasterDistricts(apiDistricts, masterDistricts = ALL_KERALA_DISTRICTS) {
  const masterList = Array.isArray(masterDistricts) && masterDistricts.length > 0 ? masterDistricts : ALL_KERALA_DISTRICTS;
  const apiDistList = Array.isArray(apiDistricts) ? apiDistricts : [];
  const matchedApiIndices = new Set();

  const fullList = masterList.map((masterDist) => {
    const mDistName = masterDist.districtName || masterDist.distNameEn || masterDist.name || '';
    const mDistId = masterDist.districtId || masterDist.distId || masterDist.id;
    const normMaster = mDistName.toLowerCase().replace(/[\s-_]/g, '');

    // 1. Try finding by districtId
    let foundIdx = apiDistList.findIndex(
      (d) => Number(d.districtId) === Number(mDistId) && Number(d.districtId) > 0
    );

    // 2. Fallback to finding by districtName match
    if (foundIdx === -1) {
      foundIdx = apiDistList.findIndex((d) => {
        const normApi = (d.districtName || d.name || '').toLowerCase().replace(/[\s-_]/g, '');
        return normApi && (normApi === normMaster || normApi.slice(0, 5) === normMaster.slice(0, 5));
      });
    }

    if (foundIdx !== -1) {
      matchedApiIndices.add(foundIdx);
      const apiDist = apiDistList[foundIdx];
      const dCounts = Array.isArray(apiDist.designationCounts) ? apiDist.designationCounts : [];
      const { si, tso, dlo } = categorizeDesignationCounts(dCounts);
      const total = typeof apiDist.totalInspectionCount === 'number' ? apiDist.totalInspectionCount : si + tso + dlo;

      return {
        id: mDistId,
        districtId: mDistId,
        name: mDistName,
        districtName: mDistName,
        si,
        tso,
        dlo,
        total
      };
    }

    // Not present in API response -> default to 0
    return {
      id: mDistId,
      districtId: mDistId,
      name: mDistName,
      districtName: mDistName,
      si: 0,
      tso: 0,
      dlo: 0,
      total: 0
    };
  });

  // Append any extra districts returned by API that weren't in master list
  apiDistList.forEach((apiDist, idx) => {
    if (!matchedApiIndices.has(idx)) {
      const dCounts = Array.isArray(apiDist.designationCounts) ? apiDist.designationCounts : [];
      const { si, tso, dlo } = categorizeDesignationCounts(dCounts);
      const total = typeof apiDist.totalInspectionCount === 'number' ? apiDist.totalInspectionCount : si + tso + dlo;

      fullList.push({
        id: apiDist.districtId || fullList.length + 1,
        districtId: apiDist.districtId || 0,
        name: apiDist.districtName || `District ${apiDist.districtId}`,
        districtName: apiDist.districtName || `District ${apiDist.districtId}`,
        si,
        tso,
        dlo,
        total
      });
    }
  });

  return fullList;
}

function KeralaInspectionReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Jurisdiction & Role Scoping
  const userJur = useMemo(() => getCurrentUserJurisdiction(), []);
  const userRole = AuthService.getrole() || userJur.role || 'Super Admin';
  const roleName = Array.isArray(userRole) ? userRole[0] : userRole;
  const userName = AuthService.getusername() || 'System User';

  // State
  const [districtsList, setDistrictsList] = useState(ALL_KERALA_DISTRICTS);
  const [inspectionTab, setInspectionTab] = useState(0); // 0 = Form 1 (inspectionTypeId 1), 1 = CCE (inspectionTypeId 2)

  const [selectedSeason, setSelectedSeason] = useState(1); // 1 = Autumn, 2 = Winter, 3 = Summer
  const [filterType, setFilterType] = useState('range');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState('');

  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);

  const [reportTableData, setReportTableData] = useState([]);
  const [overallTotals, setOverallTotals] = useState({ si: 0, tso: 0, dlo: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  // Fetch BTR Master Districts List
  useEffect(() => {
    const fetchMasterDistricts = async () => {
      try {
        const response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/districts`);
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          const mapped = response.data.data.map((d) => ({
            districtId: d.distId || d.id,
            districtName: d.distNameEn || d.districtName || d.name || ''
          }));
          if (mapped.length > 0) {
            setDistrictsList(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch BTR master districts, using default Kerala districts:', err);
      }
    };
    fetchMasterDistricts();
  }, []);

  // Redirect district/taluk scoped users to their specific sub-reports if restricted
  useEffect(() => {
    if (userJur.level === 'district' && userJur.district) {
      navigate(`/kerala_inspection_report/taluk_inspection_report/${userJur.district.toLowerCase()}`, {
        state: { districtName: userJur.district, isDirectAccess: true }
      });
    } else if (userJur.level === 'taluk' && userJur.district && userJur.taluk) {
      navigate(`/kerala_inspection_report/zone_inspection_report/${userJur.district.toLowerCase()}/${userJur.taluk.toLowerCase()}`, {
        state: { districtName: userJur.district, talukName: userJur.taluk, isDirectAccess: true }
      });
    }
  }, [userJur, navigate]);

  // Fetch Inspection Report Data via Axios (GET)
  const fetchInspectionStatusData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = AuthService.gettoken ? AuthService.gettoken() : localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      let startMonthNum = 0;
      let endMonthNum = 0;

      if (filterType === 'single') {
        if (singleMonth !== '') {
          const num = getMonthNumber(singleMonth);
          startMonthNum = num;
          endMonthNum = num;
        }
      } else {
        if (fromMonth !== '') startMonthNum = getMonthNumber(fromMonth);
        if (toMonth !== '') endMonthNum = getMonthNumber(toMonth);
      }

      const inspectionTypeId = inspectionTab === 0 ? 1 : 2;
      const seasonIdNum = Number(selectedSeason) || 1;
      const agriYearStr = AuthService.agriyear() || '2025-2026';

      const requestParams = {
        agriYear: agriYearStr,
        startMonth: startMonthNum,
        endMonth: endMonthNum,
        seasonId: seasonIdNum,
        inspectionTypeId: inspectionTypeId,
        distId: 0
      };

      const baseUrl = mainapi.FORM_API || mainapi.BTR_API || 'http://localhost:8080';
      let endpoint = `${baseUrl}/earas-form1-entry/api/progress-report/inspection-status/district`;
      if (baseUrl.endsWith('/earas-form1-entry')) {
        endpoint = `${baseUrl}/api/progress-report/inspection-status/district`;
      }

      let response;
      try {
        response = await axios.get(endpoint, { params: requestParams, headers });
      } catch (firstErr) {
        if (firstErr.response && firstErr.response.status === 404) {
          const altEndpoint = `${baseUrl}/api/progress-report/inspection-status/district`;
          response = await axios.get(altEndpoint, { params: requestParams, headers });
        } else {
          throw firstErr;
        }
      }

      const payloadData = response.data?.payload || response.data || {};
      const districtsArr = Array.isArray(payloadData.districts) ? payloadData.districts : [];

      // Merge with master districts so districts without data show as zero
      const mappedRows = mergeWithMasterDistricts(districtsArr, districtsList);

      setReportTableData(mappedRows);

      // Overall Summary Totals
      const totalCountsArr = Array.isArray(payloadData.totalDesignationCounts) ? payloadData.totalDesignationCounts : [];
      const { si: totalSi, tso: totalTso, dlo: totalDlo } = categorizeDesignationCounts(totalCountsArr);
      const grandTotal =
        typeof payloadData.totalInspectionCount === 'number'
          ? payloadData.totalInspectionCount
          : totalSi + totalTso + totalDlo;

      if (totalCountsArr.length === 0 && mappedRows.length > 0) {
        const summed = mappedRows.reduce(
          (acc, r) => ({ si: acc.si + r.si, tso: acc.tso + r.tso, dlo: acc.dlo + r.dlo, total: acc.total + r.total }),
          { si: 0, tso: 0, dlo: 0, total: 0 }
        );
        setOverallTotals(summed);
      } else {
        setOverallTotals({
          si: totalSi,
          tso: totalTso,
          dlo: totalDlo,
          total: grandTotal
        });
      }
    } catch (err) {
      console.error('Failed to fetch district inspection status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch district inspection status from server.');
      setReportTableData([]);
      setOverallTotals({ si: 0, tso: 0, dlo: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [inspectionTab, selectedSeason, filterType, fromMonth, toMonth, singleMonth, districtsList]);

  useEffect(() => {
    fetchInspectionStatusData();
  }, [fetchInspectionStatusData]);

  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSingleMonth('');
    setFilterType('range');
    setSelectedSeason(1);
    setSearchTerm('');
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return reportTableData;
    const q = searchTerm.toLowerCase();
    return reportTableData.filter((row) => row.name.toLowerCase().includes(q));
  }, [reportTableData, searchTerm]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleViewDistrictDetails = (row) => {
    const distName = row.districtName || row.name;
    const distId = row.districtId || row.id || 0;
    navigate(`/kerala_inspection_report/taluk_inspection_report/${distName.toLowerCase()}`, {
      state: {
        districtName: distName,
        districtId: distId,
        inspectionTab,
        selectedSeason,
        filterType,
        fromMonth,
        toMonth,
        singleMonth
      }
    });
  };

  const handleExportExcel = () => {
    if (exporting || filteredRows.length === 0) return;
    setExporting(true);

    try {
      const title = inspectionTab === 0 ? 'EARAS Form 1 Inspection Report' : 'EARAS CCE Inspection Report';
      const label = inspectionTab === 0 ? 'Form 1 Inspection' : 'CCE Inspection';
      const xmlDoc = generateSingleModuleExcelReport({
        reportTitle: title,
        inspectionTypeLabel: label,
        currentLevel: 'state',
        selectedDistrict: '',
        selectedTaluk: '',
        userRole: roleName,
        userName,
        selectedSeason: getSeasonLabel(selectedSeason),
        filterType,
        fromMonth: getMonthLabel(fromMonth),
        toMonth: getMonthLabel(toMonth),
        singleMonth: getMonthLabel(singleMonth),
        rowsData: filteredRows
      });

      const blob = new Blob([xmlDoc], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspection_Report_State_${label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Excel download failed:', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* ── Inspection Type Tabs ── */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: '#fff' }}>
          <Tabs
            value={inspectionTab}
            onChange={(e, val) => {
              setInspectionTab(val);
              setPage(0);
            }}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                py: 1.5
              }
            }}
          >
            <Tab icon={<AssignmentTurnedInIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Form 1 Inspection" />
            <Tab icon={<FactCheckIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="CCE Inspection" />
          </Tabs>
        </Paper>
      </Grid>

      {/* ── Top Season & Month Filter Bar ── */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: '#fff' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Season</InputLabel>
              <Select
                value={selectedSeason}
                label="Season"
                onChange={(e) => {
                  setSelectedSeason(e.target.value);
                  setPage(0);
                }}
              >
                {SEASON_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setFilterType(newValue);
                  setFromMonth('');
                  setToMonth('');
                  setSingleMonth('');
                  setPage(0);
                }
              }}
              size="small"
            >
              <ToggleButton value="range">Month Range</ToggleButton>
              <ToggleButton value="single">Single Month</ToggleButton>
            </ToggleButtonGroup>

            {filterType === 'range' ? (
              <>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>From Month</InputLabel>
                  <Select
                    value={fromMonth}
                    label="From Month"
                    onChange={(e) => {
                      setFromMonth(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {monthOptions.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  →
                </Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
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
                    {monthOptions.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={singleMonth}
                  label="Select Month"
                  onChange={(e) => {
                    setSingleMonth(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {monthOptions.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {(fromMonth !== '' || toMonth !== '' || singleMonth !== '' || selectedSeason !== 1) && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                size="small"
                sx={{ borderRadius: 2, ml: 'auto' }}
              >
                Clear Filters
              </Button>
            )}
            <IconButton onClick={fetchInspectionStatusData} color="primary" title="Refresh Data" size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Grid>

      {/* ── Summary KPI Cards ── */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#1a237e', 0.06), borderRadius: 3, border: `1px solid ${alpha('#1a237e', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                      {loading ? <CircularProgress size={24} /> : overallTotals.total}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1a237e', fontWeight: 600, mt: 0.5 }}>
                      Total Inspections Conducted
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 36, color: '#1a237e', opacity: 0.6 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#1565c0', 0.06), borderRadius: 3, border: `1px solid ${alpha('#1565c0', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                      {loading ? <CircularProgress size={24} /> : overallTotals.si}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 600, mt: 0.5 }}>
                      SI Inspections
                    </Typography>
                  </Box>
                  <Chip label="SI Users" size="small" color="primary" sx={{ fontWeight: 600 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#2e7d32', 0.06), borderRadius: 3, border: `1px solid ${alpha('#2e7d32', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      {loading ? <CircularProgress size={24} /> : overallTotals.tso}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600, mt: 0.5 }}>
                      TSO Inspections
                    </Typography>
                  </Box>
                  <Chip label="TSO Users" size="small" color="success" sx={{ fontWeight: 600 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#ed6c02', 0.06), borderRadius: 3, border: `1px solid ${alpha('#ed6c02', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                      {loading ? <CircularProgress size={24} /> : overallTotals.dlo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ed6c02', fontWeight: 600, mt: 0.5 }}>
                      DLO Inspections
                    </Typography>
                  </Box>
                  <Chip label="DLO Users" size="small" color="warning" sx={{ fontWeight: 600 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Error Notification Banner ── */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* ── Table Card ── */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e' }}>
                {inspectionTab === 0 ? 'Form 1' : 'CCE'} Inspection Records — State Overview (Districts)
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  placeholder="Search districts…"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  sx={{ width: { xs: '100%', sm: 220 }, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleExportExcel}
                  disabled={exporting || filteredRows.length === 0}
                  startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' }
                  }}
                >
                  Download Excel
                </Button>
              </Stack>
            </Stack>
          </Box>

          <TableContainer sx={{ maxHeight: 520, position: 'relative' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700, width: 80 }}>Sl. No</TableCell>
                  <TableCell sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>District Name</TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    SI Inspections
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    TSO Inspections
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    DLO Inspections
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    Total Inspections Conducted
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700, width: 120 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Fetching District Inspection Data...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No inspection records found matching active filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, idx) => (
                    <TableRow key={row.id || idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fcfcfd' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationOnIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                          <span>{row.name}</span>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.si} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, minWidth: 45 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.tso} size="small" color="success" variant="outlined" sx={{ fontWeight: 700, minWidth: 45 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.dlo} size="small" color="warning" variant="outlined" sx={{ fontWeight: 700, minWidth: 45 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.total}
                          size="small"
                          sx={{ fontWeight: 800, minWidth: 55, bgcolor: alpha('#1a237e', 0.12), color: '#1a237e' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDistrictDetails(row)}
                            sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newP) => setPage(newP)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default KeralaInspectionReportList;


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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  DISTRICT_TALUKS,
  generateSingleModuleExcelReport
} from './inspectionReportUtils';

const DISTRICT_ID_MAP = {
  'thiruvananthapuram': 1,
  'kollam': 2,
  'pathanamthitta': 3,
  'alappuzha': 4,
  'kottayam': 5,
  'idukki': 6,
  'ernakulam': 7,
  'thrissur': 8,
  'palakkad': 9,
  'malappuram': 10,
  'kozhikode': 11,
  'wayanad': 12,
  'kannur': 13,
  'kasaragod': 14,
  'kasargode': 14
};

function mergeWithMasterTaluks(districtName, apiTaluks, masterTaluksList = []) {
  const apiTalukList = Array.isArray(apiTaluks) ? apiTaluks : [];
  const matchedApiIndices = new Set();

  const matchedDistKey =
    Object.keys(DISTRICT_TALUKS).find((k) => k.toLowerCase() === (districtName || '').toLowerCase()) || districtName;

  const staticMasterTalukNames = DISTRICT_TALUKS[matchedDistKey] || [];
  const masterTalukNames =
    Array.isArray(masterTaluksList) && masterTaluksList.length > 0 ? masterTaluksList : staticMasterTalukNames;

  const fullList = masterTalukNames.map((tItem, idx) => {
    const tName = typeof tItem === 'string' ? tItem : tItem.talukNameEn || tItem.talukName || tItem.name || `Taluk ${idx + 1}`;
    const tId = typeof tItem === 'object' && tItem ? tItem.talukId || tItem.desTalukId || tItem.id || idx + 1 : idx + 1;
    const normMaster = tName.toLowerCase().replace(/[\s-_]/g, '');

    let foundIdx = apiTalukList.findIndex((t) => {
      const normApi = (t.talukName || t.name || '').toLowerCase().replace(/[\s-_]/g, '');
      return normApi && (normApi === normMaster || normApi.slice(0, 5) === normMaster.slice(0, 5));
    });

    if (foundIdx !== -1) {
      matchedApiIndices.add(foundIdx);
      const apiTaluk = apiTalukList[foundIdx];
      const dCounts = Array.isArray(apiTaluk.designationCounts) ? apiTaluk.designationCounts : [];
      const { si, tso, dlo } = categorizeDesignationCounts(dCounts);
      const total = typeof apiTaluk.totalInspectionCount === 'number' ? apiTaluk.totalInspectionCount : si + tso + dlo;

      return {
        id: apiTaluk.talukId || tId,
        talukId: apiTaluk.talukId || tId,
        name: tName,
        talukName: tName,
        districtName,
        si,
        tso,
        dlo,
        total
      };
    }

    return {
      id: tId,
      talukId: tId,
      name: tName,
      talukName: tName,
      districtName,
      si: 0,
      tso: 0,
      dlo: 0,
      total: 0
    };
  });

  apiTalukList.forEach((apiTaluk, idx) => {
    if (!matchedApiIndices.has(idx)) {
      const dCounts = Array.isArray(apiTaluk.designationCounts) ? apiTaluk.designationCounts : [];
      const { si, tso, dlo } = categorizeDesignationCounts(dCounts);
      const total = typeof apiTaluk.totalInspectionCount === 'number' ? apiTaluk.totalInspectionCount : si + tso + dlo;

      fullList.push({
        id: apiTaluk.talukId || fullList.length + 1,
        talukId: apiTaluk.talukId || 0,
        name: apiTaluk.talukName || `Taluk ${apiTaluk.talukId}`,
        talukName: apiTaluk.talukName || `Taluk ${apiTaluk.talukId}`,
        districtName,
        si,
        tso,
        dlo,
        total
      });
    }
  });

  return fullList;
}

function TalukInspectionReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // Resolve District Name from params or location state
  const rawDistParam = params.districtName || location.state?.districtName || '';
  const districtName = useMemo(() => {
    if (!rawDistParam) return 'Thiruvananthapuram';
    const found = Object.keys(DISTRICT_TALUKS).find((d) => d.toLowerCase() === rawDistParam.toLowerCase());
    return found || rawDistParam;
  }, [rawDistParam]);

  // Jurisdiction & Role Scoping
  const userJur = useMemo(() => getCurrentUserJurisdiction(), []);
  const userRole = AuthService.getrole() || userJur.role || 'Super Admin';
  const roleName = Array.isArray(userRole) ? userRole[0] : userRole;
  const userName = AuthService.getusername() || 'System User';

  // State
  const [masterTaluksList, setMasterTaluksList] = useState([]);
  const [inspectionTab, setInspectionTab] = useState(location.state?.inspectionTab || 0);
  const [selectedSeason, setSelectedSeason] = useState(location.state?.selectedSeason || 1);
  const [filterType, setFilterType] = useState(location.state?.filterType || 'range');
  const [fromMonth, setFromMonth] = useState(location.state?.fromMonth || '');
  const [toMonth, setToMonth] = useState(location.state?.toMonth || '');
  const [singleMonth, setSingleMonth] = useState(location.state?.singleMonth || '');

  const monthOptions = useMemo(() => buildAgriMonthOptions(), []);

  const [reportTableData, setReportTableData] = useState([]);
  const [overallTotals, setOverallTotals] = useState({ si: 0, tso: 0, dlo: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  // Fetch Master Taluks for Selected District
  useEffect(() => {
    const fetchMasterTaluks = async () => {
      const targetDistId = location.state?.districtId || DISTRICT_ID_MAP[districtName.toLowerCase()] || 1;
      try {
        const response = await api.get(`${mainapi.BTR_API}/btr-service/btr-api/taluks?distId=${targetDistId}`);
        if (response.data && (response.data.data || Array.isArray(response.data))) {
          const list = response.data.data || response.data;
          setMasterTaluksList(list);
        }
      } catch (err) {
        console.warn('Failed to fetch master taluks from BTR API, using static master list:', err);
      }
    };
    fetchMasterTaluks();
  }, [districtName, location.state]);

  // Fetch Taluk Inspection Report Data via Axios GET
  const fetchTalukInspectionStatus = useCallback(async () => {
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

      const targetDistId = location.state?.districtId || DISTRICT_ID_MAP[districtName.toLowerCase()] || 1;

      const requestParams = {
        agriYear: agriYearStr,
        startMonth: startMonthNum,
        endMonth: endMonthNum,
        seasonId: seasonIdNum,
        inspectionTypeId: inspectionTypeId,
        distId: targetDistId
      };

      const baseUrl = mainapi.FORM_API || mainapi.BTR_API || 'http://localhost:8080';
      let endpoint = `${baseUrl}/earas-form1-entry/api/progress-report/inspection-status/taluk`;
      if (baseUrl.endsWith('/earas-form1-entry')) {
        endpoint = `${baseUrl}/api/progress-report/inspection-status/taluk`;
      }

      let response;
      try {
        response = await axios.get(endpoint, { params: requestParams, headers });
      } catch (firstErr) {
        if (firstErr.response && firstErr.response.status === 404) {
          const altEndpoint = `${baseUrl}/api/progress-report/inspection-status/taluk`;
          response = await axios.get(altEndpoint, { params: requestParams, headers });
        } else {
          throw firstErr;
        }
      }

      const payloadData = response.data?.payload || response.data || {};
      const taluksArr = Array.isArray(payloadData.taluks)
        ? payloadData.taluks
        : Array.isArray(payloadData.districts)
        ? payloadData.districts
        : Array.isArray(payloadData.records)
        ? payloadData.records
        : [];

      const mappedRows = mergeWithMasterTaluks(districtName, taluksArr, masterTaluksList);
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
      console.error('Failed to fetch taluk inspection status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch taluk inspection status from server.');
      setReportTableData(mergeWithMasterTaluks(districtName, []));
      setOverallTotals({ si: 0, tso: 0, dlo: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [districtName, inspectionTab, selectedSeason, filterType, fromMonth, toMonth, singleMonth, location.state?.districtId, masterTaluksList]);

  useEffect(() => {
    fetchTalukInspectionStatus();
  }, [fetchTalukInspectionStatus]);

  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSingleMonth('');
    setFilterType('range');
    setSelectedSeason(1);
    setSearchTerm('');
    setPage(0);
  };

  const handleBackToState = () => {
    navigate('/Report/kerala_inspection_report');
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

  const handleViewTalukDetails = (row) => {
    const talukName = row.talukName || row.name;
    const talukId = row.talukId || row.id || 0;
    const targetDistId = location.state?.districtId || DISTRICT_ID_MAP[districtName.toLowerCase()] || 1;

    navigate(`/kerala_inspection_report/zone_inspection_report/${districtName.toLowerCase()}/${talukName.toLowerCase()}`, {
      state: {
        districtName,
        districtId: targetDistId,
        talukName,
        talukId,
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
        currentLevel: 'district',
        selectedDistrict: districtName,
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
      a.download = `Inspection_Report_District_${districtName}_${label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
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

      {/* ── Back Button & District Title Header ── */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {userJur.level !== 'taluk' && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToState}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Back to State Overview
              </Button>
            )}
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a237e' }}>
              {districtName} District — Taluk Wise Inspection Status
            </Typography>
          </Stack>

          <IconButton onClick={fetchTalukInspectionStatus} color="primary" title="Refresh Data" size="small">
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Grid>

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
                      Total Inspections ({districtName})
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
                {inspectionTab === 0 ? 'Form 1' : 'CCE'} Inspection Records — {districtName} District (Taluks)
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  placeholder="Search taluks…"
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
                  <TableCell sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>Taluk Name</TableCell>
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
                        Fetching Taluk Inspection Data...
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
                            onClick={() => handleViewTalukDetails(row)}
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

export default TalukInspectionReport;

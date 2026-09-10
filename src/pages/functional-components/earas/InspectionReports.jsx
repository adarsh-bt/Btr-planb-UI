import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import DownloadIcon from '@mui/icons-material/Download';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxIcon from '@mui/icons-material/Inbox';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import InspectionReportsService from './inspectionReportsService';

/**
 * InspectionReports Component
 * 
 * Renders the primary dashboard view for browsing, filtering, searching,
 * and downloading Inspection Reports across government administrative hierarchy levels:
 *   - Directorate Level: Full state-wide inspection visibility
 *   - District Level: District-wide inspection visibility
 *   - Taluk Level: Taluk-wide inspection visibility
 *   - Field Data Collector: Visibility of who inspected their assigned clusters ("Inspected By")
 */

// ──────────────────────────────────────────────
// Role-Level Helpers & Classification
// ──────────────────────────────────────────────
const TALUK_LEVEL_ROLES = ['Taluk Level Approver', 'Inspector'];
const DISTRICT_LEVEL_ROLES = ['District Level Approver', 'District Level Data Viewer'];
const DIRECTORATE_LEVEL_ROLES = ['Super Admin', 'IT Admin', 'State Level Approver', 'EARAS Admin', 'State Level Data Viewer'];

/**
 * Determines the administrative hierarchy level of the logged-in user role.
 * 
 * @param {string} role User role string from JWT
 * @returns {'directorate' | 'district' | 'taluk' | 'fdc'} Hierarchy level
 */
function getUserLevel(role) {
  if (DIRECTORATE_LEVEL_ROLES.includes(role)) return 'directorate';
  if (DISTRICT_LEVEL_ROLES.includes(role)) return 'district';
  if (TALUK_LEVEL_ROLES.includes(role)) return 'taluk';
  if (role === 'Field Data Collector') return 'fdc';
  return 'taluk'; // Default fallback
}

/**
 * Builds table column definitions dynamically tailored to the user's role level.
 * 
 * @param {string} userLevel Administrative hierarchy level ('directorate', 'district', 'taluk', 'fdc')
 * @returns {Array<{ id: string, label: string, sortable: boolean, width?: string, minWidth?: string }>}
 */
function getColumns(userLevel) {
  const base = [
    { id: 'slNo', label: 'Sl. No', sortable: false, width: '70px' },
  ];

  // Directorate level users see District column
  if (userLevel === 'directorate') {
    base.push({ id: 'district', label: 'District', sortable: true, minWidth: '140px' });
  }

  // Directorate and District level users see Taluk column
  if (userLevel === 'directorate' || userLevel === 'district') {
    base.push({ id: 'taluk', label: 'Taluk', sortable: true, minWidth: '130px' });
  }

  base.push(
    { id: 'zoneName', label: 'Zone Name', sortable: true, minWidth: '140px' },
    { id: 'inspectionType', label: 'Inspection Type', sortable: true, width: '160px' },
    { id: 'clusterOrCrop', label: 'Cluster No. / Crop Name', sortable: true, minWidth: '160px' },
    { id: 'inspectedOn', label: 'Inspected On', sortable: true, width: '130px' },
    { id: 'inspectedBy', label: 'Inspected By (Supervisor)', sortable: true, minWidth: '170px' },
    { id: 'investigatorName', label: 'Investigator Name', sortable: true, minWidth: '160px' },
    { id: 'remarks', label: 'Remarks', sortable: false, minWidth: '200px' },
    { id: 'action', label: 'Action', sortable: false, width: '110px' },
  );

  return base;
}

// ──────────────────────────────────────────────
// Custom UI Styles & Layout Helpers
// ──────────────────────────────────────────────
const stickyHeaderStyles = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: '#1a237e',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  borderBottom: '2px solid #3949ab',
};

const filterPaperStyles = {
  p: 2.5,
  mb: 2,
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)',
  border: '1px solid #e0e0e0',
};

const tableContainerStyles = {
  maxHeight: 'calc(100vh - 380px)',
  minHeight: '300px',
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  '&::-webkit-scrollbar': { width: '8px', height: '8px' },
  '&::-webkit-scrollbar-thumb': { background: '#bdbdbd', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: '#9e9e9e' },
};

// Month options for filter dropdown
const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// ──────────────────────────────────────────────
// Main InspectionReports Component Implementation
// ──────────────────────────────────────────────
function InspectionReports() {
  const theme = useTheme();

  // Retrieve user identity and security details from authservice
  const role = authservice.getrole() || 'Super Admin';
  const userId = authservice.userid();
  const districtId = localStorage.getItem('dis');
  const userLevel = getUserLevel(role);
  const columns = useMemo(() => getColumns(userLevel), [userLevel]);

  // ── State Management ──
  const [data, setData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('inspectedOn');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic filter state
  const [filters, setFilters] = useState({
    zoneName: '',
    district: '',
    taluk: '',
    clusterNumber: '',
    dateFrom: '',
    dateTo: '',
    month: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // Dropdown filter options loaded from backend
  const [filterOptions, setFilterOptions] = useState({ districts: [], taluksByDistrict: {}, zones: [] });

  // Downloading state trackers
  const [excelDownloading, setExcelDownloading] = useState(false);
  const [pdfDownloadingId, setPdfDownloadingId] = useState(null);

  // User notification snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ── Load Role-Scoped Filter Options ──
  useEffect(() => {
    // Fetch dropdown options tailored to logged-in user role
    InspectionReportsService.fetchFilterOptions(role)
      .then(setFilterOptions)
      .catch(() => { /* Fallback handled internally by service */ });
  }, [role]);

  // ── Debounce Search Keyword ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(0); // Reset to first page on search query change
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Main Data Fetching Handler ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass role security context parameters to backend service
      const userContext = {
        userRole: role,
        userId: userId && userId !== 'null' && userId !== 'undefined' ? userId : null,
        districtId: districtId && districtId !== 'null' && districtId !== 'undefined' ? districtId : null,
      };

      const result = await InspectionReportsService.fetchInspectionReports({
        page,
        size: rowsPerPage,
        sortField,
        sortOrder,
        filters: { ...appliedFilters, search: searchDebounced },
        userContext,
      });

      setData(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('Failed to fetch inspection reports:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to connect to inspection service.';
      setError(msg);
      setData([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortField, sortOrder, appliedFilters, searchDebounced, role, userId, districtId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Event Handlers ──
  const handleSortRequest = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (e) => {
    const value = e.target.value;
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset taluk selection when district changes
      if (field === 'district') updated.taluk = '';
      return updated;
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(0);
  };

  const handleResetFilters = () => {
    const empty = { zoneName: '', district: '', taluk: '', clusterNumber: '', dateFrom: '', dateTo: '' };
    setFilters(empty);
    setAppliedFilters({});
    setPage(0);
  };

  /**
   * Handle Single PDF Report Download
   */
  const handleDownloadSingleReport = async (row) => {
    setPdfDownloadingId(row.id);
    try {
      const blob = await InspectionReportsService.downloadInspectionReport(row.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Inspection_Report_${row.clusterNumber || row.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: `Downloaded inspection report for ${row.zoneName || 'cluster'}`, severity: 'success' });
    } catch (err) {
      console.error('PDF download failed:', err);
      setSnackbar({ open: true, message: 'Failed to download report PDF.', severity: 'error' });
    } finally {
      setPdfDownloadingId(null);
    }
  };

  /**
   * Export Filtered Reports to CSV / Excel
   */
  const handleDownloadExcel = async () => {
    if (excelDownloading) return;
    setExcelDownloading(true);
    try {
      const userContext = { userRole: role, userId, districtId };
      const result = await InspectionReportsService.fetchInspectionReports({
        page: 0,
        size: 99999, // Unpaginated full fetch for export
        sortField,
        sortOrder,
        filters: { ...appliedFilters, search: searchDebounced },
        userContext,
      });

      const allData = result.content;
      if (!allData || allData.length === 0) {
        setSnackbar({ open: true, message: 'No data available to export.', severity: 'warning' });
        return;
      }

      // Build headers matching active columns
      const exportColumns = columns.filter((c) => c.id !== 'slNo' && c.id !== 'action');
      const headers = exportColumns.map((c) => c.label);

      // Build CSV row strings
      const csvRows = allData.map((row) => {
        return exportColumns.map((col) => {
          let value = '';
          if (col.id === 'clusterOrCrop') {
            if (row.inspectionType === 'Cluster Inspection') {
              value = row.clusterNumber || '';
            } else {
              value = row.clusterNumber && row.cropName ? `${row.clusterNumber} (${row.cropName})` : (row.cropName || row.clusterNumber || '');
            }
          } else if (col.id === 'inspectedOn') {
            value = row.inspectedOn
              ? new Date(row.inspectedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '';
          } else {
            value = row[col.id] ?? '';
          }
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',');
      });

      const headerLine = '"Sl. No",' + headers.join(',');
      const dataLines = csvRows.map((row, i) => `"${i + 1}",${row}`);
      const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\n'); // Add BOM for Excel UTF-8 compatibility

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Inspection_Reports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: `Exported ${allData.length} records to Excel CSV`, severity: 'success' });
    } catch (err) {
      console.error('Excel export failed:', err);
      setSnackbar({ open: true, message: 'Export failed. Please try again.', severity: 'error' });
    } finally {
      setExcelDownloading(false);
    }
  };

  // Compute available taluks based on selected district filter
  const availableTaluks = filters.district ? (filterOptions.taluksByDistrict[filters.district] || []) : [];

  // Active applied filter count badge
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  // Render role level label for header badge
  const getRoleLabel = () => {
    if (userLevel === 'directorate') return 'Directorate Level View';
    if (userLevel === 'district') return 'District Level View';
    if (userLevel === 'taluk') return 'Taluk Level View';
    if (userLevel === 'fdc') return 'Field Collector View';
    return 'Inspection Reports';
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <MainCard
          title={
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e' }}>
                  Inspection Reports
                </Typography>
                {/* Role Level Badge */}
                <Chip
                  label={getRoleLabel()}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backgroundColor: '#e8eaf6',
                    color: '#1a237e',
                    border: '1px solid #c5cae9',
                  }}
                />
                {activeFilterCount > 0 && (
                  <Chip
                    label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onDelete={handleResetFilters}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* Search Bar */}
                <TextField
                  placeholder="Search reports, inspector, zone…"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    width: { xs: '100%', sm: '260px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: '#f5f7fa',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9e9e9e', fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {/* Toggle Filter Panel */}
                <Tooltip title={showFilters ? 'Hide Filters' : 'Show Filters'}>
                  <IconButton
                    onClick={() => setShowFilters((v) => !v)}
                    sx={{
                      backgroundColor: showFilters ? '#1a237e' : '#f5f7fa',
                      color: showFilters ? '#fff' : '#616161',
                      borderRadius: '10px',
                      '&:hover': { backgroundColor: showFilters ? '#283593' : '#e0e0e0' },
                    }}
                  >
                    {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                  </IconButton>
                </Tooltip>
                {/* Refresh Data */}
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={fetchData}
                    disabled={loading}
                    sx={{
                      backgroundColor: '#f5f7fa',
                      borderRadius: '10px',
                      '&:hover': { backgroundColor: '#e0e0e0' },
                    }}
                  >
                    <RefreshIcon sx={{ color: '#616161' }} />
                  </IconButton>
                </Tooltip>
                {/* Download Excel Export */}
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleDownloadExcel}
                  disabled={excelDownloading || loading || data.length === 0}
                  startIcon={excelDownloading ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' },
                    '&.Mui-disabled': { backgroundColor: '#c8e6c9', color: '#fff' },
                  }}
                >
                  {excelDownloading ? 'Exporting…' : 'Download Excel'}
                </Button>
              </Stack>
            </Stack>
          }
        >
          {/* ── Filter Bar Panel ── */}
          {showFilters && (
            <Paper elevation={0} sx={filterPaperStyles}>
              <Grid container spacing={2} alignItems="flex-end">
                {/* Zone Select */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Zone"
                    value={filters.zoneName}
                    onChange={handleFilterChange('zoneName')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                  >
                    <MenuItem value="">All Zones</MenuItem>
                    {filterOptions.zones.map((z) => (
                      <MenuItem key={z} value={z}>{z}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* District Select — Directorate Level Only */}
                {userLevel === 'directorate' && (
                  <Grid item xs={12} sm={6} md={3} lg={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="District"
                      value={filters.district}
                      onChange={handleFilterChange('district')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                    >
                      <MenuItem value="">All Districts</MenuItem>
                      {filterOptions.districts.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {/* Taluk Select — Directorate & District Levels */}
                {(userLevel === 'directorate' || userLevel === 'district') && (
                  <Grid item xs={12} sm={6} md={3} lg={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Taluk"
                      value={filters.taluk}
                      onChange={handleFilterChange('taluk')}
                      disabled={userLevel === 'directorate' && !filters.district}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                    >
                      <MenuItem value="">All Taluks</MenuItem>
                      {(userLevel === 'directorate' ? availableTaluks : Object.values(filterOptions.taluksByDistrict).flat()).map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {/* Cluster Number Filter */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cluster No."
                    placeholder="e.g. CL-001"
                    value={filters.clusterNumber}
                    onChange={handleFilterChange('clusterNumber')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                  />
                </Grid>

                {/* Date From Filter */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date From"
                    type="date"
                    value={filters.dateFrom}
                    onChange={handleFilterChange('dateFrom')}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                  />
                </Grid>

                {/* Date To Filter */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date To"
                    type="date"
                    value={filters.dateTo}
                    onChange={handleFilterChange('dateTo')}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                  />
                </Grid>

                {/* Month Filter */}
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Inspection Month"
                    value={filters.month || ''}
                    onChange={handleFilterChange('month')}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#fff' } }}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {MONTH_OPTIONS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Filter Action Buttons */}
                <Grid item xs={12} sm={12} md={6} lg={12}>
                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={handleResetFilters}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#bdbdbd',
                        color: '#616161',
                        '&:hover': { borderColor: '#9e9e9e', backgroundColor: '#fafafa' },
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleApplyFilters}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                        boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
                        '&:hover': { background: 'linear-gradient(135deg, #0d1b5e 0%, #283593 100%)' },
                      }}
                    >
                      Apply Filters
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* ── Error State Display ── */}
          {error && !loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                gap: 2,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: '4rem', color: '#ef5350' }} />
              <Typography variant="h6" color="error" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={fetchData}
                startIcon={<RefreshIcon />}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Retry
              </Button>
            </Box>
          )}

          {/* ── Main Data Table ── */}
          {!error && (
            <>
              <TableContainer component={Paper} elevation={0} sx={tableContainerStyles}>
                <Table stickyHeader size="small">
                  {/* Table Header */}
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align || 'left'}
                          sx={{
                            ...stickyHeaderStyles,
                            width: col.width || 'auto',
                            minWidth: col.minWidth || 'auto',
                          }}
                        >
                          {col.sortable ? (
                            <TableSortLabel
                              active={sortField === col.id}
                              direction={sortField === col.id ? sortOrder : 'asc'}
                              onClick={() => handleSortRequest(col.id)}
                              sx={{
                                color: '#fff !important',
                                '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                                '&.Mui-active': { color: '#fff !important' },
                              }}
                            >
                              {col.label}
                            </TableSortLabel>
                          ) : (
                            col.label
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  {/* Table Body */}
                  <TableBody>
                    {/* Loading Skeletons */}
                    {loading &&
                      Array.from({ length: rowsPerPage }).map((_, idx) => (
                        <TableRow key={`skeleton-${idx}`}>
                          {columns.map((col) => (
                            <TableCell key={col.id}>
                              <Skeleton variant="text" animation="wave" width="80%" height={24} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}

                    {/* Data Rows Rendering */}
                    {!loading &&
                      data.map((row, index) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            '&:nth-of-type(even)': { backgroundColor: '#fafbff' },
                            transition: 'background-color 0.2s',
                            '&:hover': { backgroundColor: '#e8eaf6 !important' },
                          }}
                        >
                          {columns.map((col) => {
                            if (col.id === 'slNo') {
                              return (
                                <TableCell key={col.id} sx={{ fontWeight: 600, color: '#616161' }}>
                                  {page * rowsPerPage + index + 1}
                                </TableCell>
                              );
                            }
                            if (col.id === 'inspectionType') {
                              const isCluster = row.inspectionType === 'Cluster Inspection';
                              return (
                                <TableCell key={col.id}>
                                  <Chip
                                    label={row.inspectionType}
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      backgroundColor: isCluster ? '#e3f2fd' : '#fff3e0',
                                      color: isCluster ? '#1565c0' : '#e65100',
                                      border: `1px solid ${isCluster ? '#90caf9' : '#ffcc80'}`,
                                    }}
                                  />
                                </TableCell>
                              );
                            }
                            if (col.id === 'clusterOrCrop') {
                              let value = '—';
                              if (row.inspectionType === 'Cluster Inspection') {
                                value = row.clusterNumber || '—';
                              } else {
                                if (row.clusterNumber && row.cropName) {
                                  value = `${row.clusterNumber} (${row.cropName})`;
                                } else {
                                  value = row.cropName || row.clusterNumber || '—';
                                }
                              }
                              return (
                                <TableCell key={col.id} sx={{ color: '#424242', fontWeight: 500 }}>
                                  {value}
                                </TableCell>
                              );
                            }
                            if (col.id === 'inspectedOn') {
                              return (
                                <TableCell key={col.id} sx={{ color: '#424242' }}>
                                  {row.inspectedOn
                                    ? new Date(row.inspectedOn).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : '—'}
                                </TableCell>
                              );
                            }
                            if (col.id === 'inspectedBy') {
                              // Displays the supervisor officer details
                              return (
                                <TableCell key={col.id} sx={{ color: '#1a237e', fontWeight: 600 }}>
                                  {row.inspectedBy || 'Supervisor'}
                                </TableCell>
                              );
                            }
                            if (col.id === 'investigatorName') {
                              // Displays the field investigator details
                              return (
                                <TableCell key={col.id} sx={{ color: '#2e7d32', fontWeight: 600 }}>
                                  {row.investigatorName || 'Investigator'}
                                </TableCell>
                              );
                            }
                            if (col.id === 'remarks') {
                              return (
                                <TableCell
                                  key={col.id}
                                  sx={{
                                    color: '#616161',
                                    maxWidth: '280px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <Tooltip title={row.remarks || '—'} arrow>
                                    <span>{row.remarks || '—'}</span>
                                  </Tooltip>
                                </TableCell>
                              );
                            }
                            if (col.id === 'action') {
                              // Single PDF Report Download Action
                              const isDownloadingThis = pdfDownloadingId === row.id;
                              return (
                                <TableCell key={col.id}>
                                  <Tooltip title="Download Report PDF">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleDownloadSingleReport(row)}
                                      disabled={isDownloadingThis}
                                      sx={{
                                        backgroundColor: '#e8eaf6',
                                        '&:hover': { backgroundColor: '#c5cae9' },
                                      }}
                                    >
                                      {isDownloadingThis ? (
                                        <CircularProgress size={18} color="primary" />
                                      ) : (
                                        <DownloadIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              );
                            }
                            return (
                              <TableCell key={col.id} sx={{ color: '#424242' }}>
                                {row[col.id] || '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}

                    {/* Empty State */}
                    {!loading && data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} sx={{ border: 'none' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              py: 8,
                              gap: 1.5,
                            }}
                          >
                            <InboxIcon sx={{ fontSize: '4rem', color: '#bdbdbd' }} />
                            <Typography variant="h6" sx={{ color: '#9e9e9e', fontWeight: 600 }}>
                              No inspection reports found
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                              Try adjusting your search or filters for your role level
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination Controls */}
              <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{
                  borderTop: '1px solid #e0e0e0',
                  '& .MuiTablePagination-toolbar': { paddingLeft: '16px' },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontWeight: 500,
                    color: '#616161',
                  },
                }}
              />
            </>
          )}
        </MainCard>
      </Grid>

      {/* Snackbar Alert Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ borderRadius: '10px', fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default InspectionReports;

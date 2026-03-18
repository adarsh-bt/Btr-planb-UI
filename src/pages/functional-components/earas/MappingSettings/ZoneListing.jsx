import React, { useState, useEffect, useMemo, useCallback,useRef } from 'react';
import Breadcrumb from 'routes/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Pagination,
  PaginationItem,


} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  LocationOn as LocationOnIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import mainapi from 'api/mainapi';

const ZoneListing = () => {
  // State management
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();
  // Pagination states from API
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const searchRef = useRef(null);
  
  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('zoneId');
  
  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Transform API data to match table format
  const transformZoneData = (apiData) => {
    return apiData.map((zone, index) => ({
      slNo: (page * rowsPerPage) + index + 1,
      zoneId: zone.zoneId,
      zoneCode: zone.zoneCode || 'N/A',
      zoneNameEn: zone.zoneNameEn,
      zoneType: zone.zoneType || 'N/A',
      desTalukId: zone.desTalukId,
      desDistId: zone.desDistId,
      talukName: zone.talukName || 'N/A',
      districtName: zone.districtName || 'N/A'
    }));
  };



  // Fetch zones from API with pagination
const fetchZones = useCallback(async (currentPage, size, search) => {
  setLoading(true);
  setFetchError(null);

  try {
    const BASE_URL = mainapi.BASE_URL;
    const token = localStorage.getItem('token');

    const response = await fetch(
      `${BASE_URL}/btr-service/admin-manage/GetZones?page=${currentPage}&size=${size}&search=${search}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch zones (${response.status})`);
    }

    const data = await response.json();

    const zones = data.zones || [];
    setTotalItems(data.totalItems || 0);
    setTotalPages(data.totalPages || 0);

    setZoneData(transformZoneData(zones));
  } catch (err) {
    setFetchError(`Failed to fetch zone data. ${err.message}`);
  } finally {
    setLoading(false);
  }
}, [page, rowsPerPage]); // ✅ important

useEffect(() => {
  fetchZones(page, rowsPerPage, searchTerm);
}, [page, rowsPerPage]);

const handleSearchClick = () => {
  setPage(0);
  fetchZones(0, rowsPerPage, searchTerm);
};
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    handleSearchClick();
  }
};
  // Get unique values for filters from actual data
  const uniqueDistricts = useMemo(() => {
    return [...new Set(zoneData.map(zone => zone.districtName).filter(name => name !== 'N/A'))].sort();
  }, [zoneData]);

  const uniqueTaluks = useMemo(() => {
    return [...new Set(zoneData.map(zone => zone.talukName).filter(name => name !== 'N/A'))].sort();
  }, [zoneData]);

  // Sorting logic (client-side sorting since API doesn't support sort params)
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
      return b[orderBy].localeCompare(a[orderBy]);
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // Filter and sort data (client-side filtering since API doesn't support search)
const filteredAndSortedData = zoneData;

  // Get filtered count for display
  const filteredCount = filteredAndSortedData.length;

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  // Custom pagination component for better UX
  const CustomPagination = () => {
    const handleFirstPage = () => setPage(0);
    const handleLastPage = () => setPage(totalPages - 1);
    const handlePrevPage = () => setPage(prev => Math.max(0, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages - 1, prev + 1));

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
        <IconButton 
          onClick={handleFirstPage} 
          disabled={page === 0}
          size="small"
          sx={{ bgcolor: 'grey.100' }}
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton 
          onClick={handlePrevPage} 
          disabled={page === 0}
          size="small"
          sx={{ bgcolor: 'grey.100' }}
        >
          <ChevronLeftIcon />
        </IconButton>
        
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(e, p) => setPage(p - 1)}
          color="primary"
          size="medium"
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                '&.Mui-selected': {
                  bgcolor: '#05307a',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#032050',
                  }
                }
              }}
            />
          )}
        />
        
        <IconButton 
          onClick={handleNextPage} 
          disabled={page === totalPages - 1}
          size="small"
          sx={{ bgcolor: 'grey.100' }}
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton 
          onClick={handleLastPage} 
          disabled={page === totalPages - 1}
          size="small"
          sx={{ bgcolor: 'grey.100' }}
        >
          <LastPageIcon />
        </IconButton>
      </Box>
    );
  };

  // Filter search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setOrder('asc');
    setOrderBy('zoneId');
  };

  // View zone handlers
 // Replace the handleViewZone function
const handleViewZone = (zone) => {
  navigate(
    `/schemes/earas/earas_management/ZoneListing/ZoneManage/${zone.zoneId}`,
    { state: { zoneData: zone } }
  );
};

  // Calculate stats
  const totalZones = totalItems;
  const btrZones = zoneData.filter(zone => zone.zoneType === 'BTR').length;
  const nonBtrZones = zoneData.filter(zone => zone.zoneType === 'Non-BTR').length;

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Zone Lists
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px" my={4}>
            <CircularProgress size={60} thickness={5} />
            <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading zones...</Typography>
          </Box>
        )}

        {!loading && fetchError && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h5" gutterBottom color="error">
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {fetchError}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => fetchZones(page, rowsPerPage, debouncedSearch)}
            >
              Retry
            </Button>
          </Box>
        )}

        {!loading && !fetchError && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {/* Header with Search and Filters */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField 
                inputRef={searchRef}
                onKeyDown={handleKeyDown}
                  label="Search zones"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Type to filter..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: '350px' }}
                />
                
                <Stack direction="row" spacing={1}>
                <Button
  startIcon={<SearchIcon />}
  onClick={handleSearchClick}
  variant="contained"
  size="small"
>
  Search
</Button>
                  <Button
                    startIcon={<RefreshIcon />}
                   onClick={() => fetchZones(page, rowsPerPage, debouncedSearch)}
                    variant="outlined"
                    size="small"
                  >
                    Refresh
                  </Button>
                  <Button
                    startIcon={<FilterIcon />}
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    disabled={!searchTerm}
                  >
                    Clear
                  </Button>
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Table */}
            <TableContainer component={Paper} sx={{ maxHeight: '500px', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {['slNo', 'zoneNameEn', 'districtName', 'talukName', 'zoneType'].map((col) => (
                      <TableCell
                        key={col}
                        align="center"
                        sx={{
                          bgcolor: '#05307a',
                          color: 'white',
                          fontWeight: 'bold',
                          '&:hover': { backgroundColor: '#032050' }
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === col}
                          direction={orderBy === col ? order : 'asc'}
                          onClick={createSortHandler(col)}
                          sx={{
                            color: 'white',
                            '&.Mui-active': { color: '#a7ffeb' },
                            '& .MuiTableSortLabel-icon': { color: 'white !important' }
                          }}
                        >
                          {col === 'slNo' ? 'Sl No' : 
                           col === 'zoneNameEn' ? 'Zone Name' :
                           col === 'districtName' ? 'District' :
                           col === 'talukName' ? 'Taluk' : 'Zone Type'}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: '#05307a',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        {searchTerm ? 'No zones match your search in current page.' : 'No zones available.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedData.map((row) => (
                      <TableRow
                        key={row.zoneId}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                          '&:hover': { backgroundColor: '#e0f2f7' }
                        }}
                      >
                        <TableCell align="center">{row.slNo}</TableCell>
                        <TableCell align="center">{row.zoneNameEn}</TableCell>
                        <TableCell align="center">{row.districtName}</TableCell>
                        <TableCell align="center">{row.talukName}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.zoneType}
                            color={row.zoneType === 'BTR' ? 'success' : 'default'}
                            size="small"
                            variant={row.zoneType === 'BTR' ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewZone(row)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Custom Pagination */}
            <Box sx={{ mt: 3 }}>
              <CustomPagination />
              
              {/* Rows per page selector */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Rows per page:
                </Typography>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: 'white'
                  }}
                >
                  {[25, 50, 100].map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Showing {filteredAndSortedData.length} of {totalItems} total records
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Grid>
  );
};

export default ZoneListing;
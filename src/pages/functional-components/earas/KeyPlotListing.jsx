import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Breadcrumb from 'routes/Breadcrumb';
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  Chip,
  DialogContentText,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  RemoveRedEye as ViewIcon,
  RemoveCircle as RemoveIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';

const KeyPlotListing = () => {
  // State management
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataVisible, setDataVisible] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('slNo');
  
  // Filter states  
  const [landTypeFilter, setLandTypeFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  
  // Dialog states
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedPresetReason, setSelectedPresetReason] = useState('');
  const [selectedRowToRemove, setSelectedRowToRemove] = useState(null);
  const [reasonError, setReasonError] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  
  // Plot details modal states
  const [openPlotDetailsModal, setOpenPlotDetailsModal] = useState(false);
  const [plotDetailsLoading, setPlotDetailsLoading] = useState(false);
  const [plotDetailsData, setPlotDetailsData] = useState(null);
  const [plotDetailsError, setPlotDetailsError] = useState(null);
  
  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [panchayathAreaSummary, setPanchayathAreaSummary] = useState([]);

  // Preset reasons for removal dialog
  const presetReasons = [
    'Duplicate Entry',
    'Incorrect Data', 
    'Not Applicable',
    'Already Processed',
    'Other'
  ];

  // Transform API data to match table format
  const transformPlotData = (apiData) => {
    return apiData.map((plot, index) => ({
      id: plot.keyplotId,
      plot_id: plot.keyplotId,
      slNo: index + 1,
      syNo: plot.syNo,
      panchayth: plot.panchayath,
      area: plot.areaCents,
      villageBlock: plot.villageBlock,
      landType: plot.landType,
      kvillageName: plot.kvillageName,
      action: "View Cluster"
    }));
  };

  // Fetch keyplot data from API
  const fetchKeyPlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFetchError(null);
    
    try {
      const BASE_URL = mainapi.BASE_URL;
      const token = localStorage.getItem('token')
      const zoneid = authservice.getzone();
      const response = await fetch(`${BASE_URL}/btr-service/key-plots/get-all/${zoneid}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
      }
      
      const data = await response.json();
      const plots = data.payload || [];
      const transformedPlots = transformPlotData(plots);
      
      setPlotData(transformedPlots);
      setDataVisible(plots.length > 0);
      
      // Calculate panchayath summary
      const panchayathSummary = plots.reduce((acc, plot) => {
        const existing = acc.find(item => item.panchayath === plot.panchayath);
        if (existing) {
          existing.totalarea += plot.areaCents || 0;
          existing.count += 1;
        } else {
          acc.push({
            panchayath: plot.panchayath,
            totalarea: plot.areaCents || 0,
            count: 1
          });
        }
        return acc;
      }, []).sort((a, b) => b.totalarea - a.totalarea);
      
      setPanchayathAreaSummary(panchayathSummary);
      
      setSnackbarMessage(`Successfully loaded ${plots.length} keyplots`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (err) {
      setError(err.message);
      setFetchError(`Failed to fetch keyplot data. ${err.message}`);
      setDataVisible(false);
      setSnackbarMessage(`Error loading data: ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch individual plot details
  const fetchPlotDetails = async (plotId) => {
    setPlotDetailsLoading(true);
    setPlotDetailsError(null);
    
    try {
      const BASE_URL = mainapi.BASE_URL;
      const token = localStorage.getItem('token')
      const response = await fetch(`${BASE_URL}/btr-service/key-plots/get-keyplot/${plotId}`,{
         headers: {
          Authorization: `Bearer ${token}` // Add token in Authorization header
        }
      }
        
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plot details (${response.status})`);
      }
      
      const data = await response.json();
      setPlotDetailsData(data.payload);
      
    } catch (err) {
      console.error('Error fetching plot details:', err);
      setPlotDetailsError(`Failed to fetch plot details: ${err.message}`);
      setSnackbarMessage(`Error fetching plot details: ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setPlotDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyPlots();
  }, [fetchKeyPlots]);

  // Get unique values for filters
  const uniqueVillages = useMemo(() => {
    return [...new Set(plotData.map(plot => plot.kvillageName))].sort();
  }, [plotData]);

  const uniqueLandTypes = useMemo(() => {
    return [...new Set(plotData.map(plot => plot.landType))].sort();
  }, [plotData]);

  // Sorting logic
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
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

  // Filter and sort data
  const filteredSortedAndPaginatedData = useMemo(() => {
    const visibleKeys = ['slNo', 'syNo', 'panchayth', 'area', 'villageBlock', 'landType'];

    let filtered = plotData.filter((row) => {
      const matchesSearch = !searchTerm || 
        visibleKeys.some((key) =>
          row[key] && String(row[key]).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesLandType = !landTypeFilter || row.landType === landTypeFilter;
      const matchesVillage = !villageFilter || row.kvillageName === villageFilter;
      
      return matchesSearch && matchesLandType && matchesVillage;
    });

    const sorted = [...filtered].sort(getComparator(order, orderBy));
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [plotData, searchTerm, landTypeFilter, villageFilter, order, orderBy, page, rowsPerPage]);

  // Get filtered count for pagination
  const filteredCount = useMemo(() => {
    const visibleKeys = ['slNo', 'syNo', 'panchayth', 'area', 'villageBlock', 'landType'];
    
    return plotData.filter((row) => {
      const matchesSearch = !searchTerm || 
        visibleKeys.some((key) =>
          row[key] && String(row[key]).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesLandType = !landTypeFilter || row.landType === landTypeFilter;
      const matchesVillage = !villageFilter || row.kvillageName === villageFilter;
      
      return matchesSearch && matchesLandType && matchesVillage;
    }).length;
  }, [plotData, searchTerm, landTypeFilter, villageFilter]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLandTypeFilter('');
    setVillageFilter('');
    setOrder('asc');
    setOrderBy('slNo');
    setPage(0);
  };

  // Handle view plot - Updated to fetch details and open modal
  const handleViewPlot = async (keyplotId) => {
    console.log('Viewing plot:', keyplotId);
    setOpenPlotDetailsModal(true);
    await fetchPlotDetails(keyplotId);
  };

  // Close plot details modal
  const handleClosePlotDetailsModal = () => {
    setOpenPlotDetailsModal(false);
    setPlotDetailsData(null);
    setPlotDetailsError(null);
  };

  // Remove dialog handlers
  const handleOpenRemoveDialog = (row) => {
    setSelectedRowToRemove(row);
    setReason('');
    setSelectedPresetReason('');
    setReasonError(false);
    setOpenRemoveDialog(true);
  };

  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setSelectedRowToRemove(null);
    setReason('');
    setSelectedPresetReason('');
    setReasonError(false);
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    if (event.target.value.trim() !== '') {
      setReasonError(false);
    }
  };

  const handlePresetReasonChange = (event) => {
    const value = event.target.value;
    setSelectedPresetReason(value);
    setReasonError(false);
    if (value !== 'Other') {
      setReason('');
    }
  };

  const handleConfirmRemoval = async () => {
    let finalReason = selectedPresetReason;

    if (selectedPresetReason === 'Other') {
      finalReason = reason.trim();
    }

    if (finalReason === '') {
      setReasonError(true);
      return;
    }

    if (!selectedRowToRemove || !selectedRowToRemove.id) {
      console.error('No row selected for removal or row has no ID.');
      handleCloseRemoveDialog();
      return;
    }

    setDialogLoading(true);
    
    try {
      // Simulate API call for removal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlotData(prevData => prevData.filter(item => item.id !== selectedRowToRemove.id));
      
      setSnackbarMessage(`Removed Sy.No: ${selectedRowToRemove?.syNo} successfully with reason: "${finalReason}"`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error("Error during keyplot removal:", error);
      setSnackbarMessage("Failed to remove keyplot. Please try again.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDialogLoading(false);
      handleCloseRemoveDialog();
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Sl No', 'Sy No', 'Village', 'Area (Cents)', 'Village Block', 'Land Type'];
    const csvData = [
      headers.join(','),
      ...plotData.map((plot, index) => [
        index + 1,
        `"${plot.syNo}"`,
        `"${plot.kvillageName}"`,
        plot.area?.toFixed(2) || '0.00',
        `"${plot.villageBlock}"`,
        `"${plot.landType}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `keyplots_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbarMessage(`Exported ${plotData.length} records to CSV`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Generate keyplot handler (placeholder)
  const handleGenerateKeyplot = async () => {
    setLoading(true);
    setDataVisible(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      fetchKeyPlots();
    } catch (error) {
      console.error("Failed to generate keyplot data", error);
      setSnackbarMessage("Failed to generate keyplot data");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const totalArea = plotData.reduce((sum, row) => sum + parseFloat(row.area || 0), 0).toFixed(2);

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          KeyPlot Details
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px" my={4}>
            <CircularProgress size={60} thickness={5} />
            <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading data...</Typography>
          </Box>
        )}

        {!loading && fetchError && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h5" gutterBottom>
              Oops! Something went wrong.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {fetchError}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setFetchError(null);
                fetchKeyPlots();
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {!loading && !dataVisible && !fetchError && (
          <Box display="flex" justifyContent="center" mb={4}>
            {/* <Button
              variant="contained"
              onClick={handleGenerateKeyplot}
              disabled={loading}
              sx={{
                fontSize: '.9rem',
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#115293' }
              }}
            >
              Generate Keyplot Data
            </Button> */}
            <Typography variant="h6" color="text.secondary">
              No Keyplot Data Available
            </Typography>
          </Box>
        )}

        {!loading && dataVisible && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {/* Panchayath Summary and Search */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {panchayathAreaSummary.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexGrow: 1, maxWidth: 'calc(100% - 320px)' }}>
                  {panchayathAreaSummary.map((item, index) => (
                    <Chip
                      key={index}
                      label={`${item.panchayath}: ${item.totalarea.toFixed(2)} Cents`}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                <Chip label="AY 2024 - 2025" variant="outlined" color="info" />
                <TextField
                  label="Search Data"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ width: '100%', maxWidth: '250px' }}
                />
              </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Land Type</InputLabel>
                    <Select
                      value={landTypeFilter}
                      onChange={(e) => setLandTypeFilter(e.target.value)}
                      label="Land Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      {uniqueLandTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Village</InputLabel>
                    <Select
                      value={villageFilter}
                      onChange={(e) => setVillageFilter(e.target.value)}
                      label="Village"
                    >
                      <MenuItem value="">All</MenuItem>
                      {uniqueVillages.map(village => (
                        <MenuItem key={village} value={village}>{village}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Button
                      startIcon={<RefreshIcon />}
                      onClick={fetchKeyPlots}
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
                    >
                      Clear Filters
                    </Button>
                    <Button
                      startIcon={<ExportIcon />}
                      onClick={exportToCSV}
                      variant="contained"
                      size="small"
                      disabled={plotData.length === 0}
                    >
                      Export CSV
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Table */}
            <TableContainer component={Paper} sx={{ maxHeight: '50%', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    {['slNo', 'syNo', 'panchayth', 'area', 'villageBlock', 'landType'].map((col) => (
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
                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                            '& .MuiTableSortLabel-icon.Mui-active': { color: '#a7ffeb !important' }
                          }}
                        >
                          {col === 'area' ? 'Area (Cents)' : col.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: '#05307a',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#032050' }
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSortedAndPaginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No data found for the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSortedAndPaginatedData.map((row, index) => (
                      <TableRow
                        key={`${row.syNo}-${index}`}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                          '&:hover': { backgroundColor: '#e0f2f7' }
                        }}
                      >
                        <TableCell align="center">{row.slNo}</TableCell>
                        <TableCell align="center">{row.syNo}</TableCell>
                        <TableCell align="center">{row.kvillageName}</TableCell>
                        <TableCell align="center">{parseFloat(row.area).toFixed(2)}</TableCell>
                        <TableCell align="center">{row.villageBlock}</TableCell>
                        <TableCell align="center">{row.landType}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleViewPlot(row.id)}
                            sx={{ minWidth: 'unset', px: 0.5 }}
                          >
                            <ViewIcon fontSize="small" />
                          </Button>
                          <Button
                            sx={{ color: 'error.main', minWidth: 'unset', px: 0.5 }}
                            size="small"
                            onClick={() => handleOpenRemoveDialog(row)}
                          >
                            <RemoveIcon fontSize="small" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Updated Total Area Box */}
            {plotData.length > 0 && (
              <Box sx={{ 
                mt: 2, 
                px: 2, 
                py: 1,
                display: 'flex', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
              }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Area: <span style={{ color: '#05307a' }}>{totalArea} Cents</span>
                </Typography>
              </Box>
            )}

            <TablePagination
              component="div"
              count={filteredCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[25, 50, 100, { label: 'All', value: -1 }]}
              sx={{ '.MuiTablePagination-toolbar': { justifyContent: 'center' } }}
            />
          </Paper>
        )}

        {/* Plot Details Modal */}
        {/* Plot Details Modal */}
        {/* Plot Details Modal */}
<Dialog 
  open={openPlotDetailsModal} 
  onClose={handleClosePlotDetailsModal}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }
  }}
>
  <DialogTitle sx={{ 
    backgroundColor: '#05307a', 
    color: 'white', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    py: 1.5
  }}>
    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
      KeyPlot Details
    </Typography>
    <IconButton 
      onClick={handleClosePlotDetailsModal} 
      sx={{ color: 'white' }}
      size="small"
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  
  <DialogContent sx={{ p: 2 }}>
    {plotDetailsLoading && (
      <Box display="flex" justifyContent="center" alignItems="center" py={3}>
        <CircularProgress size={30} thickness={4} />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading plot details...</Typography>
      </Box>
    )}

    {plotDetailsError && (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Plot Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {plotDetailsError}
        </Typography>
      </Box>
    )}

    {plotDetailsData && !plotDetailsLoading && (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 1.5 }}>
            Basic Information
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Survey No:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>{plotDetailsData.syNo}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Panchayath:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>{plotDetailsData.panchayath}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Village:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>{plotDetailsData.kvillageName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Village Block:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>{plotDetailsData.villageBlock}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Area:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: '#05307a' }}>
                {parseFloat(plotDetailsData.areaCents).toFixed(2)} Cents
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Land Type:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {plotDetailsData.landType}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )}
  </DialogContent>
  
  <DialogActions sx={{ p: 1.5, backgroundColor: '#f8f9fa' }}>
    <Button 
      onClick={handleClosePlotDetailsModal}
      variant="contained"
      sx={{ 
        backgroundColor: '#05307a',
        '&:hover': { backgroundColor: '#032050' }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>



        {/* Updated Snackbar for notifications */}
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

        {/* Removal Confirmation Dialog */}
        <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Removal</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to remove Survey Number:{' '}
              <Typography component="span" fontWeight="bold" color="primary.main">
                {selectedRowToRemove?.syNo}
              </Typography>
              . Please provide a reason.
            </Typography>

            <FormControl component="fieldset" error={reasonError} sx={{ mt: 2, mb: 2, width: '100%' }}>
              <FormLabel component="legend">Reason for Removal</FormLabel>
              <RadioGroup
                aria-label="reason-for-removal"
                name="reason-for-removal-group"
                value={selectedPresetReason}
                onChange={handlePresetReasonChange}
              >
                {presetReasons.map((reasonOption) => (
                  <FormControlLabel key={reasonOption} value={reasonOption} control={<Radio />} label={reasonOption} />
                ))}
              </RadioGroup>
              {reasonError && !selectedPresetReason && (
                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                  Please select a reason or enter a custom one.
                </Typography>
              )}
            </FormControl>

            {selectedPresetReason === 'Other' && (
              <TextField
                autoFocus
                margin="dense"
                label="Enter Custom Reason"
                type="text"
                fullWidth
                variant="outlined"
                value={reason}
                onChange={handleReasonChange}
                error={reasonError && reason.trim() === ''}
                helperText={reasonError && reason.trim() === '' ? 'Custom reason is required.' : ''}
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRemoveDialog} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemoval}
              color="error"
              variant="contained"
              disabled={dialogLoading || !selectedPresetReason || (selectedPresetReason === 'Other' && reason.trim() === '')}
              startIcon={dialogLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {dialogLoading ? 'Processing...' : 'Remove Permanently'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Grid>
  );
};

export default KeyPlotListing;

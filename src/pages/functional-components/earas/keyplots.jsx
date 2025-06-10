import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Button,
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
  Chip // Import Chip component
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SearchIcon from '@mui/icons-material/Search';
// import auth from 'contexts/auth-reducer/auth';
import authservice from 'pages/authentication/services/authservice';
// import auth from 'contexts/auth-reducer/auth';
// import authservice from 'pages/authentication/services/authservice';

const KeyPlot = () => {
    const [loading, setLoading] = useState(true); // Set to true initially to fetch existing data
    const [dataVisible, setDataVisible] = useState(false);
    const [plotData, setPlotData] = useState([]);
    const [panchayathAreaSummary, setPanchayathAreaSummary] = useState([]);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('slNo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchTerm, setSearchTerm] = useState('');

    // Dialog related states
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [reason, setReason] = useState('');
    const [selectedPresetReason, setSelectedPresetReason] = useState('');
    const [selectedRowToRemove, setSelectedRowToRemove] = useState(null);
    const [reasonError, setReasonError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

    // Define your preset reasons here
    const presetReasons = [
        'Duplicate Entry',
        'Incorrect Data',
        'Not Applicable',
        'Already Processed',
        'Other'
    ];

    const chipColors = [
        '#8B33FF', '#FF5733', '#FF8B33', '#3357FF', '#33FF57',
        '#FF33F5', '#33FFF5', '#F5FF33', '#33FF8B', '#8BFF33',
    ];

    // --- Utility Function to transform sample data ---
    const transformSample = (sample, type) => ({
        id: sample.id,
        plot_id: sample["plot_id"],
        slNo: sample["Sl.No"],
        syNo: sample["Sy. No"],
        panchayth: sample["panchayth"],
        area: sample["Area (Cents)"],
        villageBlock: sample["Village/Block"],
        reserveList: type === "wet" ? "Wet" : "Dry",
        action: "View Cluster"
    });

    // --- Data Fetching: Fetch Existing Keyplots on Mount ---
    useEffect(() => {
        const fetchInitialKeyplots = async () => {
            setLoading(true);
        
            try {
             
                // Replace with your actual userId
                const userId = authservice.userid();
         
                const res = await axios.get(`http://localhost:8082/btr-service/key-plots/fetch-existing-keyplots/${userId}`);

                const zones = res.data.payload || [];

                if (zones.length > 0) {
                    const allWetSamples = zones.flatMap(zone => zone.wetSamples || []);
                    const allDrySamples = zones.flatMap(zone => zone.drySamples || []);

                    const panchayathAreas = zones.map(zone => ({
                        panchayath: zone.panchayath,
                        totalarea: zone.totalarea
                    }));
                    setPanchayathAreaSummary(panchayathAreas);

                    const wetTransformed = allWetSamples.map(sample => transformSample(sample, "wet"));
                    const dryTransformed = allDrySamples.map(sample => transformSample(sample, "dry"));

                    setPlotData([...wetTransformed, ...dryTransformed]);
                    setDataVisible(true);
                } else {
                    setDataVisible(false); // No existing data, show generate button
                }

            } catch (error) {
                console.error("Failed to fetch existing keyplot data", error);
                setDataVisible(false); // If error, assume no data or issue, show generate
            } finally {
                setLoading(false);
            }
        };

        fetchInitialKeyplots();
    }, []); // Empty dependency array means this runs once on mount

    // --- Data Fetching: Generate New Keyplots ---
    const handleGenerateKeyplot = async () => {
        setLoading(true);
        setDataVisible(false); // Hide data while generating

        try {
            // Replace with your actual userId
            const userId = authservice.userid();
            const res = await axios.get(`http://localhost:8082/btr-service/key-plots/generate-keyplots/${userId}`);

            const zones = res.data.payload || [];

            const allWetSamples = zones.flatMap(zone => zone.wetSamples || []);
            const allDrySamples = zones.flatMap(zone => zone.drySamples || []);

            const panchayathAreas = zones.map(zone => ({
                panchayath: zone.panchayath,
                totalarea: zone.totalarea
            }));
            setPanchayathAreaSummary(panchayathAreas);

    
            const wetTransformed = allWetSamples.map(sample => transformSample(sample, "wet"));
            const dryTransformed = allDrySamples.map(sample => transformSample(sample, "dry"));

            setPlotData([...wetTransformed, ...dryTransformed]);
            setDataVisible(true);

           
        } catch (error) {
            console.error("Failed to generate keyplot data", error);
            // Optionally handle error, e.g., show an alert
        } finally {
            setLoading(false);
        }
    };

    // --- Sorting Logic ---
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

  // --- Memoized Data for Table (Filtering, Sorting, and Pagination) ---
  const filteredSortedAndPaginatedData = useMemo(() => {
    const filtered = plotData.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sorted = [...filtered].sort(getComparator(order, orderBy));

    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [plotData, searchTerm, order, orderBy, page, rowsPerPage]);

  // --- Pagination Handlers ---
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- Filter Search Handler ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

    // --- Navigation and Dialog Logic ---
    const handleViewClusterClick = (syNo, slno) => {
        const encodedSyNo = encodeURIComponent(syNo);
        const encodedSlno = encodeURIComponent(slno);
        navigate(`/schemes/earas/cluster?No=${encodedSyNo}&slno=${encodedSlno}`);
    };

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

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:8082/btr-service/key-plots/reject-and-replace/${selectedRowToRemove.id}`, {
                reason: finalReason
            });

            const newPlotPayload = response.data;

            const transformedNewPlot = {
                id: newPlotPayload.id,
                plot_id: newPlotPayload["plot_id"],
                slNo: newPlotPayload["Sl.No"],
                syNo: newPlotPayload["Sy. No"],
                panchayth: newPlotPayload["panchayth"],
                area: newPlotPayload["Area (Cents)"],
                villageBlock: newPlotPayload["Village/Block"],
                reserveList: newPlotPayload["Land Type"],
                action: "View Cluster"
            };

            setPlotData(prevData => {
                const filtered = prevData.filter(item => item.id !== selectedRowToRemove.id);
                return [...filtered, transformedNewPlot];
            });

            console.log(`Removed Sy. No: ${selectedRowToRemove?.syNo} with reason: "${finalReason}". Replaced with new plot.`, transformedNewPlot);

        } catch (error) {
            console.error("Error during keyplot removal and replacement:", error);
        } finally {
            setLoading(false);
            handleCloseRemoveDialog();
        }
    };

    const totalArea = plotData.reduce((sum, row) => sum + parseFloat(row.area || 0), 0).toFixed(2);

    return (
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

            {!loading && !dataVisible && (
                <Box display="flex" justifyContent="center" mb={4}>
                    <Button
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
                    </Button>
                </Box>
            )}

      {!loading && dataVisible && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           */}
           <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {panchayathAreaSummary.length > 0 && (
              // <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexGrow: 1, maxWidth: 'calc(100% - 320px)' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexGrow: 1, maxWidth: 'calc(100% - 320px)' }}>
                {/* {panchayathAreaSummary.map((item, index) => {
                  const colorIndex = index % chipColors.length;
                  const dynamicColor = chipColors[colorIndex];
                  return (
                    <Chip
                      key={index}
                      label={`${item.panchayath}: ${item.totalarea} Cents`}
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        backgroundColor: dynamicColor,
                        color: 'white',
                        border: `1px solid ${dynamicColor}`,
                        padding: '5px 6px',
                        height: 'auto',
                        borderRadius: '10px'
                      }}
                    />
                  );
                })} */}
              </Box>
            )}

            {/* <Box sx={{ display: 'flex', gap: 2, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}> */}
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

          <TableContainer component={Paper} sx={{ maxHeight: '50%', overflow: 'scroll', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  {['slNo', 'syNo', 'panchayth', 'area', 'villageBlock', 'reserveList'].map((col) => (
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
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{row.syNo}</TableCell>
                      <TableCell align="center">{row.panchayth}</TableCell>
                      <TableCell align="center">{parseFloat(row.area).toFixed(2)}</TableCell>
                      <TableCell align="center">{row.villageBlock}</TableCell>
                      <TableCell align="center">{row.reserveList}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleViewClusterClick(row.plot_id, index + 1)}
                          sx={{ minWidth: 'unset', px: 0.5 }}
                        >
                          <RemoveRedEyeIcon fontSize="small" />
                        </Button>
                        <Button
                          sx={{ color: 'error.main', minWidth: 'unset', px: 0.5 }}
                          size="small"
                          onClick={() => handleOpenRemoveDialog(row)}
                        >
                          <RemoveCircleIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

                    {plotData.length > 0 && (
                        <Box sx={{ mt: 2, pr: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Total Area: <span style={{ color: '#05307a' }}>{totalArea} Cents</span>
                            </Typography>
                        </Box>
                    )}

                    <TablePagination
                        component="div"
                        count={plotData.filter(row =>
                            Object.values(row).some(value =>
                                String(value).toLowerCase().includes(searchTerm.toLowerCase())
                            )
                        ).length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                        sx={{ '.MuiTablePagination-toolbar': { justifyContent: 'center' } }}
                    />
                </Paper>
            )}

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
                        disabled={!selectedPresetReason || (selectedPresetReason === 'Other' && reason.trim() === '')}
                    >
                        Remove Permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default KeyPlot;

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
  Close as CloseIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  LocationOn as LocationOnIcon,
  InfoOutlined as InfoOutlineIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import { pl } from 'date-fns/locale';
// import { usePermission } from 'contexts/auth-reducer/usePermission';

const KeyPlotListing = ({zoneId}) => {
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
  const [openEditEnumDialog, setOpenEditEnumDialog] = useState(false);
const [enumAreaValue, setEnumAreaValue] = useState('');
const [id, setId] = useState('');
const [AreaValue, setAreaValue] = useState('');
const [enumRemark, setEnumRemark] = useState('');
const [enumError, setEnumError] = useState('');
const [enumLoading, setEnumLoading] = useState(false);
const [clusterChanges, setClusterChanges] = useState({});
  // Filter states  
  const [landTypeFilter, setLandTypeFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [clusterErrors, setClusterErrors] = useState({});
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
  const [zonestatus,setZonestatus] = useState(false)
  const [removalValidationError, setRemovalValidationError] = useState('');
const [clusterStatus, setClusterStatus] = useState(null);
  // const { hasPermission } = usePermission();
// const { roles, hasRole } = usePermission();

//       const [resolvedZoneId, setResolvedZoneId] = useState(() => {
//   const role = authservice.getrole(); // Get the role
//   return  hasRole(1)
//     ? authservice.getzone()  // For Field Data Collector
//     : zoneId;                         // For Admin or other roles
// });

      const [resolvedZoneId, setResolvedZoneId] = useState(() => {
  const role = authservice.getrole(); // Get the role
  return role === 'Field Data Collector'
    ? authservice.getzone()  // For Field Data Collector
    : zoneId;                         // For Admin or other roles
});

const handleOpenEnumEdit = () => {
  const enumArea = plotDetailsData.enumArea || '';
  const areaCents = plotDetailsData.areaCents || '';
  
  setEnumAreaValue(enumArea);
  setAreaValue(areaCents);
  setId(plotDetailsData.keyplotId);
  setEnumRemark('');
  
  // Validate on open if there's an existing value
  if (enumArea) {
    const error = validateEnumArea(enumArea, areaCents);
    setEnumError(error);
  } else {
    setEnumError('');
  }
  
  setOpenEditEnumDialog(true);
};

const handleEnumAreaChange = (e) => {
  const value = e.target.value;
  const totalArea = parseFloat(plotDetailsData.areaCents || plotDetailsData.area);
  
  // Validate the input
  const error = validateEnumArea(value, totalArea);
  setEnumError(error);
  setEnumAreaValue(value);
};

const validateEnumArea = (value, totalArea) => {
  if (!value || value === '') {
    return "Enumerated area is required";
  }
  
  const numValue = parseFloat(value);
  const numTotalArea = parseFloat(totalArea);
  
  if (isNaN(numValue)) {
    return "Please enter a valid number";
  }
  
  if (numValue <= 0) {
    return "Enumerated area must be greater than zero";
  }
  
  if (numValue > numTotalArea) {
    return `Enumerated area cannot exceed total area (${numTotalArea.toFixed(2)} cents)`;
  }
  
  return '';
};
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
      id: plot.clusterId,
      plot_id: plot.keyplotId,
      slNo: index + 1,
      syNo: plot.syNo && !['null', 'null/', 'undefined', ''].includes(plot.syNo.trim().toLowerCase())
  ? plot.syNo
  : 'NA',
      panchayth: plot.panchayath,
      cluster_number: plot.cluster_no,
      area: plot.areaCents,
      btyType: plot.btr_type,
      villageBlock: plot.villageBlock,
      landType: plot.landType,
      kvillageName: plot.kvillageName,
      ownerName: plot.ownerName,
      address: plot.address,
      wardNo: plot.wardNo,
      houseNo: plot.houseNo,
      tpNo: plot.tpno,
      tpSubNo: plot.tpSubNo,
      oldsuvNo: plot.oldsuvNo,
      oldsubNo: plot.oldsubNo,
      enumarea: plot.enumArea,
      action: "View Cluster"
    }));
  };
const handleUpdateEnumeratedArea = async () => {
  const totalArea = parseFloat(AreaValue);
  const error = validateEnumArea(enumAreaValue, totalArea);
  
  if (error) {
    setEnumError(error);
    return;
  }
  
  if (!enumAreaValue) {
    setEnumError("Enumerated area is required");
    return;
  }

  setEnumLoading(true);

  try {
    const BASE_URL = mainapi.BASE_URL;
    const token = localStorage.getItem("token");
    
    const response = await fetch(
      `${BASE_URL}/btr-service/key-plots/update-enumerated-area`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kpId: id,
          enumeratedArea: parseFloat(enumAreaValue),
          remark: enumRemark,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update enumerated area");
    }

    setSnackbarMessage("Enumerated area updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    setOpenEditEnumDialog(false);

    // Refresh both list & modal
    fetchKeyPlots();
    fetchPlotDetails(id);

  } catch (err) {
    setSnackbarMessage(err.message || "Failed to update enumerated area");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setEnumLoading(false);
  }
};
  // Fetch keyplot data from API
  const fetchKeyPlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFetchError(null);


    try {
      const BASE_URL = mainapi.BASE_URL;
      const token = localStorage.getItem('token')
        if (!resolvedZoneId || resolvedZoneId === "null") {
    setError("No zones are assigned to you. Please contact your administrator.");
    setZonestatus(true)
    setDataVisible(false);
    setLoading(false);
    return;
  }
      
      const response = await fetch(`${BASE_URL}/btr-service/key-plots/get-all/${resolvedZoneId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
     
      if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
      }
      const data = await response.json();
      console.log("API Response:", data);
      const plots = data.payload || [];
      
      const transformedPlots = transformPlotData(plots);
      
      setPlotData(transformedPlots);
      setDataVisible(plots.length > 0);
      
      // Calculate panchayath summary
     // Calculate panchayath summary WITH WET/DRY counts
const panchayathSummary = plots.reduce((acc, plot) => {
  const existing = acc.find(item => item.panchayath === plot.panchayath);
  const isWet = plot.landType?.toUpperCase() === "WET";
  const isDry = plot.landType?.toUpperCase() === "DRY";

  if (existing) {
    existing.totalarea += plot.areaCents || 0;
    existing.count += 1;

    if (isWet) existing.wetCount += 1;
    if (isDry) existing.dryCount += 1;

  } else {
    acc.push({
      panchayath: plot.panchayath,
      totalarea: plot.areaCents || 0,
      count: 1,
      wetCount: isWet ? 1 : 0,
      dryCount: isDry ? 1 : 0
    });
  }
  return acc;
}, []).sort((a, b) => b.totalarea - a.totalarea);

setPanchayathAreaSummary(panchayathSummary);

      
      // setSnackbarMessage(`Successfully loaded ${plots.length} keyplots`);
      // setSnackbarSeverity('success');
      // setSnackbarOpen(true);
      
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

  const hasDuplicateWithExisting = () => {
  const currentValues = plotData.map(row => row.cluster_number);

  const updatedValues = plotData.map(row => {
    return clusterChanges[row.id] ?? row.cluster_number;
  });

  const unique = new Set(updatedValues);

  return updatedValues.length !== unique.size;
};
const getFinalClusterValues = () => {
  return plotData.map(row => {
    return clusterChanges[row.id] ?? row.cluster_number;
  });
};
const hasDuplicateClusters = () => {
  const values = plotData
    .map(row => Number(clusterChanges[row.id] ?? row.cluster_number))
    .filter(v => !isNaN(v));

  return new Set(values).size !== values.length;
};
const hasAnyErrors = () => {
  return Object.values(clusterErrors).some(err => err && err !== "");
};
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
    const visibleKeys = ['slNo', 'cluster', 'panchayth', 'village','area', 'syNo','villageBlock', 'landType'];

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
    const visibleKeys = ['slNo', 'cluster', 'panchayth', 'village','area', 'syNo','Ward No','villageBlock', 'landType'];
    
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
    // console.log('Viewing plot:', keyplotId);
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
  setRemovalValidationError(''); // Clear any previous errors
  setOpenRemoveDialog(true);
};
const handleConfirmRemoval = async () => {
  // Reason validation removed - no longer needed
  
  if (!selectedRowToRemove || !selectedRowToRemove.id) {
    console.error('No row selected for removal or row has no ID.');
    handleCloseRemoveDialog();
    return;
  }

  setDialogLoading(true);
  
  try {
    const BASE_URL = mainapi.BASE_URL;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${BASE_URL}/btr-service/key-plots/remove-keyPlots/${selectedRowToRemove.plot_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Optional: You can still send reason if needed, but not required
        // body: JSON.stringify({
        //   reason: "Removed by user"
        // })
      }
    );

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(responseText || "Failed to remove keyplot");
    }
    
    // Success - remove from local state
    setPlotData(prevData => prevData.filter(item => item.id !== selectedRowToRemove.id));
    
    setSnackbarMessage(
      `✅ Successfully removed KeyPlot ${selectedRowToRemove?.syNo}`
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Refresh the data to ensure consistency
    fetchKeyPlots();
    handleCloseRemoveDialog();
    
  } catch (error) {
    console.error("Error during keyplot removal:", error);
    
    // Check if error message contains cluster status information
    let errorMessage = error.message;
    let showInDialog = false;
    
    if (errorMessage.includes("cluster status is")) {
      // Extract the status from error message
      const statusMatch = errorMessage.match(/status is:?\s*([^\.]+)/i);
      const status = statusMatch ? statusMatch[1].trim() : '';
      
      errorMessage = `❌ Cannot remove this KeyPlot because the cluster status is "${status}".\n\nOnly clusters with status "Not Started" can be removed.`;
      showInDialog = true;
    } else if (errorMessage.includes("KeyPlot not found")) {
      errorMessage = "❌ KeyPlot not found. It may have been already removed.";
      showInDialog = true;
    } else {
      errorMessage = `❌ Failed to remove keyplot: ${errorMessage}`;
    }
    
    if (showInDialog) {
      // Show error in the dialog instead of closing it
      setRemovalValidationError(errorMessage);
    } else {
      // Show error in snackbar and close dialog
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      handleCloseRemoveDialog();
    }
  } finally {
    setDialogLoading(false);
  }
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

  // const handleConfirmRemoval = async () => {
  //   let finalReason = selectedPresetReason;

  //   if (selectedPresetReason === 'Other') {
  //     finalReason = reason.trim();
  //   }

  //   if (finalReason === '') {
  //     setReasonError(true);
  //     return;
  //   }

  //   if (!selectedRowToRemove || !selectedRowToRemove.id) {
  //     console.error('No row selected for removal or row has no ID.');
  //     handleCloseRemoveDialog();
  //     return;
  //   }

  //   setDialogLoading(true);
    
  //   try {
  //     // Simulate API call for removal
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     setPlotData(prevData => prevData.filter(item => item.id !== selectedRowToRemove.id));
      
  //     setSnackbarMessage(`Removed Sy.No: ${selectedRowToRemove?.syNo} successfully with reason: "${finalReason}"`);
  //     setSnackbarSeverity('success');
  //     setSnackbarOpen(true);
      
  //   } catch (error) {
  //     console.error("Error during keyplot removal:", error);
  //     setSnackbarMessage("Failed to remove keyplot. Please try again.");
  //     setSnackbarSeverity('error');
  //     setSnackbarOpen(true);
  //   } finally {
  //     setDialogLoading(false);
  //     handleCloseRemoveDialog();
  //   }
  // };

  const handleSaveClusterChanges = async () => {
     if (hasDuplicateClusters() || hasAnyErrors()) {
    setSnackbarMessage("Fix errors before submitting");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    return;
  }
  try {
    const BASE_URL = mainapi.BASE_URL;
    const token = localStorage.getItem("token");

  const updates = Object.keys(clusterChanges)
  .filter(id => clusterChanges[id] && !isNaN(clusterChanges[id]))
  .map(id => ({
    clusterId: parseInt(id),
    newClusterNumber: clusterChanges[id]
  }));

    const response = await fetch(
      `${BASE_URL}/btr-service/cluster-api/cluster/number-update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update clusters");
    }

    setSnackbarMessage("Cluster numbers updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    setClusterChanges({}); // reset

    fetchKeyPlots(); // refresh data

  } catch (err) {
    setSnackbarMessage(err.message);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};
const handleClusterChange = (clusterId, newValue) => {
  // Allow only numbers
  if (!/^\d*$/.test(newValue)) return;

  const num = parseInt(newValue);

  // Allow empty (user deleting)
  if (newValue === "") {
    setClusterChanges(prev => ({
      ...prev,
      [clusterId]: ""
    }));
  } 
  // Restrict max value 100
  else if (num > 100) {
    return; // ❌ stop typing beyond 100
  } 
  else {
    setClusterChanges(prev => ({
      ...prev,
      [clusterId]: newValue
    }));
  }

  // Update UI
  setPlotData(prev =>
    prev.map(row =>
      row.id === clusterId
        ? { ...row, cluster_number: newValue }
        : row
    )
  );

  // Clear error while typing
  setClusterErrors(prev => ({
    ...prev,
    [clusterId]: ""
  }));
};
const handleClusterBlur = (clusterId) => {
  const value = clusterChanges[clusterId];

  if (!value) return;

  const num = parseInt(value);

  // ❌ Check max limit
  if (num > 100) {
    setClusterErrors(prev => ({
      ...prev,
      [clusterId]: "Cluster number cannot exceed 100"
    }));
    return;
  }

  // ✅ Duplicate check
  const updatedValues = plotData.map(row =>
    clusterChanges[row.id] ?? row.cluster_number
  );

  const duplicates = updatedValues.filter(v => v == value);

  if (duplicates.length > 1) {
    setClusterErrors(prev => ({
      ...prev,
      [clusterId]: "Duplicate cluster number"
    }));
  } else {
    setClusterErrors(prev => ({
      ...prev,
      [clusterId]: ""
    }));
  }
};
const hasDuplicateClusterNumbers = () => {
  const values = Object.values(clusterChanges);

  const unique = new Set(values);

  return values.length !== unique.size;
};
  const totalArea = plotData.reduce((sum, row) => sum + parseFloat(row.area || 0), 0).toFixed(2);

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
       <Grid item xs={12}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          KeyPlot Details
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px" my={4}>
            <CircularProgress size={60} thickness={5} />
            <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Loading data...</Typography>
          </Box>
        )}

{zonestatus && (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      bgcolor: "#f5a123ff",
      color: "#faf9f7ff",
      border: "1px solid #FFEEBA",
      borderRadius: 2,
      p: 2,
      mb: 3,
      width: "100%",
      mx: "auto",
    }}
  >
    {/* MOVING REFLECTOR EFFECT */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: "-150px",
        width: "120px",
        height: "100%",
        background:
          "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255,255,255,0) 100%)",
        transform: "skewX(-20deg)",
        animation: "shine 2.5s infinite",
      }}
    />

    <Typography variant="h5" sx={{ position: "relative", zIndex: 2 }}>
       {error} 
    </Typography>

    {/* ANIMATION KEYFRAMES */}
    <style>
      {`
        @keyframes shine {
          0% { left: -150px; }
          60% { left: 100%; }
          100% { left: 100%; }
        }
      `}
    </style>
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
              {panchayathAreaSummary.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.panchayath}: ${item.totalarea.toFixed(2)} Cents | WET: ${item.wetCount} | DRY: ${item.dryCount}`}
               
                    color="success"
                    size="small"
                  />
                ))}


              <Box sx={{ display: 'flex', gap: 2, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                <Chip label="AY 2025 - 2026" variant="outlined" color="info" />
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
          

                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    {/* <Button
                      startIcon={<RefreshIcon />}
                      onClick={fetchKeyPlots}
                      variant="outlined"
                      size="small"
                    >
                      Refresh
                    </Button> */}
                    {/* <Button
                      startIcon={<FilterIcon />}
                      onClick={clearFilters}
                      variant="outlined"
                      size="small"
                    >
                      Clear Filters
                    </Button> */}
                    {/* <Button
                      startIcon={<ExportIcon />}
                      onClick={exportToCSV}
                      variant="contained"
                      size="small"
                      disabled={plotData.length === 0}
                    >
                      Export CSV
                    </Button> */}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Table */}
<Button
  variant="contained"
  color="primary"
  disabled={
    Object.keys(clusterChanges).length === 0 ||
    hasDuplicateClusters() ||
    hasAnyErrors()
  }
  onClick={handleSaveClusterChanges}
  sx={{
    mb: 2,
    backgroundColor: (theme) =>
      Object.keys(clusterChanges).length === 0 ||
      hasDuplicateClusters() ||
      hasAnyErrors()
        ? "#dff3fd"
        : theme.palette.primary.main,
    color: "#fff",
    cursor:
      Object.keys(clusterChanges).length === 0 ||
      hasDuplicateClusters() ||
      hasAnyErrors()
        ? "not-allowed"
        : "pointer",

    // 🔥 override disabled styles
    "&.Mui-disabled": {
      backgroundColor: "#dff3fd",
      color: "#fff",
      opacity: 1, // prevents fading
    },
  }}
>
  Submit Cluster number
</Button>
    <TableContainer component={Paper} sx={{ maxHeight: '50%', border: '1px solid #e0e0e0', borderRadius: 1 }}>
  <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
    <TableHead>
      <TableRow>
        {['slNo', 'panchayth', 'village', 'villageBlock', 'cluster', 'syNo', 'Ward No', 'House No', 'Thandaper Syno', 'Cultivator Name', 'Address', 'Old SyNo', 'area', 'landType'].map((col) => (
          <TableCell
            key={col}
            align="center"
            sx={{
              bgcolor: '#05307a',
              color: 'white',
              fontWeight: 'bold',
              whiteSpace: 'nowrap', // Prevent text wrapping
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              '&:hover': { backgroundColor: '#032050' },
              // Set specific widths for columns
              ...(col === 'slNo' && { width: '70px' }),
              ...(col === 'panchayth' && { width: '100px' }),
              ...(col === 'village' && { width: '100px' }),
              ...(col === 'villageBlock' && { width: '100px' }),
              ...(col === 'cluster' && { width: '80px' }),
              ...(col === 'syNo' && { width: '80px' }),
              ...(col === 'Ward No' && { width: '70px' }),
              ...(col === 'House No' && { width: '80px' }),
              ...(col === 'Thandaper Syno' && { width: '100px' }),
              ...(col === 'Cultivator Name' && { width: '150px' }),
              ...(col === 'Address' && { width: '200px' }),
              ...(col === 'Old SyNo' && { width: '100px' }),
              ...(col === 'area' && { width: '100px' }),
              ...(col === 'landType' && { width: '100px' })
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
                '& .MuiTableSortLabel-icon.Mui-active': { color: '#a7ffeb !important' },
                '& .MuiTableSortLabel-root': {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  width: '100%'
                }
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
            whiteSpace: 'nowrap',
            width: '100px', // Fixed width for action column
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
          <TableCell colSpan={15} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.slNo}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.panchayth}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.kvillageName}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.villageBlock}</TableCell>
            <TableCell align="center">
             
<TextField
  size="small"
  type="text"
  value={row.cluster_number || ""}
  onChange={(e) => handleClusterChange(row.id, e.target.value)}
  onBlur={() => handleClusterBlur(row.id)}
  error={!!clusterErrors[row.id]}
  helperText={clusterErrors[row.id]}
  sx={{ width: 70 }}
/>
             
            </TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.syNo}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{!row.wardNo ? '--' : row.wardNo}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{!row.houseNo ? '--' : row.houseNo}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{!row.tpNo ? '--' : `${row.tpNo}/${row.tpSubNo}`}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{!row.ownerName ? '--' : row.ownerName}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{!row.address ? '--' : row.address}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{!row.oldsuvNo ? '--' : `${row.oldsuvNo}/${row.oldsubNo}`}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parseFloat(row.enumarea).toFixed(2)}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.landType}</TableCell>
            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
              <Button
                size="small"
                color="primary"
                onClick={() => handleViewPlot(row.plot_id)}
                sx={{ minWidth: 'unset', px: 0.5 }}
              >
                <ViewIcon fontSize="small" />
              </Button>

              <Button
                // disabled={true}
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
              rowsPerPageOptions={[25, 50, 100]}
              sx={{ '.MuiTablePagination-toolbar': { justifyContent: 'center' } }}
            />
          </Paper>
        )}
<Dialog 
  open={openPlotDetailsModal} 
  onClose={handleClosePlotDetailsModal}
  maxWidth="md"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
      overflow: 'hidden'
    }
  }}
>
  {/* Header with Gradient Background */}
  <DialogTitle sx={{ 
    background: 'linear-gradient(135deg, #05307a 0%, #1976d2 100%)', 
    color: 'white', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    py: 2.5,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <InfoIcon sx={{ fontSize: 28, opacity: 0.9 }} />
      <Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: '700', lineHeight: 1.2 }}>
          KeyPlot Details
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          Complete plot information and specifications
        </Typography>
      </Box>
    </Box>
    <IconButton 
      onClick={handleClosePlotDetailsModal} 
      sx={{ 
        color: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
        '&:hover': { 
          backgroundColor: 'rgba(255,255,255,0.2)',
          transform: 'scale(1.1)'
        },
        transition: 'all 0.2s ease',
        width: 40,
        height: 40
      }}
      size="small"
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  
  {/* Content Area */}
  <DialogContent sx={{ p: 0, backgroundColor: '#fafbfc' }}>
    {/* Loading State */}
    {plotDetailsLoading && (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        py={6}
        flexDirection="column"
        gap={2}
      >
        <CircularProgress 
          size={40} 
          thickness={4} 
          sx={{ color: '#05307a' }}
        />
        <Box textAlign="center">
          <Typography variant="h6" color="text.primary" gutterBottom>
            Loading Plot Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch the information...
          </Typography>
        </Box>
      </Box>
    )}

    {/* Error State */}
    {plotDetailsError && (
      <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
        <ErrorOutlineIcon
          sx={{ fontSize: 64, color: '#d32f2f', mb: 2, opacity: 0.7 }} 
        />
        <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: '600' }}>
          Unable to Load Plot Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          {plotDetailsError}
        </Typography>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    )}

    {/* Success State */}
    {plotDetailsData && !plotDetailsLoading && (
      <Box sx={{ p: 3 }}>
        {/* Main Information Card */}
        <Card 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'visible',
            mb: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Card Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'primary.light',
              background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
              mx: -3,
              mt: -3,
              px: 3,
              py: 2,
              borderRadius: '12px 12px 0 0'
            }}>
              <DescriptionIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: '700', color: 'primary.main' }}>
                  Basic Information
                </Typography>
                <Typography variant="body2" color="primary.dark" sx={{ opacity: 0.8 }}>
                  Survey number and location details
                </Typography>
              </Box>
            </Box>

            {/* Information Grid */}
            <Grid container spacing={3}>
              {/* Survey Number - Highlighted */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    border: '1px solid',
                    borderColor: 'primary.100',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #05307a 0%, #1976d2 100%)'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ 
                    color: 'primary.main', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}>
                    BTR Type
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: '800', 
                    color: 'primary.dark',
                    mt: 0.5
                  }}>
                    {plotDetailsData.btr_type}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: plotDetailsData.landType === 'WET' ? 'linear-gradient(135deg, #83fd9dff 0%, #8dce87ff 100%)' : 'linear-gradient(135deg, #fab2b2ff 0%, #ffd0d0ff 100%)',
                    border: '1px solid',
                    borderColor: 'primary.100',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #787a05ff 0%, #91d219ff 100%)'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ 
                    color: 'primary.main', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}>
                    Land Type
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: '800', 
                    color: 'primary.dark',
                    mt: 0.5
                  }}>
                    {plotDetailsData.landType}
                  </Typography>
                </Paper>
              </Grid>

              {/* Area - Highlighted */}
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #bee3eeff 0%, #f1f8e9 100%)',
                    border: '1px solid',
                    borderColor: 'success.100',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #2e7d32 0%, #4caf50 100%)'
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ 
                    color: 'success.main', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}>
                    Total Area
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: '800', 
                    color: 'success.dark',
                    mt: 0.5
                  }}>
                    {parseFloat(plotDetailsData.enumArea).toFixed(2)} <Typography component="span" variant="h6" sx={{ fontWeight: '600' }}>Cents</Typography>
                  </Typography>
                </Paper>
              </Grid>

              {/* Location Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  fontWeight: '600', 
                  color: 'text.primary',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <LocationOnIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  Location Information
                </Typography>
              </Grid>

              {/* Location Grid */}
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Panchayath
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {plotDetailsData.panchayath}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Village
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {plotDetailsData.kvillageName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Village Block
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {plotDetailsData.villageBlock}
                  </Typography>
                </Box>
              </Grid>

                <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Survey Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                     {!plotDetailsData.syNo || plotDetailsData.syNo === "null" || plotDetailsData.syNo === "null/" ? "NA" : plotDetailsData.syNo}
                  </Typography>
                </Box>
              </Grid>
                    <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Owner Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.ownerName || plotDetailsData.ownerName === "null" || plotDetailsData.ownerName === "null/" ? "NA" : plotDetailsData.ownerName}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.address || plotDetailsData.address === "null" || plotDetailsData.address === "null/" ? "NA" : plotDetailsData.address}
                  </Typography>
                </Box>
              </Grid>
              {plotDetailsData.btr_id === 2 && (
               <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    Ward Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.wardNo || plotDetailsData.wardNo === "null" || plotDetailsData.wardNo === "null/" ? "NA" : plotDetailsData.wardNo}
                  </Typography>
                </Box>
              </Grid>)}
                {plotDetailsData.btr_id === 2 && (
               <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                    House Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.houseNo || plotDetailsData.houseNo === "null" || plotDetailsData.houseNo === "null/" ? "NA" : plotDetailsData.houseNo}
                  </Typography>
                </Box>
              </Grid>)}
                {plotDetailsData.btr_id === 4 && (
                 <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                   Thandaper Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.tpNo || plotDetailsData.tpNo === "null" || plotDetailsData.tpNo === "null/" ? "NA" : plotDetailsData.tpNo}
                  </Typography>
                </Box>
              </Grid>)}
                {plotDetailsData.btr_id === 4 && (
                 <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                   Thandaper Subdivision
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.tpSubNo || plotDetailsData.tpSubNo === "null" || plotDetailsData.tpSubNo === "null/" ? "NA" : plotDetailsData.tpSubNo}
                  </Typography>
                </Box>
              </Grid>)}
                    {plotDetailsData.btr_id === 5 && (
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                   Old Survey Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.oldsuvNo || plotDetailsData.oldsuvNo === "null" || plotDetailsData.oldsuvNo === "null/" ? "NA" : plotDetailsData.oldsuvNo}
                  </Typography>
                </Box>
              </Grid>)}
                        {plotDetailsData.btr_id === 5 && (
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500', mb: 1 }}>
                   Old Subdivision Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                    {!plotDetailsData.oldsubNo || plotDetailsData.oldsubNo === "null" || plotDetailsData.oldsubNo === "null/" ? "NA" : plotDetailsData.oldsubNo}
                  </Typography>
                </Box>
              </Grid>)}




              {/* Land Type */}
              {/* <Grid item xs={12}>
                <Box sx={{ 
                  p: 2.5, 
                  backgroundColor: 'primary.50', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.100'
                }}>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: '600', mb: 1 }}>
                    Land Type
                  </Typography>
                  <Chip 
                    label={plotDetailsData.landType}
                    color="success"
                    variant="filled"
                    sx={{ 
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      px: 1,
                      py: 0.5
                    }}
                  />
                </Box>
              </Grid> */}
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Information Section (if needed) */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 2
        }}>
          <Chip 
            icon={<InfoOutlineIcon/>}
            label="Field Are Changed Based on Btr Type"
            color="success"
            variant="outlined"
            sx={{ fontWeight: '600' }}
          />
        </Box>
      </Box>
    )}
  </DialogContent>
  
  {/* Footer Actions */}
  <DialogActions sx={{ 
    p: 3, 
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid',
    borderColor: 'divider'
  }}>
  <Button
  variant="outlined"
  color="primary"
  onClick={handleOpenEnumEdit}
>
  Edit Enumerated Area
</Button>

    <Button 
      onClick={handleClosePlotDetailsModal}
      variant="contained"
      startIcon={<CloseIcon />}
      sx={{ 
        background: 'linear-gradient(135deg, #05307a 0%, #1976d2 100%)',
        borderRadius: 2,
        px: 4,
        py: 1,
        fontWeight: '600',
        fontSize: '1rem',
        textTransform: 'none',
        boxShadow: '0 4px 12px rgba(5, 48, 122, 0.3)',
        '&:hover': { 
          background: 'linear-gradient(135deg, #032050 0%, #1565c0 100%)',
          boxShadow: '0 6px 16px rgba(5, 48, 122, 0.4)',
          transform: 'translateY(-1px)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Close Details
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
        {/* <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{background:'red', color:'white'}} variant="h5">Confirm Removal</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are about to remove Survey Number:{' '}
              <Typography component="span" fontWeight="bold" color="primary.main">
                {selectedRowToRemove?.syNo}
              </Typography>
              . This Cluster will be permanently removed.
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
        </Dialog> */}
<Dialog 
  open={openRemoveDialog} 
  onClose={() => {
    if (!dialogLoading) {
      handleCloseRemoveDialog();
    }
  }} 
  fullWidth 
  maxWidth="sm"
>
  {removalValidationError ? (
    // Error State Dialog
    <>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', 
        color: 'white',
        animation: 'pulse 1s ease-in-out',
        '@keyframes pulse': {
          '0%': { opacity: 0.8 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.8 }
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">REMOVAL BLOCKED</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <ErrorOutlineIcon sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
        </Box>
        
        <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
          Cannot Remove KeyPlot
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mt: 2, 
            mb: 2, 
            bgcolor: '#ffebee',
            borderLeft: '5px solid #d32f2f',
            textAlign: 'left'
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontWeight: 500 }}>
            {removalValidationError}
          </Typography>
        </Paper>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            💡 <strong>Tip:</strong> Only KeyPlots with cluster status "Not Started" can be removed.
            Please check the cluster status before attempting removal.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button 
          onClick={() => {
            setRemovalValidationError('');
            handleCloseRemoveDialog();
          }} 
          variant="contained"
          color="primary"
          size="large"
          sx={{ px: 4 }}
        >
          Got it
        </Button>
      </DialogActions>
    </>
  ) : (
    // Normal Confirmation Dialog
    <>
      <DialogTitle sx={{ background: '#d32f2f', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          <Typography variant="h6">Confirm Removal</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            ⚠️ This action cannot be undone!
          </Typography>
          <Typography variant="body2">
            Removing this KeyPlot will permanently delete:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>The KeyPlot record</li>
            <li>Associated cluster (only if status is "Not Started")</li>
            <li>Related BTR data</li>
          </ul>
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          You are about to remove Survey Number:{' '}
          <Typography component="span" fontWeight="bold" color="error.main">
            {selectedRowToRemove?.syNo}
          </Typography>
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleCloseRemoveDialog} 
          variant="outlined"
          disabled={dialogLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmRemoval}
          variant="contained"
          color="error"
          disabled={dialogLoading}
          startIcon={dialogLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          sx={{ minWidth: '120px' }}
        >
          {dialogLoading ? 'Removing...' : 'Remove Permanently'}
        </Button>
      </DialogActions>
    </>
  )}
</Dialog>
        
       <Dialog open={openEditEnumDialog} onClose={() => setOpenEditEnumDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>Edit Enumerated Area</DialogTitle>
  
  <DialogContent dividers>
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total Available Area
      </Typography>
      <Paper 
        sx={{ 
          p: 2, 
          bgcolor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: 1
        }}
      >
        <Typography variant="h6" align="center">
          {parseFloat(AreaValue).toFixed(2)} Cents
        </Typography>
      </Paper>
    </Box>
    
    <TextField
      label="Enumerated Area (Cents)"
      type="number"
      fullWidth
      margin="dense"
      value={enumAreaValue}
      onChange={handleEnumAreaChange}
      error={Boolean(enumError)}
      helperText={enumError}
      InputProps={{
        inputProps: { 
          min: 0,
          step: 0.01,
          max: parseFloat(AreaValue)
        },
        endAdornment: <InputAdornment position="end">Cents</InputAdornment>
      }}
    />
    
    {/* Optional: Add a progress indicator */}
    {enumAreaValue && !enumError && parseFloat(AreaValue) > 0 && (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Usage: {((parseFloat(enumAreaValue) / parseFloat(AreaValue)) * 100).toFixed(1)}%
        </Typography>
        <Box sx={{ 
          height: 6, 
          bgcolor: '#e0e0e0',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            height: '100%',
            width: `${Math.min(100, (parseFloat(enumAreaValue) / parseFloat(AreaValue)) * 100)}%`,
            bgcolor: enumError ? '#f44336' : '#4caf50',
            transition: 'width 0.3s ease'
          }} />
        </Box>
      </Box>
    )}
    
    {/* <TextField
      label="Remark (Optional)"
      fullWidth
      margin="dense"
      multiline
      rows={2}
      value={enumRemark}
      onChange={(e) => setEnumRemark(e.target.value)}
      sx={{ mt: 2 }}
    /> */}
  </DialogContent>
  
  <DialogActions sx={{ p: 2 }}>
    <Button 
      onClick={() => setOpenEditEnumDialog(false)}
      variant="outlined"
    >
      Cancel
    </Button>
    
    <Button
      variant="contained"
      onClick={handleUpdateEnumeratedArea}
      disabled={enumLoading || Boolean(enumError) || !enumAreaValue}
      color={enumError ? "error" : "primary"}
      startIcon={enumLoading ? <CircularProgress size={20} color="inherit" /> : null}
    >
      {enumLoading ? "Updating..." : "Update Area"}
    </Button>
  </DialogActions>
</Dialog>
      </Grid>
    </Grid>
  );
};

export default KeyPlotListing;
import React, { useState, useEffect,useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
  Typography,
  TextField,
  Stack,
  Paper,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Grid, Card, CardContent,Chip, TableContainer, Table, TableCell, Alert
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditIcon from '@mui/icons-material/Edit';
import Breadcrumb from 'routes/Breadcrumb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import btrservice from './btrservice';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import { width } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import { use } from 'react';



// Define the columns for the data table
// const columns = (handleEdit, handleView,page,size) => [
  const columns = (handleEdit, handleView, handlePlotUsage, page, size) => [
{
  name: 'SL. NO',
  selector: (row) => row.indexOffset,   // use the stored serial
  sortable: true,
  sortKey: 'indexOffset',
  width: '80px',
  minWidth: '80px',
  allowOverflow: true,
  button: true,
}
,

  // { name: 'District', selector: (row) => row.dcode, sortable: true },
  // { name: 'Taluk', selector: (row) => row.tcode, sortable: true },
  // { name: 'Village', selector: (row) => row.vcode, sortable: true },
  { 
    name: 'Local Body Name',
    selector: row => row.lbname?.toString() || 'NA',
    sortable: true,
    sortKey: 'lbname',
    wrap: true,
    minWidth: '180px',
  },
{
    name: 'Village',
    selector: (row) => {
      const name = row.villageName?.toString();
      return name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : <span style={{ color: '#888' }}>NA</span>;
    },
    sortable: true,
    sortKey: 'villageName',
    wrap: true, // Allow text wrapping
    width:'140px',
    minWidth: '50px', // Set minimum width
  },

  { 
    name: 'Block No.', 
    selector: (row) => row.bcode?.toString() || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    sortKey: 'bcode',
    width: '120px', // Fixed width
    minWidth: '120px',
  },
  {
    name: 'Re-Survey No',
    sortable: true,
    sortKey: 'resvno',
    selector: (row) =>
      row.resvno && row.resbdno ? (
        `${row.resvno} / ${row.resbdno}`
      ) : row.resvno ? (
        `${row.resvno} / NA`
      ) : row.resbdno ? (
        `NA / ${row.resbdno}`
      ) : (
        <span style={{ color: '#888' }}>NA</span>
      )
  },
  // { name: 'Re-Survey No', selector: (row) => row.resvno?.toString() || <span style={{ color: '#888' }}>NA</span> },
  // { name: 'Sub Div No', selector: (row) => row.resbdno?.toString() || <span style={{ color: '#888' }}>NA</span> },
  // { name: 'Address', selector: (row) => row.lbname?.toString() || <span style={{ color: '#888' }}>NA</span> },
  // { name: 'Address', selector: (row) => row.lbcode, sortable: true },

  {
    name: 'Land Type',
    selector: (row) => row.ltype?.toString() || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    sortKey: 'ltype',
  },
   { 
    name: 'Total Area (in Cents)', 
    sortable: true,
    sortKey: 'totalCent',
    selector: (row) => row.totalCent?.toString() || <span style={{ color: '#888' }}>NA</span>,
    wrap: true, // Allow text wrapping
    width:'190px',
    minWidth: '150px', // Set minimum width
  },

  {
    name: 'View Details',
    cell: (row) => (
      <Button color="success" onClick={() => handleView(row)}>
        <VisibilityIcon />
     
      </Button>
      
    ),
    style: {
      padding: '0px',
      textAlign: 'center',
    },
  },
  // In your columns definition, add this column after the View Details column
{
  name: 'Plot Edit',
  cell: (row) => (
    <Button 
      color="primary" 
      onClick={() => handlePlotUsage(row)}
      // variant="outlined"
      size="small"
    >
      <EditIcon fontSize="small" />
      
    </Button>
  ),
  style: {
    padding: '0px',
    textAlign: 'center',
    width: '130px',
    minWidth: '130px',
  },
},
  
];

const Btr = ({ zoneId }) => {
 
  const [resolvedZoneId, setResolvedZoneId] = useState(() => {
  const role = authservice.getrole(); // Get the role
  return role === 'Field Data Collector'
    ? authservice.getzone()  // For Field Data Collector
    : zoneId;                         // For Admin or other roles
});




  const [filterText, setFilterText] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false); // Not used in provided code, but kept
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // Start with page 1 (react-data-table-component is 1-based)
  const [size, setSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalWetArea, setTotalWetArea] = useState(0);
  const [totalDryArea, setTotalDryArea] = useState(0);
  const [downloading, setDownloading] = useState(false);
    // const [zoneId, setZoneId] = useState(() => propZoneId || localStorage.getItem('zoneId'));
  const [loading, setLoading] = useState(false);
  const [plotUsageData, setPlotUsageData] = useState([]);
const [plotUsageDialogOpen, setPlotUsageDialogOpen] = useState(false);
const [plotUsageLoading, setPlotUsageLoading] = useState(false);
const [selectedPlotRow, setSelectedPlotRow] = useState(null);
// Add these with your other state declarations
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [editTotCent, setEditTotCent] = useState('');
const [editLoading, setEditLoading] = useState(false);
const [editMessage, setEditMessage] = useState('');
const [editError, setEditError] = useState('');

  const [order, setOrder] = useState('asc');
const [orderBy, setOrderBy] = useState('indexOffset');


  const descendingComparator = (a, b, key) => {
  const va = a?.[key];
  const vb = b?.[key];
  if (typeof va === 'string' && typeof vb === 'string') return vb.localeCompare(va);
  if (vb < va) return -1;
  if (vb > va) return 1;
  return 0;
};

const getComparator = (ord, key) =>
  ord === 'desc'
    ? (a, b) => descendingComparator(a, b, key)
    : (a, b) => -descendingComparator(a, b, key);

const sortedData = useMemo(() => {
  const copy = [...(data || [])];
  return copy.sort(getComparator(order, orderBy));
}, [data, order, orderBy]);

const handleRequestSort = (columnKey) => {
  const isAsc = orderBy === columnKey && order === 'asc';
  setOrder(isAsc ? 'desc' : 'asc');
  setOrderBy(columnKey);
};





  // Function to handle filter change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(1); // Reset page to 1 when filter changes
  };

  // Function to handle view action
  const handleView = (row) => {
    setSelectedRow(row);
    setOpenViewModal(true);
    setSelectedRow(row);
    setOpenViewModal(true);
  };
const validateEditArea = (value) => {
  if (!value) return '';
  
  const numValue = parseFloat(value);
  const totalEnumeratedArea = plotUsageData.reduce((sum, plot) => 
    sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0);
  
  if (isNaN(numValue)) return 'Please enter a valid number';
  if (numValue <= 0) return 'Area must be greater than zero';
  if (numValue < totalEnumeratedArea) {
    return `Minimum allowed: ${totalEnumeratedArea.toFixed(2)} cents`;
  }
  return '';
};
const handlePlotUsage = async (row) => {
  setSelectedPlotRow(row);
  setPlotUsageLoading(true);
  setPlotUsageDialogOpen(true);
  
  try {
    // Assuming you have the bcode from the row
    const plotId = row.id; // Adjust this based on your actual ID field
    const response = await btrservice.getPlotUsageData(plotId);
    setPlotUsageData(response || []);
  } catch (error) {
    console.error("Error fetching plot usage data:", error);
    setPlotUsageData([]);
  } finally {
    setPlotUsageLoading(false);
  }
};

const handleEditTotCent = async () => {
  if (!selectedPlotRow?.id) {
    setEditError('No plot selected');
    return;
  }

  const newTotCent = parseFloat(editTotCent);
  if (isNaN(newTotCent) || newTotCent <= 0) {
    setEditError('Please enter a valid positive number');
    return;
  }

  // Calculate total enumerated area from plotUsageData
  const totalEnumeratedArea = plotUsageData.reduce((sum, plot) => 
    sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0);
  
  // Validate that new total area is not less than total enumerated area
if (newTotCent < totalEnumeratedArea) {
  const deficit = totalEnumeratedArea - newTotCent;
  setEditError(
    `Cannot reduce total area! New total area (${newTotCent} cents) is less than total enumerated area (${totalEnumeratedArea.toFixed(2)} cents). 
    You need to reduce enumerated area by ${deficit.toFixed(2)} cents in one or more clusters first.`
  );
  return;
}

  setEditLoading(true);
  setEditMessage('');
  setEditError('');

  try {
    // Call the backend API
    const userId = authservice.userid();
   
    const response = await btrservice.updatePlotTotalArea(selectedPlotRow.id, newTotCent,userId);
    
    setEditMessage(response || 'Area updated successfully');
    
    // Refresh plot usage data
    if (selectedPlotRow?.id) {
      const refreshedData = await btrservice.getPlotUsageData(selectedPlotRow.id);
      setPlotUsageData(refreshedData || []);
    }
    
    // Update the selected row in the main table data
    setData(prevData => 
      prevData.map(item => 
        item.id === selectedPlotRow.id 
          ? { ...item, totalCent: newTotCent }
          : item
      )
    );
    
    // Also update the selectedPlotRow for immediate UI feedback
    setSelectedPlotRow(prev => ({
      ...prev,
      totalCent: newTotCent
    }));
    
    // Optionally close the dialog after success
    setTimeout(() => {
      setEditDialogOpen(false);
      setEditTotCent('');
    }, 2500);
    
  } catch (error) {
    setEditError(error.response?.data?.message || 'Failed to update area');
  } finally {
    setEditLoading(false);
  }
};
  // Function to close modals
  const handleCloseModals = () => {
    setOpenEditModal(false);
    setOpenViewModal(false);
    setSelectedRow(null);
    setSelectedRow(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);

  };

  useEffect(() => {
    if (!zoneId) {
      console.warn("Zone ID is missing");
      return;
    }

    fetchData(); // include zoneId in the API call
  }, [zoneId, page, size, filterText]);


  const handleRowsPerPageChange = (newSize) => {
    setSize(newSize);
    setPage(1); // Reset to page 1 when rows per page changes
  };

  // Fetch the data from the API
  const fetchData = async () => {
    if (!resolvedZoneId) {
      console.warn("Missing zoneId");
      return;
    }

    setLoading(true); // Set loading to true
    try {
      // Adjust page to 0-based if your API expects it
      const apiPage = page - 1;
      const response = await btrservice.btr_lists_data(apiPage, size, filterText,resolvedZoneId);
      
      if (response?.payload?.data) {
        
        // after fetching data
        const indexedData = response.payload.data.map((item, idx) => ({
          ...item,
          indexOffset: (page - 1) * size + idx + 1, // 1-based serial across pages
        }));
        setData(indexedData);        
        setData(indexedData);
        setTotalRecords(response.payload.totalCount);
        setTotalWetArea(response.payload.totalWetArea);
        setTotalDryArea(response.payload.totalDryArea);
        setTotalArea(response.payload.totalArea);
      } else {
        console.error("Failed to fetch data:", response.message);
        setData([]); // Clear data on failure
        setTotalRecords(0); // Reset total records
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

const handleDownloadExcel = async () => {
  setDownloading(true);
  
  const userId = authservice.userid();
  const BASE_URL = mainapi.USER_API;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `${BASE_URL}/btr-service/btr-api/export?zoneId=${resolvedZoneId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    // 🔹 Extract filename from header
    const disposition = response.headers.get('Content-Disposition');
   let fileName = "btr_data.xlsx";
if (disposition) {
  // Try filename*= (RFC 5987)
  let fileNameMatch = disposition.match(/filename\*=(?:UTF-8''|)([^;]+)/);

  if (!fileNameMatch) {
    // Try "filename="
    fileNameMatch = disposition.match(/filename="([^"]+)"/);
  }

  if (!fileNameMatch) {
    // Try unquoted filename=
    fileNameMatch = disposition.match(/filename=([^;]+)/);
  }

  if (fileNameMatch && fileNameMatch[1]) {
    fileName = decodeURIComponent(fileNameMatch[1].trim());
  }
}

    // 🔹 Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("Download error:", error);
    alert("Download failed.");
  } finally {
    setDownloading(false);
  }
};


  // const columnDefs = useMemo(() => columns(undefined, handleView, page, size), [handleView, page, size]);
const columnDefs = useMemo(() => columns(undefined, handleView, handlePlotUsage, page, size), [handleView, handlePlotUsage, page, size]);
  const columnDefsMapped = useMemo(
  () => columnDefs.map(col => ({ ...col, sortField: col.sortKey || col.name })),
  [columnDefs]
);

const handleSort = (column, direction) => {
  const key = column.sortField || column.sortKey || column.name;
  setOrder(direction);
  setOrderBy(key);
};

  useEffect(() => {
    fetchData();
  }, [page, size, filterText]); 

  return (    
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Grid item xs={12}>
 
        <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center">

            <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
              Basic Tax Register
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: 'green' }}>Total Wet : {totalWetArea} Cents</Typography>
            <Typography variant="body1" component="p" sx={{ color: 'red' }}>Total Dry : {totalDryArea} Cents</Typography>
            <Typography variant="body1" component="p" sx={{ color: '#04255e' }}>Total Area : {totalArea} Cents</Typography>


            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadExcel}
              disabled={downloading}
              startIcon={
                downloading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />
              }
              sx={{
                backgroundColor: downloading ? '#1976d2' : undefined,
                opacity: downloading ? 0.8 : 1,
                pointerEvents: downloading ? 'none' : 'auto',
                color: '#fff',
                '&.Mui-disabled': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
              }}
            >
              {downloading ? 'Downloading...' : 'Download'}
            </Button>



            <TextField
              label="Search"
              variant="outlined"
              value={filterText}
              onChange={handleFilterChange}
              size="small"
              style={{ width: '200px' }}
              inputProps={{
              maxLength: 100
                }}
            />
          </Stack>
        </Paper>


<DataTable
  columns={columnDefsMapped}
  data={sortedData}
  sortServer
  onSort={handleSort}
  progressPending={loading}
  progressComponent={
    <div
      style={{
        padding: '20px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#04255e',
        textAlign: 'center',
      }}
    >
      Loading BTR Data...
    </div>
  }
  pagination
  paginationServer
  paginationTotalRows={totalRecords}
  onChangeRowsPerPage={handleRowsPerPageChange}
  onChangePage={handlePageChange}
  paginationPerPage={10}
  paginationRowsPerPageOptions={[10, 25, 50, 100]}
  paginationComponentOptions={{
    rowsPerPageText: 'Rows per page',
    rangeSeparatorText: 'of',
  }}
  // 🚩 KEY PROPS FOR ALWAYS-FROZEN HEADER:
  fixedHeader
  fixedHeaderScrollHeight="60vh"  // Makes the table body scrollable, header always in view

  // 💡 Use clean customStyles, DO NOT add position/top/zIndex to headCells
  customStyles={{
    headCells: {
      style: {
        fontSize: '.9rem',
        backgroundColor: '#04255e',
        color: '#fff',
        fontWeight: 'bold',
        borderBottom: '2px solid black',
        // No sticky positioning here!
      },
    },
    cells: {
      style: {
        borderBottom: '1px solid white',
        color: '#333',
      },
    },
    pagination: {
      style: {
        color: '#04255e',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    table: {
      style: {
        // No overflowY or maxHeight here—managed by DataTable's fixedHeaderScrollHeight
      },
    },
  }}
/>




        {/* Modal for viewing full details */}
       <Dialog
  open={openViewModal}
  onClose={handleCloseModals}
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
          View BTR Details
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          Complete Book of Transfer Registry information
        </Typography>
      </Box>
    </Box>
    <IconButton
      onClick={handleCloseModals}
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
    {/* Assuming selectedRow is available. If you have loading/error states, insert them here. */}
    {selectedRow && (
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
            {/* Card Header - Basic Information (BTR/Land/Area are highlighted fields) */}
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
                  Core BTR Information
                </Typography>
                <Typography variant="body2" color="primary.dark" sx={{ opacity: 0.8 }}>
                  Key identifiers, ownership, and location details
                </Typography>
              </Box>
            </Box>

            {/* Information Grid for Data Fields */}
            <Grid container spacing={3}>
              {/* === Dynamically Generated Fields === */}
              {Object.keys(selectedRow)
                .filter((key) => key !== 'id' && key !== 'lbcode' && key !== 'resbdno' && key !== 'lbtype' && key !== 'indexOffset')
                .map((key) => {
                  let label = key;
                  let value = selectedRow[key] || 'NA';
                  let highlight = false;
                  let fieldIcon = null;

                  // --- Custom Label/Value Logic (Copied from your original code) ---
                  if (key === 'villageName') {
                    label = 'Village Name';
                    fieldIcon = <LocationOnIcon sx={{ color: 'primary.main', fontSize: 18 }} />;
                  } else if (key === 'bcode') {
                    label = 'Block Code';
                  } else if (key === 'resvno') {
                    // Combine resvno and resbdno
                    const resvno = selectedRow.resvno || 'NA';
                    const resbdno = selectedRow.resbdno || 'NA';
                    label = 'Re-Survey No.';
                    value = `${resvno} / ${resbdno}`;
                    highlight = true; // Highlight Survey Number
                  } else if (key === 'lbname') {
                    // Use only lbname, as lbtype is filtered out for the detailed view
                    label = 'Local Body Name';
                    value = selectedRow.lbname || 'NA';
                  } else if (key === 'ltype') {
                    label = 'Land Type';
                    highlight = true; // Highlight Land Type
                  } else if (key === 'owner_name') {
                    label = 'Owner Name';
                  } else if (key === 'address') {
                    label = 'Address';
                  } else if (key === 'tp_no') {
                    label = 'Thandaper No';
                  } else if (key === 'tp_subdivion_no') {
                    label = 'Thandaper Subdivision No';
                  } else if (key === 'main_no') {
                    label = 'Old Survey No';
                  } else if (key === 'sub_main_no') {
                    label = 'Old Sub Division No';
                  } else if (key === 'totalCent') {
                    label = 'Total Area';
                    value = `${parseFloat(selectedRow.totalCent || 0).toFixed(2)} Cents`;
                    highlight = true; // Highlight Area
                  } else {
                    // Default cleaning for camelCase keys
                    label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  }

                  // Skip the original composite fields since we combined them
                  if (key === 'lbtype') return null;

                  // --- Rendering a single field ---
                  return (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: highlight ? '#ffffffff' : 'grey.50',
                          borderRadius: 2,
                          border: highlight ? '1px solid #ff9800' : '1px solid #e0e0e0',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                          }
                        }}
                      >
                        <Typography
                          variant="caption"
                          color={highlight ? '#ff9800' : 'text.secondary'}
                          sx={{ fontWeight: '700', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}
                        >
                          {label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {fieldIcon}
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: '600',
                              color: highlight ? '#d32f2f' : 'text.primary',
                              wordBreak: 'break-word',
                            }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}

              {/* === Static Highlighted Card for Land Type (Redesigned for better UX) === */}
              {/* This is based on the logic in your provided example, but adapted to use selectedRow data. */}
             
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2
        }}>
          <Chip
            icon={<InfoOutlineIcon />}
            label="Field details are dynamically adjusted based on the BTR Type."
            color="info" // Changed color to info for a more neutral/information look
            variant="outlined"
            sx={{ fontWeight: '600', py: 1, px: 1 }}
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
      onClick={handleCloseModals} // Kept your original handler
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

 <Dialog
        open={plotUsageDialogOpen}
        onClose={() => setPlotUsageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Plot Usage Details
          {selectedPlotRow && (
            <Typography variant="body2" color="text.secondary">
              Block No: {selectedPlotRow.bcode} | Survey: {selectedPlotRow.resvno}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          {plotUsageData.length > 0 && plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0) > (selectedPlotRow?.totalCent || 0) && (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Typography variant="body2">
        <strong>Warning:</strong> Total enumerated area from clusters exceeds plot area. 
        You cannot reduce plot area until you reduce enumerated area in clusters.
      </Typography>
    </Alert>
  )}
          <Alert severity="info" sx={{ mb: 2 }}>
            Plot usage information - User wants to edit plot usage data
          </Alert>
          
    {plotUsageLoading ? (
  <Box display="flex" justifyContent="center" p={3}>
    <CircularProgress />
  </Box>
) : plotUsageData.length > 0 ? (
  <TableContainer component={Paper} variant="outlined">
    <Table>
      <thead>
        <tr>
          <th>Plot Label</th>
          <th>Cluster Number</th>
          <th>Total Area (Cents)</th>
          <th>Enumerated Area</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {plotUsageData.map((plot, index) => {
          const plotTotal = parseFloat(plot.totCent) || 0;
          const enumerated = parseFloat(plot.totalEnumeratedArea) || 0;
          const isExceeding = enumerated > plotTotal;
          
          return (
            <tr key={index}>
              <TableCell>{plot.plotLabel || 'N/A'}</TableCell>
              <TableCell>{plot.clusterNumber || 'N/A'}</TableCell>
              <TableCell>{plotTotal.toFixed(2)}</TableCell>
              <TableCell>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isExceeding ? 'bold' : 'normal',
                    color: isExceeding ? 'error.main' : 'inherit'
                  }}
                >
                  {enumerated.toFixed(2)}
                  {isExceeding && (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ ml: 1, color: 'error.main' }}
                    >
                      (Exceeds plot area)
                    </Typography>
                  )}
                </Typography>
              </TableCell>
              <TableCell>
                {isExceeding ? (
                  <Chip 
                    label="Warning" 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                ) : (
                  <Chip 
                    label="OK" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                )}
              </TableCell>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <TableCell colSpan={2} align="right">
            <Typography variant="body2" fontWeight="bold">
              Total Enumerated Area:
            </Typography>
          </TableCell>
          <TableCell></TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="bold">
              {plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0).toFixed(2)}
            </Typography>
          </TableCell>
          <TableCell>
            {plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0) > (selectedPlotRow?.totalCent || 0) ? (
              <Chip 
                label="Total Exceeds Plot" 
                size="small" 
                color="error" 
                variant="filled"
              />
            ) : (
              <Chip 
                label="Within Limit" 
                size="small" 
                color="success" 
                variant="filled"
              />
            )}
          </TableCell>
        </tr>
      </tfoot>
    </Table>
  </TableContainer>
) : (
  <Typography color="text.secondary" align="center" p={3}>
    No plot usage data available
  </Typography>
)}

        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPlotUsageDialogOpen(false)}>Close</Button>
          {/* Changed Edit button here */}
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setEditDialogOpen(true);
              setEditTotCent(selectedPlotRow?.totalCent?.toString() || '');
              setEditMessage('');
              setEditError('');
            }}
          >
            Edit Total Area
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD THE EDIT DIALOG HERE */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Total Area
          {selectedPlotRow && (
            <Typography variant="body2" color="text.secondary">
              Block: {selectedPlotRow.bcode} | Survey: {selectedPlotRow.resvno}
            </Typography>
          )}
        </DialogTitle>
        
    {/* UPDATE THE EDIT DIALOG CONTENT */}
<DialogContent>
  {editMessage && (
    <Alert severity="success" sx={{ mb: 2 }}>
      {editMessage}
    </Alert>
  )}
  
  {editError && (
    <Alert severity="error" sx={{ mb: 2 }}>
      {editError}
    </Alert>
  )}
  
  <Box sx={{ mt: 2 }}>
    <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
      Current Total Area: {selectedPlotRow?.totalCent || 0} Cents
    </Typography>
    
    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
      Total Enumerated Area from Clusters: { 
        plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0).toFixed(2)
      } Cents
    </Typography>
    
<TextField
  fullWidth
  label="New Total Area (Cents)"
  type="number"
  value={editTotCent}
  onChange={(e) => {
    const value = e.target.value;
    setEditTotCent(value);
    
    // Real-time validation
    const validationError = validateEditArea(value);
    if (validationError) {
      setEditError(validationError);
    } else {
      setEditError('');
    }
    setEditMessage('');
  }}
  disabled={editLoading}
  InputProps={{
    inputProps: { 
      min: plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0),
      step: 0.01 
    }
  }}
  error={!!editError}
  helperText={editError || `Minimum allowed: ${plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0).toFixed(2)} cents`}
  sx={{ mb: 2 }}
/>
    
    {editTotCent && parseFloat(editTotCent) > 0 && (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          New total area: <strong>{parseFloat(editTotCent).toFixed(2)} cents</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Available for new clusters: <strong>
            {(parseFloat(editTotCent) - plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0)).toFixed(2)} cents
          </strong>
        </Typography>
        {/* Add this after the TextField in edit dialog */}
{editTotCent && parseFloat(editTotCent) > 0 && (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Used: {plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0).toFixed(2)} cents
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Available: {(parseFloat(editTotCent) - plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0)).toFixed(2)} cents
      </Typography>
    </Box>
    <Box sx={{ 
      height: 8, 
      bgcolor: '#e0e0e0',
      borderRadius: 4,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        position: 'absolute',
        height: '100%',
        width: `${Math.min(100, (plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0) / parseFloat(editTotCent)) * 100)}%`,
        bgcolor: parseFloat(editTotCent) < plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0) 
          ? '#f44336' 
          : '#4caf50',
        transition: 'width 0.3s ease'
      }} />
    </Box>
    <Typography variant="caption" color="text.secondary">
      {Math.min(100, (plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0) / parseFloat(editTotCent)) * 100).toFixed(1)}% of new area is already allocated
    </Typography>
  </Box>
)}
      </Box>
    )}
    
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="body2">
        <strong>Validation Rule:</strong> New total area cannot be less than current enumerated area from clusters.
        To reduce total area below {plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0).toFixed(2)} cents, 
        you must first reduce the enumerated area in one or more clusters.
      </Typography>
    </Alert>
  </Box>
</DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialogOpen(false);
              setEditTotCent('');
              setEditMessage('');
              setEditError('');
            }}
            disabled={editLoading}
          >
            Cancel
          </Button>
       <Button 
  variant="contained" 
  color="primary"
  onClick={handleEditTotCent}
  disabled={
    editLoading || 
    !editTotCent || 
    parseFloat(editTotCent) < plotUsageData.reduce((sum, plot) => sum + (parseFloat(plot.totalEnumeratedArea) || 0), 0)
  }
  startIcon={editLoading ? <CircularProgress size={20} /> : null}
>
  {editLoading ? 'Updating...' : 'Update Area'}
</Button>
        </DialogActions>
      </Dialog>

      </Grid>
    </Grid>
  );
};

export default Btr;
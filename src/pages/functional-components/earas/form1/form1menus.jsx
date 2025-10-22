import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Circle,
  Close,
  Search,
  Download,
  FilterList,
  Refresh,
  Visibility,
  GetApp,
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi'; 
import axios from 'axios';

// --- Theme Constants ---
const TABLE_HEADER_BG = '#04255e';
const TABLE_HEADER_COLOR = '#ffffff';
const ACCENT_COLOR = '#1976d2';
const SUCCESS_COLOR = '#2e7d32';
const ERROR_COLOR = '#d32f2f';

// --- Enhanced Helper Components ---

const DetailItem = ({ label, value, icon }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon && <Box sx={{ mr: 1, color: ACCENT_COLOR }}>{icon}</Box>}
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        {label}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ fontWeight: 'bold', color: TABLE_HEADER_BG }}>
      {value || 'N/A'}
    </Typography>
  </Grid>
);

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel" id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

// Enhanced Table Header with Sorting
const EnhancedTableHead = ({ columns, order, orderBy, onSort, sx = {} }) => {
  const createSortHandler = (property) => (event) => {
    onSort(event, property);
  };

  return (
    <TableHead sx={{ backgroundColor: TABLE_HEADER_BG, ...sx }}>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.numeric ? 'right' : 'left'}
            sortDirection={orderBy === column.id ? order : false}
            sx={{
              color: TABLE_HEADER_COLOR,
              fontWeight: 'bold',
              fontSize: '0.875rem',
              borderRight: column.id !== columns[columns.length - 1].id ? `1px solid rgba(255,255,255,0.2)` : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {column.sortable ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : 'asc'}
                onClick={createSortHandler(column.id)}
                sx={{
                  color: TABLE_HEADER_COLOR + '!important',
                  '&:hover': { color: TABLE_HEADER_COLOR },
                  '&.MuiTableSortLabel-icon': { color: TABLE_HEADER_COLOR + '!important' },
                }}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

// Search Filter Component
const SearchFilter = ({ onFilter, placeholder = "Search..." }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    onChange={(e) => onFilter(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search fontSize="small" />
        </InputAdornment>
      ),
    }}
    sx={{ mb: 2, minWidth: 250 }}
  />
);

// Download Menu Component
const DownloadMenu = ({ onDownload }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (format) => {
    onDownload(format);
    handleClose();
  };

  return (
    <div>
      <Button
        variant="contained"
        startIcon={<GetApp />}
        onClick={handleClick}
        sx={{ 
          backgroundColor: TABLE_HEADER_BG,
          '&:hover': { backgroundColor: '#031a45' }
        }}
      >
        Download
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleDownload('csv')}>Download as CSV</MenuItem>
        <MenuItem onClick={() => handleDownload('excel')}>Download as Excel</MenuItem>
        <MenuItem onClick={() => handleDownload('pdf')}>Download as PDF</MenuItem>
      </Menu>
    </div>
  );
};

// --- Form1_menus Main Component ---

function Form1_menus() {
  const [activeTab, setActiveTab] = useState(0);
  const [keyplotData, setKeyplotData] = useState(null);
  const [farmerData, setFarmerData] = useState(null); 
  const [cropData, setCropData] = useState([]); 
  const [irrigationData, setIrrigationData] = useState([]); 
  const [landUtilizationData, setLandUtilizationData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sorting and Filtering States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const KEYPLOT_ID = 'db537d81-e8d5-45f4-82d5-fd12d9026bc5';
  const CLUSTER_ID_63 = '63';
  const IRRIGATION_CLUSTER_ID_108 = '108';

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm('');
    setOrder('asc');
    setOrderBy('');
  };

  // Sorting Handler
  const handleSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter Handler
  const handleFilter = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  // Download Handler
  const handleDownload = (format, data, filename) => {
    console.log(`Downloading ${filename} as ${format}`);
    // Here you would implement actual download logic
    // For now, we'll just show an alert
    alert(`Downloading ${filename} as ${format} format`);
    
    // Example implementation for CSV:
    if (format === 'csv') {
      // Convert data to CSV and trigger download
      // const csvContent = convertToCSV(data);
      // const blob = new Blob([csvContent], { type: 'text/csv' });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `${filename}.csv`;
      // link.click();
    }
  };

  // API Fetch Functions (same as before)
  const fetchKeyplotDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;

      const response = await axios.get(`${BASE_URL}/btr-service/key-plots/fetch-by-keyplotsdetails/${KEYPLOT_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (data && data.payload) {
        setKeyplotData({
          ...data.payload,
          plot_no: 'N/A (API Field Missing)', 
          area: 'N/A (API Field Missing)',
          location: 'N/A (API Field Missing)',
        });
      } else {
        throw new Error('Invalid Keyplot API response structure or empty payload.');
      }

    } catch (err) {
      console.error('Error fetching keyplot details:', err);
      setError(`Failed to fetch Keyplot details. ${err.message}`);
      setKeyplotData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCropDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;

      const response = await axios.get(`${BASE_URL}/earas-form1-entry/crop-details/fetch-by-clusterId/${CLUSTER_ID_63}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (data && Array.isArray(data.payload)) {
        setCropData(data.payload);
      } else {
        throw new Error('Invalid Crop API response structure or payload is not an array.');
      }
    } catch (err) {
      console.error('Error fetching crop details:', err);
      setCropData([]);
    }
  };

  const fetchIrrigationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;

      const response = await axios.get(`${BASE_URL}/earas-form1-entry/irrigation-details/fetch-by-clusterId/${IRRIGATION_CLUSTER_ID_108}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (data && Array.isArray(data.payload)) {
        setIrrigationData(data.payload);
      } else {
        throw new Error('Invalid Irrigation API response structure or payload is not an array.');
      }
    } catch (err) {
      console.error('Error fetching irrigation details:', err);
      setIrrigationData([]);
    }
  };

  const fetchLandUtilizationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;

      const response = await axios.get(`${BASE_URL}/earas-form1-entry/land-utilization-details/fetch-by-clusterId/${CLUSTER_ID_63}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (data && Array.isArray(data.payload)) {
        setLandUtilizationData(data.payload);
      } else {
        throw new Error('Invalid Land Utilization API response structure or payload is not an array.');
      }
    } catch (err) {
      console.error('Error fetching Land Utilization details:', err);
      setLandUtilizationData([]);
    }
  };

  const fetchOtherDetails = () => {
    setFarmerData({ id: 1, name: 'Ravi Kumar', age: 45, contact: '9876543210', aadhaar: '1234-5678-9012' });
  };

  const refreshData = () => {
    fetchKeyplotDetails();
    fetchCropDetails(); 
    fetchIrrigationDetails(); 
    fetchLandUtilizationDetails();
    fetchOtherDetails();
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Enhanced Loading Component
  const renderLoading = () => (
    <Box sx={{ width: '100%', p: 3 }}>
      <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
      <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
        Loading data...
      </Typography>
    </Box>
  );

  // Enhanced Error Component
  const renderError = () => (
    <Alert 
      severity="error" 
      action={
        <Button color="inherit" size="small" onClick={refreshData}>
          Retry
        </Button>
      }
      sx={{ mb: 2 }}
    >
      {error}
    </Alert>
  );

  // 1. Enhanced Keyplot Details with Download
  const renderKeyplotDetails = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (!keyplotData) return <Alert severity="warning">No keyplot data available.</Alert>;

    return (
      <Card sx={{ border: `1px solid #e0e0e0`, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <DetailItem label="Owner Name" value={keyplotData?.owner_name} />
            <DetailItem label="Contact Number" value={keyplotData?.phone_number} />
            <DetailItem label="Plot No" value={keyplotData?.plot_no} />
            <DetailItem label="Area" value={keyplotData?.area} />
            <DetailItem label="Location" value={keyplotData?.location} />
            <DetailItem label="Address" value={keyplotData?.address} />
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <DownloadMenu 
              onDownload={(format) => handleDownload(format, keyplotData, 'keyplot-details')}
            />
            {/* <Button 
              variant="outlined" 
              startIcon={<Visibility />}
            >
              View Full Details
            </Button> */}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // 2. Enhanced Farmer Details with Download
  const renderFarmerDetails = () => {
    if (!farmerData) return <Alert severity="warning">No farmer data available.</Alert>;

    return (
      <Card sx={{ border: `1px solid #e0e0e0`, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <DetailItem label="Name" value={farmerData?.name} />
            <DetailItem label="Age" value={farmerData?.age} />
            <DetailItem label="Contact" value={farmerData?.contact} />
            <DetailItem label="Aadhaar No." value={farmerData?.aadhaar} />
            <DetailItem label="Record ID" value={farmerData?.id} />
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DownloadMenu 
              onDownload={(format) => handleDownload(format, farmerData, 'farmer-details')}
            />
            {/* <Chip label="Active Farmer" color="success" variant="outlined" /> */}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // 3. Enhanced Crop Details with Sorting, Filtering and Download
  const renderCropDetails = () => {
    if (isLoading && activeTab === 2) return renderLoading();
    if (!cropData || cropData.length === 0) return <Alert severity="warning">No Crop details found for this cluster.</Alert>;

    const columns = [
      { id: 'clusterLabel', label: 'Cluster Label', sortable: true },
      { id: 'seasonId', label: 'Season ID', sortable: true },
      { id: 'cropTypeId', label: 'Crop Type ID', sortable: true },
      { id: 'cropId', label: 'Crop ID', sortable: true },
      { id: 'cropArea', label: 'Area', sortable: true, numeric: true },
      { id: 'isIrrigated', label: 'Irrigation Status', sortable: true },
    ];

    // Flatten and filter data
    const flattenedData = cropData.flatMap((cluster) => 
      cluster.crops.map((crop) => ({
        ...crop,
        clusterLabel: cluster.clusterLabel,
        seasonId: cluster.seasonId,
        cropTypeId: cluster.cropTypeId,
      }))
    );

    const filteredData = flattenedData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );

    const sortedData = filteredData.sort((a, b) => {
      if (orderBy) {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (order === 'asc') {
          return aValue < bValue ? -1 : 1;
        }
        return aValue > bValue ? -1 : 1;
      }
      return 0;
    });

    const totalArea = sortedData.reduce((sum, item) => sum + item.cropArea, 0);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <SearchFilter onFilter={handleFilter} placeholder="Search crops..." />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip> */}
            <DownloadMenu 
              onDownload={(format) => handleDownload(format, sortedData, 'crop-details')}
            />
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', boxShadow: 1 }}>
          <Table aria-label="crop details table" size="small">
            <EnhancedTableHead 
              columns={columns} 
              order={order} 
              orderBy={orderBy} 
              onSort={handleSort}
            />
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow 
                  key={`${row.id}-${index}`}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  <TableCell>
                    <Chip label={row.clusterLabel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{row.seasonId}</TableCell>
                  <TableCell>{row.cropTypeId}</TableCell>
                  <TableCell>{row.cropId}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {row.cropArea.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {row.isIrrigated ? (
                      <Chip 
                        icon={<Circle sx={{ fontSize: 12 }} />} 
                        label="Irrigated" 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    ) : (
                      <Chip 
                        icon={<Close sx={{ fontSize: 12 }} />} 
                        label="Not Irrigated" 
                        size="small" 
                        color="error" 
                        variant="outlined" 
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Summary Row */}
              <TableRow sx={{ backgroundColor: '#e8f5e9', borderTop: '2px solid #388e3c' }}>
                <TableCell colSpan={4} align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Area:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {totalArea.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Showing {sortedData.length} of {flattenedData.length} records
          </Typography>
          {/* <Chip 
            label={`Total Clusters: ${cropData.length}`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          /> */}
        </Box>
      </Box>
    );
  };

  // 4. Enhanced Irrigation Details with Download
  const renderIrrigationDetails = () => {
    if (isLoading && activeTab === 3) return renderLoading();
    if (!irrigationData || irrigationData.length === 0) return <Alert severity="warning">No Irrigation details found for this cluster.</Alert>;

    // Flatten data for filtering
    const flattenedData = irrigationData.flatMap((cluster) => 
      cluster.irrigatedSources.flatMap((sourceItem) => 
        sourceItem.irrigatedSources.map((source) => ({
          clusterLabel: cluster.clusterLabel,
          irrigationType: source.irrigationType,
          irrigatedArea: sourceItem.irrigatedArea,
          sourceCount: sourceItem.sourceCount,
        }))
      )
    );

    const filteredData = flattenedData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <SearchFilter onFilter={handleFilter} placeholder="Search irrigation sources..." />
          <DownloadMenu 
            onDownload={(format) => handleDownload(format, filteredData, 'irrigation-details')}
          />
        </Box>

        <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', boxShadow: 1 }}>
          <Table aria-label="irrigation details table" size="small">
            <TableHead sx={{ backgroundColor: TABLE_HEADER_BG }}>
              <TableRow>
                <TableCell sx={{ color: TABLE_HEADER_COLOR, fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Cluster Label</TableCell>
                <TableCell sx={{ color: TABLE_HEADER_COLOR, fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Source Type</TableCell>
                <TableCell align="right" sx={{ color: TABLE_HEADER_COLOR, fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Irrigated Area</TableCell>
                <TableCell align="center" sx={{ color: TABLE_HEADER_COLOR, fontWeight: 'bold' }}>Source Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  <TableCell>
                    <Chip label={item.clusterLabel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Circle sx={{ fontSize: 8, color: ACCENT_COLOR, mr: 1 }} />
                      {item.irrigationType}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {item.irrigatedArea.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.sourceCount} 
                      size="small" 
                      color="primary" 
                      variant="filled"
                      sx={{ minWidth: 40 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              
              <TableRow sx={{ backgroundColor: '#e3f2fd', borderTop: '2px solid #1976d2' }}>
                <TableCell colSpan={2} align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Irrigated Area:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    {filteredData.reduce((sum, item) => sum + item.irrigatedArea, 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // 5. Enhanced Land Utilization Details with Working Filter and Fixed Header
  const renderLandUtilizationDetails = () => {
    if (isLoading && activeTab === 4) return renderLoading();
    if (!landUtilizationData || landUtilizationData.length === 0) return <Alert severity="warning">No Land Utilization details found for this cluster.</Alert>;

    const areaFields = [
      'netAreasSown', 'barrenArea', 'nonAgriculturalArea', 'buildingArea', 
      'miscellaneousTreesArea', 'permanentPasturesArea', 'cultivableWasteArea', 
      'otherFallowArea', 'currentFallowArea', 'areaUnderSocialForestry', 
      'waterloggedArea', 'stillWaterLand', 'marshyLand',
    ];

    // Filter data based on search term
    const filteredData = landUtilizationData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );

    const totals = areaFields.reduce((acc, field) => {
      acc[field] = filteredData.reduce((sum, item) => sum + item[field], 0).toFixed(2);
      return acc;
    }, {});

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <SearchFilter onFilter={handleFilter} placeholder="Search land utilization..." />
          <DownloadMenu 
            onDownload={(format) => handleDownload(format, filteredData, 'land-utilization-details')}
          />
        </Box>

        <TableContainer 
          component={Paper} 
          sx={{ 
            border: '1px solid #e0e0e0', 
            boxShadow: 1,
            maxHeight: 600,
            overflow: 'auto'
          }}
        >
          <Table 
            aria-label="land utilization table" 
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell 
                  rowSpan={2} 
                  sx={{ 
                    backgroundColor: TABLE_HEADER_BG, 
                    color: TABLE_HEADER_COLOR, 
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    minWidth: 120
                  }}
                >
                  Cluster
                </TableCell>
                <TableCell 
                  colSpan={5} 
                  align="center" 
                  sx={{ 
                    backgroundColor: TABLE_HEADER_BG, 
                    color: TABLE_HEADER_COLOR, 
                    fontWeight: 'bold',
                    borderRight: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  Cultivated / Fallow
                </TableCell>
                <TableCell 
                  colSpan={8} 
                  align="center" 
                  sx={{ 
                    backgroundColor: TABLE_HEADER_BG, 
                    color: TABLE_HEADER_COLOR, 
                    fontWeight: 'bold' 
                  }}
                >
                  Non-Cultivable / Other Use
                </TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: TABLE_HEADER_BG }}>
                {[
                  'Net Areas Sown', 'Current Fallow', 'Other Fallow', 'Cultivable Waste', 'Permanent Pastures',
                  'Barren Area', 'Non-Agri Area', 'Building Area', 'Misc. Trees Area', 
                  'Social Forestry', 'Waterlogged', 'Still Water', 'Marshy Land'
                ].map((header, index) => (
                  <TableCell
                    key={header}
                    align="right"
                    sx={{
                      color: TABLE_HEADER_COLOR,
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      background:'#04255e',
                      borderRight: index < 12 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      whiteSpace: 'nowrap',
                      px: 1
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((lu, index) => (
                <TableRow 
                  key={lu.luId}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                      borderRight: '1px solid #e0e0e0',
                      minWidth: 120
                    }}
                  >
                    <Chip label={lu.clusterLabel} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">{lu.netAreasSown.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.currentFallowArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.otherFallowArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.cultivableWasteArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.permanentPasturesArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.barrenArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.nonAgriculturalArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.buildingArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.miscellaneousTreesArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.areaUnderSocialForestry.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.waterloggedArea.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.stillWaterLand.toFixed(2)}</TableCell>
                  <TableCell align="right">{lu.marshyLand.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              
              {/* Summary Row */}
              <TableRow sx={{ backgroundColor: '#e8f5e9', borderTop: '2px solid #388e3c' }}>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  position: 'sticky', 
                  left: 0, 
                  backgroundColor: '#e8f5e9',
                  borderRight: '1px solid #e0e0e0'
                }}>
                  <Typography variant="subtitle1" fontWeight="bold">TOTALS</Typography>
                </TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.netAreasSown}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.currentFallowArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.otherFallowArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.cultivableWasteArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.permanentPasturesArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.barrenArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.nonAgriculturalArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.buildingArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.miscellaneousTreesArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.areaUnderSocialForestry}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.waterloggedArea}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.stillWaterLand}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1" fontWeight="bold">{totals.marshyLand}</Typography></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Showing {filteredData.length} of {landUtilizationData.length} records
          </Typography>
          <Chip 
            label={`Total Areas: ${filteredData.length}`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </Box>
    );
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ color: TABLE_HEADER_BG, fontWeight: 'bold' }}>
            Form 1 Details Viewer
          </Typography>
          {/* <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={refreshData}
            disabled={isLoading}
          >
            Refresh All
          </Button> */}
        </Box>

        <MainCard 
          title=""
          sx={{ 
            border: `1px solid #e0e0e0`,
            boxShadow: 3
          }}
        >
          {error && renderError()}
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail tabs"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.875rem',
                minWidth: 120
              },
              '& .Mui-selected': {
                color: TABLE_HEADER_BG + '!important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: TABLE_HEADER_BG,
                height: 3
              }
            }}
          >
            <Tab label="Keyplot Details" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Farmer Details" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Crop Details" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Irrigation Details" id="tab-3" aria-controls="tabpanel-3" />
            <Tab label="Land Utilization" id="tab-4" aria-controls="tabpanel-4" />
          </Tabs>
          <Divider sx={{ mb: 2 }} />

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            {renderKeyplotDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {renderFarmerDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {renderCropDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {renderIrrigationDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            {renderLandUtilizationDetails()}
          </TabPanel>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default Form1_menus;
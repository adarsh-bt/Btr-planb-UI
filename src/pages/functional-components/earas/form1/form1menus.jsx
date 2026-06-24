import React, { useState, useEffect ,useCallback} from 'react';
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
  MenuItem,CardHeader,Stack,CircularProgress
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import EventIcon from "@mui/icons-material/Event";
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi'; 
import axios from 'axios';
import GrassIcon from '@mui/icons-material/Grass';
import WaterIcon from '@mui/icons-material/Water';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import api from 'api/api';
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

  // const handleDownload = (format) => {
  //   onDownload(format);
  //   handleClose();
  // };

  // return (
  //   <div>
  //     <Button
  //       variant="contained"
  //       startIcon={<GetApp />}
  //       onClick={handleClick}
  //       sx={{ 
  //         backgroundColor: TABLE_HEADER_BG,
  //         '&:hover': { backgroundColor: '#031a45' }
  //       }}
  //     >
  //       Downloadss
  //     </Button>
  //     <Menu
  //       anchorEl={anchorEl}
  //       open={Boolean(anchorEl)}
  //       onClose={handleClose}
  //     >
  //       <MenuItem onClick={() => handleDownload('csv')}>Download as CSV</MenuItem>
  //       <MenuItem onClick={() => handleDownload('excel')}>Download as Excel</MenuItem>
  //       <MenuItem onClick={() => handleDownload('pdf')}>Download as PDF</MenuItem>
  //     </Menu>
  //   </div>
  // );
};

// --- Form1_menus Main Component ---

function Form1_menus() {
  const [syNo, setSyNo] = useState('');
    const [slNo, setSLNo] = useState('');
    const [keyplotId, setKeyplotId] = useState('');
    const [keyplotSubNo, setKeyplotSubNo] = useState('');
    const [clusterId, setClusterId] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [keyplotData, setKeyplotData] = useState(null);
  const [farmerData, setFarmerData] = useState(null); 
  const [cropData, setCropData] = useState([]); 
  const [irrigationData, setIrrigationData] = useState([]); 
  const [landUtilizationData, setLandUtilizationData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seasonId, setSeasonId] = useState(1); 
const [nucData, setNucData] = useState([]);
const [availableSeasons, setAvailableSeasons] = useState([]);
const [availableCropSeasons, setAvailableCropSeasons] = useState([]);
  // Sorting and Filtering States
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [districtId, setDistrictId] = useState(null);
  const [zonename , setZonename] = useState('');

  const [isCropLoading, setIsCropLoading] = useState(false);
const [cropFetchError, setCropFetchError] = useState(null);
const [seasonSwitchPending, setSeasonSwitchPending] = useState(false);

 const [isDownloading, setIsDownloading] = useState(false);

const StyledDetailItem = ({ label, value, icon }) => (
  <Stack spacing={0.5}>
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography 
        variant="caption" 
        fontWeight={700} 
        color="text.secondary" 
        sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
      >
        {label}
      </Typography>
    </Stack>
    <Box sx={{ pl: 3.2 }}>
      {value}
    </Box>
  </Stack>
);

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
   
    // Here you would implement actual download logic
    // For now, we'll just show an alert
    // alert(`Downloading ${filename} as ${format} format`);
    
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
   useEffect(() => {
  const urlParams = new URLSearchParams(location.search);
  const syNoFromURL = urlParams.get('No');
  const slnoFromURL = urlParams.get('slno');
  setKeyplotId(syNoFromURL);
  
  if (syNoFromURL) {
    setSyNo(decodeURIComponent(syNoFromURL));
    if (slnoFromURL) {
      setSLNo(decodeURIComponent(slnoFromURL));
      setKeyplotSubNo(decodeURIComponent(slnoFromURL));
    }
    fetchKeyplotDetails(syNoFromURL); // this sets clusterId
  }
}, [location.search]);

// once clusterId is available, load dependent data
useEffect(() => {
  if (clusterId) {
    // fetchCropDetails();
    fetchIrrigationDetails();
    fetchLandUtilizationDetails();
    fetchOtherDetails();
  }
}, [clusterId]);
useEffect(() => {
  if (clusterId && seasonId) {
    fetchCropDetails();
  }
}, [seasonId, clusterId]);


// const testPdfDownload = async () => {
//   try {
//     const response = await api.get(
//       '/earas-form1-entry/api/download/excel',
//       {
//         responseType: 'blob', // ✅ MUST
//       }
//     );

//     // ✅ Correct MIME type for Excel
//     const blob = new Blob([response.data], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     });

//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'land_use_survey_template.xlsx'; // ✅ Correct file name
//     document.body.appendChild(a);
//     a.click();

//     a.remove();
//     window.URL.revokeObjectURL(url);

//   } catch (error) {
//     console.error("Download failed:", error);
//   }
// };


  // API Fetch Functions (same as before)

const testExcelDownload = async () => {
  if (isDownloading) return; // Prevent multiple clicks
  
  setIsDownloading(true);
  
  try {
    const response = await api.get(
      `/earas-form1-entry/api/download/excel/${clusterId}`,
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob(
      [response.data],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'form_1_report.xlsx';

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    // Optional: Add error toast/notification here
  } finally {
    setIsDownloading(false);
  }
};

 const fetchKeyplotDetails = async (idFromUrl) => {
  setIsLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('token');
    const BASE_URL = mainapi.BASE_URL;

    const response = await api.get(
      `${BASE_URL}/btr-service/key-plots/fetch-by-keyplotsdetails/${idFromUrl}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );


      const data = response.data;
      const districtId = response.data?.payload?.distId;
      setDistrictId(districtId);
      setZonename(response.data?.payload?.zoneName || 'N/A');
  
   
      if (data && data.payload) {
        setKeyplotData({
          ...data.payload,
          plot_no: 'N/A (Field Missing)', 
          
          location: 'N/A (Field Missing)',
        });
        setClusterId(data.payload.cluster_id);
  
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

const fetchCropDetails = useCallback(async (seasonOverride = null) => {
  const targetSeason = seasonOverride !== null ? seasonOverride : seasonId;
  const currentClusterId = clusterId;
  const currentDistrictId = districtId;
  
  // Prevent duplicate requests
  if (!currentClusterId || !currentDistrictId || !targetSeason) {
    console.log('Missing required params:', { clusterId: currentClusterId, districtId: currentDistrictId, seasonId: targetSeason });
    return;
  }

  setIsCropLoading(true);
  setCropFetchError(null);
  
  try {
    const token = localStorage.getItem('token');
    const BASE_URL = mainapi.BASE_URL;

    console.log('Fetching crop details:', { clusterId: currentClusterId, seasonId: targetSeason, districtId: currentDistrictId });

    const response = await axios.get(
      `${BASE_URL}/earas-form1-entry/crop-details/fetch-by-clusterId/${currentClusterId}/season/${targetSeason}/district/${currentDistrictId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const data = response.data;

    // Verify we're still on the same season before updating state
    if (seasonOverride !== null ? seasonOverride === seasonId : true) {
      if (data?.payload && Array.isArray(data.payload) && data.payload.length > 0) {
        setCropData(data.payload);
        setCropFetchError(null);
      } else {
        setCropData([]);
        if (data?.payload && data.payload.length === 0) {
          setCropFetchError(`No crop data available for ${getSeasonLabel(targetSeason)} season.`);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching crop details:', err);
    if (seasonOverride !== null ? seasonOverride === seasonId : true) {
      setCropData([]);
      setCropFetchError(
        err.response?.status === 404 
          ? `No crop data found for ${getSeasonLabel(targetSeason)} season.`
          : `Failed to load crop data: ${err.message}`
      );
    }
  } finally {
    if (seasonOverride !== null ? seasonOverride === seasonId : true) {
      setIsCropLoading(false);
      setSeasonSwitchPending(false);
    }
  }
}, [clusterId, districtId, seasonId]);



const handleSeasonChange = useCallback(async (newSeasonId) => {
  if (newSeasonId === seasonId || seasonSwitchPending) return;
  
  setSeasonSwitchPending(true);
  setSeasonId(newSeasonId);
  
  // Clear current data immediately to show loading state
  setCropData([]);
  setCropFetchError(null);
  
  // Fetch with the new season
  try {
    const token = localStorage.getItem('token');
    const BASE_URL = mainapi.BASE_URL;
    
    const response = await axios.get(
      `${BASE_URL}/earas-form1-entry/crop-details/fetch-by-clusterId/${clusterId}/season/${newSeasonId}/district/${districtId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const data = response.data;
    
    if (data?.payload && Array.isArray(data.payload)) {
      setCropData(data.payload);
      if (data.payload.length === 0) {
        setCropFetchError(`No crop data available for ${getSeasonLabel(newSeasonId)} season.`);
      } else {
        setCropFetchError(null);
      }
    } else {
      setCropData([]);
      setCropFetchError(`No crop data available for ${getSeasonLabel(newSeasonId)} season.`);
    }

  } catch (err) {
    console.error('Error fetching crop details:', err);
    setCropData([]);
    setCropFetchError(
      err.response?.status === 404 
        ? `No crop data found for ${getSeasonLabel(newSeasonId)} season.`
        : `Failed to load crop data. Please try again.`
    );
  } finally {
    setIsCropLoading(false);
    setSeasonSwitchPending(false);
  }
}, [clusterId, districtId, seasonId, seasonSwitchPending]);

// Improved useEffect for initial load
useEffect(() => {
  if (clusterId && districtId && seasonId) {
    fetchCropDetails();
  }
}, [clusterId, districtId]); // Only re-run when cluster or district changes

// Separate useEffect for seasonId changes
useEffect(() => {
  if (clusterId && districtId && seasonId) {
    handleSeasonChange(seasonId);
  }
}, [seasonId]); // This will trigger when seasonId changes

// Improved checkAvailableCropSeasons with better error handling
const checkAvailableCropSeasons = useCallback(async () => {
  if (!clusterId || !districtId) return;
  
  const seasons = [1, 2, 3];
  const available = [];
  
  for (const season of seasons) {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;
      
      const response = await axios.get(
        `${BASE_URL}/earas-form1-entry/crop-details/fetch-by-clusterId/${clusterId}/season/${season}/district/${districtId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data && Array.isArray(response.data.payload) && response.data.payload.length > 0) {
        available.push({
          id: season,
          name: season === 1 ? 'Autumn' : season === 2 ? 'Winter' : 'Summer'
        });
      }
    } catch (err) {
      console.log(`No crop data for season ${season}:`, err.message);
    }
  }
  
  setAvailableCropSeasons(available);
  
  // If current season has no data and there are available seasons, switch to first available
  if (available.length > 0 && !available.some(s => s.id === seasonId)) {
    setSeasonId(available[0].id);
  }
}, [clusterId, districtId, seasonId]);
  const fetchIrrigationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;

      const response = await axios.get(`${BASE_URL}/earas-form1-entry/irrigation-details/fetch-by-clusterId/${clusterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
console.log('Irrigation Details API response:', data);
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

      const response = await axios.get(`${BASE_URL}/earas-form1-entry/land-utilization-details/fetch-by-clusterId/${clusterId}`, {
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

const fetchNucDetails = async (season = seasonId) => {
  try {
    const token = localStorage.getItem('token');
    const BASE_URL = mainapi.BASE_URL;
    
 
    
    const response = await axios.get(
      `${BASE_URL}/earas-form1-entry/nuc-details/fetch-by-clusterId/${clusterId}/season/${season}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
   
    
  if (data && Array.isArray(data.payload) && data.payload.length > 0) {
  setNucData(data.payload);   // now it's a list
  setError(null);
} else {
  setNucData([]);             // use empty array instead of null
  setError("No NUC data available for this season.");
}
  } catch (err) {
    console.error('Error fetching NUC details:', err);
    setNucData(null);
    setError(`Failed to fetch NUC details for season ${season}. Try another season.`);
  }
};

const renderBtrDetails = () => {
  const plotNo =
    keyplotData?.plotno &&
    keyplotData.plotno !== 'null/'
      ? keyplotData.plotno
      : null;

  switch (keyplotData?.btrTypeId) {
    case 1:
      return (
        <DetailItem
          label="Survey & Sub Division No"
          value={plotNo || 'N/A'}
        />
      );

    case 2:
      return (
        <>
          <DetailItem
            label="Ward No"
            value={keyplotData?.wardno || 'N/A'}
          />
          <DetailItem
            label="House No"
            value={keyplotData?.houseno || 'N/A'}
          />
        </>
      );

    case 3:
      return (
        <>
          <DetailItem
            label="Cultivate Name"
            value={keyplotData?.cultivateName || 'N/A'}
          />

          <DetailItem
            label="Cultivate Area"
            value={
              keyplotData?.cultivateArea
                ? `${keyplotData.cultivateArea} cent`
                : 'N/A'
            }
          />
        </>
      );

    case 4:
      return (
        <DetailItem
          label="TP No / TP Sub Division No"
          value={`${keyplotData?.tpno || 'N/A'}/${keyplotData?.tpsubdivno || 'N/A'}${
            plotNo ? ` (Survey : ${plotNo})` : ''
          }`}
        />
      );

    case 5:
      return (
        <DetailItem
          label="Old Survey / Old Sub Division No"
          value={`${keyplotData?.oldSurvey || 'N/A'}/${keyplotData?.oldSubDivNo || 'N/A'}${
            plotNo ? ` (Survey : ${plotNo})` : ''
          }`}
        />
      );

    default:
      return (
        <DetailItem
          label="Details"
          value="N/A"
        />
      );
  }
};
const getSeasonLabel = (seasonId) =>
  seasonId === 1 ? "Autumn" :
  seasonId === 2 ? "Winter" : "Summer";
// Function to check available seasons
const checkAvailableSeasons = async () => {
  const seasons = [1, 2, 3]; // Autumn, Winter, Summer
  const available = [];
  
  for (const season of seasons) {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = mainapi.BASE_URL;

      const response = await axios.get(
        `${BASE_URL}/earas-form1-entry/nuc-details/fetch-by-clusterId/${clusterId}/season/${season}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.payload) {
        available.push({
          id: season,
          name: season === 1 ? 'Autumn' : season === 2 ? 'Winter' : 'Summer'
        });
      }
    } catch (err) {
      console.log(`No data for season ${season}`);
    }
  }
  
  setAvailableSeasons(available);
  
  // Set default season to first available if current season has no data
  if (available.length > 0 && !available.some(s => s.id === seasonId)) {
    setSeasonId(available[0].id);
    fetchNucDetails(available[0].id);
  }
};

// const checkAvailableCropSeasons = async () => {
//   const seasons = [1, 2, 3]; // Autumn, Winter, Summer
//   const available = [];
  
//   for (const season of seasons) {
//     try {
//       const token = localStorage.getItem('token');
//       const BASE_URL = mainapi.BASE_URL;
//       const distId = localStorage.getItem('activeDistId');
      
//       const response = await axios.get(
//         `${BASE_URL}/earas-form1-entry/crop-details/fetch-by-clusterId/${clusterId}/season/${season}/district/${districtId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data && Array.isArray(response.data.payload) && response.data.payload.length > 0) {
//         available.push({
//           id: season,
//           name: season === 1 ? 'Autumn' : season === 2 ? 'Winter' : 'Summer'
//         });
//       }
//     } catch (err) {
//       console.log(`No crop data for season ${season}:`, err.message);
//     }
//   }
  
//   setAvailableCropSeasons(available);
  
//   // Set default season to first available season
//   if (available.length > 0 && !available.some(s => s.id === seasonId)) {
//     setSeasonId(available[0].id);
//   }
// };

// Update useEffect to check available seasons
useEffect(() => {
  if (clusterId) {
    fetchCropDetails();
    checkAvailableSeasons(); // Check which seasons have data
  }
}, [clusterId]);
// Update useEffect to fetch NUC data
useEffect(() => {
  if (clusterId && seasonId) {
    fetchCropDetails();
    fetchNucDetails(); // Add this line
  }
}, [seasonId, clusterId]);

  const fetchOtherDetails = () => {
    setFarmerData({ id: 1, name: 'Ravi Kumar', age: 45, contact: '9876543210', aadhaar: '1234-5678-9012' });
  };

  useEffect(() => {
  if (clusterId) {
    checkAvailableCropSeasons();
  }
}, [clusterId]);

  // Define all seasons clearly
  const ALL_SEASONS = [
    { id: 1, name: 'Autumn' },
    { id: 2, name: 'Winter' },
    { id: 3, name: 'Summer' }
  ];

  // Enhanced Loading Component
  const renderLoading = () => (
    <Box sx={{ width: '100%', p: 3 }}>
      <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
      <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
        Loading data...
      </Typography>
    </Box>
  );


  // 1. Enhanced  with Download
  const renderKeyplotDetails = () => {
    if (isLoading) return renderLoading();
    // if (error) return renderError();
    if (!keyplotData) return <Alert severity="warning">No keyplot data available.</Alert>;

    return (
      <Card sx={{ border: `1px solid #e0e0e0`, boxShadow: 2 }}>
        <CardContent>
         BTR Type : <Chip label={`${keyplotData.btrTypeName || 'N/A'}`} color="success" />
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3} mt={1}>
           
            <DetailItem label="Owner Name" value={keyplotData?.owner_name} />
            <DetailItem label="Contact Number" value={keyplotData?.phone_number} />
            {renderBtrDetails()}
            <DetailItem label="Area" value={keyplotData?.area+" cent"} />
            <DetailItem
  label="Location"
  value={
    keyplotData?.geocoordinate ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">
          {keyplotData.geocoordinate}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          href={`https://www.google.com/maps?q=${keyplotData.geocoordinate}`}
          target="_blank"
        >
          View Map
        </Button>
      </Box>
    ) : 'N/A'
  }
/>

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

const renderCropDetails = () => {
  // Show loading state immediately when switching seasons or initial load
  if (isCropLoading || seasonSwitchPending) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ height: 4, borderRadius: 2, mb: 2 }} />
        <Typography variant="body2" align="center" color="text.secondary">
          Loading crop data for {getSeasonLabel(seasonId)} season...
        </Typography>
      </Box>
    );
  }
  
  // Show error state if fetch failed
  if (cropFetchError) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
              SELECT VIEWING SEASON:
            </Typography>
            <Stack direction="row" spacing={2}>
              {ALL_SEASONS.map((s) => (
                <Button
                  key={s.id}
                  variant={seasonId === s.id ? "contained" : "outlined"}
                  onClick={() => handleSeasonChange(s.id)}
                  disabled={seasonSwitchPending}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    backgroundColor: seasonId === s.id ? TABLE_HEADER_BG : 'transparent',
                    borderColor: seasonId === s.id ? TABLE_HEADER_BG : 'divider',
                    '&:hover': {
                      backgroundColor: seasonId === s.id ? '#031a45' : '#f5f5f5'
                    }
                  }}
                >
                  {s.name}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>
        <Alert 
          severity="info" 
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => handleSeasonChange(seasonId)}>
              Retry
            </Button>
          }
        >
          {cropFetchError}
        </Alert>
      </Box>
    );
  }
  

  if (!cropData || cropData.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
              SELECT VIEWING SEASON:
            </Typography>
            <Stack direction="row" spacing={2}>
              {ALL_SEASONS.map((s) => (
                <Button
                  key={s.id}
                  variant={seasonId === s.id ? "contained" : "outlined"}
                  onClick={() => handleSeasonChange(s.id)}
                  disabled={seasonSwitchPending}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    backgroundColor: seasonId === s.id ? TABLE_HEADER_BG : 'transparent',
                    borderColor: seasonId === s.id ? TABLE_HEADER_BG : 'divider',
                    '&:hover': {
                      backgroundColor: seasonId === s.id ? '#031a45' : '#f5f5f5'
                    }
                  }}
                >
                  {s.name}
                </Button>
              ))}
            </Stack>
          </Box>
          <SearchFilter onFilter={handleFilter} placeholder="Search crops..." />
          <DownloadMenu 
            onDownload={(format) => handleDownload(format, [], 'crop-details')}
          />
        </Box>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          No crop details found for {getSeasonLabel(seasonId)} season. Please try another season.
        </Alert>
      </Box>
    );
  }


 const columns = [
    { id: 'clusterLabel', label: 'Cluster Label', sortable: true },
    { id: 'seasonName', label: 'Season Name', sortable: true },
    { id: 'cropName', label: 'Crop Name', sortable: true },
    { id: 'cropType', label: 'Crop Type', sortable: true },
    { id: 'cropArea', label: 'Area', sortable: true, numeric: true },
    { id: 'centPerTree', label: 'Count', sortable: true, numeric: true },
    { id: 'isIrrigated', label: 'Irrigation Status', sortable: true },
  ];

  // Flatten and filter data
  const flattenedData = cropData.flatMap((cluster) => 
    (cluster.crops || []).map((crop) => ({
      ...crop,
      clusterLabel: cluster.clusterLabel,
      seasonId: cluster.seasonId,
      cropTypeId: cluster.cropTypeId,
      seasonName: crop.season || getSeasonLabel(seasonId),
      cropName: crop.cropNameEn || crop.cropName || 'N/A',
      cropStage: crop.cropGrowthStage || 'N/A',
      cropType: crop.cropType || 'N/A',
    }))
  );

  const filteredData = flattenedData.filter(item =>
    Object.values(item).some(value =>
      String(value || '').toLowerCase().includes(searchTerm)
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (orderBy) {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      if (order === 'asc') {
        return aValue < bValue ? -1 : 1;
      }
      return aValue > bValue ? -1 : 1;
    }
    return 0;
  });

  const totalArea = sortedData.reduce((sum, item) => sum + (item.cropArea || 0), 0);

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2, 
          flexWrap: 'wrap', 
          gap: 2 
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
            SELECT VIEWING SEASON:
          </Typography>
          <Stack direction="row" spacing={2}>
            {ALL_SEASONS.map((s) => (
              <Button
                key={s.id}
                variant={seasonId === s.id ? "contained" : "outlined"}
                onClick={() => handleSeasonChange(s.id)}
                disabled={seasonSwitchPending}
                sx={{
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: seasonId === s.id ? TABLE_HEADER_BG : 'transparent',
                  borderColor: seasonId === s.id ? TABLE_HEADER_BG : 'divider',
                  '&:hover': {
                    backgroundColor: seasonId === s.id ? '#031a45' : '#f5f5f5'
                  }
                }}
              >
                {s.name}
              </Button>
            ))}
          </Stack>
        </Box>
       <SearchFilter onFilter={handleFilter} placeholder="Search crops..." />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
           <DownloadMenu 
          onDownload={(format) => handleDownload(format, sortedData, `crop-details-${getSeasonLabel(seasonId)}`)}
        />
      </Box>
      </Box>

      {/* Rest of your existing crop details table code... */}
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
                key={`${row.id || row.cropId || index}-${index}`}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <TableCell>
                  <Chip label={row.clusterLabel || 'N/A'} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{row.seasonName || getSeasonLabel(seasonId)}</TableCell>
                <TableCell>
                  {row.cropName || 'N/A'}
                  {row.cropStage && row.cropStage !== 'N/A' && (
                    <Typography variant="caption" display="block" >
                      Stage: {row.cropStage}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{row.cropType || 'N/A'}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {(row.cropArea != null
                      ? row.centPerTree == null
                        ? Number(row.cropArea).toFixed(2)
                        : (Number(row.cropArea) * Number(row.centPerTree)).toFixed(2)
                      : "0.00")}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {row.centPerTree != null ? Number(row.centPerTree).toFixed(2) : "NA"}
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
         
          </TableBody>
        </Table>
      </TableContainer>
        
        {/* <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Showing {sortedData.length} of {flattenedData.length} records
        </Typography>
        <Chip 
          label={`Total Clusters: ${cropData.length}`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
      </Box> */}
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
          centPerTree: source.centPerTree,
        
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
                      {item.irrigatedArea.toFixed(2) || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.sourceCount || '--'} 
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
                  <Typography variant="subtitle1" fontWeight="bold">TOTAL</Typography>
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
          {/* <Typography variant="caption" color="textSecondary">
            Showing {filteredData.length} of {landUtilizationData.length} records
          </Typography>
          <Chip 
            label={`Total Areas: ${filteredData.length}`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          /> */}
        </Box>
      </Box>
    );
  };
const renderNucDetails = () => {
  // Define all seasons clearly
  // const ALL_SEASONS = [
  //   { id: 1, name: 'Autumn' },
  //   { id: 2, name: 'Winter' },
  //   { id: 3, name: 'Summer' }
  // ];

  const hasData = Array.isArray(nucData) && nucData.length > 0;

  // Calculate totals across all clusters
  const totals = hasData
    ? nucData.reduce(
        (acc, item) => ({
          nucArea: acc.nucArea + (item.nucArea || 0),
          ffsArea: acc.ffsArea + (item.ffsArea || 0),
          cosArea: acc.cosArea + (item.cosArea || 0),
        }),
        { nucArea: 0, ffsArea: 0, cosArea: 0 }
      )
    : { nucArea: 0, ffsArea: 0, cosArea: 0 };

  return (
    <Box>
      {/* 1. Permanent Season Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
          SELECT VIEWING SEASON:
        </Typography>
        <Stack direction="row" spacing={2}>
          {ALL_SEASONS.map((s) => (
            <Button
              key={s.id}
              variant={seasonId === s.id ? "contained" : "outlined"}
              onClick={() => {
                setSeasonId(s.id);
                fetchNucDetails(s.id);
              }}
              sx={{
                px: 4,
                borderRadius: 2,
                fontWeight: 600,
                backgroundColor: seasonId === s.id ? TABLE_HEADER_BG : 'transparent',
                borderColor: seasonId === s.id ? TABLE_HEADER_BG : 'divider',
                '&:hover': {
                  backgroundColor: seasonId === s.id ? '#031a45' : '#f5f5f5'
                }
              }}
            >
              {s.name}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* 2. Summary Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'TOTAL NUC AREA', value: totals.nucArea, color: '#4CAF50', icon: <GrassIcon /> },
          { label: 'TOTAL FFS AREA', value: totals.ffsArea, color: '#2196F3', icon: <WaterIcon /> },
          { label: 'TOTAL COS AREA', value: totals.cosArea, color: '#FF9800', icon: <AgricultureIcon /> }
        ].map((stat, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ 
              borderLeft: `5px solid ${stat.color}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h3" sx={{ color: stat.color, fontWeight: 800, mt: 1 }}>
                      {stat.value.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Cents</Typography>
                  </Box>
                  <Box sx={{ 
                    width: 50, height: 50, borderRadius: '12px', 
                    bgcolor: `${stat.color}15`, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!hasData && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          No records found for the <strong>{getSeasonLabel(seasonId)}</strong> season in this cluster.
        </Alert>
      )}

      {/* 3. Cluster-wise Detailed Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "#fff",
          mb: 4,
          overflow: 'hidden'
        }}
      >
        <CardHeader
          avatar={<StorageIcon sx={{ color: TABLE_HEADER_BG }} />}
          title={
            <Typography variant="subtitle1" fontWeight={700}>
              Cluster-wise Area Distribution - {getSeasonLabel(seasonId)} Season
            </Typography>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              Detailed breakdown by cluster label
            </Typography>
          }
          sx={{ pb: 1, pt: 2, backgroundColor: '#fafafa' }}
        />
        <Divider />
        
        <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    backgroundColor: TABLE_HEADER_BG, 
                    color: TABLE_HEADER_COLOR, 
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    position: 'sticky',
                    left: 0,
                    zIndex: 2
                  }}
                >
                  Cluster Label
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ backgroundColor: TABLE_HEADER_BG, color: TABLE_HEADER_COLOR, fontWeight: 'bold' }}
                >
                  NUC Area (Cents)
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ backgroundColor: TABLE_HEADER_BG, color: TABLE_HEADER_COLOR, fontWeight: 'bold' }}
                >
                  FFS Area (Cents)
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ backgroundColor: TABLE_HEADER_BG, color: TABLE_HEADER_COLOR, fontWeight: 'bold' }}
                >
                  COS Area (Cents)
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ backgroundColor: TABLE_HEADER_BG, color: TABLE_HEADER_COLOR, fontWeight: 'bold' }}
                >
                  Total Area (Cents)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasData && nucData.map((item, index) => {
                const totalArea = (item.nucArea || 0) + (item.ffsArea || 0) + (item.cosArea || 0);
                return (
                  <TableRow 
                    key={item.nucId || index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f0f0f0' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                        borderRight: '1px solid #e0e0e0'
                      }}
                    >
                      <Chip 
                        label={item.clusterLabel} 
                        size="small" 
                        color="primary" 
                        variant="filled"
                        sx={{ fontWeight: 600, minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {(item.nucArea ?? 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {(item.ffsArea ?? 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {(item.cosArea ?? 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {totalArea.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Summary Row */}
              {hasData && (
                <TableRow sx={{ 
                  backgroundColor: '#e8f5e9', 
                  borderTop: '2px solid #388e3c',
                  '&:hover': { backgroundColor: '#e8f5e9' }
                }}>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    position: 'sticky', 
                    left: 0, 
                    backgroundColor: '#e8f5e9',
                    borderRight: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold">TOTAL</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">{totals.nucArea.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">{totals.ffsArea.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">{totals.cosArea.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                      {(totals.nucArea + totals.ffsArea + totals.cosArea).toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* {hasData && (
          <Box sx={{ p: 2, backgroundColor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Chip 
                label={`Total Clusters: ${nucData.length}`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={`Season: ${getSeasonLabel(seasonId)}`} 
                size="small" 
                color="primary" 
                variant="filled"
              />
            </Stack>
          </Box>
        )} */}
      </Card>

      {/* 4. Additional Information Card */}

      {/* <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "#fff",
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '4px',
            backgroundColor: TABLE_HEADER_BG
          }
        }}
      >
        <CardHeader
          avatar={<InfoOutlinedIcon sx={{ color: TABLE_HEADER_BG }} />}
          title={<Typography variant="subtitle1" fontWeight={700}>Additional Information</Typography>}
          sx={{ pb: 1, pt: 2 }}
        />
        <Divider sx={{ mx: 2 }} />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StyledDetailItem
                label="Active Season"
                icon={<EventIcon sx={{ fontSize: 18, color: 'action.active' }} />}
                value={
                  <Chip 
                    size="small" 
                    variant="outlined" 
                    label={getSeasonLabel(seasonId)} 
                    sx={{ fontWeight: 600, bgcolor: 'primary.lighter' }} 
                  />
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StyledDetailItem
                label="Total Clusters"
                icon={<StorageIcon sx={{ fontSize: 18, color: 'action.active' }} />}
                value={
                  <Typography variant="body2" fontWeight={600}>
                    {hasData ? nucData.length : 0} clusters
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StyledDetailItem
                label="Data Status"
                icon={<CheckCircleIcon sx={{ fontSize: 18, color: hasData ? '#4caf50' : '#ff9800' }} />}
                value={
                  <Chip 
                    size="small" 
                    label={hasData ? "Data Available" : "No Data"} 
                    color={hasData ? "success" : "warning"}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                }
              />
            </Grid>

            <Grid item xs={12}>
              <StyledDetailItem
                label="Remarks / Notes"
                icon={<CommentIcon sx={{ fontSize: 18, color: 'action.active' }} />}
                value={
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2, 
                    borderLeft: '4px solid', 
                    borderColor: hasData ? 'primary.main' : 'grey.300', 
                    mt: 1 
                  }}>
                    <Typography variant="body2" color={hasData ? "text.primary" : "text.secondary"} sx={{ fontStyle: hasData ? 'normal' : 'italic' }}>
                      {hasData && nucData.some(item => item.remark) 
                        ? nucData.filter(item => item.remark).map(item => `${item.clusterLabel}: ${item.remark}`).join('; ')
                        : "No specific remarks or notes have been logged for this season."}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card> */}
    </Box>
  );
};
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ color: TABLE_HEADER_BG, fontWeight: 'bold' }}>
            Form 1 Details Viewer : {zonename} 
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
      <Button
  onClick={testExcelDownload}
  disabled={isDownloading || isLoading}
  variant="contained"
  sx={{
    backgroundColor: TABLE_HEADER_BG,
    '&:hover': { backgroundColor: '#031a45' },
    mb: 2,
    position: 'relative'
  }}
>
  {isDownloading ? (
    <>
      <CircularProgress
        size={20}
        sx={{
          color: 'white',
          position: 'absolute',
          left: '50%',
          marginLeft: '-10px'
        }}
      />
      <span style={{ opacity: 0 }}>Downloading...</span>
    </>
  ) : (
    'Download'
  )}
</Button>
      
    
        <MainCard 
          title=""
          sx={{ 
            border: `1px solid #e0e0e0`,
            boxShadow: 3
          }}
        >
          {/* {error && renderError()} */}
          
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
            {/* <Tab label="Farmer Details" id="tab-1" aria-controls="tabpanel-1" /> */}
            <Tab label="Crop Details" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Irrigation Details" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Land Utilization" id="tab-3" aria-controls="tabpanel-3" />
              <Tab label="NUC/FFS/COS" id="tab-4" aria-controls="tabpanel-4" />
          </Tabs>
          <Divider sx={{ mb: 2 }} />

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            {renderKeyplotDetails()}
          </TabPanel>

          {/* <TabPanel value={activeTab} index={1}>
            {renderFarmerDetails()}
          </TabPanel> */}

          <TabPanel value={activeTab} index={1}>
            {renderCropDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {renderIrrigationDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {renderLandUtilizationDetails()}
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            {renderNucDetails()}
        </TabPanel>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default Form1_menus;
// ZoneClusterReport.js
import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  Breadcrumbs,
  Link,
  TextField,
  Stack,
  InputAdornment,
  TablePagination
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import Breadcrumb from 'routes/Breadcrumb';

function ZoneClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtName, talukName } = useParams();
  
  // State for pagination and search
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // State for location details
  const [locationInfo, setLocationInfo] = useState({
    district: '',
    taluk: '',
    totalZones: 0,
    completed: 0,
    ongoing: 0,
    notStarted: 0,
    underReview: 0
  });

  // Sample zone/panchayat data based on district and taluk
  const getZoneData = (district, taluk) => {
    // Enhanced sample data with more entries for pagination demonstration
    const zoneDataMap = {
      'thiruvananthapuram': {
        'neyyattinkara': [
          { id: 1, zone: 'Amaravila', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 2, zone: 'Athiyannur', total: 4, completed: 1, ongoing: 2, notStarted: 0, underReview: 1},
          { id: 3, zone: 'Chenkal', total: 6, completed: 2, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 4, zone: 'Karode', total: 4, completed: 1, ongoing: 1, notStarted: 1, underReview: 1},
          { id: 5, zone: 'Kulam', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 6, zone: 'Parassala', total: 3, completed: 0, ongoing: 1, notStarted: 1, underReview: 1},
          { id: 7, zone: 'Pazhayakunnummel', total: 4, completed: 1, ongoing: 1, notStarted: 1, underReview: 1},
          { id: 8, zone: 'Perumkadavila', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 9, zone: 'Poovar', total: 4, completed: 1, ongoing: 1, notStarted: 1, underReview: 1},
          { id: 10, zone: 'Venganoor', total: 3, completed: 0, ongoing: 1, notStarted: 1, underReview: 1}
        ],
        'kattakada': [
          { id: 1, zone: 'Kattakada', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 2, zone: 'Marayanmuttom', total: 4, completed: 0, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 3, zone: 'Pallichal', total: 6, completed: 2, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 4, zone: 'Vilappil', total: 4, completed: 1, ongoing: 1, notStarted: 1, underReview: 1},
          { id: 5, zone: 'Vithura', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1}
        ],
        'nedumangad': [
          { id: 1, zone: 'Nedumangad', total: 8, completed: 2, ongoing: 3, notStarted: 2, underReview: 1},
          { id: 2, zone: 'Aruvikkara', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1},
          { id: 3, zone: 'Vellanad', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 4, zone: 'Vamanapuram', total: 7, completed: 2, ongoing: 2, notStarted: 2, underReview: 1}
        ]
      },
      'kollam': {
        'karunagappally': [
          { id: 1, zone: 'Alappad', total: 4, completed: 0, ongoing: 0, notStarted: 4, underReview: 0},
          { id: 2, zone: 'Chavara', total: 5, completed: 0, ongoing: 0, notStarted: 5, underReview: 0},
          { id: 3, zone: 'Karunagappally', total: 6, completed: 0, ongoing: 0, notStarted: 6, underReview: 0},
          { id: 4, zone: 'Neendakara', total: 4, completed: 0, ongoing: 0, notStarted: 4, underReview: 0},
          { id: 5, zone: 'Panmana', total: 5, completed: 0, ongoing: 0, notStarted: 5, underReview: 0},
          { id: 6, zone: 'Thevalakkara', total: 4, completed: 0, ongoing: 0, notStarted: 4, underReview: 0},
          { id: 7, zone: 'Thodiyoor', total: 3, completed: 0, ongoing: 0, notStarted: 3, underReview: 0}
        ],
        'kunnathur': [
          { id: 1, zone: 'Kunnathur', total: 5, completed: 0, ongoing: 0, notStarted: 5, underReview: 0},
          { id: 2, zone: 'Sasthamkotta', total: 4, completed: 0, ongoing: 0, notStarted: 4, underReview: 0}
        ]
      },
      'pathanamthitta': {
        'adoor': [
          { id: 1, zone: 'Adoor', total: 5, completed: 5, ongoing: 0, notStarted: 0, underReview: 0},
          { id: 2, zone: 'Ezhamkulam', total: 4, completed: 4, ongoing: 0, notStarted: 0, underReview: 0},
          { id: 3, zone: 'Kadampanad', total: 6, completed: 6, ongoing: 0, notStarted: 0, underReview: 0},
          { id: 4, zone: 'Kodumon', total: 4, completed: 4, ongoing: 0, notStarted: 0, underReview: 0},
          { id: 5, zone: 'Pallickal', total: 5, completed: 5, ongoing: 0, notStarted: 0, underReview: 0}
        ],
        'konni': [
          { id: 1, zone: 'Konni', total: 5, completed: 5, ongoing: 0, notStarted: 0, underReview: 0},
          { id: 2, zone: 'Kunnathannam', total: 4, completed: 4, ongoing: 0, notStarted: 0, underReview: 0}
        ]
      },
      'alappuzha': {
        'ambalappuzha': [
          { id: 1, zone: 'Ambalappuzha', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 2, zone: 'Punnapra', total: 4, completed: 0, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 3, zone: 'Purakkad', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 4, zone: 'Punnapra North', total: 3, completed: 0, ongoing: 1, notStarted: 1, underReview: 1}
        ],
        'cherthala': [
          { id: 1, zone: 'Cherthala', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1},
          { id: 2, zone: 'Arthunkal', total: 4, completed: 1, ongoing: 1, notStarted: 1, underReview: 1},
          { id: 3, zone: 'Kanjikuzhy', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1}
        ]
      },
      'kottayam': {
        'changanassery': [
          { id: 1, zone: 'Changanassery', total: 5, completed: 0, ongoing: 0, notStarted: 0, underReview: 5},
          { id: 2, zone: 'Madappally', total: 4, completed: 0, ongoing: 0, notStarted: 0, underReview: 4},
          { id: 3, zone: 'Vakathanam', total: 5, completed: 0, ongoing: 0, notStarted: 0, underReview: 5},
          { id: 4, zone: 'Kurichy', total: 4, completed: 0, ongoing: 0, notStarted: 0, underReview: 4}
        ],
        'kottayam': [
          { id: 1, zone: 'Kottayam', total: 6, completed: 0, ongoing: 0, notStarted: 0, underReview: 6},
          { id: 2, zone: 'Kumarakom', total: 4, completed: 0, ongoing: 0, notStarted: 0, underReview: 4},
          { id: 3, zone: 'Aymanam', total: 5, completed: 0, ongoing: 0, notStarted: 0, underReview: 5}
        ]
      },
      // Adding more districts for completeness
      'idukki': {
        'thodupuzha': [
          { id: 1, zone: 'Thodupuzha', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1},
          { id: 2, zone: 'Alacode', total: 4, completed: 0, ongoing: 1, notStarted: 2, underReview: 1},
          { id: 3, zone: 'Kodikulam', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1}
        ]
      },
      'ernakulam': {
        'kochi': [
          { id: 1, zone: 'Kochi', total: 8, completed: 2, ongoing: 3, notStarted: 2, underReview: 1},
          { id: 2, zone: 'Edappally', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1},
          { id: 3, zone: 'Kalamassery', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1},
          { id: 4, zone: 'Thrippunithura', total: 7, completed: 2, ongoing: 2, notStarted: 2, underReview: 1}
        ]
      }
    };
    
    return zoneDataMap[district?.toLowerCase()]?.[taluk?.toLowerCase()] || [];
  };

  // Get all zone data
  const allZoneData = useMemo(() => getZoneData(districtName, talukName), [districtName, talukName]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return allZoneData;
    }
    return allZoneData.filter(row => 
      row.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allZoneData, searchTerm]);

  // Get current page data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  useEffect(() => {
    if (districtName && talukName) {
      // Format names for display
      const formattedDistrict = districtName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const formattedTaluk = talukName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setLocationInfo(prev => ({ 
        ...prev, 
        district: formattedDistrict,
        taluk: formattedTaluk 
      }));
      
      // Calculate totals from zone data
      const totals = allZoneData.reduce((acc, zone) => ({
        totalZones: acc.totalZones + zone.total,
        completed: acc.completed + zone.completed,
        ongoing: acc.ongoing + zone.ongoing,
        notStarted: acc.notStarted + zone.notStarted,
        underReview: acc.underReview + zone.underReview
      }), { totalZones: 0, completed: 0, ongoing: 0, notStarted: 0, underReview: 0 });
      
      setLocationInfo(prev => ({
        ...prev,
        ...totals
      }));

      // Reset pagination and search when location changes
      setPage(0);
      setSearchTerm('');
    }
  }, [districtName, talukName, allZoneData]);

  const handleGoBack = () => {
    navigate(`/kerala_report/taluk_cluster_report/${districtName}`);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleViewZoneDetails = (zoneName) => {
    // Navigate to village/ward level if needed
    const formattedZoneName = zoneName.toLowerCase().replace(/\s+/g, '-');
    const formattedDistrictName = districtName.toLowerCase().replace(/\s+/g, '-');
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    
    // Uncomment to navigate to next level
    // navigate(`/kerala_report/village_report/${formattedDistrictName}/${formattedTalukName}/${formattedZoneName}`);
    console.log(`View details for ${zoneName} in ${talukName}, ${districtName}`);
    
    // Show info message
    alert(`Viewing details for ${zoneName} (Feature coming soon)`);
  };

  

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      {/* Header Section with Breadcrumbs and Back Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
              Overview of zone reports in {locationInfo.taluk} taluk, {locationInfo.district} district
            </Typography>
          </Box>
          <Chip 
            label={`Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Grid>

      {/* Zone/Panchayat Table */}
      <Grid item xs={12}>
        <MainCard 
          title={`Zones/Panchayats in ${locationInfo.taluk} Taluk`} 
          secondary={<AssessmentIcon />}
          sx={{
            '& .MuiCardContent-root': {
              p: 0
            }
          }}
        >
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Zone-wise Report
              </Typography>
              <TextField
                placeholder="Search by zone"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
          </Box>

          <TableContainer sx={{ borderRadius: 2, overflow: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#04255e' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Zone</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Total Clusters</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Completed</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>On Going</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Not Started</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Under Review</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow 
                      key={row.id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: '#f5f5f5',
                          cursor: 'pointer'
                        },
                        transition: '0.2s'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {row.zone}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.total} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        {row.completed > 0 ? (
                          <Chip 
                            label={row.completed} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        ) : row.completed}
                      </TableCell>
                      <TableCell align="center">
                        {row.ongoing > 0 ? (
                          <Chip 
                            label={row.ongoing} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        ) : row.ongoing}
                      </TableCell>
                      <TableCell align="center">
                        {row.notStarted > 0 ? (
                          <Chip 
                            label={row.notStarted} 
                            size="small" 
                            variant="outlined"
                          />
                        ) : row.notStarted}
                      </TableCell>
                      <TableCell align="center">
                        {row.underReview > 0 ? (
                          <Chip 
                            label={row.underReview} 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                          />
                        ) : row.underReview}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewZoneDetails(row.zone)}
                            sx={{ 
                              color: '#04255e',
                              '&:hover': { bgcolor: '#e3f2fd' }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm 
                          ? `No zones/panchayats found matching "${searchTerm}"` 
                          : `No zone/panchayat data available for ${locationInfo.taluk} taluk`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiTablePagination-select': {
                  borderRadius: 1
                }
              }}
            />
          )}
        </MainCard>
      </Grid>

      {/* Footer Note */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{ color: '#04255e', borderColor: '#04255e' }}
          >
            Back to Taluk Report
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneClusterReport;
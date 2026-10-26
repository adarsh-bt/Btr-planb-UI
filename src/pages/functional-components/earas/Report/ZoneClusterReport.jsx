// ZoneClusterReport.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Typography,
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
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  alpha
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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import Breadcrumb from 'routes/Breadcrumb';

function ZoneClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtName, talukName } = useParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [locationInfo, setLocationInfo] = useState({
    district: '',
    taluk: '',
    totalZones: 0,
    completed: 0,
    ongoing: 0,
    notStarted: 0,
    underReview: 0
  });

  const getZoneData = (district, taluk) => {
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

  const allZoneData = useMemo(() => getZoneData(districtName, talukName), [districtName, talukName]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return allZoneData;
    return allZoneData.filter(row => 
      row.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allZoneData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };
  const handleGoBack = () => navigate(`/kerala_report/taluk_cluster_report/${districtName}`);
  const handleViewZoneDetails = (zoneName) => {
    console.log(`View details for ${zoneName}`);
    alert(`Viewing details for ${zoneName} (Feature coming soon)`);
  };

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card sx={{ 
      bgcolor: bgColor, 
      borderRadius: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    if (districtName && talukName) {
      const formattedDistrict = districtName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const formattedTaluk = talukName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const totals = allZoneData.reduce((acc, zone) => ({
        totalZones: acc.totalZones + zone.total,
        completed: acc.completed + zone.completed,
        ongoing: acc.ongoing + zone.ongoing,
        notStarted: acc.notStarted + zone.notStarted,
        underReview: acc.underReview + zone.underReview
      }), { totalZones: 0, completed: 0, ongoing: 0, notStarted: 0, underReview: 0 });
      
      setLocationInfo({ 
        district: formattedDistrict,
        taluk: formattedTaluk,
        ...totals
      });
      
      setPage(0);
      setSearchTerm('');
    }
  }, [districtName, talukName, allZoneData]);

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StoreIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {locationInfo.taluk} - Zone wise Cluster Report
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
                Zone/Panchayat-wise cluster performance in {locationInfo.district} district
              </Typography> */}
            </Box>
          </Stack>
          <Chip 
            label={`Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Stack>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard label="Total Zones" value={locationInfo.totalZones} color="#1565c0" bgColor={alpha('#1565c0', 0.08)} icon={<StoreIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard label="Completed" value={locationInfo.completed} color="#2e7d32" bgColor={alpha('#2e7d32', 0.08)} icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard label="Ongoing" value={locationInfo.ongoing} color="#ed6c02" bgColor={alpha('#ed6c02', 0.08)} icon={<PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard label="Not Started" value={locationInfo.notStarted} color="#757575" bgColor={alpha('#757575', 0.08)} icon={<ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} />} />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard label="Under Review" value={locationInfo.underReview} color="#b76e00" bgColor={alpha('#b76e00', 0.08)} icon={<RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} />} />
          </Grid>
        </Grid>
      </Grid>

      {/* Zone Table */}
      <Grid item xs={12}>
        <MainCard 
          title={`Zones in ${locationInfo.taluk}`} 
          secondary={
            <TextField
              placeholder="Search zone/panchayat..."
              size="small"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          }
          sx={{ borderRadius: 3 }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#04255e' }}>
                  {['Zone / Panchayat', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                    <TableCell key={idx} align={idx === 0 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <TableRow 
                      key={row.id}
                      hover
                      sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StoreIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                          <Typography fontWeight={500}>{row.zone}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.total} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                      </TableCell>
                      <TableCell align="center">
                        {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                      </TableCell>
                      <TableCell align="center">
                        {row.ongoing > 0 ? <Chip label={row.ongoing} size="small" color="primary" variant="outlined" /> : row.ongoing}
                      </TableCell>
                      <TableCell align="center">
                        {row.notStarted > 0 ? <Chip label={row.notStarted} size="small" variant="outlined" /> : row.notStarted}
                      </TableCell>
                      <TableCell align="center">
                        {row.underReview > 0 ? <Chip label={row.underReview} size="small" color="warning" variant="outlined" /> : row.underReview}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewZoneDetails(row.zone)}
                            sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? `No zones found matching "${searchTerm}"` : `No zone data available for ${locationInfo.taluk} taluk`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredData.length > 0 && (
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
            />
          )}
        </MainCard>
      </Grid>

      {/* Back Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              color: '#04255e', 
              borderColor: '#04255e',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                borderColor: '#04255e',
                bgcolor: alpha('#04255e', 0.04)
              }
            }}
          >
            Back to Taluk Report
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneClusterReport;
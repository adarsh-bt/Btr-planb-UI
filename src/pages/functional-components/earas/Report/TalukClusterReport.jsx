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
import Breadcrumb from 'routes/Breadcrumb';

function TalukClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtName } = useParams();
  
  // State for pagination and search
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // State for district details
  const [districtInfo, setDistrictInfo] = useState({
    name: '',
    totalClusters: 0,
    completed: 0,
    ongoing: 0,
    notStarted: 0,
    underReview: 0
  });

  // Sample taluk data based on district
  const getTalukData = (district) => {
    const talukDataMap = {
      'thiruvananthapuram': [
        { id: 1, taluk: 'Neyyattinkara', total: 8, completed: 2, ongoing: 4, notStarted: 1, underReview: 1},
        { id: 2, taluk: 'Kattakada', total: 6, completed: 1, ongoing: 3, notStarted: 1, underReview: 1},
        { id: 3, taluk: 'Nedumangad', total: 10, completed: 2, ongoing: 4, notStarted: 2, underReview: 2},
        { id: 4, taluk: 'Chirayinkeezhu', total: 7, completed: 1, ongoing: 3, notStarted: 2, underReview: 1},
        { id: 5, taluk: 'Thiruvananthapuram', total: 12, completed: 3, ongoing: 5, notStarted: 2, underReview: 2}
      ],
      'kollam': [
        { id: 1, taluk: 'Karunagappally', total: 8, completed: 0, ongoing: 0, notStarted: 8, underReview: 0},
        { id: 2, taluk: 'Kunnathur', total: 6, completed: 0, ongoing: 0, notStarted: 6, underReview: 0},
        { id: 3, taluk: 'Kottarakkara', total: 9, completed: 0, ongoing: 0, notStarted: 9, underReview: 0},
        { id: 4, taluk: 'Punalur', total: 7, completed: 0, ongoing: 0, notStarted: 7, underReview: 0},
        { id: 5, taluk: 'Pathanapuram', total: 5, completed: 0, ongoing: 0, notStarted: 5, underReview: 0}
      ],
      'pathanamthitta': [
        { id: 1, taluk: 'Adoor', total: 8, completed: 8, ongoing: 0, notStarted: 0, underReview: 0},
        { id: 2, taluk: 'Konni', total: 7, completed: 7, ongoing: 0, notStarted: 0, underReview: 0},
        { id: 3, taluk: 'Kozhencherry', total: 9, completed: 9, ongoing: 0, notStarted: 0, underReview: 0},
        { id: 4, taluk: 'Mallappally', total: 5, completed: 5, ongoing: 0, notStarted: 0, underReview: 0},
        { id: 5, taluk: 'Ranni', total: 6, completed: 6, ongoing: 0, notStarted: 0, underReview: 0}
      ],
      'alappuzha': [
        { id: 1, taluk: 'Ambalappuzha', total: 8, completed: 1, ongoing: 4, notStarted: 2, underReview: 1},
        { id: 2, taluk: 'Cherthala', total: 10, completed: 2, ongoing: 5, notStarted: 2, underReview: 1},
        { id: 3, taluk: 'Kuttanad', total: 7, completed: 1, ongoing: 3, notStarted: 2, underReview: 1},
        { id: 4, taluk: 'Chengannur', total: 6, completed: 1, ongoing: 3, notStarted: 1, underReview: 1},
        { id: 5, taluk: 'Karthikappally', total: 8, completed: 1, ongoing: 4, notStarted: 2, underReview: 1}
      ],
      'kottayam': [
        { id: 1, taluk: 'Changanassery', total: 8, completed: 0, ongoing: 0, notStarted: 0, underReview: 8},
        { id: 2, taluk: 'Kanjirappally', total: 7, completed: 0, ongoing: 0, notStarted: 0, underReview: 7},
        { id: 3, taluk: 'Kottayam', total: 12, completed: 0, ongoing: 0, notStarted: 0, underReview: 12},
        { id: 4, taluk: 'Vaikom', total: 9, completed: 0, ongoing: 0, notStarted: 0, underReview: 9},
        { id: 5, taluk: 'Meenachil', total: 10, completed: 0, ongoing: 0, notStarted: 0, underReview: 10}
      ],
      'idukki': [
        { id: 1, taluk: 'Thodupuzha', total: 12, completed: 2, ongoing: 4, notStarted: 3, underReview: 3},
        { id: 2, taluk: 'Devikulam', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2},
        { id: 3, taluk: 'Udumbanchola', total: 10, completed: 2, ongoing: 4, notStarted: 2, underReview: 2},
        { id: 4, taluk: 'Peerumade', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1}
      ],
      'ernakulam': [
        { id: 1, taluk: 'Aluva', total: 15, completed: 3, ongoing: 5, notStarted: 4, underReview: 3},
        { id: 2, taluk: 'Kochi', total: 20, completed: 5, ongoing: 7, notStarted: 5, underReview: 3},
        { id: 3, taluk: 'Kunnathunad', total: 12, completed: 2, ongoing: 4, notStarted: 3, underReview: 3},
        { id: 4, taluk: 'Muvattupuzha', total: 10, completed: 2, ongoing: 3, notStarted: 3, underReview: 2},
        { id: 5, taluk: 'Paravur', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2}
      ],
      'thrissur': [
        { id: 1, taluk: 'Thrissur', total: 14, completed: 2, ongoing: 5, notStarted: 4, underReview: 3},
        { id: 2, taluk: 'Chavakkad', total: 9, completed: 1, ongoing: 3, notStarted: 3, underReview: 2},
        { id: 3, taluk: 'Kodungallur', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2},
        { id: 4, taluk: 'Mukundapuram', total: 10, completed: 2, ongoing: 4, notStarted: 2, underReview: 2}
      ],
      'palakkad': [
        { id: 1, taluk: 'Palakkad', total: 12, completed: 2, ongoing: 4, notStarted: 3, underReview: 3},
        { id: 2, taluk: 'Ottappalam', total: 10, completed: 2, ongoing: 3, notStarted: 3, underReview: 2},
        { id: 3, taluk: 'Mannarkkad', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2},
        { id: 4, taluk: 'Chittur', total: 9, completed: 1, ongoing: 3, notStarted: 3, underReview: 2}
      ],
      'malappuram': [
        { id: 1, taluk: 'Malappuram', total: 14, completed: 3, ongoing: 5, notStarted: 3, underReview: 3},
        { id: 2, taluk: 'Tirur', total: 12, completed: 2, ongoing: 4, notStarted: 3, underReview: 3},
        { id: 3, taluk: 'Perinthalmanna', total: 10, completed: 2, ongoing: 3, notStarted: 3, underReview: 2},
        { id: 4, taluk: 'Ponnani', total: 9, completed: 1, ongoing: 3, notStarted: 3, underReview: 2}
      ],
      'wayanad': [
        { id: 1, taluk: 'Vythiri', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2},
        { id: 2, taluk: 'Mananthavady', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1},
        { id: 3, taluk: 'Sulthan Bathery', total: 7, completed: 1, ongoing: 3, notStarted: 2, underReview: 1}
      ],
      'kozhikode': [
        { id: 1, taluk: 'Kozhikode', total: 16, completed: 3, ongoing: 6, notStarted: 4, underReview: 3},
        { id: 2, taluk: 'Vadakara', total: 10, completed: 2, ongoing: 4, notStarted: 2, underReview: 2},
        { id: 3, taluk: 'Koyilandy', total: 9, completed: 2, ongoing: 3, notStarted: 2, underReview: 2},
        { id: 4, taluk: 'Thamarassery', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2}
      ],
      'kannur': [
        { id: 1, taluk: 'Kannur', total: 14, completed: 2, ongoing: 5, notStarted: 4, underReview: 3},
        { id: 2, taluk: 'Thalassery', total: 12, completed: 2, ongoing: 4, notStarted: 3, underReview: 3},
        { id: 3, taluk: 'Taliparamba', total: 9, completed: 1, ongoing: 3, notStarted: 3, underReview: 2},
        { id: 4, taluk: 'Iritty', total: 7, completed: 1, ongoing: 2, notStarted: 2, underReview: 2}
      ],
      'kasaragod': [
        { id: 1, taluk: 'Kasaragod', total: 10, completed: 1, ongoing: 3, notStarted: 3, underReview: 3},
        { id: 2, taluk: 'Hosdurg', total: 8, completed: 1, ongoing: 3, notStarted: 2, underReview: 2},
        { id: 3, taluk: 'Vellarikundu', total: 6, completed: 0, ongoing: 2, notStarted: 2, underReview: 2}
      ]
    };
    
    return talukDataMap[district?.toLowerCase()] || [];
  };

  // Get all taluk data
  const allTalukData = useMemo(() => getTalukData(districtName), [districtName]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return allTalukData;
    }
    return allTalukData.filter(row => 
      row.taluk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTalukData, searchTerm]);

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
    if (districtName) {
      // Format district name for display
      const formattedName = districtName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setDistrictInfo(prev => ({ ...prev, name: formattedName }));
      
      // Calculate district totals from taluk data
      const totals = allTalukData.reduce((acc, taluk) => ({
        totalClusters: acc.totalClusters + taluk.total,
        completed: acc.completed + taluk.completed,
        ongoing: acc.ongoing + taluk.ongoing,
        notStarted: acc.notStarted + taluk.notStarted,
        underReview: acc.underReview + taluk.underReview
      }), { totalClusters: 0, completed: 0, ongoing: 0, notStarted: 0, underReview: 0 });
      
      setDistrictInfo(prev => ({
        ...prev,
        ...totals
      }));

      // Reset pagination and search when district changes
      setPage(0);
      setSearchTerm('');
    }
  }, [districtName, allTalukData]);

  const handleGoBack = () => {
    navigate('/kerala_report');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleViewTalukDetails = (talukName) => {
    // Format taluk name for URL (lowercase, replace spaces with hyphens)
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const formattedDistrictName = districtName.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate to zone level report
    navigate(`/kerala_report/zone_cluster_report/${formattedDistrictName}/${formattedTalukName}`);
  };


  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      {/* Header Section with Breadcrumbs and Back Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
              Cluster reports of individual Taluks in {districtInfo.name} district
            </Typography>
          </Box>
          <Chip 
            label={`Last Updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Grid>



      {/* Taluk Table */}
      <Grid item xs={12}>
        <MainCard 
          title={`Taluks in ${districtInfo.name} District`} 
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
                Taluk-wise Report
              </Typography>
              <TextField
                placeholder="Search by taluk"
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Taluk</TableCell>
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
                          {row.taluk}
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
                        <Tooltip title="View zone-wise details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewTalukDetails(row.taluk)}
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
                        {searchTerm ? `No taluks found matching "${searchTerm}"` : `No taluk data available for ${districtInfo.name} district`}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{ color: '#04255e', borderColor: '#04255e' }}
          >
            Back to Kerala Report
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default TalukClusterReport;
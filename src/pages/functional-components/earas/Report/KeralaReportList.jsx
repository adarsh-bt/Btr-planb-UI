import React, { useState, useMemo } from 'react';
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
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Breadcrumb from 'routes/Breadcrumb';

function KeralaReportList() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Tab state for WET/DRY/ALL
  const [seasonTab, setSeasonTab] = useState('ALL');
  
  // Month filter state
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  // Define months for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Sample data with monthly and seasonal breakdown
  // In a real application, this would come from your API
  const districtDataWithDetails = [
    { 
      id: 1,
      district: 'Thiruvananthapuram',
      monthlyData: {
        'January': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 1, ongoing: 0, notStarted: 0, underReview: 0 } },
        'February': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'March': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'April': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'May': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'June': { wet: { completed: 0, ongoing: 1, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'July': { wet: { completed: 0, ongoing: 1, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'August': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 1 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'September': { wet: { completed: 1, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'October': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'November': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'December': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } }
      }
    },
    { 
      id: 2,
      district: 'Kollam',
      monthlyData: {
        'January': { wet: { completed: 0, ongoing: 0, notStarted: 2, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 2, underReview: 0 } },
        'February': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 2, underReview: 0 } },
        'March': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 2, underReview: 0 } },
        'April': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'May': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'June': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'July': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'August': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'September': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'October': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'November': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } },
        'December': { wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }, dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 } }
      }
    }
  ];

  // Function to get data for a specific month range and season
  const getFilteredData = () => {
    const startIndex = fromMonth ? months.indexOf(fromMonth) : 0;
    const endIndex = toMonth ? months.indexOf(toMonth) : months.length - 1;
    
    return districtDataWithDetails.map(district => {
      let total = 0, completed = 0, ongoing = 0, notStarted = 0, underReview = 0;
      
      // Loop through months in range
      for (let i = startIndex; i <= endIndex; i++) {
        const month = months[i];
        const monthData = district.monthlyData[month];
        
        if (monthData) {
          const data = seasonTab === 'ALL' 
            ? {
                completed: monthData.wet.completed + monthData.dry.completed,
                ongoing: monthData.wet.ongoing + monthData.dry.ongoing,
                notStarted: monthData.wet.notStarted + monthData.dry.notStarted,
                underReview: monthData.wet.underReview + monthData.dry.underReview
              }
            : monthData[seasonTab.toLowerCase()];
          
          completed += data.completed;
          ongoing += data.ongoing;
          notStarted += data.notStarted;
          underReview += data.underReview;
          total += data.completed + data.ongoing + data.notStarted + data.underReview;
        }
      }
      
      return {
        id: district.id,
        district: district.district,
        total,
        completed,
        ongoing,
        notStarted,
        underReview
      };
    });
  };

  // Get filtered data based on month range and season
  const districtData = useMemo(() => getFilteredData(), [fromMonth, toMonth, seasonTab]);

  // Calculate statistics
  const stats = useMemo(() => ({
    all: districtData.reduce((sum, row) => sum + row.total, 0),
    completed: districtData.reduce((sum, row) => sum + row.completed, 0),
    ongoing: districtData.reduce((sum, row) => sum + row.ongoing, 0),
    notStarted: districtData.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: districtData.reduce((sum, row) => sum + row.underReview, 0)
  }), [districtData]);

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return districtData;
    }
    return districtData.filter(row => 
      row.district.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [districtData, searchTerm]);

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

  // Clear filters
  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSeasonTab('ALL');
    setPage(0);
  };

  const handleViewDetails = (districtName) => {
    navigate(`/kerala_report/taluk_cluster_report/${districtName.toLowerCase()}`, {
      state: { fromMonth, toMonth, seasonTab }
    });
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'completed':
        return <Chip size="small" label="Completed" color="success" icon={<CheckCircleIcon />} />;
      case 'ongoing':
        return <Chip size="small" label="On Going" color="primary" icon={<PendingIcon />} />;
      case 'notStarted':
        return <Chip size="small" label="Not Started" color="default" icon={<ScheduleIcon />} />;
      case 'underReview':
        return <Chip size="small" label="Under Review" color="warning" icon={<RateReviewIcon />} />;
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      
      {/* Header Section */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ fontSize: 35 }} />
              Overall cluster report in Kerala
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
              Overall cluster report in Kerala
              {(fromMonth || toMonth) && ` | ${fromMonth || 'Start'} - ${toMonth || 'End'}`}
              {seasonTab !== 'ALL' && ` | ${seasonTab} Season`}
            </Typography>
          </Box>
          {(fromMonth || toMonth || seasonTab !== 'ALL') && (
            <Button 
              variant="outlined" 
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Grid>

      {/* Filter Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 600, minWidth: 100 }}>
              <FilterAltIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filters:
            </Typography>
            
            {/* Season Tabs */}
            <Tabs 
              value={seasonTab} 
              onChange={(e, newValue) => {
                setSeasonTab(newValue);
                setPage(0);
              }}
              sx={{ 
                minHeight: 40,
                '& .MuiTab-root': { minHeight: 40, py: 1 }
              }}
            >
              <Tab 
                label="ALL" 
                value="ALL" 
                icon={<AssessmentIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="WET" 
                value="WET" 
                icon={<WaterDropIcon />} 
                iconPosition="start"
                sx={{ color: '#0288d1' }}
              />
              <Tab 
                label="DRY" 
                value="DRY" 
                icon={<WbSunnyIcon />} 
                iconPosition="start"
                sx={{ color: '#f57c00' }}
              />
            </Tabs>
            
            {/* Month Range Filters */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>From Month</InputLabel>
              <Select
                value={fromMonth}
                label="From Month"
                onChange={(e) => {
                  setFromMonth(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">None</MenuItem>
                {months.map(month => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2">to</Typography>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>To Month</InputLabel>
              <Select
                value={toMonth}
                label="To Month"
                onChange={(e) => {
                  setToMonth(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">None</MenuItem>
                {months.map(month => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
                  {stats.all}
                </Typography>
                <Typography variant="body2" sx={{ color: '#1565c0' }}>
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#e8f5e8', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#fff3e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                  {stats.ongoing}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ed6c02' }}>
                  Ongoing
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#616161', fontWeight: 'bold' }}>
                  {stats.notStarted}
                </Typography>
                <Typography variant="body2" sx={{ color: '#616161' }}>
                  Not Started
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#fff8e1', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#b76e00', fontWeight: 'bold' }}>
                  {stats.underReview}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b76e00' }}>
                  Under Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Grid item xs={12}>
        <MainCard 
          title="District-wise Cluster Status" 
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
                District Reports
              </Typography>
              <TextField
                placeholder="Search by district"
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>District</TableCell>
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
                          {row.district}
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
                        <Tooltip title="View Taluk-wise Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewDetails(row.district)}
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
                        No districts found matching the current filters
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
    </Grid>
  );
}

export default KeralaReportList;
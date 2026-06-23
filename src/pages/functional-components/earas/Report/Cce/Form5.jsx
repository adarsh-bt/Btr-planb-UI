import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mainapi from 'api/mainapi';
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import {
  Hub,
  CheckCircle,
  Pending,
  Block,
  RateReview,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Cancel,
  Assignment
} from '@mui/icons-material';

const Form5 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const themeColor = "#05307a";

  // Sample data - replace with your actual data
  const stats = {
    totalClusters: 24,
    completed: 8,
    ongoing: 6,
    notStarted: 5,
    underReview: 5
  };

  // Table data state - Status changed to Active/Inactive
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [agriculturalYear, setAgriculturalYear] = useState('2024-25');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('crop');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${mainapi.BASE_URL}${mainapi.endpoints.fetchMasterCCECrop}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : (data.data || []);

        // Map the API fields to our table columns
        const mappedData = dataArray.map((item, index) => ({
          id: item.id || index,
          crop: item.cropName || item.crop || 'N/A',
          season: item.season || 'N/A',
          status: item.status || 'Active', // Fallback status if missing
          clusterNo: item.clusterNumber || item.clusterNo || 'N/A',
          landType: item.landType || 'N/A',
          surveyNo: item.surveyNumber || item.surveyNo || 'N/A',
          cultivatedArea: item.cultivatedArea || 'N/A',
          farmerName: item.farmerName || 'N/A',
          panchayath: item.panchayathName || item.panchayath || 'N/A'
        }));

        setTableData(mappedData);
      } catch (err) {
        console.error('Error fetching CCE logs:', err);
        setError('Failed to load crop details. Please try again.');
        // Set fallback mock data in case of error for demonstration
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTableData();
  }, [agriculturalYear]);




  const getPercentage = (count) => {
    return ((count / stats.totalClusters) * 100).toFixed(1);
  };

  const cards = [
    {
      title: 'Total CCE',
      count: stats.totalClusters,
      icon: Hub,
      color: theme.palette.success.dark,
    },
    {
      title: 'Selected CCE',
      count: stats.totalClusters,
      icon: AssessmentIcon,
      color: theme.palette.primary.main,
    },
    {
      title: 'Completed',
      count: stats.completed,
      icon: CheckCircle,
      color: theme.palette.success.main,
      percentage: getPercentage(stats.completed),
    },
    {
      title: 'Ongoing',
      count: stats.ongoing,
      icon: Pending,
      color: theme.palette.warning.main,
      percentage: getPercentage(stats.ongoing),
    },
    {
      title: 'Not Available',
      count: stats.totalClusters,
      icon: Cancel,
      color: theme.palette.error.main,
    },
    {
      title: 'Not Started',
      count: stats.notStarted,
      icon: Block,
      color: theme.palette.grey[600],
      percentage: getPercentage(stats.notStarted),
    },
    {
      title: 'Under Review',
      count: stats.underReview,
      icon: RateReview,
      color: theme.palette.info.main,
      percentage: getPercentage(stats.underReview),
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return theme.palette.success.main;
      case 'Inactive': return theme.palette.grey[600];
      default: return theme.palette.primary.main;
    }
  };

  const getLandTypeColor = (landType) => {
    return landType === 'Wet' ? theme.palette.info.main : '#ed6c02';
  };

  // Filtering logic - searches across all fields
  const filteredData = tableData.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === '' ||
      row.crop.toLowerCase().includes(searchLower) ||
      row.season.toLowerCase().includes(searchLower) ||
      row.status.toLowerCase().includes(searchLower) ||
      row.clusterNo.toString().includes(searchLower) ||
      row.landType.toLowerCase().includes(searchLower) ||
      row.surveyNo.toLowerCase().includes(searchLower) ||
      row.cultivatedArea.toLowerCase().includes(searchLower) ||
      row.farmerName.toLowerCase().includes(searchLower) ||
      row.panchayath.toLowerCase().includes(searchLower);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];
    if (orderBy === 'clusterNo') {
      valA = Number(valA);
      valB = Number(valB);
    }
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleAgriculturalYearChange = (event) => {
    setAgriculturalYear(event.target.value);
    setPage(0);
    // Fetch data based on selected year here
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'visible',
        background: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Form 5 - Status Overview
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={true} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${alpha(card.color, 0.05)} 0%, ${alpha(card.color, 0.02)} 100%)`,
                  borderBottom: `2px solid ${card.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                    background: `linear-gradient(135deg, ${alpha(card.color, 0.08)} 0%, ${alpha(card.color, 0.03)} 100%)`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      background: alpha(card.color, 0.1),
                      display: 'inline-flex',
                    }}
                  >
                    <card.icon
                      sx={{
                        fontSize: 24,
                        color: card.color,
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: card.color,
                    lineHeight: 1.2,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '1.75rem' },
                    mb: 0,
                  }}
                >
                  {card.count}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Table Section */}
        <Paper sx={{
          p: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          {/* Header with Search */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: themeColor,
                textShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <AssessmentIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
              CCE Crops Details
            </Typography>

            <TextField
              variant="outlined"
              size="small"
              placeholder="Search by crop, farmer, or cluster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: { xs: '100%', sm: 350 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.15)}`
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                ),
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${theme.palette.primary.dark} 100%)`,
                }}>
                  {[
                    { id: 'crop', label: 'Crop (Season)' },
                    { id: 'status', label: 'Status' },
                    { id: 'clusterNo', label: 'Cluster Number' },
                    { id: 'landType', label: 'Land Type' },
                    { id: 'surveyNo', label: 'Survey Number' },
                    { id: 'cultivatedArea', label: 'Cultivated Area' },
                    { id: 'farmerName', label: 'Farmer Name' },
                    { id: 'panchayath', label: 'Panchayath' }
                  ].map((col) => (
                    <TableCell key={col.id} sx={{ color: 'white', whiteSpace: 'nowrap', fontWeight: 600, py: 2 }}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                        sx={{
                          color: 'white !important',
                          '& .MuiTableSortLabel-icon': {
                            color: 'white !important',
                          }
                        }}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="textSecondary" fontWeight={500}>
                        Loading crop details...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="error" fontWeight={500}>
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3) }} />
                        <Typography variant="body1" color="textSecondary" fontWeight={500}>
                          No crop details found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => navigate('/schemes/earas/cce/cceDataView', { state: { rowData: row } })}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04) + ' !important',
                        },
                        transition: 'background-color 0.2s',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {row.crop}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ background: alpha(theme.palette.divider, 0.1), px: 1, py: 0.2, borderRadius: 1 }}>
                            {row.season}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            backgroundColor: row.status === 'Active'
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.grey[600], 0.1),
                            color: row.status === 'Active'
                              ? theme.palette.success.dark
                              : theme.palette.grey[700],
                            fontWeight: 700,
                            borderRadius: 1.5,
                            border: `1px solid ${row.status === 'Active' ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.grey[500], 0.2)}`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`#${row.clusterNo}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            color: themeColor,
                            fontWeight: 600,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(themeColor, 0.3)}`,
                            minWidth: 40
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.landType}
                          size="small"
                          sx={{
                            backgroundColor: row.landType === 'Wet'
                              ? alpha(theme.palette.info.main, 0.1)
                              : alpha(getLandTypeColor(row.landType), 0.1),
                            color: row.landType === 'Wet'
                              ? theme.palette.info.dark
                              : getLandTypeColor(row.landType),
                            fontWeight: 600,
                            borderRadius: 1.5
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                          {row.surveyNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="text.secondary">
                          {row.cultivatedArea}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.farmerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.panchayath}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
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
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </Paper>
      </CardContent>
    </Card>
  );
};

export default Form5;
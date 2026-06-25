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
  Chip,
  CircularProgress,
  IconButton,
  Tooltip
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
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const Form5 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const themeColor = "#05307a";

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for stats
  const [stats, setStats] = useState({
    totalCCECrops: 0,
    ongoing: 0,
    completed: 0,
    notStarted: 0,
    underReview: 0,
    notAvailable: 0,
    selectedCce: 0
  });

  // Table data state
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [agriculturalYear, setAgriculturalYear] = useState('2025-2026');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('crop');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        // Update this URL with your actual API endpoint
        const response = await fetch(`http://localhost:9114/earas-form1-entry/cce-crop-details/cce-summary/1/2025-2026`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        // Update stats
        setStats({
          totalCCECrops: data.totalCCECrops || 0,
          ongoing: data.ongoing || 0,
          completed: data.completed || 0,
          notStarted: data.notStarted || 0,
          underReview: data.underReview || 0,
          notAvailable: data.notAvailable || 0,
          selectedCce: data.selectedCce || 0
        });

        // Map cropSubDetails to table data
        const mappedData = (data.cropSubDetails || []).map((item, index) => ({
          id: item.cropId || index,
          crop: item.cropName || 'N/A',
          season: item.season || 'N/A',
          status: item.status || 'NOT STARTED',
          clusterNo: item.clusterNo || 'N/A',
          landType: item.landType || 'N/A',
          surveyNo: 'N/A', // Not available in API response
          cultivatedArea: item.cultivatedArea !== null ? item.cultivatedArea : 'N/A',
          farmerName: item.farmerName || 'N/A',
          panchayath: item.localBodyName || 'N/A',
          zoneId: item.zoneId,
          clusterId: item.clusterId,
          noOfCce: item.noOfCce,
          availableCcePlotId: item.availableCcePlotId || null,
          cropId: item.cropId
        }));

        setTableData(mappedData);
        setApiData(data);

      } catch (err) {
        console.error('Error fetching CCE data:', err);
        setError('Failed to load CCE details. Please try again.');
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [agriculturalYear]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return theme.palette.success.main;
      case 'ONGOING': return theme.palette.warning.main;
      case 'NOT STARTED': return theme.palette.grey[600];
      case 'UNDER REVIEW': return theme.palette.info.main;
      case 'NOT AVAILABLE': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'COMPLETED': return alpha(theme.palette.success.main, 0.1);
      case 'ONGOING': return alpha(theme.palette.warning.main, 0.1);
      case 'NOT STARTED': return alpha(theme.palette.grey[600], 0.1);
      case 'UNDER REVIEW': return alpha(theme.palette.info.main, 0.1);
      case 'NOT AVAILABLE': return alpha(theme.palette.error.main, 0.1);
      default: return alpha(theme.palette.primary.main, 0.1);
    }
  };

  const getLandTypeColor = (landType) => {
    if (!landType) return '#ed6c02';
    return landType === 'Wet' ? theme.palette.info.main : '#ed6c02';
  };

  // Handle view navigation
  const handleViewClick = (row) => {
    // Prepare the data to pass to CceDataView
    const viewData = {
      crop: row.crop,
      season: row.season,
      clusterNo: row.clusterNo,
      cultivatedArea: row.cultivatedArea !== 'N/A' ? `${row.cultivatedArea} ha` : 'N/A',
      landType: row.landType !== 'N/A' ? row.landType : 'Not Specified',
      surveyNo: row.surveyNo,
      farmerName: row.farmerName,
      status: row.status,
      panchayath: row.panchayath,
      zoneId: row.zoneId,
      clusterId: row.clusterId,
      cropId: row.cropId,
      noOfCce: row.noOfCce,
      availableCcePlotId: row.availableCcePlotId,
      // Additional fields for the detail view
      survey: row.surveyNo,
      irrigationType: 'N/A',
      address: 'N/A',
      contactNo: 'N/A',
      remarks: 'N/A',
      frameType: 'area', // Default to area, can be changed based on crop type
      plotLengthX: 10,
      plotLengthY: 10,
      numberOfTrees: 50,
      randomTreeNumber: 12
    };

    navigate('/schemes/earas/cce/cceDataView', { 
      state: { 
        rowData: viewData,
        from: 'form5'
      } 
    });
  };

  // Cards configuration with actual data
  const cards = [
    {
      title: 'Total CCE',
      count: stats.totalCCECrops,
      icon: Hub,
      color: theme.palette.success.dark,
    },
    {
      title: 'Selected CCE',
      count: stats.selectedCce,
      icon: AssessmentIcon,
      color: theme.palette.primary.main,
    },
    {
      title: 'Completed',
      count: stats.completed,
      icon: CheckCircle,
      color: theme.palette.success.main,
    },
    {
      title: 'Ongoing',
      count: stats.ongoing,
      icon: Pending,
      color: theme.palette.warning.main,
    },
    {
      title: 'Not Available',
      count: stats.notAvailable,
      icon: Cancel,
      color: theme.palette.error.main,
    },
    {
      title: 'Not Started',
      count: stats.notStarted,
      icon: Block,
      color: theme.palette.grey[600],
    },
    {
      title: 'Under Review',
      count: stats.underReview,
      icon: RateReview,
      color: theme.palette.info.main,
    },
  ];

  // Filtering logic
  const filteredData = tableData.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === '' ||
      row.crop.toLowerCase().includes(searchLower) ||
      row.season.toLowerCase().includes(searchLower) ||
      row.status.toLowerCase().includes(searchLower) ||
      row.clusterNo.toString().includes(searchLower) ||
      row.landType.toLowerCase().includes(searchLower) ||
      row.cultivatedArea.toString().includes(searchLower) ||
      row.farmerName.toLowerCase().includes(searchLower) ||
      row.panchayath.toLowerCase().includes(searchLower);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];
    if (orderBy === 'clusterNo' || orderBy === 'noOfCce') {
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

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
          Form 5 - CCE Status Overview
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
                  {isLoading ? '...' : card.count}
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
              {!isLoading && (
                <Chip 
                  label={`${tableData.length} crops`} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
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
                    { id: 'crop', label: 'Crop' },
                    { id: 'status', label: 'Status' },
                    { id: 'clusterNo', label: 'Cluster Number' },
                    { id: 'landType', label: 'Land Type' },
                    { id: 'cultivatedArea', label: 'Cultivated Area' },
                    { id: 'farmerName', label: 'Farmer Name' },
                    { id: 'panchayath', label: 'Panchayat' },
                    { id: 'actions', label: 'Actions' }
                  ].map((col) => (
                    <TableCell key={col.id} sx={{ color: 'white', whiteSpace: 'nowrap', fontWeight: 600, py: 2 }}>
                      {col.id !== 'actions' ? (
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
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body1" color="textSecondary" fontWeight={500}>
                          Loading crop details...
                        </Typography>
                      </Box>
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
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04) + ' !important',
                        },
                        transition: 'background-color 0.2s',
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {row.crop}
                          </Typography>
                          {row.noOfCce > 1 && (
                            <Chip 
                              label={`${row.noOfCce} CCEs`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', mt: 0.5, height: 18 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatStatus(row.status)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusBackgroundColor(row.status),
                            color: getStatusColor(row.status),
                            fontWeight: 700,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(getStatusColor(row.status), 0.2)}`
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
                          label={row.landType !== 'N/A' ? row.landType : 'Not Specified'}
                          size="small"
                          sx={{
                            backgroundColor: row.landType !== 'N/A' 
                              ? alpha(getLandTypeColor(row.landType), 0.1)
                              : alpha(theme.palette.grey[500], 0.1),
                            color: row.landType !== 'N/A' 
                              ? getLandTypeColor(row.landType)
                              : theme.palette.grey[600],
                            fontWeight: 600,
                            borderRadius: 1.5
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500} color="text.secondary">
                          {row.cultivatedArea !== 'N/A' ? `${row.cultivatedArea} ha` : 'N/A'}
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
                      <TableCell>
                        <Tooltip title="View CCE Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewClick(row)}
                            sx={{
                              color: themeColor,
                              '&:hover': {
                                backgroundColor: alpha(themeColor, 0.1),
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredData.length > 0 && !isLoading && (
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
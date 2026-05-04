import React, { useState } from 'react';
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
  Search as SearchIcon
} from '@mui/icons-material';

const Form5 = () => {
  const theme = useTheme();
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
  const [tableData, setTableData] = useState([
    { id: 1, crop: 'Paddy', clusterNo: 1, season: 'Summer', landType: 'Wet', status: 'Active' },
    { id: 2, crop: 'Wheat', clusterNo: 2, season: 'Winter', landType: 'Dry', status: 'Inactive' },
    { id: 3, crop: 'Maize', clusterNo: 3, season: 'Summer', landType: 'Wet', status: 'Active' },
    { id: 4, crop: 'Sugarcane', clusterNo: 4, season: 'Autumn', landType: 'Wet', status: 'Inactive' },
    { id: 5, crop: 'Cotton', clusterNo: 5, season: 'Summer', landType: 'Dry', status: 'Active' },
    { id: 6, crop: 'Soybean', clusterNo: 6, season: 'Autumn', landType: 'Dry', status: 'Inactive' },
    { id: 7, crop: 'Barley', clusterNo: 7, season: 'Winter', landType: 'Wet', status: 'Active' },
    { id: 8, crop: 'Groundnut', clusterNo: 8, season: 'Summer', landType: 'Dry', status: 'Inactive' },
    { id: 9, crop: 'Mustard', clusterNo: 9, season: 'Winter', landType: 'Wet', status: 'Active' },
    { id: 10, crop: 'Jowar', clusterNo: 10, season: 'Summer', landType: 'Dry', status: 'Active' },
    { id: 11, crop: 'Ragi', clusterNo: 11, season: 'Autumn', landType: 'Wet', status: 'Inactive' },
    { id: 12, crop: 'Sunflower', clusterNo: 12, season: 'Summer', landType: 'Dry', status: 'Active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [agriculturalYear, setAgriculturalYear] = useState('2024-25');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('crop');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Agricultural year options
  const agriculturalYears = ['2023-24', '2024-25', '2025-26'];

  const getPercentage = (count) => {
    return ((count / stats.totalClusters) * 100).toFixed(1);
  };

  const cards = [
    {
      title: 'Total Clusters',
      count: stats.totalClusters,
      icon: Hub,
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
    switch(status) {
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
      row.clusterNo.toString().includes(searchLower) ||
      row.season.toLowerCase().includes(searchLower) ||
      row.landType.toLowerCase().includes(searchLower) ||
      row.status.toLowerCase().includes(searchLower);
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

        {/* Stats Cards - Keeping original 5 cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
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
        <Paper sx={{ p: 3, boxShadow: 4, borderRadius: 3 }}>
          {/* Header with Agricultural Year Filter */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: themeColor, fontWeight: 'bold' }}
            >
              📊 Crop Details Table
            </Typography>

            {/* Agricultural Year Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Agricultural Year</InputLabel>
              <Select
                value={agriculturalYear}
                onChange={handleAgriculturalYearChange}
                label="Agricultural Year"
              >
                {agriculturalYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Search Box */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 3
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 350 }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: themeColor, mr: 1 }} />
                ),
              }}
            />
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: themeColor }}>
                <TableRow>
                  {[
                    { id: 'crop', label: 'Crop' },
                    { id: 'clusterNo', label: 'Cluster No' },
                    { id: 'season', label: 'Season' },
                    { id: 'landType', label: 'Land Type' },
                    { id: 'status', label: 'Status' }
                  ].map((col) => (
                    <TableCell key={col.id} sx={{ color: 'white' }}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                        sx={{ color: 'white' }}
                      >
                        <strong>{col.label}</strong>
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="textSecondary">
                        No data available for {agriculturalYear}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.crop}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.clusterNo}
                          size="small"
                          sx={{
                            backgroundColor: alpha(themeColor, 0.1),
                            color: themeColor,
                            fontWeight: 'bold',
                            borderRadius: 1.5,
                            minWidth: 40
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.season}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.landType}
                          size="small"
                          sx={{
                            backgroundColor: row.landType === 'Wet' 
                              ? alpha(theme.palette.info.main, 0.1)
                              : alpha(getLandTypeColor(row.landType), 0.1),
                            color: row.landType === 'Wet' 
                              ? theme.palette.info.main
                              : getLandTypeColor(row.landType),
                            fontWeight: 'bold',
                            borderRadius: 1.5
                          }}
                        />
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
                              ? theme.palette.success.main
                              : theme.palette.grey[600],
                            fontWeight: 'bold',
                            borderRadius: 2
                          }}
                        />
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
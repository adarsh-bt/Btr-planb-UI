import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Breadcrumb from 'routes/Breadcrumb'; // Assuming this path is correct for your project

const CCEPlotList = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('slNo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data for the CCE Plot List table
  const dummyPlotData = useMemo(
    () => [
      { id: 1, slNo: 1, clusterNumber: 'CLUS-001', cropName: 'Rice', source: 'Field Survey' },
      { id: 2, slNo: 2, clusterNumber: 'CLUS-002', cropName: 'Wheat', source: 'Satellite Imagery' },
      { id: 3, slNo: 3, clusterNumber: 'CLUS-003', cropName: 'Maize', source: 'Drone Footage' },
      { id: 4, slNo: 4, clusterNumber: 'CLUS-004', cropName: 'Barley', source: 'Field Survey' },
      { id: 5, slNo: 5, clusterNumber: 'CLUS-005', cropName: 'Sugarcane', source: 'Satellite Imagery' },
      { id: 6, slNo: 6, clusterNumber: 'CLUS-006', cropName: 'Cotton', source: 'Drone Footage' },
      { id: 7, slNo: 7, clusterNumber: 'CLUS-007', cropName: 'Soybean', source: 'Field Survey' },
      { id: 8, slNo: 8, clusterNumber: 'CLUS-008', cropName: 'Potato', source: 'Satellite Imagery' },
      { id: 9, slNo: 9, clusterNumber: 'CLUS-009', cropName: 'Onion', source: 'Drone Footage' },
      { id: 10, slNo: 10, clusterNumber: 'CLUS-010', cropName: 'Tomato', source: 'Field Survey' },
      { id: 11, slNo: 11, clusterNumber: 'CLUS-011', cropName: 'Coffee', source: 'Satellite Imagery' },
      { id: 12, slNo: 12, clusterNumber: 'CLUS-012', cropName: 'Tea', source: 'Drone Footage' }
    ],
    []
  );

  // Sorting Logic
  const descendingComparator = (a, b, orderBy) => {
    if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
      return b[orderBy].localeCompare(a[orderBy]);
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  // Memoized Data for Table (Filtering, Sorting, and Pagination)
  const filteredSortedAndPaginatedData = useMemo(() => {
    const filtered = dummyPlotData.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sorted = [...filtered].sort(getComparator(order, orderBy));

    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [dummyPlotData, searchTerm, order, orderBy, page, rowsPerPage]);

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter Search Handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          CCE Plot List
        </Typography>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label="AY 2024 - 2025" variant="outlined" color="info" />
            </Box>
            <TextField
              label="Search Data"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: '100%', maxWidth: '250px' }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: '50%', overflow: 'scroll', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  {['slNo', 'clusterNumber', 'cropName', 'source'].map((col) => (
                    <TableCell
                      key={col}
                      align="center"
                      sx={{
                        bgcolor: '#05307a',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#032050' }
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === col}
                        direction={orderBy === col ? order : 'asc'}
                        onClick={createSortHandler(col)}
                        sx={{
                          color: 'white',
                          '&.Mui-active': { color: '#a7ffeb' },
                          '& .MuiTableSortLabel-icon': { color: 'white !important' },
                          '& .MuiTableSortLabel-icon.Mui-active': { color: '#a7ffeb !important' }
                        }}
                      >
                        {col === 'slNo' ? 'SL No' : col.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSortedAndPaginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No data found for the current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSortedAndPaginatedData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                        '&:hover': { backgroundColor: '#e0f2f7' }
                      }}
                    >
                      <TableCell align="center">{row.slNo}</TableCell>
                      <TableCell align="center">{row.clusterNumber}</TableCell>
                      <TableCell align="center">{row.cropName}</TableCell>
                      <TableCell align="center">{row.source}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={
              dummyPlotData.filter((row) =>
                Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
              ).length
            }
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            sx={{ '.MuiTablePagination-toolbar': { justifyContent: 'center' } }}
          />
        </Paper>
      </Box>
    </Grid>
  );
};

export default CCEPlotList;

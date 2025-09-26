/* src/pages/AvailableCcePlots.jsx */
import React, { useEffect, useMemo, useState } from 'react';
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
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Breadcrumb from 'routes/Breadcrumb';       // adjust import if needed
import FormService from './formservice';

/* ————————————————————————————————————————————————
   Table columns (key + label)
——————————————————————————————————————————————— */
const columns = [
  { id: 'slNo',            label: 'SL No' },
  { id: 'clusterId',       label: 'Cluster ID' },
  { id: 'cropName',        label: 'Crop' },
  { id: 'cultivatedArea',  label: 'Cultivated Area' },
  { id: 'isIrrigated',     label: 'Irrigated' },
  { id: 'expectedHarvestDate', label: 'Expected Harvest' },
  { id: 'farmerName',      label: 'Farmer Name' },
  { id: 'farmerPhoneNumber',  label: 'Phone' }
];

/* ————————————————————————————————————————————————
   Comparator helpers (same as your reference page)
——————————————————————————————————————————————— */
const descendingComparator = (a, b, orderBy) => {
  if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
    return b[orderBy].localeCompare(a[orderBy]);
  }
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order, orderBy) =>
  order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

const AvailableCcePlots = () => {
  /* ——— state ——— */
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [order, setOrder]       = useState('asc');
  const [orderBy, setOrderBy]   = useState('slNo');
  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRpp]   = useState(5);
  const [searchTerm, setSearch] = useState('');
  const [msg, setMsg]           = useState('');

  /* ——— fetch on mount ——— */
  useEffect(() => {
    (async () => {
      try {
        const res = await FormService.fetchAvailableCcePlots(); // hard‑coded zone 5
        const payload = res.payload || [];
        // Add serial number (slNo) for display
        const withSlNo = payload.map((p, idx) => ({ ...p, slNo: idx + 1 }));
        setRows(withSlNo);
        setMsg(res.message || '');
      } catch (err) {
        setMsg(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ——— sorting handler ——— */
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };
  const createSortHandler = (property) => () => handleRequestSort(property);

  /* ——— pagination handlers ——— */
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRpp(parseInt(e.target.value, 10));
    setPage(0);
  };

  /* ——— search handler ——— */
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  /* ——— memoised filtered+sorted+paginated rows ——— */
  const paginatedData = useMemo(() => {
    const filtered = rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const sorted = [...filtered].sort(getComparator(order, orderBy));
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, searchTerm, order, orderBy, page, rowsPerPage]);

  /* ——— render ——— */
  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          CCE Available Plots
        </Typography>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Top bar: chip + search */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Chip label="AY 2024 – 2025" variant="outlined" color="info" />
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
              sx={{ width: '100%', maxWidth: 250 }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ maxHeight: '50%', overflow: 'scroll', border: 1, borderColor: '#e0e0e0', borderRadius: 1 }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  {columns.map(({ id, label }) => (
                    <TableCell
                      key={id}
                      align="center"
                      sx={{
                        bgcolor: '#05307a',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#032050' }
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === id}
                        direction={orderBy === id ? order : 'asc'}
                        onClick={createSortHandler(id)}
                        sx={{
                          color: 'white',
                          '&.Mui-active': { color: '#a7ffeb' },
                          '& .MuiTableSortLabel-icon': { color: 'white !important' },
                          '& .MuiTableSortLabel-icon.Mui-active': { color: '#a7ffeb !important' }
                        }}
                      >
                        {label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      {msg || 'No data found for the current filter.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow
                      key={row.cceAvailablePlotId}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                        '&:hover': { backgroundColor: '#e0f2f7' }
                      }}
                    >
                      {columns.map(({ id }) => (
                        <TableCell key={id} align="center">
                          {id === 'isIrrigated' ? (row[id] ? 'Yes' : 'No') : row[id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={
              rows.filter((row) =>
                Object.values(row).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
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

export default AvailableCcePlots;

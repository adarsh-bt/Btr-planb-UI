import React, {useEffect,useState,useMemo} from 'react';

import {
  Button,
  CircularProgress,
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
} from "@mui/material";
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';
import './earascss/zone_deta.css'


const KeyPlot = () => {
  const [loading, setLoading] = useState(false);
  const [dataVisible, setDataVisible] = useState(false);
  const [orderBy, setOrderBy] = useState('slNo');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const data = [
    { slNo: 1, syNo: "443/3", area: 15.31, villageBlock: 24, reserveList: "", action: "View Cluster" },
    { slNo: 2, syNo: "45378", area: 24.21, villageBlock: 23, reserveList: "", action: "View Cluster" },
    { slNo: 3, syNo: "160/21", area: 15.93, villageBlock: 23, reserveList: "", action: "View Cluster" },
    { slNo: 5, syNo: "274/6", area: 8.65, villageBlock: 23, reserveList: "", action: "View Cluster" },
    { slNo: 4, syNo: "274/6", area: 8.65, villageBlock: 23, reserveList: "", action: "View Cluster" },
    { slNo: 7, syNo: "442/7", area: 26.43, villageBlock: 24, reserveList: "Reserve-1", action: "View Cluster" },
    { slNo: 8, syNo: "45622", area: 20.5, villageBlock: 23, reserveList: "", action: "View Cluster" },
    { slNo: 9, syNo: "160/15", area: 11.61, villageBlock: 23, reserveList: "Reserve-2", action: "View Cluster" },
    { slNo: 10, syNo: "273/14", area: 9.88, villageBlock: 23, reserveList: "Reserve-3", action: "View Cluster" },
    { slNo: 11, syNo: "365/7", area: 11.36, villageBlock: 23, reserveList: "", action: "View Cluster" },
    { slNo: 12, syNo: "465/2", area: 14.08, villageBlock: 23, reserveList: "", action: "View Cluster" },
  ];

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Create sort handler for a column
  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  // Compare function for sorting
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  // Sort and paginate the data
  const sortedData = useMemo(() => {
    return [...data].sort(getComparator(order, orderBy));
  }, [data, order, orderBy]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const totalArea = data.reduce((sum, row) => sum + row.area, 0).toFixed(2);

  const handleGenerateKeyplot = () => {
    setLoading(true);
    setDataVisible(false);
    setTimeout(() => {
      setLoading(false);
      setDataVisible(true);
    }, 3000);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        KeyPlot
      </Typography>

      {!dataVisible && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Button variant="contained" onClick={handleGenerateKeyplot} disabled={loading} sx={{ px: 3, py: 1.5 }}>
            Generate Keyplot
          </Button>
        </Box>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}

      {dataVisible && (
        <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
          <TableContainer component={Paper} sx={{ mt: 3, width: "auto", boxShadow: 3, borderRadius: 2 }}>
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell align="center" sx={{ width: 70 }}>
                    <TableSortLabel
                      active={orderBy === 'slNo'}
                      direction={orderBy === 'slNo' ? order : 'asc'}
                      onClick={createSortHandler('slNo')}
                    >
                      <strong>Sl.No</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'syNo'}
                      direction={orderBy === 'syNo' ? order : 'asc'}
                      onClick={createSortHandler('syNo')}
                    >
                      <strong>Sy. No</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'area'}
                      direction={orderBy === 'area' ? order : 'asc'}
                      onClick={createSortHandler('area')}
                    >
                      <strong>Area (Cents)</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'villageBlock'}
                      direction={orderBy === 'villageBlock' ? order : 'asc'}
                      onClick={createSortHandler('villageBlock')}
                    >
                      <strong>Village/Block</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'reserveList'}
                      direction={orderBy === 'reserveList' ? order : 'asc'}
                      onClick={createSortHandler('reserveList')}
                    >
                      <strong>Reserve List</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow key={row.slNo} hover>
                    <TableCell align="center">{row.slNo}</TableCell>
                    <TableCell align="center">{row.syNo}</TableCell>
                    <TableCell align="center">{row.area.toFixed(2)}</TableCell>
                    <TableCell align="center">{row.villageBlock}</TableCell>
                    <TableCell align="center">{row.reserveList || "-"}</TableCell>
                    <TableCell align="center" sx={{ p: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary" 
                        fullWidth
                        sx={{ textTransform: "none" }}
                      >
                        {row.action}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "#e0f7e0" }}>
                  <TableCell colSpan={2} align="right"><strong>TOTAL</strong></TableCell>
                  <TableCell align="center"><strong>{totalArea}</strong></TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <TablePagination
              component="div"
              count={data.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        </Box>
      )}

      {dataVisible && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="contained" color="primary" sx={{ px: 4, py: 1.5 }}>
            Form Entry
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default KeyPlot;
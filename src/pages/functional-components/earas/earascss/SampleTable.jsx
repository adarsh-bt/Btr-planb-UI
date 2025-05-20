import React, { useState , useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel } from '@mui/material';
import { useNavigate,useLocation } from 'react-router-dom';

const SampleTable = ({ data }) => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('slNo');
   const location = useLocation();
  const [syNo, setSyNo] = useState('');


  const navigate = useNavigate();

  const createSortHandler = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sorting function
  const sortedData = data.sort((a, b) => {
    if (orderBy === 'slNo') {
      return order === 'asc' ? a.slNo - b.slNo : b.slNo - a.slNo;
    }
    return 0;
  });

    useEffect(() => {
    // Extract syNo from the URL query string
    const urlParams = new URLSearchParams(location.search);
    const syNoFromURL = urlParams.get('syNo');
    if (syNoFromURL) {
      setSyNo(syNoFromURL); // Set syNo to the state
    }
  }, [location]);


   useEffect(() => {
    // Extract syNo from the URL query string
    const urlParams = new URLSearchParams(location.search);
    const syNoFromURL = urlParams.get('syNo');
    if (syNoFromURL) {
      setSyNo(decodeURIComponent(syNoFromURL)); // Decode the syNo value properly
    }
  }, [location]);

  const handleViewClusterClick = (syNo) => {
    // Navigate to the page with syNo as a query parameter
    navigate(`/schemes/earas/cluster?syNo=${encodeURIComponent(syNo)}`);
  };
  return (
    <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400, overflowY: 'auto' }}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#05307a', zIndex: 1 }}>
          <TableRow>
            {['slNo', 'syNo', 'panchayath', 'area', 'villageBlock', 'reserveList'].map((col) => (
              <TableCell key={col} align="center" sx={{ color: 'white' }}>
                <TableSortLabel
                  active={orderBy === col}
                  direction={orderBy === col ? order : 'asc'}
                  onClick={() => createSortHandler(col)}
                  sx={{
                    color: 'white',
                    '&.Mui-active': { color: '#a7ffeb' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' },
                    '& .MuiTableSortLabel-icon.Mui-active': { color: '#a7ffeb !important' },
                  }}
                >
                  <strong>
                    {col === 'area'
                      ? 'Area (Cents)'
                      : col.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </strong>
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell align="center" sx={{ color: 'white' }}>
              <strong>Action</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow
              key={`${row.slNo}-${index}`}
              hover
              sx={{
                '&:hover': {
                  backgroundColor: '#e3f2fd', // light blue hover background
                },
              }}
            >
              <TableCell align="center">{row.slNo}</TableCell>
              <TableCell align="center">{row.syNo}</TableCell>
              <TableCell align="center">{row.panchayth}</TableCell>
              <TableCell align="center">{parseFloat(row.area).toFixed(2)}</TableCell>
              <TableCell align="center">{row.villageBlock}</TableCell>
              <TableCell align="center">{row.reserveList}</TableCell>
              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => handleViewClusterClick(row.syNo)} // Pass the syNo
                >
                  View Cluster
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SampleTable;




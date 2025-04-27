import React from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel } from '@mui/material';

const SampleTable = ({ data }) => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('slNo');

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

  return (
    <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400, overflowY: 'auto' }}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead sx={{ position: 'sticky', top: 0, bgcolor: 'text.disabled' }}>
          <TableRow>
            {['slNo', 'syNo', 'area', 'villageBlock', 'reserveList'].map((col) => (
              <TableCell key={col} align="center">
                <TableSortLabel
                  active={orderBy === col}
                  direction={orderBy === col ? order : 'asc'}
                  onClick={() => createSortHandler(col)}
                >
                  <strong>
                    {col === 'area'
                      ? 'Area (Cents)'
                      : col.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </strong>
                </TableSortLabel>
              </TableCell>
            ))}
            {/* Add the "Action" column for the View Cluster button */}
            <TableCell key="action" align="center">
              <strong>Action</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={`${row.slNo}-${index}`} hover>
              <TableCell align="center">{row.slNo}</TableCell>
              <TableCell align="center">{row.syNo}</TableCell>
              <TableCell align="center">{parseFloat(row.area).toFixed(2)}</TableCell>
              <TableCell align="center">{row.villageBlock}</TableCell>
              <TableCell align="center">{row.reserveList}</TableCell>
              {/* Add the "View Cluster" button in the last column */}
              <TableCell align="center">
                <Button variant="outlined" size="small" color="primary">
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

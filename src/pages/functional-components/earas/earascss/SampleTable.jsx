import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Dialog,         // Import Dialog
  DialogTitle,    // Import DialogTitle
  DialogContent,  // Import DialogContent
  DialogActions,  // Import DialogActions
  TextField,      // Import TextField
  Typography      // Import Typography for potential error message
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const SampleTable = ({ data }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('slNo');
  const location = useLocation();
  const [syNo, setSyNo] = useState('');

  // State for the removal dialog
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedRowToRemove, setSelectedRowToRemove] = useState(null); // To store the row data to be removed
  const [reasonError, setReasonError] = useState(false); // For validation feedback


  const navigate = useNavigate();

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortedData = useMemo(() => {
    return [...data].sort(getComparator(order, orderBy));
  }, [data, order, orderBy]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const syNoFromURL = urlParams.get('syNo');
    if (syNoFromURL) {
      setSyNo(decodeURIComponent(syNoFromURL));
    }
  }, [location]);

  const handleViewClusterClick = (syNo) => {
    navigate(`/schemes/earas/cluster?syNo=${encodeURIComponent(syNo)}`);
  };

  // --- Dialog related functions ---
  const handleOpenRemoveDialog = (row) => {
    setSelectedRowToRemove(row);
    setReason(''); // Clear previous reason
    setReasonError(false); // Clear previous error
    setOpenRemoveDialog(true);
  };

  const handleCloseRemoveDialog = () => {
    setOpenRemoveDialog(false);
    setSelectedRowToRemove(null);
    setReason('');
    setReasonError(false);
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    if (event.target.value.trim() !== '') {
      setReasonError(false); // Clear error if user starts typing
    }
  };

  const handleConfirmRemoval = () => {
    if (reason.trim() === '') {
      setReasonError(true);
      return;
    }
    console.log(`Removing row: ${selectedRowToRemove.syNo} with reason: "${reason}"`);
    // Here you would typically:
    // 1. Make an API call to remove the item from the backend.
    // 2. Update the parent component's state (e.g., filter the `plotData` in `KeyPlot`
    //    to remove the `selectedRowToRemove`). This would likely involve passing
    //    a callback function from `KeyPlot` to `SampleTable`.

    // For demonstration, we'll just close the dialog.
    handleCloseRemoveDialog();
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400, overflowY: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#05307a', zIndex: 1 }}>
            <TableRow>
              {['slNo', 'syNo', 'panchayth', 'area', 'villageBlock', 'reserveList'].map((col) => (
                <TableCell key={col} align="center" sx={{ color: 'white' }}>
                  <TableSortLabel
                    active={orderBy === col}
                    direction={orderBy === col ? order : 'asc'}
                    onClick={createSortHandler(col)}
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
                    backgroundColor: '#e3f2fd',
                  },
                }}
              >
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{row.syNo}</TableCell>
                <TableCell align="center">{row.panchayth}</TableCell>
                <TableCell align="center">{parseFloat(row.area).toFixed(2)}</TableCell>
                <TableCell align="center">{row.villageBlock}</TableCell>
                <TableCell align="center">{row.reserveList}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleViewClusterClick(row.syNo)}
                  >
                    <RemoveRedEyeIcon />
                  </Button>
                  <Button
                    sx={{ color: 'red' }}
                    size="small"
                    onClick={() => handleOpenRemoveDialog(row)} // Pass the current row to the dialog handler
                  >
                    <RemoveCircleIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Removal Confirmation Dialog */}
      <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove Survey Number: <strong>{selectedRowToRemove?.syNo}</strong>?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Removal"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={handleReasonChange}
            error={reasonError}
            helperText={reasonError ? 'Reason is required' : ''}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemoval} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SampleTable;
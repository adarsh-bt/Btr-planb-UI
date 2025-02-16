import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import {
  Typography,
  TextField,
  Stack,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { EditOutlined } from '@ant-design/icons';
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import btrservice from './btrservice';

// Define the columns for the data table
const columns = (handleEdit) => [
  { name: 'SL. NO', selector:(row, index) => index + 1, sortable: true },
  // { name: 'District', selector: (row) => row.dcode, sortable: true },
  // { name: 'Taluk', selector: (row) => row.tcode, sortable: true },
  // { name: 'Village', selector: (row) => row.vcode, sortable: true },
  { name: 'Village', selector: (row) => "പെരിയ", sortable: true },
  { name: 'Block', selector: (row) => row.bcode, sortable: true },
  { name: 'Survey No', selector: (row) => row.resvno, sortable: true },
  { name: 'Sub Div No', selector: (row) => row.resbdno, sortable: true },
  { name: 'Name of Owner', selector: (row) => row.lbtype, sortable: true },
  // { name: 'Address', selector: (row) => row.lbcode, sortable: true },
  { name: 'Address', selector: (row) => "പുല്ലുപെരിയ", sortable: true },
  { name: 'Land Type', selector: (row) => row.ltype, sortable: true },
  { name: 'Total Area', selector: (row) => row.nhect, sortable: true },
  { name: 'Total Area', selector: (row) => row.nare, sortable: true },
  { name: 'Total Area', selector: (row) => row.nsqm, sortable: true },
  {
    name: 'Action',
    cell: (row) => (
      <Button color="success" onClick={() => handleEdit(row)}>
        <EditOutlined />
      </Button>
    ),
    style: {
      padding: '0px', // Remove unnecessary padding
      textAlign: 'center', // Align the buttons in the center
    },
  },
];

// btrservice with the API call to fetch data


const Btr = () => {
  const [filterText, setFilterText] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]); // State to hold the fetched data

  // Function to handle filter change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Filtered data based on the filter text
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  // Function to handle edit action
  const handleEdit = (row) => {
    setSelectedRow(row); // Set the selected row to be edited
    setOpenEditModal(true); // Open the edit modal
  };

  // Function to handle view action
  const handleView = (row) => {
    setSelectedRow(row); // Set the selected row to be viewed
    setOpenViewModal(true); // Open the view modal
  };

  // Function to close modals
  const handleCloseModals = () => {
    setOpenEditModal(false);
    setOpenViewModal(false);
    setSelectedRow(null); // Reset selected row when closing
  };

  // Fetch the data from the API when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      const userid = '9000ff54-14a8-4d5a-a2f4-0553de8ef7d4'; // Replace with the actual user ID
      const response = await btrservice.btr_lists_data(userid);
      if (response?.payload?.data) {
        setData(response.payload.data); // Update the state with the fetched data
      } else {
        console.error("Failed to fetch data:", response.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Breadcrumb />
      <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
            Basic Tax Register (RELIS)
          </Typography>
          <TextField
            label="Filter"
            variant="outlined"
            value={filterText}
            onChange={handleFilterChange}
            size="small"
            style={{ width: '200px' }}
          />
        </Stack>
      </Paper>

      <DataTable
        columns={columns(handleEdit)} // Pass handleEdit to columns function
        data={filteredData} // Display the filtered data
        pagination
        paginationComponentOptions={{
          rowsPerPageText: 'Rows per page',
          rangeSeparatorText: 'of',
          selectAllRowsItemText: 'All',
          selectAllRowsItem: 'Select All',
        }}
        customStyles={{
          headCells: {
            style: {
              fontSize: '.8rem',
              backgroundColor: '#04255e', // Header background color
              color: '#fff', // Header text color
              fontWeight: 'bold', // Bold header text
              borderBottom: '2px solid black', // Classic border style
            },
          },
          cells: {
            style: {
              backgroundColor: '',
              borderBottom: '1px solid white', // Light bottom border for rows
              color: '#333', // Darker text color for better readability
            },
          },
          pagination: {
            style: {
              color: '#04255e', // Change pagination symbols to blue
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
        }}
      />

      {/* Modal for editing */}
      <Dialog open={openEditModal} onClose={handleCloseModals} maxWidth="sm" fullWidth>
        <DialogTitle variant="h4" style={{ color: '#333', fontWeight: 'bold' }}>
          Edit BTR
        </DialogTitle>
        <DialogContent>
          {selectedRow && (
            <DialogContentText>
              <Stack spacing={2} style={{ fontSize: '14px', color: '#333' }}>
                <TextField
                  label="District"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.district}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Taluk"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.taluk}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Village"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.village}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Block"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.block}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Survey No"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.surveyNo}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Sub Div No"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.subDivNo}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Name of Owner"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.ownerName}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Address"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.address}
                  style={{ fontSize: '14px' }}
                />
                <TextField
                  label="Total Area"
                  type="text"
                  fullWidth
                  defaultValue={selectedRow.totalArea}
                  style={{ fontSize: '14px' }}
                />
              </Stack>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCloseModals} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for viewing full details */}
      <Dialog open={openViewModal} onClose={handleCloseModals} maxWidth="md" fullWidth>
        <DialogTitle variant="h4" style={{ color: '#333', fontWeight: 'bold' }}>
          View BTR Details
        </DialogTitle>
        <DialogContent>
          {selectedRow && (
            <DialogContentText>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {Object.keys(selectedRow).map((key) => (
                  <div key={key} style={{ width: '300px', margin: '10px' }}>
                    <strong>{key}:</strong>
                    <div>{selectedRow[key]}</div>
                  </div>
                ))}
              </div>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals} color="secondary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Btr;

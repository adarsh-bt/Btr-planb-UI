import React, { useState } from 'react';
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
import { EyeOutlined } from '@ant-design/icons';
import { borderRadius } from '@mui/system';
import { EditOutlined  } from '@ant-design/icons';
import Breadcrumb from 'routes/Breadcrumb';
// Define the columns for the data table
const columns = (handleEdit, handleView) => [
  { name: 'SL. NO', selector: (row) => row.slNo, sortable: true },
  { name: 'District', selector: (row) => row.district, sortable: true },
  { name: 'Taluk', selector: (row) => row.taluk, sortable: true },
  { name: 'Village', selector: (row) => row.village, sortable: true },
  { name: 'Block', selector: (row) => row.block, sortable: true },
  { name: 'Survey No', selector: (row) => row.surveyNo, sortable: true },
  { name: 'Sub Div No', selector: (row) => row.subDivNo, sortable: true },
  { name: 'Name of Owner', selector: (row) => row.ownerName, sortable: true },
  { name: 'Address', selector: (row) => row.address, sortable: true },
  { name: 'Total Area', selector: (row) => row.totalArea, sortable: true },
  {
    name: 'Action',
    cell: (row) => (
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button
          color="success"
          onClick={() => handleEdit(row)} // Call edit function on click
          style={{ padding: '5px 12px', fontSize: '14px' }} // Adjusted padding and font size
        >
          <EditOutlined />
        </Button>
        <Button
          color="primary"
          onClick={() => handleView(row)} // Call view function on click
          style={{ padding: '5px 12px', fontSize: '14px' }} // Adjusted padding and font size
        >
          <EyeOutlined />
        </Button>
      </div>
    ),
    style: {
      padding: '0px', // Remove unnecessary padding
      textAlign: 'center', // Align the buttons in the center
    },
  },
];

// Sample data for the table
const data = [
  {
    slNo: 1,
    district: 'Thiruvananthapuram',
    taluk: 'Nedumangad',
    village: 'Pothencode',
    block: 'Pothencode Block',
    surveyNo: 'S123',
    subDivNo: 'SD01',
    ownerName: 'John Doe',
    address: '123, Example Street, Pothencode',
    totalArea: '10 Acres',
  },
  {
    slNo: 2,
    district: 'Kochi',
    taluk: 'Kochi',
    village: 'Fort Kochi',
    block: 'Fort Kochi Block',
    surveyNo: 'S124',
    subDivNo: 'SD02',
    ownerName: 'Jane Smith',
    address: '456, Kochi Road, Fort Kochi',
    totalArea: '15 Acres',
  },
  {
    slNo: 3,
    district: 'Kollam',
    taluk: 'Chathannoor',
    village: 'Punnappra',
    block: 'Chathannoor Block',
    surveyNo: 'S125',
    subDivNo: 'SD03',
    ownerName: 'Michael Johnson',
    address: '789, Punnappra Lane, Kollam',
    totalArea: '12 Acres',
  },
  {
    slNo: 4,
    district: 'Alappuzha',
    taluk: 'Alappuzha',
    village: 'Punnappra',
    block: 'Alappuzha Block',
    surveyNo: 'S126',
    subDivNo: 'SD04',
    ownerName: 'Sarah Lee',
    address: '101, Alappuzha West, Alappuzha',
    totalArea: '8 Acres',
  },
  {
    slNo: 5,
    district: 'Pathanamthitta',
    taluk: 'Adoor',
    village: 'Edathua',
    block: 'Adoor Block',
    surveyNo: 'S127',
    subDivNo: 'SD05',
    ownerName: 'David Kim',
    address: '202, Edathua Road, Pathanamthitta',
    totalArea: '20 Acres',
  },
];

const Btr = () => {
  const [filterText, setFilterText] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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

  return (
    <div>
     <Breadcrumb></Breadcrumb>
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
        columns={columns(handleEdit, handleView)} // Pass both handleEdit and handleView
        data={filteredData}
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
              fontSize: '.9rem',
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

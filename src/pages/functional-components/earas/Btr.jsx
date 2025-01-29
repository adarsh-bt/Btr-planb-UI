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
import { borderRadius } from '@mui/system';
import { EditOutlined  } from '@ant-design/icons';
import Breadcrumb from 'routes/Breadcrumb';
// Define the columns for the data table
const columns = (handleEdit) => [
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
      <Button
       
        color="success" // Green color for the button
       
        onClick={() => handleEdit(row)} // Call edit function on click
      >
        <EditOutlined />
      </Button>
    ),
  },
];

// Sample data for the table
const data = [
    {
      slNo: 1,
      district: 'Kollam',
      taluk: 'Kollam',
      village: 'Kollam Village',
      block: 'Block A',
      surveyNo: '001',
      subDivNo: '1',
      ownerName: 'John Doe',
      address: '123 Street, Kollam',
      totalArea: '5.2 acres',
    },
    {
      slNo: 2,
      district: 'Kochi',
      taluk: 'Kochi',
      village: 'Kochi Village',
      block: 'Block B',
      surveyNo: '002',
      subDivNo: '2',
      ownerName: 'Jane Smith',
      address: '456 Street, Kochi',
      totalArea: '3.8 acres',
    },
    {
      slNo: 3,
      district: 'Thiruvananthapuram',
      taluk: 'Neyyattinkara',
      village: 'Neyyattinkara Village',
      block: 'Block C',
      surveyNo: '003',
      subDivNo: '3',
      ownerName: 'Michael Thomas',
      address: '789 Street, Neyyattinkara',
      totalArea: '4.5 acres',
    },
    {
      slNo: 4,
      district: 'Thrissur',
      taluk: 'Thrissur',
      village: 'Thrissur Village',
      block: 'Block D',
      surveyNo: '004',
      subDivNo: '4',
      ownerName: 'Emily Davis',
      address: '101 Street, Thrissur',
      totalArea: '6.3 acres',
    },
    {
      slNo: 5,
      district: 'Alappuzha',
      taluk: 'Alappuzha',
      village: 'Alappuzha Village',
      block: 'Block E',
      surveyNo: '005',
      subDivNo: '5',
      ownerName: 'Sophia Brown',
      address: '202 Street, Alappuzha',
      totalArea: '2.7 acres',
    },
    {
      slNo: 6,
      district: 'Kannur',
      taluk: 'Kannur',
      village: 'Kannur Village',
      block: 'Block F',
      surveyNo: '006',
      subDivNo: '6',
      ownerName: 'William Wilson',
      address: '303 Street, Kannur',
      totalArea: '3.9 acres',
    },
    {
      slNo: 7,
      district: 'Palakkad',
      taluk: 'Palakkad',
      village: 'Palakkad Village',
      block: 'Block G',
      surveyNo: '007',
      subDivNo: '7',
      ownerName: 'Olivia Garcia',
      address: '404 Street, Palakkad',
      totalArea: '5.0 acres',
    },
    {
      slNo: 8,
      district: 'Kozhikode',
      taluk: 'Kozhikode',
      village: 'Kozhikode Village',
      block: 'Block H',
      surveyNo: '008',
      subDivNo: '8',
      ownerName: 'Liam Martinez',
      address: '505 Street, Kozhikode',
      totalArea: '4.1 acres',
    },
    {
      slNo: 9,
      district: 'Ernakulam',
      taluk: 'Aluva',
      village: 'Aluva Village',
      block: 'Block I',
      surveyNo: '009',
      subDivNo: '9',
      ownerName: 'Charlotte White',
      address: '606 Street, Aluva',
      totalArea: '7.2 acres',
    },
    {
      slNo: 10,
      district: 'Malappuram',
      taluk: 'Malappuram',
      village: 'Malappuram Village',
      block: 'Block J',
      surveyNo: '010',
      subDivNo: '10',
      ownerName: 'James Taylor',
      address: '707 Street, Malappuram',
      totalArea: '3.4 acres',
    },
  ];
  

const Btr = () => {
  const [filterText, setFilterText] = useState('');
  const [openModal, setOpenModal] = useState(false);
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
    setOpenModal(true); // Open the modal
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setOpenModal(false);
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
      
        columns={columns(handleEdit)} // Pass handleEdit to columns function
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
                fontSize:'.8rem',
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
             
              alignItems:'center',
              justifyContent:'center'
            },
          },
        }}
      />

      {/* Modal for editing */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle variant='h4' style={{ color: '#333', fontWeight: 'bold' }}>Edit BTR</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <DialogContentText>
              {/* Organized fields using Stack for consistent alignment */}
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
          <Button onClick={handleCloseModal} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCloseModal} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Btr;

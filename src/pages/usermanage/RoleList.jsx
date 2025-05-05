import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Button, TextField, Stack, Paper, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const columns = (handleView) => [
  {
    name: 'SL.NO',
    selector: (row, index) => index + 1, // Automatically number the rows starting from 1
    sortable: true,
    width: '100px',
  },
  {
    name: 'Name',
    selector: (row) => row.name || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '200px',
  },
  {
    name: 'Email',
    selector: (row) => row.email || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '250px',
  },
  {
    name: 'PEN No',
    selector: (row) => row.penNo || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '200px',
  },
  {
    name: 'Roles',
    selector: (row) => row.roles || <span style={{ color: '#888' }}>NA</span>, // Display roles for each row
    sortable: true,
    width: '200px',
  },
  {
    name: 'Schemes',
    selector: (row) => row.schemes || <span style={{ color: '#888' }}>NA</span>, // Display schemes for each row
    sortable: true,
    width: '200px',
  },
  {
    name: 'Action',
    cell: (row) => (
      <Button color="success" onClick={() => handleView(row)} style={{ padding: '5px 10px', minWidth: '0' }}>
        <VisibilityIcon />
      </Button>
    ),
    style: {
      padding: '0px',
      textAlign: 'center',
    },
    width: '100px',
  },
];

const RoleList = () => {
  const [filterText, setFilterText] = useState('');
  const [data, setData] = useState([
    { name: 'Reshma', email: 'reshma@example.com', penNo: '1234567890', roles: 'Admin', schemes: 'Scheme A' },
    { name: 'Adarsh', email: 'adarsh@example.com', penNo: '0987654321', roles: 'User', schemes: 'Scheme B' },
    { name: 'Robin', email: 'robin@example.com', penNo: '1122334455', roles: 'Manager', schemes: 'Scheme C' },
    // Add more rows as needed
  ]);
  const [downloading, setDownloading] = useState(false);

  const navigate = useNavigate();  // Initialize the navigate function

  const handleView = (row) => {
    // Navigate to the '/role' route and pass the row details as state
    navigate('/role', { state: { row } });
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Filtered data based on the filter text
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => {
      const stringValue = value !== null && value !== undefined ? value.toString().toLowerCase() : '';
      return stringValue.includes(filterText.toLowerCase());
    })
  );

  return (
    <div>
      <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
            Role List
          </Typography>

          <TextField
            label="Search"
            variant="outlined"
            value={filterText}
            onChange={handleFilterChange}
            size="small"
            style={{ width: '200px' }}
          />
        </Stack>
      </Paper>

      <DataTable
        columns={columns(handleView)} // Pass handleView to Action column
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
    </div>
  );
};

export default RoleList;

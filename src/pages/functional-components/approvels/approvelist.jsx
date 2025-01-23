import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import DataTable from 'react-data-table-component';

import VisibilityIcon from '@mui/icons-material/Visibility';
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
  Box,
  Tab,
  Tabs,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import functionalservice from '../functionalservice';

const columns = (handleEdit) => [
  { name: 'SL. NO', selector: (row) => row.slNo, sortable: true },
  { name: 'Name', selector: (row) => row.name, sortable: true },
  { name: 'Email', selector: (row) => row.email, sortable: true },
  { name: 'Phone number', selector: (row) => row.mobileNumber, sortable: true },
  { name: 'DOJ', selector: (row) => row.dateOfJoining, sortable: true },
  { name: 'Applied', selector: (row) => row.createdAt, sortable: true },
  {
    name: 'Status',
    selector: (row) => row.status,
    sortable: true,
    cell: (row) => (
      <span
        style={{
          color: row.status === 'Approved' ? 'green' : row.status === 'Pending' ? 'orange' : 'red'
        }}
      >
        {row.status}
      </span>
    )
  },

  {
    name: 'Action',
    cell: (row) => (
      <Button
        color="success" // Green color for the button
        onClick={() => handleEdit(row)} // Call edit function on click
      >
        <VisibilityIcon />
      </Button>
    )
  }
];

// Sample data for the table

const data = [
  {
    slNo: 1,
    name: 'Arun Kumar',
    email: 'arun.kumar@example.com',
    phnumber: '8847596215',
    doj: '24-12-2024',
    status: 'Approved'
  },
  {
    slNo: 2,
    name: 'Lekshmi Nair',
    email: 'lekshmi.nair@example.com',
    phnumber: '9947563210',
    doj: '25-12-2024',
    status: 'Approved'
  }
];

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const [filterText, setFilterText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Function to handle filter change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Filtered data based on the filter text
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => value.toString().toLowerCase().includes(filterText.toLowerCase()))
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [checkboxState, setCheckboxState] = React.useState({
    approved: false,
    marked: false,
    rejected: false
  });

  //   const handleCheckboxChange = (key, value) => {
  //     setCheckboxState((prevState) => ({
  //       ...prevState,
  //       [key]: value,
  //     }));
  //   };
  const [radioState, setRadioState] = React.useState('');

  const handleRadioChange = (value) => {
    setRadioState(value);
  };

  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchUserApprovals = async () => {
      try {
        const response = await functionalservice.user_approvel_list();
        console.log('response>>>', response.payload);
        setUserList(response.payload); // Store the data in state
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      }
    };

    fetchUserApprovals(); // Call the function when the component mounts
  }, []);

  return (
    <div style={{ background: 'white' }}>
      <Typography variant="h4" p={1}>
        Approvals{' '}
      </Typography>
      <hr></hr>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderColor: 'divider', marginLeft: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" indicatorColor="primary">
            <Tab label="New User Request" {...a11yProps(0)} />
            <Tab label="Zone Approvals" {...a11yProps(1)} />
            <Tab label="Others Request" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Paper elevation={3} style={{ padding: '10px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
                New User Request
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
            data={userList}
            pagination
            paginationComponentOptions={{
              rowsPerPageText: 'Rows per page',
              rangeSeparatorText: 'of',
              selectAllRowsItemText: 'All',
              selectAllRowsItem: 'Select All'
            }}
            customStyles={{
              headCells: {
                style: {
                  fontSize: '.8rem',
                  backgroundColor: '#04255e', // Header background color
                  color: '#fff', // Header text color
                  fontWeight: 'bold', // Bold header text
                  borderBottom: '2px solid black' // Classic border style
                }
              },
              cells: {
                style: {
                  backgroundColor: '',
                  borderBottom: '1px solid white', // Light bottom border for rows
                  color: '#333' // Darker text color for better readability
                }
              },
              pagination: {
                style: {
                  color: '#04255e', // Change pagination symbols to blue

                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            }}
          />

          {/* Modal for viewing */}
          <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogTitle
              variant="h4"
              style={{
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '10px',
                background: '#04255e'
              }}
            >
              New User Request {userList}
            </DialogTitle>
            <DialogContent style={{ padding: '20px', backgroundColor: '#fafafa' }}>
              {selectedRow && (
                <DialogContentText>
                  {/* Center-aligned fields with enhanced layout */}
                  <Stack
                    spacing={2}
                    style={{
                      fontSize: '14px',
                      color: '#333',
                      backgroundColor: '#fff',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Display fields in two-column layout */}
                    {[
                      { label: 'Name', value: selectedRow.name },
                      { label: 'Email', value: selectedRow.email },
                      { label: 'Phone Number', value: selectedRow.phnumber },
                      { label: 'Date of Joining', value: selectedRow.doj }
                    ].map((field, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}
                      >
                        <div
                          style={{
                            textAlign: 'right',
                            marginRight: '8px',
                            width: '40%',
                            fontWeight: 'bold',
                            color: '#555'
                          }}
                        >
                          {field.label}:
                        </div>
                        <div
                          style={{
                            textAlign: 'left',
                            width: '60%',
                            backgroundColor: '#f9f9f9',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </Stack>

                  {/* Dropdown for options */}
                  <div
                    style={{
                      marginTop: '20px',
                      textAlign: 'center',
                      padding: '10px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <strong>Category</strong>
                    <br></br>
                    <TextField select fullWidth defaultValue="" variant="outlined" style={{ marginTop: '8px', width: '30%' }}>
                      <MenuItem value="Residential">Residential</MenuItem>
                      <MenuItem value="Commercial">Commercial</MenuItem>
                      <MenuItem value="Industrial">Industrial</MenuItem>
                    </TextField>
                  </div>

                  {/* Horizontal alignment for checkboxes */}
                  <div
                    style={{
                      marginTop: '20px',
                      textAlign: 'center',
                      padding: '10px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <strong>Status:</strong>
                    <FormGroup row style={{ justifyContent: 'center', marginTop: '8px' }}>
                      <FormControlLabel
                        control={<Radio checked={radioState === 'approved'} onChange={() => handleRadioChange('approved')} />}
                        label="Approved"
                      />
                      <FormControlLabel
                        control={<Radio checked={radioState === 'marked'} onChange={() => handleRadioChange('marked')} />}
                        label="Marked"
                      />
                      <FormControlLabel
                        control={<Radio checked={radioState === 'rejected'} onChange={() => handleRadioChange('rejected')} />}
                        label="Rejected"
                      />
                    </FormGroup>
                  </div>

                  {/* Conditional textbox for remarks if "Rejected" is selected */}
                  {radioState === 'rejected' && (
                    <div
                      style={{
                        marginTop: '16px',
                        textAlign: 'center',
                        padding: '10px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <TextField label="Remarks" type="text" fullWidth variant="outlined" style={{ fontSize: '14px' }} />
                    </div>
                  )}
                </DialogContentText>
              )}
            </DialogContent>
            <DialogActions style={{ justifyContent: 'center' }}>
              <Button onClick={handleCloseModal} color="secondary" variant="outlined">
                Close
              </Button>
              <Button onClick={handleCloseModal} color="primary" variant="contained" sx={{ background: '#04255e' }}>
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Zone Details
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          Other Requests
        </CustomTabPanel>
      </Box>
    </div>
  );
}

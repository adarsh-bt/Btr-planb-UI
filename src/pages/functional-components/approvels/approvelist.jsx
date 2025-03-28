import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InvalidTokenError, jwtDecode } from 'jwt-decode';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Directorate from './directorate_users';
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
  FormControl,
  InputLabel,
  Select,
  Radio
} from '@mui/material';
import functionalservice from '../functionalservice';
import RoleSchemeService from 'pages/authentication/services/roleschemeservice';

const columns = (handleEdit) => [
  { name: 'SL. NO', selector: (row, index) => index + 1, sortable: true },
  { name: 'Name', selector: (row) => row.name?.toString(), sortable: true },
  { name: 'Designation', selector: (row) => row.designation?.toString(), sortable: true },
  { name: 'Email', selector: (row) => row.email?.toString(), sortable: true },
  { name: 'Phone number', selector: (row) => row.mobileNumber, sortable: true },
  { name: 'DOJ', selector: (row) => row.dateOfJoining, sortable: true },
  // { name: 'Applied', selector: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'), sortable: true },
  { name: 'Applied', selector: (row) => row.createdAt, sortable: true },
  {
    name: 'Status',
    selector: (row) => row.active,
    sortable: true,
    cell: (row) => (
      <span
        style={{
          color: row.approvalStatus === 'Approved' ? 'green' : row.approvalStatus === 'Marked' ? 'orange' : 'red'
        }}
      >
        {row.approvalStatus === 'Approved' ? row.approvalStatus : row.approvalStatus === false ? row.approvalStatus : row.approvalStatus}
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
        <ManageAccountsIcon />
      </Button>
    )
  }
];

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
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
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [radioState, setRadioState] = React.useState('');
  const [zone, setZone] = useState('');
  const [userList, setUserList] = useState([]);
  const [filterText, setFilterText] = useState('');

  const [schemes, setScheme] = useState('');
  const [roles, setRoles] = useState('');
  const [availableSchemes, setAvailableSchemes] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  // States for filtered users in each tab
  const [districtUsers, setDistrictUsers] = useState([]);
  const [talukUsers, setTalukUsers] = useState([]);
  const [directorateUsers, setDirectorateUsers] = useState([]);

  useEffect(() => {
    // Extract roles from the JWT token and save it to state
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRoles(decodedToken.roles); // Save the roles field into state
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

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

  useEffect(() => {
    if (roles === 'Super Admin') {
      setDirectorateUsers(userList.filter((user) => user.officeType === 'Directorate'));
      setDistrictUsers([]);
      setTalukUsers([]);
    } else {
      setDistrictUsers(userList.filter((user) => user.officeType === 'District'));
      setTalukUsers(userList.filter((user) => user.officeType === 'Taluk'));
      setDirectorateUsers(userList.filter((user) => user.officeType === 'Directorate'));
    }
  }, [userList, roles]); //  Also, include roles in the dependency array

  const handleEdit = (row) => {
    setSelectedRow(row); // Set the selected row to be edited
    setRadioState(row.approvalStatus.toLowerCase()); // Set the radio state to match the approval status (approved/marked/rejected)
    setRemarks(row.remarks);
    setOpenModal(true); // Open the modal
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null); // Reset selected row when closing
  };

  const handleSaveChanges = () => {
    // Close the modal first
    handleCloseModal();

    // SweetAlert2 confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to save changes. Do you want to proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save changes',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Prepare data for the API call
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token); // Decodes the JWT
        const admin_id = decodedToken.sub;
        console.log('admin >>', admin_id);
        console.log('approval id >>', selectedRow.approvalId);
        console.log('remarks >>', remarks);
        const approvalStatus = radioState; // The status ("approved", "marked", "rejected")
        // const remarks = radioState === "rejected" || radioState === "marked" ? remarks : "All documents verified and approved.";  // Sample remarks based on status
        console.log('selec', selectedRow.userId);
        // Construct the payload
        const payload = {
          approvalStatus: approvalStatus === 'approved' ? 'Approved' : approvalStatus === 'marked' ? 'Marked' : 'Rejected',
          approvalDate: new Date().toISOString().split('T')[0],
          remarks: remarks,
          isApproved: approvalStatus === 'approved',
          adminId: admin_id,
          userId: selectedRow ? selectedRow.userId : '',
          id: selectedRow.approvalId
        };

        // Call the API using the separate function
        functionalservice
          .saveApprovalDetails(payload)
          .then((data) => {
            console.log('data >>', data);
            if (data.payload) {
              Swal.fire('Saved!', 'Your changes have been saved.', 'success');
              setUserList((prevUserList) =>
                prevUserList.map((user) =>
                  // Update only the selected user, keep the rest of the users unchanged
                  user.userId === selectedRow.userId
                    ? { ...user, approvalStatus: data.payload.approvalStatus, approvalId: data.payload.id }
                    : user
                )
              );
            } else {
              Swal.fire('Error', data.message || 'Something went wrong, please try again.', 'error');
            }
          })
          .catch((error) => {
            Swal.fire('Error', 'Failed to save changes. Please try again later.', 'error');
          });
      } else {
        Swal.fire('Cancelled', 'Your changes have not been saved.', 'error');
      }
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRadioChange = (value) => {
    setRadioState(value);
  };

  const handleZoneChange = (event) => {
    setZone(event.target.value);
  };

  const handleRoleChange = (event) => {
    setRoles(event.target.value);
  };

  const isSaveEnabled =
    (radioState === 'marked' || radioState === 'rejected' || radioState === 'approved') &&
    roles &&
    schemes &&
    (schemes === 'Earas' ? zone : true);

  const handleFilterChange = (event) => {
    console.log('evenet ?>>', event.target.value);
    setFilterText(event.target.value);
  };

  // Filter data based on the filter text for each user type
  const filteredDistrictUsers = districtUsers.filter((item) =>
    Object.values(item).some((value) => value != null && value.toString().toLowerCase().includes(filterText.toLowerCase()))
  );

  const filteredTalukUsers = talukUsers.filter((item) =>
    Object.values(item).some((value) => value != null && value.toString().toLowerCase().includes(filterText.toLowerCase()))
  );

  const filteredDirectorateUsers = directorateUsers.filter((item) =>
    Object.values(item).some((value) => value != null && value.toString().toLowerCase().includes(filterText.toLowerCase()))
  );

  // Fetch data based on roles
  useEffect(() => {
    const fetchData = async () => {
      if (roles === 'Super Admin') {
        // Fetch all roles if the user is a Super Admin
        try {
          const fetchedRoles = await RoleSchemeService.getRoles();
          if (Array.isArray(fetchedRoles)) {
            setAvailableRoles(fetchedRoles);
          } else {
            console.error('Fetched roles are not an array:', fetchedRoles);
            setAvailableRoles([]);
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
          setAvailableRoles([]);
        }
      } else {
        // Fetch schemes first for other roles
        try {
          const fetchedSchemes = await RoleSchemeService.getSchemes();
          if (Array.isArray(fetchedSchemes)) {
            console.log('schmes set', fetchedSchemes);
            setAvailableSchemes(fetchedSchemes);
          } else {
            console.error('Fetched schemes are not an array:', fetchedSchemes);
            setAvailableSchemes([]);
          }
        } catch (error) {
          console.error('Error fetching schemes:', error);
          setAvailableSchemes([]);
        }
      }
    };

    if (roles) {
      fetchData();
    }
  }, [roles]);

  // Handle scheme selection and fetch roles for the selected scheme
  const handleSchemeChange = async (selectedSchemeId) => {
    setScheme(selectedSchemeId); // Update selected scheme ID in state
    try {
      const fetchedRolesByScheme = await RoleSchemeService.getRolesbySchemes(selectedSchemeId);
      if (Array.isArray(fetchedRolesByScheme)) {
        setAvailableRoles(fetchedRolesByScheme);
      } else {
        console.error('Fetched roles by scheme are not an array:', fetchedRolesByScheme);
        setAvailableRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles by scheme:', error);
      setAvailableRoles([]);
    }
  };

  const handleRoleSelectionChange = (selectedRoleId) => {
    setRoles(selectedRoleId); // Update selected role in state

    if (!selectedRoleId) {
      console.log('No role selected');
      return;
    }

    console.log(`Selected Role ID: ${selectedRoleId}`);
    // Additional logic can be added here if required for role selection
  };

  return (
    <Box style={{ background: 'white' }}>
      <Typography variant="h4" p={1}>
        Approvals{' '}
      </Typography>
      <hr></hr>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderColor: 'Boxider', marginLeft: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" indicatorColor="primary">
            {/* Tabs for IT Admin */}
            {roles === 'IT Admin' && (
              <>
                <Tab label="District Level Users" {...a11yProps(0)} />
                <Tab label="Directorate User Request" {...a11yProps(1)} />
              </>
            )}

            {/* Tabs for Super Admin */}
            {roles === 'Super Admin' && <Tab label="Directorate User Request" {...a11yProps(0)} />}

            {/* Other roles will have different tab configurations */}
            {roles !== 'Super Admin' && roles !== 'IT Admin' && (
              <>
                <Tab label="Taluk Level Users" {...a11yProps(0)} />
                <Tab label="Others Request" {...a11yProps(1)} />
              </>
            )}
          </Tabs>
        </Box>

        {/* District Level Users Tab */}
        <CustomTabPanel value={value} index={0}>
          {roles === 'IT Admin' && (
            <>
              <Paper elevation={3} style={{ padding: '10px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
                    District Level Users
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
                columns={columns(handleEdit)}
                data={filteredDistrictUsers}
                fixedHeader
                fixedHeaderScrollHeight="400px"
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
            </>
          )}
        </CustomTabPanel>

        {/* Taluk Level Users Tab */}
        <CustomTabPanel value={value} index={1}>
          {roles !== 'Super Admin' && roles !== 'IT Admin' && (
            <>
              <Paper elevation={3} style={{ padding: '10px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
                    Taluk Level Users
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
                columns={columns(handleEdit)}
                data={filteredTalukUsers}
                fixedHeader
                fixedHeaderScrollHeight="400px"
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
            </>
          )}
        </CustomTabPanel>

        {/* Directorate User Request Tab */}
        <CustomTabPanel value={value} index={roles === 'IT Admin' ? 1 : 0}>
          <Paper elevation={3} style={{ padding: '10px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
                Directorate User Request
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
            columns={columns(handleEdit)}
            data={filteredDirectorateUsers}
            fixedHeader
            fixedHeaderScrollHeight="400px"
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
        </CustomTabPanel>

        {/* Others Request Tab (If needed, implement filtering and data display similar to above) */}
        <CustomTabPanel value={value} index={3}>
          {roles !== 'Super Admin' && roles !== 'IT Admin' && (
            <>
              <Paper elevation={3} style={{ padding: '10px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
                    Others Request
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
              {/* Implement your data display for "Others Request" here */}
              <DataTable
                columns={columns(handleEdit)}
                data={userList} // to display other user details
                fixedHeader
                fixedHeaderScrollHeight="400px"
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
            </>
          )}
        </CustomTabPanel>

        {/* Modal for editing user details (remains the same) */}
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
            User Request
          </DialogTitle>
          <DialogContent style={{ padding: '20px', backgroundColor: '#fafafa' }}>
            {selectedRow && (
              <DialogContentText>
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
                  {[
                    { label: 'Name', value: selectedRow.name },
                    { label: 'Date Of birth', value: selectedRow.dateOfBirth },
                    { label: 'Email', value: selectedRow.email },
                    { label: 'Phone Number', value: selectedRow.mobileNumber },
                    { label: 'Date of Joining', value: selectedRow.dateOfJoining },
                    { label: 'Pen', value: selectedRow.penNumber },
                    { label: 'Office', value: selectedRow.officeToJoining }
                  ].map((field, index) => (
                    <Box
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}
                    >
                      <Box
                        style={{
                          textAlign: 'right',
                          marginRight: '8px',
                          width: '40%',
                          fontWeight: 'bold',
                          color: '#555'
                        }}
                      >
                        {field.label}:
                      </Box>
                      <Box
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
                      </Box>
                    </Box>
                  ))}
                </Stack>

                {/* Category and Duties Dropdowns */}
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '20px',
                    textAlign: 'center',
                    padding: '10px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
                  }}
                ></Box>

                <div>
                  {/* Render UI conditionally based on user role */}
                  {roles === 'Super Admin' ? (
                    <div>
                      <h2>Available Roles:</h2>
                      <ul>
                        {availableRoles.map((role) => (
                          <li key={role.id}>{role.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <h2>Select a Scheme:</h2>
                      <select onChange={(e) => handleSchemeChange(e.target.value)}>
                        <option value="">-- Select Scheme --</option>
                        {availableSchemes.map((scheme) => (
                          <option key={scheme.id} value={scheme.id}>
                            {scheme.schemeName}
                          </option>
                        ))}
                      </select>

                      <h2>Available Roles</h2>
                      {schemes ? (
                        <FormControl fullWidth>
                          <InputLabel id="available-roles-label">Select Role</InputLabel>
                          <Select
                            labelId="available-roles-label"
                            value={roles}
                            onChange={(event) => handleRoleSelectionChange(event.target.value)} // Updated to handle role change
                          >
                            {availableRoles.map((role) => (
                              <MenuItem key={role.id} value={role.id}>
                                {role.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <p>Please select a scheme to view available roles.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Radio Buttons */}
                <Box
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
                      sx={{ color: 'success.main' }}
                      control={
                        <Radio
                          checked={radioState === 'approved'}
                          onChange={() => handleRadioChange('approved')}
                          value="approved"
                          name="radio-buttons"
                        />
                      }
                      label="Approve"
                    />
                    <FormControlLabel
                      sx={{ color: 'warning.main' }}
                      control={
                        <Radio
                          checked={radioState === 'marked'}
                          onChange={() => handleRadioChange('marked')}
                          value="marked"
                          name="radio-buttons"
                        />
                      }
                      label="Mark"
                    />
                    <FormControlLabel
                      sx={{ color: 'error.main' }}
                      control={
                        <Radio
                          checked={radioState === 'rejected'}
                          onChange={() => handleRadioChange('rejected')}
                          value="rejected"
                          name="radio-buttons"
                        />
                      }
                      label="Reject"
                    />
                  </FormGroup>
                </Box>
                <TextField
                  label="Remarks"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ marginTop: '20px' }}
                />
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} color="success" disabled={!radioState}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

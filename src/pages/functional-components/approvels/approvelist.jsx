import React, { useState,useEffect } from 'react';
import PropTypes from 'prop-types';

import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import DataTable from 'react-data-table-component';
import Swal from "sweetalert2";
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
    Tab,Tabs,
    MenuItem,
    FormGroup,
    FormControlLabel,
  
    Radio,
  } from '@mui/material';
import functionalservice from '../functionalservice';
import { Approval } from '@mui/icons-material';

const columns = (handleEdit) => [
    { name: 'SL. NO', selector:(row, index) => index + 1, sortable: true },
    { name: 'Name', selector: (row) => row.name, sortable: true },
    { name: 'Designation', selector: (row) => row.designation, sortable: true },
    { name: 'Email', selector: (row) => row.email, sortable: true },
    { name: 'Phone number', selector: (row) => row.mobileNumber, sortable: true },
    { name: 'DOJ', selector: (row) => row.dateOfJoining, sortable: true },
    // { name: 'Applied', selector: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'), sortable: true },
    { name: 'Applied', selector: (row) => row.createdAt, sortable: true },
    {
        name: "Status",
        selector: (row) => row.active,sortable: true,
        cell: (row) => (
          <span
          style={{
            color:
              row.approvalStatus === "Approved"
                ? "green"
                : row.approvalStatus === "Marked"
                ? "orange"
                : "red",
          }}
        >
          {row.approvalStatus === "Approved" ? row.approvalStatus : row.approvalStatus === false ? row.approvalStatus : row.approvalStatus}
        </span>
        
        ),
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
      ),
    },
  ];
  

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;



  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);


  
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
      // State for remarks

    // Function to handle filter change
    
  
    // Function to handle edit action
    const handleEdit = (row) => {
      setSelectedRow(row); // Set the selected row to be edited
      setRadioState(row.approvalStatus.toLowerCase()); // Set the radio state to match the approval status (approved/marked/rejected)
      setRemarks(row.remarks)
      setOpenModal(true); // Open the modal
    };
    
  
    // Function to close the modal
    const handleCloseModal = () => {
      setOpenModal(false);
      setSelectedRow(null); // Reset selected row when closing
    };

    
  const [remarks, setRemarks] = useState("");
    const handleSaveChanges = () => {
      // Close the modal first
      handleCloseModal();
    
      // SweetAlert2 confirmation dialog
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to save changes. Do you want to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save changes",
        cancelButtonText: "No, cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          
          // Prepare data for the API call
          const token = localStorage.getItem('token')
          const decodedToken = jwtDecode(token);  // Decodes the JWT
          const admin_id = decodedToken.sub;
          console.log("admin >>",admin_id)
          console.log("approval id >>",selectedRow.approvalId)
          console.log("remarks >>",remarks)
          const approvalStatus = radioState;  // The status ("approved", "marked", "rejected")
          // const remarks = radioState === "rejected" || radioState === "marked" ? remarks : "All documents verified and approved.";  // Sample remarks based on status
          console.log("selec",selectedRow.userId)
          // Construct the payload
          const payload = {
            approvalStatus: approvalStatus === "approved" ? "Approved" : approvalStatus === "marked" ? "Marked" : "Rejected",
            approvalDate: new Date().toISOString().split('T')[0],
            remarks: remarks,
            isApproved: approvalStatus === "approved", 
            adminId: admin_id, 
            userId: selectedRow ? selectedRow.userId : "", 
            id:selectedRow.approvalId
          };
    
          // Call the API using the separate function
          functionalservice.saveApprovalDetails(payload)
            .then((data) => {
              console.log("data >>",data)
              if (data.payload) {
                Swal.fire("Saved!", "Your changes have been saved.", "success");
                setUserList((prevUserList) => 
                  prevUserList.map((user) =>
                    // Update only the selected user, keep the rest of the users unchanged
                    user.userId === selectedRow.userId
                      ? { ...user, approvalStatus: data.payload.approvalStatus,approvalId:data.payload.id }
                      : user
                  )
                );
              } else {
                Swal.fire("Error", data.message || "Something went wrong, please try again.", "error");
              }
            })
            .catch((error) => {
              Swal.fire("Error", "Failed to save changes. Please try again later.", "error");
            });
        } else {
          Swal.fire("Cancelled", "Your changes have not been saved.", "error");
        }
      });
    };
    
  

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [checkboxState, setCheckboxState] = React.useState({
    approved: false,
    marked: false,
    rejected: false,
  });
  
//   const handleCheckboxChange = (key, value) => {
//     setCheckboxState((prevState) => ({
//       ...prevState,
//       [key]: value,
//     }));
//   };
const [radioState, setRadioState] = React.useState("");

const [category, setCategory] = useState('');
const [duties, setDuties] = useState('');


const handleRadioChange = (value) => {
  setRadioState(value);
};

const handleCategoryChange = (event) => {
  setCategory(event.target.value);
};

const handleDutiesChange = (event) => {
  setDuties(event.target.value);
};

const isSaveEnabled = (radioState === 'marked' || radioState === 'rejected' || radioState === 'approved') && category && duties;


const [userList, setUserList] = useState([]);
const [filterText, setFilterText] = useState('');

useEffect(() => {
  const fetchUserApprovals = async () => {
      try {
          const response = await functionalservice.user_approvel_list();
          console.log("response>>>", response.payload);
          setUserList(response.payload); // Store the data in state
      } catch (err) {
          setError(err.response?.data?.message || "An error occurred");
      }
  };

  fetchUserApprovals(); // Call the function when the component mounts
}, []);


const handleFilterChange = (event) => {
  console.log("evenet ?>>",event.target.value)
  setFilterText(event.target.value);
};
console.log("userliat",userList)
// Filtered data based on the filter text
const filteredData = userList.filter((item) =>
  Object.values(item).some((value) =>
    value.toString().toLowerCase().includes(filterText.toLowerCase())
  )
);
console.log("filtr",filterText.toLowerCase())
return (

    <Box style={{background:'white'}}>
    <Typography variant='h4' p={1}>Approvals </Typography>
    <hr></hr>
    <Box sx={{ width: '100%' }}>
      <Box sx={{borderColor: 'Boxider',marginLeft:'1rem' ,justifyContent: 'center',alignItems:'center'}}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"  indicatorColor="primary" >
          <Tab label="New User Request" {...a11yProps(0)} />
          <Tab label="Zone Approvals" {...a11yProps(1)} />
          <Tab label="Others Request" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>


      
      <Paper elevation={3} style={{  padding: '10px',}}>
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


{/* Modal for viewing */}
<Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
  <DialogTitle
    variant="h4"
    style={{
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
      borderBottom: "2px solid #f0f0f0",
      paddingBottom: "10px",
      background: '#04255e',
    }}
  >
    New User Request
  </DialogTitle>
  <DialogContent style={{ padding: "20px", backgroundColor: "#fafafa" }}>
    {selectedRow && (
      <DialogContentText>
        <Stack
          spacing={2}
          style={{
            fontSize: "14px",
            color: "#333",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {[{ label: "Name", value: selectedRow.name },
            { label: "Date Of birth", value: selectedRow.dateOfBirth },
            { label: "Email", value: selectedRow.email },
            { label: "Phone Number", value: selectedRow.mobileNumber },
            { label: "Date of Joining", value: selectedRow.dateOfJoining },
            { label: "Pen", value: selectedRow.penNumber },
            { label: "Office", value: selectedRow.officeToJoining }
          ].map((field, index) => (
            <Box
              key={index}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Box
                style={{
                  textAlign: "right",
                  marginRight: "8px",
                  width: "40%",
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                {field.label}:
              </Box>
              <Box
                style={{
                  textAlign: "left",
                  width: "60%",
                  backgroundColor: "#f9f9f9",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
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
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
            textAlign: "center",
            padding: "10px",
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Category Dropdown */}
          <Box style={{ width: '48%' }}>
            <strong>Category</strong><br></br>
            <TextField
              select
              fullWidth
              value={category}
              onChange={handleCategoryChange}
              variant="outlined"
              style={{ marginTop: "8px" }}
            >
              <MenuItem value="Investigator">Investigator</MenuItem>
              {/* Add other categories as needed */}
            </TextField>
          </Box>

          {/* Duties Dropdown */}
          <Box style={{ width: '48%' }}>
            <strong>Duties</strong><br></br>
            <TextField
              select
              fullWidth
              value={duties}
              onChange={handleDutiesChange}
              variant="outlined"
              style={{ marginTop: "8px" }}
            >
              <MenuItem value="Field Work">Field Work</MenuItem>
              <MenuItem value="Office Work">Office Work</MenuItem>
              <MenuItem value="Research">Research</MenuItem>
              {/* Add other duties as needed */}
            </TextField>
          </Box>
        </Box>

        {/* Status Radio Buttons */}
        <Box
          style={{
            marginTop: "20px",
            textAlign: "center",
            padding: "10px",
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <strong>Status:</strong>
        <FormGroup row style={{ justifyContent: "center", marginTop: "8px" }}>
        
  <FormControlLabel
    sx={{ color: 'success.main' }}
    control={
      <Radio
        checked={radioState === "approved"}
        onChange={() => handleRadioChange("approved")}
        disabled={selectedRow.approvalStatus === "Approved"} // Make "Approved" radio button read-only
      />
    }
    label="Approved"
  />
  <FormControlLabel
    sx={{ color: 'warning.main' }}
    control={
      <Radio
        checked={radioState === "marked"}
        onChange={() => handleRadioChange("marked")}
        disabled={selectedRow.approvalStatus === "Approved"} 
      />
    }
    label="Marked"
  />
  <FormControlLabel
    sx={{ color: 'error.main' }}
    control={
      <Radio
        checked={radioState === "rejected"}
        onChange={() => handleRadioChange("rejected")}
        disabled={selectedRow.approvalStatus === "Approved"} 
      />
    }
    label="Rejected"
  />
</FormGroup>
{selectedRow.approvalStatus === "Approved" ? <Typography sx={{ color: 'primary.main' }}>Already Approved only View</Typography> : null}
        </Box>

        {/* Remarks Textbox if Rejected */}
        {(radioState === "rejected" || radioState === "marked") && (
          <Box
            style={{
              marginTop: "16px",
              textAlign: "center",
              padding: "10px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              backgroundColor: "#fff",
              boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <TextField
              label="Remarks"
              type="text"
              fullWidth
              variant="outlined"
              style={{ fontSize: "14px" }}
              value={remarks}  // Bind to state
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Box>
        )}
      </DialogContentText>
    )}
  </DialogContent>
  <DialogActions style={{ justifyContent: "center" }}>
    <Button onClick={handleCloseModal} color="secondary" variant="outlined">
      Close
    </Button>
    <Button
      onClick={handleSaveChanges}
      color="primary"
      variant="contained"
      sx={{ background: '#04255e' }}
      disabled={!isSaveEnabled}
    >
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
    </Box>
  );
}
import React, { useState,useEffect } from 'react';
import PropTypes from 'prop-types';

import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import DataTable from 'react-data-table-component';
import Swal from "sweetalert2";

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VerifiedIcon from '@mui/icons-material/Verified';


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
    FormControl,
    InputLabel,
    Select,
    Radio,
  } from '@mui/material';
import functionalservice from '../functionalservice';
import approvalservice from './approvalservice';
import authservice from 'pages/authentication/services/authservice';


const columns = (handleEdit) => [
    { name: 'SL. NO', selector:(row, index) => index + 1, sortable: true },
    { name: 'Name', selector: (row) => row.name, sortable: true },
    { name: 'Designation', selector: (row) => row.designation, sortable: true },
    { name: 'Email', selector: (row) => row.email, sortable: true },
    { name: 'Phone number', selector: (row) => row.mobileNumber, sortable: true },
    { name: 'DOJ', selector: (row) => row.dateOfJoining, sortable: true },
    { name: 'Applied', selector: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'), sortable: true },
    // { name: 'Applied', selector: (row) => row.createdAt, sortable: true },
    {
        name: "Status",
        selector: (row) => row.active,sortable: true,
        cell: (row) => (
          <span
          style={{
            color:
              row.approvalStatus === "Approved"
                ? "green"
                : row.approvalStatus === "pending"
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
  onClick={row.approvalStatus === "Approved" ? null : () => handleEdit(row)} // Conditionally disable the click handler
>
  {row.approvalStatus === "Approved" ? <VerifiedIcon /> : <ManageAccountsIcon />}
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

export default function Directorate({data}) {
  const [value, setValue] = React.useState(0);


  const [schemeRolePairs, setSchemeRolePairs] = useState([{ schemeId: '', roleId: '' }]);
const [rolesMap, setRolesMap] = useState({});
const[zoneVisble, setzoneVisble] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
 const [zonesList, setZonesList] = useState([]);
      // State for remarks

    // Function to handle filter change
    
  
    // Function to handle edit action
    const handleEdit = (row) => {
      setSelectedRow(row); 
      setRadioState(row.approvalStatus.toLowerCase()); 
      setRemarks(row.remarks || ""); // Reset remarks to row's value or empty
      setSelectedScheme(""); // Reset scheme selection
      setSelectedRole(""); // Reset role selection
      setOpenModal(true); 
      setZone("")
    };
    
  
    // Function to close the modal
    const handleCloseModal = () => {
      setOpenModal(false);
      setSelectedRow(null); // Reset selected row when closing
    };


    const addSchemeRolePair = () => {
      setSchemeRolePairs([...schemeRolePairs, { schemeId: '', roleId: '' }]);
     
    };
    
    const updateSchemeRolePair = async (index, field, value) => {
      if (field === "roleId" && value == "1"){
        setzoneVisble(true)
      }else{
        setzoneVisble(false)
      }
      const updatedPairs = [...schemeRolePairs];
      updatedPairs[index][field] = value;
      
      if (field === 'schemeId') {
        updatedPairs[index].roleId = '';
        if (!rolesMap[value]) {
          try {
            // Fetch roles and zones in parallel
            const [rolesResponse, zonesResponse] = await Promise.all([
              approvalservice.allrolesBySchems(value),
              approvalservice.zoneslist(selectedRow.officeType, selectedRow.officeId)
            ]);
          
            // Cache roles for the scheme
            setRolesMap((prev) => ({
              ...prev,
              [value]: rolesResponse.payload
            }));
          
            // Update zones list
            setZonesList(zonesResponse.payload);
            setSelectedRole('');
            setZone('');
          }catch (error) {
            setZonesList([])
            console.error('Error fetching roles for scheme', error);
          }
        }
      }
    
      setSchemeRolePairs(updatedPairs);
    };
    
    const removeSchemeRolePair = (index) => {
      if (schemeRolePairs.length > 1) {
        const updatedPairs = [...schemeRolePairs];
        updatedPairs.splice(index, 1);
        setSchemeRolePairs(updatedPairs);
      }
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
          const admin_id = authservice.userid();
          const approvalStatus = radioState;
          const filteredPairs = schemeRolePairs.filter(pair => pair.schemeId && pair.roleId);
          
const payload = {
  approvalStatus: approvalStatus === 'approved' ? 'Approved' : approvalStatus === 'pending' ? 'Pending' : 'Rejected',
  approvalDate: new Date().toISOString().split('T')[0],
  remarks: remarks,
  isApproved: approvalStatus === 'approved',
  adminId: admin_id,
  userId: selectedRow ? selectedRow.userId : "", 
  id: selectedRow.approvalId,
  roleSchemes: selectedRole
    ? [
        {
          roleId: selectedRole,
          schemeId: null
        }
      ]
    : filteredPairs.map(pair => ({
        roleId: pair.roleId,
        schemeId: pair.schemeId
      }))
    
};
          // const payload = {
          //   approvalStatus: approvalStatus === "approved" ? "Approved" : approvalStatus === "pending" ? "pending" : "Rejected",
          //   approvalDate: new Date().toISOString().split('T')[0],
          //   remarks: remarks,
          //   isApproved: approvalStatus === "approved",
          //   adminId: admin_id,
          //   userId: selectedRow ? selectedRow.userId : "",
          //   id: selectedRow.approvalId,
          //   roleId: selectedRole
          // };

    
          // Call the API using the separate function
          let ser;
    
          if (admrole === "Super Admin") {
            ser = approvalservice.saveSuperadminApproval(payload);
          } else if (admrole === "IT Admin") {
            ser = approvalservice.saveItadminApproval(payload);
          }
    
          ser.then((data) => {
            
            if (data.payload) {
              Swal.fire("Saved!", "Your changes have been saved.", "success");
            
    
              setUserList((prevUserList) =>
                prevUserList.map((user) =>
                  user.userId === selectedRow.userId
                    ? { ...user, approvalStatus: data.payload.approvalStatus, approvalId: data.payload.id }
                    : user
                )
              );
    
      
              // Now, after saving the approval, check if zone needs to be saved
              if (zone !== null && data.payload.loginId !== null) {
              
                // Call the zone_save API with required parameters
                approvalservice.zone_save(zone, data.payload.loginId, admin_id)
                  .then((zoneResponse) => {
                  
                    // Optionally, handle zone save success, like showing a notification
                  })
                  .catch((zoneError) => {
                  
                    Swal.fire("Error", "Failed to save zone information. Please try again later.", "error");
                  });
              }
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

  // const [checkboxState, setCheckboxState] = React.useState({
  //   approved: false,
  //   pending: false,
  //   rejected: false,
  // });
  
//   const handleCheckboxChange = (key, value) => {
//     setCheckboxState((prevState) => ({
//       ...prevState,
//       [key]: value,
//     }));
//   };
const [radioState, setRadioState] = React.useState("");


const [zone, setZone] = useState('');

const [schemesList, setSchemesList] = useState([]);
const [selectedScheme, setSelectedScheme] = useState('');
const [rolesList, setRolesList] = useState([]);
const [selectedRole, setSelectedRole] = useState('');
 const [admrole,setAdmrole] = useState('');



const handleRadioChange = (value) => {
  setRadioState(value);

  // Clear role/selection when not "approved"
  if (value !== "approved") {
    setSelectedRole('');
    // setSchemeRolePairs([]); // Or your initial state
  }
};




const handleSchemeChange = (event) => {
  setSchemesList(event.target.value);
};

const handleZoneChange = (event) => {
  setZone(event.target.value);
};

const handleRoleChange = (event) => {
  setRolesList(event.target.value);
};




// const isSaveEnabled = 
//   (radioState === 'pending' || radioState === 'rejected' || 
//     (radioState === 'approved' && selectedRole !== '')) && 
//   rolesList && 
//   schemesList && 
//   (schemesList === 'Earas' ? zone : true); 
const isApprovedWithValidPairs =
  radioState === 'approved' &&
  schemeRolePairs.some(pair => pair.schemeId && pair.roleId) &&
  schemeRolePairs.every(pair => {
    const isDuplicate = schemeRolePairs.some(otherPair =>
      pair !== otherPair &&
      pair.schemeId === otherPair.schemeId &&
      pair.roleId === otherPair.roleId
    );
    return !isDuplicate;
  });

const isApprovedWithSelectedRole = radioState === 'approved' && (selectedRole !== '') ;

const isSaveEnabled =
  radioState === 'pending' ||
  radioState === 'rejected' ||
  isApprovedWithValidPairs ||
  isApprovedWithSelectedRole;

// Optional zone check (uncomment if needed)
// && (selectedScheme === '1' ? !!zone : true);




const [userList, setUserList] = useState([]);
const [filterText, setFilterText] = useState('');

useEffect(() => {
  const fetchUserApprovals = async () => {
    try {
      const userRole = authservice.getrole();
      console.log("len of data",data)
      Array.isArray(data)
      if (!data || data.length === 0) {
        const response = await approvalservice.superadmin_approval();
        console.log("api response >> ", response.payload);
        setUserList(response.payload.directorateUsersy || []);
    
    
    }else{
      console.log("data set >>>", data);
      setUserList(data); // Ensure userList is always an array
     console.log("varible assign  ",userList)
    } setAdmrole(userRole);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  fetchUserApprovals();
}, []);


// Fetch initial data based on user type
useEffect(() => {
  const fetchInitialData = async () => {
    if (admrole === 'Super Admin') {
   
      // Fetch all roles for super admin
      const rolesResponse = await approvalservice.allroles();
      const schemesResponse = await approvalservice.allschmes();
      setSchemesList(schemesResponse.payload);

      setRolesList(rolesResponse.payload);
    } else if (admrole === 'IT Admin' || admrole === 'Super Admin') {
    
      // Fetch all schemes for district user
      const schemesResponse = await approvalservice.allschmes();
      setSchemesList(schemesResponse.payload);
    }
  };
  fetchInitialData();
}, [admrole]);

// Fetch roles when scheme changes (for district users)
// useEffect(() => {
//   console.log("zone  >>> ",zone)
//   if (admrole === 'IT Admin' && selectedScheme) {
//     const fetchSchemeRolesAndZones = async () => {
//       try {
//         // Fetch both roles and zones in parallel
//         const [rolesResponse, zoneslist] = await Promise.all([
//           approvalservice.allrolesBySchems(selectedScheme),
//           approvalservice.zoneslist(selectedRow.officeType, selectedRow.officeId)
//         ]);
//         setZonesList(zoneslist.payload);
//         setRolesList(rolesResponse.payload);
//         setSelectedRole(''); 
//         setZone('');
//       } catch (error) {
//         setZonesList([])
//         console.error('Error fetching data', error);
//       }
//     };
//     fetchSchemeRolesAndZones();
//   }
// }, [selectedScheme, admrole]);



const handleFilterChange = (event) => {
  console.log("evenet ?>>",event.target.value)
  setFilterText(event.target.value);
};
console.log("User List currenly dir>>> ",userList);
// // Filtered data based on the filter text
// const filteredData = Array.isArray(userList) ? userList.filter((item) =>
//   Object.values(item).some((value) =>
//     value.toString().toLowerCase().includes(filterText.toLowerCase())
//   )
// ) : [];
const filteredData = userList.filter((item) =>
  Object.values(item).some((value) =>
    String(value).toLowerCase().includes(filterText.toLowerCase())
  )
);

return (

 
   
    <Box sx={{ width: '100%' }}>
     
   


      
      <Paper elevation={3} style={{  padding: '10px',}}>
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


{/* Modal for District Users */}
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
            { label: "Designation", value: selectedRow.designation },
            { label: "Date Of birth", value: selectedRow.dateOfBirth },
            { label: "Email", value: selectedRow.email },
            { label: "Phone Number", value: selectedRow.mobileNumber },
            { label: "Date of Joining", value: selectedRow.dateOfJoining },
            { label: "Pen", value: selectedRow.penNumber },
            { label: "Office", value: selectedRow.officeType }
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
        {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 1,
          m: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      > */}
        <Box
          style={{
            display: "flex",
            justifyContent: 'center',
            marginTop: "20px",
            textAlign: "center",
            padding: "10px",
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
          }}
        >
         

{/* shcemes */}
{/* Conditionally render Schemes dropdown only for District users */}

{((admrole === 'Super Admin' || admrole === "IT Admin") && selectedRow.designation !== "Deputy Director -IT" ) && (
  <Stack direction="column" spacing={2} alignItems="center">
    {schemeRolePairs.map((pair, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Scheme Dropdown */}
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Scheme</InputLabel>
          <Select
            value={pair.schemeId}
            onChange={(e) => updateSchemeRolePair(index, 'schemeId', e.target.value)}
            label="Scheme"
          >
            {schemesList.map((scheme) => (
              <MenuItem key={scheme.id} value={scheme.id}>
                {scheme.schemeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Role Dropdown */}
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={pair.roleId}
            onChange={(e) => updateSchemeRolePair(index, 'roleId', e.target.value)}
            label="Role"
            disabled={!pair.schemeId}
          >
            {(rolesMap[pair.schemeId] || []).map((role) => (
              <MenuItem
                key={role.id}
                value={role.id}
                disabled={schemeRolePairs.some((p, i) =>
                  i !== index &&
                  p.schemeId === pair.schemeId &&
                  p.roleId === role.id
                )}
              >
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Buttons */}
        {index === schemeRolePairs.length - 1 && (
          <Button onClick={addSchemeRolePair} variant="contained" color="primary" size="small">
            +
          </Button>
        )}

        {schemeRolePairs.length > 1 && (
          <Button
            onClick={() => removeSchemeRolePair(index)}
            variant="contained"
            color="error"
            size="small"
          >
            -
          </Button>
        )}
      </Box>
    ))}
  </Stack>
)}

{/* Always show Roles dropdown */}
{(admrole === 'Super Admin' && selectedRow.designation === "Deputy Director -IT" ) && (
<Box style={{ width: '48%' }}>
  <strong>Role</strong><br />
  <TextField
    select
    fullWidth
    value={selectedRole}
    onChange={(e) => setSelectedRole(e.target.value)} 
    variant="outlined"
    style={{ marginTop: "8px" }}
  >
    {rolesList.map((role) => (
      <MenuItem key={role.id} value={role.id}>
        {role.name}
      </MenuItem>
    ))}
  </TextField>
</Box>
)}
        </Box>
 {/* zones */}
 {/* { (selectedScheme == '1' && selectedRole == "1") && ( */}
{(zoneVisble === true && selectedRow.designation !== 'Deputy Director -IT') && (
  <Box style={{ width: '30%', margin: 'auto' }}>
    <center><strong>Select Zone</strong></center>
    <TextField
      select
      fullWidth
      value={zone}
      onChange={(e) => setZone(e.target.value)}
      variant="outlined"
      style={{ marginTop: "8px" }}
    >
      {zonesList && zonesList.length > 0 ? ( // Add this check
        zonesList.map((zone) => (
          <MenuItem key={zone.zoneId} value={zone.zoneId}>
            {zone.zoneNameEn}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No zones available</MenuItem>
      )}
    </TextField>
  </Box>
)}

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
        checked={radioState === "pending"}
        onChange={() => handleRadioChange("pending")}
        disabled={selectedRow.approvalStatus === "Approved"} 
      />
    }
    label="pending"
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
        {(radioState === "rejected" || radioState === "pending") && (
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
 {/* Duties Dropdown */}
          {/* <Box style={{ width: '30%' }}>
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
           
            </TextField>
          </Box> */}    
     
  
    </Box>
  );
}
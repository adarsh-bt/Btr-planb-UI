import React, { useState,useEffect } from 'react';
import PropTypes from 'prop-types';

import {InvalidTokenError, jwtDecode} from 'jwt-decode';
import DataTable from 'react-data-table-component';
import Swal from "sweetalert2";

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
import auth from 'contexts/auth-reducer/auth';
import authservice from 'pages/authentication/services/authservice';
import Taluk from './talukusers';

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
         
          onClick={() => handleEdit(row)} // Call edit function on click
        >
          <ManageAccountsIcon />
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

const a11yProps = (index) => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const [admrole,setAdmrole] = useState('');
  

  const [schemeRolePairs, setSchemeRolePairs] = useState([{ schemeId: '', roleId: '' }]);
const [rolesMap, setRolesMap] = useState({});
const[zoneVisble, setzoneVisble] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
      // State for remarks

    // Function to handle filter change
    
    useEffect(() => {
      const userRole = authservice.getrole(); // Or get it from localStorage, etc.
      setAdmrole(userRole);
    }, []);
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
      const updatedPairs = [...schemeRolePairs];
      updatedPairs[index][field] = value;
      if (field === "roleId" && value == "1"){
        setzoneVisble(true)
        console.log("zpne viss ",zoneVisble)
      }else{
        setzoneVisble(false)
      }
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
          
          // Prepare data for the API call
          const token = localStorage.getItem('token')
          const decodedToken = jwtDecode(token);  // Decodes the JWT
          const admin_id = decodedToken.sub;
          // console.log("admin >>",admin_id)
          // console.log("approval id >>",selectedRow.approvalId)
          // console.log("remarks >>",remarks)
          // console.log("select role >>",selectedRole)
          const approvalStatus = radioState;  // The status ("approved", "marked", "rejected")
          // const remarks = radioState === "rejected" || radioState === "marked" ? remarks : "All documents verified and approved.";  // Sample remarks based on status
          // console.log("selec",selectedRow.userId)
          // Construct the payload
          const payload = {
            approvalStatus: approvalStatus === "approved" ? "Approved" : approvalStatus === "pending" ? "pending" : "Rejected",
            approvalDate: new Date().toISOString().split('T')[0],
            remarks: remarks,
            isApproved: approvalStatus === "approved", 
            adminId: admin_id, 
            userId: selectedRow ? selectedRow.userId : "", 
            id:selectedRow.approvalId,
            roleId:selectedRole
          };
    
         if(admrole === "IT Admin"){
          var apicall = approvalservice.saveItadminApproval(payload)
          
          console.log("zone saved")

         }else if(admrole === "District Level Approver"){
         
         
          var apicall = approvalservice.saveDisApproval(payload)
         }
         
            apicall.then((data) => {
              // console.log("data >>",data)
              if (data.payload) {
                Swal.fire("Saved!", "Your changes have been saved.", "success");
                // setUserList((prevUserList) => 
                //   prevUserList.map((user) =>
                //     // Update only the selected user, keep the rest of the users unchanged
                //     user.userId === selectedRow.userId
                //       ? { ...user, approvalStatus: data.payload.approvalStatus,approvalId:data.payload.id }
                //       : user
                //   )
                // );
                if (value === 0) { // District Level Users tab
                  setUserListDis(prev => 
                    prev.map(user => 
                      user.userId === selectedRow.userId
                        ? { ...user, approvalStatus: data.payload.approvalStatus, approvalId: data.payload.id }
                        : user
                    )
                  );
                  console.log("admin ",admin_id)
                  console.log("admin ",zone)
                  console.log("userid ",data.payload.loginId)
                   if (zone !== null && data.payload.loginId !== null) {
                                 // Call the zone_save API with required parameters
                      approvalservice.zone_save(zone, data.payload.loginId, admin_id)
                            .then((zoneResponse) => {
                            }).catch((zoneError) => {
                             Swal.fire("Error", "Failed to save zone information. Please try again later.", "error");
                  });
              }
                } else if (value === 2) { // Directorate Users tab
                  setUserList(prev => 
                    prev.map(user => 
                      user.userId === selectedRow.userId
                        ? { ...user, approvalStatus: data.payload.approvalStatus, approvalId: data.payload.id }
                        : user
                    )
                  );
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
  //   marked: false,
  //   rejected: false,
  // });
  
//   const handleCheckboxChange = (key, value) => {
//     setCheckboxState((prevState) => ({
//       ...prevState,
//       [key]: value,
//     }));
//   };
const [radioState, setRadioState] = React.useState("");


const [schemes, setScheme] = useState('');
const [zone, setZone] = useState('');
const [roles, setRoles] = useState('');

const [schemesList, setSchemesList] = useState([]);
const [selectedScheme, setSelectedScheme] = useState('');
const [rolesList, setRolesList] = useState([]);
const [selectedRole, setSelectedRole] = useState('');

const [zonesList, setZonesList] = useState([]);

const handleRadioChange = (value) => {
  setRadioState(value);
};



const handleSchemeChange = (event) => {
  setScheme(event.target.value);
};

const handleZoneChange = (event) => {
  setZone(event.target.value);
};

const handleRoleChange = (event) => {
  setRoles(event.target.value);
};


// const isSaveEnabled = 
//   (radioState === 'pending' || radioState === 'rejected' || 
//     (radioState === 'approved' && selectedRole !== '')) && 
//   rolesList && 
//   schemesList && 
//   (schemesList === 'Earas' ? zone : true); 

const isDeputyDirector = selectedRow?.designation === 'Deputy Director -Districts';
const isStatisticalInvestigator = selectedRow?.designation === 'Statistical Investigator';

// Zone is required *only* for Statistical Investigator + selectedScheme === '1'
const isZoneValid = !(selectedScheme === '1' && isStatisticalInvestigator) || !!zone;

// Button should be enabled only if:
const isSaveEnabled = (
  (radioState === 'pending' || radioState === 'rejected') || 
  (
    radioState === 'approved' && (
      (isDeputyDirector && selectedRole !== '') || // Role required for Deputy Director
      (!isDeputyDirector) // No role needed for others
    )
  )
) && rolesList && schemesList && isZoneValid;



const [userList, setUserList] = useState([]);
const [userList2, setUserList2] = useState([]);
const [userListDis, setUserListDis] = useState([]);
const [filterText, setFilterText] = useState('');
const [DisfilterText, setDisFilterText] = useState('');

useEffect(() => {
  const fetchInitialData = async () => {
    if (admrole === 'IT Admin') {
   
      // Fetch all roles for super admin
      const rolesResponse = await approvalservice.allroles();
      console.log("role payload ",rolesResponse)
      setRolesList(rolesResponse.payload);
    } else if (admrole === 'District Level Approver') {
     
      console.log("schmed  ",admrole)
      // Fetch all schemes for district user
      const schemesResponse = await approvalservice.allschmes();
      console.log("schmre ",schemesResponse.payload)
      setSchemesList(schemesResponse.payload);
    }
  };
  fetchInitialData();
}, [admrole]);


useEffect(() => {
  if ((admrole === 'IT Admin' || admrole === 'District Level Approver') && selectedScheme) {
    const fetchSchemeRolesAndZones = async () => {

      try{
        const [rolesResponse, zoneslist] = await Promise.all([
          approvalservice.allrolesBySchems(selectedScheme),
          approvalservice.zoneslist(selectedRow.officeType, selectedRow.officeId)
        ]);
        
        setZonesList(zoneslist.payload);
        setRolesList(rolesResponse.payload);
        setSelectedRole(''); // Reset role selection when scheme changes
        setZone('');
      }catch (error) {
        console.error('Error fetching data', error);
    };
  }
    fetchSchemeRolesAndZones();
  }
}, [selectedScheme, admrole]);


useEffect(() => {
  const fetchUserApprovals = async () => {

    
    try {
      if (admrole === "Super Admin") {
       
        var response = await approvalservice.superadmin_approval();
        // console.log("super admin approval ", response.payload)
        setUserList(response.payload);
      } else if (admrole === "IT Admin") {
        var response = await approvalservice.itadmin_approval();
        setUserList(response.payload.directorateUsers); 
        setUserListDis(response.payload.districtUsers);
        setUserList2(response.payload.talukUsers);
        // console.log("director IT ",response.payload.directorateUsers)
        // console.log("distict IT ",response.payload.districtUsers)
      }else if(admrole === "District Level Approver"){
        // console.log("disttict admin set")
        var response = await approvalservice.districtadmin_approval();
        // console.log("dist admin data ", response.payload.districtUsers)
        setUserListDis(response.payload.districtUsers);
        setUserList(response.payload.talukUsers); 
      }else if(admrole == "Taluk Level Approver"){
        alert(ok)
        var response = await approvalservice.tsoadmin_roleassign();
        setUserList(response.payload); 
      }
     
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  fetchUserApprovals();
}, [admrole]); // Make sure admrole is updated before fetching



const handleFilterChange = (event) => {
 
  setFilterText(event.target.value);
  setDisFilterText(event.target.value)
};
// console.log("userliat",userList)
// Filtered data based on the filter text
const filteredData = userList.filter((item) =>
  Object.values(item).some((value) =>
    value.toString().toLowerCase().includes(filterText.toLowerCase())
  )
);

const filteredDataTalukforIT = userList2.filter((item) =>
  Object.values(item).some((value) =>
    value.toString().toLowerCase().includes(filterText.toLowerCase())
  )
);

// console.log("dis uses")
const filteredDataDis = userListDis.filter((item) =>
  Object.values(item).some((value) =>
    value.toString().toLowerCase().includes(DisfilterText.toLowerCase())
)
);
// console.log("filtr",filterText.toLowerCase())
return (

    <Box style={{background:'white'}}>
    <Typography variant='h4' p={1}>Approvals</Typography>
    <hr></hr>
    <Box sx={{ width: '100%' }}>
  <Box sx={{ borderColor: 'Boxider', marginLeft: '1rem', justifyContent: 'center', alignItems: 'center' }}>
    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" indicatorColor="primary">
      {[
        // Tab configurations in order of desired appearance
        { label: 'District Level Users', roles: ['IT Admin', 'District Level Approver'] },
        { label: 'Taluk Level Users', roles: ['District Level Approver','IT Admin'] },
        { label: 'Directorate Users', roles: ['IT Admin', 'Super Admin'] },
        { label: 'Taluk Level Users', roles: ['Taluk Level Approver'] },
      ]
      .filter(tab => tab.roles.includes(admrole))
      .map((tab, index) => (
        <Tab key={index} label={tab.label} {...a11yProps(index)} />
      ))}
    </Tabs>
  </Box>
  {[
    /* Panel contents in the same order as tabs */
    <Paper elevation={3} style={{ padding: '10px' }}>
    <Paper elevation={3} style={{  padding: '10px',}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
          Districts User Request
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
      {/* District Users content */}
       <DataTable
            
              columns={columns(handleEdit)} // Pass handleEdit to columns function
              data={filteredDataDis}
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
    </Paper>,
    <Paper elevation={3} style={{ padding: '10px' }}>
    <Taluk data={admrole === "IT Admin" ? filteredDataTalukforIT : filteredData} />

      {/* Taluk Users content */}
    </Paper>,
    <Directorate data={filteredData} />,
    <Taluk></Taluk>
  ]
  .filter((_, index) => 
    // Match the same filtering logic as tabs
    [
      ['IT Admin', 'District Level Approver'],
      ['District Level Approver','IT Admin'],
      ['IT Admin', 'Super Admin'],
      ['Taluk Level Approver']
    ][index].includes(admrole)
  )
  .map((content, index) => (
    <CustomTabPanel key={index} value={value} index={index}>
      {content}
    </CustomTabPanel>
  ))}


      {/* <CustomTabPanel value={value} index={0}>

      <Paper elevation={3} style={{  padding: '10px',}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
          District Users Requestssss
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
      /> */}


{/* Modal for District Users */}


    

{/* Modal for Taluk Users */}
{/* <Dialog open={openModal2} onClose={handleCloseModal} maxWidth="sm" fullWidth> */}

      {/* </CustomTabPanel> */}
      {/* Taluk Table */}
      {/* <CustomTabPanel value={value} index={1}>
      <Paper elevation={3} style={{  padding: '10px',}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
          Taluk User Request 
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
      </CustomTabPanel>
       */}
      {/* <CustomTabPanel value={value} index={2}>
      {value}
      <Directorate></Directorate>
      </CustomTabPanel> */}
      {/* <CustomTabPanel value={value} index={3}>
        Other Requests
      </CustomTabPanel> */}
    </Box>


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
            { label: "Office", value: selectedRow.distict }
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
    flexDirection: "column",
    alignItems: "center", // This centers the whole column
    marginTop: "20px",
    textAlign: "center",
    padding: "10px",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 0 5px rgba(193, 8, 8, 0.1)",
  }}
>

{/* IT ADMIN CASE */}
{/* IT ADMIN CASE */}
{!(
  (admrole === 'IT Admin' && selectedRow.designation !== 'Deputy Director -Districts') ||
  admrole === 'District Level Approver'
) && (
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



{/* Dis Admin Case */}
{admrole !== 'IT Admin' && (

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

</Box>




 {/* zones */}
 {/* { (selectedScheme == '1' && selectedRole == "1") && ( */}
 { (zoneVisble === true) && (
        <Box style={{ width: '30%',margin:'auto' }}>
            <center><strong>Select Zone</strong></center>
            <TextField
              select
              fullWidth
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              variant="outlined"
              style={{ marginTop: "8px" }}
            >
               {zonesList.map((zone)=>(
                            <MenuItem key={zone.zoneId} value={zone.zoneId}>{zone.zoneNameEn}</MenuItem>
                          ))}
            </TextField>
          </Box>)
 }
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
    </Box>
  );
}
import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Typography,
  Stack,
  MenuItem,
  Box,Grid
} from "@mui/material";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ApprovedUserService from "pages/functional-components/approvels/ApprovedUserService";
import Breadcrumb from "routes/Breadcrumb";
import authservice from "pages/authentication/services/authservice";

const RoleList = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [level, setLevel] = useState("ALL");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [search, setSearch] = useState("");

  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  

  const [loading, setLoading] = useState(false);
  const [loggedDistrictId, setLoggedDistrictId] = useState(null);
const [loggedTalukId, setLoggedTalukId] = useState(null);

const role = authservice.getrole();
const userId = authservice.userid();

  // Columns
  const columns = [
    { name: "SL.NO", selector: (row, idx) => idx + 1 + page * size, width: "90px" },
    { name: "Name", selector: row => row.name ?? "NA", },
    { name: "Email", selector: row => row.email ?? "NA" },
    { name: "PEN No", selector: row => row.empNumber ?? row.penNo ?? "NA" },
    { name: "Designation", selector: row => row.designation ?? row.roles ?? "NA" },
    { name: "Office Location", selector: row => row.officelocation ?? "NA" },
    {
      name: "Action",
      cell: (row) => (
        <button
          style={{
            background: "green",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "none",
          }}
          onClick={() => navigate("/User_Manage/Manage_Users/User_Details", { state: { userId: row.userId } })}
        >
          <VisibilityIcon />
        </button>
      ),
      width: "100px",
    },
  ];

  // --------------------------
  // Fetch USERS
  // --------------------------
const fetchUsers = async () => {
  setLoading(true);

  const res = await ApprovedUserService.fetchPagedApprovedUsers({
    page,
    size,
    level: level === "ALL" ? null : level,
         // null instead of ""
    districtId: district || null,   
    talukId: taluk || null,
    search: search || null,
  });

  if (!res.error && res.payload) {
    console.log("Fetched Users:", res.payload.distId, res.payload.talukId);
    setUsers(res.payload.content);
    setTotalRows(res.payload.totalElements);
     setLoggedDistrictId(res.payload.distId || null);
  setLoggedTalukId(res.payload.talukId || null);
  } else {
    setUsers([]);
    setTotalRows(0);
  }

  setLoading(false);
};


// -------------------------
// RESET TALUK WHEN DISTRICT CHANGES
// -------------------------
useEffect(() => {
  setTaluk("");   // taluk always depends on district
}, [district]);

useEffect(() => {
  setPage(0);
}, [search]);

// -------------------------
// AUTO-SET LEVEL WHEN DISTRICT OR TALUK CHANGES
// -------------------------
useEffect(() => {
  if (taluk) {
    setLevel("TALUK");
  } else if (district) {
    setLevel("DISTRICT");
  } else {
    setLevel("ALL");
  }
}, [district, taluk]);


// -------------------------
// RESET DISTRICT/TALUK WHEN LEVEL CHANGES
// -------------------------
useEffect(() => {
  // IT Admin behaviour
  if (role !== "District Level Approver") {
    if (level === "ALL" || level === "DIRECTORATE") {
      setDistrict("");
      setTaluk("");
    }

    if (level === "DISTRICT") {
      setTaluk("");
    }
  }

  // District Level Approver → DO NOTHING
}, [level, role]);



useEffect(() => {
  if (
    role === "District Level Approver" &&
    loggedDistrictId &&
    !district        // 🔥 IMPORTANT
  ) {
    setDistrict(loggedDistrictId);
    setLevel("DISTRICT");
  }
}, [role, loggedDistrictId, district]);


  // Fetch district list
  const loadDistricts = async () => {
    const res = await ApprovedUserService.getDistricts();
    if (res.payload) setDistricts(res.payload);
  };

  // Fetch taluks when district changes
  const loadTaluks = async () => {
    if (!district) {
      setTaluks([]);
      setTaluk("");
      return;
    }
    const res = await ApprovedUserService.getTaluks(district);
    if (res.payload) setTaluks(res.payload);
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    loadTaluks();
  }, [district]);

  useEffect(() => {
    fetchUsers();
  }, [page, size, level, district, taluk, search]);

  return (
    <Grid container spacing={3}>
      <Breadcrumb/>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          User Management
        </Typography>

  {/* Filters */}
<Paper elevation={3} style={{ padding: "14px", marginBottom: "16px", width:"100%"}}>
  <Stack
    direction="row"
    spacing={2}
    justifyContent="center"
    alignItems="center"
    style={{ width: "90%" }}
  >
   

    {/* LEVEL */}
    {(role != "Taluk Level Approver" && role != "District Level Approver") && 
    <TextField
      label="Office Type"
      select
      size="small"
      value={level}
      onChange={(e) => setLevel(e.target.value)}
      style={{ width: "180px" }}
    >
      <MenuItem value="ALL">All</MenuItem>
      <MenuItem value="DIRECTORATE">Directorate</MenuItem>
      <MenuItem value="DISTRICT">District</MenuItem>
      <MenuItem value="TALUK">Taluk</MenuItem>
    </TextField>}

    {/* DISTRICT */}
  {role !== "Taluk Level Approver" && (
  <TextField
    label="District"
    select
    size="small"
    value={district}
    onChange={(e) => setDistrict(e.target.value)}
    style={{ width: "180px" }}
    disabled={
      level === "DIRECTORATE" ||
      role === "District Level Approver"
    }
  >
    {/* "All" ONLY for IT Admin / Super Admin */}
    {role !== "District Level Approver" && (
      <MenuItem value="">All</MenuItem>
    )}

    {districts.map((d) => (
      <MenuItem
        key={d.districtOfficeId}
        value={d.districtOfficeId}
      >
        {d.districtOfficeNameEn}
      </MenuItem>
    ))}
  </TextField>
)}


    {/* TALUK */}
    {role != "Taluk Level Approver" && 
    <TextField
      label="Taluk"
      select
      size="small"
      value={taluk}
      onChange={(e) => setTaluk(e.target.value)}
      style={{ width: "180px" }}
      disabled={!district || level === "DIRECTORATE"}
    >
      {role !== "District Level Approver" && (
  <MenuItem value="">All</MenuItem>
)}

      {taluks.map((t) => (
        <MenuItem key={t.desTalukId} value={t.desTalukId}>
          {t.talukOfficeNameEn}
        </MenuItem>
      ))}
    </TextField>}

    {/* SEARCH */}
    <TextField
      label="Search"
      size="small"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ width: "220px" }}
    />
  </Stack>
</Paper>




      {/* TABLE */}
      <Box>
        <DataTable
          columns={columns}
          data={users}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={(pg) => setPage(pg - 1)}
          onChangeRowsPerPage={(perPage) => setSize(perPage)}
          customStyles={{
            headCells: {
              style: {
                background: "#04255e",
                color: "white",
                fontWeight: "bold",
              },
            },
          }}
        />
      </Box>
    </Grid>
    </Grid>
  );
};

export default RoleList;




// import React, { useState, useEffect, useCallback } from 'react';
// import DataTable from 'react-data-table-component';
// import { Button, TextField, Stack, Paper, Typography, Box, Tabs, Tab } from '@mui/material';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';

// import ApprovedUserService from 'pages/functional-components/approvels/ApprovedUserService';

// import authservice from 'pages/authentication/services/authservice';
// import Breadcrumb from 'routes/Breadcrumb';

// // Helper function to determine office location

// // Columns definition (update as per your API fields)
// const columns = (handleView) => [
//   {
//     name: 'SL.NO',
//     selector: (row, index) => index + 1,
//     sortable: true,
//     width: '150px'
//   },
//   {
//     name: 'Name',
//     selector: (row) => row.name || <span style={{ color: '#888' }}>NA</span>,
//     sortable: true,
//     width: '300px'
//   },
//   {
//     name: 'Email',
//     selector: (row) => row.email || <span style={{ color: '#888' }}>NA</span>,
//     sortable: true,
//     width: '250px'
//   },
//   {
//     name: 'PEN No',
//     selector: (row) => row.empNumber || row.penNo || <span style={{ color: '#888' }}>NA</span>,
//     sortable: true,
//     width: '270px'
//   },
//   {
//     name: 'Designation',
//     selector: (row) => row.designation || row.roles || <span style={{ color: '#888' }}>NA</span>,
//     sortable: true,
//     width: '300px'
//   },
//   {
//     name: 'Office Location',
//     selector: (row) => row.officelocation || <span style={{ color: '#888' }}>NA</span>,
//     sortable: true,
//     width: '250px'
//   },
//   {
//     name: 'Action',
//     cell: (row) => (
//       <Button color="success" onClick={() => handleView(row)} style={{ padding: '5px 10px', minWidth: '0' }}>
//         <VisibilityIcon />
//       </Button>
//     ),
//     style: {
//       padding: '0px',
//       textAlign: 'center'
//     },
//     width: '100px'
//   }
// ];

// // CustomTabPanel for tab content display
// function CustomTabPanel({ children, value, index }) {
//   return (
//     <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
//       {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
//     </div>
//   );
// }

// const roleTabsMap = {
//   'IT Admin': ['Directorate', 'District', 'Taluk'],
//   'Super Admin': ['Directorate', 'District', 'Taluk'],
//   'District Level Approver': ['District', 'Taluk'],
//   'Taluk Level Approver': ['Taluk']
// };

// const RoleList = () => {
//   const [filterText, setFilterText] = useState('');
//   const [tabIndex, setTabIndex] = useState(0);

//   // Dynamic data states
//   const [talukUsers, setTalukUsers] = useState([]);
//   const [districtUsers, setDistrictUsers] = useState([]);
//   const [directorateUsers, setDirectorateUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState('');
//   const [error, setError] = useState('');

//   const navigate = useNavigate();

//   const handleView = (row) => {
//   navigate('/User_Manage/Manage_Users/User_Details', { state: { userId: row.userId || row.id } });
// };

//   const handleFilterChange = (event) => {
//     setFilterText(event.target.value);
//   };

//   // Filtering logic
//   const getFilteredData = useCallback(
//     (users) =>
//       users.filter((item) =>
//         Object.values(item).some((value) => {
//           const stringValue = value !== null && value !== undefined ? value.toString().toLowerCase() : '';
//           return stringValue.includes(filterText.toLowerCase());
//         })
//       ),
//     [filterText]
//   );

//   // Fetch data based on admin role
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) throw new Error('No token found');
//         const decodedToken = jwtDecode(token);
//         // You may need to adjust this depending on your JWT structure
//         const userRole = decodedToken.roles || decodedToken.role || decodedToken.authorities?.[0] || '';
//         // const userRolea = authservice.getrole();
//         setRole(userRole);

//         if (userRole === 'IT Admin' ) {
//           // IT Admin sees all three categories
//           const res = await ApprovedUserService.fetchITAdminApprovedUsers();
//           console.log("resssss  IT Admin >>>  ",res)
//           if (res.error) throw new Error(res.message);
//           setTalukUsers(res.payload.talukUsers || []);
//           setDistrictUsers(res.payload.districtUsers || []);
//           setDirectorateUsers(res.payload.directorateUsers || []);
//         } else if (userRole === 'Super Admin') {
//           // Super Admin sees all three categories
//           const res = await ApprovedUserService.fetchSuperAdminApprovedUsers();
//           console.log("resssss  super admin >>>  ",res)
//           if (res.error) throw new Error(res.message);
//           setTalukUsers(res.payload.talukUsers || []);
//           setDistrictUsers(res.payload.districtUsers || []);
//           setDirectorateUsers(res.payload.directorateUsers || []);
//         }
//         else if (userRole === 'District Level Approver') {
//           // District Admin sees only district and taluk
//           const res = await ApprovedUserService.fetchDistrictAdminApprovedUsers();
//           if (res.error) throw new Error(res.message);
//           setTalukUsers(res.payload.talukUsers || []);
//           setDistrictUsers(res.payload.districtUsers || []);
//           setDirectorateUsers([]); // No directorate users for district admin
//         } 
//         else if (userRole === 'Taluk Level Approver') {
//           // Taluk Admin sees only taluk
//           const res = await ApprovedUserService.fetchTalukAdminApprovedUsers();
//           if (res.error) throw new Error(res.message);
         
//           setTalukUsers(res.payload.talukUsers || []);
//           setDistrictUsers([]); // No district users for taluk admin
//           setDirectorateUsers([]); // No directorate users for taluk admin
//         } 
//         else {
//           setError('Unauthorized or unknown admin role');
//         }
//       } catch (err) {
//         setError(err.message+"aa" || 'Failed to fetch user data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Tab data mapping
//   const tabDataMap = {
//     Directorate: { label: 'Directorate Level Users', data: directorateUsers },
//     District: { label: 'District Level Users', data: districtUsers },
//     Taluk: { label: 'Taluk Level Users', data: talukUsers }
//   };

//   // Build tabs dynamically based on role
//   const tabs = (roleTabsMap[role] || []).map((key) => tabDataMap[key]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   return (
//     <div>
//         <Breadcrumb></Breadcrumb>
//       <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="center">
//           <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
//             Role List
//           </Typography>
//           <TextField
//             label="Search"
//             variant="outlined"
//             value={filterText}
//             onChange={handleFilterChange}
//             size="small"
//             style={{ width: '200px' }}
//           />
//         </Stack>
//       </Paper>

//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//         <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} aria-label="user level tabs">
//           {tabs.map((tab, idx) => (
//             <Tab key={tab.label} label={tab.label} />
//           ))}
//         </Tabs>
//       </Box>

//       {tabs.map((tab, idx) => (
//         <CustomTabPanel value={tabIndex} index={idx} key={tab.label}>
//           <DataTable
//             columns={columns(handleView)}
//             data={getFilteredData(tab.data)}
//             pagination
//             paginationComponentOptions={{
//               rowsPerPageText: 'Rows per page',
//               rangeSeparatorText: 'of',
//               selectAllRowsItemText: 'All',
//               selectAllRowsItem: 'Select All'
//             }}
//             customStyles={{
//               headCells: {
//                 style: {
//                   fontSize: '.9rem',
//                   backgroundColor: '#04255e',
//                   color: '#fff',
//                   fontWeight: 'bold',
//                   borderBottom: '2px solid black'
//                 }
//               },
//               cells: {
//                 style: {
//                   borderBottom: '1px solid white',
//                   color: '#333'
//                 }
//               },
//               pagination: {
//                 style: {
//                   color: '#04255e',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }
//               }
//             }}
//           />
//         </CustomTabPanel>
//       ))}
//     </div>
//   );
// };

// export default RoleList;
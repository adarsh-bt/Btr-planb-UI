import React, { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { Button, TextField, Stack, Paper, Typography, Box, Tabs, Tab } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import ApprovedUserService from 'pages/functional-components/approvels/ApprovedUserService';

import authservice from 'pages/authentication/services/authservice';

// Helper function to determine office location

// Columns definition (update as per your API fields)
const columns = (handleView) => [
  {
    name: 'SL.NO',
    selector: (row, index) => index + 1,
    sortable: true,
    width: '150px'
  },
  {
    name: 'Name',
    selector: (row) => row.name || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '300px'
  },
  {
    name: 'Email',
    selector: (row) => row.email || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '250px'
  },
  {
    name: 'PEN No',
    selector: (row) => row.empNumber || row.penNo || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '270px'
  },
  {
    name: 'Designation',
    selector: (row) => row.designation || row.roles || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '300px'
  },
  {
    name: 'Office Location',
    selector: (row) => row.officelocation || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '250px'
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
      textAlign: 'center'
    },
    width: '100px'
  }
];

// CustomTabPanel for tab content display
function CustomTabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const roleTabsMap = {
  'IT Admin': ['Directorate', 'District', 'Taluk'],
  'District Level Approver': ['District', 'Taluk'],
  'Taluk Level Approver': ['Taluk']
};

const RoleList = () => {
  const [filterText, setFilterText] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  // Dynamic data states
  const [talukUsers, setTalukUsers] = useState([]);
  const [districtUsers, setDistrictUsers] = useState([]);
  const [directorateUsers, setDirectorateUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleView = (row) => {
  navigate('/role', { state: { userId: row.userId || row.id } });
};

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Filtering logic
  const getFilteredData = useCallback(
    (users) =>
      users.filter((item) =>
        Object.values(item).some((value) => {
          const stringValue = value !== null && value !== undefined ? value.toString().toLowerCase() : '';
          return stringValue.includes(filterText.toLowerCase());
        })
      ),
    [filterText]
  );

  // Fetch data based on admin role
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const decodedToken = jwtDecode(token);
        // You may need to adjust this depending on your JWT structure
        const userRole = decodedToken.roles || decodedToken.role || decodedToken.authorities?.[0] || '';
        // const userRolea = authservice.getrole();
        setRole(userRole);

        if (userRole === 'IT Admin') {
          // IT Admin sees all three categories
          const res = await ApprovedUserService.fetchITAdminApprovedUsers();
          console.log("resssss  >>>  ",res)
          if (res.error) throw new Error(res.message);
          setTalukUsers(res.payload.talukUsers || []);
          setDistrictUsers(res.payload.districtUsers || []);
          setDirectorateUsers(res.payload.directorateUsers || []);
        } else if (userRole === 'District Level Approver') {
          // District Admin sees only district and taluk
          const res = await ApprovedUserService.fetchDistrictAdminApprovedUsers();
          if (res.error) throw new Error(res.message);
          setTalukUsers(res.payload.talukUsers || []);
          setDistrictUsers(res.payload.districtUsers || []);
          setDirectorateUsers([]); // No directorate users for district admin
        } else {
          setError('Unauthorized or unknown admin role');
        }
      } catch (err) {
        setError(err.message+"aa" || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tab data mapping
  const tabDataMap = {
    Directorate: { label: 'Directorate Level Users', data: directorateUsers },
    District: { label: 'District Level Users', data: districtUsers },
    Taluk: { label: 'Taluk Level Users', data: talukUsers }
  };

  // Build tabs dynamically based on role
  const tabs = (roleTabsMap[role] || []).map((key) => tabDataMap[key]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} aria-label="user level tabs">
          {tabs.map((tab, idx) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, idx) => (
        <CustomTabPanel value={tabIndex} index={idx} key={tab.label}>
          <DataTable
            columns={columns(handleView)}
            data={getFilteredData(tab.data)}
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
                  fontSize: '.9rem',
                  backgroundColor: '#04255e',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderBottom: '2px solid black'
                }
              },
              cells: {
                style: {
                  borderBottom: '1px solid white',
                  color: '#333'
                }
              },
              pagination: {
                style: {
                  color: '#04255e',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }
            }}
          />
        </CustomTabPanel>
      ))}
    </div>
  );
};

export default RoleList;

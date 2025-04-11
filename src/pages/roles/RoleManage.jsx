import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import roleManageService from 'pages/authentication/services/rolemanageservice';

const RoleManage = () => {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [roles, setRoles] = useState([]);

  // Fetch all schemes on mount
  useEffect(() => {
    const fetchSchemes = async () => {
      const result = await roleManageService.getAllSchemes();
      if (Array.isArray(result)) {
        setSchemes(result);
      } else {
        console.error(result.message);
      }
    };

    fetchSchemes();
  }, []);

  // Fetch roles when scheme changes
  useEffect(() => {
    const fetchRoles = async () => {
      if (!selectedScheme) return;
      const result = await roleManageService.getRoles(selectedScheme);
      if (Array.isArray(result.payload)) {
        setRoles(result.payload); // Use payload to get roles
      } else {
        console.error(result.message);
      }
    };
    fetchRoles();
  }, [selectedScheme]);

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: 'auto',
        padding: 3,
        borderRadius: 1,
        boxShadow: 3,
        backgroundColor: '#fff',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Create Role</h2>
      <Grid container spacing={2}>
        {/* Scheme Dropdown */}
        <Grid item xs={12}>
          <Typography variant="h6">Select Scheme</Typography>
          <Select
            fullWidth
            value={selectedScheme}
            onChange={(e) => {
              setSelectedScheme(e.target.value);
              setRoles([]); // Clear roles when scheme changes
            }}
            variant="outlined"
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Scheme
            </MenuItem>
            {schemes.map((scheme) => (
              <MenuItem key={scheme.id} value={scheme.id}>
                {scheme.schemeName}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Read-Only Roles Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Roles for Selected Scheme:
          </Typography>
          {roles.length > 0 ? (
            <Box sx={{ padding: 1, border: '1px solid #ddd', borderRadius: '4px' }}>
              {roles.map((role) => (
                <Typography key={role.id} sx={{ marginBottom: '8px' }}>
                  • {role.name}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography>No roles available for the selected scheme.</Typography>
          )}
        </Grid>

        {/* Role Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Role Name"
            placeholder="Eg: Admin, Officer"
            variant="outlined"
          />
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Permissions:
          </Typography>
          <FormControlLabel control={<Checkbox defaultChecked />} label="Add User" />
          <FormControlLabel control={<Checkbox />} label="Edit User" />
          <FormControlLabel control={<Checkbox />} label="Delete User" />
          <FormControlLabel control={<Checkbox defaultChecked />} label="View Dashboard" />
          <FormControlLabel control={<Checkbox defaultChecked />} label="Manage Schemes" />
          <FormControlLabel control={<Checkbox />} label="Upload Files" />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button fullWidth variant="contained" color="primary">
            Create Role
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleManage;

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
  Typography
} from '@mui/material';
import roleManageService from 'pages/authentication/services/rolemanageservice';

const RoleManage = () => {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchPermission, setSearchPermission] = useState('');
  const [roleName, setRoleName] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

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

  useEffect(() => {
    const fetchRoles = async () => {
      if (!selectedScheme) return;
      const result = await roleManageService.getRoles(selectedScheme);
      if (Array.isArray(result.payload)) {
        setRoles(result.payload);
      } else {
        console.error(result.message);
      }
    };
    fetchRoles();
  }, [selectedScheme]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedScheme) return;
      const result = await roleManageService.getPermissions(selectedScheme);
      if (Array.isArray(result.payload)) {
        setPermissions(result.payload);
      } else {
        console.error(result.message);
      }
    };
    fetchPermissions();
  }, [selectedScheme]);

  const filteredPermissions = permissions.filter((perm) =>
    perm.permissionName.toLowerCase().includes(searchPermission.toLowerCase())
  );

  const handleCreateRole = async () => {
    if (!roleName || !selectedScheme || selectedPermissionIds.length === 0) {
      alert('Please fill in all fields and select permissions.');
      return;
    }

    const userData = {
      roleName,
      schemesId: Number(selectedScheme),
      isActive: true,
      permissions: selectedPermissionIds
    };

    const result = await roleManageService.saveOrUpdateRole(userData); // ✅ Corrected function call

    if (result?.message) {
      alert(result.message);
    } else {
      alert('Role successfully created!');
      setRoleName('');
      setSelectedPermissionIds([]);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: 'auto',
        padding: 3,
        borderRadius: 1,
        boxShadow: 3,
        backgroundColor: '#fff'
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Create Role</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Select Scheme</Typography>
          <Select
            fullWidth
            value={selectedScheme}
            onChange={(e) => {
              setSelectedScheme(e.target.value);
              setRoles([]);
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

        {selectedScheme && (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Roles for Selected Scheme:
            </Typography>
            {roles.length > 0 ? (
              <Box sx={{ padding: 1, border: '1px solid #ddd', borderRadius: '4px' }}>
                <Grid container spacing={1}>
                  {roles
                    .reduce((rows, role, index) => {
                      if (index % 2 === 0) {
                        rows.push([role]);
                      } else {
                        rows[rows.length - 1].push(role);
                      }
                      return rows;
                    }, [])
                    .map((row, idx) => (
                      <Grid container item spacing={1} key={idx}>
                        {row.map((role) => (
                          <Grid item xs={6} key={role.id}>
                            <Typography>• {role.name}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                    ))}
                </Grid>
              </Box>
            ) : (
              <Typography>No roles available for the selected scheme.</Typography>
            )}
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Add Role Name"
            placeholder="Eg: Admin, Officer"
            variant="outlined"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </Grid>

        {selectedScheme && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Permissions:</Typography>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search permissions"
                value={searchPermission}
                onChange={(e) => setSearchPermission(e.target.value)}
              />
            </Box>

            {filteredPermissions.length > 0 ? (
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  padding: 1
                }}
              >
                {filteredPermissions.map((permission) => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Checkbox
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setSelectedPermissionIds((prev) =>
                            isChecked ? [...prev, permission.id] : prev.filter((id) => id !== permission.id)
                          );
                        }}
                      />
                    }
                    label={permission.permissionName}
                  />
                ))}
              </Box>
            ) : (
              <Typography>No matching permissions found.</Typography>
            )}
          </Grid>
        )}

        <Grid item xs={12}>
          <Button fullWidth variant="contained" color="primary" onClick={handleCreateRole}>
            Create Role
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleManage;

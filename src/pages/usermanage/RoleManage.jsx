import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Grid, MenuItem, Select, TextField, Typography } from '@mui/material';
import roleManageService from 'pages/authentication/services/rolemanageservice';
import AttributionIcon from '@mui/icons-material/Attribution';
import Swal from 'sweetalert2';

const RoleManage = () => {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchPermission, setSearchPermission] = useState('');
  const [roleName, setRoleName] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);

const assignableRoles = roles.filter(
  (role) => role.id !== editingRoleId // prevent assigning itself
);


const [selectedAssignableRoleIds, setSelectedAssignableRoleIds] = useState([]);


  // ✅ Fetch Schemes
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

  // ✅ Fetch Roles when Scheme changes
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

  // ✅ Fetch Permissions when Scheme changes
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

  // ✅ Filter permissions based on search
  const filteredPermissions = permissions.filter((perm) =>
    perm.permissionName.toLowerCase().includes(searchPermission.toLowerCase())
  );

  // ✅ Create / Update Role (combined)
  const handleSaveRole = async () => {
    if (!roleName || !selectedScheme || selectedPermissionIds.length === 0) {
      Swal.fire('Validation Error', 'Please fill in all fields and select permissions.', 'warning');
      return;
    }

    const userData = {
      id: editingRoleId, // only if editing
      roleName,
      schemesId: Number(selectedScheme),
      isActive: true,
      permissions: selectedPermissionIds,
      childRoleId: selectedAssignableRoleIds
    };

    const result = await roleManageService.saveOrUpdateRole(userData);
   
    if (result?.message === 'Successfully created' || result?.message === 'Successfully updated') {
      Swal.fire({
        icon: 'success',
        title: result.message,
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload(); // or smarter refresh
      });
    } else {
      Swal.fire('Error', result?.message || 'Something went wrong.', 'error');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: 'auto',
        padding: 3,
        borderRadius: 1,
        boxShadow: 3,
        backgroundColor: '#fff'
      }}
    >
      <h2 style={{ textAlign: 'center' }}>
        {editingRoleId ? 'Edit Role' : 'Create Role'}
      </h2>

      <Grid container spacing={2}>
        {/* Scheme Selection */}
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

        {/* Roles List */}
        {selectedScheme && (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Roles for Selected Scheme:
            </Typography>
         {roles.length > 0 ? (
  <Box
    sx={{
      padding: 1,
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      backgroundColor: '#fafafa',
    }}
  >
    <Grid container spacing={2}>
      {roles.map((role) => (
        <Grid item xs={12} sm={6} key={role.id}>
          <Box
            onClick={async () => {
              const data = await roleManageService.fetchRoleById(role.id);
              if (data?.id) {
                setEditingRoleId(data.id);
                setRoleName(data.roleName);
                setSelectedPermissionIds(data.permissions);
                setSelectedAssignableRoleIds(data.childRoleId || []);
              } else {
                Swal.fire(
                  'Error',
                  data.message || 'Unable to fetch role details.',
                  'error'
                );
              }
            }}
            sx={{
              padding: 1.5,
              border: editingRoleId === role.id
                ? '2px solid #1976d2'
                : '1px solid #ccc',
              borderRadius: 2,
              backgroundColor:
                editingRoleId === role.id ? '#e3f2fd' : '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#e3f2fd',
                boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                transform: 'scale(1.02)',
              },
            }}
          > <AttributionIcon
              sx={{
                color: editingRoleId === role.id ? "#1976d2" : "#616161",marginRight:'7px'
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: editingRoleId === role.id ? '#1976d2' : '#333',
              }}
            >
             
              {role.name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
) : (
  <Typography>No roles available for the selected scheme.</Typography>
)}

          </Grid>
        )}

        {/* Role Name Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Add Role Name"
            placeholder="Eg: Admin, Officer"
            variant="outlined"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            inputProps={{ maxLength: 40 }}
          />
        </Grid>

        {/* Permissions Section */}
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
                <Grid container spacing={1}>
                  {filteredPermissions.map((permission) => (
                    <Grid item xs={12} sm={6} md={4} key={permission.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedPermissionIds((prev) =>
                                isChecked
                                  ? [...prev, permission.id]
                                  : prev.filter((id) => id !== permission.id)
                              );
                            }}
                          />
                        }
                        label={permission.permissionName}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Typography>No matching permissions found.</Typography>
            )}
          </Grid>
        )}

        {/* Assignable Roles Section */}
{/* Assignable Roles Section */}
{selectedScheme && (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1 }}>
      Assignable Roles:
    </Typography>

    {assignableRoles.length > 0 ? (
      <Box
        sx={{
          maxHeight: 200,
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 1,
          padding: 1,
          backgroundColor: '#fafafa'
        }}
      >
        <Grid container spacing={1}>
          {assignableRoles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedAssignableRoleIds.includes(role.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedAssignableRoleIds((prev) =>
                        checked
                          ? [...prev, role.id]
                          : prev.filter((id) => id !== role.id)
                      );
                    }}
                  />
                }
                label={role.roleName || role.name}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    ) : (
      <Typography>No assignable roles available.</Typography>
    )}
  </Grid>
)}



        {/* Cancel Edit Button */}
        {editingRoleId && (
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => {
                setEditingRoleId(null);
                setRoleName('');
                setSelectedPermissionIds([]);
                setSelectedAssignableRoleIds([]);
              }}
              sx={{ mt: 1 }}
            >
              Cancel Editing
            </Button>
          </Grid>
        )}

        {/* Create / Update Button */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSaveRole}
          >
            {editingRoleId ? 'Update Role' : 'Create Role'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleManage;
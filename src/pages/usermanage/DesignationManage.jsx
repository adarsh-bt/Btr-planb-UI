import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DesignationManageService from 'pages/authentication/services/designationmanageservice'; // Assuming this path is correct
import Swal from 'sweetalert2';
import { Switch, FormControlLabel } from '@mui/material';

// Styles for the Active/Inactive chips
const getStatusStyles = (isActive) => ({
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  marginLeft: 1.5,
  backgroundColor: isActive ? '#e8f5e9' : '#ffebee', // Light green/red background
  color: isActive ? '#2e7d32' : '#c62828', // Dark green/red text
});

const DesignationManage = () => {
  const [designations, setDesignations] = useState([]);
  const [designationName, setDesignationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isActive, setIsActive] = useState(true);

  // --- Utility Functions ---

  const clearForm = () => {
    setDesignationName('');
    setIsActive(true);
    setEditMode(false);
    setEditId(null);
  };

  // --- Data Fetching ---

  const fetchDesignations = async () => {
    setLoading(true);
    setError('');
    const result = await DesignationManageService.getDesignationsManage();
    if (result && Array.isArray(result.payload)) {
      setDesignations(result.payload);
    } else {
      setError(result?.message || 'Failed to load designations.');
      setDesignations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  // --- Form Handlers ---

  const handleEditClick = (designation) => {
    setDesignationName(designation.designationName);
    setIsActive(designation.isActive);
    setEditMode(true);
    setEditId(designation.id);
    // Scroll to the top of the form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusToggle = async (id, currentStatus, designationName) => {
    const newStatus = !currentStatus;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to change the status of "${designationName}" to ${newStatus ? 'Active' : 'Inactive'}?`,
      icon: newStatus ? 'warning' : 'info',
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus ? 'Activate' : 'Deactivate'}!`,
      cancelButtonText: 'No, keep it.',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Optimistically update the list for better perceived performance
        setDesignations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isActive: newStatus } : d))
        );

        const userData = {
          designationName, // This should ideally be fetched from the list or passed fully
          isActive: newStatus,
          id,
        };

        const updateResult = await DesignationManageService.saveOrUpdateDesignation(userData);

        if (updateResult?.message) {
          // Revert on error
          Swal.fire('Error!', updateResult.message, 'error');
          fetchDesignations(); // Re-fetch to ensure correctness
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: `Designation set to ${newStatus ? 'Active' : 'Inactive'}.`,
          });
          // The fetchDesignations will run after success if you want to ensure the list is fresh,
          // but if you trust the optimistic update, you can skip the fetch here.
          // For simplicity and robustness, let's re-fetch.
          fetchDesignations(); 
        }
      } else {
        // User cancelled, do nothing.
      }
    });
  };

  const handleSaveOrUpdateDesignation = async () => {
    if (designationName.trim().length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Input',
        text: 'Please fill in the designation name.',
      });
      return;
    }

    const isConfirm = await Swal.fire({
      title: editMode ? 'Confirm Update?' : 'Confirm Creation?',
      text: editMode
        ? `Are you sure you want to update "${designationName}" with status: ${isActive ? 'Active' : 'Inactive'}?`
        : `Are you sure you want to create a new designation: "${designationName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: editMode ? 'Yes, Update it!' : 'Yes, Create it!',
      cancelButtonText: 'Cancel',
    });

    if (!isConfirm.isConfirmed) {
      return;
    }

    const userData = {
      designationName,
      isActive,
      id: editMode ? editId : null,
    };

    const result = await DesignationManageService.saveOrUpdateDesignation(userData);

    if (result?.message) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: result.message,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editMode ? 'Designation successfully updated!' : 'Designation successfully created!',
      });
      clearForm();
      fetchDesignations();
    }
  };

  // --- Component Render ---

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', mt: 4, px: 2 }}>
      
      {/* --- Designation Form (Create/Edit) --- */}
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
          {editMode ? '✏️ Edit Existing Designation' : '➕ Create New Designation'}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Designation Name"
              placeholder="E.g., Investigator, Regional Manager"
              variant="outlined"
              value={designationName}
              onChange={(e) => setDesignationName(e.target.value)}
              inputProps={{ maxLength: 40 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontWeight: 500 }}>
                  {isActive ? 'Active' : 'Inactive'}
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSaveOrUpdateDesignation}
              startIcon={editMode ? <EditIcon /> : <CheckCircleOutlineIcon />}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              {editMode ? 'Update Designation' : 'Create Designation'}
            </Button>
          </Grid>

          {(editMode || designationName) && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={clearForm}
                startIcon={<ClearIcon />}
              >
                {editMode ? 'Cancel Edit' : 'Clear Form'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* --- Existing Designations List --- */}
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📚 Existing Designations ({designations.length})
          </Typography>
          <IconButton onClick={fetchDesignations} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading designations...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ py: 3 }}>
            Error: {error}
          </Typography>
        ) : designations.length > 0 ? (
          <Grid container spacing={2}>
            {designations.map((designation) => (
              <Grid item xs={12} sm={6} key={designation.id}>
                <Paper
                  elevation={2}
                  sx={{
                    padding: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1,
                    transition: '0.3s',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
                    <Typography 
                      sx={{ 
                        fontSize: '15px', 
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {designation.designationName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    {/* Status Chip */}
                    <Typography variant="caption" sx={getStatusStyles(designation.isActive)}>
                      {designation.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Typography>

                    {/* Quick Status Toggle */}
                    <IconButton
                      size="small"
                      color={designation.isActive ? 'error' : 'success'}
                      onClick={() => handleStatusToggle(designation.id, designation.isActive, designation.designationName)}
                      sx={{ ml: 0.5 }}
                      title={`Toggle to ${designation.isActive ? 'Inactive' : 'Active'}`}
                    >
                      {designation.isActive ? <CancelOutlinedIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                    </IconButton>

                    {/* Edit Button */}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(designation)}
                      title="Edit Designation"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
            No designations available. Create one above!
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default DesignationManage;
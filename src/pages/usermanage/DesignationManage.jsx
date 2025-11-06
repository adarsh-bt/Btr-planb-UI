import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DesignationManageService from 'pages/authentication/services/designationmanageservice';
import Swal from 'sweetalert2';

const DesignationManage = () => {
  const [designations, setDesignations] = useState([]);
  const [designationName, setDesignationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchDesignations = async () => {
    setLoading(true);
    const result = await DesignationManageService.getDesignations();
    if (Array.isArray(result.payload)) {
      setDesignations(result.payload);
      setError('');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleSaveOrUpdateDesignation = async () => {
    if (designationName.trim().length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Input',
        text: 'Please fill in the designation name.',
      });
      return;
    }

  const userData = {
      designationName,
      id: editMode ? editId : null
    };

  const result = await DesignationManageService.saveOrUpdateDesignation(userData);
  
  if (result?.message) {
      Swal.fire({
        icon: 'info',
        title: 'Info',
        text: result.message,
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editMode ? 'Designation successfully updated!' : 'Designation successfully created!',
      });
      setDesignationName('');
      setEditMode(false);
      setEditId(null);
      fetchDesignations();
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: 'auto',
        padding: 4,
        borderRadius: 2,
        boxShadow: 4,
        backgroundColor: '#fafafa',
        mt: 4
      }}
    >
      <Typography variant="h4" align="center" gutterBottom  sx={{ fontSize: '1.3rem', marginBottom: 3 }}>
        {editMode ? 'Edit Designation' : 'Create Designation'}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontSize: '1.2rem', marginBottom: 1 }}>
            Existing Designations:
          </Typography>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : designations.length > 0 ? (
            <Box
              sx={{
                padding: 2,
                borderRadius: 1,
                backgroundColor: '#fff',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
              }}
            >
              {designations.map((designation) => (
                <Paper
                  key={designation.id}
                  elevation={1}
                  sx={{
                    padding: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '15px' }}>
                    {designation.designationName}
                  </Typography>
                  <IconButton
                    size="small"
                    color="primary"
                    disabled={true}
                    onClick={() => {
                      setDesignationName(designation.designationName);
                      setEditMode(true);
                      setEditId(designation.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography>No Designations available</Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Designation Name"
            placeholder="Eg: Investigator, Taluk Admin"
            variant="outlined"
            value={designationName}
            onChange={(e) => setDesignationName(e.target.value)}
             inputProps={{ maxLength: 40 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSaveOrUpdateDesignation}
          >
            {editMode ? 'Update Designation' : 'Create Designation'}
          </Button>
        </Grid>

        {editMode && (
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => {
                setDesignationName('');
                setEditMode(false);
                setEditId(null);
              }}
            >
              Cancel Edit
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>

  );
};

export default DesignationManage;

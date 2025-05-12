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
import DesignationManageService from 'pages/authentication/services/designationmanageservice';
import Swal from 'sweetalert2';

const DesignationManage = () => {
  const [designations, setDesignations] = useState([]);
  const [designationName, setDesignationName] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleCreateDesignation = async () => {
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
      text: 'Designation successfully created!',
    });
    setDesignationName('');
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
      <Typography variant="h4" align="center" gutterBottom>
        Create Designation
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Existing Designations:
          </Typography>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : designations.length > 0 ? (
            <Box sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#fff' }}>
              <Grid container spacing={1}>
                {designations
                  .reduce((rows, designation, index) => {
                    if (index % 2 === 0) {
                      rows.push([designation]);
                    } else {
                      rows[rows.length - 1].push(designation);
                    }
                    return rows;
                  }, [])
                  .map((row, idx) => (
                    <Grid container item spacing={1} key={idx}>
                      {row.map((designation) => (
                        <Grid item xs={6} key={designation.id}>
                          <Typography>• {designation.designationName}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ) : (
            <Typography>No Designations available</Typography>
          )}
        </Grid>
        <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Add Designaation Name"
                    placeholder="Eg: Investigator, Taluk admin"
                    variant="outlined"
                    value={designationName}
                    onChange={(e) => setDesignationName(e.target.value)}
                  />
                </Grid>

      <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" onClick={handleCreateDesignation}>
                  Create Designation
                </Button>
              </Grid>
      </Grid>
    </Box>
  );
};

export default DesignationManage;

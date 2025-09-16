import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi';

const ZoneSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [keyplotSize, setKeyplotSize] = useState('');
  const [entries, setEntries] = useState([]);
  const [minClusterArea, setMinClusterArea] = useState('');
  const [maxClusterArea, setMaxClusterArea] = useState('');
  const [tsoLimit, setTsoLimit] = useState('');
  const [clusterEntries, setClusterEntries] = useState([]);

  // Snackbar & Dialog states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Fetch Keyplot Limits
  useEffect(() => {
    const fetchKeyplotLimits = async () => {
      try {
        const response = await axios.get(
          `${mainapi.BTR_API}/btr-service/admin-manage/keyplot-limits`
        );
        const formattedEntries = response.data.map((item) => ({
          keyplotSize: item.keyplotsLimit,
          academicYear: `AY ${new Date(item.agriStartYear).getFullYear()} - ${new Date(item.agriEndYear).getFullYear()}`,
          date: new Date(item.createdAt).toLocaleDateString(),
        }));
        setEntries(formattedEntries);
      } catch (error) {
        console.error('Error fetching keyplot limits:', error);
      }
    };

    fetchKeyplotLimits();
  }, []);

  // Fetch Cluster Limits
  useEffect(() => {
    const fetchClusterLimits = async () => {
      try {
        const response = await axios.get(
          `${mainapi.BTR_API}/btr-service/admin-manage/save-cluster-limits`
        );
        const formattedEntries = response.data.map((item) => ({
          minClusterArea: item.clusterMin,
          maxClusterArea: item.clusterMax,
          tsoLimit: item.tsoApprovalLimit,
          academicYear: `AY ${new Date(item.agriStartYear).getFullYear()} - ${new Date(item.agriEndYear).getFullYear()}`,
          date: new Date(item.createdAt).toLocaleDateString(),
        }));
        setClusterEntries(formattedEntries);
      } catch (error) {
        console.error('Error fetching cluster limits:', error);
      }
    };

    fetchClusterLimits();
  }, []);

  const handleValidatedNumberInput = (setter) => (e) => {
    let value = e.target.value;
    if (value === '') {
      setter('');
      return;
    }
    if (!/^\d+$/.test(value)) return;
    value = value.replace(/^0+/, '');
    if (value.length > 4) return;
    setter(value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Validation + duplicate check
  const requestConfirmation = (formType) => {
    if (formType === 'cluster') {
      if (!minClusterArea || !maxClusterArea || !tsoLimit) {
        setSnackbarMessage('All fields are required.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const min = parseInt(minClusterArea);
      const max = parseInt(maxClusterArea);
      const tso = parseInt(tsoLimit);

      if (min >= max) {
        setSnackbarMessage('Validation Error: Min Cluster Area must be less than Max Cluster Area.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (tso <= min) {
        setSnackbarMessage('Validation Error: TSO Limit must be greater than Min Cluster Area.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      if (tso >= max) {
        setSnackbarMessage('Validation Error: TSO Limit must be less than Max Cluster Area.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const currentYear =
        clusterEntries.length > 0
          ? clusterEntries[clusterEntries.length - 1].academicYear
          : `AY ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`;

      if (clusterEntries.some((entry) => entry.academicYear === currentYear)) {
        setSnackbarMessage(`Academic Year ${currentYear} already exists.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    if (formType === 'keyplot') {
      if (!keyplotSize) {
        setSnackbarMessage('Keyplot size is required.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const currentYear =
        entries.length > 0
          ? entries[entries.length - 1].academicYear
          : `AY ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`;

      if (entries.some((entry) => entry.academicYear === currentYear)) {
        setSnackbarMessage(`Academic Year ${currentYear} already exists.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    setPendingAction(formType);
    setDialogOpen(true);
  };

  const confirmSubmission = async () => {
    if (pendingAction === 'keyplot') {
      if (!keyplotSize) return;

      const currentYear = new Date().getFullYear();
      const payload = {
        keyplotsLimit: parseInt(keyplotSize),
        editPermitter: 'd1426b10-913c-4569-b0e5-4556b45cb621',
        addedBy: 'a9426b10-1111-2222-3333-4556b45cb999',
        remarks: 'Approved by admin',
      };

      try {
        const response = await axios.post(
          `${mainapi.BTR_API}/btr-service/admin-manage/save-keyplot-limits`,
          payload
        );

        if (response.data && response.data.id) {
          const newEntry = {
            keyplotSize,
            academicYear: `AY ${currentYear} - ${currentYear + 1}`,
            date: new Date().toLocaleDateString(),
          };

          setEntries((prev) => [...prev, newEntry]);
          setKeyplotSize('');
          setSnackbarMessage('Keyplot entry submitted successfully!');
          setSnackbarSeverity('success');
        } else if (response.data?.response?.includes('A record already exists')) {
          setSnackbarMessage('A record already exists for the current agri year');
          setSnackbarSeverity('error');
        }
      } catch (error) {
        if (error.response?.data?.response?.includes('A record already exists')) {
          setSnackbarMessage('A record already exists for the current agri year');
          setSnackbarSeverity('error');
        } else {
          setSnackbarMessage('An unexpected error occurred. Please try again later.');
          setSnackbarSeverity('error');
        }
      }
      setSnackbarOpen(true);
    } else if (pendingAction === 'cluster') {
      if (!minClusterArea || !maxClusterArea || !tsoLimit) return;

      const min = parseInt(minClusterArea);
      const max = parseInt(maxClusterArea);
      const tso = parseInt(tsoLimit);

      const payload = {
        clusterMin: min,
        clusterMax: max,
        tsoLimit: tso,
        addedBy: 'b7d1f7da-f6e3-4bd1-b8f4-6c68d02491de',
        remarks: 'Initial limit for agri year',
      };

      try {
        const response = await axios.post(
          `${mainapi.BTR_API}/btr-service/admin-manage/save-cluster-limits`,
          payload
        );

        if (response.data && response.data.id) {
          const newEntry = {
            minClusterArea,
            maxClusterArea,
            tsoLimit,
            academicYear: `AY ${new Date(response.data.agriStartYear).getFullYear()} - ${new Date(
              response.data.agriEndYear
            ).getFullYear()}`,
            date: new Date(response.data.createdAt).toLocaleDateString(),
          };
          setClusterEntries((prev) => [...prev, newEntry]);
          setMinClusterArea('');
          setMaxClusterArea('');
          setTsoLimit('');
          setSnackbarMessage('Cluster entry submitted successfully!');
          setSnackbarSeverity('success');
        } else if (response.data?.response?.includes('A record already exists')) {
          setSnackbarMessage('A record already exists for the current agri year');
          setSnackbarSeverity('error');
        } else {
          setSnackbarMessage('Unexpected response from server.');
          setSnackbarSeverity('error');
        }
      } catch (error) {
        console.error('Error saving cluster data:', error);
        if (error.response?.data?.response?.includes('A record already exists')) {
          setSnackbarMessage('A record already exists for the current agri year');
          setSnackbarSeverity('error');
        } else {
          setSnackbarMessage('Error saving cluster data.');
          setSnackbarSeverity('error');
        }
      }
      setSnackbarOpen(true);
    }
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Breadcrumb />

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Key Plot Limit" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
        <Tab label="Cluster Area Limit" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
      </Tabs>

      {/* Key Plot Limit Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 4 }} elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Keyplot limit size needed:
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestConfirmation('keyplot');
            }}
            style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}
          >
            <Box sx={{ flex: 1 }}>
              <label>Keyplot Count Limit</label>
              <input
                type="text"
                value={keyplotSize}
                onChange={handleValidatedNumberInput(setKeyplotSize)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <label>Agricultural Year</label>
              <TextField
                value={
                  entries.length > 0
                    ? entries[entries.length - 1].academicYear
                    : `AY ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
                }
                fullWidth
                disabled
              />
            </Box>
            <Box sx={{ alignSelf: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#05307a',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                }}
              >
                Submit
              </button>
            </Box>
          </form>

          {entries.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#e0f2fe' }}>
                <tr>
                  <th style={thStyle}>Sl. No.</th>
                  <th style={thStyle}>Agricultural Year</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Keyplot Size</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{entry.academicYear}</td>
                    <td style={tdStyle}>{entry.date}</td>
                    <td style={tdStyle}>{entry.keyplotSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Paper>
      )}



      {/* Cluster Area Limit Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 4 }} elevation={2}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestConfirmation('cluster');
            }}
            style={{ marginBottom: '2rem' }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Cluster Area & TSO Limit
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <label>Min Cluster Area</label>
                      <input
                        type="text"
                        value={minClusterArea}
                        onChange={handleValidatedNumberInput(setMinClusterArea)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <label>Max Cluster Area</label>
                      <input
                        type="text"
                        value={maxClusterArea}
                        onChange={handleValidatedNumberInput(setMaxClusterArea)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <label>TSO Limit</label>
                      <input
                        type="text"
                        value={tsoLimit}
                        onChange={handleValidatedNumberInput(setTsoLimit)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <label>Agricultural Year</label>
                      <TextField
                        value={
                          clusterEntries.length > 0
                            ? clusterEntries[clusterEntries.length - 1].academicYear
                            : `AY ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`
                        }
                        fullWidth
                        disabled
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'right' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 30px',
                      backgroundColor: '#05307a',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                    }}
                  >
                    Submit
                  </button>
                </Box>
              </Grid>
            </Grid>
          </form>

          {clusterEntries.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#e0f2fe' }}>
                <tr>
                  <th style={thStyle}>Sl. No.</th>
                  <th style={thStyle}>Agricultural Year</th>
                  <th style={thStyle}>Min Cluster Area</th>
                  <th style={thStyle}>Max Cluster Area</th>
                  <th style={thStyle}>TSO Limit</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {clusterEntries.map((entry, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{entry.academicYear}</td>
                    <td style={tdStyle}>{entry.minClusterArea}</td>
                    <td style={tdStyle}>{entry.maxClusterArea}</td>
                    <td style={tdStyle}>{entry.tsoLimit}</td>
                    <td style={tdStyle}>{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to submit this entry?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmSubmission} variant="contained" sx={{ backgroundColor: '#05307a' }}>
            Yes, Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const thStyle = {
  padding: '10px',
  borderBottom: '1px solid #ccc',
  textAlign: 'left',
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #eee',
};

export default ZoneSettings;

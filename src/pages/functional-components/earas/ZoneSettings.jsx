import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import Breadcrumb from 'routes/Breadcrumb';

const ZoneSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [keyplotSize, setKeyplotSize] = useState('');
  const [entries, setEntries] = useState([]);
  const [minClusterArea, setMinClusterArea] = useState('');
  const [maxClusterArea, setMaxClusterArea] = useState('');
  const [minSideplotArea, setMinSideplotArea] = useState('');
  const [maxSideplotArea, setMaxSideplotArea] = useState('');
  const [clusterEntries, setClusterEntries] = useState([]);

  // Snackbar & Dialog states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // store which form triggered

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Show dialog instead of submitting directly
  const requestConfirmation = (formType) => {
    setPendingAction(formType);
    setDialogOpen(true);
  };

  const confirmSubmission = () => {
    if (pendingAction === 'keyplot') {
      if (!keyplotSize) return;
      const currentYear = new Date().getFullYear();
      const newEntry = {
        keyplotSize,
        academicYear: `AY ${currentYear} - ${currentYear + 1}`,
        date: new Date().toLocaleDateString(),
        user: 'Robin',
      };
      setEntries((prev) => [...prev, newEntry]);
      setKeyplotSize('');
    } else if (pendingAction === 'cluster') {
      if (!minClusterArea || !maxClusterArea || !minSideplotArea || !maxSideplotArea) return;
      const newClusterEntry = {
        minClusterArea,
        maxClusterArea,
        minSideplotArea,
        maxSideplotArea,
        date: new Date().toLocaleDateString(),
        user: 'Robin',
      };
      setClusterEntries((prev) => [...prev, newClusterEntry]);
      setMinClusterArea('');
      setMaxClusterArea('');
      setMinSideplotArea('');
      setMaxSideplotArea('');
    }

    setDialogOpen(false);
    setSnackbarOpen(true); // show success message
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
                type="number"
                value={keyplotSize}
                onChange={(e) => setKeyplotSize(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <label>Academic Year</label>
              <Box sx={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', fontWeight: 'bold' }}>
                AY {new Date().getFullYear()} - {new Date().getFullYear() + 1}
              </Box>
            </Box>
            <Box sx={{ alignSelf: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#05307a',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none'
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
                  <th style={thStyle}>Academic Year</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Keyplot Size</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{entry.academicYear}</td>
                    <td style={tdStyle}>{entry.date}</td>
                    <td style={tdStyle}>{entry.user}</td>
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
              {/* Cluster Area */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Cluster Area
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <label>Min Cluster Area</label>
                      <input
                        type="number"
                        value={minClusterArea}
                        onChange={(e) => setMinClusterArea(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <label>Max Cluster Area</label>
                      <input
                        type="number"
                        value={maxClusterArea}
                        onChange={(e) => setMaxClusterArea(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Sideplot Area */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Side plot Area
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <label>Min Sideplot Area</label>
                      <input
                        type="number"
                        value={minSideplotArea}
                        onChange={(e) => setMinSideplotArea(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <label>Max Sideplot Area</label>
                      <input
                        type="number"
                        value={maxSideplotArea}
                        onChange={(e) => setMaxSideplotArea(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
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
                      border: 'none'
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
                  <th style={thStyle}>Min Cluster Area</th>
                  <th style={thStyle}>Max Cluster Area</th>
                  <th style={thStyle}>Min Sideplot Area</th>
                  <th style={thStyle}>Max Sideplot Area</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>User</th>
                </tr>
              </thead>
              <tbody>
                {clusterEntries.map((entry, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{entry.minClusterArea}</td>
                    <td style={tdStyle}>{entry.maxClusterArea}</td>
                    <td style={tdStyle}>{entry.minSideplotArea}</td>
                    <td style={tdStyle}>{entry.maxSideplotArea}</td>
                    <td style={tdStyle}>{entry.date}</td>
                    <td style={tdStyle}>{entry.user}</td>
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
          <DialogContentText>
            Are you sure you want to submit this entry?
          </DialogContentText>
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
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Entry submitted successfully!
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

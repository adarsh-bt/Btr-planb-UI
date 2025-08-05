import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import Breadcrumb from 'routes/Breadcrumb';

const ZoneSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [keyplotSize, setKeyplotSize] = useState('');
  const [entries, setEntries] = useState([]);
  const [clusterArea, setClusterArea] = useState('');
  const [sideplotArea, setSideplotArea] = useState('');
  const [clusterEntries, setClusterEntries] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyplotSize) return;
    const currentYear = new Date().getFullYear();
    const newEntry = {
      keyplotSize,
      academicYear: `AY ${currentYear} - ${currentYear + 1}`,
      date: new Date().toLocaleDateString(),
      user: 'Robin',
    };
    setEntries([...entries, newEntry]);
    setKeyplotSize('');
  };

  const handleClusterSubmit = (e) => {
    e.preventDefault();
    if (!clusterArea || !sideplotArea) return;
    const newClusterEntry = {
      clusterArea,
      sideplotArea,
      date: new Date().toLocaleDateString(),
      user: 'Robin',
    };
    setClusterEntries([...clusterEntries, newClusterEntry]);
    setClusterArea('');
    setSideplotArea('');
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

      {tabValue === 0 && (
        <Paper sx={{ p: 4 }} elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Keyplot limit size needed:
          </Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
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
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '4px' }}>
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

      {tabValue === 1 && (
        <Paper sx={{ p: 4 }} elevation={2}>
          <Typography variant="h6" color="primary" gutterBottom>
            Cluster Area limit needed
          </Typography>
          <form onSubmit={handleClusterSubmit} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Box sx={{ flex: 1 }}>
              <label>Cluster Area Limit</label>
              <input
                type="number"
                value={clusterArea}
                onChange={(e) => setClusterArea(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <label>Sideplot Area Limit</label>
              <input
                type="number"
                value={sideplotArea}
                onChange={(e) => setSideplotArea(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </Box>
            <Box sx={{ alignSelf: 'flex-end' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '4px' }}>
                Submit
              </button>
            </Box>
          </form>

          {clusterEntries.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#e0f2fe' }}>
                <tr>
                  <th style={thStyle}>Sl. No.</th>
                  <th style={thStyle}>Cluster Area Limit</th>
                  <th style={thStyle}>Sideplot Area Limit</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>User</th>
                </tr>
              </thead>
              <tbody>
                {clusterEntries.map((entry, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{entry.clusterArea}</td>
                    <td style={tdStyle}>{entry.sideplotArea}</td>
                    <td style={tdStyle}>{entry.date}</td>
                    <td style={tdStyle}>{entry.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Paper>
      )}
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
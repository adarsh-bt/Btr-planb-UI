import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import authservice from 'pages/authentication/services/authservice';

const EstimationDefects = () => {
  const [defects, setDefects] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const role = authservice.getrole()?.trim() || '';
  
  // Mock jurisdiction context for the user (in a real app, this would come from auth context/API)
  const userJurisdiction = {
    districtId: 'D01', // Example district
    taluk: 'Taluk X'   // Example taluk
  };

  useEffect(() => {
    loadDefects();
  }, []);

  const loadDefects = () => {
    const issues = JSON.parse(localStorage.getItem('earas_reported_problems') || '[]');
    
    // Filter issues based on role and jurisdiction
    const filteredIssues = issues.filter(issue => {
      if (role === 'IT Admin') return true;
      if (role === 'District Level Approver') return issue.districtId === userJurisdiction.districtId;
      if (role === 'Taluk Level Approver' || role === 'Field Level Inspector') {
        return issue.taluk === userJurisdiction.taluk;
      }
      return false; // Other roles see nothing
    });
    
    setDefects(filteredIssues);
  };

  const handleForwardToCollector = (issueId) => {
    const issues = JSON.parse(localStorage.getItem('earas_reported_problems') || '[]');
    const updatedIssues = issues.map(issue => 
      issue.id === issueId ? { ...issue, status: 'Forwarded to Data Collector' } : issue
    );
    
    localStorage.setItem('earas_reported_problems', JSON.stringify(updatedIssues));
    loadDefects();
    
    setSnackbarMessage('Defect forwarded to Data Collector successfully.');
    setSnackbarOpen(true);
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      <Grid item xs={12}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e', mb: 2 }}>
          Estimation Defects
        </Typography>
        
        <MainCard title="Reported Discrepancies">
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Panchayat</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category/Crop</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defects.length > 0 ? (
                  defects.map((defect) => (
                    <TableRow key={defect.id} hover>
                      <TableCell>{defect.date}</TableCell>
                      <TableCell>{defect.panchayatName}</TableCell>
                      <TableCell>{defect.crop}</TableCell>
                      <TableCell>
                        <Chip 
                          label={defect.severity} 
                          size="small" 
                          color={defect.severity === 'High' ? 'error' : defect.severity === 'Medium' ? 'warning' : 'info'} 
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {defect.description}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={defect.status || 'Pending'} 
                          size="small"
                          color={defect.status === 'Forwarded to Data Collector' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {(role === 'Taluk Level Approver' || role === 'Field Level Inspector' || role === 'IT Admin') && defect.status !== 'Forwarded to Data Collector' ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<ForwardToInboxIcon />}
                            onClick={() => handleForwardToCollector(defect.id)}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                          >
                            Forward to Collector
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {defect.status === 'Forwarded to Data Collector' ? 'Actioned' : 'View Only'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No estimation defects found in your jurisdiction.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
      
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default EstimationDefects;

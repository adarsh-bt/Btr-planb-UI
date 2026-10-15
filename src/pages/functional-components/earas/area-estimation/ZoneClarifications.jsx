import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import areaEstimationService from './areaEstimationService';
import authservice from 'pages/authentication/services/authservice';

// Icons
import ReplyIcon from '@mui/icons-material/Reply';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ZoneClarifications = () => {
  const [clarifications, setClarifications] = useState([]);
  const [activeZone, setActiveZone] = useState('');
  
  // Respond Dialog State
  const [openRespond, setOpenRespond] = useState(false);
  const [selectedObs, setSelectedObs] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');

  useEffect(() => {
    // Resolve active zone
    let zone = authservice.getzone() || localStorage.getItem('activeZone');
    if (!zone) {
      // Fallback/Mock default active zone for testing
      zone = 'Zone KLM-02';
    }
    setActiveZone(zone);
    fetchClarifications(zone);
  }, []);

  const fetchClarifications = (zone) => {
    const list = areaEstimationService.getObservations();
    // Filter observations assigned to this zone
    const zoneList = list.filter(o => o.assignedZone === zone);
    setClarifications(zoneList);
  };

  const handleOpenRespond = (obs) => {
    setSelectedObs(obs);
    setRemarks('');
    setSupportingNotes('');
    setOpenRespond(true);
  };

  const handleSubmitResponse = () => {
    if (!remarks.trim()) {
      alert('Remarks are required.');
      return;
    }

    areaEstimationService.respondToClarification(selectedObs.id, remarks, supportingNotes);
    setOpenRespond(false);
    fetchClarifications(activeZone);
    alert('Response submitted successfully! The status has transitioned to Resubmitted.');
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      default: return 'info';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Resubmitted': return 'primary';
      case 'Clarification Requested': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
            My Zone Clarifications
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            Active Zone Profile: <strong>{activeZone}</strong>
          </Typography>
        </Box>

        {/* Mock Zone Selector for ease of demonstration */}
        <FormControl size="small" sx={{ minWidth: 160 }} className="no-print">
          <InputLabel>Switch Zone (Demo)</InputLabel>
          <Select
            value={activeZone}
            label="Switch Zone (Demo)"
            onChange={(e) => {
              setActiveZone(e.target.value);
              fetchClarifications(e.target.value);
            }}
          >
            <MenuItem value="Zone TVM-01">Zone TVM-01</MenuItem>
            <MenuItem value="Zone KLM-02">Zone KLM-02 (Has Pending OBS-101)</MenuItem>
            <MenuItem value="Zone KLM-03">Zone KLM-03</MenuItem>
            <MenuItem value="Zone PKD-02">Zone PKD-02 (Has Resolved OBS-102)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Overview Information */}
      <Grid item xs={12}>
        <Alert severity="info" sx={{ borderRadius: 2.5 }}>
          If an EARAS Admin or Designated Officer detects data anomalies or validation failures in your Form-1 inputs, they will submit a Clarification Request. Provide remarks and supporting notes to resubmit the data for review.
        </Alert>
      </Grid>

      {/* Clarifications table */}
      <Grid item xs={12}>
        <MainCard title={`Clarification Requests Awaiting Response`} sx={{ borderRadius: 3 }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#04255e' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Observation ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Remarks / Data Issue</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assigned Date</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Severity</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clarifications.length > 0 ? (
                  clarifications.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.id}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell sx={{ maxWidth: '320px', wordBreak: 'break-word' }}>
                        <Typography variant="body2">{row.remarks}</Typography>
                        {row.responses && row.responses.length > 0 && (
                          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f4f6f8', borderRadius: 2, borderLeft: '3px solid #4caf50' }}>
                            <Typography variant="caption" color="success.main" fontWeight="bold">My Last Response:</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              "{row.responses[row.responses.length - 1].remarks}"
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.severity}
                          color={getSeverityColor(row.severity)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          color={getStatusColor(row.status)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {row.status === 'Clarification Requested' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<ReplyIcon />}
                              onClick={() => handleOpenRespond(row)}
                              sx={{ borderRadius: 1.5, fontWeight: 'bold' }}
                            >
                              Respond
                            </Button>
                          ) : (
                            <Tooltip title="View Response Log">
                              <IconButton
                                color="secondary"
                                onClick={() => handleOpenRespond(row)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <HelpOutlineIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                      <Typography variant="subtitle1" color="text.secondary">
                        No clarifications found for {activeZone}. Good job!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      {/* Response Dialog */}
      <Dialog
        open={openRespond}
        onClose={() => setOpenRespond(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600}>
            {selectedObs?.status === 'Clarification Requested' ? 'Respond to Observation' : 'Clarification Log'}
          </Typography>
          <IconButton onClick={() => setOpenRespond(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Issue Details</Typography>
            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
              {selectedObs?.remarks}
            </Typography>
          </Box>

          {selectedObs?.status === 'Clarification Requested' ? (
            <Stack spacing={2}>
              <TextField
                label="My Response / Remarks"
                multiline
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                fullWidth
                variant="outlined"
              />

              <TextField
                label="Supporting Notes / Evidence URL"
                value={supportingNotes}
                onChange={(e) => setSupportingNotes(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Stack>
          ) : (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Response Log History</Typography>
              {selectedObs?.responses?.map((r, idx) => (
                <Box key={idx} sx={{ p: 2, mt: 1.5, bgcolor: '#f4f6f8', borderRadius: 2 }}>
                  <Typography variant="body2">{r.remarks}</Typography>
                  {r.notes && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      Notes: {r.notes}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary" align="right">
                    Submitted on {new Date(r.date).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setOpenRespond(false)}>
            Close
          </Button>
          {selectedObs?.status === 'Clarification Requested' && (
            <Button variant="contained" color="primary" onClick={handleSubmitResponse}>
              Submit Response
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ZoneClarifications;

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Card,
  CardContent,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useNavigate, useLocation } from 'react-router-dom';
import areaEstimationService from './areaEstimationService';
import authservice from 'pages/authentication/services/authservice';

// Icons
import AddCommentIcon from '@mui/icons-material/AddComment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';

const ZONES_LIST = [
  'Zone TVM-01',
  'Zone TVM-02',
  'Zone KLM-01',
  'Zone KLM-02',
  'Zone KLM-03',
  'Zone ALP-01',
  'Zone ALP-02',
  'Zone PKD-01',
  'Zone PKD-02'
];

const ObservationReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [observations, setObservations] = useState([]);
  const [openAddObs, setOpenAddObs] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [obsType, setObsType] = useState('Data Issue');
  const [assignedZone, setAssignedZone] = useState(ZONES_LIST[0]);
  const [filterStatus, setFilterStatus] = useState('All');

  // Load observations
  useEffect(() => {
    fetchObservations();
  }, []);

  const fetchObservations = () => {
    setObservations(areaEstimationService.getObservations());
  };

  const handleOpenAddObs = (zone) => {
    if (zone) setAssignedZone(zone);
    setOpenAddObs(true);
  };

  const handleAddObservation = () => {
    if (!remarks.trim()) {
      alert('Remarks are required.');
      return;
    }

    areaEstimationService.addObservation({
      type: obsType,
      remarks,
      severity,
      assignedZone
    });

    // Reset state
    setRemarks('');
    setOpenAddObs(false);
    fetchObservations();
    alert('Observation added and clarification request sent to Zone!');
  };

  const handleApproveObservation = (id) => {
    const list = areaEstimationService.getObservations();
    const obs = list.find(o => o.id === id);
    if (obs) {
      areaEstimationService.respondToClarification(id, 'Approved by Designated Officer', 'No further comments.');
      // Force change to Approved state
      const updatedList = areaEstimationService.getObservations();
      const match = updatedList.find(o => o.id === id);
      if (match) {
        match.status = 'Approved';
        localStorage.setItem('earas_observations', JSON.stringify(updatedList));
      }

      areaEstimationService.addNotification({
        title: 'Observation Approved',
        message: `Observation ${id} has been marked as resolved/approved.`,
        type: 'success',
        timestamp: new Date().toISOString()
      });

      fetchObservations();
      alert('Observation has been marked as Approved/Resolved.');
    }
  };

  const handleFinalApproveEstimation = () => {
    // Check if there are outstanding unresolved clarifications
    const pending = observations.filter(o => o.status === 'Clarification Requested' || o.status === 'Resubmitted');
    if (pending.length > 0) {
      alert('Cannot approve estimation while there are pending clarifications or resubmissions.');
      return;
    }

    const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Seasonal Crops';
    const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
    const district = 'All';

    const currentStatus = areaEstimationService.getEstimationState(estType, '2026', season, district);
    const usernameVal = (localStorage.getItem('user') || authservice.getusername() || '').trim().toLowerCase();
    const userRoleMapping = {
      'vimal.d@duk.ac.in': 'Area Estimator',
      'shafina.m@duk.ac.in': 'Area Estimation Verifier 1',
      'geethika.js@duk.ac.in': 'Area Estimation Verifier 2',
      'smitha.vs@duk.ac.in': 'Area Estimation Verifier 3',
      'anitha.vr@duk.ac.in': 'Approver 2'
    };
    const actualRole = userRoleMapping[usernameVal] || authservice.getrole() || 'Super Admin';
    const role = actualRole;

    let nextState = '';
    let actionName = '';

    if (currentStatus === 'Review Required') {
      nextState = 'Awaiting Verifier 1';
      actionName = 'Submitted for Level 1 Verification';
    } else if (currentStatus === 'Awaiting Verifier 1') {
      nextState = 'Awaiting Verifier 2';
      actionName = 'Verified & Forwarded to Level 2';
    } else if (currentStatus === 'Awaiting Verifier 2') {
      nextState = 'Awaiting Verifier 3';
      actionName = 'Verified & Forwarded to Level 3';
    } else if (currentStatus === 'Awaiting Verifier 3') {
      nextState = 'Awaiting Admin Approval';
      actionName = 'Verified & Forwarded to EARAS Admin';
    } else if (currentStatus === 'Awaiting Admin Approval') {
      nextState = 'Awaiting Director Approval';
      actionName = 'Approved & Forwarded to Additional Director';
    } else if (currentStatus === 'Awaiting Director Approval') {
      nextState = 'Completed';
      actionName = 'Final Approved & Published';
    } else {
      alert('Estimation is already completed or not in a reviewable state.');
      return;
    }

    if (nextState === 'Completed') {
      areaEstimationService.approveEstimation(estType, '2026', season, district);
    } else {
      areaEstimationService.submitWorkflowStep(estType, '2026', season, district, nextState, role, actionName);
    }
    
    alert(`Area Estimation successfully advanced: ${actionName}`);
    navigate('/schemes/earas/area-estimation');
  };

  const getApproveButtonText = () => {
    const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Seasonal Crops';
    const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
    const district = 'All';
    const currentStatus = areaEstimationService.getEstimationState(estType, '2026', season, district);
    switch (currentStatus) {
      case 'Review Required': return 'Submit to Area Estimation Verifier 1';
      case 'Awaiting Verifier 1': return 'Forward to Area Estimation Verifier 2';
      case 'Awaiting Verifier 2': return 'Forward to Area Estimation Verifier 3';
      case 'Awaiting Verifier 3': return 'Forward to Approver 2';
      case 'Awaiting Admin Approval': return 'Forward to Additional Director';
      case 'Awaiting Director Approval': return 'Final Approve & Publish';
      default: return 'Approve Estimation';
    }
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

  const filteredObservations = filterStatus === 'All'
    ? observations
    : observations.filter(o => o.status === filterStatus);

  const estTypeVal = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Seasonal Crops';
  const seasonVal = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const currentStatusForButton = areaEstimationService.getEstimationState(estTypeVal, '2026', seasonVal, 'All');
  const isReviewable = ['Review Required', 'Awaiting Verifier 1', 'Awaiting Verifier 2', 'Awaiting Verifier 3', 'Awaiting Admin Approval', 'Awaiting Director Approval'].includes(currentStatusForButton);

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Observation Review Workspace
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCommentIcon />}
            onClick={() => handleOpenAddObs()}
            sx={{ borderRadius: 2 }}
          >
            Add Observation
          </Button>
          {isReviewable && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleFinalApproveEstimation}
              sx={{ borderRadius: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              {getApproveButtonText()}
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Review Workspace Stats */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Awaiting Clarification</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ color: '#ff9800', mt: 1 }}>
                    {observations.filter(o => o.status === 'Clarification Requested').length}
                  </Typography>
                </Box>
                <HelpOutlineIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.6 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Resubmissions (Needs Review)</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ color: '#1e88e5', mt: 1 }}>
                    {observations.filter(o => o.status === 'Resubmitted').length}
                  </Typography>
                </Box>
                <HistoryIcon sx={{ fontSize: 40, color: '#1e88e5', opacity: 0.6 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Resolved / Approved</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ color: '#2e7d32', mt: 1 }}>
                    {observations.filter(o => o.status === 'Approved').length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.6 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Observations</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e', mt: 1 }}>
                    {observations.length}
                  </Typography>
                </Box>
                <PriorityHighIcon sx={{ fontSize: 40, color: '#04255e', opacity: 0.6 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Main workspace table */}
      <Grid item xs={12}>
        <MainCard
          title="Estimation Records Review Workspace"
          secondary={
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="All">All Observations</MenuItem>
                <MenuItem value="Clarification Requested">Clarification Requested</MenuItem>
                <MenuItem value="Resubmitted">Resubmitted</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
              </Select>
            </FormControl>
          }
          sx={{ borderRadius: 3 }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#04255e' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Observation Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Assigned Zone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Remarks</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Severity</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredObservations.length > 0 ? (
                  filteredObservations.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.id}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.assignedZone}</TableCell>
                      <TableCell sx={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                        <Typography variant="body2">{row.remarks}</Typography>
                        {row.responses && row.responses.length > 0 && (
                          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f4f6f8', borderRadius: 2, borderLeft: '3px solid #1e88e5' }}>
                            <Typography variant="caption" color="primary" fontWeight="bold">Zone Response:</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              "{row.responses[row.responses.length - 1].remarks}"
                            </Typography>
                            {row.responses[row.responses.length - 1].notes && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                Notes: {row.responses[row.responses.length - 1].notes}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.severity}
                          color={getSeverityColor(row.severity)}
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: 70 }}
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
                          {row.status === 'Resubmitted' && (
                            <Tooltip title="Approve/Resolve Clarification">
                              <IconButton
                                color="success"
                                onClick={() => handleApproveObservation(row.id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Request Additional Clarification">
                            <IconButton
                              color="warning"
                              onClick={() => handleOpenAddObs(row.assignedZone)}
                            >
                              <HelpOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No observations found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      {/* Add Observation Dialog */}
      <Dialog
        open={openAddObs}
        onClose={() => setOpenAddObs(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600}>Add Observation</Typography>
          <IconButton onClick={() => setOpenAddObs(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Observation Type</InputLabel>
              <Select
                value={obsType}
                label="Observation Type"
                onChange={(e) => setObsType(e.target.value)}
              >
                <MenuItem value="Data Issue">Data Issue</MenuItem>
                <MenuItem value="Validation Issue">Validation Issue</MenuItem>
                <MenuItem value="Clarification Required">Clarification Required</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={severity}
                label="Severity"
                onChange={(e) => setSeverity(e.target.value)}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Assigned Zone</InputLabel>
              <Select
                value={assignedZone}
                label="Assigned Zone"
                onChange={(e) => setAssignedZone(e.target.value)}
              >
                {ZONES_LIST.map((zone) => (
                  <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Remarks / Comments"
              multiline
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setOpenAddObs(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddObservation}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ObservationReview;

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
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Drawer,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import areaEstimationService from './areaEstimationService';
import authservice from 'pages/authentication/services/authservice';

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableChartIcon from '@mui/icons-material/TableChart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import LayersIcon from '@mui/icons-material/Layers';
import OpacityIcon from '@mui/icons-material/Opacity';
import SpaIcon from '@mui/icons-material/Spa';
import GrainIcon from '@mui/icons-material/Grain';

const DISTRICTS = [
  { id: 'All', name: 'All Districts' },
  { id: 1, name: 'Thiruvananthapuram' },
  { id: 2, name: 'Kollam' },
  { id: 3, name: 'Pathanamthitta' },
  { id: 4, name: 'Alappuzha' },
  { id: 5, name: 'Kottayam' },
  { id: 6, name: 'Idukki' },
  { id: 7, name: 'Ernakulam' },
  { id: 8, name: 'Thrissur' },
  { id: 9, name: 'Palakkad' },
  { id: 10, name: 'Malappuram' },
  { id: 11, name: 'Kozhikode' },
  { id: 12, name: 'Wayanad' },
  { id: 13, name: 'Kannur' },
  { id: 14, name: 'Kasaragod' }
];

const AreaEstimationDashboard = () => {
  const navigate = useNavigate();

  const estimationCategories = [
    {
      id: 'Seasonal Crops',
      title: 'Seasonal Crops',
      desc: 'Autumn, Winter, & Summer crop estimations',
      icon: <SpaIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
    {
      id: 'Annual & Perennial Crops',
      title: 'Annual & Perennial Crops',
      desc: 'Coconut, Rubber, etc. yearly estimates',
      icon: <GrainIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    },
    {
      id: 'Land Utilization',
      title: 'Land Utilization',
      desc: 'Forest, Barren, Cultivable lands assessment',
      icon: <LayersIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    },
    {
      id: 'Irrigation',
      title: 'Irrigation Details',
      desc: 'Canal, Well, & rain-fed source stats',
      icon: <OpacityIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    }
  ];

  // Filters State — initialized from preserved localStorage so Verifier 1 sees same context as Area Estimator
  const [estType, setEstType] = useState(() => localStorage.getItem('earas_selected_estType') || 'Seasonal Crops');
  const year = '2026';
  const [season, setSeason] = useState(() => localStorage.getItem('earas_selected_season') || 'Autumn');
  const [landType, setLandType] = useState(() => localStorage.getItem('earas_selected_landType') || 'All');
  const district = 'All';

  // Workflow Stepper Definitions
  const STEPS = [
    { label: 'Initiation', states: ['Validation Pending', 'Ready to Initiate', 'Running'] },
    { label: 'Area Estimation Verifier 1', states: ['Review Required', 'Awaiting Verifier 1'] },
    { label: 'Area Estimation Verifier 2', states: ['Awaiting Verifier 2'] },
    { label: 'Area Estimation Verifier 3', states: ['Awaiting Verifier 3'] },
    { label: 'Approver 2', states: ['Awaiting Admin Approval'] },
    { label: 'Additional Director', states: ['Awaiting Director Approval'] },
    { label: 'Published', states: ['Completed'] }
  ];

  const getActiveStep = (status) => {
    const idx = STEPS.findIndex(step => step.states.includes(status));
    return idx === -1 ? 0 : idx;
  };

  // Role Simulation Logic
  const usernameVal = (localStorage.getItem('user') || authservice.getusername() || '').trim().toLowerCase();

  const userRoleMapping = {
    'vimal.d@duk.ac.in': 'Area Estimator',
    'hareesh.stkt@gmail.com': 'Area Estimation Verifier 1',
    'nisharajesh7586@gmail.com': 'Area Estimation Verifier 2',
    'ashaaugustine.ecostat@gmail.com': 'Area Estimation Verifier 3',
    'sethuseena@gmail.com': 'Approver 2'
  };

  const tokenRole = authservice.getrole() || 'Super Admin';
  const actualRole = userRoleMapping[usernameVal] || tokenRole;
  const isAdmin = ['Super Admin', 'IT Admin'].includes(tokenRole);

  const simulatedRole = actualRole;

  // Workflow Transition Dialog States
  const [openWorkflowModal, setOpenWorkflowModal] = useState(false);
  const [openActivityLog, setOpenActivityLog] = useState(false);
  const [workflowComments, setWorkflowComments] = useState('');
  const [workflowNextState, setWorkflowNextState] = useState('');
  const [workflowActionName, setWorkflowActionName] = useState('');

  const handleOpenWorkflowTransition = (nextState, actionName) => {
    setWorkflowNextState(nextState);
    setWorkflowActionName(actionName);
    setWorkflowComments('');
    setOpenWorkflowModal(true);
  };

  const handleWorkflowTransitionSubmit = () => {
    if (workflowNextState === 'Completed') {
      areaEstimationService.approveEstimation(estType, year, season, district, landType);
      areaEstimationService.addEstimationActivity(
        estType, year, season, district, landType,
        usernameVal, 'Final Approval & Published',
        usernameVal, 'Final Approval & Published',
        workflowComments || `Estimation fully approved and published by ${simulatedRole}.`
      );
    } else {
      areaEstimationService.submitWorkflowStep(
        estType,
        year,
        season,
        district,
        landType,
        workflowNextState,
        simulatedRole,
        workflowComments || `Advanced by ${simulatedRole}`
      );
      areaEstimationService.addEstimationActivity(
        estType, year, season, district, landType,
        usernameVal, workflowActionName,
        workflowComments || `Forwarded to next stage by ${simulatedRole}.`
      );
    }
    setOpenWorkflowModal(false);
    fetchStatusAndMetrics();
  };

  const handleReinitiateWorkflow = () => {
    const confirm = window.confirm('Are you sure you want to re-initiate the estimation procedure? This will reset the status to Validation Pending.');
    if (confirm) {
      areaEstimationService.reinitiateEstimationWorkflow(estType, year, season, district, landType, simulatedRole, 'Re-initiated due to anomalies/data issue.');
      areaEstimationService.addEstimationActivity(
        estType, year, season, district, landType,
        usernameVal, 'Workflow Re-initiated',
        `Estimation reset to Validation Pending by ${simulatedRole} due to anomalies or data issues.`
      );
      fetchStatusAndMetrics();
    }
  };

  // Last validation check time
  const [lastValidationTime, setLastValidationTime] = useState(() => {
    return localStorage.getItem(`last_val_time_${estType}_${season}_${landType}`) || 'Never checked';
  });

  useEffect(() => {
    localStorage.removeItem('earas_form1_submissions');
  }, []);

  useEffect(() => {
    const savedTime = localStorage.getItem(`last_val_time_${estType}_${season}_${landType}`);
    setLastValidationTime(savedTime || 'Never checked');
  }, [estType, season, landType]);

  // Business States
  const [metrics, setMetrics] = useState({
    totalZones: 0,
    submittedZones: 0,
    pendingZones: 0,
    formPendingZones: 0,
    completedEstimations: 0,
    clarificationsPending: 0
  });

  const [currentStatus, setCurrentStatus] = useState('Validation Pending');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Modals / Drawers Controls
  const [openValidationFail, setOpenValidationFail] = useState(false);
  const [openInitiateConfirm, setOpenInitiateConfirm] = useState(false);

  // Running estimation simulation variables
  const [estimationProgress, setEstimationProgress] = useState(0);
  const [runningStep, setRunningStep] = useState(0); // 0: Idle, 1: Validation, 2: Calculation, 3: Completed

  // Load status & metrics whenever filters change, with 2-second polling to auto-reflect updates for other users/roles
  useEffect(() => {
    fetchStatusAndMetrics();
    localStorage.setItem('earas_selected_estType', estType);
    localStorage.setItem('earas_selected_season', season);
    localStorage.setItem('earas_selected_landType', landType);

    const pollInterval = setInterval(() => {
      const freshStatus = areaEstimationService.getEstimationState(estType, year, season, district, landType);
      setCurrentStatus(prev => {
        if (prev !== 'Running' || freshStatus !== 'Running') {
          if (freshStatus !== prev) {
            const m = areaEstimationService.getDashboardMetrics(estType, year, season, district, landType);
            setMetrics(m);
          }
          return freshStatus;
        }
        return prev;
      });
      const hist = areaEstimationService.getEstimationHistory(estType, year, season, district, landType);
      setActivities(hist || []);
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [estType, season, landType]);

  const fetchStatusAndMetrics = () => {
    const s = areaEstimationService.getEstimationState(estType, year, season, district, landType);
    setCurrentStatus(s);

    const m = areaEstimationService.getDashboardMetrics(estType, year, season, district, landType);
    setMetrics(m);

    const hist = areaEstimationService.getEstimationHistory(estType, year, season, district, landType);
    setActivities(hist || []);
  };

  // Run validation
  const handleValidate = () => {
    setLoading(true);
    setTimeout(() => {
      const result = areaEstimationService.validateForm1Submissions(estType, season, district, landType);
      setValidationResult(result);
      setLoading(false);

      const timeStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem(`last_val_time_${estType}_${season}_${landType}`, timeStr);
      setLastValidationTime(timeStr);

      if (result.passed) {
        // Switch status to Ready to Initiate
        areaEstimationService.setEstimationState(estType, year, season, district, 'Ready to Initiate', landType);
        setCurrentStatus('Ready to Initiate');
        areaEstimationService.addEstimationActivity(
          estType, year, season, district, landType,
          usernameVal, 'Data Validation Passed',
          `Form-1 submissions validated successfully. Estimation ready to initiate.`
        );
        setOpenInitiateConfirm(true);
      } else {
        areaEstimationService.setEstimationState(estType, year, season, district, 'Validation Pending', landType);
        setCurrentStatus('Validation Pending');
        areaEstimationService.addEstimationActivity(
          estType, year, season, district, landType,
          usernameVal, 'Data Validation Failed',
          `Validation failed — pending Form-1 submissions detected.`
        );
        areaEstimationService.addNotification({
          title: 'Validation Failed',
          message: `${estType} validation failed due to pending Form-1 submissions.`,
          type: 'error',
          timestamp: new Date().toISOString()
        });
        setOpenValidationFail(true);
      }
      fetchStatusAndMetrics();
    }, 1000);
  };



  // Initiate Estimation (simulates execution progress)
  const handleInitiate = async () => {
    setOpenInitiateConfirm(false);

    // API INTEGRATION POINT: Call the Axios service to trigger estimation on backend
    try {
      await areaEstimationService.apiInitiateEstimation({
        estType,
        year,
        season,
        districtId: district,
        landType
      });
    } catch (err) {
      console.warn('Backend API call failed, proceeding with local mock simulation:', err);
    }

    areaEstimationService.initiateEstimation(estType, year, season, district, landType);
    areaEstimationService.addEstimationActivity(
      estType, year, season, district, landType,
      usernameVal, 'Area Estimation Initiated',
      `Area estimation calculation started for ${estType}${season ? ' — ' + season + ' season' : ''}.`
    );
    setCurrentStatus('Running');
    fetchStatusAndMetrics();

    // Simulate background process
    setEstimationProgress(10);
    setRunningStep(1);

    const interval = setInterval(() => {
      setEstimationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunningStep(3);
          // Transition to Review Required
          setTimeout(() => {
            areaEstimationService.setEstimationState(estType, year, season, district, 'Review Required', landType);
            areaEstimationService.addEstimationActivity(
              estType, year, season, district, landType,
              usernameVal, 'Estimation Computation Completed',
              `Calculation finished. Results available for review. Awaiting submission by Area Estimator.`
            );
            setCurrentStatus('Review Required');
            setRunningStep(0);
            fetchStatusAndMetrics();
          }, 800);
          return 100;
        }

        // Progress steps
        const next = prev + 15;
        if (next >= 40 && next < 80) setRunningStep(2);
        return next;
      });
    }, 600);
  };

  const handleExportSummary = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Estimation Type', estType],
      ['Year', year],
      ['Season', estType === 'Seasonal Crops' ? season : 'N/A'],
      ['Land Type', landType],
      ['Total Zones', metrics.totalZones],
      ['Submitted Zones', metrics.submittedZones],
      ['Form-1 Pending Zones', metrics.formPendingZones],
      ['Completed Estimations', metrics.completedEstimations],
      ['Clarifications Pending', metrics.clarificationsPending],
      ['Current Status', currentStatus]
    ];

    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Area_Estimation_Summary_${estType}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPending = () => {
    if (!validationResult || !validationResult.pendingZones) return;
    const csvRows = [
      ['District', 'Taluk', 'Zone', 'Investigator Name', 'Pending Clusters', 'Status'],
      ...validationResult.pendingZones.map(p => [
        p.district,
        p.taluk,
        p.zone,
        p.investigatorName || 'N/A',
        p.pendingClusters ? p.pendingClusters.join('; ') : '',
        'Pending Submission'
      ])
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Pending_Form1_Submissions_${season}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Review Required': return 'warning';
      case 'Running': return 'info';
      case 'Ready to Initiate': return 'primary';
      default: return 'error';
    }
  };

  const getEstIcon = (type) => {
    switch (type) {
      case 'Land Utilization': return <LayersIcon sx={{ color: '#ffffff' }} />;
      case 'Irrigation': return <OpacityIcon sx={{ color: '#ffffff' }} />;
      case 'Seasonal Crops': return <SpaIcon sx={{ color: '#ffffff' }} />;
      default: return <GrainIcon sx={{ color: '#ffffff' }} />;
    }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Area Estimation Dashboard
        </Typography>
      </Grid>



      {/* Visual Stepper tracker for multi-level approvals */}
      {currentStatus !== 'Validation Pending' && currentStatus !== 'Ready to Initiate' && currentStatus !== 'Running' && (
        <Grid item xs={12}>
          <MainCard title="Verification & Approval Progress Tracker" sx={{ borderRadius: 3 }}>
            <Box sx={{ width: '100%', py: 1 }}>
              <Stepper activeStep={getActiveStep(currentStatus)} alternativeLabel>
                {STEPS.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </MainCard>
        </Grid>
      )}

      {/* Estimation Category Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {estimationCategories.map((card) => {
            const isSelected = estType === card.id;
            const stateForCard = areaEstimationService.getEstimationState(card.id, '2026', 'Autumn', 'All', landType);
            return (
              <Grid item xs={12} sm={6} md={3} key={card.id}>
                <Card
                  onClick={() => setEstType(card.id)}
                  sx={{
                    borderRadius: 3,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 10px 25px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                    border: isSelected ? '2px solid #04255e' : '1px solid rgba(0,0,0,0.08)',
                    background: isSelected ? card.gradient : '#ffffff',
                    color: isSelected ? 'white' : 'text.primary',
                    transform: isSelected ? 'translateY(-6px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 155, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, color: isSelected ? 'white' : '#04255e' }}>
                          {card.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
                          {card.desc}
                        </Typography>
                      </Box>
                      <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(4, 37, 94, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'white' : '#04255e'
                      }}>
                        {card.icon}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="caption" sx={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary', fontWeight: 600 }}>
                        Status:
                      </Typography>
                      <Chip
                        label={stateForCard}
                        color={getStatusColor(stateForCard)}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          color: 'white',
                          border: isSelected ? '1px solid white' : undefined
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Grid>

      {/* Main Execution Workflow Panel */}
      <Grid item xs={12}>
        <MainCard
          title={
            <Stack direction="row" spacing={2} alignItems="center">
              {getEstIcon(estType)}
              <Typography variant="h4" fontWeight={600}>
                Estimation Execution Workflow
              </Typography>
            </Stack>
          }
          sx={{
            background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
            color: 'white',
            '& .MuiTypography-root': { color: 'white' },
            borderRadius: 4,
            boxShadow: '0 12px 35px rgba(0,0,0,0.15)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h5" sx={{ mb: 1, opacity: 0.9 }}>
                Active Target: <strong>{estType}</strong> {estType === 'Seasonal Crops' && `- ${season} Season`}
              </Typography>

              {/* Season select selector only for Seasonal Crops */}
              <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {estType === 'Seasonal Crops' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Select Season:</Typography>
                    <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1.5 }}>
                      <Select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        sx={{ color: '#04255e', fontWeight: 'bold' }}
                      >
                        <MenuItem value="Autumn">Autumn</MenuItem>
                        <MenuItem value="Winter">Winter</MenuItem>
                        <MenuItem value="Summer">Summer</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Land Type:</Typography>
                  <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 1.5 }}>
                    <Select
                      value={landType}
                      onChange={(e) => setLandType(e.target.value)}
                      sx={{ color: '#04255e', fontWeight: 'bold' }}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Wet">Wet</MenuItem>
                      <MenuItem value="Dry">Dry</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
                {simulatedRole === 'Area Estimator'
                  ? 'Before executing the estimation logic, validate that all reporting zones have successfully completed and uploaded their Form-1 datasets.'
                  : simulatedRole === 'Area Estimation Verifier 1'
                    ? '📋 You are the Level 1 Verifier. Review the estimation results and activity log below, then use the action button to forward to Level 2 verification.'
                    : simulatedRole === 'Area Estimation Verifier 2'
                      ? '📋 You are the Level 2 Verifier. Review the estimation results and activity log below, then use the action button to forward to Level 3 verification.'
                      : simulatedRole === 'Area Estimation Verifier 3'
                        ? '📋 You are the Level 3 Verifier. Review the estimation results and activity log below, then forward to the Approver 2.'
                        : simulatedRole === 'Approver 2'
                          ? '📋 You are Approver 2. Review the estimation results and activity log below, then approve and forward to the Additional Director.'
                          : '📊 Monitor the estimation workflow status and activity log below. Admin users can view full history across all stages.'}
              </Typography>

              {/* Action buttons */}
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ gap: 2 }}>
                {simulatedRole === 'Area Estimator' && (
                  <>
                    <Button
                      variant="contained"
                      disabled={loading || currentStatus !== 'Validation Pending'}
                      onClick={handleValidate}
                      sx={{
                        bgcolor: '#2e7d32',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#1b5e20' },
                        '&.Mui-disabled': { bgcolor: 'rgba(46, 125, 50, 0.3)', color: 'rgba(255,255,255,0.5)' },
                        borderRadius: 2,
                        px: 3,
                        py: 1
                      }}
                      startIcon={<CheckCircleOutlineIcon />}
                    >
                      {loading ? 'Validating...' : 'Validate Data Availability'}
                    </Button>

                    <Button
                      variant="contained"
                      disabled={currentStatus !== 'Ready to Initiate' || currentStatus === 'Running'}
                      onClick={() => setOpenInitiateConfirm(true)}
                      sx={{
                        bgcolor: '#ff9800',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#f57c00' },
                        '&.Mui-disabled': { bgcolor: 'rgba(255, 152, 0, 0.3)', color: 'rgba(255,255,255,0.5)' },
                        borderRadius: 2,
                        px: 3,
                        py: 1
                      }}
                      startIcon={<PlayArrowIcon />}
                    >
                      Initiate Estimation
                    </Button>
                  </>
                )}

                {/* Workflow advance / reset buttons */}
                {simulatedRole === 'Area Estimator' && currentStatus === 'Review Required' && (
                  <Button
                    variant="contained"
                    onClick={() => handleOpenWorkflowTransition('Awaiting Verifier 1', 'Submitted for Verification (Level 1)')}
                    sx={{ bgcolor: '#1976d2', fontWeight: 'bold', '&:hover': { bgcolor: '#115293' }, borderRadius: 2, px: 3, py: 1 }}
                  >
                    Submit for Verification (Level 1)
                  </Button>
                )}

                {simulatedRole === 'Area Estimation Verifier 1' && currentStatus === 'Awaiting Verifier 1' && (
                  <Button
                    variant="contained"
                    onClick={() => handleOpenWorkflowTransition('Awaiting Verifier 2', 'Verified & Forwarded to Level 2')}
                    sx={{ bgcolor: '#1976d2', fontWeight: 'bold', '&:hover': { bgcolor: '#115293' }, borderRadius: 2, px: 3, py: 1 }}
                  >
                    Verify & Forward to Level 2
                  </Button>
                )}

                {simulatedRole === 'Area Estimation Verifier 2' && currentStatus === 'Awaiting Verifier 2' && (
                  <Button
                    variant="contained"
                    onClick={() => handleOpenWorkflowTransition('Awaiting Verifier 3', 'Verified & Forwarded to Level 3')}
                    sx={{ bgcolor: '#1976d2', fontWeight: 'bold', '&:hover': { bgcolor: '#115293' }, borderRadius: 2, px: 3, py: 1 }}
                  >
                    Verify & Forward to Level 3
                  </Button>
                )}

                {simulatedRole === 'Area Estimation Verifier 3' && currentStatus === 'Awaiting Verifier 3' && (
                  <Button
                    variant="contained"
                    onClick={() => handleOpenWorkflowTransition('Awaiting Admin Approval', 'Verified & Forwarded to EARAS Admin')}
                    sx={{ bgcolor: '#1976d2', fontWeight: 'bold', '&:hover': { bgcolor: '#115293' }, borderRadius: 2, px: 3, py: 1 }}
                  >
                    Verify & Forward to Approver 2
                  </Button>
                )}

                {simulatedRole === 'Approver 2' && currentStatus === 'Awaiting Admin Approval' && (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenWorkflowTransition('Awaiting Director Approval', 'Approved & Forwarded to Additional Director')}
                      sx={{ bgcolor: '#2e7d32', fontWeight: 'bold', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: 2, px: 3, py: 1 }}
                    >
                      Approve & Forward to Additional Director
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleReinitiateWorkflow}
                      sx={{ fontWeight: 'bold', borderRadius: 2, px: 3, py: 1 }}
                    >
                      Re-initiate (Reset Flow)
                    </Button>
                  </>
                )}

                {simulatedRole === 'Additional Director' && currentStatus === 'Awaiting Director Approval' && (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenWorkflowTransition('Completed', 'Final Approved & Published')}
                      sx={{ bgcolor: '#2e7d32', fontWeight: 'bold', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: 2, px: 3, py: 1 }}
                    >
                      Grant Final Approval & Publish
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleReinitiateWorkflow}
                      sx={{ fontWeight: 'bold', borderRadius: 2, px: 3, py: 1 }}
                    >
                      Re-initiate (Reset Flow)
                    </Button>
                  </>
                )}

                <Button
                  variant="outlined"
                  disabled={currentStatus === 'Validation Pending' || currentStatus === 'Ready to Initiate' || currentStatus === 'Running'}
                  onClick={() => {
                    if (estType === 'Seasonal Crops') {
                      navigate('/schemes/earas/area-estimation/seasonal-results', { state: { estType, season } });
                    } else {
                      navigate('/schemes/earas/area-estimation/results', { state: { estType, season } });
                    }
                  }}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': { borderColor: '#e0e0e0', bgcolor: 'rgba(255,255,255,0.08)' },
                    '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.3)' },
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                  startIcon={<TableChartIcon />}
                >
                  View Results
                </Button>

                {currentStatus !== 'Validation Pending' && currentStatus !== 'Ready to Initiate' && currentStatus !== 'Running' && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/schemes/earas/area-estimation/review', { state: { estType, season } })}
                    sx={{
                      borderColor: '#ffd54f',
                      color: '#ffd54f',
                      fontWeight: 'bold',
                      '&:hover': { borderColor: '#ffd54f', bgcolor: 'rgba(255, 213, 79, 0.08)' },
                      borderRadius: 2,
                      px: 3,
                      py: 1
                    }}
                    startIcon={<RateReviewIcon />}
                  >
                    Review Workspace
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={handleExportSummary}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                    borderRadius: 2,
                    px: 2,
                    py: 1
                  }}
                  startIcon={<FileDownloadIcon />}
                >
                  Export Status
                </Button>
              </Stack>
            </Grid>

            {/* Status / Progress panel */}
            <Grid item xs={12} md={5}>
              <Box sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)'
              }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="inherit">Workflow Status</Typography>
                    <Chip
                      label={
                        currentStatus === 'Validation Pending' ? 'Validation Pending' :
                          currentStatus === 'Ready to Initiate' ? 'Ready to Initiate' :
                            currentStatus === 'Running' ? 'Initiation Running' :
                              currentStatus === 'Review Required' ? 'Awaiting Submission' :
                                currentStatus === 'Awaiting Verifier 1' ? 'Awaiting Verifier 1' :
                                  currentStatus === 'Awaiting Verifier 2' ? 'Awaiting Verifier 2' :
                                    currentStatus === 'Awaiting Verifier 3' ? 'Awaiting Verifier 3' :
                                      currentStatus === 'Awaiting Admin Approval' ? 'Awaiting Approver 2' :
                                        currentStatus === 'Awaiting Director Approval' ? 'Awaiting Additional Director' :
                                          currentStatus === 'Completed' ? 'Completed' : currentStatus
                      }
                      color={getStatusColor(currentStatus)}
                      variant="filled"
                      sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, textAlign: 'right', fontStyle: 'italic' }}>
                    Last Validation Check: <strong>{lastValidationTime}</strong>
                  </Typography>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 0.5 }} />

                  {/* Progressive tracker screen */}
                  {currentStatus === 'Running' && (
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#ff9800' }}>
                        {runningStep === 0 ? '⚙️ Calculations running...' :
                          runningStep === 1 ? '🔍 Verifying datasets integrity...' :
                            runningStep === 2 ? '⚙️ Running agricultural extrapolation algorithms...' :
                              '✅ Compiling final tables...'}
                      </Typography>
                      <LinearProgress
                        variant={runningStep === 0 ? 'indeterminate' : 'determinate'}
                        value={runningStep === 0 ? undefined : estimationProgress}
                        color="warning"
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      {runningStep !== 0 && (
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.8 }}>
                          {estimationProgress}% Completed
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Activity Log — compact summary row with open button */}
                  <Box sx={{
                    pt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    flexWrap: 'wrap'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HistoryIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ opacity: 0.75, fontStyle: 'italic' }}>
                        {activities.length === 0
                          ? 'No activity recorded yet'
                          : `${activities.length} event${activities.length > 1 ? 's' : ''} logged`}
                      </Typography>
                      {activities.length > 0 && (
                        <Chip
                          label={activities[activities.length - 1].action}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            height: 20,
                            maxWidth: 160,
                            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                          }}
                        />
                      )}
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => setOpenActivityLog(true)}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.4)',
                        color: 'white',
                        fontSize: '0.72rem',
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 2,
                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' }
                      }}
                    >
                      View Activity Log
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Validation Failure Drawer/Modal */}
      <Dialog
        open={openValidationFail}
        onClose={() => setOpenValidationFail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#d32f2f' }}>
            <ErrorOutlineIcon />
            <Typography variant="h4" fontWeight={600} color="inherit">
              Pending Form-1 Submissions
            </Typography>
          </Stack>
          <IconButton onClick={() => setOpenValidationFail(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            The following zones are pending Form-1 submissions for <strong>{season} Season ({year})</strong>. Validation failed. Estimation cannot be initiated.
          </DialogContentText>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 350 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Taluk</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Zone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Investigator</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Pending Clusters</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationResult?.pendingZones?.length > 0 ? (
                  validationResult.pendingZones.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.district}</TableCell>
                      <TableCell>{row.taluk}</TableCell>
                      <TableCell>{row.zone}</TableCell>
                      <TableCell>{row.investigatorName || 'N/A'}</TableCell>
                      <TableCell>
                        {row.pendingClusters && row.pendingClusters.length > 0 ? (
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                            {row.pendingClusters.map((cluster, cidx) => (
                              <Chip key={cidx} label={cluster} size="small" variant="filled" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 500 }} />
                            ))}
                          </Stack>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={row.status} color="error" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No pending submissions found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleExportPending}
            startIcon={<FileDownloadIcon />}
          >
            Export List
          </Button>
          <Button
            variant="outlined"
            onClick={handleValidate}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Initiation Confirmation Dialog */}
      <Dialog
        open={openInitiateConfirm}
        onClose={() => setOpenInitiateConfirm(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e7d32' }}>
          <CheckCircleOutlineIcon />
          <Typography variant="h4" fontWeight={600} color="inherit">
            Confirm Estimation Initiation
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            All required Form-1 submissions are available for <strong>{estType} ({year})</strong>. Do you want to proceed with executing the Area Estimation algorithm?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="secondary" onClick={() => setOpenInitiateConfirm(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={handleInitiate} sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
            Initiate Estimation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Step Confirmation Dialog with Comments */}
      <Dialog
        open={openWorkflowModal}
        onClose={() => setOpenWorkflowModal(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 400 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
          <Typography variant="h4" fontWeight={600} color="inherit">
            Workflow Action: {workflowActionName}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide verification remarks / comments to progress the area estimation results to: <strong>{workflowNextState}</strong>.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks / Comments"
            variant="outlined"
            value={workflowComments}
            onChange={(e) => setWorkflowComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="secondary" onClick={() => setOpenWorkflowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleWorkflowTransitionSubmit}
            sx={{ fontWeight: 'bold' }}
          >
            Confirm & Forward
          </Button>
        </DialogActions>
      </Dialog>
      {/* Activity Log Dialog */}
      <Dialog
        open={openActivityLog}
        onClose={() => setOpenActivityLog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            maxHeight: '85vh'
          }
        }}
      >
        {/* Dark header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <HistoryIcon sx={{ color: '#ffd54f', fontSize: '1.4rem' }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">
                Activity Log
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {estType}{estType === 'Seasonal Crops' ? ` · ${season} Season` : ''} · {year}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {activities.length > 0 && (
              <Chip
                label={`${activities.length} event${activities.length > 1 ? 's' : ''}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }}
              />
            )}
            <IconButton onClick={() => setOpenActivityLog(false)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa' }}>
          {activities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 4 }}>
              <HistoryIcon sx={{ fontSize: '3rem', color: '#bdbdbd', mb: 1 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No Activity Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Activity will appear here once the estimation workflow begins.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', px: 3, py: 2 }}>
              {/* Vertical timeline line */}
              <Box sx={{
                position: 'absolute',
                left: 43,
                top: 28,
                bottom: 16,
                width: 2,
                bgcolor: '#e0e0e0',
                borderRadius: 1
              }} />

              <Stack spacing={0}>
                {[...activities].reverse().map((act, idx) => {
                  const isInitiated = act.action.includes('Initiated');
                  const isCompleted = act.action.includes('Completed') || act.action.includes('Published');
                  const isFailed = act.action.includes('Failed');
                  const isReset = act.action.includes('Re-initiated');
                  const isPassed = act.action.includes('Passed');

                  const dotColor =
                    isInitiated ? '#1976d2' :
                      isCompleted ? '#2e7d32' :
                        isFailed ? '#d32f2f' :
                          isReset ? '#ed6c02' :
                            isPassed ? '#2e7d32' : '#7b1fa2';

                  const actionIcon =
                    isInitiated ? '🚀' :
                      isCompleted ? '🏁' :
                        isFailed ? '❌' :
                          isReset ? '🔄' :
                            isPassed ? '✔️' : '📋';

                  const dt = new Date(act.timestamp);
                  const dtStr = dt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        py: 1.5,
                        alignItems: 'flex-start',
                        position: 'relative'
                      }}
                    >
                      {/* Timeline dot */}
                      <Box sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        bgcolor: dotColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0,
                        zIndex: 1,
                        boxShadow: `0 2px 8px ${dotColor}55`
                      }}>
                        {actionIcon}
                      </Box>

                      {/* Content card */}
                      <Box sx={{
                        flex: 1,
                        bgcolor: 'white',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        border: '1px solid',
                        borderColor: `${dotColor}22`,
                        mb: idx < activities.length - 1 ? 0.5 : 0
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.3 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: dotColor, lineHeight: 1.3 }}>
                            {act.action}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap', ml: 1, mt: 0.2 }}>
                            {dtStr}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          👤 {act.user}
                        </Typography>
                        {act.remarks && (
                          <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            display: 'block',
                            fontStyle: 'italic',
                            mt: 0.4,
                            borderTop: '1px solid #f0f0f0',
                            pt: 0.4
                          }}>
                            {act.remarks}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            Showing all {activities.length} recorded workflow event{activities.length !== 1 ? 's' : ''}
          </Typography>
          <Button variant="outlined" onClick={() => setOpenActivityLog(false)} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>


    </Grid>
  );
};

export default AreaEstimationDashboard;

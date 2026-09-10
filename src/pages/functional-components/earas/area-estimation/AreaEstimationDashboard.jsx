import React, { useState, useEffect } from 'react';
import {
  Alert,
  Grid,
  Typography,
  Box,
  Button,
  FormControl,
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
  IconButton,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import {
  fetchDashboard,
  fetchObservationSummary,
  fetchRunActivity,
  fetchRunProgress,
  initiateEstimation,
  validateEstimation,
  advanceApproval,
  fetchApprovalStatus
} from './areaEstimationApi';
import { currentAgriYear, toSelection } from './areaEstimationMappers';
import { apiErrorMessage } from './apiErrors';

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TableChartIcon from '@mui/icons-material/TableChart';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LayersIcon from '@mui/icons-material/Layers';
import OpacityIcon from '@mui/icons-material/Opacity';
import SpaIcon from '@mui/icons-material/Spa';
import GrainIcon from '@mui/icons-material/Grain';


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
  // The agricultural year the user selected in the header, in the application's own form
  // ("2025-2026"). The bare '2026' this screen used was a mock-era leftover.
  const year = currentAgriYear();
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

  /**
   * Advances the estimation one approval stage.
   *
   * The backend decides everything that matters: whether this user holds the stage's permission,
   * whether they have already acted on this run, and which stage comes next. A refusal is reported
   * as it comes back rather than pre-empted by a control this screen disabled on a guess.
   */
  const handleWorkflowTransitionSubmit = async () => {
    if (!activeRunId) {
      return;
    }

    try {
      const result = await advanceApproval(activeRunId, {
        remarks: workflowComments,
        expectedVersion: approvalState?.version
      });

      setOpenWorkflowModal(false);
      setWorkflowComments('');
      setApiError(null);
      setNotice(result?.published ? 'Estimation approved and published.' : `Advanced to ${result?.statusLabel}.`);

      await fetchStatusAndMetrics();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (error) {
      setOpenWorkflowModal(false);
      setApiError(apiErrorMessage(error));
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

  // Execution progress, as reported by the engine — never generated here.
  const [estimationProgress, setEstimationProgress] = useState(0);
  const [runningStep, setRunningStep] = useState(0); // 0: Idle, 1: Validation, 2: Calculation, 3: Completed

  // The backend's dashboard payload, kept whole so reconciliation and warnings can be shown.
  const [dashboardState, setDashboardState] = useState(null);
  const [activeRunId, setActiveRunId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [notice, setNotice] = useState(null);
  // The approval chain as the backend reports it — the stepper renders this, it does not infer it.
  const [approvalState, setApprovalState] = useState(null);

  // Load status & metrics whenever filters change, with 2-second polling to auto-reflect updates for other users/roles
  useEffect(() => {
    fetchStatusAndMetrics();

    // Only the user's own screen selection is kept locally — it is a presentation preference, not
    // estimation state. Everything else now comes from the backend on every poll.
    localStorage.setItem('earas_selected_estType', estType);
    localStorage.setItem('earas_selected_season', season);
    localStorage.setItem('earas_selected_landType', landType);

    // The same two-second cadence the screen always used, now reading the real run.
    const pollInterval = setInterval(fetchStatusAndMetrics, 2000);
    return () => clearInterval(pollInterval);
  }, [estType, season, landType]);

  /**
   * Loads the dashboard from the backend.
   *
   * One call returns the run, its progress, the validation counters, the warning count and the
   * reconciliation state. Nothing on this screen is computed here — the totals shown are the
   * persisted ones.
   */
  const fetchStatusAndMetrics = async () => {
    const selection = toSelection({ estType, year, season, landType, districtId: district });

    try {
      const dashboard = await fetchDashboard(selection);
      setDashboardState(dashboard);
      setApiError(null);

      setCurrentStatus(dashboard?.statusLabel || 'Validation Pending');
      setEstimationProgress(dashboard?.progressPercent ?? 0);

      setMetrics({
        totalZones: dashboard?.totalZones ?? 0,
        submittedZones: dashboard?.submittedZones ?? 0,
        pendingZones: dashboard?.reconciliation?.warningCount ?? 0,
        formPendingZones: dashboard?.formPendingZones ?? 0,
        completedEstimations: dashboard?.completedEstimations ?? 0,
        clarificationsPending: 0
      });

      if (dashboard?.lastValidatedAt) {
        setLastValidationTime(new Date(dashboard.lastValidatedAt).toLocaleString('en-IN'));
      }

      const runId = dashboard?.currentRun?.runId;
      setActiveRunId(runId || null);

      if (runId) {
        // The activity log is the run's own transition history — real actors, real timestamps.
        const [activity, summary] = await Promise.all([
          fetchRunActivity(runId).catch(() => []),
          fetchObservationSummary(runId).catch(() => null)
        ]);

        setActivities(
          (activity || []).map((entry) => ({
            user: entry.user,
            action: entry.action,
            timestamp: entry.timestamp,
            remarks: entry.remarks
          }))
        );

        if (summary) {
          setMetrics((previous) => ({ ...previous, clarificationsPending: summary.blocking }));
        }

        // Whether the run may advance, and what it needs, comes from the backend.
        setApprovalState(await fetchApprovalStatus(runId).catch(() => null));
      } else {
        setActivities([]);
        setApprovalState(null);
      }
    } catch (error) {
      // The screen keeps whatever it last showed and states the problem, rather than blanking or
      // silently reverting to something invented.
      setApiError(apiErrorMessage(error));
    }
  };

  /**
   * Runs the real validation.
   *
   * The rules live in the backend — Form-1 completeness, master data, cluster configuration — and
   * are not repeated here. This reads the outcome and shows it.
   */
  const handleValidate = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const result = await validateEstimation(toSelection({ estType, year, season, landType, districtId: district }));

      // The zone-level detail comes from the backend, including which stage of the workflow each
      // zone is stuck at — work allocation, cluster configuration, Form-1 entry or Form-1 approval.
      // The cause is never derived here: the backend is the only place that has the counts.
      setValidationResult({
        passed: result.passed,
        runId: result.runId,
        totalZones: result.totalZones,
        readyZones: result.readyZones,
        pendingZonesCount: result.pendingZones,
        // Zones holding no clusters of the selected land type. Not failures — not part of the run.
        outOfScopeZones: result.outOfScopeZones,
        completionPercent: result.completionPercent,
        orphanWorkAllocationRows: result.orphanWorkAllocationRows,
        nullAreaRows: result.nullAreaRows,
        pendingZones: (result.pendingZoneDetails || []).map((zone) => ({
          district: zone.district,
          taluk: zone.taluk,
          zone: zone.zone,
          investigatorName: zone.investigatorName,
          expectedClusters: zone.expectedClusters,
          completedClusters: zone.completedClusters,
          submittedClusters: zone.submittedClusters,
          // A count, not a list of ids. The drawer used to treat it as an array, which meant the
          // column silently rendered "N/A" for every row.
          pendingClusters: zone.pendingClusters,
          awaitingApprovalClusters: zone.awaitingApprovalClusters,
          workAllocationRows: zone.workAllocationRows,
          status: zone.status,
          statusLabel: zone.statusLabel,
          statusDetail: zone.statusDetail
        }))
      });

      setLastValidationTime(
        result.validatedAt ? new Date(result.validatedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')
      );

      // The run's status is whatever validation set it to; the screen reflects it rather than
      // deciding for itself.
      if (result.passed) {
        setOpenInitiateConfirm(true);
      } else {
        setOpenValidationFail(true);
      }

      await fetchStatusAndMetrics();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (error) {
      // A bad request, an unreachable BTR or Form-1, or missing master data all land here with the
      // backend's own explanation.
      setApiError(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };



  /**
   * Starts the real estimation and follows its actual progress.
   *
   * No simulated percentage: the engine reports its own stage — loading, calculating, persisting,
   * aggregating, reconciling — and the bar shows that. A run that takes four seconds shows four
   * seconds; one that fails stops rather than reaching 100%.
   */
  const handleInitiate = async (partialRun = false) => {
    setOpenInitiateConfirm(false);
    setOpenValidationFail(false);
    setApiError(null);

    try {
      const status = await initiateEstimation({
        ...toSelection({ estType, year, season, landType, districtId: district }),
        partialRun
      });

      setActiveRunId(status?.runId || null);
      setCurrentStatus(status?.statusLabel || 'Running');
      setRunningStep(1);
      setEstimationProgress(status?.progressPercent ?? 0);

      if (status?.runId) {
        pollExecution(status.runId);
      }

      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (error) {
      // A duplicate initiation, a run that has not passed validation, or an invalid state all come
      // back as a clear refusal from the backend rather than starting a second run.
      setApiError(apiErrorMessage(error));
      setRunningStep(0);
      await fetchStatusAndMetrics();
    }
  };

  /** Follows a running execution to its real conclusion. */
  const pollExecution = (runId) => {
    const interval = setInterval(async () => {
      try {
        const progress = await fetchRunProgress(runId);

        setEstimationProgress(progress?.progressPercent ?? 0);
        setCurrentStatus(progress?.statusLabel || 'Running');

        // The stepper follows the engine's own stage rather than a percentage guess.
        const step = progress?.currentStep;
        if (step === 'LOADING' || step === 'CALCULATING') {
          setRunningStep(2);
        } else if (step === 'PERSISTING' || step === 'AGGREGATING' || step === 'RECONCILING') {
          setRunningStep(3);
        }

        const finished = progress?.status && progress.status !== 'RUNNING';
        if (finished) {
          clearInterval(interval);
          setRunningStep(0);

          if (progress.status === 'FAILED') {
            // Reported, not hidden behind a bar that quietly stopped moving.
            setApiError(progress.failureReason || 'The estimation run failed. See the run log for details.');
          }

          await fetchStatusAndMetrics();
          window.dispatchEvent(new Event('earas-notifications-updated'));
        }
      } catch (error) {
        clearInterval(interval);
        setRunningStep(0);
        setApiError(apiErrorMessage(error));
      }
    }, 2000);
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
    // Quoted, because the status detail is a sentence and contains no delimiter guarantee.
    const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csvRows = [
      ['District', 'Taluk', 'Zone', 'Investigator Name', 'Expected Clusters', 'Completed Clusters',
        'Pending Clusters', 'Awaiting Approval', 'Status', 'Details'].map(cell),
      ...validationResult.pendingZones.map(p => [
        p.district,
        p.taluk,
        p.zone,
        p.investigatorName || 'N/A',
        p.expectedClusters ?? '',
        p.completedClusters ?? '',
        p.pendingClusters ?? '',
        p.awaitingApprovalClusters ?? '',
        p.statusLabel,
        p.statusDetail
      ].map(cell))
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

  // Colour by who has to act, not by severity: a zone waiting on approval has all its data and is
  // one signature from ready, while one with no work allocation has not started.
  const getPendingReasonColor = (status) => {
    switch (status) {
      case 'PENDING_FORM1_APPROVAL': return 'info';
      case 'INCOMPLETE_FORM1': return 'warning';
      case 'NO_CLUSTERS_CONFIGURED': return 'default';
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

      {apiError && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        </Grid>
      )}

      {notice && (
        <Grid item xs={12}>
          <Alert severity="success" onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        </Grid>
      )}

      {/* A partial run's figures are real but cover part of the state. Said plainly, wherever they
          appear, because a subtotal that reads as a total is the one failure this feature can cause. */}
      {dashboardState?.partial && (
        <Grid item xs={12}>
          <Alert severity="warning" icon={<ErrorOutlineIcon />}>
            <strong>Partial run.</strong> This estimation covers {dashboardState.estimatedLocalbodies} panchayats
            {dashboardState.excludedLocalbodies > 0
              ? `; ${dashboardState.excludedLocalbodies} were excluded because some of their clusters lie in zones that had not passed validation.`
              : '.'}{' '}
            Block, district and state figures are sums over this subset and are <strong>not</strong> state totals.
            A partial run cannot be approved or published — complete Form-1 for the remaining zones, re-validate and
            re-run in full.
          </Alert>
        </Grid>
      )}

      {/* Reconciliation, from the run itself. A result can be available and still need a warning. */}
      {dashboardState?.reconciliation && !dashboardState.reconciliation.reconciled && (
        <Grid item xs={12}>
          <Alert severity="error">
            This run did not reconcile. {dashboardState.reconciliation.failures?.join(' ')}
          </Alert>
        </Grid>
      )}

      {dashboardState?.reconciliation?.panchayatsWithoutBlock > 0 && (
        <Grid item xs={12}>
          <Alert severity="warning">
            {dashboardState.reconciliation.panchayatsWithoutBlock} panchayats have no resolved block. Their area is
            excluded from block level totals but included at district and state.
          </Alert>
        </Grid>
      )}

      {/* Estimation Category Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {estimationCategories.map((card) => {
            const isSelected = estType === card.id;
            // Only the selected category has a loaded run. Showing a status for the others would
            // mean four more dashboard calls, and the old localStorage value was not a real status.
            const stateForCard = isSelected ? currentStatus : null;
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
                        label={stateForCard || 'Select to load'}
                        color={stateForCard ? getStatusColor(stateForCard) : 'default'}
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
                {approvalState?.published
                  ? 'This estimation has been approved and published. It is final.'
                  : approvalState?.nextStage
                    ? `This estimation is at "${approvalState.statusLabel}". The next step is "${approvalState.nextStage.action}", which requires the ${approvalState.nextStage.permissionHolderRole} role. Each stage must be performed by a different person.`
                    : 'Validate that every reporting zone has completed its Form-1 submission before running the estimation.'}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleValidate}
                  disabled={loading}
                  sx={{ fontWeight: 'bold', borderRadius: 2, px: 3, py: 1 }}
                >
                  {loading ? 'Validating…' : 'Validate Data Availability'}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => setOpenInitiateConfirm(true)}
                  disabled={currentStatus !== 'Ready to Initiate'}
                  sx={{ fontWeight: 'bold', borderRadius: 2, px: 3, py: 1 }}
                >
                  Initiate Estimation
                </Button>

                {/* One action, described by the backend. The screen does not decide who may use it:
                    the attempt is made and a refusal is shown as it comes back. Disabled only when
                    the *run* cannot advance — unresolved observations, or the chain is finished. */}
                {approvalState?.nextStage && !approvalState.published && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleOpenWorkflowTransition(approvalState.nextStage.toStatus, approvalState.nextStage.action)}
                    disabled={!approvalState.canAdvance}
                    sx={{ fontWeight: 'bold', borderRadius: 2, px: 3, py: 1 }}
                  >
                    {approvalState.nextStage.action}
                  </Button>
                )}
              </Stack>

              {approvalState && !approvalState.canAdvance && !approvalState.published && approvalState.blockedReason && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {approvalState.blockedReason}
                </Alert>
              )}

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
              Zones Not Ready for Estimation
            </Typography>
          </Stack>
          <IconButton onClick={() => setOpenValidationFail(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            The following zones are not ready for <strong>{season} Season ({year})</strong>, land type{' '}
            <strong>{landType}</strong>. Validation failed and estimation cannot be initiated. The Status column names
            the step each zone is waiting on — clearing a later step will not help while an earlier one is outstanding.
            {validationResult?.outOfScopeZones > 0 && (
              <> A further <strong>{validationResult.outOfScopeZones}</strong> zones hold no {landType} clusters this
              year and are not part of this run.</>
            )}
          </DialogContentText>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 350 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Taluk</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Zone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Investigator</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Clusters</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Pending For</TableCell>
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
                        {row.expectedClusters > 0 ? (
                          <Typography variant="body2">
                            {row.completedClusters} of {row.expectedClusters} approved
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">None configured</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Chip
                            label={row.statusLabel}
                            color={getPendingReasonColor(row.status)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                          {row.statusDetail && (
                            <Typography variant="caption" color="text.secondary">
                              {row.statusDetail}
                            </Typography>
                          )}
                        </Stack>
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
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleExportPending}
              startIcon={<FileDownloadIcon />}
            >
              Export List
            </Button>
            {validationResult?.readyZones > 0 && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleInitiate(true)}
                startIcon={<PlayArrowIcon />}
              >
                Estimate Ready Panchayats Only
              </Button>
            )}
          </Stack>
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

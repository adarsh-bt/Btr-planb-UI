import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';

import AddCommentIcon from '@mui/icons-material/AddComment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

import {
  advanceApproval,
  approveObservation,
  createObservation,
  fetchActiveRunStatus,
  fetchApprovalStatus,
  fetchObservationSummary,
  fetchObservations,
  requestFurtherClarification
} from './areaEstimationApi';
import { currentAgriYear, toSelection } from './areaEstimationMappers';
import { apiErrorMessage, toApiError } from './apiErrors';

/**
 * The observation review workspace.
 *
 * Reviewers raise observations, read zone responses, resolve them, and advance the estimation
 * through its approval chain.
 *
 * **No authorization is decided here.** The previous version mapped hardcoded email addresses to
 * verifier roles — and the copy in this file disagreed with the one in the dashboard about who held
 * which role. Both are gone. The screen shows what the backend reports and attempts the action; a
 * 403 is displayed as a real refusal, never hidden by disabling a control on a guess.
 *
 * Observations reference a result; they never modify one. Nothing here writes a hectare figure.
 */
const ObservationReview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Seasonal Crops';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const landType = localStorage.getItem('earas_selected_landType') || 'All';
  const year = currentAgriYear();

  const [runId, setRunId] = useState(null);
  const [observations, setObservations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [approval, setApproval] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const [openAddObs, setOpenAddObs] = useState(false);
  const [obsType, setObsType] = useState('Data Issue');
  const [severity, setSeverity] = useState('MEDIUM');
  const [zoneId, setZoneId] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [openApprove, setOpenApprove] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const active = await fetchActiveRunStatus(toSelection({ estType, year, season, landType }));

      if (!active?.runId) {
        setRunId(null);
        setObservations([]);
        setSummary(null);
        setApproval(null);
        return;
      }

      setRunId(active.runId);

      const [list, counts, chain] = await Promise.all([
        fetchObservations({ runId: active.runId }),
        fetchObservationSummary(active.runId),
        // The approval chain is informational here; a failure to read it must not blank the
        // observations, which are this screen's primary content.
        fetchApprovalStatus(active.runId).catch(() => null)
      ]);

      setObservations(list || []);
      setSummary(counts);
      setApproval(chain);
    } catch (caught) {
      setError(apiErrorMessage(caught));
      setObservations([]);
    } finally {
      setLoading(false);
    }
  }, [estType, season, landType, year]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddObservation = async () => {
    if (!remarks.trim() || !runId) {
      return;
    }

    setSubmitting(true);
    try {
      await createObservation({
        runId,
        obsType,
        severity,
        zoneId: zoneId ? Number(zoneId) : undefined,
        zoneName: zoneName || undefined,
        remarks
      });

      setOpenAddObs(false);
      setRemarks('');
      setZoneId('');
      setZoneName('');
      await load();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (caught) {
      // A duplicate unresolved observation comes back as a 409 with the backend's explanation.
      setError(apiErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  /** Resolves a resubmitted observation. Permitted only from RESUBMITTED — the backend decides. */
  const handleApproveObservation = async (observation) => {
    try {
      await approveObservation(observation.id, { expectedVersion: observation.version });
      await load();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (caught) {
      setError(apiErrorMessage(caught));
    }
  };

  /** Asks the zone again. The supported RESUBMITTED to CLARIFICATION_REQUESTED loop. */
  const handleRequestClarification = async (observation) => {
    try {
      await requestFurtherClarification(observation.id, { expectedVersion: observation.version });
      await load();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (caught) {
      setError(apiErrorMessage(caught));
    }
  };

  /**
   * Advances the estimation one approval stage.
   *
   * The backend decides whether this user may: it checks the permission and refuses a second stage
   * by the same person on the same run. A refusal is shown as it comes back.
   */
  const handleAdvanceApproval = async () => {
    if (!runId) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await advanceApproval(runId, {
        remarks: approvalRemarks,
        expectedVersion: approval?.version
      });

      setOpenApprove(false);
      setApprovalRemarks('');
      setNotice(
        result?.published ? 'Estimation approved and published.' : `Estimation advanced to ${result?.statusLabel}.`
      );
      await load();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (caught) {
      const apiError = toApiError(caught);
      // 403 means "not you" — either the permission is missing or this user already acted on this
      // run. Shown plainly rather than disguised as a disabled button.
      setError(apiError.message);
      setOpenApprove(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered =
    filterStatus === 'All' ? observations : observations.filter((observation) => observation.status === filterStatus);

  const statusColour = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'RESUBMITTED':
        return 'info';
      case 'CLARIFICATION_REQUESTED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const metric = (label, value, colour, icon) => (
    <Grid item xs={12} sm={3}>
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ color: colour, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          {icon}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Observation Review Workspace
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => setOpenAddObs(true)} disabled={!runId}>
            Add Observation
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#04255e' }}
            onClick={() => setOpenApprove(true)}
            disabled={!runId || !approval?.canAdvance}
          >
            {approval?.nextStage?.action || 'Approve Estimation'}
          </Button>
        </Stack>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
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

      {/* What the chain is waiting on, from the backend — not inferred from who is signed in. */}
      {approval && (
        <Grid item xs={12}>
          <Alert severity={approval.published ? 'success' : approval.canAdvance ? 'info' : 'warning'}>
            <AlertTitle>{approval.statusLabel}</AlertTitle>
            {approval.published
              ? 'This estimation is published and final.'
              : approval.canAdvance
                ? `Next stage: ${approval.nextStage?.action}. Requires the "${approval.nextStage?.requiredPermission}" permission, held by the ${approval.nextStage?.permissionHolderRole} role. Each stage must be performed by a different person.`
                : approval.blockedReason}
          </Alert>
        </Grid>
      )}

      {summary && (
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {metric(
              'Awaiting Clarification',
              summary.awaitingClarification,
              '#ff9800',
              <HelpOutlineIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.6 }} />
            )}
            {metric(
              'Resubmissions (Needs Review)',
              summary.resubmitted,
              '#1e88e5',
              <HistoryIcon sx={{ fontSize: 40, color: '#1e88e5', opacity: 0.6 }} />
            )}
            {metric(
              'Resolved / Approved',
              summary.approved,
              '#2e7d32',
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.6 }} />
            )}
            {metric(
              'Total Observations',
              summary.total,
              '#04255e',
              <PriorityHighIcon sx={{ fontSize: 40, color: '#04255e', opacity: 0.6 }} />
            )}
          </Grid>
        </Grid>
      )}

      <Grid item xs={12}>
        <MainCard
          title="Estimation Records Review Workspace"
          secondary={
            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Filter Status</InputLabel>
              <Select value={filterStatus} label="Filter Status" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="All">All Observations</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="CLARIFICATION_REQUESTED">Clarification Requested</MenuItem>
                <MenuItem value="RESUBMITTED">Resubmitted</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          }
          sx={{ borderRadius: 3 }}
        >
          {loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" align="center" sx={{ mt: 2 }} color="text.secondary">
                Loading observations…
              </Typography>
            </Box>
          ) : !runId ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                No estimation run exists for this selection yet.
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => navigate('/schemes/earas/area-estimation')}>
                Go to the dashboard
              </Button>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                {observations.length === 0 ? 'No observations have been raised for this run.' : 'No observations match this filter.'}
              </Typography>
            </Box>
          ) : (
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
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>OBS-{row.id}</TableCell>
                      <TableCell>{row.obsType}</TableCell>
                      <TableCell>{row.zoneName || row.zoneId || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                        <Typography variant="body2">{row.remarks}</Typography>
                        {row.responses?.length > 0 && (
                          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f4f6f8', borderRadius: 2, borderLeft: '3px solid #1e88e5' }}>
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              Zone Response:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              &quot;{row.responses[row.responses.length - 1].responseText}&quot;
                            </Typography>
                            {row.responses[row.responses.length - 1].supportingNotes && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                Notes: {row.responses[row.responses.length - 1].supportingNotes}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.severity} size="small" sx={{ fontWeight: 'bold', minWidth: 70 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.statusLabel} color={statusColour(row.status)} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {/* Offered only where M11 permits the transition. A resolved observation is
                              terminal, so nothing is offered on one. */}
                          {row.status === 'RESUBMITTED' && (
                            <>
                              <Tooltip title="Approve / resolve">
                                <IconButton color="success" onClick={() => handleApproveObservation(row)}>
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Request further clarification">
                                <IconButton color="warning" onClick={() => handleRequestClarification(row)}>
                                  <HelpOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {row.status === 'CLARIFICATION_REQUESTED' && (
                            <Typography variant="caption" color="text.secondary">
                              Awaiting the zone
                            </Typography>
                          )}
                          {(row.status === 'APPROVED' || row.status === 'REJECTED') && (
                            <Typography variant="caption" color="text.secondary">
                              Resolved
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      {/* Add observation */}
      <Dialog open={openAddObs} onClose={() => setOpenAddObs(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Observation</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={obsType} label="Type" onChange={(e) => setObsType(e.target.value)}>
                <MenuItem value="Data Issue">Data Issue</MenuItem>
                <MenuItem value="Validation Issue">Validation Issue</MenuItem>
                <MenuItem value="Clarification Required">Clarification Required</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select value={severity} label="Severity" onChange={(e) => setSeverity(e.target.value)}>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Assigned Zone ID"
              size="small"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              helperText="Assigning a zone sends the clarification to that zone's officers. Leave empty to raise it without assignment."
            />
            <TextField label="Zone Name (optional)" size="small" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />

            <TextField label="Remarks" multiline rows={4} fullWidth value={remarks} onChange={(e) => setRemarks(e.target.value)} required />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddObs(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddObservation} disabled={submitting || !remarks.trim()}>
            {submitting ? 'Saving…' : 'Add Observation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Advance the approval chain */}
      <Dialog open={openApprove} onClose={() => setOpenApprove(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{approval?.nextStage?.action || 'Advance Estimation'}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            This requires the &quot;{approval?.nextStage?.requiredPermission}&quot; permission. Each stage of a run must
            be performed by a different person; if you have already acted on this run the request will be refused.
          </Typography>
          <TextField
            label="Verification remarks"
            multiline
            rows={3}
            fullWidth
            value={approvalRemarks}
            onChange={(e) => setApprovalRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprove(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdvanceApproval} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ObservationReview;

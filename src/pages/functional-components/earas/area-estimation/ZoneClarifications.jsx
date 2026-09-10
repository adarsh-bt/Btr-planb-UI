import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
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
import ReplyIcon from '@mui/icons-material/Reply';
import VisibilityIcon from '@mui/icons-material/Visibility';
import authservice from 'pages/authentication/services/authservice';

import { fetchObservations, fetchObservationHistory, respondToObservation } from './areaEstimationApi';
import { apiErrorMessage, toApiError } from './apiErrors';

/**
 * The zone officer's clarification portal.
 *
 * Lists the clarifications assigned to the officer's own zone and lets them answer. Everything shown
 * — status, dates, remarks, the response log — comes from the observation API; nothing is stored or
 * decided here.
 *
 * The zone is the one the user is signed in against (`activeZone`, the numeric zone id the header's
 * zone selector already sets). The backend filters by that id, so the portal cannot show another
 * zone's clarifications. The previous demo zone-switcher is gone: it let anyone view any zone's
 * observations, which is a data-access decision the frontend must not make.
 */
const ZoneClarifications = () => {
  const zoneId = authservice.getzone();

  const [clarifications, setClarifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openRespond, setOpenRespond] = useState(false);
  const [selectedObs, setSelectedObs] = useState(null);
  const [history, setHistory] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null);

  const load = useCallback(async () => {
    if (!zoneId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const list = await fetchObservations({ zoneId: Number(zoneId) });
      setClarifications(list || []);
    } catch (caught) {
      // An empty list is not an error, and an error is not an empty list — they are shown
      // differently on purpose.
      setError(apiErrorMessage(caught));
      setClarifications([]);
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    load();
  }, [load]);

  const openObservation = async (observation) => {
    setSelectedObs(observation);
    setRemarks('');
    setSupportingNotes('');
    setConflict(null);
    setOpenRespond(true);

    try {
      setHistory(await fetchObservationHistory(observation.id));
    } catch {
      // The log is supporting detail; failing to load it must not block a response.
      setHistory([]);
    }
  };

  /**
   * Submits the officer's answer.
   *
   * Sends the version that was read, so a clarification that changed since the screen loaded is
   * refused rather than answered blind. On a conflict the officer's text is kept and they are told
   * what happened — their work is not discarded to resolve a race.
   */
  const handleRespond = async () => {
    if (!remarks.trim() || !selectedObs) {
      return;
    }

    setSubmitting(true);
    setConflict(null);

    try {
      await respondToObservation(selectedObs.id, {
        responseText: remarks,
        supportingNotes,
        expectedVersion: selectedObs.version
      });

      setOpenRespond(false);
      setSelectedObs(null);
      setRemarks('');
      setSupportingNotes('');
      await load();
      window.dispatchEvent(new Event('earas-notifications-updated'));
    } catch (caught) {
      const apiError = toApiError(caught);

      if (apiError.isConflict) {
        // Text deliberately left in the box: the officer may still want it after reloading.
        setConflict(apiError.message);
      } else {
        setError(apiError.message);
        setOpenRespond(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /** Reloads the open observation after a conflict, so the officer answers the current state. */
  const reloadSelected = async () => {
    if (!selectedObs) {
      return;
    }
    try {
      const list = await fetchObservations({ zoneId: Number(zoneId) });
      setClarifications(list || []);
      const refreshed = (list || []).find((item) => item.id === selectedObs.id);
      setSelectedObs(refreshed || null);
      setConflict(null);
      if (!refreshed) {
        setOpenRespond(false);
      }
    } catch (caught) {
      setError(apiErrorMessage(caught));
    }
  };

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

  const awaitingResponse = selectedObs?.status === 'CLARIFICATION_REQUESTED';

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          My Zone Clarifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {zoneId ? `Active zone profile: ${zoneId}` : 'No zone is assigned to your account.'}
        </Typography>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {!zoneId && !loading && (
        <Grid item xs={12}>
          <Alert severity="info">
            Your account is not associated with a zone, so there are no clarifications to show. Zone assignment is
            managed in user administration.
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <MainCard title="Clarifications Assigned to My Zone" sx={{ borderRadius: 3 }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" align="center" sx={{ mt: 2 }} color="text.secondary">
                Loading clarifications…
              </Typography>
            </Box>
          ) : clarifications.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                No clarifications are pending for your zone.
              </Typography>
            </Box>
          ) : (
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
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clarifications.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>OBS-{row.id}</TableCell>
                      <TableCell>{row.obsType}</TableCell>
                      <TableCell sx={{ maxWidth: 320, wordBreak: 'break-word' }}>
                        <Typography variant="body2">{row.remarks}</Typography>
                        {row.responses?.length > 0 && (
                          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f4f6f8', borderRadius: 2, borderLeft: '3px solid #1e88e5' }}>
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              My last response:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              &quot;{row.responses[row.responses.length - 1].responseText}&quot;
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{row.raisedAt ? new Date(row.raisedAt).toLocaleDateString('en-IN') : '—'}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.severity} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.statusLabel} color={statusColour(row.status)} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={row.status === 'CLARIFICATION_REQUESTED' ? 'Respond' : 'View clarification log'}>
                          <IconButton
                            color={row.status === 'CLARIFICATION_REQUESTED' ? 'warning' : 'primary'}
                            onClick={() => openObservation(row)}
                          >
                            {row.status === 'CLARIFICATION_REQUESTED' ? <ReplyIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>

      <Dialog open={openRespond} onClose={() => setOpenRespond(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {awaitingResponse ? 'Respond to Observation' : 'Clarification Log'}
        </DialogTitle>
        <DialogContent dividers>
          {conflict && (
            <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={reloadSelected}>Reload</Button>}>
              {conflict} Your text has been kept — reload to see the current state before answering.
            </Alert>
          )}

          <Typography variant="subtitle2" color="text.secondary">
            {selectedObs?.obsType} · {selectedObs?.statusLabel}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
            {selectedObs?.remarks}
          </Typography>

          {awaitingResponse ? (
            <Stack spacing={2}>
              <TextField
                label="Remarks / Explanation"
                multiline
                rows={4}
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
              />
              <TextField
                label="Supporting Notes / Evidence"
                multiline
                rows={2}
                fullWidth
                value={supportingNotes}
                onChange={(e) => setSupportingNotes(e.target.value)}
              />
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {history.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No activity has been recorded for this observation yet.
                </Typography>
              )}
              {history.map((entry) => (
                <Box key={entry.id} sx={{ p: 1.5, bgcolor: '#f7f9fb', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {entry.performedAt ? new Date(entry.performedAt).toLocaleString('en-IN') : ''} · {entry.action}
                  </Typography>
                  {entry.clarificationText && <Typography variant="body2">{entry.clarificationText}</Typography>}
                  {entry.remarks && <Typography variant="body2">{entry.remarks}</Typography>}
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRespond(false)}>Close</Button>
          {awaitingResponse && (
            <Button variant="contained" onClick={handleRespond} disabled={submitting || !remarks.trim()}>
              {submitting ? 'Submitting…' : 'Submit Response'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ZoneClarifications;

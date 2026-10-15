import React, { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import ProductionEstimationService, { DISTRICTS_MASTER } from '../productionEstimationService';
import AreaVsCceComparisonCard from '../components/AreaVsCceComparisonCard';
import WorkflowTimeline from '../components/WorkflowTimeline';
import DefectHighlightBanner from '../components/DefectHighlightBanner';

const DirectorStateApprovalView = ({
  record = null,
  estimations = [],
  defects = [],
  onBack,
  onSelectIndividual,
  onOpenMarkDefect,
  onActionComplete,
  activeRoleUser = 'Director of Agriculture (State Approver)'
}) => {
  const [viewMode, setViewMode] = useState(record ? 'INDIVIDUAL' : 'CONSOLIDATED');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('ALL');
  const [remarks, setRemarks] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: '', message: '' });

  // District-wise state summary calculations
  const districtSummaries = useMemo(() => {
    return DISTRICTS_MASTER.map((d) => {
      const distEsts = estimations.filter((e) => e.district === d.name);
      const totalArea = distEsts.reduce((sum, e) => sum + (e.estimatedArea || 0), 0);
      const totalCceArea = distEsts.reduce((sum, e) => sum + (e.cceArea || 0), 0);
      const totalProd = distEsts.reduce((sum, e) => sum + (e.estimatedProduction || 0), 0);
      const pendingDirectorCount = distEsts.filter((e) => e.status === 'Pending Director Approval').length;
      const approvedCount = distEsts.filter((e) => e.status === 'Approved — Final').length;

      return {
        districtName: d.name,
        estimationsCount: distEsts.length,
        totalArea,
        totalCceArea,
        totalProd,
        pendingDirectorCount,
        approvedCount,
        estimations: distEsts
      };
    });
  }, [estimations]);

  const filteredDefects = record ? defects.filter((d) => d.estimationId === record.id) : [];

  const handleAction = (actionType, title, message) => {
    setConfirmDialog({ open: true, action: actionType, title, message });
  };

  const executeAction = () => {
    const actionType = confirmDialog.action;
    setConfirmDialog({ open: false, action: null, title: '', message: '' });

    if (record) {
      ProductionEstimationService.processWorkflowAction({
        estimationId: record.id,
        action: actionType,
        remarks,
        activeRole: 'Director / State Level Approver',
        activeUser: activeRoleUser
      });
      onActionComplete();
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon color="error" /> Director — State-Level Final Approval Portal
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Consolidated state agricultural production assessment & final approval authority.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant={viewMode === 'CONSOLIDATED' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setViewMode('CONSOLIDATED')}
              sx={{ fontWeight: 'bold' }}
            >
              State Summary View
            </Button>
            {record && (
              <Button
                variant={viewMode === 'INDIVIDUAL' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setViewMode('INDIVIDUAL')}
                sx={{ fontWeight: 'bold' }}
              >
                Selected Estimation Drill-Down ({record.id})
              </Button>
            )}
          </Stack>
        </Box>

        {/* View Mode 1: Consolidated State Summary View */}
        {viewMode === 'CONSOLIDATED' && (
          <Box>
            <Alert severity="success" icon={<VerifiedIcon />} sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                State-Level Agricultural Production Overview (Kerala)
              </Typography>
              <Typography variant="caption">
                Drill down by District → Taluk → Block → Panchayath to audit estimation figures prior to final state publication.
              </Typography>
            </Alert>

            {/* District Summaries Accordions */}
            {districtSummaries.map((ds) => (
              <Accordion key={ds.districtName} defaultExpanded sx={{ mb: 2, border: '1px solid #cbd5e1', borderRadius: '8px !important', overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                        📍 District: {ds.districtName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="caption" color="textSecondary">TOTAL ESTIMATIONS</Typography>
                      <Typography variant="body2" fontWeight="bold">{ds.estimationsCount}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="caption" color="textSecondary">ESTIMATED AREA</Typography>
                      <Typography variant="body2" fontWeight="bold">{ds.totalArea.toLocaleString('en-IN')} ha</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="textSecondary">ESTIMATED PRODUCTION</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#16a34a">{ds.totalProd.toLocaleString('en-IN')} MT</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Chip
                        label={`${ds.pendingDirectorCount} Pending Director`}
                        color={ds.pendingDirectorCount > 0 ? 'error' : 'success'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Estimation ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Taluk → Block → Panchayath</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Crop</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estimated Area</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>CCE Area</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Production</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Drill-Down Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ds.estimations.map((est) => (
                          <TableRow key={est.id} hover>
                            <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{est.id}</TableCell>
                            <TableCell>{est.taluk} → {est.block} → {est.panchayath}</TableCell>
                            <TableCell><Chip label={est.crop} size="small" variant="outlined" /></TableCell>
                            <TableCell align="right">{est.estimatedArea} {est.areaUnit}</TableCell>
                            <TableCell align="right">{est.cceArea} {est.areaUnit}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                              {est.estimatedProduction} {est.productionUnit}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={est.status}
                                color={est.status === 'Approved — Final' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  onSelectIndividual(est);
                                  setViewMode('INDIVIDUAL');
                                }}
                              >
                                Drill-Down & Approve
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* View Mode 2: Individual Estimation Drill-Down & Final Approval */}
        {viewMode === 'INDIVIDUAL' && record && (
          <Box>
            <DefectHighlightBanner defects={filteredDefects} onOpenDefects={onOpenMarkDefect} />

            <Box sx={{ mb: 3 }}>
              <AreaVsCceComparisonCard
                estimatedArea={record.estimatedArea}
                cceArea={record.cceArea}
                unit={record.areaUnit}
                cceObservationsCount={record.cceObservationsCount}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <WorkflowTimeline
                timeline={record.workflowTimeline}
                currentStage={record.currentStage}
                currentRole={record.currentRole}
              />
            </Box>

            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
              Director Final State Approval & Sign-Off
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Director Final Approval Remarks"
              placeholder="Enter official state agricultural department sign-off notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ReplayIcon />}
                onClick={() => handleAction('RETURN', 'Return to Estimator', 'Return estimation for corrections?')}
              >
                Return for Correction
              </Button>

              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleAction('DIRECTOR_FINAL_APPROVE', 'GRANT FINAL STATE APPROVAL', 'Are you sure you want to issue FINAL STATE APPROVAL for this production estimate? Status will be set to Approved — Final.')}
                sx={{ fontWeight: 'bold', px: 3 }}
              >
                Grant Final Approval (Approved — Final)
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle fontWeight="bold">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" color="success" onClick={executeAction}>Confirm Final Approval</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DirectorStateApprovalView;

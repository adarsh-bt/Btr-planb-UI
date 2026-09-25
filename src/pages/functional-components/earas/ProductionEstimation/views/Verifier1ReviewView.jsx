import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Divider,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';

import ProductionEstimationService from '../productionEstimationService';
import AreaVsCceComparisonCard from '../components/AreaVsCceComparisonCard';
import DefectHighlightBanner from '../components/DefectHighlightBanner';

const Verifier1ReviewView = ({
  record,
  defects = [],
  onBack,
  onOpenMarkDefect,
  onActionComplete,
  activeRoleUser = 'Dr. Suresh Kumar (Verifier 1)'
}) => {
  const [remarks, setRemarks] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: '', message: '' });

  if (!record) return null;
  const filteredDefects = defects.filter((d) => d.estimationId === record.id);

  const handleAction = (actionType, title, message) => {
    setConfirmDialog({ open: true, action: actionType, title, message });
  };

  const executeAction = () => {
    const actionType = confirmDialog.action;
    setConfirmDialog({ open: false, action: null, title: '', message: '' });

    ProductionEstimationService.processWorkflowAction({
      estimationId: record.id,
      action: actionType,
      remarks,
      activeRole: 'Production Estimator Verifier 1',
      activeUser: activeRoleUser
    });

    onActionComplete();
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon color="warning" /> Verifier 1 Review — {record.id}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Review field estimation data, verify CCE area variance, mark defects if found, and forward to Verifier 2.
              </Typography>
            </Box>
          </Box>

          <Button variant="outlined" color="error" startIcon={<ReportProblemIcon />} onClick={onOpenMarkDefect}>
            + Mark Defect
          </Button>
        </Box>

        {/* Defect Highlight Banner */}
        <DefectHighlightBanner defects={filteredDefects} onOpenDefects={onOpenMarkDefect} />

        {/* Read-Only Source Summary */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Read-Only Source Verification Data
          </Typography>
          <Typography variant="caption" display="block">
            Location: {record.district} → {record.taluk} → {record.block} → {record.panchayath} | Crop: {record.crop} | Season: {record.season} ({record.financialYear})
          </Typography>
        </Alert>

        {/* Comparison Card */}
        <Box sx={{ mb: 3 }}>
          <AreaVsCceComparisonCard
            estimatedArea={record.estimatedArea}
            cceArea={record.cceArea}
            unit={record.areaUnit}
            cceObservationsCount={record.cceObservationsCount}
          />
        </Box>

        {/* Production Metrics */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">ESTIMATED YIELD</Typography>
              <Typography variant="h5" fontWeight="bold" color="#0284c7">{record.yieldEstimate} {record.yieldUnit}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">TOTAL DERIVED PRODUCTION</Typography>
              <Typography variant="h5" fontWeight="bold" color="#16a34a">{record.estimatedProduction} {record.productionUnit}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">PREVIOUS SEASON PRODUCTION</Typography>
              <Typography variant="h5" fontWeight="bold" color="#475569">{record.prevSeasonProduction} {record.productionUnit}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Verifier Remarks */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          Verifier 1 Remarks & Verification Decision
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Verifier 1 Verification Remarks"
          placeholder="Add comments on area comparison, CCE plot observations, or defect notes..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Verification Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ReplayIcon />}
            onClick={() => handleAction('RETURN', 'Return to Estimator', 'Are you sure you want to return this estimation to the Production Estimator for corrections?')}
          >
            Return to Estimator
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => handleAction('VERIFY_FORWARD_1', 'Verify & Forward to Verifier 2', 'Are you sure you want to verify this estimation and forward it to Production Estimator Verifier 2?')}
          >
            Verify & Forward to Verifier 2
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle fontWeight="bold">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
          {remarks && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 1, color: '#475569' }}>
              Remarks: "{remarks}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={executeAction}>Confirm Action</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Verifier1ReviewView;

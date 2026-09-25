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
import CancelIcon from '@mui/icons-material/Cancel';

import ProductionEstimationService from '../productionEstimationService';
import AreaVsCceComparisonCard from '../components/AreaVsCceComparisonCard';
import WorkflowTimeline from '../components/WorkflowTimeline';
import DefectHighlightBanner from '../components/DefectHighlightBanner';

const Verifier2ReviewView = ({
  record,
  defects = [],
  onBack,
  onOpenMarkDefect,
  onActionComplete,
  activeRoleUser = 'Prof. Mary John (Verifier 2)'
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
      activeRole: 'Production Estimator Verifier 2',
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
                <VerifiedUserIcon color="secondary" /> Verifier 2 Review — {record.id}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Review complete estimation details, Verifier 1 decision & comments, defect history, and forward to EARAD Admin.
              </Typography>
            </Box>
          </Box>

          <Button variant="outlined" color="error" startIcon={<ReportProblemIcon />} onClick={onOpenMarkDefect}>
            + Mark Defect
          </Button>
        </Box>

        {/* Defect Highlight Banner */}
        <DefectHighlightBanner defects={filteredDefects} onOpenDefects={onOpenMarkDefect} />

        {/* Comparison Card */}
        <Box sx={{ mb: 3 }}>
          <AreaVsCceComparisonCard
            estimatedArea={record.estimatedArea}
            cceArea={record.cceArea}
            unit={record.areaUnit}
            cceObservationsCount={record.cceObservationsCount}
          />
        </Box>

        {/* Workflow & Audit History Timeline */}
        <Box sx={{ mb: 3 }}>
          <WorkflowTimeline
            timeline={record.workflowTimeline}
            currentStage={record.currentStage}
            currentRole={record.currentRole}
          />
        </Box>

        {/* Verifier 2 Remarks Input */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          Verifier 2 Remarks & Decision
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Verifier 2 Verification Remarks"
          placeholder="Add comments regarding Verifier 1 review, historical crop trend alignment..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ReplayIcon />}
            onClick={() => handleAction('RETURN', 'Return to Estimator', 'Return estimation for corrections?')}
          >
            Return to Estimator
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendIcon />}
            onClick={() => handleAction('VERIFY_FORWARD_2', 'Verify & Forward to EARAD Admin', 'Verify estimation and forward to EARAD Admin?')}
          >
            Verify & Forward to EARAD Admin
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle fontWeight="bold">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={executeAction}>Confirm Action</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Verifier2ReviewView;

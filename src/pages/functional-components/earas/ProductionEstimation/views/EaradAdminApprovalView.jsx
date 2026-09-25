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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';

import ProductionEstimationService from '../productionEstimationService';
import AreaVsCceComparisonCard from '../components/AreaVsCceComparisonCard';
import WorkflowTimeline from '../components/WorkflowTimeline';
import DefectHighlightBanner from '../components/DefectHighlightBanner';

const EaradAdminApprovalView = ({
  record,
  defects = [],
  onBack,
  onOpenMarkDefect,
  onActionComplete,
  activeRoleUser = 'K. S. Narayanan (EARAD Admin)'
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
      activeRole: 'EARAD Admin',
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
                <AdminPanelSettingsIcon color="success" /> EARAD Admin Review — {record.id}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Higher-level administrative review, variance analysis, defect check, and approval/forwarding to Approver 2.
              </Typography>
            </Box>
          </Box>

          <Button variant="outlined" color="error" startIcon={<ReportProblemIcon />} onClick={onOpenMarkDefect}>
            + Mark Defect
          </Button>
        </Box>

        {/* Defect Highlight Banner */}
        <DefectHighlightBanner defects={filteredDefects} onOpenDefects={onOpenMarkDefect} />

        {/* Area Comparison Card */}
        <Box sx={{ mb: 3 }}>
          <AreaVsCceComparisonCard
            estimatedArea={record.estimatedArea}
            cceArea={record.cceArea}
            unit={record.areaUnit}
            cceObservationsCount={record.cceObservationsCount}
          />
        </Box>

        {/* Workflow Timeline */}
        <Box sx={{ mb: 3 }}>
          <WorkflowTimeline
            timeline={record.workflowTimeline}
            currentStage={record.currentStage}
            currentRole={record.currentRole}
          />
        </Box>

        {/* Admin Remarks Input */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          EARAD Admin Approval Remarks & Action
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="EARAD Admin Remarks"
          placeholder="Enter administrative review comments..."
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
            color="success"
            startIcon={<SendIcon />}
            onClick={() => handleAction('ADMIN_APPROVE_FORWARD', 'Approve & Forward to Approver 2', 'Approve estimation and forward to Production Estimate Approver 2?')}
          >
            Approve & Forward to Approver 2
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
          <Button variant="contained" color="success" onClick={executeAction}>Confirm Action</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EaradAdminApprovalView;

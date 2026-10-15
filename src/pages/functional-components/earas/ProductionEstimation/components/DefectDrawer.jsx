import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Paper,
  Divider,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ProductionEstimationService, {
  DEFECT_SEVERITIES,
  DEFECT_STATUSES
} from '../productionEstimationService';

const DEFECT_CATEGORIES = [
  'Area Discrepancy',
  'CCE Sample Deficiency',
  'Yield Computation Inconsistency',
  'Land Record / e-BTR Mismatch',
  'Geographic Boundary Error',
  'Missing Field Documentation',
  'Historical Variance Unexplained'
];

const DefectDrawer = ({
  open,
  onClose,
  estimationRecord,
  activeUser = 'Reviewer',
  activeRole = 'Verifier 1',
  onDefectSaved
}) => {
  const [formData, setFormData] = useState({
    category: 'Area Discrepancy',
    type: 'High Variance Alert',
    severity: 'Medium',
    affectedField: 'Estimated Area vs CCE Area',
    description: '',
    recommendedCorrection: '',
    reviewerComments: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = () => {
    const errs = {};
    if (!formData.description.trim()) errs.description = 'Defect description is required.';
    if (!formData.recommendedCorrection.trim()) errs.recommendedCorrection = 'Recommended correction is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const defectPayload = {
      estimationId: estimationRecord?.id || 'PE-2026-GEN-001',
      district: estimationRecord?.district || 'Ernakulam',
      taluk: estimationRecord?.taluk || 'Kanayannur',
      block: estimationRecord?.block || 'Vyttila',
      panchayath: estimationRecord?.panchayath || 'Kumbalangi',
      crop: estimationRecord?.crop || 'Paddy',
      category: formData.category,
      type: formData.type,
      severity: formData.severity,
      affectedField: formData.affectedField,
      description: formData.description,
      recommendedCorrection: formData.recommendedCorrection,
      reviewerComments: formData.reviewerComments || formData.description
    };

    const newDef = ProductionEstimationService.createDefect(defectPayload, activeUser, activeRole);
    if (onDefectSaved) onDefectSaved(newDef);
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportProblemIcon color="error" />
            <Typography variant="h6" fontWeight="bold" color="#0f172a">
              + Mark Defect
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Estimation Reference Context */}
        {estimationRecord && (
          <Alert severity="warning" icon={<ReportProblemIcon />} sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Target Estimation: {estimationRecord.id}
            </Typography>
            <Typography variant="caption" display="block">
              {estimationRecord.crop} • {estimationRecord.district} → {estimationRecord.block}
            </Typography>
          </Alert>
        )}

        {/* Form Controls */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Defect Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {DEFECT_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Defect Severity"
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
              >
                {DEFECT_SEVERITIES.map((sev) => (
                  <MenuItem key={sev} value={sev}>
                    {sev}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Affected Field / Section"
                value={formData.affectedField}
                onChange={(e) => handleChange('affectedField', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Defect Description"
                placeholder="Explain the data flaw or discrepancy identified..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Recommended Correction"
                placeholder="Specific action required by the Production Estimator..."
                value={formData.recommendedCorrection}
                onChange={(e) => handleChange('recommendedCorrection', e.target.value)}
                error={Boolean(errors.recommendedCorrection)}
                helperText={errors.recommendedCorrection}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Reviewer Comments (Optional)"
                placeholder="Additional audit notes for reviewers..."
                value={formData.reviewerComments}
                onChange={(e) => handleChange('reviewerComments', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ pt: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" startIcon={<SaveIcon />} onClick={handleSubmit}>
            Save Defect
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DefectDrawer;

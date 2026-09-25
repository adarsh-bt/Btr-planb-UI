import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Stack,
  IconButton,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';

import AreaVsCceComparisonCard from '../components/AreaVsCceComparisonCard';
import HistoricalComparisonTable from '../components/HistoricalComparisonTable';
import WorkflowTimeline from '../components/WorkflowTimeline';
import DefectHighlightBanner from '../components/DefectHighlightBanner';

const EstimationDetailView = ({
  record,
  defects = [],
  onBack,
  onOpenMarkDefect,
  onOpenReviewAction,
  activeRole
}) => {
  if (!record) return null;

  const filteredDefects = defects.filter((d) => d.estimationId === record.id);

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        {/* Header Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a' }}>
                Estimation Details — {record.id}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {record.crop} ({record.estimationLevel}-Level) • {record.district} → {record.taluk} → {record.block}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="secondary" onClick={onBack}>
              Back to List
            </Button>
            <Button variant="outlined" color="error" startIcon={<ReportProblemIcon />} onClick={onOpenMarkDefect}>
              + Mark Defect
            </Button>
            {activeRole !== 'Production Estimator' && record.status !== 'Approved — Final' && (
              <Button variant="contained" color="primary" startIcon={<VerifiedIcon />} onClick={onOpenReviewAction}>
                Review / Process Action
              </Button>
            )}
          </Stack>
        </Box>

        {/* Defect Highlight Banner */}
        <DefectHighlightBanner defects={filteredDefects} onOpenDefects={onOpenMarkDefect} />

        {/* Top Summary Banner */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">CURRENT STAGE</Typography>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0284c7' }}>{record.currentStage}</Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">RESPONSIBLE ROLE</Typography>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#334155' }}>{record.currentRole}</Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">APPROVAL STATUS</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={record.status} color={record.status === 'Approved — Final' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 'bold' }} />
              </Box>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">INITIATOR & DATE</Typography>
              <Typography variant="body2" fontWeight="500">{record.createdBy}</Typography>
              <Typography variant="caption" color="textSecondary">{record.createdDate}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 1: Location & Geography */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          Section 1 — Location & Geography
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'District', val: record.district },
            { label: 'Taluk', val: record.taluk },
            { label: 'Block', val: record.block },
            { label: 'Panchayath', val: record.panchayath },
            { label: 'Estimation Level', val: `${record.estimationLevel}-Level` },
            { label: 'Financial Year / Season', val: `${record.financialYear} • ${record.season}` }
          ].map((item, idx) => (
            <Grid item xs={6} sm={4} md={2} key={idx}>
              <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">{item.label}</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#0f172a', mt: 0.5 }}>{item.val}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: Area Estimation vs CCE Area */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          Section 2 — Area Estimation vs CCE Area
        </Typography>

        <Box sx={{ mb: 3 }}>
          <AreaVsCceComparisonCard
            estimatedArea={record.estimatedArea}
            cceArea={record.cceArea}
            unit={record.areaUnit}
            cceObservationsCount={record.cceObservationsCount}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 3: Production Estimation & Historical Comparison */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          Section 3 — Production Estimation & Historical Variance
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0f172a', mb: 1.5 }}>
                Current Estimated Production
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">YIELD RATE</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#0284c7">{record.yieldEstimate} {record.yieldUnit}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">TOTAL ESTIMATED PRODUCTION</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#16a34a">{record.estimatedProduction} {record.productionUnit}</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">ESTIMATOR REMARKS:</Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>"{record.remarks || 'No remarks entered.'}"</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <HistoricalComparisonTable
              currentEstimate={record.estimatedProduction}
              prevEstimate={record.prevSeasonProduction}
              unit={record.productionUnit}
              crop={record.crop}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Section 4: Supporting Records & Attachments */}
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          Section 4 — Supporting Records & Field Attachments
        </Typography>

        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, mb: 3, bgcolor: '#f8fafc' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DescriptionIcon color="primary" />
            <Box>
              <Typography variant="body2" fontWeight="bold">Form 1 CCE Field Harvest Records.pdf</Typography>
              <Typography variant="caption" color="textSecondary">Attached on {record.createdDate} by {record.createdBy}</Typography>
            </Box>
            <Chip label="Verified Document" color="success" size="small" />
          </Stack>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Section 5: Workflow Timeline */}
        <WorkflowTimeline
          timeline={record.workflowTimeline}
          currentStage={record.currentStage}
          currentRole={record.currentRole}
        />
      </Paper>
    </Box>
  );
};

export default EstimationDetailView;

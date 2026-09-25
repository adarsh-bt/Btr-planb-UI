import React, { useMemo } from 'react';
import { Box, Paper, Grid, Typography, LinearProgress, Chip, Stack } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RateReviewIcon from '@mui/icons-material/RateReview';

const TopApprovalVerificationStatus = ({ submissions = [] }) => {
  const stats = useMemo(() => {
    const total = submissions.length;

    // Field Inspector Verified Count (Verified by Inspector or Approved by Taluk Approver)
    const inspectorVerified = submissions.filter(
      (s) => s.status === 'Verified by Field Inspector' || s.status === 'Approved by Taluk Approver'
    ).length;

    // Taluk Level Approver Approved Count
    const talukApproved = submissions.filter((s) => s.status === 'Approved by Taluk Approver').length;

    // Pending Verification
    const pendingInspector = submissions.filter((s) => s.status === 'Pending Verification').length;

    // Clarification Requested
    const clarification = submissions.filter((s) => s.status === 'Clarification Requested').length;

    const inspectorPct = total > 0 ? Math.round((inspectorVerified / total) * 100) : 0;
    const talukPct = total > 0 ? Math.round((talukApproved / total) * 100) : 0;

    return {
      total,
      inspectorVerified,
      inspectorPct,
      talukApproved,
      talukPct,
      pendingInspector,
      clarification
    };
  }, [submissions]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssessmentIcon sx={{ color: '#38bdf8', fontSize: '2rem' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              Forecast Verification &amp; Approval Status Dashboard
            </Typography>

          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <Chip label={`Total Entries: ${stats.total}`} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
          <Chip label={`Pending: ${stats.pendingInspector}`} color="info" size="small" variant="outlined" sx={{ color: '#67e8f9', borderColor: '#38bdf8' }} />
          {stats.clarification > 0 && (
            <Chip label={`Clarifications: ${stats.clarification}`} color="warning" size="small" sx={{ fontWeight: 'bold' }} />
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Tier 1: Field Inspector Verification Progress */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RateReviewIcon sx={{ color: '#38bdf8', fontSize: '1.2rem' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                  Field Inspector Verification (Level 1)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#38bdf8' }}>
                {stats.inspectorVerified} / {stats.total} ({stats.inspectorPct}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.inspectorPct}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: '#0284c7'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Role: Field Inspector
              </Typography>
              <Typography variant="caption" sx={{ color: stats.pendingInspector === 0 ? '#4ade80' : '#fbbf24' }}>
                {stats.pendingInspector} Pending Verification
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Tier 2: Taluk Level Approver Approval Progress */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon sx={{ color: '#4ade80', fontSize: '1.2rem' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                  Taluk Approver Final Approval (Level 2)
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4ade80' }}>
                {stats.talukApproved} / {stats.total} ({stats.talukPct}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.talukPct}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: '#16a34a'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Role: Taluk Level Approver
              </Typography>
              <Typography variant="caption" sx={{ color: stats.talukApproved === stats.total ? '#4ade80' : '#38bdf8' }}>
                {stats.total - stats.talukApproved} Pending Final Approval
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TopApprovalVerificationStatus;

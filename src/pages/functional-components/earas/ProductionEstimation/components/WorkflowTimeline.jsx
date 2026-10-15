import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const STAGES = [
  { key: 'Initiation', role: 'Production Estimator', title: '1. Initiation (Estimator)' },
  { key: 'Verifier 1 Review', role: 'Production Estimator Verifier 1', title: '2. Verification (Verifier 1)' },
  { key: 'Verifier 2 Review', role: 'Production Estimator Verifier 2', title: '3. Verification (Verifier 2)' },
  { key: 'EARAD Admin', role: 'EARAD Admin', title: '4. EARAD Admin Approval' },
  { key: 'Approver 2', role: 'Production Estimate Approver 2', title: '5. Approver 2 Review' },
  { key: 'Director Approval', role: 'Director / State Level Approver', title: '6. Director Final Approval' }
];

const WorkflowTimeline = ({ timeline = [], currentStage, currentRole }) => {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArrowForwardIcon color="primary" /> Approval Journey & Audit Timeline
      </Typography>

      <Stack spacing={2}>
        {STAGES.map((stg, idx) => {
          // Find matching item from timeline history
          const histItem = timeline.find(
            (t) =>
              t.stage?.toLowerCase().includes(stg.key.toLowerCase()) ||
              t.role?.toLowerCase() === stg.role?.toLowerCase()
          );

          const isCompleted = histItem && (histItem.status === 'Completed' || histItem.action?.includes('Approv') || histItem.action?.includes('Verifi'));
          const isReturned = histItem && (histItem.status === 'Returned' || histItem.action?.includes('Return'));
          const isCurrentPending = !isCompleted && !isReturned && (currentRole === stg.role || currentStage?.includes(stg.key));

          let icon = <HourglassEmptyIcon sx={{ color: '#94a3b8' }} />;
          let chipColor = 'default';
          let statusText = 'Pending';
          let borderLeftColor = '#cbd5e1';
          let bgColor = '#f8fafc';

          if (isCompleted) {
            icon = <CheckCircleIcon sx={{ color: '#10b981' }} />;
            chipColor = 'success';
            statusText = 'Completed';
            borderLeftColor = '#10b981';
            bgColor = '#f0fdf4';
          } else if (isReturned) {
            icon = <ErrorOutlineIcon sx={{ color: '#ef4444' }} />;
            chipColor = 'error';
            statusText = 'Returned';
            borderLeftColor = '#ef4444';
            bgColor = '#fef2f2';
          } else if (isCurrentPending) {
            icon = <HourglassEmptyIcon sx={{ color: '#0284c7', animation: 'spin 2s linear infinite' }} />;
            chipColor = 'primary';
            statusText = 'Current Stage (Pending Action)';
            borderLeftColor = '#0284c7';
            bgColor = '#f0f9ff';
          }

          return (
            <Paper
              key={stg.key}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: bgColor,
                border: '1px solid #e2e8f0',
                borderLeft: `5px solid ${borderLeftColor}`,
                transition: 'all 0.2s ease'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: isCompleted ? '#dcfce7' : isReturned ? '#fee2e2' : isCurrentPending ? '#e0f2fe' : '#f1f5f9', width: 36, height: 36 }}>
                    {icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0f172a' }}>
                      {stg.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Role: {stg.role}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={statusText} color={chipColor} size="small" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
              </Box>

              {histItem ? (
                <Box sx={{ mt: 1.5, pl: 6 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 0.5, color: '#475569', fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon fontSize="small" sx={{ color: '#64748b' }} />
                      <Typography variant="body2" fontWeight="500">{histItem.user || 'Assigned User'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: '#64748b' }} />
                      <Typography variant="body2">{histItem.timestamp || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                  {histItem.remarks && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#334155', mt: 0.5, bg: '#ffffff', p: 1, borderRadius: 1, border: '1px dashed #cbd5e1' }}>
                      "{histItem.remarks}"
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 1, pl: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    Awaiting previous stage completion.
                  </Typography>
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default WorkflowTimeline;

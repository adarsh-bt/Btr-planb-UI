import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import CreateIcon from '@mui/icons-material/Create';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import HistoryIcon from '@mui/icons-material/History';

const getActionIcon = (action) => {
  if (action.includes('Created') || action.includes('Saved')) return <CreateIcon fontSize="small" />;
  if (action.includes('Submitted')) return <SendIcon fontSize="small" />;
  if (action.includes('10 Leading') || action.includes('Selected')) return <StarIcon fontSize="small" />;
  if (action.includes('Approved')) return <CheckCircleIcon fontSize="small" />;
  if (action.includes('Returned')) return <ReplayIcon fontSize="small" />;
  return <HistoryIcon fontSize="small" />;
};

const getActionColor = (action) => {
  if (action.includes('Created') || action.includes('Saved')) return 'primary';
  if (action.includes('Submitted')) return 'info';
  if (action.includes('10 Leading') || action.includes('Selected')) return 'warning';
  if (action.includes('Approved')) return 'success';
  if (action.includes('Returned')) return 'error';
  return 'secondary';
};

const AuditTrailTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
        No audit history recorded yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon sx={{ color: '#0284c7' }} /> Workflow Audit History Trail
      </Typography>

      <Timeline position="right" sx={{ p: 0, m: 0 }}>
        {history.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent sx={{ flex: 0.35, py: '6px', px: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'block' }}>
                {item.timestamp}
              </Typography>
              <Chip label={item.role} size="small" variant="outlined" sx={{ fontSize: '0.65rem', mt: 0.5 }} />
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getActionColor(item.action)}>
                {getActionIcon(item.action)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: '6px', px: 2 }}>
              <Paper elevation={0} sx={{ p: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {item.action}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 600, mt: 0.2 }}>
                  By: {item.user}
                </Typography>
                {item.notes && (
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#334155', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    "{item.notes}"
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

export default AuditTrailTimeline;

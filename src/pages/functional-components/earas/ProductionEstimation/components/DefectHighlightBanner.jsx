import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Stack,
  Chip
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LaunchIcon from '@mui/icons-material/Launch';

const DefectHighlightBanner = ({ defects = [], onOpenDefects }) => {
  if (!defects || defects.length === 0) return null;

  return (
    <Alert
      severity="warning"
      icon={<ReportProblemIcon fontSize="medium" />}
      action={
        <Button
          color="warning"
          variant="contained"
          size="small"
          startIcon={<LaunchIcon />}
          onClick={onOpenDefects}
          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          View All {defects.length} Defect(s)
        </Button>
      }
      sx={{
        borderRadius: 3,
        border: '1px solid #fcd34d',
        backgroundColor: '#fffbeb',
        mb: 2.5
      }}
    >
      <AlertTitle sx={{ fontWeight: 'bold', color: '#92400e', fontSize: '1rem' }}>
        ⚠ {defects.length} Defect(s) Identified for this Estimation
      </AlertTitle>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
        {defects.map((d) => (
          <Chip
            key={d.id}
            label={`${d.id}: ${d.category} (${d.severity})`}
            color={d.severity === 'Critical' ? 'error' : 'warning'}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        ))}
      </Stack>
      <Typography variant="body2" sx={{ color: '#78350f', mt: 1 }}>
        Review defects before taking final approval actions. Defect details are attached to affected input fields.
      </Typography>
    </Alert>
  );
};

export default DefectHighlightBanner;

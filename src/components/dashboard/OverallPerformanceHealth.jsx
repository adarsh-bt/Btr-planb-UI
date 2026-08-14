import React from 'react';
import { Paper, Typography, Box, Grid, LinearProgress } from '@mui/material';
import StatusBadge from 'components/common/StatusBadge';
import { getPerformanceStatus } from 'constants/config';

export default function OverallPerformanceHealth({ summaryData }) {
  const modules = [
    { name: 'Tour Diary', percentage: summaryData?.tourDiary?.achievement || 88 },
    { name: 'Actual Tour', percentage: summaryData?.actualTour?.achievement || 84 },
    { name: 'Work Allocation', percentage: summaryData?.workAllocation?.achievement || 95 },
    { name: 'Key Plot', percentage: summaryData?.keyPlot?.achievement || 100 }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3.5,
        borderRadius: 2.5,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.04)'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography variant="h6" fontWeight={700} color="#0F172A">
          Overall Performance Health
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Thresholds: 90%+ On Track | 70%-89% Needs Attention | &lt;70% Critical
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {modules.map((m) => {
          const perf = getPerformanceStatus(m.percentage);
          return (
            <Grid item xs={12} sm={6} md={3} key={m.name}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontWeight={700} color="#334155">
                    {m.name}
                  </Typography>
                  <StatusBadge percentage={m.percentage} />
                </Box>

                <Box display="flex" alignItems="baseline" gap={1} mb={1}>
                  <Typography variant="h4" fontWeight={800} color={perf.color}>
                    {m.percentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    achievement
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={m.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: perf.color,
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

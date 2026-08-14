import React from 'react';
import { Paper, Box, Typography, Grid, Card, CardContent, Stack, Divider } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import StatusBadge from 'components/common/StatusBadge';

export default function UserSubmissionStatus({ summaryData }) {
  const breakdown = summaryData?.submissionStatusBreakdown || {
    submitted: 745,
    partial: 35,
    notSubmitted: 31,
    total: 811
  };

  const chartData = [
    { name: 'Submitted', value: breakdown.submitted, color: '#16A34A' },
    { name: 'Partial', value: breakdown.partial, color: '#F59E0B' },
    { name: 'Not Submitted', value: breakdown.notSubmitted, color: '#EF4444' }
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
      <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.5}>
        User Submission Status
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        Monthly submission completion status across 811 registered field officers
      </Typography>

      <Grid container spacing={3} alignItems="center">
        {/* Donut Chart Column */}
        <Grid item xs={12} md={5}>
          <Box sx={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(val, name) => [`${val} Officers`, name]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Side Summary Cards */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {/* Submitted Card */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #DCFCE7', bg: '#F0FDF4', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight={700} color="#15803D">
                      Submitted
                    </Typography>
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#16A34A" mb={0.5}>
                    {breakdown.submitted}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {Math.round((breakdown.submitted / breakdown.total) * 100)}% of Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Partial Card */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #FEF3C7', bg: '#FFFBEB', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight={700} color="#B45309">
                      Partial
                    </Typography>
                    <RemoveCircleOutlineOutlinedIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#D97706" mb={0.5}>
                    {breakdown.partial}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {Math.round((breakdown.partial / breakdown.total) * 100)}% of Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Not Submitted Card */}
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #FEE2E2', bg: '#FEF2F2', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight={700} color="#B91C1C">
                      Not Submitted
                    </Typography>
                    <ErrorOutlineOutlinedIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#DC2626" mb={0.5}>
                    {breakdown.notSubmitted}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {Math.round((breakdown.notSubmitted / breakdown.total) * 100)}% of Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={2.5} p={2} sx={{ backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={700} color="#334155">
                Total Monitored Field Personnel
              </Typography>
              <StatusBadge label={`${breakdown.total} Total Users`} status="ON_TRACK" />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

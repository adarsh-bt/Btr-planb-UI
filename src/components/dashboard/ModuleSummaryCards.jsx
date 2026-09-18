import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button, Divider, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StatusBadge from 'components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function ModuleSummaryCards({ summaryData, onNavigate }) {
  const navigate = useNavigate();

  const handleNav = (path, filterType) => {
    if (onNavigate) {
      onNavigate(path, filterType);
    } else {
      navigate(path);
    }
  };

  return (
    <Box mb={3.5}>
      <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
        Module Overview & Status
      </Typography>

      <Grid container spacing={2.5}>
        {/* Panel 1: Tour Diary */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Tour Diary
                </Typography>
                <StatusBadge percentage={summaryData?.tourDiary?.achievement || 88} />
              </Box>

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Advance Target</Typography>
                  <Typography variant="body2" fontWeight={600}>{summaryData?.tourDiary?.target?.toLocaleString() || '1,500'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Submitted</Typography>
                  <Typography variant="body2" fontWeight={700} color="#16A34A">{summaryData?.tourDiary?.submitted?.toLocaleString() || '1,320'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                  <Typography variant="body2" fontWeight={700} color="#DC2626">{summaryData?.tourDiary?.pending || 180}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Achievement</Typography>
                  <Typography variant="body2" fontWeight={700} color="#D97706">{summaryData?.tourDiary?.achievement || 88}%</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Submitted Users</Typography>
                  <Typography variant="caption" fontWeight={700} color="#15803D">{summaryData?.tourDiary?.submittedUsers || 745}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Pending Users</Typography>
                  <Typography variant="caption" fontWeight={700} color="#B91C1C">{summaryData?.tourDiary?.pendingUsers || 66}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} mt="auto">
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleNav('/tour-diary', 'all')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  View Details
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleNav('/tour-diary', 'pending')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  Pending Users
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel 2: Actual Tour */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Actual Tour
                </Typography>
                <StatusBadge percentage={summaryData?.actualTour?.achievement || 84} />
              </Box>

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Advance Target</Typography>
                  <Typography variant="body2" fontWeight={600}>{summaryData?.actualTour?.target?.toLocaleString() || '1,400'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Submitted</Typography>
                  <Typography variant="body2" fontWeight={700} color="#16A34A">{summaryData?.actualTour?.submitted?.toLocaleString() || '1,180'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                  <Typography variant="body2" fontWeight={700} color="#DC2626">{summaryData?.actualTour?.pending || 220}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Achievement</Typography>
                  <Typography variant="body2" fontWeight={700} color="#D97706">{summaryData?.actualTour?.achievement || 84}%</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Submitted Users</Typography>
                  <Typography variant="caption" fontWeight={700} color="#15803D">{summaryData?.actualTour?.submittedUsers || 710}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Pending Users</Typography>
                  <Typography variant="caption" fontWeight={700} color="#B91C1C">{summaryData?.actualTour?.pendingUsers || 101}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} mt="auto">
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleNav('/actual-tour', 'all')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  View Details
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleNav('/actual-tour', 'pending')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  Pending Users
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel 3: Work Allocation */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Work Allocation
                </Typography>
                <StatusBadge percentage={summaryData?.workAllocation?.achievement || 95} />
              </Box>

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Allocated</Typography>
                  <Typography variant="body2" fontWeight={600}>{summaryData?.workAllocation?.allocated?.toLocaleString() || '1,245'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Submitted</Typography>
                  <Typography variant="body2" fontWeight={700} color="#16A34A">{summaryData?.workAllocation?.submitted?.toLocaleString() || '1,180'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                  <Typography variant="body2" fontWeight={700} color="#DC2626">{summaryData?.workAllocation?.pending || 65}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Achievement</Typography>
                  <Typography variant="body2" fontWeight={700} color="#16A34A">{summaryData?.workAllocation?.achievement || 95}%</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Submitted Users</Typography>
                  <Typography variant="caption" fontWeight={700} color="#15803D">{summaryData?.workAllocation?.submittedUsers || 746}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Pending Users</Typography>
                  <Typography variant="caption" fontWeight={700} color="#B91C1C">{summaryData?.workAllocation?.pendingUsers || 65}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} mt="auto">
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleNav('/work-allocation', 'all')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  View Details
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleNav('/work-allocation', 'pending')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  Pending Users
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel 4: Key Plot / CCE */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Key Plot / CCE
                </Typography>
                <StatusBadge percentage={summaryData?.keyPlot?.achievement || 100} />
              </Box>

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Target Plots</Typography>
                  <Typography variant="body2" fontWeight={600}>{summaryData?.keyPlot?.target || 100}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                  <Typography variant="body2" fontWeight={700} color="#16A34A">{summaryData?.keyPlot?.completed || 100}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                  <Typography variant="body2" fontWeight={700} color="#64748B">{summaryData?.keyPlot?.pending || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Rejected</Typography>
                  <Typography variant="body2" fontWeight={700} color="#DC2626">{summaryData?.keyPlot?.rejected || 3}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Achievement</Typography>
                  <Typography variant="caption" fontWeight={700} color="#15803D">100% Completed</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Status</Typography>
                  <Typography variant="caption" fontWeight={700} color="#047857">Verified</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} mt="auto">
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleNav('/key-plot', 'all')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  View Key Plots
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleNav('/key-plot', 'rejected')}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                >
                  View Rejected
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

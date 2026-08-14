import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import FilterToolbar from 'components/common/FilterToolbar';
import StatusBadge from 'components/common/StatusBadge';
import SubmissionMatrixTable from 'components/dashboard/SubmissionMatrixTable';
import PendingUsersSection from 'components/dashboard/PendingUsersSection';
import MonthlyAdvanceVsActualChart from 'components/dashboard/MonthlyAdvanceVsActualChart';
import UserPerformanceDetailModal from 'pages/UserDetail/UserPerformanceDetailModal';
import { getDashboardSummary } from 'api/dashboardApi';

export default function ActualTourPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    year: '2026-27',
    month: 'August 2026',
    district: 'All',
    taluk: 'All',
    zone: 'All',
    status: 'All'
  });
  const [summary, setSummary] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getDashboardSummary(filters).then(setSummary);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      year: '2026-27',
      month: 'August 2026',
      district: 'All',
      taluk: 'All',
      zone: 'All',
      status: 'All'
    });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            Actual Tour Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Audit actual field visits performed vs planned advance tour schedules
          </Typography>
        </Box>
      </Box>

      <FilterToolbar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Overview" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Advance vs Actual" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Submitted Officers" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Pending Users" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Planned Advance Tours
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A" my={1}>
                {summary?.actualTour?.target?.toLocaleString() || '1,400'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total planned tours for month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #DBEAFE', bg: '#EFF6FF', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#1D4ED8">
                Actual Tours Conducted
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#2563EB" my={1}>
                {summary?.actualTour?.submitted?.toLocaleString() || '1,180'}
              </Typography>
              <Typography variant="caption" color="#1D4ED8" fontWeight={600}>
                {summary?.actualTour?.achievement || 84}% Achievement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #FEF3C7', bg: '#FFFBEB', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#B45309">
                Pending Tours
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#D97706" my={1}>
                {summary?.actualTour?.pending || 220}
              </Typography>
              <Typography variant="caption" color="#B45309" fontWeight={600}>
                220 Unverified / Missing Tours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Performance Health
              </Typography>
              <Box mt={1}>
                <StatusBadge percentage={summary?.actualTour?.achievement || 84} size="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {currentTab === 0 && (
        <>
          <MonthlyAdvanceVsActualChart selectedMonth={filters.month} />
          <SubmissionMatrixTable filters={filters} onUserSelect={handleUserSelect} />
        </>
      )}

      {currentTab === 1 && (
        <MonthlyAdvanceVsActualChart selectedMonth={filters.month} />
      )}

      {currentTab === 2 && (
        <SubmissionMatrixTable filters={{ ...filters, status: 'Submitted' }} onUserSelect={handleUserSelect} />
      )}

      {currentTab === 3 && (
        <PendingUsersSection filters={filters} onUserSelect={handleUserSelect} />
      )}

      <UserPerformanceDetailModal
        open={modalOpen}
        user={selectedUser}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Stack,
  Button
} from '@mui/material';
import FilterToolbar from 'components/common/FilterToolbar';
import StatusBadge from 'components/common/StatusBadge';
import SubmissionMatrixTable from 'components/dashboard/SubmissionMatrixTable';
import PendingUsersSection from 'components/dashboard/PendingUsersSection';
import MonthlyAdvanceVsActualChart from 'components/dashboard/MonthlyAdvanceVsActualChart';
import UserPerformanceDetailModal from 'pages/UserDetail/UserPerformanceDetailModal';
import { getDashboardSummary } from 'api/dashboardApi';

export default function TourDiaryPage() {
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
            Tour Diary Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and track monthly field advance tour plans and officer diary submissions
          </Typography>
        </Box>
      </Box>

      {/* Filters Toolbar */}
      <FilterToolbar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Overview" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Advance Plans" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Submitted Officers" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Pending Submissions" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* KPI Section */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Total Target Tours
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A" my={1}>
                {summary?.tourDiary?.target?.toLocaleString() || '1,500'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Planned advance tours for month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #DCFCE7', bg: '#F0FDF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#15803D">
                Submitted Diaries
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#16A34A" my={1}>
                {summary?.tourDiary?.submitted?.toLocaleString() || '1,320'}
              </Typography>
              <Typography variant="caption" color="#15803D" fontWeight={600}>
                {summary?.tourDiary?.achievement || 88}% Achievement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #FEE2E2', bg: '#FEF2F2', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#991B1B">
                Pending Diaries
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#DC2626" my={1}>
                {summary?.tourDiary?.pending || 180}
              </Typography>
              <Typography variant="caption" color="#B91C1C" fontWeight={600}>
                12% Pending Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Status
              </Typography>
              <Box mt={1}>
                <StatusBadge percentage={summary?.tourDiary?.achievement || 88} size="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Content */}
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

      {/* User Detail Modal */}
      <UserPerformanceDetailModal
        open={modalOpen}
        user={selectedUser}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
}

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
import DistrictPerformanceTable from 'components/dashboard/DistrictPerformanceTable';
import UserPerformanceDetailModal from 'pages/UserDetail/UserPerformanceDetailModal';
import { getDashboardSummary, getDistrictPerformance } from 'api/dashboardApi';

export default function WorkAllocationPage() {
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
  const [districtData, setDistrictData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getDashboardSummary(filters).then(setSummary);
    getDistrictPerformance(filters).then(setDistrictData);
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
            Work Allocation Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor field assignment allocations, task completion progress, and officer submissions
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
          <Tab label="Allocations" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Submitted Tasks" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Pending Officers" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Total Allocated Tasks
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A" my={1}>
                {summary?.workAllocation?.allocated?.toLocaleString() || '1,245'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Allocated field assignments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #DCFCE7', bg: '#F0FDF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#15803D">
                Submitted / Completed
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#16A34A" my={1}>
                {summary?.workAllocation?.submitted?.toLocaleString() || '1,180'}
              </Typography>
              <Typography variant="caption" color="#15803D" fontWeight={600}>
                {summary?.workAllocation?.achievement || 95}% Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #FEE2E2', bg: '#FEF2F2', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#991B1B">
                Pending Allocations
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#DC2626" my={1}>
                {summary?.workAllocation?.pending || 65}
              </Typography>
              <Typography variant="caption" color="#B91C1C" fontWeight={600}>
                65 Tasks Pending Execution
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
                <StatusBadge percentage={summary?.workAllocation?.achievement || 95} size="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {currentTab === 0 && (
        <>
          <DistrictPerformanceTable districtData={districtData} />
          <SubmissionMatrixTable filters={filters} onUserSelect={handleUserSelect} />
        </>
      )}

      {currentTab === 1 && (
        <DistrictPerformanceTable districtData={districtData} />
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

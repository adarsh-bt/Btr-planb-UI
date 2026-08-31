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
  LinearProgress,
  Button,
  ButtonGroup,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FilterToolbar from 'components/common/FilterToolbar';
import StatusBadge from 'components/common/StatusBadge';
import UserPerformanceDetailModal from 'pages/UserDetail/UserPerformanceDetailModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  getDashboardSummary,
  getMonthlyAdvanceVsActual,
  getMonthlyTrend,
  getSubmissionMatrix,
  getZonePerformance
} from 'api/dashboardApi';
import { MOCK_DISTRICTS, MOCK_ZONES } from 'api/mockData';

export default function ProjectOverview() {
  // Main Tab State: 0 = Overview, 1 = Progress, 2 = Submission Status
  const [mainTab, setMainTab] = useState(0);

  // Global Filters
  const [filters, setFilters] = useState({
    year: '2026-27',
    month: 'August 2026',
    district: 'All',
    taluk: 'All',
    zone: 'All'
  });

  // Common Dashboard Data
  const [summaryData, setSummaryData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // --- PROGRESS TAB STATE ---
  const [progressModule, setProgressModule] = useState('tourDiary'); // tourDiary | actualTour | workAllocation | keyPlot
  const [advanceVsActualData, setAdvanceVsActualData] = useState([]);
  const [zoneProgressData, setZoneProgressData] = useState([]);

  // --- SUBMISSION STATUS TAB STATE ---
  const [quickStatus, setQuickStatus] = useState('All'); // All | Submitted | Partial | Not Submitted
  const [searchQuery, setSearchQuery] = useState('');
  const [tableUsers, setTableUsers] = useState([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch summary data whenever filters change
  useEffect(() => {
    getDashboardSummary(filters).then(setSummaryData);
  }, [filters]);

  // Fetch Progress chart data when module or filters change
  useEffect(() => {
    if (mainTab === 1) {
      if (progressModule === 'keyPlot') {
        getZonePerformance(filters).then(setZoneProgressData);
      } else {
        getMonthlyAdvanceVsActual(progressModule, filters).then(setAdvanceVsActualData);
      }
    }
  }, [mainTab, progressModule, filters]);

  // Fetch Submission Status matrix when tab, filters, search, quick filter, or pagination changes
  useEffect(() => {
    if (mainTab === 2) {
      const activeFilters = {
        ...filters,
        search: searchQuery,
        status: quickStatus
      };
      getSubmissionMatrix(activeFilters, page + 1, rowsPerPage).then((res) => {
        setTableUsers(res.data);
        setTableTotal(res.total);
      });
    }
  }, [mainTab, filters, searchQuery, quickStatus, page, rowsPerPage]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      year: '2026-27',
      month: 'August 2026',
      district: 'All',
      taluk: 'All',
      zone: 'All'
    });
    setSearchQuery('');
    setQuickStatus('All');
    setPage(0);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  // Static Monthly Trend data for Overview
  const overviewTrendData = [
    { month: 'April', tourDiary: 97, actualTour: 94, workAllocation: 99, keyPlot: 100, overall: 98 },
    { month: 'May', tourDiary: 95, actualTour: 91, workAllocation: 98, keyPlot: 100, overall: 96 },
    { month: 'June', tourDiary: 92, actualTour: 87, workAllocation: 96, keyPlot: 100, overall: 94 },
    { month: 'July', tourDiary: 90, actualTour: 86, workAllocation: 96, keyPlot: 100, overall: 93 },
    { month: 'August', tourDiary: 88, actualTour: 84, workAllocation: 95, keyPlot: 100, overall: 92 }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Dashboard Page Title */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Agricultural Year: <strong>{filters.year}</strong> | Month: <strong>{filters.month}</strong>
        </Typography>
      </Box>

      {/* Internal Content Navigation Tabs */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, backgroundColor: 'transparent' }}>
        <Tabs
          value={mainTab}
          onChange={(e, val) => setMainTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              minWidth: 120,
              py: 1
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Progress" />
          <Tab label="Submission Status" />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (Intentionally Compact Quick Snapshot)                    */}
      {/* ========================================================================= */}
      {mainTab === 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={2}>
            Project Overview Snapshot
          </Typography>

          {/* 5 Compact KPI Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none', bg: '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#0F172A" my={0.5}>
                    811
                  </Typography>
                  <Typography variant="caption" color="#15803D" fontWeight={600}>
                    798 Active Personnel
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none', bg: '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Tour Diary
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#D97706" my={0.5}>
                    88%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    1,320 / 1,500 Submitted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none', bg: '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Actual Tour
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#D97706" my={0.5}>
                    84%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    1,180 / 1,400 Conducted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none', bg: '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Work Allocation
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#16A34A" my={0.5}>
                    95%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    1,180 / 1,245 Tasks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none', bg: '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Key Plot
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#16A34A" my={0.5}>
                    100%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    100 / 100 Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Health & Trend Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                    Overall Achievement
                  </Typography>
                  <Chip label="91% Overall" color="success" sx={{ fontWeight: 700, height: 26 }} />
                </Box>

                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                    Tour Diary (88%)
                  </Typography>
                  <LinearProgress variant="determinate" value={88} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#D97706' } }} />
                </Box>

                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                    Actual Tour (84%)
                  </Typography>
                  <LinearProgress variant="determinate" value={84} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#D97706' } }} />
                </Box>

                <Box mb={2.5}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                    Work Allocation (95%)
                  </Typography>
                  <LinearProgress variant="determinate" value={95} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' } }} />
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                    Key Plot / CCE (100%)
                  </Typography>
                  <LinearProgress variant="determinate" value={100} sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' } }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={2}>
                  Monthly Achievement Trend
                </Typography>
                <Box sx={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overviewTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} />
                      <YAxis domain={[60, 100]} tick={{ fill: '#64748B', fontSize: 11 }} unit="%" />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="overall" name="Overall %" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROGRESS (Detailed Advance vs Actual Monitoring)                   */}
      {/* ========================================================================= */}
      {mainTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
              Progress Monitoring
            </Typography>
          </Box>

          {/* Filter Toolbar */}
          <FilterToolbar filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

          {/* 4 Compact Module Sub-Tabs */}
          <Paper elevation={0} sx={{ p: 0.5, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant={progressModule === 'tourDiary' ? 'contained' : 'text'}
                  color="primary"
                  onClick={() => setProgressModule('tourDiary')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Tour Diary
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant={progressModule === 'actualTour' ? 'contained' : 'text'}
                  color="primary"
                  onClick={() => setProgressModule('actualTour')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Actual Tour
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant={progressModule === 'workAllocation' ? 'contained' : 'text'}
                  color="primary"
                  onClick={() => setProgressModule('workAllocation')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Work Allocation
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant={progressModule === 'keyPlot' ? 'contained' : 'text'}
                  color="primary"
                  onClick={() => setProgressModule('keyPlot')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                >
                  Key Plot / CCE
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Module-Specific Progress Content */}
          {progressModule === 'tourDiary' && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Tour Diary Progress
                </Typography>
              </Box>

              {/* Tour Diary Summary Box */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F8FAFC" borderRadius={2} border="1px solid #E2E8F0">
                    <Typography variant="caption" color="text.secondary">Advance Target</Typography>
                    <Typography variant="h5" fontWeight={800} color="#0F172A">1,500</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F0FDF4" borderRadius={2} border="1px solid #DCFCE7">
                    <Typography variant="caption" color="#15803D">Actual Submitted</Typography>
                    <Typography variant="h5" fontWeight={800} color="#16A34A">1,320</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#FFFBEB" borderRadius={2} border="1px solid #FEF3C7">
                    <Typography variant="caption" color="#B45309">Achievement Rate</Typography>
                    <Typography variant="h5" fontWeight={800} color="#D97706">88%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#FEF2F2" borderRadius={2} border="1px solid #FEE2E2">
                    <Typography variant="caption" color="#991B1B">Pending Diaries</Typography>
                    <Typography variant="h5" fontWeight={800} color="#DC2626">180</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Monthly Advance vs Actual Grouped Bar Chart */}
              <Typography variant="subtitle2" fontWeight={700} color="#475569" mb={1}>
                Monthly Advance vs Actual
              </Typography>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advanceVsActualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="advance" name="Advance Target" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="actual" name="Actual Submitted" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {progressModule === 'actualTour' && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Actual Tour Progress
                </Typography>
              </Box>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F8FAFC" borderRadius={2} border="1px solid #E2E8F0">
                    <Typography variant="caption" color="text.secondary">Advance Target</Typography>
                    <Typography variant="h5" fontWeight={800} color="#0F172A">1,400</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F0FDF4" borderRadius={2} border="1px solid #DCFCE7">
                    <Typography variant="caption" color="#15803D">Actual Conducted</Typography>
                    <Typography variant="h5" fontWeight={800} color="#16A34A">1,180</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#FFFBEB" borderRadius={2} border="1px solid #FEF3C7">
                    <Typography variant="caption" color="#B45309">Achievement Rate</Typography>
                    <Typography variant="h5" fontWeight={800} color="#D97706">84%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#FEF2F2" borderRadius={2} border="1px solid #FEE2E2">
                    <Typography variant="caption" color="#991B1B">Pending Tours</Typography>
                    <Typography variant="h5" fontWeight={800} color="#DC2626">220</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={700} color="#475569" mb={1}>
                Monthly Advance vs Actual
              </Typography>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advanceVsActualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="advance" name="Advance Target" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="actual" name="Actual Conducted" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {progressModule === 'workAllocation' && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Work Allocation Progress
                </Typography>
              </Box>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F8FAFC" borderRadius={2} border="1px solid #E2E8F0">
                    <Typography variant="caption" color="text.secondary">Allocated Tasks</Typography>
                    <Typography variant="h5" fontWeight={800} color="#0F172A">1,245</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F0FDF4" borderRadius={2} border="1px solid #DCFCE7">
                    <Typography variant="caption" color="#15803D">Submitted Tasks</Typography>
                    <Typography variant="h5" fontWeight={800} color="#16A34A">1,180</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#F0FDF4" borderRadius={2} border="1px solid #DCFCE7">
                    <Typography variant="caption" color="#15803D">Achievement Rate</Typography>
                    <Typography variant="h5" fontWeight={800} color="#16A34A">95%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={2} bg="#FEF2F2" borderRadius={2} border="1px solid #FEE2E2">
                    <Typography variant="caption" color="#991B1B">Pending Tasks</Typography>
                    <Typography variant="h5" fontWeight={800} color="#DC2626">65</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={700} color="#475569" mb={1}>
                Monthly Allocation Progress
              </Typography>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advanceVsActualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="advance" name="Allocated Tasks" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="actual" name="Submitted Tasks" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {progressModule === 'keyPlot' && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Key Plot / CCE Progress
                </Typography>
              </Box>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={2.4}>
                  <Box p={2} bg="#F8FAFC" borderRadius={2} border="1px solid #E2E8F0">
                    <Typography variant="caption" color="text.secondary">Target Plots</Typography>
                    <Typography variant="h5" fontWeight={800} color="#0F172A">100</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Box p={2} bg="#F0FDF4" borderRadius={2} border="1px solid #DCFCE7">
                    <Typography variant="caption" color="#15803D">Completed</Typography>
                    <Typography variant="h5" fontWeight={800} color="#16A34A">100</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Box p={2} bg="#F8FAFC" borderRadius={2} border="1px solid #E2E8F0">
                    <Typography variant="caption" color="text.secondary">Pending</Typography>
                    <Typography variant="h5" fontWeight={800} color="#64748B">0</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Box p={2} bg="#FEF2F2" borderRadius={2} border="1px solid #FEE2E2">
                    <Typography variant="caption" color="#991B1B">Rejected</Typography>
                    <Typography variant="h5" fontWeight={800} color="#DC2626">3</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Box p={2} bg="#F0FDF4" borderRadius={2} border="1px solid #DCFCE7">
                    <Typography variant="caption" color="#15803D">Achievement</Typography>
                    <Typography variant="h5" fontWeight={800} color="#16A34A">100%</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Zone-wise Progress List */}
              <Typography variant="subtitle2" fontWeight={700} color="#475569" mb={2}>
                Zone-wise Key Plot Progress
              </Typography>
              <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Zone</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Completed / Target</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {zoneProgressData.slice(0, 6).map((z) => {
                      const completed = z.achievement === 100 ? 100 : Math.round(z.achievement);
                      return (
                        <TableRow key={z.zone} hover>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{z.zone}</TableCell>
                          <TableCell sx={{ width: '45%' }}>
                            <LinearProgress
                              variant="determinate"
                              value={z.achievement}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#E2E8F0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: z.achievement === 100 ? '#16A34A' : z.achievement >= 80 ? '#D97706' : '#DC2626',
                                  borderRadius: 4
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{completed} / 100</TableCell>
                          <TableCell align="center">
                            <StatusBadge percentage={z.achievement} size="small" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SUBMISSION STATUS (Who submitted? Who did not submit?)             */}
      {/* ========================================================================= */}
      {mainTab === 2 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={2}>
            User Submission Monitoring
          </Typography>

          {/* Top 3 Compact KPI Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #DCFCE7', bg: '#F0FDF4', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" fontWeight={700} color="#15803D">
                    Submitted
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="#16A34A" my={0.5}>
                    745
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fully submitted all modules
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #FEF3C7', bg: '#FFFBEB', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" fontWeight={700} color="#B45309">
                    Partial
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="#D97706" my={0.5}>
                    35
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Incomplete / pending 1-2 modules
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, border: '1px solid #FEE2E2', bg: '#FEF2F2', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" fontWeight={700} color="#991B1B">
                    Not Submitted
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="#DC2626" my={0.5}>
                    31
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Zero submissions recorded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Status Filter Buttons & Search Bar */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
              <ButtonGroup size="small" aria-label="quick status filter button group">
                <Button
                  variant={quickStatus === 'All' ? 'contained' : 'outlined'}
                  onClick={() => { setQuickStatus('All'); setPage(0); }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  All (811)
                </Button>
                <Button
                  variant={quickStatus === 'Submitted' ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => { setQuickStatus('Submitted'); setPage(0); }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Submitted (745)
                </Button>
                <Button
                  variant={quickStatus === 'Partial' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => { setQuickStatus('Partial'); setPage(0); }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Partial (35)
                </Button>
                <Button
                  variant={quickStatus === 'Not Submitted' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => { setQuickStatus('Not Submitted'); setPage(0); }}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Not Submitted (31)
                </Button>
              </ButtonGroup>

              <TextField
                size="small"
                placeholder="Search user / employee / zone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  )
                }}
                sx={{ width: { xs: '100%', sm: 260 }, backgroundColor: '#FAFAFA' }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>District</InputLabel>
                  <Select
                    value={filters.district}
                    label="District"
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                  >
                    <MenuItem value="All">All Districts</MenuItem>
                    {MOCK_DISTRICTS.map((d) => (
                      <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Taluk</InputLabel>
                  <Select
                    value={filters.taluk}
                    label="Taluk"
                    onChange={(e) => handleFilterChange('taluk', e.target.value)}
                  >
                    <MenuItem value="All">All Taluks</MenuItem>
                    <MenuItem value="Kottarakkara">Kottarakkara</MenuItem>
                    <MenuItem value="Karunagappally">Karunagappally</MenuItem>
                    <MenuItem value="Neyyattinkara">Neyyattinkara</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Zone</InputLabel>
                  <Select
                    value={filters.zone}
                    label="Zone"
                    onChange={(e) => handleFilterChange('zone', e.target.value)}
                  >
                    <MenuItem value="All">All Zones</MenuItem>
                    {MOCK_ZONES.map((z) => (
                      <MenuItem key={z} value={z}>{z}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* User Submission Matrix Table */}
          <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Taluk</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Zone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tour Diary</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actual Tour</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Work Allocation</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Key Plot</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Overall Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#64748B' }}>
                      No users match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableUsers.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {u.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.userCode}
                        </Typography>
                      </TableCell>
                      <TableCell>{u.district}</TableCell>
                      <TableCell>{u.taluk}</TableCell>
                      <TableCell>{u.zone}</TableCell>
                      <TableCell>
                        {u.tourDiary === 'SUBMITTED' ? (
                          <Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Submitted" size="small" color="success" sx={{ height: 22, fontSize: '0.725rem' }} />
                        ) : (
                          <Chip icon={<HighlightOffIcon fontSize="small" />} label="Not Submitted" size="small" color="error" sx={{ height: 22, fontSize: '0.725rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {u.actualTour === 'SUBMITTED' ? (
                          <Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Submitted" size="small" color="success" sx={{ height: 22, fontSize: '0.725rem' }} />
                        ) : (
                          <Chip icon={<HighlightOffIcon fontSize="small" />} label="Not Submitted" size="small" color="error" sx={{ height: 22, fontSize: '0.725rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {u.workAllocation === 'SUBMITTED' ? (
                          <Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Submitted" size="small" color="success" sx={{ height: 22, fontSize: '0.725rem' }} />
                        ) : (
                          <Chip icon={<HighlightOffIcon fontSize="small" />} label="Not Submitted" size="small" color="error" sx={{ height: 22, fontSize: '0.725rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Completed" size="small" color="success" sx={{ height: 22, fontSize: '0.725rem' }} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            u.overallStatus === 'Completed'
                              ? 'ON_TRACK'
                              : u.overallStatus === 'Not Submitted'
                                ? 'CRITICAL'
                                : 'NEEDS_ATTENTION'
                          }
                          label={u.overallStatus}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View User Performance">
                          <IconButton size="small" color="primary" onClick={() => handleUserClick(u)}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tableTotal}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      )}

      {/* User Detail Performance Modal */}
      <UserPerformanceDetailModal
        open={userModalOpen}
        user={selectedUser}
        onClose={() => setUserModalOpen(false)}
      />
    </Box>
  );
}

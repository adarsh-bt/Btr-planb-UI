import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  TablePagination,
  Stack,
  Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StatusBadge from 'components/common/StatusBadge';
import { getPendingUsers } from 'api/dashboardApi';

export default function PendingUsersSection({ filters = {}, onUserSelect }) {
  const [quickFilter, setQuickFilter] = useState('All');
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(67);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getPendingUsers(filters, quickFilter, page + 1, rowsPerPage).then((res) => {
      setData(res.data);
      setTotalCount(res.total);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [quickFilter, filters.district, filters.taluk, filters.zone, page, rowsPerPage]);

  const handleTabChange = (event, newValue) => {
    setQuickFilter(newValue);
    setPage(0);
  };

  return (
    <Paper
      id="pending-users"
      elevation={0}
      sx={{
        p: 3,
        mb: 3.5,
        borderRadius: 2.5,
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #FCA5A5',
        boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.05)'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626'
            }}
          >
            <WarningAmberIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Users Requiring Attention
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Field personnel with incomplete or pending monthly submissions
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${totalCount} Users Pending`}
          color="error"
          sx={{ fontWeight: 700, fontSize: '0.85rem', height: 32 }}
        />
      </Box>

      {/* Quick Filters */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={quickFilter}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="error"
          indicatorColor="error"
        >
          <Tab label="All Pending" value="All" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Tour Diary Pending" value="Tour Diary Pending" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Actual Tour Pending" value="Actual Tour Pending" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Work Allocation Pending" value="Work Allocation Pending" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Multiple Pending" value="Multiple Pending" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Pending Table */}
      <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: '#FEF2F2' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>District</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Taluk</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Zone</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Tour Diary</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Actual Tour</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Work Allocation</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Missing Activities</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#991B1B' }}>Last Submission</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#991B1B' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#64748B' }}>
                  No pending users match the current quick filter.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.userCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.district}</TableCell>
                  <TableCell>{user.taluk}</TableCell>
                  <TableCell>{user.zone}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.tourDiary} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.actualTour} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.workAllocation} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {user.missingActivities?.length > 0 ? (
                        user.missingActivities.map((act, i) => (
                          <Chip key={i} label={act} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                        ))
                      ) : (
                        <Chip label="Actual Tour" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize="0.8rem">
                      {user.lastSubmission}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => onUserSelect && onUserSelect(user)}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                    >
                      View
                    </Button>
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
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
}

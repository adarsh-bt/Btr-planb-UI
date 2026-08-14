import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  InputAdornment,
  TablePagination,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StatusBadge from 'components/common/StatusBadge';
import ExportButtons from 'components/common/ExportButtons';
import { getSubmissionMatrix } from 'api/dashboardApi';
import { MOCK_DISTRICTS, MOCK_ZONES } from 'api/mockData';

export default function SubmissionMatrixTable({ filters = {}, onUserSelect }) {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: 'All',
    district: filters.district || 'All',
    taluk: filters.taluk || 'All',
    zone: filters.zone || 'All'
  });

  // Sync prop filters
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      district: filters.district || 'All',
      taluk: filters.taluk || 'All',
      zone: filters.zone || 'All'
    }));
  }, [filters.district, filters.taluk, filters.zone]);

  const loadData = () => {
    setLoading(true);
    getSubmissionMatrix(localFilters, page + 1, rowsPerPage).then((res) => {
      setData(res.data);
      setTotalCount(res.total);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [localFilters, page, rowsPerPage]);

  const handleSearchChange = (e) => {
    setLocalFilters((prev) => ({ ...prev, search: e.target.value }));
    setPage(0);
  };

  const handleFilterChange = (field, val) => {
    setLocalFilters((prev) => ({ ...prev, [field]: val }));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportHeaders = ['User Code', 'User Name', 'District', 'Taluk', 'Zone', 'Tour Diary', 'Actual Tour', 'Work Allocation', 'Key Plot', 'Overall Status'];
  const exportRows = data.map((u) => [
    u.userCode,
    u.name,
    u.district,
    u.taluk,
    u.zone,
    u.tourDiary,
    u.actualTour,
    u.workAllocation,
    u.keyPlot,
    u.overallStatus
  ]);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2.5}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            User Submission Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Module-wise submission overview for all field personnel
          </Typography>
        </Box>

        <ExportButtons
          title="User Submission Matrix Report"
          headers={exportHeaders}
          data={exportRows}
          fileName="user_submission_matrix"
        />
      </Box>

      {/* Filter & Search Bar */}
      <Grid container spacing={2} mb={2.5}>
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search user / employee / zone..."
            value={localFilters.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              )
            }}
            sx={{ backgroundColor: '#FAFAFA' }}
          />
        </Grid>

        <Grid item xs={12} sm={3} md={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel id="matrix-status-label">Overall Status</InputLabel>
            <Select
              labelId="matrix-status-label"
              value={localFilters.status}
              label="Overall Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{ backgroundColor: '#FAFAFA' }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Submitted">Completed</MenuItem>
              <MenuItem value="Partial">Partial / Pending</MenuItem>
              <MenuItem value="Not Submitted">Not Submitted</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>District</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Taluk</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Zone</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tour Diary</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Actual Tour</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Work Allocation</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Key Plot</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Overall Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#64748B' }}>
                  No users found matching the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
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
                    <StatusBadge status={user.keyPlot} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={
                        user.overallStatus === 'Completed'
                          ? 'ON_TRACK'
                          : user.overallStatus === 'Not Submitted'
                          ? 'CRITICAL'
                          : 'NEEDS_ATTENTION'
                      }
                      label={user.overallStatus}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View User Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onUserSelect && onUserSelect(user)}
                      >
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

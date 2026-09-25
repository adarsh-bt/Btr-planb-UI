import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  Stack,
  Alert,
  Snackbar,
  Tooltip,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RateReviewIcon from '@mui/icons-material/RateReview';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import AdvancedForecastService from './advancedForecastService';

const BlockVerificationView = ({ userJurisdiction }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters state
  const [filterPanchayat, setFilterPanchayat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSeason, setFilterSeason] = useState('ALL');

  // Inspection Dialog State
  const [activeItem, setActiveItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadSubmissions = () => {
    const data = AdvancedForecastService.getSubmissions(userJurisdiction);
    setSubmissions(data);
  };

  useEffect(() => {
    loadSubmissions();
  }, [userJurisdiction]);

  // Derived filter options
  const panchayatOptions = useMemo(() => {
    const list = [...new Set(submissions.map((s) => s.panchayat))];
    return ['ALL', ...list];
  }, [submissions]);

  // Filtered submissions
  const filteredData = useMemo(() => {
    return submissions.filter((item) => {
      if (filterPanchayat !== 'ALL' && item.panchayat !== filterPanchayat) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      if (filterSeason !== 'ALL' && item.season !== filterSeason) return false;
      return true;
    });
  }, [submissions, filterPanchayat, filterStatus, filterSeason]);

  // Statistics Summary Metrics
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'Pending Verification').length;
    const approved = submissions.filter((s) => s.status === 'Approved').length;
    const clarification = submissions.filter((s) => s.status === 'Clarification Needed').length;

    return { total, pending, approved, clarification };
  }, [submissions]);

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const pendingIds = filteredData
        .filter((item) => item.status === 'Pending Verification')
        .map((item) => item.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Inspect Modal Open
  const handleOpenInspection = (item) => {
    setActiveItem(item);
    setVerificationRemarks(item.verificationRemarks || '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setActiveItem(null);
    setVerificationRemarks('');
  };

  // Status Action (Approve / Clarification)
  const handleUpdateStatus = (newStatus) => {
    if (!activeItem) return;
    setActionLoading(true);

    setTimeout(() => {
      AdvancedForecastService.updateVerificationStatus(activeItem.id, newStatus, verificationRemarks);
      loadSubmissions();
      setActionLoading(false);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: `Submission ${activeItem.id} updated to status '${newStatus}'.`,
        severity: newStatus === 'Approved' ? 'success' : 'warning'
      });
    }, 400);
  };

  // Batch Approval
  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    setTimeout(() => {
      AdvancedForecastService.batchApprove(selectedIds, 'Approved in batch block verification.');
      loadSubmissions();
      setSelectedIds([]);
      setActionLoading(false);
      setSnackbar({
        open: true,
        message: `Successfully batch approved ${selectedIds.length} forecast submissions.`,
        severity: 'success'
      });
    }, 400);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" variant="filled" />;
      case 'Clarification Needed':
        return <Chip icon={<ErrorOutlineIcon />} label="Clarification Needed" color="warning" size="small" variant="filled" />;
      case 'Pending Verification':
      default:
        return <Chip icon={<PendingActionsIcon />} label="Pending Verification" color="info" size="small" variant="outlined" />;
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Top Banner & Summary Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Total Submissions Received
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)', color: '#fff' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Pending Verification
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#67e8f9' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Approved Records
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Clarifications Flagged
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {stats.clarification}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Toolbar & Actions Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
              <FilterListIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Filter Submissions:
              </Typography>
            </Box>

            {/* Panchayat Filter */}
            <TextField
              select
              size="small"
              label="Panchayat"
              value={filterPanchayat}
              onChange={(e) => setFilterPanchayat(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {panchayatOptions.map((p, idx) => {
                const nameStr = typeof p === 'object' ? p.localbodyName || p.name || `Panchayat ${idx + 1}` : String(p);
                return (
                  <MenuItem key={typeof p === 'object' ? p.mappingId || idx : p} value={nameStr}>
                    {nameStr}
                  </MenuItem>
                );
              })}

            </TextField>

            {/* Status Filter */}
            <TextField
              select
              size="small"
              label="Verification Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="Pending Verification">Pending Verification</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Clarification Needed">Clarification Needed</MenuItem>
            </TextField>

            {/* Season Filter */}
            <TextField
              select
              size="small"
              label="Season"
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">All Seasons</MenuItem>
              <MenuItem value="Autumn (Virippu)">Autumn (Virippu)</MenuItem>
              <MenuItem value="Winter (Mundakan)">Winter (Mundakan)</MenuItem>
              <MenuItem value="Summer (Puncha)">Summer (Puncha)</MenuItem>
              <MenuItem value="Annual / Perennial">Annual / Perennial</MenuItem>
            </TextField>
          </Box>

          {/* Batch Approval Button */}
          <Button
            variant="contained"
            color="success"
            startIcon={<DoneAllIcon />}
            disabled={selectedIds.length === 0 || actionLoading}
            onClick={handleBatchApprove}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Batch Approve ({selectedIds.length})
          </Button>
        </Box>
      </Paper>

      {/* Submissions Queue Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', mb: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#0f172a' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  sx={{ color: '#fff' }}
                  onChange={handleSelectAll}
                  checked={
                    filteredData.length > 0 &&
                    filteredData
                      .filter((i) => i.status === 'Pending Verification')
                      .every((i) => selectedIds.includes(i.id))
                  }
                />
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Record ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Panchayat / Village</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Cultivator Name</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Crop &amp; Season</TableCell>

              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Area (ha)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Yield (t/ha)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Submitted By</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No field forecast submissions match the selected filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id} hover selected={selectedIds.includes(row.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      disabled={row.status !== 'Pending Verification'}
                      onChange={() => handleSelectOne(row.id)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {row.panchayat}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.village}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                    {row.cultivatorName || '-'}
                  </TableCell>
                  <TableCell>

                    <Typography variant="subtitle2">{row.crop}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.season} {row.variety ? `(${row.variety})` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.currentYearArea}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.currentYearYield}
                  </TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell variant="caption">{row.submittedBy}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenInspection(row)}
                      sx={{ borderRadius: 2 }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Inspection & Approval Dialog */}
      {activeItem && (
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bg: '#0f172a', color: '#fff', background: '#0f172a', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RateReviewIcon sx={{ color: '#38bdf8' }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Block Verification Inspection — {activeItem.id}
                </Typography>
              </Box>
              {getStatusChip(activeItem.status)}
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {/* Location details */}
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="textSecondary">
                  District / Taluk / Block
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeItem.district} &rarr; {activeItem.taluk}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="textSecondary">
                  Panchayat &amp; Village
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeItem.panchayat} ({activeItem.village})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="textSecondary">
                  Crop &amp; Season
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeItem.crop} {activeItem.variety ? `- ${activeItem.variety}` : ''} ({activeItem.season})
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
              </Grid>

              {/* Numerical comparison grid */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, background: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0284c7', mb: 1 }}>
                    Area Estimate Parameters (Hectares)
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      Current Year Area:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {activeItem.currentYearArea} ha
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Previous Year Area:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {activeItem.previousYearArea} ha
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, background: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0284c7', mb: 1 }}>
                    Yield Estimate Parameters (Tonnes / ha)
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      Current Year Yield:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {activeItem.currentYearYield} t/ha
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Previous Year Yield:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {activeItem.previousYearYield} t/ha
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Enumerator Remarks */}
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Field Enumerator Remarks
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bg: '#fff', borderRadius: 2, fontStyle: 'italic', mt: 0.5 }}>
                  "{activeItem.remarks || 'No remarks provided by enumerator.'}"
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
              </Grid>

              {/* Verification Remarks Input */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Inspector / Verification Remarks"
                  placeholder="Add comments on field sampling, Krishi Bhavan verification, or reason for clarification..."
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bg: '#f8fafc', gap: 1.5 }}>
            <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
              Close
            </Button>
            <Button
              onClick={() => handleUpdateStatus('Clarification Needed')}
              color="warning"
              variant="contained"
              startIcon={<ErrorOutlineIcon />}
              disabled={actionLoading}
            >
              Request Clarification
            </Button>
            <Button
              onClick={() => handleUpdateStatus('Approved')}
              color="success"
              variant="contained"
              startIcon={<VerifiedUserIcon />}
              disabled={actionLoading}
            >
              Approve Forecast
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BlockVerificationView;

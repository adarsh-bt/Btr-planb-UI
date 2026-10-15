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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import AdvancedForecastService from './advancedForecastService';

const TalukApproverView = ({ userJurisdiction, onDataUpdated }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [filterPanchayat, setFilterPanchayat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Approval Dialog
  const [activeItem, setActiveItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [talukRemarks, setTalukRemarks] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadSubmissions = () => {
    const data = AdvancedForecastService.getSubmissions(userJurisdiction);
    setSubmissions(data);
    if (onDataUpdated) onDataUpdated();
  };

  useEffect(() => {
    loadSubmissions();
  }, [userJurisdiction]);

  const panchayatOptions = useMemo(() => {
    const list = [...new Set(submissions.map((s) => s.panchayat))];
    return ['ALL', ...list];
  }, [submissions]);

  const filteredData = useMemo(() => {
    return submissions.filter((item) => {
      if (filterPanchayat !== 'ALL' && item.panchayat !== filterPanchayat) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      return true;
    });
  }, [submissions, filterPanchayat, filterStatus]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const verifiedIds = filteredData
        .filter((item) => item.status === 'Verified by Field Inspector')
        .map((item) => item.id);
      setSelectedIds(verifiedIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleOpenApproval = (item) => {
    setActiveItem(item);
    setTalukRemarks(item.talukRemarks || '');
    setDialogOpen(true);
  };

  const handleApproveSubmission = () => {
    if (!activeItem) return;
    setLoadingAction(true);

    setTimeout(() => {
      AdvancedForecastService.approveByTalukApprover(activeItem.id, talukRemarks);
      loadSubmissions();
      setLoadingAction(false);
      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Submission ${activeItem.id} granted final Taluk approval!`,
        severity: 'success'
      });
    }, 400);
  };

  const handleRequestClarification = () => {
    if (!activeItem) return;
    setLoadingAction(true);

    setTimeout(() => {
      AdvancedForecastService.requestClarification(activeItem.id, talukRemarks, 'Taluk Level Approver');
      loadSubmissions();
      setLoadingAction(false);
      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Clarification requested for submission ${activeItem.id}.`,
        severity: 'warning'
      });
    }, 400);
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setLoadingAction(true);

    setTimeout(() => {
      AdvancedForecastService.batchApproveTaluk(selectedIds);
      loadSubmissions();
      setSelectedIds([]);
      setLoadingAction(false);
      setSnackbar({
        open: true,
        message: `Successfully granted final Taluk approval for ${selectedIds.length} forecast records.`,
        severity: 'success'
      });
    }, 400);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved by Taluk Approver':
        return <Chip icon={<CheckCircleIcon />} label="Approved (Taluk)" color="success" size="small" variant="filled" />;
      case 'Verified by Field Inspector':
        return <Chip icon={<RateReviewIcon />} label="Verified by Inspector" color="primary" size="small" variant="filled" />;
      case 'Clarification Requested':
        return <Chip icon={<ErrorOutlineIcon />} label="Clarification Requested" color="warning" size="small" variant="filled" />;
      case 'Pending Verification':
      default:
        return <Chip icon={<PendingActionsIcon />} label="Pending Verification" color="info" size="small" variant="outlined" />;
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Role Banner */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: '#fff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedUserIcon sx={{ fontSize: '2rem' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Taluk Level Approver Final Approval Portal
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Review Inspector-verified forecast data and grant final Taluk approval for <strong>{userJurisdiction.taluk} Taluk</strong>
              </Typography>
            </Box>
          </Box>
          <Chip label="Taluk Level Approver" color="warning" sx={{ fontWeight: 'bold' }} />
        </Box>
      </Paper>

      {/* Filter Toolbar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bg: '#f8fafc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterListIcon fontSize="small" />
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

            <TextField
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="Verified by Field Inspector">Awaiting Taluk Approval</MenuItem>
              <MenuItem value="Approved by Taluk Approver">Approved by Taluk Approver</MenuItem>
              <MenuItem value="Pending Verification">Pending Inspector Verification</MenuItem>
              <MenuItem value="Clarification Requested">Clarification Requested</MenuItem>
            </TextField>
          </Box>

          <Button
            variant="contained"
            color="success"
            startIcon={<DoneAllIcon />}
            disabled={selectedIds.length === 0 || loadingAction}
            onClick={handleBatchApprove}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Batch Approve Taluk ({selectedIds.length})
          </Button>
        </Box>
      </Paper>

      {/* Submissions Table */}
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
                      .filter((i) => i.status === 'Verified by Field Inspector')
                      .every((i) => selectedIds.includes(i.id))
                  }
                />
              </TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Record ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Panchayat</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Crop &amp; Season</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Area (ha)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Yield (t/ha)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Workflow Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Field Inspector Note</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No records awaiting Taluk approval.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id} hover selected={selectedIds.includes(row.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      disabled={row.status !== 'Verified by Field Inspector'}
                      onChange={() => handleSelectOne(row.id)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.panchayat}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.crop}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.season}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.currentYearArea}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.currentYearYield}
                  </TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell variant="caption">
                    {row.inspectorRemarks || row.inspectorVerifiedBy ? (
                      <Box>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                          {row.inspectorVerifiedBy}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          "{row.inspectorRemarks || 'Verified'}"
                        </Typography>
                      </Box>
                    ) : (
                      'Pending Inspector'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenApproval(row)}
                      sx={{ borderRadius: 2 }}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Final Approval Modal */}
      {activeItem && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ background: '#0f172a', color: '#fff', py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                Taluk Level Final Approval — {activeItem.id}
              </Typography>
              {getStatusChip(activeItem.status)}
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Panchayat &amp; Season
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {activeItem.panchayat} ({activeItem.season})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Crop &amp; Variety
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {activeItem.crop} {activeItem.variety ? `- ${activeItem.variety}` : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Current Year Area &amp; Yield
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeItem.currentYearArea} ha | {activeItem.currentYearYield} t/ha
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">
                  Previous Year Area &amp; Yield
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {activeItem.previousYearArea} ha | {activeItem.previousYearYield} t/ha
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  Field Inspector Verification Note:
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bg: '#f8fafc', fontWeight: 500 }}>
                  Verified by: <strong>{activeItem.inspectorVerifiedBy || 'Field Inspector'}</strong> &mdash; "
                  {activeItem.inspectorRemarks || 'Verified without remarks.'}"
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Taluk Approver Final Remarks"
                  placeholder="Enter final approval comments for Advance Estimates bulletin..."
                  value={talukRemarks}
                  onChange={(e) => setTalukRemarks(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button onClick={handleRequestClarification} color="warning" variant="contained" disabled={loadingAction}>
              Request Clarification
            </Button>
            <Button onClick={handleApproveSubmission} color="success" variant="contained" disabled={loadingAction}>
              Grant Final Taluk Approval
            </Button>
          </DialogActions>
        </Dialog>
      )}

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

export default TalukApproverView;

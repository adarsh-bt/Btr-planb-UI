import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  TextField,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import AgricultureIcon from '@mui/icons-material/Agriculture';

import AdvancedForecastService, { PREDEFINED_RETURN_REASONS } from './advancedForecastService';
import CultivatorDetailDrawer from './CultivatorDetailDrawer';
import AuditTrailTimeline from './AuditTrailTimeline';

const CROP_CATEGORY_ITEMS = [
  { id: 'All', label: 'All Crops', icon: '🌐', color: '#0284c7', subtext: 'Complete Dataset' },
  { id: 'Paddy', label: 'Paddy', icon: '🌾', color: '#16a34a', subtext: 'Cereals' },
  { id: 'Coconut', label: 'Coconut', icon: '🥥', color: '#d97706', subtext: 'Plantation' },
  { id: 'Banana', label: 'Banana', icon: '🍌', color: '#eab308', subtext: 'Horticulture' },
  { id: 'Vegetables', label: 'Vegetables', icon: '🥦', color: '#059669', subtext: 'Tubers' },
  { id: 'Rubber', label: 'Rubber', icon: '🪵', color: '#9333ea', subtext: 'Commercial' }
];

const DistrictApproverView = () => {
  const [submissions, setSubmissions] = useState([]);
  const [showAllUnderlying, setShowAllUnderlying] = useState(false);
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');

  // Modals & Drawers
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [predefinedReason, setPredefinedReason] = useState(PREDEFINED_RETURN_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const [approvalSuccessData, setApprovalSuccessData] = useState(null);

  const refreshData = () => {
    const data = AdvancedForecastService.getSubmissions();
    setSubmissions(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Crop Category Counts
  const cropCategoryCounts = useMemo(() => {
    const counts = { All: submissions.length, Paddy: 0, Coconut: 0, Banana: 0, Vegetables: 0, Rubber: 0 };
    submissions.forEach((s) => {
      const cat = s.cropCategory || (s.crop === 'Paddy' ? 'Paddy' : s.crop === 'Coconut' ? 'Coconut' : s.crop === 'Banana' ? 'Banana' : s.crop === 'Vegetables' ? 'Vegetables' : s.crop === 'Rubber' ? 'Rubber' : 'Paddy');
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.Paddy++;
      }
    });
    return counts;
  }, [submissions]);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = submissions.length;
    const pendingApproval = submissions.filter((s) => s.status === 'Submitted to District').length;
    const approved = submissions.filter((s) => s.status === 'Approved').length;
    const returned = submissions.filter((s) => s.status === 'Returned for Correction').length;
    const leading10Count = submissions.filter((s) => s.isLeadingSelected).length;

    return { total, pendingApproval, approved, returned, leading10Count };
  }, [submissions]);

  // Selected 10 Cultivators List (Filtered by crop if selected)
  const selected10List = useMemo(() => {
    return submissions.filter((s) => {
      if (!s.isLeadingSelected) return false;
      if (selectedCropCategory !== 'All') {
        const cat = s.cropCategory || s.crop;
        if (cat !== selectedCropCategory && s.crop !== selectedCropCategory) return false;
      }
      return true;
    });
  }, [submissions, selectedCropCategory]);

  // Current submission header status
  const currentSubmissionStatus = useMemo(() => {
    if (submissions.some((s) => s.status === 'Approved')) return 'Approved';
    if (submissions.some((s) => s.status === 'Submitted to District')) return 'Submitted to District';
    if (submissions.some((s) => s.status === 'Returned for Correction')) return 'Returned for Correction';
    return 'Under Taluk Verification';
  }, [submissions]);

  // Handlers
  const handleConfirmApprove = () => {
    AdvancedForecastService.approveDistrictSubmission(approvalNotes || 'Sanctioned by District Officer M. Menon.');
    refreshData();
    setApproveModalOpen(false);
    setApprovalSuccessData({
      submissionId: 'SUB-2026-0801',
      approvalDate: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      approvedBy: 'District Officer M. Menon (Ernakulam District)',
      leadingCount: selected10List.length
    });
  };

  const handleConfirmReturn = () => {
    if (!customReason.trim()) {
      alert('Please provide reason for returning submission.');
      return;
    }
    AdvancedForecastService.returnSubmissionForCorrection(customReason, predefinedReason, 'District Level Approver');
    refreshData();
    setReturnModalOpen(false);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Title & Primary Action Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            District Level Crop Forecast Estimate Approval
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Final executive sanction for Ernakulam District • Kanayannur Taluk Submission #SUB-2026-0801
          </Typography>
        </Box>

        {currentSubmissionStatus === 'Submitted to District' && (
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="error" startIcon={<ReplayIcon />} onClick={() => setReturnModalOpen(true)} sx={{ fontWeight: 700 }}>
              Reject / Return
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => setApproveModalOpen(true)}
              sx={{ px: 3, fontWeight: 700, boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)' }}
            >
              Approve Submission
            </Button>
          </Stack>
        )}
      </Box>

      {/* TOP SECTION: DEDICATED CROP CATEGORY SELECTION BAR FOR DISTRICT APPROVER */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AgricultureIcon sx={{ color: '#38bdf8' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
              District Officer Crop Selection &amp; Sanction Filter
            </Typography>
            <Chip
              label={selectedCropCategory === 'All' ? 'Showing All Crops' : `Selected Crop: ${selectedCropCategory}`}
              size="small"
              sx={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, ml: 1 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Filter submitted cultivators and leading candidates by crop category
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          {CROP_CATEGORY_ITEMS.map((item) => {
            const isSelected = selectedCropCategory === item.id;
            const count = cropCategoryCounts[item.id] || 0;

            return (
              <Grid item xs={6} sm={4} md={2} key={item.id}>
                <Card
                  onClick={() => setSelectedCropCategory(item.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: isSelected ? `2px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mb: 0.5 }}>
                      <Typography variant="h6" component="span">
                        {item.icon}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Chip
                        label={`${count} Entries`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: isSelected ? item.color : 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Dashboard Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Pending Approval
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>
              {summary.pendingApproval}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Awaiting District Officer
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Approved Submissions
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
              {summary.approved}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Officially Sanctioned
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Leading Cultivators
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#d97706', mt: 0.5 }}>
              {summary.leading10Count} / 10
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Selected by Inspector
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Total Cultivators
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {summary.total}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Full Dataset Size
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
              Returned / Rejected
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#dc2626', mt: 0.5 }}>
              {summary.returned}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Sent back to field
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Submission Meta Header Card */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" color="textSecondary">
              Submission Reference ID
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>
              #SUB-2026-0801
            </Typography>
          </Grid>

          <Grid item xs={6} sm={2.5}>
            <Typography variant="caption" color="textSecondary">
              District / Taluk / Block
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Ernakulam • Kanayannur (Vyttila)
            </Typography>
          </Grid>

          <Grid item xs={6} sm={2.5}>
            <Typography variant="caption" color="textSecondary">
              Submitted By Inspector
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Inspector S. Nair
            </Typography>
          </Grid>

          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="textSecondary">
              Field Data Collector
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ramesh K.
            </Typography>
          </Grid>

          <Grid item xs={6} sm={2} align="right">
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
              Current Status
            </Typography>
            {currentSubmissionStatus === 'Approved' ? (
              <Chip icon={<CheckCircleIcon />} label="APPROVED" color="success" sx={{ fontWeight: 800 }} />
            ) : currentSubmissionStatus === 'Submitted to District' ? (
              <Chip icon={<PendingActionsIcon />} label="PENDING APPROVAL" color="info" sx={{ fontWeight: 800 }} />
            ) : (
              <Chip icon={<ReplayIcon />} label="RETURNED" color="error" sx={{ fontWeight: 800 }} />
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Main Approval Review: Selected 10 Leading Cultivators Table */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#f59e0b' }} /> Verified 10 Leading Cultivators (Submitted by Inspector)
          </Typography>

          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowAllUnderlying(!showAllUnderlying)}
            startIcon={<DescriptionIcon />}
          >
            {showAllUnderlying ? 'Hide Complete Dataset' : `Inspect Complete Dataset (${submissions.length} Records)`}
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#0f172a' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Rank</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cultivator Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Crop &amp; Variety</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Season</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Panchayat / Zone</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Prev Area (ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Curr Area (ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Prev Yield (q/ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Curr Yield (q/ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Inspect</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {selected10List.map((row, idx) => (
                <TableRow key={row.id} hover sx={{ backgroundColor: '#fffbeb' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#d97706' }}>
                    <Chip label={`#${idx + 1}`} size="small" color="warning" sx={{ fontWeight: 800 }} />
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {row.cultivatorName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.id}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {row.crop}
                    </Typography>
                    {row.variety && <Chip label={row.variety} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />}
                  </TableCell>

                  <TableCell>{row.season}</TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {row.panchayat}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.zone}
                    </Typography>
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b' }}>
                    {row.previousYearArea}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {row.currentYearArea}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748b' }}>
                    {row.previousYearYield}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#059669' }}>
                    {row.currentYearYield}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDrawerRecord(row);
                        setDrawerOpen(true);
                      }}
                      sx={{ color: '#0284c7' }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Accordion View: Complete Underlying Dataset */}
      {showAllUnderlying && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
            Complete Underlying Dataset ({submissions.length} Cultivator Records)
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#1e293b' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cultivator</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Crop</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Panchayat</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Curr Area</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Curr Yield</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Selected 10?</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{r.id}</TableCell>
                    <TableCell>{r.cultivatorName}</TableCell>
                    <TableCell>{r.crop}</TableCell>
                    <TableCell>{r.panchayat}</TableCell>
                    <TableCell align="right">{r.currentYearArea} ha</TableCell>
                    <TableCell align="right">{r.currentYearYield} q/ha</TableCell>
                    <TableCell>
                      {r.isLeadingSelected ? (
                        <Chip label="★ Selected" size="small" color="warning" sx={{ fontWeight: 700 }} />
                      ) : (
                        <Chip label="Standard" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Audit History Timeline Accordion */}
      <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px !important', mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ color: '#0284c7' }} /> Complete Submission Audit &amp; Activity History Log
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AuditTrailTimeline history={submissions[0]?.history || []} />
        </AccordionDetails>
      </Accordion>

      {/* Cultivator Detail Drawer */}
      <CultivatorDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={drawerRecord} activeRole="District Level Approver" />

      {/* Approve Confirmation Modal */}
      <Dialog open={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', color: '#fff', fontWeight: 700 }}>
          Grant Official Executive Approval
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are granting official sanction for <strong>Crop Forecast Estimate Submission #SUB-2026-0801</strong> for Ernakulam District / Kanayannur Taluk.
          </Typography>

          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            This will finalize the 10 leading cultivators list and publish the crop forecast estimate data to state reporting portals.
          </Alert>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="District Officer Approval Notes / Sanction Order Remarks"
            placeholder="Enter sanction order references, comments, or executive directions..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApproveModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleConfirmApprove} sx={{ fontWeight: 700 }}>
            Confirm &amp; Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject / Return Modal */}
      <Dialog open={returnModalOpen} onClose={() => setReturnModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', color: '#fff', fontWeight: 700 }}>
          Reject / Return Submission to Field
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            This will reject the submission and return it back to Inspector S. Nair and Ramesh K. for ground re-verification.
          </Alert>

          <TextField
            select
            fullWidth
            label="Reason Category"
            value={predefinedReason}
            onChange={(e) => setPredefinedReason(e.target.value)}
            sx={{ mb: 3 }}
          >
            {PREDEFINED_RETURN_REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mandatory Rejection Remarks *"
            placeholder="Explain why the submission is rejected..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReturnModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReturn} sx={{ fontWeight: 700 }}>
            Reject Submission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Success Dialog */}
      {approvalSuccessData && (
        <Dialog open={Boolean(approvalSuccessData)} onClose={() => setApprovalSuccessData(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: '4.5rem', color: '#16a34a', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Forecast Estimate Officially Approved!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Executive sanction granted for Ernakulam District.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5, textAlign: 'left', mb: 3 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Submission ID
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0284c7' }}>
                    #{approvalSuccessData.submissionId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Approval Date
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {approvalSuccessData.approvalDate}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Approved By
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                    {approvalSuccessData.approvedBy}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Leading Cultivators
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {approvalSuccessData.leadingCount} Sanctioned
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Button variant="contained" color="primary" onClick={() => setApprovalSuccessData(null)} sx={{ px: 4, fontWeight: 700 }}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default DistrictApproverView;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReplayIcon from '@mui/icons-material/Replay';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import AdvancedForecastService, { CROPS_MASTER, SEASONS_MASTER } from './advancedForecastService';
import AddForecastEstimateModal from './AddForecastEstimateModal';
import CultivatorDetailDrawer from './CultivatorDetailDrawer';

const CROP_CATEGORY_ITEMS = [
  { id: 'All', label: 'All Crops', icon: '🌐', color: '#0284c7', subtext: 'Complete Dataset' },
  { id: 'Paddy', label: 'Paddy', icon: '🌾', color: '#16a34a', subtext: 'Cereals Sub-Form' },
  { id: 'Coconut', label: 'Coconut', icon: '🥥', color: '#d97706', subtext: 'Plantation Sub-Form' },
  { id: 'Banana', label: 'Banana', icon: '🍌', color: '#eab308', subtext: 'Horticulture Sub-Form' },
  { id: 'Vegetables', label: 'Vegetables', icon: '🥦', color: '#059669', subtext: 'Tubers Sub-Form' },
  { id: 'Rubber', label: 'Rubber', icon: '🪵', color: '#9333ea', subtext: 'Commercial Sub-Form' }
];

const FieldDataCollectorView = ({ userJurisdiction }) => {
  const [submissions, setSubmissions] = useState([]);
  const [activeZoneTab, setActiveZoneTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanchayat, setFilterPanchayat] = useState('All');
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [selectedRecordForView, setSelectedRecordForView] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Submit Modal & Success State
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);

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
    const drafts = submissions.filter((s) => s.status === 'Draft').length;
    const ready = submissions.filter((s) => s.status === 'Ready for Submission').length;
    const submitted = submissions.filter((s) => s.status === 'Submitted' || s.status === 'Submitted to District').length;
    const underReview = submissions.filter((s) => s.status === 'Under Review' || s.status === 'Leading 10 Selected').length;
    const approved = submissions.filter((s) => s.status === 'Approved').length;
    const returned = submissions.filter((s) => s.status === 'Returned for Correction').length;

    return { total, drafts, ready, submitted, underReview, approved, returned };
  }, [submissions]);

  // Zone Metrics
  const zoneSummary = useMemo(() => {
    const zones = ['Zone 01', 'Zone 02', 'Zone 03'];
    return zones.map((z) => {
      const recs = submissions.filter((s) => s.zone === z);
      return {
        zone: z,
        count: recs.length,
        ready: recs.filter((s) => s.status === 'Ready for Submission').length,
        drafts: recs.filter((s) => s.status === 'Draft').length,
        submitted: recs.filter((s) => s.status === 'Submitted' || s.status === 'Approved').length
      };
    });
  }, [submissions]);

  // Returned submission banner details if any
  const returnedRecord = useMemo(() => {
    return submissions.find((s) => s.status === 'Returned for Correction');
  }, [submissions]);

  // Filtered Table Records
  const filteredRecords = useMemo(() => {
    return submissions.filter((r) => {
      if (activeZoneTab !== 'All' && r.zone !== activeZoneTab) return false;
      if (filterPanchayat !== 'All' && r.panchayat !== filterPanchayat) return false;
      if (filterCrop !== 'All' && r.crop !== filterCrop) return false;
      if (filterStatus !== 'All' && r.status !== filterStatus) return false;

      // Crop category top section filter
      if (selectedCropCategory !== 'All') {
        const cat = r.cropCategory || r.crop;
        if (cat !== selectedCropCategory && r.crop !== selectedCropCategory) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.cultivatorName?.toLowerCase().includes(q);
        const matchesCrop = r.crop?.toLowerCase().includes(q);
        const matchesPanchayat = r.panchayat?.toLowerCase().includes(q);
        const matchesId = r.id?.toLowerCase().includes(q);
        if (!matchesName && !matchesCrop && !matchesPanchayat && !matchesId) return false;
      }

      return true;
    });
  }, [submissions, activeZoneTab, filterPanchayat, filterCrop, filterStatus, selectedCropCategory, searchQuery]);

  // Handlers
  const handleAddNew = (specificCrop = null) => {
    setEditRecord(null);
    if (specificCrop && specificCrop !== 'All') {
      setSelectedCropCategory(specificCrop);
    }
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedRecordForView(record);
    setDrawerOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this forecast record?')) {
      AdvancedForecastService.deleteEntry(id);
      refreshData();
    }
  };

  const handleDuplicate = (id) => {
    AdvancedForecastService.duplicateEntry(id);
    refreshData();
  };

  const handleRecordSaved = (savedRecord, message) => {
    refreshData();
  };

  const handleConfirmSubmitAll = () => {
    const updated = AdvancedForecastService.submitAllToSupervisor('Bulk submitted by Field Data Collector Ramesh K.');
    refreshData();
    setConfirmSubmitOpen(false);
    setSubmissionSuccessData({
      submissionId: 'SUB-2026-0801',
      submittedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      recordCount: updated.filter((s) => s.status === 'Submitted').length,
      assignedSupervisor: 'Inspector S. Nair (Taluk Approver)'
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
      case 'Submitted':
      case 'Submitted to District':
        return <Chip icon={<TaskAltIcon />} label="Submitted" color="info" size="small" />;
      case 'Under Review':
      case 'Leading 10 Selected':
        return <Chip icon={<PendingActionsIcon />} label="Under Review" color="warning" size="small" />;
      case 'Returned for Correction':
        return <Chip icon={<ReplayIcon />} label="Returned for Correction" color="error" size="small" />;
      case 'Ready for Submission':
        return <Chip icon={<CheckCircleIcon />} label="Ready for Submission" color="primary" size="small" variant="outlined" />;
      case 'Draft':
      default:
        return <Chip label="Draft" size="small" variant="outlined" sx={{ color: '#64748b' }} />;
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Returned for Correction Warning Banner */}
      {returnedRecord && (
        <Alert
          severity="warning"
          icon={<ReplayIcon sx={{ fontSize: '2rem' }} />}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: '1px solid #fde047',
            backgroundColor: '#fefce8',
            boxShadow: '0 4px 12px rgba(234, 179, 8, 0.15)'
          }}
          action={
            <Button color="warning" variant="contained" size="small" onClick={() => handleEdit(returnedRecord)} sx={{ fontWeight: 700 }}>
              Edit &amp; Resubmit
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 700, color: '#854d0e' }}>
            Submission Returned for Correction by Supervisor
          </AlertTitle>
          <Typography variant="body2" sx={{ color: '#713f12', fontWeight: 600 }}>
            <strong>Reason:</strong> {returnedRecord.returnReason || 'Yield figures require re-verification with field records.'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#a16207', display: 'block', mt: 0.5 }}>
            Returned By: {returnedRecord.returnedBy || 'Inspector S. Nair'} • Date: {returnedRecord.returnedAt || '2026-08-10'}
          </Typography>
        </Alert>
      )}

      {/* Header & Primary Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Forecast Estimate Field Data Collection
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage cultivator crop area and yield estimates for assigned supervisory zones
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          {summary.ready > 0 && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SendIcon />}
              onClick={() => setConfirmSubmitOpen(true)}
              sx={{ px: 3, py: 1, borderRadius: 2.5, fontWeight: 700, boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}
            >
              Submit ({summary.ready}) to Supervisor
            </Button>
          )}


        </Stack>
      </Box>

      {/* TOP SECTION: DEDICATED CROP CATEGORY SELECTION BAR */}
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
              Crop Selection (Top Section Filter)
            </Typography>
            <Chip
              label={selectedCropCategory === 'All' ? 'Showing All Crops' : `Selected Crop: ${selectedCropCategory}`}
              size="small"
              sx={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, ml: 1 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Selecting a crop filters the data entry modal and collection list automatically
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




      {/* Filters & Search Bar */}
      <Paper elevation={0} sx={{ mb: 3, p: 2.5, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by cultivator, crop, panchayat, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2.5}>
            <TextField select fullWidth size="small" label="Panchayth" value={filterPanchayat} onChange={(e) => setFilterPanchayat(e.target.value)}>
              <MenuItem value="All">All Panchayths</MenuItem>
              <MenuItem value="Kumbalangi">Kumbalangi</MenuItem>
              <MenuItem value="Mulavukad">Mulavukad</MenuItem>
              <MenuItem value="Choornikkara">Choornikkara</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={2.5}>
            <TextField select fullWidth size="small" label="Crop" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
              <MenuItem value="All">All Crops</MenuItem>
              {CROPS_MASTER.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField select fullWidth size="small" label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Ready for Submission">Ready for Submission</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Submitted">Submitted</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Returned for Correction">Returned for Correction</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Forecast Estimate Records Header & Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', overflow: 'hidden', mb: 4 }}>
        <Box sx={{ px: 3, py: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Cultivator Forecast Records
            </Typography>
            <Chip label={`${filteredRecords.length} Records`} size="small" color="primary" sx={{ fontWeight: 700 }} />
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleAddNew(selectedCropCategory)}
            sx={{ px: 2.5, py: 0.8, borderRadius: 2, fontWeight: 700, boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}
          >
            Add Forecast Estimate {selectedCropCategory !== 'All' ? `(${selectedCropCategory})` : ''}
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#0f172a' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Sl. No.</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cultivator Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Crop &amp; Variety</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Season</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Panchayth</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Prev Area (Cents)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Curr Area (Cents)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Prev Yield (Kg/Ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Curr Yield (Kg/Ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No forecast estimate records found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((row, index) => {
                  const isEditable = row.status === 'Draft' || row.status === 'Ready for Submission' || row.status === 'Returned for Correction';

                  return (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#0284c7' }}>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {row.cultivatorName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {row.cultivatorPhone || '+91 98470 12345'}
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
                        <Chip label={row.zone} size="small" sx={{ fontSize: '0.65rem', backgroundColor: '#e0f2fe', color: '#0369a1' }} />
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

                      <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {row.currentYearYield}
                      </TableCell>

                      <TableCell>{getStatusChip(row.status)}</TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Complete Record & Audit Trail">
                            <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#0284c7' }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {isEditable && (
                            <Tooltip title="Delete Record">
                              <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#dc2626' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Stepper Modal */}
      <AddForecastEstimateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecordSaved={handleRecordSaved}
        editRecord={editRecord}
        selectedCropCategory={selectedCropCategory}
      />

      {/* Cultivator Detail Drawer */}
      <CultivatorDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedRecordForView} activeRole="Field Data Collector" />

      {/* Confirm Submission Dialog */}
      <Dialog open={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a' }}>
          Submit Forecast Estimate Records to Supervisor?
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to submit <strong>{summary.ready} verified cultivator records</strong> for Block Vyttila / Kanayannur Taluk to{' '}
            <strong>Inspector S. Nair (Taluk Level Approver)</strong>.
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Once submitted, records become read-only for field data collectors unless returned for correction by the supervisor.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmSubmitOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" startIcon={<SendIcon />} onClick={handleConfirmSubmitAll} sx={{ fontWeight: 700 }}>
            Confirm Submission
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submission Success Dialog */}
      {submissionSuccessData && (
        <Dialog open={Boolean(submissionSuccessData)} onClose={() => setSubmissionSuccessData(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: '4rem', color: '#16a34a', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Forecast Estimate Submitted Successfully!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Your batch submission has been delivered to the supervisor queue.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5, textAlign: 'left', mb: 3 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Submission ID
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0284c7' }}>
                    #{submissionSuccessData.submissionId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Submitted Date/Time
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {submissionSuccessData.submittedAt}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Total Records
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {submissionSuccessData.recordCount} Cultivators
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Assigned Supervisor
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {submissionSuccessData.assignedSupervisor}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Button variant="contained" color="primary" onClick={() => setSubmissionSuccessData(null)} sx={{ px: 4, fontWeight: 700 }}>
              Done
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default FieldDataCollectorView;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  InputAdornment,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import AdvancedForecastService, {
  CROPS_MASTER,
  PADDY_VARIETIES,
  SEASONS_MASTER
} from './advancedForecastService';

const FieldDataCollectorView = ({ userJurisdiction, zoneId }) => {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' | 'ADD_ENTRY'
  const [submissions, setSubmissions] = useState([]);
  const [panchayaths, setPanchayaths] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingPanchayaths, setLoadingPanchayaths] = useState(true);

  // Form State for Add Entry
  const [formData, setFormData] = useState({
    panchayat: '',
    village: '',
    cultivatorName: '',
    season: 'Autumn (Virippu)',

    crop: 'Paddy',
    variety: 'Jyothi',
    currentYearArea: '',
    previousYearArea: '',
    currentYearYield: '',
    previousYearYield: '',
    remarks: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sendingApproval, setSendingApproval] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load Panchayaths for active zone
  useEffect(() => {
    const loadPanchayaths = async () => {
      setLoadingPanchayaths(true);
      const list = await AdvancedForecastService.getPanchayathsForZone(zoneId);
      setPanchayaths(list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, panchayat: list[0] }));
      }
      setLoadingPanchayaths(false);
    };
    loadPanchayaths();
  }, [zoneId]);

  // Load Villages when Panchayat changes
  useEffect(() => {
    const loadVillages = async () => {
      if (formData.panchayat) {
        const pName = typeof formData.panchayat === 'object' ? formData.panchayat.localbodyName || formData.panchayat.name : formData.panchayat;
        const list = await AdvancedForecastService.getVillagesForPanchayat(pName);
        setVillages(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, village: list[0] }));
        }
      }
    };
    loadVillages();
  }, [formData.panchayat]);

  // Refresh saved entries
  const refreshSubmissions = () => {
    const data = AdvancedForecastService.getSubmissions();
    setSubmissions(data);
  };

  useEffect(() => {
    refreshSubmissions();
  }, []);

  // Form Field Change Handler
  const handleChange = (field) => (event) => {
    const val = event.target.value;
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'crop' && val !== 'Paddy') {
        updated.variety = '';
      } else if (field === 'crop' && val === 'Paddy' && !prev.variety) {
        updated.variety = PADDY_VARIETIES[0];
      }
      return updated;
    });

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.panchayat) errors.panchayat = 'Panchayat is required';
    if (!formData.season) errors.season = 'Season is required';
    if (!formData.crop) errors.crop = 'Crop is required';
    if (formData.crop === 'Paddy' && !formData.variety) errors.variety = 'Variety is required for Paddy';
    if (!formData.currentYearArea || parseFloat(formData.currentYearArea) <= 0) errors.currentYearArea = 'Enter valid current area';
    if (!formData.previousYearArea || parseFloat(formData.previousYearArea) < 0) errors.previousYearArea = 'Enter valid previous area';
    if (!formData.currentYearYield || parseFloat(formData.currentYearYield) <= 0) errors.currentYearYield = 'Enter valid current yield';
    if (!formData.previousYearYield || parseFloat(formData.previousYearYield) < 0) errors.previousYearYield = 'Enter valid previous yield';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Entry Handler -> Automatically returns to Table List UI after saving
  const handleSaveEntry = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all mandatory fields with valid numeric inputs.',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      try {
        const pName = typeof formData.panchayat === 'object' ? formData.panchayat.localbodyName || formData.panchayat.name : formData.panchayat;
        const recordData = {
          ...formData,
          panchayat: pName,
          village: formData.village || pName
        };

        AdvancedForecastService.saveNewEntry(recordData, userJurisdiction);
        refreshSubmissions();

        setSnackbar({
          open: true,
          message: 'Entry saved successfully to list!',
          severity: 'success'
        });

        // Reset inputs
        setFormData((prev) => ({
          ...prev,
          currentYearArea: '',
          previousYearArea: '',
          currentYearYield: '',
          previousYearYield: '',
          remarks: ''
        }));

        // AUTOMATICALLY GO BACK TO TABLE LIST UI AFTER SAVING
        setViewMode('LIST');
      } catch (err) {
        setSnackbar({ open: true, message: 'Error saving entry. Please try again.', severity: 'error' });
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  // Delete Record Handler
  const handleDeleteEntry = (id) => {
    AdvancedForecastService.deleteEntry(id);
    refreshSubmissions();
    setSnackbar({
      open: true,
      message: `Entry ${id} deleted from list.`,
      severity: 'info'
    });
  };

  // Send for Approval Handler
  const handleSendForApproval = () => {
    if (submissions.length === 0) return;
    setSendingApproval(true);

    setTimeout(() => {
      AdvancedForecastService.submitAllForApproval();
      refreshSubmissions();
      setSendingApproval(false);
      setSnackbar({
        open: true,
        message: `Successfully sent ${submissions.length} forecast records for approval!`,
        severity: 'success'
      });
    }, 500);
  };

  // Count draft entries awaiting approval submission
  const draftCount = useMemo(() => {
    return submissions.filter((s) => s.status === 'Saved (Draft)').length;
  }, [submissions]);

  return (
    <Box sx={{ mt: 1 }}>
      {/* Auto-selected Jurisdiction Context Badge */}

      {/* VIEW MODE 1: TABLE LIST UI */}
      {viewMode === 'LIST' && (
        <Box>
          {/* Header Action Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FormatListBulletedIcon sx={{ color: '#0284c7', fontSize: '1.8rem' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                  Crop Forecast Table List ({submissions.length} Records)
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {draftCount > 0
                    ? `${draftCount} draft entries ready to send for approval`
                    : 'All entries submitted for verification'}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              {/* + Add Entry Button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setViewMode('ADD_ENTRY')}
                sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
              >
                Add Entry
              </Button>

              {/* Send for Approval Button (Visible when entries are available) */}
              {submissions.length > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SendIcon />}
                  disabled={sendingApproval}
                  onClick={handleSendForApproval}
                  sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
                >
                  Send for Approval ({submissions.length})
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Table List View */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', mb: 4 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1e293b' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Record ID</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Panchayat / Village</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Cultivator Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Season</TableCell>

                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Crop &amp; Variety</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Area (ha)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Previous Area (ha)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Yield (t/ha)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Previous Yield (t/ha)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
                        No crop forecast entries available yet.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setViewMode('ADD_ENTRY')}
                        sx={{ borderRadius: 2 }}
                      >
                        Click "+ Add Entry" to add your first forecast record
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((row) => (
                    <TableRow key={row.id} hover>
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
                      <TableCell>{row.season}</TableCell>

                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {row.crop}
                        </Typography>
                        {row.variety && (
                          <Chip label={row.variety} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {row.currentYearArea}
                      </TableCell>
                      <TableCell align="right">{row.previousYearArea}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {row.currentYearYield}
                      </TableCell>
                      <TableCell align="right">{row.previousYearYield}</TableCell>
                      <TableCell variant="caption">{row.remarks || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'Submitted for Approval' ? 'success' : 'info'}
                          variant={row.status === 'Submitted for Approval' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleDeleteEntry(row.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* VIEW MODE 2: ADD ENTRY FORM UI (TABLE FORMAT COLUMNS) */}
      {viewMode === 'ADD_ENTRY' && (
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.06)', mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AgricultureIcon sx={{ fontSize: '1.8rem', color: '#38bdf8' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                Add New Crop Forecast Entry
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => setViewMode('LIST')}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }}
            >
              Back to Table List
            </Button>
          </Box>

          <CardContent sx={{ p: 3.5 }}>
            <form onSubmit={handleSaveEntry}>
              <Grid container spacing={3}>
                {/* Panchayat */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Panchayat (User Zone)"
                    value={formData.panchayat}
                    onChange={handleChange('panchayat')}
                    error={Boolean(formErrors.panchayat)}
                    helperText={formErrors.panchayat || 'Loaded for active zone'}
                    disabled={loadingPanchayaths}
                    required
                  >
                    {panchayaths.map((p, idx) => {
                      const nameStr = typeof p === 'object' ? p.localbodyName || p.name || `Panchayat ${idx + 1}` : String(p);
                      return (
                        <MenuItem key={typeof p === 'object' ? p.mappingId || idx : p} value={nameStr}>
                          {nameStr}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>

                {/* Village */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Village"
                    value={formData.village}
                    onChange={handleChange('village')}
                    required
                  >
                    {villages.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Cultivator Name */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Cultivator / Farmer Name"
                    placeholder="Enter cultivator name..."
                    value={formData.cultivatorName}
                    onChange={handleChange('cultivatorName')}
                  />
                </Grid>


                {/* Season */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Season"
                    value={formData.season}
                    onChange={handleChange('season')}
                    required
                  >
                    {SEASONS_MASTER.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Crop */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Crop"
                    value={formData.crop}
                    onChange={handleChange('crop')}
                    required
                  >
                    {CROPS_MASTER.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Variety (Conditional for Paddy) */}
                {formData.crop === 'Paddy' && (
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Variety (Paddy Specific)"
                      value={formData.variety}
                      onChange={handleChange('variety')}
                      required
                    >
                      {PADDY_VARIETIES.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Comparative Forecast Inputs" size="small" />
                  </Divider>
                </Grid>

                {/* Current Year Area */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Current Year Area"
                    placeholder="e.g. 45.50"
                    value={formData.currentYearArea}
                    onChange={handleChange('currentYearArea')}
                    error={Boolean(formErrors.currentYearArea)}
                    helperText={formErrors.currentYearArea}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">ha</InputAdornment>
                    }}
                    required
                  />
                </Grid>

                {/* Previous Year Area */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Previous Year Area"
                    placeholder="e.g. 42.00"
                    value={formData.previousYearArea}
                    onChange={handleChange('previousYearArea')}
                    error={Boolean(formErrors.previousYearArea)}
                    helperText={formErrors.previousYearArea}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">ha</InputAdornment>
                    }}
                    required
                  />
                </Grid>

                {/* Current Year Yield */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Current Year Yield"
                    placeholder="e.g. 3.20"
                    value={formData.currentYearYield}
                    onChange={handleChange('currentYearYield')}
                    error={Boolean(formErrors.currentYearYield)}
                    helperText={formErrors.currentYearYield}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">t/ha</InputAdornment>
                    }}
                    required
                  />
                </Grid>

                {/* Previous Year Yield */}
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Previous Year Yield"
                    placeholder="e.g. 3.00"
                    value={formData.previousYearYield}
                    onChange={handleChange('previousYearYield')}
                    error={Boolean(formErrors.previousYearYield)}
                    helperText={formErrors.previousYearYield}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">t/ha</InputAdornment>
                    }}
                    required
                  />
                </Grid>

                {/* Remarks */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Remarks (if any)"
                    placeholder="Mention field observation notes..."
                    value={formData.remarks}
                    onChange={handleChange('remarks')}
                  />
                </Grid>

                {/* Entry Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" color="secondary" onClick={() => setViewMode('LIST')}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                      sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 'bold' }}
                    >
                      Save Data (Back to List)
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notification Snackbar */}
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

export default FieldDataCollectorView;

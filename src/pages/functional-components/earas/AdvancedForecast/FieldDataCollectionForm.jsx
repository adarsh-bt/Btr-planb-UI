import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
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
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import AdvancedForecastService, {
  CROPS_MASTER,
  PADDY_VARIETIES,
  SEASONS_MASTER
} from './advancedForecastService';

const FieldDataCollectionForm = ({ userJurisdiction, zoneId }) => {
  const [panchayaths, setPanchayaths] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingPanchayaths, setLoadingPanchayaths] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    panchayat: '',
    village: '',
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
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load Panchayaths for User Zone on mount
  useEffect(() => {
    const loadPanchayaths = async () => {
      setLoadingPanchayaths(true);
      try {
        const list = await AdvancedForecastService.getPanchayathsForZone(zoneId);
        setPanchayaths(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, panchayat: list[0] }));
        }
      } catch (e) {
        console.error('Failed to load panchayaths', e);
      } finally {
        setLoadingPanchayaths(false);
      }
    };

    loadPanchayaths();
  }, [zoneId]);

  // Load Villages when Panchayat changes
  useEffect(() => {
    const loadVillages = async () => {
      if (formData.panchayat) {
        const list = await AdvancedForecastService.getVillagesForPanchayat(formData.panchayat);
        setVillages(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, village: list[0] }));
        }
      }
    };
    loadVillages();
  }, [formData.panchayat]);

  // Load user submissions list
  const refreshSubmissions = () => {
    const data = AdvancedForecastService.getSubmissions(userJurisdiction);
    setSubmissions(data);
  };

  useEffect(() => {
    refreshSubmissions();
  }, [userJurisdiction]);

  // Handle field change
  const handleChange = (field) => (event) => {
    const val = event.target.value;
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      // Reset variety if crop changed from Paddy to non-paddy
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

  // Dynamic variance metrics computations
  const metrics = useMemo(() => {
    const curArea = parseFloat(formData.currentYearArea) || 0;
    const prevArea = parseFloat(formData.previousYearArea) || 0;
    const curYield = parseFloat(formData.currentYearYield) || 0;
    const prevYield = parseFloat(formData.previousYearYield) || 0;

    const areaDiff = curArea - prevArea;
    const areaChangePct = prevArea > 0 ? ((areaDiff / prevArea) * 100).toFixed(1) : '0.0';

    const yieldDiff = curYield - prevYield;
    const yieldChangePct = prevYield > 0 ? ((yieldDiff / prevYield) * 100).toFixed(1) : '0.0';

    const curProd = (curArea * curYield).toFixed(2);
    const prevProd = (prevArea * prevYield).toFixed(2);

    return {
      areaChangePct: parseFloat(areaChangePct),
      yieldChangePct: parseFloat(yieldChangePct),
      curProd: parseFloat(curProd),
      prevProd: parseFloat(prevProd)
    };
  }, [formData.currentYearArea, formData.previousYearArea, formData.currentYearYield, formData.previousYearYield]);

  // Validate form before submission
  const validate = () => {
    const errors = {};
    if (!formData.panchayat) errors.panchayat = 'Panchayat is required';
    if (!formData.village) errors.village = 'Village is required';
    if (!formData.season) errors.season = 'Season is required';
    if (!formData.crop) errors.crop = 'Crop is required';
    if (formData.crop === 'Paddy' && !formData.variety) errors.variety = 'Variety is required for Paddy';

    if (!formData.currentYearArea || parseFloat(formData.currentYearArea) <= 0) {
      errors.currentYearArea = 'Enter valid current year area';
    }
    if (!formData.previousYearArea || parseFloat(formData.previousYearArea) < 0) {
      errors.previousYearArea = 'Enter valid previous year area';
    }
    if (!formData.currentYearYield || parseFloat(formData.currentYearYield) <= 0) {
      errors.currentYearYield = 'Enter valid current year yield';
    }
    if (!formData.previousYearYield || parseFloat(formData.previousYearYield) < 0) {
      errors.previousYearYield = 'Enter valid previous year yield';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all mandatory fields with valid data.',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      try {
        const recordData = {
          district: userJurisdiction.district || 'Thiruvananthapuram',
          taluk: userJurisdiction.taluk || 'Neyyattinkara',
          block: userJurisdiction.block || `${userJurisdiction.taluk || 'Neyyattinkara'} Block`,
          panchayat: formData.panchayat,
          village: formData.village,
          season: formData.season,
          crop: formData.crop,
          variety: formData.crop === 'Paddy' ? formData.variety : '',
          currentYearArea: formData.currentYearArea,
          previousYearArea: formData.previousYearArea,
          currentYearYield: formData.currentYearYield,
          previousYearYield: formData.previousYearYield,
          remarks: formData.remarks
        };

        AdvancedForecastService.submitForecastRecord(recordData);
        refreshSubmissions();
        setSnackbar({
          open: true,
          message: 'Crop Forecast Data submitted successfully for Block Verification!',
          severity: 'success'
        });

        // Reset form numeric inputs & remarks
        setFormData((prev) => ({
          ...prev,
          currentYearArea: '',
          previousYearArea: '',
          currentYearYield: '',
          previousYearYield: '',
          remarks: ''
        }));
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error submitting forecast record. Please try again.',
          severity: 'error'
        });
      } finally {
        setSubmitting(false);
      }
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      panchayat: panchayaths[0] || '',
      village: villages[0] || '',
      season: SEASONS_MASTER[0],
      crop: CROPS_MASTER[0],
      variety: PADDY_VARIETIES[0],
      currentYearArea: '',
      previousYearArea: '',
      currentYearYield: '',
      previousYearYield: '',
      remarks: ''
    });
    setFormErrors({});
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
      {/* Background Auto-selected Jurisdiction Confirmation Badge */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.04) 0%, rgba(15, 23, 42, 0.08) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocationOnIcon sx={{ color: '#0284c7', fontSize: '1.8rem' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              Field Data Collection Jurisdiction (Auto-Selected)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Target Location: <strong>{userJurisdiction.district} District</strong> &rarr;{' '}
              <strong>{userJurisdiction.taluk} Taluk</strong> &rarr; <strong>{userJurisdiction.taluk} Block</strong>
            </Typography>
          </Box>
        </Box>
        <Chip
          label="Auto-Selected from User Jurisdiction"
          color="primary"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Paper>

      {/* Main Entry Form Card */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          mb: 4,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <AgricultureIcon sx={{ fontSize: '1.8rem', color: '#38bdf8' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              Crop Forecast Data Entry (Enumerator)
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Fill in crop-wise area and yield parameters for Forecast &amp; Advance Estimates
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 3.5 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Panchayat (Loaded from User Zone) */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Panchayat (User Zone)"
                  value={formData.panchayat}
                  onChange={handleChange('panchayat')}
                  error={Boolean(formErrors.panchayat)}
                  helperText={formErrors.panchayat || 'Listed based on your active zone'}
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
                  error={Boolean(formErrors.village)}
                  helperText={formErrors.village}
                  required
                >
                  {villages.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Season */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Season"
                  value={formData.season}
                  onChange={handleChange('season')}
                  error={Boolean(formErrors.season)}
                  helperText={formErrors.season}
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
                  error={Boolean(formErrors.crop)}
                  helperText={formErrors.crop}
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
                    error={Boolean(formErrors.variety)}
                    helperText={formErrors.variety || 'Select Paddy variety'}
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
                  <Chip label="Area &amp; Yield Comparative Inputs" size="small" />
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
                    endAdornment: <InputAdornment position="end">Hectares</InputAdornment>
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
                    endAdornment: <InputAdornment position="end">Hectares</InputAdornment>
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
                    endAdornment: <InputAdornment position="end">Tonnes/ha</InputAdornment>
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
                    endAdornment: <InputAdornment position="end">Tonnes/ha</InputAdornment>
                  }}
                  required
                />
              </Grid>

              {/* Computed Dynamic Metric Cards */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#475569', mb: 1.5 }}>
                    Real-time Dynamic Forecast Estimations
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {metrics.areaChangePct >= 0 ? (
                          <TrendingUpIcon color="success" />
                        ) : (
                          <TrendingDownIcon color="error" />
                        )}
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Area Variance %
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: metrics.areaChangePct >= 0 ? '#16a34a' : '#dc2626'
                            }}
                          >
                            {metrics.areaChangePct >= 0 ? `+${metrics.areaChangePct}%` : `${metrics.areaChangePct}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {metrics.yieldChangePct >= 0 ? (
                          <TrendingUpIcon color="success" />
                        ) : (
                          <TrendingDownIcon color="error" />
                        )}
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Yield Variance %
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: metrics.yieldChangePct >= 0 ? '#16a34a' : '#dc2626'
                            }}
                          >
                            {metrics.yieldChangePct >= 0 ? `+${metrics.yieldChangePct}%` : `${metrics.yieldChangePct}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AgricultureIcon color="primary" />
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Est. Total Production
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                            {metrics.curProd > 0 ? `${metrics.curProd} Tonnes` : '0.00 Tonnes'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Remarks */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Remarks (if any)"
                  placeholder="Mention weather conditions, irrigation support, pest impact, or field observation details..."
                  value={formData.remarks}
                  onChange={handleChange('remarks')}
                />
              </Grid>

              {/* Form Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                    disabled={submitting}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={submitting}
                    sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Submit for Block Verification
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Submitted Forecast Records Table */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', mb: 2 }}>
        Field Forecast Submissions &amp; Verification Status
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', mb: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1e293b' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Record ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Panchayat / Village</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Season</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Crop &amp; Variety</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Area (ha)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Yield (t/ha)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Submitted At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No forecast submissions recorded yet. Fill in the form above to create your first record.
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
                  <TableCell>{row.season}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{row.crop}</Typography>
                    {row.variety && (
                      <Chip label={row.variety} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.currentYearArea}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {row.currentYearYield}
                  </TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell variant="caption">{row.submittedAt}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FieldDataCollectionForm;

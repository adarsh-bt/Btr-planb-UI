import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AgricultureIcon from '@mui/icons-material/Agriculture';

import AdvancedForecastService, {
  CROPS_MASTER,
  SEASONS_MASTER,
  YIELD_TYPES_MASTER
} from './advancedForecastService';

const SAMPLE_CULTIVATORS_AUTOCOMPLETE = [
  'Ravi Kumar P.',
  'Suresh Babu K.',
  'Anil Kumar M.',
  'Joseph Mathew',
  'Rajesh P. Nair',
  'Manoj K. Varghese',
  'Sunil T. Kurup',
  'Binu Thomas',
  'Shaji Varghese',
  'Prakash N. Menon',
  'Gopinathan Nair',
  'Mathew Joseph',
  'Deepak Mohan'
];

export const CROP_CATEGORIES = [
  { id: 'Paddy', label: '🌾 Paddy', defaultCrop: 'Paddy', areaUnit: 'Cents', yieldUnit: 'Kg/ha' },
  { id: 'Coconut', label: '🥥 Coconut', defaultCrop: 'Coconut', areaUnit: 'Cents / Palms', yieldUnit: 'Nuts/Palm/Year' },
  { id: 'Banana', label: '🍌 Banana', defaultCrop: 'Banana', areaUnit: 'Cents / Stems', yieldUnit: 'Bunches/ha' },
  { id: 'Vegetables', label: '🥦 Vegetables', defaultCrop: 'Vegetables', areaUnit: 'Cents / Sq.m', yieldUnit: 'Kg/ha' },
  { id: 'Rubber', label: '🪵 Rubber', defaultCrop: 'Rubber', areaUnit: 'Cents / Trees', yieldUnit: 'Kg/Tree/Year' }
];

const CROP_VARIETY_OPTIONS = ['High Yielding Variety (HYV)', 'Local Variety'];

const AddForecastEstimateModal = ({ open, onClose, onRecordSaved, editRecord = null, selectedCropCategory = 'Paddy' }) => {
  const [activeCropCategory, setActiveCropCategory] = useState('Paddy');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    cultivatorName: '',
    panchayat: 'Kumbalangi',
    block: 'Vyttila',
    taluk: 'Kanayannur',
    district: 'Ernakulam',
    cropCategory: 'Paddy',
    crop: 'Paddy',
    variety: 'High Yielding Variety (HYV)',
    season: 'Autumn (Virippu)',
    yieldType: 'Irrigated',
    previousYearArea: '',
    currentYearArea: '',
    previousYearYield: '',
    currentYearYield: '',
    remarks: ''
  });

  const [panchayaths, setPanchayaths] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [warningConfirmed, setWarningConfirmed] = useState(false);
  const [areaWarningConfirmed, setAreaWarningConfirmed] = useState(false);

  // Active crop config
  const activeCropConfig = useMemo(() => {
    return CROP_CATEGORIES.find((c) => c.id === activeCropCategory) || CROP_CATEGORIES[0];
  }, [activeCropCategory]);

  useEffect(() => {
    const loadLiveData = async () => {
      const activeZoneId = localStorage.getItem('activeZone') || localStorage.getItem('zoneId') || '104';
      const livePanchayaths = await AdvancedForecastService.getPanchayathsForZone(activeZoneId);
      setPanchayaths(livePanchayaths);

      if (!editRecord && livePanchayaths && livePanchayaths.length > 0) {
        setFormData((prev) => ({
          ...prev,
          panchayat: livePanchayaths[0]
        }));
      }
    };
    if (open) {
      loadLiveData();
    }
  }, [open, editRecord]);

  useEffect(() => {
    if (editRecord) {
      const cat = editRecord.cropCategory || (editRecord.crop === 'Paddy' ? 'Paddy' : editRecord.crop === 'Coconut' ? 'Coconut' : editRecord.crop === 'Banana' ? 'Banana' : editRecord.crop === 'Vegetables' ? 'Vegetables' : 'Rubber');
      setActiveCropCategory(cat);
      setFormData({
        id: editRecord.id || '',
        cultivatorName: editRecord.cultivatorName || '',
        panchayat: editRecord.panchayat || 'Kumbalangi',
        block: editRecord.block || 'Vyttila',
        taluk: editRecord.taluk || 'Kanayannur',
        district: editRecord.district || 'Ernakulam',
        cropCategory: cat,
        crop: editRecord.crop || cat,
        variety: editRecord.variety || 'High Yielding Variety (HYV)',
        season: editRecord.season || 'Autumn (Virippu)',
        yieldType: editRecord.yieldType || 'Irrigated',
        previousYearArea: editRecord.previousYearArea ?? '',
        currentYearArea: editRecord.currentYearArea ?? '',
        previousYearYield: editRecord.previousYearYield ?? '',
        currentYearYield: editRecord.currentYearYield ?? '',
        remarks: editRecord.remarks || ''
      });
    } else {
      const initialCat = (selectedCropCategory && selectedCropCategory !== 'All') ? selectedCropCategory : 'Paddy';
      setActiveCropCategory(initialCat);
      const catObj = CROP_CATEGORIES.find((c) => c.id === initialCat);
      const defaultCropName = catObj ? catObj.defaultCrop : initialCat;

      setFormData({
        id: '',
        cultivatorName: '',
        panchayat: 'Kumbalangi',
        block: 'Vyttila',
        taluk: 'Kanayannur',
        district: 'Ernakulam',
        cropCategory: initialCat,
        crop: defaultCropName,
        variety: 'High Yielding Variety (HYV)',
        season: 'Autumn (Virippu)',
        yieldType: 'Irrigated',
        previousYearArea: '',
        currentYearArea: '',
        previousYearYield: '',
        currentYearYield: '',
        remarks: ''
      });
    }
    setFormErrors({});
    setWarningConfirmed(false);
    setAreaWarningConfirmed(false);
  }, [open, editRecord, selectedCropCategory]);

  const handleChange = (field) => (event) => {
    const value = event ? (event.target ? event.target.value : event) : '';
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Dynamic calculations
  const yieldMetrics = useMemo(() => {
    const curArea = parseFloat(formData.currentYearArea) || 0;
    const prevArea = parseFloat(formData.previousYearArea) || 0;
    const curYield = parseFloat(formData.currentYearYield) || 0;
    const prevYield = parseFloat(formData.previousYearYield) || 0;

    const areaDiff = curArea - prevArea;
    const areaPct = prevArea > 0 ? ((areaDiff / prevArea) * 100).toFixed(1) : '0.0';

    const yieldDiff = curYield - prevYield;
    const yieldPct = prevYield > 0 ? ((yieldDiff / prevYield) * 100).toFixed(1) : '0.0';

    const isHighAreaVariance = prevArea > 0 && Math.abs(parseFloat(areaPct)) > 40.0;
    const isHighYieldVariance = prevYield > 0 && Math.abs(parseFloat(yieldPct)) > 40.0;

    return {
      areaDiff,
      areaPct: parseFloat(areaPct),
      yieldDiff,
      yieldPct: parseFloat(yieldPct),
      curProd: (curArea * curYield).toFixed(1),
      isHighAreaVariance,
      isHighYieldVariance,
      isHighVariance: isHighYieldVariance
    };
  }, [formData.currentYearArea, formData.previousYearArea, formData.currentYearYield, formData.previousYearYield]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.cultivatorName.trim()) {
      errors.cultivatorName = 'Cultivator Name is mandatory';
    }
    if (!formData.panchayat) errors.panchayat = 'Panchayat is required';
    if (!formData.crop) errors.crop = 'Crop is required';

    if (!formData.currentYearArea || parseFloat(formData.currentYearArea) <= 0) {
      errors.currentYearArea = 'Enter valid current year area (> 0)';
    }
    if (!formData.previousYearArea || parseFloat(formData.previousYearArea) < 0) {
      errors.previousYearArea = 'Enter valid previous year area (>= 0)';
    }
    if (!formData.currentYearYield || parseFloat(formData.currentYearYield) <= 0) {
      errors.currentYearYield = 'Enter valid current year yield (> 0)';
    }
    if (!formData.previousYearYield || parseFloat(formData.previousYearYield) < 0) {
      errors.previousYearYield = 'Enter valid previous year yield (>= 0)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!formData.cultivatorName.trim()) {
      setFormErrors({ cultivatorName: 'Cultivator Name is mandatory to save draft' });
      return;
    }
    const saved = AdvancedForecastService.saveForecastRecord({ ...formData, cropCategory: activeCropCategory }, true);
    onRecordSaved(saved, 'Draft Saved Successfully');
    onClose();
  };

  const handleFinalSubmit = () => {
    if (!validateForm()) return;

    if (yieldMetrics.isHighAreaVariance && !areaWarningConfirmed && yieldMetrics.isHighYieldVariance && !warningConfirmed) {
      setFormErrors({ warning: 'Please acknowledge both Area and Yield variance warning checks.' });
      return;
    }

    if (yieldMetrics.isHighAreaVariance && !areaWarningConfirmed) {
      setFormErrors({ warning: 'Please acknowledge the area variance warning check.' });
      return;
    }

    if (yieldMetrics.isHighYieldVariance && !warningConfirmed) {
      setFormErrors({ warning: 'Please acknowledge the yield variance warning check.' });
      return;
    }

    const saved = AdvancedForecastService.saveForecastRecord(
      {
        ...formData,
        cropCategory: activeCropCategory,
        status: 'Ready for Submission'
      },
      false
    );
    onRecordSaved(saved, 'Forecast Estimate Record Added Successfully!');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Header */}
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AgricultureIcon sx={{ color: '#38bdf8' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            {formData.id ? `Edit Forecast Estimate (${formData.id})` : `Add Forecast Estimate - ${activeCropConfig.label}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ p: 3, backgroundColor: '#f8fafc' }}>
        <Grid container spacing={2.5}>
          {/* SECTION 1: CULTIVATOR & CROP DETAILS */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
                1. Cultivator &amp; Crop Information
              </Typography>

              <Grid container spacing={2}>
                {/* Cultivator Name (Mandatory) */}
                <Grid item xs={12} sm={8}>
                  <Autocomplete
                    freeSolo
                    options={SAMPLE_CULTIVATORS_AUTOCOMPLETE}
                    value={formData.cultivatorName}
                    onInputChange={(event, newInputValue) => {
                      handleChange('cultivatorName')(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cultivator Name *"
                        placeholder="Enter or search cultivator name..."
                        error={Boolean(formErrors.cultivatorName)}
                        helperText={formErrors.cultivatorName || 'MANDATORY field'}
                        required
                      />
                    )}
                  />
                </Grid>

                {/* Panchayat */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Panchayat *"
                    value={formData.panchayat}
                    onChange={handleChange('panchayat')}
                    error={Boolean(formErrors.panchayat)}
                    helperText={formErrors.panchayat}
                    required
                  >
                    {panchayaths.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Crop Name (Auto-Selected) */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Selected Crop (Auto-Selected)"
                    value={formData.crop}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start"><AgricultureIcon color="primary" /></InputAdornment>
                    }}
                    sx={{ backgroundColor: '#f1f5f9' }}
                  />
                </Grid>

                {/* Crop Variety (High Yielding vs Local) */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Crop Variety *"
                    value={formData.variety}
                    onChange={handleChange('variety')}
                    required
                  >
                    {CROP_VARIETY_OPTIONS.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Season */}
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth label="Season *" value={formData.season} onChange={handleChange('season')} required>
                    {SEASONS_MASTER.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* SECTION 2: CROP YIELD & AREA COMPARATIVE ENTRY */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Crop Yield &amp; Area Comparative Entry ({activeCropConfig.label})
                </Typography>
                <Chip label={`Area: ${activeCropConfig.areaUnit} | Yield: ${activeCropConfig.yieldUnit}`} color="primary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>

              <Grid container spacing={2}>
                {/* Previous Year Area */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`Prev Year Area (${activeCropConfig.areaUnit}) *`}
                    value={formData.previousYearArea}
                    onChange={handleChange('previousYearArea')}
                    error={Boolean(formErrors.previousYearArea)}
                    helperText={formErrors.previousYearArea}
                    InputProps={{ endAdornment: <InputAdornment position="end">Cent</InputAdornment> }}
                    required
                  />
                </Grid>

                {/* Current Year Area */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`Curr Year Area (${activeCropConfig.areaUnit}) *`}
                    value={formData.currentYearArea}
                    onChange={handleChange('currentYearArea')}
                    error={Boolean(formErrors.currentYearArea)}
                    helperText={formErrors.currentYearArea}
                    InputProps={{ endAdornment: <InputAdornment position="end">Cent</InputAdornment> }}
                    required
                  />
                </Grid>

                {/* Previous Year Yield */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`Prev Year Yield (${activeCropConfig.yieldUnit}) *`}
                    value={formData.previousYearYield}
                    onChange={handleChange('previousYearYield')}
                    error={Boolean(formErrors.previousYearYield)}
                    helperText={formErrors.previousYearYield}
                    required
                  />
                </Grid>

                {/* Current Year Yield */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label={`Curr Year Yield (${activeCropConfig.yieldUnit}) *`}
                    value={formData.currentYearYield}
                    onChange={handleChange('currentYearYield')}
                    error={Boolean(formErrors.currentYearYield)}
                    helperText={formErrors.currentYearYield}
                    required
                  />
                </Grid>

                {/* Real-time Dynamic Metrics Summary Panel */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {yieldMetrics.areaPct >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Area Variance
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: yieldMetrics.areaPct >= 0 ? '#16a34a' : '#dc2626' }}>
                              {yieldMetrics.areaPct >= 0 ? `+${yieldMetrics.areaPct}%` : `${yieldMetrics.areaPct}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {yieldMetrics.yieldPct >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Yield Variance
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: yieldMetrics.yieldPct >= 0 ? '#16a34a' : '#dc2626' }}>
                              {yieldMetrics.yieldPct >= 0 ? `+${yieldMetrics.yieldPct}%` : `${yieldMetrics.yieldPct}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>


                    </Grid>
                  </Paper>
                </Grid>

                {/* High Area Variance Warning Alert */}
                {yieldMetrics.isHighAreaVariance && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2.5 }}>
                      <AlertTitle sx={{ fontWeight: 700 }}>Area Validation Warning</AlertTitle>
                      {yieldMetrics.areaPct < 0 ? (
                        <>
                          Current area ({formData.currentYearArea}) is significantly lower than previous year ({formData.previousYearArea}) —{' '}
                          <strong>{yieldMetrics.areaPct}% drop</strong>.
                        </>
                      ) : (
                        <>
                          Current area ({formData.currentYearArea}) is significantly higher than previous year ({formData.previousYearArea}) —{' '}
                          <strong>+{yieldMetrics.areaPct}% jump</strong>.
                        </>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <FormControlLabel
                          control={<Checkbox checked={areaWarningConfirmed} onChange={(e) => setAreaWarningConfirmed(e.target.checked)} color="warning" />}
                          label={<strong>{yieldMetrics.areaPct < 0 ? 'I confirm the decrease in area.' : 'I confirm the increase in area.'}</strong>}
                        />
                      </Box>
                    </Alert>
                  </Grid>
                )}

                {/* High Yield Variance Warning Alert */}
                {yieldMetrics.isHighYieldVariance && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2.5 }}>
                      <AlertTitle sx={{ fontWeight: 700 }}>Yield Validation Warning</AlertTitle>
                      {yieldMetrics.yieldPct < 0 ? (
                        <>
                          Current yield ({formData.currentYearYield}) is significantly lower than previous year ({formData.previousYearYield}) —{' '}
                          <strong>{yieldMetrics.yieldPct}% drop</strong>.
                        </>
                      ) : (
                        <>
                          Current yield ({formData.currentYearYield}) is significantly higher than previous year ({formData.previousYearYield}) —{' '}
                          <strong>+{yieldMetrics.yieldPct}% jump</strong>.
                        </>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <FormControlLabel
                          control={<Checkbox checked={warningConfirmed} onChange={(e) => setWarningConfirmed(e.target.checked)} color="warning" />}
                          label={<strong>{yieldMetrics.yieldPct < 0 ? 'I confirm the decrease in yield.' : 'I confirm the increase in yield.'}</strong>}
                        />
                      </Box>
                    </Alert>
                  </Grid>
                )}

                {formErrors.warning && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ borderRadius: 2.5 }}>
                      {formErrors.warning}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* SECTION 3: FIELD REMARKS */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>
                3. Field Remarks
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Field Collector Remarks (Optional)"
                    placeholder="Irrigation support, fertilizer usage, pest control, or weather conditions..."
                    value={formData.remarks}
                    onChange={handleChange('remarks')}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <Button variant="outlined" color="secondary" startIcon={<SaveIcon />} onClick={handleSaveDraft}>
          Save Draft
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={handleFinalSubmit} startIcon={<CheckCircleIcon />} sx={{ fontWeight: 700, px: 3 }}>
            Add to Forecast List
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddForecastEstimateModal;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  Alert,
  Chip,
  Card,
  CardContent,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CalculateIcon from '@mui/icons-material/Calculate';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SpaIcon from '@mui/icons-material/Spa';
import GrainIcon from '@mui/icons-material/Grain';
import LayersIcon from '@mui/icons-material/Layers';
import OpacityIcon from '@mui/icons-material/Opacity';

import ProductionEstimationService, {
  DISTRICTS_MASTER,
  CROPS_MASTER,
  SEASONS_MASTER,
  FINANCIAL_YEARS,
  ESTIMATION_TYPES
} from '../productionEstimationService';

import GeographyDrillDownSelector from '../components/GeographyDrillDownSelector';
import AreaVsCceComparisonCard from '../components/AreaVsCceComparisonCard';

// Excel Export Helper
const exportToExcelMultiSheet = (filename, dataSheetName, headers, dataRows, metadataRows) => {
  const escapeXml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const metadataXmlRows = metadataRows.map((row) => `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(row[0])}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(row[1])}</Data></Cell>
    </Row>
  `).join('');

  const dataXmlRows = `
    <Row>
      ${headers.map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}
    </Row>
    ${dataRows.map((row) => `
      <Row>
        ${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}
      </Row>
    `).join('')}
  `;

  const excelXML = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Metadata">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Metric</Data></Cell>
    <Cell><Data ss:Type="String">Value</Data></Cell>
   </Row>
   ${metadataXmlRows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="${dataSheetName}">
  <Table>
   ${dataXmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([excelXML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const WORKFLOW_STEPS = [
  'Initiation (Estimator)',
  'Verifier 1',
  'Verifier 2',
  'EARAD Admin',
  'Approver 2',
  'Director Final Approval',
  'Published'
];

const CROP_CATEGORIES_CARDS = [
  {
    id: 'Seasonal Crops',
    title: 'Seasonal Crops',
    desc: 'Paddy & Rice Virippu/Mundakan estimates',
    icon: <SpaIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    crops: ['Paddy']
  },
  {
    id: 'Annual & Perennial Crops',
    title: 'Annual & Perennial Crops',
    desc: 'Coconut, Rubber yearly productivity',
    icon: <GrainIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
    crops: ['Coconut', 'Rubber']
  },
  {
    id: 'Tuber & Horticulture Crops',
    title: 'Tuber & Horticulture Crops',
    desc: 'Banana, Tapioca, & Vegetable stats',
    icon: <LayersIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    crops: ['Banana', 'Tapioca', 'Vegetables']
  },
  {
    id: 'Spices & Cash Crops',
    title: 'Spices & Cash Crops',
    desc: 'Black Pepper & Spices harvest estimates',
    icon: <OpacityIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    crops: ['Pepper']
  }
];

const CreateEstimationView = ({
  editRecord = null,
  onSave,
  onCancel,
  onOpenMarkDefect,
  activeRoleUser = 'Ramesh K. (Production Estimator)'
}) => {
  // Mode Switcher: 'SINGLE_FORM' or 'BATCH_WORKFLOW'
  const [initiationMode, setInitiationMode] = useState(editRecord ? 'SINGLE_FORM' : 'SINGLE_FORM');

  // Single Crop Form State
  const [formData, setFormData] = useState({
    id: '',
    financialYear: '2025-2026',
    season: 'Autumn (Virippu)',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayath: 'Kumbalangi',
    crop: 'Paddy',
    estimationType: 'Final Production Estimate',
    totalCultivatedArea: '1420',
    estimatedArea: '1250',
    cceArea: '1180',
    cceObservationsCount: '32',
    yieldEstimate: '2920',
    prevSeasonProduction: '3420',
    remarks: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Batch Validation State
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedSeason, setSelectedSeason] = useState('Autumn (Virippu)');
  const [selectedCategory, setSelectedCategory] = useState('Seasonal Crops');
  const [selectedCrops, setSelectedCrops] = useState(['Paddy', 'Coconut']);
  const [isValidated, setIsValidated] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [selectedBlocksToInitiate, setSelectedBlocksToInitiate] = useState([]);
  const [initiatedEstimates, setInitiatedEstimates] = useState([]);

  useEffect(() => {
    if (editRecord) {
      setFormData({
        id: editRecord.id || '',
        financialYear: editRecord.financialYear || '2025-2026',
        season: editRecord.season || 'Autumn (Virippu)',
        district: editRecord.district || 'Ernakulam',
        taluk: editRecord.taluk || 'Kanayannur',
        block: editRecord.block || 'Vyttila',
        panchayath: editRecord.panchayath || 'Kumbalangi',
        crop: editRecord.crop || 'Paddy',
        estimationType: editRecord.estimationType || 'Final Production Estimate',
        totalCultivatedArea: String(editRecord.totalCultivatedArea || '0'),
        estimatedArea: String(editRecord.estimatedArea || '0'),
        cceArea: String(editRecord.cceArea || '0'),
        cceObservationsCount: String(editRecord.cceObservationsCount || '0'),
        yieldEstimate: String(editRecord.yieldEstimate || '0'),
        prevSeasonProduction: String(editRecord.prevSeasonProduction || '0'),
        remarks: editRecord.remarks || ''
      });
    }
  }, [editRecord]);

  const activeCropConfig = useMemo(() => {
    return CROPS_MASTER.find((c) => c.id === formData.crop) || CROPS_MASTER[0];
  }, [formData.crop]);

  const calculations = useMemo(() => {
    return ProductionEstimationService.calculateEstimationValues(
      formData.estimatedArea,
      formData.cceArea,
      formData.yieldEstimate,
      formData.crop
    );
  }, [formData.estimatedArea, formData.cceArea, formData.yieldEstimate, formData.crop]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateSingleForm = () => {
    const errs = {};
    if (!formData.district) errs.district = 'District is required.';
    if (!formData.taluk) errs.taluk = 'Taluk is required.';
    if (!formData.block) errs.block = 'Block is required.';
    if (activeCropConfig.level === 'Panchayath' && (!formData.panchayath || formData.panchayath.includes('N/A'))) {
      errs.panchayath = 'Panchayath selection is mandatory for Paddy.';
    }
    if (!formData.estimatedArea || parseFloat(formData.estimatedArea) <= 0) {
      errs.estimatedArea = 'Valid estimated area is required.';
    }
    if (!formData.cceArea || parseFloat(formData.cceArea) <= 0) {
      errs.cceArea = 'Valid CCE area is required.';
    }
    if (!formData.yieldEstimate || parseFloat(formData.yieldEstimate) <= 0) {
      errs.yieldEstimate = 'Valid yield rate is required.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveDraftSingle = () => {
    if (!validateSingleForm()) return;
    const result = ProductionEstimationService.createOrUpdateEstimation(formData, false, activeRoleUser);
    onSave(result);
  };

  const handleSubmitVerificationSingle = () => {
    if (!validateSingleForm()) return;
    const result = ProductionEstimationService.createOrUpdateEstimation(formData, true, activeRoleUser);
    onSave(result);
  };

  // Batch Validation & Initiation Handlers
  const handleCropToggle = (cropId) => {
    setIsValidated(false);
    setInitiatedEstimates([]);
    setSelectedCrops((prev) => (prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]));
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.id);
    setSelectedCrops(cat.crops);
    setIsValidated(false);
    setInitiatedEstimates([]);
  };

  const handleRunValidation = () => {
    const results = ProductionEstimationService.validateCropAvailability(selectedCrops);
    setValidationResults(results);
    setSelectedBlocksToInitiate(results.filter((r) => r.isAvailable).map((r) => `${r.district}-${r.block}-${r.crop}`));
    setIsValidated(true);
    setInitiatedEstimates([]);
  };

  const handleBlockToggle = (key) => {
    setSelectedBlocksToInitiate((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleInitiateEstimation = () => {
    const blocksToProcess = validationResults.filter((r) =>
      selectedBlocksToInitiate.includes(`${r.district}-${r.block}-${r.crop}`)
    );
    if (blocksToProcess.length === 0) return;

    const newRecords = ProductionEstimationService.initiateBatchEstimation({
      selectedCrops,
      selectedBlockItems: blocksToProcess,
      financialYear: selectedYear,
      season: selectedSeason,
      activeUser: activeRoleUser
    });
    setInitiatedEstimates(newRecords);
  };

  const handleForwardToVerifier = (recordId) => {
    ProductionEstimationService.processWorkflowAction({
      estimationId: recordId,
      action: 'FORWARD_TO_VERIFIER_1',
      remarks: 'Validated data clear. Forwarded to Verifier 1.',
      activeRole: 'Production Estimator',
      activeUser: activeRoleUser
    });
    setInitiatedEstimates((prev) =>
      prev.map((e) => (e.id === recordId ? { ...e, status: 'Pending Verifier 1', currentRole: 'Production Estimator Verifier 1' } : e))
    );
  };

  const handleExportExcel = () => {
    const headers = ['Estimation ID', 'District', 'Taluk', 'Block', 'Panchayath', 'Crop', 'Estimated Area (ha)', 'Prev Year Yield', 'Curr Est Yield', 'Est Production', 'Status'];
    const rows = initiatedEstimates.map((e) => [
      e.id,
      e.district,
      e.taluk,
      e.block,
      e.panchayath,
      e.crop,
      String(e.estimatedArea),
      `${e.prevSeasonYield} ${e.yieldUnit}`,
      `${e.yieldEstimate} ${e.yieldUnit}`,
      `${e.estimatedProduction} ${e.productionUnit}`,
      e.status
    ]);
    const metadata = [
      ['Agriculture Year', selectedYear],
      ['Season', selectedSeason],
      ['Exported By', activeRoleUser],
      ['Export Date', new Date().toLocaleString()]
    ];
    exportToExcelMultiSheet(`Production_Estimation_${selectedYear}_${selectedSeason}.xls`, 'InitiatedEstimates', headers, rows, metadata);
  };

  const groupedEstimatesByDistrict = useMemo(() => {
    const map = {};
    initiatedEstimates.forEach((item) => {
      if (!map[item.district]) map[item.district] = [];
      map[item.district].push(item);
    });
    return map;
  }, [initiatedEstimates]);

  return (
    <Box>
      {/* Workflow Stepper Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <Typography variant="caption" fontWeight="bold" sx={{ color: '#64748b', textTransform: 'uppercase', mb: 1, display: 'block' }}>
          Production Estimation Workflow Stage Progress:
        </Typography>
        <Stepper activeStep={0} alternativeLabel>
          {WORKFLOW_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        {/* Header & Mode Selector */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={onCancel} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AgricultureIcon color="primary" /> Create Production Estimation
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Select between manual detailed single-crop form or multi-crop block validation workflow.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={initiationMode}
              exclusive
              onChange={(e, val) => val && setInitiationMode(val)}
              size="small"
              color="primary"
            >
              <ToggleButton value="SINGLE_FORM" sx={{ fontWeight: 'bold', px: 2 }}>
                <EditNoteIcon sx={{ mr: 0.5 }} /> Single Crop Form
              </ToggleButton>
              <ToggleButton value="BATCH_WORKFLOW" sx={{ fontWeight: 'bold', px: 2 }}>
                <FlashOnIcon sx={{ mr: 0.5 }} /> Batch Validation & Multi-Crop
              </ToggleButton>
            </ToggleButtonGroup>

            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Box>

        {/* MODE A: Single Crop Detailed Estimation Form */}
        {initiationMode === 'SINGLE_FORM' && (
          <Box>
            {/* Section 1: Basic Info & Geography */}
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="primary" /> Section 1: Basic Information & Geographic Hierarchy
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Financial Year"
                  value={formData.financialYear}
                  onChange={(e) => handleFormChange('financialYear', e.target.value)}
                >
                  {FINANCIAL_YEARS.map((fy) => (
                    <MenuItem key={fy} value={fy}>{fy}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Season"
                  value={formData.season}
                  onChange={(e) => handleFormChange('season', e.target.value)}
                >
                  {SEASONS_MASTER.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Crop & Category"
                  value={formData.crop}
                  onChange={(e) => handleFormChange('crop', e.target.value)}
                >
                  {CROPS_MASTER.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.label} ({c.level}-Level)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Estimation Type"
                  value={formData.estimationType}
                  onChange={(e) => handleFormChange('estimationType', e.target.value)}
                >
                  {ESTIMATION_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Geography Selector */}
            <GeographyDrillDownSelector
              selectedDistrict={formData.district}
              selectedTaluk={formData.taluk}
              selectedBlock={formData.block}
              selectedPanchayath={formData.panchayath}
              selectedCrop={formData.crop}
              onLocationChange={(loc) => {
                setFormData((prev) => ({
                  ...prev,
                  district: loc.district,
                  taluk: loc.taluk,
                  block: loc.block,
                  panchayath: loc.panchayath
                }));
              }}
            />

            <Divider sx={{ my: 3.5 }} />

            {/* Section 2: Area Estimation vs CCE Area */}
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon color="primary" /> Section 2: Area Estimation & CCE Area Verification
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label={`Total Cultivated Area (${activeCropConfig.areaUnit})`}
                  value={formData.totalCultivatedArea}
                  onChange={(e) => handleFormChange('totalCultivatedArea', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label={`Estimated Area (${activeCropConfig.areaUnit})`}
                  value={formData.estimatedArea}
                  onChange={(e) => handleFormChange('estimatedArea', e.target.value)}
                  error={Boolean(formErrors.estimatedArea)}
                  helperText={formErrors.estimatedArea}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label={`CCE Area (${activeCropConfig.areaUnit})`}
                  value={formData.cceArea}
                  onChange={(e) => handleFormChange('cceArea', e.target.value)}
                  error={Boolean(formErrors.cceArea)}
                  helperText={formErrors.cceArea}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="CCE Observations Count"
                  value={formData.cceObservationsCount}
                  onChange={(e) => handleFormChange('cceObservationsCount', e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Comparison Widget */}
            <Box sx={{ mb: 3.5 }}>
              <AreaVsCceComparisonCard
                estimatedArea={formData.estimatedArea}
                cceArea={formData.cceArea}
                unit={activeCropConfig.areaUnit}
                cceObservationsCount={formData.cceObservationsCount}
              />
            </Box>

            <Divider sx={{ my: 3.5 }} />

            {/* Section 3: Yield & Derived Production */}
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon color="primary" /> Section 3: Yield Rates & Derived Production Computations
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={`Yield Rate (${activeCropConfig.yieldUnit})`}
                  value={formData.yieldEstimate}
                  onChange={(e) => handleFormChange('yieldEstimate', e.target.value)}
                  error={Boolean(formErrors.yieldEstimate)}
                  helperText={formErrors.yieldEstimate || `Standard average: ${activeCropConfig.defaultYield} ${activeCropConfig.yieldUnit}`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label={`Previous Season Production (${calculations.productionUnit})`}
                  value={formData.prevSeasonProduction}
                  onChange={(e) => handleFormChange('prevSeasonProduction', e.target.value)}
                />
              </Grid>

              {/* Derived Output Card */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1.5px solid #16a34a', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalculateIcon fontSize="small" /> DERIVED PRODUCTION [AUTO-CALCULATED]
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#15803d', my: 0.5 }}>
                    {calculations.production.toLocaleString('en-IN')}{' '}
                    <Typography component="span" variant="subtitle2">
                      {calculations.productionUnit}
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#166534' }}>
                    Formula: Area ({formData.estimatedArea}) × Yield ({formData.yieldEstimate})
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Estimator Remarks / Observations"
                  placeholder="Provide field notes regarding rainfall, seed variety, land condition..."
                  value={formData.remarks}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Footer Actions */}
            <Box sx={{ pt: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" color="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="outlined" color="primary" startIcon={<SaveIcon />} onClick={handleSaveDraftSingle}>
                Save Draft
              </Button>
              <Button variant="contained" color="success" startIcon={<SendIcon />} onClick={handleSubmitVerificationSingle}>
                Submit to Verifier 1
              </Button>
            </Box>
          </Box>
        )}

        {/* MODE B: Batch Validation & Multi-Crop Initiation Workflow */}
        {initiationMode === 'BATCH_WORKFLOW' && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0f172a', mb: 1.5 }}>
              Select Crop Estimation Category ({selectedYear}):
            </Typography>

            {/* Category Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {CROP_CATEGORIES_CARDS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Grid item xs={12} sm={6} md={3} key={cat.id}>
                    <Card
                      onClick={() => handleCategorySelect(cat)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 3,
                        background: cat.gradient,
                        color: '#ffffff',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected ? '0 10px 20px rgba(0,0,0,0.25)' : '0 4px 10px rgba(0,0,0,0.1)',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          {cat.icon}
                          {isSelected && <CheckCircleIcon sx={{ color: '#ffffff' }} />}
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff', mb: 0.5 }}>
                          {cat.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.95)', display: 'block' }}>
                          {cat.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Crop Selector & Validate */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, bgcolor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnalyticsIcon color="primary" /> Select Crop(s) for Validation & Initiation
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<VerifiedIcon />}
                  disabled={selectedCrops.length === 0}
                  onClick={handleRunValidation}
                  sx={{ fontWeight: 'bold', px: 3 }}
                >
                  Validate ({selectedCrops.length} Crops Selected)
                </Button>
              </Box>

              <FormGroup row sx={{ gap: 1.5 }}>
                {CROPS_MASTER.map((c) => {
                  const isChecked = selectedCrops.includes(c.id);
                  return (
                    <Card
                      key={c.id}
                      onClick={() => handleCropToggle(c.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: `1.5px solid ${isChecked ? '#0284c7' : '#cbd5e1'}`,
                        bgcolor: isChecked ? '#f0f9ff' : '#ffffff',
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FormControlLabel
                        control={<Checkbox checked={isChecked} onChange={() => handleCropToggle(c.id)} color="primary" size="small" />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ color: isChecked ? '#0369a1' : '#334155' }}>
                              {c.label}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {c.level}-Level
                            </Typography>
                          </Box>
                        }
                        sx={{ m: 0 }}
                      />
                    </Card>
                  );
                })}
              </FormGroup>
            </Paper>

            {/* Validation Table */}
            {isValidated && (
              <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" /> Step 2: Block Availability Validation Table
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803d' }}>
                      Available blocks matching selected crops ({selectedCrops.join(', ')}).
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="success"
                    size="medium"
                    startIcon={<AgricultureIcon />}
                    disabled={selectedBlocksToInitiate.length === 0}
                    onClick={handleInitiateEstimation}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Initiate Estimation for {selectedBlocksToInitiate.length} Selected Block(s)
                  </Button>
                </Box>

                <TableContainer sx={{ bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #cbd5e1' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedBlocksToInitiate.length === validationResults.filter((r) => r.isAvailable).length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBlocksToInitiate(validationResults.filter((r) => r.isAvailable).map((r) => `${r.district}-${r.block}-${r.crop}`));
                              } else {
                                setSelectedBlocksToInitiate([]);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>District</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Taluk</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Block</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Panchayath (Paddy)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Crop</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>CCE Plot Cuts</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Availability Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validationResults.map((row, idx) => {
                        const key = `${row.district}-${row.block}-${row.crop}`;
                        const isChecked = selectedBlocksToInitiate.includes(key);

                        return (
                          <TableRow key={idx} hover sx={{ opacity: row.isAvailable ? 1 : 0.6 }}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isChecked}
                                disabled={!row.isAvailable}
                                onChange={() => handleBlockToggle(key)}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{row.district}</TableCell>
                            <TableCell>{row.taluk}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{row.block}</TableCell>
                            <TableCell>{row.panchayath}</TableCell>
                            <TableCell><Chip label={row.crop} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} /></TableCell>
                            <TableCell>{row.ccePlotsCount} plots</TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                color={row.isAvailable ? 'success' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Hierarchical Drill-Down Results */}
            {initiatedEstimates.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="primary" /> Step 3: Initiated Estimation Results — Hierarchical Drill-Down View
                  </Typography>

                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportExcel}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Export Excel Report
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Hierarchical Drill-Down: District → Taluk → Block (→ Panchayath for Paddy)
                  </Typography>
                  <Typography variant="caption">
                    Review Previous Year Yield vs Current Year Estimated Yield. Click <strong>Defect</strong> if any anomaly is noticed, or <strong>Forward</strong> to send clear data to Verifier 1.
                  </Typography>
                </Alert>

                {Object.keys(groupedEstimatesByDistrict).map((distName) => {
                  const items = groupedEstimatesByDistrict[distName];
                  return (
                    <Accordion key={distName} defaultExpanded sx={{ mb: 2, border: '1px solid #cbd5e1', borderRadius: '8px !important' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc' }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                              📍 District: {distName}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">INITIATED RECORDS</Typography>
                            <Typography variant="body2" fontWeight="bold">{items.length}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="textSecondary">TOTAL ESTIMATED PRODUCTION</Typography>
                            <Typography variant="body2" fontWeight="bold" color="#16a34a">
                              {items.reduce((sum, i) => sum + i.estimatedProduction, 0).toLocaleString('en-IN')} MT / Units
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <TableContainer>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Estimation ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Taluk → Block → Panchayath</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Crop</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estimated Area</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Prev. Year Yield</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0284c7' }}>Curr. Est. Yield</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>Est. Production</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {items.map((est) => (
                                <TableRow key={est.id} hover>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{est.id}</TableCell>
                                  <TableCell>
                                    <Typography variant="body2">{est.taluk} → <strong>{est.block}</strong></Typography>
                                    <Typography variant="caption" color="textSecondary">{est.panchayath}</Typography>
                                  </TableCell>
                                  <TableCell><Chip label={est.crop} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} /></TableCell>
                                  <TableCell align="right">{est.estimatedArea} {est.areaUnit}</TableCell>
                                  <TableCell align="right">{est.prevSeasonYield} {est.yieldUnit}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                                    {est.yieldEstimate} {est.yieldUnit}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                                    {est.estimatedProduction} {est.productionUnit}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={est.status} color={est.status.includes('Pending') ? 'warning' : 'default'} size="small" />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<ReportProblemIcon />}
                                        onClick={() => onOpenMarkDefect(est)}
                                      >
                                        Defect
                                      </Button>
                                      {est.status === 'Draft' && (
                                        <Button
                                          variant="contained"
                                          color="success"
                                          size="small"
                                          startIcon={<SendIcon />}
                                          onClick={() => handleForwardToVerifier(est.id)}
                                        >
                                          Forward
                                        </Button>
                                      )}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CreateEstimationView;

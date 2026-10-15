import React, { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Divider,
  Alert,
  Stack,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TableChartIcon from '@mui/icons-material/TableChart';
import SpaIcon from '@mui/icons-material/Spa';
import GrainIcon from '@mui/icons-material/Grain';
import LayersIcon from '@mui/icons-material/Layers';
import OpacityIcon from '@mui/icons-material/Opacity';

import ProductionEstimationService, {
  CROPS_MASTER,
  FINANCIAL_YEARS,
  SEASONS_MASTER,
  DISTRICTS_MASTER
} from '../productionEstimationService';

const WORKFLOW_STEPS = [
  'Initiation (Estimator)',
  'Verifier 1',
  'Verifier 2',
  'EARAD Admin',
  'Approver 2',
  'Director Final Approval',
  'Published'
];

const CROP_CARDS_MASTER = [
  { id: 'Paddy', label: '🌾 Paddy (Rice)', level: 'Panchayath', category: 'Cereals', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: <SpaIcon sx={{ fontSize: 32 }} /> },
  { id: 'Coconut', label: '🥥 Coconut', level: 'Block', category: 'Plantation', gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', icon: <GrainIcon sx={{ fontSize: 32 }} /> },
  { id: 'Rubber', label: '🪵 Rubber', level: 'Block', category: 'Plantation', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', icon: <LayersIcon sx={{ fontSize: 32 }} /> },
  { id: 'Banana', label: '🍌 Banana (Nendran)', level: 'Block', category: 'Fruits', gradient: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)', icon: <OpacityIcon sx={{ fontSize: 32 }} /> },
  { id: 'Tapioca', label: '🥔 Tapioca', level: 'Block', category: 'Tuber Crops', gradient: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)', icon: <LayersIcon sx={{ fontSize: 32 }} /> },
  { id: 'Pepper', label: '🫑 Black Pepper', level: 'Block', category: 'Spices', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: <GrainIcon sx={{ fontSize: 32 }} /> }
];

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

const PEDashboardView = ({
  estimations = [],
  onSelectEstimation,
  onViewDefects,
  onViewResults,
  activeRole = 'Production Estimator'
}) => {
  // Selected Single Crop (Defaults to Paddy)
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [selectedYear] = useState('2025-2026');
  const [selectedSeason] = useState('Autumn (Virippu)');

  // Availability & Validation state
  const [isValidated, setIsValidated] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [selectedBlocksToInitiate, setSelectedBlocksToInitiate] = useState([]);

  // Initiated / Filtered estimates for selected crop
  const cropEstimations = useMemo(() => {
    return estimations.filter((e) => e.crop === selectedCrop);
  }, [estimations, selectedCrop]);

  const activeCropObj = useMemo(() => {
    return CROP_CARDS_MASTER.find((c) => c.id === selectedCrop) || CROP_CARDS_MASTER[0];
  }, [selectedCrop]);

  // Action 1: Validate Data Availability
  const handleValidateAvailability = () => {
    const results = ProductionEstimationService.validateCropAvailability([selectedCrop]);
    setValidationResults(results);
    setSelectedBlocksToInitiate(results.filter((r) => r.isAvailable).map((r) => `${r.district}-${r.block}-${r.crop}`));
    setIsValidated(true);
  };

  // Action 2: Initiate Data Estimation
  const handleInitiateEstimation = () => {
    const blocksToProcess = validationResults.filter((r) =>
      selectedBlocksToInitiate.includes(`${r.district}-${r.block}-${r.crop}`)
    );

    if (blocksToProcess.length === 0) return;

    ProductionEstimationService.initiateBatchEstimation({
      selectedCrops: [selectedCrop],
      selectedBlockItems: blocksToProcess,
      financialYear: selectedYear,
      season: selectedSeason,
      activeUser: `${activeRole} User`
    });

    setIsValidated(false);
    // Auto-scroll to results
    const resultsEl = document.getElementById('selected-crop-results-dashboard');
    if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Action 3: View Results scroll handler
  const handleScrollToResults = () => {
    const resultsEl = document.getElementById('selected-crop-results-dashboard');
    if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Forward single estimate to Verifier 1
  const handleForwardToVerifier = (recordId) => {
    ProductionEstimationService.processWorkflowAction({
      estimationId: recordId,
      action: 'FORWARD_TO_VERIFIER_1',
      remarks: 'Data validated clear. Forwarded to Verifier 1.',
      activeRole,
      activeUser: `${activeRole} User`
    });
  };

  // Export Results Excel
  const handleExportExcel = () => {
    const headers = ['Estimation ID', 'District', 'Taluk', 'Block', 'Panchayath', 'Crop', 'Estimated Area (ha)', 'Prev Year Yield', 'Curr Est Yield', 'Est Production', 'Status'];
    const rows = cropEstimations.map((e) => [
      e.id,
      e.district,
      e.taluk,
      e.block,
      e.panchayath,
      e.crop,
      String(e.estimatedArea),
      `${e.prevSeasonYield || 0} ${e.yieldUnit}`,
      `${e.yieldEstimate} ${e.yieldUnit}`,
      `${e.estimatedProduction} ${e.productionUnit}`,
      e.status
    ]);
    const metadata = [
      ['Selected Crop', selectedCrop],
      ['Agriculture Year', selectedYear],
      ['Season', selectedSeason],
      ['Export Date', new Date().toLocaleString()]
    ];
    exportToExcelMultiSheet(`Production_Estimation_${selectedCrop}_${selectedYear}.xls`, 'CropResults', headers, rows, metadata);
  };

  // Group estimates by District for hierarchical view
  const groupedByDistrict = useMemo(() => {
    const map = {};
    cropEstimations.forEach((item) => {
      if (!map[item.district]) map[item.district] = [];
      map[item.district].push(item);
    });
    return map;
  }, [cropEstimations]);

  return (
    <Box>
      {/* 1. TOP SECTION — WORKFLOW STAGE STEPPER */}
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

      {/* 2. SECOND SECTION — VALIDATION SESSION & ALL CROPS FILTER TABLE */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon color="primary" /> Validation Session & Crop Selection ({selectedYear} • {selectedSeason})
          </Typography>

          <Chip label={`Active Role: ${activeRole}`} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
        </Box>

        <Typography variant="body2" sx={{ color: '#475569', mb: 2.5 }}>
          Select a crop below to activate its dedicated validation, initiation, and results dashboard.
        </Typography>

        {/* Crop Selection Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {CROP_CARDS_MASTER.map((c) => {
            const isSelected = selectedCrop === c.id;
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={c.id}>
                <Card
                  onClick={() => {
                    setSelectedCrop(c.id);
                    setIsValidated(false);
                  }}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    background: c.gradient,
                    color: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 10px 20px rgba(0,0,0,0.25)' : '0 4px 10px rgba(0,0,0,0.08)',
                    transform: isSelected ? 'scale(1.04)' : 'none',
                    border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      {c.icon}
                      {isSelected && <CheckCircleIcon sx={{ color: '#ffffff' }} />}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffffff', lineHeight: 1.2 }}>
                      {c.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block', mt: 0.5 }}>
                      {c.level}-Level
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* 3. THIRD SECTION — SINGLE CROP INTERACTIVE ACTION CARD */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justify: 'center', color: '#38bdf8' }}>
                <AgricultureIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>
                  {activeCropObj.label} Management
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Category: {activeCropObj.category} • Estimation Level: {activeCropObj.level}-Level
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
              {/* Button 1: Validate Data Availability */}
              <Button
                variant="contained"
                color="info"
                startIcon={<VerifiedIcon />}
                onClick={handleValidateAvailability}
                sx={{ fontWeight: 'bold', py: 1 }}
              >
                Validate Data Availability
              </Button>

              {/* Button 2: Initiate Data Estimation */}
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
                disabled={!isValidated}
                onClick={handleInitiateEstimation}
                sx={{ fontWeight: 'bold', py: 1 }}
              >
                Initiate Data Estimation
              </Button>

              {/* Button 3: View Results */}
              <Button
                variant="outlined"
                sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: '#ffffff' }, fontWeight: 'bold', py: 1 }}
                startIcon={<TableChartIcon />}
                onClick={() => {
                  if (onViewResults) {
                    onViewResults(selectedCrop);
                  } else {
                    handleScrollToResults();
                  }
                }}
              >
                View Results ({cropEstimations.length})
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 4. BLOCK AVAILABILITY VALIDATION TABLE (Rendered upon clicking Validate) */}
      {isValidated && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" /> Block Availability for {selectedCrop} Estimation
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803d' }}>
                Select available blocks and click <strong>Initiate Data Estimation</strong> above.
              </Typography>
            </Box>

            <Chip label={`${validationResults.filter((r) => r.isAvailable).length} Blocks Ready`} color="success" sx={{ fontWeight: 'bold' }} />
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
                          onChange={() => {
                            setSelectedBlocksToInitiate((prev) =>
                              prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.district}</TableCell>
                      <TableCell>{row.taluk}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{row.block}</TableCell>
                      <TableCell>{row.panchayath}</TableCell>
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

      {/* 5. FIFTH SECTION — SELECTED CROP HIERARCHICAL DRILL-DOWN DASHBOARD */}
      <Box id="selected-crop-results-dashboard" sx={{ mt: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" /> {selectedCrop} Hierarchical Results Dashboard
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Drill-down: District → Taluk → Block (→ Panchayath for Paddy). Compares Previous Year Yield vs Current Year Estimated Yield.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={handleExportExcel} sx={{ fontWeight: 'bold' }}>
                Export Excel Report
              </Button>
            </Stack>
          </Box>

          {/* District Accordion Tree */}
          {Object.keys(groupedByDistrict).map((distName) => {
            const items = groupedByDistrict[distName];
            return (
              <Accordion key={distName} defaultExpanded sx={{ mb: 2, border: '1px solid #cbd5e1', borderRadius: '8px !important' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                        📍 District: {distName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary">TOTAL ESTIMATIONS</Typography>
                      <Typography variant="body2" fontWeight="bold">{items.length} records</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="textSecondary">ESTIMATED PRODUCTION</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#16a34a">
                        {items.reduce((sum, i) => sum + (i.estimatedProduction || 0), 0).toLocaleString('en-IN')} {items[0]?.productionUnit || 'MT'}
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
                          <TableCell sx={{ fontWeight: 'bold' }}>Workflow Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((est) => (
                          <TableRow key={est.id} hover>
                            <TableCell
                              sx={{ fontWeight: 'bold', color: '#0284c7', cursor: 'pointer' }}
                              onClick={() => onSelectEstimation(est)}
                            >
                              {est.id}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{est.taluk} → <strong>{est.block}</strong></Typography>
                              <Typography variant="caption" color="textSecondary">{est.panchayath}</Typography>
                            </TableCell>
                            <TableCell><Chip label={est.crop} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} /></TableCell>
                            <TableCell align="right">{est.estimatedArea} {est.areaUnit}</TableCell>
                            <TableCell align="right">{est.prevSeasonYield || 'N/A'} {est.yieldUnit}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                              {est.yieldEstimate} {est.yieldUnit}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                              {est.estimatedProduction} {est.productionUnit}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={est.status}
                                color={est.status === 'Approved — Final' ? 'success' : est.status.includes('Pending') ? 'warning' : 'default'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<ReportProblemIcon />}
                                  onClick={() => onViewDefects(est)}
                                >
                                  + Mark Defect
                                </Button>
                                {est.status === 'Draft' && (
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<SendIcon />}
                                    onClick={() => handleForwardToVerifier(est.id)}
                                  >
                                    Forward to Verifier 1
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

          {cropEstimations.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: '#94a3b8' }}>
              <Typography variant="body1">No initiated estimation results found for {selectedCrop}.</Typography>
              <Typography variant="caption">Click <strong>Validate Data Availability</strong> above to validate and initiate block estimates.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PEDashboardView;

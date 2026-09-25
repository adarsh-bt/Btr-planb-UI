import React, { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ApartmentIcon from '@mui/icons-material/Apartment';
import MapIcon from '@mui/icons-material/Map';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

import ProductionEstimationService, {
  CROPS_MASTER,
  DISTRICTS_MASTER
} from '../productionEstimationService';

// Excel Export Helper (Reference from area-estimation)
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

const ProductionEstimationResultsPage = ({
  selectedCrop = 'Paddy',
  estimations = [],
  defects = [],
  onBackToDashboard,
  onOpenMarkDefect,
  activeRole = 'Production Estimator'
}) => {
  // Navigation level tab: 0: State Summary, 1: District Level, 2: Block Level, 3: Panchayat Level
  const [levelTab, setLevelTab] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Filter crop estimations
  const cropEstimations = useMemo(() => {
    return estimations.filter((e) => e.crop === selectedCrop);
  }, [estimations, selectedCrop]);

  const activeCropObj = useMemo(() => {
    return CROPS_MASTER.find((c) => c.id === selectedCrop) || CROPS_MASTER[0];
  }, [selectedCrop]);

  // Aggregated KPI Metrics
  const metrics = useMemo(() => {
    const totalArea = cropEstimations.reduce((sum, e) => sum + (e.estimatedArea || 0), 0);
    const totalCce = cropEstimations.reduce((sum, e) => sum + (e.cceArea || 0), 0);
    const totalProd = cropEstimations.reduce((sum, e) => sum + (e.estimatedProduction || 0), 0);
    const prevProd = cropEstimations.reduce((sum, e) => sum + (e.prevSeasonProduction || 0), 0);

    const diff = totalProd - prevProd;
    const growthPct = prevProd > 0 ? ((diff / prevProd) * 100).toFixed(2) : '0.00';
    const isGrowth = diff >= 0;

    const cropDefects = defects.filter((d) => d.crop === selectedCrop);

    return {
      recordsCount: cropEstimations.length,
      totalArea,
      totalCce,
      totalProd,
      prevProd,
      growthPct,
      isGrowth,
      unit: activeCropObj.yieldUnit.includes('Nuts') ? 'Thousand Nuts' : 'Metric Tonnes (MT)',
      defectsCount: cropDefects.length
    };
  }, [cropEstimations, selectedCrop, activeCropObj, defects]);

  // District breakdown list
  const districtBreakdown = useMemo(() => {
    return DISTRICTS_MASTER.map((d) => {
      const distEsts = cropEstimations.filter((e) => e.district === d.name);
      const estArea = distEsts.reduce((sum, e) => sum + (e.estimatedArea || 0), 0);
      const cceArea = distEsts.reduce((sum, e) => sum + (e.cceArea || 0), 0);
      const prod = distEsts.reduce((sum, e) => sum + (e.estimatedProduction || 0), 0);

      return {
        districtName: d.name,
        count: distEsts.length,
        estArea,
        cceArea,
        prod,
        estimations: distEsts
      };
    });
  }, [cropEstimations]);

  // Filtered block-level estimations
  const filteredBlockEstimations = useMemo(() => {
    if (selectedDistrict === 'All') return cropEstimations;
    return cropEstimations.filter((e) => e.district === selectedDistrict);
  }, [cropEstimations, selectedDistrict]);

  // Excel Export Handler
  const handleExportExcel = () => {
    const headers = [
      'Estimation ID',
      'District',
      'Taluk',
      'Block',
      'Panchayath',
      'Crop',
      'Estimated Area (ha)',
      'CCE Area (ha)',
      'Prev. Year Yield',
      'Curr. Est. Yield',
      'Estimated Production',
      'Status'
    ];
    const rows = cropEstimations.map((e) => [
      e.id,
      e.district,
      e.taluk,
      e.block,
      e.panchayath,
      e.crop,
      String(e.estimatedArea),
      String(e.cceArea),
      `${e.prevSeasonYield || 0} ${e.yieldUnit}`,
      `${e.yieldEstimate} ${e.yieldUnit}`,
      `${e.estimatedProduction} ${e.productionUnit}`,
      e.status
    ]);
    const metadata = [
      ['Selected Crop', selectedCrop],
      ['Total Records', String(metrics.recordsCount)],
      ['Total Estimated Area', `${metrics.totalArea} ha`],
      ['Total Production', `${metrics.totalProd} ${metrics.unit}`],
      ['Exported By', activeRole],
      ['Export Date', new Date().toLocaleString()]
    ];
    exportToExcelMultiSheet(`Production_Estimation_Results_${selectedCrop}.xls`, 'ResultsData', headers, rows, metadata);
  };

  // Forward single estimation to Verifier 1
  const handleForwardToVerifier = (recordId) => {
    ProductionEstimationService.processWorkflowAction({
      estimationId: recordId,
      action: 'FORWARD_TO_VERIFIER_1',
      remarks: 'Results verified clear. Forwarded to Verifier 1.',
      activeRole,
      activeUser: `${activeRole} User`
    });
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Top Navigation & Action Toolbar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={onBackToDashboard} color="primary" size="medium" sx={{ border: '1px solid #cbd5e1' }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>
                EARAS / Production Estimation / Results / {selectedCrop}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a' }}>
                {activeCropObj.label} Production Estimation Results Page
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="secondary" onClick={onBackToDashboard}>
              ← Back to Dashboard
            </Button>
            <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={handleExportExcel} sx={{ fontWeight: 'bold' }}>
              Export Excel
            </Button>
            <Button variant="outlined" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()} sx={{ fontWeight: 'bold' }}>
              Export PDF / Print
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Top KPI Metrics Cards (Referenced from area-estimation State/District pages) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" fontWeight="bold" sx={{ color: '#0369a1', textTransform: 'uppercase' }}>
                Total Estimated Area
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', mt: 0.5 }}>
                {metrics.totalArea.toLocaleString('en-IN')} <Typography component="span" variant="caption">ha</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" fontWeight="bold" sx={{ color: '#15803d', textTransform: 'uppercase' }}>
                Form 1 CCE Area
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#16a34a', mt: 0.5 }}>
                {metrics.totalCce.toLocaleString('en-IN')} <Typography component="span" variant="caption">ha</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, bgcolor: '#fdf4ff', border: '1px solid #f5d0fe' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" fontWeight="bold" sx={{ color: '#a21caf', textTransform: 'uppercase' }}>
                Est. Production
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#c026d3', mt: 0.5 }}>
                {metrics.totalProd.toLocaleString('en-IN')} <Typography component="span" variant="caption">{metrics.unit}</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, bgcolor: metrics.isGrowth ? '#f0fdf4' : '#fef2f2', border: `1px solid ${metrics.isGrowth ? '#bbf7d0' : '#fca5a5'}` }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" fontWeight="bold" sx={{ color: metrics.isGrowth ? '#15803d' : '#b91c1c', textTransform: 'uppercase' }}>
                Yield Growth Rate
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: metrics.isGrowth ? '#16a34a' : '#dc2626', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {metrics.isGrowth ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {metrics.growthPct}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ borderRadius: 3, bgcolor: '#fff1f2', border: '1px solid #fecdd3' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" fontWeight="bold" sx={{ color: '#be123c', textTransform: 'uppercase' }}>
                Identified Defects
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#e11d48', mt: 0.5 }}>
                {metrics.defectsCount} <Typography component="span" variant="caption">defects</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Level Tabs Bar (Referenced from area-estimation Level Navigation) */}
      <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#ffffff', borderRadius: 2, px: 1 }}>
        <Tabs
          value={levelTab}
          onChange={(e, val) => setLevelTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', py: 1.5 } }}
        >
          <Tab icon={<ApartmentIcon />} iconPosition="start" label="🏢 State Summary Level" />
          <Tab icon={<MapIcon />} iconPosition="start" label="📍 District Level View" />
          <Tab icon={<ViewModuleIcon />} iconPosition="start" label="🧱 Block Level View" />
          {activeCropObj.level === 'Panchayath' && (
            <Tab icon={<HomeWorkIcon />} iconPosition="start" label="🏡 Panchayat Level View (Paddy)" />
          )}
        </Tabs>
      </Paper>

      {/* LEVEL 0: State Summary View */}
      {levelTab === 0 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', mb: 2 }}>
            State-Level Aggregated Summary ({selectedCrop})
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>State</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Districts</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Estimations</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Estimated Area (ha)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total CCE Area (ha)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>Total Est. Production</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>State Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover sx={{ bgcolor: '#f0f9ff' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>Kerala State (All Districts)</TableCell>
                  <TableCell align="right">14 Districts</TableCell>
                  <TableCell align="right">{metrics.recordsCount} records</TableCell>
                  <TableCell align="right">{metrics.totalArea.toLocaleString('en-IN')} ha</TableCell>
                  <TableCell align="right">{metrics.totalCce.toLocaleString('en-IN')} ha</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                    {metrics.totalProd.toLocaleString('en-IN')} {metrics.unit}
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="contained" size="small" onClick={() => setLevelTab(1)}>
                      Drill-Down to Districts
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* LEVEL 1: District Level View */}
      {levelTab === 1 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', mb: 2 }}>
            District-Level Breakdown ({selectedCrop})
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>District Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Records Count</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estimated Area (ha)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>CCE Area (ha)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>Est. Production</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {districtBreakdown.map((row) => (
                  <TableRow key={row.districtName} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{row.districtName}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{row.estArea.toLocaleString('en-IN')} ha</TableCell>
                    <TableCell align="right">{row.cceArea.toLocaleString('en-IN')} ha</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {row.prod.toLocaleString('en-IN')} {metrics.unit}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedDistrict(row.districtName);
                          setLevelTab(2);
                        }}
                      >
                        View Blocks
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* LEVEL 2: Block Level View (Comparing Prev Year Yield vs Curr Est Yield) */}
      {levelTab === 2 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a' }}>
              Block-Level Detailed View — {selectedDistrict === 'All' ? 'All Districts' : selectedDistrict} ({selectedCrop})
            </Typography>

            {selectedDistrict !== 'All' && (
              <Button size="small" variant="outlined" onClick={() => setSelectedDistrict('All')}>
                Reset to All Districts
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estimation ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>District → Block</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Panchayath</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estimated Area</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>CCE Area</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Prev. Year Yield</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0284c7' }}>Curr. Est. Yield</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>Est. Production</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBlockEstimations.map((est) => (
                  <TableRow key={est.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{est.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{est.district}</Typography>
                      <Typography variant="caption" color="textSecondary">{est.block}</Typography>
                    </TableCell>
                    <TableCell>{est.panchayath}</TableCell>
                    <TableCell align="right">{est.estimatedArea} {est.areaUnit}</TableCell>
                    <TableCell align="right">{est.cceArea} {est.areaUnit}</TableCell>
                    <TableCell align="right">{est.prevSeasonYield || 'N/A'} {est.yieldUnit}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                      {est.yieldEstimate} {est.yieldUnit}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {est.estimatedProduction} {est.productionUnit}
                    </TableCell>
                    <TableCell>
                      <Chip label={est.status} color={est.status === 'Approved — Final' ? 'success' : 'warning'} size="small" />
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
        </Paper>
      )}

      {/* LEVEL 3: Panchayat Level View (Paddy) */}
      {levelTab === 3 && activeCropObj.level === 'Panchayath' && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', mb: 2 }}>
            Panchayat-Level Mandatory View ({selectedCrop})
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Panchayath Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Block → Taluk → District</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>CCE Plot Cuts</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estimated Area</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Yield (Kg/ha)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>Production (MT)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cropEstimations.map((est) => (
                  <TableRow key={est.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#16a34a' }}>{est.panchayath}</TableCell>
                    <TableCell>{est.block} → {est.taluk} → {est.district}</TableCell>
                    <TableCell align="right">{est.cceObservationsCount} plots</TableCell>
                    <TableCell align="right">{est.estimatedArea} ha</TableCell>
                    <TableCell align="right">{est.yieldEstimate} Kg/ha</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {est.estimatedProduction} MT
                    </TableCell>
                    <TableCell>
                      <Chip label={est.status} color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ProductionEstimationResultsPage;

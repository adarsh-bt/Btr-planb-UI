import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useParams, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FlagIcon from '@mui/icons-material/Flag';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import areaEstimationService from './areaEstimationService';

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

  const metadataXmlRows = metadataRows.map(row => `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(row[0])}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(row[1])}</Data></Cell>
    </Row>
  `).join('');

  const dataXmlRows = `
    <Row>
      ${headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}
    </Row>
    ${dataRows.map(row => `
      <Row>
        ${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}
      </Row>
    `).join('')}
  `;

  const excelXML = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
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

const PANCHAYATS_DATA = [
  { id: 1001, name: 'Panchayat A', taluk: 'Taluk X', estimatedArea: 320, recordCount: 1 },
  { id: 1002, name: 'Panchayat B', taluk: 'Taluk X', estimatedArea: 380, recordCount: 2 },
  { id: 1003, name: 'Panchayat C', taluk: 'Taluk Y', estimatedArea: 250, recordCount: 1 }
];

const BlockAreaEstimation = () => {
  const { districtId, blockId } = useParams();
  const location = useLocation();

  // Selected filters locked to dashboard selection
  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Land Utilization';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = '2026';
  const geoLevel = 'Block';
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamically resolve pivot categories based on type
  const categories = estType === 'Seasonal Crops'
    ? ['Paddy', 'Wheat']
    : estType === 'Land Utilization'
      ? ['Forest', 'Barren Land', 'Net Area Sown', 'Culturable Waste']
      : estType === 'Irrigation'
        ? ['Canals', 'Wells', 'Tanks', 'Other Sources']
        : ['Coconut', 'Rubber', 'Arecanut', 'Pepper'];

  const isCropType = estType === 'Seasonal Crops' || estType === 'Annual & Perennial Crops';
  
  const [landType, setLandType] = useState('Total');
  const [selectedCrop, setSelectedCrop] = useState(categories[0] || '');

  // Problem Reporting states
  const [openProblemDialog, setOpenProblemDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (categories && categories.length > 0) {
      setSelectedCrop(categories[0]);
    }
  }, [estType]);

  // Helper to resolve area based on land type
  const getArea = (row, category, type) => {
    const baseArea = row.cropAreas[category] || 0;
    if (type === 'Wet') {
      return Math.round(baseArea * 0.45);
    } else if (type === 'Dry') {
      return baseArea - Math.round(baseArea * 0.45);
    }
    return baseArea; // 'Total'
  };

  const getPrevYearArea = (row, category, type) => {
    const baseArea = row.prevYearCropAreas[category] || 0;
    if (type === 'Wet') {
      return Math.round(baseArea * 0.45);
    } else if (type === 'Dry') {
      return baseArea - Math.round(baseArea * 0.45);
    }
    return baseArea; // 'Total'
  };

  // Dynamically calculate crop areas for each panchayat
  const rowData = PANCHAYATS_DATA.map(row => {
    const cropAreas = {};
    const prevYearCropAreas = {};
    categories.forEach(cat => {
      let hash = 0;
      for (let i = 0; i < cat.length; i++) {
        hash = cat.charCodeAt(i) + ((hash << 5) - hash);
      }
      const factor = 0.15 + ((Math.abs(hash % 10) + row.id) % 8) / 12;
      cropAreas[cat] = Math.round(row.estimatedArea * factor);
      prevYearCropAreas[cat] = Math.round(row.estimatedArea * factor * (0.8 + ((row.id % 4) / 10)));
    });
    const totalArea = Object.values(cropAreas).reduce((a, b) => a + b, 0);
    const prevYearTotalArea = Object.values(prevYearCropAreas).reduce((a, b) => a + b, 0);
    return {
      ...row,
      cropAreas,
      prevYearCropAreas,
      totalArea,
      prevYearTotalArea
    };
  });

  // Calculate column totals based on land type filter
  const colTotals = {};
  const prevColTotals = {};
  categories.forEach(cat => {
    colTotals[cat] = rowData.reduce((sum, r) => sum + getArea(r, cat, landType), 0);
    prevColTotals[cat] = rowData.reduce((sum, r) => sum + getPrevYearArea(r, cat, landType), 0);
  });
  const grandTotal = Object.values(colTotals).reduce((a, b) => a + b, 0);
  const prevGrandTotal = Object.values(prevColTotals).reduce((a, b) => a + b, 0);

  // Total across selected crop
  const totalCropTotalArea = rowData.reduce((sum, r) => sum + getArea(r, selectedCrop, landType), 0);
  const prevTotalCropTotalArea = rowData.reduce((sum, r) => sum + getPrevYearArea(r, selectedCrop, landType), 0);
  const totalCropIrrigated = rowData.reduce((sum, r) => sum + Math.round(getArea(r, selectedCrop, landType) * 0.6), 0);
  const totalCropUnirrigated = totalCropTotalArea - totalCropIrrigated;

  const handleOpenProblemDialog = (row) => {
    setSelectedRow(row);
    setOpenProblemDialog(true);
    setProblemDescription('');
    setSeverity('Medium');
  };

  const handleCloseProblemDialog = () => {
    setOpenProblemDialog(false);
  };

  const handleSubmitProblem = async () => {
    try {
      await areaEstimationService.apiFlagDiscrepancy({
        blockId,
        panchayatName: selectedRow.name,
        crop: selectedCrop,
        description: problemDescription,
        severity
      });
    } catch (err) {
      console.warn('API discrepancy report failed, falling back to mock:', err);
    }

    const issues = JSON.parse(localStorage.getItem('earas_reported_problems') || '[]');
    const newIssue = {
      id: Date.now(),
      level: 'Block',
      districtId,
      blockId,
      taluk: selectedRow.taluk,
      panchayatName: selectedRow.name,
      crop: selectedCrop,
      description: problemDescription,
      severity,
      status: 'Pending',
      date: new Date().toLocaleString()
    };
    issues.push(newIssue);
    localStorage.setItem('earas_reported_problems', JSON.stringify(issues));

    setSnackbarMessage(`Problem flagged for ${selectedRow.name} successfully!`);
    setSnackbarOpen(true);
    setOpenProblemDialog(false);
  };

  const handleExportExcel = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Block_${blockId}_Area_Estimation_${year}_${season}_${dateStr}_${timeStr}.xls`;

    let headers, dataRows;
    if (isCropType) {
      headers = [
        'Panchayat Name',
        'Taluk',
        'Irrigated Area - Previous Year',
        'Irrigated Area - Current Year',
        'Unirrigated Area - Previous Year',
        'Unirrigated Area - Current Year',
        'Total Area - Previous Year',
        'Total Area - Current Year',
        'YoY Variance %'
      ];
      dataRows = rowData.map(p => {
        const area = getArea(p, selectedCrop, landType);
        const prevArea = getPrevYearArea(p, selectedCrop, landType);
        const yoy = prevArea > 0 ? (((area - prevArea) / prevArea) * 100).toFixed(2) : '0.00';
        const irr = Math.round(area * 0.6);
        const prevIrr = Math.round(prevArea * 0.6);
        const unirr = area - irr;
        const prevUnirr = prevArea - prevIrr;
        return [p.name, p.taluk, prevIrr, irr, prevUnirr, unirr, prevArea, area, `${yoy}%`];
      });
    } else {
      headers = [
        'Panchayat Name',
        'Taluk',
        ...categories.flatMap(cat => [`${cat} - Previous Year`, `${cat} - Current Year`]),
        'Total Area - Previous Year',
        'Total Area - Current Year',
        'YoY Variance %'
      ];
      dataRows = rowData.map(p => {
        const totalArea = categories.reduce((sum, cat) => sum + getArea(p, cat, landType), 0);
        const prevTotalArea = categories.reduce((sum, cat) => sum + getPrevYearArea(p, cat, landType), 0);
        const yoy = prevTotalArea > 0 ? (((totalArea - prevTotalArea) / prevTotalArea) * 100).toFixed(2) : '0.00';
        return [
          p.name,
          p.taluk,
          ...categories.flatMap(cat => {
            const area = getArea(p, cat, landType);
            const prevArea = getPrevYearArea(p, cat, landType);
            return [prevArea, area];
          }),
          prevTotalArea,
          totalArea,
          `${yoy}%`
        ];
      });
    }

    const metadataRows = [
      ['Report Name', 'Block Level Area Estimation'],
      ['District ID', districtId],
      ['Block ID', blockId],
      ['Estimation Type', estType],
      ['Land Type Filter', landType],
      ...(isCropType ? [['Selected Crop', selectedCrop]] : []),
      ['Year', year],
      ['Season', season],
      ['Download Date & Time', now.toLocaleString('en-IN')]
    ];

    exportToExcelMultiSheet(filename, 'Block Estimation', headers, dataRows, metadataRows);
  };

  const filteredRowData = rowData.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.taluk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Block Level Area Estimation (Block ID: {blockId}) ({estType} {estType === 'Seasonal Crops' ? `- ${season}` : ''})
        </Typography>
        <Stack direction="row" spacing={1.5} className="no-print">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ borderRadius: 2 }}
          >
            Export Excel
          </Button>
        </Stack>
      </Grid>

      {/* Summary Stats */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {isCropType ? (
            <>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Total {selectedCrop} Estimated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>{totalCropTotalArea.toLocaleString()} Ha</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Sum of all panchayats ({landType})</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#1b5e20', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Irrigated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>{totalCropIrrigated.toLocaleString()} Ha</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>60% of estimated area</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#e65100', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Unirrigated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>{totalCropUnirrigated.toLocaleString()} Ha</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>40% of estimated area</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Total Block Estimated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>{grandTotal.toLocaleString()} Ha</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Sum of all panchayats ({landType})</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: '#2e7d32', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Total Panchayats</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>{PANCHAYATS_DATA.length}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Reporting panchayats</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      {/* Table */}
      <Grid item xs={12}>
        <MainCard
          title="Panchayat-wise Category Area Contribution"
          secondary={
            <Stack direction="row" spacing={2} className="no-print" alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Land Type</InputLabel>
                <Select
                  value={landType}
                  label="Land Type"
                  onChange={(e) => setLandType(e.target.value)}
                >
                  <MenuItem value="Total">Total</MenuItem>
                  <MenuItem value="Wet">Wet Land</MenuItem>
                  <MenuItem value="Dry">Dry Land</MenuItem>
                </Select>
              </FormControl>

              {isCropType && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Crop</InputLabel>
                  <Select
                    value={selectedCrop}
                    label="Crop"
                    onChange={(e) => setSelectedCrop(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                placeholder="Search panchayat/taluk..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 200 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                }}
              />
            </Stack>
          }
          sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#04255e' }}>
                {isCropType ? (
                  <>
                    <TableRow>
                      <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>Panchayat Name</TableCell>
                      <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>Taluk</TableCell>
                      <TableCell colSpan={2} align="center" sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Irrigated Area (Ha)</TableCell>
                      <TableCell colSpan={2} align="center" sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Unirrigated Area (Ha)</TableCell>
                      <TableCell colSpan={2} align="center" sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Total Area (Ha)</TableCell>
                      <TableCell rowSpan={2} align="right" sx={{ color: 'white', fontWeight: 600 }}>YoY Variance</TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ color: 'white', fontWeight: 600 }} className="no-print">Action</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Previous Year</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem' }}>Current Year</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Previous Year</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem' }}>Current Year</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Previous Year</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem' }}>Current Year</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <>
                    <TableRow>
                      <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>Panchayat Name</TableCell>
                      <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>Taluk</TableCell>
                      {categories.map(cat => (
                        <TableCell key={cat} colSpan={2} align="center" sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                          {cat}
                        </TableCell>
                      ))}
                      <TableCell colSpan={2} align="center" sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        Total Area (Ha)
                      </TableCell>
                      <TableCell rowSpan={2} align="right" sx={{ color: 'white', fontWeight: 600 }}>
                        YoY Variance
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ color: 'white', fontWeight: 600 }} className="no-print">
                        Action
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {categories.map(cat => (
                        <React.Fragment key={cat}>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                            Previous Year
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem' }}>
                            Current Year
                          </TableCell>
                        </React.Fragment>
                      ))}
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        Previous Year
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 500, fontSize: '0.8rem' }}>
                        Current Year
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableHead>
              <TableBody>
                {filteredRowData.length > 0 ? (
                  filteredRowData.map((row) => {
                    if (isCropType) {
                      const area = getArea(row, selectedCrop, landType);
                      const prevArea = getPrevYearArea(row, selectedCrop, landType);
                      const yoy = prevArea > 0 ? (((area - prevArea) / prevArea) * 100).toFixed(1) : '0.0';
                      const yoyColor = (area - prevArea) >= 0 ? 'success.main' : 'error.main';
                      const irr = Math.round(area * 0.6);
                      const prevIrr = Math.round(prevArea * 0.6);
                      const unirr = area - irr;
                      const prevUnirr = prevArea - prevIrr;
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                              <Typography fontWeight={500}>{row.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{row.taluk}</TableCell>
                          <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>{prevIrr.toLocaleString()}</TableCell>
                          <TableCell align="right">{irr.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>{prevUnirr.toLocaleString()}</TableCell>
                          <TableCell align="right">{unirr.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>{prevArea.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{area.toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ color: yoyColor, fontWeight: 500 }}>
                            {(area - prevArea) > 0 ? '+' : ''}{yoy}%
                          </TableCell>
                          <TableCell align="center" className="no-print">
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<FlagIcon />}
                              onClick={() => handleOpenProblemDialog(row)}
                              sx={{ borderRadius: 2 }}
                            >
                              Mark Problem
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    } else {
                      const rowTotal = categories.reduce((sum, cat) => sum + getArea(row, cat, landType), 0);
                      const prevRowTotal = categories.reduce((sum, cat) => sum + getPrevYearArea(row, cat, landType), 0);
                      const yoy = prevRowTotal > 0 ? (((rowTotal - prevRowTotal) / prevRowTotal) * 100).toFixed(1) : '0.0';
                      const yoyColor = (rowTotal - prevRowTotal) >= 0 ? 'success.main' : 'error.main';
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                              <Typography fontWeight={500}>{row.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{row.taluk}</TableCell>
                          {categories.map(cat => {
                            const area = getArea(row, cat, landType);
                            const prevArea = getPrevYearArea(row, cat, landType);
                            return (
                              <React.Fragment key={cat}>
                                <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                                  {prevArea.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {area.toLocaleString()}
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                          <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                            {prevRowTotal.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {rowTotal.toLocaleString()}
                          </TableCell>
                          <TableCell align="right" sx={{ color: yoyColor, fontWeight: 500 }}>
                            {(rowTotal - prevRowTotal) > 0 ? '+' : ''}{yoy}%
                          </TableCell>
                          <TableCell align="center" className="no-print">
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<FlagIcon />}
                              onClick={() => handleOpenProblemDialog(row)}
                              sx={{ borderRadius: 2 }}
                            >
                              Mark Problem
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={isCropType ? 7 : categories.length * 2 + 4} align="center" sx={{ py: 3 }}>
                      No panchayats found.
                    </TableCell>
                  </TableRow>
                )}
                {/* Column Totals Row */}
                {filteredRowData.length > 0 && (
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total Block Area</TableCell>
                    {isCropType ? (
                      <>
                        <TableCell align="right" sx={{ fontWeight: 'bold', borderLeft: '1px solid rgba(0,0,0,0.04)', color: 'text.secondary' }}>
                          {Math.round(prevTotalCropTotalArea * 0.6).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {totalCropIrrigated.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', borderLeft: '1px solid rgba(0,0,0,0.04)', color: 'text.secondary' }}>
                          {(prevTotalCropTotalArea - Math.round(prevTotalCropTotalArea * 0.6)).toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {totalCropUnirrigated.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', borderLeft: '1px solid rgba(0,0,0,0.04)', color: 'text.secondary' }}>
                          {prevTotalCropTotalArea.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {totalCropTotalArea.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: (totalCropTotalArea - prevTotalCropTotalArea) >= 0 ? 'success.main' : 'error.main' }}>
                          {(totalCropTotalArea - prevTotalCropTotalArea) > 0 ? '+' : ''}{prevTotalCropTotalArea > 0 ? (((totalCropTotalArea - prevTotalCropTotalArea) / prevTotalCropTotalArea) * 100).toFixed(1) : '0.0'}%
                        </TableCell>
                      </>
                    ) : (
                      <>
                        {categories.map(cat => (
                          <React.Fragment key={cat}>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                              {prevColTotals[cat].toLocaleString()}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {colTotals[cat].toLocaleString()}
                            </TableCell>
                          </React.Fragment>
                        ))}
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                          {prevGrandTotal.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {grandTotal.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: (grandTotal - prevGrandTotal) >= 0 ? 'success.main' : 'error.main' }}>
                          {(grandTotal - prevGrandTotal) > 0 ? '+' : ''}{prevGrandTotal > 0 ? (((grandTotal - prevGrandTotal) / prevGrandTotal) * 100).toFixed(1) : '0.0'}%
                        </TableCell>
                      </>
                    )}
                    <TableCell className="no-print" />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      {/* Flag Problem Dialog */}
      <Dialog open={openProblemDialog} onClose={handleCloseProblemDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#b26a00' }}>Flag Estimation Discrepancy</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Report values discrepancy or issues observed for {selectedRow?.name}. This flags the record for audit review.
          </DialogContentText>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small" disabled={isCropType}>
              <InputLabel>Category / Crop</InputLabel>
              <Select
                value={selectedCrop}
                label="Category / Crop"
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Discrepancy Severity</InputLabel>
              <Select
                value={severity}
                label="Discrepancy Severity"
                onChange={(e) => setSeverity(e.target.value)}
              >
                <MenuItem value="Low">Low (Minor typo)</MenuItem>
                <MenuItem value="Medium">Medium (Unreasonable area contribution)</MenuItem>
                <MenuItem value="High">High (Erroneous data entry)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Discrepancy Details / Comments"
              multiline
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              fullWidth
              placeholder="Describe the discrepancy in detail..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProblemDialog}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleSubmitProblem} disabled={!problemDescription.trim()}>
            Report Discrepancy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default BlockAreaEstimation;

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
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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

const DISTRICTS_DATA = [
  { id: 1, name: 'Thiruvananthapuram', estimatedArea: 2700, recordCount: 15 },
  { id: 2, name: 'Kollam', estimatedArea: 2400, recordCount: 12 },
  { id: 3, name: 'Pathanamthitta', estimatedArea: 1750, recordCount: 9 },
  { id: 4, name: 'Alappuzha', estimatedArea: 2400, recordCount: 10 },
  { id: 5, name: 'Kottayam', estimatedArea: 2350, recordCount: 11 },
  { id: 6, name: 'Idukki', estimatedArea: 2600, recordCount: 14 },
  { id: 7, name: 'Ernakulam', estimatedArea: 3000, recordCount: 16 },
  { id: 8, name: 'Thrissur', estimatedArea: 3100, recordCount: 15 },
  { id: 9, name: 'Palakkad', estimatedArea: 3800, recordCount: 18 },
  { id: 10, name: 'Malappuram', estimatedArea: 3400, recordCount: 17 },
  { id: 11, name: 'Kozhikode', estimatedArea: 2800, recordCount: 13 },
  { id: 12, name: 'Wayanad', estimatedArea: 2250, recordCount: 8 },
  { id: 13, name: 'Kannur', estimatedArea: 2600, recordCount: 12 },
  { id: 14, name: 'Kasaragod', estimatedArea: 2150, recordCount: 10 }
];

const SeasonalStateAreaEstimation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const estType = 'Seasonal Crops';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = '2026';

  const categories = ['Paddy', 'Wheat'];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(categories[0]);
  const [landType, setLandType] = useState('Total');

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

  // Dynamically calculate crop areas for each district
  const rowData = DISTRICTS_DATA.map(row => {
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

  // Calculate filtered area totals
  const totalCropTotalArea = rowData.reduce((sum, r) => sum + getArea(r, selectedCrop, landType), 0);
  const prevTotalCropTotalArea = rowData.reduce((sum, r) => sum + getPrevYearArea(r, selectedCrop, landType), 0);
  const totalCropIrrigated = rowData.reduce((sum, r) => sum + Math.round(getArea(r, selectedCrop, landType) * 0.6), 0);
  const totalCropUnirrigated = totalCropTotalArea - totalCropIrrigated;

  const handleViewDetails = (districtId) => {
    navigate(`/schemes/earas/area-estimation/seasonal/${districtId}`, { state: { estType, season } });
  };

  const handleExportExcel = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Seasonal_State_Area_Estimation_${year}_${season}_${dateStr}_${timeStr}.xls`;

    const headers = [
      'District Name',
      'Irrigated Area - Previous Year',
      'Irrigated Area - Current Year',
      'Unirrigated Area - Previous Year',
      'Unirrigated Area - Current Year',
      'Total Area - Previous Year',
      'Total Area - Current Year',
      'YoY Variance %'
    ];

    const dataRows = rowData.map(d => {
      const area = getArea(d, selectedCrop, landType);
      const prevArea = getPrevYearArea(d, selectedCrop, landType);
      const yoy = prevArea > 0 ? (((area - prevArea) / prevArea) * 100).toFixed(2) : '0.00';
      const irr = Math.round(area * 0.6);
      const prevIrr = Math.round(prevArea * 0.6);
      const unirr = area - irr;
      const prevUnirr = prevArea - prevIrr;
      return [d.name, prevIrr, irr, prevUnirr, unirr, prevArea, area, `${yoy}%`];
    });

    const metadataRows = [
      ['Report Name', 'Seasonal State Level Area Estimation'],
      ['Estimation Type', estType],
      ['Land Type Filter', landType],
      ['Selected Crop', selectedCrop],
      ['Year', year],
      ['Season', season],
      ['Download Date & Time', now.toLocaleString('en-IN')]
    ];

    exportToExcelMultiSheet(filename, 'State Seasonal Estimation', headers, dataRows, metadataRows);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const filteredRowData = rowData.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Grid container spacing={3} className="printable-area">
      <Breadcrumb />
      
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Seasonal Crop Estimation - Kerala State ({season} Season)
        </Typography>
        <Stack direction="row" spacing={1.5} className="no-print">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/schemes/earas/area-estimation/seasonal/custom-report')}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Custom Reports
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ borderRadius: 2 }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
            sx={{ borderRadius: 2, bgcolor: '#04255e' }}
          >
            Export PDF
          </Button>
        </Stack>
      </Grid>

      {/* State Level Summary Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>Total {selectedCrop} Estimated Area</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>{totalCropTotalArea.toLocaleString()} Ha</Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Sum of all districts ({landType})</Typography>
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
        </Grid>
      </Grid>

      {/* District-wise Drill-Down Summary */}
      <Grid item xs={12}>
        <MainCard
          title="District-wise Crop Area Contribution"
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

              <TextField
                placeholder="Search district..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 180 }}
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
                <TableRow>
                  <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>District Name</TableCell>
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
              </TableHead>
              <TableBody>
                {filteredRowData.length > 0 ? (
                  filteredRowData.map((row) => {
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
                          <Tooltip title="Drill down to Districts Blocks">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewDetails(row.id)}
                              sx={{ '&:hover': { bgcolor: 'rgba(4, 37, 94, 0.1)' } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
                {/* Column Totals Row */}
                {filteredRowData.length > 0 && (
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total State Area</TableCell>
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
                    <TableCell className="no-print" />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default SeasonalStateAreaEstimation;

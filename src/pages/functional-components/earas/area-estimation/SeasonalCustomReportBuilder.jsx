import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Breadcrumbs,
  Link
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

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

const MOCK_RAW_ESTIMATIONS = [
  { district: 'Thiruvananthapuram', block: 'Neyyattinkara', panchayat: 'Athiyannur', season: 'Autumn', crop: 'Paddy', area: 120 },
  { district: 'Thiruvananthapuram', block: 'Neyyattinkara', panchayat: 'Athiyannur', season: 'Autumn', crop: 'Wheat', area: 50 },
  { district: 'Thiruvananthapuram', block: 'Neyyattinkara', panchayat: 'Kanjiramkulam', season: 'Winter', crop: 'Paddy', area: 140 },
  { district: 'Thiruvananthapuram', block: 'Trivandrum', panchayat: 'Vattiyoorkavu', season: 'Summer', crop: 'Paddy', area: 90 },
  { district: 'Kollam', block: 'Kollam', panchayat: 'Thrikadavoor', season: 'Autumn', crop: 'Paddy', area: 180 },
  { district: 'Kollam', block: 'Kollam', panchayat: 'Thrikadavoor', season: 'Winter', crop: 'Wheat', area: 110 },
  { district: 'Kollam', block: 'Kottarakkara', panchayat: 'Mylom', season: 'Summer', crop: 'Paddy', area: 210 },
  { district: 'Kollam', block: 'Karunagappally', panchayat: 'Clappana', season: 'Autumn', crop: 'Wheat', area: 85 },
  { district: 'Alappuzha', block: 'Cherthala', panchayat: 'Pattanakkad', season: 'Autumn', crop: 'Paddy', area: 310 },
  { district: 'Alappuzha', block: 'Cherthala', panchayat: 'Pattanakkad', season: 'Winter', crop: 'Wheat', area: 150 },
  { district: 'Alappuzha', block: 'Karthikappally', panchayat: 'Haripad', season: 'Summer', crop: 'Paddy', area: 220 }
];

const GEOGRAPHY_MAPPING = {
  Thiruvananthapuram: {
    Neyyattinkara: ['Athiyannur', 'Kanjiramkulam'],
    Trivandrum: ['Vattiyoorkavu']
  },
  Kollam: {
    Kollam: ['Thrikadavoor'],
    Kottarakkara: ['Mylom'],
    Karunagappally: ['Clappana']
  },
  Alappuzha: {
    Cherthala: ['Pattanakkad'],
    Karthikappally: ['Haripad']
  }
};

const SeasonalCustomReportBuilder = () => {
  const navigate = useNavigate();

  // Selection states
  const [selectedCrops, setSelectedCrops] = useState(['Paddy', 'Wheat']);
  const [selectedSeasons, setSelectedSeasons] = useState(['Autumn', 'Winter', 'Summer']);

  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedPanchayat, setSelectedPanchayat] = useState('All');

  // Dimension checkboxes
  const [groupBy, setGroupBy] = useState({
    district: true,
    block: false,
    panchayat: false,
    season: false,
    crop: true
  });

  const handleCropToggle = (crop) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const handleSeasonToggle = (season) => {
    setSelectedSeasons(prev =>
      prev.includes(season) ? prev.filter(s => s !== season) : [...prev, season]
    );
  };

  const handleGroupByChange = (field) => {
    setGroupBy(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Generate Report Data dynamically
  const generateReportData = () => {
    let filtered = MOCK_RAW_ESTIMATIONS.filter(item => {
      if (!selectedCrops.includes(item.crop)) return false;
      if (!selectedSeasons.includes(item.season)) return false;
      if (selectedDistrict !== 'All' && item.district !== selectedDistrict) return false;
      if (selectedBlock !== 'All' && item.block !== selectedBlock) return false;
      if (selectedPanchayat !== 'All' && item.panchayat !== selectedPanchayat) return false;
      return true;
    });

    const activeDimensions = Object.keys(groupBy).filter(k => groupBy[k]);
    if (activeDimensions.length === 0) return [];

    const aggregations = {};
    filtered.forEach(item => {
      const keyObj = {};
      activeDimensions.forEach(dim => {
        keyObj[dim] = item[dim];
      });
      const keyStr = JSON.stringify(keyObj);
      if (!aggregations[keyStr]) {
        aggregations[keyStr] = { ...keyObj, area: 0 };
      }
      aggregations[keyStr].area += item.area;
    });

    return Object.values(aggregations);
  };

  const reportData = generateReportData();
  const totalReportArea = reportData.reduce((sum, r) => sum + r.area, 0);

  const activeDimensions = Object.keys(groupBy).filter(k => groupBy[k]);

  const handleExportExcel = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Custom_Seasonal_Estimation_Report_${dateStr}_${timeStr}.xls`;

    const headers = [
      ...activeDimensions.map(dim => dim.charAt(0).toUpperCase() + dim.slice(1)),
      'Estimated Area (Ha)',
      'Contribution %'
    ];

    const dataRows = reportData.map(row => [
      ...activeDimensions.map(dim => row[dim]),
      row.area,
      totalReportArea > 0 ? ((row.area / totalReportArea) * 100).toFixed(2) : '0.00'
    ]);

    const metadataRows = [
      ['Report Name', 'Custom Seasonal Crop Estimation Report'],
      ['Selected Crops', selectedCrops.join(', ')],
      ['Selected Seasons', selectedSeasons.join(', ')],
      ['District Filter', selectedDistrict],
      ['Block Filter', selectedBlock],
      ['Panchayat Filter', selectedPanchayat],
      ['Group Dimensions', activeDimensions.join(', ')],
      ['Download Date & Time', now.toLocaleString('en-IN')]
    ];

    exportToExcelMultiSheet(filename, 'Custom Report', headers, dataRows, metadataRows);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" onClick={() => navigate('/schemes/earas/area-estimation')} sx={{ cursor: 'pointer' }}>
            Dashboard
          </Link>
          <Link color="inherit" onClick={() => navigate('/schemes/earas/area-estimation/seasonal-results')} sx={{ cursor: 'pointer' }}>
            Seasonal Results
          </Link>
          <Typography color="textPrimary">Custom Report Builder</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Seasonal Crops - Custom Report Builder
        </Typography>
        {reportData.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ borderRadius: 2, bgcolor: '#04255e' }}
          >
            Export Custom Excel
          </Button>
        )}
      </Grid>

      {/* Configuration Panel */}
      <Grid item xs={12} md={4}>
        <MainCard title="Report Settings" sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
          <Stack spacing={3}>
            {/* Step 1: Select Crops */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#04255e' }}>
                1. Select Crops
              </Typography>
              <FormGroup row>
                {['Paddy', 'Wheat', 'Ragi', 'Tapioca'].map(crop => (
                  <FormControlLabel
                    key={crop}
                    control={
                      <Checkbox
                        checked={selectedCrops.includes(crop)}
                        onChange={() => handleCropToggle(crop)}
                        color="primary"
                      />
                    }
                    label={crop}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider />

            {/* Step 2: Select Seasons */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#04255e' }}>
                2. Select Seasons
              </Typography>
              <FormGroup row>
                {['Autumn', 'Winter', 'Summer'].map(season => (
                  <FormControlLabel
                    key={season}
                    control={
                      <Checkbox
                        checked={selectedSeasons.includes(season)}
                        onChange={() => handleSeasonToggle(season)}
                        color="primary"
                      />
                    }
                    label={season}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider />

            {/* Step 3: Geographic Filters */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#04255e' }}>
                3. Geography Filters
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>District</InputLabel>
                  <Select
                    value={selectedDistrict}
                    label="District"
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedBlock('All');
                      setSelectedPanchayat('All');
                    }}
                  >
                    <MenuItem value="All">All Districts</MenuItem>
                    {Object.keys(GEOGRAPHY_MAPPING).map(d => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={selectedDistrict === 'All'}>
                  <InputLabel>Block</InputLabel>
                  <Select
                    value={selectedBlock}
                    label="Block"
                    onChange={(e) => {
                      setSelectedBlock(e.target.value);
                      setSelectedPanchayat('All');
                    }}
                  >
                    <MenuItem value="All">All Blocks</MenuItem>
                    {selectedDistrict !== 'All' && 
                      Object.keys(GEOGRAPHY_MAPPING[selectedDistrict]).map(b => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" disabled={selectedBlock === 'All'}>
                  <InputLabel>Panchayat</InputLabel>
                  <Select
                    value={selectedPanchayat}
                    label="Panchayat"
                    onChange={(e) => setSelectedPanchayat(e.target.value)}
                  >
                    <MenuItem value="All">All Panchayats</MenuItem>
                    {selectedDistrict !== 'All' && selectedBlock !== 'All' &&
                      GEOGRAPHY_MAPPING[selectedDistrict][selectedBlock].map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <Divider />

            {/* Step 4: Dimension Selection */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#04255e' }}>
                4. Select Table Row Dimensions
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={groupBy.district} onChange={() => handleGroupByChange('district')} />}
                  label="District"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.block} onChange={() => handleGroupByChange('block')} />}
                  label="Block"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.panchayat} onChange={() => handleGroupByChange('panchayat')} />}
                  label="Panchayat"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.season} onChange={() => handleGroupByChange('season')} />}
                  label="Season"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.crop} onChange={() => handleGroupByChange('crop')} />}
                  label="Crop"
                />
              </FormGroup>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Preview Table Panel */}
      <Grid item xs={12} md={8}>
        <MainCard title="Custom Report Preview" sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
          {reportData.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#04255e' }}>
                  <TableRow>
                    {activeDimensions.map(dim => (
                      <TableCell key={dim} sx={{ color: 'white', fontWeight: 600 }}>
                        {dim.charAt(0).toUpperCase() + dim.slice(1)}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Estimated Area (Ha)
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Contribution %
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row, idx) => (
                    <TableRow key={idx} hover>
                      {activeDimensions.map(dim => (
                        <TableCell key={dim} sx={{ fontWeight: 500 }}>
                          {row[dim]}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        {row.area.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {totalReportArea > 0 ? ((row.area / totalReportArea) * 100).toFixed(1) : '0.0'}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}>
                    <TableCell colSpan={activeDimensions.length} sx={{ fontWeight: 'bold' }}>
                      Report Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {totalReportArea.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      100%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Please select at least one row dimension or check your filters to generate a report.
              </Typography>
            </Box>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default SeasonalCustomReportBuilder;

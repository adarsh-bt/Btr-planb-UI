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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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

const CustomReportBuilder = () => {
  const navigate = useNavigate();

  // Selection states
  const [selectedCrops, setSelectedCrops] = useState(['Paddy', 'Wheat']);
  const [selectedSeasons, setSelectedSeasons] = useState(['Autumn', 'Winter', 'Summer']);

  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedPanchayat, setSelectedPanchayat] = useState('All');

  // Report Settings (Irrigation, Land Type, Agriculture Area)
  const [selectedIrrigationType, setSelectedIrrigationType] = useState('All');
  const [selectedLandType, setSelectedLandType] = useState('All');
  const [selectedAgriArea, setSelectedAgriArea] = useState('All');

  // Dimension checkboxes (crop is always shown as columns, not a row dimension)
  const [groupBy, setGroupBy] = useState({
    district: true,
    block: false,
    panchayat: false,
    season: false,
    irrigationType: false,
    landType: false,
    agriArea: false
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

  // Generate Report Data: crops are pivoted into columns, other dimensions are rows
  const generateReportData = () => {
    let expanded = [];
    
    MOCK_RAW_ESTIMATIONS.forEach(item => {
      // Split into Land Types: Wet Land (45%) and Dry Land (55%)
      const landTypes = ['Wet Land', 'Dry Land'];
      landTypes.forEach(lt => {
        if (selectedLandType !== 'All' && lt !== selectedLandType) return;
        
        const ltFactor = lt === 'Wet Land' ? 0.45 : 0.55;
        const ltArea = Math.round(item.area * ltFactor);
        
        // Split into Irrigation Types: Irrigated (60%) and Unirrigated (40%)
        const irrTypes = ['Irrigated', 'Unirrigated'];
        irrTypes.forEach(it => {
          if (selectedIrrigationType !== 'All' && it !== selectedIrrigationType) return;
          
          const itFactor = it === 'Irrigated' ? 0.60 : 0.40;
          const irrArea = Math.round(ltArea * itFactor);
          
          // Split into Agriculture Area: Net Sown Area (70%) and Gross Cropped Area (30%)
          const agriAreas = ['Net Sown Area', 'Gross Cropped Area'];
          agriAreas.forEach(aa => {
            if (selectedAgriArea !== 'All' && aa !== selectedAgriArea) return;
            
            const aaFactor = aa === 'Net Sown Area' ? 0.70 : 0.30;
            const area = Math.round(irrArea * aaFactor);
            
            expanded.push({
              ...item,
              landType: lt,
              irrigationType: it,
              agriArea: aa,
              area: area
            });
          });
        });
      });
    });

    // Apply the selection filters
    let filtered = expanded.filter(item => {
      if (!selectedCrops.includes(item.crop)) return false;
      if (!selectedSeasons.includes(item.season)) return false;
      if (selectedDistrict !== 'All' && item.district !== selectedDistrict) return false;
      if (selectedBlock !== 'All' && item.block !== selectedBlock) return false;
      if (selectedPanchayat !== 'All' && item.panchayat !== selectedPanchayat) return false;
      return true;
    });

    const activeDims = Object.keys(groupBy).filter(k => groupBy[k]);
    if (activeDims.length === 0) return [];

    // Pivot: group by row dimensions, accumulate area per crop
    const aggregations = {};
    filtered.forEach(item => {
      const keyObj = {};
      activeDims.forEach(dim => {
        keyObj[dim] = item[dim];
      });
      const keyStr = JSON.stringify(keyObj);
      if (!aggregations[keyStr]) {
        const rowBase = { ...keyObj, totalArea: 0 };
        // Initialize all selected crops to 0
        selectedCrops.forEach(c => { rowBase[`crop_${c}`] = 0; });
        aggregations[keyStr] = rowBase;
      }
      
      aggregations[keyStr].totalArea += item.area;
      const cropKey = `crop_${item.crop}`;
      if (aggregations[keyStr][cropKey] !== undefined) {
        aggregations[keyStr][cropKey] += item.area;
      }
    });

    return Object.values(aggregations);
  };

  const reportData = generateReportData();
  const activeDimensions = Object.keys(groupBy).filter(k => groupBy[k]);
  const totalReportTotalArea = reportData.reduce((sum, r) => sum + r.totalArea, 0);

  const dimensionHeaders = {
    district: 'District',
    block: 'Block',
    panchayat: 'Panchayat',
    season: 'Season',
    irrigationType: 'Irrigation Type',
    landType: 'Land Type',
    agriArea: 'Agriculture Area'
  };

  const handleExportExcel = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `Custom_Seasonal_Estimation_Report_${dateStr}_${timeStr}.xls`;

    const headers = [
      ...activeDimensions.map(dim => dimensionHeaders[dim]),
      ...selectedCrops.map(c => `${c} (Ha)`),
      'Total Area (Ha)',
      'Contribution %'
    ];

    const dataRows = reportData.map(row => [
      ...activeDimensions.map(dim => row[dim]),
      ...selectedCrops.map(c => row[`crop_${c}`] || 0),
      row.totalArea,
      totalReportTotalArea > 0 ? ((row.totalArea / totalReportTotalArea) * 100).toFixed(2) : '0.00'
    ]);

    const metadataRows = [
      ['Report Name', 'Custom Seasonal Crop Estimation Report'],
      ['Selected Crops', selectedCrops.join(', ')],
      ['Selected Seasons', selectedSeasons.join(', ')],
      ['District Filter', selectedDistrict],
      ['Block Filter', selectedBlock],
      ['Panchayat Filter', selectedPanchayat],
      ['Irrigation Type Filter', selectedIrrigationType],
      ['Land Type Filter', selectedLandType],
      ['Agriculture Area Filter', selectedAgriArea],
      ['Group Dimensions', activeDimensions.map(d => dimensionHeaders[d]).join(', ')],
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
            
            {/* Step 1: Select Table Row Dimensions (Moved to top) */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#04255e' }}>
                1. Select Table Row Dimensions
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={groupBy.district} onChange={() => handleGroupByChange('district')} size="small" />}
                  label="District"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.block} onChange={() => handleGroupByChange('block')} size="small" />}
                  label="Block"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.panchayat} onChange={() => handleGroupByChange('panchayat')} size="small" />}
                  label="Panchayat"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.season} onChange={() => handleGroupByChange('season')} size="small" />}
                  label="Season"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.irrigationType} onChange={() => handleGroupByChange('irrigationType')} size="small" />}
                  label="Irrigation Type"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.landType} onChange={() => handleGroupByChange('landType')} size="small" />}
                  label="Land Type"
                />
                <FormControlLabel
                  control={<Checkbox checked={groupBy.agriArea} onChange={() => handleGroupByChange('agriArea')} size="small" />}
                  label="Agriculture Area"
                />
              </FormGroup>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Note: Selected crops are always shown as separate columns.
              </Typography>
            </Box>

            <Divider />

            {/* Step 2: Select Crops */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#04255e' }}>
                2. Select Crops
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
                        size="small"
                      />
                    }
                    label={crop}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider />

            {/* Step 3: Select Seasons */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#04255e' }}>
                3. Select Seasons
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
                        size="small"
                      />
                    }
                    label={season}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider />

            {/* Step 4: Geographic Filters */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#04255e' }}>
                4. Geography Filters
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

            {/* Step 5: Irrigation Type, Land Type & Agriculture Area Filters */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#04255e' }}>
                5. Report Filters & Splits
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Irrigation Type</InputLabel>
                  <Select
                    value={selectedIrrigationType}
                    label="Irrigation Type"
                    onChange={(e) => setSelectedIrrigationType(e.target.value)}
                  >
                    <MenuItem value="All">All Irrigation Types</MenuItem>
                    <MenuItem value="Irrigated">Irrigated only</MenuItem>
                    <MenuItem value="Unirrigated">Unirrigated only</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Land Type</InputLabel>
                  <Select
                    value={selectedLandType}
                    label="Land Type"
                    onChange={(e) => setSelectedLandType(e.target.value)}
                  >
                    <MenuItem value="All">All Land Types</MenuItem>
                    <MenuItem value="Wet">Wet Land only</MenuItem>
                    <MenuItem value="Dry">Dry Land only</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Agriculture Area Type</InputLabel>
                  <Select
                    value={selectedAgriArea}
                    label="Agriculture Area Type"
                    onChange={(e) => setSelectedAgriArea(e.target.value)}
                  >
                    <MenuItem value="All">All Agriculture Areas</MenuItem>
                    <MenuItem value="Net Sown Area">Net Sown Area</MenuItem>
                    <MenuItem value="Gross Cropped Area">Gross Cropped Area</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
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
                        {dimensionHeaders[dim]}
                      </TableCell>
                    ))}
                    {selectedCrops.map(crop => (
                      <TableCell key={crop} align="right" sx={{ color: 'white', fontWeight: 600 }}>
                        {crop} (Ha)
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Total Area (Ha)
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
                      {selectedCrops.map(crop => (
                        <TableCell key={crop} align="right">
                          {(row[`crop_${crop}`] || 0).toLocaleString()}
                        </TableCell>
                      ))}
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {row.totalArea.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {totalReportTotalArea > 0 ? ((row.totalArea / totalReportTotalArea) * 100).toFixed(1) : '0.0'}%
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 'bold' }}>
                    <TableCell colSpan={activeDimensions.length} sx={{ fontWeight: 'bold' }}>
                      Report Total
                    </TableCell>
                    {selectedCrops.map(crop => (
                      <TableCell key={crop} align="right" sx={{ fontWeight: 'bold' }}>
                        {reportData.reduce((sum, r) => sum + (r[`crop_${crop}`] || 0), 0).toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {totalReportTotalArea.toLocaleString()}
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

export default CustomReportBuilder;
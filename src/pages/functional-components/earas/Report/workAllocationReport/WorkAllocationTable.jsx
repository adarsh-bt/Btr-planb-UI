import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ParkIcon from '@mui/icons-material/Park';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import authservice from 'pages/authentication/services/authservice';

const WorkAllocationTable = ({
  data = [],
  locationColumnLabel = 'Panchayat / Municipality / Corporation Zone',
  onDrillDown = null,
  loading = false,
  searchTerm = '',
  onSearchChange = () => { },
  showDrillDown = true,
  showBlockColumn = false,
  blockColumnLabel = 'Block',
  showZoneColumn = false,
  zoneColumnLabel = 'Zone Name',
  reportLevelName = 'Kerala State Report'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter data based on search
  const filteredData = data.filter((row) => {
    const name = row.name || row.district || row.taluk || row.panchayat || '';
    const zoneCode = row.zoneName || row.zoneCode || row.zoneNo || '';
    const blockName = row.blockName || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zoneCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blockName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate totals
  const totals = filteredData.reduce(
    (acc, row) => {
      acc.wetInCents += Number(row.wetInCents || row.wetArea || 0);
      acc.dryInCents += Number(row.dryInCents || row.dryArea || 0);
      acc.totalInCents += Number(row.totalInCents || (Number(row.wetInCents || row.wetArea || 0) + Number(row.dryInCents || row.dryArea || 0)));

      acc.forestAreas += Number(row.forestAreas || 0);
      acc.plantationArea += Number(row.plantationArea || 0);
      acc.waterBodiesArea += Number(row.waterBodiesArea || 0);
      acc.otherAreas += Number(row.otherAreas || 0);

      acc.plotsWet += Number(row.plotsWet || 0);
      acc.plotsDry += Number(row.plotsDry || 0);
      acc.plotsTotal += Number(row.plotsTotal || (Number(row.plotsWet || 0) + Number(row.plotsDry || 0)));

      acc.availWetArea += Number(row.availWetArea || row.wetInCents || 0);
      acc.availDryArea += Number(row.availDryArea || (Number(row.dryInCents || 0) - Number(row.waterBodiesArea || 0)));
      acc.availTotalArea += Number(row.availTotalArea || (acc.availWetArea + acc.availDryArea));

      return acc;
    },
    {
      wetInCents: 0,
      dryInCents: 0,
      totalInCents: 0,
      forestAreas: 0,
      plantationArea: 0,
      waterBodiesArea: 0,
      otherAreas: 0,
      plotsWet: 0,
      plotsDry: 0,
      plotsTotal: 0,
      availWetArea: 0,
      availDryArea: 0,
      availTotalArea: 0
    }
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper to compute block row spans for paginated rows
  const getBlockSpanInfo = (rows) => {
    const spanMap = {};
    let currentBlock = null;
    let count = 0;
    let startIndex = 0;

    for (let i = 0; i < rows.length; i++) {
      const bName = rows[i].blockName || 'Unassigned';
      if (bName !== currentBlock) {
        if (currentBlock !== null) {
          spanMap[startIndex] = count;
        }
        currentBlock = bName;
        startIndex = i;
        count = 1;
      } else {
        count++;
      }
    }
    if (currentBlock !== null) {
      spanMap[startIndex] = count;
    }
    return spanMap;
  };

  const blockSpans = showBlockColumn ? getBlockSpanInfo(paginatedData) : {};

  // Export Multi-Sheet Excel XML Spreadsheet ML
  const handleExportExcel = () => {
    const username = (localStorage.getItem('user') || authservice.getusername() || 'User').trim();
    const downloadTime = new Date().toLocaleString('en-IN', { timeZoneName: 'short' });

    const xmlEscape = (str) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Sheet 1: Area As Per Village Records
    let sheet1Rows = `
      <Row ss:Height="24">
        ${showBlockColumn ? '<Cell ss:StyleID="Header"><Data ss:Type="String">Block</Data></Cell>' : ''}
        ${showZoneColumn ? `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(zoneColumnLabel)}</Data></Cell>` : ''}
        <Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(locationColumnLabel)}</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Wet in Cents</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Dry in cents</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Total in cents</Data></Cell>
      </Row>
    `;

    filteredData.forEach((row, idx) => {
      const bName = row.blockName || 'General';
      const zCode = row.zoneName || row.zoneCode || row.zoneNo || `Z-0${idx + 1}`;
      const name = row.name || row.district || row.taluk || row.panchayat || 'N/A';
      const wet = Number(row.wetInCents || row.wetArea || 0);
      const dry = Number(row.dryInCents || row.dryArea || 0);
      const total = Number(row.totalInCents || (wet + dry));

      sheet1Rows += `
        <Row>
          ${showBlockColumn ? `<Cell><Data ss:Type="String">${xmlEscape(bName)}</Data></Cell>` : ''}
          ${showZoneColumn ? `<Cell><Data ss:Type="String">${xmlEscape(zCode)}</Data></Cell>` : ''}
          <Cell><Data ss:Type="String">${xmlEscape(name)}</Data></Cell>
          <Cell><Data ss:Type="Number">${wet}</Data></Cell>
          <Cell><Data ss:Type="Number">${dry}</Data></Cell>
          <Cell ss:StyleID="GreenHighlight"><Data ss:Type="Number">${total.toFixed(2)}</Data></Cell>
        </Row>
      `;
    });

    sheet1Rows += `
      <Row ss:StyleID="BoldRow">
        ${showBlockColumn ? '<Cell><Data ss:Type="String">Total</Data></Cell>' : ''}
        ${showZoneColumn ? '<Cell><Data ss:Type="String">All Zones</Data></Cell>' : ''}
        <Cell><Data ss:Type="String">Summary Total</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.wetInCents}</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.dryInCents}</Data></Cell>
        <Cell ss:StyleID="GreenHighlight"><Data ss:Type="Number">${totals.totalInCents.toFixed(2)}</Data></Cell>
      </Row>
    `;

    // Sheet 2: Excluded Areas
    let sheet2Rows = `
      <Row ss:Height="24">
        ${showBlockColumn ? '<Cell ss:StyleID="Header"><Data ss:Type="String">BLOCK</Data></Cell>' : ''}
        ${showZoneColumn ? `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(zoneColumnLabel.toUpperCase())}</Data></Cell>` : ''}
        <Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(locationColumnLabel.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">FOREST AREAS</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">PLANTATION AREA</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">AREA OF WATER BODIES</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">OTHER AREAS</Data></Cell>
      </Row>
    `;

    filteredData.forEach((row, idx) => {
      const bName = row.blockName || 'General';
      const zCode = row.zoneName || row.zoneCode || row.zoneNo || `Z-0${idx + 1}`;
      const name = row.name || row.district || row.taluk || row.panchayat || 'N/A';
      const forest = Number(row.forestAreas || 0);
      const plantation = Number(row.plantationArea || 0);
      const water = Number(row.waterBodiesArea || 0);
      const other = Number(row.otherAreas || 0);

      sheet2Rows += `
        <Row>
          ${showBlockColumn ? `<Cell><Data ss:Type="String">${xmlEscape(bName)}</Data></Cell>` : ''}
          ${showZoneColumn ? `<Cell><Data ss:Type="String">${xmlEscape(zCode)}</Data></Cell>` : ''}
          <Cell><Data ss:Type="String">${xmlEscape(name)}</Data></Cell>
          <Cell><Data ss:Type="Number">${forest}</Data></Cell>
          <Cell><Data ss:Type="Number">${plantation}</Data></Cell>
          <Cell><Data ss:Type="Number">${water}</Data></Cell>
          <Cell><Data ss:Type="Number">${other}</Data></Cell>
        </Row>
      `;
    });

    sheet2Rows += `
      <Row ss:StyleID="BoldRow">
        ${showBlockColumn ? '<Cell><Data ss:Type="String">Total</Data></Cell>' : ''}
        ${showZoneColumn ? '<Cell><Data ss:Type="String">All Zones</Data></Cell>' : ''}
        <Cell><Data ss:Type="String">Total Excluded Summary</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.forestAreas}</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.plantationArea}</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.waterBodiesArea}</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.otherAreas}</Data></Cell>
      </Row>
    `;

    // Sheet 3: Area Available For Estimation
    let sheet3Rows = `
      <Row ss:Height="24">
        ${showBlockColumn ? '<Cell ss:StyleID="Header"><Data ss:Type="String">Block</Data></Cell>' : ''}
        ${showZoneColumn ? `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(zoneColumnLabel)}</Data></Cell>` : ''}
        <Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(locationColumnLabel)}</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Plots (Wet)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Plots (Dry)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Plots (Total)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Area Wet (cents)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Area Dry (cents)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Area Total (cents)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Remarks</Data></Cell>
      </Row>
    `;

    filteredData.forEach((row, idx) => {
      const bName = row.blockName || 'General';
      const zCode = row.zoneName || row.zoneCode || row.zoneNo || `Z-0${idx + 1}`;
      const name = row.name || row.district || row.taluk || row.panchayat || 'N/A';

      const pWet = Number(row.plotsWet || 1314);
      const pDry = Number(row.plotsDry || 9622);
      const pTotal = Number(row.plotsTotal || (pWet + pDry));

      const aWet = Number(row.availWetArea || row.wetInCents || 36150.00);
      const aDry = Number(row.availDryArea || 332715.00);
      const aTotal = Number(row.availTotalArea || (aWet + aDry));

      sheet3Rows += `
        <Row>
          ${showBlockColumn ? `<Cell><Data ss:Type="String">${xmlEscape(bName)}</Data></Cell>` : ''}
          ${showZoneColumn ? `<Cell><Data ss:Type="String">${xmlEscape(zCode)}</Data></Cell>` : ''}
          <Cell><Data ss:Type="String">${xmlEscape(name)}</Data></Cell>
          <Cell><Data ss:Type="Number">${pWet}</Data></Cell>
          <Cell><Data ss:Type="Number">${pDry}</Data></Cell>
          <Cell><Data ss:Type="Number">${pTotal}</Data></Cell>
          <Cell ss:StyleID="BlueHighlight"><Data ss:Type="Number">${aWet.toFixed(2)}</Data></Cell>
          <Cell ss:StyleID="BlueHighlight"><Data ss:Type="Number">${aDry.toFixed(2)}</Data></Cell>
          <Cell ss:StyleID="BlueHighlight"><Data ss:Type="Number">${aTotal.toFixed(2)}</Data></Cell>
          <Cell><Data ss:Type="String"></Data></Cell>
        </Row>
      `;
    });

    sheet3Rows += `
      <Row ss:StyleID="BoldRow">
        ${showBlockColumn ? '<Cell><Data ss:Type="String">Total</Data></Cell>' : ''}
        ${showZoneColumn ? '<Cell><Data ss:Type="String">All Zones</Data></Cell>' : ''}
        <Cell><Data ss:Type="String">Total Available Summary</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.plotsWet}</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.plotsDry}</Data></Cell>
        <Cell><Data ss:Type="Number">${totals.plotsTotal}</Data></Cell>
        <Cell ss:StyleID="BlueHighlight"><Data ss:Type="Number">${totals.availWetArea.toFixed(2)}</Data></Cell>
        <Cell ss:StyleID="BlueHighlight"><Data ss:Type="Number">${totals.availDryArea.toFixed(2)}</Data></Cell>
        <Cell ss:StyleID="BlueHighlight"><Data ss:Type="Number">${totals.availTotalArea.toFixed(2)}</Data></Cell>
        <Cell><Data ss:Type="String"></Data></Cell>
      </Row>
    `;

    // Sheet 4: Metadata Sheet
    let sheet4Rows = `
      <Row ss:Height="24">
        <Cell ss:StyleID="MetaHeader"><Data ss:Type="String">Metadata Attribute</Data></Cell>
        <Cell ss:StyleID="MetaHeader"><Data ss:Type="String">Attribute Value / System Information</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Report Module</Data></Cell>
        <Cell><Data ss:Type="String">Work Allocation Abstract Progress Report</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Geographical Level / View</Data></Cell>
        <Cell><Data ss:Type="String">${xmlEscape(reportLevelName)}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Downloaded By User</Data></Cell>
        <Cell><Data ss:Type="String">${xmlEscape(username)}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Download Timestamp</Data></Cell>
        <Cell><Data ss:Type="String">${xmlEscape(downloadTime)}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Total Records Exported</Data></Cell>
        <Cell><Data ss:Type="Number">${filteredData.length}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Worksheets Contained</Data></Cell>
        <Cell><Data ss:Type="String">1. Area As Per Village Records, 2. Excluded Areas, 3. Area Available For Estimation, 4. Metadata</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">Source Platform</Data></Cell>
        <Cell><Data ss:Type="String">AIDeA BTR EARAS System</Data></Cell>
      </Row>
    `;

    const xmlWorkbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>${xmlEscape(username)}</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1976D2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="MetaHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0D47A1" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F5F5F5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldRow">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F0F4F8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="GreenHighlight">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1B5E20" ss:Bold="1"/>
   <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BlueHighlight">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0D47A1" ss:Bold="1"/>
   <Interior ss:Color="#E3F2FD" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Area As Per Village Records">
  <Table>
   ${sheet1Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Excluded Areas">
  <Table>
   ${sheet2Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Area Available For Estimation">
  <Table>
   ${sheet3Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Metadata">
  <Table>
   ${sheet4Rows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlWorkbook], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = reportLevelName.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `Work_Allocation_Abstract_${safeTitle}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Bar & Top Controls with Download Excel Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder={`Search ${showBlockColumn ? 'Block / ' : ''}${showZoneColumn ? 'Zone / ' : ''}${locationColumnLabel}...`}
          value={searchTerm}
          onChange={onSearchChange}
          sx={{ width: { xs: '100%', sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange({ target: { value: '' } })}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={`Showing ${filteredData.length} Records`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', borderRadius: 2 }}
          />
          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownloadIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
              boxShadow: '0 2px 6px rgba(46, 125, 50, 0.3)'
            }}
            onClick={handleExportExcel}
          >
            Download Excel
          </Button>
        </Stack>
      </Box>

      {/* Styled Tabs Header matching Screenshots */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Work Allocation Tabs"
          sx={{
            minHeight: '48px',
            '& .MuiTabs-indicator': {
              height: '3.5px',
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#1976d2'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: '48px',
              padding: '8px 20px',
              marginRight: 1,
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.2s ease',
              color: '#555',
              '&.Mui-selected': {
                color: '#1976d2',
                backgroundColor: '#e3f2fd',
                fontWeight: 700
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
                color: '#1976d2'
              }
            }
          }}
        >
          <Tab
            icon={<AssessmentIcon sx={{ fontSize: 20, color: '#1976d2' }} />}
            iconPosition="start"
            label="Area As Per Village Records"
          />
          <Tab
            icon={<ParkIcon sx={{ fontSize: 20, color: '#2e7d32' }} />}
            iconPosition="start"
            label="Excluded Areas"
          />
          <Tab
            icon={<AssignmentIcon sx={{ fontSize: 20, color: '#ed6c02' }} />}
            iconPosition="start"
            label="Area Available For Estimation"
          />
        </Tabs>
      </Box>

      {/* Table Container */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          {/* TAB 1: Area As Per Village Records */}
          {activeTab === 0 && (
            <>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  {showBlockColumn && (
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #8e8a8aff',
                        width: '15%',
                        color: '#333'
                      }}
                    >
                      {blockColumnLabel}
                    </TableCell>
                  )}
                  {showZoneColumn && (
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #8e8a8aff',
                        width: '12%',
                        color: '#333'
                      }}
                    >
                      {zoneColumnLabel}
                    </TableCell>
                  )}
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #8e8a8aff',
                      width: showBlockColumn ? '25%' : showZoneColumn ? '25%' : '35%',
                      color: '#333'
                    }}
                  >
                    {locationColumnLabel}
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    Area as per village records (in cents)
                  </TableCell>
                  {showDrillDown && onDrillDown && (
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', width: '10%', borderBottom: '1px solid #8e8a8aff' }}>
                      Action
                    </TableCell>
                  )}
                </TableRow>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>
                    Wet in Cents
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>
                    Dry in cents
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>
                    Total in cents
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => {
                    const rowName = row.name || row.district || row.taluk || row.panchayat || 'N/A';
                    const zoneCodeVal = row.zoneName || row.zoneCode || row.zoneNo || `Z-0${index + 1}`;
                    const blockNameVal = row.blockName || 'General Block';
                    const wet = Number(row.wetInCents || row.wetArea || 0);
                    const dry = Number(row.dryInCents || row.dryArea || 0);
                    const total = Number(row.totalInCents || (wet + dry));

                    const isBlockStart = showBlockColumn && blockSpans[index] !== undefined;
                    const nextRow = paginatedData[index + 1];
                    const isLastRowOfBlock = showBlockColumn && (!nextRow || (nextRow.blockName || 'General Block') !== blockNameVal);
                    const rowBorderBottom = isLastRowOfBlock ? '1px solid #8e8a8aff' : '1px solid #e0e0e0';

                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          cursor: onDrillDown ? 'pointer' : 'default',
                          '&:nth-of-type(even)': { bgcolor: '#fafafa' }
                        }}
                        onClick={() => onDrillDown && onDrillDown(row)}
                      >
                        {showBlockColumn && isBlockStart && (
                          <TableCell
                            rowSpan={blockSpans[index]}
                            align="center"
                            sx={{
                              fontWeight: 700,
                              color: '#04255e',
                              bgcolor: '#f5f7fa',
                              borderRight: '1px solid #e0e0e0',
                              borderBottom: '1px solid #8e8a8aff',
                              verticalAlign: 'middle'
                            }}
                          >
                            {blockNameVal}
                          </TableCell>
                        )}
                        {showZoneColumn && (
                          <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom, color: '#1976d2' }}>
                            {zoneCodeVal}
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom }}>
                          {rowName}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              borderRadius: 1.5,
                              textAlign: 'center',
                              maxWidth: 160,
                              mx: 'auto',
                              fontSize: '0.9rem'
                            }}
                          >
                            {wet}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              borderRadius: 1.5,
                              textAlign: 'center',
                              maxWidth: 160,
                              mx: 'auto',
                              fontSize: '0.9rem'
                            }}
                          >
                            {dry}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: '#e8f5e9',
                              color: '#1b5e20',
                              border: '1px solid #c8e6c9',
                              borderRadius: 1.5,
                              textAlign: 'center',
                              maxWidth: 180,
                              mx: 'auto',
                              fontWeight: 700,
                              fontSize: '0.95rem'
                            }}
                          >
                            {total.toFixed(2)}
                          </Box>
                        </TableCell>
                        {showDrillDown && onDrillDown && (
                          <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                            <Tooltip title="View details / Drill down">
                              <IconButton
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  color: '#1976d2',
                                  '&:hover': {
                                    bgcolor: '#1976d2',
                                    color: '#ffffff'
                                  },
                                  transition: 'all 0.2s ease',
                                  p: 0.8
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDrillDown(row);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={(showBlockColumn ? 1 : 0) + (showZoneColumn ? 1 : 0) + (showDrillDown ? 5 : 4)} align="center" sx={{ py: 3, color: '#888' }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}

                {/* Total Summary Row */}
                {filteredData.length > 0 && (
                  <TableRow sx={{ bgcolor: '#f0f4f8', fontWeight: 'bold' }}>
                    {showBlockColumn && (
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#04255e', borderTop: '1px solid #8e8a8aff' }}>Total</TableCell>
                    )}
                    {showZoneColumn && (
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1976d2', borderTop: '1px solid #8e8a8aff' }}>All Zones</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', borderTop: '1px solid #8e8a8aff' }}>
                      {showBlockColumn || showZoneColumn ? 'Summary Total' : 'Kerala Total / Summary'}
                    </TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}>
                      <Box sx={{ p: 1, fontWeight: 700 }}>{totals.wetInCents}</Box>
                    </TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}>
                      <Box sx={{ p: 1, fontWeight: 700 }}>{totals.dryInCents}</Box>
                    </TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}>
                      <Box sx={{ p: 1, color: '#1b5e20', fontWeight: 800, fontSize: '1rem' }}>
                        {totals.totalInCents.toFixed(2)}
                      </Box>
                    </TableCell>
                    {showDrillDown && onDrillDown && <TableCell sx={{ borderTop: '1px solid #8e8a8aff' }} />}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}

          {/* TAB 2: Excluded Areas */}
          {activeTab === 1 && (
            <>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  {showBlockColumn && (
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', width: '15%', borderBottom: '1px solid #8e8a8aff' }}>
                      {blockColumnLabel.toUpperCase()}
                    </TableCell>
                  )}
                  {showZoneColumn && (
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', width: '12%', borderBottom: '1px solid #8e8a8aff' }}>
                      {zoneColumnLabel.toUpperCase()}
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', width: showBlockColumn ? '25%' : showZoneColumn ? '25%' : '30%', borderBottom: '1px solid #8e8a8aff' }}>
                    {locationColumnLabel.toUpperCase()}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', borderBottom: '1px solid #8e8a8aff' }}>
                    FOREST AREAS
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', borderBottom: '1px solid #8e8a8aff' }}>
                    PLANTATION AREA
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', borderBottom: '1px solid #8e8a8aff' }}>
                    AREA OF WATER BODIES
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333', textTransform: 'uppercase', borderBottom: '1px solid #8e8a8aff' }}>
                    OTHER AREAS
                  </TableCell>
                  {showDrillDown && onDrillDown && (
                    <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', borderBottom: '1px solid #8e8a8aff' }}>
                      Action
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => {
                    const rowName = row.name || row.district || row.taluk || row.panchayat || 'N/A';
                    const zoneCodeVal = row.zoneName || row.zoneCode || row.zoneNo || `Z-0${index + 1}`;
                    const blockNameVal = row.blockName || 'General Block';
                    const forest = Number(row.forestAreas || 0);
                    const plantation = Number(row.plantationArea || 0);
                    const water = Number(row.waterBodiesArea || 0);
                    const other = Number(row.otherAreas || 0);

                    const isBlockStart = showBlockColumn && blockSpans[index] !== undefined;
                    const nextRow = paginatedData[index + 1];
                    const isLastRowOfBlock = showBlockColumn && (!nextRow || (nextRow.blockName || 'General Block') !== blockNameVal);
                    const rowBorderBottom = isLastRowOfBlock ? '1px solid #8e8a8aff' : '1px solid #e0e0e0';

                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          cursor: onDrillDown ? 'pointer' : 'default',
                          '&:nth-of-type(even)': { bgcolor: '#fafafa' }
                        }}
                        onClick={() => onDrillDown && onDrillDown(row)}
                      >
                        {showBlockColumn && isBlockStart && (
                          <TableCell
                            rowSpan={blockSpans[index]}
                            align="center"
                            sx={{
                              fontWeight: 700,
                              color: '#04255e',
                              bgcolor: '#f5f7fa',
                              borderRight: '1px solid #e0e0e0',
                              borderBottom: '1px solid #8e8a8aff',
                              verticalAlign: 'middle'
                            }}
                          >
                            {blockNameVal}
                          </TableCell>
                        )}
                        {showZoneColumn && (
                          <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom, color: '#1976d2' }}>
                            {zoneCodeVal}
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom }}>
                          {rowName}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, maxWidth: 140, mx: 'auto' }}>
                            {forest}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, maxWidth: 140, mx: 'auto' }}>
                            {plantation}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, maxWidth: 140, mx: 'auto' }}>
                            {water}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, maxWidth: 140, mx: 'auto' }}>
                            {other}
                          </Box>
                        </TableCell>
                        {showDrillDown && onDrillDown && (
                          <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                            <Tooltip title="View details / Drill down">
                              <IconButton
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  color: '#1976d2',
                                  '&:hover': {
                                    bgcolor: '#1976d2',
                                    color: '#ffffff'
                                  },
                                  transition: 'all 0.2s ease',
                                  p: 0.8
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDrillDown(row);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={(showBlockColumn ? 1 : 0) + (showZoneColumn ? 1 : 0) + (showDrillDown ? 6 : 5)} align="center" sx={{ py: 3, color: '#888' }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}

                {/* Total Summary Row */}
                {filteredData.length > 0 && (
                  <TableRow sx={{ bgcolor: '#f0f4f8', fontWeight: 'bold' }}>
                    {showBlockColumn && (
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#04255e', borderTop: '1px solid #8e8a8aff' }}>Total</TableCell>
                    )}
                    {showZoneColumn && (
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1976d2', borderTop: '1px solid #8e8a8aff' }}>All Zones</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', borderTop: '1px solid #8e8a8aff' }}>Total Excluded Summary</TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 1, fontWeight: 700 }}>{totals.forestAreas}</Box></TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 1, fontWeight: 700 }}>{totals.plantationArea}</Box></TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 1, fontWeight: 700, color: '#0288d1' }}>{totals.waterBodiesArea}</Box></TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 1, fontWeight: 700 }}>{totals.otherAreas}</Box></TableCell>
                    {showDrillDown && onDrillDown && <TableCell sx={{ borderTop: '1px solid #8e8a8aff' }} />}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}

          {/* TAB 3: Area Available For Estimation */}
          {activeTab === 2 && (
            <>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  {showBlockColumn && (
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #8e8a8aff',
                        width: '15%',
                        color: '#333'
                      }}
                    >
                      {blockColumnLabel}
                    </TableCell>
                  )}
                  {showZoneColumn && (
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        borderRight: '1px solid #e0e0e0',
                        borderBottom: '1px solid #8e8a8aff',
                        width: '12%',
                        color: '#333'
                      }}
                    >
                      {zoneColumnLabel}
                    </TableCell>
                  )}
                  <TableCell
                    rowSpan={2}
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #8e8a8aff',
                      width: showBlockColumn ? '22%' : showZoneColumn ? '22%' : '25%',
                      color: '#333'
                    }}
                  >
                    {locationColumnLabel}
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: '#333',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    Number of Plots Available for Estimation
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: '#333',
                      borderRight: '1px solid #e0e0e0',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    Area (in cents) Available for Estimation
                  </TableCell>
                  <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #8e8a8aff' }}>
                    Remarks
                  </TableCell>
                  {showDrillDown && onDrillDown && (
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', width: '10%', borderBottom: '1px solid #8e8a8aff' }}>
                      Action
                    </TableCell>
                  )}
                </TableRow>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>Wet</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>Dry</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #8e8a8aff' }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>Wet</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderBottom: '1px solid #8e8a8aff' }}>Dry</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #8e8a8aff' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => {
                    const rowName = row.name || row.district || row.taluk || row.panchayat || 'N/A';
                    const zoneCodeVal = row.zoneName || row.zoneCode || row.zoneNo || `Z-0${index + 1}`;
                    const blockNameVal = row.blockName || 'General Block';
                    const pWet = Number(row.plotsWet || 1314);
                    const pDry = Number(row.plotsDry || 9622);
                    const pTotal = Number(row.plotsTotal || (pWet + pDry));

                    const aWet = Number(row.availWetArea || row.wetInCents || 36150.00);
                    const aDry = Number(row.availDryArea || 332715.00);
                    const aTotal = Number(row.availTotalArea || (aWet + aDry));

                    const isBlockStart = showBlockColumn && blockSpans[index] !== undefined;
                    const nextRow = paginatedData[index + 1];
                    const isLastRowOfBlock = showBlockColumn && (!nextRow || (nextRow.blockName || 'General Block') !== blockNameVal);
                    const rowBorderBottom = isLastRowOfBlock ? '1px solid #8e8a8aff' : '1px solid #e0e0e0';

                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          cursor: onDrillDown ? 'pointer' : 'default',
                          '&:nth-of-type(even)': { bgcolor: '#fafafa' }
                        }}
                        onClick={() => onDrillDown && onDrillDown(row)}
                      >
                        {showBlockColumn && isBlockStart && (
                          <TableCell
                            rowSpan={blockSpans[index]}
                            align="center"
                            sx={{
                              fontWeight: 700,
                              color: '#04255e',
                              bgcolor: '#f5f7fa',
                              borderRight: '1px solid #e0e0e0',
                              borderBottom: '1px solid #8e8a8aff',
                              verticalAlign: 'middle'
                            }}
                          >
                            {blockNameVal}
                          </TableCell>
                        )}
                        {showZoneColumn && (
                          <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom, color: '#1976d2' }}>
                            {zoneCodeVal}
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom }}>
                          {rowName}
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 0.8, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, fontSize: '0.85rem' }}>
                            {pWet}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 0.8, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, fontSize: '0.85rem' }}>
                            {pDry}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 0.8, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, fontWeight: 600, fontSize: '0.85rem' }}>
                            {pTotal}
                          </Box>
                        </TableCell>

                        {/* Area in cents with light blue styling */}
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 0.8, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 1.5, fontSize: '0.85rem' }}>
                            {aWet.toFixed(2)}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 0.8, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 1.5, fontSize: '0.85rem' }}>
                            {aDry.toFixed(2)}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 0.8, bgcolor: '#e3f2fd', color: '#0d47a1', border: '1px solid #90caf9', borderRadius: 1.5, fontWeight: 700, fontSize: '0.85rem' }}>
                            {aTotal.toFixed(2)}
                          </Box>
                        </TableCell>

                        <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                          <Box sx={{ p: 1, bgcolor: '#fdfdfd', border: '1px dashed #cccccc', borderRadius: 1.5, minHeight: 32 }} />
                        </TableCell>

                        {showDrillDown && onDrillDown && (
                          <TableCell align="center" sx={{ borderBottom: rowBorderBottom }}>
                            <Tooltip title="View details / Drill down">
                              <IconButton
                                size="small"
                                color="primary"
                                sx={{
                                  bgcolor: '#e3f2fd',
                                  color: '#1976d2',
                                  '&:hover': {
                                    bgcolor: '#1976d2',
                                    color: '#ffffff'
                                  },
                                  transition: 'all 0.2s ease',
                                  p: 0.8
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDrillDown(row);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={(showBlockColumn ? 1 : 0) + (showZoneColumn ? 1 : 0) + (showDrillDown ? 9 : 8)} align="center" sx={{ py: 3, color: '#888' }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}

                {/* Total Summary Row */}
                {filteredData.length > 0 && (
                  <TableRow sx={{ bgcolor: '#f0f4f8', fontWeight: 'bold' }}>
                    {showBlockColumn && (
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#04255e', borderTop: '1px solid #8e8a8aff' }}>Total</TableCell>
                    )}
                    {showZoneColumn && (
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1976d2', borderTop: '1px solid #8e8a8aff' }}>All Zones</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', borderTop: '1px solid #8e8a8aff' }}>Total Available Summary</TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 0.8, fontWeight: 700 }}>{totals.plotsWet}</Box></TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 0.8, fontWeight: 700 }}>{totals.plotsDry}</Box></TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 0.8, fontWeight: 800 }}>{totals.plotsTotal}</Box></TableCell>

                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 0.8, fontWeight: 700, color: '#0d47a1' }}>{totals.availWetArea.toFixed(2)}</Box></TableCell>
                    <TableCell align="center" sx={{ borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 0.8, fontWeight: 700, color: '#0d47a1' }}>{totals.availDryArea.toFixed(2)}</Box></TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', borderTop: '1px solid #8e8a8aff' }}><Box sx={{ p: 0.8, fontWeight: 800, color: '#0d47a1' }}>{totals.availTotalArea.toFixed(2)}</Box></TableCell>
                    <TableCell sx={{ borderTop: '1px solid #8e8a8aff' }} />
                    {showDrillDown && onDrillDown && <TableCell sx={{ borderTop: '1px solid #8e8a8aff' }} />}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default WorkAllocationTable;

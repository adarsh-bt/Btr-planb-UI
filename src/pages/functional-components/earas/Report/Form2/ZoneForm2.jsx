import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Stack
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  Store,
  ArrowBack,
  WbSunny
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// =====================================================================
// COLUMN WIDTHS — single source of truth.
// Every table uses a <colgroup> built from these numbers, so the header,
// body, subtotal and grand-total rows can never disagree about widths.
// =====================================================================

// Land Utilization tab
const LU_BLOCK_W = 160;
const LU_ZONE_W = 200;

// Irrigation tab
const IRR_BLOCK_W = 140;
const IRR_ZONE_W = 170;
const IRR_COUNT_W = 70;
const IRR_AREA_W = 90;
// Height of the FIRST header row in the irrigation table. The second
// header row is stuck at exactly this offset (no more hard-coded "45").
const IRR_HEADER_ROW1_H = 44;

// ---- Solid (non-transparent) tint colors for sticky cells ----
// Solid hex avoids the "ghosting / clipped digit" artifact that happens when
// a semi-transparent sticky cell blends with content scrolling underneath it.
const themeColor = '#05307a';
const stickyTintLight = '#eef1f7';    // ~ alpha(themeColor, 0.06) over white
const stickyTintSubtotal = '#e4e9f2'; // ~ alpha(themeColor, 0.08) over white
const stickyTintGrand = '#d2dbe9';    // ~ alpha(themeColor, 0.15) over white
const stickyHeaderSub = '#22528b';    // ~ alpha(themeColor, 0.85) over white

const ZoneForm2 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedDistrict = location.state?.districtName || location.state?.selectedDistrict || "Kannur";
  const selectedTaluk = location.state?.talukName || location.state?.selectedTaluk || "Taliparamba";
  const initialTab = location.state?.activeTab || 0;

  const [activeTab, setActiveTab] = useState(initialTab);

  // Land Type filter state: 'all' | 'wet' | 'dry'
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  const zoneData = [
    { block: "Taliparamba", zone: "North Zone", buildingCourtyard: 12.50, otherNonAgri: 8.30, barrenUncultivable: 42.20, miscTreeCrops: 7.40, permanentPastures: 3.60, cultivableWaste: 2.10, otherFallow: 1.20, currentFallow: 1.80, socialForestry: 5.70, waterLogged: 4.20, stillWater: 22.80, marshyLand: 1.10, netAreaSown: 267.00 },
    { block: "Taliparamba", zone: "South Zone", buildingCourtyard: 10.80, otherNonAgri: 7.20, barrenUncultivable: 38.50, miscTreeCrops: 6.80, permanentPastures: 3.20, cultivableWaste: 1.90, otherFallow: 1.00, currentFallow: 1.60, socialForestry: 5.20, waterLogged: 3.80, stillWater: 20.40, marshyLand: 1.00, netAreaSown: 242.00 },
    { block: "Taliparamba", zone: "East Zone", buildingCourtyard: 11.20, otherNonAgri: 7.80, barrenUncultivable: 40.10, miscTreeCrops: 7.10, permanentPastures: 3.40, cultivableWaste: 2.00, otherFallow: 1.10, currentFallow: 1.70, socialForestry: 5.50, waterLogged: 4.00, stillWater: 21.60, marshyLand: 1.05, netAreaSown: 258.00 },
    { block: "Iritty", zone: "Iritty Central", buildingCourtyard: 8.40, otherNonAgri: 5.60, barrenUncultivable: 35.20, miscTreeCrops: 6.20, permanentPastures: 2.80, cultivableWaste: 1.70, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.80, waterLogged: 3.20, stillWater: 18.40, marshyLand: 0.90, netAreaSown: 195.00 },
    { block: "Iritty", zone: "Iritty West", buildingCourtyard: 7.80, otherNonAgri: 5.20, barrenUncultivable: 32.80, miscTreeCrops: 5.80, permanentPastures: 2.60, cultivableWaste: 1.50, otherFallow: 0.80, currentFallow: 1.30, socialForestry: 4.50, waterLogged: 2.90, stillWater: 17.20, marshyLand: 0.85, netAreaSown: 182.00 },
    { block: "Payyannur", zone: "Payyannur North", buildingCourtyard: 9.60, otherNonAgri: 6.40, barrenUncultivable: 38.50, miscTreeCrops: 6.80, permanentPastures: 3.10, cultivableWaste: 1.80, otherFallow: 1.00, currentFallow: 1.50, socialForestry: 5.00, waterLogged: 3.50, stillWater: 19.80, marshyLand: 0.95, netAreaSown: 210.00 },
    { block: "Payyannur", zone: "Payyannur South", buildingCourtyard: 8.90, otherNonAgri: 5.90, barrenUncultivable: 35.60, miscTreeCrops: 6.30, permanentPastures: 2.90, cultivableWaste: 1.70, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.70, waterLogged: 3.20, stillWater: 18.20, marshyLand: 0.88, netAreaSown: 198.00 },
    { block: "Municipality", zone: "Taliparamba Municipality", buildingCourtyard: 15.20, otherNonAgri: 10.80, barrenUncultivable: 28.50, miscTreeCrops: 5.20, permanentPastures: 2.40, cultivableWaste: 1.40, otherFallow: 0.80, currentFallow: 1.20, socialForestry: 4.00, waterLogged: 2.80, stillWater: 15.60, marshyLand: 0.75, netAreaSown: 165.00 },
    { block: "Municipality", zone: "Iritty Municipality", buildingCourtyard: 13.80, otherNonAgri: 9.60, barrenUncultivable: 25.80, miscTreeCrops: 4.80, permanentPastures: 2.20, cultivableWaste: 1.30, otherFallow: 0.70, currentFallow: 1.10, socialForestry: 3.80, waterLogged: 2.60, stillWater: 14.20, marshyLand: 0.70, netAreaSown: 152.00 },
    { block: "Corporation", zone: "Kannur Corporation", buildingCourtyard: 25.40, otherNonAgri: 18.20, barrenUncultivable: 45.80, miscTreeCrops: 8.50, permanentPastures: 4.20, cultivableWaste: 2.80, otherFallow: 1.50, currentFallow: 2.20, socialForestry: 6.50, waterLogged: 5.20, stillWater: 28.40, marshyLand: 1.30, netAreaSown: 285.00 }
  ];

  const blockTotals = {};
  zoneData.forEach(row => {
    if (!blockTotals[row.block]) {
      blockTotals[row.block] = {
        buildingCourtyard: 0, otherNonAgri: 0, barrenUncultivable: 0,
        miscTreeCrops: 0, permanentPastures: 0, cultivableWaste: 0,
        otherFallow: 0, currentFallow: 0, socialForestry: 0,
        waterLogged: 0, stillWater: 0, marshyLand: 0, netAreaSown: 0,
        zoneCount: 0
      };
    }
    blockTotals[row.block].buildingCourtyard += row.buildingCourtyard;
    blockTotals[row.block].otherNonAgri += row.otherNonAgri;
    blockTotals[row.block].barrenUncultivable += row.barrenUncultivable;
    blockTotals[row.block].miscTreeCrops += row.miscTreeCrops;
    blockTotals[row.block].permanentPastures += row.permanentPastures;
    blockTotals[row.block].cultivableWaste += row.cultivableWaste;
    blockTotals[row.block].otherFallow += row.otherFallow;
    blockTotals[row.block].currentFallow += row.currentFallow;
    blockTotals[row.block].socialForestry += row.socialForestry;
    blockTotals[row.block].waterLogged += row.waterLogged;
    blockTotals[row.block].stillWater += row.stillWater;
    blockTotals[row.block].marshyLand += row.marshyLand;
    blockTotals[row.block].netAreaSown += row.netAreaSown;
    blockTotals[row.block].zoneCount += 1;
  });

  const grandTotals = Object.values(blockTotals).reduce((acc, block) => {
    acc.buildingCourtyard += block.buildingCourtyard;
    acc.otherNonAgri += block.otherNonAgri;
    acc.barrenUncultivable += block.barrenUncultivable;
    acc.miscTreeCrops += block.miscTreeCrops;
    acc.permanentPastures += block.permanentPastures;
    acc.cultivableWaste += block.cultivableWaste;
    acc.otherFallow += block.otherFallow;
    acc.currentFallow += block.currentFallow;
    acc.socialForestry += block.socialForestry;
    acc.waterLogged += block.waterLogged;
    acc.stillWater += block.stillWater;
    acc.marshyLand += block.marshyLand;
    acc.netAreaSown += block.netAreaSown;
    return acc;
  }, {
    buildingCourtyard: 0, otherNonAgri: 0, barrenUncultivable: 0,
    miscTreeCrops: 0, permanentPastures: 0, cultivableWaste: 0,
    otherFallow: 0, currentFallow: 0, socialForestry: 0,
    waterLogged: 0, stillWater: 0, marshyLand: 0, netAreaSown: 0
  });

  const irrigationData = [
    { zone: "North Zone", sourceType: "Tube well", irrigatedArea: 15.50, sourceCount: 3 },
    { zone: "North Zone", sourceType: "Private wells", irrigatedArea: 28.80, sourceCount: 10 },
    { zone: "North Zone", sourceType: "Private tanks", irrigatedArea: 8.20, sourceCount: 2 },
    { zone: "South Zone", sourceType: "Tube well", irrigatedArea: 12.80, sourceCount: 2 },
    { zone: "South Zone", sourceType: "Private wells", irrigatedArea: 22.40, sourceCount: 8 },
    { zone: "South Zone", sourceType: "Government tanks", irrigatedArea: 5.60, sourceCount: 1 },
    { zone: "East Zone", sourceType: "Private wells", irrigatedArea: 25.60, sourceCount: 9 },
    { zone: "East Zone", sourceType: "Private tanks", irrigatedArea: 12.20, sourceCount: 2 },
    { zone: "Iritty Central", sourceType: "Private wells", irrigatedArea: 18.50, sourceCount: 6 },
    { zone: "Iritty Central", sourceType: "Tube well", irrigatedArea: 6.80, sourceCount: 1 },
    { zone: "Iritty West", sourceType: "Tube well", irrigatedArea: 8.50, sourceCount: 1 },
    { zone: "Iritty West", sourceType: "Private wells", irrigatedArea: 15.80, sourceCount: 5 },
    { zone: "Payyannur North", sourceType: "Government tanks", irrigatedArea: 12.30, sourceCount: 1 },
    { zone: "Payyannur North", sourceType: "Private wells", irrigatedArea: 24.50, sourceCount: 8 },
    { zone: "Payyannur South", sourceType: "Private wells", irrigatedArea: 19.80, sourceCount: 7 },
    { zone: "Payyannur South", sourceType: "Tube well", irrigatedArea: 5.20, sourceCount: 1 },
    { zone: "Taliparamba Municipality", sourceType: "Private wells", irrigatedArea: 32.40, sourceCount: 12 },
    { zone: "Taliparamba Municipality", sourceType: "Government tanks", irrigatedArea: 15.60, sourceCount: 1 },
    { zone: "Taliparamba Municipality", sourceType: "Tube well", irrigatedArea: 8.90, sourceCount: 2 },
    { zone: "Iritty Municipality", sourceType: "Private wells", irrigatedArea: 28.60, sourceCount: 10 },
    { zone: "Iritty Municipality", sourceType: "Private tanks", irrigatedArea: 6.40, sourceCount: 1 },
    { zone: "Kannur Corporation", sourceType: "Private wells", irrigatedArea: 45.80, sourceCount: 18 },
    { zone: "Kannur Corporation", sourceType: "Tube well", irrigatedArea: 12.50, sourceCount: 3 },
    { zone: "Kannur Corporation", sourceType: "Government tanks", irrigatedArea: 8.20, sourceCount: 1 },
    { zone: "Kannur Corporation", sourceType: "Private tanks", irrigatedArea: 15.60, sourceCount: 2 }
  ];

  const groupedByBlock = {};
  zoneData.forEach(zone => {
    if (!groupedByBlock[zone.block]) groupedByBlock[zone.block] = [];
    groupedByBlock[zone.block].push(zone);
  });

  const irrigationMap = {};
  irrigationData.forEach(item => {
    if (!irrigationMap[item.zone]) {
      irrigationMap[item.zone] = {
        tubeWell: { count: 0, area: 0 },
        govtTanks: { count: 0, area: 0 },
        privateWells: { count: 0, area: 0 },
        privateTanks: { count: 0, area: 0 }
      };
    }
    switch (item.sourceType) {
      case "Tube well":
        irrigationMap[item.zone].tubeWell = { count: item.sourceCount, area: item.irrigatedArea };
        break;
      case "Government tanks":
        irrigationMap[item.zone].govtTanks = { count: item.sourceCount, area: item.irrigatedArea };
        break;
      case "Private wells":
        irrigationMap[item.zone].privateWells = { count: item.sourceCount, area: item.irrigatedArea };
        break;
      case "Private tanks":
        irrigationMap[item.zone].privateTanks = { count: item.sourceCount, area: item.irrigatedArea };
        break;
      default: break;
    }
  });

  const blockIrrigationTotals = {};
  Object.entries(groupedByBlock).forEach(([blockName, zones]) => {
    blockIrrigationTotals[blockName] = {
      tubeWell: { count: 0, area: 0 },
      govtTanks: { count: 0, area: 0 },
      privateWells: { count: 0, area: 0 },
      privateTanks: { count: 0, area: 0 }
    };
    zones.forEach(zone => {
      const irr = irrigationMap[zone.zone] || { tubeWell: { count: 0, area: 0 }, govtTanks: { count: 0, area: 0 }, privateWells: { count: 0, area: 0 }, privateTanks: { count: 0, area: 0 } };
      blockIrrigationTotals[blockName].tubeWell.count += irr.tubeWell.count;
      blockIrrigationTotals[blockName].tubeWell.area += irr.tubeWell.area;
      blockIrrigationTotals[blockName].govtTanks.count += irr.govtTanks.count;
      blockIrrigationTotals[blockName].govtTanks.area += irr.govtTanks.area;
      blockIrrigationTotals[blockName].privateWells.count += irr.privateWells.count;
      blockIrrigationTotals[blockName].privateWells.area += irr.privateWells.area;
      blockIrrigationTotals[blockName].privateTanks.count += irr.privateTanks.count;
      blockIrrigationTotals[blockName].privateTanks.area += irr.privateTanks.area;
    });
  });

  const grandIrrigationTotals = Object.values(blockIrrigationTotals).reduce((acc, block) => {
    acc.tubeWell.count += block.tubeWell.count;
    acc.tubeWell.area += block.tubeWell.area;
    acc.govtTanks.count += block.govtTanks.count;
    acc.govtTanks.area += block.govtTanks.area;
    acc.privateWells.count += block.privateWells.count;
    acc.privateWells.area += block.privateWells.area;
    acc.privateTanks.count += block.privateTanks.count;
    acc.privateTanks.area += block.privateTanks.area;
    return acc;
  }, {
    tubeWell: { count: 0, area: 0 },
    govtTanks: { count: 0, area: 0 },
    privateWells: { count: 0, area: 0 },
    privateTanks: { count: 0, area: 0 }
  });

  // `category` classifies each column as 'wet', 'dry', or 'always' (always visible
  // regardless of filter). Columns are never added/removed — the filter only
  // decides whether a cell shows its real value or a placeholder dash.
  const landUtilizationColumns = [
    { id: 'block', label: 'Block', align: 'center', minWidth: LU_BLOCK_W, category: 'always' },
    { id: 'zone', label: 'Zone', align: 'left', minWidth: LU_ZONE_W, category: 'always' },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', align: 'right', minWidth: 150, category: 'dry' },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', align: 'right', minWidth: 180, category: 'dry' },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', align: 'right', minWidth: 190, category: 'dry' },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', align: 'right', minWidth: 210, category: 'dry' },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', align: 'right', minWidth: 240, category: 'dry' },
    { id: 'cultivableWaste', label: 'Cultivable waste', align: 'right', minWidth: 130, category: 'dry' },
    { id: 'otherFallow', label: 'Other Fallow', align: 'right', minWidth: 110, category: 'dry' },
    { id: 'currentFallow', label: 'Current Fallow', align: 'right', minWidth: 120, category: 'dry' },
    { id: 'socialForestry', label: 'Area under Social Forestry', align: 'right', minWidth: 170, category: 'dry' },
    { id: 'waterLogged', label: 'Water logged area', align: 'right', minWidth: 140, category: 'wet' },
    { id: 'stillWater', label: 'Still water land (Water bodies)', align: 'right', minWidth: 190, category: 'wet' },
    { id: 'marshyLand', label: 'Marshy land', align: 'right', minWidth: 110, category: 'wet' },
    { id: 'netAreaSown', label: 'Net areas sown', align: 'right', minWidth: 130, category: 'always' }
  ];

  // Data columns only (Block/Zone excluded — those are handled separately as
  // the sticky identity cells).
  const landUtilizationDataColumns = landUtilizationColumns.slice(2);

  const isColumnActive = (col) =>
    col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  // Irrigation source types, tagged wet/dry so they respond to the same filter.
  // Government/Private tanks are surface-water sources (wet cultivation); tube
  // wells and private wells are groundwater sources (dry cultivation).
  const irrigationSourceTypes = [
    { key: 'tubeWell', label: 'Tube Well', category: 'dry', color: '#1565c0' },
    { key: 'govtTanks', label: 'Government Tanks', category: 'wet', color: '#2e7d32' },
    { key: 'privateWells', label: 'Private Wells', category: 'dry', color: '#ed6c02' },
    { key: 'privateTanks', label: 'Private Tanks', category: 'wet', color: '#9c27b0' }
  ];
  const isSourceActive = (source) =>
    landTypeFilter === 'all' || source.category === landTypeFilter;

  // Exact table widths derived from the column definitions — never guessed.
  const LU_TABLE_W = landUtilizationColumns.reduce((sum, c) => sum + c.minWidth, 0);
  const IRR_TABLE_W = IRR_BLOCK_W + IRR_ZONE_W + 4 * (IRR_COUNT_W + IRR_AREA_W);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const formatNumber = (num) => num.toFixed(2);
  const handleBack = () => navigate(-1);
  const handleZoneClick = (zoneName) => {
    navigate(`/schemes/earas/cce/Form2`, {
      state: {
        districtName: selectedDistrict,
        talukName: selectedTaluk,
        zoneName: zoneName,
        activeTab: activeTab
      }
    });
  };

  // Land Type filter options
  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

  // ---- Reusable sticky cell style (solid bg + border-box, widths come from <colgroup>) ----
  const stickyCellSx = (leftPx, bg, extra = {}) => ({
    position: 'sticky',
    left: leftPx,
    boxSizing: 'border-box',
    backgroundColor: bg,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...extra
  });

  // Shared table sx: fixed layout + separate borders are BOTH required for
  // sticky columns to stay pixel-aligned while scrolling/dragging.
  // (border-collapse: collapse lets borders "detach" from sticky cells.)
  const tableSx = (widthPx) => ({
    width: widthPx,
    minWidth: widthPx,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  });

  return (
    <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box
            onClick={handleBack}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              color: themeColor,
              '&:hover': { opacity: 0.7 }
            }}
          >
            <ArrowBack />
            <Typography variant="body2">Back</Typography>
          </Box>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            {selectedTaluk} Taluk ({selectedDistrict} District) - Zone wise Land Utilization & Irrigation Report
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Click on any Zone to view detailed report)
          </Typography>
        </Box>

        {/* Land Type Filter - applies to both Land Utilization and Irrigation Details */}
        <Paper
          elevation={0}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            mb: 2,
            overflow: 'hidden',
          }}
        >
          {landTypeOptions.map((opt, idx) => {
            const isActive = landTypeFilter === opt.value;
            return (
              <Box
                key={opt.value}
                onClick={() => setLandTypeFilter(opt.value)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2.5,
                  py: 1.25,
                  cursor: 'pointer',
                  borderRight: idx < landTypeOptions.length - 1
                    ? `1px solid ${alpha(theme.palette.divider, 0.15)}`
                    : 'none',
                  transition: '0.2s',
                  '&:hover': {
                    backgroundColor: alpha(themeColor, 0.04),
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    color: isActive ? themeColor : 'text.secondary',
                  }}
                >
                  {opt.icon}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                    }}
                  >
                    {opt.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 2.5,
                    borderRadius: 1,
                    backgroundColor: isActive ? themeColor : 'transparent',
                    transition: '0.2s',
                  }}
                />
              </Box>
            );
          })}
        </Paper>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(themeColor, 0.1)}` }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              bgcolor: alpha(themeColor, 0.05),
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem', py: 1.5 }
            }}
          >
            <Tab icon={<Agriculture sx={{ fontSize: 20 }} />} iconPosition="start" label="Land Utilization" />
            <Tab icon={<WaterDrop sx={{ fontSize: 20 }} />} iconPosition="start" label="Irrigation Details" />
          </Tabs>

          {/* ==================== LAND UTILIZATION TAB ==================== */}
          {activeTab === 0 && (
            <TableContainer sx={{ maxHeight: 550, overflow: 'auto' }}>
              <Table stickyHeader sx={tableSx(LU_TABLE_W)}>
                {/* colgroup is the ONLY place widths are defined */}
                <colgroup>
                  {landUtilizationColumns.map(col => (
                    <col key={col.id} style={{ width: col.minWidth }} />
                  ))}
                </colgroup>

                <TableHead>
                  <TableRow>
                    {landUtilizationColumns.map((col, index) => {
                      const isBlock = index === 0;
                      const isZone = index === 1;
                      const active = isColumnActive(col);
                      const baseSx = {
                        bgcolor: themeColor,
                        color: active ? 'white' : alpha('#ffffff', 0.5),
                        fontWeight: 700,
                        boxSizing: 'border-box',
                        py: 1.5,
                        borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                        '&:last-child': { borderRight: 'none' },
                        position: 'sticky',
                        top: 0,
                        zIndex: isBlock || isZone ? 4 : 3
                      };
                      return (
                        <TableCell
                          key={col.id}
                          align={col.align}
                          sx={
                            isBlock
                              ? { ...baseSx, left: 0 }
                              : isZone
                              ? { ...baseSx, left: LU_BLOCK_W }
                              : baseSx
                          }
                        >
                          {col.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedByBlock).map(([blockName, zones]) => {
                    const rows = [];
                    const blockTotal = blockTotals[blockName];

                    zones.forEach((zone, idx) => {
                      const isLastInGroup = idx === zones.length - 1;
                      rows.push(
                        <TableRow
                          key={`${blockName}-${zone.zone}`}
                          hover
                          onClick={() => handleZoneClick(zone.zone)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(themeColor, 0.08) } }}
                        >
                          {/*
                            NO rowSpan here. Every row owns its own sticky Block
                            cell (content only on the first row, bottom border
                            suppressed in between) so the "merged" look is kept
                            while sticky positioning stays perfectly aligned.
                          */}
                          <TableCell
                            align="center"
                            sx={{
                              ...stickyCellSx(0, stickyTintLight),
                              verticalAlign: 'middle',
                              fontWeight: 700,
                              borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                              borderBottom: isLastInGroup ? undefined : 'none',
                              zIndex: 2
                            }}
                          >
                            {idx === 0 && (
                              <Stack alignItems="center" spacing={0.5}>
                                <Store sx={{ fontSize: 28, color: themeColor, opacity: 0.8 }} />
                                <Typography fontWeight={700} color={themeColor} variant="subtitle1">
                                  {blockName}
                                </Typography>
                                <Chip
                                  label={`${zones.length} Zones`}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.1), color: themeColor }}
                                />
                              </Stack>
                            )}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{
                              ...stickyCellSx(LU_BLOCK_W, '#ffffff'),
                              zIndex: 1,
                              borderRight: `1px solid ${alpha(themeColor, 0.1)}`
                            }}
                          >
                            <Chip
                              label={zone.zone}
                              size="small"
                              sx={{
                                bgcolor: alpha(themeColor, 0.1),
                                color: themeColor,
                                fontWeight: 600,
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: alpha(themeColor, 0.2) }
                              }}
                            />
                          </TableCell>
                          {landUtilizationDataColumns.map((col) => {
                            const active = isColumnActive(col);
                            return (
                              <TableCell
                                key={col.id}
                                align="right"
                                sx={{
                                  fontWeight: col.id === 'netAreaSown' ? 600 : 400,
                                  color: active ? 'inherit' : 'text.disabled',
                                }}
                              >
                                {active ? formatNumber(zone[col.id]) : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    });

                    rows.push(
                      <TableRow key={`${blockName}-subtotal`} sx={{ bgcolor: stickyTintSubtotal }}>
                        {/*
                          colSpan is safe here because <colgroup> already fixed
                          the column grid — body colSpans can no longer shift it.
                        */}
                        <TableCell
                          colSpan={2}
                          sx={{
                            ...stickyCellSx(0, stickyTintSubtotal),
                            fontWeight: 700,
                            color: themeColor,
                            py: 1,
                            zIndex: 2
                          }}
                        >
                          <strong>📊 Total for {blockName}</strong>
                        </TableCell>
                        {landUtilizationDataColumns.map((col) => {
                          const active = isColumnActive(col);
                          return (
                            <TableCell
                              key={col.id}
                              align="right"
                              sx={{
                                fontWeight: 700,
                                bgcolor: stickyTintSubtotal,
                                color: active ? 'inherit' : 'text.disabled',
                              }}
                            >
                              {active ? formatNumber(blockTotal[col.id]) : '—'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );

                    return rows;
                  })}

                  <TableRow sx={{ bgcolor: stickyTintGrand }}>
                    <TableCell
                      colSpan={2}
                      sx={{
                        ...stickyCellSx(0, stickyTintGrand),
                        fontWeight: 800,
                        color: themeColor,
                        fontSize: '1rem',
                        py: 1.5,
                        zIndex: 2
                      }}
                    >
                      <strong>🏆 GRAND TOTAL</strong>
                    </TableCell>
                    {landUtilizationDataColumns.map((col) => {
                      const active = isColumnActive(col);
                      return (
                        <TableCell
                          key={col.id}
                          align="right"
                          sx={{
                            fontWeight: 800,
                            bgcolor: stickyTintGrand,
                            color: active ? 'inherit' : 'text.disabled',
                          }}
                        >
                          {active ? formatNumber(grandTotals[col.id]) : '—'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ==================== IRRIGATION DETAILS TAB ==================== */}
          {activeTab === 1 && (
            <TableContainer sx={{ maxHeight: 550, overflow: 'auto' }}>
              <Table stickyHeader sx={{ ...tableSx(IRR_TABLE_W), width: '100%' }}>
                {/*
                  10 real columns; group headers only span them visually.
                  Sticky columns keep fixed px widths (so left offsets stay
                  valid); the 8 data columns have NO width, so with
                  tableLayout: 'fixed' they share all remaining space equally
                  and the table always fills the container. On narrow screens
                  minWidth (IRR_TABLE_W) still forces horizontal scroll.
                */}
                <colgroup>
                  <col style={{ width: IRR_BLOCK_W }} />
                  <col style={{ width: IRR_ZONE_W }} />
                  {[0, 1, 2, 3].map(i => (
                    <React.Fragment key={i}>
                      <col />
                      <col />
                    </React.Fragment>
                  ))}
                </colgroup>

                <TableHead>
                  <TableRow>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        ...stickyCellSx(0, themeColor, { color: 'white' }),
                        top: 0,
                        fontWeight: 700,
                        verticalAlign: 'middle',
                        zIndex: 4
                      }}
                    >
                      Block
                    </TableCell>
                    <TableCell
                      rowSpan={2}
                      align="center"
                      sx={{
                        ...stickyCellSx(IRR_BLOCK_W, themeColor, { color: 'white' }),
                        top: 0,
                        fontWeight: 700,
                        verticalAlign: 'middle',
                        zIndex: 4
                      }}
                    >
                      Zone
                    </TableCell>
                    {irrigationSourceTypes.map((source) => {
                      const active = isSourceActive(source);
                      return (
                        <TableCell
                          key={source.key}
                          colSpan={2}
                          align="center"
                          sx={{
                            bgcolor: themeColor,
                            color: active ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            height: IRR_HEADER_ROW1_H,
                            py: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 3
                          }}
                        >
                          {source.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    {irrigationSourceTypes.flatMap((source) => {
                      const active = isSourceActive(source);
                      return ['Count', 'Area (Ha)'].map((label, i) => (
                        <TableCell
                          key={`${source.key}-${i}`}
                          align="center"
                          sx={{
                            bgcolor: stickyHeaderSub,
                            color: active ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            position: 'sticky',
                            top: IRR_HEADER_ROW1_H, // exactly the height of row 1
                            zIndex: 3
                          }}
                        >
                          {label}
                        </TableCell>
                      ));
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedByBlock).map(([blockName, zones]) => {
                    const rows = [];

                    zones.forEach((zone, idx) => {
                      const isLastInGroup = idx === zones.length - 1;
                      const irr = irrigationMap[zone.zone] || {
                        tubeWell: { count: 0, area: 0 },
                        govtTanks: { count: 0, area: 0 },
                        privateWells: { count: 0, area: 0 },
                        privateTanks: { count: 0, area: 0 }
                      };

                      rows.push(
                        <TableRow
                          key={`${blockName}-${zone.zone}`}
                          hover
                          onClick={() => handleZoneClick(zone.zone)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(themeColor, 0.08) } }}
                        >
                          {/* Per-row sticky block cell — same pattern as tab 1 */}
                          <TableCell
                            align="center"
                            sx={{
                              ...stickyCellSx(0, stickyTintLight),
                              verticalAlign: 'middle',
                              fontWeight: 700,
                              borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                              borderBottom: isLastInGroup ? undefined : 'none',
                              zIndex: 2
                            }}
                          >
                            {idx === 0 && (
                              <Stack alignItems="center" spacing={0.5}>
                                <Store sx={{ fontSize: 24, color: themeColor }} />
                                <Typography fontWeight={700} color={themeColor}>{blockName}</Typography>
                              </Stack>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...stickyCellSx(IRR_BLOCK_W, '#ffffff'),
                              zIndex: 1,
                              borderRight: `1px solid ${alpha(themeColor, 0.1)}`
                            }}
                          >
                            <Chip
                              label={zone.zone}
                              size="small"
                              sx={{
                                bgcolor: alpha(themeColor, 0.1),
                                color: themeColor,
                                fontWeight: 500,
                                '&:hover': { bgcolor: alpha(themeColor, 0.2) }
                              }}
                            />
                          </TableCell>
                          {irrigationSourceTypes.map((source) => {
                            const active = isSourceActive(source);
                            const data = irr[source.key];
                            return (
                              <React.Fragment key={source.key}>
                                <TableCell align="center">
                                  {active && data.count > 0 ? (
                                    <Chip
                                      label={data.count}
                                      size="small"
                                      sx={{ bgcolor: alpha(source.color, 0.1), color: source.color, fontWeight: 600, minWidth: 40 }}
                                    />
                                  ) : (
                                    <Box component="span" sx={{ color: active ? 'inherit' : 'text.disabled' }}>-</Box>
                                  )}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 500, color: active ? 'inherit' : 'text.disabled' }}>
                                  {active && data.area > 0 ? formatNumber(data.area) : '-'}
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                        </TableRow>
                      );
                    });

                    const blockTotal = blockIrrigationTotals[blockName];
                    rows.push(
                      <TableRow key={`${blockName}-subtotal-irr`} sx={{ bgcolor: stickyTintSubtotal }}>
                        <TableCell
                          colSpan={2}
                          sx={{
                            ...stickyCellSx(0, stickyTintSubtotal),
                            fontWeight: 700,
                            color: themeColor,
                            py: 1,
                            zIndex: 2
                          }}
                        >
                          <strong>📊 Total for {blockName}</strong>
                        </TableCell>
                        {irrigationSourceTypes.map((source) => {
                          const active = isSourceActive(source);
                          const t = blockTotal[source.key];
                          return (
                            <React.Fragment key={source.key}>
                              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: stickyTintSubtotal, color: active ? 'inherit' : 'text.disabled' }}>
                                {active && t.count > 0 ? t.count : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: stickyTintSubtotal, color: active ? 'inherit' : 'text.disabled' }}>
                                {active && t.area > 0 ? formatNumber(t.area) : '-'}
                              </TableCell>
                            </React.Fragment>
                          );
                        })}
                      </TableRow>
                    );

                    return rows;
                  })}

                  <TableRow sx={{ bgcolor: stickyTintGrand }}>
                    <TableCell
                      colSpan={2}
                      sx={{
                        ...stickyCellSx(0, stickyTintGrand),
                        fontWeight: 800,
                        color: themeColor,
                        fontSize: '1rem',
                        py: 1.5,
                        zIndex: 2
                      }}
                    >
                      <strong>🏆 GRAND TOTAL</strong>
                    </TableCell>
                    {irrigationSourceTypes.map((source) => {
                      const active = isSourceActive(source);
                      const t = grandIrrigationTotals[source.key];
                      return (
                        <React.Fragment key={source.key}>
                          <TableCell align="center" sx={{ fontWeight: 800, bgcolor: stickyTintGrand, color: active ? 'inherit' : 'text.disabled' }}>
                            {active ? t.count : '—'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, bgcolor: stickyTintGrand, color: active ? 'inherit' : 'text.disabled' }}>
                            {active ? formatNumber(t.area) : '—'}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </CardContent>
    </Card>
  );
};

export default ZoneForm2;
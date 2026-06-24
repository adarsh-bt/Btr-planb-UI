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
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const ZoneForm2 = () => {
  const theme = useTheme();
  const themeColor = "#05307a";
  const navigate = useNavigate();
  const location = useLocation();

  // Get district name, taluk name, and active tab from navigation state
  const selectedDistrict = location.state?.districtName || location.state?.selectedDistrict || "Kannur";
  const selectedTaluk = location.state?.talukName || location.state?.selectedTaluk || "Taliparamba";
  const initialTab = location.state?.activeTab || 0;

  const [activeTab, setActiveTab] = useState(initialTab);

  // Zone data grouped by Block - comprehensive dummy data
  const zoneData = [
    // Taliparamba Block - 3 zones
    { block: "Taliparamba", zone: "North Zone", buildingCourtyard: 12.50, otherNonAgri: 8.30, barrenUncultivable: 42.20, miscTreeCrops: 7.40, permanentPastures: 3.60, cultivableWaste: 2.10, otherFallow: 1.20, currentFallow: 1.80, socialForestry: 5.70, waterLogged: 4.20, stillWater: 22.80, marshyLand: 1.10, netAreaSown: 267.00 },
    { block: "Taliparamba", zone: "South Zone", buildingCourtyard: 10.80, otherNonAgri: 7.20, barrenUncultivable: 38.50, miscTreeCrops: 6.80, permanentPastures: 3.20, cultivableWaste: 1.90, otherFallow: 1.00, currentFallow: 1.60, socialForestry: 5.20, waterLogged: 3.80, stillWater: 20.40, marshyLand: 1.00, netAreaSown: 242.00 },
    { block: "Taliparamba", zone: "East Zone", buildingCourtyard: 11.20, otherNonAgri: 7.80, barrenUncultivable: 40.10, miscTreeCrops: 7.10, permanentPastures: 3.40, cultivableWaste: 2.00, otherFallow: 1.10, currentFallow: 1.70, socialForestry: 5.50, waterLogged: 4.00, stillWater: 21.60, marshyLand: 1.05, netAreaSown: 258.00 },
    
    // Iritty Block - 2 zones
    { block: "Iritty", zone: "Iritty Central", buildingCourtyard: 8.40, otherNonAgri: 5.60, barrenUncultivable: 35.20, miscTreeCrops: 6.20, permanentPastures: 2.80, cultivableWaste: 1.70, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.80, waterLogged: 3.20, stillWater: 18.40, marshyLand: 0.90, netAreaSown: 195.00 },
    { block: "Iritty", zone: "Iritty West", buildingCourtyard: 7.80, otherNonAgri: 5.20, barrenUncultivable: 32.80, miscTreeCrops: 5.80, permanentPastures: 2.60, cultivableWaste: 1.50, otherFallow: 0.80, currentFallow: 1.30, socialForestry: 4.50, waterLogged: 2.90, stillWater: 17.20, marshyLand: 0.85, netAreaSown: 182.00 },
    
    // Payyannur Block - 2 zones
    { block: "Payyannur", zone: "Payyannur North", buildingCourtyard: 9.60, otherNonAgri: 6.40, barrenUncultivable: 38.50, miscTreeCrops: 6.80, permanentPastures: 3.10, cultivableWaste: 1.80, otherFallow: 1.00, currentFallow: 1.50, socialForestry: 5.00, waterLogged: 3.50, stillWater: 19.80, marshyLand: 0.95, netAreaSown: 210.00 },
    { block: "Payyannur", zone: "Payyannur South", buildingCourtyard: 8.90, otherNonAgri: 5.90, barrenUncultivable: 35.60, miscTreeCrops: 6.30, permanentPastures: 2.90, cultivableWaste: 1.70, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.70, waterLogged: 3.20, stillWater: 18.20, marshyLand: 0.88, netAreaSown: 198.00 },
    
    // Municipality - 2 zones
    { block: "Municipality", zone: "Taliparamba Municipality", buildingCourtyard: 15.20, otherNonAgri: 10.80, barrenUncultivable: 28.50, miscTreeCrops: 5.20, permanentPastures: 2.40, cultivableWaste: 1.40, otherFallow: 0.80, currentFallow: 1.20, socialForestry: 4.00, waterLogged: 2.80, stillWater: 15.60, marshyLand: 0.75, netAreaSown: 165.00 },
    { block: "Municipality", zone: "Iritty Municipality", buildingCourtyard: 13.80, otherNonAgri: 9.60, barrenUncultivable: 25.80, miscTreeCrops: 4.80, permanentPastures: 2.20, cultivableWaste: 1.30, otherFallow: 0.70, currentFallow: 1.10, socialForestry: 3.80, waterLogged: 2.60, stillWater: 14.20, marshyLand: 0.70, netAreaSown: 152.00 },
    
    // Corporation - 1 zone
    { block: "Corporation", zone: "Kannur Corporation", buildingCourtyard: 25.40, otherNonAgri: 18.20, barrenUncultivable: 45.80, miscTreeCrops: 8.50, permanentPastures: 4.20, cultivableWaste: 2.80, otherFallow: 1.50, currentFallow: 2.20, socialForestry: 6.50, waterLogged: 5.20, stillWater: 28.40, marshyLand: 1.30, netAreaSown: 285.00 }
  ];

  // Calculate block totals
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

  // Calculate grand totals
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

  // Comprehensive Irrigation data by zone
  const irrigationData = [
    // Taliparamba Block zones
    { zone: "North Zone", sourceType: "Tube well", irrigatedArea: 15.50, sourceCount: 3 },
    { zone: "North Zone", sourceType: "Private wells", irrigatedArea: 28.80, sourceCount: 10 },
    { zone: "North Zone", sourceType: "Private tanks", irrigatedArea: 8.20, sourceCount: 2 },
    { zone: "South Zone", sourceType: "Tube well", irrigatedArea: 12.80, sourceCount: 2 },
    { zone: "South Zone", sourceType: "Private wells", irrigatedArea: 22.40, sourceCount: 8 },
    { zone: "South Zone", sourceType: "Government tanks", irrigatedArea: 5.60, sourceCount: 1 },
    { zone: "East Zone", sourceType: "Private wells", irrigatedArea: 25.60, sourceCount: 9 },
    { zone: "East Zone", sourceType: "Private tanks", irrigatedArea: 12.20, sourceCount: 2 },
    
    // Iritty Block zones
    { zone: "Iritty Central", sourceType: "Private wells", irrigatedArea: 18.50, sourceCount: 6 },
    { zone: "Iritty Central", sourceType: "Tube well", irrigatedArea: 6.80, sourceCount: 1 },
    { zone: "Iritty West", sourceType: "Tube well", irrigatedArea: 8.50, sourceCount: 1 },
    { zone: "Iritty West", sourceType: "Private wells", irrigatedArea: 15.80, sourceCount: 5 },
    
    // Payyannur Block zones
    { zone: "Payyannur North", sourceType: "Government tanks", irrigatedArea: 12.30, sourceCount: 1 },
    { zone: "Payyannur North", sourceType: "Private wells", irrigatedArea: 24.50, sourceCount: 8 },
    { zone: "Payyannur South", sourceType: "Private wells", irrigatedArea: 19.80, sourceCount: 7 },
    { zone: "Payyannur South", sourceType: "Tube well", irrigatedArea: 5.20, sourceCount: 1 },
    
    // Municipality zones
    { zone: "Taliparamba Municipality", sourceType: "Private wells", irrigatedArea: 32.40, sourceCount: 12 },
    { zone: "Taliparamba Municipality", sourceType: "Government tanks", irrigatedArea: 15.60, sourceCount: 1 },
    { zone: "Taliparamba Municipality", sourceType: "Tube well", irrigatedArea: 8.90, sourceCount: 2 },
    { zone: "Iritty Municipality", sourceType: "Private wells", irrigatedArea: 28.60, sourceCount: 10 },
    { zone: "Iritty Municipality", sourceType: "Private tanks", irrigatedArea: 6.40, sourceCount: 1 },
    
    // Corporation zone
    { zone: "Kannur Corporation", sourceType: "Private wells", irrigatedArea: 45.80, sourceCount: 18 },
    { zone: "Kannur Corporation", sourceType: "Tube well", irrigatedArea: 12.50, sourceCount: 3 },
    { zone: "Kannur Corporation", sourceType: "Government tanks", irrigatedArea: 8.20, sourceCount: 1 },
    { zone: "Kannur Corporation", sourceType: "Private tanks", irrigatedArea: 15.60, sourceCount: 2 }
  ];

  // Group zones by block for rendering with rowSpan
  const groupedByBlock = {};
  zoneData.forEach(zone => {
    if (!groupedByBlock[zone.block]) {
      groupedByBlock[zone.block] = [];
    }
    groupedByBlock[zone.block].push(zone);
  });

  // Create irrigation map by zone
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
    switch(item.sourceType) {
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

  // Calculate block irrigation totals
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

  // Calculate grand irrigation totals
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

  const landUtilizationColumns = [
    { id: 'block', label: 'Block', align: 'center', minWidth: 160 },
    { id: 'zone', label: 'Zone', align: 'left', minWidth: 180 },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', align: 'right', minWidth: 150 },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', align: 'right', minWidth: 180 },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', align: 'right', minWidth: 190 },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', align: 'right', minWidth: 210 },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', align: 'right', minWidth: 240 },
    { id: 'cultivableWaste', label: 'Cultivable waste', align: 'right', minWidth: 130 },
    { id: 'otherFallow', label: 'Other Fallow', align: 'right', minWidth: 110 },
    { id: 'currentFallow', label: 'Current Fallow', align: 'right', minWidth: 120 },
    { id: 'socialForestry', label: 'Area under Social Forestry', align: 'right', minWidth: 170 },
    { id: 'waterLogged', label: 'Water logged area', align: 'right', minWidth: 140 },
    { id: 'stillWater', label: 'Still water land (Water bodies)', align: 'right', minWidth: 190 },
    { id: 'marshyLand', label: 'Marshy land', align: 'right', minWidth: 110 },
    { id: 'netAreaSown', label: 'Net areas sown', align: 'right', minWidth: 130 }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num) => num.toFixed(2);

  const handleBack = () => {
    navigate(-1);
  };

  const handleZoneClick = (zoneName) => {
    // Navigate to Form2 (or next level) with tab state
    navigate(`/schemes/earas/cce/Form2`, {
      state: {
        districtName: selectedDistrict,
        talukName: selectedTaluk,
        zoneName: zoneName,
        activeTab: activeTab
      }
    });
  };

  return (
    <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* Header with Back Button */}
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

        {/* Tabs */}
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
              <Table stickyHeader sx={{ minWidth: 2400 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: themeColor }}>
                    {landUtilizationColumns.map((col, index) => (
                      <TableCell 
                        key={col.id} 
                        align={col.align}
                        sx={{ 
                          bgcolor: themeColor, 
                          color: 'white', 
                          fontWeight: 700, 
                          minWidth: col.minWidth,
                          py: 1.5,
                          borderRight: `1px solid ${alpha('#fff', 0.1)}`,
                          '&:last-child': { borderRight: 'none' },
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          left: index < 2 ? (index === 0 ? 0 : 160) : 'auto',
                          ...(index < 2 && { 
                            position: 'sticky',
                            backgroundColor: themeColor,
                          })
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedByBlock).map(([blockName, zones]) => {
                    const rows = [];
                    const blockTotal = blockTotals[blockName];
                    
                    // Zone rows
                    zones.forEach((zone, idx) => {
                      rows.push(
                        <TableRow 
                          key={`${blockName}-${zone.zone}`} 
                          hover 
                          onClick={() => handleZoneClick(zone.zone)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: alpha(themeColor, 0.08) }
                          }}
                        >
                          {idx === 0 && (
                            <TableCell 
                              rowSpan={zones.length} 
                              align="center"
                              sx={{ 
                                verticalAlign: 'middle', 
                                bgcolor: alpha(themeColor, 0.06),
                                fontWeight: 700,
                                borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                borderBottom: 'none',
                                position: 'sticky',
                                left: 0,
                                zIndex: 1,
                                backgroundColor: alpha(themeColor, 0.06)
                              }}
                            >
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
                            </TableCell>
                          )}
                          <TableCell 
                            align="left"
                            sx={{ 
                              position: 'sticky', 
                              left: 160, 
                              backgroundColor: 'white',
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
                                '&:hover': {
                                  bgcolor: alpha(themeColor, 0.2),
                                }
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">{formatNumber(zone.buildingCourtyard)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.otherNonAgri)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.barrenUncultivable)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.miscTreeCrops)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.permanentPastures)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.cultivableWaste)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.otherFallow)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.currentFallow)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.socialForestry)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.waterLogged)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.stillWater)}</TableCell>
                          <TableCell align="right">{formatNumber(zone.marshyLand)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{formatNumber(zone.netAreaSown)}</TableCell>
                        </TableRow>
                      );
                    });
                    
                    // Block subtotal row
                    rows.push(
                      <TableRow key={`${blockName}-subtotal`} sx={{ bgcolor: alpha(themeColor, 0.08) }}>
                        <TableCell 
                          colSpan={2} 
                          sx={{ 
                            fontWeight: 700, 
                            color: themeColor, 
                            py: 1,
                            position: 'sticky',
                            left: 0,
                            backgroundColor: alpha(themeColor, 0.08),
                            zIndex: 1
                          }}
                        >
                          <strong>📊 Total for {blockName}</strong>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.buildingCourtyard)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.otherNonAgri)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.barrenUncultivable)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.miscTreeCrops)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.permanentPastures)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.cultivableWaste)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.otherFallow)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.currentFallow)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.socialForestry)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.waterLogged)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.stillWater)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.marshyLand)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatNumber(blockTotal.netAreaSown)}</TableCell>
                      </TableRow>
                    );
                    
                    return rows;
                  })}
                  
                  {/* Grand Total */}
                  <TableRow sx={{ bgcolor: alpha(themeColor, 0.15) }}>
                    <TableCell 
                      colSpan={2} 
                      sx={{ 
                        fontWeight: 800, 
                        color: themeColor, 
                        fontSize: '1rem', 
                        py: 1.5,
                        position: 'sticky',
                        left: 0,
                        backgroundColor: alpha(themeColor, 0.15),
                        zIndex: 1
                      }}
                    >
                      <strong>🏆 GRAND TOTAL</strong>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.buildingCourtyard)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.otherNonAgri)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.barrenUncultivable)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.miscTreeCrops)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.permanentPastures)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.cultivableWaste)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.otherFallow)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.currentFallow)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.socialForestry)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.waterLogged)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.stillWater)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.marshyLand)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandTotals.netAreaSown)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ==================== IRRIGATION DETAILS TAB ==================== */}
          {activeTab === 1 && (
            <TableContainer sx={{ maxHeight: 550, overflow: 'auto' }}>
              <Table stickyHeader sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      rowSpan={2} 
                      align="center" 
                      sx={{ 
                        bgcolor: themeColor, 
                        color: 'white', 
                        fontWeight: 700, 
                        minWidth: 140, 
                        verticalAlign: 'middle',
                        position: 'sticky',
                        left: 0,
                        zIndex: 3
                      }}
                    >
                      Block
                    </TableCell>
                    <TableCell 
                      rowSpan={2} 
                      align="center" 
                      sx={{ 
                        bgcolor: themeColor, 
                        color: 'white', 
                        fontWeight: 700, 
                        minWidth: 170, 
                        verticalAlign: 'middle',
                        position: 'sticky',
                        left: 140,
                        zIndex: 3
                      }}
                    >
                      Zone
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ bgcolor: themeColor, color: 'white', fontWeight: 700, minWidth: 140 }}>
                      Tube Well
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ bgcolor: themeColor, color: 'white', fontWeight: 700, minWidth: 160 }}>
                      Government Tanks
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ bgcolor: themeColor, color: 'white', fontWeight: 700, minWidth: 140 }}>
                      Private Wells
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ bgcolor: themeColor, color: 'white', fontWeight: 700, minWidth: 140 }}>
                      Private Tanks
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 60, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Count</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 80, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Area (Ha)</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 60, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Count</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 80, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Area (Ha)</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 60, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Count</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 80, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Area (Ha)</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 60, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Count</TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 80, position: 'sticky', top: 57, backgroundColor: alpha(themeColor, 0.85), zIndex: 2 }}>Area (Ha)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedByBlock).map(([blockName, zones]) => {
                    const rows = [];
                    
                    zones.forEach((zone, idx) => {
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
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: alpha(themeColor, 0.08) }
                          }}
                        >
                          {idx === 0 && (
                            <TableCell 
                              rowSpan={zones.length} 
                              align="center"
                              sx={{ 
                                verticalAlign: 'middle', 
                                bgcolor: alpha(themeColor, 0.06),
                                fontWeight: 700,
                                borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                position: 'sticky',
                                left: 0,
                                zIndex: 1,
                                backgroundColor: alpha(themeColor, 0.06)
                              }}
                            >
                              <Stack alignItems="center" spacing={0.5}>
                                <Store sx={{ fontSize: 24, color: themeColor }} />
                                <Typography fontWeight={700} color={themeColor}>{blockName}</Typography>
                              </Stack>
                            </TableCell>
                          )}
                          <TableCell 
                            sx={{ 
                              position: 'sticky', 
                              left: 140, 
                              backgroundColor: 'white',
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
                                '&:hover': {
                                  bgcolor: alpha(themeColor, 0.2),
                                }
                              }} 
                            />
                          </TableCell>
                          <TableCell align="center">
                            {irr.tubeWell.count > 0 ? (
                              <Chip label={irr.tubeWell.count} size="small" sx={{ bgcolor: alpha('#1565c0', 0.1), color: '#1565c0', fontWeight: 600, minWidth: 40 }} />
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {irr.tubeWell.area > 0 ? formatNumber(irr.tubeWell.area) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {irr.govtTanks.count > 0 ? (
                              <Chip label={irr.govtTanks.count} size="small" sx={{ bgcolor: alpha('#2e7d32', 0.1), color: '#2e7d32', fontWeight: 600, minWidth: 40 }} />
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {irr.govtTanks.area > 0 ? formatNumber(irr.govtTanks.area) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {irr.privateWells.count > 0 ? (
                              <Chip label={irr.privateWells.count} size="small" sx={{ bgcolor: alpha('#ed6c02', 0.1), color: '#ed6c02', fontWeight: 600, minWidth: 40 }} />
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {irr.privateWells.area > 0 ? formatNumber(irr.privateWells.area) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {irr.privateTanks.count > 0 ? (
                              <Chip label={irr.privateTanks.count} size="small" sx={{ bgcolor: alpha('#9c27b0', 0.1), color: '#9c27b0', fontWeight: 600, minWidth: 40 }} />
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {irr.privateTanks.area > 0 ? formatNumber(irr.privateTanks.area) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    });
                    
                    // Block subtotal for irrigation
                    const blockTotal = blockIrrigationTotals[blockName];
                    rows.push(
                      <TableRow key={`${blockName}-subtotal-irr`} sx={{ bgcolor: alpha(themeColor, 0.08) }}>
                        <TableCell 
                          colSpan={2} 
                          sx={{ 
                            fontWeight: 700, 
                            color: themeColor, 
                            py: 1,
                            position: 'sticky',
                            left: 0,
                            backgroundColor: alpha(themeColor, 0.08),
                            zIndex: 1
                          }}
                        >
                          <strong>📊 Total for {blockName}</strong>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{blockTotal.tubeWell.count > 0 ? blockTotal.tubeWell.count : '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{blockTotal.tubeWell.area > 0 ? formatNumber(blockTotal.tubeWell.area) : '-'}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{blockTotal.govtTanks.count > 0 ? blockTotal.govtTanks.count : '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{blockTotal.govtTanks.area > 0 ? formatNumber(blockTotal.govtTanks.area) : '-'}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{blockTotal.privateWells.count > 0 ? blockTotal.privateWells.count : '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{blockTotal.privateWells.area > 0 ? formatNumber(blockTotal.privateWells.area) : '-'}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{blockTotal.privateTanks.count > 0 ? blockTotal.privateTanks.count : '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{blockTotal.privateTanks.area > 0 ? formatNumber(blockTotal.privateTanks.area) : '-'}</TableCell>
                      </TableRow>
                    );
                    
                    return rows;
                  })}
                  
                  {/* Grand Total for Irrigation */}
                  <TableRow sx={{ bgcolor: alpha(themeColor, 0.15) }}>
                    <TableCell 
                      colSpan={2} 
                      sx={{ 
                        fontWeight: 800, 
                        color: themeColor, 
                        fontSize: '1rem', 
                        py: 1.5,
                        position: 'sticky',
                        left: 0,
                        backgroundColor: alpha(themeColor, 0.15),
                        zIndex: 1
                      }}
                    >
                      <strong>🏆 GRAND TOTAL</strong>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{grandIrrigationTotals.tubeWell.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandIrrigationTotals.tubeWell.area)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{grandIrrigationTotals.govtTanks.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandIrrigationTotals.govtTanks.area)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{grandIrrigationTotals.privateWells.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandIrrigationTotals.privateWells.area)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>{grandIrrigationTotals.privateTanks.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatNumber(grandIrrigationTotals.privateTanks.area)}</TableCell>
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
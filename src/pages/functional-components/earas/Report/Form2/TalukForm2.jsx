import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const TalukForm2 = () => {
  const theme = useTheme();
  const themeColor = "#05307a";
  const navigate = useNavigate();
  const location = useLocation();

  // Get district name and active tab from navigation state
  const selectedDistrict = location.state?.districtName || location.state?.selectedDistrict || "Kannur";
  const initialTab = location.state?.activeTab || 0;
  
  // Tab state
  const [activeTab, setActiveTab] = useState(initialTab);

  // Taluk level data for different districts
  const talukDataMap = {
    "Kannur": [
      { taluk: "Taliparamba", buildingCourtyard: 28.50, otherNonAgri: 18.30, barrenUncultivable: 89.20, miscTreeCrops: 15.40, permanentPastures: 7.60, cultivableWaste: 5.10, otherFallow: 2.50, currentFallow: 3.80, socialForestry: 11.70, waterLogged: 9.20, stillWater: 48.80, marshyLand: 2.30, netAreaSown: 890.60 },
      { taluk: "Kannur", buildingCourtyard: 32.40, otherNonAgri: 21.60, barrenUncultivable: 98.50, miscTreeCrops: 18.90, permanentPastures: 8.40, cultivableWaste: 5.80, otherFallow: 2.90, currentFallow: 4.20, socialForestry: 13.50, waterLogged: 10.80, stillWater: 54.30, marshyLand: 2.60, netAreaSown: 1020.40 },
      { taluk: "Thalassery", buildingCourtyard: 24.80, otherNonAgri: 16.20, barrenUncultivable: 82.40, miscTreeCrops: 14.20, permanentPastures: 6.80, cultivableWaste: 4.60, otherFallow: 2.20, currentFallow: 3.40, socialForestry: 10.80, waterLogged: 8.40, stillWater: 44.20, marshyLand: 2.10, netAreaSown: 780.50 },
      { taluk: "Iritty", buildingCourtyard: 18.60, otherNonAgri: 12.80, barrenUncultivable: 76.30, miscTreeCrops: 12.80, permanentPastures: 6.20, cultivableWaste: 4.20, otherFallow: 2.00, currentFallow: 3.10, socialForestry: 9.80, waterLogged: 7.20, stillWater: 39.40, marshyLand: 1.90, netAreaSown: 680.30 },
      { taluk: "Payyannur", buildingCourtyard: 22.90, otherNonAgri: 15.40, barrenUncultivable: 85.70, miscTreeCrops: 15.80, permanentPastures: 7.40, cultivableWaste: 5.00, otherFallow: 2.40, currentFallow: 3.60, socialForestry: 11.20, waterLogged: 8.90, stillWater: 46.50, marshyLand: 2.20, netAreaSown: 820.70 }
    ],
    "Thiruvananthapuram": [
      { taluk: "Thiruvananthapuram", buildingCourtyard: 45.20, otherNonAgri: 32.40, barrenUncultivable: 120.50, miscTreeCrops: 28.60, permanentPastures: 12.40, cultivableWaste: 8.20, otherFallow: 4.50, currentFallow: 6.80, socialForestry: 18.90, waterLogged: 15.40, stillWater: 78.60, marshyLand: 3.80, netAreaSown: 1250.80 },
      { taluk: "Neyyattinkara", buildingCourtyard: 38.60, otherNonAgri: 27.80, barrenUncultivable: 98.40, miscTreeCrops: 24.20, permanentPastures: 10.80, cultivableWaste: 6.90, otherFallow: 3.80, currentFallow: 5.60, socialForestry: 16.20, waterLogged: 12.80, stillWater: 65.40, marshyLand: 3.20, netAreaSown: 1080.40 },
      { taluk: "Nedumangad", buildingCourtyard: 32.80, otherNonAgri: 23.60, barrenUncultivable: 85.60, miscTreeCrops: 20.80, permanentPastures: 9.40, cultivableWaste: 5.80, otherFallow: 3.20, currentFallow: 4.80, socialForestry: 14.20, waterLogged: 10.80, stillWater: 56.80, marshyLand: 2.80, netAreaSown: 920.60 }
    ],
    "Ernakulam": [
      { taluk: "Aluva", buildingCourtyard: 52.40, otherNonAgri: 38.60, barrenUncultivable: 95.80, miscTreeCrops: 32.40, permanentPastures: 14.80, cultivableWaste: 9.80, otherFallow: 5.20, currentFallow: 7.80, socialForestry: 22.40, waterLogged: 18.60, stillWater: 92.40, marshyLand: 4.60, netAreaSown: 1480.60 },
      { taluk: "Kochi", buildingCourtyard: 68.40, otherNonAgri: 48.20, barrenUncultivable: 78.60, miscTreeCrops: 28.40, permanentPastures: 12.80, cultivableWaste: 8.40, otherFallow: 4.80, currentFallow: 6.40, socialForestry: 19.80, waterLogged: 22.40, stillWater: 108.60, marshyLand: 5.80, netAreaSown: 1680.40 },
      { taluk: "Muvattupuzha", buildingCourtyard: 42.60, otherNonAgri: 31.80, barrenUncultivable: 112.40, miscTreeCrops: 28.60, permanentPastures: 12.40, cultivableWaste: 8.20, otherFallow: 4.20, currentFallow: 6.20, socialForestry: 18.40, waterLogged: 14.60, stillWater: 82.40, marshyLand: 3.80, netAreaSown: 1280.60 }
    ],
    "Kozhikode": [
      { taluk: "Kozhikode", buildingCourtyard: 48.60, otherNonAgri: 36.40, barrenUncultivable: 102.80, miscTreeCrops: 28.40, permanentPastures: 12.80, cultivableWaste: 8.60, otherFallow: 4.20, currentFallow: 6.40, socialForestry: 18.60, waterLogged: 16.40, stillWater: 72.60, marshyLand: 3.60, netAreaSown: 1280.80 },
      { taluk: "Vadakara", buildingCourtyard: 38.40, otherNonAgri: 28.60, barrenUncultivable: 92.40, miscTreeCrops: 24.60, permanentPastures: 10.80, cultivableWaste: 7.20, otherFallow: 3.60, currentFallow: 5.40, socialForestry: 16.20, waterLogged: 13.80, stillWater: 62.40, marshyLand: 3.00, netAreaSown: 1080.40 }
    ]
  };

  // Irrigation data by taluk for different districts
  const irrigationDataMap = {
    "Kannur": [
      { taluk: "Taliparamba", sourceType: "Tube well", irrigatedArea: 45.50, sourceCount: 8 },
      { taluk: "Taliparamba", sourceType: "Government tanks", irrigatedArea: 32.30, sourceCount: 2 },
      { taluk: "Taliparamba", sourceType: "Private wells", irrigatedArea: 78.80, sourceCount: 28 },
      { taluk: "Taliparamba", sourceType: "Private tanks", irrigatedArea: 32.20, sourceCount: 4 },
      { taluk: "Kannur", sourceType: "Tube well", irrigatedArea: 52.40, sourceCount: 10 },
      { taluk: "Kannur", sourceType: "Government tanks", irrigatedArea: 38.60, sourceCount: 3 },
      { taluk: "Kannur", sourceType: "Private wells", irrigatedArea: 92.70, sourceCount: 34 },
      { taluk: "Kannur", sourceType: "Private tanks", irrigatedArea: 38.30, sourceCount: 5 },
      { taluk: "Thalassery", sourceType: "Tube well", irrigatedArea: 38.60, sourceCount: 7 },
      { taluk: "Thalassery", sourceType: "Government tanks", irrigatedArea: 28.40, sourceCount: 2 },
      { taluk: "Thalassery", sourceType: "Private wells", irrigatedArea: 68.50, sourceCount: 24 },
      { taluk: "Thalassery", sourceType: "Private tanks", irrigatedArea: 28.70, sourceCount: 4 },
      { taluk: "Iritty", sourceType: "Tube well", irrigatedArea: 32.30, sourceCount: 5 },
      { taluk: "Iritty", sourceType: "Government tanks", irrigatedArea: 24.70, sourceCount: 1 },
      { taluk: "Iritty", sourceType: "Private wells", irrigatedArea: 58.40, sourceCount: 20 },
      { taluk: "Iritty", sourceType: "Private tanks", irrigatedArea: 24.80, sourceCount: 3 },
      { taluk: "Payyannur", sourceType: "Tube well", irrigatedArea: 42.80, sourceCount: 8 },
      { taluk: "Payyannur", sourceType: "Government tanks", irrigatedArea: 31.50, sourceCount: 2 },
      { taluk: "Payyannur", sourceType: "Private wells", irrigatedArea: 75.40, sourceCount: 26 },
      { taluk: "Payyannur", sourceType: "Private tanks", irrigatedArea: 31.60, sourceCount: 4 }
    ],
    "Thiruvananthapuram": [
      { taluk: "Thiruvananthapuram", sourceType: "Tube well", irrigatedArea: 85.50, sourceCount: 15 },
      { taluk: "Thiruvananthapuram", sourceType: "Government tanks", irrigatedArea: 65.30, sourceCount: 5 },
      { taluk: "Thiruvananthapuram", sourceType: "Private wells", irrigatedArea: 145.80, sourceCount: 52 },
      { taluk: "Neyyattinkara", sourceType: "Private wells", irrigatedArea: 98.40, sourceCount: 35 },
      { taluk: "Neyyattinkara", sourceType: "Tube well", irrigatedArea: 45.60, sourceCount: 8 },
      { taluk: "Nedumangad", sourceType: "Private wells", irrigatedArea: 85.60, sourceCount: 30 }
    ],
    "Ernakulam": [
      { taluk: "Aluva", sourceType: "Tube well", irrigatedArea: 95.50, sourceCount: 18 },
      { taluk: "Aluva", sourceType: "Private wells", irrigatedArea: 185.80, sourceCount: 65 },
      { taluk: "Kochi", sourceType: "Private wells", irrigatedArea: 225.40, sourceCount: 78 },
      { taluk: "Kochi", sourceType: "Government tanks", irrigatedArea: 85.60, sourceCount: 6 },
      { taluk: "Muvattupuzha", sourceType: "Private wells", irrigatedArea: 125.60, sourceCount: 45 },
      { taluk: "Muvattupuzha", sourceType: "Tube well", irrigatedArea: 65.40, sourceCount: 12 }
    ],
    "Kozhikode": [
      { taluk: "Kozhikode", sourceType: "Tube well", irrigatedArea: 75.50, sourceCount: 14 },
      { taluk: "Kozhikode", sourceType: "Private wells", irrigatedArea: 165.80, sourceCount: 58 },
      { taluk: "Vadakara", sourceType: "Private wells", irrigatedArea: 125.40, sourceCount: 45 },
      { taluk: "Vadakara", sourceType: "Tube well", irrigatedArea: 55.60, sourceCount: 10 }
    ]
  };

  // Get taluk data for selected district, fallback to Kannur
  const talukData = talukDataMap[selectedDistrict] || talukDataMap["Kannur"];
  const talukIrrigationData = irrigationDataMap[selectedDistrict] || irrigationDataMap["Kannur"];

  // Calculate totals for Land Utilization
  const landUtilizationTotals = talukData.reduce((acc, row) => {
    acc.buildingCourtyard += row.buildingCourtyard;
    acc.otherNonAgri += row.otherNonAgri;
    acc.barrenUncultivable += row.barrenUncultivable;
    acc.miscTreeCrops += row.miscTreeCrops;
    acc.permanentPastures += row.permanentPastures;
    acc.cultivableWaste += row.cultivableWaste;
    acc.otherFallow += row.otherFallow;
    acc.currentFallow += row.currentFallow;
    acc.socialForestry += row.socialForestry;
    acc.waterLogged += row.waterLogged;
    acc.stillWater += row.stillWater;
    acc.marshyLand += row.marshyLand;
    acc.netAreaSown += row.netAreaSown;
    return acc;
  }, {
    buildingCourtyard: 0,
    otherNonAgri: 0,
    barrenUncultivable: 0,
    miscTreeCrops: 0,
    permanentPastures: 0,
    cultivableWaste: 0,
    otherFallow: 0,
    currentFallow: 0,
    socialForestry: 0,
    waterLogged: 0,
    stillWater: 0,
    marshyLand: 0,
    netAreaSown: 0
  });

  const landUtilizationColumns = [
    { id: 'taluk', label: 'Taluk', minWidth: 160 },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', minWidth: 160 },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', minWidth: 190 },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', minWidth: 190 },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', minWidth: 210 },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', minWidth: 240 },
    { id: 'cultivableWaste', label: 'Cultivable waste', minWidth: 140 },
    { id: 'otherFallow', label: 'Other Fallow', minWidth: 110 },
    { id: 'currentFallow', label: 'Current Fallow', minWidth: 120 },
    { id: 'socialForestry', label: 'Area under Social Forestry', minWidth: 170 },
    { id: 'waterLogged', label: 'Water logged area', minWidth: 140 },
    { id: 'stillWater', label: 'Still water land (Water bodies)', minWidth: 190 },
    { id: 'marshyLand', label: 'Marshy land', minWidth: 110 },
    { id: 'netAreaSown', label: 'Net areas sown', minWidth: 130 }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num) => {
    return num.toFixed(2);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleTalukClick = (talukName, tabIndex) => {
    // Navigate to ZoneForm2 with tab state
    navigate(`/schemes/earas/cce/ZoneForm2`, {
      state: { 
        districtName: selectedDistrict,
        talukName: talukName,
        selectedTaluk: talukName,
        activeTab: tabIndex
      }
    });
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'visible',
        background: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>

        {/* Header with Back Button */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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
            {selectedDistrict} District - Taluk wise Land Utilization & Irrigation Report
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Click on any Taluk to view Zone-wise details)
          </Typography>
        </Box>

        {/* Tabs Section */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(themeColor, 0.1)}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              backgroundColor: alpha(themeColor, 0.05),
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 1.5,
                minHeight: 'auto',
                '&.Mui-selected': {
                  color: themeColor,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: themeColor,
                height: 3,
              },
            }}
          >
            <Tab
              icon={<Agriculture sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Land Utilization"
            />
            <Tab
              icon={<WaterDrop sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Irrigation Details"
            />
          </Tabs>

          {/* Land Utilization Tab */}
          <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 0 }}>
            {activeTab === 0 && (
              <TableContainer sx={{ maxHeight: 500, overflowX: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: 2000 }}>
                  <TableHead>
                    <TableRow>
                      {landUtilizationColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            minWidth: col.minWidth,
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {talukData.map((row, index) => (
                      <TableRow 
                        key={index} 
                        hover
                        onClick={() => handleTalukClick(row.taluk, 0)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            backgroundColor: alpha(themeColor, 0.08),
                            transition: '0.2s'
                          }
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={row.taluk}
                            size="small"
                            sx={{
                              backgroundColor: alpha(themeColor, 0.1),
                              color: themeColor,
                              fontWeight: 500,
                              borderRadius: 1.5,
                              '&:hover': {
                                backgroundColor: alpha(themeColor, 0.2),
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatNumber(row.buildingCourtyard)}</TableCell>
                        <TableCell>{formatNumber(row.otherNonAgri)}</TableCell>
                        <TableCell>{formatNumber(row.barrenUncultivable)}</TableCell>
                        <TableCell>{formatNumber(row.miscTreeCrops)}</TableCell>
                        <TableCell>{formatNumber(row.permanentPastures)}</TableCell>
                        <TableCell>{formatNumber(row.cultivableWaste)}</TableCell>
                        <TableCell>{formatNumber(row.otherFallow)}</TableCell>
                        <TableCell>{formatNumber(row.currentFallow)}</TableCell>
                        <TableCell>{formatNumber(row.socialForestry)}</TableCell>
                        <TableCell>{formatNumber(row.waterLogged)}</TableCell>
                        <TableCell>{formatNumber(row.stillWater)}</TableCell>
                        <TableCell>{formatNumber(row.marshyLand)}</TableCell>
                        <TableCell>{formatNumber(row.netAreaSown)}</TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                      <TableCell sx={{ fontWeight: 700, color: themeColor }}>
                        <strong>TOTAL</strong>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.buildingCourtyard)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.otherNonAgri)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.barrenUncultivable)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.miscTreeCrops)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.permanentPastures)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.cultivableWaste)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.otherFallow)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.currentFallow)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.socialForestry)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.waterLogged)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.stillWater)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.marshyLand)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatNumber(landUtilizationTotals.netAreaSown)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Irrigation Details Tab */}
          <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 0 }}>
            {activeTab === 1 && (
              <TableContainer sx={{ maxHeight: 500, overflowX: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          verticalAlign: 'middle',
                          minWidth: 150,
                        }}
                      >
                        Taluk
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                        }}
                      >
                        Source Type
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 120 }}>Tube well</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 140 }}>Government tanks</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 120 }}>Private wells</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 120 }}>Private tanks</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Taluk</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const talukMap = {};
                      talukIrrigationData.forEach(item => {
                        if (!talukMap[item.taluk]) {
                          talukMap[item.taluk] = {
                            tubeWell: { count: 0, area: 0 },
                            govtTanks: { count: 0, area: 0 },
                            privateWells: { count: 0, area: 0 },
                            privateTanks: { count: 0, area: 0 }
                          };
                        }
                        switch(item.sourceType) {
                          case "Tube well":
                            talukMap[item.taluk].tubeWell = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          case "Government tanks":
                            talukMap[item.taluk].govtTanks = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          case "Private wells":
                            talukMap[item.taluk].privateWells = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          case "Private tanks":
                            talukMap[item.taluk].privateTanks = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          default: break;
                        }
                      });

                      const totals = {
                        tubeWell: { count: 0, area: 0 },
                        govtTanks: { count: 0, area: 0 },
                        privateWells: { count: 0, area: 0 },
                        privateTanks: { count: 0, area: 0 }
                      };

                      return Object.keys(talukMap).map(taluk => {
                        const data = talukMap[taluk];
                        totals.tubeWell.count += data.tubeWell.count;
                        totals.tubeWell.area += data.tubeWell.area;
                        totals.govtTanks.count += data.govtTanks.count;
                        totals.govtTanks.area += data.govtTanks.area;
                        totals.privateWells.count += data.privateWells.count;
                        totals.privateWells.area += data.privateWells.area;
                        totals.privateTanks.count += data.privateTanks.count;
                        totals.privateTanks.area += data.privateTanks.area;

                        return (
                          <TableRow 
                            key={taluk} 
                            hover
                            onClick={() => handleTalukClick(taluk, 1)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { 
                                backgroundColor: alpha(themeColor, 0.08)
                              }
                            }}
                          >
                            <TableCell>
                              <Chip 
                                label={taluk} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: alpha(themeColor, 0.1), 
                                  color: themeColor, 
                                  fontWeight: 500,
                                  '&:hover': {
                                    backgroundColor: alpha(themeColor, 0.2),
                                  }
                                }} 
                              />
                            </TableCell>
                            <TableCell align="center">
                              {data.tubeWell.count > 0 ? `${data.tubeWell.count} | ${formatNumber(data.tubeWell.area)}` : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {data.govtTanks.count > 0 ? `${data.govtTanks.count} | ${formatNumber(data.govtTanks.area)}` : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {data.privateWells.count > 0 ? `${data.privateWells.count} | ${formatNumber(data.privateWells.area)}` : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {data.privateTanks.count > 0 ? `${data.privateTanks.count} | ${formatNumber(data.privateTanks.area)}` : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      }).concat(
                        <TableRow key="total" sx={{ backgroundColor: alpha(themeColor, 0.08), fontWeight: 'bold' }}>
                          <TableCell sx={{ fontWeight: 700, color: themeColor }}><strong>TOTAL</strong></TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.tubeWell.count} | {formatNumber(totals.tubeWell.area)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.govtTanks.count} | {formatNumber(totals.govtTanks.area)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.privateWells.count} | {formatNumber(totals.privateWells.area)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.privateTanks.count} | {formatNumber(totals.privateTanks.area)}</TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default TalukForm2;
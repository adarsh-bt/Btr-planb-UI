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
  Chip
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const KeralaForm2 = () => {
  const theme = useTheme();
  const themeColor = "#05307a";
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Shared style for numeric cells - tabular numerals keep digits vertically aligned
  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };

  // District level data - aggregated across all districts
  const districtData = [
    {
      district: "Thiruvananthapuram",
      buildingCourtyard: 125.50,
      otherNonAgri: 89.30,
      barrenUncultivable: 450.20,
      miscTreeCrops: 78.40,
      permanentPastures: 34.60,
      cultivableWaste: 23.10,
      otherFallow: 12.50,
      currentFallow: 18.30,
      socialForestry: 56.70,
      waterLogged: 45.20,
      stillWater: 234.80,
      marshyLand: 12.30,
      netAreaSown: 3450.60
    },
    {
      district: "Kollam",
      buildingCourtyard: 98.40,
      otherNonAgri: 67.20,
      barrenUncultivable: 389.50,
      miscTreeCrops: 56.30,
      permanentPastures: 28.90,
      cultivableWaste: 19.80,
      otherFallow: 9.60,
      currentFallow: 14.20,
      socialForestry: 43.50,
      waterLogged: 38.40,
      stillWater: 187.60,
      marshyLand: 9.80,
      netAreaSown: 2890.30
    },
    {
      district: "Pathanamthitta",
      buildingCourtyard: 76.30,
      otherNonAgri: 54.80,
      barrenUncultivable: 312.40,
      miscTreeCrops: 67.80,
      permanentPastures: 31.20,
      cultivableWaste: 22.40,
      otherFallow: 11.30,
      currentFallow: 15.80,
      socialForestry: 48.90,
      waterLogged: 29.60,
      stillWater: 156.30,
      marshyLand: 7.40,
      netAreaSown: 2340.20
    },
    {
      district: "Alappuzha",
      buildingCourtyard: 112.80,
      otherNonAgri: 78.90,
      barrenUncultivable: 267.30,
      miscTreeCrops: 45.60,
      permanentPastures: 23.40,
      cultivableWaste: 34.50,
      otherFallow: 15.80,
      currentFallow: 22.40,
      socialForestry: 38.20,
      waterLogged: 89.40,
      stillWater: 423.50,
      marshyLand: 45.60,
      netAreaSown: 1890.40
    },
    {
      district: "Kottayam",
      buildingCourtyard: 87.60,
      otherNonAgri: 62.30,
      barrenUncultivable: 345.80,
      miscTreeCrops: 52.40,
      permanentPastures: 26.70,
      cultivableWaste: 18.90,
      otherFallow: 8.40,
      currentFallow: 13.60,
      socialForestry: 41.30,
      waterLogged: 34.20,
      stillWater: 198.40,
      marshyLand: 8.90,
      netAreaSown: 2670.80
    },
    {
      district: "Idukki",
      buildingCourtyard: 56.40,
      otherNonAgri: 43.20,
      barrenUncultivable: 567.80,
      miscTreeCrops: 89.30,
      permanentPastures: 42.50,
      cultivableWaste: 28.70,
      otherFallow: 14.60,
      currentFallow: 19.80,
      socialForestry: 67.40,
      waterLogged: 23.60,
      stillWater: 134.20,
      marshyLand: 5.60,
      netAreaSown: 1980.50
    },
    {
      district: "Ernakulam",
      buildingCourtyard: 145.70,
      otherNonAgri: 98.40,
      barrenUncultivable: 298.60,
      miscTreeCrops: 63.80,
      permanentPastures: 29.40,
      cultivableWaste: 21.50,
      otherFallow: 10.80,
      currentFallow: 16.40,
      socialForestry: 49.60,
      waterLogged: 56.30,
      stillWater: 287.90,
      marshyLand: 14.20,
      netAreaSown: 3120.70
    },
    {
      district: "Thrissur",
      buildingCourtyard: 108.90,
      otherNonAgri: 74.60,
      barrenUncultivable: 356.40,
      miscTreeCrops: 59.40,
      permanentPastures: 27.80,
      cultivableWaste: 20.30,
      otherFallow: 9.80,
      currentFallow: 15.20,
      socialForestry: 46.50,
      waterLogged: 42.80,
      stillWater: 215.60,
      marshyLand: 10.50,
      netAreaSown: 2890.30
    },
    {
      district: "Palakkad",
      buildingCourtyard: 98.30,
      otherNonAgri: 68.50,
      barrenUncultivable: 423.90,
      miscTreeCrops: 72.60,
      permanentPastures: 36.80,
      cultivableWaste: 24.60,
      otherFallow: 13.40,
      currentFallow: 17.90,
      socialForestry: 52.30,
      waterLogged: 31.50,
      stillWater: 178.40,
      marshyLand: 8.20,
      netAreaSown: 3450.80
    },
    {
      district: "Malappuram",
      buildingCourtyard: 103.60,
      otherNonAgri: 72.80,
      barrenUncultivable: 389.20,
      miscTreeCrops: 68.90,
      permanentPastures: 33.40,
      cultivableWaste: 22.80,
      otherFallow: 11.60,
      currentFallow: 16.80,
      socialForestry: 49.80,
      waterLogged: 38.90,
      stillWater: 196.50,
      marshyLand: 9.60,
      netAreaSown: 3120.40
    },
    {
      district: "Kozhikode",
      buildingCourtyard: 95.70,
      otherNonAgri: 65.40,
      barrenUncultivable: 334.60,
      miscTreeCrops: 61.20,
      permanentPastures: 29.60,
      cultivableWaste: 20.40,
      otherFallow: 10.20,
      currentFallow: 14.90,
      socialForestry: 44.70,
      waterLogged: 35.60,
      stillWater: 187.30,
      marshyLand: 8.80,
      netAreaSown: 2780.50
    },
    {
      district: "Wayanad",
      buildingCourtyard: 67.80,
      otherNonAgri: 48.30,
      barrenUncultivable: 478.50,
      miscTreeCrops: 78.40,
      permanentPastures: 38.70,
      cultivableWaste: 26.80,
      otherFallow: 13.90,
      currentFallow: 18.40,
      socialForestry: 58.60,
      waterLogged: 26.40,
      stillWater: 145.80,
      marshyLand: 6.70,
      netAreaSown: 2340.20
    },
    {
      district: "Kannur",
      buildingCourtyard: 89.40,
      otherNonAgri: 62.80,
      barrenUncultivable: 356.70,
      miscTreeCrops: 64.50,
      permanentPastures: 31.20,
      cultivableWaste: 21.90,
      otherFallow: 11.40,
      currentFallow: 15.60,
      socialForestry: 47.80,
      waterLogged: 32.40,
      stillWater: 192.60,
      marshyLand: 8.40,
      netAreaSown: 2890.60
    },
    {
      district: "Kasaragod",
      buildingCourtyard: 78.50,
      otherNonAgri: 54.60,
      barrenUncultivable: 389.40,
      miscTreeCrops: 58.90,
      permanentPastures: 28.40,
      cultivableWaste: 19.60,
      otherFallow: 9.80,
      currentFallow: 14.20,
      socialForestry: 43.50,
      waterLogged: 29.80,
      stillWater: 167.40,
      marshyLand: 7.90,
      netAreaSown: 2670.30
    }
  ];

  // Calculate totals for Land Utilization
  const landUtilizationTotals = districtData.reduce((acc, row) => {
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

  // Irrigation data by district
  const irrigationData = [
    { district: "Thiruvananthapuram", sourceType: "Tube well", irrigatedArea: 245.50, sourceCount: 45 },
    { district: "Thiruvananthapuram", sourceType: "Government tanks", irrigatedArea: 189.30, sourceCount: 12 },
    { district: "Thiruvananthapuram", sourceType: "Private wells", irrigatedArea: 432.80, sourceCount: 156 },
    { district: "Thiruvananthapuram", sourceType: "Private tanks", irrigatedArea: 178.20, sourceCount: 28 },
    { district: "Kollam", sourceType: "Tube well", irrigatedArea: 198.40, sourceCount: 38 },
    { district: "Kollam", sourceType: "Government tanks", irrigatedArea: 145.60, sourceCount: 9 },
    { district: "Kollam", sourceType: "Private wells", irrigatedArea: 356.70, sourceCount: 128 },
    { district: "Kollam", sourceType: "Private tanks", irrigatedArea: 145.30, sourceCount: 22 },
    { district: "Ernakulam", sourceType: "Tube well", irrigatedArea: 289.60, sourceCount: 52 },
    { district: "Ernakulam", sourceType: "Government tanks", irrigatedArea: 198.40, sourceCount: 14 },
    { district: "Ernakulam", sourceType: "Private wells", irrigatedArea: 523.40, sourceCount: 189 },
    { district: "Ernakulam", sourceType: "Private tanks", irrigatedArea: 198.70, sourceCount: 31 },
    { district: "Kozhikode", sourceType: "Tube well", irrigatedArea: 198.30, sourceCount: 42 },
    { district: "Kozhikode", sourceType: "Government tanks", irrigatedArea: 156.70, sourceCount: 10 },
    { district: "Kozhikode", sourceType: "Private wells", irrigatedArea: 412.50, sourceCount: 148 },
    { district: "Kozhikode", sourceType: "Private tanks", irrigatedArea: 167.80, sourceCount: 25 },
    { district: "Thrissur", sourceType: "Tube well", irrigatedArea: 234.50, sourceCount: 48 },
    { district: "Thrissur", sourceType: "Government tanks", irrigatedArea: 178.90, sourceCount: 11 },
    { district: "Thrissur", sourceType: "Private wells", irrigatedArea: 478.60, sourceCount: 167 },
    { district: "Thrissur", sourceType: "Private tanks", irrigatedArea: 185.40, sourceCount: 29 },
    { district: "Malappuram", sourceType: "Tube well", irrigatedArea: 212.80, sourceCount: 44 },
    { district: "Malappuram", sourceType: "Government tanks", irrigatedArea: 167.50, sourceCount: 10 },
    { district: "Malappuram", sourceType: "Private wells", irrigatedArea: 445.30, sourceCount: 158 },
    { district: "Malappuram", sourceType: "Private tanks", irrigatedArea: 175.60, sourceCount: 27 },
    { district: "Palakkad", sourceType: "Tube well", irrigatedArea: 267.40, sourceCount: 56 },
    { district: "Palakkad", sourceType: "Government tanks", irrigatedArea: 189.60, sourceCount: 13 },
    { district: "Palakkad", sourceType: "Private wells", irrigatedArea: 512.80, sourceCount: 178 },
    { district: "Palakkad", sourceType: "Private tanks", irrigatedArea: 192.40, sourceCount: 32 }
  ];

  // District column stays left-aligned (text); all numeric columns are right-aligned
  const landUtilizationColumns = [
    { id: 'district', label: 'District', minWidth: 160, align: 'left' },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', minWidth: 160, align: 'right' },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', minWidth: 190, align: 'right' },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', minWidth: 190, align: 'right' },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', minWidth: 210, align: 'right' },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', minWidth: 240, align: 'right' },
    { id: 'cultivableWaste', label: 'Cultivable waste', minWidth: 140, align: 'right' },
    { id: 'otherFallow', label: 'Other Fallow', minWidth: 110, align: 'right' },
    { id: 'currentFallow', label: 'Current Fallow', minWidth: 120, align: 'right' },
    { id: 'socialForestry', label: 'Area under Social Forestry', minWidth: 170, align: 'right' },
    { id: 'waterLogged', label: 'Water logged area', minWidth: 140, align: 'right' },
    { id: 'stillWater', label: 'Still water land (Water bodies)', minWidth: 190, align: 'right' },
    { id: 'marshyLand', label: 'Marshy land', minWidth: 110, align: 'right' },
    { id: 'netAreaSown', label: 'Net areas sown', minWidth: 130, align: 'right' }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num) => {
    return num.toFixed(2);
  };

  // Handle row click navigation with tab state
  const handleDistrictClick = (districtName, tabIndex) => {
    navigate(`/schemes/earas/cce/TalukForm2`, {
      state: {
        districtName: districtName,
        selectedDistrict: districtName,
        activeTab: tabIndex  // Pass the current tab index
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

        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            Kerala State - Land Utilization & Irrigation Report
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Click on any district to view Taluk-wise details)
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
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
                  <TableHead>
                    <TableRow>
                      {landUtilizationColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align}
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            minWidth: col.minWidth,
                            py: 1.5,
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {districtData.map((row, index) => (
                      <TableRow
                        key={index}
                        hover
                        onClick={() => handleDistrictClick(row.district, 0)}  // Pass 0 for Land Utilization tab
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha(themeColor, 0.08),
                            transition: '0.2s'
                          }
                        }}
                      >
                        {landUtilizationColumns.map((col) => (
                          col.id === 'district' ? (
                            <TableCell key={col.id} align="left">
                              <Chip
                                label={row.district}
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
                          ) : (
                            <TableCell key={col.id} align="right" sx={numericCellSx}>
                              {formatNumber(row[col.id])}
                            </TableCell>
                          )
                        ))}
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                      {landUtilizationColumns.map((col) => (
                        col.id === 'district' ? (
                          <TableCell key={col.id} align="left" sx={{ fontWeight: 700, color: themeColor }}>
                            TOTAL
                          </TableCell>
                        ) : (
                          <TableCell key={col.id} align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                            {formatNumber(landUtilizationTotals[col.id])}
                          </TableCell>
                        )
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Irrigation Details Tab */}
          <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 0 }}>
            {activeTab === 1 && (
              <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={3}
                        align="left"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          verticalAlign: 'middle',
                          minWidth: 150,
                        }}
                      >
                        District
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
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 130 }}>Tube well</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 150 }}>Government tanks</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 130 }}>Private wells</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.85), color: 'white', fontWeight: 600, minWidth: 130 }}>Private tanks</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600 }}>Count | Area (Ha)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const districtMap = {};
                      irrigationData.forEach(item => {
                        if (!districtMap[item.district]) {
                          districtMap[item.district] = {
                            tubeWell: { count: 0, area: 0 },
                            govtTanks: { count: 0, area: 0 },
                            privateWells: { count: 0, area: 0 },
                            privateTanks: { count: 0, area: 0 }
                          };
                        }
                        switch(item.sourceType) {
                          case "Tube well":
                            districtMap[item.district].tubeWell = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          case "Government tanks":
                            districtMap[item.district].govtTanks = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          case "Private wells":
                            districtMap[item.district].privateWells = { count: item.sourceCount, area: item.irrigatedArea };
                            break;
                          case "Private tanks":
                            districtMap[item.district].privateTanks = { count: item.sourceCount, area: item.irrigatedArea };
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

                      const renderSourceCell = (source) => (
                        source.count > 0
                          ? `${source.count} | ${formatNumber(source.area)}`
                          : '\u2014'
                      );

                      return Object.keys(districtMap).map(district => {
                        const data = districtMap[district];
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
                            key={district}
                            hover
                            onClick={() => handleDistrictClick(district, 1)}  // Pass 1 for Irrigation tab
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: alpha(themeColor, 0.08)
                              }
                            }}
                          >
                            <TableCell align="left">
                              <Chip
                                label={district}
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
                            <TableCell align="center" sx={numericCellSx}>{renderSourceCell(data.tubeWell)}</TableCell>
                            <TableCell align="center" sx={numericCellSx}>{renderSourceCell(data.govtTanks)}</TableCell>
                            <TableCell align="center" sx={numericCellSx}>{renderSourceCell(data.privateWells)}</TableCell>
                            <TableCell align="center" sx={numericCellSx}>{renderSourceCell(data.privateTanks)}</TableCell>
                          </TableRow>
                        );
                      }).concat(
                        <TableRow key="total" sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                          <TableCell align="left" sx={{ fontWeight: 700, color: themeColor }}>TOTAL</TableCell>
                          <TableCell align="center" sx={{ ...numericCellSx, fontWeight: 700 }}>{totals.tubeWell.count} | {formatNumber(totals.tubeWell.area)}</TableCell>
                          <TableCell align="center" sx={{ ...numericCellSx, fontWeight: 700 }}>{totals.govtTanks.count} | {formatNumber(totals.govtTanks.area)}</TableCell>
                          <TableCell align="center" sx={{ ...numericCellSx, fontWeight: 700 }}>{totals.privateWells.count} | {formatNumber(totals.privateWells.area)}</TableCell>
                          <TableCell align="center" sx={{ ...numericCellSx, fontWeight: 700 }}>{totals.privateTanks.count} | {formatNumber(totals.privateTanks.area)}</TableCell>
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

export default KeralaForm2;
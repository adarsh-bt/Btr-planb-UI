import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
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

const Form2 = () => {
  const theme = useTheme();
  const themeColor = "#05307a";

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Location data - one row with values
  const locationData = {
    district: "Kannur",
    taluk: "Taliparamba",
    block: "Taliparamba",
    panchayath: "Taliparamba",
    zone: "North Zone"
  };

  // Land Utilization data
  const landUtilizationData = [
    {
      cluster: "1",
      landType: "Wet",
      buildingCourtyard: 0.00,
      otherNonAgri: 2.00,
      barrenUncultivable: 42.00,
      miscTreeCrops: 0.00,
      permanentPastures: 0.00,
      cultivableWaste: 0.00,
      otherFallow: 0.00,
      currentFallow: 0.00,
      socialForestry: 0.00,
      waterLogged: 0.00,
      stillWater: 0.00,
      marshyLand: 0.00,
      netAreaSown: 267.00
    },
    {
      cluster: "2",
      landType: "Dry",
      buildingCourtyard: 0.00,
      otherNonAgri: 2.00,
      barrenUncultivable: 3.00,
      miscTreeCrops: 0.00,
      permanentPastures: 0.00,
      cultivableWaste: 0.00,
      otherFallow: 0.00,
      currentFallow: 0.00,
      socialForestry: 0.00,
      waterLogged: 0.00,
      stillWater: 0.00,
      marshyLand: 0.00,
      netAreaSown: 181.00
    },
    {
      cluster: "3",
      landType: "Dry",
      buildingCourtyard: 0.00,
      otherNonAgri: 0.00,
      barrenUncultivable: 0.00,
      miscTreeCrops: 0.00,
      permanentPastures: 0.00,
      cultivableWaste: 0.00,
      otherFallow: 0.00,
      currentFallow: 0.00,
      socialForestry: 0.00,
      waterLogged: 0.00,
      stillWater: 0.00,
      marshyLand: 0.00,
      netAreaSown: 232.00
    },
    {
      cluster: "4",
      landType: "Dry",
      buildingCourtyard: 0.00,
      otherNonAgri: 0.00,
      barrenUncultivable: 0.00,
      miscTreeCrops: 0.00,
      permanentPastures: 0.00,
      cultivableWaste: 0.00,
      otherFallow: 0.00,
      currentFallow: 0.00,
      socialForestry: 0.00,
      waterLogged: 0.00,
      stillWater: 0.00,
      marshyLand: 0.00,
      netAreaSown: 95.00
    },
    {
      cluster: "5",
      landType: "Dry",
      buildingCourtyard: 0.00,
      otherNonAgri: 16.00,
      barrenUncultivable: 20.00,
      miscTreeCrops: 0.00,
      permanentPastures: 0.00,
      cultivableWaste: 0.00,
      otherFallow: 0.00,
      currentFallow: 0.00,
      socialForestry: 0.00,
      waterLogged: 0.00,
      stillWater: 0.00,
      marshyLand: 0.00,
      netAreaSown: 93.00
    }
  ];

  // Calculate totals for Land Utilization
  const landUtilizationTotals = landUtilizationData.reduce((acc, row) => {
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

  // Irrigation Details data
  const irrigationDetailsData = [
    {
      clusterLabel: 1,
      sourceType: "Tube well",
      irrigatedArea: 7.00,
      sourceCount: 1
    },
    {
      clusterLabel: 2,
      sourceType: "Government tanks",
      irrigatedArea: 10.00,
      sourceCount: "--"
    },
    {
      clusterLabel: 3,
      sourceType: "Private wells",
      irrigatedArea: 120.00,
      sourceCount: 1
    },
    {
      clusterLabel: 4,
      sourceType: "Private tanks",
      irrigatedArea: 175.00,
      sourceCount: 1
    }
  ];

  // Land Utilization column headers - EXACTLY as specified
  const landUtilizationColumns = [
    { id: 'cluster', label: 'Cluster No', minWidth: 80 },
    { id: 'landType', label: 'Land Type', minWidth: 100 },
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

  // Irrigation Details column headers
  const irrigationColumns = [
    { id: 'clusterLabel', label: 'Cluster No', minWidth: 120 },
    { id: 'sourceType', label: 'Source Type', minWidth: 160 },
    { id: 'irrigatedArea', label: 'Irrigated Area (Ha)', minWidth: 140 },
    { id: 'sourceCount', label: 'Source Count', minWidth: 120 }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper to format numbers
  const formatNumber = (num) => {
    return num.toFixed(2);
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

        {/* Location Table */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 4,
            border: `1px solid ${alpha(themeColor, 0.1)}`,
          }}
        >
          <Box
            sx={{
              backgroundColor: themeColor,
              px: 2,
              py: 0.2,
            }}
          >
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                  <TableCell sx={{ fontWeight: 700, color: themeColor }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: themeColor }}>Taluk</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: themeColor }}>Block/ Municipality/ Corporation</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: themeColor }}>Panchayath</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: themeColor }}>Zone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell>
                    <Chip
                      label={locationData.district}
                      size="small"
                      sx={{
                        backgroundColor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={locationData.taluk}
                      size="small"
                      sx={{
                        backgroundColor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={locationData.block}
                      size="small"
                      sx={{
                        backgroundColor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={locationData.panchayath}
                      size="small"
                      sx={{
                        backgroundColor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={locationData.zone}
                      size="small"
                      sx={{
                        backgroundColor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 500,
                        borderRadius: 1.5
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Tabs Section */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(themeColor, 0.1)}`,
          }}
        >
          {/* Tabs Header */}
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
                <Table stickyHeader sx={{ minWidth: 1800 }}>
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
                    {landUtilizationData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip
                            label={row.cluster}
                            size="small"
                            sx={{
                              backgroundColor: alpha(themeColor, 0.1),
                              color: themeColor,
                              fontWeight: 'bold',
                              borderRadius: 1.5,
                              minWidth: 50
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.landType}
                            size="small"
                            sx={{
                              backgroundColor: row.landType === 'Wet' 
                                ? alpha(theme.palette.info.main, 0.1)
                                : alpha(theme.palette.warning.main, 0.1),
                              color: row.landType === 'Wet' 
                                ? theme.palette.info.main
                                : theme.palette.warning.main,
                              fontWeight: 'bold',
                              borderRadius: 1.5,
                              minWidth: 60
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
                      <TableCell sx={{ fontWeight: 700 }}></TableCell>
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
                <Table stickyHeader sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={3}
                        align="center"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          minWidth: 100,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        Cluster No
                      </TableCell>
                      <TableCell
                        rowSpan={3}
                        align="center"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          minWidth: 100,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        Land Type
                      </TableCell>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1rem',
                          py: 1.5,
                          letterSpacing: '0.5px',
                        }}
                      >
                        Source Type
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.85),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          minWidth: 140,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Tube well
                      </TableCell>
                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.85),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          minWidth: 160,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Government tanks
                      </TableCell>
                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.85),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          minWidth: 140,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Private wells
                      </TableCell>
                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.85),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          minWidth: 140,
                          py: 1,
                        }}
                      >
                        Private tanks
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 70,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 90,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Area (Ha)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 70,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 90,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Area (Ha)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 70,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 90,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Area (Ha)
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 70,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          py: 1,
                        }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: alpha(themeColor, 0.7),
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap',
                          minWidth: 90,
                          py: 1,
                        }}
                      >
                        Area (Ha)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const clusterLandTypeMap = {};
                      landUtilizationData.forEach(item => {
                        clusterLandTypeMap[item.cluster] = item.landType;
                      });
                      
                      const groupedByCluster = {};
                      
                      for (let i = 1; i <= 5; i++) {
                        groupedByCluster[i] = {
                          landType: clusterLandTypeMap[i] || 'Dry',
                          tubeWell: { count: 0, area: 0 },
                          govtTanks: { count: 0, area: 0 },
                          privateWells: { count: 0, area: 0 },
                          privateTanks: { count: 0, area: 0 }
                        };
                      }
                      
                      irrigationDetailsData.forEach(row => {
                        const cluster = row.clusterLabel;
                        
                        switch(row.sourceType) {
                          case "Tube well":
                            groupedByCluster[cluster].tubeWell.count = row.sourceCount !== "--" ? row.sourceCount : 0;
                            groupedByCluster[cluster].tubeWell.area = row.irrigatedArea;
                            break;
                          case "Government tanks":
                            groupedByCluster[cluster].govtTanks.count = row.sourceCount !== "--" ? row.sourceCount : 0;
                            groupedByCluster[cluster].govtTanks.area = row.irrigatedArea;
                            break;
                          case "Private wells":
                            groupedByCluster[cluster].privateWells.count = row.sourceCount !== "--" ? row.sourceCount : 0;
                            groupedByCluster[cluster].privateWells.area = row.irrigatedArea;
                            break;
                          case "Private tanks":
                            groupedByCluster[cluster].privateTanks.count = row.sourceCount !== "--" ? row.sourceCount : 0;
                            groupedByCluster[cluster].privateTanks.area = row.irrigatedArea;
                            break;
                          default:
                            break;
                        }
                      });
                      
                      return Object.keys(groupedByCluster).map(cluster => (
                        <TableRow 
                          key={cluster} 
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(themeColor, 0.04),
                            },
                          }}
                        >
                          <TableCell 
                            align="center"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: alpha(themeColor, 0.02),
                              py: 1.2,
                            }}
                          >
                            <Chip
                              label={cluster}
                              size="small"
                              sx={{
                                backgroundColor: alpha(themeColor, 0.1),
                                color: themeColor,
                                fontWeight: 'bold',
                                borderRadius: 2,
                                minWidth: 45,
                                fontSize: '0.85rem',
                              }}
                            />
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{
                              py: 1.2,
                            }}
                          >
                            <Chip
                              label={groupedByCluster[cluster].landType}
                              size="small"
                              sx={{
                                backgroundColor: groupedByCluster[cluster].landType === 'Wet' 
                                  ? alpha(theme.palette.info.main, 0.15)
                                  : alpha(theme.palette.warning.main, 0.15),
                                color: groupedByCluster[cluster].landType === 'Wet' 
                                  ? theme.palette.info.main
                                  : theme.palette.warning.main,
                                fontWeight: 'bold',
                                borderRadius: 2,
                                minWidth: 55,
                                fontSize: '0.85rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.2 }}>
                            {groupedByCluster[cluster].tubeWell.count > 0 ? 
                              <Chip
                                label={groupedByCluster[cluster].tubeWell.count}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main,
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  minWidth: 35,
                                }}
                              /> : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, py: 1.2 }}>
                            {groupedByCluster[cluster].tubeWell.area > 0 ? 
                              `${formatNumber(groupedByCluster[cluster].tubeWell.area)}` : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.2 }}>
                            {groupedByCluster[cluster].govtTanks.count > 0 ? 
                              <Chip
                                label={groupedByCluster[cluster].govtTanks.count}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  minWidth: 35,
                                }}
                              /> : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, py: 1.2 }}>
                            {groupedByCluster[cluster].govtTanks.area > 0 ? 
                              `${formatNumber(groupedByCluster[cluster].govtTanks.area)}` : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.2 }}>
                            {groupedByCluster[cluster].privateWells.count > 0 ? 
                              <Chip
                                label={groupedByCluster[cluster].privateWells.count}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                  color: theme.palette.warning.main,
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  minWidth: 35,
                                }}
                              /> : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, py: 1.2 }}>
                            {groupedByCluster[cluster].privateWells.area > 0 ? 
                              `${formatNumber(groupedByCluster[cluster].privateWells.area)}` : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.2 }}>
                            {groupedByCluster[cluster].privateTanks.count > 0 ? 
                              <Chip
                                label={groupedByCluster[cluster].privateTanks.count}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                  fontWeight: 500,
                                  borderRadius: 1.5,
                                  minWidth: 35,
                                }}
                              /> : ''}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, py: 1.2 }}>
                            {groupedByCluster[cluster].privateTanks.area > 0 ? 
                              `${formatNumber(groupedByCluster[cluster].privateTanks.area)}` : ''}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                    <TableRow 
                      sx={{ 
                        backgroundColor: alpha(themeColor, 0.1),
                        borderTop: `2px solid ${themeColor}`,
                      }}
                    >
                      <TableCell 
                        align="center"
                        sx={{ 
                          fontWeight: 800, 
                          color: themeColor,
                          fontSize: '0.95rem',
                          py: 1.5,
                        }}
                      >
                        <strong>TOTAL</strong>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}></TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {(() => {
                          const total = irrigationDetailsData
                            .filter(row => row.sourceType === "Tube well" && row.sourceCount !== "--")
                            .reduce((sum, row) => sum + (row.sourceCount || 0), 0);
                          return total > 0 ? total : '';
                        })()}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {formatNumber(
                          irrigationDetailsData
                            .filter(row => row.sourceType === "Tube well")
                            .reduce((sum, row) => sum + row.irrigatedArea, 0)
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {(() => {
                          const total = irrigationDetailsData
                            .filter(row => row.sourceType === "Government tanks" && row.sourceCount !== "--")
                            .reduce((sum, row) => sum + (row.sourceCount || 0), 0);
                          return total > 0 ? total : '';
                        })()}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {formatNumber(
                          irrigationDetailsData
                            .filter(row => row.sourceType === "Government tanks")
                            .reduce((sum, row) => sum + row.irrigatedArea, 0)
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {(() => {
                          const total = irrigationDetailsData
                            .filter(row => row.sourceType === "Private wells" && row.sourceCount !== "--")
                            .reduce((sum, row) => sum + (row.sourceCount || 0), 0);
                          return total > 0 ? total : '';
                        })()}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {formatNumber(
                          irrigationDetailsData
                            .filter(row => row.sourceType === "Private wells")
                            .reduce((sum, row) => sum + row.irrigatedArea, 0)
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {(() => {
                          const total = irrigationDetailsData
                            .filter(row => row.sourceType === "Private tanks" && row.sourceCount !== "--")
                            .reduce((sum, row) => sum + (row.sourceCount || 0), 0);
                          return total > 0 ? total : '';
                        })()}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        {formatNumber(
                          irrigationDetailsData
                            .filter(row => row.sourceType === "Private tanks")
                            .reduce((sum, row) => sum + row.irrigatedArea, 0)
                        )}
                      </TableCell>
                    </TableRow>
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

export default Form2;
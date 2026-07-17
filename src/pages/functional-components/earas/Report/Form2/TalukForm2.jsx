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
  ArrowBack,
  WbSunny
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

  // Land Type filter state: 'all' | 'wet' | 'dry'
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // Shared style for numeric cells - tabular numerals keep digits vertically aligned
  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };

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

  // Taluk column stays left-aligned (text); all numeric columns are right-aligned.
  // `category` classifies each column as 'wet', 'dry', or 'always' (always visible regardless of filter)
  const landUtilizationColumns = [
    { id: 'taluk', label: 'Taluk', minWidth: 160, align: 'left', category: 'always' },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', minWidth: 160, align: 'right', category: 'dry' },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', minWidth: 190, align: 'right', category: 'dry' },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', minWidth: 190, align: 'right', category: 'dry' },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', minWidth: 210, align: 'right', category: 'dry' },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', minWidth: 240, align: 'right', category: 'dry' },
    { id: 'cultivableWaste', label: 'Cultivable waste', minWidth: 140, align: 'right', category: 'dry' },
    { id: 'otherFallow', label: 'Other Fallow', minWidth: 110, align: 'right', category: 'dry' },
    { id: 'currentFallow', label: 'Current Fallow', minWidth: 120, align: 'right', category: 'dry' },
    { id: 'socialForestry', label: 'Area under Social Forestry', minWidth: 170, align: 'right', category: 'dry' },
    { id: 'waterLogged', label: 'Water logged area', minWidth: 140, align: 'right', category: 'wet' },
    { id: 'stillWater', label: 'Still water land (Water bodies)', minWidth: 190, align: 'right', category: 'wet' },
    { id: 'marshyLand', label: 'Marshy land', minWidth: 110, align: 'right', category: 'wet' },
    { id: 'netAreaSown', label: 'Net areas sown', minWidth: 130, align: 'right', category: 'always' }
  ];

  // All columns always render. The filter only decides whether a cell shows its
  // real value or a placeholder dash — columns are never added/removed.
  const isColumnActive = (col) =>
    col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  // Irrigation source types, tagged wet/dry so they respond to the same filter.
  // Government/Private tanks are surface-water sources (wet cultivation); tube
  // wells and private wells are groundwater sources (dry cultivation).
  const irrigationSourceTypes = [
    { key: 'tubeWell', label: 'Tube well', category: 'dry' },
    { key: 'govtTanks', label: 'Government tanks', category: 'wet' },
    { key: 'privateWells', label: 'Private wells', category: 'dry' },
    { key: 'privateTanks', label: 'Private tanks', category: 'wet' }
  ];
  const isSourceActive = (source) =>
    landTypeFilter === 'all' || source.category === landTypeFilter;

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

  // Land Type filter options
  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

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
                <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
                  <TableHead>
                    <TableRow>
                      {landUtilizationColumns.map((col) => {
                        const active = isColumnActive(col);
                        return (
                          <TableCell
                            key={col.id}
                            align={col.align}
                            sx={{
                              backgroundColor: themeColor,
                              color: active ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              minWidth: col.minWidth,
                              py: 1.5,
                            }}
                          >
                            {col.label}
                          </TableCell>
                        );
                      })}
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
                        {landUtilizationColumns.map((col) => {
                          if (col.id === 'taluk') {
                            return (
                              <TableCell key={col.id} align="left">
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
                            );
                          }
                          const active = isColumnActive(col);
                          return (
                            <TableCell
                              key={col.id}
                              align="right"
                              sx={{
                                ...numericCellSx,
                                color: active ? 'inherit' : 'text.disabled',
                              }}
                            >
                              {active ? formatNumber(row[col.id]) : '—'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                      {landUtilizationColumns.map((col) => {
                        if (col.id === 'taluk') {
                          return (
                            <TableCell key={col.id} align="left" sx={{ fontWeight: 700, color: themeColor }}>
                              TOTAL
                            </TableCell>
                          );
                        }
                        const active = isColumnActive(col);
                        return (
                          <TableCell
                            key={col.id}
                            align="right"
                            sx={{
                              ...numericCellSx,
                              fontWeight: 700,
                              color: active ? 'inherit' : 'text.disabled',
                            }}
                          >
                            {active ? formatNumber(landUtilizationTotals[col.id]) : '—'}
                          </TableCell>
                        );
                      })}
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
                      {irrigationSourceTypes.map((source) => (
                        <TableCell
                          key={source.key}
                          align="center"
                          sx={{
                            backgroundColor: alpha(themeColor, 0.85),
                            color: isSourceActive(source) ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 600,
                            minWidth: 130,
                          }}
                        >
                          {source.label}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      {irrigationSourceTypes.map((source) => (
                        <TableCell
                          key={source.key}
                          align="center"
                          sx={{
                            backgroundColor: alpha(themeColor, 0.7),
                            color: isSourceActive(source) ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 600,
                          }}
                        >
                          Count | Area (Ha)
                        </TableCell>
                      ))}
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

                      const renderSourceCell = (sourceData, sourceMeta) => {
                        if (!isSourceActive(sourceMeta)) return '\u2014';
                        return sourceData.count > 0
                          ? `${sourceData.count} | ${formatNumber(sourceData.area)}`
                          : '\u2014';
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
                            <TableCell align="left">
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
                            {irrigationSourceTypes.map((source) => (
                              <TableCell
                                key={source.key}
                                align="center"
                                sx={{
                                  ...numericCellSx,
                                  color: isSourceActive(source) ? 'inherit' : 'text.disabled',
                                }}
                              >
                                {renderSourceCell(data[source.key], source)}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      }).concat(
                        <TableRow key="total" sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                          <TableCell align="left" sx={{ fontWeight: 700, color: themeColor }}>TOTAL</TableCell>
                          {irrigationSourceTypes.map((source) => {
                            const active = isSourceActive(source);
                            const t = totals[source.key];
                            return (
                              <TableCell
                                key={source.key}
                                align="center"
                                sx={{
                                  ...numericCellSx,
                                  fontWeight: 700,
                                  color: active ? 'inherit' : 'text.disabled',
                                }}
                              >
                                {active ? `${t.count} | ${formatNumber(t.area)}` : '\u2014'}
                              </TableCell>
                            );
                          })}
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
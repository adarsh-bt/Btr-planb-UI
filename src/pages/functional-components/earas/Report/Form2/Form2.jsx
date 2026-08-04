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
  Chip,
  Stack
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  ArrowBack,
  WbSunny
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';

const SESSION_KEY = 'form2State';

const Form2 = () => {
  const theme = useTheme();
  const themeColor = "#05307a";
  const navigate = useNavigate();
  const location = useLocation();

  // Get navigation state from ZoneForm2 or sessionStorage
  const savedState = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  const selectedDistrict = location.state?.districtName || location.state?.selectedDistrict || savedState.districtName || "Kannur";
  const selectedTaluk = location.state?.talukName || location.state?.selectedTaluk || savedState.talukName || "Taliparamba";
  const selectedZone = location.state?.zoneName || savedState.zoneName || "North Zone";
  const initialTab = location.state?.activeTab ?? savedState.activeTab ?? 0;

  /* ── persist form2 context so breadcrumb/refresh keeps working ── */
  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        districtId: location.state?.districtId || savedState.districtId,
        districtName: selectedDistrict,
        talukId: location.state?.talukId || savedState.talukId,
        talukName: selectedTaluk,
        zoneId: location.state?.zoneId || savedState.zoneId,
        zoneName: selectedZone,
        activeTab: initialTab
      })
    );
  }, [location.state, savedState, selectedDistrict, selectedTaluk, selectedZone, initialTab]);

  // Tab state
  const [activeTab, setActiveTab] = useState(initialTab);

  // Land Type filter state: 'all' | 'wet' | 'dry'
  // Unlike the District/Taluk/Zone level tables, each cluster row here already
  // carries its own Wet/Dry classification (row.landType), so the filter works
  // per-row rather than per-column: matching rows keep their values, and
  // non-matching rows stay visible but show a dash instead of being hidden.
  const [landTypeFilter, setLandTypeFilter] = useState('all');
  const isRowActive = (landType) =>
    landTypeFilter === 'all' || (landType && landType.toLowerCase() === landTypeFilter);

  // Location data - dynamically updated from navigation state
  const locationData = {
    district: selectedDistrict,
    taluk: selectedTaluk,
    block: selectedTaluk, // Using taluk as block for demo
    panchayath: selectedTaluk, // Using taluk as panchayath for demo
    zone: selectedZone
  };

  // Land Utilization data - filtered by zone (demo data for different zones)
  const getLandUtilizationData = () => {
    const zoneDataMap = {
      "North Zone": [
        { cluster: "1", landType: "Wet", buildingCourtyard: 12.50, otherNonAgri: 8.30, barrenUncultivable: 42.20, miscTreeCrops: 7.40, permanentPastures: 3.60, cultivableWaste: 2.10, otherFallow: 1.20, currentFallow: 1.80, socialForestry: 5.70, waterLogged: 4.20, stillWater: 22.80, marshyLand: 1.10, netAreaSown: 267.00 },
        { cluster: "2", landType: "Dry", buildingCourtyard: 10.80, otherNonAgri: 7.20, barrenUncultivable: 38.50, miscTreeCrops: 6.80, permanentPastures: 3.20, cultivableWaste: 1.90, otherFallow: 1.00, currentFallow: 1.60, socialForestry: 5.20, waterLogged: 3.80, stillWater: 20.40, marshyLand: 1.00, netAreaSown: 242.00 },
        { cluster: "3", landType: "Dry", buildingCourtyard: 11.20, otherNonAgri: 7.80, barrenUncultivable: 40.10, miscTreeCrops: 7.10, permanentPastures: 3.40, cultivableWaste: 2.00, otherFallow: 1.10, currentFallow: 1.70, socialForestry: 5.50, waterLogged: 4.00, stillWater: 21.60, marshyLand: 1.05, netAreaSown: 258.00 },
      ],
      "South Zone": [
        { cluster: "1", landType: "Wet", buildingCourtyard: 8.40, otherNonAgri: 5.60, barrenUncultivable: 35.20, miscTreeCrops: 6.20, permanentPastures: 2.80, cultivableWaste: 1.70, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.80, waterLogged: 3.20, stillWater: 18.40, marshyLand: 0.90, netAreaSown: 195.00 },
        { cluster: "2", landType: "Dry", buildingCourtyard: 7.80, otherNonAgri: 5.20, barrenUncultivable: 32.80, miscTreeCrops: 5.80, permanentPastures: 2.60, cultivableWaste: 1.50, otherFallow: 0.80, currentFallow: 1.30, socialForestry: 4.50, waterLogged: 2.90, stillWater: 17.20, marshyLand: 0.85, netAreaSown: 182.00 },
      ],
      "East Zone": [
        { cluster: "1", landType: "Dry", buildingCourtyard: 9.60, otherNonAgri: 6.40, barrenUncultivable: 38.50, miscTreeCrops: 6.80, permanentPastures: 3.10, cultivableWaste: 1.80, otherFallow: 1.00, currentFallow: 1.50, socialForestry: 5.00, waterLogged: 3.50, stillWater: 19.80, marshyLand: 0.95, netAreaSown: 210.00 },
        { cluster: "2", landType: "Wet", buildingCourtyard: 8.90, otherNonAgri: 5.90, barrenUncultivable: 35.60, miscTreeCrops: 6.30, permanentPastures: 2.90, cultivableWaste: 1.70, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.70, waterLogged: 3.20, stillWater: 18.20, marshyLand: 0.88, netAreaSown: 198.00 },
        { cluster: "3", landType: "Dry", buildingCourtyard: 15.20, otherNonAgri: 10.80, barrenUncultivable: 28.50, miscTreeCrops: 5.20, permanentPastures: 2.40, cultivableWaste: 1.40, otherFallow: 0.80, currentFallow: 1.20, socialForestry: 4.00, waterLogged: 2.80, stillWater: 15.60, marshyLand: 0.75, netAreaSown: 165.00 },
      ],
      "Iritty Central": [
        { cluster: "1", landType: "Dry", buildingCourtyard: 13.80, otherNonAgri: 9.60, barrenUncultivable: 25.80, miscTreeCrops: 4.80, permanentPastures: 2.20, cultivableWaste: 1.30, otherFallow: 0.70, currentFallow: 1.10, socialForestry: 3.80, waterLogged: 2.60, stillWater: 14.20, marshyLand: 0.70, netAreaSown: 152.00 },
        { cluster: "2", landType: "Wet", buildingCourtyard: 25.40, otherNonAgri: 18.20, barrenUncultivable: 45.80, miscTreeCrops: 8.50, permanentPastures: 4.20, cultivableWaste: 2.80, otherFallow: 1.50, currentFallow: 2.20, socialForestry: 6.50, waterLogged: 5.20, stillWater: 28.40, marshyLand: 1.30, netAreaSown: 285.00 },
      ],
      "Iritty West": [
        { cluster: "1", landType: "Dry", buildingCourtyard: 18.50, otherNonAgri: 12.80, barrenUncultivable: 35.80, miscTreeCrops: 7.20, permanentPastures: 3.40, cultivableWaste: 2.20, otherFallow: 1.10, currentFallow: 1.60, socialForestry: 5.20, waterLogged: 4.20, stillWater: 22.50, marshyLand: 1.00, netAreaSown: 245.00 },
        { cluster: "2", landType: "Dry", buildingCourtyard: 15.20, otherNonAgri: 10.40, barrenUncultivable: 30.80, miscTreeCrops: 6.20, permanentPastures: 2.90, cultivableWaste: 1.90, otherFallow: 0.90, currentFallow: 1.40, socialForestry: 4.50, waterLogged: 3.50, stillWater: 19.80, marshyLand: 0.85, netAreaSown: 205.00 },
      ],
      "Payyannur North": [
        { cluster: "1", landType: "Wet", buildingCourtyard: 22.40, otherNonAgri: 15.60, barrenUncultivable: 42.50, miscTreeCrops: 8.40, permanentPastures: 3.80, cultivableWaste: 2.40, otherFallow: 1.30, currentFallow: 1.90, socialForestry: 6.20, waterLogged: 4.80, stillWater: 25.60, marshyLand: 1.20, netAreaSown: 278.00 },
        { cluster: "2", landType: "Dry", buildingCourtyard: 19.80, otherNonAgri: 13.20, barrenUncultivable: 38.20, miscTreeCrops: 7.40, permanentPastures: 3.40, cultivableWaste: 2.10, otherFallow: 1.10, currentFallow: 1.70, socialForestry: 5.60, waterLogged: 4.20, stillWater: 22.80, marshyLand: 1.05, netAreaSown: 248.00 },
      ],
    };

    return zoneDataMap[selectedZone] || zoneDataMap["North Zone"];
  };

  const landUtilizationData = getLandUtilizationData();

  // Calculate totals for Land Utilization — only rows matching the current
  // filter contribute (non-matching rows are dashed out in the table, so
  // they're excluded from the sum too).
  const landUtilizationTotals = landUtilizationData.reduce((acc, row) => {
    if (!isRowActive(row.landType)) return acc;
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

  // Irrigation Details data by zone
  const getIrrigationData = () => {
    const irrigationMap = {
      "North Zone": [
        { clusterLabel: 1, sourceType: "Tube well", irrigatedArea: 15.50, sourceCount: 3 },
        { clusterLabel: 1, sourceType: "Private wells", irrigatedArea: 28.80, sourceCount: 10 },
        { clusterLabel: 2, sourceType: "Tube well", irrigatedArea: 12.80, sourceCount: 2 },
        { clusterLabel: 2, sourceType: "Private wells", irrigatedArea: 22.40, sourceCount: 8 },
        { clusterLabel: 3, sourceType: "Private wells", irrigatedArea: 25.60, sourceCount: 9 },
      ],
      "South Zone": [
        { clusterLabel: 1, sourceType: "Private wells", irrigatedArea: 18.50, sourceCount: 6 },
        { clusterLabel: 1, sourceType: "Tube well", irrigatedArea: 6.80, sourceCount: 1 },
        { clusterLabel: 2, sourceType: "Private wells", irrigatedArea: 15.80, sourceCount: 5 },
      ],
      "East Zone": [
        { clusterLabel: 1, sourceType: "Government tanks", irrigatedArea: 12.30, sourceCount: 1 },
        { clusterLabel: 1, sourceType: "Private wells", irrigatedArea: 24.50, sourceCount: 8 },
        { clusterLabel: 2, sourceType: "Private wells", irrigatedArea: 19.80, sourceCount: 7 },
        { clusterLabel: 3, sourceType: "Private wells", irrigatedArea: 32.40, sourceCount: 12 },
      ],
      "Iritty Central": [
        { clusterLabel: 1, sourceType: "Private wells", irrigatedArea: 28.60, sourceCount: 10 },
        { clusterLabel: 1, sourceType: "Tube well", irrigatedArea: 8.90, sourceCount: 2 },
        { clusterLabel: 2, sourceType: "Private wells", irrigatedArea: 45.80, sourceCount: 18 },
      ],
      "Iritty West": [
        { clusterLabel: 1, sourceType: "Private wells", irrigatedArea: 25.40, sourceCount: 9 },
        { clusterLabel: 1, sourceType: "Government tanks", irrigatedArea: 8.20, sourceCount: 1 },
        { clusterLabel: 2, sourceType: "Private wells", irrigatedArea: 35.60, sourceCount: 14 },
      ],
    };
    return irrigationMap[selectedZone] || irrigationMap["North Zone"];
  };

  const irrigationDetailsData = getIrrigationData();

  // Land Utilization column headers (Land Type column removed — the filter
  // above now covers that distinction).
  const luIdentityColumns = [
    { id: 'cluster', label: 'Cluster No', minWidth: 80 },
    { id: 'panchayath', label: 'Panchayath', minWidth: 130 }
  ];
  const luDataColumns = [
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
  const landUtilizationColumns = [...luIdentityColumns, ...luDataColumns];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    navigate('/schemes/earas/cce/ZoneForm2', {
      state: {
        officeType: location.state?.officeType || 'DIRECTORATE',
        districtId: location.state?.districtId || savedState.districtId,
        districtName: selectedDistrict,
        selectedDistrict,
        talukId: location.state?.talukId || savedState.talukId,
        talukName: selectedTaluk,
        selectedTaluk,
        activeTab
      }
    });
  };

  const formatNumber = (num) => {
    return num.toFixed(2);
  };

  // Panchayath names for clusters
  const panchayathNames = {
    1: "Taliparamba North",
    2: "Taliparamba South",
    3: "Muzhappilangad",
    4: "Peralasseri",
    5: "Pattuvam"
  };

  // Land Type filter options
  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Breadcrumb />
      </Box>
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
            {selectedZone} - Cluster wise Land Utilization & Irrigation Report
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            {selectedTaluk} Taluk, {selectedDistrict} District
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
                <Table stickyHeader sx={{ minWidth: 1700 }}>
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
                    {landUtilizationData.map((row, index) => {
                      const active = isRowActive(row.landType);
                      return (
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
                              label={panchayathNames[row.cluster] || "Taliparamba"}
                              size="small"
                              sx={{
                                backgroundColor: alpha(themeColor, 0.1),
                                color: themeColor,
                                fontWeight: 500,
                                borderRadius: 1.5
                              }}
                            />
                          </TableCell>
                          {luDataColumns.map((col) => (
                            <TableCell key={col.id} sx={{ color: active ? 'inherit' : 'text.disabled' }}>
                              {active ? formatNumber(row[col.id]) : '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                    {/* Total Row */}
                    <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                      <TableCell sx={{ fontWeight: 700, color: themeColor }}>
                        <strong>TOTAL</strong>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}></TableCell>
                      {luDataColumns.map((col) => (
                        <TableCell key={col.id} sx={{ fontWeight: 700 }}>
                          {formatNumber(landUtilizationTotals[col.id])}
                        </TableCell>
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
              <TableContainer sx={{ maxHeight: 500, overflowX: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: 800 }}>
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
                          minWidth: 120,
                          borderRight: `1px solid ${alpha('#fff', 0.2)}`,
                          verticalAlign: 'middle',
                        }}
                      >
                        Panchayath
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
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 70 }}>Count</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 90 }}>Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 70 }}>Count</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 90 }}>Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 70 }}>Count</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 90 }}>Area (Ha)</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 70 }}>Count</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: alpha(themeColor, 0.7), color: 'white', fontWeight: 600, minWidth: 90 }}>Area (Ha)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const clusterLandTypeMap = {};
                      landUtilizationData.forEach(item => {
                        clusterLandTypeMap[item.cluster] = item.landType;
                      });

                      const groupedByCluster = {};

                      for (let i = 1; i <= Math.max(...landUtilizationData.map(d => parseInt(d.cluster)), 5); i++) {
                        groupedByCluster[i] = {
                          landType: clusterLandTypeMap[i] || 'Dry',
                          panchayath: panchayathNames[i] || "Taliparamba",
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

                      // Calculate totals — only clusters matching the current
                      // filter contribute, same as the Land Utilization total.
                      const totals = {
                        tubeWell: { count: 0, area: 0 },
                        govtTanks: { count: 0, area: 0 },
                        privateWells: { count: 0, area: 0 },
                        privateTanks: { count: 0, area: 0 }
                      };

                      return Object.keys(groupedByCluster).filter(cluster =>
                        groupedByCluster[cluster].tubeWell.count > 0 ||
                        groupedByCluster[cluster].govtTanks.count > 0 ||
                        groupedByCluster[cluster].privateWells.count > 0 ||
                        groupedByCluster[cluster].privateTanks.count > 0
                      ).map(cluster => {
                        const data = groupedByCluster[cluster];
                        const active = isRowActive(data.landType);
                        if (active) {
                          totals.tubeWell.count += data.tubeWell.count;
                          totals.tubeWell.area += data.tubeWell.area;
                          totals.govtTanks.count += data.govtTanks.count;
                          totals.govtTanks.area += data.govtTanks.area;
                          totals.privateWells.count += data.privateWells.count;
                          totals.privateWells.area += data.privateWells.area;
                          totals.privateTanks.count += data.privateTanks.count;
                          totals.privateTanks.area += data.privateTanks.area;
                        }

                        const cellSx = { color: active ? 'inherit' : 'text.disabled' };

                        return (
                          <TableRow key={cluster} hover sx={{ '&:hover': { backgroundColor: alpha(themeColor, 0.04) } }}>
                            <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: alpha(themeColor, 0.02), py: 1.2 }}>
                              <Chip label={cluster} size="small" sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold', borderRadius: 2, minWidth: 45 }} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={data.panchayath} size="small" sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 500, borderRadius: 2 }} />
                            </TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.tubeWell.count > 0 ? data.tubeWell.count : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.tubeWell.area > 0 ? formatNumber(data.tubeWell.area) : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.govtTanks.count > 0 ? data.govtTanks.count : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.govtTanks.area > 0 ? formatNumber(data.govtTanks.area) : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.privateWells.count > 0 ? data.privateWells.count : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.privateWells.area > 0 ? formatNumber(data.privateWells.area) : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.privateTanks.count > 0 ? data.privateTanks.count : '-'}</TableCell>
                            <TableCell align="center" sx={cellSx}>{active && data.privateTanks.area > 0 ? formatNumber(data.privateTanks.area) : '-'}</TableCell>
                          </TableRow>
                        );
                      }).concat(
                        <TableRow key="total" sx={{ backgroundColor: alpha(themeColor, 0.1), borderTop: `2px solid ${themeColor}` }}>
                          <TableCell align="center" sx={{ fontWeight: 800, color: themeColor, py: 1.5 }}><strong>TOTAL</strong></TableCell>
                          <TableCell align="center"></TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.tubeWell.count > 0 ? totals.tubeWell.count : '-'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{formatNumber(totals.tubeWell.area)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.govtTanks.count > 0 ? totals.govtTanks.count : '-'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{formatNumber(totals.govtTanks.area)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.privateWells.count > 0 ? totals.privateWells.count : '-'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{formatNumber(totals.privateWells.area)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{totals.privateTanks.count > 0 ? totals.privateTanks.count : '-'}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{formatNumber(totals.privateTanks.area)}</TableCell>
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
    </Box>
  );
};

export default Form2;
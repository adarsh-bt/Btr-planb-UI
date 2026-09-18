import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  IconButton,
  Tooltip, Stack
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  WbSunny,
  Visibility,
  VisibilityOff,
  InfoOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
import api from 'api/api';

const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;

const LAND_FIELD_MAP = {
  buildingCourtyard: 'buildingArea',
  otherNonAgri: 'nonAgriculturalArea',
  barrenUncultivable: 'barrenArea',
  miscTreeCrops: 'miscellaneousTreesArea',
  permanentPastures: 'permanentPasturesArea',
  cultivableWaste: 'cultivableWasteArea',
  otherFallow: 'otherFallowArea',
  currentFallow: 'currentFallowArea',
  socialForestry: 'areaUnderSocialForestry',
  waterLogged: 'waterloggedArea',
  stillWater: 'stillWaterLand',
  marshyLand: 'marshyLand',
  netAreaSown: 'netAreasSown'
};

// Wet/Dry classification for irrigation sources
const IRRIGATION_SOURCE_CATEGORY = {
  1: 'wet', // Government canals
  2: 'wet', // Private canals
  3: 'wet', // Government tanks
  4: 'wet', // Private tank
  5: 'dry', // Government wells
  6: 'dry', // Private wells
  7: 'dry', // Test well
  9: 'wet', // By pumps from rivers, lakes, rivulets, etc
  10: 'wet', // By country wheels from rivers, lakes...
  11: 'wet' // By other means from rivers, lakes, rivulets and springs
};

// Fallback districts list
function getFallbackDistricts() {
  return [
    { distId: 1, distNameEn: 'Thiruvananthapuram' },
    { distId: 2, distNameEn: 'Kollam' },
    { distId: 3, distNameEn: 'Pathanamthitta' },
    { distId: 4, distNameEn: 'Alappuzha' },
    { distId: 5, distNameEn: 'Kottayam' },
    { distId: 6, distNameEn: 'Idukki' },
    { distId: 7, distNameEn: 'Ernakulam' },
    { distId: 8, distNameEn: 'Thrissur' },
    { distId: 9, distNameEn: 'Palakkad' },
    { distId: 10, distNameEn: 'Malappuram' },
    { distId: 11, distNameEn: 'Kozhikode' },
    { distId: 12, distNameEn: 'Wayanad' },
    { distId: 13, distNameEn: 'Kannur' },
    { distId: 14, distNameEn: 'Kasaragod' }
  ];
}

const KeralaForm2 = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const navigate = useNavigate();
  const location = useLocation();

  // Agricultural year from AuthService
  const agriculturalYear = AuthService.agriyear() || '2025-2026';

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Land Type filter state: 'all' | 'wet' | 'dry'
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // API data
  const [landData, setLandData] = useState([]);
  const [irrigationApiData, setIrrigationApiData] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterDistrictsLoading, setMasterDistrictsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shared style for numeric cells
  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

  // Fetch master districts list
  const fetchMasterDistricts = async () => {
    setMasterDistrictsLoading(true);
    try {
      const response = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/districts`);
      console.log('Master Districts Response:', response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const mappedDistricts = response.data.data.map(d => ({
          distId: d.distId,
          distNameEn: d.distNameEn || d.districtName || d.name || ''
        }));
        console.log('Mapped Districts:', mappedDistricts);
        setDistrictsList(mappedDistricts);
      } else {
        console.warn('No districts found, using fallback');
        setDistrictsList(getFallbackDistricts());
      }
    } catch (err) {
      console.error('Error fetching master districts:', err);
      setDistrictsList(getFallbackDistricts());
    } finally {
      setMasterDistrictsLoading(false);
    }
  };

  // Role-based auto-redirection
  useEffect(() => {
    try {
      const officeInfo = JSON.parse(sessionStorage.getItem('userOfficeInfo') || '{}');
      let officeType = location.state?.officeType || officeInfo.officeType;

      if (!officeType) {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';

        if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
          officeType = 'TALUK';
        } else if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
          officeType = 'DISTRICT';
        }
      }

      if (officeType === 'DISTRICT') {
        const distId = location.state?.districtId || officeInfo.districtOfficeId || officeInfo.districtId || localStorage.getItem('dis');
        const distName = location.state?.districtName || officeInfo.districtName || '';
        if (distId) {
          navigate('/schemes/earas/cce/TalukForm2', {
            replace: true,
            state: {
              officeType: 'DISTRICT',
              viewLevel: 'district',
              districtId: distId,
              districtName: distName,
              selectedDistrict: distName,
              isDirectAccess: true,
              activeTab: 0
            }
          });
        }
      } else if (officeType === 'TALUK') {
        const tId = location.state?.talukId || officeInfo.talukOfficeId || officeInfo.talukId;
        const tName = location.state?.talukName || officeInfo.talukName || '';
        const distId = location.state?.districtId || officeInfo.districtOfficeId || officeInfo.districtId || localStorage.getItem('dis');
        const distName = location.state?.districtName || officeInfo.districtName || '';
        if (tId) {
          navigate('/schemes/earas/cce/ZoneForm2', {
            replace: true,
            state: {
              officeType: 'TALUK',
              viewLevel: 'taluk',
              talukId: tId,
              talukName: tName,
              selectedTaluk: tName,
              districtId: distId,
              districtName: distName,
              isDirectAccess: true,
              activeTab: 0
            }
          });
        }
      }
    } catch (e) {
      console.error('Error during role check redirection in KeralaForm2:', e);
    }
  }, [location.state, navigate]);

  // Fetch master districts on mount
  useEffect(() => {
    fetchMasterDistricts();
  }, []);

  /* ─────────────────────────── fetch data ─────────────────────────── */

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        const landUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/district-wise?agriYear=${agriculturalYear}`;
        const irrigationUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/district-irrigation?agriYear=${agriculturalYear}`;

        const [landRes, irrRes] = await Promise.all([axios.get(landUrl, { headers }), axios.get(irrigationUrl, { headers })]);

        console.log('Land Data Response:', landRes.data);
        console.log('Irrigation Data Response:', irrRes.data);

        setLandData(Array.isArray(landRes.data) ? landRes.data : []);
        setIrrigationApiData(Array.isArray(irrRes.data) ? irrRes.data : []);
      } catch (err) {
        console.error('Error fetching Form 2 data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agriculturalYear]);

  /* ─────────────────────── land utilization data ─────────────────────── */

  // Transform API rows and merge with master districts list
  const districtData = useMemo(() => {
    // Create a map for quick lookup of API data by district name or ID
    const apiDataMap = {};
    landData.forEach((d) => {
      const name = d.districtName || '';
      const id = d.districtId;
      if (name) apiDataMap[name.toLowerCase().trim()] = d;
      if (id) apiDataMap[`id_${id}`] = d;
    });

    // If we have master districts list, merge with API data
    let mergedData = [];
    if (districtsList && districtsList.length > 0) {
      mergedData = districtsList.map((district) => {
        const distId = district.distId;
        const distName = district.distNameEn || '';

        // Try to find API data by ID first, then by name
        let apiData = null;
        if (distId && apiDataMap[`id_${distId}`]) {
          apiData = apiDataMap[`id_${distId}`];
        } else if (distName && apiDataMap[distName.toLowerCase().trim()]) {
          apiData = apiDataMap[distName.toLowerCase().trim()];
        }

        const row = {
          districtId: distId,
          district: distName
        };

        // Populate land utilization fields
        Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
          row[colId] = apiData ? Number(apiData[apiKey]) || 0 : 0;
        });

        return row;
      });
    } else {
      // Fallback: use only API data
      mergedData = landData.map((d) => {
        const row = {
          districtId: d.districtId ?? null,
          district: d.districtName || 'Unassigned'
        };
        Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
          row[colId] = Number(d[apiKey]) || 0;
        });
        return row;
      });
    }

    // Sort alphabetically by district name, with Unassigned at the end
    return mergedData.sort((a, b) => {
      if (a.district === 'Unassigned') return 1;
      if (b.district === 'Unassigned') return -1;
      return a.district.localeCompare(b.district);
    });
  }, [landData, districtsList]);

  // Check if a district has any data
  const hasDistrictData = (row) => {
    let hasData = false;
    Object.keys(LAND_FIELD_MAP).forEach((colId) => {
      if (row[colId] > 0) hasData = true;
    });
    return hasData;
  };

  // Count districts with no data
  const districtsWithNoData = useMemo(() => {
    return districtData.filter(row => !hasDistrictData(row) && row.districtId !== null).length;
  }, [districtData]);

  // Totals for Land Utilization
  const landUtilizationTotals = useMemo(() => {
    const acc = {};
    Object.keys(LAND_FIELD_MAP).forEach((colId) => (acc[colId] = 0));
    districtData.forEach((row) => {
      Object.keys(LAND_FIELD_MAP).forEach((colId) => (acc[colId] += row[colId]));
    });
    return acc;
  }, [districtData]);

  // Land Utilization Columns
  const landUtilizationColumns = [
    { id: 'district', label: 'District', minWidth: 160, align: 'left', category: 'always' },
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

  const isColumnActive = (col) => col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  /* ─────────────────────── irrigation data ─────────────────────── */

  // Merge irrigation data with master districts list
  const irrigationRows = useMemo(() => {
    // Create a map for quick lookup of API data by district name or ID
    const apiDataMap = {};
    irrigationApiData.forEach((d) => {
      const name = d.districtName || '';
      const id = d.districtId;
      if (name) apiDataMap[name.toLowerCase().trim()] = d;
      if (id) apiDataMap[`id_${id}`] = d;
    });

    let mergedData = [];
    if (districtsList && districtsList.length > 0) {
      mergedData = districtsList.map((district) => {
        const distId = district.distId;
        const distName = district.distNameEn || '';

        let apiData = null;
        if (distId && apiDataMap[`id_${distId}`]) {
          apiData = apiDataMap[`id_${distId}`];
        } else if (distName && apiDataMap[distName.toLowerCase().trim()]) {
          apiData = apiDataMap[distName.toLowerCase().trim()];
        }

        const byId = {};
        if (apiData && apiData.sources) {
          apiData.sources.forEach((s) => {
            byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
          });
        }

        return {
          districtId: distId,
          district: distName,
          byId: byId
        };
      });
    } else {
      // Fallback: use only API data
      mergedData = irrigationApiData.map((d) => {
        const byId = {};
        (d.sources || []).forEach((s) => {
          byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
        });
        return {
          districtId: d.districtId ?? null,
          district: d.districtName || 'Unassigned',
          byId: byId
        };
      });
    }

    // Sort alphabetically by district name, with Unassigned at the end
    return mergedData.sort((a, b) => {
      if (a.district === 'Unassigned') return 1;
      if (b.district === 'Unassigned') return -1;
      return a.district.localeCompare(b.district);
    });
  }, [irrigationApiData, districtsList]);

  // Unique source columns across all districts
  const irrigationSources = useMemo(() => {
    const map = new Map();
    irrigationApiData.forEach((d) =>
      (d.sources || []).forEach((s) => {
        if (!map.has(s.sourceId)) map.set(s.sourceId, { sourceId: s.sourceId, sourceName: s.sourceName });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.sourceId - b.sourceId);
  }, [irrigationApiData]);

  // Column totals per source
  const irrigationTotals = useMemo(() => {
    const t = {};
    irrigationSources.forEach((s) => (t[s.sourceId] = { count: 0, area: 0 }));
    irrigationRows.forEach((r) => {
      irrigationSources.forEach((s) => {
        const cell = r.byId[s.sourceId];
        if (cell) {
          t[s.sourceId].count += cell.count;
          t[s.sourceId].area += cell.area;
        }
      });
    });
    return t;
  }, [irrigationRows, irrigationSources]);

  const isSourceActive = (sourceId) => {
    const cat = IRRIGATION_SOURCE_CATEGORY[sourceId];
    if (!cat) return true;
    return landTypeFilter === 'all' || cat === landTypeFilter;
  };

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  const handleDistrictClick = (districtName, districtId, tabIndex) => {
    if (districtId == null) return;
    navigate(`/schemes/earas/cce/TalukForm2`, {
      state: {
        officeType: location.state?.officeType || 'DIRECTORATE',
        districtId,
        districtName,
        selectedDistrict: districtName,
        agriculturalYear,
        activeTab: tabIndex
      }
    });
  };

  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

  /* ─────────────────────────── render ─────────────────────────── */

  if ((loading || masterDistrictsLoading) && landData.length === 0 && irrigationApiData.length === 0 && districtsList.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading Form 2 report...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumb />
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <LocationOn sx={{ fontSize: 32, color: themeColor }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
              Kerala States - Land Utilization &amp; Irrigation Report
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
              (Click on any district to view Taluk-wise details) • Agricultural Year: {agriculturalYear}
            </Typography>
            {districtsWithNoData > 0 && (
              <Chip
                icon={<InfoOutlined />}
                label={`${districtsWithNoData} districts with no data`}
                size="small"
                sx={{ ml: 1, bgcolor: alpha('#ff9800', 0.15), color: '#e65100' }}
              />
            )}
          </Box>

          {/* Error */}
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
              <Typography color="error">Error: {error}</Typography>
            </Paper>
          )}

          {/* Info Banner for districts with no data */}
          {districtsWithNoData > 0 && !loading && (
            <Paper
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: alpha('#ff9800', 0.08),
                borderRadius: 2,
                border: `1px solid ${alpha('#ff9800', 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <InfoOutlined sx={{ color: '#ff9800', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>{districtsWithNoData}</strong> district{districtsWithNoData > 1 ? 's' : ''} have no data available for the selected filters.
              </Typography>
            </Paper>
          )}

          {/* Land Type Filter */}
          <Paper
            elevation={0}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              mb: 2,
              overflow: 'hidden'
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
                    borderRight: idx < landTypeOptions.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.15)}` : 'none',
                    transition: '0.2s',
                    '&:hover': {
                      backgroundColor: alpha(themeColor, 0.04)
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      color: isActive ? themeColor : 'text.secondary'
                    }}
                  >
                    {opt.icon}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                        fontSize: '0.8rem'
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
                      transition: '0.2s'
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
              border: `1px solid ${alpha(themeColor, 0.1)}`
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
                    color: themeColor
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: themeColor,
                  height: 3
                }
              }}
            >
              <Tab icon={<Agriculture sx={{ fontSize: 20 }} />} iconPosition="start" label="Land Utilization" />
              <Tab icon={<WaterDrop sx={{ fontSize: 20 }} />} iconPosition="start" label="Irrigation Details" />
            </Tabs>

            {/* Land Utilization Tab */}
            <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 0 }}>
              {activeTab === 0 && (
                <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            minWidth: 60,
                            py: 1.5,
                            textAlign: 'center'
                          }}
                        >
                          #
                        </TableCell>
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
                                py: 1.5
                              }}
                            >
                              {col.label}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {districtData.length > 0 ? (
                        districtData.map((row, index) => {
                          const clickable = row.districtId != null;
                          const hasData = hasDistrictData(row);
                          const serialNumber = index + 1;

                          return (
                            <TableRow
                              key={index}
                              hover={clickable}
                              onClick={() => handleDistrictClick(row.district, row.districtId, 0)}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                '&:hover': clickable
                                  ? {
                                    backgroundColor: alpha(themeColor, 0.08),
                                    transition: '0.2s'
                                  }
                                  : undefined,
                                ...(!hasData && clickable && {
                                  backgroundColor: alpha('#ff9800', 0.03),
                                  '&:hover': { backgroundColor: alpha('#ff9800', 0.08) }
                                })
                              }}
                            >
                              <TableCell align="center">
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  {serialNumber}
                                </Typography>
                              </TableCell>
                              {landUtilizationColumns.map((col) => {
                                if (col.id === 'district') {
                                  return (
                                    <TableCell key={col.id} align="left">
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                          label={row.district}
                                          size="small"
                                          sx={{
                                            backgroundColor: hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                            color: hasData ? themeColor : '#e65100',
                                            fontWeight: 500,
                                            borderRadius: 1.5,
                                            '&:hover': clickable ? { backgroundColor: hasData ? alpha(themeColor, 0.2) : alpha('#ff9800', 0.2) } : undefined
                                          }}
                                        />
                                        {!hasData && clickable && (
                                          <Chip
                                            label="No Data"
                                            size="small"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.6rem',
                                              bgcolor: alpha('#ff9800', 0.15),
                                              color: '#e65100',
                                              fontWeight: 600
                                            }}
                                          />
                                        )}
                                      </Stack>
                                    </TableCell>
                                  );
                                }
                                const active = isColumnActive(col);
                                const value = row[col.id] || 0;
                                return (
                                  <TableCell
                                    key={col.id}
                                    align="right"
                                    sx={{
                                      ...numericCellSx,
                                      color: active && hasData ? 'inherit' : 'text.disabled'
                                    }}
                                  >
                                    {active && hasData ? formatNumber(value) : '—'}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={landUtilizationColumns.length + 1} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">No data available</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {/* Total Row */}
                      {districtData.length > 0 && (
                        <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                          <TableCell align="center" sx={{ fontWeight: 700, color: themeColor }}>
                            T
                          </TableCell>
                          {landUtilizationColumns.map((col) => {
                            if (col.id === 'district') {
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
                                  color: active ? 'inherit' : 'text.disabled'
                                }}
                              >
                                {active ? formatNumber(landUtilizationTotals[col.id]) : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      )}
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
                            minWidth: 150
                          }}
                        >
                          District
                        </TableCell>
                        <TableCell
                          colSpan={irrigationSources.length || 1}
                          align="center"
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700
                          }}
                        >
                          Source Type
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        {irrigationSources.map((source) => (
                          <TableCell
                            key={source.sourceId}
                            align="center"
                            sx={{
                              backgroundColor: alpha(themeColor, 0.85),
                              color: isSourceActive(source.sourceId) ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 600,
                              minWidth: 150,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {source.sourceName}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        {irrigationSources.map((source) => (
                          <TableCell
                            key={source.sourceId}
                            align="center"
                            sx={{
                              backgroundColor: alpha(themeColor, 0.7),
                              color: isSourceActive(source.sourceId) ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 600
                            }}
                          >
                            Count | Area (Ha)
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {irrigationRows.length > 0 ? (
                        <>
                          {irrigationRows.map((row, index) => {
                            const clickable = row.districtId != null;
                            const hasData = Object.keys(row.byId).length > 0;
                            const serialNumber = index + 1;

                            return (
                              <TableRow
                                key={row.districtId ?? row.district}
                                hover={clickable}
                                onClick={() => handleDistrictClick(row.district, row.districtId, 1)}
                                sx={{
                                  cursor: clickable ? 'pointer' : 'default',
                                  '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.08) } : undefined,
                                  ...(!hasData && clickable && {
                                    backgroundColor: alpha('#ff9800', 0.03),
                                    '&:hover': { backgroundColor: alpha('#ff9800', 0.08) }
                                  })
                                }}
                              >
                                <TableCell align="left">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mr: 1 }}>
                                      {serialNumber}
                                    </Typography>
                                    <Chip
                                      label={row.district}
                                      size="small"
                                      sx={{
                                        backgroundColor: hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                        color: hasData ? themeColor : '#e65100',
                                        fontWeight: 500,
                                        '&:hover': clickable ? { backgroundColor: hasData ? alpha(themeColor, 0.2) : alpha('#ff9800', 0.2) } : undefined
                                      }}
                                    />
                                    {!hasData && clickable && (
                                      <Chip
                                        label="No Data"
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: '0.6rem',
                                          bgcolor: alpha('#ff9800', 0.15),
                                          color: '#e65100',
                                          fontWeight: 600
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </TableCell>
                                {irrigationSources.map((source) => {
                                  const active = isSourceActive(source.sourceId);
                                  const cell = row.byId[source.sourceId];
                                  return (
                                    <TableCell
                                      key={source.sourceId}
                                      align="center"
                                      sx={{
                                        ...numericCellSx,
                                        color: active && hasData ? 'inherit' : 'text.disabled'
                                      }}
                                    >
                                      {active && hasData ? (cell ? `${cell.count} | ${formatNumber(cell.area)}` : '—') : '—'}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                          {/* Total Row */}
                          <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                            <TableCell align="left" sx={{ fontWeight: 700, color: themeColor }}>
                              TOTAL
                            </TableCell>
                            {irrigationSources.map((source) => {
                              const active = isSourceActive(source.sourceId);
                              const t = irrigationTotals[source.sourceId] || { count: 0, area: 0 };
                              return (
                                <TableCell
                                  key={source.sourceId}
                                  align="center"
                                  sx={{
                                    ...numericCellSx,
                                    fontWeight: 700,
                                    color: active ? 'inherit' : 'text.disabled'
                                  }}
                                >
                                  {active ? `${t.count} | ${formatNumber(t.area)}` : '—'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={(irrigationSources.length || 1) + 1} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">No data available</Typography>
                          </TableCell>
                        </TableRow>
                      )}
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

export default KeralaForm2;
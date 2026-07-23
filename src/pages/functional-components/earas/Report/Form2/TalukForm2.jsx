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
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  WbSunny
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';

// Gateway root (e.g. http://localhost:8080). The '/earas-form1-entry' service
// prefix is added on the request path below.
// NOTE: if mainapi.FORM_API already ends in '/earas-form1-entry',
// drop the duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'talukForm2State';

// Maps each internal Land Utilization column id → the field name returned by
// the taluk-summary API. Same shape as the district-wise (state) response.
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

// Wet/Dry classification for irrigation sources, keyed by sourceId.
// ⚠️ VERIFY these against the official source definitions — the API does not
// return a category. Any sourceId NOT listed here is treated as uncategorised
// and always shown regardless of the Wet/Dry filter.
//   surface water (canals, tanks, pumps/wheels from rivers) → 'wet'
//   groundwater (wells) → 'dry'
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
  // 8 (Other minor and lift irrigation schemes), 12 (Others), 13 (No irrigation)
  // intentionally unmapped → always shown under any filter.
};

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

const TalukForm2 = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const navigate = useNavigate();
  const location = useLocation();

  // Merge saved sessionStorage state with location.state (state wins on fresh nav).
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // District scope (passed by KeralaForm2.handleDistrictClick)
  const districtId = stateData.districtId ?? null;
  const districtName = stateData.districtName || stateData.selectedDistrict || 'District';

  // Agricultural year from AuthService (e.g. '2025-2026')
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  // Tab + filter state (open on the tab the user clicked in KeralaForm2)
  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? 0);
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // API data
  const [landData, setLandData] = useState([]);
  const [irrigationApiData, setIrrigationApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

  /* ── persist district context so breadcrumb/refresh keeps working ── */
  useEffect(() => {
    if (districtId != null) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId,
          districtName,
          selectedDistrict: districtName,
          agriculturalYear,
          activeTab: stateData.activeTab ?? 0
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────── fetch ─────────────────────────── */

  useEffect(() => {
    if (districtId == null) {
      setError('District is required. Please navigate from the state (district) report page.');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        const landUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/taluk-summary?agriYear=${agriculturalYear}&districtId=${districtId}`;
        const irrigationUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/taluk?agriYear=${agriculturalYear}&districtId=${districtId}`;

        const [landRes, irrRes] = await Promise.all([axios.get(landUrl, { headers }), axios.get(irrigationUrl, { headers })]);

        setLandData(Array.isArray(landRes.data) ? landRes.data : []);
        setIrrigationApiData(Array.isArray(irrRes.data) ? irrRes.data : []);
      } catch (err) {
        console.error('Error fetching Taluk Form 2 data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('District not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, agriculturalYear]);

  /* ─────────────────────── land utilization data ─────────────────────── */

  // Transform API rows → the internal shape keyed by column id.
  const talukData = useMemo(() => {
    return landData.map((t) => {
      const row = {
        talukId: t.talukId ?? null,
        taluk: t.talukName || 'Unassigned'
      };
      Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
        row[colId] = Number(t[apiKey]) || 0;
      });
      return row;
    });
  }, [landData]);

  const landUtilizationTotals = useMemo(() => {
    const acc = {};
    Object.keys(LAND_FIELD_MAP).forEach((colId) => (acc[colId] = 0));
    talukData.forEach((row) => {
      Object.keys(LAND_FIELD_MAP).forEach((colId) => (acc[colId] += row[colId]));
    });
    return acc;
  }, [talukData]);

  // Taluk column stays left-aligned (text); numeric columns right-aligned.
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

  const isColumnActive = (col) => col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  /* ─────────────────────── irrigation data ─────────────────────── */

  const irrigationSources = useMemo(() => {
    const map = new Map();
    irrigationApiData.forEach((t) =>
      (t.sources || []).forEach((s) => {
        if (!map.has(s.sourceId)) map.set(s.sourceId, { sourceId: s.sourceId, sourceName: s.sourceName });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.sourceId - b.sourceId);
  }, [irrigationApiData]);

  const irrigationRows = useMemo(() => {
    return irrigationApiData.map((t) => {
      const byId = {};
      (t.sources || []).forEach((s) => {
        byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
      });
      return { talukId: t.talukId ?? null, taluk: t.talukName || 'Unassigned', byId };
    });
  }, [irrigationApiData]);

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

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  // Placeholder for a future taluk drill-down (zone/detail level).
  // No endpoint/route was provided, so taluk rows are currently non-clickable.
  // Wire navigation here once the next level exists, e.g.:
// in TalukForm2 — replace the commented stub with:
const handleTalukClick = (talukName, talukId) => {
  if (talukId == null) return;
  navigate('/schemes/earas/cce/ZoneForm2', {
    state: { districtId, districtName, talukId, talukName, agriculturalYear, activeTab }
  });
};

  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

  /* ─────────────────────────── render ─────────────────────────── */

  if (loading && landData.length === 0 && irrigationApiData.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading taluk report...
        </Typography>
      </Box>
    );
  }

  return (
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
            {districtName} District - Taluk-wise Land Utilization &amp; Irrigation Report
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            Agricultural Year: {agriculturalYear}
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        )}

        {/* Land Type Filter - applies to both tabs */}
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
                    {talukData.length > 0 ? (
                      talukData.map((row, index) => (
                        <TableRow
                          key={index}
                          hover
                          onClick={() => handleTalukClick(row.taluk, row.talukId)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(themeColor, 0.08) } }}
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
                                      borderRadius: 1.5
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
                                  color: active ? 'inherit' : 'text.disabled'
                                }}
                              >
                                {active ? formatNumber(row[col.id]) : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={landUtilizationColumns.length} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Total Row */}
                    {talukData.length > 0 && (
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
                        Taluk
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
                        {irrigationRows.map((row) => (
                          <TableRow
                            key={row.talukId ?? row.taluk}
                            hover
                            onClick={() => handleTalukClick(row.taluk, row.talukId)}
                            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(themeColor, 0.08) } }}
                          >
                            <TableCell align="left">
                              <Chip
                                label={row.taluk}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(themeColor, 0.1),
                                  color: themeColor,
                                  fontWeight: 500
                                }}
                              />
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
                                    color: active ? 'inherit' : 'text.disabled'
                                  }}
                                >
                                  {!active ? '—' : cell ? `${cell.count} | ${formatNumber(cell.area)}` : '—'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
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
  );
};

export default TalukForm2;
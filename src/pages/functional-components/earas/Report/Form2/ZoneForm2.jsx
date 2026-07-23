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
  Stack,
  CircularProgress
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
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';

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
const themeColor = '#05307a';
const stickyTintLight = '#eef1f7';    // ~ alpha(themeColor, 0.06) over white
const stickyTintSubtotal = '#e4e9f2'; // ~ alpha(themeColor, 0.08) over white
const stickyTintGrand = '#d2dbe9';    // ~ alpha(themeColor, 0.15) over white
const stickyHeaderSub = '#22528b';    // ~ alpha(themeColor, 0.85) over white

// Gateway root (e.g. http://localhost:8080). '/earas-form1-entry' added below.
// NOTE: if mainapi.FORM_API already ends in '/earas-form1-entry', drop the
// duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'zoneForm2State';

// Internal column id → API field name (same land shape at every level).
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
// ⚠️ VERIFY against the official source definitions — the API does not return a
// category. Any sourceId NOT listed here is always shown under any filter.
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
  // 8, 12, 13 intentionally unmapped → always shown.
};

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Resolve the block a zone belongs to.
//   real block   → blockName (when blockId & blockName present)
//   blockId null  → keyword in zoneName: 'municipality' → Municipality,
//                   'corporation' → Corporation, otherwise → Unassigned
function resolveBlockName(blockId, blockName, zoneName) {
  if (blockId && blockName) return blockName;
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  return 'Unassigned';
}

// Group rows by block: sorted real blocks first, then Municipality,
// Corporation, Unassigned (only those that exist). Returns an insertion-ordered
// plain object so the render can iterate with Object.entries.
function buildOrderedGroups(rows) {
  const real = new Map();
  const muni = [];
  const corp = [];
  const un = [];
  rows.forEach((r) => {
    if (r.block === 'Municipality') muni.push(r);
    else if (r.block === 'Corporation') corp.push(r);
    else if (r.block === 'Unassigned') un.push(r);
    else {
      if (!real.has(r.block)) real.set(r.block, []);
      real.get(r.block).push(r);
    }
  });
  const ordered = {};
  Array.from(real.keys())
    .sort((a, b) => a.localeCompare(b))
    .forEach((k) => (ordered[k] = real.get(k)));
  if (muni.length) ordered['Municipality'] = muni;
  if (corp.length) ordered['Corporation'] = corp;
  if (un.length) ordered['Unassigned'] = un;
  return ordered;
}

const ZoneForm2 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Merge saved sessionStorage state with location.state (state wins on fresh nav).
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const talukId = stateData.talukId ?? null;
  const selectedDistrict = stateData.districtName || stateData.selectedDistrict || 'District';
  const selectedTaluk = stateData.talukName || stateData.selectedTaluk || 'Taluk';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab || 0);
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // API data
  const [landZonesApi, setLandZonesApi] = useState([]);
  const [irrZonesApi, setIrrZonesApi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── persist taluk context so breadcrumb/refresh keeps working ── */
  useEffect(() => {
    if (talukId != null) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId,
          talukName: selectedTaluk,
          districtId: stateData.districtId ?? null,
          districtName: selectedDistrict,
          agriculturalYear,
          activeTab: stateData.activeTab || 0
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────── fetch ─────────────────────────── */

  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the taluk report page.');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        const landUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/zone-summary?agriYear=${agriculturalYear}&talukId=${talukId}`;
        const irrUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/zone?agriYear=${agriculturalYear}&talukId=${talukId}`;

        const [landRes, irrRes] = await Promise.all([axios.get(landUrl, { headers }), axios.get(irrUrl, { headers })]);

        setLandZonesApi(Array.isArray(landRes.data) ? landRes.data : []);
        setIrrZonesApi(Array.isArray(irrRes.data) ? irrRes.data : []);
      } catch (err) {
        console.error('Error fetching Zone Form 2 data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talukId, agriculturalYear]);

  /* ─────────────────── land utilization derived data ─────────────────── */

  const landRows = useMemo(() => {
    return landZonesApi.map((z) => {
      const row = {
        block: resolveBlockName(z.blockId, z.blockName, z.zoneName),
        zone: z.zoneName || 'Unknown',
        zoneId: z.zoneId
      };
      Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
        row[colId] = Number(z[apiKey]) || 0;
      });
      return row;
    });
  }, [landZonesApi]);

  const { landGrouped, landBlockTotals, landGrandTotals } = useMemo(() => {
    const grouped = buildOrderedGroups(landRows);
    const fields = Object.keys(LAND_FIELD_MAP);
    const blockTotals = {};
    const grand = {};
    fields.forEach((f) => (grand[f] = 0));
    Object.entries(grouped).forEach(([bn, rows]) => {
      const bt = { zoneCount: 0 };
      fields.forEach((f) => (bt[f] = 0));
      rows.forEach((r) => {
        fields.forEach((f) => (bt[f] += r[f]));
        bt.zoneCount += 1;
      });
      blockTotals[bn] = bt;
      fields.forEach((f) => (grand[f] += bt[f]));
    });
    return { landGrouped: grouped, landBlockTotals: blockTotals, landGrandTotals: grand };
  }, [landRows]);

  /* ─────────────────── irrigation derived data ─────────────────── */

  const irrigationSources = useMemo(() => {
    const map = new Map();
    irrZonesApi.forEach((z) =>
      (z.sources || []).forEach((s) => {
        if (!map.has(s.sourceId)) map.set(s.sourceId, { sourceId: s.sourceId, sourceName: s.sourceName });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.sourceId - b.sourceId);
  }, [irrZonesApi]);

  const irrRows = useMemo(() => {
    return irrZonesApi.map((z) => {
      const byId = {};
      (z.sources || []).forEach((s) => {
        byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
      });
      return { block: resolveBlockName(z.blockId, z.blockName, z.zoneName), zone: z.zoneName || 'Unknown', zoneId: z.zoneId, byId };
    });
  }, [irrZonesApi]);

  const { irrGrouped, irrBlockTotals, irrGrandTotals } = useMemo(() => {
    const grouped = buildOrderedGroups(irrRows);
    const blockTotals = {};
    const grand = {};
    irrigationSources.forEach((s) => (grand[s.sourceId] = { count: 0, area: 0 }));
    Object.entries(grouped).forEach(([bn, rows]) => {
      const bt = {};
      irrigationSources.forEach((s) => (bt[s.sourceId] = { count: 0, area: 0 }));
      rows.forEach((r) =>
        irrigationSources.forEach((s) => {
          const c = r.byId[s.sourceId];
          if (c) {
            bt[s.sourceId].count += c.count;
            bt[s.sourceId].area += c.area;
          }
        })
      );
      blockTotals[bn] = bt;
      irrigationSources.forEach((s) => {
        grand[s.sourceId].count += bt[s.sourceId].count;
        grand[s.sourceId].area += bt[s.sourceId].area;
      });
    });
    return { irrGrouped: grouped, irrBlockTotals: blockTotals, irrGrandTotals: grand };
  }, [irrRows, irrigationSources]);

  /* ─────────────────────────── column config ─────────────────────────── */

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

  const landUtilizationDataColumns = landUtilizationColumns.slice(2);

  const isColumnActive = (col) => col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  const isSourceActive = (sourceId) => {
    const cat = IRRIGATION_SOURCE_CATEGORY[sourceId];
    if (!cat) return true;
    return landTypeFilter === 'all' || cat === landTypeFilter;
  };

  // Exact table widths derived from the column definitions — never guessed.
  const LU_TABLE_W = landUtilizationColumns.reduce((sum, c) => sum + c.minWidth, 0);
  const IRR_TABLE_W = IRR_BLOCK_W + IRR_ZONE_W + (irrigationSources.length || 1) * (IRR_COUNT_W + IRR_AREA_W);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const formatNumber = (num) => Number(num || 0).toFixed(2);
  const handleBack = () => navigate(-1);
  const handleZoneClick = (zoneName, zoneId) => {
    navigate(`/schemes/earas/cce/Form2`, {
      state: {
        districtId: stateData.districtId ?? null,
        districtName: selectedDistrict,
        talukId,
        talukName: selectedTaluk,
        zoneId,
        zoneName,
        agriculturalYear,
        activeTab
      }
    });
  };

  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

  // ---- Reusable sticky cell style (solid bg + border-box, widths from <colgroup>) ----
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

  const tableSx = (widthPx) => ({
    width: widthPx,
    minWidth: widthPx,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  });

  /* ─────────────────────────── render ─────────────────────────── */

  if (loading && landZonesApi.length === 0 && irrZonesApi.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading zone report...
        </Typography>
      </Box>
    );
  }

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
            {selectedTaluk} Taluk ({selectedDistrict} District) - Zone wise Land Utilization &amp; Irrigation Report
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Click on any Zone to view detailed report) • Agricultural Year: {agriculturalYear}
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
                <colgroup>
                  {landUtilizationColumns.map((col) => (
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
                          sx={isBlock ? { ...baseSx, left: 0 } : isZone ? { ...baseSx, left: LU_BLOCK_W } : baseSx}
                        >
                          {col.label}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(landGrouped).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={landUtilizationColumns.length} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {Object.entries(landGrouped).map(([blockName, zones]) => {
                    const rows = [];
                    const blockTotal = landBlockTotals[blockName];

                    zones.forEach((zone, idx) => {
                      const isLastInGroup = idx === zones.length - 1;
                      rows.push(
                        <TableRow
                          key={`${blockName}-${zone.zone}-${zone.zoneId}`}
                          hover
                          onClick={() => handleZoneClick(zone.zone, zone.zoneId)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(themeColor, 0.08) } }}
                        >
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
                                  color: active ? 'inherit' : 'text.disabled'
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
                                color: active ? 'inherit' : 'text.disabled'
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

                  {/* {Object.keys(landGrouped).length > 0 && (
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
                              color: active ? 'inherit' : 'text.disabled'
                            }}
                          >
                            {active ? formatNumber(landGrandTotals[col.id]) : '—'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )} */}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ==================== IRRIGATION DETAILS TAB ==================== */}
          {activeTab === 1 && (
            <TableContainer sx={{ maxHeight: 550, overflow: 'auto' }}>
              <Table stickyHeader sx={{ ...tableSx(IRR_TABLE_W), width: '100%' }}>
                <colgroup>
                  <col style={{ width: IRR_BLOCK_W }} />
                  <col style={{ width: IRR_ZONE_W }} />
                  {irrigationSources.map((s) => (
                    <React.Fragment key={s.sourceId}>
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
                    {irrigationSources.map((source) => {
                      const active = isSourceActive(source.sourceId);
                      return (
                        <TableCell
                          key={source.sourceId}
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
                          {source.sourceName}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    {irrigationSources.flatMap((source) => {
                      const active = isSourceActive(source.sourceId);
                      return ['Count', 'Area (Ha)'].map((label, i) => (
                        <TableCell
                          key={`${source.sourceId}-${i}`}
                          align="center"
                          sx={{
                            bgcolor: stickyHeaderSub,
                            color: active ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            position: 'sticky',
                            top: IRR_HEADER_ROW1_H,
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
                  {Object.keys(irrGrouped).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={(irrigationSources.length || 1) * 2 + 2} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {Object.entries(irrGrouped).map(([blockName, zones]) => {
                    const rows = [];

                    zones.forEach((zone, idx) => {
                      const isLastInGroup = idx === zones.length - 1;
                      rows.push(
                        <TableRow
                          key={`${blockName}-${zone.zone}-${zone.zoneId}`}
                          hover
                          onClick={() => handleZoneClick(zone.zone, zone.zoneId)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(themeColor, 0.08) } }}
                        >
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
                                <Typography fontWeight={700} color={themeColor}>
                                  {blockName}
                                </Typography>
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
                          {irrigationSources.map((source) => {
                            const active = isSourceActive(source.sourceId);
                            const data = zone.byId[source.sourceId] || { count: 0, area: 0 };
                            return (
                              <React.Fragment key={source.sourceId}>
                                <TableCell align="center">
                                  {active && data.count > 0 ? (
                                    <Chip
                                      label={data.count}
                                      size="small"
                                      sx={{ bgcolor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 600, minWidth: 40 }}
                                    />
                                  ) : (
                                    <Box component="span" sx={{ color: active ? 'inherit' : 'text.disabled' }}>
                                      -
                                    </Box>
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

                    const blockTotal = irrBlockTotals[blockName];
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
                        {irrigationSources.map((source) => {
                          const active = isSourceActive(source.sourceId);
                          const t = blockTotal[source.sourceId] || { count: 0, area: 0 };
                          return (
                            <React.Fragment key={source.sourceId}>
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

                  {/* {Object.keys(irrGrouped).length > 0 && (
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
                      {irrigationSources.map((source) => {
                        const active = isSourceActive(source.sourceId);
                        const t = irrGrandTotals[source.sourceId] || { count: 0, area: 0 };
                        return (
                          <React.Fragment key={source.sourceId}>
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
                  )} */}
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
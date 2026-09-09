import React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  TablePagination
} from '@mui/material';
import { LocationOn, Store, ArrowBack } from '@mui/icons-material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterIcon from '@mui/icons-material/Water';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

// Gateway root (e.g. http://localhost:8080). '/earas-form1-entry' added below.
// NOTE: if mainapi.FORM_API already ends in '/earas-form1-entry', drop the
// duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'zoneForm3BState';

// Sticky column widths
const BLOCK_W = 150;
const ZONE_W = 200;

// Land type filter — WET / DRY / ALL. 'ALL' means the landType param is not
// sent at all, so the backend returns both.
const DEFAULT_LAND_TYPE = 'ALL';

// Backend expects title-case values (…&landType=Dry). 'ALL' has no entry here,
// so the param is omitted entirely and both land types come back.
const LAND_TYPE_PARAM = { WET: 'Wet', DRY: 'Dry' };

// Irrigation filter — ALL / IRRIGATED / UNIRRIGATED. 'ALL' means the
// isIrrigated param is not sent at all, so the backend returns both.
const DEFAULT_IRRIGATION = 'ALL';
const IRRIGATION_PARAM = { IRRIGATED: 'true', UNIRRIGATED: 'false' };
const IRRIGATION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'IRRIGATED', label: 'Irrigated' },
  { value: 'UNIRRIGATED', label: 'Unirrigated' }
];

const themeColor = '#05307a';
const stickyTintLight = '#eef1f7';
const stickyTintSubtotal = '#e4e9f2';
const stickyTintGrand = '#d2dbe9';

const CROP_GROUPS = [
  { id: 1, name: 'Food crops' },
  { id: 2, name: 'Non food crops' },
  { id: 3, name: 'Trees' },
  { id: 4, name: 'Aromatic plants' },
  { id: 5, name: 'Drugs and Narcotics' },
  { id: 6, name: 'Cereals' },
  { id: 7, name: 'Fibre' },
  { id: 8, name: 'Flowers' },
  { id: 9, name: 'Fodder crops' },
  { id: 10, name: 'Fruits' },
  { id: 11, name: 'Grains' },
  { id: 12, name: 'Green manure crops' },
  { id: 13, name: 'Medicinal plants' },
  { id: 14, name: 'Oil seeds' },
  { id: 15, name: 'Other medicinal plants' },
  { id: 16, name: 'Other trees' },
  { id: 17, name: 'Plantation crops' },
  { id: 18, name: 'Pulses' },
  { id: 19, name: 'Spices' },
  { id: 20, name: 'Sugar crops' },
  { id: 21, name: 'Tubers' },
  { id: 22, name: 'Vegetables' },
  { id: 23, name: 'Dry fruit' }
];

const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Resolve the block a zone belongs to.
//   zoneName contains 'Municipality' / 'Corporation' → that keyword, regardless of blockId
//   otherwise: real block → blockName (when blockId & blockName present), else Unassigned
function resolveBlockName(blockId, blockName, zoneName) {
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;
  return 'Unassigned';
}

// Sorted real blocks first, then Municipality, Corporation, Unassigned.
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

const ZoneForm3B = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const officeInfo = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('userOfficeInfo') || '{}');
    } catch {
      return {};
    }
  }, []);

  const talukId = stateData.talukId || officeInfo.talukOfficeId || officeInfo.talukId || null;
  const talukName = stateData.talukName || stateData.selectedTaluk || officeInfo.talukName || 'Taluk';
  const districtId = stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null;
  const districtName = stateData.districtName || stateData.selectedDistrict || officeInfo.districtName || 'District';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? 0);
  // Inherited from TalukForm3B on drill-down, or restored from session on refresh.
  const [landTypeTab, setLandTypeTab] = useState(stateData.landType ?? DEFAULT_LAND_TYPE);
  const [irrigation, setIrrigation] = useState(stateData.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination is by Block (not raw zone rows) so a block's zones and its
  // subtotal row always stay together on the same page — splitting a block's
  // rowSpan cell across pages isn't possible.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const cropGroupId = CROP_GROUPS[activeTab]?.id;
  const cropGroupName = CROP_GROUPS[activeTab]?.name;

  const numericCellSx = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

  /* ── persist taluk context so breadcrumb/refresh keeps working ── */
  useEffect(() => {
    if (talukId != null) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          talukId,
          talukName,
          districtId,
          districtName,
          agriculturalYear,
          landType: landTypeTab,
          irrigation,
          activeTab: stateData.activeTab ?? 0
        })
      );
    }
  }, [landTypeTab, irrigation]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the taluk report page.');
      return;
    }
    if (!cropGroupId) return;

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const params = new URLSearchParams({
          agriYear: agriculturalYear,
          talukId: String(talukId),
          cropGroupId: String(cropGroupId)
        });
        // 'ALL' is represented by omitting the param entirely.
        const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
        if (landTypeParam) params.append('landType', landTypeParam);

        // 'ALL' is represented by omitting the param entirely.
        const irrigationParam = IRRIGATION_PARAM[irrigation];
        if (irrigationParam) params.append('isIrrigated', irrigationParam);

        const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form3B/taluk?${params.toString()}`;
        console.log('Fetching Zone Form 3B data from:', url);

        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setApiData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching Zone Form 3B data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, talukId, agriculturalYear, landTypeTab, irrigation]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((z) =>
      (z.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  const zoneRows = useMemo(() => {
    return apiData.map((z) => {
      const byId = {};
      (z.crops || []).forEach((c) => {
        byId[c.cropId] = Number(c.areaInCents) || 0;
      });
      return {
        block: resolveBlockName(z.blockId, z.blockName, z.zoneName),
        zone: z.zoneName || 'Unknown',
        zoneId: z.zoneId,
        byId
      };
    });
  }, [apiData]);

  const { grouped, blockTotals, grandTotals } = useMemo(() => {
    const g = buildOrderedGroups(zoneRows);
    const bt = {};
    const grand = {};
    cropColumns.forEach((c) => (grand[c.cropId] = 0));
    Object.entries(g).forEach(([bn, rows]) => {
      const t = {};
      cropColumns.forEach((c) => (t[c.cropId] = 0));
      rows.forEach((r) =>
        cropColumns.forEach((c) => {
          if (r.byId[c.cropId] !== undefined) t[c.cropId] += r.byId[c.cropId];
        })
      );
      bt[bn] = t;
      cropColumns.forEach((c) => (grand[c.cropId] += t[c.cropId]));
    });
    return { grouped: g, blockTotals: bt, grandTotals: grand };
  }, [zoneRows, cropColumns]);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleLandTypeChange = (event, newValue) => {
    if (newValue === null || newValue === undefined) return;
    setLandTypeTab(newValue);
    setPage(0);
  };

  const handleIrrigationChange = (event) => {
    setIrrigation(event.target.value);
    setPage(0);
  };

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const groupedEntries = useMemo(() => Object.entries(grouped), [grouped]);
  const paginatedEntries = useMemo(
    () => groupedEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [groupedEntries, page, rowsPerPage]
  );

  const handleBack = () => {
    navigate('/schemes/earas/Report/Form3B/TalukForm3B', {
      state: { districtId, districtName, selectedDistrict: districtName, landType: landTypeTab, irrigation, activeTab }
    });
  };

  const stickyCellSx = (leftPx, bg, extra = {}) => ({
    position: 'sticky',
    left: leftPx,
    boxSizing: 'border-box',
    backgroundColor: bg,
    whiteSpace: 'nowrap',
    ...extra
  });

  const TABLE_MIN_W = BLOCK_W + ZONE_W + Math.max(cropColumns.length, 1) * 150;

  /* ─────────────────────────── render ─────────────────────────── */

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 4, overflow: 'visible', background: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
    >
      <Breadcrumb />
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <IconButton onClick={handleBack} size="small" sx={{ color: themeColor }}>
            <ArrowBack />
          </IconButton>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            {talukName} Taluk ({districtName} District) - Zone-wise Crop Area Report (Form 3B)
          </Typography>
        </Box>

        {/* Filters — land type + irrigation */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Land type filter — ALL / WET / DRY */}
          <Paper
            elevation={0}
            sx={{ p: 1, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, display: 'inline-block' }}
          >
            <Tabs
              value={landTypeTab}
              onChange={handleLandTypeChange}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40, '&.Mui-selected': { color: themeColor } },
                '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
              }}
            >
              <Tab label="ALL" value="ALL" />
              <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
              <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Irrigation filter — All / Irrigated / Unirrigated */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="zone-form3b-irrigation-label">Irrigation</InputLabel>
            <Select
              labelId="zone-form3b-irrigation-label"
              id="zone-form3b-irrigation"
              value={irrigation}
              label="Irrigation"
              onChange={handleIrrigationChange}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterIcon sx={{ fontSize: 20, color: value === 'UNIRRIGATED' ? '#9e9e9e' : '#0288d1' }} />
                  {IRRIGATION_OPTIONS.find((o) => o.value === value)?.label || ''}
                </Box>
              )}
            >
              {IRRIGATION_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        )}

        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(themeColor, 0.1)}` }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              backgroundColor: alpha(themeColor, 0.05),
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 1.5, minHeight: 'auto', '&.Mui-selected': { color: themeColor } },
              '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
            }}
          >
            {CROP_GROUPS.map((g) => (
              <Tab key={g.id} label={g.name} />
            ))}
          </Tabs>

          <Box role="tabpanel" sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
              <Table
                stickyHeader
                size="small"
                sx={{ width: '100%', minWidth: TABLE_MIN_W, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
              >
                <colgroup>
                  <col style={{ width: BLOCK_W }} />
                  <col style={{ width: ZONE_W }} />
                  {cropColumns.map((c) => (
                    <col key={c.cropId} style={{ width: 150 }} />
                  ))}
                  {/* Spacer column absorbs any leftover width so the real
                      columns keep a consistent, readable size instead of
                      one column stretching edge-to-edge when there are
                      only one or two crop columns. */}
                  <col style={{ width: 'auto' }} />
                </colgroup>

                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ ...stickyCellSx(0, themeColor, { color: 'white' }), top: 0, fontWeight: 700, zIndex: 4 }}
                    >
                      Block
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ ...stickyCellSx(BLOCK_W, themeColor, { color: 'white' }), top: 0, fontWeight: 700, zIndex: 4 }}
                    >
                      Zone
                    </TableCell>
                    {cropColumns.map((crop) => (
                      <TableCell
                        key={crop.cropId}
                        align="right"
                        sx={{ backgroundColor: themeColor, color: 'white', fontWeight: 700, whiteSpace: 'nowrap', py: 1.5, position: 'sticky', top: 0, zIndex: 3 }}
                      >
                        {crop.cropName}
                      </TableCell>
                    ))}
                    <TableCell
                      aria-hidden
                      sx={{ backgroundColor: themeColor, position: 'sticky', top: 0, zIndex: 3, padding: 0 }}
                    />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 3} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={36} />
                      </TableCell>
                    </TableRow>
                  ) : Object.keys(grouped).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 3} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No data available for {cropGroupName}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paginatedEntries.map(([blockName, zones]) => {
                        const rows = [];

                        zones.forEach((zone, idx) => {
                          const isLastInGroup = idx === zones.length - 1;
                          rows.push(
                            <TableRow key={`${blockName}-${zone.zoneId}`} hover>
                              {idx === 0 && (
                                <TableCell
                                  rowSpan={zones.length}
                                  align="center"
                                  sx={{
                                    ...stickyCellSx(0, stickyTintLight),
                                    verticalAlign: 'middle',
                                    fontWeight: 700,
                                    borderRight: `1px solid ${alpha(themeColor, 0.15)}`,
                                    zIndex: 2
                                  }}
                                >
                                  <Stack alignItems="center" spacing={0.5}>
                                    <Store sx={{ fontSize: 24, color: themeColor, opacity: 0.8 }} />
                                    <Typography fontWeight={700} color={themeColor}>
                                      {blockName}
                                    </Typography>
                                    <Chip label={`${zones.length} Zones`} size="small" sx={{ fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.1), color: themeColor }} />
                                  </Stack>
                                </TableCell>
                              )}
                              <TableCell
                                align="left"
                                sx={{ ...stickyCellSx(BLOCK_W, theme.palette.background.paper), zIndex: 1, borderRight: `1px solid ${alpha(themeColor, 0.1)}`, borderBottom: isLastInGroup ? undefined : 'none' }}
                              >
                                <Chip label={zone.zone} size="small" sx={{ bgcolor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 500, borderRadius: 1.5 }} />
                              </TableCell>
                              {cropColumns.map((crop) => {
                                const val = zone.byId[crop.cropId];
                                return (
                                  <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                                    {val ? formatNumber(val) : '—'}
                                  </TableCell>
                                );
                              })}
                              <TableCell aria-hidden sx={{ borderBottom: isLastInGroup ? undefined : 'none' }} />
                            </TableRow>
                          );
                        });

                        // Block subtotal
                        const bt = blockTotals[blockName];
                        rows.push(
                          <TableRow key={`${blockName}-subtotal`} sx={{ bgcolor: stickyTintSubtotal }}>
                            <TableCell colSpan={2} sx={{ ...stickyCellSx(0, stickyTintSubtotal), fontWeight: 700, color: themeColor, py: 1, zIndex: 2 }}>
                              <strong>📊 Total for {blockName}</strong>
                            </TableCell>
                            {cropColumns.map((crop) => (
                              <TableCell key={crop.cropId} align="right" sx={{ ...numericCellSx, fontWeight: 700, bgcolor: stickyTintSubtotal }}>
                                {bt[crop.cropId] ? formatNumber(bt[crop.cropId]) : '—'}
                              </TableCell>
                            ))}
                            <TableCell aria-hidden sx={{ bgcolor: stickyTintSubtotal }} />
                          </TableRow>
                        );

                        return rows;
                      })}

                      {/* Grand total
                      <TableRow sx={{ bgcolor: stickyTintGrand }}>
                        <TableCell colSpan={2} sx={{ ...stickyCellSx(0, stickyTintGrand), fontWeight: 800, color: themeColor, fontSize: '1rem', py: 1.5, zIndex: 2 }}>
                          <strong>🏆 GRAND TOTAL</strong>
                        </TableCell>
                        {cropColumns.map((crop) => (
                          <TableCell key={crop.cropId} align="right" sx={{ ...numericCellSx, fontWeight: 800, bgcolor: stickyTintGrand }}>
                            {grandTotals[crop.cropId] ? formatNumber(grandTotals[crop.cropId]) : '—'}
                          </TableCell>
                        ))}
                      </TableRow> */}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={groupedEntries.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Blocks per page"
              sx={{ borderTop: `1px solid ${alpha(themeColor, 0.1)}` }}
            />
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default ZoneForm3B;
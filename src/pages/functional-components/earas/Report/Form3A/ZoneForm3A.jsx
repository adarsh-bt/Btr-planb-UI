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
  CircularProgress,
  TablePagination
} from '@mui/material';
import { LocationOn, ArrowBack, Store } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'zoneForm3AState';

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

function resolveBlockName(blockId, blockName, zoneName) {
  const lower = (zoneName || '').toLowerCase();
  if (lower.includes('municipality')) return 'Municipality';
  if (lower.includes('corporation')) return 'Corporation';
  if (blockId && blockName) return blockName;
  return 'Unassigned';
}

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

const BLOCK_W = 160;
const ZONE_W = 180;
const CROP_COL_W = 150;

const themeColor = '#05307a';
const stickyTintLight = '#eef1f7';    // ~ alpha(themeColor, 0.06) over white
const stickyTintSubtotal = '#e4e9f2'; // ~ alpha(themeColor, 0.08) over white
const stickyTintGrand = '#d2dbe9';    // ~ alpha(themeColor, 0.15) over white

const ZoneForm3A = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Merge saved sessionStorage state with location.state (state wins on fresh nav).
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

  const districtId = stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null;
  const districtName = stateData.districtName || stateData.selectedDistrict || officeInfo.districtName || 'District';
  const talukId = stateData.talukId || officeInfo.talukOfficeId || officeInfo.talukId || null;
  const talukName = stateData.talukName || stateData.selectedTaluk || officeInfo.talukName || 'Taluk';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? 0);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination is by Block (not raw zone rows) so a block's zones and its
  // subtotal row always stay together on the same page.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const cropGroupId = CROP_GROUPS[activeTab]?.id;
  const cropGroupName = CROP_GROUPS[activeTab]?.name;

  /* ── persist taluk/district context so back-nav / refresh keeps working ── */
  useEffect(() => {
    if (talukId != null) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          districtId,
          districtName,
          selectedDistrict: districtName,
          talukId,
          talukName,
          selectedTaluk: talukName,
          agriculturalYear,
          activeTab: stateData.activeTab ?? 0
        })
      );
    }
  }, [talukId, talukName, districtId, districtName, agriculturalYear, stateData.activeTab]);

  /* ── keep the active crop-group tab in sync in sessionStorage too ── */
  useEffect(() => {
    const saved = getSavedState();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...saved, activeTab }));
  }, [activeTab]);

  /* ─────────────────────────── fetch (per crop group) ─────────────────────────── */

  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the District (Taluk) report page.');
      return;
    }
    if (!cropGroupId) return;

    const fetchZoneData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/taluk?agriYear=${agriculturalYear}&talukId=${talukId}&cropGroupId=${cropGroupId}`;
        console.log('Fetching Zone Form 3A data from:', url);

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApiData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching Zone Form 3A data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchZoneData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, talukId, agriculturalYear]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  // Crop columns = union of crops across all zones for this group, sorted by name.
  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((z) =>
      (z.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);


  const blocksData = useMemo(() => {
    const order = [];
    const map = new Map();
    apiData.forEach((z) => {
      const blockName = resolveBlockName(z.blockId, z.blockName, z.zoneName);
      if (!map.has(blockName)) {
        order.push(blockName);
        map.set(blockName, []);
      }
      const byId = {};
      (z.crops || []).forEach((c) => {
        byId[c.cropId] = Number(c.areaInCents) || 0;
      });

      map.get(blockName).push({
        blockId: z.blockId ?? null,
        blockName,
        zoneId: z.zoneId ?? null,
        zoneName: z.zoneName || 'Unassigned',
        byId,
        crops: z.crops || []
      });
    });

    return order.map((bName) => ({
      blockName: bName,
      zones: map.get(bName)
    }));
  }, [apiData]);

  // Per-block crop totals
  const blockTotals = useMemo(() => {
    const map = new Map();
    blocksData.forEach((b) => {
      const totals = {};
      cropColumns.forEach((c) => (totals[c.cropId] = 0));
      b.zones.forEach((z) => {
        cropColumns.forEach((c) => {
          if (z.byId && z.byId[c.cropId] !== undefined) totals[c.cropId] += z.byId[c.cropId];
        });
      });
      map.set(b.blockName, totals);
    });
    return map;
  }, [blocksData, cropColumns]);

  // Grand total across all blocks/zones
  const grandTotals = useMemo(() => {
    const totals = {};
    cropColumns.forEach((c) => (totals[c.cropId] = 0));
    blocksData.forEach((b) => {
      const bt = blockTotals.get(b.blockName) || {};
      cropColumns.forEach((c) => {
        totals[c.cropId] += bt[c.cropId] || 0;
      });
    });
    return totals;
  }, [blocksData, blockTotals, cropColumns]);


  const TABLE_MIN_W = BLOCK_W + ZONE_W + Math.max(cropColumns.length, 1) * CROP_COL_W;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };
  const formatNumber = (num) => Number(num || 0).toFixed(2);
  const handleBack = () => {
    let effectiveOfficeType = stateData.officeType || officeInfo.officeType;
    if (!effectiveOfficeType) {
      try {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';
        if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
          effectiveOfficeType = 'TALUK';
        } else if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
          effectiveOfficeType = 'DISTRICT';
        }
      } catch (e) {}
    }

    if (effectiveOfficeType === 'TALUK' || stateData.isDirectAccess) {
      navigate('/Report');
    } else {
      navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
        state: {
          officeType: effectiveOfficeType,
          districtId,
          districtName,
          selectedDistrict: districtName,
          activeTab
        }
      });
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedBlocks = useMemo(
    () => blocksData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [blocksData, page, rowsPerPage]
  );

  // Drill down from a Zone row into its Panchayath-wise breakdown
  const handleZoneClick = (blockId, blockName, zoneId, zoneName) => {
    if (zoneId == null) return; // skip the Unassigned / taluk-level bucket
    navigate('/schemes/earas/Report/Form3A/Form3A', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId,
        districtName,
        selectedDistrict: districtName,
        talukId,
        talukName,
        selectedTaluk: talukName,
        blockId,
        blockName,
        selectedBlock: blockName,
        zoneId,
        zoneName,
        selectedZone: zoneName,
        cropGroupId,
        cropGroupName,
        agriculturalYear,
        activeTab
      }
    });
  };

  // ---- Reusable sticky cell style (solid bg + border-box, widths come from <colgroup>) ----
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

  const tableSx = (minWidthPx) => ({
    width: '100%',
    minWidth: minWidthPx,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  });

  // Block + Zone + crop columns + trailing spacer column.
  const colSpanAll = cropColumns.length + 3;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Breadcrumb />
      </Box>
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
            {talukName} Taluk ({districtName} District) - Zone-wise Crop Area Report (Form 3A)
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Click on any zone to view Panchayath-wise details) • Agricultural Year: {agriculturalYear} • Area in Cents
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        )}

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(themeColor, 0.1)}` }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              bgcolor: alpha(themeColor, 0.05),
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', py: 1.5 },
              '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
            }}
          >
            {CROP_GROUPS.map((g) => (
              <Tab key={g.id} label={g.name} />
            ))}
          </Tabs>

          <TableContainer sx={{ maxHeight: 550, overflow: 'auto' }}>
            <Table stickyHeader sx={tableSx(TABLE_MIN_W)}>
              {/* colgroup is the ONLY place widths are defined.
                  Trailing spacer col (width: auto) soaks up any leftover
                  container width so header/subtotal/grand-total bands run
                  edge-to-edge instead of stopping short with a blank gap. */}
              <colgroup>
                <col style={{ width: BLOCK_W }} />
                <col style={{ width: ZONE_W }} />
                {cropColumns.map((crop) => (
                  <col key={crop.cropId} style={{ width: CROP_COL_W }} />
                ))}
                <col style={{ width: 'auto' }} />
              </colgroup>

              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      ...stickyCellSx(0, themeColor, { color: 'white' }),
                      top: 0,
                      fontWeight: 700,
                      py: 1.5,
                      borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                      zIndex: 4
                    }}
                  >
                    Block
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      ...stickyCellSx(BLOCK_W, themeColor, { color: 'white' }),
                      top: 0,
                      fontWeight: 700,
                      py: 1.5,
                      borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                      zIndex: 4
                    }}
                  >
                    Zone
                  </TableCell>
                  {cropColumns.map((crop) => (
                    <TableCell
                      key={crop.cropId}
                      align="right"
                      sx={{
                        bgcolor: themeColor,
                        color: 'white',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        py: 1.5,
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                        borderRight: `1px solid ${alpha('#fff', 0.15)}`,
                        '&:last-child': { borderRight: 'none' }
                      }}
                    >
                      {crop.cropName}
                    </TableCell>
                  ))}
                  {/* spacer header cell — keeps the header color band full-width */}
                  <TableCell
                    aria-hidden
                    sx={{
                      bgcolor: themeColor,
                      position: 'sticky',
                      top: 0,
                      zIndex: 3,
                      p: 0
                    }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={colSpanAll} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={36} />
                    </TableCell>
                  </TableRow>
                ) : blocksData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpanAll} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No data available for {cropGroupName}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {paginatedBlocks.map((block) => {
                      const trs = [];
                      const blockKey = block.blockId ?? block.blockName;

                      block.zones.forEach((zone, idx) => {
                        const isLastInGroup = idx === block.zones.length - 1;
                        const clickable = zone.zoneId != null;
                        trs.push(
                          <TableRow
                            key={`${blockKey}-${zone.zoneId ?? zone.zoneName}`}
                            hover={clickable}
                            onClick={() => handleZoneClick(block.blockId, block.blockName, zone.zoneId, zone.zoneName)}
                            sx={{
                              cursor: clickable ? 'pointer' : 'default',
                              '&:hover': clickable
                                ? { backgroundColor: alpha(themeColor, 0.06), transition: '0.2s' }
                                : undefined
                            }}
                          >
                            {/*
                              NO rowSpan here. Every row owns its own sticky Block
                              cell (content only on the first row, bottom border
                              suppressed in between) so the "merged" look is kept
                              while sticky positioning stays perfectly aligned.
                            */}
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
                                  <Store sx={{ fontSize: 26, color: themeColor, opacity: 0.8 }} />
                                  <Typography fontWeight={700} color={themeColor} variant="subtitle2">
                                    {block.blockName}
                                  </Typography>
                                  <Chip
                                    label={`${block.zones.length} Zones`}
                                    size="small"
                                    sx={{ fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.1), color: themeColor }}
                                  />
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{
                                ...stickyCellSx(BLOCK_W, '#ffffff'),
                                zIndex: 1,
                                borderRight: `1px solid ${alpha(themeColor, 0.1)}`
                              }}
                            >
                              <Chip
                                label={zone.zoneName}
                                size="small"
                                sx={{
                                  bgcolor: alpha(themeColor, 0.1),
                                  color: themeColor,
                                  fontWeight: 600,
                                  borderRadius: 1.5
                                }}
                              />
                            </TableCell>
                            {cropColumns.map((crop) => {
                              const val = zone.byId?.[crop.cropId];
                              return (
                                <TableCell
                                  key={crop.cropId}
                                  align="right"
                                  sx={{
                                    fontVariantNumeric: 'tabular-nums',
                                    whiteSpace: 'nowrap',
                                    verticalAlign: 'middle'
                                  }}
                                >
                                  {val ? formatNumber(val) : '—'}
                                </TableCell>
                              );
                            })}
                            {/* spacer body cell — keeps row height/alignment consistent, no visible content */}
                            <TableCell aria-hidden sx={{ p: 0 }} />
                          </TableRow>
                        );
                      });

                      trs.push(
                        <TableRow key={`${blockKey}-subtotal`} sx={{ bgcolor: stickyTintSubtotal }}>
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
                            <strong>📊 Total for {block.blockName}</strong>
                          </TableCell>
                          {cropColumns.map((crop) => {
                            const val = blockTotals.get(block.blockName)?.[crop.cropId];
                            return (
                              <TableCell
                                key={crop.cropId}
                                align="right"
                                sx={{
                                  fontVariantNumeric: 'tabular-nums',
                                  whiteSpace: 'nowrap',
                                  fontWeight: 700,
                                  bgcolor: stickyTintSubtotal
                                }}
                              >
                                {val ? formatNumber(val) : '—'}
                              </TableCell>
                            );
                          })}
                          {/* spacer subtotal cell — keeps the subtotal band full-width */}
                          <TableCell aria-hidden sx={{ bgcolor: stickyTintSubtotal, p: 0 }} />
                        </TableRow>
                      );

                      return trs;
                    })}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={blocksData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Blocks per page"
            sx={{ borderTop: `1px solid ${alpha(themeColor, 0.1)}` }}
          />
        </Paper>
      </CardContent>
    </Card>
    </Box>
  );
};

export default ZoneForm3A;
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TablePagination
} from '@mui/material';
import { LocationOn, ArrowBack, Store } from '@mui/icons-material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import WaterIcon from '@mui/icons-material/Water';
import GrassIcon from '@mui/icons-material/Grass';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'zoneForm3AState';

// Land type filter — WET / DRY / ALL. 'ALL' means the landType param is not
// sent at all, so the backend returns both.
const DEFAULT_LAND_TYPE = 'ALL';

// Backend expects title-case values (…&landType=Wet). 'ALL' has no entry here,
// so the param is omitted entirely and both land types come back.
const LAND_TYPE_PARAM = { WET: 'Wet', DRY: 'Dry' };

// Season filter — always sent as seasonId. Defaults to Autumn.
const SEASONS = [
  { id: 1, name: 'Autumn' },
  { id: 2, name: 'Winter' },
  { id: 3, name: 'Summer' }
];
const DEFAULT_SEASON_ID = 1;

// Irrigation filter — ALL / IRRIGATED / UNIRRIGATED. 'ALL' means the
// isIrrigated param is not sent at all, so the backend returns both.
const DEFAULT_IRRIGATION = 'ALL';
const IRRIGATION_PARAM = { IRRIGATED: 'true', UNIRRIGATED: 'false' };
const IRRIGATION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'IRRIGATED', label: 'Irrigated' },
  { value: 'UNIRRIGATED', label: 'Unirrigated' }
];

// Selected via the crop group dropdown; the index is kept as `activeTab` so the
// value forwarded through navigate state stays compatible with the other pages.
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

// Crop group filter — 'ALL' is a synthetic option kept outside CROP_GROUPS so the
// index-based `activeTab` contract with the other pages stays intact. It is
// represented by -1 (no valid CROP_GROUPS index) and fans out one request per
// crop group, merging the responses zone-by-zone.
const ALL_CROP_GROUPS = -1;
const ALL_CROP_GROUPS_LABEL = 'All Crop Groups';

// How many crop-group requests run at once when 'All' is selected, so the
// report endpoint isn't hit with 23 concurrent calls.
const FETCH_BATCH_SIZE = 6;

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

// Merge one or more crop-group responses into a single zone list of the same
// shape the API returns ({ blockId, blockName, zoneId, zoneName, crops: [...] }),
// so all the derived data below works unchanged for both single-group and 'All'.
function mergeGroupResponses(responses) {
  const zones = new Map();

  responses.forEach((rows) => {
    (Array.isArray(rows) ? rows : []).forEach((z) => {
      const key = z.zoneId ?? `name:${z.blockId ?? ''}:${z.zoneName || 'Unassigned'}`;
      if (!zones.has(key)) {
        zones.set(key, {
          blockId: z.blockId ?? null,
          blockName: z.blockName,
          zoneId: z.zoneId ?? null,
          zoneName: z.zoneName,
          crops: new Map()
        });
      }
      const entry = zones.get(key);
      (z.crops || []).forEach((c) => {
        const existing = entry.crops.get(c.cropId);
        if (existing) {
          existing.areaInCents = (Number(existing.areaInCents) || 0) + (Number(c.areaInCents) || 0);
        } else {
          entry.crops.set(c.cropId, {
            cropId: c.cropId,
            cropName: c.cropName,
            areaInCents: Number(c.areaInCents) || 0
          });
        }
      });
    });
  });

  return Array.from(zones.values()).map((z) => ({
    blockId: z.blockId,
    blockName: z.blockName,
    zoneId: z.zoneId,
    zoneName: z.zoneName,
    crops: Array.from(z.crops.values())
  }));
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
  // Inherited from the District (Taluk) page on drill-down, or restored from session on refresh.
  const [landTypeTab, setLandTypeTab] = useState(stateData.landType ?? DEFAULT_LAND_TYPE);
  const [seasonId, setSeasonId] = useState(stateData.seasonId ?? DEFAULT_SEASON_ID);
  const [irrigation, setIrrigation] = useState(stateData.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination is by Block (not raw zone rows) so a block's zones and its
  // subtotal row always stay together on the same page.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isAllCropGroups = activeTab === ALL_CROP_GROUPS;
  const cropGroupId = isAllCropGroups ? null : CROP_GROUPS[activeTab]?.id;
  const cropGroupName = isAllCropGroups ? ALL_CROP_GROUPS_LABEL : CROP_GROUPS[activeTab]?.name;
  const seasonName = SEASONS.find((s) => s.id === seasonId)?.name || '';
  const irrigationLabel = IRRIGATION_OPTIONS.find((o) => o.value === irrigation)?.label || '';

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
          landType: landTypeTab,
          seasonId,
          irrigation,
          activeTab: stateData.activeTab ?? 0
        })
      );
    }
  }, [talukId, talukName, districtId, districtName, agriculturalYear, landTypeTab, seasonId, irrigation, stateData.activeTab]);

  /* ── keep the selected crop group + land type + season + irrigation in sync in sessionStorage too ── */
  useEffect(() => {
    const saved = getSavedState();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...saved, activeTab, landType: landTypeTab, seasonId, irrigation }));
  }, [activeTab, landTypeTab, seasonId, irrigation]);

  /* ─────────────────── fetch (per crop group + land type + season + irrigation) ─────────────────── */

  useEffect(() => {
    if (talukId == null) {
      setError('Taluk is required. Please navigate from the District (Taluk) report page.');
      return;
    }
    if (!isAllCropGroups && !cropGroupId) return;

    let cancelled = false;

    const buildUrl = (groupId) => {
      const params = new URLSearchParams({
        agriYear: agriculturalYear,
        talukId: String(talukId),
        cropGroupId: String(groupId)
      });
      // 'ALL' is represented by omitting the param entirely.
      const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
      if (landTypeParam) params.append('landType', landTypeParam);
      params.append('seasonId', String(seasonId));

      // 'ALL' is represented by omitting the param entirely.
      const irrigationParam = IRRIGATION_PARAM[irrigation];
      if (irrigationParam) params.append('isIrrigated', irrigationParam);

      return `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/taluk?${params.toString()}`;
    };

    const fetchZoneData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const headers = { Authorization: `Bearer ${token}` };
        // 'All' fans out to every crop group; a single group keeps its one call.
        const groupIds = isAllCropGroups ? CROP_GROUPS.map((g) => g.id) : [cropGroupId];
        console.log('Fetching Zone Form 3A data for crop groups:', groupIds.join(', '), '→', buildUrl(groupIds[0]));

        const payloads = [];
        for (let i = 0; i < groupIds.length; i += FETCH_BATCH_SIZE) {
          const batch = groupIds.slice(i, i + FETCH_BATCH_SIZE);
          // eslint-disable-next-line no-await-in-loop
          const responses = await Promise.all(batch.map((id) => axios.get(buildUrl(id), { headers })));
          if (cancelled) return;
          responses.forEach((r) => payloads.push(r.data));
        }

        if (cancelled) return;
        setApiData(mergeGroupResponses(payloads));
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching Zone Form 3A data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('Taluk not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchZoneData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, isAllCropGroups, talukId, agriculturalYear, landTypeTab, seasonId, irrigation]);

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

  const handleCropGroupChange = (event) => {
    setActiveTab(Number(event.target.value));
    setPage(0);
  };

  const handleLandTypeChange = (event, newValue) => {
    if (newValue === null || newValue === undefined) return;
    setLandTypeTab(newValue);
    setPage(0);
  };

  const handleSeasonChange = (event) => {
    setSeasonId(Number(event.target.value));
    setPage(0);
  };

  const handleIrrigationChange = (event) => {
    setIrrigation(event.target.value);
    setPage(0);
  };

  const formatNumber = (num) => Number(num || 0).toFixed(2);
  const handleBack = () => {
    if (stateData.officeType === 'TALUK' || stateData.isDirectAccess) {
      navigate('/Report');
    } else {
      navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
        state: {
          officeType: stateData.officeType || 'DIRECTORATE',
          districtId,
          districtName,
          selectedDistrict: districtName,
          landType: landTypeTab,
          seasonId,
          irrigation,
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
        cropGroupId, // null when 'All' is selected
        cropGroupName,
        agriculturalYear,
        landType: landTypeTab,
        seasonId,
        irrigation,
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
            {cropGroupName && ` • ${cropGroupName}`}
            {landTypeTab !== 'ALL' && ` • ${landTypeTab} Land`}
            {seasonName && ` • ${seasonName} Season`}
            {irrigation !== 'ALL' && ` • ${irrigationLabel}`}
          </Typography>
        </Box>

        {/* Filters — crop group + land type + season + irrigation */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Land type filter — ALL / WET / DRY */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              display: 'inline-block'
            }}
          >
            <Tabs
              value={landTypeTab}
              onChange={handleLandTypeChange}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 40,
                  '&.Mui-selected': { color: themeColor }
                },
                '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
              }}
            >
              <Tab label="ALL" value="ALL" />
              <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
              <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Crop group filter — All + one entry per tbl_master_crop_group row */}
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="zone-form3a-cropgroup-label">Crop Group</InputLabel>
            <Select
              labelId="zone-form3a-cropgroup-label"
              id="zone-form3a-cropgroup"
              value={activeTab}
              label="Crop Group"
              onChange={handleCropGroupChange}
              MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GrassIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                  {value === ALL_CROP_GROUPS ? ALL_CROP_GROUPS_LABEL : CROP_GROUPS[value]?.name || ''}
                </Box>
              )}
            >
              <MenuItem value={ALL_CROP_GROUPS}>All</MenuItem>
              {CROP_GROUPS.map((g, index) => (
                <MenuItem key={g.id} value={index}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Season filter — Autumn / Winter / Summer */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="zone-form3a-season-label">Season</InputLabel>
            <Select
              labelId="zone-form3a-season-label"
              id="zone-form3a-season"
              value={seasonId}
              label="Season"
              onChange={handleSeasonChange}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EnergySavingsLeafIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                  {SEASONS.find((s) => s.id === value)?.name || ''}
                </Box>
              )}
            >
              {SEASONS.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Irrigation filter — All / Irrigated / Unirrigated */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="zone-form3a-irrigation-label">Irrigation</InputLabel>
            <Select
              labelId="zone-form3a-irrigation-label"
              id="zone-form3a-irrigation"
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

        {/* Error */}
        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Paper>
        )}

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(themeColor, 0.1)}` }}>
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
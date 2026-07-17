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
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  WbSunny,
  ArrowBack,
  Store
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// =====================================================================
// COLUMN WIDTHS — single source of truth.
// Every table uses a <colgroup> built from these numbers, so the header,
// body, subtotal and grand-total rows can never disagree about widths.
// Only Block and Zone are sticky; crop columns scroll normally.
//
// A trailing "spacer" <col width: auto> is appended to every <colgroup>.
// table-layout: fixed only respects columns with an explicit width, so any
// space left over after Block + Zone + crop columns is handed to that
// spacer instead of being left outside the table as blank container
// background. On tabs with few crop columns (e.g. Cereals) this keeps the
// header/subtotal/grand-total color bands running edge-to-edge instead of
// stopping short and leaving a ragged white gap on the right. On tabs
// where columns already exceed the container width, the spacer collapses
// to ~0 and horizontal scrolling behaves exactly as before.
// =====================================================================
const BLOCK_W = 160;
const ZONE_W = 180;
const CROP_COL_W = 140;

// ---- Solid (non-transparent) tint colors for sticky cells ----
// Solid hex avoids the "ghosting / clipped digit" artifact that happens when
// a semi-transparent sticky cell blends with content scrolling underneath it.
const themeColor = '#05307a';
const stickyTintLight = '#eef1f7';    // ~ alpha(themeColor, 0.06) over white
const stickyTintSubtotal = '#e4e9f2'; // ~ alpha(themeColor, 0.08) over white
const stickyTintGrand = '#d2dbe9';    // ~ alpha(themeColor, 0.15) over white

const ZoneForm3A = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedDistrict = location.state?.districtName || location.state?.selectedDistrict || "Thiruvananthapuram";
  const selectedTaluk = location.state?.talukName || location.state?.selectedTaluk || "Thiruvananthapuram";
  const initialTab = location.state?.activeTab || 0;

  const [activeTab, setActiveTab] = useState(initialTab);

  // Land Type filter: 'all' | 'wet' | 'dry' — applies to the crop columns
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // Irrigation Type filter: which figure populates each cell
  const [irrigationType, setIrrigationType] = useState('total');

  // Deterministic pseudo-random generator so every cell gets a stable,
  // distinct value without hand-authoring every figure.
  const seededArea = (key, min, max) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    const frac = (hash % 10000) / 10000;
    return min + frac * (max - min);
  };

  // Blocks + zones under the selected taluk. Real block/zone administrative
  // boundaries vary by taluk, so these are generated deterministically per
  // district+taluk rather than hand-authored for all 77 taluks — swap in
  // real block/zone master data here once available.
  const blockNames = ['North Block', 'South Block', 'Central Block'];
  const zoneNamesPerBlock = ['Zone 1', 'Zone 2', 'Zone 3'];

  const groupedByBlock = {};
  blockNames.forEach((block) => {
    groupedByBlock[block] = zoneNamesPerBlock.map((zone) => ({ block, zone }));
  });

  // Same seasonal crop tabs as the District/Taluk level reports. minArea/maxArea
  // are scaled down further since a zone is smaller than a taluk.
  const cropCategories = [
    {
      id: 'cereals',
      icon: '🌾',
      label: 'Cereals',
      minArea: 20,
      maxArea: 320,
      crops: [
        { name: 'Rice', category: 'wet' },
        { name: 'Wheat', category: 'dry' },
        { name: 'Maize', category: 'dry' },
        { name: 'Barley', category: 'dry' }
      ]
    },
    {
      id: 'pulses',
      icon: '🌱',
      label: 'Pulses',
      minArea: 3,
      maxArea: 60,
      crops: [
        { name: 'Green gram', category: 'dry' },
        { name: 'Black gram', category: 'dry' },
        { name: 'Red gram', category: 'dry' },
        { name: 'Bengal gram', category: 'dry' },
        { name: 'Cowpea', category: 'dry' },
        { name: 'Horse gram', category: 'dry' }
      ]
    },
    {
      id: 'vegetables',
      icon: '🥔',
      label: 'Vegetables',
      minArea: 2,
      maxArea: 45,
      crops: [
        { name: 'Tomato', category: 'dry' },
        { name: 'Brinjal', category: 'dry' },
        { name: 'Potato', category: 'dry' },
        { name: 'Onion', category: 'dry' },
        { name: 'Cabbage', category: 'dry' },
        { name: 'Cauliflower', category: 'dry' },
        { name: 'Okra', category: 'wet' },
        { name: 'Bitter gourd', category: 'wet' },
        { name: 'Bottle gourd', category: 'wet' },
        { name: 'Pumpkin', category: 'wet' },
        { name: 'Carrot', category: 'dry' },
        { name: 'Beetroot', category: 'dry' },
        { name: 'Radish', category: 'dry' },
        { name: 'Spinach', category: 'dry' },
        { name: 'Cucumber', category: 'wet' },
        { name: 'Beans', category: 'dry' },
        { name: 'Chilli', category: 'dry' }
      ]
    },
    {
      id: 'spices',
      icon: '🌶️',
      label: 'Spices',
      minArea: 6,
      maxArea: 140,
      crops: [
        { name: 'Black Pepper', category: 'wet' },
        { name: 'Cardamom', category: 'wet' },
        { name: 'Ginger', category: 'wet' },
        { name: 'Turmeric', category: 'wet' },
        { name: 'Garlic', category: 'dry' },
        { name: 'Cinnamon', category: 'dry' },
        { name: 'Clove', category: 'dry' },
        { name: 'Nutmeg', category: 'dry' },
        { name: 'Coriander', category: 'dry' },
        { name: 'Cumin', category: 'dry' }
      ]
    },
    {
      id: 'plantation',
      icon: '☕',
      label: 'Plantation Crops',
      minArea: 12,
      maxArea: 550,
      crops: [
        { name: 'Rubber', category: 'dry' },
        { name: 'Tea', category: 'dry' },
        { name: 'Coffee', category: 'dry' },
        { name: 'Cocoa', category: 'dry' },
        { name: 'Coconut', category: 'wet' },
        { name: 'Arecanut', category: 'wet' }
      ]
    }
  ];

  const irrigationTypeOptions = [
    { value: 'total', label: 'Total' },
    { value: 'irrigated', label: 'Irrigated' },
    { value: 'unirrigated', label: 'Unirrigated' }
  ];

  const activeCategory = cropCategories[activeTab];

  const isCropActive = (crop) =>
    landTypeFilter === 'all' || crop.category === landTypeFilter;

  // Zone-wise data for the active category, grouped by block. Each cell
  // carries irrigated/unirrigated/total; the Irrigation Type dropdown picks
  // which one is displayed.
  const zoneDataByBlock = {};
  Object.entries(groupedByBlock).forEach(([blockName, zones]) => {
    zoneDataByBlock[blockName] = zones.map(({ zone }) => {
      const row = { block: blockName, zone };
      activeCategory.crops.forEach((crop) => {
        const seedBase = `${selectedDistrict}-${selectedTaluk}-${blockName}-${zone}-${crop.name}`;
        const irrigated = seededArea(`${seedBase}-irrigated`, activeCategory.minArea * 0.3, activeCategory.maxArea * 0.65);
        const unirrigated = seededArea(`${seedBase}-unirrigated`, activeCategory.minArea * 0.2, activeCategory.maxArea * 0.55);
        row[crop.name] = { irrigated, unirrigated, total: irrigated + unirrigated };
      });
      return row;
    });
  });

  const getCellValue = (row, cropName) => row[cropName][irrigationType];

  // Block subtotals for the active category
  const blockTotals = {};
  Object.entries(zoneDataByBlock).forEach(([blockName, rows]) => {
    blockTotals[blockName] = activeCategory.crops.reduce((acc, crop) => {
      acc[crop.name] = rows.reduce((sum, row) => sum + getCellValue(row, crop.name), 0);
      return acc;
    }, {});
  });

  // Grand totals across all blocks for the active category
  const grandTotals = activeCategory.crops.reduce((acc, crop) => {
    acc[crop.name] = Object.values(blockTotals).reduce((sum, block) => sum + block[crop.name], 0);
    return acc;
  }, {});

  // Minimum width the table needs for its "real" columns (Block + Zone +
  // crop columns). The table itself is rendered at width: 100% with this
  // as its minWidth — see tableSx() below — so the spacer column can
  // absorb any leftover container width instead of it showing up as a
  // blank gap outside the table.
  const TABLE_MIN_W = BLOCK_W + ZONE_W + activeCategory.crops.length * CROP_COL_W;

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const formatNumber = (num) => num.toFixed(2);
  const handleBack = () => navigate(-1);

  // Drill down from a Zone row into its Panchayath-wise breakdown
  const handleZoneClick = (blockName, zoneName) => {
    navigate(`/schemes/earas/Report/Form3A/Form3A`, {
      state: {
        districtName: selectedDistrict,
        selectedDistrict: selectedDistrict,
        talukName: selectedTaluk,
        selectedTaluk: selectedTaluk,
        blockName: blockName,
        selectedBlock: blockName,
        zoneName: zoneName,
        selectedZone: zoneName,
        activeTab: activeTab
      }
    });
  };

  // Land Type filter options
  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];

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

  // Shared table sx: fixed layout + separate borders are BOTH required for
  // sticky columns to stay pixel-aligned while scrolling/dragging.
  // width: 100% (with minWidth as a floor) lets the table fill the
  // container on tabs with few columns, instead of shrinking to its
  // intrinsic content width and leaving blank space beside it.
  const tableSx = (minWidthPx) => ({
    width: '100%',
    minWidth: minWidthPx,
    tableLayout: 'fixed',
    borderCollapse: 'separate',
    borderSpacing: 0
  });

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
            {selectedTaluk} Taluk ({selectedDistrict} District) - Zone-wise Seasonal Crops Report
          </Typography>
        </Box>

        {/* Filters: Land Type (All/Wet/Dry) + Irrigation Type dropdown */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
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

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="irrigation-type-label">Irrigation Type</InputLabel>
            <Select
              labelId="irrigation-type-label"
              value={irrigationType}
              label="Irrigation Type"
              onChange={(e) => setIrrigationType(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.3),
                },
              }}
            >
              {irrigationTypeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(themeColor, 0.1)}` }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              bgcolor: alpha(themeColor, 0.05),
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem', py: 1.5 },
              '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
            }}
          >
            {cropCategories.map((cat) => (
              <Tab key={cat.id} label={`${cat.icon} ${cat.label}`} />
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
                {activeCategory.crops.map((crop) => (
                  <col key={crop.name} style={{ width: CROP_COL_W }} />
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
                  {activeCategory.crops.map((crop) => {
                    const active = isCropActive(crop);
                    return (
                      <TableCell
                        key={crop.name}
                        align="right"
                        sx={{
                          bgcolor: themeColor,
                          color: active ? 'white' : alpha('#ffffff', 0.5),
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
                        {crop.name}
                      </TableCell>
                    );
                  })}
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
                {Object.entries(zoneDataByBlock).map(([blockName, rows]) => {
                  const trs = [];

                  rows.forEach((row, idx) => {
                    const isLastInGroup = idx === rows.length - 1;
                    trs.push(
                      <TableRow
                        key={`${blockName}-${row.zone}`}
                        hover
                        onClick={() => handleZoneClick(blockName, row.zone)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha(themeColor, 0.06),
                            transition: '0.2s'
                          }
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
                                {blockName}
                              </Typography>
                              <Chip
                                label={`${rows.length} Zones`}
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
                            label={row.zone}
                            size="small"
                            sx={{
                              bgcolor: alpha(themeColor, 0.1),
                              color: themeColor,
                              fontWeight: 600,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        {activeCategory.crops.map((crop) => {
                          const active = isCropActive(crop);
                          return (
                            <TableCell
                              key={crop.name}
                              align="right"
                              sx={{
                                fontVariantNumeric: 'tabular-nums',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                color: active ? 'inherit' : 'text.disabled',
                              }}
                            >
                              {active ? formatNumber(getCellValue(row, crop.name)) : '—'}
                            </TableCell>
                          );
                        })}
                        {/* spacer body cell — keeps row height/alignment consistent, no visible content */}
                        <TableCell aria-hidden sx={{ p: 0 }} />
                      </TableRow>
                    );
                  });

                  trs.push(
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
                      {activeCategory.crops.map((crop) => {
                        const active = isCropActive(crop);
                        return (
                          <TableCell
                            key={crop.name}
                            align="right"
                            sx={{
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap',
                              fontWeight: 700,
                              bgcolor: stickyTintSubtotal,
                              color: active ? 'inherit' : 'text.disabled',
                            }}
                          >
                            {active ? formatNumber(blockTotals[blockName][crop.name]) : '—'}
                          </TableCell>
                        );
                      })}
                      {/* spacer subtotal cell — keeps the subtotal band full-width */}
                      <TableCell aria-hidden sx={{ bgcolor: stickyTintSubtotal, p: 0 }} />
                    </TableRow>
                  );

                  return trs;
                })}

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
                  {activeCategory.crops.map((crop) => {
                    const active = isCropActive(crop);
                    return (
                      <TableCell
                        key={crop.name}
                        align="right"
                        sx={{
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                          fontWeight: 800,
                          bgcolor: stickyTintGrand,
                          color: active ? 'inherit' : 'text.disabled',
                        }}
                      >
                        {active ? formatNumber(grandTotals[crop.name]) : '—'}
                      </TableCell>
                    );
                  })}
                  {/* spacer grand-total cell — keeps the grand-total band full-width */}
                  <TableCell aria-hidden sx={{ bgcolor: stickyTintGrand, p: 0 }} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default ZoneForm3A;
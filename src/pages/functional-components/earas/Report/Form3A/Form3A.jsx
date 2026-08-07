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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TablePagination
} from '@mui/material';
import { LocationOn, WaterDrop, WbSunny, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';

const SESSION_KEY = 'form3AState';

// Sticky/column widths
const PANCHAYATH_W = 180;
const CROP_W = 140;

const Form3A = () => {
  const theme = useTheme();
  const themeColor = "#05307a";
  const navigate = useNavigate();
  const location = useLocation();

  const savedState = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  // District / Taluk / Block / Zone context handed off from ZoneForm3A
  const selectedDistrict = location.state?.districtName || location.state?.selectedDistrict || savedState.districtName || "Thiruvananthapuram";
  const selectedTaluk = location.state?.talukName || location.state?.selectedTaluk || savedState.talukName || "Thiruvananthapuram";
  const selectedBlock = location.state?.blockName || location.state?.selectedBlock || savedState.blockName || "North Block";
  const selectedZone = location.state?.zoneName || location.state?.selectedZone || savedState.zoneName || "Zone 1";

  // Active seasonal-crop tab (defaults to whichever tab was active on the zone view)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab ?? savedState.activeTab ?? 0);

  /* ── persist form3A context so breadcrumb/refresh keeps working ── */
  useEffect(() => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        districtId: location.state?.districtId || savedState.districtId,
        districtName: selectedDistrict,
        talukId: location.state?.talukId || savedState.talukId,
        talukName: selectedTaluk,
        blockId: location.state?.blockId || savedState.blockId,
        blockName: selectedBlock,
        zoneId: location.state?.zoneId || savedState.zoneId,
        zoneName: selectedZone,
        activeTab
      })
    );
  }, [location.state, savedState, selectedDistrict, selectedTaluk, selectedBlock, selectedZone, activeTab]);

  // Land Type filter: 'all' | 'wet' | 'dry' — applies to the crop columns
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // Irrigation Type filter: which figure populates each cell
  const [irrigationType, setIrrigationType] = useState('total');

  // Pagination (by Panchayath row)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Shared style for numeric cells - tabular numerals keep digits vertically aligned
  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };

  // Deterministic pseudo-random generator so each Panchayath x Crop cell gets a
  // stable, distinct value (in hectares) without hand-authoring every figure.
  const seededArea = (key, min, max) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    const frac = (hash % 10000) / 10000;
    return min + frac * (max - min);
  };


  const panchayaths = ['Panchayath 1', 'Panchayath 2', 'Panchayath 3', 'Panchayath 4', 'Panchayath 5'];

  const cropCategories = [
    {
      id: 'cereals',
      icon: '🌾',
      label: 'Cereals',
      minArea: 8,
      maxArea: 120,
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
      minArea: 1,
      maxArea: 25,
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
      minArea: 1,
      maxArea: 18,
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
      minArea: 2,
      maxArea: 55,
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
      minArea: 4,
      maxArea: 210,
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

  const categoryData = panchayaths.map((panchayath) => {
    const row = { panchayath };
    activeCategory.crops.forEach((crop) => {
      const seedBase = `${selectedDistrict}-${selectedTaluk}-${selectedBlock}-${selectedZone}-${panchayath}-${crop.name}`;
      const irrigated = seededArea(`${seedBase}-irrigated`, activeCategory.minArea * 0.3, activeCategory.maxArea * 0.65);
      const unirrigated = seededArea(`${seedBase}-unirrigated`, activeCategory.minArea * 0.2, activeCategory.maxArea * 0.55);
      row[crop.name] = {
        irrigated,
        unirrigated,
        total: irrigated + unirrigated
      };
    });
    return row;
  });

  const getCellValue = (row, cropName) => row[cropName][irrigationType];

  // Column totals across all panchayaths for the active category
  const categoryTotals = activeCategory.crops.reduce((acc, crop) => {
    acc[crop.name] = categoryData.reduce((sum, row) => sum + getCellValue(row, crop.name), 0);
    return acc;
  }, {});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const formatNumber = (num) => num.toFixed(2);

  const handleBack = () => {
    navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
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

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = categoryData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  // Land Type filter options
  const landTypeOptions = [
    { value: 'all', label: 'All', icon: null },
    { value: 'wet', label: 'Wet', icon: <WaterDrop sx={{ fontSize: 18 }} /> },
    { value: 'dry', label: 'Dry', icon: <WbSunny sx={{ fontSize: 18 }} /> }
  ];


  const TABLE_MIN_W = PANCHAYATH_W + Math.max(activeCategory.crops.length, 1) * CROP_W;

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

        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleBack} size="small" sx={{ color: themeColor }}>
            <ArrowBack />
          </IconButton>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            {selectedZone} Zone ({selectedBlock} Block, {selectedTaluk} Taluk, {selectedDistrict} District) - Panchayath-wise Seasonal Crops Report
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
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
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
            {cropCategories.map((cat) => (
              <Tab key={cat.id} label={`${cat.icon} ${cat.label}`} />
            ))}
          </Tabs>

          {/* Active category's table: Panchayath, <crop columns...> */}
          <Box role="tabpanel" sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table
                stickyHeader
                size="small"
                sx={{ width: '100%', minWidth: TABLE_MIN_W, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
              >
                <colgroup>
                  <col style={{ width: PANCHAYATH_W }} />
                  {activeCategory.crops.map((crop) => (
                    <col key={crop.name} style={{ width: CROP_W }} />
                  ))}
                  {/* Spacer column absorbs any leftover width so the real
                      columns keep a consistent, readable size instead of
                      stretching when there are only one or two crop columns. */}
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{
                        backgroundColor: themeColor,
                        color: 'white',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        py: 1.5,
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                      }}
                    >
                      Panchayath
                    </TableCell>
                    {activeCategory.crops.map((crop) => {
                      const active = isCropActive(crop);
                      return (
                        <TableCell
                          key={crop.name}
                          align="right"
                          sx={{
                            backgroundColor: themeColor,
                            color: active ? 'white' : alpha('#ffffff', 0.5),
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            py: 1.5,
                          }}
                        >
                          {crop.name}
                        </TableCell>
                      );
                    })}
                    <TableCell aria-hidden sx={{ backgroundColor: themeColor, padding: 0 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell align="left" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: theme.palette.background.paper }}>
                        <Chip
                          label={row.panchayath}
                          size="small"
                          sx={{
                            backgroundColor: alpha(themeColor, 0.1),
                            color: themeColor,
                            fontWeight: 500,
                            borderRadius: 1.5,
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
                              ...numericCellSx,
                              color: active ? 'inherit' : 'text.disabled',
                            }}
                          >
                            {active ? formatNumber(getCellValue(row, crop.name)) : '—'}
                          </TableCell>
                        );
                      })}
                      <TableCell aria-hidden />
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                    <TableCell align="left" sx={{ fontWeight: 700, color: themeColor, position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#eef1f7' }}>
                      TOTAL
                    </TableCell>
                    {activeCategory.crops.map((crop) => {
                      const active = isCropActive(crop);
                      return (
                        <TableCell
                          key={crop.name}
                          align="right"
                          sx={{
                            ...numericCellSx,
                            fontWeight: 700,
                            color: active ? 'inherit' : 'text.disabled',
                          }}
                        >
                          {active ? formatNumber(categoryTotals[crop.name]) : '—'}
                        </TableCell>
                      );
                    })}
                    <TableCell aria-hidden sx={{ backgroundColor: alpha(themeColor, 0.08) }} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={categoryData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{ borderTop: `1px solid ${alpha(themeColor, 0.1)}` }}
            />
          </Box>
        </Paper>
      </CardContent>
    </Card>
    </Box>
  );
};

export default Form3A;
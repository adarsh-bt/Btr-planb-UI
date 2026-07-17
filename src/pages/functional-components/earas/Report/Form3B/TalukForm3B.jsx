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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { LocationOn, WaterDrop, WbSunny, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const TalukForm3B = () => {
  const theme = useTheme();
  const themeColor = "#05307a";
  const navigate = useNavigate();
  const location = useLocation();

  // District and starting tab handed off from KeralaForm3A
  const selectedDistrict = location.state?.selectedDistrict || location.state?.districtName || "Thiruvananthapuram";

  // Active seasonal-crop tab (defaults to whichever tab was active on the district view)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 0);

  // Land Type filter: 'all' | 'wet' | 'dry' — applies to the crop columns
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // Irrigation Type filter: which figure populates each cell
  const [irrigationType, setIrrigationType] = useState('total');

  // Shared style for numeric cells - tabular numerals keep digits vertically aligned
  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };

  // Taluks by district
  const taluksByDistrict = {
    "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara", "Chirayinkeezhu", "Nedumangad"],
    "Kollam": ["Kollam", "Karunagappally", "Kunnathur", "Kottarakkara", "Punalur"],
    "Pathanamthitta": ["Pathanamthitta", "Adoor", "Ranni", "Thiruvalla", "Konni", "Mallapally"],
    "Alappuzha": ["Alappuzha", "Cherthala", "Ambalappuzha", "Kuttanad"],
    "Kottayam": ["Kottayam", "Changanassery", "Kanjirappally", "Pala"],
    "Idukki": ["Thodupuzha", "Devikulam", "Peermedu", "Udumbanchola"],
    "Ernakulam": ["Kochi", "Paravur", "Aluva", "Kunnathunadu", "Kothamangalam", "Muvattupuzha"],
    "Thrissur": ["Thrissur", "Chalakudy", "Kodungallur", "Kunnamkulam", "Guruvayur"],
    "Palakkad": ["Palakkad", "Alathur", "Chittur", "Mannarkkad"],
    "Malappuram": ["Malappuram", "Perinthalmanna", "Tirur", "Ponnani"],
    "Kozhikode": ["Kozhikode", "Koyilandy", "Vadakara", "Thamarassery"],
    "Wayanad": ["Vythiri", "Sulthan Bathery", "Mananthavady"],
    "Kannur": ["Kannur", "Thalassery", "Taliparamba", "Iritty"],
    "Kasaragod": ["Kasaragod", "Hosdurg", "Manjeshwar", "Vellarikundu"]
  };

  const taluks = taluksByDistrict[selectedDistrict] || [];

  // Deterministic pseudo-random generator so each Taluk x Crop cell gets a
  // stable, distinct value (in hectares) without hand-authoring every figure.
  const seededArea = (key, min, max) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    const frac = (hash % 10000) / 10000;
    return min + frac * (max - min);
  };

  // Same seasonal crop tabs as the district-level report. minArea/maxArea are
  // scaled down since a taluk is a smaller unit than a whole district.
  const cropCategories = [
    {
      id: 'cereals',
      icon: '🌾',
      label: 'Cereals',
      minArea: 80,
      maxArea: 1100,
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
      minArea: 8,
      maxArea: 180,
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
      minArea: 5,
      maxArea: 140,
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
      minArea: 18,
      maxArea: 450,
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
      minArea: 35,
      maxArea: 1750,
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

  // Taluk-wise data for the active category: one row per taluk, with
  // irrigated/unirrigated/total area generated per crop in that category's
  // list. The Irrigation Type filter picks which of the three is displayed.
  const categoryData = taluks.map((taluk) => {
    const row = { taluk };
    activeCategory.crops.forEach((crop) => {
      const irrigated = seededArea(`${selectedDistrict}-${taluk}-${crop.name}-irrigated`, activeCategory.minArea * 0.3, activeCategory.maxArea * 0.65);
      const unirrigated = seededArea(`${selectedDistrict}-${taluk}-${crop.name}-unirrigated`, activeCategory.minArea * 0.2, activeCategory.maxArea * 0.55);
      row[crop.name] = {
        irrigated,
        unirrigated,
        total: irrigated + unirrigated
      };
    });
    return row;
  });

  const getCellValue = (row, cropName) => row[cropName][irrigationType];

  // Column totals across all taluks for the active category
  const categoryTotals = activeCategory.crops.reduce((acc, crop) => {
    acc[crop.name] = categoryData.reduce((sum, row) => sum + getCellValue(row, crop.name), 0);
    return acc;
  }, {});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num) => num.toFixed(2);

  const handleBack = () => {
    navigate(`/schemes/earas/Report/Form3B`);
  };

  const handleTalukClick = (talukName) => {
    navigate(`/schemes/earas/Report/Form3B/ZoneForm3B`, {
      state: {
        districtName: selectedDistrict,
        selectedDistrict: selectedDistrict,
        talukName: talukName,
        selectedTaluk: talukName,
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

        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleBack} size="small" sx={{ color: themeColor }}>
            <ArrowBack />
          </IconButton>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            {selectedDistrict} District - Taluk-wise Seasonal Crops Report
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

          {/* Active category's table: Taluk, <crop columns...> */}
          <Box role="tabpanel" sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 200 + activeCategory.crops.length * 140 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{
                        backgroundColor: themeColor,
                        color: 'white',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        minWidth: 180,
                        py: 1.5,
                      }}
                    >
                      Taluk
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
                            minWidth: 140,
                            py: 1.5,
                          }}
                        >
                          {crop.name}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryData.map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleTalukClick(row.taluk)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(themeColor, 0.08),
                          transition: '0.2s'
                        }
                      }}
                    >
                      <TableCell align="left">
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
                    </TableRow>
                  ))}
                  {/* Total Row */}
                  <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                    <TableCell align="left" sx={{ fontWeight: 700, color: themeColor }}>
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
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default TalukForm3B;
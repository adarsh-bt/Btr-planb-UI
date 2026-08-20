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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TablePagination
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterIcon from '@mui/icons-material/Water';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;

const DISTRICT_W = 180;
const CROP_W = 150;

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

const KeralaForm3B = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const navigate = useNavigate();
  const location = useLocation();

  const agriculturalYear = AuthService.agriyear() || '2025-2026';

  // Restore the crop-group tab when returning from TalukForm3B (Back passes activeTab).
  const [activeTab, setActiveTab] = useState(location.state?.activeTab ?? 0);
  // Restored the same way — Back from TalukForm3B passes landType.
  const [landTypeTab, setLandTypeTab] = useState(location.state?.landType ?? DEFAULT_LAND_TYPE);
  // Restored the same way — Back from TalukForm3B passes irrigation.
  const [irrigation, setIrrigation] = useState(location.state?.irrigation ?? DEFAULT_IRRIGATION);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const cropGroupId = CROP_GROUPS[activeTab]?.id;
  const cropGroupName = CROP_GROUPS[activeTab]?.name;

  const numericCellSx = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

  useEffect(() => {
    if (!cropGroupId) return;

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const params = new URLSearchParams({
          agriYear: agriculturalYear,
          cropGroupId: String(cropGroupId)
        });
        // 'ALL' is represented by omitting the param entirely.
        const landTypeParam = LAND_TYPE_PARAM[landTypeTab];
        if (landTypeParam) params.append('landType', landTypeParam);

        // 'ALL' is represented by omitting the param entirely.
        const irrigationParam = IRRIGATION_PARAM[irrigation];
        if (irrigationParam) params.append('isIrrigated', irrigationParam);

        const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form3B/state?${params.toString()}`;
        console.log('Fetching Form 3B data from:', url);

        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setApiData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching Form 3B data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, agriculturalYear, landTypeTab, irrigation]);

  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((d) =>
      (d.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  const districtRows = useMemo(() => {
    return apiData.map((d) => {
      const byId = {};
      (d.crops || []).forEach((c) => {
        byId[c.cropId] = Number(c.areaInCents) || 0;
      });
      return { districtId: d.districtId ?? null, district: d.districtName || 'Unassigned', byId };
    });
  }, [apiData]);

  const cropTotals = useMemo(() => {
    const totals = {};
    cropColumns.forEach((c) => (totals[c.cropId] = 0));
    districtRows.forEach((row) => {
      cropColumns.forEach((c) => {
        if (row.byId[c.cropId] !== undefined) totals[c.cropId] += row.byId[c.cropId];
      });
    });
    return totals;
  }, [districtRows, cropColumns]);

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

  const paginatedRows = useMemo(
    () => districtRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [districtRows, page, rowsPerPage]
  );

  const handleDistrictClick = (districtName, districtId) => {
    if (districtId == null) return;
    navigate('/schemes/earas/Report/Form3B/TalukForm3B', {
      state: {
        districtId,
        districtName,
        selectedDistrict: districtName,
        cropGroupId,
        cropGroupName,
        agriculturalYear,
        landType: landTypeTab,
        irrigation,
        activeTab
      }
    });
  };

  const TABLE_MIN_W = DISTRICT_W + Math.max(cropColumns.length, 1) * CROP_W;

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 4, overflow: 'visible', background: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}
    >
      <Breadcrumb/> 
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            Kerala State - Crop Area Report (Form 3B)
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
            <InputLabel id="kerala-form3b-irrigation-label">Irrigation</InputLabel>
            <Select
              labelId="kerala-form3b-irrigation-label"
              id="kerala-form3b-irrigation"
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

          <Box role="tabpanel" sx={{ p: 0, position: 'relative' }}>
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table
                stickyHeader
                size="small"
                sx={{ width: '100%', minWidth: TABLE_MIN_W, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}
              >
                <colgroup>
                  <col style={{ width: DISTRICT_W }} />
                  {cropColumns.map((c) => (
                    <col key={c.cropId} style={{ width: CROP_W }} />
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
                      sx={{ backgroundColor: themeColor, color: 'white', fontWeight: 700, whiteSpace: 'nowrap', py: 1.5, position: 'sticky', left: 0, zIndex: 3 }}
                    >
                      District
                    </TableCell>
                    {cropColumns.map((crop) => (
                      <TableCell
                        key={crop.cropId}
                        align="right"
                        sx={{ backgroundColor: themeColor, color: 'white', fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 }}
                      >
                        {crop.cropName}
                      </TableCell>
                    ))}
                    <TableCell aria-hidden sx={{ backgroundColor: themeColor, padding: 0 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 2} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={36} />
                      </TableCell>
                    </TableRow>
                  ) : districtRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 2} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No data available for {cropGroupName}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paginatedRows.map((row, index) => {
                        const clickable = row.districtId != null;
                        return (
                          <TableRow
                            key={row.districtId ?? `row-${index}`}
                            hover={clickable}
                            onClick={() => handleDistrictClick(row.district, row.districtId)}
                            sx={{ cursor: clickable ? 'pointer' : 'default', '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.08), transition: '0.2s' } : undefined }}
                          >
                            <TableCell align="left" sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: theme.palette.background.paper }}>
                              <Chip
                                label={row.district}
                                size="small"
                                sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 500, borderRadius: 1.5, '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.2) } : undefined }}
                              />
                            </TableCell>
                            {cropColumns.map((crop) => {
                              const val = row.byId[crop.cropId];
                              return (
                                <TableCell key={crop.cropId} align="right" sx={numericCellSx}>
                                  {val ? formatNumber(val) : '—'}
                                </TableCell>
                              );
                            })}
                            <TableCell aria-hidden />
                          </TableRow>
                        );
                      })}
                      <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                        <TableCell align="left" sx={{ fontWeight: 700, color: themeColor, position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#eef1f7' }}>
                          TOTAL
                        </TableCell>
                        {cropColumns.map((crop) => (
                          <TableCell key={crop.cropId} align="right" sx={{ ...numericCellSx, fontWeight: 700 }}>
                            {cropTotals[crop.cropId] ? formatNumber(cropTotals[crop.cropId]) : '—'}
                          </TableCell>
                        ))}
                        <TableCell aria-hidden sx={{ backgroundColor: alpha(themeColor, 0.08) }} />
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={districtRows.length}
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
  );
};

export default KeralaForm3B;
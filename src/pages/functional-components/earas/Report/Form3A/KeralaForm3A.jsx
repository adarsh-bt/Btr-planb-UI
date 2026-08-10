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
  TablePagination
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'keralaForm3AState';

// Sticky/column widths
const DISTRICT_W = 180;
const CROP_W = 150;

// Land type filter — WET / DRY / ALL. 'ALL' means the landType param is not
// sent at all, so the backend returns both.
const DEFAULT_LAND_TYPE = 'ALL';

// Static crop groups (tbl_master_crop_group). The tab index maps to a group,
// whose id is sent to the API as cropGroupId.
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

// Collapse whitespace/newlines in crop labels (some come as "OTHER VEGETABLES\n(Please Specify)\n").
const cleanName = (name) => (name || '').replace(/\s+/g, ' ').trim();

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

const KeralaForm3A = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const navigate = useNavigate();
  const location = useLocation();

  const agriculturalYear = AuthService.agriyear() || '2025-2026';

  const [activeTab, setActiveTab] = useState(() => getSavedState().activeTab ?? 0);
  const [landTypeTab, setLandTypeTab] = useState(() => getSavedState().landTypeTab ?? DEFAULT_LAND_TYPE);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const cropGroupId = CROP_GROUPS[activeTab]?.id;
  const cropGroupName = CROP_GROUPS[activeTab]?.name;

  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

  // Role-based auto-redirection on direct visit / refresh
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
          navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
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
          navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
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
      console.error('Error during role check redirection in KeralaForm3A:', e);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ activeTab, landTypeTab }));
  }, [activeTab, landTypeTab]);

  /* ─────────────────────────── fetch (per crop group) ─────────────────────────── */

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
        if (landTypeTab && landTypeTab !== 'ALL') params.append('landType', landTypeTab);

        const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/state?${params.toString()}`;
        console.log('Fetching Form 3A data from:', url);

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApiData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching Form 3A data:', err);
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
  }, [cropGroupId, agriculturalYear, landTypeTab]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  // Crop columns = union of crops across all districts for this group, sorted by name.
  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((d) =>
      (d.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  // District rows: { districtId, district, byId: { [cropId]: areaInCents } }
  // Sorted alphabetically by district name, with Unassigned at the end.
  const districtRows = useMemo(() => {
    const list = apiData.map((d) => {
      const byId = {};
      (d.crops || []).forEach((c) => {
        byId[c.cropId] = Number(c.areaInCents) || 0;
      });
      return { districtId: d.districtId ?? null, district: d.districtName || 'Unassigned', byId };
    });

    return list.sort((a, b) => {
      if (a.district === 'Unassigned') return 1;
      if (b.district === 'Unassigned') return -1;
      return a.district.localeCompare(b.district);
    });
  }, [apiData]);

  // Column totals across districts (only crops actually present in a district count).
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
    if (districtId == null) return; // skip the Unassigned / state-level bucket
    navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
      state: {
        officeType: location.state?.officeType || 'DIRECTORATE',
        districtId,
        districtName,
        selectedDistrict: districtName,
        cropGroupId,
        cropGroupName,
        agriculturalYear,
        landType: landTypeTab,
        activeTab
      }
    });
  };

  const TABLE_MIN_W = DISTRICT_W + Math.max(cropColumns.length, 1) * CROP_W;

  /* ─────────────────────────── render ─────────────────────────── */

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
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <LocationOn sx={{ fontSize: 32, color: themeColor }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
              Kerala State - Crop Area Report (Form 3A)
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
              (Click on any district to view Taluk-wise details) • Agricultural Year: {agriculturalYear} • Area in Cents
              {landTypeTab !== 'ALL' && ` • ${landTypeTab} Land`}
            </Typography>
          </Box>

          {/* Land type filter — ALL / WET / DRY */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              mb: 2,
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

          {/* Error */}
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
              <Typography color="error">Error: {error}</Typography>
            </Paper>
          )}

          {/* Tabs Section — one tab per crop group */}
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
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                backgroundColor: alpha(themeColor, 0.05),
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
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
              {CROP_GROUPS.map((g) => (
                <Tab key={g.id} label={g.name} />
              ))}
            </Tabs>

            {/* Active group's table: District, <crop columns...> */}
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
                        sx={{
                          backgroundColor: themeColor,
                          color: 'white',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          py: 1.5,
                          position: 'sticky',
                          left: 0,
                          zIndex: 3
                        }}
                      >
                        District
                      </TableCell>
                      {cropColumns.map((crop) => (
                        <TableCell
                          key={crop.cropId}
                          align="right"
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            py: 1.5
                          }}
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
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.08), transition: '0.2s' } : undefined
                              }}
                            >
                              <TableCell
                                align="left"
                                sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: theme.palette.background.paper }}
                              >
                                <Chip
                                  label={row.district}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(themeColor, 0.1),
                                    color: themeColor,
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.2) } : undefined
                                  }}
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
                        {/* Total Row */}
                        <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                          <TableCell
                            align="left"
                            sx={{ fontWeight: 700, color: themeColor, position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#eef1f7' }}
                          >
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
    </Box>
  );
};

export default KeralaForm3A;
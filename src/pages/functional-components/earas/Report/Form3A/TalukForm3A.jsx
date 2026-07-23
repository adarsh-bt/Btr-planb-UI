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
  IconButton,
  CircularProgress
} from '@mui/material';
import { LocationOn, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';

// Gateway root (e.g. http://localhost:8080). '/earas-form1-entry' added below.
// NOTE: if mainapi.FORM_API already ends in '/earas-form1-entry', drop the
// duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;

const SESSION_KEY = 'talukForm3AState';

// Static crop groups (tbl_master_crop_group). Tab index → group; its id is
// sent to the API as cropGroupId.
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

const TalukForm3A = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
  const navigate = useNavigate();
  const location = useLocation();

  // Merge saved sessionStorage state with location.state (state wins on fresh nav).
  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const districtId = stateData.districtId ?? null;
  const districtName = stateData.districtName || stateData.selectedDistrict || 'District';
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? 0);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cropGroupId = CROP_GROUPS[activeTab]?.id;
  const cropGroupName = CROP_GROUPS[activeTab]?.name;

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

  /* ─────────────────────────── fetch (per crop group) ─────────────────────────── */

  useEffect(() => {
    if (districtId == null) {
      setError('District is required. Please navigate from the state (district) report page.');
      return;
    }
    if (!cropGroupId) return;

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');

        const url = `${BASE_URL}/earas-form1-entry/api/progress-report/form3A/district?agriYear=${agriculturalYear}&districtId=${districtId}&cropGroupId=${cropGroupId}`;
        console.log('Fetching Taluk Form 3A data from:', url);

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApiData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching Taluk Form 3A data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('District not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        setApiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropGroupId, districtId, agriculturalYear]);

  /* ─────────────────────────── derived data ─────────────────────────── */

  const cropColumns = useMemo(() => {
    const map = new Map();
    apiData.forEach((t) =>
      (t.crops || []).forEach((c) => {
        if (!map.has(c.cropId)) map.set(c.cropId, { cropId: c.cropId, cropName: cleanName(c.cropName) });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [apiData]);

  const talukRows = useMemo(() => {
    return apiData.map((t) => {
      const byId = {};
      (t.crops || []).forEach((c) => {
        byId[c.cropId] = Number(c.areaInCents) || 0;
      });
      return { talukId: t.talukId ?? null, taluk: t.talukName || 'Unassigned', byId };
    });
  }, [apiData]);

  const cropTotals = useMemo(() => {
    const totals = {};
    cropColumns.forEach((c) => (totals[c.cropId] = 0));
    talukRows.forEach((row) => {
      cropColumns.forEach((c) => {
        if (row.byId[c.cropId] !== undefined) totals[c.cropId] += row.byId[c.cropId];
      });
    });
    return totals;
  }, [talukRows, cropColumns]);

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  const handleBack = () => navigate(-1);

  const handleTalukClick = (talukName, talukId) => {
    if (talukId == null) return;
    navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
      state: {
        districtId,
        districtName,
        selectedDistrict: districtName,
        talukId,
        talukName,
        selectedTaluk: talukName,
        cropGroupId,
        cropGroupName,
        agriculturalYear,
        activeTab
      }
    });
  };

  /* ─────────────────────────── render ─────────────────────────── */

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
          <IconButton onClick={handleBack} size="small" sx={{ color: themeColor }}>
            <ArrowBack />
          </IconButton>
          <LocationOn sx={{ fontSize: 32, color: themeColor }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
            {districtName} District - Taluk-wise Crop Area Report (Form 3A)
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Click on any taluk to view Zone-wise details) • Agricultural Year: {agriculturalYear} • Area in Cents
          </Typography>
        </Box>

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

          {/* Active group's table: Taluk, <crop columns...> */}
          <Box role="tabpanel" sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 200 + Math.max(cropColumns.length, 1) * 150 }}>
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
                        position: 'sticky',
                        left: 0,
                        zIndex: 3
                      }}
                    >
                      Taluk
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
                          minWidth: 150,
                          py: 1.5
                        }}
                      >
                        {crop.cropName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 1} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={36} />
                      </TableCell>
                    </TableRow>
                  ) : talukRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={cropColumns.length + 1} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No data available for {cropGroupName}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {talukRows.map((row, index) => {
                        const clickable = row.talukId != null;
                        return (
                          <TableRow
                            key={row.talukId ?? `row-${index}`}
                            hover={clickable}
                            onClick={() => handleTalukClick(row.taluk, row.talukId)}
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
                                label={row.taluk}
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
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default TalukForm3A;
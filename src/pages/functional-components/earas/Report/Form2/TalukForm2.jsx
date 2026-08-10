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
  CircularProgress,
  Stack
} from '@mui/material';
import {
  LocationOn,
  WaterDrop,
  Agriculture,
  WbSunny,
  ArrowBack,
  InfoOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
import api from 'api/api';

// Gateway root (e.g. http://localhost:8080). The '/earas-form1-entry' service
// prefix is added on the request path below.
// NOTE: if mainapi.FORM_API already ends in '/earas-form1-entry',
// drop the duplicate segment from the URL to avoid a doubled prefix (404).
const BASE_URL = mainapi.FORM_API;
const BTR_BASE_URL = mainapi.BTR_API;

const SESSION_KEY = 'talukForm2State';

// Maps each internal Land Utilization column id → the field name returned by
// the taluk-summary API. Same shape as the district-wise (state) response.
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
};

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

// Fallback taluks for a district
function getFallbackTaluks(districtId) {
  const taluksByDistrict = {
    1: ['Thiruvananthapuran', 'Neyyattinkara', 'Nedumangad', 'Chirayinkeezhu'],
    2: ['Kollam', 'Karunagappally', 'Kottarakkara', 'Pathanapuram', 'Punalur'],
    3: ['Pathanamthitta', 'Kozhencherry', 'Ranni', 'Mallappally', 'Thiruvalla', 'Adoor'],
    4: ['Alappuzha', 'Chengannur', 'Mavelikkara', 'Kuttanad', 'Ambalappuzha'],
    5: ['Kottayam', 'Changanassery', 'Meenachil', 'Vaikom', 'Kanjirappally'],
    6: ['Idukki', 'Udumbanchola', 'Thodupuzha', 'Peermade', 'Devikulam'],
    7: ['Ernakulam', 'Aluva', 'Kothamangalam', 'Muvattupuzha', 'Kochi', 'Paravur', 'Kanayannur'],
    8: ['Thrissur', 'Chalakudy', 'Kodungallur', 'Mukundapuram', 'Talappilly', 'Irungattukottai'],
    9: ['Palakkad', 'Alathur', 'Chittur', 'Mannarkkad', 'Ottapalam'],
    10: ['Malappuram', 'Eranad', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Nilambur', 'Kondotty'],
    11: ['Kozhikode', 'Vadakara', 'Quilandy', 'Thamarassery', 'Koyilandy'],
    12: ['Wayanad', 'Mananthavady', 'Sulthan Bathery', 'Vythiri'],
    13: ['Kannur', 'Thalassery', 'Payyanur', 'Iritty', 'Taliparamba'],
    14: ['Kasaragod', 'Hosdurg', 'Vellarikundu']
  };

  const districtTaluks = taluksByDistrict[districtId] || [];
  return districtTaluks.map((name, index) => ({
    id: index + 1,
    talukNameEn: name
  }));
}

const TalukForm2 = () => {
  const theme = useTheme();
  const themeColor = '#05307a';
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

  // District scope (passed by KeralaForm2.handleDistrictClick or officeInfo fallback)
  const districtId = stateData.districtId || officeInfo.districtOfficeId || officeInfo.districtId || null;
  const districtName = stateData.districtName || stateData.selectedDistrict || officeInfo.districtName || 'District';

  // Agricultural year from AuthService (e.g. '2025-2026')
  const agriculturalYear = AuthService.agriyear() || stateData.agriculturalYear || '2025-2026';

  // Tab + filter state
  const [activeTab, setActiveTab] = useState(stateData.activeTab ?? 0);
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // API data
  const [landData, setLandData] = useState([]);
  const [irrigationApiData, setIrrigationApiData] = useState([]);
  const [taluksList, setTaluksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [masterTaluksLoading, setMasterTaluksLoading] = useState(true);
  const [error, setError] = useState(null);

  const numericCellSx = {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

  // Fetch master taluks list
  const fetchMasterTaluks = async (districtIdValue) => {
    setMasterTaluksLoading(true);
    try {
      const response = await api.get(`${BTR_BASE_URL}/btr-service/btr-api/taluks?distId=${districtIdValue}`);
      console.log('Master Taluks Response:', response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Setting taluks list:', response.data.data);
        setTaluksList(response.data.data);
      } else {
        console.warn('No taluks found, using fallback');
        setTaluksList(getFallbackTaluks(districtIdValue));
      }
    } catch (err) {
      console.error('Error fetching master taluks:', err);
      setTaluksList(getFallbackTaluks(districtIdValue));
    } finally {
      setMasterTaluksLoading(false);
    }
  };

  // Role auto-redirection if TALUK user visits TalukForm2 directly
  useEffect(() => {
    let currentOfficeType = stateData.officeType || officeInfo.officeType;
    if (!currentOfficeType) {
      try {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';
        if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
          currentOfficeType = 'TALUK';
        }
      } catch (e) { }
    }

    if (currentOfficeType === 'TALUK') {
      const tId = stateData.talukId || officeInfo.talukOfficeId || officeInfo.talukId;
      const tName = stateData.talukName || officeInfo.talukName || '';
      if (tId) {
        navigate('/schemes/earas/cce/ZoneForm2', {
          replace: true,
          state: {
            officeType: 'TALUK',
            viewLevel: 'taluk',
            talukId: tId,
            talukName: tName,
            selectedTaluk: tName,
            districtId,
            districtName,
            isDirectAccess: true,
            activeTab: stateData.activeTab || 0
          }
        });
      }
    }
  }, [officeInfo, stateData, districtId, districtName, navigate]);

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
  }, [districtId, districtName, agriculturalYear, stateData.activeTab]);

  // Fetch master taluks on mount
  useEffect(() => {
    if (districtId != null) {
      fetchMasterTaluks(districtId);
    }
  }, [districtId]);

  /* ─────────────────────────── fetch ─────────────────────────── */

  useEffect(() => {
    if (districtId == null) {
      setError('District is required. Please navigate from the state (district) report page.');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token missing');
        const headers = { Authorization: `Bearer ${token}` };

        const landUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/land-utilization/taluk-summary?agriYear=${agriculturalYear}&districtId=${districtId}`;
        const irrigationUrl = `${BASE_URL}/earas-form1-entry/api/progress-report/taluk?agriYear=${agriculturalYear}&districtId=${districtId}`;

        const [landRes, irrRes] = await Promise.all([axios.get(landUrl, { headers }), axios.get(irrigationUrl, { headers })]);

        console.log('Land Data Response:', landRes.data);
        console.log('Irrigation Data Response:', irrRes.data);

        setLandData(Array.isArray(landRes.data) ? landRes.data : []);
        setIrrigationApiData(Array.isArray(irrRes.data) ? irrRes.data : []);
      } catch (err) {
        console.error('Error fetching Taluk Form 2 data:', err);
        if (err.response?.status === 401) setError('Session expired. Please login again.');
        else if (err.response?.status === 403) setError("You don't have permission to access this data.");
        else if (err.response?.status === 404) setError('District not found.');
        else setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, agriculturalYear]);

  /* ─────────────────────── land utilization data ─────────────────────── */

  // Transform API rows and merge with master taluks list
  const talukData = useMemo(() => {
    // Create a map for quick lookup of API data by taluk name or ID
    const apiDataMap = {};
    landData.forEach((t) => {
      const name = t.talukName || '';
      const id = t.talukId;
      if (name) apiDataMap[name.toLowerCase().trim()] = t;
      if (id) apiDataMap[`id_${id}`] = t;
    });

    let mergedData = [];

    // If we have master taluks list, merge with API data
    if (taluksList && taluksList.length > 0) {
      mergedData = taluksList.map((taluk) => {
        const talukId = taluk.id;
        const talukName = taluk.talukNameEn || '';

        // Try to find API data by ID first, then by name
        let apiData = null;
        if (talukId && apiDataMap[`id_${talukId}`]) {
          apiData = apiDataMap[`id_${talukId}`];
        } else if (talukName && apiDataMap[talukName.toLowerCase().trim()]) {
          apiData = apiDataMap[talukName.toLowerCase().trim()];
        }

        const row = {
          talukId: talukId,
          taluk: talukName
        };

        // Populate land utilization fields
        Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
          row[colId] = apiData ? Number(apiData[apiKey]) || 0 : 0;
        });

        return row;
      });
    } else {
      // Fallback: use only API data
      mergedData = landData.map((t) => {
        const row = {
          talukId: t.talukId ?? null,
          taluk: t.talukName || 'Unassigned'
        };
        Object.entries(LAND_FIELD_MAP).forEach(([colId, apiKey]) => {
          row[colId] = Number(t[apiKey]) || 0;
        });
        return row;
      });
    }

    // Sort alphabetically by taluk name, with Unassigned at the end
    return mergedData.sort((a, b) => {
      if (a.taluk === 'Unassigned') return 1;
      if (b.taluk === 'Unassigned') return -1;
      return a.taluk.localeCompare(b.taluk);
    });
  }, [landData, taluksList]);

  // Check if a taluk has any data
  const hasTalukData = (row) => {
    let hasData = false;
    Object.keys(LAND_FIELD_MAP).forEach((colId) => {
      if (row[colId] > 0) hasData = true;
    });
    return hasData;
  };

  // Count taluks with no data
  const taluksWithNoData = useMemo(() => {
    return talukData.filter(row => !hasTalukData(row) && row.talukId !== null).length;
  }, [talukData]);

  const landUtilizationTotals = useMemo(() => {
    const acc = {};
    Object.keys(LAND_FIELD_MAP).forEach((colId) => (acc[colId] = 0));
    talukData.forEach((row) => {
      Object.keys(LAND_FIELD_MAP).forEach((colId) => (acc[colId] += row[colId]));
    });
    return acc;
  }, [talukData]);

  // Taluk column stays left-aligned (text); numeric columns right-aligned.
  const landUtilizationColumns = [
    { id: 'taluk', label: 'Taluk', minWidth: 160, align: 'left', category: 'always' },
    { id: 'buildingCourtyard', label: 'Building and Courtyard', minWidth: 160, align: 'right', category: 'dry' },
    { id: 'otherNonAgri', label: 'Other Non-Agricultural Uses', minWidth: 190, align: 'right', category: 'dry' },
    { id: 'barrenUncultivable', label: 'Barren and uncultivable land', minWidth: 190, align: 'right', category: 'dry' },
    { id: 'miscTreeCrops', label: 'Miscellaneous tree crops and groves', minWidth: 210, align: 'right', category: 'dry' },
    { id: 'permanentPastures', label: 'Permanent pastures and other grazing land', minWidth: 240, align: 'right', category: 'dry' },
    { id: 'cultivableWaste', label: 'Cultivable waste', minWidth: 140, align: 'right', category: 'dry' },
    { id: 'otherFallow', label: 'Other Fallow', minWidth: 110, align: 'right', category: 'dry' },
    { id: 'currentFallow', label: 'Current Fallow', minWidth: 120, align: 'right', category: 'dry' },
    { id: 'socialForestry', label: 'Area under Social Forestry', minWidth: 170, align: 'right', category: 'dry' },
    { id: 'waterLogged', label: 'Water logged area', minWidth: 140, align: 'right', category: 'wet' },
    { id: 'stillWater', label: 'Still water land (Water bodies)', minWidth: 190, align: 'right', category: 'wet' },
    { id: 'marshyLand', label: 'Marshy land', minWidth: 110, align: 'right', category: 'wet' },
    { id: 'netAreaSown', label: 'Net areas sown', minWidth: 130, align: 'right', category: 'always' }
  ];

  const isColumnActive = (col) => col.category === 'always' || landTypeFilter === 'all' || col.category === landTypeFilter;

  /* ─────────────────────── irrigation data ─────────────────────── */

  // Merge irrigation data with master taluks list
  const irrigationRows = useMemo(() => {
    // Create a map for quick lookup of API data by taluk name or ID
    const apiDataMap = {};
    irrigationApiData.forEach((t) => {
      const name = t.talukName || '';
      const id = t.talukId;
      if (name) apiDataMap[name.toLowerCase().trim()] = t;
      if (id) apiDataMap[`id_${id}`] = t;
    });

    let mergedData = [];

    if (taluksList && taluksList.length > 0) {
      mergedData = taluksList.map((taluk) => {
        const talukId = taluk.id;
        const talukName = taluk.talukNameEn || '';

        let apiData = null;
        if (talukId && apiDataMap[`id_${talukId}`]) {
          apiData = apiDataMap[`id_${talukId}`];
        } else if (talukName && apiDataMap[talukName.toLowerCase().trim()]) {
          apiData = apiDataMap[talukName.toLowerCase().trim()];
        }

        const byId = {};
        if (apiData && apiData.sources) {
          apiData.sources.forEach((s) => {
            byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
          });
        }

        return {
          talukId: talukId,
          taluk: talukName,
          byId: byId
        };
      });
    } else {
      // Fallback: use only API data
      mergedData = irrigationApiData.map((t) => {
        const byId = {};
        (t.sources || []).forEach((s) => {
          byId[s.sourceId] = { count: s.count || 0, area: s.area || 0 };
        });
        return {
          talukId: t.talukId ?? null,
          taluk: t.talukName || 'Unassigned',
          byId: byId
        };
      });
    }

    // Sort alphabetically by taluk name, with Unassigned at the end
    return mergedData.sort((a, b) => {
      if (a.taluk === 'Unassigned') return 1;
      if (b.taluk === 'Unassigned') return -1;
      return a.taluk.localeCompare(b.taluk);
    });
  }, [irrigationApiData, taluksList]);

  // Check if a taluk has any irrigation data
  const hasIrrigationData = (row) => {
    return Object.keys(row.byId).length > 0;
  };

  // Count taluks with no irrigation data
  const taluksWithNoIrrigationData = useMemo(() => {
    return irrigationRows.filter(row => !hasIrrigationData(row) && row.talukId !== null).length;
  }, [irrigationRows]);

  const irrigationSources = useMemo(() => {
    const map = new Map();
    irrigationApiData.forEach((t) =>
      (t.sources || []).forEach((s) => {
        if (!map.has(s.sourceId)) map.set(s.sourceId, { sourceId: s.sourceId, sourceName: s.sourceName });
      })
    );
    return Array.from(map.values()).sort((a, b) => a.sourceId - b.sourceId);
  }, [irrigationApiData]);

  const irrigationTotals = useMemo(() => {
    const t = {};
    irrigationSources.forEach((s) => (t[s.sourceId] = { count: 0, area: 0 }));
    irrigationRows.forEach((r) => {
      irrigationSources.forEach((s) => {
        const cell = r.byId[s.sourceId];
        if (cell) {
          t[s.sourceId].count += cell.count;
          t[s.sourceId].area += cell.area;
        }
      });
    });
    return t;
  }, [irrigationRows, irrigationSources]);

  const isSourceActive = (sourceId) => {
    const cat = IRRIGATION_SOURCE_CATEGORY[sourceId];
    if (!cat) return true;
    return landTypeFilter === 'all' || cat === landTypeFilter;
  };

  /* ─────────────────────────── handlers ─────────────────────────── */

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const formatNumber = (num) => Number(num || 0).toFixed(2);

  const handleBack = () => {
    let effectiveOfficeType = stateData.officeType || officeInfo.officeType;
    if (!effectiveOfficeType) {
      try {
        const tokenRole = AuthService.getrole();
        const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
        const des = localStorage.getItem('des') || '';
        if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
          effectiveOfficeType = 'DISTRICT';
        }
      } catch (e) { }
    }

    if (effectiveOfficeType === 'DISTRICT' || stateData.isDirectAccess) {
      navigate('/Report');
    } else {
      navigate('/schemes/earas/cce/KeralaForm2', { state: { activeTab } });
    }
  };

  const handleTalukClick = (talukName, talukId) => {
    if (talukId == null) return;
    navigate('/schemes/earas/cce/ZoneForm2', {
      state: {
        officeType: stateData.officeType || 'DIRECTORATE',
        districtId,
        districtName,
        selectedDistrict: districtName,
        talukId,
        talukName,
        selectedTaluk: talukName,
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

  /* ─────────────────────────── render ─────────────────────────── */

  if ((loading || masterTaluksLoading) && landData.length === 0 && irrigationApiData.length === 0 && taluksList.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading taluk report...
        </Typography>
      </Box>
    );
  }

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
            <IconButton onClick={handleBack} size="small" sx={{ color: themeColor, mr: 0.5 }}>
              <ArrowBack />
            </IconButton>
            <LocationOn sx={{ fontSize: 32, color: themeColor }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: themeColor }}>
              {districtName} District - Taluk-wise Land Utilization &amp; Irrigation Report
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
              Agricultural Year: {agriculturalYear}
            </Typography>
            {(taluksWithNoData > 0 || taluksWithNoIrrigationData > 0) && (
              <Chip
                icon={<InfoOutlined />}
                label={`${Math.max(taluksWithNoData, taluksWithNoIrrigationData)} taluks with no data`}
                size="small"
                sx={{ ml: 1, bgcolor: alpha('#ff9800', 0.15), color: '#e65100' }}
              />
            )}
          </Box>

          {/* Error */}
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
              <Typography color="error">Error: {error}</Typography>
            </Paper>
          )}

          {/* Info Banner for taluks with no data */}
          {(taluksWithNoData > 0 || taluksWithNoIrrigationData > 0) && !loading && (
            <Paper
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: alpha('#ff9800', 0.08),
                borderRadius: 2,
                border: `1px solid ${alpha('#ff9800', 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <InfoOutlined sx={{ color: '#ff9800', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>{Math.max(taluksWithNoData, taluksWithNoIrrigationData)}</strong> taluk{Math.max(taluksWithNoData, taluksWithNoIrrigationData) > 1 ? 's' : ''} have no data available for the selected filters.
                <strong> View details is disabled for taluks without data.</strong>
              </Typography>
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

          {/* Tabs Section */}
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
              centered
              sx={{
                backgroundColor: alpha(themeColor, 0.05),
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
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
              <Tab icon={<Agriculture sx={{ fontSize: 20 }} />} iconPosition="start" label="Land Utilization" />
              <Tab icon={<WaterDrop sx={{ fontSize: 20 }} />} iconPosition="start" label="Irrigation Details" />
            </Tabs>

            {/* Land Utilization Tab */}
            <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 0 }}>
              {activeTab === 0 && (
                <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            minWidth: 60,
                            py: 1.5,
                            textAlign: 'center'
                          }}
                        >
                          #
                        </TableCell>
                        {landUtilizationColumns.map((col) => {
                          const active = isColumnActive(col);
                          return (
                            <TableCell
                              key={col.id}
                              align={col.align}
                              sx={{
                                backgroundColor: themeColor,
                                color: active ? 'white' : alpha('#ffffff', 0.5),
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                minWidth: col.minWidth,
                                py: 1.5
                              }}
                            >
                              {col.label}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {talukData.length > 0 ? (
                        talukData.map((row, index) => {
                          const clickable = row.talukId != null;
                          const hasData = hasTalukData(row);
                          const serialNumber = index + 1;

                          return (
                            <TableRow
                              key={index}
                              hover={clickable}
                              onClick={() => handleTalukClick(row.taluk, row.talukId)}
                              sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                '&:hover': clickable
                                  ? {
                                    backgroundColor: alpha(themeColor, 0.08),
                                    transition: '0.2s'
                                  }
                                  : undefined,
                                ...(!hasData && clickable && {
                                  backgroundColor: alpha('#ff9800', 0.03),
                                  '&:hover': { backgroundColor: alpha('#ff9800', 0.08) }
                                })
                              }}
                            >
                              <TableCell align="center">
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  {serialNumber}
                                </Typography>
                              </TableCell>
                              {landUtilizationColumns.map((col) => {
                                if (col.id === 'taluk') {
                                  return (
                                    <TableCell key={col.id} align="left">
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                          label={row.taluk}
                                          size="small"
                                          sx={{
                                            backgroundColor: hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                            color: hasData ? themeColor : '#e65100',
                                            fontWeight: 500,
                                            borderRadius: 1.5,
                                            '&:hover': clickable ? { backgroundColor: hasData ? alpha(themeColor, 0.2) : alpha('#ff9800', 0.2) } : undefined
                                          }}
                                        />
                                        {!hasData && clickable && (
                                          <Chip
                                            label="No Data"
                                            size="small"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.6rem',
                                              bgcolor: alpha('#ff9800', 0.15),
                                              color: '#e65100',
                                              fontWeight: 600
                                            }}
                                          />
                                        )}
                                      </Stack>
                                    </TableCell>
                                  );
                                }
                                const active = isColumnActive(col);
                                const value = row[col.id] || 0;
                                return (
                                  <TableCell
                                    key={col.id}
                                    align="right"
                                    sx={{
                                      ...numericCellSx,
                                      color: active && hasData ? 'inherit' : 'text.disabled'
                                    }}
                                  >
                                    {active && hasData ? formatNumber(value) : '—'}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={landUtilizationColumns.length + 1} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">No data available</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {/* Total Row */}
                      {talukData.length > 0 && (
                        <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                          <TableCell align="center" sx={{ fontWeight: 700, color: themeColor }}>
                            T
                          </TableCell>
                          {landUtilizationColumns.map((col) => {
                            if (col.id === 'taluk') {
                              return (
                                <TableCell key={col.id} align="left" sx={{ fontWeight: 700, color: themeColor }}>
                                  TOTAL
                                </TableCell>
                              );
                            }
                            const active = isColumnActive(col);
                            return (
                              <TableCell
                                key={col.id}
                                align="right"
                                sx={{
                                  ...numericCellSx,
                                  fontWeight: 700,
                                  color: active ? 'inherit' : 'text.disabled'
                                }}
                              >
                                {active ? formatNumber(landUtilizationTotals[col.id]) : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* Irrigation Details Tab */}
            <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 0 }}>
              {activeTab === 1 && (
                <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          rowSpan={3}
                          align="left"
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700,
                            verticalAlign: 'middle',
                            minWidth: 150
                          }}
                        >
                          Taluk
                        </TableCell>
                        <TableCell
                          colSpan={irrigationSources.length || 1}
                          align="center"
                          sx={{
                            backgroundColor: themeColor,
                            color: 'white',
                            fontWeight: 700
                          }}
                        >
                          Source Type
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        {irrigationSources.map((source) => (
                          <TableCell
                            key={source.sourceId}
                            align="center"
                            sx={{
                              backgroundColor: alpha(themeColor, 0.85),
                              color: isSourceActive(source.sourceId) ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 600,
                              minWidth: 150,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {source.sourceName}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        {irrigationSources.map((source) => (
                          <TableCell
                            key={source.sourceId}
                            align="center"
                            sx={{
                              backgroundColor: alpha(themeColor, 0.7),
                              color: isSourceActive(source.sourceId) ? 'white' : alpha('#ffffff', 0.5),
                              fontWeight: 600
                            }}
                          >
                            Count | Area (Ha)
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {irrigationRows.length > 0 ? (
                        <>
                          {irrigationRows.map((row, index) => {
                            const clickable = row.talukId != null;
                            const hasData = hasIrrigationData(row);
                            const serialNumber = index + 1;

                            return (
                              <TableRow
                                key={row.talukId ?? row.taluk}
                                hover={clickable}
                                onClick={() => handleTalukClick(row.taluk, row.talukId)}
                                sx={{
                                  cursor: clickable ? 'pointer' : 'default',
                                  '&:hover': clickable ? { backgroundColor: alpha(themeColor, 0.08) } : undefined,
                                  ...(!hasData && clickable && {
                                    backgroundColor: alpha('#ff9800', 0.03),
                                    '&:hover': { backgroundColor: alpha('#ff9800', 0.08) }
                                  })
                                }}
                              >
                                <TableCell align="left">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mr: 1 }}>
                                      {serialNumber}
                                    </Typography>
                                    <Chip
                                      label={row.taluk}
                                      size="small"
                                      sx={{
                                        backgroundColor: hasData ? alpha(themeColor, 0.1) : alpha('#ff9800', 0.1),
                                        color: hasData ? themeColor : '#e65100',
                                        fontWeight: 500,
                                        '&:hover': clickable ? { backgroundColor: hasData ? alpha(themeColor, 0.2) : alpha('#ff9800', 0.2) } : undefined
                                      }}
                                    />
                                    {!hasData && clickable && (
                                      <Chip
                                        label="No Data"
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: '0.6rem',
                                          bgcolor: alpha('#ff9800', 0.15),
                                          color: '#e65100',
                                          fontWeight: 600
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </TableCell>
                                {irrigationSources.map((source) => {
                                  const active = isSourceActive(source.sourceId);
                                  const cell = row.byId[source.sourceId];
                                  return (
                                    <TableCell
                                      key={source.sourceId}
                                      align="center"
                                      sx={{
                                        ...numericCellSx,
                                        color: active && hasData ? 'inherit' : 'text.disabled'
                                      }}
                                    >
                                      {active && hasData ? (cell ? `${cell.count} | ${formatNumber(cell.area)}` : '—') : '—'}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                          {/* Total Row */}
                          <TableRow sx={{ backgroundColor: alpha(themeColor, 0.08) }}>
                            <TableCell align="left" sx={{ fontWeight: 700, color: themeColor }}>
                              TOTAL
                            </TableCell>
                            {irrigationSources.map((source) => {
                              const active = isSourceActive(source.sourceId);
                              const t = irrigationTotals[source.sourceId] || { count: 0, area: 0 };
                              return (
                                <TableCell
                                  key={source.sourceId}
                                  align="center"
                                  sx={{
                                    ...numericCellSx,
                                    fontWeight: 700,
                                    color: active ? 'inherit' : 'text.disabled'
                                  }}
                                >
                                  {active ? `${t.count} | ${formatNumber(t.area)}` : '—'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={(irrigationSources.length || 1) + 1} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary">No data available</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TalukForm2;
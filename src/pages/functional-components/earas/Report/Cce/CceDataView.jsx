import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Checkbox
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  GridOn as GridOnIcon,
  Spa as SpaIcon,
  WaterDrop as WaterDropIcon,
  Agriculture as AgricultureIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
  NoteAlt as RemarksIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cce-tabpanel-${index}`}
      aria-labelledby={`cce-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3, px: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InfoItem = ({ label, value, isBadge }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}
  >
    <Typography sx={{ fontSize: 12, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontWeight: 600 }}>
      {label}
    </Typography>
    {isBadge ? (
      value
    ) : (
      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
        {value}
      </Typography>
    )}
  </Paper>
);

const DataItem = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        background: theme.palette.background.default,
        height: '100%'
      }}
    >
      <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
        {value}
      </Typography>
    </Paper>
  );
};

/**
 * Metric tile used by the Frame Selection Summary tab.
 * Same visual language as the existing tree-count cards, just parameterised
 * so both the count-based and the area-based variants can reuse it.
 */
const MetricCard = ({ label, value, color }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        background: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%'
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
};

/**
 * Formats an ISO date string (e.g. "2026-07-08") as DD-MM-YYYY to match the
 * convention used elsewhere in the app. Returns 'N/A' for empty/invalid input.
 */
const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${parsed.getFullYear()}`;
};

const SectionTitle = ({ icon: Icon, title }) => {
  const theme = useTheme();
  const themeColor = "#05307a";
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1.5, borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <Icon sx={{ color: themeColor, fontSize: 24 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
    </Box>
  );
};

const CceDataView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const themeColor = "#05307a";

  const [tabValue, setTabValue] = useState(0);
  const [frameDetails, setFrameDetails] = useState(null);
  const [isFrameLoading, setIsFrameLoading] = useState(false);
  const [frameError, setFrameError] = useState(null);

  const [seedDetailsList, setSeedDetailsList] = useState([]);
  const [isSeedLoading, setIsSeedLoading] = useState(false);
  const [seedError, setSeedError] = useState(null);

  // Fallback data if page is accessed directly without row state
  const rowData = location.state?.rowData || {
    crop: 'Paddy',
    season: 'Kharif',
    clusterNo: '11',
    cultivatedArea: '250 Acres',
    landType: 'Wet',
    surveyNo: 'SRV-45821',
    farmerName: 'Raghavan Nair',
    status: 'Completed',
    panchayath: 'Kuttanad Panchayath',
    frameType: 'area' // Can be 'area' or 'trees'
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch full plot details (available-cce-plot-details/{id}) - used for Survey Details tab
  const [plotDetails, setPlotDetails] = useState(null);
  const [isPlotDetailsLoading, setIsPlotDetailsLoading] = useState(false);
  const [plotDetailsError, setPlotDetailsError] = useState(null);

  useEffect(() => {
    const plotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId;
    const targetPlotId = plotId || '9de83462-0520-4815-b334-d078855987be';

    const fetchPlotDetails = async () => {
      setIsPlotDetailsLoading(true);
      setPlotDetailsError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/available-cce-plot-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/available-cce-plot-details/${targetPlotId}`, { headers });
        }

        if (!response.ok) {
          throw new Error('Failed to fetch plot details');
        }

        const data = await response.json();
        const details = data?.payload || data;
        setPlotDetails(details);
      } catch (err) {
        console.error('Error fetching plot details:', err);
        setPlotDetailsError('Unable to load survey/plot details for this record.');
      } finally {
        setIsPlotDetailsLoading(false);
      }
    };

    fetchPlotDetails();
  }, [rowData.availableCcePlotId, rowData.cceAvailablePlotId]);

  // Fetch frame details from API
  useEffect(() => {
    const plotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId;
    const targetPlotId = plotId || '9de83462-0520-4815-b334-d078855987be';

    const fetchFrameDetails = async () => {
      setIsFrameLoading(true);
      setFrameError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        console.log("plotId", targetPlotId);
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/frame-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/cce-data-entry/frame-details/${targetPlotId}`, { headers });
        }

        if (!response.ok) {
          throw new Error('Failed to fetch frame details');
        }

        const data = await response.json();
        const details = data?.payload || data;
        setFrameDetails(details);
      } catch (err) {
        console.error('Error fetching frame details:', err);
        setFrameError('Unable to load frame details for this plot.');
      } finally {
        setIsFrameLoading(false);
      }
    };

    fetchFrameDetails();
  }, [rowData.availableCcePlotId, rowData.cceAvailablePlotId]);

  // Fetch seed details per tree (single or multiple)
  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setSeedDetailsList([]);
      return;
    }

    const fetchSeedDetailsList = async () => {
      setIsSeedLoading(true);
      setSeedError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-seed-details-per-tree/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-seed-details-per-tree/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching seed details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setSeedDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching seed details:', err);
        setSeedError('Unable to load seed details.');
      } finally {
        setIsSeedLoading(false);
      }
    };

    fetchSeedDetailsList();
  }, [frameDetails]);

  // Common Details state & fetch
  const [commonDetails, setCommonDetails] = useState(null);
  const [isCommonLoading, setIsCommonLoading] = useState(false);
  const [commonError, setCommonError] = useState(null);

  useEffect(() => {
    const plotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId;
    const targetPlotId = plotId || '9de83462-0520-4815-b334-d078855987be';

    const fetchCommonDetails = async () => {
      setIsCommonLoading(true);
      setCommonError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-common-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-common-details/${targetPlotId}`, { headers });
        }
        if (!response.ok) throw new Error('Failed to fetch common details');

        const data = await response.json();
        const payload = data?.payload || data;
        setCommonDetails(payload);
      } catch (err) {
        console.error('Error fetching common details:', err);
        setCommonError('Unable to load common details');
      } finally {
        setIsCommonLoading(false);
      }
    };

    fetchCommonDetails();
  }, [rowData.availableCcePlotId, rowData.cceAvailablePlotId]);

  // Irrigation Details per tree state & fetch
  const [irrigationDetailsList, setIrrigationDetailsList] = useState([]);
  const [isIrrigationLoading, setIsIrrigationLoading] = useState(false);
  const [irrigationError, setIrrigationError] = useState(null);

  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setIrrigationDetailsList([]);
      return;
    }

    const fetchIrrigationDetailsList = async () => {
      setIsIrrigationLoading(true);
      setIrrigationError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-irrigation-details-per-tree/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-irrigation-details-per-tree/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching irrigation details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setIrrigationDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching irrigation details list:', err);
        setIrrigationError('Unable to load irrigation details');
      } finally {
        setIsIrrigationLoading(false);
      }
    };

    fetchIrrigationDetailsList();
  }, [frameDetails]);

  // Yield Details per tree state & fetch
  const [yieldDetailsList, setYieldDetailsList] = useState([]);
  const [isYieldLoading, setIsYieldLoading] = useState(false);
  const [yieldError, setYieldError] = useState(null);

  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setYieldDetailsList([]);
      return;
    }

    const fetchYieldDetailsList = async () => {
      setIsYieldLoading(true);
      setYieldError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-yield-details/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-yield-details/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching yield details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setYieldDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching yield details list:', err);
        setYieldError('Unable to load yield details');
      } finally {
        setIsYieldLoading(false);
      }
    };

    fetchYieldDetailsList();
  }, [frameDetails]);

  // ---------------------------------------------------------------------------
  // Frame variant discriminator.
  // The backend returns BOTH field families in BOTH cases (zero-filled for the
  // one that does not apply), so key presence tells us nothing - only the value
  // does. Count-based plots have at least one bearing/young tree.
  // ---------------------------------------------------------------------------
  const isTreeCountBased =
    (frameDetails?.totalNumberOfBearing || 0) > 0 ||
    (frameDetails?.totalNumberOfYoung || 0) > 0;

  const selectedTrees = frameDetails?.ifTreeThenRandomNo || [];

  // Irrigation type(s) live inside each irrigationSources[] entry, not at the
  // root of the common-details payload. Join them for the summary card.
  const irrigationTypeLabel =
    (commonDetails?.irrigationSources || [])
      .map((source) => source.irrigationType)
      .filter(Boolean)
      .join(', ') || 'N/A';

  // The yield payload nests two levels deep (visits, then yield types per
  // visit), so flatten to one row per measurement for tabular display.
  const yieldRows = yieldDetailsList.flatMap((tree, treeIdx) =>
    (tree.visitListResponses || []).flatMap((visit) =>
      (visit.yieldTypeResponses || []).map((entry, entryIdx) => ({
        treeLabel: `Tree ${treeIdx + 1}`,
        noOfVisit: visit.noOfVisit,
        rowKey: `${tree.cceDataEntryPerTreeId}-${visit.noOfVisit}-${entry.cropYieldTypeId ?? entryIdx}`,
        ...entry
      }))
    )
  );

  const renderLockCheckbox = (locked) => (
    <Checkbox
      checked={!!locked}
      readOnly
      disableRipple
      size="small"
      sx={{
        p: 0,
        cursor: 'default',
        color: alpha(theme.palette.text.secondary, 0.5),
        '&.Mui-checked': { color: theme.palette.success.main }
      }}
      inputProps={{ 'aria-label': 'Growth stage locked' }}
    />
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumb at the very top */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumb />
      </Box>

      {/* App Bar Alternative */}
      <Box sx={{
        background: `linear-gradient(135deg, ${themeColor} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 3,
        boxShadow: theme.shadows[3]
      }}>
        <IconButton sx={{ color: 'white' }} onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          CCE Data View
        </Typography>
      </Box>

      {/* Header Info */}
      <Paper sx={{
        background: `linear-gradient(135deg, ${themeColor} 0%, #55ea58ff 100%)`,
        color: 'white',
        p: 3,
        borderRadius: 3,
        mb: 4,
        boxShadow: `0 8px 24px ${alpha(themeColor, 0.2)}`
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          {rowData.crop} ({rowData.season})
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Cluster" value={rowData.clusterNo} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Cultivated Area" value={rowData.cultivatedArea} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Land Type" value={rowData.landType} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Survey No." value={rowData.surveyNo} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Panchayath" value={rowData.panchayath} /></Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Status"
              isBadge
              value={
                <Chip
                  label={rowData.status}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: rowData.status === 'Completed' ? '#DCFCE7' : rowData.status === 'Ongoing' ? '#FEF3C7' : '#FEE2E2',
                    color: rowData.status === 'Completed' ? '#166534' : rowData.status === 'Ongoing' ? '#92400E' : '#991B1B'
                  }}
                />
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { fontWeight: 600, py: 3, minHeight: 60 },
              '& .Mui-selected': { color: `${themeColor} !important` },
              '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
            }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Cultivator Field Details" />
            <Tab icon={<GridOnIcon />} iconPosition="start" label="Frame Selection Summary / Irrigation Method & Schedule" />
            <Tab icon={<SpaIcon />} iconPosition="start" label="Seed Details" />
            <Tab icon={<WaterDropIcon />} iconPosition="start" label="Irrigation" />
            <Tab icon={<AgricultureIcon />} iconPosition="start" label="Yield" />
          </Tabs>
        </Box>

        {/* TAB 1: Survey Details */}
        <TabPanel value={tabValue} index={0}>
          {plotDetailsError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {plotDetailsError}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={PersonIcon} title="Survey Details" />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    background: theme.palette.background.default
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, fontWeight: 600 }}>
                    Survey
                  </Typography>
                  {isPlotDetailsLoading ? (
                    <CircularProgress size={20} />
                  ) : plotDetails?.surveyResponses && plotDetails.surveyResponses.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {plotDetails.surveyResponses.map((survey, idx) => (
                        <Chip
                          key={survey.surveyId ?? idx}
                          label={survey.surveyName}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                      N/A
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <SectionTitle icon={SpaIcon} title="Cultivation Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Crop" value={rowData.crop} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Season" value={plotDetails?.seasonName || 'N/A'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Panchayath" value={plotDetails?.btrDetailsResponse?.localbodyNameEn || 'N/A'} /></Grid>
              {/* NOTE: no direct "survey number" field was returned by the API payload shared,
                  so this currently falls back to the BTR re-survey number (resvno).
                  Swap the source below if a different field should be used. */}
              <Grid item xs={12} sm={6} md={3}><DataItem label="Survey Number" value={plotDetails?.btrDetailsResponse?.resvno ?? 'N/A'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Cultivated Area" value={plotDetails?.cultivatedArea ?? 'N/A'} /></Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Irrigation Type"
                  value={
                    plotDetails?.isIrrigated === true
                      ? 'Irrigated'
                      : plotDetails?.isIrrigated === false
                      ? 'Unirrigated'
                      : 'N/A'
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle icon={PersonIcon} title="Farmer Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Farmer Name" value={plotDetails?.farmerName || 'N/A'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Address" value={plotDetails?.farmerAddress || 'N/A'} /></Grid>
              <Grid item xs={12} sm={6} md={4}><DataItem label="Contact No." value={plotDetails?.farmerPhoneNumber || 'N/A'} /></Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle icon={RemarksIcon} title="Remarks" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Remarks" value={plotDetails?.remarks || 'N/A'} /></Grid>
            </Grid>

          </Box>


        </TabPanel>

        {/* TAB 2: FRAME SELECTION */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <SectionTitle icon={GridOnIcon} title="Frame Selection Summary" />

            {isFrameLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={36} />
              </Box>
            ) : frameError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {frameError}
              </Alert>
            ) : frameDetails ? (
              <>
                {/* ---------- Summary metrics ---------- */}
                {isTreeCountBased ? (
                  /* CASE 1: Per Tree (count-based crops) */
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <MetricCard
                        label="Bearing Trees"
                        value={frameDetails.totalNumberOfBearing ?? 0}
                        color={theme.palette.success.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MetricCard
                        label="Young Trees"
                        value={frameDetails.totalNumberOfYoung ?? 0}
                        color={theme.palette.info.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MetricCard
                        label="Total Trees"
                        value={(frameDetails.totalNumberOfBearing || 0) + (frameDetails.totalNumberOfYoung || 0)}
                        color={theme.palette.primary.main}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  /* CASE 2: Per Cent / Area (frame-based crops) */
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Side Length X (m)"
                        value={frameDetails.sideLengthX ?? 0}
                        color={theme.palette.success.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Side Length Y (m)"
                        value={frameDetails.sideLengthY ?? 0}
                        color={theme.palette.info.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Random Side Length X (m)"
                        value={frameDetails.randomSideLengthX ?? 0}
                        color={theme.palette.warning.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Random Side Length Y (m)"
                        value={frameDetails.randomSideLengthY ?? 0}
                        color={theme.palette.primary.main}
                      />
                    </Grid>
                  </Grid>
                )}

                {/* ---------- Selected trees list (both cases) ---------- */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'text.primary' }}>
                  {isTreeCountBased
                    ? `Randomly Selected Trees (${selectedTrees.length})`
                    : 'Selected Frame Crop'}
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tree</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Random Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Growth Stage Locked</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTrees.length > 0 ? (
                        selectedTrees.map((item, idx) => (
                          <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                            <TableCell>
                              <Chip
                                label={`Tree ${idx + 1}`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {item.randomNo ?? 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              {renderLockCheckbox(item.isGrowthStageLocked)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            No selected trees available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              /* FALLBACK: Render static/rowData values if no API response */
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Parameter</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Plot Dimension</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Random Number Selected</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rowData.frameType === 'trees' ? (
                      <>
                        <TableRow><TableCell>Number of Trees in Frame</TableCell><TableCell>Count</TableCell><TableCell>{rowData.numberOfTrees || 50}</TableCell></TableRow>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}><TableCell>Randomly Selected Tree Number</TableCell><TableCell>Number</TableCell><TableCell>{rowData.randomTreeNumber || 12}</TableCell></TableRow>
                      </>
                    ) : (
                      <>
                        <TableRow><TableCell>X Direction</TableCell><TableCell>m</TableCell><TableCell>{rowData.plotLengthX || 10}</TableCell></TableRow>
                        <TableRow><TableCell>Y Direction</TableCell><TableCell>m</TableCell><TableCell>{rowData.plotLengthY || 10}</TableCell></TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* TAB 3: SEED DETAILS */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={SpaIcon} title="Seed Information" />

            {isSeedLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : seedError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{seedError}</Alert>
            ) : seedDetailsList && seedDetailsList.length > 0 ? (
              /* Per-Tree Seed Details - single table for both one and many trees */
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tree</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Seed Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sowing Method</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Planted Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seedDetailsList.map((item, idx) => (
                      <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Chip
                            label={`Tree ${idx + 1}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.seedTypeName || 'N/A'}
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.seedSourceName || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {item.seedQuantity !== undefined && item.seedQuantity !== null
                            ? item.seedQuantity
                            : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.sowingMethodName || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {item.ageOfPlant !== undefined && item.ageOfPlant !== null
                            ? item.ageOfPlant
                            : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{formatDate(item.plantedMonthAndYear)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* Fallback view when no API seed details are present */
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><DataItem label="Seed Variety" value="Ponni" /></Grid>
                <Grid item xs={12} sm={4}><DataItem label="Seed Type" value="HYV (High Yielding Variety)" /></Grid>
                <Grid item xs={12} sm={6} md={3}><DataItem label="Sowing Method" value="Transplanting" /></Grid>
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* TAB 4: IRRIGATION */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={WaterDropIcon} title="Irrigation Method & Schedule" />

            {/* Irrigation Sources from Common Details API */}
            {isCommonLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={40} />
              </Box>
            ) : commonError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{commonError}</Alert>
            ) : commonDetails?.irrigationSources && commonDetails.irrigationSources.length > 0 ? (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Irrigation Sources
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {commonDetails.irrigationSources.map((source, index) => (
                    <Chip
                      key={source.sourceId || index}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontWeight: 600 }}>{source.irrigationType || 'N/A'}</span>
                          {source.irrigationCodeDes !== undefined && source.irrigationCodeDes !== null && (
                            <Chip
                              label={`Code: ${source.irrigationCodeDes}`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.info.main, 0.15),
                                color: theme.palette.info.dark,
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 20,
                                '& .MuiChip-label': {
                                  px: 1,
                                  py: 0.5
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                      icon={<WaterDropIcon />}
                      sx={{
                        fontWeight: 500,
                        py: 1,
                        px: 0.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                        borderRadius: 2,
                        '& .MuiChip-label': {
                          px: 1.5,
                        },
                        '& .MuiChip-icon': {
                          color: theme.palette.primary.main,
                        },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ mb: 4, py: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Irrigation Sources
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  No irrigation sources available
                </Typography>
              </Box>
            )}

            {/* Irrigation Type summary card, sourced from irrigationSources */}
            {!isCommonLoading && !commonError && (
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <DataItem label="Irrigation Type" value={irrigationTypeLabel} />
                </Grid>
              </Grid>
            )}

            {/* Per-tree irrigation schedule */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Irrigation Schedule
              </Typography>

              {isIrrigationLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : irrigationError ? (
                <Alert severity="warning" sx={{ mb: 2 }}>{irrigationError}</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tree</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Drainage Available</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Irrigation Schedule</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Irrigation Frequency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {irrigationDetailsList.length > 0 ? (
                        irrigationDetailsList.map((item, idx) => (
                          <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                            <TableCell>
                              <Chip
                                label={`Tree ${idx + 1}`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell>
                              {item.isDrainageAvailable !== undefined && item.isDrainageAvailable !== null ? (
                                <Chip
                                  label={item.isDrainageAvailable ? 'Yes' : 'No'}
                                  size="small"
                                  color={item.isDrainageAvailable ? 'success' : 'error'}
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {item.isIrrigationScheduleRegular !== undefined && item.isIrrigationScheduleRegular !== null ? (
                                <Chip
                                  label={item.isIrrigationScheduleRegular ? 'Regular' : 'Irregular'}
                                  size="small"
                                  color={item.isIrrigationScheduleRegular ? 'success' : 'warning'}
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {item.irrigationFrequency || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            No irrigation schedule recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* TAB 5: YIELD */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={AgricultureIcon} title="Yield & Production" />
            {isYieldLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : yieldError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{yieldError}</Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tree</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Visit</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Harvest Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Yield Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>വിളവിന്റെ വിവരം</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Result Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yieldRows.length > 0 ? (
                      yieldRows.map((row, idx) => (
                        <TableRow key={row.rowKey || idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.treeLabel}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.noOfVisit ?? 'N/A'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatDate(row.harvestDate)}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.cropYieldNameEn || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.cropYieldNameMal || 'N/A'}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{row.resultType || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {row.result !== undefined && row.result !== null
                              ? `${row.result}${row.resultUnit ? ` ${row.resultUnit}` : ''}`
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No yield measurements recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          <Box>
            <SectionTitle icon={WarningIcon} title="Crop Loss & Damage" />
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No significant crop loss reported for this cluster.
              </Typography>
            </Box>
          </Box>
        </TabPanel>

      </Paper>
    </Box>
  );
};

export default CceDataView;
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
  Alert
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
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={PersonIcon} title="Survey Details" />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Survey " value={rowData.survey} /></Grid>
            </Grid>
          </Box>
          <Box>
            <SectionTitle icon={SpaIcon} title="Cultivation Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Crop" value={rowData.crop} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Season" value={rowData.season} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Panchayath" value={rowData.panchayath} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Survey Number" value={rowData.surveyNo} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Cultivated Area" value={rowData.cultivatedArea} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Irrigation Type" value={rowData.irrigationType} /></Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle icon={PersonIcon} title="Farmer Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Farmer Name" value={rowData.farmerName} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Address" value={rowData.address} /></Grid>
              <Grid item xs={12} sm={6} md={4}><DataItem label="Contact No." value={rowData.contactNo} /></Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle icon={RemarksIcon} title="Remarks" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Remarks" value={rowData.remarks} /></Grid>
            </Grid>

          </Box>


        </TabPanel>

        {/* TAB 2: FRAME SELECTION */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <SectionTitle icon={GridOnIcon} title="Frame Selection Summary / Irrigation Method & Schedule" />

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
                {(frameDetails.totalNumberOfBearing !== undefined || frameDetails.totalNumberOfYoung !== undefined) ? (
                  /* TYPE 2: TREE COUNT */
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.success.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                            Bearing Trees
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.dark, mt: 0.5 }}>
                            {frameDetails.totalNumberOfBearing ?? 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.info.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                            Young Trees
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.dark, mt: 0.5 }}>
                            {frameDetails.totalNumberOfYoung ?? 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.primary.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                            Total Trees
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.dark, mt: 0.5 }}>
                            {(frameDetails.totalNumberOfBearing || 0) + (frameDetails.totalNumberOfYoung || 0)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'text.primary' }}>
                      Randomly Selected Trees ({frameDetails.ifTreeThenRandomNo?.length || 0})
                    </Typography>

                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Random Tree Number</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Per Tree Reference ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Drainage Available</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Irrigation Schedule Regular</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Irrigation Frequency</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {frameDetails.ifTreeThenRandomNo && frameDetails.ifTreeThenRandomNo.length > 0 ? (
                            frameDetails.ifTreeThenRandomNo.map((item, idx) => {
                              const irr = irrigationDetailsList.find(i => i.cceDataEntryPerTreeId === item.cceDataEntryPerTreeId);
                              return (
                                <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                                  <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`Tree #${item.randomNo}`}
                                      size="small"
                                      color="primary"
                                      sx={{ fontWeight: 700 }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
                                    {item.cceDataEntryPerTreeId || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {isIrrigationLoading ? (
                                      <CircularProgress size={16} />
                                    ) : irr && irr.isDrainageAvailable !== undefined && irr.isDrainageAvailable !== null ? (
                                      <Chip
                                        label={irr.isDrainageAvailable ? "Yes" : "No"}
                                        size="small"
                                        color={irr.isDrainageAvailable ? "success" : "error"}
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    ) : (
                                      'N/A'
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isIrrigationLoading ? (
                                      <CircularProgress size={16} />
                                    ) : irr && irr.isIrrigationScheduleRegular !== undefined && irr.isIrrigationScheduleRegular !== null ? (
                                      <Chip
                                        label={irr.isIrrigationScheduleRegular ? "Regular" : "Irregular"}
                                        size="small"
                                        color={irr.isIrrigationScheduleRegular ? "success" : "warning"}
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    ) : (
                                      'N/A'
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    {isIrrigationLoading ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      irr?.irrigationFrequency || 'N/A'
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                No random trees available.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  /* TYPE 1: CENT / AREA */
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Parameter / Direction</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Plot Side Length (m)</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Random Selected Distance (m)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 600 }}>X Direction</TableCell>
                          <TableCell>{frameDetails.sideLengthX ?? 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={frameDetails.randomSideLengthX ?? 'N/A'}
                              size="small"
                              color="secondary"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 600 }}>Y Direction</TableCell>
                          <TableCell>{frameDetails.sideLengthY ?? 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={frameDetails.randomSideLengthY ?? 'N/A'}
                              size="small"
                              color="secondary"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                        {frameDetails.ifTreeThenRandomNo && frameDetails.ifTreeThenRandomNo.length > 0 && (() => {
                          const item = frameDetails.ifTreeThenRandomNo[0];
                          const irr = irrigationDetailsList.find(i => i.cceDataEntryPerTreeId === item.cceDataEntryPerTreeId);
                          return (
                            <>
                              <TableRow hover>
                                <TableCell sx={{ fontWeight: 600 }}>Selected Crop Random Number</TableCell>
                                <TableCell colSpan={2}>
                                  <Chip
                                    label={`Random No: ${item.randomNo}`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 700 }}
                                  />
                                </TableCell>
                              </TableRow>
                              {irr && (
                                <>
                                  <TableRow hover>
                                    <TableCell sx={{ fontWeight: 600 }}>Drainage Available</TableCell>
                                    <TableCell colSpan={2}>
                                      {irr.isDrainageAvailable !== undefined && irr.isDrainageAvailable !== null ? (
                                        <Chip
                                          label={irr.isDrainageAvailable ? "Yes" : "No"}
                                          size="small"
                                          color={irr.isDrainageAvailable ? "success" : "error"}
                                          variant="outlined"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      ) : 'N/A'}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow hover>
                                    <TableCell sx={{ fontWeight: 600 }}>Irrigation Schedule Regular</TableCell>
                                    <TableCell colSpan={2}>
                                      {irr.isIrrigationScheduleRegular !== undefined && irr.isIrrigationScheduleRegular !== null ? (
                                        <Chip
                                          label={irr.isIrrigationScheduleRegular ? "Regular" : "Irregular"}
                                          size="small"
                                          color={irr.isIrrigationScheduleRegular ? "success" : "warning"}
                                          variant="outlined"
                                          sx={{ fontWeight: 600 }}
                                        />
                                      ) : 'N/A'}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow hover>
                                    <TableCell sx={{ fontWeight: 600 }}>Irrigation Frequency</TableCell>
                                    <TableCell colSpan={2}>{irr.irrigationFrequency || 'N/A'}</TableCell>
                                  </TableRow>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
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
              seedDetailsList.length === 1 ? (
                /* Single Seed Detail */
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <DataItem label="Seed Variety" value={seedDetailsList[0].seedVarietyName || 'N/A'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DataItem label="Seed Type" value={seedDetailsList[0].seedTypeName || 'N/A'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DataItem label="Added By" value={seedDetailsList[0].addedBy || 'N/A'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DataItem label="Tree Ref ID" value={seedDetailsList[0].cceDataEntryPerTreeId || 'N/A'} />
                  </Grid>
                </Grid>
              ) : (
                /* Multiple Per-Tree Seed Details List */
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tree Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Seed Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Seed Variety</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Added By</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Per Tree Ref ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {seedDetailsList.map((item, idx) => (
                        <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={`Tree #${item.randomNo || (idx + 1)}`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                            <Chip
                              label={item.seedTypeName || 'N/A'}
                              size="small"
                              variant="outlined"
                              color="info"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{item.seedVarietyName || 'N/A'}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                            {item.addedBy || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                            {item.cceDataEntryPerTreeId || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
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

            {/* Additional Irrigation Information */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Irrigation Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <DataItem label="Irrigation Type" value={commonDetails?.irrigationType || 'N/A'} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DataItem label="Number of Irrigations" value={commonDetails?.numberOfIrrigations || 'N/A'} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DataItem label="Irrigation Interval" value={commonDetails?.irrigationInterval || 'N/A'} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DataItem label="Drainage Status" value={commonDetails?.drainageStatus || 'Good'} />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        {/* TAB 5: YIELD */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={AgricultureIcon} title="Yield & Production" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Total Production" value="850 Quintals" /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Yield per Hectare" value="42.5 Q/Ha" /></Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Quality Grade" value={<Chip label="Grade A" size="small" sx={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 'bold' }} />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Harvest Date" value="30-10-2024" /></Grid>
            </Grid>
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

import React, { useState, useEffect } from 'react';
import mainapi from 'api/mainapi';
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
  TableRow
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
  NoteAlt as RemarksIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

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
  
  const [commonDetails, setCommonDetails] = useState(null);
  const [frameDetails, setFrameDetails] = useState(null);
  const [seedDetails, setSeedDetails] = useState(null);
  const [irrigationDetails, setIrrigationDetails] = useState(null);
  const [yieldDetails, setYieldDetails] = useState(null);
  const [diseaseDetails, setDiseaseDetails] = useState(null);

  // Fallback data if page is accessed directly without row state
  const rowData = location.state?.rowData || {};
  const plotId = rowData.cceAvailablePlotId || rowData.id;
  const FORM_URL = mainapi.FORM_API;

  useEffect(() => {
    if (!plotId) return;
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchAll = async () => {
      try {
        const commonRes = await fetch(`${FORM_URL}/earas-form1-entry/cce-data-entry/fetch-common-details/${plotId}`, { headers });
        if (commonRes.ok) {
          const resJson = await commonRes.json();
          setCommonDetails(resJson.payload || null);
        }

        const frameRes = await fetch(`${FORM_URL}/earas-form1-entry/cce-data-entry/frame-details/${plotId}`, { headers });
        if (frameRes.ok) {
           const resJson = await frameRes.json();
           setFrameDetails(resJson.payload || null);
        }

        const seedRes = await fetch(`${FORM_URL}/earas-form1-entry/cce-data-entry/fetch-seed-details-per-tree/${plotId}`, { headers });
        if (seedRes.ok) {
           const resJson = await seedRes.json();
           setSeedDetails(resJson.payload || null);
        }

        const irriRes = await fetch(`${FORM_URL}/earas-form1-entry/cce-data-entry/fetch-irrigation-details-per-tree/${plotId}`, { headers });
        if (irriRes.ok) {
           const resJson = await irriRes.json();
           setIrrigationDetails(resJson.payload || null);
        }

        const yieldRes = await fetch(`${FORM_URL}/earas-form1-entry/cce-data-entry/fetch-yield-details/${plotId}`, { headers });
        if (yieldRes.ok) {
           const resJson = await yieldRes.json();
           setYieldDetails(resJson.payload || null);
        }

        const diseaseRes = await fetch(`${FORM_URL}/earas-form1-entry/cce-data-entry/fetch-diseases-details/${plotId}`, { headers });
        if (diseaseRes.ok) {
           const resJson = await diseaseRes.json();
           setDiseaseDetails(resJson.payload || null);
        }

      } catch (err) {
        console.error("Error fetching CCE details:", err);
      }
    };
    fetchAll();
  }, [plotId, FORM_URL]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ pb: 4 }}>
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

      <Paper sx={{
        background: `linear-gradient(135deg, ${themeColor} 0%, #55ea58ff 100%)`,
        color: 'white',
        p: 3,
        borderRadius: 3,
        mb: 4,
        boxShadow: `0 8px 24px ${alpha(themeColor, 0.2)}`
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          {rowData.cropName || rowData.crop || 'Crop'} ({rowData.season || 'Season'})
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Cluster" value={rowData.clusterNo || rowData.clusterId || 'NA'} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Cultivated Area" value={rowData.cultivatedArea || 'NA'} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Land Type" value={rowData.landType || 'NA'} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Survey No." value={rowData.surveyNo || 'NA'} /></Grid>
          <Grid item xs={6} sm={4} md={2}><InfoItem label="Panchayath" value={rowData.panchayath || 'NA'} /></Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Status"
              isBadge
              value={
                <Chip
                  label={rowData.status || (rowData.isSelected ? 'Selected' : 'Available')}
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
            <Tab icon={<GridOnIcon />} iconPosition="start" label="Frame Selection" />
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
              <Grid item xs={12} sm={6} md={3}><DataItem label="Survey" value={commonDetails?.surveyNumber || rowData.surveyNo || 'NA'} /></Grid>
            </Grid>
          </Box>
          <Box>
            <SectionTitle icon={SpaIcon} title="Cultivation Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Crop" value={rowData.cropName || rowData.crop || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Season" value={rowData.season || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Panchayath" value={rowData.panchayath || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Survey Number" value={commonDetails?.surveyNumber || rowData.surveyNo || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Cultivated Area" value={commonDetails?.area || rowData.cultivatedArea || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Irrigation Type" value={commonDetails?.irrigationType || rowData.irrigationType || 'NA'} /></Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle icon={PersonIcon} title="Farmer Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Farmer Name" value={commonDetails?.farmerName || rowData.farmerName || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Address" value={commonDetails?.address || rowData.address || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={4}><DataItem label="Contact No." value={commonDetails?.contactNumber || rowData.contactNo || 'NA'} /></Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle icon={RemarksIcon} title="Remarks" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Remarks" value={commonDetails?.remarks || rowData.remarks || 'NA'} /></Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* TAB 2: FRAME SELECTION */}
        <TabPanel value={tabValue} index={1}>

          <Box>
            <SectionTitle icon={GridOnIcon} title="Frame Selection Summary" />
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
              <Table>
                <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Parameter</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Plot Dimention</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Random Number Selected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {frameDetails?.frameUnit === 'trees' || frameDetails?.frameUnit === 'plants' ? (
                    <>
                      <TableRow><TableCell>Number of {frameDetails?.frameUnit || 'Trees'} in Frame</TableCell><TableCell>Count</TableCell><TableCell>{frameDetails?.frameMeasure || 'NA'}</TableCell></TableRow>
                      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}><TableCell>Randomly Selected Number</TableCell><TableCell>Number</TableCell><TableCell>{frameDetails?.totalNumberOfBearing || 'NA'}</TableCell></TableRow>
                    </>
                  ) : (
                    <>
                      <TableRow><TableCell>X Direction</TableCell><TableCell>m</TableCell><TableCell>{frameDetails?.frameLength || 'NA'}</TableCell></TableRow>
                      <TableRow><TableCell>Y Direction</TableCell><TableCell>m</TableCell><TableCell>{frameDetails?.frameWidth || 'NA'}</TableCell></TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* TAB 3: SEED DETAILS */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={SpaIcon} title="Seed Information" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><DataItem label="Seed Variety" value={seedDetails?.variety || 'NA'} /></Grid>
              <Grid item xs={12} sm={4}><DataItem label="Seed Type" value={seedDetails?.seedType || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Sowing Method" value={seedDetails?.sowingMethod || 'NA'} /></Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* TAB 4: IRRIGATION */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={WaterDropIcon} title="Irrigation Method & Schedule" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Method" value={irrigationDetails?.irrigationMethod || 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Number of Irrigations" value={irrigationDetails?.numberOfIrrigations || 'NA'} /></Grid>
            </Grid>
          </Box>
          <Box>
            <SectionTitle icon={GridOnIcon} title="Drainage System" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><DataItem label="Drainage Status" value={irrigationDetails?.drainageStatus || 'NA'} /></Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* TAB 5: YIELD */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={AgricultureIcon} title="Yield & Production" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Total Production" value={yieldDetails?.totalProduction ? `${yieldDetails.totalProduction} Quintals` : 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Yield per Hectare" value={yieldDetails?.yieldPerHectare ? `${yieldDetails.yieldPerHectare} Q/Ha` : 'NA'} /></Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Quality Grade" value={<Chip label={yieldDetails?.qualityGrade || "NA"} size="small" sx={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 'bold' }} />} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}><DataItem label="Harvest Date" value={yieldDetails?.harvestDate || 'NA'} /></Grid>
            </Grid>
          </Box>
          <Box>
            <SectionTitle icon={WarningIcon} title="Crop Loss & Damage" />
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {diseaseDetails?.damageReported || 'No significant crop loss reported for this cluster.'}
              </Typography>
            </Box>
          </Box>
        </TabPanel>

      </Paper>
    </Box>
  );
};

export default CceDataView;

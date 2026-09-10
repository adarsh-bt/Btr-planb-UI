import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import WorkAllocationTable from './WorkAllocationTable';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { getCurrentUserJurisdiction } from './userJurisdiction';

// Pre-defined District List for Kerala (All 14 Districts)
const KERALA_DISTRICTS_DATA = [
  { id: '1', name: 'Thiruvananthapuram', wetInCents: 36150, dryInCents: 341870, totalInCents: 378020, forestAreas: 0, plantationArea: 0, waterBodiesArea: 9155, otherAreas: 0, plotsWet: 1314, plotsDry: 9622, plotsTotal: 10936, availWetArea: 36150.00, availDryArea: 332715.00, availTotalArea: 368865.00 },
  { id: '2', name: 'Kollam', wetInCents: 42100, dryInCents: 310500, totalInCents: 352600, forestAreas: 1200, plantationArea: 450, waterBodiesArea: 8400, otherAreas: 120, plotsWet: 1540, plotsDry: 8900, plotsTotal: 10440, availWetArea: 42100.00, availDryArea: 301530.00, availTotalArea: 343630.00 },
  { id: '3', name: 'Pathanamthitta', wetInCents: 28500, dryInCents: 295000, totalInCents: 323500, forestAreas: 3500, plantationArea: 1200, waterBodiesArea: 5200, otherAreas: 80, plotsWet: 980, plotsDry: 7850, plotsTotal: 8830, availWetArea: 28500.00, availDryArea: 285020.00, availTotalArea: 313520.00 },
  { id: '4', name: 'Alappuzha', wetInCents: 68000, dryInCents: 180000, totalInCents: 248000, forestAreas: 0, plantationArea: 100, waterBodiesArea: 14500, otherAreas: 50, plotsWet: 2400, plotsDry: 5200, plotsTotal: 7600, availWetArea: 68000.00, availDryArea: 165350.00, availTotalArea: 233350.00 },
  { id: '5', name: 'Kottayam', wetInCents: 54000, dryInCents: 260000, totalInCents: 314000, forestAreas: 800, plantationArea: 2100, waterBodiesArea: 9800, otherAreas: 150, plotsWet: 1850, plotsDry: 7100, plotsTotal: 8950, availWetArea: 54000.00, availDryArea: 247150.00, availTotalArea: 301150.00 },
  { id: '6', name: 'Idukki', wetInCents: 15000, dryInCents: 450000, totalInCents: 465000, forestAreas: 18500, plantationArea: 12400, waterBodiesArea: 11200, otherAreas: 400, plotsWet: 620, plotsDry: 12100, plotsTotal: 12720, availWetArea: 15000.00, availDryArea: 407500.00, availTotalArea: 422500.00 },
  { id: '7', name: 'Ernakulam', wetInCents: 48000, dryInCents: 380000, totalInCents: 428000, forestAreas: 2100, plantationArea: 1800, waterBodiesArea: 12300, otherAreas: 250, plotsWet: 1650, plotsDry: 9800, plotsTotal: 11450, availWetArea: 48000.00, availDryArea: 363550.00, availTotalArea: 411550.00 },
  { id: '8', name: 'Thrissur', wetInCents: 52000, dryInCents: 320000, totalInCents: 372000, forestAreas: 4200, plantationArea: 1500, waterBodiesArea: 8900, otherAreas: 180, plotsWet: 1720, plotsDry: 8400, plotsTotal: 10120, availWetArea: 52000.00, availDryArea: 305220.00, availTotalArea: 357220.00 },
  { id: '9', name: 'Palakkad', wetInCents: 75000, dryInCents: 410000, totalInCents: 485000, forestAreas: 8900, plantationArea: 3100, waterBodiesArea: 7600, otherAreas: 300, plotsWet: 2850, plotsDry: 10500, plotsTotal: 13350, availWetArea: 75000.00, availDryArea: 390100.00, availTotalArea: 465100.00 },
  { id: '10', name: 'Malappuram', wetInCents: 38000, dryInCents: 390000, totalInCents: 428000, forestAreas: 6100, plantationArea: 2800, waterBodiesArea: 6500, otherAreas: 210, plotsWet: 1410, plotsDry: 9900, plotsTotal: 11310, availWetArea: 38000.00, availDryArea: 374390.00, availTotalArea: 412390.00 },
  { id: '11', name: 'Kozhikode', wetInCents: 31000, dryInCents: 310000, totalInCents: 341000, forestAreas: 3100, plantationArea: 1900, waterBodiesArea: 5800, otherAreas: 140, plotsWet: 1150, plotsDry: 8100, plotsTotal: 9250, availWetArea: 31000.00, availDryArea: 299060.00, availTotalArea: 330060.00 },
  { id: '12', name: 'Wayanad', wetInCents: 22000, dryInCents: 280000, totalInCents: 302000, forestAreas: 11200, plantationArea: 8400, waterBodiesArea: 4100, otherAreas: 220, plotsWet: 840, plotsDry: 6900, plotsTotal: 7740, availWetArea: 22000.00, availDryArea: 256080.00, availTotalArea: 278080.00 },
  { id: '13', name: 'Kannur', wetInCents: 34000, dryInCents: 330000, totalInCents: 364000, forestAreas: 5400, plantationArea: 3200, waterBodiesArea: 6200, otherAreas: 190, plotsWet: 1220, plotsDry: 8600, plotsTotal: 9820, availWetArea: 34000.00, availDryArea: 315010.00, availTotalArea: 349010.00 },
  { id: '14', name: 'Kasaragod', wetInCents: 29000, dryInCents: 290000, totalInCents: 319000, forestAreas: 4100, plantationArea: 2900, waterBodiesArea: 4800, otherAreas: 160, plotsWet: 1050, plotsDry: 7400, plotsTotal: 8450, availWetArea: 29000.00, availDryArea: 278040.00, availTotalArea: 307040.00 }
];

function KeralaWorkAllocationReport() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [restrictionNotice, setRestrictionNotice] = useState('');
  const userJurisdiction = getCurrentUserJurisdiction();

  React.useEffect(() => {
    // Only Taluk level users auto-redirect to their specific zone
    if (userJurisdiction.level === 'taluk') {
      navigate(`/kerala_work_allocation_report/zone/${encodeURIComponent(userJurisdiction.district)}/${encodeURIComponent(userJurisdiction.taluk)}`, { replace: true });
    }
  }, [userJurisdiction, navigate]);

  const handleDrillDownToTaluk = (districtRow) => {
    const districtName = districtRow.name || districtRow.district;

    // Check if user is district level and attempting to view another district
    if (userJurisdiction.level === 'district' && districtName.toLowerCase() !== userJurisdiction.district.toLowerCase()) {
      setRestrictionNotice(`Access Restricted: You are assigned to ${userJurisdiction.district} District.`);
      return;
    }

    navigate(`/kerala_work_allocation_report/taluk/${encodeURIComponent(districtName)}`, {
      state: { districtData: districtRow }
    });
  };

  // Both Directorate and District level users see ALL 14 Districts in State View
  const visibleDistricts = KERALA_DISTRICTS_DATA;

  // Compute total metrics for state view
  const totalPlotsWet = visibleDistricts.reduce((sum, d) => sum + d.plotsWet, 0);
  const totalPlotsDry = visibleDistricts.reduce((sum, d) => sum + d.plotsDry, 0);
  const totalPlotsTotal = visibleDistricts.reduce((sum, d) => sum + d.plotsTotal, 0);

  const totalAreaWet = visibleDistricts.reduce((sum, d) => sum + d.availWetArea, 0);
  const totalAreaDry = visibleDistricts.reduce((sum, d) => sum + d.availDryArea, 0);
  const totalAreaTotal = visibleDistricts.reduce((sum, d) => sum + d.availTotalArea, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Work Allocation Abstract Report - Kerala State
          </Typography>
        </Box>
      </Grid>

      {/* Compact Summary Cards */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationCityIcon sx={{ color: '#1976d2', mr: 0.8, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                Number of Plots Available for Estimation
              </Typography>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e3f2fd', borderRadius: 1.5, border: '1px solid #bbdefb', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Wet
                  </Typography>
                  <Typography sx={{ color: '#0d47a1', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {totalPlotsWet.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#fff3e0', borderRadius: 1.5, border: '1px solid #ffe0b2', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Dry
                  </Typography>
                  <Typography sx={{ color: '#e65100', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {totalPlotsDry.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e8f5e9', borderRadius: 1.5, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Total
                  </Typography>
                  <Typography sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {totalPlotsTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LandscapeIcon sx={{ color: '#2e7d32', mr: 0.8, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                Area (in cents) Available for Estimation
              </Typography>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e3f2fd', borderRadius: 1.5, border: '1px solid #bbdefb', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Wet
                  </Typography>
                  <Typography sx={{ color: '#0d47a1', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {totalAreaWet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#fff3e0', borderRadius: 1.5, border: '1px solid #ffe0b2', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Dry
                  </Typography>
                  <Typography sx={{ color: '#e65100', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {totalAreaDry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e8f5e9', borderRadius: 1.5, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Total
                  </Typography>
                  <Typography sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {totalAreaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Main Table Card */}
      <Grid item xs={12}>
        <MainCard title={`Work Allocation Abstract - District Wise Report (${visibleDistricts.length} Districts)`}>
          <WorkAllocationTable
            data={visibleDistricts}
            locationColumnLabel="District Name"
            onDrillDown={handleDrillDownToTaluk}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            showDrillDown={true}
            reportLevelName={`Kerala State Report (${userJurisdiction.role})`}
          />
        </MainCard>
      </Grid>

      {/* Access Restriction Notification Toast */}
      <Snackbar
        open={Boolean(restrictionNotice)}
        autoHideDuration={4000}
        onClose={() => setRestrictionNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setRestrictionNotice('')} severity="warning" variant="filled" sx={{ width: '100%', fontWeight: 600 }}>
          {restrictionNotice}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default KeralaWorkAllocationReport;

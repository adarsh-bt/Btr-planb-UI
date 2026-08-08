import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Button
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import WorkAllocationTable from './WorkAllocationTable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { getCurrentUserJurisdiction, filterByJurisdiction } from './userJurisdiction';

// Sample Taluks mapped by District Name
const TALUK_DATA_MAP = {
  Thiruvananthapuram: [
    { id: '101', name: 'Neyyattinkara', wetInCents: 12500, dryInCents: 95000, totalInCents: 107500, forestAreas: 0, plantationArea: 0, waterBodiesArea: 2400, otherAreas: 0, plotsWet: 450, plotsDry: 2800, plotsTotal: 3250, availWetArea: 12500.00, availDryArea: 92600.00, availTotalArea: 105100.00 },
    { id: '102', name: 'Kattakada', wetInCents: 6200, dryInCents: 68000, totalInCents: 74200, forestAreas: 0, plantationArea: 0, waterBodiesArea: 1850, otherAreas: 0, plotsWet: 230, plotsDry: 1950, plotsTotal: 2180, availWetArea: 6200.00, availDryArea: 66150.00, availTotalArea: 72350.00 },
    { id: '103', name: 'Thiruvananthapuram', wetInCents: 5400, dryInCents: 62000, totalInCents: 67400, forestAreas: 0, plantationArea: 0, waterBodiesArea: 1900, otherAreas: 0, plotsWet: 190, plotsDry: 1680, plotsTotal: 1870, availWetArea: 5400.00, availDryArea: 60100.00, availTotalArea: 65500.00 },
    { id: '104', name: 'Nedumangad', wetInCents: 4800, dryInCents: 54000, totalInCents: 58800, forestAreas: 0, plantationArea: 0, waterBodiesArea: 1400, otherAreas: 0, plotsWet: 180, plotsDry: 1450, plotsTotal: 1630, availWetArea: 4800.00, availDryArea: 52600.00, availTotalArea: 57400.00 },
    { id: '105', name: 'Chirayinkeezhu', wetInCents: 4150, dryInCents: 35870, totalInCents: 40020, forestAreas: 0, plantationArea: 0, waterBodiesArea: 955, otherAreas: 0, plotsWet: 144, plotsDry: 922, plotsTotal: 1066, availWetArea: 4150.00, availDryArea: 34915.00, availTotalArea: 39065.00 },
    { id: '106', name: 'Varkala', wetInCents: 3100, dryInCents: 27000, totalInCents: 30100, forestAreas: 0, plantationArea: 0, waterBodiesArea: 650, otherAreas: 0, plotsWet: 120, plotsDry: 820, plotsTotal: 940, availWetArea: 3100.00, availDryArea: 26350.00, availTotalArea: 29450.00 }
  ],
  Kollam: [
    { id: '201', name: 'Kollam', wetInCents: 11000, dryInCents: 85000, totalInCents: 96000, forestAreas: 200, plantationArea: 100, waterBodiesArea: 2200, otherAreas: 30, plotsWet: 410, plotsDry: 2400, plotsTotal: 2810, availWetArea: 11000.00, availDryArea: 82800.00, availTotalArea: 93800.00 },
    { id: '202', name: 'Karunagappally', wetInCents: 9500, dryInCents: 62000, totalInCents: 71500, forestAreas: 0, plantationArea: 50, waterBodiesArea: 1900, otherAreas: 20, plotsWet: 350, plotsDry: 1800, plotsTotal: 2150, availWetArea: 9500.00, availDryArea: 60100.00, availTotalArea: 69600.00 },
    { id: '203', name: 'Kunnathur', wetInCents: 6200, dryInCents: 48000, totalInCents: 54200, forestAreas: 100, plantationArea: 80, waterBodiesArea: 1200, otherAreas: 10, plotsWet: 220, plotsDry: 1400, plotsTotal: 1620, availWetArea: 6200.00, availDryArea: 46800.00, availTotalArea: 53000.00 },
    { id: '204', name: 'Kottarakkara', wetInCents: 8400, dryInCents: 61500, totalInCents: 69900, forestAreas: 400, plantationArea: 120, waterBodiesArea: 1600, otherAreas: 30, plotsWet: 310, plotsDry: 1750, plotsTotal: 2060, availWetArea: 8400.00, availDryArea: 59900.00, availTotalArea: 68300.00 },
    { id: '205', name: 'Punalur', wetInCents: 7000, dryInCents: 54000, totalInCents: 61000, forestAreas: 500, plantationArea: 100, waterBodiesArea: 1500, otherAreas: 30, plotsWet: 250, plotsDry: 1550, plotsTotal: 1800, availWetArea: 7000.00, availDryArea: 52500.00, availTotalArea: 59500.00 }
  ]
};

const generateGenericTaluks = (districtName) => {
  return [
    { id: '901', name: `${districtName} North`, wetInCents: 12000, dryInCents: 85000, totalInCents: 97000, forestAreas: 500, plantationArea: 300, waterBodiesArea: 2100, otherAreas: 40, plotsWet: 420, plotsDry: 2500, plotsTotal: 2920, availWetArea: 12000.00, availDryArea: 82900.00, availTotalArea: 94900.00 },
    { id: '902', name: `${districtName} South`, wetInCents: 10500, dryInCents: 75000, totalInCents: 85500, forestAreas: 300, plantationArea: 200, waterBodiesArea: 1800, otherAreas: 30, plotsWet: 380, plotsDry: 2200, plotsTotal: 2580, availWetArea: 10500.00, availDryArea: 73200.00, availTotalArea: 83700.00 },
    { id: '903', name: `${districtName} Central`, wetInCents: 9800, dryInCents: 70000, totalInCents: 79800, forestAreas: 200, plantationArea: 150, waterBodiesArea: 1600, otherAreas: 20, plotsWet: 340, plotsDry: 2000, plotsTotal: 2340, availWetArea: 9800.00, availDryArea: 68400.00, availTotalArea: 78200.00 },
    { id: '904', name: `${districtName} East`, wetInCents: 8500, dryInCents: 62000, totalInCents: 70500, forestAreas: 800, plantationArea: 400, waterBodiesArea: 1400, otherAreas: 50, plotsWet: 290, plotsDry: 1800, plotsTotal: 2090, availWetArea: 8500.00, availDryArea: 60600.00, availTotalArea: 69100.00 }
  ];
};

function TalukWorkAllocationReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtName: rawDistrictName } = useParams();
  const districtName = decodeURIComponent(rawDistrictName || 'Thiruvananthapuram');

  const [searchTerm, setSearchTerm] = useState('');
  const userJurisdiction = getCurrentUserJurisdiction();

  React.useEffect(() => {
    if (userJurisdiction.level === 'taluk') {
      navigate(`/report/kerala_work_allocation_report/zone/${encodeURIComponent(userJurisdiction.district)}/${encodeURIComponent(userJurisdiction.taluk)}`, { replace: true });
    }
  }, [userJurisdiction, navigate]);

  const rawTalukList = TALUK_DATA_MAP[districtName] || generateGenericTaluks(districtName);

  // Filter taluk list according to jurisdiction
  const visibleTalukList = filterByJurisdiction(
    rawTalukList,
    userJurisdiction.level,
    userJurisdiction.district,
    userJurisdiction.taluk
  );

  const handleDrillDownToZone = (talukRow) => {
    const talukName = talukRow.name || talukRow.taluk;
    navigate(`/kerala_work_allocation_report/zone/${encodeURIComponent(districtName)}/${encodeURIComponent(talukName)}`, {
      state: { districtName, talukData: talukRow }
    });
  };

  // Compute total metrics
  const totalPlotsWet = visibleTalukList.reduce((sum, d) => sum + d.plotsWet, 0);
  const totalPlotsDry = visibleTalukList.reduce((sum, d) => sum + d.plotsDry, 0);
  const totalPlotsTotal = visibleTalukList.reduce((sum, d) => sum + d.plotsTotal, 0);

  const totalAreaWet = visibleTalukList.reduce((sum, d) => sum + d.availWetArea, 0);
  const totalAreaDry = visibleTalukList.reduce((sum, d) => sum + d.availDryArea, 0);
  const totalAreaTotal = visibleTalukList.reduce((sum, d) => sum + d.availTotalArea, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Show Back to State View only for Directorate Level Users */}
            {userJurisdiction.level === 'directorate' && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/kerala_work_allocation_report')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Back to State View
              </Button>
            )}
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {districtName} District - Taluk Wise Work Allocation
            </Typography>
          </Stack>
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
        <MainCard title={`Work Allocation Abstract - Taluks of ${districtName} (${visibleTalukList.length} Taluks)`}>
          <WorkAllocationTable
            data={visibleTalukList}
            locationColumnLabel="Taluk Name"
            onDrillDown={handleDrillDownToZone}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            showDrillDown={true}
            reportLevelName={`${districtName} District Report (${userJurisdiction.role})`}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default TalukWorkAllocationReport;

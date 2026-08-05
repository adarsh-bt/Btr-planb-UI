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

// Panchayaths/Zones with Block Name, Zone Code, Original Zone Name, and Panchayat Name
const PANCHAYATH_DATA_MAP = {
  Neyyattinkara: [
    { id: '301', blockName: 'Neyyattinkara Block', zoneCode: 'ZN-01', zoneName: 'Zone 1 (Venganoor)', name: 'Venganoor', wetInCents: 36150, dryInCents: 341870, totalInCents: 378020.00, forestAreas: 0, plantationArea: 0, waterBodiesArea: 9155, otherAreas: 0, plotsWet: 1314, plotsDry: 9622, plotsTotal: 10936, availWetArea: 36150.00, availDryArea: 332715.00, availTotalArea: 368865.00 },
    { id: '302', blockName: 'Neyyattinkara Block', zoneCode: 'ZN-02', zoneName: 'Zone 2 (Balaramapuram)', name: 'Balaramapuram', wetInCents: 24500, dryInCents: 185000, totalInCents: 209500.00, forestAreas: 0, plantationArea: 0, waterBodiesArea: 4200, otherAreas: 0, plotsWet: 890, plotsDry: 5400, plotsTotal: 6290, availWetArea: 24500.00, availDryArea: 180800.00, availTotalArea: 205300.00 },
    { id: '303', blockName: 'Nemom Block', zoneCode: 'ZN-03', zoneName: 'Zone 3 (Kanjiramkulam)', name: 'Kanjiramkulam', wetInCents: 18200, dryInCents: 142000, totalInCents: 160200.00, forestAreas: 0, plantationArea: 0, waterBodiesArea: 3100, otherAreas: 0, plotsWet: 620, plotsDry: 4100, plotsTotal: 4720, availWetArea: 18200.00, availDryArea: 138900.00, availTotalArea: 157100.00 },
    { id: '304', blockName: 'Nemom Block', zoneCode: 'ZN-04', zoneName: 'Zone 4 (Kottukal)', name: 'Kottukal', wetInCents: 15400, dryInCents: 128000, totalInCents: 143400.00, forestAreas: 0, plantationArea: 0, waterBodiesArea: 2800, otherAreas: 0, plotsWet: 510, plotsDry: 3800, plotsTotal: 4310, availWetArea: 15400.00, availDryArea: 125200.00, availTotalArea: 140600.00 },
    { id: '305', blockName: 'Parassala Block', zoneCode: 'ZN-05', zoneName: 'Zone 5 (Karumkulam)', name: 'Karumkulam', wetInCents: 12800, dryInCents: 115000, totalInCents: 127800.00, forestAreas: 0, plantationArea: 0, waterBodiesArea: 2100, otherAreas: 0, plotsWet: 430, plotsDry: 3200, plotsTotal: 3630, availWetArea: 12800.00, availDryArea: 112900.00, availTotalArea: 125700.00 }
  ]
};

const generateGenericPanchayaths = (talukName) => {
  return [
    { id: '801', blockName: `${talukName} Block 1`, zoneCode: 'ZN-01', zoneName: `Zone 1 (${talukName} Central)`, name: `${talukName} Zone 1`, wetInCents: 36150, dryInCents: 341870, totalInCents: 378020.00, forestAreas: 0, plantationArea: 0, waterBodiesArea: 9155, otherAreas: 0, plotsWet: 1314, plotsDry: 9622, plotsTotal: 10936, availWetArea: 36150.00, availDryArea: 332715.00, availTotalArea: 368865.00 },
    { id: '802', blockName: `${talukName} Block 1`, zoneCode: 'ZN-02', zoneName: `Zone 2 (${talukName} North)`, name: `${talukName} Zone 2`, wetInCents: 21000, dryInCents: 195000, totalInCents: 216000.00, forestAreas: 100, plantationArea: 50, waterBodiesArea: 4100, otherAreas: 20, plotsWet: 750, plotsDry: 5800, plotsTotal: 6550, availWetArea: 21000.00, availDryArea: 190900.00, availTotalArea: 211900.00 },
    { id: '803', blockName: `${talukName} Block 2`, zoneCode: 'ZN-03', zoneName: `Zone 3 (${talukName} South)`, name: `${talukName} Zone 3`, wetInCents: 18500, dryInCents: 165000, totalInCents: 183500.00, forestAreas: 0, plantationArea: 80, waterBodiesArea: 3500, otherAreas: 10, plotsWet: 640, plotsDry: 4900, plotsTotal: 5540, availWetArea: 18500.00, availDryArea: 161500.00, availTotalArea: 180000.00 }
  ];
};

function ZoneWorkAllocationReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtName: rawDistrictName, talukName: rawTalukName } = useParams();

  const districtName = decodeURIComponent(rawDistrictName || 'Thiruvananthapuram');
  const talukName = decodeURIComponent(rawTalukName || 'Neyyattinkara');

  const [searchTerm, setSearchTerm] = useState('');
  const userJurisdiction = getCurrentUserJurisdiction();

  const rawPanchayathList = PANCHAYATH_DATA_MAP[talukName] || generateGenericPanchayaths(talukName);

  // Filter zone list if restricted by jurisdiction
  const visiblePanchayathList = filterByJurisdiction(
    rawPanchayathList,
    userJurisdiction.level,
    userJurisdiction.district,
    userJurisdiction.taluk
  );

  // Compute total metrics
  const totalPlotsWet = visiblePanchayathList.reduce((sum, d) => sum + d.plotsWet, 0);
  const totalPlotsDry = visiblePanchayathList.reduce((sum, d) => sum + d.plotsDry, 0);
  const totalPlotsTotal = visiblePanchayathList.reduce((sum, d) => sum + d.plotsTotal, 0);

  const totalAreaWet = visiblePanchayathList.reduce((sum, d) => sum + d.availWetArea, 0);
  const totalAreaDry = visiblePanchayathList.reduce((sum, d) => sum + d.availDryArea, 0);
  const totalAreaTotal = visiblePanchayathList.reduce((sum, d) => sum + d.availTotalArea, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Show Back to Taluk list if authorized */}
            {userJurisdiction.level !== 'taluk' && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/kerala_work_allocation_report/taluk/${encodeURIComponent(districtName)}`)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Back to {districtName} Taluks
              </Button>
            )}
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {talukName} Taluk ({districtName} District) - Zone / Panchayat Report
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
        <MainCard title={`Work Allocation Abstract - Panchayats / Municipalities of ${talukName} (${visiblePanchayathList.length} Zones)`}>
          <WorkAllocationTable
            data={visiblePanchayathList}
            locationColumnLabel="Panchayat / Municipality / Corporation Zone"
            onDrillDown={null}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            showDrillDown={false}
            showBlockColumn={true}
            blockColumnLabel="Block"
            showZoneColumn={true}
            zoneColumnLabel="Zone Name"
            reportLevelName={`${talukName} Taluk (${districtName} District) Report (${userJurisdiction.role})`}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ZoneWorkAllocationReport;

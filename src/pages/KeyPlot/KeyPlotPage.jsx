import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material';
import FilterToolbar from 'components/common/FilterToolbar';
import StatusBadge from 'components/common/StatusBadge';
import ExportButtons from 'components/common/ExportButtons';
import { getZonePerformance } from 'api/dashboardApi';

export default function KeyPlotPage() {
  const [filters, setFilters] = useState({
    year: '2026-27',
    month: 'August 2026',
    district: 'All',
    taluk: 'All',
    zone: 'All'
  });
  const [zones, setZones] = useState([]);

  useEffect(() => {
    getZonePerformance(filters).then(setZones);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      year: '2026-27',
      month: 'August 2026',
      district: 'All',
      taluk: 'All',
      zone: 'All'
    });
  };

  const exportHeaders = ['Zone Name', 'Key Plot Target', 'Completed Plots', 'Pending Plots', 'Rejected Plots', 'Completion %', 'Status'];
  const exportRows = zones.map((z) => [
    z.zone,
    100,
    z.achievement === 100 ? 100 : Math.round(z.achievement),
    100 - (z.achievement === 100 ? 100 : Math.round(z.achievement)),
    z.zone === 'Zone 102' ? 3 : 0,
    `${z.achievement}%`,
    z.achievement === 100 ? 'Completed' : z.achievement >= 80 ? 'In Progress' : 'Critical'
  ]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            Key Plot / Crop Cutting Experiments (CCE)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track key plot selection, field verification progress, and CCE yield estimation data
          </Typography>
        </Box>
        <ExportButtons title="Key Plot CCE Progress Report" headers={exportHeaders} data={exportRows} fileName="key_plot_cce_report" />
      </Box>

      <FilterToolbar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Total Monitored Zones
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A" my={1}>
                {zones.length || 10}
              </Typography>
              <Typography variant="caption" color="text.secondary">Active Zones</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Target Key Plots
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#2563EB" my={1}>
                100
              </Typography>
              <Typography variant="caption" color="text.secondary">Season Target</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #DCFCE7', bg: '#F0FDF4', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#15803D">
                Completed CCE Plots
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#16A34A" my={1}>
                100
              </Typography>
              <Typography variant="caption" color="#15803D" fontWeight={600}>100% Target Met</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Pending Plots
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#64748B" my={1}>
                0
              </Typography>
              <Typography variant="caption" color="text.secondary">0 Outstanding</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #FEE2E2', bg: '#FEF2F2', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#991B1B">
                Rejected Plots
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#DC2626" my={1}>
                3
              </Typography>
              <Typography variant="caption" color="#B91C1C" fontWeight={600}>Quality Audit Flag</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Zone-wise Key Plot Progress */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.5}>
          Zone-wise Key Plot Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Field completion status and validation progress for each agricultural zone
        </Typography>

        <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Zone Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Progress Bar</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Completed / Target</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Completion %</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.map((z) => {
                const target = 100;
                const completed = z.achievement === 100 ? 100 : Math.round(z.achievement);
                const isRejected = z.zone === 'Zone 102';

                return (
                  <TableRow key={z.zone} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                        {z.zone}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '40%' }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={z.achievement}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: '#F1F5F9',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: z.achievement === 100 ? '#16A34A' : z.achievement >= 80 ? '#D97706' : '#DC2626',
                                borderRadius: 5
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {completed} / {target}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={800} color={z.achievement === 100 ? '#16A34A' : '#D97706'}>
                        {z.achievement}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {isRejected ? (
                        <Chip label="3 Rejected" size="small" color="error" sx={{ fontWeight: 700 }} />
                      ) : (
                        <StatusBadge percentage={z.achievement} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

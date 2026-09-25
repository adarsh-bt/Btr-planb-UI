import React, { useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';

import { CROPS_MASTER, DISTRICTS_MASTER } from '../productionEstimationService';

const ReportsSummaryView = ({ estimations = [] }) => {
  // Crop-wise aggregated report data
  const cropReports = useMemo(() => {
    return CROPS_MASTER.map((c) => {
      const matchEsts = estimations.filter((e) => e.crop === c.id);
      const totalEstimatedArea = matchEsts.reduce((sum, e) => sum + (e.estimatedArea || 0), 0);
      const totalCceArea = matchEsts.reduce((sum, e) => sum + (e.cceArea || 0), 0);
      const totalProduction = matchEsts.reduce((sum, e) => sum + (e.estimatedProduction || 0), 0);
      const approvedCount = matchEsts.filter((e) => e.status === 'Approved — Final').length;

      return {
        crop: c.label,
        category: c.category,
        count: matchEsts.length,
        totalEstimatedArea,
        totalCceArea,
        totalProduction,
        unit: c.yieldUnit.includes('Nuts') ? 'Thousand Nuts' : 'Metric Tonnes (MT)',
        approvedCount
      };
    });
  }, [estimations]);

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="success" /> Agricultural Production Summary Reports
          </Typography>

          <Button variant="contained" color="success" startIcon={<DownloadIcon />} sx={{ fontWeight: 'bold' }}>
            Export Report (PDF / Excel)
          </Button>
        </Box>

        {/* Crop-wise Summary Table */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b', mb: 1.5 }}>
          1. Crop-wise Aggregated Production & Area Metrics
        </Typography>

        <TableContainer sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Crop Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Crop Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Records Count</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Estimated Area (ha)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total CCE Area (ha)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Estimated Production</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Approved Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cropReports.map((row) => (
                <TableRow key={row.crop} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row.crop}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell align="right">{row.count}</TableCell>
                  <TableCell align="right">{row.totalEstimatedArea.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right">{row.totalCceArea.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#16a34a' }}>
                    {row.totalProduction.toLocaleString('en-IN')} {row.unit}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={`${row.approvedCount} Approved`} color={row.approvedCount > 0 ? 'success' : 'default'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ReportsSummaryView;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';

import { BarChart } from '@mui/x-charts/BarChart';
import AdvancedForecastService from './advancedForecastService';

const ForecastSummaryView = ({ userJurisdiction }) => {
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = AdvancedForecastService.getSubmissions(userJurisdiction);
    setSubmissions(data);
  }, [userJurisdiction]);

  // Aggregated crop statistics for chart & overview
  const cropStats = useMemo(() => {
    const map = {};

    submissions.forEach((item) => {
      const crop = item.crop || 'Other';
      if (!map[crop]) {
        map[crop] = {
          crop,
          curArea: 0,
          prevArea: 0,
          curYield: 0,
          prevYield: 0,
          count: 0
        };
      }
      map[crop].curArea += parseFloat(item.currentYearArea) || 0;
      map[crop].prevArea += parseFloat(item.previousYearArea) || 0;
      map[crop].curYield += parseFloat(item.currentYearYield) || 0;
      map[crop].prevYield += parseFloat(item.previousYearYield) || 0;
      map[crop].count += 1;
    });

    return Object.values(map).map((c) => ({
      ...c,
      avgCurYield: c.count > 0 ? (c.curYield / c.count).toFixed(2) : '0',
      avgPrevYield: c.count > 0 ? (c.prevYield / c.count).toFixed(2) : '0',
      curArea: parseFloat(c.curArea.toFixed(2)),
      prevArea: parseFloat(c.prevArea.toFixed(2))
    }));
  }, [submissions]);

  // Top summary totals
  const totals = useMemo(() => {
    const totalArea = submissions.reduce((sum, s) => sum + (parseFloat(s.currentYearArea) || 0), 0);
    const prevTotalArea = submissions.reduce((sum, s) => sum + (parseFloat(s.previousYearArea) || 0), 0);
    const approvedCount = submissions.filter((s) => s.status === 'Approved').length;
    const approvalRate = submissions.length > 0 ? ((approvedCount / submissions.length) * 100).toFixed(0) : '0';

    return {
      totalArea: totalArea.toFixed(2),
      prevTotalArea: prevTotalArea.toFixed(2),
      approvalRate,
      recordCount: submissions.length
    };
  }, [submissions]);

  // Chart dataset
  const chartDataset = useMemo(() => {
    return cropStats.slice(0, 6).map((c) => ({
      crop: c.crop,
      currentYear: c.curArea,
      previousYear: c.prevArea
    }));
  }, [cropStats]);

  // Filtered table rows
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm) return submissions;
    const q = searchTerm.toLowerCase();
    return submissions.filter(
      (s) =>
        s.panchayat.toLowerCase().includes(q) ||
        s.crop.toLowerCase().includes(q) ||
        s.season.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [submissions, searchTerm]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'District',
      'Taluk',
      'Block',
      'Panchayat',
      'Village',
      'Season',
      'Crop',
      'Variety',
      'Current Area (ha)',
      'Previous Area (ha)',
      'Current Yield (t/ha)',
      'Previous Yield (t/ha)',
      'Status'
    ];

    const rows = submissions.map((s) => [
      s.id,
      s.district,
      s.taluk,
      s.block,
      s.panchayat,
      s.village,
      s.season,
      s.crop,
      s.variety || '',
      s.currentYearArea,
      s.previousYearArea,
      s.currentYearYield,
      s.previousYearYield,
      s.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Forecast_Advance_Estimates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Top Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#fff'
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Total Forecasted Area
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, color: '#38bdf8' }}>
                {totals.totalArea} <Typography component="span" variant="subtitle1" sx={{ color: '#94a3b8' }}>ha</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: '#4ade80', mt: 1, display: 'block' }}>
                vs {totals.prevTotalArea} ha previous year
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff'
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Total Crops Covered
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {cropStats.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
                Major: Paddy, Tapioca, Coconut
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#fff'
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Block Approval Rate
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totals.approvalRate}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
                Across zone submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
              color: '#fff'
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Total Field Submissions
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totals.recordCount}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
                {userJurisdiction.district} District
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Interactive Crop Area Comparison Chart */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#0284c7', fontSize: '1.8rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              Crop Area Comparison (Current Year vs Previous Year)
            </Typography>
          </Box>
          <Chip label="Forecast &amp; Advance Estimates" color="primary" size="small" variant="outlined" />
        </Box>

        {chartDataset.length > 0 ? (
          <Box sx={{ width: '100%', height: 350 }}>
            <BarChart
              dataset={chartDataset}
              xAxis={[{ scaleType: 'band', dataKey: 'crop' }]}
              series={[
                { dataKey: 'currentYear', label: 'Current Year Area (ha)', color: '#0284c7' },
                { dataKey: 'previousYear', label: 'Previous Year Area (ha)', color: '#94a3b8' }
              ]}
              height={320}
              borderRadius={8}
            />
          </Box>
        ) : (
          <Typography color="textSecondary" align="center" sx={{ py: 5 }}>
            No data available for chart visualization.
          </Typography>
        )}
      </Paper>

      {/* Abstract Data Table & CSV Export */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
            Forecast &amp; Advance Estimates Abstract Records
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search Panchayat, Crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ width: 250 }}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#1e293b' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Record ID</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Panchayat</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Season</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Crop &amp; Variety</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Area (ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Prev Area (ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Current Yield (t/ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Prev Yield (t/ha)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No records found matching search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.panchayat}</TableCell>
                    <TableCell>{row.season}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.crop}
                      </Typography>
                      {row.variety && (
                        <Typography variant="caption" color="textSecondary">
                          {row.variety}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {row.currentYearArea}
                    </TableCell>
                    <TableCell align="right">{row.previousYearArea}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {row.currentYearYield}
                    </TableCell>
                    <TableCell align="right">{row.previousYearYield}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === 'Approved'
                            ? 'success'
                            : row.status === 'Clarification Needed'
                            ? 'warning'
                            : 'info'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ForecastSummaryView;

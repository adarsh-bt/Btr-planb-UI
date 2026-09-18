import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Stack
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterToolbar from 'components/common/FilterToolbar';
import ExportButtons from 'components/common/ExportButtons';
import { REPORT_TYPES, generateReportData } from 'api/reportsApi';

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState('user-submission');
  const [filters, setFilters] = useState({
    year: '2026-27',
    month: 'August 2026',
    district: 'All',
    taluk: 'All',
    zone: 'All'
  });

  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = () => {
    setLoading(true);
    generateReportData(selectedReportType, filters).then((data) => {
      setReportResult(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchReport();
  }, [selectedReportType]);

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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            Government Enterprise Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate, preview, and export field activity monitoring reports into Excel and PDF formats
          </Typography>
        </Box>
      </Box>

      {/* Report Selection Card */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="report-type-label">Select Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                value={selectedReportType}
                label="Select Report Type"
                onChange={(e) => setSelectedReportType(e.target.value)}
                sx={{ backgroundColor: '#FAFAFA', fontWeight: 600 }}
              >
                {REPORT_TYPES.map((rep) => (
                  <MenuItem key={rep.id} value={rep.id}>
                    {rep.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={fetchReport}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 3 }}
              >
                Generate Report
              </Button>
              {reportResult && (
                <ExportButtons
                  title={reportResult.title}
                  headers={reportResult.headers}
                  data={reportResult.rows}
                  fileName={selectedReportType}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Global Filter Toolbar */}
      <FilterToolbar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

      {/* Preview Section */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            {reportResult?.title || 'Report Preview'}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Showing top preview rows
          </Typography>
        </Box>

        <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                {(reportResult?.headers || []).map((h, i) => (
                  <TableCell key={i} sx={{ fontWeight: 700, color: '#334155' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(!reportResult || reportResult.rows.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={reportResult?.headers?.length || 5} align="center" sx={{ py: 4, color: '#64748B' }}>
                    No report data available for selected filters. Click "Generate Report".
                  </TableCell>
                </TableRow>
              ) : (
                reportResult.rows.map((row, rIdx) => (
                  <TableRow key={rIdx} hover>
                    {row.map((cell, cIdx) => (
                      <TableCell key={cIdx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

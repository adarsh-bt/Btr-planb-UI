import React, { useState, useMemo } from 'react';
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
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ProductionEstimationService, {
  DEFECT_SEVERITIES,
  DEFECT_STATUSES,
  DISTRICTS_MASTER
} from '../productionEstimationService';

const SEVERITY_COLOR_MAP = {
  Critical: 'error',
  High: 'warning',
  Medium: 'info',
  Low: 'default'
};

const STATUS_COLOR_MAP = {
  Open: 'error',
  'Under Correction': 'warning',
  Resolved: 'success',
  Rejected: 'default',
  Closed: 'success'
};

const DefectDashboardView = ({
  defects = [],
  onOpenMarkDefect,
  onSelectEstimationById,
  activeUser = 'User',
  activeRole = 'Reviewer'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [selectedDefectModal, setSelectedDefectModal] = useState(null);

  // Defect KPI statistics
  const kpis = useMemo(() => {
    return {
      total: defects.length,
      critical: defects.filter((d) => d.severity === 'Critical').length,
      open: defects.filter((d) => d.status === 'Open').length,
      underCorrection: defects.filter((d) => d.status === 'Under Correction').length,
      resolved: defects.filter((d) => d.status === 'Resolved' || d.status === 'Closed').length
    };
  }, [defects]);

  // Filtered Defects List
  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      const matchesSearch =
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.estimationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchesDistrict = districtFilter === 'ALL' || d.district === districtFilter;

      return matchesSearch && matchesSeverity && matchesStatus && matchesDistrict;
    });
  }, [defects, searchQuery, severityFilter, statusFilter, districtFilter]);

  const handleStatusChange = (defectId, newStatus) => {
    ProductionEstimationService.updateDefectStatus(defectId, newStatus, activeUser, activeRole);
    setSelectedDefectModal(null);
  };

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Defects', count: kpis.total, color: '#e11d48', bg: '#fff1f2' },
          { title: 'Critical Severity', count: kpis.critical, color: '#dc2626', bg: '#fef2f2' },
          { title: 'Open Defects', count: kpis.open, color: '#ea580c', bg: '#fff7ed' },
          { title: 'Under Correction', count: kpis.underCorrection, color: '#d97706', bg: '#fffbeb' },
          { title: 'Resolved & Closed', count: kpis.resolved, color: '#16a34a', bg: '#f0fdf4' }
        ].map((kpi, idx) => (
          <Grid item xs={6} sm={4} md={2.4} key={idx}>
            <Card sx={{ borderRadius: 3, bgcolor: kpi.bg, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#64748b', textTransform: 'uppercase' }}>
                  {kpi.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: kpi.color, mt: 0.5 }}>
                  {kpi.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Defects Data Table */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportProblemIcon color="error" /> Defect Identification & Resolution Tracker
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search Defect ID, Estimation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              select
              size="small"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="ALL">All Severities</MenuItem>
              {DEFECT_SEVERITIES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              {DEFECT_STATUSES.map((st) => (
                <MenuItem key={st} value={st}>{st}</MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              color="error"
              startIcon={<AddIcon />}
              onClick={() => onOpenMarkDefect(null)}
              sx={{ fontWeight: 'bold' }}
            >
              + Mark Defect
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Defect ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estimation ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category & Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location & Crop</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Identified By</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDefects.map((def) => (
                <TableRow key={def.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', color: '#dc2626' }}>{def.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0284c7', cursor: 'pointer' }} onClick={() => onSelectEstimationById(def.estimationId)}>
                    {def.estimationId}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{def.category}</Typography>
                    <Typography variant="caption" color="textSecondary">{def.type}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{def.district} → {def.block}</Typography>
                    <Typography variant="caption" color="textSecondary">{def.crop}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={def.severity} color={SEVERITY_COLOR_MAP[def.severity] || 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={def.status} color={STATUS_COLOR_MAP[def.status] || 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">{def.identifiedBy}</Typography>
                    <Typography variant="caption" color="textSecondary">{def.identifiedDate}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => setSelectedDefectModal(def)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDefects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    No defect records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Defect Details Modal */}
      {selectedDefectModal && (
        <Dialog open={Boolean(selectedDefectModal)} onClose={() => setSelectedDefectModal(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#dc2626' }}>
            Defect Details — {selectedDefectModal.id}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">ESTIMATION ID</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedDefectModal.estimationId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">SEVERITY / STATUS</Typography>
                <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                  <Chip label={selectedDefectModal.severity} color={SEVERITY_COLOR_MAP[selectedDefectModal.severity]} size="small" />
                  <Chip label={selectedDefectModal.status} color={STATUS_COLOR_MAP[selectedDefectModal.status]} size="small" />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">DEFECT CATEGORY</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedDefectModal.category}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">DESCRIPTION</Typography>
                <Typography variant="body2" sx={{ bgcolor: '#fef2f2', p: 1.5, borderRadius: 2, border: '1px solid #fca5a5' }}>
                  {selectedDefectModal.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">RECOMMENDED CORRECTION</Typography>
                <Typography variant="body2" sx={{ bgcolor: '#f0fdf4', p: 1.5, borderRadius: 2, border: '1px solid #bbf7d0' }}>
                  {selectedDefectModal.recommendedCorrection}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedDefectModal(null)}>Close</Button>
            {selectedDefectModal.status !== 'Resolved' && (
              <Button variant="contained" color="success" onClick={() => handleStatusChange(selectedDefectModal.id, 'Resolved')}>
                Mark Resolved
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default DefectDashboardView;

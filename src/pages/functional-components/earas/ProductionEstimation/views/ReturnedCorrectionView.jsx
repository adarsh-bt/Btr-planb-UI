import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import EditIcon from '@mui/icons-material/Edit';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ReturnedCorrectionView = ({ estimations = [], onEditEstimation, onViewDefects }) => {
  const returnedEstimations = estimations.filter(
    (e) => e.status.includes('Returned') || e.status === 'Correction Required'
  );

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReplayIcon color="error" /> Returned Estimations — Correction Queue
          </Typography>

          <Button variant="outlined" color="error" startIcon={<ReportProblemIcon />} onClick={onViewDefects}>
            View Active Defects
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Estimations Returned for Revision
          </Typography>
          <Typography variant="caption">
            Review reviewer remarks and defect notices below. Edit data values to correct discrepancies and click "Submit to Verifier 1" to re-initiate verification.
          </Typography>
        </Alert>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Estimation ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Geography & Crop</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Returned By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Defects Marked</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reviewer Remarks</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {returnedEstimations.map((row) => {
                const lastHistory = row.workflowTimeline[row.workflowTimeline.length - 1];
                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: '#dc2626' }}>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{row.crop}</Typography>
                      <Typography variant="caption" color="textSecondary">{row.district} → {row.block} → {row.panchayath}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.status} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${row.defectsCount} Defect(s)`} color={row.hasDefects ? 'error' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#475569' }}>
                        "{lastHistory?.remarks || 'Correction required.'}"
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => onEditEstimation(row)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Edit & Correct
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {returnedEstimations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    No returned estimations requiring correction at this time.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ReturnedCorrectionView;

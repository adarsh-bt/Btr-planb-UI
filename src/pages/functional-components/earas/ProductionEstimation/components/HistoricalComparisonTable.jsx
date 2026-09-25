import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const HistoricalComparisonTable = ({
  currentEstimate = 0,
  prevEstimate = 0,
  unit = 'Metric Tonnes (MT)',
  crop = 'Paddy'
}) => {
  const curr = parseFloat(currentEstimate) || 0;
  const prev = parseFloat(prevEstimate) || 0;
  const diff = curr - prev;
  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';
  const isGrowth = diff >= 0;

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0f172a', mb: 1.5 }}>
        Historical Production Comparison ({crop})
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Period / Season</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Production ({unit})</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Change</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Growth Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Previous Season / Year (Historical Baseline)</TableCell>
              <TableCell align="right">{prev.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">—</TableCell>
              <TableCell align="center"><Chip label="Baseline" size="small" variant="outlined" /></TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: '#f0fdf4' }}>
              <TableCell sx={{ fontWeight: 'bold', color: '#166534' }}>Current Production Estimate</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#166534' }}>{curr.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: isGrowth ? '#15803d' : '#b91c1c' }}>
                {isGrowth ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
              </TableCell>
              <TableCell align="center">
                <Chip
                  icon={isGrowth ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${isGrowth ? '+' : ''}${pct}%`}
                  color={isGrowth ? 'success' : 'error'}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HistoricalComparisonTable;

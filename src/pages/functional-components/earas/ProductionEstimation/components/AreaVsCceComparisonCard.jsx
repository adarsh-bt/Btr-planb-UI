import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Paper
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const AreaVsCceComparisonCard = ({ estimatedArea = 0, cceArea = 0, unit = 'Hectares', cceObservationsCount = 0 }) => {
  const est = parseFloat(estimatedArea) || 0;
  const cce = parseFloat(cceArea) || 0;

  const diff = Math.abs(est - cce);
  const variancePct = cce > 0 ? ((diff / cce) * 100).toFixed(2) : '0.00';
  const isHighVariance = parseFloat(variancePct) > 5.0;

  // Percentage ratio for progress bar
  const maxVal = Math.max(est, cce, 1);
  const estPct = Math.min((est / maxVal) * 100, 100);
  const ccePct = Math.min((cce / maxVal) * 100, 100);

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a' }}>
            Area Estimation vs CCE Area Comparison
          </Typography>
          <Chip
            icon={isHighVariance ? <WarningAmberIcon /> : <CheckCircleOutlineIcon />}
            label={`Variance: ${variancePct}% ${isHighVariance ? '(High Deviation Alert)' : '(Normal)'}`}
            color={isHighVariance ? 'error' : 'success'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Grid container spacing={2}>
          {/* Estimated Area Metric */}
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Estimated Area
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#0284c7', my: 0.5 }}>
                {est.toLocaleString('en-IN')} <Typography component="span" variant="subtitle2">{unit}</Typography>
              </Typography>
              <LinearProgress variant="determinate" value={estPct} sx={{ height: 6, borderRadius: 3, bgcolor: '#e0f2fe' }} />
            </Paper>
          </Grid>

          {/* CCE Area Metric */}
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase' }}>
                CCE Area (Form 1 Verified)
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#16a34a', my: 0.5 }}>
                {cce.toLocaleString('en-IN')} <Typography component="span" variant="subtitle2">{unit}</Typography>
              </Typography>
              <LinearProgress variant="determinate" value={ccePct} color="success" sx={{ height: 6, borderRadius: 3, bgcolor: '#dcfce7' }} />
              {cceObservationsCount > 0 && (
                <Typography variant="caption" sx={{ color: '#166534', mt: 0.5, display: 'block', fontWeight: '500' }}>
                  Based on {cceObservationsCount} CCE plot cuts
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Difference & Variance Metric */}
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: isHighVariance ? '#fef2f2' : '#f8fafc', border: `1px solid ${isHighVariance ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: isHighVariance ? '#b91c1c' : '#475569', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Variance / Difference
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: isHighVariance ? '#dc2626' : '#334155', my: 0.5 }}>
                {diff.toFixed(2)} <Typography component="span" variant="subtitle2">{unit}</Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: isHighVariance ? '#991b1b' : '#64748b', fontWeight: 'bold' }}>
                {est >= cce ? `Estimated is +${variancePct}% higher` : `Estimated is -${variancePct}% lower`}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AreaVsCceComparisonCard;

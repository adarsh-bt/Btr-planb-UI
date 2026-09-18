import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getMonthlyAdvanceVsActual } from 'api/dashboardApi';

export default function MonthlyAdvanceVsActualChart({ selectedMonth = 'August 2026' }) {
  const [metric, setMetric] = useState('tourDiary');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getMonthlyAdvanceVsActual(metric).then((data) => {
      if (isMounted) {
        setChartData(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [metric]);

  // Current Month summary calculation (find month in dataset, e.g. August)
  const currentMonthName = selectedMonth.split(' ')[0] || 'August';
  const currentMonthData = chartData.find((d) => d.month.toLowerCase() === currentMonthName.toLowerCase()) || chartData[4] || {
    advance: 1800,
    actual: 1450,
    achievement: 81,
    variance: -350
  };

  const metricLabels = {
    tourDiary: 'Tour Diary',
    actualTour: 'Actual Tour',
    workAllocation: 'Work Allocation',
    keyPlot: 'Key Plot'
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3.5,
        borderRadius: 2.5,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* Header & Metric Selector */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2.5}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Monthly Advance vs Actual
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comparative performance across financial year months ({metricLabels[metric]})
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA', fontWeight: 600 }}
          >
            <MenuItem value="tourDiary">Tour Diary</MenuItem>
            <MenuItem value="actualTour">Actual Tour</MenuItem>
            <MenuItem value="workAllocation">Work Allocation</MenuItem>
            <MenuItem value="keyPlot">Key Plot</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Box above Chart */}
      <Box mb={3} p={2} sx={{ backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Typography variant="caption" fontWeight={700} color="#64748B" textTransform="uppercase" letterSpacing={0.5}>
          {currentMonthName} 2026 Summary ({metricLabels[metric]})
        </Typography>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Advance Target
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              {currentMonthData.advance?.toLocaleString() || 0}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Actual Submitted
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#2563EB">
              {currentMonthData.actual?.toLocaleString() || 0}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Achievement Rate
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={currentMonthData.achievement >= 90 ? '#16A34A' : currentMonthData.achievement >= 70 ? '#D97706' : '#DC2626'}
            >
              {currentMonthData.achievement}%
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Variance
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={currentMonthData.variance < 0 ? '#DC2626' : '#16A34A'}
            >
              {currentMonthData.variance > 0 ? `+${currentMonthData.variance}` : currentMonthData.variance}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Recharts Bar Chart */}
      <Box sx={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '8px',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              formatter={(value, name) => [`${value?.toLocaleString()}`, name === 'advance' ? 'Advance Planned' : 'Actual Submitted']}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="advance" name="Advance Planned" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="actual" name="Actual Submitted" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

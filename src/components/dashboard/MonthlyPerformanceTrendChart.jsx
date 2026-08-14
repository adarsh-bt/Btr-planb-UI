import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getMonthlyTrend } from 'api/dashboardApi';

export default function MonthlyPerformanceTrendChart() {
  const [metric, setMetric] = useState('overall');
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    getMonthlyTrend().then((data) => setTrendData(data));
  }, []);

  const metricColors = {
    tourDiary: '#D97706',
    actualTour: '#2563EB',
    workAllocation: '#16A34A',
    keyPlot: '#047857',
    overall: '#7C3AED'
  };

  const metricLabels = {
    tourDiary: 'Tour Diary %',
    actualTour: 'Actual Tour %',
    workAllocation: 'Work Allocation %',
    keyPlot: 'Key Plot %',
    overall: 'Overall Trend %'
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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2.5}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Monthly Achievement Trend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Achievement percentage progress over time
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA', fontWeight: 600 }}
          >
            <MenuItem value="overall">Overall Trend</MenuItem>
            <MenuItem value="tourDiary">Tour Diary</MenuItem>
            <MenuItem value="actualTour">Actual Tour</MenuItem>
            <MenuItem value="workAllocation">Work Allocation</MenuItem>
            <MenuItem value="keyPlot">Key Plot</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
            <YAxis domain={[50, 100]} tick={{ fill: '#64748B', fontSize: 12 }} unit="%" axisLine={{ stroke: '#E2E8F0' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '8px',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              formatter={(value, name) => [`${value}%`, metricLabels[name] || name]}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {metric === 'overall' ? (
              <>
                <Line type="monotone" dataKey="tourDiary" name="Tour Diary" stroke="#D97706" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="actualTour" name="Actual Tour" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="workAllocation" name="Work Allocation" stroke="#16A34A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="overall" name="Overall" stroke="#7C3AED" strokeWidth={3} dot={{ r: 5 }} />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey={metric}
                name={metricLabels[metric]}
                stroke={metricColors[metric]}
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

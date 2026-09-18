import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel
} from '@mui/material';
import StatusBadge from 'components/common/StatusBadge';

export default function ZonePerformanceTable({ zoneData = [] }) {
  const [orderBy, setOrderBy] = useState('achievement');
  const [order, setOrder] = useState('desc');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...zoneData].sort((a, b) => {
    let aVal = a[orderBy];
    let bVal = b[orderBy];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (bVal < aVal) return order === 'asc' ? 1 : -1;
    if (bVal > aVal) return order === 'asc' ? -1 : 1;
    return 0;
  });

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Zone Performance & Work Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zonal metrics, completed vs advance targets, and low-performing zone highlights
          </Typography>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                <TableSortLabel
                  active={orderBy === 'zone'}
                  direction={orderBy === 'zone' ? order : 'asc'}
                  onClick={() => handleSort('zone')}
                >
                  Zone
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>
                <TableSortLabel
                  active={orderBy === 'users'}
                  direction={orderBy === 'users' ? order : 'asc'}
                  onClick={() => handleSort('users')}
                >
                  Users
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Advance</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Actual</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>
                <TableSortLabel
                  active={orderBy === 'achievement'}
                  direction={orderBy === 'achievement' ? order : 'asc'}
                  onClick={() => handleSort('achievement')}
                >
                  Achievement
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Tour Diary</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Actual Tour</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Work Allocation</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Key Plot</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((z) => {
              const isLowPerforming = z.achievement < 80;
              return (
                <TableRow
                  key={z.zone}
                  hover
                  sx={{
                    backgroundColor: isLowPerforming ? '#FEF2F2' : 'inherit',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700} color={isLowPerforming ? '#DC2626' : '#0F172A'}>
                      {z.zone}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{z.users}</TableCell>
                  <TableCell align="right">{z.advance}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#2563EB' }}>{z.actual}</TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={800} color={z.achievement >= 90 ? '#16A34A' : z.achievement >= 70 ? '#D97706' : '#DC2626'}>
                      {z.achievement}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{z.tourDiary}</TableCell>
                  <TableCell align="center">{z.actualTour}</TableCell>
                  <TableCell align="center">{z.workAllocation}</TableCell>
                  <TableCell align="center">{z.keyPlot}</TableCell>
                  <TableCell align="center">
                    <StatusBadge percentage={z.achievement} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

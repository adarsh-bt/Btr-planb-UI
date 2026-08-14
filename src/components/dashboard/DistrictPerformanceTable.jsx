import React from 'react';
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
  Button,
  Tooltip
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StatusBadge from 'components/common/StatusBadge';

export default function DistrictPerformanceTable({ districtData = [], onSelectDistrict }) {
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
            District Performance Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comparative submission metrics across Kerala districts. Click any row to drill down into Taluks.
          </Typography>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>District</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Total Users</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Tour Diary</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Actual Tour</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Work Allocation</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Key Plot</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Overall Achievement</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Drill-down</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {districtData.map((d) => (
              <TableRow
                key={d.id || d.district}
                hover
                onClick={() => onSelectDistrict && onSelectDistrict(d.district)}
                sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                    {d.district}
                  </Typography>
                </TableCell>
                <TableCell align="right">{d.totalUsers}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>{d.tourDiary}%</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>{d.actualTour}%</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>{d.workAllocation}%</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>{d.keyPlot}%</TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={800} color={d.overallAchievement >= 90 ? '#16A34A' : '#D97706'}>
                    {d.overallAchievement}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <StatusBadge percentage={d.overallAchievement} />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={`Drill down to ${d.district} Taluks`}>
                    <Button size="small" endIcon={<ChevronRightIcon />} sx={{ textTransform: 'none', fontWeight: 600 }}>
                      View Taluks
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

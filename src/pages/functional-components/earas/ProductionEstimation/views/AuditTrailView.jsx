import React, { useState } from 'react';
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
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';

import ProductionEstimationService from '../productionEstimationService';

const AuditTrailView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const logs = ProductionEstimationService.getAuditTrail();

  const filteredLogs = logs.filter(
    (l) =>
      l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" /> System-Wide Audit Trail & Activity Logs
          </Typography>

          <TextField
            size="small"
            placeholder="Search Target ID, User, Action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 260 }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Log ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>User & Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action Taken</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Target ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Details & Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>{log.id}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{log.user}</Typography>
                    <Typography variant="caption" color="textSecondary">{log.role}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#0284c7' }}>{log.target}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{log.details}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                    No audit logs recorded matching search criteria.
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

export default AuditTrailView;

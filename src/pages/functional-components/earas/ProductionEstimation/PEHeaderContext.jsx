import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Badge,
  Button,
  Stack
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import RefreshIcon from '@mui/icons-material/Refresh';
import AgricultureIcon from '@mui/icons-material/Agriculture';

import ProductionEstimationService, {
  WORKFLOW_ROLES,
  FINANCIAL_YEARS,
  SEASONS_MASTER
} from './productionEstimationService';

const ROLE_COLOR_MAP = {
  'Production Estimator': '#0284c7',
  'Production Estimator Verifier 1': '#d97706',
  'Production Estimator Verifier 2': '#7c3aed',
  'EARAD Admin': '#059669',
  'Production Estimate Approver 2': '#c026d3',
  'Director / State Level Approver': '#dc2626'
};

const PEHeaderContext = ({
  activeRole,
  onRoleChange,
  financialYear,
  onYearChange,
  season,
  onSeasonChange,
  onOpenDefectsTab,
  onResetData
}) => {
  const defects = ProductionEstimationService.getDefects();
  const openDefectsCount = defects.filter((d) => d.status === 'Open' || d.status === 'Under Correction').length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Module Title */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <AgricultureIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff', letterSpacing: '-0.5px' }}>
                EARAS Production Estimation
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Agricultural Estimation & Reporting Portal • State of Kerala
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Role Switcher & Filters */}
        <Grid item xs={12} md={8}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" alignItems="center">
            {/* Year */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={financialYear}
                onChange={(e) => onYearChange(e.target.value)}
                sx={{
                  color: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                  '.MuiSvgIcon-root': { color: '#ffffff' },
                  fontSize: '0.85rem'
                }}
              >
                {FINANCIAL_YEARS.map((fy) => (
                  <MenuItem key={fy} value={fy}>
                    {fy}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Season */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={season}
                onChange={(e) => onSeasonChange(e.target.value)}
                sx={{
                  color: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                  '.MuiSvgIcon-root': { color: '#ffffff' },
                  fontSize: '0.85rem'
                }}
              >
                {SEASONS_MASTER.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Interactive Role Switcher */}
            <FormControl size="small" sx={{ minWidth: 230 }}>
              <Select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value)}
                renderValue={(val) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircleIcon sx={{ color: ROLE_COLOR_MAP[val] || '#38bdf8', fontSize: '1.2rem' }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#ffffff', fontSize: '0.85rem' }}>
                      {val}
                    </Typography>
                  </Box>
                )}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  borderRadius: 2,
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                  '.MuiSvgIcon-root': { color: '#ffffff' }
                }}
              >
                {WORKFLOW_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ROLE_COLOR_MAP[r] }} />
                      <Typography variant="body2" fontWeight={r === activeRole ? 'bold' : 'normal'}>
                        {r}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Open Defects Counter Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={onOpenDefectsTab}
              startIcon={
                <Badge badgeContent={openDefectsCount} color="error">
                  <ReportProblemIcon sx={{ color: '#f59e0b' }} />
                </Badge>
              }
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.25)',
                '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.15)' },
                px: 1.5,
                height: 38
              }}
            >
              Defects
            </Button>

            {/* Reset Demo Data Button */}
            <Button
              variant="text"
              size="small"
              onClick={onResetData}
              title="Reset Demo Data to Initial State"
              sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' }, minWidth: 'auto' }}
            >
              <RefreshIcon fontSize="small" />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PEHeaderContext;

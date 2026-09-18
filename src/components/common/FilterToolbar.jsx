import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { AGRICULTURAL_YEARS, MONTHS_LIST } from 'constants/config';
import { MOCK_DISTRICTS, MOCK_ZONES } from 'api/mockData';

export default function FilterToolbar({ filters, onFilterChange, onReset }) {
  // Dynamically populate available Taluks based on selected District
  const availableTaluks = useMemo(() => {
    if (!filters.district || filters.district === 'All') {
      // Gather all taluks across all districts
      const allT = new Set();
      MOCK_DISTRICTS.forEach((d) => d.taluks.forEach((t) => allT.add(t)));
      return Array.from(allT);
    }
    const matchedDist = MOCK_DISTRICTS.find((d) => d.name === filters.district);
    return matchedDist ? matchedDist.taluks : [];
  }, [filters.district]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.district && filters.district !== 'All') count++;
    if (filters.taluk && filters.taluk !== 'All') count++;
    if (filters.zone && filters.zone !== 'All') count++;
    if (filters.month && filters.month !== 'August 2026') count++;
    if (filters.year && filters.year !== '2026-27') count++;
    return count;
  }, [filters]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 3,
        borderRadius: 2.5,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.05)'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterAltOutlinedIcon sx={{ color: '#3B82F6' }} />
          <Typography variant="h6" fontWeight={700} color="#1E293B" sx={{ fontSize: '1rem' }}>
            Filter Options
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} Active`}
              size="small"
              color="primary"
              sx={{ height: 22, fontSize: '0.725rem', fontWeight: 700 }}
            />
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={onReset}
          startIcon={<RestartAltIcon />}
          sx={{
            borderColor: '#CBD5E1',
            color: '#475569',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' }
          }}
        >
          Reset Filters
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Agricultural Year */}
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel id="agri-year-label">Agricultural Year</InputLabel>
            <Select
              labelId="agri-year-label"
              id="agri-year-select"
              value={filters.year || '2026-27'}
              label="Agricultural Year"
              onChange={(e) => onFilterChange('year', e.target.value)}
              sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA' }}
            >
              {AGRICULTURAL_YEARS.map((yr) => (
                <MenuItem key={yr} value={yr}>
                  {yr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Month */}
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel id="month-label">Month</InputLabel>
            <Select
              labelId="month-label"
              id="month-select"
              value={filters.month || 'August 2026'}
              label="Month"
              onChange={(e) => onFilterChange('month', e.target.value)}
              sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA' }}
            >
              {MONTHS_LIST.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* District */}
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel id="district-label">District</InputLabel>
            <Select
              labelId="district-label"
              id="district-select"
              value={filters.district || 'All'}
              label="District"
              onChange={(e) => {
                onFilterChange('district', e.target.value);
                // Reset Taluk when District changes
                onFilterChange('taluk', 'All');
              }}
              sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA' }}
            >
              <MenuItem value="All">All Districts</MenuItem>
              {MOCK_DISTRICTS.map((d) => (
                <MenuItem key={d.id} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Taluk */}
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel id="taluk-label">Taluk</InputLabel>
            <Select
              labelId="taluk-label"
              id="taluk-select"
              value={filters.taluk || 'All'}
              label="Taluk"
              onChange={(e) => onFilterChange('taluk', e.target.value)}
              sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA' }}
            >
              <MenuItem value="All">All Taluks</MenuItem>
              {availableTaluks.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Zone */}
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel id="zone-label">Zone</InputLabel>
            <Select
              labelId="zone-label"
              id="zone-select"
              value={filters.zone || 'All'}
              label="Zone"
              onChange={(e) => onFilterChange('zone', e.target.value)}
              sx={{ borderRadius: 1.5, backgroundColor: '#FAFAFA' }}
            >
              <MenuItem value="All">All Zones</MenuItem>
              {MOCK_ZONES.map((z) => (
                <MenuItem key={z} value={z}>
                  {z}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}

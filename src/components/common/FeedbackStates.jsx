import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export function EmptyState({ message = 'No data available for the selected parameters.', onReset }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 2,
        border: '1px dashed #CBD5E1',
        my: 2
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 52, color: '#94A3B8', mb: 1 }} />
      <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
        No Submission Data Available
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 2.5 }}>
        {message}
      </Typography>
      {onReset && (
        <Button variant="outlined" color="primary" onClick={onReset} startIcon={<RefreshIcon />}>
          Reset Filters
        </Button>
      )}
    </Box>
  );
}

export function ErrorState({ message = 'Unable to load dashboard data.', onRetry }) {
  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 2,
        border: '1px solid #FCA5A5',
        my: 2
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: '#DC2626', mb: 1 }} />
      <Typography variant="h6" color="#991B1B" fontWeight={600} gutterBottom>
        Data Loading Error
      </Typography>
      <Typography variant="body2" color="#B91C1C" sx={{ maxWidth: 420, mx: 'auto', mb: 2.5 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" color="error" onClick={onRetry} startIcon={<RefreshIcon />}>
          Retry Request
        </Button>
      )}
    </Box>
  );
}

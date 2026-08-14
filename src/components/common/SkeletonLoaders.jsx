import React from 'react';
import { Card, CardContent, Skeleton, Box, Grid } from '@mui/material';

export function SkeletonCard() {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Skeleton variant="text" width="40%" height={36} />
        <Box mt={2}>
          <Skeleton variant="rectangular" height={8} borderRadius={4} />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1.5}>
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="text" width="40%" height={18} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <Box sx={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 2, p: 2, bg: '#fff' }}>
      <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

export function SkeletonChart({ height = 300 }) {
  return (
    <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none', p: 3 }}>
      <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
    </Card>
  );
}

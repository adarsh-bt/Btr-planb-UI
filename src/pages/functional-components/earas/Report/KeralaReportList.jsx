import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';

function KeralaStatsTable() {
  const theme = useTheme();
  
  const stats = {
    all: 5,
    completed: 1,
    ongoing: 2,
    notStarted: 1,
    underReview: 1
  };

  // Table data for districts (example data)
  const districtData = [
    { 
      id: 1,
      district: 'Thiruvananthapuram', 
      total: 1, 
      completed: 0, 
      ongoing: 1, 
      notStarted: 0, 
      underReview: 0,
      progress: 0
    },
    { 
      id: 2,
      district: 'Kollam', 
      total: 1, 
      completed: 0, 
      ongoing: 0, 
      notStarted: 1, 
      underReview: 0,
      progress: 0
    },
    { 
      id: 3,
      district: 'Pathanamthitta', 
      total: 1, 
      completed: 1, 
      ongoing: 0, 
      notStarted: 0, 
      underReview: 0,
      progress: 100
    },
    { 
      id: 4,
      district: 'Alappuzha', 
      total: 1, 
      completed: 0, 
      ongoing: 1, 
      notStarted: 0, 
      underReview: 0,
      progress: 50
    },
    { 
      id: 5,
      district: 'Kottayam', 
      total: 1, 
      completed: 0, 
      ongoing: 0, 
      notStarted: 0, 
      underReview: 1,
      progress: 75
    }
  ];

  const getStatusChip = (status) => {
    switch(status) {
      case 'completed':
        return <Chip size="small" label="Completed" color="success" icon={<CheckCircleIcon />} />;
      case 'ongoing':
        return <Chip size="small" label="On Going" color="primary" icon={<PendingIcon />} />;
      case 'notStarted':
        return <Chip size="small" label="Not Started" color="default" icon={<ScheduleIcon />} />;
      case 'underReview':
        return <Chip size="small" label="Under Review" color="warning" icon={<RateReviewIcon />} />;
      default:
        return null;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Header Section */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 35 }} />
              Kerala Project Statistics
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, color: 'text.secondary' }}>
              Overview of projects across districts in Kerala
            </Typography>
          </Box>
          <Chip 
            label="Last Updated: March 2024" 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
                  {stats.all}
                </Typography>
                <Typography variant="body2" sx={{ color: '#1565c0' }}>
                  Total Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#e8f5e8', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#fff3e0', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                  {stats.ongoing}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ed6c02' }}>
                  On Going
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#616161', fontWeight: 'bold' }}>
                  {stats.notStarted}
                </Typography>
                <Typography variant="body2" sx={{ color: '#616161' }}>
                  Not Started
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#fff8e1', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#b76e00', fontWeight: 'bold' }}>
                  {stats.underReview}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b76e00' }}>
                  Under Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Grid item xs={12}>
        <MainCard title="District-wise Project Status" secondary={<AssessmentIcon />}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#04255e' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>District</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Completed</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>On Going</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Not Started</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Under Review</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Progress</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {districtData.map((row) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: '#f5f5f5',
                        cursor: 'pointer'
                      },
                      transition: '0.2s'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {row.district}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={row.total} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      {row.completed > 0 ? (
                        <Chip 
                          label={row.completed} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      ) : row.completed}
                    </TableCell>
                    <TableCell align="center">
                      {row.ongoing > 0 ? (
                        <Chip 
                          label={row.ongoing} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      ) : row.ongoing}
                    </TableCell>
                    <TableCell align="center">
                      {row.notStarted > 0 ? (
                        <Chip 
                          label={row.notStarted} 
                          size="small" 
                          variant="outlined"
                        />
                      ) : row.notStarted}
                    </TableCell>
                    <TableCell align="center">
                      {row.underReview > 0 ? (
                        <Chip 
                          label={row.underReview} 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                      ) : row.underReview}
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={row.progress} 
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: row.progress === 100 ? '#2e7d32' : '#1976d2'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {row.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: '#04255e',
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Statistics">
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: '#04255e',
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
                          <BarChartIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Row */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Overall Status:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  {getStatusChip('completed')}
                  {getStatusChip('ongoing')}
                  {getStatusChip('notStarted')}
                  {getStatusChip('underReview')}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Overall Progress:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.completed / stats.all) * 100} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {((stats.completed / stats.all) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      </Grid>

      {/* Footer Note */}
      <Grid item xs={12}>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
          Showing data for {districtData.length} districts in Kerala • Total Projects: {stats.all}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default KeralaStatsTable;
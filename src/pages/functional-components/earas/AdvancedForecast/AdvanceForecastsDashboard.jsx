import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';

const AdvanceForecastsDashboard = ({ onSelectModule }) => {
  return (
    <Box sx={{ py: 2 }}>
      {/* Title & Subtitle */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Advance Forecasts &amp; Estimation
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
          Agricultural crop forecast collection, multi-tier supervisory verification, leading cultivator selections, and district approvals.
        </Typography>
      </Box>

      {/* Feature Cards Grid */}
      <Grid container spacing={3.5}>
        {/* Module Card 1: Forecast Estimate */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 4,
              border: '1.5px solid #0284c7',
              backgroundColor: '#ffffff',
              boxShadow: '0 12px 32px rgba(2, 132, 199, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 18px 40px rgba(2, 132, 199, 0.15)',
                borderColor: '#0369a1'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AgricultureIcon sx={{ fontSize: '2.5rem' }} />
                </Box>
                <Chip label="ACTIVE MODULE" color="primary" sx={{ fontWeight: 800, fontSize: '0.75rem' }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Forecast Estimate
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, minHeight: 48, lineHeight: 1.6 }}>
                Collect crop forecast data, perform Block-wise cultivator selection for Field Inspectors and TSOs (with flexible selection count), forward to Taluk Level Approvers, and complete District sanction workflows.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => onSelectModule('Forecast Estimate')}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                Open Forecast Estimate
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Module Card 2: Advance Estimation (Coming Soon) */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 4,
              border: '1px dashed #cbd5e1',
              backgroundColor: '#f8fafc',
              opacity: 0.85
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: '2.5rem' }} />
                </Box>
                <Chip icon={<LockIcon fontSize="small" />} label="COMING SOON" variant="outlined" sx={{ fontWeight: 700, color: '#64748b' }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 800, color: '#64748b', mb: 1 }}>
                Advance Estimation
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, minHeight: 48, lineHeight: 1.6 }}>
                Advanced statistical crop estimation workflow incorporating satellite crop signature analysis, remote sensing yield modelling, and automated district aggregation algorithms.
              </Typography>

              <Button
                variant="outlined"
                disabled
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '1rem'
                }}
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvanceForecastsDashboard;

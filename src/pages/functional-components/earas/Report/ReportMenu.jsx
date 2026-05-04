import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

function ReportMenu() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Report Menu
        </Typography>

        <MainCard title="">
          <Grid container spacing={4}>
            {/* Cluster Report Card */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/ClusterReport/Kerala"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  minHeight: '8rem',
                  background: 'linear-gradient(135deg, rgba(99, 155, 255, 0.45), rgb(51, 125, 253))',
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <AssessmentIcon
                  sx={{
                    fontSize: '5rem',
                    color: '#fff',
                    marginRight: '1rem',
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography
                      component="div"
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: '#fff' }}
                    >
                      Cluster Report
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            {/* Form Report Card */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/FormReport/Kerala"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  minHeight: '8rem',
                  background: 'linear-gradient(135deg, rgba(34, 193, 100, 0.45), rgb(30, 167, 86))',
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: '5rem',
                    color: '#fff',
                    marginRight: '1rem',
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography
                      component="div"
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: '#fff' }}
                    >
                      Form Report
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            {/* Form 5 */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/cce/Form5"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  minHeight: '8rem',
                  background: 'linear-gradient(135deg, rgba(34, 193, 100, 0.45), rgb(30, 167, 86))',
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: '5rem',
                    color: '#fff',
                    marginRight: '1rem',
                  }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography
                      component="div"
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: '#fff' }}
                    >
                      Form 5
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ReportMenu;
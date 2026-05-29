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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/kerala_cluster_report"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  borderRadius: '20px',
                  minHeight: '9rem',
                  background:
                    'linear-gradient(135deg, rgba(99, 155, 255, 0.9), rgb(51, 125, 253))',
                  transition: 'all 0.3s ease-in-out',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-5px) scale(1.02)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <AssessmentIcon
                  sx={{
                    fontSize: '4.5rem',
                    color: '#fff',
                    marginRight: '1rem',
                    opacity: 0.95,
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: {
                        xs: '1rem',
                        sm: '1rem',
                        md: '1.2em',
                      },
                      lineHeight: 1.4,
                      letterSpacing: '0.2x',
                      textShadow: '1px 1px 4px rgba(0,0,0,0.25)',
                      fontFamily: `'Poppins', sans-serif`,
                    }}
                  >
                    Cluster Formation
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500,
                      mt: 0.5,
                      fontSize: {
                        xs: '0.5m',
                        sm: '0.8m',
                      },
                      letterSpacing: '0.3px',
                      fontFamily: `'Poppins', sans-serif`,
                    }}
                  >
                    Progress Report
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/FormReport/Kerala"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  borderRadius: '20px',
                  minHeight: '9rem',
                  background:
                    'linear-gradient(135deg, rgba(215, 26, 67, 0.9), rgb(186, 54, 112))',
                  transition: 'all 0.3s ease-in-out',
                  boxShadow: '0 6px 15px rgba(152, 43, 43, 0.2)',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-5px) scale(1.02)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: '4.5rem',
                    color: '#fff',
                    marginRight: '1rem',
                    opacity: 0.95,
                  }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: {
                        xs: '1rem',
                        sm: '1rem',
                        md: '1.2em',
                      },
                      lineHeight: 1.4,
                      letterSpacing: '0.2x',
                      textShadow: '1px 1px 4px rgba(113, 65, 65, 0.25)',
                      fontFamily: `'Poppins', sans-serif`,
                    }}
                  >
                    Cluster Enumeration
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500,
                      mt: 0.5,
                      fontSize: {
                        xs: '0.5m',
                        sm: '0.8m',
                      },
                      letterSpacing: '0.3px',
                      fontFamily: `'Poppins', sans-serif`,
                    }}
                  >
                    Progress Report
                  </Typography>
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

            {/* Form 5 */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/cce/Form2"
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
                      Form 2
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
import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';

import { Link } from 'react-router-dom';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import { Approval } from '@mui/icons-material';

function ApprovalMenus() {
  const theme = useTheme();
  const role = authservice.getrole()?.trim();
  return (
    <Grid container spacing={3}>
      <Breadcrumb/>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Approval Management
        </Typography>
        <MainCard title="">
          <Grid container spacing={4}>
         {(role === 'IT Admin' || role === 'District Level Approver' || role === 'Taluk Level Approver')  && (
  <Grid item xs={12} sm={4} md={3} lg={3}>
    <Card
      component={Link}
      to="approvals"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        borderRadius: '1rem',
        minHeight: '8rem',
        background: 'linear-gradient(135deg, rgba(172, 99, 255, 0.45), rgba(129, 148, 255, 1))',
        transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: '5rem',
          height: '5rem',
          borderRadius: '.5rem',
          marginRight: '1rem',
        }}
        image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
        alt="Dashboard Icon"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
          <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
            User Approvals
          </Typography>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              color: '#f3f3f3',
              fontStyle: 'italic',
              fontWeight: 'lighter',
              marginTop: '0.5rem',
            }}
          ></Typography>
        </CardContent>
      </Box>
    </Card>
  </Grid>
    )}

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                component={Link}
                to="cluster_approvals"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  minHeight: '8rem',
                  background: 'linear-gradient(135deg, rgba(68, 219, 199, 0.45), rgba(57, 169, 189, 1))',
                  // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5rem',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Zone Cluster Approvals
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{
                        color: '#f3f3f3',
                        fontStyle: 'italic',
                        fontWeight: 'lighter',
                        marginTop: '0.5rem'
                      }}
                    >
                     
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
{/* 
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  minHeight: '8rem',
                  background: 'linear-gradient(135deg, rgba(180, 146, 254, 0.45), rgb(155, 120, 250))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Scheme 4
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{
                        color: '#f3f3f3',
                        fontStyle: 'italic',
                        fontWeight: 'lighter',
                        marginTop: '0.5rem'
                      }}
                    >
                      --- ----
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '1rem',
                  minHeight: '8rem',
                  background: 'linear-gradient(135deg, rgba(180, 146, 254, 0.45), rgb(155, 120, 250))', // Gradient color
                  transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
                  '&:hover': {
                    transform: 'scale(1.05)', // Hover scale effect
                    // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' // Stronger shadow on hover
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '.5',
                    marginRight: '1rem' // Space between image and text
                  }}
                  image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
                  alt="Dashboard Icon"
                />

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
                    <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Scheme 4
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      sx={{
                        color: '#f3f3f3',
                        fontStyle: 'italic',
                        fontWeight: 'lighter',
                        marginTop: '0.5rem'
                      }}
                    >
                      --- ----
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid> */}
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ApprovalMenus;

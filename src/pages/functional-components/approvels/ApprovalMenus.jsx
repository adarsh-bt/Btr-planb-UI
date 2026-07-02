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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

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
{(role === 'IT Admin' || role === 'District Level Approver' || role === 'Taluk Level Approver') && (
  
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="approvals"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '1.2rem', sm: '1.5rem' },
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #AC63FF 0%, #8194FF 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: { xs: '120px', sm: '130px' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transition: 'left 0.5s ease',
        },
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
          '&::before': { left: '100%' },
        },
      }}
    >
      <Box
        sx={{
          width: { xs: '4rem', sm: '5rem' },
          height: { xs: '4rem', sm: '5rem' },
          borderRadius: '1rem',
          marginRight: { xs: 0, sm: '1.2rem' },
          marginBottom: { xs: '0.8rem', sm: 0 },
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PersonAddIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
          User Approvals
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
          Pending Requests
        </Typography>
      </Box>
    </Card>
  </Grid>
)}

{/* Zone Cluster Approvals Card */}
<Grid item xs={12} sm={6} md={4} lg={3}>
  <Card
    component={Link}
    to="cluster_approvals"
    sx={{
      textDecoration: 'none',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: '1.2rem', sm: '1.5rem' },
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: { xs: '120px', sm: '130px' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
        '&::before': { left: '100%' },
      },
    }}
  >
    <Box
      sx={{
        width: { xs: '4rem', sm: '5rem' },
        height: { xs: '4rem', sm: '5rem' },
        borderRadius: '1rem',
        marginRight: { xs: 0, sm: '1.2rem' },
        marginBottom: { xs: '0.8rem', sm: 0 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AccountTreeIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
    </Box>
    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }, mb: 0.5 }}>
        Zone Cluster
      </Typography>
      <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }, mb: 0.5 }}>
        Approvals
      </Typography>
      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
        Pending Review
      </Typography>
    </Box>
  </Card>
</Grid>

<Grid item xs={12} sm={6} md={4} lg={3}>
  <Card
    component={Link}
    to="work_allocation_approvals"
    sx={{
      textDecoration: 'none',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: '1.2rem', sm: '1.5rem' },
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #996e11 0%, #efcd38 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: { xs: '120px', sm: '130px' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
        '&::before': { left: '100%' },
      },
    }}
  >
    <Box
      sx={{
        width: { xs: '4rem', sm: '5rem' },
        height: { xs: '4rem', sm: '5rem' },
        borderRadius: '1rem',
        marginRight: { xs: 0, sm: '1.2rem' },
        marginBottom: { xs: '0.8rem', sm: 0 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <WorkHistoryIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
    </Box>
    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
        Work Allocation
      </Typography>
      {/* <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
       
      </Typography> */}
      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
        Pending Approval
      </Typography>
    </Box>
  </Card>
</Grid>
{/* Tour Diary Approvals Card */}
<Grid item xs={12} sm={6} md={4} lg={3}>
  <Card
    component={Link}
    to="tourdiary"
    sx={{
      textDecoration: 'none',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: '1.2rem', sm: '1.5rem' },
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: { xs: '120px', sm: '130px' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
        '&::before': { left: '100%' },
      },
    }}
  >
    <Box
      sx={{
        width: { xs: '4rem', sm: '5rem' },
        height: { xs: '4rem', sm: '5rem' },
        borderRadius: '1rem',
        marginRight: { xs: 0, sm: '1.2rem' },
        marginBottom: { xs: '0.8rem', sm: 0 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <EventNoteIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
    </Box>
    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
        Tour Diary
      </Typography>
      {/* <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
        Approvals
      </Typography> */}
      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
        Pending Approval
      </Typography>
    </Box>
  </Card>
</Grid>

{/*Form Approvals Card */}
<Grid item xs={12} sm={6} md={4} lg={3}>
  <Card
    component={Link}
    to="form_approvals"
    sx={{
      textDecoration: 'none',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      justifyContent: 'center',
      padding: { xs: '1.2rem', sm: '1.5rem' },
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #996e11 0%, #efcd38 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: { xs: '120px', sm: '130px' },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
      },
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
        '&::before': { left: '100%' },
      },
    }}
  >
    <Box
      sx={{
        width: { xs: '4rem', sm: '5rem' },
        height: { xs: '4rem', sm: '5rem' },
        borderRadius: '1rem',
        marginRight: { xs: 0, sm: '1.2rem' },
        marginBottom: { xs: '0.8rem', sm: 0 },
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <WorkHistoryIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
    </Box>
    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
      <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
        Form Approval
      </Typography>
      {/* <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
       
      </Typography> */}
      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
        Pending Approval
      </Typography>
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

// src/pages/functional-components/earas/settings/SettingsTabsPage.js
import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import PublicIcon from '@mui/icons-material/Public';

import zonedetails from 'assets/images/logo/zonedetails.png';

const SettingsTabsPage = () => {
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Administrative Settings
        </Typography>
        <MainCard title="">
         <Grid container spacing={3} alignItems="stretch">
  {/* Districts Settings Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/district_settings"
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
        <LocationCityIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
          Districts
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Settings
        </Typography>
      </Box>
    </Card>
  </Grid>

  {/* Taluk Settings Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/taluk_settings"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '1.2rem', sm: '1.5rem' },
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
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
        <AccountBalanceIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
          Taluk
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Settings
        </Typography>
      </Box>
    </Card>
  </Grid>

  {/* Village Settings Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/village_settings"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '1.2rem', sm: '1.5rem' },
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
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
        <NaturePeopleIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
          Village
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Settings
        </Typography>
      </Box>
    </Card>
  </Grid>

  {/* Zone Settings Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/master_zone_settings"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '1.2rem', sm: '1.5rem' },
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
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
        <PublicIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
          Zone
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Settings
        </Typography>
      </Box>
    </Card>
  </Grid>
</Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default SettingsTabsPage;
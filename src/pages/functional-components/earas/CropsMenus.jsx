import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Diversity2Icon from '@mui/icons-material/Diversity2';


import { Link } from 'react-router-dom';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

import SettingsIcon from '@mui/icons-material/Settings';
import SpaIcon from '@mui/icons-material/Spa';
import AgricultureIcon from '@mui/icons-material/Agriculture';

const CropsMenus = () => {
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Crops Management
        </Typography>
        <MainCard title="">
          <Grid container spacing={3} alignItems="stretch">
  {/* Plot Settings Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/earas_management/crops_management/crops_settings"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '1.2rem', sm: '1.5rem' },
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #219911 0%, #6cef38 100%)',
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
        <Diversity2Icon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
          Crops
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Settings
        </Typography>
      </Box>
    </Card>
  </Grid>

  {/* CCE Crop Selection Card */}
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card
      component={Link}
      to="/schemes/earas/earas_management/crops_management/CCE_crop_selection"
      sx={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: '1.2rem', sm: '1.5rem' },
        borderRadius: '1.5rem',
        background: 'linear-gradient(135deg, #ea6666 0%, #a24b4b 100%)',
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
        <SpaIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
      </Box>
      <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }, mb: 0.5 }}>
          CCE Crop
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          Selection
        </Typography>
      </Box>
    </Card>
  </Grid>



  
</Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default CropsMenus
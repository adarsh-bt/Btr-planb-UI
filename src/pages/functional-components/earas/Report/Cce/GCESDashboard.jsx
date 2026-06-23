import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, Typography, Box } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

// Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';

const GCESDashboard = () => {
  const cards = [
    {
      title: 'Form 5',
      subtitle: 'View',
      route: '/schemes/earas/cce/Form5',
      icon: AssignmentIcon,
      background: 'linear-gradient(135deg, #5B86E5 0%, #36D1DC 100%)'
    },
    {
      title: 'Out of Cluster',
      subtitle: 'List',
      route: '/schemes/earas/outofcluster-list',
      icon: ListAltIcon,
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE89E 100%)'
    },
    {
      title: 'GCES',
      subtitle: 'Reports',
      route: '#', // TODO: Update route when available
      icon: AssessmentIcon,
      background: 'linear-gradient(135deg, #43C6AC 0%, #191654 100%)'
    }
  ];

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          GCES Dashboard
        </Typography>

        <MainCard title="">
          <Grid container spacing={3}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  component={Link}
                  to={card.route}
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    borderRadius: '1.3rem',
                    background: card.background,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '130px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.6s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
                      '&::before': { left: '100%' },
                    },
                  }}
                >
                  <Box sx={{
                    width: { xs: '4rem', sm: '5rem' },
                    height: { xs: '4rem', sm: '5rem' },
                    borderRadius: '1.2rem',
                    marginRight: { xs: 0, sm: '1.5rem' },
                    marginBottom: { xs: '1rem', sm: 0 },
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <card.icon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                  </Box>
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default GCESDashboard;

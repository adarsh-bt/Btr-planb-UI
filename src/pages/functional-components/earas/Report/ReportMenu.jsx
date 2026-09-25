import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Grid,
  Typography,
  Card,
  Box
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

function ReportMenu({ onReportNavigation, officeInfo }) {
  const navigate = useNavigate();

  const handleInspectionReportClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/Report/kerala_inspection_report');
    } else {
      navigate('/Report/kerala_inspection_report');
    }
  };

  const handleClusterReportClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/kerala_cluster_report');
    } else {
      navigate('/kerala_cluster_report');
    }
  };

  const handleFormReportClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/FormReport/Kerala');
    } else {
      navigate('/FormReport/Kerala');
    }
  };

  const handleForm5Click = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/cce/KeralaForm5ReportList');
    } else {
      navigate('/schemes/earas/cce/KeralaForm5ReportList');
    }
  };

  const handleForm2Click = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/cce/KeralaForm2');
    } else {
      navigate('/schemes/earas/cce/KeralaForm2');
    }
  };

  const handleForm3AClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/Report/Form3A/KeralaForm3A');
    } else {
      navigate('/schemes/earas/Report/Form3A/KeralaForm3A');
    }
  };

  const handleForm3BClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/Report/Form3B/KeralaForm3B');
    } else {
      navigate('/schemes/earas/Report/Form3B/KeralaForm3B');
    }
  };

  const reportItems = [
    {
      title: 'Work Allocation Abstract',
      subtitle: 'Progress Report',
      to: '/report/kerala_work_allocation_report',
      icon: AssessmentIcon,
      gradient: 'linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)',
      glowColor: 'rgba(30, 60, 114, 0.35)'
    },
    {
      title: 'Cluster Formation',
      subtitle: 'Progress Report',
      to: '/kerala_cluster_report',
      onClick: handleClusterReportClick,
      icon: AssessmentIcon,
      gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      glowColor: 'rgba(13, 148, 136, 0.35)'
    },
    {
      title: 'Cluster Enumeration',
      subtitle: 'Progress Report',
      to: '/FormReport/Kerala',
      onClick: handleFormReportClick,
      icon: DescriptionIcon,
      gradient: 'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
      glowColor: 'rgba(190, 18, 60, 0.35)'
    },
    {
      title: 'CCE Progress Report',
      subtitle: 'CCE Form',
      to: '/schemes/earas/cce/KeralaForm5ReportList',
      onClick: handleForm5Click,
      icon: DescriptionIcon,
      gradient: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
      glowColor: 'rgba(21, 128, 61, 0.35)'
    },
    {
      title: 'Form 3A',
      subtitle: 'CCE Form',
      to: '/schemes/earas/Report/Form3A/KeralaForm3A',
      onClick: handleForm3AClick,
      icon: DescriptionIcon,
      gradient: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
      glowColor: 'rgba(126, 34, 206, 0.35)'
    },
    {
      title: 'Form 3B',
      subtitle: 'CCE Form',
      to: '/schemes/earas/Report/Form3B/KeralaForm3B',
      onClick: handleForm3BClick,
      icon: DescriptionIcon,
      gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
      glowColor: 'rgba(217, 119, 6, 0.35)'
    },
    {
      title: 'Form 2',
      subtitle: 'CCE Form',
      to: '/schemes/earas/cce/KeralaForm2',
      onClick: handleForm2Click,
      icon: DescriptionIcon,
      gradient: 'linear-gradient(135deg, #A21CAF 0%, #86198F 100%)',
      glowColor: 'rgba(162, 28, 175, 0.35)'
    },
    {
      title: 'Inspection Reports',
      subtitle: 'Form 1 & CCE Inspections',
      to: '/Report/kerala_inspection_report',
      onClick: handleInspectionReportClick,
      icon: AssignmentTurnedInIcon,
      gradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
      glowColor: 'rgba(51, 65, 85, 0.4)'
    }
  ];

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2, fontWeight: 700, color: 'text.primary' }}>
          Report Menu
        </Typography>

        <MainCard title="">
          <Grid container spacing={3} alignItems="stretch">
            {reportItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    component={Link}
                    to={item.to}
                    onClick={item.onClick}
                    sx={{
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: { xs: '1.2rem', sm: '1.5rem' },
                      borderRadius: '1.25rem',
                      background: item.gradient,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 8px 18px ${item.glowColor}`,
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
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                        transition: 'left 0.5s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 16px 32px ${item.glowColor}`,
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        '&::before': { left: '100%' }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: '3.8rem', sm: '4.5rem' },
                        height: { xs: '3.8rem', sm: '4.5rem' },
                        borderRadius: '1rem',
                        marginRight: { xs: 0, sm: '1.2rem' },
                        marginBottom: { xs: '0.8rem', sm: 0 },
                        background: 'rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <IconComponent sx={{ fontSize: { xs: '2.2rem', sm: '2.6rem' }, color: '#fff' }} />
                    </Box>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#fff',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
                          lineHeight: 1.25,
                          mb: 0.6
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'rgba(255,255,255,0.85)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          fontWeight: 600
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ReportMenu;
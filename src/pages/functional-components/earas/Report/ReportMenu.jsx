import React from 'react';
import { useNavigate } from 'react-router-dom';
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

function ReportMenu({ onReportNavigation, officeInfo }) {
  const navigate = useNavigate();

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
      navigate('/FormReport/Kerala'); // fallback if opened outside the wrapper
    }
  };

  // CCE Progress Report (Form 5) — role-based direct access via the wrapper.
  const handleForm5Click = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/cce/KeralaForm5ReportList');
    } else {
      navigate('/schemes/earas/cce/KeralaForm5ReportList');
    }
  };

  // Form 2 (Land Utilization & Irrigation) — role-based direct access.
  const handleForm2Click = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/cce/KeralaForm2');
    } else {
      navigate('/schemes/earas/cce/KeralaForm2');
    }
  };

  // Form 3A (Crop Area Report) — role-based direct access.
  const handleForm3AClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/Report/Form3A/KeralaForm3A');
    } else {
      navigate('/schemes/earas/Report/Form3A/KeralaForm3A');
    }
  };

  // Form 3B (Crop Area Report) — role-based direct access.
  const handleForm3BClick = (e) => {
    e.preventDefault();
    if (onReportNavigation) {
      onReportNavigation('/schemes/earas/Report/Form3B/KeralaForm3B');
    } else {
      navigate('/schemes/earas/Report/Form3B/KeralaForm3B');
    }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Report Menu
        </Typography>

        <MainCard title="">
          <Grid container spacing={3} alignItems="stretch">
            {/* Cluster Report Card */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/kerala_cluster_report"
                onClick={handleClusterReportClick}
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: '1.2rem', sm: '1.5rem' },
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
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
                  <AssessmentIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
                    Cluster Formation
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    Progress Report
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Cluster Enumeration Report Card */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/FormReport/Kerala"
                onClick={handleFormReportClick}
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
                  <DescriptionIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
                    Cluster Enumeration
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    Progress Report
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Form 5 Card — role-based direct access */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/cce/KeralaForm5ReportList"
                onClick={handleForm5Click}
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
                  <DescriptionIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
                    CCE Progress Report
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    CCE Form
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Form 2 Card — role-based direct access */}
            {/* <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/cce/KeralaForm2"
                onClick={handleForm2Click}
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: '1.2rem', sm: '1.5rem' },
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #ea6666ff 0%, #791c37ff 100%)',
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
                  <DescriptionIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
                    Form 2
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    Form2 Report
                  </Typography>
                </Box>
              </Card>
            </Grid> */}

            {/* Form 3A Card — role-based direct access */}
            {/* <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Report/Form3A/KeralaForm3A"
                onClick={handleForm3AClick}
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: '1.2rem', sm: '1.5rem' },
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #11bf11ff 0%, #0e7f23ff 100%)',
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
                    background: 'rgba(199, 34, 34, 0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
                    Form 3A
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    Form3a Report
                  </Typography>
                </Box>
              </Card>
            </Grid> */}

            {/* Form 3B Card — role-based direct access */}
            {/* <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/schemes/earas/Report/Form3B/KeralaForm3B"
                onClick={handleForm3BClick}
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
                    background: 'rgba(199, 34, 34, 0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem' }, mb: 0.5 }}>
                    Form 3B
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    CCE Form
                  </Typography>
                </Box>
              </Card>
            </Grid> */}

            {/* Work Allocation Abstract Card */}
            {/* <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to="/report/kerala_work_allocation_report"
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: '1.2rem', sm: '1.5rem' },
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
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
                  <AssessmentIcon sx={{ fontSize: { xs: '2.5rem', sm: '3rem' }, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, mb: 0.5 }}>
                    Work Allocation Abstract
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                    Progress Report
                  </Typography>
                </Box>
              </Card>
            </Grid> */}

          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ReportMenu;
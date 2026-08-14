import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Avatar } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { useNavigate } from 'react-router-dom';

export default function KpiCardsGrid({ summaryData, onKpiClick }) {
  const navigate = useNavigate();

  const handleCardClick = (route, kpiType) => {
    if (onKpiClick) {
      onKpiClick(kpiType);
    } else if (route) {
      navigate(route);
    }
  };

  const cards = [
    {
      id: 'totalUsers',
      title: 'Total Users',
      mainStat: summaryData?.totalUsers?.total?.toLocaleString() || '811',
      mainSubtext: 'Total Users',
      subStats: [
        { label: `${summaryData?.totalUsers?.active || 798} Active`, color: '#15803D' },
        { label: `${summaryData?.totalUsers?.inactive || 13} Inactive`, color: '#64748B' }
      ],
      progress: 98,
      progressColor: '#16A34A',
      icon: <PeopleAltOutlinedIcon />,
      bgColor: '#F0F9FF',
      iconColor: '#0284C7',
      route: '/reports'
    },
    {
      id: 'tourDiary',
      title: 'Tour Diary',
      mainStat: `${summaryData?.tourDiary?.submitted?.toLocaleString() || '1,320'} / ${summaryData?.tourDiary?.target?.toLocaleString() || '1,500'}`,
      mainSubtext: `${summaryData?.tourDiary?.achievement || 88}% Achievement`,
      subStats: [
        { label: `${summaryData?.tourDiary?.submitted?.toLocaleString() || '1,320'} Submitted`, color: '#15803D' },
        { label: `${summaryData?.tourDiary?.pending || 180} Pending`, color: '#B91C1C' }
      ],
      progress: summaryData?.tourDiary?.achievement || 88,
      progressColor: '#D97706',
      icon: <MenuBookOutlinedIcon />,
      bgColor: '#FEF3C7',
      iconColor: '#D97706',
      route: '/tour-diary'
    },
    {
      id: 'actualTour',
      title: 'Actual Tour',
      mainStat: `${summaryData?.actualTour?.submitted?.toLocaleString() || '1,180'} / ${summaryData?.actualTour?.target?.toLocaleString() || '1,400'}`,
      mainSubtext: `${summaryData?.actualTour?.achievement || 84}% Achievement`,
      subStats: [
        { label: `${summaryData?.actualTour?.submitted?.toLocaleString() || '1,180'} Submitted`, color: '#15803D' },
        { label: `${summaryData?.actualTour?.pending || 220} Pending`, color: '#B91C1C' }
      ],
      progress: summaryData?.actualTour?.achievement || 84,
      progressColor: '#D97706',
      icon: <DirectionsWalkOutlinedIcon />,
      bgColor: '#FFFBEB',
      iconColor: '#B45309',
      route: '/actual-tour'
    },
    {
      id: 'workAllocation',
      title: 'Work Allocation',
      mainStat: `${summaryData?.workAllocation?.submitted?.toLocaleString() || '1,180'} / ${summaryData?.workAllocation?.allocated?.toLocaleString() || '1,245'}`,
      mainSubtext: `${summaryData?.workAllocation?.achievement || 95}% Achievement`,
      subStats: [
        { label: `${summaryData?.workAllocation?.submitted?.toLocaleString() || '1,180'} Submitted`, color: '#15803D' },
        { label: `${summaryData?.workAllocation?.pending || 65} Pending`, color: '#B91C1C' }
      ],
      progress: summaryData?.workAllocation?.achievement || 95,
      progressColor: '#16A34A',
      icon: <AssignmentTurnedInOutlinedIcon />,
      bgColor: '#F0FDF4',
      iconColor: '#15803D',
      route: '/work-allocation'
    },
    {
      id: 'keyPlot',
      title: 'Key Plot',
      mainStat: `${summaryData?.keyPlot?.completed || 100} / ${summaryData?.keyPlot?.target || 100}`,
      mainSubtext: `${summaryData?.keyPlot?.achievement || 100}% Completed`,
      subStats: [
        { label: `${summaryData?.keyPlot?.completed || 100} Completed`, color: '#15803D' },
        { label: `${summaryData?.keyPlot?.pending || 0} Pending`, color: '#64748B' }
      ],
      progress: summaryData?.keyPlot?.achievement || 100,
      progressColor: '#16A34A',
      icon: <TaskAltOutlinedIcon />,
      bgColor: '#ECFDF5',
      iconColor: '#047857',
      route: '/key-plot'
    },
    {
      id: 'usersPending',
      title: 'Users Requiring Attention',
      mainStat: `${summaryData?.usersRequiringAttention?.uniquePendingUsers || 67}`,
      mainSubtext: 'Users Pending',
      subStats: [
        { label: `${summaryData?.usersRequiringAttention?.tourDiaryPendingCount || 42} Tour Diary`, color: '#B91C1C' },
        { label: `${summaryData?.usersRequiringAttention?.actualTourPendingCount || 53} Actual Tour`, color: '#B91C1C' },
        { label: `${summaryData?.usersRequiringAttention?.workAllocationPendingCount || 18} Work Alloc.`, color: '#B91C1C' }
      ],
      progress: 100,
      progressColor: '#DC2626',
      icon: <WarningAmberOutlinedIcon />,
      bgColor: '#FEF2F2',
      iconColor: '#DC2626',
      route: '#pending-users'
    }
  ];

  return (
    <Grid container spacing={2.5} mb={3.5}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={4} key={card.id}>
          <Card
            onClick={() => handleCardClick(card.route, card.id)}
            sx={{
              height: '100%',
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0px 10px 20px rgba(15, 23, 42, 0.08)',
                borderColor: '#CBD5E1'
              }
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={700} color="#64748B" textTransform="uppercase" letterSpacing={0.5} fontSize="0.75rem">
                  {card.title}
                </Typography>
                <Avatar sx={{ bgcolor: card.bgColor, color: card.iconColor, width: 38, height: 38 }}>
                  {card.icon}
                </Avatar>
              </Box>

              <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ fontSize: '1.65rem', mb: 0.5 }}>
                {card.mainStat}
              </Typography>

              <Typography variant="body2" fontWeight={600} color="#475569" mb={1.5}>
                {card.mainSubtext}
              </Typography>

              <Box mb={2}>
                <LinearProgress
                  variant="determinate"
                  value={card.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: card.progressColor,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" pt={1} borderTop="1px solid #F1F5F9">
                <Box display="flex" gap={1.5} flexWrap="wrap">
                  {card.subStats.map((st, i) => (
                    <Typography key={i} variant="caption" fontWeight={600} sx={{ color: st.color, fontSize: '0.725rem' }}>
                      {st.label}
                    </Typography>
                  ))}
                </Box>
                <ChevronRightOutlinedIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

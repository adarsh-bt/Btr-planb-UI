import React from 'react';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';

const TourDiaryMenu = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Advanced Tour Program',
            // description: 'Plan your tour for the month',
            icon: EventNoteIcon,
            path: '/tourdiary/advanced',
            gradient: 'linear-gradient(135deg, rgba(99, 155, 255, 0.57), rgb(51, 125, 253))'
        },
        // {
        //     title: 'Tour Diary',
        //     // description: 'Actual travel diary',
        //     icon: CalendarMonthIcon,
        //     path: '/tourdiary/actual_tour_diary',
        //     gradient: 'linear-gradient(135deg, rgba(79, 208, 170, 0.57), rgb(37, 187, 142))'
        // }
    ];

    return (
        <Grid container spacing={3}>
            <Breadcrumb />
            <Grid item xs={12}>
                <MainCard>
                    <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: 2 }}>
                        <Typography
                            variant="h3"
                            align="center"
                            sx={{
                                marginBottom: 1,
                                color: theme.palette.text.primary
                            }}
                        >
                            Tour Diary
                        </Typography>
                        <Typography
                            variant="body1"
                            align="center"
                            sx={{
                                marginBottom: 4,
                                color: theme.palette.text.secondary
                            }}
                        >
                            Choose your tour diary option
                        </Typography>

                        <Grid container spacing={4} justifyContent="center">
                            {menuItems.map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                    <Grid item xs={12} sm={6} md={5} key={index}>
                                        <Card
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                cursor: 'pointer',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '2rem',
                                                borderRadius: '1rem',
                                                background: item.gradient,
                                                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                minHeight: '200px',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    width: '200px',
                                                    height: '200px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    top: '-50px',
                                                    right: '-50px'
                                                },
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    width: '150px',
                                                    height: '150px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255, 255, 255, 0.15)',
                                                    bottom: '-40px',
                                                    left: '-40px'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: 'center', zIndex: 1 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        marginBottom: 2
                                                    }}
                                                >
                                                    <IconComponent
                                                        sx={{
                                                            fontSize: '4rem',
                                                            color: '#fff'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#fff',
                                                        marginBottom: 1
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#f3f3f3',
                                                        fontWeight: 'lighter'
                                                    }}
                                                >
                                                    {item.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default TourDiaryMenu;

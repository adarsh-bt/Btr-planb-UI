import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Grid,
    Modal,
    TextField,
    Typography,
    IconButton,
    Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const TourDiary = () => {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [events, setEvents] = useState({});
    const [formData, setFormData] = useState({
        place: '',
        purpose: '',
        remarks: ''
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper function to check if a date is a Sunday
    const isSunday = (year, month, day) => {
        const date = new Date(year, month, day);
        return date.getDay() === 0;
    };

    // Helper function to check if a date is second Saturday
    const isSecondSaturday = (year, month, day) => {
        const date = new Date(year, month, day);
        if (date.getDay() !== 6) return false; // Not a Saturday

        // Calculate which Saturday of the month this is
        const firstDayOfMonth = new Date(year, month, 1);
        const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
        const secondSaturday = firstSaturday + 7;

        return day === secondSaturday;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const openModal = (dateKey, day) => {
        setSelectedDate(dateKey);
        const event = events[dateKey] || { place: '', purpose: '', remarks: '' };
        setFormData(event);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setFormData({ place: '', purpose: '', remarks: '' });
    };

    const saveEvent = () => {
        if (selectedDate) {
            setEvents({
                ...events,
                [selectedDate]: formData
            });
        }
        closeModal();
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(
                <Grid item xs={12 / 7} key={`empty-${i}`}>
                    <Box sx={{ minHeight: '90px' }} />
                </Grid>
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${month + 1}-${day}`;
            const hasEvent = events[dateKey];

            // Check holiday types
            const isSun = isSunday(year, month, day);
            const is2ndSat = isSecondSaturday(year, month, day);

            // Determine background color based on holiday type
            let backgroundColor = theme.palette.background.paper;
            let hoverColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f9ff';

            if (isSun) {
                backgroundColor = theme.palette.mode === 'dark' ? '#4a2a2a' : '#ffe6e6'; // Light red
                hoverColor = theme.palette.mode === 'dark' ? '#5a3a3a' : '#ffd6d6';
            } else if (is2ndSat) {
                backgroundColor = theme.palette.mode === 'dark' ? '#4a3a2a' : '#fff4e6'; // Light orange
                hoverColor = theme.palette.mode === 'dark' ? '#5a4a3a' : '#ffe4d6';
            }

            calendarDays.push(
                <Grid item xs={12 / 7} key={day}>
                    <Paper
                        onClick={() => openModal(dateKey, day)}
                        title={isSun ? 'Sunday' : is2ndSat ? 'Second Saturday' : ''}
                        sx={{
                            minHeight: '90px',
                            padding: '10px',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: backgroundColor,
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: hoverColor,
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                            }
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 600,
                                color: (isSun || is2ndSat)
                                    ? '#d32f2f'
                                    : theme.palette.text.primary
                            }}
                        >
                            {day}
                        </Typography>
                        {hasEvent && (
                            <Box
                                sx={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#27ae60',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    bottom: '8px',
                                    left: '8px'
                                }}
                            />
                        )}
                    </Paper>
                </Grid>
            );
        }

        return calendarDays;
    };

    return (
        <Grid container spacing={3}>
            <Breadcrumb />
            <Grid item xs={12}>
                <MainCard>
                    <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {/* Header */}
                        <Typography
                            variant="h3"
                            align="center"
                            sx={{
                                marginBottom: 3,
                                color: theme.palette.text.primary
                            }}
                        >
                            Tour Diary
                        </Typography>

                        {/* Calendar Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 2
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => changeMonth(-1)}
                                startIcon={<ArrowBackIosNewIcon />}
                                sx={{
                                    backgroundColor: '#2980b9',
                                    '&:hover': {
                                        backgroundColor: '#1f6391'
                                    }
                                }}
                            >
                                Prev
                            </Button>
                            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                                {currentDate.toLocaleString('default', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => changeMonth(1)}
                                endIcon={<ArrowForwardIosIcon />}
                                sx={{
                                    backgroundColor: '#2980b9',
                                    '&:hover': {
                                        backgroundColor: '#1f6391'
                                    }
                                }}
                            >
                                Next
                            </Button>
                        </Box>

                        {/* Holiday Legend */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 3,
                                marginBottom: 2,
                                flexWrap: 'wrap'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box
                                    sx={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: theme.palette.mode === 'dark' ? '#4a2a2a' : '#ffe6e6',
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: '3px'
                                    }}
                                />
                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                    Sunday
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box
                                    sx={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: theme.palette.mode === 'dark' ? '#4a3a2a' : '#fff4e6',
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: '3px'
                                    }}
                                />
                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                    2nd Saturday
                                </Typography>
                            </Box>
                        </Box>

                        {/* Calendar Grid */}
                        <Grid container spacing={0.125}>
                            {/* Day Names */}
                            {dayNames.map((dayName) => (
                                <Grid item xs={12 / 7} key={dayName}>
                                    <Box
                                        sx={{
                                            backgroundColor: theme.palette.mode === 'dark'
                                                ? theme.palette.grey[800]
                                                : '#f0f3f7',
                                            padding: '10px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            border: `1px solid ${theme.palette.divider}`
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {dayName}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}

                            {/* Calendar Days */}
                            {renderCalendar()}
                        </Grid>
                    </Box>
                </MainCard>
            </Grid>

            {/* Modal for Event Entry */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Card
                    sx={{
                        width: '90%',
                        maxWidth: '400px',
                        padding: 3,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[24]
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                            Tour Plan – {selectedDate?.split('-')[2]}
                        </Typography>
                        <IconButton onClick={closeModal} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Place of Visit
                            </Typography>
                            <TextField
                                fullWidth
                                value={formData.place}
                                onChange={(e) => handleInputChange('place', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </Box>

                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Purpose of Tour
                            </Typography>
                            <TextField
                                fullWidth
                                value={formData.purpose}
                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </Box>

                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Remarks
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.remarks}
                                onChange={(e) => handleInputChange('remarks', e.target.value)}
                                variant="outlined"
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={closeModal}
                                sx={{
                                    color: theme.palette.text.primary,
                                    borderColor: theme.palette.divider
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                onClick={saveEvent}
                                sx={{
                                    backgroundColor: '#27ae60',
                                    '&:hover': {
                                        backgroundColor: '#1e8449'
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Modal>
        </Grid>
    );
};

export default TourDiary;

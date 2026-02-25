import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useEffect } from 'react';
import tourDiaryService from 'pages/authentication/services/tourdiaryservice';
import authservice from 'pages/authentication/services/authservice';
import {
    Box,
    Button,
    Card,
    Grid,
    Modal,
    TextField,
    Typography,
    IconButton,
    Paper,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip,
    Tabs,
    Tab,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';

const TourDiary = () => {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [tourEvents, setTourEvents] = useState([]); // Store all events from API
    const [selectedDayEvents, setSelectedDayEvents] = useState([]); // Events for selected day
    const [selectedEvent, setSelectedEvent] = useState(null); // Event being edited
    const [formData, setFormData] = useState({
        place: '',
        purpose: '',
        remarks: ''
    });
    const [editFormData, setEditFormData] = useState({
        id: null,
        place: '',
        purpose: '',
        remarks: ''
    });
    const [activeTab, setActiveTab] = useState(0); // 0 for add new, 1 for view existing

    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [schemes, setSchemes] = useState([]);
    const [purposes, setPurposes] = useState([]);
    const [selectedScheme, setSelectedScheme] = useState('');
    const [editSelectedScheme, setEditSelectedScheme] = useState(''); // Separate state for edit modal

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper function to check if a date is a Sunday
    const isSunday = (year, month, day) => {
        const date = new Date(year, month, day);
        return date.getDay() === 0;
    };

    // Helper function to check if a date is second Saturday
    const isSecondSaturday = (year, month, day) => {
        const date = new Date(year, month, day);
        if (date.getDay() !== 6) return false;

        const firstDayOfMonth = new Date(year, month, 1);
        const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
        const secondSaturday = firstSaturday + 7;

        return day === secondSaturday;
    };

    // Helper function to format date key
    const formatDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Helper function to parse date from key
    const parseDateKey = (dateKey) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        return { year, month: month - 1, day };
    };

    // Fetch tour data when month changes
    const fetchTourData = async () => {
        const zoneId = Number(authservice.getzone());
        if (!zoneId) return;

        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // API expects 1-based month

        try {
            const data = await tourDiaryService.getAdvancedTourByFilter(zoneId, month, year);
            if (Array.isArray(data)) {
                setTourEvents(data);
            } else if (data.message) {
                console.error("Error fetching tour data:", data.message);
                setTourEvents([]);
            }
        } catch (error) {
            console.error("Error fetching tour data:", error);
            setTourEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch schemes on component mount
    useEffect(() => {
        const fetchSchemes = async () => {
            const data = await tourDiaryService.getAllSchemes();
            if (!data.message) {
                setSchemes(data);
            }
        };
        fetchSchemes();
    }, []);

    // Fetch purposes when scheme changes for main modal
    useEffect(() => {
        const fetchPurposes = async () => {
            if (selectedScheme) {
                const data = await tourDiaryService.getActivePurposes(selectedScheme);
                if (!data.message) {
                    setPurposes(data);
                }
            } else {
                setPurposes([]);
            }
        };
        fetchPurposes();
    }, [selectedScheme]);

    // Fetch purposes when scheme changes for edit modal
    useEffect(() => {
        const fetchPurposesForEdit = async () => {
            if (editSelectedScheme) {
                const data = await tourDiaryService.getActivePurposes(editSelectedScheme);
                if (!data.message) {
                    setPurposes(data);
                }
            } else {
                setPurposes([]);
            }
        };
        fetchPurposesForEdit();
    }, [editSelectedScheme]);

    // Fetch tour data when month/year changes
    useEffect(() => {
        fetchTourData();
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const openModal = (dateKey) => {
        setSelectedDate(dateKey);
        
        // Filter events for the selected day
        const { year, month, day } = parseDateKey(dateKey);
        const dayEvents = tourEvents.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                   eventDate.getMonth() === month &&
                   eventDate.getDate() === day;
        });
        
        setSelectedDayEvents(dayEvents);
        setFormData({ place: '', purpose: '', remarks: '' });
        setActiveTab(dayEvents.length > 0 ? 1 : 0); // Show existing events tab if there are events
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedDate(null);
        setSelectedDayEvents([]);
        setFormData({ place: '', purpose: '', remarks: '' });
        setActiveTab(0);
        setSelectedScheme(''); // Reset scheme selection
    };

    const openEditModal = async (event) => {
        setSelectedEvent(event);
        setEditFormData({
            id: event.id,
            place: event.location,
            purpose: event.purposeId,
            remarks: event.remark || ''
        });
        
        // Find the scheme for this purpose
        // First, fetch all purposes to find which scheme this purpose belongs to
        try {
            // You might need to fetch all purposes or have a mapping
            // For now, we'll try to find the scheme by fetching purposes for each scheme
            // This is a workaround - ideally you'd have an API to get purpose details or a mapping
            const allSchemes = schemes;
            for (const scheme of allSchemes) {
                const purposesData = await tourDiaryService.getActivePurposes(scheme.id);
                if (purposesData && !purposesData.message) {
                    const purposeExists = purposesData.some(p => p.id === event.purposeId);
                    if (purposeExists) {
                        setEditSelectedScheme(scheme.id);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("Error finding scheme for purpose:", error);
        }
        
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedEvent(null);
        setEditFormData({
            id: null,
            place: '',
            purpose: '',
            remarks: ''
        });
        setEditSelectedScheme(''); // Reset edit scheme selection
    };

    const saveEvent = async () => {
    if (!selectedDate) return;

    if (!formData.purpose || !formData.place || !selectedScheme) {
        alert("Please fill all required fields");
        return;
    }

    const userId = authservice.userid();
    const zoneId = Number(authservice.getzone());

    if (!userId || !zoneId) {
        alert("User session expired. Please login again.");
        return;
    }

    // Parse the selected date and format it for the API
    const { year, month, day } = parseDateKey(selectedDate);
    
    // Create a date object for the selected date at a specific time (e.g., 10:30 AM)
    // You can adjust the time as needed
    const selectedDateTime = new Date(year, month, day, 10, 30, 0);
    
    // Format the date as ISO string (or the format your API expects)
    // The API expects "2026-02-22T10:30:00" format
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:30:00`;

    const payload = {
        purposeId: Number(formData.purpose),
        userId: userId,
        location: formData.place,
        remark: formData.remarks,
        status: "DRAFT",
        zoneId: zoneId,
        createdAt: formattedDate // Add the selected date here
    };

    console.log("Saving Payload:", payload);

    try {
        setLoading(true);
        const response = await tourDiaryService.saveOrUpdateTour(payload);

        if (response.id) {
            // Update tourEvents with the new event
            const updatedTourEvents = [...tourEvents, response];
            setTourEvents(updatedTourEvents);
            
            // Update selected day events
            const { year, month, day } = parseDateKey(selectedDate);
            const updatedDayEvents = updatedTourEvents.filter(event => {
                const eventDate = new Date(event.createdAt);
                return eventDate.getFullYear() === year &&
                       eventDate.getMonth() === month &&
                       eventDate.getDate() === day;
            });
            
            setSelectedDayEvents(updatedDayEvents);
            setFormData({ place: '', purpose: '', remarks: '' });
            setActiveTab(1); // Switch to view tab after saving
            alert("Tour saved successfully ✅");
        } else {
            alert(response.message || "Failed to save tour");
        }
    } catch (error) {
        alert("Something went wrong");
    } finally {
        setLoading(false);
    }
};
    const updateEvent = async () => {
    if (!editFormData.purpose || !editFormData.place || !editSelectedScheme) {
        alert("Please fill all required fields");
        return;
    }

    const userId = authservice.userid();
    const zoneId = Number(authservice.getzone());

    if (!userId || !zoneId) {
        alert("User session expired. Please login again.");
        return;
    }

    // For update, we can either keep the original createdAt or allow changing it
    // Here we're keeping the original date from the event being edited
    const originalEvent = selectedEvent;
    const createdAt = originalEvent?.createdAt;

    const payload = {
        id: editFormData.id,
        purposeId: Number(editFormData.purpose),
        userId: userId,
        location: editFormData.place,
        remark: editFormData.remarks,
        status: "DRAFT",
        zoneId: zoneId,
        createdAt: createdAt // Preserve the original date
    };

    console.log("Updating Payload:", payload);

    try {
        setEditLoading(true);
        const response = await tourDiaryService.saveOrUpdateTour(payload);

        if (response.id) {
            // Update the tourEvents array with the updated event
            const updatedTourEvents = tourEvents.map(event => 
                event.id === response.id ? response : event
            );
            setTourEvents(updatedTourEvents);

            // If the modal is open, update selectedDayEvents
            if (selectedDate) {
                const { year, month, day } = parseDateKey(selectedDate);
                const updatedDayEvents = updatedTourEvents.filter(event => {
                    const eventDate = new Date(event.createdAt);
                    return eventDate.getFullYear() === year &&
                        eventDate.getMonth() === month &&
                        eventDate.getDate() === day;
                });
                setSelectedDayEvents(updatedDayEvents);
            }

            closeEditModal();
            alert("Tour updated successfully ✅");
        } else {
            alert(response.message || "Failed to update tour");
        }
    } catch (error) {
        alert("Something went wrong");
    } finally {
        setEditLoading(false);
    }
};
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this tour?")) {
            return;
        }

        try {
            setDeleteLoading(true);
            const response = await tourDiaryService.deleteAdvancedTour(eventId);
            
            if (!response.message) {
                // Refresh the tour data
                await fetchTourData();
                
                // Update selected day events
                const { year, month, day } = parseDateKey(selectedDate);
                const updatedDayEvents = tourEvents.filter(event => {
                    const eventDate = new Date(event.createdAt);
                    return eventDate.getFullYear() === year &&
                           eventDate.getMonth() === month &&
                           eventDate.getDate() === day;
                });
                
                setSelectedDayEvents(updatedDayEvents);
                alert("Tour deleted successfully");
                
                // If no events left for the day, close the modal
                if (updatedDayEvents.length === 0) {
                    closeModal();
                }
            } else {
                alert(response.message);
            }
        } catch (error) {
            alert("Failed to delete tour");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleEditInputChange = (field, value) => {
        setEditFormData({
            ...editFormData,
            [field]: value
        });
    };

    // Check if a specific day has events
    const hasEventsOnDay = (year, month, day) => {
        return tourEvents.some(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                   eventDate.getMonth() === month &&
                   eventDate.getDate() === day;
        });
    };

    // Get event count for a specific day
    const getEventCountForDay = (year, month, day) => {
        return tourEvents.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                   eventDate.getMonth() === month &&
                   eventDate.getDate() === day;
        }).length;
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
            const dateKey = formatDateKey(year, month, day);
            const hasEvents = hasEventsOnDay(year, month, day);
            const eventCount = getEventCountForDay(year, month, day);

            // Check holiday types
            const isSun = isSunday(year, month, day);
            const is2ndSat = isSecondSaturday(year, month, day);

            // Determine background color based on holiday type
            let backgroundColor = theme.palette.background.paper;
            let hoverColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f9ff';

            if (isSun) {
                backgroundColor = theme.palette.mode === 'dark' ? '#4a2a2a' : '#ffe6e6';
                hoverColor = theme.palette.mode === 'dark' ? '#5a3a3a' : '#ffd6d6';
            } else if (is2ndSat) {
                backgroundColor = theme.palette.mode === 'dark' ? '#4a3a2a' : '#fff4e6';
                hoverColor = theme.palette.mode === 'dark' ? '#5a4a3a' : '#ffe4d6';
            }

            calendarDays.push(
                <Grid item xs={12 / 7} key={day}>
                    <Paper
                        onClick={() => openModal(dateKey)}
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
                        
                        {hasEvents && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        backgroundColor: '#27ae60',
                                        fontSize: '0.7rem',
                                        minWidth: '60px',
                                        height: '28px',
                                        '&:hover': {
                                            backgroundColor: '#1e8449'
                                        }
                                    }}
                                >
                                    Duty
                                </Button>
                                {eventCount > 1 && (
                                    <Chip
                                        label={`${eventCount} tours`}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: -20,
                                            right: -20,
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            fontSize: '0.6rem',
                                            height: '20px'
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            );
        }

        return calendarDays;
    };

    const renderEventList = () => {
    if (selectedDayEvents.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No tours planned for this day.
            </Alert>
        );
    }

    return (
        <List sx={{ mt: 2 }} key={`event-list-${selectedDayEvents.length}`}>
            {selectedDayEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EventIcon fontSize="small" color="action" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {event.location}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Purpose ID: {event.purposeId}
                                    </Typography>
                                    {event.remark && (
                                        <Typography variant="body2" color="text.secondary">
                                            Remark: {event.remark}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(event.createdAt).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <Tooltip title="Edit">
                                <IconButton 
                                    edge="end" 
                                    onClick={() => openEditModal(event)}
                                    sx={{ mr: 1 }}
                                    disabled={deleteLoading}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton 
                                    edge="end" 
                                    onClick={() => handleDeleteEvent(event.id)}
                                    disabled={deleteLoading}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                </React.Fragment>
            ))}
        </List>
    );
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

                        {/* Loading Indicator */}
                        {loading && (
                            <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
                                Loading tour data...
                            </Typography>
                        )}

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

            {/* Main Modal for Event Entry and View */}
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
                        maxWidth: '500px',
                        padding: 3,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[24],
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                            Tour Plan – {selectedDate}
                        </Typography>
                        <IconButton onClick={closeModal} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Add New Tour" icon={<AddIcon />} iconPosition="start" />
                            <Tab 
                                label={`View Tours (${selectedDayEvents.length})`} 
                                icon={<EventIcon />} 
                                iconPosition="start"
                                disabled={selectedDayEvents.length === 0}
                            />
                        </Tabs>
                    </Box>

                    {activeTab === 0 ? (
                        // Add New Tour Form
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Scheme</InputLabel>
                                <Select
                                    value={selectedScheme}
                                    label="Scheme"
                                    onChange={(e) => setSelectedScheme(e.target.value)}
                                >
                                    {schemes.map((scheme) => (
                                        <MenuItem key={scheme.id} value={scheme.id}>
                                            {scheme.schemeName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Purpose of Tour</InputLabel>
                                <Select
                                    value={formData.purpose}
                                    label="Purpose of Tour"
                                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                                    disabled={!selectedScheme}
                                >
                                    {purposes.map((purpose) => (
                                        <MenuItem key={purpose.id} value={purpose.id}>
                                            {purpose.purposeName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Place of Visit"
                                value={formData.place}
                                onChange={(e) => handleInputChange('place', e.target.value)}
                                variant="outlined"
                                size="small"
                            />

                            <TextField
                                fullWidth
                                label="Remarks"
                                multiline
                                rows={3}
                                value={formData.remarks}
                                onChange={(e) => handleInputChange('remarks', e.target.value)}
                                variant="outlined"
                            />

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
                                    disabled={loading}
                                    sx={{
                                        backgroundColor: '#27ae60',
                                        '&:hover': {
                                            backgroundColor: '#1e8449'
                                        }
                                    }}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        // View Existing Tours
                        <Box>
                            {renderEventList()}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveTab(0)}
                                    startIcon={<AddIcon />}
                                >
                                    Add Another
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={closeModal}
                                    sx={{
                                        backgroundColor: '#2980b9',
                                        '&:hover': {
                                            backgroundColor: '#1f6391'
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Card>
            </Modal>

            {/* Edit Modal for Updating Tour */}
            <Modal
                open={editModalOpen}
                onClose={closeEditModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Card
                    sx={{
                        width: '90%',
                        maxWidth: '500px',
                        padding: 3,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[24]
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                            Edit Tour
                        </Typography>
                        <IconButton onClick={closeEditModal} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Scheme</InputLabel>
                            <Select
                                value={editSelectedScheme}
                                label="Scheme"
                                onChange={(e) => setEditSelectedScheme(e.target.value)}
                            >
                                {schemes.map((scheme) => (
                                    <MenuItem key={scheme.id} value={scheme.id}>
                                        {scheme.schemeName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Purpose of Tour</InputLabel>
                            <Select
                                value={editFormData.purpose}
                                label="Purpose of Tour"
                                onChange={(e) => handleEditInputChange('purpose', e.target.value)}
                                disabled={!editSelectedScheme}
                            >
                                {purposes.map((purpose) => (
                                    <MenuItem key={purpose.id} value={purpose.id}>
                                        {purpose.purposeName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Place of Visit"
                            value={editFormData.place}
                            onChange={(e) => handleEditInputChange('place', e.target.value)}
                            variant="outlined"
                            size="small"
                        />

                        <TextField
                            fullWidth
                            label="Remarks"
                            multiline
                            rows={3}
                            value={editFormData.remarks}
                            onChange={(e) => handleEditInputChange('remarks', e.target.value)}
                            variant="outlined"
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={closeEditModal}
                                sx={{
                                    color: theme.palette.text.primary,
                                    borderColor: theme.palette.divider
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={updateEvent}
                                disabled={editLoading}
                                sx={{
                                    backgroundColor: '#2980b9',
                                    '&:hover': {
                                        backgroundColor: '#1f6391'
                                    }
                                }}
                            >
                                {editLoading ? "Updating..." : "Update"}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Modal>
        </Grid>
    );
};

export default TourDiary;
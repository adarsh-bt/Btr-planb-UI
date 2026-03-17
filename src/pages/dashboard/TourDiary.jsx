import React, { useState, useEffect } from 'react';
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
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Menu,
    MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import tourDiaryService from 'pages/authentication/services/tourdiaryservice';
import authservice from 'pages/authentication/services/authservice';

const TourDiary = () => {
    const theme = useTheme();

    // ============================ STATE MANAGEMENT ============================
    // Date states
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Event states
    const [tourEvents, setTourEvents] = useState([]);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Active halves state
    const [activeHalves, setActiveHalves] = useState({
        firstHalf: 0,
        secondHalf: 0
    });

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Form states
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

    // Entry type states
    const [entryType, setEntryType] = useState('WORKING');
    const [editEntryType, setEditEntryType] = useState('WORKING');

    // Selection states
    const [selectedScheme, setSelectedScheme] = useState('');
    const [editSelectedScheme, setEditSelectedScheme] = useState('');

    // Data states
    const [schemes, setSchemes] = useState([]);
    const [purposes, setPurposes] = useState([]); // For form dropdowns
    const [allPurposes, setAllPurposes] = useState([]); // For displaying in lists

    // Loading states
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [halvesLoading, setHalvesLoading] = useState(false);

    // Add these half submission states
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        half: null
    });

    // Menu states
    const [submitAnchorEl, setSubmitAnchorEl] = useState(null);

    // Notification state
    const [notification, setNotification] = useState({
        open: false,
        type: 'success',
        message: ''
    });

    // Delete dialog state
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        eventId: null
    });

    // ============================ CONSTANTS ============================
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const ENTRY_TYPES = [
        { value: 'WORKING', label: 'WORKING' },
        { value: 'WEEK_OFF', label: 'WEEK OFF' },
        { value: 'HOLIDAY', label: 'Holiday' },
        { value: 'LEAVE', label: 'Leave' },
        { value: 'TRAINING', label: 'Training' },
        { value: 'OTHER', label: 'Others' },
    ];

    // ============================ HELPER FUNCTIONS ============================
    const isSunday = (year, month, day) => {
        const date = new Date(year, month, day);
        return date.getDay() === 0;
    };

    const isSecondSaturday = (year, month, day) => {
        const date = new Date(year, month, day);
        if (date.getDay() !== 6) return false;

        const firstDayOfMonth = new Date(year, month, 1);
        const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
        const secondSaturday = firstSaturday + 7;

        return day === secondSaturday;
    };

    const formatDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const parseDateKey = (dateKey) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        return { year, month: month - 1, day };
    };

    const hasEventsOnDay = (year, month, day) => {
        return tourEvents.some(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day;
        });
    };

    const getEventCountForDay = (year, month, day) => {
        return tourEvents.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day;
        }).length;
    };

    const getPreviousMonth = () => {
        const prevDate = new Date(currentDate);
        prevDate.setMonth(currentDate.getMonth() - 1);
        return prevDate.toLocaleString('default', { month: 'long' });
    };

    // ============================ API CALLS ============================
    const fetchTourData = async () => {
        const userId = authservice.userid();
        if (!userId) return;

        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        try {
            const data = await tourDiaryService.getAdvancedTourByFilter(userId, month, year);
            if (Array.isArray(data)) {
                console.log("Fetched tour data:", data);
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

    const fetchSchemes = async () => {
        const data = await tourDiaryService.getAllSchemes();
        if (!data.message) {
            setSchemes(data);
        }
    };

    const fetchActiveHalves = async () => {
        setHalvesLoading(true);
        try {
            const data = await tourDiaryService.getActiveHalves();
            if (!data.message) {
                setActiveHalves({
                    firstHalf: data.firstHalf || 0,
                    secondHalf: data.secondHalf || 0
                });
            }
        } catch (error) {
            console.error("Error fetching active halves:", error);
        } finally {
            setHalvesLoading(false);
        }
    };

    // Fetch all purposes from all schemes
    const fetchAllPurposes = async () => {
        if (schemes.length === 0) return;
        
        try {
            const allPurposesData = [];
            // Fetch purposes for each scheme
            for (const scheme of schemes) {
                const data = await tourDiaryService.getActivePurposes(scheme.id);
                if (data && !data.message && Array.isArray(data)) {
                    allPurposesData.push(...data);
                }
            }
            
            // Remove duplicates based on id
            const uniquePurposes = Array.from(
                new Map(allPurposesData.map(p => [p.id, p])).values()
            );
            
            setAllPurposes(uniquePurposes);
            console.log("All purposes loaded:", uniquePurposes);
        } catch (error) {
            console.error("Error fetching all purposes:", error);
        }
    };

    // ============================ EFFECTS ============================
    useEffect(() => {
        fetchSchemes();
        fetchActiveHalves();
    }, []);

    // Fetch all purposes when schemes are loaded
    useEffect(() => {
        if (schemes.length > 0) {
            fetchAllPurposes();
        }
    }, [schemes]);

    // Add another useEffect to refresh active halves when month changes
    useEffect(() => {
        fetchActiveHalves(); // Refresh when month changes
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

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

    useEffect(() => {
        fetchTourData();
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    // ============================ NOTIFICATION HANDLERS ============================
    const showNotification = (type, message) => {
        setNotification({
            open: true,
            type,
            message
        });
    };

    const closeNotification = () => {
        setNotification({
            ...notification,
            open: false
        });
    };

    // ============================ DELETE DIALOG HANDLERS ============================
    const openDeleteDialog = (id) => {
        setDeleteDialog({
            open: true,
            eventId: id
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            open: false,
            eventId: null
        });
    };
    

    // ============================ MENU HANDLERS ============================
    const openSubmitMenu = (event) => {
        setSubmitAnchorEl(event.currentTarget);
    };

    const closeSubmitMenu = () => {
        setSubmitAnchorEl(null);
    };

    // ============================ HALF SUBMIT ============================

    // const handleSubmitHalf = (half) => {
    //     console.log("Submitting:", half);
    //     // TODO: Call your API here
    //     closeSubmitMenu();
    //     showNotification('success', `${half} submitted successfully`);
    // };

    // Add submit function
    const handleSubmitHalf = async (half) => {
        setSubmitDialog({
            open: true,
            half: half
        });
        closeSubmitMenu();
    };

    // Add confirmation submit function
    // Add this function to handle the response correctly
    const confirmSubmit = async () => {
        const zoneId = Number(authservice.getzone());
        const userId = authservice.userid();
        
        if (!zoneId || !userId) {
            showNotification('error', 'User session expired. Please login again.');
            return;
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // Map "First Half"/"Second Half" to API expected values
        const periodType = submitDialog.half === 'First Half' ? 'FIRST_HALF' : 'SECOND_HALF';

        const payload = {
            periodType: periodType,
            zoneId: zoneId,
            month: month,
            year: year,
            userId: userId
        };

        console.log("Submitting payload:", payload);

        try {
            setSubmitLoading(true);
            const response = await tourDiaryService.submitTourHalf(payload);
            
            // Handle string response (success or error message)
            if (typeof response === 'string') {
                // Check if it's a success message (contains 'successfully')
                if (response.toLowerCase().includes('successfully')) {
                    showNotification('success', response);
                    // Refresh active halves after successful submission
                    await fetchActiveHalves();
                    // Optionally refresh tour data
                    await fetchTourData();
                } else {
                    showNotification('error', response);
                }
            } 
            // Handle object response (if your API returns objects for errors)
            else if (response.message) {
                showNotification('error', response.message);
            } else {
                showNotification('success', 'Submitted successfully');
                await fetchActiveHalves();
                await fetchTourData();
            }
            
            setSubmitDialog({ open: false, half: null });
        } catch (error) {
            console.error("Submit error:", error);
            showNotification('error', error.response?.data || 'Failed to submit');
        } finally {
            setSubmitLoading(false);
        }
    };

    // ============================ CALENDAR HANDLERS ============================
    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const openModal = (dateKey) => {
        setEntryType('WORKING');
        setSelectedScheme('');
        setSelectedDate(dateKey);

        const { year, month, day } = parseDateKey(dateKey);
        const dayEvents = tourEvents.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day;
        });

        setSelectedDayEvents(dayEvents);
        setFormData({ place: '', purpose: '', remarks: '' });
        setActiveTab(dayEvents.length > 0 ? 1 : 0);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedDate(null);
        setSelectedDayEvents([]);
        setFormData({ place: '', purpose: '', remarks: '' });
        setActiveTab(0);
        setSelectedScheme('');
    };

    const openEditModal = async (event) => {
        setSelectedEvent(event);
        setEditEntryType(event.entryType || 'WORKING');

        setEditFormData({
            id: event.id,
            place: event.location || '',
            purpose: event.purposeId || '',
            remarks: event.remark || ''
        });

        if (event.entryType === 'WORKING' && event.purposeId) {
            try {
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
        } else {
            setEditSelectedScheme('');
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
        setEditSelectedScheme('');
    };

    // ============================ CRUD OPERATIONS ============================
    const saveEvent = async () => {
        if (!selectedDate) return;

        if (entryType === 'WORKING') {
            if (!formData.purpose || !formData.place || !selectedScheme) {
                showNotification('error', 'Please fill all required fields');
                return;
            }
        }

        const userId = authservice.userid();
        const zoneId = Number(authservice.getzone());

        if (!userId || !zoneId) {
            showNotification('error', 'User session expired. Please login again.');
            return;
        }

        const { year, month, day } = parseDateKey(selectedDate);
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:30:00`;

        const payload = {
            purposeId: entryType === 'WORKING' ? Number(formData.purpose) : null,
            userId: userId,
            location: entryType === 'WORKING' ? formData.place : '',
            remark: formData.remarks,
            status: "DRAFT",
            zoneId: zoneId,
            createdAt: formattedDate,
            entryType: entryType
        };

        if (entryType === 'WORKING') {
            payload.purposeId = Number(formData.purpose);
            payload.location = formData.place;
        }

        console.log("Saving Payload:", payload);

        try {
            setLoading(true);
            const response = await tourDiaryService.saveOrUpdateTour(payload);

            if (response.id) {
                // ✅ FIX: Create a complete event object with ALL data
                const completeEvent = {
                    id: response.id,
                    purposeId: entryType === 'WORKING' ? Number(formData.purpose) : null,
                    location: entryType === 'WORKING' ? formData.place : '',
                    remark: formData.remarks,
                    userId: userId,
                    zoneId: zoneId,
                    createdAt: formattedDate,
                    entryType: entryType,
                    status: "DRAFT"
                };

                const updatedTourEvents = [...tourEvents, completeEvent];
                setTourEvents(updatedTourEvents);

                const { year, month, day } = parseDateKey(selectedDate);
                const updatedDayEvents = updatedTourEvents.filter(event => {
                    const eventDate = new Date(event.createdAt);
                    return eventDate.getFullYear() === year &&
                        eventDate.getMonth() === month &&
                        eventDate.getDate() === day;
                });

                setSelectedDayEvents(updatedDayEvents);
                setFormData({ place: '', purpose: '', remarks: '' });
                setActiveTab(1);
                showNotification('success', 'Tour saved successfully');
            } else {
                alert(response.message || "Failed to save tour");
            }
        } catch (error) {
            showNotification('error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const updateEvent = async () => {
        if (editEntryType === 'WORKING') {
            if (!editFormData.purpose || !editFormData.place || !editSelectedScheme) {
                showNotification('error', 'Please fill all required fields');
                return;
            }
        }

        const userId = authservice.userid();
        const zoneId = Number(authservice.getzone());

        if (!userId || !zoneId) {
            alert("User session expired. Please login again.");
            return;
        }

        const originalEvent = selectedEvent;
        const createdAt = originalEvent?.createdAt;

        const payload = {
            id: editFormData.id,
            purposeId: editEntryType === 'WORKING' ? Number(editFormData.purpose) : null,
            userId: userId,
            location: editEntryType === 'WORKING' ? editFormData.place : '',
            remark: editFormData.remarks,
            status: "DRAFT",
            zoneId: zoneId,
            createdAt: createdAt,
            entryType: editEntryType
        };

        if (editEntryType === 'WORKING') {
            payload.purposeId = Number(editFormData.purpose);
            payload.location = editFormData.place;
        }

        console.log("Updating Payload:", payload);

        try {
            setEditLoading(true);
            const response = await tourDiaryService.saveOrUpdateTour(payload);

            if (response.id) {
                // ✅ FIX: Create a complete updated event object with ALL data
                const completeEvent = {
                    id: response.id,
                    purposeId: editEntryType === 'WORKING' ? Number(editFormData.purpose) : null,
                    location: editEntryType === 'WORKING' ? editFormData.place : '',
                    remark: editFormData.remarks,
                    userId: userId,
                    zoneId: zoneId,
                    createdAt: createdAt,
                    entryType: editEntryType,
                    status: "DRAFT"
                };

                const updatedTourEvents = tourEvents.map(event =>
                    event.id === completeEvent.id ? completeEvent : event
                );
                setTourEvents(updatedTourEvents);

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
                showNotification('success', 'Tour updated successfully');
            } else {
                showNotification('error', response.message || "Failed to update tour");
            }
        } catch (error) {
            showNotification('error', 'Something went wrong');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!eventId) return;

        try {
            setDeleteLoading(true);
            const response = await tourDiaryService.deleteAdvancedTour(eventId);

            if (!response.message) {
                const updatedTourEvents = tourEvents.filter(
                    event => event.id !== eventId
                );
                setTourEvents(updatedTourEvents);

                if (selectedDate) {
                    const { year, month, day } = parseDateKey(selectedDate);
                    const updatedDayEvents = updatedTourEvents.filter(event => {
                        const eventDate = new Date(event.createdAt);
                        return eventDate.getFullYear() === year &&
                            eventDate.getMonth() === month &&
                            eventDate.getDate() === day;
                    });
                    setSelectedDayEvents(updatedDayEvents);

                    if (updatedDayEvents.length === 0) {
                        closeModal();
                    }
                }

                showNotification('success', 'Tour deleted successfully');
                closeDeleteDialog();
            } else {
                showNotification('error', response.message);
            }
        } catch (error) {
            showNotification('error', 'Failed to delete tour');
        } finally {
            setDeleteLoading(false);
        }
    };

    // ============================ FORM HANDLERS ============================
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

    // ============================ RENDER FUNCTIONS ============================
    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Calculate the 15th day of the month
        const fifteenthDay = 15;

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

            const isSun = isSunday(year, month, day);
            const is2ndSat = isSecondSaturday(year, month, day);

            // Determine if day is in First Half (1-15) or Second Half (16 onwards)
            const isFirstHalf = day <= fifteenthDay;
            const isSecondHalf = day > fifteenthDay;

            let backgroundColor = theme.palette.background.paper;
            let hoverColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f9ff';

            // Apply half-specific background colors
            if (isFirstHalf) {
                // Light blue for First Half
                backgroundColor = theme.palette.mode === 'dark' ? '#1a2a3a' : '#e3f2fd';
            } else if (isSecondHalf) {
                // Light green for Second Half
                backgroundColor = theme.palette.mode === 'dark' ? '#1a3a2a' : '#e8f5e9';
            }

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
                        title={`${isFirstHalf ? 'First Half' : 'Second Half'}${isSun ? ' - Sunday' : is2ndSat ? ' - Second Saturday' : ''}`}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

                        {/* Add FH/SH label */}
                        <Chip
                            label={isFirstHalf ? 'FH' : 'SH'}
                            size="small"
                            sx={{
                                height: '20px',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                backgroundColor: isFirstHalf 
                                    ? (theme.palette.mode === 'dark' ? '#1976d2' : '#bbdefb')
                                    : (theme.palette.mode === 'dark' ? '#2e7d32' : '#c8e6c9'),
                                color: isFirstHalf 
                                    ? (theme.palette.mode === 'dark' ? '#fff' : '#0d47a1')
                                    : (theme.palette.mode === 'dark' ? '#fff' : '#1b5e20'),
                                '& .MuiChip-label': {
                                    px: 0.5
                                }
                            }}
                        />
                    </Box>

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
                                        minWidth: '28px',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '4px',
                                        padding: 0,
                                        '&:hover': {
                                            backgroundColor: '#1e8449'
                                        }
                                    }}
                                >
                                    <CheckIcon sx={{ fontSize: '18px' }} />
                                </Button>
                                {eventCount > 1 && (
                                    <Chip
                                        label={`${eventCount}`}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: -20,
                                            right: -20,
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            height: '22px',
                                            minWidth: '22px',
                                            width: 'auto',
                                            padding: eventCount >= 10 ? '0 4px' : '0 6px',
                                            borderRadius: '12px',
                                            '& .MuiChip-label': {
                                                padding: '0 4px'
                                            }
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

        // Helper function to get purpose name by ID from allPurposes
        const getPurposeName = (purposeId) => {
            if (!purposeId) return null;
            const purpose = allPurposes.find(p => p.id === purposeId);
            return purpose ? purpose.purposeName : 'Unknown Purpose';
        };

        // Helper function to get scheme name by purpose ID
        const getSchemeNameForPurpose = (purposeId) => {
            if (!purposeId) return null;
            // Find the scheme that contains this purpose
            for (const scheme of schemes) {
                if (scheme.purposes && scheme.purposes.some(p => p.id === purposeId)) {
                    return scheme.schemeName;
                }
            }
            return null;
        };

        return (
            <List sx={{ mt: 2 }} key={`event-list-${selectedDayEvents.length}`}>
                {selectedDayEvents.map((event, index) => (
                    <React.Fragment key={event.id}>
                        {index > 0 && <Divider />}
                        <ListItem alignItems="flex-start">
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <EventIcon fontSize="small" color="action" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {/* {event.entryType === 'WORKING' 
                                                ? (event.entryType || 'No Entry Type')
                                                : event.entryType || 'No Type'} */}
                                            {event.entryType == 'WORKING' && (
                                                    <Chip 
                                                        label={event.entryType} 
                                                        size="small"
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                )}
                                                
                                        </Typography>
                                        {event.entryType && event.entryType !== 'WORKING' && (
                                            <Chip 
                                                label={event.entryType} 
                                                size="small"
                                                color="default"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        {/* Show purpose and scheme for WORKING entries */}
                                        {event.entryType === 'WORKING' && (
                                            <>
                                                {event.purposeId && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                                                        <strong>Purpose:</strong> 
                                                        {getPurposeName(event.purposeId)}
                                                    </Typography>
                                                )}
                                                
                                                {event.location && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Location:</strong> {event.location}
                                                    </Typography>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Show remarks if available */}
                                        {event.remark && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                <strong>Remark:</strong> {event.remark}
                                            </Typography>
                                        )}
                                        
                                        {/* Show creation date/time */}
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                            {new Date(event.createdAt).toLocaleDateString()}
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
                                        onClick={() => openDeleteDialog(event.id)}
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

    // ============================ MAIN RENDER ============================
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
                                marginBottom: 2,
                                position: 'relative',
                                minHeight: '70px'
                            }}
                        >
                            {/* Left section with fixed width to match right section */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                width: '350px', // Fixed width to match right section
                                justifyContent: 'flex-start'
                            }}>
                                <Button
                                    variant="contained"
                                    onClick={() => changeMonth(-1)}
                                    startIcon={<ArrowBackIosNewIcon />}
                                    sx={{
                                        backgroundColor: '#2980b9',
                                        '&:hover': { backgroundColor: '#1f6391' },
                                        whiteSpace: 'nowrap',
                                        minWidth: '80px'
                                    }}
                                >
                                    Prev
                                </Button>

                                {/* Active Halves Card */}
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 1.5,
                                        minWidth: '240px',
                                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f8f9fa',
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 2
                                    }}
                                >
                                    {halvesLoading ? (
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Loading...
                                        </Typography>
                                    ) : (
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                First Half submit on {getPreviousMonth()} {activeHalves.firstHalf}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                Second Half submit on {currentDate.toLocaleString('default', { month: 'long' })} {activeHalves.secondHalf}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>

                            {/* Center - Month/Year - absolutely positioned for perfect centering */}
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: theme.palette.text.primary,
                                    textAlign: 'center',
                                    fontWeight: 500,
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {currentDate.toLocaleString('default', {
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Typography>

                            {/* Right section with fixed width to match left section */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                width: '350px', // Fixed width to match left section
                                justifyContent: 'flex-end'
                            }}>
                                {/* Submit button with menu */}
                                <Box>
                                    <Button
                                        variant="contained"
                                        onClick={openSubmitMenu}
                                        sx={{
                                            backgroundColor: '#27ae60',
                                            '&:hover': { backgroundColor: '#1e8449' },
                                            whiteSpace: 'nowrap',
                                            minWidth: '90px'
                                        }}
                                    >
                                        Submit
                                    </Button>
                                    <Menu
                                        anchorEl={submitAnchorEl}
                                        open={Boolean(submitAnchorEl)}
                                        onClose={closeSubmitMenu}
                                    >
                                        <MenuItem onClick={() => handleSubmitHalf('First Half')}>
                                            First Half
                                        </MenuItem>
                                        <MenuItem onClick={() => handleSubmitHalf('Second Half')}>
                                            Second Half
                                        </MenuItem>
                                    </Menu>
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={() => changeMonth(1)}
                                    endIcon={<ArrowForwardIosIcon />}
                                    sx={{
                                        backgroundColor: '#2980b9',
                                        '&:hover': { backgroundColor: '#1f6391' },
                                        whiteSpace: 'nowrap',
                                        minWidth: '80px'
                                    }}
                                >
                                    Next
                                </Button>
                            </Box>
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

            {/* ==================== MAIN MODAL ==================== */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
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
                            Tour Plan – {new Date(selectedDate).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })}
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
                                <InputLabel>Entry Type</InputLabel>
                                <Select
                                    value={entryType}
                                    label="Entry Type"
                                    onChange={(e) => setEntryType(e.target.value)}
                                >
                                    {ENTRY_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Divider sx={{ my: 1 }} />

                            {entryType === 'WORKING' ? (
                                <>
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
                                </>
                            ) : null}

                            <TextField
                                fullWidth
                                label="Remarks"
                                multiline
                                rows={3}
                                value={formData.remarks}
                                onChange={(e) => handleInputChange('remarks', e.target.value)}
                                variant="outlined"
                                placeholder={entryType !== 'WORKING' ? "Add remarks for this entry" : "Add remarks (optional)"}
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
                                        '&:hover': { backgroundColor: '#1e8449' }
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
                                    onClick={() => {
                                        // Reset form data when adding another
                                        setFormData({ place: '', purpose: '', remarks: '' });
                                        setSelectedScheme('');
                                        setEntryType('WORKING');
                                        setActiveTab(0);
                                    }}
                                    startIcon={<AddIcon />}
                                >
                                    Add Another
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={closeModal}
                                    sx={{
                                        backgroundColor: '#2980b9',
                                        '&:hover': { backgroundColor: '#1f6391' }
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Card>
            </Modal>

            {/* ==================== EDIT MODAL ==================== */}
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
                            <InputLabel>Entry Type</InputLabel>
                            <Select
                                value={editEntryType}
                                label="Entry Type"
                                onChange={(e) => setEditEntryType(e.target.value)}
                                /* disabled={selectedEvent?.entryType === 'WORKING'} */
                            >
                                {ENTRY_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 1 }} />

                        {editEntryType === 'WORKING' ? (
                            <>
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
                            </>
                        ) : (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                {editEntryType} entry - only remarks can be edited
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Remarks"
                            multiline
                            rows={3}
                            value={editFormData.remarks}
                            onChange={(e) => handleEditInputChange('remarks', e.target.value)}
                            variant="outlined"
                            placeholder={editEntryType !== 'WORKING' ? "Add remarks for this entry" : "Add remarks (optional)"}
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
                                    '&:hover': { backgroundColor: '#1f6391' }
                                }}
                            >
                                {editLoading ? "Updating..." : "Update"}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Modal>

            {/* ==================== NOTIFICATION DIALOG ==================== */}
            <Dialog
                open={notification.open}
                onClose={closeNotification}
                maxWidth="xs"
                fullWidth
            >
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    {notification.type === 'success' ? (
                        <>
                            <Box
                                sx={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: '50%',
                                    backgroundColor: '#e8f5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    mb: 2
                                }}
                            >
                                <Typography sx={{ fontSize: 40, color: '#2e7d32', fontWeight: 'bold' }}>
                                    ✓
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Success
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: '50%',
                                    backgroundColor: '#fdecea',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    mb: 2
                                }}
                            >
                                <Typography sx={{ fontSize: 40, color: '#d32f2f', fontWeight: 'bold' }}>
                                    ✕
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Error
                            </Typography>
                        </>
                    )}

                    <Typography sx={{ mt: 1 }}>
                        {notification.message}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                        variant="contained"
                        onClick={closeNotification}
                        sx={{
                            backgroundColor: notification.type === 'success' ? '#2e7d32' : '#d32f2f'
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
            <Dialog
                open={deleteDialog.open}
                onClose={closeDeleteDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Delete
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this tour?
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeDeleteDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteEvent(deleteDialog.eventId)}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== SUBMIT CONFIRMATION DIALOG ==================== */}
            <Dialog
                open={submitDialog.open}
                onClose={() => setSubmitDialog({ open: false, half: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm {submitDialog.half} Submission
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Are you sure you want to submit {submitDialog.half?.toLowerCase()} for{' '}
                        {currentDate.toLocaleString('default', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}?
                    </Typography>
                    
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            This will validate and submit all tour entries for this period.
                        </Typography>
                    </Alert>
                    
                    {/* Show warning if late submission */}
                    {activeHalves && submitDialog.half === 'First Half' && 
                    activeHalves.firstHalf < currentDate.getDate() && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Note: First Half submission deadline was on {getPreviousMonth()} {activeHalves.firstHalf}. 
                                This may be marked as LATE.
                            </Typography>
                        </Alert>
                    )}
                    
                    {activeHalves && submitDialog.half === 'Second Half' && 
                    activeHalves.secondHalf < currentDate.getDate() && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Note: Second Half submission deadline is on {currentDate.toLocaleString('default', { month: 'long' })} {activeHalves.secondHalf}. 
                                This may be marked as LATE.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={() => setSubmitDialog({ open: false, half: null })} 
                        variant="outlined"
                        disabled={submitLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmSubmit}
                        variant="contained"
                        disabled={submitLoading}
                        sx={{
                            backgroundColor: '#27ae60',
                            '&:hover': { backgroundColor: '#1e8449' },
                            minWidth: '100px'
                        }}
                    >
                        {submitLoading ? "Submitting..." : "Confirm Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default TourDiary;
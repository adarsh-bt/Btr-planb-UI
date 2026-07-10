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
    MenuItem,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import tourDiaryService from 'pages/authentication/services/tourdiaryservice';
import authservice from 'pages/authentication/services/authservice';

const TourDiary = () => {
    const theme = useTheme();

    const validatePlace = (value) => {
        let filtered = value.replace(/[^a-zA-Z0-9\s.,\-/#'"()\[\]{}@:;!?*+=~`|$%^&]/g, '');
        if (filtered.length > 255) filtered = filtered.slice(0, 255);
        return filtered;
    };

    const validateRemarks = (value) => {
        if (value.length > 1000) return value.slice(0, 1000);
        return value;
    };

    const role = authservice.getrole();
    const isFieldDataCollector = role === "Field Data Collector";

    const handleSubmitClick = (event) => {
    if (isFieldDataCollector) {
        openSubmitMenu(event);
    } else {
        if (submissionView?.fullMonthSubmitted) {
            showNotification('info', `Entry already submitted on ${new Date(submissionView.fullMonthSubmittedDate).toLocaleString()}`);
            return;
        }
        setSubmitDialog({ open: true, half: 'Month' });
    }
};

    // ============================ STATE MANAGEMENT ============================
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [tourEvents, setTourEvents] = useState([]);
    const [selectedDayEvents, setSelectedDayEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeHalves, setActiveHalves] = useState({ firstHalf: 0, secondHalf: 0 });
    const [submissionStatus, setSubmissionStatus] = useState({ firstHalf: null, secondHalf: null, loading: false });
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({ place: '', purpose: '', remarks: '' });
    const [editFormData, setEditFormData] = useState({ id: null, place: '', purpose: '', remarks: '' });
    const [entryType, setEntryType] = useState('WORKING');
    const [editEntryType, setEditEntryType] = useState('WORKING');
    const [selectedScheme, setSelectedScheme] = useState('');
    const [editSelectedScheme, setEditSelectedScheme] = useState('');
    const [assignedZones, setAssignedZones] = useState([]);
    const [selectedZoneId, setSelectedZoneId] = useState(null);
    const [editSelectedZoneId, setEditSelectedZoneId] = useState(null);
    const [zonesLoading, setZonesLoading] = useState(false);
    const [schemes, setSchemes] = useState([]);
    const [purposes, setPurposes] = useState([]);
    const [allPurposes, setAllPurposes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [halvesLoading, setHalvesLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({ open: false, half: null });
    const [submitAnchorEl, setSubmitAnchorEl] = useState(null);
    const [notification, setNotification] = useState({ open: false, type: 'success', message: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, eventId: null });

    const [submissionView, setSubmissionView] = useState(null);
    const [submissionViewLoading, setSubmissionViewLoading] = useState(false);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState(null);

    // ============================ CONSTANTS ============================
    const ENTRY_TYPES = [
        { value: 'WORKING', label: 'WORKING' },
        { value: 'WEEK_OFF', label: 'WEEK OFF' },
        { value: 'HOLIDAY', label: 'Holiday' },
        { value: 'LEAVE', label: 'Leave' },
        { value: 'TRAINING', label: 'Training' },
        { value: 'OTHER', label: 'Others' },
    ];

    const agriYear = localStorage.getItem("activeAgriYear");
    const [startYear, endYear] = agriYear.split('-').map(Number);

    const minDate = new Date(startYear, 6, 1); // July start year
    const maxDate = new Date(endYear, 5, 30);  // June end year

    // ============================ HELPER FUNCTIONS ============================
    const isSunday = (year, month, day) => new Date(year, month, day).getDay() === 0;

    const isSecondSaturday = (year, month, day) => {
        const date = new Date(year, month, day);
        if (date.getDay() !== 6) return false;
        const firstDayOfMonth = new Date(year, month, 1);
        const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
        return day === firstSaturday + 7;
    };

    const formatDateKey = (year, month, day) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const parseDateKey = (dateKey) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        return { year, month: month - 1, day };
    };

    const getPreviousMonth = () => {
        const prevDate = new Date(currentDate);
        prevDate.setMonth(currentDate.getMonth() - 1);
        return prevDate.toLocaleString('default', { month: 'long' });
    };

    const getEventsForDay = (year, month, day) =>
        tourEvents.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getFullYear() === year &&
                eventDate.getMonth() === month &&
                eventDate.getDate() === day;
        });

    const getPurposeName = (purposeId) => {
        if (!purposeId) return '—';
        const purpose = allPurposes.find(p => p.id === purposeId);
        return purpose ? purpose.purposeName : 'Unknown';
    };

    const getSchemeNameFromPurpose = (purposeId) => {
    if (!purposeId) return '—';
    const purpose = allPurposes.find(p => p.id === purposeId);
    if (!purpose) return '—';
    const scheme = schemes.find(s => s.id === purpose.schemeId);
    return scheme ? scheme.schemeName : '—';
};

    const getSchemeName = (purposeId) => {
        if (!purposeId) return '—';
        for (const scheme of schemes) {
            // We stored allPurposes with their scheme context already
        }
        return '—';
    };

    const getZoneName = (zoneId) => {
        if (!zoneId) return '—';
        const zone = assignedZones.find(z => z.zoneId === zoneId);
        return zone ? zone.zoneName : zoneId;
    };

    // Returns true if the given half has already been submitted and should be locked
    const isHalfLocked = (isFirstHalf) => {
        if (!submissionView) return false;
        return isFirstHalf ? !!submissionView.firstHalfSubmitted : !!submissionView.secondHalfSubmitted;
    };

    // Open view details modal
    const openViewModal = (event) => {
        setViewEvent(event);
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewEvent(null);
    };

    // ============================ API CALLS ============================
    const fetchAssignedZones = async () => {
        const userId = authservice.userid();
        if (!userId) return;
        setZonesLoading(true);
        try {
            const response = await tourDiaryService.getAssignedZones(userId);
            if (response && Array.isArray(response) && response.length > 0) {
                setAssignedZones(response);
                if (response.length === 1) {
                    setSelectedZoneId(response[0].zoneId);
                    setEditSelectedZoneId(response[0].zoneId);
                } else {
                    setSelectedZoneId(null);
                    setEditSelectedZoneId(null);
                }
            } else {
                setAssignedZones([]);
            }
        } catch (error) {
            showNotification('error', 'Failed to fetch assigned zones');
            setAssignedZones([]);
        } finally {
            setZonesLoading(false);
        }
    };

    const fetchTourData = async () => {
        const userId = authservice.userid();
        if (!userId) return;
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        try {
            const response = await tourDiaryService.getAdvancedTourByFilter(userId, month, year);
            if (response && response.payload && Array.isArray(response.payload)) {
                setTourEvents(response.payload);
            } else if (Array.isArray(response)) {
                setTourEvents(response);
            } else {
                setTourEvents([]);
            }
        } catch (error) {
            setTourEvents([]);
            showNotification('error', 'Failed to fetch tour data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchemes = async () => {
        const data = await tourDiaryService.getAllSchemes();
        if (!data.message) setSchemes(data);
    };

    const fetchActiveHalves = async () => {
        setHalvesLoading(true);
        try {
            const data = await tourDiaryService.getActiveHalves();
            if (!data.message) {
                setActiveHalves({ firstHalf: data.firstHalf || 0, secondHalf: data.secondHalf || 0 });
            }
        } catch (error) {
            console.error("Error fetching active halves:", error);
        } finally {
            setHalvesLoading(false);
        }
    };

    const fetchAllPurposes = async () => {
        if (schemes.length === 0) return;
        try {
            const allPurposesData = [];
            for (const scheme of schemes) {
                const data = await tourDiaryService.getActivePurposes(scheme.id);
                if (data && !data.message && Array.isArray(data)) {
                    allPurposesData.push(...data);
                }
            }
            const uniquePurposes = Array.from(new Map(allPurposesData.map(p => [p.id, p])).values());
            setAllPurposes(uniquePurposes);
        } catch (error) {
            console.error("Error fetching all purposes:", error);
        }
    };

    const getUsedPurposesForDate = () => {
        if (!selectedDate) return [];
        
        const { year, month, day } = parseDateKey(selectedDate);
        const dayEvents = getEventsForDay(year, month, day);
        
        // Filter only WORKING entries and get their purpose IDs
        const usedPurposeIds = dayEvents
            .filter(event => event.entryType === 'WORKING' && event.purposeId)
            .map(event => event.purposeId);
        
        return usedPurposeIds;
    };

    // Get used purposes for a specific event's date (excluding the event itself)
const getUsedPurposesForEventDate = (event) => {
    if (!event || !event.createdAt) return [];
    
    const eventDate = new Date(event.createdAt);
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth();
    const day = eventDate.getDate();
    
    const dayEvents = getEventsForDay(year, month, day);
    
    // Filter only WORKING entries and get their purpose IDs, excluding the current event
    const usedPurposeIds = dayEvents
        .filter(e => e.entryType === 'WORKING' && e.purposeId && e.id !== event.id)
        .map(e => e.purposeId);
    
    return usedPurposeIds;
};

    const fetchSubmissionDetails = async () => {
        const userId = authservice.userid();
        if (!userId) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        setSubmissionStatus(prev => ({ ...prev, loading: true }));
        try {
            const response = await tourDiaryService.getAdminSubmissionDetails(userId, year, month);
            if (!response.error && response.data) {
                setSubmissionStatus({
                    firstHalf: {
                        id: response.data.firstHalfId,
                        zoneId: response.data.firstHalfZoneId,
                        startDate: response.data.firstHalfStartDate,
                        endDate: response.data.firstHalfEndDate,
                        isLate: response.data.firstHalfIsLate,
                        submittedAt: response.data.firstHalfSubmittedAt,
                        isSubmitted: !!response.data.firstHalfId
                    },
                    secondHalf: {
                        id: response.data.secondHalfId,
                        zoneId: response.data.secondHalfZoneId,
                        startDate: response.data.secondHalfStartDate,
                        endDate: response.data.secondHalfEndDate,
                        isLate: response.data.secondHalfIsLate,
                        submittedAt: response.data.secondHalfSubmittedAt,
                        isSubmitted: !!response.data.secondHalfId
                    },
                    loading: false
                });
            } else {
                setSubmissionStatus({ firstHalf: { isSubmitted: false }, secondHalf: { isSubmitted: false }, loading: false });
            }
        } catch (error) {
            setSubmissionStatus({ firstHalf: { isSubmitted: false }, secondHalf: { isSubmitted: false }, loading: false });
        }
    };

    const fetchSubmissionView = async () => {
    const userId = authservice.userid();
    if (!userId) return;
    const year = currentDate.getFullYear();
    setSubmissionViewLoading(true);
    try {
        const response = await tourDiaryService.getSubmissionView(userId, year);
        console.log("Submission View API Response:", response);
        if (Array.isArray(response)) {
            const currentMonth = currentDate.getMonth() + 1;
            const monthData = response.find(item => item.month === currentMonth);
            console.log("Current Month Data:", monthData);
            setSubmissionView(monthData || null);
        }
    } catch (error) {
        setSubmissionView(null);
    } finally {
        setSubmissionViewLoading(false);
    }
};

useEffect(() => {
    fetchSubmissionView();
}, [currentDate.getFullYear(), currentDate.getMonth()]);

    // ============================ EFFECTS ============================
    useEffect(() => {
        fetchAssignedZones();
        fetchSchemes();
        fetchActiveHalves();
    }, []);

    useEffect(() => {
        if (schemes.length > 0) fetchAllPurposes();
    }, [schemes]);

    useEffect(() => {
        fetchActiveHalves();
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    useEffect(() => {
        const fetchPurposes = async () => {
            if (selectedScheme) {
                const data = await tourDiaryService.getActivePurposes(selectedScheme);
                if (!data.message) setPurposes(data);
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
                if (!data.message) setPurposes(data);
            } else {
                setPurposes([]);
            }
        };
        fetchPurposesForEdit();
    }, [editSelectedScheme]);

    useEffect(() => {
        fetchTourData();
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [currentDate.getFullYear(), currentDate.getMonth()]);

    // ============================ NOTIFICATION HANDLERS ============================
    const showNotification = (type, message) => setNotification({ open: true, type, message });
    const closeNotification = () => setNotification(prev => ({ ...prev, open: false }));

    // ============================ DELETE DIALOG HANDLERS ============================
    const openDeleteDialog = (id) => setDeleteDialog({ open: true, eventId: id });
    const closeDeleteDialog = () => setDeleteDialog({ open: false, eventId: null });

    // ============================ MENU HANDLERS ============================
    const openSubmitMenu = (event) => setSubmitAnchorEl(event.currentTarget);
    const closeSubmitMenu = () => setSubmitAnchorEl(null);

    // ============================ HALF SUBMIT ============================
    const handleSubmitHalf = async (half) => {
    if (half === 'First Half' && submissionView?.firstHalfSubmitted) {
        showNotification('info', `First Half already submitted on ${new Date(submissionView.firstHalfSubmittedDate).toLocaleString()}`);
        closeSubmitMenu();
        return;
    }
    if (half === 'Second Half' && submissionView?.secondHalfSubmitted) {
        showNotification('info', `Second Half already submitted on ${new Date(submissionView.secondHalfSubmittedDate).toLocaleString()}`);
        closeSubmitMenu();
        return;
    }
    setSubmitDialog({ open: true, half });
    closeSubmitMenu();
};

    const confirmSubmit = async () => {
    const userId = authservice.userid();
    if (!userId) {
        showNotification('error', 'User not authenticated');
        return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    let submissionType;
    let zoneId = null;

    if (isFieldDataCollector) {
        submissionType = submitDialog.half === 'First Half' ? 'FIRST_HALF' : 'SECOND_HALF';
        zoneId = Number(authservice.getzone());
        if (!zoneId) {
            showNotification('error', 'No zone assigned.');
            return;
        }
    } else {
        // Other roles submit the whole month, zoneId is not mandatory
        submissionType = 'FULL_MONTH';
        const rawZone = authservice.getzone();
        zoneId = rawZone ? Number(rawZone) : null; // send if available, but don't block on it
    }

    const payload = {
        submissionType,
        month,
        year,
        userId,
        ...(zoneId ? { zoneId } : {})
    };

    try {
        setSubmitLoading(true);
        const response = await tourDiaryService.submitTourHalf(payload);

        if (typeof response === 'string') {
            if (response.toLowerCase().includes('successfully')) {
                showNotification('success', response);

                const currentDateStr = new Date().toISOString();

                if (submitDialog.half === 'First Half') {
                    setSubmissionStatus(prev => ({
                        ...prev,
                        firstHalf: { isSubmitted: true, isLate: false, submittedAt: currentDateStr, zoneId }
                    }));
                } else if (submitDialog.half === 'Second Half') {
                    setSubmissionStatus(prev => ({
                        ...prev,
                        secondHalf: { isSubmitted: true, isLate: false, submittedAt: currentDateStr, zoneId }
                    }));
                }

                await fetchActiveHalves();
                await fetchSubmissionView();
                await fetchTourData();
            } else {
                showNotification('error', response);
            }
        } else if (response.message) {
            showNotification('error', response.message);
        } else {
            showNotification('success', 'Submitted successfully');
            await fetchActiveHalves();
            await fetchSubmissionView();
            await fetchTourData();
        }
        setSubmitDialog({ open: false, half: null });
    } catch (error) {
        showNotification('error', error.response?.data || 'Failed to submit');
    } finally {
        setSubmitLoading(false);
    }
};

    // ============================ CALENDAR HANDLERS ============================
    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        if (newDate >= minDate && newDate <= maxDate) {
        setCurrentDate(newDate);
    }
};

    // Open modal for a given date key (add mode)
    const openAddModal = (dateKey) => {
    const { day } = parseDateKey(dateKey);
    const isFirstHalfDay = day <= 15;
    if (isHalfLocked(isFirstHalfDay)) {
        showNotification('info', `${isFirstHalfDay ? 'First' : 'Second'} Half has already been submitted. You cannot add entries for this period.`);
        return;
    }
    setEntryType('WORKING');
    setSelectedScheme('');
    setSelectedDate(dateKey);
    const { year, month, day: d } = parseDateKey(dateKey);
    const dayEvents = getEventsForDay(year, month, d);
    setSelectedDayEvents(dayEvents);
    setFormData({ place: '', purpose: '', remarks: '' });
    setActiveTab(0);
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
        if (event.createdAt) {
        const eventDay = new Date(event.createdAt).getDate();
        const isFirstHalfDay = eventDay <= 15;
        if (isHalfLocked(isFirstHalfDay)) {
            showNotification('info', `${isFirstHalfDay ? 'First' : 'Second'} Half has already been submitted. You cannot edit entries for this period.`);
            return;
        }
    }
    setSelectedEvent(event);
    setEditEntryType(event.entryType || 'WORKING');
    setEditFormData({ id: event.id, place: event.location || '', purpose: event.purposeId || '', remarks: event.remark || '' });

    // Store the date from the event
    if (event.createdAt) {
        const eventDate = new Date(event.createdAt);
        const dateKey = formatDateKey(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        setSelectedDate(dateKey); // This is important for the edit modal to know the date
    }

    if (event.zoneId) setEditSelectedZoneId(event.zoneId);
    else setEditSelectedZoneId(selectedZoneId);

    if (event.entryType === 'WORKING' && event.purposeId) {
        // Find the scheme from the purpose
        const purpose = allPurposes.find(p => p.id === event.purposeId);
        if (purpose && purpose.schemeId) {
            setEditSelectedScheme(purpose.schemeId);
            // Fetch purposes for this scheme
            const purposesData = await tourDiaryService.getActivePurposes(purpose.schemeId);
            if (purposesData && !purposesData.message) {
                setPurposes(purposesData);
            }
        } else {
            setEditSelectedScheme('');
        }
    } else {
        setEditSelectedScheme('');
    }
    setEditModalOpen(true);
};

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedEvent(null);
        setEditFormData({ id: null, place: '', purpose: '', remarks: '' });
        setEditSelectedScheme('');
    };

    // ============================ CRUD OPERATIONS ============================
    // In the saveEvent function, modify the zoneIdToUse logic:

const saveEvent = async () => {
    if (!selectedDate) return;
    
    // For non-field collectors, use a default zone or the first assigned zone
    let zoneIdToUse;
    if (!isFieldDataCollector) {
        // For non-field collectors, get the first assigned zone or use a default
        if (assignedZones.length > 0) {
            zoneIdToUse = assignedZones[0].zoneId;
        } else {
            // If no zones assigned, use a default or handle appropriately
            // You might want to use the user's default zone from auth
            zoneIdToUse = Number(authservice.getzone()) || null;
        }
    } else {
        // For field collectors, use selected zone or first available
        zoneIdToUse = selectedZoneId || (assignedZones.length === 1 ? assignedZones[0].zoneId : null);
    }

    // Only validate zone for field data collectors
    if (isFieldDataCollector && entryType === 'WORKING') {
        if (!formData.purpose || !formData.place || !selectedScheme) {
            showNotification('error', 'Please fill all required fields');
            return;
        }
        if (!zoneIdToUse) {
            showNotification('error', 'Please select a zone');
            return;
        }
    } else if (!isFieldDataCollector && entryType === 'WORKING') {
        // For non-field collectors, only validate purpose, place, scheme
        if (!formData.purpose || !formData.place || !selectedScheme) {
            showNotification('error', 'Please fill all required fields');
            return;
        }
        // If zoneIdToUse is null, set a default or get from auth
        if (!zoneIdToUse) {
            zoneIdToUse = Number(authservice.getzone()); // Use a default zone ID
        }
    } else {
        // For non-WORKING entries, still need zoneId
        if (!zoneIdToUse) {
            zoneIdToUse = Number(authservice.getzone()); // Use a default zone ID
        }
    }

    // The rest of the function remains the same...
    const userId = authservice.userid();
    if (!userId) {
        showNotification('error', 'User not authenticated');
        return;
    }

    const { year, month, day } = parseDateKey(selectedDate);
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:30:00`;

    const payload = {
        purposeId: entryType === 'WORKING' ? Number(formData.purpose) : null,
        userId,
        location: entryType === 'WORKING' ? formData.place : '',
        remark: formData.remarks,
        status: "DRAFT",
        zoneId: zoneIdToUse,
        createdAt: formattedDate,
        entryType
    };

    try {
        setLoading(true);
        const response = await tourDiaryService.saveOrUpdateTour(payload);
        if (response.id) {
            const completeEvent = {
                id: response.id,
                purposeId: entryType === 'WORKING' ? Number(formData.purpose) : null,
                location: entryType === 'WORKING' ? formData.place : '',
                remark: formData.remarks,
                userId,
                zoneId: zoneIdToUse,
                createdAt: formattedDate,
                entryType,
                status: "DRAFT"
            };
            const updatedTourEvents = [...tourEvents, completeEvent];
            setTourEvents(updatedTourEvents);
            const updatedDayEvents = updatedTourEvents.filter(event => {
                const eventDate = new Date(event.createdAt);
                return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
            });
            setSelectedDayEvents(updatedDayEvents);
            setFormData({ place: '', purpose: '', remarks: '' });
            setActiveTab(0);
            closeModal();
            showNotification('success', 'Tour saved successfully');
        } else {
            showNotification('error', response.message || "Failed to save tour");
        }
    } catch (error) {
        showNotification('error', 'Something went wrong');
    } finally {
        setLoading(false);
    }
};

    // In the updateEvent function:
const updateEvent = async () => {
    // For non-field collectors, use a default zone
    let zoneIdToUse;
    if (!isFieldDataCollector) {
        if (assignedZones.length > 0) {
            zoneIdToUse = assignedZones[0].zoneId;
        } else {
            zoneIdToUse = Number(authservice.getzone()) || 1;
        }
    } else {
        zoneIdToUse = editSelectedZoneId || selectedZoneId;
    }

    if (editEntryType === 'WORKING') {
        if (!editFormData.purpose || !editFormData.place || !editSelectedScheme) {
            showNotification('error', 'Please fill all required fields');
            return;
        }
        if (isFieldDataCollector && !zoneIdToUse) {
            showNotification('error', 'Please select a zone');
            return;
        }
    }

    // Non-field collectors don't need zone validation, but need zoneId for the payload
    if (!zoneIdToUse) {
        zoneIdToUse = Number(authservice.getzone()) || 1;
    }

    const userId = authservice.userid();
    if (!userId) {
        showNotification('error', 'User not authenticated');
        return;
    }

    const originalEvent = selectedEvent;
    const createdAt = originalEvent?.createdAt;

    const payload = {
        id: editFormData.id,
        purposeId: editEntryType === 'WORKING' ? Number(editFormData.purpose) : null,
        userId,
        location: editEntryType === 'WORKING' ? editFormData.place : '',
        remark: editFormData.remarks,
        status: "DRAFT",
        zoneId: zoneIdToUse,
        createdAt,
        entryType: editEntryType
    };

    try {
        setEditLoading(true);
        const response = await tourDiaryService.saveOrUpdateTour(payload);
        if (response.id) {
            const completeEvent = {
                id: response.id,
                purposeId: editEntryType === 'WORKING' ? Number(editFormData.purpose) : null,
                location: editEntryType === 'WORKING' ? editFormData.place : '',
                remark: editFormData.remarks,
                userId,
                zoneId: zoneIdToUse,
                createdAt,
                entryType: editEntryType,
                status: "DRAFT"
            };
            const updatedTourEvents = tourEvents.map(event => event.id === completeEvent.id ? completeEvent : event);
            setTourEvents(updatedTourEvents);
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
                const updatedTourEvents = tourEvents.filter(event => event.id !== eventId);
                setTourEvents(updatedTourEvents);
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
    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleEditInputChange = (field, value) => setEditFormData(prev => ({ ...prev, [field]: value }));

    // ============================ TABLE RENDER ============================
    const renderTableRows = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const rows = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = formatDateKey(year, month, day);
            const isSun = isSunday(year, month, day);
            const is2ndSat = isSecondSaturday(year, month, day);
            const isFirstHalf = day <= 15;
            const dateObj = new Date(year, month, day);
            const dayName = dateObj.toLocaleString('default', { weekday: 'short' });
            const dayEvents = getEventsForDay(year, month, day);

            let rowBg = 'transparent';
            if (isSun) rowBg = theme.palette.mode === 'dark' ? '#4a2a2a' : '#ffe6e6';
            else if (is2ndSat) rowBg = theme.palette.mode === 'dark' ? '#4a3a2a' : '#fff4e6';
            else if (isFirstHalf) rowBg = theme.palette.mode === 'dark' ? '#1a2a3a' : '#e3f2fd';
            else rowBg = theme.palette.mode === 'dark' ? '#1a3a2a' : '#e8f5e9';

            const dateLabel = (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: (isSun || is2ndSat) ? '#d32f2f' : 'inherit' }}>
                        {String(day).padStart(2, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: (isSun || is2ndSat) ? '#d32f2f' : 'text.secondary' }}>
                        {dayName}
                    </Typography>
                </Box>
            );

            const halfChip = (
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
                        '& .MuiChip-label': { px: 0.5 }
                    }}
                />
            );

            // In the renderTableRows function, for no entries case:
            if (dayEvents.length === 0) {
                // Calculate the correct colSpan based on role
                let colSpan = 5; // Default for non-field collectors (Entry Type, Scheme, Purpose, Place, Remarks)
                if (isFieldDataCollector) {
                    colSpan = 5; // Still 5 because FH/SH and Zone are separate columns
                }
                
                rows.push(
                    <TableRow key={`day-${day}`} sx={{ backgroundColor: rowBg, '&:hover': { filter: 'brightness(0.97)' } }}>
                        <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap', borderBottom: `1px solid ${theme.palette.divider}` }}>
                            {dateLabel}
                        </TableCell>
                        {isFieldDataCollector && (
                            <TableCell sx={{ py: 1, px: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                {halfChip}
                            </TableCell>
                        )}
                        {isFieldDataCollector && (
                            <TableCell sx={{ py: 1, px: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="caption" color="text.disabled">—</Typography>
                            </TableCell>
                        )}
                        <TableCell colSpan={colSpan} sx={{ py: 1, px: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                No entries
                            </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 1, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                            {/* empty actions */}
                        </TableCell>
                        <TableCell sx={{ py: 1, px: 1, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Tooltip title={isHalfLocked(isFirstHalf) ? `${isFirstHalf ? 'First' : 'Second'} Half submitted — locked` : "Add entry"}>
                                <IconButton
                                    size="small"
                                    onClick={() => openAddModal(dateKey)}
                                    disabled={isHalfLocked(isFirstHalf)}
                                    sx={{
                                        backgroundColor: theme.palette.mode === 'dark' ? '#1976d2' : '#1976d2',
                                        color: '#fff',
                                        width: 26,
                                        height: 26,
                                        '&:hover': { backgroundColor: '#1565c0' }
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                );
            }
                else {
                dayEvents.forEach((event, idx) => {
                    const isLast = idx === dayEvents.length - 1;
                    const isFirst = idx === 0;
                    const cellBorderBottom = isLast ? `2px solid ${theme.palette.divider}` : `1px dashed ${theme.palette.divider}`;

                    rows.push(
                        <TableRow
                            key={`event-${event.id}`}
                            sx={{ 
                                backgroundColor: rowBg, 
                                '&:hover': { filter: 'brightness(0.97)' },
                                cursor: 'pointer'
                            }}
                            onClick={() => openViewModal(event)}
                        >
                            {/* Date – only on first row, rowSpan */}
                            {isFirst && (
                                <TableCell
                                    rowSpan={dayEvents.length}
                                    sx={{
                                        py: 1, px: 1.5, whiteSpace: 'nowrap',
                                        verticalAlign: 'middle',
                                        borderBottom: `2px solid ${theme.palette.divider}`
                                    }}
                                >
                                    {dateLabel}
                                </TableCell>
                            )}
                            {/* FH/SH – only on first row */}
                            {isFirst && isFieldDataCollector && (
                                <TableCell
                                    rowSpan={dayEvents.length}
                                    sx={{
                                        py: 1, px: 1,
                                        verticalAlign: 'middle',
                                        borderBottom: `2px solid ${theme.palette.divider}`
                                    }}
                                >
                                    {halfChip}
                                </TableCell>
                            )}
                            {/* Zone */}
                            {isFieldDataCollector && (
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                                <Typography variant="caption">{getZoneName(event.zoneId)}</Typography>
                            </TableCell>
                            )}
                            {/* Entry Type */}
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                                <Chip
                                    label={event.entryType}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.65rem', height: '20px', '& .MuiChip-label': { px: 0.75 } }}
                                />
                            </TableCell>
                            {/* Scheme */}
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                                <Typography variant="caption" color="text.secondary">
                                    {event.entryType === 'WORKING' ? getSchemeNameFromPurpose(event.purposeId) : '—'}
                                </Typography>
                            </TableCell>
                            {/* Purpose */}
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                                <Typography variant="caption">
                                    {event.entryType === 'WORKING' ? getPurposeName(event.purposeId) : '—'}
                                </Typography>
                            </TableCell>
                            {/* Place */}
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                                <Typography variant="caption">
                                    {event.entryType === 'WORKING' ? (event.location || '—') : '—'}
                                </Typography>
                            </TableCell>
                            {/* Remarks */}
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom, maxWidth: 160 }}>
                                <Typography variant="caption" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {event.remark || '—'}
                                </Typography>
                            </TableCell>
                            {/* Actions */}
                            <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom, whiteSpace: 'nowrap' }}>
                                <Tooltip title={isHalfLocked(isFirstHalf) ? "Locked — half submitted" : "Edit"}>
                                    <IconButton size="small" onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(event);
                                        }} 
                                    disabled={deleteLoading || isHalfLocked(isFirstHalf)} 
                                    sx={{ mr: 0.5 }}>
                                        <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={isHalfLocked(isFirstHalf) ? "Locked — half submitted" : "Delete"}>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Add this
                                            if (isHalfLocked(isFirstHalf)) {
                                                    showNotification('info', `${isFirstHalf ? 'First' : 'Second'} Half has already been submitted. You cannot delete entries for this period.`);
                                                    return;
                                                }
                                                openDeleteDialog(event.id);
                                            }}
                                        disabled={deleteLoading || isHalfLocked(isFirstHalf)} 
                                        color="error"
                                    >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            {/* + button — only on last row, spanning all rows */}
                            {/* + button — only on last row */}
                            {isLast && (
                                <TableCell sx={{ py: 1, px: 1, textAlign: 'center', verticalAlign: 'middle', borderBottom: cellBorderBottom }}>
                                    <Tooltip title={isHalfLocked(isFirstHalf) ? `${isFirstHalf ? 'First' : 'Second'} Half submitted — locked` : "Add another entry"}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddModal(dateKey);
                                                }}
                                                disabled={isHalfLocked(isFirstHalf)}
                                                sx={{
                                                    backgroundColor: isHalfLocked(isFirstHalf) ? undefined : '#1976d2',
                                                    color: '#fff',
                                                    width: 26,
                                                    height: 26,
                                                    '&:hover': { backgroundColor: isHalfLocked(isFirstHalf) ? undefined : '#1565c0' }
                                                }}
                                            >
                                                <AddIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            )}
{/* For non-last rows, add an empty cell to maintain table structure */}
{!isLast && (
    <TableCell sx={{ py: 1, px: 1, borderBottom: cellBorderBottom }} />
)}
                        </TableRow>
                    );
                });
            }
        }

        return rows;
    };

    // ============================ MAIN RENDER ============================
    return (
    <Grid container spacing={3}>
        <Breadcrumb />

        <Grid item xs={12}>
            <MainCard>
                <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header - This will now stay on top */}
                    <Box>
                        <Typography variant="h3" align="center" sx={{ marginBottom: 3, color: theme.palette.text.primary }}>
                            Advanced Tour Program
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
                            {/* Your existing header content */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '350px', justifyContent: 'flex-start' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => changeMonth(-1)}
                                    startIcon={<ArrowBackIosNewIcon />}
                                    sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' }, whiteSpace: 'nowrap', minWidth: '80px' }}
                                >
                                    Prev
                                </Button>

                                {isFieldDataCollector ? (
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 1.5,
                                            minWidth: '280px',
                                            backgroundColor: theme.palette.mode === 'dark'
                                                ? theme.palette.grey[800]
                                                : '#f8f9fa',
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2
                                        }}
                                    >
                                        {submissionViewLoading ? (
                                            <Typography variant="body2" color="text.secondary" align="center">
                                                Loading...
                                            </Typography>
                                        ) : (
                                            <Box>
                                                {/* First Half */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            backgroundColor: submissionView?.firstHalfSubmitted ? '#27ae60' : '#bdbdbd'
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {submissionView?.firstHalfSubmitted
                                                            ? `First Half submitted on ${new Date(
                                                                submissionView.firstHalfSubmittedDate
                                                            ).toLocaleString()}`
                                                            : 'First Half not submitted'}
                                                    </Typography>
                                                </Box>

                                                {/* Second Half */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            backgroundColor: submissionView?.secondHalfSubmitted ? '#27ae60' : '#bdbdbd'
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {submissionView?.secondHalfSubmitted
                                                            ? `Second Half submitted on ${new Date(
                                                                submissionView.secondHalfSubmittedDate
                                                            ).toLocaleString()}`
                                                            : 'Second Half not submitted'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Paper>
                                ) : (
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 1.5,
                                            minWidth: '280px',
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2
                                        }}
                                    >
                                        {submissionViewLoading ? (
                                            <Typography align="center">Loading...</Typography>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: submissionView?.fullMonthSubmitted ? '#27ae60' : '#bdbdbd'
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {submissionView?.fullMonthSubmitted
                                                        ? `Entry submitted on ${new Date(
                                                            submissionView.fullMonthSubmittedDate
                                                        ).toLocaleString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })}`
                                                        : 'Entry not submitted'}
                                                    </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                )}

                            </Box>

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
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '350px', justifyContent: 'flex-end' }}>
                                <Box>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmitClick}
                                        sx={{ backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#1e8449' }, whiteSpace: 'nowrap', minWidth: '90px' }}
                                    >
                                        Submit
                                    </Button>
                                    {isFieldDataCollector && (
                                        <Menu
                                        anchorEl={submitAnchorEl}
                                        open={Boolean(submitAnchorEl)}
                                        onClose={closeSubmitMenu}
                                        >
                                      
                                            {/* First Half */}
                                            <MenuItem
                                                onClick={() => handleSubmitHalf("First Half")}
                                                disabled={submissionView?.firstHalfSubmitted}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        width: "100%"
                                                    }}
                                                >
                                                    <span>First Half</span>

                                                    {submissionView?.firstHalfSubmitted &&
                                                        submissionView?.firstHalfSubmittedDate && (
                                                            <Chip
                                                                size="small"
                                                                label={`Submitted ${new Date(
                                                                    submissionView.firstHalfSubmittedDate
                                                                ).toLocaleString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true
                                                                })}`}
                                                                sx={{
                                                                    ml: 1,
                                                                    backgroundColor: "#4caf50",
                                                                    color: "white",
                                                                    height: "24px",
                                                                    "& .MuiChip-label": {
                                                                        fontSize: "0.7rem",
                                                                        px: 1
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                </Box>
                                            </MenuItem>

                                            {/* Second Half */}
                                            <MenuItem
                                                onClick={() => handleSubmitHalf("Second Half")}
                                                disabled={submissionView?.secondHalfSubmitted}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        width: "100%"
                                                    }}
                                                >
                                                    <span>Second Half</span>

                                                    {submissionView?.secondHalfSubmitted &&
                                                        submissionView?.secondHalfSubmittedDate && (
                                                            <Chip
                                                                size="small"
                                                                label={`Submitted ${new Date(
                                                                    submissionView.secondHalfSubmittedDate
                                                                ).toLocaleString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true
                                                                })}`}
                                                                sx={{
                                                                    ml: 1,
                                                                    backgroundColor: "#4caf50",
                                                                    color: "white",
                                                                    height: "24px",
                                                                    "& .MuiChip-label": {
                                                                        fontSize: "0.7rem",
                                                                        px: 1
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                </Box>
                                            </MenuItem>
                                    </Menu>
                                    )}
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={() => changeMonth(1)}
                                    endIcon={<ArrowForwardIosIcon />}
                                    sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' }, whiteSpace: 'nowrap', minWidth: '80px' }}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>

                        {/* Legend */}
                        {/* <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 2, flexWrap: 'wrap' }}>
                            {[
                                { color: theme.palette.mode === 'dark' ? '#1a2a3a' : '#2ea3ce', label: 'First Half (1–15)' },
                                { color: theme.palette.mode === 'dark' ? '#7be4af' : '#53c15c', label: 'Second Half (16–end)' },
                                { color: theme.palette.mode === 'dark' ? '#da8383' : '#f09696', label: 'Sunday' },
                                { color: theme.palette.mode === 'dark' ? '#8fefa9' : '#8af69a', label: '2nd Saturday' },
                            ].map(({ color, label }) => (
                                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 14, height: 14, backgroundColor: color, border: `1px solid ${theme.palette.divider}`, borderRadius: '3px' }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>{label}</Typography>
                                </Box>
                            ))}
                        </Box> */}
                    </Box>

                    {/* Loading indicator */}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, gap: 1 }}>
                            <CircularProgress size={18} />
                            <Typography variant="body2" color="text.secondary">Loading tour data...</Typography>
                        </Box>
                    )}

                    {/* Scrollable Table Container - THIS IS THE KEY CHANGE */}
                    <TableContainer 
                        component={Paper} 
                        variant="outlined" 
                        sx={{ 
                            borderRadius: 2, 
                            overflow: 'auto',
                            maxHeight: 'calc(100vh - 250px)', // Adjust this value based on your header height
                            // Alternative: use '70vh' for relative sizing
                            // maxHeight: '70vh',
                        }}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['Date', ...(isFieldDataCollector ? ['FH/SH', 'Zone'] : []), 'Entry Type', 'Scheme', 'Purpose of Tour', 'Cluster.No / Place of Visit', 'Remarks', 'Actions'].map((col) => (
                                        <TableCell
                                            key={col}
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                whiteSpace: 'nowrap',
                                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f3f7',
                                                borderBottom: `2px solid ${theme.palette.divider}`,
                                                px: 1.5
                                            }}
                                        >
                                            {col}
                                        </TableCell>
                                    ))}
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            whiteSpace: 'nowrap',
                                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f3f7',
                                            borderBottom: `2px solid ${theme.palette.divider}`,
                                            px: 1,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <AddIcon sx={{ fontSize: 16, verticalAlign: 'middle', color: '#1976d2' }} />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderTableRows()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </MainCard>
        </Grid>

            {/* ==================== ADD MODAL ==================== */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
            >
                <Card
                    sx={{
                        width: '90%',
                        maxWidth: '500px',
                        padding: 3,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[24],
                        maxHeight: '85vh',
                        overflow: 'auto'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
                            Add Tour – {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Typography>
                        <IconButton onClick={closeModal} size="small"><CloseIcon /></IconButton>
                    </Box>

                    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Zone */}
                        {isFieldDataCollector && !zonesLoading && assignedZones.length > 1 && (
                            <FormControl fullWidth size="small">
                                <InputLabel>Zone</InputLabel>
                                <Select value={selectedZoneId || ''} label="Zone" onChange={(e) => setSelectedZoneId(e.target.value)}>
                                    {assignedZones.map((zone) => (
                                        <MenuItem key={zone.zoneId} value={zone.zoneId}>{zone.zoneName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        {zonesLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1, gap: 1 }}>
                                <CircularProgress size={24} />
                                <Typography variant="body2">Loading zones...</Typography>
                            </Box>
                        )}
                        {isFieldDataCollector && !zonesLoading && assignedZones.length === 0 && (
                            <Alert severity="error">No zones assigned to you. Please contact administrator.</Alert>
                        )}

                        <FormControl fullWidth size="small">
                            <InputLabel>Entry Type</InputLabel>
                            <Select value={entryType} label="Entry Type" onChange={(e) => setEntryType(e.target.value)}>
                                {ENTRY_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 0.5 }} />

                        {entryType === 'WORKING' && (
                            <>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Scheme</InputLabel>
                                    <Select value={selectedScheme} label="Scheme" onChange={(e) => setSelectedScheme(e.target.value)}>
                                        {schemes.map((scheme) => (
                                            <MenuItem key={scheme.id} value={scheme.id} disabled={scheme.schemeName !== 'EARAS'}
                                            sx={{ 
                                                opacity: scheme.schemeName !== 'EARAS' ? 0.6 : 1,
                                                '&.Mui-disabled': {
                                                    opacity: 0.6,
                                                }
                                            }}
                                            >{scheme.schemeName}
                                            {scheme.schemeName !== 'EARAS' && (
                                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                    (Disabled)
                                                </Typography>
                                            )}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Purpose of Tour - Modified to disable already used purposes */}
                                <FormControl fullWidth size="small">
                                    <InputLabel>Purpose of Tour</InputLabel>
                                    <Select 
                                        value={formData.purpose} 
                                        label="Purpose of Tour" 
                                        onChange={(e) => handleInputChange('purpose', e.target.value)} 
                                        disabled={!selectedScheme}
                                    >
                                        {purposes.map((purpose) => {
                                            const isUsed = getUsedPurposesForDate().includes(purpose.id);
                                            return (
                                                <MenuItem 
                                                    key={purpose.id} 
                                                    value={purpose.id}
                                                    disabled={isUsed}
                                                    sx={{ 
                                                        opacity: isUsed ? 0.6 : 1,
                                                        '&.Mui-disabled': {
                                                            opacity: 0.6,
                                                        }
                                                    }}
                                                >
                                                    {purpose.purposeName}
                                                    {isUsed && (
                                                        <Typography variant="caption" sx={{ ml: 1, color: 'warning.main' }}>
                                                            (Already selected for this date)
                                                        </Typography>
                                                    )}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Place of Visit"
                                    value={formData.place}
                                    onChange={(e) => handleInputChange('place', validatePlace(e.target.value))}
                                    variant="outlined"
                                    size="small"
                                />
                            </>
                        )}

                        <TextField
                            fullWidth
                            label="Remarks"
                            multiline
                            rows={3}
                            value={formData.remarks}
                            onChange={(e) => handleInputChange('remarks', validateRemarks(e.target.value))}
                            variant="outlined"
                            placeholder={entryType !== "WORKING" ? "Add remarks for this entry" : "Add remarks (optional)"}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={closeModal}
                                sx={{ color: theme.palette.text.primary, borderColor: theme.palette.divider }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                onClick={saveEvent}
                                disabled={loading || zonesLoading || (isFieldDataCollector && assignedZones.length === 0)}
                                sx={{ backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#1e8449' } }}
                            >
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Modal>

            {/* ==================== EDIT MODAL ==================== */}
            <Modal
                open={editModalOpen}
                onClose={closeEditModal}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Card
                    sx={{
                        width: '90%',
                        maxWidth: '500px',
                        padding: 3,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: theme.shadows[24],
                        maxHeight: '85vh',
                        overflow: 'auto'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Edit Tour</Typography>
                        <IconButton onClick={closeEditModal} size="small"><CloseIcon /></IconButton>
                    </Box>

                    <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {isFieldDataCollector && !zonesLoading && assignedZones.length > 1 && (
                            <FormControl fullWidth size="small">
                                <InputLabel>Zone</InputLabel>
                                <Select value={editSelectedZoneId || ''} label="Zone" onChange={(e) => setEditSelectedZoneId(e.target.value)}>
                                    {assignedZones.map((zone) => (
                                        <MenuItem key={zone.zoneId} value={zone.zoneId}>{zone.zoneName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth size="small">
                            <InputLabel>Entry Type</InputLabel>
                            <Select value={editEntryType} label="Entry Type" onChange={(e) => setEditEntryType(e.target.value)}>
                                {ENTRY_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 0.5 }} />

                        {editEntryType === 'WORKING' ? (
                            <>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Scheme</InputLabel>
                                    <Select value={editSelectedScheme} label="Scheme" onChange={(e) => setEditSelectedScheme(e.target.value)}>
                                        {schemes.map((scheme) => (
                                            <MenuItem key={scheme.id} value={scheme.id} disabled={scheme.schemeName !== 'EARAS'}
                                                                            sx={{ 
                                                    opacity: scheme.schemeName !== 'EARAS' ? 0.6 : 1,
                                                    '&.Mui-disabled': {
                                                        opacity: 0.6,
                                                    }
                                                }}
                                            >
                                                {scheme.schemeName}
                                            {scheme.schemeName !== 'EARAS' && (
                                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                    (Disabled)
                                                </Typography>
                                            )}
                                        </MenuItem>
                                    ))}
                                    </Select>
                                </FormControl>
                                {/* Purpose of Tour - Modified for edit mode */}
                                {/* Purpose of Tour - Fixed for edit mode */}
                                <FormControl fullWidth size="small">
                                    <InputLabel>Purpose of Tour</InputLabel>
                                    <Select 
                                        value={editFormData.purpose} 
                                        label="Purpose of Tour" 
                                        onChange={(e) => handleEditInputChange('purpose', e.target.value)} 
                                        disabled={!editSelectedScheme}
                                    >
                                        {purposes.map((purpose) => {
                                            // Check if this purpose is already used on the same date by other events
                                            const usedPurposes = getUsedPurposesForEventDate(selectedEvent);
                                            const isUsed = usedPurposes.includes(purpose.id);
                                            
                                            return (
                                                <MenuItem 
                                                    key={purpose.id} 
                                                    value={purpose.id}
                                                    disabled={isUsed}
                                                    sx={{ 
                                                        opacity: isUsed ? 0.6 : 1,
                                                        '&.Mui-disabled': {
                                                            opacity: 0.6,
                                                        }
                                                    }}
                                                >
                                                    {purpose.purposeName}
                                                    {isUsed && (
                                                        <Typography variant="caption" sx={{ ml: 1, color: 'warning.main' }}>
                                                            (Already selected for this date)
                                                        </Typography>
                                                    )}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Place of Visit"
                                    value={editFormData.place}
                                    onChange={(e) => handleEditInputChange('place', validatePlace(e.target.value))}
                                    variant="outlined"
                                    size="small"
                                />
                            </>
                        ) : (
                            <Alert severity="info">{editEntryType} entry – only remarks can be edited</Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Remarks"
                            multiline
                            rows={3}
                            value={editFormData.remarks}
                            onChange={(e) => handleEditInputChange('remarks', validateRemarks(e.target.value))}
                            variant="outlined"
                            placeholder={editEntryType !== "WORKING" ? "Add remarks for this entry" : "Add remarks (optional)"}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button variant="outlined" onClick={closeEditModal} sx={{ color: theme.palette.text.primary, borderColor: theme.palette.divider }}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={updateEvent}
                                disabled={editLoading}
                                sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' } }}
                            >
                                {editLoading ? "Updating..." : "Update"}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Modal>

            {/* ==================== NOTIFICATION DIALOG ==================== */}
            <Dialog open={notification.open} onClose={closeNotification} maxWidth="xs" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    {notification.type === 'success' ? (
                        <>
                            <Box sx={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2 }}>
                                <Typography sx={{ fontSize: 40, color: '#2e7d32', fontWeight: 'bold' }}>✓</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Success</Typography>
                        </>
                    ) : (
                        <>
                            <Box sx={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2 }}>
                                <Typography sx={{ fontSize: 40, color: '#d32f2f', fontWeight: 'bold' }}>✕</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Error</Typography>
                        </>
                    )}
                    <Typography sx={{ mt: 1 }}>{notification.message}</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button variant="contained" onClick={closeNotification} sx={{ backgroundColor: notification.type === 'success' ? '#2e7d32' : '#d32f2f' }}>OK</Button>
                </DialogActions>
            </Dialog>

            {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
            <Dialog open={deleteDialog.open} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this tour?</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeDeleteDialog} variant="outlined">Cancel</Button>
                    <Button onClick={() => handleDeleteEvent(deleteDialog.eventId)} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* ==================== SUBMIT CONFIRMATION DIALOG ==================== */}
            <Dialog open={submitDialog.open} onClose={() => setSubmitDialog({ open: false, half: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm {submitDialog.half === 'Month' ? 'Full Month' : submitDialog.half} Submission
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Are you sure you want to submit {submitDialog.half === 'Month' ? 'the full month' : submitDialog.half?.toLowerCase()} for{' '}
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}?
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">This will validate and submit all tour entries for this period.</Typography>
                    </Alert>
                    {/* {activeHalves && submitDialog.half === 'First Half' && activeHalves.firstHalf < currentDate.getDate() && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Note: First Half submission deadline was on {getPreviousMonth()} {activeHalves.firstHalf}. This may be marked as LATE.
                            </Typography>
                        </Alert>
                    )} */}

                    {activeHalves && (submitDialog.half === 'First Half' || submitDialog.half === 'Month') && (() => {
                    const prevMonth = new Date(currentDate);
                    prevMonth.setMonth(currentDate.getMonth() - 1);
                    const deadlineDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), activeHalves.firstHalf);
                    const isLate = new Date() > deadlineDate;

                    if (isLate) {
                        return (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Note: Submission deadline was on {deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. This may be marked as LATE.
                                </Typography>
                            </Alert>
                        );
                    }
                    return null;
                })()}
                    {activeHalves && submitDialog.half === 'Second Half' && activeHalves.secondHalf < currentDate.getDate() && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Note: Second Half submission deadline is on {currentDate.toLocaleString('default', { month: 'long' })} {activeHalves.secondHalf}. This may be marked as LATE.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setSubmitDialog({ open: false, half: null })} variant="outlined" disabled={submitLoading}>Cancel</Button>
                    <Button
                        onClick={confirmSubmit}
                        variant="contained"
                        disabled={submitLoading}
                        sx={{ backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#1e8449' }, minWidth: '100px' }}
                    >
                        {submitLoading ? "Submitting..." : "Confirm Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ==================== VIEW DETAILS MODAL ==================== */}
<Dialog
    open={viewModalOpen}
    onClose={closeViewModal}
    maxWidth="md"
    fullWidth
>
    <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Tour Entry Details
        <IconButton onClick={closeViewModal} size="small">
            <CloseIcon />
        </IconButton>
    </DialogTitle>
    <DialogContent dividers>
        {viewEvent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Row 1: Date, Entry Type, Zone */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date(viewEvent.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Entry Type
                        </Typography>
                        <Chip 
                            label={viewEvent.entryType || 'WORKING'}
                            size="small"
                            sx={{ 
                                bgcolor: viewEvent.entryType === 'WORKING' ? '#27ae60' :
                                        viewEvent.entryType === 'WEEK_OFF' ? '#e67e22' :
                                        viewEvent.entryType === 'HOLIDAY' ? '#e74c3c' :
                                        viewEvent.entryType === 'LEAVE' ? '#f39c12' :
                                        viewEvent.entryType === 'TRAINING' ? '#3498db' : '#95a5a6',
                                color: 'white',
                                fontWeight: 500
                            }}
                        />
                    </Grid>
                    {isFieldDataCollector && (
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Zone
                        </Typography>
                        <Typography variant="body1">
                            {getZoneName(viewEvent.zoneId)}
                        </Typography>
                    </Grid>
                    )}
                </Grid>

                {/* Row 2: Half, Scheme, Purpose of Tour */}
                <Grid container spacing={3}>
                    {isFieldDataCollector && (
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Half
                        </Typography>
                        <Chip
                            label={new Date(viewEvent.createdAt).getDate() <= 15 ? 'First Half (FH)' : 'Second Half (SH)'}
                            size="small"
                            sx={{
                                backgroundColor: new Date(viewEvent.createdAt).getDate() <= 15 
                                    ? (theme.palette.mode === 'dark' ? '#1976d2' : '#bbdefb')
                                    : (theme.palette.mode === 'dark' ? '#2e7d32' : '#c8e6c9'),
                                color: new Date(viewEvent.createdAt).getDate() <= 15 
                                    ? (theme.palette.mode === 'dark' ? '#fff' : '#0d47a1')
                                    : (theme.palette.mode === 'dark' ? '#fff' : '#1b5e20'),
                            }}
                        />
                    </Grid>
                    )}
                    {viewEvent.entryType === 'WORKING' ? (
                        <>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Scheme
                                </Typography>
                                <Typography variant="body1">
                                    {getSchemeNameFromPurpose(viewEvent.purposeId)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Purpose of Tour
                                </Typography>
                                <Typography variant="body1">
                                    {getPurposeName(viewEvent.purposeId)}
                                </Typography>
                            </Grid>
                        </>
                    ) : (
                        <Grid item xs={12} sm={8}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {viewEvent.entryType} Details
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No additional details for {viewEvent.entryType} entry
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Row 3: Place of Visit, Remarks, Status */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Place of Visit
                        </Typography>
                        <Typography variant="body1">
                            {viewEvent.entryType === 'WORKING' ? (viewEvent.location || '—') : '—'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Remarks
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {viewEvent.remark || '—'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Status
                        </Typography>
                        <Chip
                            label={viewEvent.status || 'DRAFT'}
                            size="small"
                            sx={{
                                backgroundColor: viewEvent.status === 'APPROVED' ? '#27ae60' :
                                               viewEvent.status === 'REJECTED' ? '#e74c3c' :
                                               viewEvent.status === 'SUBMITTED' ? '#3498db' : '#f39c12',
                                color: 'white',
                                fontWeight: 500
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        )}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
            variant="contained"
            onClick={closeViewModal}
            sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' }, minWidth: '100px' }}
        >
            Close
        </Button>
    </DialogActions>
</Dialog>
        </Grid>
    );
};

export default TourDiary;
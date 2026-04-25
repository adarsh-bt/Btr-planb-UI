import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Modal,
  Card,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import tourDiaryService from "pages/authentication/services/tourdiaryservice";
import Breadcrumb from "routes/Breadcrumb";
import MainCard from "components/MainCard";
import authservice from "pages/authentication/services/authservice";

const UserTourDiaryDetail = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { userId: paramUserId, month: monthParam, year: yearParam } = location.state || {};
  const currentUserId = authservice.userid();
  
  const [selectedMonth, setSelectedMonth] = useState(monthParam || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(yearParam || new Date().getFullYear());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tourEntries, setTourEntries] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(paramUserId || currentUserId);
  
  // Modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Add these state variables with your other useState declarations
const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
const [submittingMonth, setSubmittingMonth] = useState(false);
const [zoneIdForSubmission, setZoneIdForSubmission] = useState("");
const [availableZones, setAvailableZones] = useState([]);

// Get the active zone from authservice
const getActiveZone = () => {
  const zoneId = authservice.getzone();
  return zoneId;
};
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    id: null,
    distance: "",
    hours: "",
    remark: "",
    reportEntryType: "",
    // For manual entry full edit
    schemeId: "",
    purposeId: "",
    zoneId: "",
    clusterId: "",
    seasonId: "",
    landType: "",
    cropName: "",
    geoLocation: ""
  });
  
  // Manual entry form states
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryDate, setManualEntryDate] = useState(null);
  const [manualFormData, setManualFormData] = useState({
    purposeId: "",
    zoneId: "",
    clusterId: "",
    seasonId: "",
    landType: "",
    remark: "",
    distance: "",
    hours: "",
    cropName: "",
    geoLocation: ""
  });
  
  const [purposes, setPurposes] = useState([]);
  const [zones, setZones] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [editSelectedScheme, setEditSelectedScheme] = useState(""); // For edit modal
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (!currentUserId) {
      setError("Please login to view tour details");
      setLoading(false);
      navigate("/login");
    }
  }, [currentUserId, navigate]);

  // Add this function to check if month can be submitted
// Check if month can be submitted
const canSubmitMonth = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // Allow submission only for past months
  if (selectedYear > currentYear) return false;
  if (selectedYear === currentYear && selectedMonth > currentMonth) return false;
  
  // Check if month is complete (passed the month end)
  const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
  return today > lastDayOfMonth;
};

// // Get submission status message
// const getSubmissionStatusMessage = () => {
//   const today = new Date();
//   const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
  
//   if (today <= lastDayOfMonth) {
//     return `⚠️ Month not yet complete. Submission will be available after ${monthNames[selectedMonth - 1]} ${selectedYear} ends.`;
//   }
//   return "✓ Month is complete and ready for submission";
// };

// Handle submit month
const handleSubmitMonth = async () => {
  const zoneId = authservice.getzone();
  
  if (!zoneId) {
    setSnackbar({ 
      open: true, 
      message: "No active zone found. Please select a zone first.", 
      severity: "error" 
    });
    return;
  }

  // Confirm submission
  const confirmed = window.confirm(
    `Are you sure you want to submit ${monthNames[selectedMonth - 1]} ${selectedYear}?\n\n` +
    `Zone ID: ${zoneId}\n` +
    `This action cannot be undone.`
  );
  
  if (!confirmed) return;

  setSubmittingMonth(true);
  
  try {
    const response = await tourDiaryService.submitFullMonth(
      selectedUserId,
      selectedMonth,
      selectedYear,
      zoneId
    );
    
    if (response.error) {
      setSnackbar({ 
        open: true, 
        message: response.message || "Failed to submit month", 
        severity: "error" 
      });
    } else {
      setSnackbar({ 
        open: true, 
        message: response.data || "Month submitted successfully", 
        severity: "success" 
      });
      // Refresh tour entries after submission
      await fetchUserTourEntries();
    }
  } catch (error) {
    console.error("Error submitting month:", error);
    setSnackbar({ 
      open: true, 
      message: error.message || "An error occurred during submission", 
      severity: "error" 
    });
  } finally {
    setSubmittingMonth(false);
  }
};

  const fetchUserTourEntries = async () => {
    if (!selectedUserId) {
      setError("No user selected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await tourDiaryService.getTourEntries(selectedUserId, selectedMonth, selectedYear);
      console.log("Fetched tour entries:   <<>>>", response);
      if (response && Array.isArray(response) && !response.message) {
        setTourEntries(response);
        
        if (response.length > 0 && !userDetails) {
          setUserDetails({
            name: response[0].userName || 'N/A',
            empNumber: response[0].empNumber || 'N/A',
            designation: response[0].designation || 'N/A',
            officelocation: response[0].officeLocation || 'N/A'
          });
        }
      } else if (response && response.message) {
        setTourEntries([]);
        if (response.message !== "No entries found") {
          setError(response.message);
        }
      } else {
        setTourEntries([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "An error occurred while fetching data");
      setTourEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurposesAndZones = async () => {
    try {
      const schemesRes = await tourDiaryService.getAllSchemes();
      if (schemesRes && !schemesRes.message) {
        console.log("Fetched schemes:>>>>>>>>", schemesRes);
        setSchemes(Array.isArray(schemesRes) ? schemesRes : []);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

  const fetchPurposesByScheme = async (schemeId) => {
    if (!schemeId) {
      setPurposes([]);
      return;
    }
    
    try {
      const data = await tourDiaryService.getActivePurposes(schemeId);
      if (data && !data.message && Array.isArray(data)) {
        setPurposes(data);
      } else {
        setPurposes([]);
      }
    } catch (error) {
      console.error("Error fetching purposes:", error);
      setPurposes([]);
    }
  };

  const fetchZones = async () => {
    try {
      const zonesRes = await tourDiaryService.getAssignedZones(selectedUserId);
      if (zonesRes && !zonesRes.error && Array.isArray(zonesRes)) {
        console.log("Fetched zones:>>>>>>>>", zonesRes);
        setZones(zonesRes);
      } else if (zonesRes && zonesRes.data && Array.isArray(zonesRes.data)) {
        setZones(zonesRes.data);
      } else {
        setZones([]);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZones([]);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchUserTourEntries();
      fetchZones();
    }
    fetchPurposesAndZones();
  }, [selectedUserId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedScheme) {
      fetchPurposesByScheme(selectedScheme);
    } else {
      setPurposes([]);
    }
  }, [selectedScheme]);

  useEffect(() => {
    if (editSelectedScheme) {
      fetchPurposesByScheme(editSelectedScheme);
    } else {
      setPurposes([]);
    }
  }, [editSelectedScheme]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMonthChange = (offset) => {
    let newMonth = selectedMonth + offset;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleDateClick = (day) => {
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = getEntriesForDate(day);
    
    setSelectedDate(dateKey);
    setSelectedDayEvents(dayEvents);
    setActiveTab(0);
    setDayModalOpen(true);
  };

  const handleViewEntryDetails = (entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    if (entry.reportEntryType === "SYSTEM") {
      // SYSTEM entry - only distance and hours
      setEditFormData({
        id: entry.id,
        distance: entry.distance || "",
        hours: entry.hours || "",
        remark: entry.remark || "",
        reportEntryType: entry.reportEntryType,
        // schemeId: "",
        // purposeId: "",
        // zoneId: "",
        // clusterId: "",
        // seasonId: "",
        // landType: "",
        // cropName: "",
        // geoLocation: ""
      });
    } else {
      // MANUAL entry - all fields
      setEditFormData({
        id: entry.id,
        distance: entry.distance || "",
        hours: entry.hours || "",
        remark: entry.remark || "",
        reportEntryType: entry.reportEntryType,
        schemeId: entry.schemesId || "",
        purposeId: entry.purposeId || "",
        zoneId: entry.zoneId || "",
        clusterId: entry.clusterId || "",
        seasonId: entry.seasonNo || entry.seasonId || "",
        landType: entry.landType || "",
        cropName: entry.cropName || "",
        geoLocation: entry.geoLocation || ""
      });
      
      // Set the scheme for edit modal and fetch purposes
      if (entry.schemesId) {
        setEditSelectedScheme(entry.schemesId);
      } else {
        // If no scheme ID, try to find scheme from purpose
        setEditSelectedScheme("");
      }
    }
    setEditModalOpen(true);
  };

  const handleSaveSystemEdit = async () => {
    if (!editFormData.distance && !editFormData.hours) {
      setSnackbar({ open: true, message: "Please fill in distance or hours", severity: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editFormData.id,
        distance: editFormData.distance ? parseFloat(editFormData.distance) : null,
        hours: editFormData.hours ? parseFloat(editFormData.hours) : null
      };

      console.log("🔧 Updating system entry with payload:", payload); // ✅ Added debug log

      const response = await tourDiaryService.updateSystemTourEntry(payload);
      
      if (response && response.id) {
        setSnackbar({ open: true, message: "Tour entry updated successfully", severity: "success" });
        setEditModalOpen(false);
        await fetchUserTourEntries();
        closeDayModal();
      } else {
        setSnackbar({ open: true, message: response.message || "Failed to update entry", severity: "error" });
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      setSnackbar({ open: true, message: error.message || "Failed to update entry", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveManualEdit = async () => {
    setSubmitting(true);
    try {
      // For UPDATE existing manual entry - preserve original createdAt or don't send it
      // Most backends ignore createdAt on update, but if you need to keep it:
      const payload = {
        id: editFormData.id,  // This is crucial for updates
        userId: selectedUserId,
        schemeId: Number(editFormData.schemeId),
        purposeId: Number(editFormData.purposeId),
        zoneId: Number(editFormData.zoneId),
        clusterId: Number(editFormData.clusterId),
        seasonId: editFormData.seasonId ? Number(editFormData.seasonId) : 1,
        landType: editFormData.landType,
        geoLocation: editFormData.geoLocation || "N/A",
        remark: editFormData.remark,
        distance: editFormData.distance ? parseFloat(editFormData.distance) : null,
        hours: editFormData.hours ? parseFloat(editFormData.hours) : null,
        cropName: editFormData.cropName
        // Do NOT include createdAt on update unless your backend expects it
      };

      console.log("Updating manual entry with payload:", payload);
      
      const response = await tourDiaryService.saveOrUpdateManualEntry(payload);
      
      console.log("API Response:", response);
      
      // Check for success
      if (response && (response.id || response.message === "Tour updated successfully")) {
        setSnackbar({ 
          open: true, 
          message: response.message || "Tour entry updated successfully", 
          severity: "success" 
        });
        setEditModalOpen(false);
        await fetchUserTourEntries();
        closeDayModal();
      } else {
        setSnackbar({ 
          open: true, 
          message: response.message || "Failed to update entry", 
          severity: "error" 
        });
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      setSnackbar({ 
        open: true, 
        message: error.message || "Failed to update entry", 
        severity: "error" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenManualEntry = async (date) => {
    setManualEntryDate(date);
    setManualFormData({
      purposeId: "",
      zoneId: "",
      clusterId: "",
      seasonId: "",
      landType: "",
      remark: "",
      distance: "",
      hours: "",
      cropName: "",
      geoLocation: ""
    });
    setSelectedScheme("");
    
    // Refresh zones when opening modal
    await fetchZones();
    
    setManualEntryOpen(true);
  };

  const handleSaveManualEntry = async () => {
  if (!manualFormData.purposeId || !manualFormData.zoneId || !manualFormData.clusterId || !selectedScheme) {
    setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
    return;
  }

  setSubmitting(true);
  try {
    // Format the selected date for the createdAt field
    let formattedDate = null;
    if (manualEntryDate) {
      // manualEntryDate is the date string from the calendar (e.g., "2026-04-07")
      // Or it could be a Date object
      const dateToUse = new Date(manualEntryDate);
      
      // Check if date is valid
      if (!isNaN(dateToUse.getTime())) {
        // Format as ISO string (e.g., "2026-04-07T11:21:31.379662")
        // You can set the time to a default like noon or keep the current time
        // For consistency with backend, let's set to noon to avoid timezone issues
        dateToUse.setHours(12, 0, 0, 0);
        formattedDate = dateToUse.toISOString();
      }
    }
    
    // If no date is selected, use current date
    if (!formattedDate) {
      formattedDate = new Date().toISOString();
    }

    // For NEW manual entry - NO id field
    const payload = {
      userId: selectedUserId,
      schemeId: Number(selectedScheme),
      purposeId: Number(manualFormData.purposeId),
      zoneId: Number(manualFormData.zoneId),
      clusterId: Number(manualFormData.clusterId),
      seasonId: Number(manualFormData.seasonId || 1),
      landType: manualFormData.landType,
      geoLocation: manualFormData.geoLocation || "",
      remark: manualFormData.remark,
      distance: manualFormData.distance ? parseFloat(manualFormData.distance) : null,
      hours: manualFormData.hours ? parseFloat(manualFormData.hours) : null,
      cropName: manualFormData.cropName,
      createdAt: formattedDate  // Add the createdAt field
    };

    console.log("Creating new manual entry with payload:", payload);
    
    const response = await tourDiaryService.saveOrUpdateManualEntry(payload);
    
    console.log("API Response:", response);
    
    // Check for success (response has id or message indicates success)
    if (response && (response.id || response.message === "Tour saved successfully")) {
      setSnackbar({ 
        open: true, 
        message: response.message || "Tour entry added successfully", 
        severity: "success" 
      });
      setManualEntryOpen(false);
      await fetchUserTourEntries();
      closeDayModal();
    } else {
      setSnackbar({ 
        open: true, 
        message: response.message || "Failed to add tour entry", 
        severity: "error" 
      });
    }
  } catch (error) {
    console.error("Error creating entry:", error);
    setSnackbar({ 
      open: true, 
      message: error.message || "Failed to add tour entry", 
      severity: "error" 
    });
  } finally {
    setSubmitting(false);
  }
};

  const closeDayModal = () => {
    setDayModalOpen(false);
    setSelectedDate(null);
    setSelectedDayEvents([]);
    setActiveTab(0);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedEntry(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditSelectedScheme("");
    setEditFormData({ 
      id: null, 
      distance: "", 
      hours: "", 
      remark: "", 
      reportEntryType: "",
      schemeId: "",
      purposeId: "",
      zoneId: "",
      clusterId: "",
      seasonId: "",
      landType: "",
      cropName: "",
      geoLocation: ""
    });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getEntriesForDate = (day) => {
    return tourEntries.filter(entry => {
      try {
        const entryDate = new Date(entry.createdAt);
        return entryDate.getDate() === day &&
               entryDate.getMonth() + 1 === selectedMonth &&
               entryDate.getFullYear() === selectedYear;
      } catch (e) {
        return false;
      }
    });
  };

  const getSystemEntriesForDate = () => {
    return selectedDayEvents.filter(entry => entry.reportEntryType === "SYSTEM");
  };

  const getManualEntriesForDate = () => {
    return selectedDayEvents.filter(entry => entry.reportEntryType === "MANUAL");
  };

  const isSunday = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    return date.getDay() === 0;
  };

  const isSecondSaturday = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    if (date.getDay() !== 6) return false;

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
    const secondSaturday = firstSaturday + 7;

    return day === secondSaturday;
  };

  const renderCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <Grid item xs={12/7} key={`empty-${i}`}>
          <Box sx={{ minHeight: '90px' }} />
        </Grid>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEntries = getEntriesForDate(day);
      const entryCount = dayEntries.length;
      
      const isSun = isSunday(selectedYear, selectedMonth, day);
      const is2ndSat = isSecondSaturday(selectedYear, selectedMonth, day);
      
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
        <Grid item xs={12/7} key={day}>
          <Paper
            onClick={() => handleDateClick(day)}
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
                color: (isSun || is2ndSat) ? '#d32f2f' : theme.palette.text.primary,
                mb: 1
              }}
            >
              {day}
            </Typography>

            {entryCount > 0 && (
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
                <Box
                  sx={{
                    backgroundColor: '#27ae60',
                    color: 'white',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✓
                </Box>
                {entryCount > 1 && (
                  <Chip
                    label={`${entryCount}`}
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
                      minWidth: '22px'
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

  const renderEventList = (entries) => {
  if (entries.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No entries found for this category.
      </Alert>
    );
  }

  return (
    <List sx={{ mt: 2 }}>
      {entries.map((event, index) => (
        <React.Fragment key={event.id || index}>
          {index > 0 && <Divider />}
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Chip 
                    label={event.reportEntryType} 
                    size="small"
                    sx={{
                      backgroundColor: event.reportEntryType === "SYSTEM" ? '#2196f3' : '#ff9800',
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  {event.purposeName && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Purpose:</strong> {event.purposeName}
                    </Typography>
                  )}
                  {event.zoneName && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Zone Name:</strong> {event.zoneName}
                    </Typography>
                  )}
                  {event.zoneId && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Zone ID:</strong> {event.zoneId}
                    </Typography>
                  )}
                  {event.clusterId && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cluster :</strong> {event.clusterId}
                    </Typography>
                  )}
                  {event.clusterNo && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cluster No:</strong> {event.clusterNo}
                    </Typography>
                  )}
                  {event.cropName && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Crop:</strong> {event.cropName}
                    </Typography>
                  )}
                  {event.distance && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Distance:</strong> {event.distance} km
                    </Typography>
                  )}
                  {event.hours && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Hours:</strong> {event.hours}
                    </Typography>
                  )}
                  {event.landType && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Land Type:</strong> {event.landType}
                    </Typography>
                  )}
                  {event.remark && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Remark:</strong> {event.remark}
                    </Typography>
                  )}
                  {event.geoLocation && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Location:</strong> {event.geoLocation}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleViewEntryDetails(event)}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '20'
                  }
                }}
              >
                <VisibilityIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleEditEntry(event)}
                sx={{
                  color: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: theme.palette.warning.light + '20'
                  },
                  ml: 1
                }}
              >
                <EditIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

  if (!currentUserId) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Breadcrumb />
        </Grid>
        <Grid item xs={12}>
          <MainCard>
            <Alert severity="error">Please login to view tour details</Alert>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate("/login")} 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  if (!selectedUserId && !loading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Breadcrumb />
        </Grid>
        <Grid item xs={12}>
          <MainCard>
            <Alert severity="error">No user selected</Alert>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack} 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Go Back
            </Button>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
        <Breadcrumb />
      <Grid item xs={12}>
      </Grid>
<Typography variant="h3" sx={{ marginLeft: 2,marginBottom: 2 }}>
          Actual Tour Diary
        </Typography>
      <Grid item xs={12}>
        <MainCard>
          <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}> 
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
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                width: '350px',
                justifyContent: 'flex-start'
              }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{
                    backgroundColor: '#2980b9',
                    '&:hover': { backgroundColor: '#1f6391' },
                    whiteSpace: 'nowrap',
                    minWidth: '80px'
                  }}
                >
                  Back
                </Button>
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
                {monthNames[selectedMonth - 1]} {selectedYear}
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                width: '350px',
                justifyContent: 'flex-end'
              }}>
                <Button
                  variant="contained"
                  onClick={() => handleMonthChange(-1)}
                  sx={{
                    backgroundColor: '#2980b9',
                    '&:hover': { backgroundColor: '#1f6391' },
                    whiteSpace: 'nowrap',
                    minWidth: '80px'
                  }}
                >
                  Prev
                </Button>

                {/* NEW SUBMIT MONTH BUTTON */}

    <Button
      variant="contained"
      onClick={handleSubmitMonth}
      disabled={!canSubmitMonth() || submittingMonth}
      sx={{
        backgroundColor: '#27ae60',
        '&:hover': { backgroundColor: '#229954' },
        whiteSpace: 'nowrap',
        minWidth: '120px'
      }}
      startIcon={submittingMonth ? <CircularProgress size={20} color="inherit" /> : null}
    >
      {submittingMonth ? "Submitting..." : "Submit Month"}
    </Button>
                <Button
                  variant="contained"
                  onClick={() => handleMonthChange(1)}
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
            {/* Add submission status message */}
{/* {!canSubmitMonth() && (
  <Alert severity="info" sx={{ mb: 2 }}>
    {getSubmissionStatusMessage()}
  </Alert>
)} */}

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#27ae60',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '3px'
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  Has Reports
                </Typography>
              </Box>
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            )}

            {error && !loading && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {/* {!loading && !error && tourEntries.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No tour entries found for this user in {monthNames[selectedMonth - 1]} {selectedYear}.
              </Alert>
            )} */}

            {!loading && !error && (
              <>
                <Grid container spacing={0.125}>
                  {dayNames.map(day => (
                    <Grid item xs={12/7} key={day}>
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
                          {day}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                  {renderCalendar()}
                </Grid>
              </>
            )}
          </Box>
        </MainCard>
      </Grid>

      {/* DAY VIEW MODAL */}
      <Modal
        open={dayModalOpen}
        onClose={closeDayModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card
          sx={{
            width: '90%',
            maxWidth: '700px',
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
              Tour Plan – {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
              })}
            </Typography>
            <IconButton onClick={closeDayModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`System Entry (${getSystemEntriesForDate().length})`} />
            <Tab label={`Manual Entry (${getManualEntriesForDate().length})`} />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && (
              <>
                {renderEventList(getSystemEntriesForDate())}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenManualEntry(selectedDate)}
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: '#27ae60',
                      '&:hover': { backgroundColor: '#229954' }
                    }}
                  >
                    Add Manual Entry
                  </Button>
                  <Button
                    variant="contained"
                    onClick={closeDayModal}
                    sx={{
                      backgroundColor: '#2980b9',
                      '&:hover': { backgroundColor: '#1f6391' }
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </>
            )}
            
            {activeTab === 1 && (
              <>
                {renderEventList(getManualEntriesForDate())}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenManualEntry(selectedDate)}
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: '#27ae60',
                      '&:hover': { backgroundColor: '#229954' }
                    }}
                  >
                    Add Manual Entry
                  </Button>
                  <Button
                    variant="contained"
                    onClick={closeDayModal}
                    sx={{
                      backgroundColor: '#2980b9',
                      '&:hover': { backgroundColor: '#1f6391' }
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Card>
      </Modal>

      {/* ENTRY DETAILS MODAL */}
      <Modal
        open={detailModalOpen}
        onClose={closeDetailModal}
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
              Tour Entry Details
            </Typography>
            <IconButton onClick={closeDetailModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(selectedEntry.createdAt).toLocaleString('en-GB')}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Entry Type</Typography>
                <Chip 
                  label={selectedEntry.reportEntryType} 
                  size="small"
                  sx={{
                    backgroundColor: selectedEntry.reportEntryType === "SYSTEM" ? '#2196f3' : '#ff9800',
                    color: 'white',
                    mt: 0.5
                  }}
                />
              </Grid>
              
              {selectedEntry.purposeName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Purpose</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.purposeName}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.zoneId && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Zone ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.zoneId}
                  </Typography>
                </Grid>
              )}

              {selectedEntry.zoneName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Zone Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.zoneName}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.clusterId && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Cluster ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.clusterId}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.cropName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Crop Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.cropName}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.distance && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Distance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.distance} km
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.hours && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Hours</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.hours}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.geoLocation && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.geoLocation}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.remark && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Remarks</Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      mt: 0.5,
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body1">{selectedEntry.remark}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={closeDetailModal}
              sx={{
                backgroundColor: '#2980b9',
                '&:hover': { backgroundColor: '#1f6391' }
              }}
            >
              Close
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* EDIT MODAL - SYSTEM ENTRY */}
      <Modal
        open={editModalOpen && editFormData.reportEntryType === "SYSTEM"}
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
              Edit System Tour Entry
            </Typography>
            <IconButton onClick={closeEditModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Alert severity="info" sx={{ mb: 2 }}>
            System entries can only edit Distance and Hours.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distance (km)"
                type="number"
                value={editFormData.distance}
                onChange={(e) => setEditFormData({ ...editFormData, distance: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hours"
                type="number"
                step="0.5"
                value={editFormData.hours}
                onChange={(e) => setEditFormData({ ...editFormData, hours: e.target.value })}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveSystemEdit}
              disabled={submitting}
              startIcon={<SaveIcon />}
              sx={{
                backgroundColor: '#27ae60',
                '&:hover': { backgroundColor: '#229954' }
              }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* EDIT MODAL - MANUAL ENTRY */}
      <Modal
        open={editModalOpen && editFormData.reportEntryType === "MANUAL"}
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
            maxWidth: '600px',
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
              Edit Manual Tour Entry
            </Typography>
            <IconButton onClick={closeEditModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Scheme</InputLabel>
                <Select
                  value={editFormData.schemeId}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, schemeId: e.target.value, purposeId: "" });
                    setEditSelectedScheme(e.target.value);
                  }}
                  label="Scheme"
                >
                  {schemes.map((scheme) => (
                    <MenuItem key={scheme.id} value={scheme.id}>
                      {scheme.schemeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Purpose</InputLabel>
                <Select
                  value={editFormData.purposeId}
                  onChange={(e) => setEditFormData({ ...editFormData, purposeId: e.target.value })}
                  label="Purpose"
                  disabled={!editFormData.schemeId}
                >
                  {purposes.length === 0 ? (
                    <MenuItem disabled>Select scheme first</MenuItem>
                  ) : (
                    purposes.map((purpose) => (
                      <MenuItem key={purpose.id} value={purpose.id}>
                        {purpose.purposeName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={editFormData.zoneId}
                  onChange={(e) => setEditFormData({ ...editFormData, zoneId: e.target.value })}
                  label="Zone"
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone.zoneId} value={zone.zoneId}>
                      {zone.zoneName || zone.name || `Zone ${zone.zoneId}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cluster ID"
                type="number"
                value={editFormData.clusterId}
                onChange={(e) => setEditFormData({ ...editFormData, clusterId: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
<FormControl fullWidth>
<InputLabel>Season</InputLabel>
         <Select
            value={editFormData.seasonId}
            onChange={(e) => setEditFormData({ ...editFormData, seasonId: e.target.value })}
            label="Season">
            <MenuItem value={1}>Autumn</MenuItem>
            <MenuItem value={2}>Winter</MenuItem>
            <MenuItem value={3}>Summer</MenuItem>
            </Select>
            </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Land Type</InputLabel>
                <Select
                  value={editFormData.landType}
                  onChange={(e) => setEditFormData({ ...editFormData, landType: e.target.value })}
                  label="Land Type"
                >
                  <MenuItem value="WET">WET</MenuItem>
                  <MenuItem value="DRY">DRY</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distance (km)"
                type="number"
                value={editFormData.distance}
                onChange={(e) => setEditFormData({ ...editFormData, distance: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hours"
                type="number"
                step="0.5"
                value={editFormData.hours}
                onChange={(e) => setEditFormData({ ...editFormData, hours: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Crop Name"
                value={editFormData.cropName}
                onChange={(e) => setEditFormData({ ...editFormData, cropName: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Geo Location (latitude,longitude)"
                placeholder="e.g., 10.8505,76.2711"
                value={editFormData.geoLocation}
                onChange={(e) => setEditFormData({ ...editFormData, geoLocation: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={3}
                value={editFormData.remark}
                onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveManualEdit}
              disabled={submitting}
              startIcon={<SaveIcon />}
              sx={{
                backgroundColor: '#27ae60',
                '&:hover': { backgroundColor: '#229954' }
              }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* ADD MANUAL ENTRY MODAL */}
      <Modal
        open={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card
          sx={{
            width: '90%',
            maxWidth: '600px',
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
              Add Manual Tour Entry
            </Typography>
            <IconButton onClick={() => setManualEntryOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Scheme</InputLabel>
                <Select
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  label="Scheme"
                >
                  {schemes.map((scheme) => (
                    <MenuItem key={scheme.id} value={scheme.id}>
                      {scheme.schemeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Purpose</InputLabel>
                <Select
                  value={manualFormData.purposeId}
                  onChange={(e) => setManualFormData({ ...manualFormData, purposeId: e.target.value })}
                  label="Purpose"
                  disabled={!selectedScheme}
                >
                  {purposes.map((purpose) => (
                    <MenuItem key={purpose.id} value={purpose.id}>
                      {purpose.purposeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={manualFormData.zoneId}
                  onChange={(e) => setManualFormData({ ...manualFormData, zoneId: e.target.value })}
                  label="Zone"
                >
                  {zones.length === 0 ? (
                    <MenuItem disabled>Loading zones...</MenuItem>
                  ) : (
                    zones.map((zone) => (
                      <MenuItem key={zone.id} value={zone.zoneId}>
                        {zone.zoneName || zone.name || `Zone ${zone.zoneId}`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cluster number"
                type="number"
                value={manualFormData.clusterId}
                onChange={(e) => setManualFormData({ ...manualFormData, clusterId: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Season ID"
                type="number"
                value={manualFormData.seasonId}
                onChange={(e) => setManualFormData({ ...manualFormData, seasonId: e.target.value })}
                placeholder="e.g., 1, 2, 3"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Land Type</InputLabel>
                <Select
                  value={manualFormData.landType}
                  onChange={(e) => setManualFormData({ ...manualFormData, landType: e.target.value })}
                  label="Land Type"
                >
                  <MenuItem value="WET">WET</MenuItem>
                  <MenuItem value="DRY">DRY</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distance (km)"
                type="number"
                value={manualFormData.distance}
                onChange={(e) => setManualFormData({ ...manualFormData, distance: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hours"
                type="number"
                step="0.5"
                value={manualFormData.hours}
                onChange={(e) => setManualFormData({ ...manualFormData, hours: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Crop Name"
                value={manualFormData.cropName}
                onChange={(e) => setManualFormData({ ...manualFormData, cropName: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Geo Location (latitude,longitude)"
                placeholder="e.g., 10.8505,76.2711"
                value={manualFormData.geoLocation}
                onChange={(e) => setManualFormData({ ...manualFormData, geoLocation: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={3}
                value={manualFormData.remark}
                onChange={(e) => setManualFormData({ ...manualFormData, remark: e.target.value })}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={() => setManualEntryOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveManualEntry}
              disabled={submitting}
              startIcon={<SaveIcon />}
              sx={{
                backgroundColor: '#27ae60',
                '&:hover': { backgroundColor: '#229954' }
              }}
            >
              {submitting ? "Saving..." : "Save Entry"}
            </Button>
          </Box>
        </Card>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ZONE SELECTION DIALOG FOR SUBMISSION */}
<Modal
  open={submitDialogOpen}
  onClose={() => setSubmitDialogOpen(false)}
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
        Select Zone for Submission
      </Typography>
      <IconButton onClick={() => setSubmitDialogOpen(false)} size="small">
        <CloseIcon />
      </IconButton>
    </Box>

    <Divider sx={{ mb: 2 }} />

    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Multiple zones found for this user. Please select the zone for {monthNames[selectedMonth - 1]} {selectedYear} submission.
    </Typography>

    <List>
      {availableZones.map((zone) => (
        <React.Fragment key={zone.zoneId}>
          <ListItem
            button
            onClick={() => performSubmitMonth(zone.zoneId)}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <ListItemText
              primary={zone.zoneName || `Zone ${zone.zoneId}`}
              secondary={`Zone ID: ${zone.zoneId}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
      <Button
        variant="outlined"
        onClick={() => setSubmitDialogOpen(false)}
      >
        Cancel
      </Button>
    </Box>
  </Card>
</Modal>
    </Grid>
  );
};

export default UserTourDiaryDetail;
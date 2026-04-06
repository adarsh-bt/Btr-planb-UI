import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Card,
  Modal,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment
} from "@mui/material";
import MainCard from "components/MainCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import tourDiaryService from "pages/authentication/services/tourdiaryservice";
import authservice from "pages/authentication/services/authservice";
import Breadcrumb from "routes/Breadcrumb";

const UserAdvancedTourDiaryDetail = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get userId and month/year from location state
  const { userId, month: monthParam, year: yearParam, userDetails: userInfo } = location.state || {};
  const [selectedMonth, setSelectedMonth] = useState(monthParam || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(yearParam || new Date().getFullYear());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tourEntries, setTourEntries] = useState([]);
  const [userDetails, setUserDetails] = useState(userInfo || null);
  
  // Schemes and Purposes states
  const [schemes, setSchemes] = useState([]);
  const [allPurposes, setAllPurposes] = useState([]);
  
  // Submission details state (firstHalfId, secondHalfId, etc.)
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingSubmissionDetails, setLoadingSubmissionDetails] = useState(false);
  
  // Modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Individual approval dialog
  const [approvalDialog, setApprovalDialog] = useState({ open: false, entry: null, status: '' });
  
  // ========== BULK APPROVAL STATES ==========
  const [approvalAnchorEl, setApprovalAnchorEl] = useState(null);
  const [bulkApprovalDialogOpen, setBulkApprovalDialogOpen] = useState(false);
  const [approvalHalf, setApprovalHalf] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('APPROVED');

  const [viewMode, setViewMode] = useState('calendar');
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Add these handler functions
  const handleClearSearch = () => {
    setSearchTerm('');
    setTablePage(0);
  };

  const handleTableChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const handleTableChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  // ============================ FETCH SCHEMES AND PURPOSES ============================
  const fetchSchemes = async () => {
    try {
      const data = await tourDiaryService.getAllSchemes();
      if (!data.message) {
        setSchemes(data);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

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
      console.log("All purposes loaded:", uniquePurposes.length);
    } catch (error) {
      console.error("Error fetching all purposes:", error);
    }
  };

  // ============================ FETCH TOUR DATA ============================
  const fetchUserTourEntries = async () => {
    if (!userId) {
      setError("No user selected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const data = await tourDiaryService.getAdvancedTourByFilter(
        userId, selectedMonth, selectedYear
      );
      
      // Check if the response has a payload property (old format)
      if (data && data.payload && Array.isArray(data.payload)) {
        const enhancedData = data.payload.map(entry => {
          if (!entry.purposeName && entry.purposeId && allPurposes.length > 0) {
            const purpose = allPurposes.find(p => p.id === entry.purposeId);
            if (purpose) {
              entry.purposeName = purpose.purposeName;
            }
          }
          return entry;
        });
        setTourEntries(enhancedData);
        
        if (enhancedData.length > 0 && !userDetails) {
          const firstEntry = enhancedData[0];
          setUserDetails({
            name: firstEntry.userName || firstEntry.name || 'N/A',
            empNumber: firstEntry.empNumber || firstEntry.employeeId || 'N/A',
            designation: firstEntry.designation || 'N/A',
            officelocation: firstEntry.officeLocation || firstEntry.location || 'N/A'
          });
        }
      } 
      // Check if response is directly an array (new format after service update)
      else if (Array.isArray(data)) {
        const enhancedData = data.map(entry => {
          if (!entry.purposeName && entry.purposeId && allPurposes.length > 0) {
            const purpose = allPurposes.find(p => p.id === entry.purposeId);
            if (purpose) {
              entry.purposeName = purpose.purposeName;
            }
          }
          return entry;
        });
        setTourEntries(enhancedData);
        
        if (enhancedData.length > 0 && !userDetails) {
          const firstEntry = enhancedData[0];
          setUserDetails({
            name: firstEntry.userName || firstEntry.name || 'N/A',
            empNumber: firstEntry.empNumber || firstEntry.employeeId || 'N/A',
            designation: firstEntry.designation || 'N/A',
            officelocation: firstEntry.officeLocation || firstEntry.location || 'N/A'
          });
        }
      }
      // Check if response has a message property (error case)
      else if (data && data.message) {
        setError(data.message);
        setTourEntries([]);
      } 
      else {
        setTourEntries([]);
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching data");
      setTourEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================ FETCH SUBMISSION DETAILS ============================
  const fetchSubmissionDetails = async () => {
    if (!userId) return;
    
    setLoadingSubmissionDetails(true);
    try {
      const response = await tourDiaryService.getAdminSubmissionDetails(
        userId, selectedYear, selectedMonth
      );
      
      if (!response.error && response.data) {
        console.log("Submission details:", response.data);
        setSubmissionDetails(response.data);
      } else {
        console.error("Error fetching submission details:", response.message);
        setSubmissionDetails(null);
      }
    } catch (error) {
      console.error("Exception in fetchSubmissionDetails:", error);
      setSubmissionDetails(null);
    } finally {
      setLoadingSubmissionDetails(false);
    }
  };

  // ============================ EFFECTS ============================
  // Initial fetch of schemes
  useEffect(() => {
    fetchSchemes();
  }, []);

  // Fetch all purposes when schemes are loaded
  useEffect(() => {
    if (schemes.length > 0) {
      fetchAllPurposes();
    }
  }, [schemes]);

  // Fetch tour entries and submission details when dependencies change
  useEffect(() => {
    if (userId) {
      fetchUserTourEntries();
      fetchSubmissionDetails();
    }
  }, [userId, selectedMonth, selectedYear, allPurposes]); // Added allPurposes as dependency

  // ============================ HANDLERS ============================
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

  // ============================ INDIVIDUAL APPROVAL ============================
  const handleIndividualApproval = (entry, status) => {
    setApprovalDialog({
      open: true,
      entry: entry,
      status: status
    });
  };

  const confirmIndividualApproval = async () => {
    const { entry, status } = approvalDialog;
    
    try {
      setLoading(true);
      
      const adminId = authservice.userid();
      
      if (!adminId) {
        showNotification('error', 'Admin session expired. Please login again.');
        setApprovalDialog({ open: false, entry: null, status: '' });
        return;
      }
      
      const payload = {
        id: entry.id,
        adminId: adminId,
        adminRemark: `Entry ${status} by admin`,
        adminStatus: status
      };
      
      console.log("Individual approval payload:", payload);
      
      const response = await tourDiaryService.submitAdminApproval(payload);
      
      if (!response.error) {
        // Update local state optimistically
        setTourEntries(prev => 
          prev.map(item => 
            item.id === entry.id ? { ...item, status: status } : item
          )
        );
        
        // Update selected day events if the modal is open
        if (selectedDate) {
          const updatedDayEvents = selectedDayEvents.map(item =>
            item.id === entry.id ? { ...item, status: status } : item
          );
          setSelectedDayEvents(updatedDayEvents);
        }
        
        showNotification('success', `Entry ${status} successfully`);
      } else {
        showNotification('error', response.message || "Failed to update status");
      }
      
      setApprovalDialog({ open: false, entry: null, status: '' });
    } catch (error) {
      console.error("Approval error:", error);
      showNotification('error', "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const closeDayModal = () => {
    setDayModalOpen(false);
    setSelectedDate(null);
    setSelectedDayEvents([]);
    setActiveTab(0);
  };

  // ============================ BULK APPROVAL HANDLERS ============================
  const openApprovalMenu = (event) => {
    setApprovalAnchorEl(event.currentTarget);
  };

  const closeApprovalMenu = () => {
    setApprovalAnchorEl(null);
  };

  const handleBulkApprovalHalf = (half) => {
    setApprovalHalf(half);
    setRemarks('');
    setSelectedStatus('APPROVED');
    setBulkApprovalDialogOpen(true);
    closeApprovalMenu();
  };

  const confirmBulkApproval = async () => {
    try {
      setApprovalLoading(true);
      
      const adminId = authservice.userid();
      
      if (!adminId) {
        showNotification('error', 'Admin session expired. Please login again.');
        setBulkApprovalDialogOpen(false);
        return;
      }

      // Get the correct submission ID based on the selected half
      let submissionId = null;
      if (approvalHalf === 'First Half' && submissionDetails?.firstHalfId) {
        submissionId = submissionDetails.firstHalfId;
      } else if (approvalHalf === 'Second Half' && submissionDetails?.secondHalfId) {
        submissionId = submissionDetails.secondHalfId;
      }

      if (!submissionId) {
        showNotification('error', `No submission found for ${approvalHalf}. The user may not have submitted this half.`);
        setBulkApprovalDialogOpen(false);
        return;
      }
      
      // Prepare payload for admin approval - matches your backend DTO
      const payload = {
        id: submissionId,
        adminId: adminId,
        adminRemark: remarks || `${selectedStatus} for ${approvalHalf} of ${monthNames[selectedMonth - 1]} ${selectedYear}`,
        adminStatus: selectedStatus
      };
      
      console.log("Bulk approval payload:", payload);
      
      const response = await tourDiaryService.submitAdminApproval(payload);
      
      if (!response.error) {
        // Refresh submission details and tour entries to get updated statuses
        await fetchSubmissionDetails();
        await fetchUserTourEntries();
        
        showNotification('success', `${approvalHalf} ${selectedStatus} successfully`);
        setBulkApprovalDialogOpen(false);
        setRemarks('');
      } else {
        showNotification('error', response.message || 'Failed to process bulk approval');
      }
    } catch (error) {
      console.error("Bulk approval error:", error);
      showNotification('error', 'Failed to process bulk approval');
    } finally {
      setApprovalLoading(false);
    }
  };

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

  // ============================ HELPER FUNCTIONS ============================
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

  const getStatusChip = (status) => {
    const statusMap = {
      'APPROVED': { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      'REJECTED': { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
      'PENDING': { color: 'warning', icon: <InfoIcon />, label: 'Pending' },
      'DRAFT': { color: 'default', icon: <InfoIcon />, label: 'Draft' },
      'SUBMITTED': { color: 'info', icon: <CheckCircleIcon />, label: 'Submitted' }
    };
    
    const config = statusMap[status] || statusMap['PENDING'];
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const getEntryTypeColor = (entryType) => {
    const typeColors = {
      'WORKING': '#27ae60',
      'WEEK_OFF': '#e67e22',
      'HOLIDAY': '#e74c3c',
      'LEAVE': '#f39c12',
      'TRAINING': '#3498db',
      'OTHER': '#95a5a6'
    };
    return typeColors[entryType] || '#95a5a6';
  };

  // Helper function to get purpose name by ID
  const getPurposeName = (purposeId) => {
    if (!purposeId) return 'N/A';
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

  const getEventCountForDay = (day) => {
    return tourEntries.filter(entry => {
      try {
        const entryDate = new Date(entry.createdAt);
        return entryDate.getDate() === day &&
               entryDate.getMonth() + 1 === selectedMonth &&
               entryDate.getFullYear() === selectedYear;
      } catch (e) {
        return false;
      }
    }).length;
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // ============================ RENDER FUNCTIONS ============================
  const renderCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    // Calculate the 15th day of the month
    const fifteenthDay = 15;

    const calendarDays = [];

    // Empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <Grid item xs={12/7} key={`empty-${i}`}>
          <Box sx={{ minHeight: '90px' }} />
        </Grid>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEntries = getEntriesForDate(day);
      const entryCount = dayEntries.length;
      
      const isSun = isSunday(selectedYear, selectedMonth, day);
      const is2ndSat = isSecondSaturday(selectedYear, selectedMonth, day);

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
        <Grid item xs={12/7} key={day}>
          <Paper
            onClick={() => handleDateClick(day)}
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
                color: (isSun || is2ndSat) ? '#d32f2f' : theme.palette.text.primary,
                mb: 1
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
                      minWidth: '22px',
                      width: 'auto',
                      padding: entryCount >= 10 ? '0 4px' : '0 6px',
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

  // ============================ RENDER TABLE VIEW (UPDATED TO MATCH ZONECLUSTERREPORT STYLE) ============================
  const renderTableView = () => {
    // Prepare all entries with their associated date information
    const allEntriesWithDetails = [];
    
    tourEntries.forEach(entry => {
      try {
        const date = new Date(entry.createdAt);
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        const dayName = dayNames[dayOfWeek];
        const isFirstHalf = day <= 15;
        const isSecondHalf = day > 15;
        const isSun = isSunday(selectedYear, selectedMonth, day);
        const is2ndSat = isSecondSaturday(selectedYear, selectedMonth, day);
        
        allEntriesWithDetails.push({
          ...entry,
          day,
          dayName,
          isFirstHalf,
          isSecondHalf,
          isSun,
          is2ndSat,
          formattedDate: `${day} ${monthNames[selectedMonth - 1]} ${selectedYear}`,
          purposeName: entry.purposeName || getPurposeName(entry.purposeId),
          location: entry.location || 'N/A',
          remark: entry.remark || '-',
          entryType: entry.entryType || 'WORKING',
          status: entry.status || 'PENDING'
        });
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });

    // Sort entries by date (ascending)
    allEntriesWithDetails.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Filter based on search term
    const filteredEntries = searchTerm
      ? allEntriesWithDetails.filter(entry => 
          entry.formattedDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.dayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.entryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.location && entry.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.purposeName && entry.purposeName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : allEntriesWithDetails;

    // Paginate data
    const paginatedEntries = filteredEntries.slice(
      tablePage * rowsPerPage,
      tablePage * rowsPerPage + rowsPerPage
    );

    if (allEntriesWithDetails.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No tour entries found for this user in {monthNames[selectedMonth - 1]} {selectedYear}.
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <MainCard 
          title={`Tour Entries - ${monthNames[selectedMonth - 1]} ${selectedYear}`}
          secondary={<EventIcon />}
          sx={{
            '& .MuiCardContent-root': {
              p: 0
            }
          }}
        >
          {/* Search Bar - Matching ZoneClusterReport style */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Entry-wise Report
              </Typography>
              <TextField
                placeholder="Search by date, day, type, location or purpose"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setTablePage(0);
                }}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
          </Box>

          <TableContainer sx={{ borderRadius: 2, overflow: 'auto' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#04255e' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Day</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Half</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entry Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purpose</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEntries.length > 0 ? (
                  paginatedEntries.map((entry, index) => {
                    // Determine row background color based on day type
                    let rowBgColor = 'inherit';
                    if (entry.isSun) {
                      rowBgColor = theme.palette.mode === 'dark' ? '#4a2a2a' : '#ffe6e6';
                    } else if (entry.is2ndSat) {
                      rowBgColor = theme.palette.mode === 'dark' ? '#4a3a2a' : '#fff4e6';
                    } else if (entry.isFirstHalf) {
                      rowBgColor = theme.palette.mode === 'dark' ? '#1a2a3a' : '#e3f2fd';
                    } else if (entry.isSecondHalf) {
                      rowBgColor = theme.palette.mode === 'dark' ? '#1a3a2a' : '#e8f5e9';
                    }

                    return (
                      <TableRow 
                        key={entry.id || index}
                        sx={{ 
                          bgcolor: rowBgColor,
                          '&:hover': { 
                            bgcolor: theme.palette.action.hover,
                            cursor: 'pointer'
                          },
                          transition: '0.2s'
                        }}
                        onClick={() => handleViewEntryDetails(entry)}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {entry.formattedDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{entry.dayName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.isFirstHalf ? 'FH' : 'SH'}
                            size="small"
                            sx={{
                              height: '24px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              backgroundColor: entry.isFirstHalf 
                                ? (theme.palette.mode === 'dark' ? '#1976d2' : '#bbdefb')
                                : (theme.palette.mode === 'dark' ? '#2e7d32' : '#c8e6c9'),
                              color: entry.isFirstHalf 
                                ? (theme.palette.mode === 'dark' ? '#fff' : '#0d47a1')
                                : (theme.palette.mode === 'dark' ? '#fff' : '#1b5e20'),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.entryType}
                            size="small"
                            sx={{ 
                              bgcolor: getEntryTypeColor(entry.entryType),
                              color: 'white',
                              fontWeight: 500,
                              height: '24px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.entryType === 'WORKING' ? entry.location : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.entryType === 'WORKING' ? entry.purposeName : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewEntryDetails(entry);
                                }}
                                sx={{ 
                                  color: '#04255e',
                                  '&:hover': { bgcolor: '#e3f2fd' }
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {entry.status === 'PENDING' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIndividualApproval(entry, 'APPROVED');
                                    }}
                                    sx={{ 
                                      color: '#27ae60',
                                      '&:hover': { bgcolor: '#27ae6020' }
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIndividualApproval(entry, 'REJECTED');
                                    }}
                                    sx={{ 
                                      color: '#e74c3c',
                                      '&:hover': { bgcolor: '#e74c3c20' }
                                    }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm 
                          ? `No tour entries found matching "${searchTerm}"` 
                          : `No tour entries found for ${monthNames[selectedMonth - 1]} ${selectedYear}`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination - Matching ZoneClusterReport style */}
          {filteredEntries.length > 0 && (
            <TablePagination
              component="div"
              count={filteredEntries.length}
              page={tablePage}
              onPageChange={handleTableChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleTableChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiTablePagination-select': {
                  borderRadius: 1
                }
              }}
            />
          )}
        </MainCard>
      </Box>
    );
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <EventIcon fontSize="small" color="action" />
                    {/* {getStatusChip(event.status)} */}
                    <Chip
                      label={event.entryType || 'WORKING'}
                      size="small"
                      sx={{ 
                        bgcolor: getEntryTypeColor(event.entryType),
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {/* Only show purpose and location for WORKING entries */}
                  {event.entryType === 'WORKING' && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Purpose:</strong> {event.purposeName || getPurposeName(event.purposeId)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Location:</strong> {event.location}
                      </Typography>
                    </>
                  )}
                    {event.remark && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Remark:</strong> {event.remark}
                      </Typography>
                    )}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {new Date(event.createdAt).toLocaleDateString('en-GB')}
                  </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="View Details">
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
                  </Tooltip>
                  {event.status === 'PENDING' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          edge="end"
                          onClick={() => handleIndividualApproval(event, 'APPROVED')}
                          sx={{ 
                            color: '#27ae60',
                            '&:hover': {
                              backgroundColor: '#27ae6020'
                            }
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          edge="end"
                          onClick={() => handleIndividualApproval(event, 'REJECTED')}
                          sx={{ 
                            color: '#e74c3c',
                            '&:hover': {
                              backgroundColor: '#e74c3c20'
                            }
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  // ============================ RENDER ============================
  if (!userId) {
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
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Calendar Header with Navigation */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              {/* Left section with back button and submission details */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexWrap: 'wrap'
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
                
                {submissionDetails && (
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f7ff',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                      {/* First Half */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          FH:
                        </Typography>
                        {submissionDetails.firstHalfIsLate ? (
                          <Chip 
                            label="LATE" 
                            size="small" 
                            color="warning" 
                            sx={{ height: '24px', fontWeight: 'bold' }} 
                          />
                        ) : (
                          submissionDetails.firstHalfId && (
                            <Chip 
                              label="ON TIME" 
                              size="small" 
                              color="success" 
                              sx={{ height: '24px', fontWeight: 'bold' }} 
                            />
                          )
                        )}
                      </Box>

                      {/* Second Half */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          SH:
                        </Typography>
                        {submissionDetails.secondHalfIsLate ? (
                          <Chip 
                            label="LATE" 
                            size="small" 
                            color="warning" 
                            sx={{ height: '24px', fontWeight: 'bold' }} 
                          />
                        ) : (
                          submissionDetails.secondHalfId && (
                            <Chip 
                              label="ON TIME" 
                              size="small" 
                              color="success" 
                              sx={{ height: '24px', fontWeight: 'bold' }} 
                            />
                          )
                        )}
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* View Mode Toggle */}
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        id="calendar-view"
                        name="viewMode"
                        value="calendar"
                        checked={viewMode === 'calendar'}
                        onChange={() => setViewMode('calendar')}
                        style={{ marginRight: '4px', cursor: 'pointer' }}
                      />
                      <Typography 
                        variant="body2" 
                        component="label" 
                        htmlFor="calendar-view"
                        sx={{ cursor: 'pointer' }}
                      >
                        Calendar View
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        id="table-view"
                        name="viewMode"
                        value="table"
                        checked={viewMode === 'table'}
                        onChange={() => setViewMode('table')}
                        style={{ marginRight: '4px', cursor: 'pointer' }}
                      />
                      <Typography 
                        variant="body2" 
                        component="label" 
                        htmlFor="table-view"
                        sx={{ cursor: 'pointer' }}
                      >
                        Table View
                      </Typography>
                    </Box>
                  </Box>
                </FormControl>
              </Box>

              {/* Center - Month/Year with Navigation Arrows */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={() => handleMonthChange(-1)} 
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.grey[200],
                    '&:hover': { backgroundColor: theme.palette.grey[300] }
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    fontWeight: 500,
                    minWidth: '200px'
                  }}
                >
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </Typography>
                <IconButton 
                  onClick={() => handleMonthChange(1)} 
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.grey[200],
                    '&:hover': { backgroundColor: theme.palette.grey[300] }
                  }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Right section with approval button */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2
              }}>
                <Box>
                  <Button
                    variant="contained"
                    onClick={openApprovalMenu}
                    disabled={loadingSubmissionDetails}
                    sx={{
                      backgroundColor: '#27ae60',
                      '&:hover': { backgroundColor: '#1e8449' },
                      '&.Mui-disabled': {
                        backgroundColor: theme.palette.action.disabledBackground
                      },
                      whiteSpace: 'nowrap',
                      minWidth: '90px'
                    }}
                  >
                    {loadingSubmissionDetails ? "Loading..." : "Approval"}
                  </Button>
                  <Menu
                    anchorEl={approvalAnchorEl}
                    open={Boolean(approvalAnchorEl)}
                    onClose={closeApprovalMenu}
                  >
                    <MenuItem 
                      onClick={() => handleBulkApprovalHalf('First Half')}
                      disabled={!submissionDetails?.firstHalfId}
                    >
                      First Half
                      {!submissionDetails?.firstHalfId && (
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                          (Not submitted)
                        </Typography>
                      )}
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleBulkApprovalHalf('Second Half')}
                      disabled={!submissionDetails?.secondHalfId}
                    >
                      Second Half
                      {!submissionDetails?.secondHalfId && (
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                          (Not submitted)
                        </Typography>
                      )}
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            </Box>

            {/* Legend */}
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
                  Has Entries
                </Typography>
              </Box>
            </Box>

            {/* Loading State */}
            {loading && (
              <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
                Loading tour data...
              </Typography>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {/* No Data State */}
            {!loading && !error && tourEntries.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No tour entries found for this user in {monthNames[selectedMonth - 1]} {selectedYear}.
              </Alert>
            )}

            {/* Calendar or Table View */}
            {!loading && !error && (
              <>
                {viewMode === 'calendar' ? (
                  <Grid container spacing={0.125}>
                    {/* Day headers */}
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

                    {/* Calendar days */}
                    {renderCalendar()}
                  </Grid>
                ) : (
                  renderTableView()
                )}
              </>
            )}
          </Box>
        </MainCard>
      </Grid>

      {/* ==================== DAY VIEW MODAL ==================== */}
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
              Tour Plan – {new Date(selectedDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
              })}
            </Typography>
            <IconButton onClick={closeDayModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab
                label={`View Tours (${selectedDayEvents.length})`}
                icon={<EventIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box>
              {renderEventList()}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
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
            </Box>
          )}
        </Card>
      </Modal>

      {/* ==================== ENTRY DETAILS MODAL ==================== */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
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
            <IconButton onClick={() => setDetailModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(selectedEntry.createdAt).toLocaleDateString('en-GB')}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Entry Type</Typography>
                <Chip 
                  label={selectedEntry.entryType || 'WORKING'}
                  size="small"
                  sx={{ 
                    bgcolor: getEntryTypeColor(selectedEntry.entryType),
                    color: 'white',
                    mt: 0.5,
                    fontWeight: 500
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Only show Location and Purpose for WORKING entries */}
              {selectedEntry.entryType === 'WORKING' && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedEntry.location}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Purpose</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedEntry.purposeName || getPurposeName(selectedEntry.purposeId)}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {/* Show remarks for all entry types if available */}
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
              onClick={() => setDetailModalOpen(false)}
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

      {/* ==================== INDIVIDUAL APPROVAL CONFIRMATION DIALOG ==================== */}
      <Dialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ open: false, entry: null, status: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm {approvalDialog.status === 'APPROVED' ? 'Approval' : 'Rejection'}
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to {approvalDialog.status === 'APPROVED' ? 'approve' : 'reject'} this tour entry?
          </Typography>
          
          {approvalDialog.entry && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                backgroundColor: theme.palette.action.hover, 
                borderRadius: 1 
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Location:</strong> {approvalDialog.entry.location}
              </Typography>
              <Typography variant="body2">
                <strong>Purpose:</strong> {approvalDialog.entry.purposeName || getPurposeName(approvalDialog.entry.purposeId) || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {new Date(approvalDialog.entry.createdAt).toLocaleDateString()}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setApprovalDialog({ open: false, entry: null, status: '' })} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmIndividualApproval}
            variant="contained"
            sx={{
              backgroundColor: approvalDialog.status === 'APPROVED' ? '#27ae60' : '#e74c3c',
              '&:hover': {
                backgroundColor: approvalDialog.status === 'APPROVED' ? '#1e8449' : '#c0392b'
              }
            }}
          >
            Confirm {approvalDialog.status === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== BULK APPROVAL DIALOG ==================== */}
      <Dialog
        open={bulkApprovalDialogOpen}
        onClose={() => setBulkApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {approvalHalf} Approval
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            Process approval for {approvalHalf?.toLowerCase()} of {monthNames[selectedMonth - 1]} {selectedYear}
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={selectedStatus}
              label="Action"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="APPROVED">Approve</MenuItem>
              <MenuItem value="REJECTED">Reject</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            variant="outlined"
            placeholder={`Add remarks for ${selectedStatus === 'APPROVED' ? 'approval' : 'rejection'}`}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This will {selectedStatus === 'APPROVED' ? 'approve' : 'reject'} the entire {approvalHalf?.toLowerCase()} submission.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setBulkApprovalDialogOpen(false)} 
            variant="outlined"
            disabled={approvalLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBulkApproval}
            variant="contained"
            disabled={approvalLoading}
            sx={{
              backgroundColor: selectedStatus === 'APPROVED' ? '#27ae60' : '#e74c3c',
              '&:hover': {
                backgroundColor: selectedStatus === 'APPROVED' ? '#1e8449' : '#c0392b'
              },
              minWidth: '120px'
            }}
          >
            {approvalLoading ? "Processing..." : `Confirm ${selectedStatus === 'APPROVED' ? 'Approve' : 'Reject'}`}
          </Button>
        </DialogActions>
      </Dialog>

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
              backgroundColor: notification.type === 'success' ? '#2e7d32' : '#d32f2f',
              minWidth: '100px'
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserAdvancedTourDiaryDetail;
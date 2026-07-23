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

  const getLocalStorageYear = (currentMonth) => {
    const agriYear = localStorage.getItem("activeAgriYear");
    
    if (agriYear && agriYear.includes('-')) {
      const [startYear, endYear] = agriYear.split('-').map(Number);
      if (!isNaN(startYear) && !isNaN(endYear)) {
        return currentMonth >= 7 ? startYear : endYear;
      }
    }
    return new Date().getFullYear(); 
  };
  
  const { userId, month: monthParam, year: yearParam, userDetails: userInfo } = location.state || {};
  const [roleName, setRoleName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthParam || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(yearParam || getLocalStorageYear());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tourEntries, setTourEntries] = useState([]);
  const [userDetails, setUserDetails] = useState(userInfo || null);
  const [schemes, setSchemes] = useState([]);
  const [allPurposes, setAllPurposes] = useState([]);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingSubmissionDetails, setLoadingSubmissionDetails] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewMode, setViewMode] = useState('table');
  
  // Individual approval dialog
  const [approvalDialog, setApprovalDialog] = useState({ open: false, entry: null, status: '' });
  
  // Bulk approval states
  const [approvalAnchorEl, setApprovalAnchorEl] = useState(null);
  const [bulkApprovalDialogOpen, setBulkApprovalDialogOpen] = useState(false);
  const [approvalHalf, setApprovalHalf] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('APPROVED');
  
  // Verification states
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationHalf, setVerificationHalf] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('APPROVED');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSubmissionId, setVerificationSubmissionId] = useState(null);
  const [verificationAnchorEl, setVerificationAnchorEl] = useState(null);
  const [userZones, setUserZones] = useState([]);
const [selectedZoneId, setSelectedZoneId] = useState(null);
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

  const loggedInRole = authservice.getrole();

  // ============================================================
  // ROLE-BASED PERMISSION LOGIC
  // ============================================================
  
  /**
   * Determine who can verify based on roleName and loggedInRole
   */
  const canVerify = () => {
    // Field Inspector verifying Field Data Collector (First & Second Half)
    if (roleName === "Field Data Collector" && loggedInRole === "Field Inspector") {
      return true;
    }
    // Taluk Level Approver verifying Field Inspector (Full Month)
    if (roleName === "Field Inspector" && loggedInRole === "Taluk Level Approver") {
      return true;
    }
    return false;
  };

  /**
   * Determine who can approve based on roleName and loggedInRole
   */
  const canApprove = () => {
    // Taluk Level Approver approving Field Data Collector (First & Second Half)
    if (roleName === "Field Data Collector" && loggedInRole === "Taluk Level Approver") {
      return true;
    }
    // District Level Approver approving Field Inspector (Full Month)
    if (roleName === "Field Inspector" && loggedInRole === "District Level Approver") {
      return true;
    }
    // District Level Approver approving Taluk Level Approver (Full Month)
    if (roleName === "Taluk Level Approver" && loggedInRole === "District Level Approver") {
      return true;
    }
    if (roleName === "District Level Data Viewer" && loggedInRole === "District Level Approver") {
      return true;
    }
    // IT Admin approving District Level Approver (Full Month)
    if (roleName === "District Level Approver" && loggedInRole === "IT Admin") {
      return true;
    }
    return false;
  };

  /**
   * Get verification options based on role
   */

  // Fetch zones for the user
// Fetch zones for the user - Updated with better error handling
const fetchUserZones = async () => {
  if (!userId) {
    console.log("No userId provided for zone fetch");
    return;
  }
  
  try {
    // Determine which API to use based on the user's role (not logged-in role)
    const userRole = roleName || await tourDiaryService.getUserRole(userId);
    const loggedInRole = authservice.getrole();
    
    console.log("Fetching zones for userId:", userId);
    console.log("User role:", userRole);
    console.log("Logged-in role:", loggedInRole);
    
    let response = [];
    
    // For Field Data Collector - use assigned zones
    if (userRole === "Field Data Collector" || loggedInRole === "Field Data Collector") {
      response = await tourDiaryService.getAssignedZones(userId);
      console.log("Assigned zones response:", response);
    } 
    // For Field Inspector & Taluk Level Approver - use zone dropdown
    else if (userRole === "Field Inspector" || userRole === "Taluk Level Approver" || 
             loggedInRole === "Field Inspector" || loggedInRole === "Taluk Level Approver") {
      response = await tourDiaryService.getZoneDropdown();
      console.log("Zone dropdown response:", response);
    } 
    // For District Level roles - fetch taluks first, then zones
    else if (userRole === "District Level Approver" || userRole === "District Level Data Viewer" ||
             loggedInRole === "District Level Approver" || loggedInRole === "District Level Data Viewer") {
      // For now, fetch all zones directly - you may need to implement taluk selection
      response = await tourDiaryService.getZoneDropdown();
      console.log("District zone dropdown response:", response);
    }
    
    // Process the response
    if (response && Array.isArray(response) && response.length > 0) {
      // Map the response to ensure consistent format
      const mappedZones = response.map(zone => ({
        zoneId: zone.zoneId,
        zoneName: zone.zoneNameEn || zone.zoneName || `Zone ${zone.zoneId}`,
        zoneType: zone.zoneType || 'N/A'
      }));
      setUserZones(mappedZones);
      console.log("Zones set successfully:", mappedZones);
    } else {
      console.log("No zones found or empty response");
      setUserZones([]);
    }
  } catch (error) {
    console.error("Error fetching zones:", error);
    setUserZones([]);
  }
};

// Get zone name by zone ID
// Get zone name by zone ID - with debugging
const getZoneName = (zoneId) => {
  if (!zoneId) return '—';
  
  console.log("Getting zone name for zoneId:", zoneId);
  console.log("Available userZones:", userZones);
  
  if (userZones.length === 0) {
    // Try to find zone in tourEntries data
    const entryWithZone = tourEntries.find(e => e.zoneId === zoneId);
    if (entryWithZone && entryWithZone.zoneName) {
      return entryWithZone.zoneName;
    }
    return `Zone ${zoneId}`;
  }
  
  // Try to find by zoneId (number)
  const zone = userZones.find(z => Number(z.zoneId) === Number(zoneId));
  
  if (zone) {
    return zone.zoneName || `Zone ${zoneId}`;
  }
  
  // Fallback: search in tourEntries for zone name
  const entryWithZone = tourEntries.find(e => e.zoneId === zoneId);
  if (entryWithZone && entryWithZone.zoneName) {
    return entryWithZone.zoneName;
  }
  
  return `Zone ${zoneId}`;
};
  const getVerificationOptions = () => {
    if (roleName === "Field Data Collector") {
      // Field Inspector verifies First & Second Half
      return ["First Half", "Second Half"];
    } else if (roleName === "Field Inspector") {
      // Taluk Level Approver verifies Full Month
      return ["Full Month"];
    }
    return [];
  };

  /**
   * Get approval options based on role
   */
  const getApprovalOptions = () => {
    if (roleName === "Field Data Collector") {
      // Taluk Level Approver approves First & Second Half
      return ["First Half", "Second Half"];
    } else if (roleName === "Field Inspector") {
      // District Level Approver approves Full Month
      return ["Full Month"];
    } else if (roleName === "Taluk Level Approver") {
      // District Level Approver approves Full Month
      return ["Full Month"];
      // District Level Data Viewer approves Full Month
    } else if (roleName === "District Level Data Viewer") {
      return ["Full Month"];
      // District Level Approver approves Full Month
    } else if (roleName === "District Level Approver") {
      // IT Admin approves Full Month
      return ["Full Month"];
    }
    return [];
  };

  /**
   * Check if a specific half can be verified
   */
  const canVerifyHalf = (half) => {
    if (!submissionDetails) return false;
    
    // Check if submitted
    let isSubmitted = false;
    let verifiedStatus = '';
    
    if (half === "First Half") {
      isSubmitted = submissionDetails.firstHalfSubmitted;
      verifiedStatus = submissionDetails.firstHalfVerifiedStatus;
    } else if (half === "Second Half") {
      isSubmitted = submissionDetails.secondHalfSubmitted;
      verifiedStatus = submissionDetails.secondHalfVerifiedStatus;
    } else if (half === "Full Month") {
      isSubmitted = submissionDetails.fullMonthSubmitId;
      verifiedStatus = submissionDetails.fullMonthVerifiedStatus;
    }
    
    // Must be submitted and not already approved
    return isSubmitted && verifiedStatus !== 'APPROVED';
  };

  /**
   * Check if a specific half can be approved
   */
  const canApproveHalf = (half) => {
    if (!submissionDetails) return false;
    
    let isSubmitted = false;
    let adminStatus = '';
    let verifiedStatus = '';
    
    if (half === "First Half") {
      isSubmitted = submissionDetails.firstHalfSubmitted;
      adminStatus = submissionDetails.firstHalfAdminStatus;
      verifiedStatus = submissionDetails.firstHalfVerifiedStatus;
    } else if (half === "Second Half") {
      isSubmitted = submissionDetails.secondHalfSubmitted;
      adminStatus = submissionDetails.secondHalfAdminStatus;
      verifiedStatus = submissionDetails.secondHalfVerifiedStatus;
    } else if (half === "Full Month") {
      isSubmitted = submissionDetails.fullMonthSubmitId;
      adminStatus = submissionDetails.fullMonthAdminStatus;
      verifiedStatus = submissionDetails.fullMonthVerifiedStatus;
    }
    
    // Must be submitted, not already approved, and verification must be approved (if verification is required)
    if (!isSubmitted || adminStatus === 'APPROVED') return false;
    
    // Check verification requirement based on role
    if (roleName === "Field Data Collector") {
      // First & Second Half need verification before approval
      return verifiedStatus === 'APPROVED' || adminStatus === 'PENDING' || adminStatus === 'REJECTED';
    } else if (roleName === "Field Inspector") {
      // Full Month needs verification before approval (by Taluk Level Approver)
      return verifiedStatus === 'APPROVED';
    } else if (roleName === "Taluk Level Approver" || roleName === "District Level Approver" || roleName === "District Level Data Viewer") {
      // No verification required for these roles
      return true;
    }
    
    return false;
  };

  // ============================================================
  // HANDLER FUNCTIONS
  // ============================================================
  
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

  // ============================ FETCH FUNCTIONS ============================

  const fetchUserRole = async () => {
    if (!userId) return;
    try {
      const response = await tourDiaryService.getUserRole(userId);
      if (!response.error && response.data?.payload?.roles?.length > 0) {
        setRoleName(response.data.payload.roles[0].roleName);
      }
    } catch (err) {
      console.error("Failed to fetch role", err);
    }
  };

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
      for (const scheme of schemes) {
        const data = await tourDiaryService.getActivePurposes(scheme.id);
        if (data && !data.message && Array.isArray(data)) {
          allPurposesData.push(...data);
        }
      }
      const uniquePurposes = Array.from(
        new Map(allPurposesData.map(p => [p.id, p])).values()
      );
      setAllPurposes(uniquePurposes);
    } catch (error) {
      console.error("Error fetching all purposes:", error);
    }
  };

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
    
    if (data && data.payload && Array.isArray(data.payload)) {
      const enhancedData = data.payload.map(entry => {
        if (!entry.purposeName && entry.purposeId && allPurposes.length > 0) {
          const purpose = allPurposes.find(p => p.id === entry.purposeId);
          if (purpose) {
            entry.purposeName = purpose.purposeName;
          }
        }
        // Ensure zoneId is a number for consistency
        if (entry.zoneId) {
          entry.zoneId = Number(entry.zoneId);
        }
        return entry;
      });
      setTourEntries(enhancedData);
      
      // Also extract zone names from entries and add to userZones
      const zonesFromEntries = enhancedData
        .filter(entry => entry.zoneId)
        .map(entry => ({
          zoneId: Number(entry.zoneId),
          zoneName: entry.zoneName || `Zone ${entry.zoneId}`
        }));
      
      // Remove duplicates
      const uniqueZones = Array.from(
        new Map(zonesFromEntries.map(z => [z.zoneId, z])).values()
      );
      
      if (uniqueZones.length > 0 && userZones.length === 0) {
        setUserZones(uniqueZones);
        console.log("Zones extracted from entries:", uniqueZones);
      }
      
      if (enhancedData.length > 0 && !userDetails) {
        const firstEntry = enhancedData[0];
        setUserDetails({
          name: firstEntry.userName || firstEntry.name || 'N/A',
          empNumber: firstEntry.empNumber || firstEntry.employeeId || 'N/A',
          designation: firstEntry.designation || 'N/A',
          officelocation: firstEntry.officeLocation || firstEntry.location || 'N/A'
        });
      }
    } else if (Array.isArray(data)) {
      const enhancedData = data.map(entry => {
        if (!entry.purposeName && entry.purposeId && allPurposes.length > 0) {
          const purpose = allPurposes.find(p => p.id === entry.purposeId);
          if (purpose) {
            entry.purposeName = purpose.purposeName;
          }
        }
        if (entry.zoneId) {
          entry.zoneId = Number(entry.zoneId);
        }
        return entry;
      });
      setTourEntries(enhancedData);
      
      // Extract zones from entries
      const zonesFromEntries = enhancedData
        .filter(entry => entry.zoneId)
        .map(entry => ({
          zoneId: Number(entry.zoneId),
          zoneName: entry.zoneName || `Zone ${entry.zoneId}`
        }));
      
      const uniqueZones = Array.from(
        new Map(zonesFromEntries.map(z => [z.zoneId, z])).values()
      );
      
      if (uniqueZones.length > 0 && userZones.length === 0) {
        setUserZones(uniqueZones);
      }
      
      if (enhancedData.length > 0 && !userDetails) {
        const firstEntry = enhancedData[0];
        setUserDetails({
          name: firstEntry.userName || firstEntry.name || 'N/A',
          empNumber: firstEntry.empNumber || firstEntry.employeeId || 'N/A',
          designation: firstEntry.designation || 'N/A',
          officelocation: firstEntry.officeLocation || firstEntry.location || 'N/A'
        });
      }
    } else if (data && data.message) {
      setError("Currently no tour diary entries found for the selected month and year.");
      setTourEntries([]);
    } else {
      setTourEntries([]);
    }
  } catch (error) {
    setError(error.message || "An error occurred while fetching data");
    setTourEntries([]);
  } finally {
    setLoading(false);
  }
};

  const fetchSubmissionDetails = async () => {
    if (!userId) return;
    
    setLoadingSubmissionDetails(true);
    try {
      const viewResponse = await tourDiaryService.getAdminSubmissionView(userId, selectedYear);
      const detailResponse = await tourDiaryService.getAdminSubmissionDetails(
        userId, selectedYear, selectedMonth
      );

      let monthData = null;

      if (!viewResponse.error && viewResponse.data) {
        monthData = Array.isArray(viewResponse.data)
          ? viewResponse.data.find(item => item.month === selectedMonth)
          : viewResponse.data;
      }

      if (monthData && !detailResponse.error && detailResponse.data) {
        monthData = {
          ...monthData,
          firstHalfId: detailResponse.data.firstHalfId || null,
          secondHalfId: detailResponse.data.secondHalfId || null,
          fullMonthId: detailResponse.data.fullMonthId || null,
        };
        console.log("Fetched submission details:", monthData);
      }

      setSubmissionDetails(monthData || null);
    } catch (error) {
      console.error("Exception in fetchSubmissionDetails:", error);
      setSubmissionDetails(null);
    } finally {
      setLoadingSubmissionDetails(false);
    }
  };

  // ============================ EFFECTS ============================
  
  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    if (schemes.length > 0) {
      fetchAllPurposes();
    }
  }, [schemes]);

  // Fetch zones when roleName changes
useEffect(() => {
  if (userId && roleName) {
    fetchUserZones();
  }
}, [roleName]);

useEffect(() => {
  if (userId) {
    const loadData = async () => {
      await fetchUserRole();
      await fetchUserTourEntries();
      // Fetch zones after tour entries (or in parallel)
      await fetchUserZones();
      await fetchSubmissionDetails();
    };
    loadData();
  }
}, [userId, selectedMonth, selectedYear]);

  // ============================ HANDLERS ============================
  
  const handleBack = () => {
    navigate(-1);
  };

  const handleMonthChange = (offset) => {
    const agriYear = localStorage.getItem("activeAgriYear") || "";
    const [startYear, endYear] = agriYear ? agriYear.split('-').map(Number) : [null, null];

    let newMonth = selectedMonth + offset;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    if (startYear && endYear) {
      if (newYear < startYear || (newYear === startYear && newMonth < 7)) {
        showNotification('info', `Cannot navigate prior to the start of Agri Year ${agriYear}`);
        return;
      }
      if (newYear > endYear || (newYear === endYear && newMonth > 6)) {
        showNotification('info', `Cannot navigate past the end of Agri Year ${agriYear}`);
        return;
      }
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

  // ============================ HELPER FUNCTIONS ============================

// ... (keep your existing helper functions)

/**
 * Get verification status chip for a half
 */
const getVerificationStatusChip = (half) => {
  if (!submissionDetails) return null;
  
  let isSubmitted = false;
  let status = '';
  
  if (half === "First Half") {
    isSubmitted = submissionDetails.firstHalfSubmitted;
    status = submissionDetails.firstHalfVerifiedStatus;
  } else if (half === "Second Half") {
    isSubmitted = submissionDetails.secondHalfSubmitted;
    status = submissionDetails.secondHalfVerifiedStatus;
  } else if (half === "Full Month") {
    isSubmitted = submissionDetails.fullMonthSubmitId;
    status = submissionDetails.fullMonthVerifiedStatus;
  }
  
  if (!isSubmitted) {
    return <Typography variant="caption" color="text.disabled">(Not submitted)</Typography>;
  }
  
  const statusMap = {
    'APPROVED': { label: 'Verified ✓', color: 'success' },
    'REJECTED': { label: 'Rejected ✗', color: 'error' },
    'PENDING': { label: 'Pending', color: 'warning' }
  };
  
  const config = statusMap[status] || statusMap['PENDING'];
  
  return (
    <Chip
      label={config.label}
      size="small"
      color={config.color}
      sx={{ height: '20px', fontSize: '0.6rem', fontWeight: 'bold' }}
    />
  );
};

/**
 * Get approval status chip for a half
 */
const getApprovalStatusChip = (half) => {
  if (!submissionDetails) return null;
  
  let isSubmitted = false;
  let status = '';
  
  if (half === "First Half") {
    isSubmitted = submissionDetails.firstHalfSubmitted;
    status = submissionDetails.firstHalfAdminStatus;
  } else if (half === "Second Half") {
    isSubmitted = submissionDetails.secondHalfSubmitted;
    status = submissionDetails.secondHalfAdminStatus;
  } else if (half === "Full Month") {
    isSubmitted = submissionDetails.fullMonthAdminStatus;
    status = submissionDetails.fullMonthAdminStatus;
  }
  
  if (!isSubmitted) {
    return <Typography variant="caption" color="text.disabled">(Not submitted)</Typography>;
  }
  
  const statusMap = {
    'APPROVED': { label: 'Approved ✓', color: 'success' },
    'REJECTED': { label: 'Rejected ✗', color: 'error' },
    'PENDING': { label: 'Pending', color: 'warning' },
    'SUBMITTED': { label: 'Submitted', color: 'info' }
  };
  
  const config = statusMap[status] || statusMap['PENDING'];
  
  return (
    <Chip
      label={config.label}
      size="small"
      color={config.color}
      sx={{ height: '20px', fontSize: '0.6rem', fontWeight: 'bold' }}
    />
  );
};

/**
 * Render submission status for the header
 */
const renderSubmissionStatus = () => {
  if (!submissionDetails) return null;

  // For Field Data Collector - show First & Second Half
  if (roleName === "Field Data Collector") {
    return (
      <>
        {/* First Half */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            FH:
          </Typography>
          {submissionDetails.firstHalfSubmitted && submissionDetails.firstHalfSubmittedDate ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                {`Submitted on ${new Date(submissionDetails.firstHalfSubmittedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}, ${new Date(submissionDetails.firstHalfSubmittedDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                })}`}
              </Typography>
              {/* Admin Status */}
              {submissionDetails.firstHalfAdminStatus && (
                <Chip
                  label={`Admin: ${submissionDetails.firstHalfAdminStatus}`}
                  size="small"
                  color={
                    submissionDetails.firstHalfAdminStatus === "APPROVED" ? "success" :
                    submissionDetails.firstHalfAdminStatus === "REJECTED" ? "error" : "warning"
                  }
                  sx={{ height: "20px", fontSize: "0.6rem", fontWeight: "bold" }}
                />
              )}
              {/* Verification Status */}
              {submissionDetails.firstHalfVerifiedStatus && (
                <Chip
                  label={`Ver: ${submissionDetails.firstHalfVerifiedStatus}`}
                  size="small"
                  color={
                    submissionDetails.firstHalfVerifiedStatus === "APPROVED" ? "success" :
                    submissionDetails.firstHalfVerifiedStatus === "REJECTED" ? "error" : "warning"
                  }
                  sx={{ height: "20px", fontSize: "0.6rem", fontWeight: "bold" }}
                />
              )}
              {/* Remarks Indicator */}
              {(submissionDetails.firstHalfAdminRemark || submissionDetails.firstHalfVerificationRemark) && (
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      {submissionDetails.firstHalfAdminRemark && (
                        <Typography variant="body2">
                          <strong>Admin Remark:</strong> {submissionDetails.firstHalfAdminRemark}
                        </Typography>
                      )}
                      {submissionDetails.firstHalfVerificationRemark && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Verification Remark:</strong> {submissionDetails.firstHalfVerificationRemark}
                        </Typography>
                      )}
                    </Box>
                  }
                  arrow
                >
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    <InfoIcon fontSize="small" color="info" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
              Not submitted
            </Typography>
          )}
        </Box>

        {/* Second Half */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            SH:
          </Typography>
          {submissionDetails.secondHalfSubmitted && submissionDetails.secondHalfSubmittedDate ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                {`Submitted on ${new Date(submissionDetails.secondHalfSubmittedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}, ${new Date(submissionDetails.secondHalfSubmittedDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                })}`}
              </Typography>
              {/* Admin Status */}
              {submissionDetails.secondHalfAdminStatus && (
                <Chip
                  label={`Admin: ${submissionDetails.secondHalfAdminStatus}`}
                  size="small"
                  color={
                    submissionDetails.secondHalfAdminStatus === "APPROVED" ? "success" :
                    submissionDetails.secondHalfAdminStatus === "REJECTED" ? "error" : "warning"
                  }
                  sx={{ height: "20px", fontSize: "0.6rem", fontWeight: "bold" }}
                />
              )}
              {/* Verification Status */}
              {submissionDetails.secondHalfVerifiedStatus && (
                <Chip
                  label={`Ver: ${submissionDetails.secondHalfVerifiedStatus}`}
                  size="small"
                  color={
                    submissionDetails.secondHalfVerifiedStatus === "APPROVED" ? "success" :
                    submissionDetails.secondHalfVerifiedStatus === "REJECTED" ? "error" : "warning"
                  }
                  sx={{ height: "20px", fontSize: "0.6rem", fontWeight: "bold" }}
                />
              )}
              {/* Remarks Indicator */}
              {(submissionDetails.secondHalfAdminRemark || submissionDetails.secondHalfVerificationRemark) && (
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      {submissionDetails.secondHalfAdminRemark && (
                        <Typography variant="body2">
                          <strong>Admin Remark:</strong> {submissionDetails.secondHalfAdminRemark}
                        </Typography>
                      )}
                      {submissionDetails.secondHalfVerificationRemark && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Verification Remark:</strong> {submissionDetails.secondHalfVerificationRemark}
                        </Typography>
                      )}
                    </Box>
                  }
                  arrow
                >
                  <IconButton size="small" sx={{ p: 0.5 }}>
                    <InfoIcon fontSize="small" color="info" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
              Not submitted
            </Typography>
          )}
        </Box>
      </>
    );
  }

  // For all other roles - show Full Month
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Month:
      </Typography>
      {submissionDetails.fullMonthSubmitId && submissionDetails.fullMonthSubmittedDate ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            {`Submitted on ${new Date(submissionDetails.fullMonthSubmittedDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })}, ${new Date(submissionDetails.fullMonthSubmittedDate).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            })}`}
          </Typography>
          {/* Admin Status */}
          {submissionDetails.fullMonthAdminStatus && (
            <Chip
              label={`Admin: ${submissionDetails.fullMonthAdminStatus}`}
              size="small"
              color={
                submissionDetails.fullMonthAdminStatus === "APPROVED" ? "success" :
                submissionDetails.fullMonthAdminStatus === "REJECTED" ? "error" : "warning"
              }
              sx={{ height: "20px", fontSize: "0.6rem", fontWeight: "bold" }}
            />
          )}
          {/* Verification Status */}
          {submissionDetails.fullMonthVerifiedStatus && (
            <Chip
              label={`Ver: ${submissionDetails.fullMonthVerifiedStatus}`}
              size="small"
              color={
                submissionDetails.fullMonthVerifiedStatus === "APPROVED" ? "success" :
                submissionDetails.fullMonthVerifiedStatus === "REJECTED" ? "error" : "warning"
              }
              sx={{ height: "20px", fontSize: "0.6rem", fontWeight: "bold" }}
            />
          )}
          {/* Remarks Indicator */}
          {(submissionDetails.fullMonthAdminRemark || submissionDetails.fullMonthVerificationRemark) && (
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  {submissionDetails.fullMonthAdminRemark && (
                    <Typography variant="body2">
                      <strong>Admin Remark:</strong> {submissionDetails.fullMonthAdminRemark}
                    </Typography>
                  )}
                  {submissionDetails.fullMonthVerificationRemark && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Verification Remark:</strong> {submissionDetails.fullMonthVerificationRemark}
                    </Typography>
                  )}
                </Box>
              }
              arrow
            >
              <IconButton size="small" sx={{ p: 0.5 }}>
                <InfoIcon fontSize="small" color="info" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ) : (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
          Not submitted
        </Typography>
      )}
    </Box>
  );
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
      
      const response = await tourDiaryService.submitAdminApproval(payload);
      
      if (!response.error) {
        setTourEntries(prev => 
          prev.map(item => 
            item.id === entry.id ? { ...item, status: status } : item
          )
        );
        
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

      let submissionId = null;
      if (approvalHalf === "First Half") {
        submissionId = submissionDetails?.firstHalfId;
      } else if (approvalHalf === "Second Half") {
        submissionId = submissionDetails?.secondHalfId;
      } else if (approvalHalf === "Full Month") {
        submissionId = submissionDetails?.fullMonthSubmitId;
      }

      if (!submissionId) {
        showNotification('error', `No submission ID found for ${approvalHalf}. The user may not have submitted this half.`);
        setBulkApprovalDialogOpen(false);
        return;
      }

      const payload = {
        id: submissionId,
        adminId: adminId,
        adminRemark: remarks || `${selectedStatus} for ${approvalHalf} of ${monthNames[selectedMonth - 1]} ${selectedYear}`,
        adminStatus: selectedStatus
      };

      const response = await tourDiaryService.submitAdminApproval(payload);

      if (!response.error) {
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

  // ============================ VERIFICATION HANDLERS ============================
  
  const openVerificationMenu = (event) => {
    setVerificationAnchorEl(event.currentTarget);
  };

  const closeVerificationMenu = () => {
    setVerificationAnchorEl(null);
  };

  const handleVerificationHalf = (half) => {
    let submissionId = null;
    console.log("Selected Half for Verification:>>>>>>>", half);
    console.log("Submission Details:>>>>>>>", submissionDetails);
    if (half === "First Half") {
      submissionId = submissionDetails?.firstHalfId;
    } else if (half === "Second Half") {
      submissionId = submissionDetails?.secondHalfId;
    } else if (half === "Full Month") {
      submissionId = submissionDetails?.fullMonthSubmitId;
    }

    if (!submissionId) {
      showNotification('error', `No submission found for ${half}. User may not have submitted this half.`);
      closeVerificationMenu();
      return;
    }

    let alreadyApproved = false;
    let currentStatus = '';
    
    if (half === "First Half") {
      alreadyApproved = submissionDetails?.firstHalfVerifiedStatus === 'APPROVED';
      currentStatus = submissionDetails?.firstHalfVerifiedStatus;
    } else if (half === "Second Half") {
      alreadyApproved = submissionDetails?.secondHalfVerifiedStatus === 'APPROVED';
      currentStatus = submissionDetails?.secondHalfVerifiedStatus;
    } else if (half === "Full Month") {
      alreadyApproved = submissionDetails?.fullMonthVerifiedStatus === 'APPROVED';
      currentStatus = submissionDetails?.fullMonthVerifiedStatus;
    }

    if (alreadyApproved) {
      showNotification('warning', `${half} is already APPROVED. Cannot re-verify.`);
      closeVerificationMenu();
      return;
    }

    if (currentStatus === 'REJECTED') {
      showNotification('info', `${half} was previously REJECTED. You can re-verify it now.`);
    }

    setVerificationHalf(half);
    setVerificationSubmissionId(submissionId);
    setVerificationStatus('APPROVED');
    setVerificationRemarks('');
    setVerificationDialogOpen(true);
    closeVerificationMenu();
  };

  const confirmVerification = async () => {
    if (verificationStatus === 'REJECTED' && !verificationRemarks.trim()) {
      showNotification('error', 'Remarks are mandatory when rejecting a submission.');
      return;
    }

    try {
      setVerificationLoading(true);
      const verifiedBy = authservice.userid();
      
      if (!verifiedBy) {
        showNotification('error', 'User session expired. Please login again.');
        return;
      }

      const payload = {
        submissionId: verificationSubmissionId,
        verifiedBy: verifiedBy,
        verificationRemark: verificationRemarks.trim() || `${verificationStatus} for ${verificationHalf}`,
        verifiedStatus: verificationStatus
      };

      const response = await tourDiaryService.saveOrUpdateVerification(payload);

      if (!response.error) {
        await fetchSubmissionDetails();
        await fetchUserTourEntries();
        showNotification('success', `${verificationHalf} ${verificationStatus} successfully`);
        setVerificationDialogOpen(false);
        setVerificationRemarks('');
        setVerificationStatus('APPROVED');
        setVerificationSubmissionId(null);
        setVerificationHalf('');
      } else {
        showNotification('error', response.message || 'Failed to process verification');
      }
    } catch (error) {
      console.error("Verification error:", error);
      showNotification('error', 'Failed to process verification');
    } finally {
      setVerificationLoading(false);
    }
  };

  const closeVerificationDialog = () => {
    setVerificationDialogOpen(false);
    setVerificationRemarks('');
    setVerificationStatus('APPROVED');
    setVerificationSubmissionId(null);
    setVerificationHalf('');
    setVerificationLoading(false);
  };

  // ============================ NOTIFICATION HANDLERS ============================
  
  const showNotification = (type, message) => {
    setNotification({ open: true, type, message });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
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

  const getPurposeName = (purposeId) => {
    if (!purposeId) return 'N/A';
    const purpose = allPurposes.find(p => p.id === purposeId);
    return purpose ? purpose.purposeName : 'Unknown Purpose';
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

  const getStatusChip = (status, type = 'admin') => {
    const statusMap = {
      'APPROVED': { color: 'success', label: 'Approved' },
      'REJECTED': { color: 'error', label: 'Rejected' },
      'PENDING': { color: 'warning', label: 'Pending' },
      'SUBMITTED': { color: 'info', label: 'Submitted' },
      'DRAFT': { color: 'default', label: 'Draft' }
    };
    
    const config = statusMap[status] || statusMap['PENDING'];
    const label = type === 'admin' ? `Admin: ${config.label}` : `Ver: ${config.label}`;
    
    return (
      <Chip
        label={label}
        size="small"
        color={config.color}
        sx={{ 
          height: '20px', 
          fontSize: '0.6rem', 
          fontWeight: 'bold',
          '& .MuiChip-label': { px: 0.5 }
        }}
      />
    );
  };

  // ============================ RENDER FUNCTIONS ============================
  
  const renderCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const fifteenthDay = 15;
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
      const isFirstHalf = day <= fifteenthDay;
      const isSecondHalf = day > fifteenthDay;
      
      let backgroundColor = theme.palette.background.paper;
      let hoverColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f5f9ff';

      if (isFirstHalf) {
        backgroundColor = theme.palette.mode === 'dark' ? '#1a2a3a' : '#e3f2fd';
      } else if (isSecondHalf) {
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
                    '&:hover': { backgroundColor: '#1e8449' }
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
                      '& .MuiChip-label': { padding: '0 4px' }
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

  const renderTableView = () => {
    const allEntriesWithDetails = [];
    
    tourEntries.forEach(entry => {
      try {
        const date = new Date(entry.createdAt);
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        const dayName = dayNames[dayOfWeek];
        const month = date.getMonth();
        const isFirstHalf = day <= 15;
        const isSecondHalf = day > 15;
        const isSun = isSunday(selectedYear, selectedMonth, day);
        const is2ndSat = isSecondSaturday(selectedYear, selectedMonth, day);
        const formattedDateWithDay = `${String(day).padStart(2, '0')} ${monthNames[month].substring(0, 3)}, ${dayName}`;
        
      allEntriesWithDetails.push({
  ...entry,
  day,
  dayName,
  isFirstHalf,
  isSecondHalf,
  isSun,
  is2ndSat,
  formattedDateWithDay,
  formattedDate: `${day} ${monthNames[selectedMonth - 1]} ${selectedYear}`,
  purposeName: entry.purposeName || getPurposeName(entry.purposeId),
  zoneName: getZoneName(entry.zoneId), // Add this
  location: entry.location || 'N/A',
  remark: entry.remark || '-',
  entryType: entry.entryType || 'WORKING',
  status: entry.status || 'PENDING'
});
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });

    allEntriesWithDetails.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const filteredEntries = searchTerm
      ? allEntriesWithDetails.filter(entry => 
          entry.formattedDateWithDay.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.entryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.location && entry.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.purposeName && entry.purposeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.remark && entry.remark.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : allEntriesWithDetails;

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
          sx={{ '& .MuiCardContent-root': { p: 0 } }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <TextField
                placeholder="Search"
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Half</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Zone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entry Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purpose</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Remarks</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
  {paginatedEntries.length > 0 ? (
    paginatedEntries.map((entry, index) => {
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
              {entry.formattedDateWithDay}
            </Typography>
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
            <Typography variant="body2">
              {getZoneName(entry.zoneId)}
            </Typography>
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
          <TableCell>
            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {entry.remark !== '-' ? entry.remark : '-'}
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
                  sx={{ color: '#04255e', '&:hover': { bgcolor: '#e3f2fd' } }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              {entry.status === 'PENDING' && canApprove() && (
                <>
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIndividualApproval(entry, 'APPROVED');
                      }}
                      sx={{ color: '#27ae60', '&:hover': { bgcolor: '#27ae6020' } }}
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
                      sx={{ color: '#e74c3c', '&:hover': { bgcolor: '#e74c3c20' } }}
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
                '& .MuiTablePagination-select': { borderRadius: 1 }
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
    <List sx={{ mt: 2 }}>
      {selectedDayEvents.map((event, index) => (
        <React.Fragment key={event.id}>
          {index > 0 && <Divider />}
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <EventIcon fontSize="small" color="action" />
                  <Chip
                    label={event.entryType || 'WORKING'}
                    size="small"
                    sx={{ 
                      bgcolor: getEntryTypeColor(event.entryType),
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                  {/* Zone Chip */}
                  {event.zoneId && (
                    <Chip
                      label={`Zone: ${getZoneName(event.zoneId)}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: '22px' }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  {event.entryType === 'WORKING' && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Zone:</strong> {getZoneName(event.zoneId)}
                      </Typography>
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
                      '&:hover': { backgroundColor: theme.palette.primary.light + '20' }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                {event.status === 'PENDING' && canApprove() && (
                  <>
                    <Tooltip title="Approve">
                      <IconButton
                        edge="end"
                        onClick={() => handleIndividualApproval(event, 'APPROVED')}
                        sx={{ color: '#27ae60', '&:hover': { backgroundColor: '#27ae6020' } }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        edge="end"
                        onClick={() => handleIndividualApproval(event, 'REJECTED')}
                        sx={{ color: '#e74c3c', '&:hover': { backgroundColor: '#e74c3c20' } }}
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
  // ============================ MAIN RENDER ============================
  
  if (!userId) {
    return (
      <Grid container spacing={3}>
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
    <Grid container spacing={2}>
      <Breadcrumb />
      
      <Grid item xs={12}>
        <Typography variant="h3" align="center" sx={{ color: theme.palette.text.primary }}>
          Advanced Tour Program Management  
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 3,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              {/* Left section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexWrap: 'wrap',
                minWidth: '200px'
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

              {/* Center - Month/Year */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
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

              {/* Right section - Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                minWidth: '200px',
                justifyContent: 'flex-end'
              }}>
                <Box>
                  {canVerify() && (
                    <Button
                      variant="contained"
                      onClick={openVerificationMenu}
                      disabled={loadingSubmissionDetails || !submissionDetails}
                      sx={{
                        backgroundColor: '#2980b9',
                        '&:hover': { backgroundColor: '#1f6391' },
                        '&.Mui-disabled': {
                          backgroundColor: theme.palette.action.disabledBackground
                        },
                        whiteSpace: 'nowrap',
                        minWidth: '90px'
                      }}
                    >
                      {loadingSubmissionDetails ? "Loading..." : "Verify"}
                    </Button>
                  )}

                  {canApprove() && (
                    <Button
                      variant="contained"
                      onClick={openApprovalMenu}
                      disabled={loadingSubmissionDetails || !submissionDetails}
                      sx={{
                        backgroundColor: '#27ae60',
                        '&:hover': { backgroundColor: '#1e8449' },
                        '&.Mui-disabled': {
                          backgroundColor: theme.palette.action.disabledBackground
                        },
                        whiteSpace: 'nowrap',
                        minWidth: '90px',
                        ml: canVerify() ? 1 : 0
                      }}
                    >
                      {loadingSubmissionDetails ? "Loading..." : "Approve"}
                    </Button>
                  )}

                  {/* Verification Menu */}
                  <Menu
                    anchorEl={verificationAnchorEl}
                    open={Boolean(verificationAnchorEl)}
                    onClose={closeVerificationMenu}
                  >
                    {getVerificationOptions().map((half) => (
                      <MenuItem
                        key={half}
                        onClick={() => handleVerificationHalf(half)}
                        disabled={!canVerifyHalf(half)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography>{half}</Typography>
                          {getVerificationStatusChip(half)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Menu>

                  {/* Approval Menu */}
                  <Menu
                    anchorEl={approvalAnchorEl}
                    open={Boolean(approvalAnchorEl)}
                    onClose={closeApprovalMenu}
                  >
                    {getApprovalOptions().map((half) => (
                      <MenuItem
                        key={half}
                        onClick={() => handleBulkApprovalHalf(half)}
                        disabled={!canApproveHalf(half)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography>{half}</Typography>
                          {getApprovalStatusChip(half)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>
            </Box>

            {/* View Mode Toggle */}
       <Box
  sx={{
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 3,
    mt: 1,
    width: '100%',
  }}
>
  {submissionDetails && (
    <Paper
      elevation={1}
      sx={{
        position: 'absolute',
        left: 0,
        p: 1.5,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.grey[800]
            : '#f0f7ff',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        minWidth: 280,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        {renderSubmissionStatus()}
      </Box>
    </Paper>
  )}

  <FormControl component="fieldset">
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="radio"
          id="table-view"
          name="viewMode"
          value="table"
          checked={viewMode === 'table'}
          onChange={() => setViewMode('table')}
          style={{ marginRight: '8px', cursor: 'pointer' }}
        />
        <Typography
          variant="body1"
          component="label"
          htmlFor="table-view"
          sx={{
            cursor: 'pointer',
            fontWeight: viewMode === 'table' ? 600 : 400,
          }}
        >
          Table View
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="radio"
          id="calendar-view"
          name="viewMode"
          value="calendar"
          checked={viewMode === 'calendar'}
          onChange={() => setViewMode('calendar')}
          style={{ marginRight: '8px', cursor: 'pointer' }}
        />
        <Typography
          variant="body1"
          component="label"
          htmlFor="calendar-view"
          sx={{
            cursor: 'pointer',
            fontWeight: viewMode === 'calendar' ? 600 : 400,
          }}
        >
          Calendar View
        </Typography>
      </Box>
    </Box>
  </FormControl>
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
                ) : (
                  renderTableView()
                )}
              </>
            )}
          </Box>
        </MainCard>
      </Grid>

      {/* ==================== MODALS ==================== */}
      
      {/* Day View Modal */}
      <Modal
        open={dayModalOpen}
        onClose={closeDayModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

      {/* Entry Details Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
    
    {/* Zone */}
    <Grid item xs={6}>
      <Typography variant="body2" color="text.secondary">Zone</Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {getZoneName(selectedEntry.zoneId)}
      </Typography>
    </Grid>
    
    <Grid item xs={12}>
      <Divider />
    </Grid>
    
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

      {/* Individual Approval Dialog */}
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

      {/* Bulk Approval Dialog */}
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

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onClose={closeVerificationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Verify {verificationHalf}
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            Process verification for {verificationHalf?.toLowerCase()} of {monthNames[selectedMonth - 1]} {selectedYear}
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Verification Status</InputLabel>
            <Select
              value={verificationStatus}
              label="Verification Status"
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                if (e.target.value !== 'REJECTED') {
                  setVerificationRemarks('');
                }
              }}
            >
              <MenuItem value="APPROVED">Verify</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="REJECTED">Reject</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={3}
            value={verificationRemarks}
            onChange={(e) => setVerificationRemarks(e.target.value)}
            variant="outlined"
            placeholder={verificationStatus === 'REJECTED' ? "Remarks are mandatory for rejection" : "Add remarks (optional)"}
            error={verificationStatus === 'REJECTED' && verificationDialogOpen && !verificationRemarks.trim()}
            helperText={
              verificationStatus === 'REJECTED' && 
              verificationDialogOpen && 
              !verificationRemarks.trim() ? 
              "Remarks are mandatory when rejecting a submission" : 
              ""
            }
            sx={{ mb: 2 }}
          />

          <Alert 
            severity={verificationStatus === 'APPROVED' ? 'success' : 'error'} 
            sx={{ mt: 1 }}
          >
            <Typography variant="body2">
              You are about to {verificationStatus === 'APPROVED' ? 'verify' : verificationStatus === 'REJECTED' ? 'reject' : 'mark as pending'} the {verificationHalf?.toLowerCase()} submission.
              {verificationStatus === 'REJECTED' && ' Please provide remarks explaining the rejection reason.'}
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={closeVerificationDialog} 
            variant="outlined"
            disabled={verificationLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmVerification}
            variant="contained"
            disabled={verificationLoading || (verificationStatus === 'REJECTED' && !verificationRemarks.trim())}
            sx={{
              backgroundColor: verificationStatus === 'APPROVED' ? '#27ae60' : '#e74c3c',
              '&:hover': {
                backgroundColor: verificationStatus === 'APPROVED' ? '#1e8449' : '#c0392b'
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground
              },
              minWidth: '120px'
            }}
          >
            {verificationLoading ? "Processing..." : `Confirm ${verificationStatus === 'APPROVED' ? 'Verify' : 'Reject'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Dialog */}
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
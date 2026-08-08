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
  FormHelperText,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme, alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/Info";
import tourDiaryService from "pages/authentication/services/tourdiaryservice";
import Breadcrumb from "routes/Breadcrumb";
import MainCard from "components/MainCard";
import authservice from "pages/authentication/services/authservice";

const UserTourDiaryDetail = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [resultDialog, setResultDialog] = useState({
    open: false,
    type: "success", // "success" | "error" | "warning"
    title: "",
    message: ""
  });

  // ---------- Validation Helpers ----------
  const validateDistance = (value, oldValue) => {
    if (value === '') return '';
    if (!/^\d*\.?\d*$/.test(value)) return oldValue;
    if (value.length > 5) return oldValue;
    if ((value.match(/\./g) || []).length > 1) return oldValue;
    if (value.length > 1 && value[0] === '0' && value[1] !== '.' && !value.startsWith('0.')) {
      return oldValue;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num <= 0 || num > 1000) return oldValue;
      if (value.includes('.') && value.split('.')[1]?.length > 2) return oldValue;
    }
    return value;
  };

  const validateHours = (value, oldValue) => {
    if (value === '') return '';
    if (!/^\d*\.?\d*$/.test(value)) return oldValue;
    if (value.length > 5) return oldValue;
    if ((value.match(/\./g) || []).length > 1) return oldValue;
    if (value.length > 1 && value[0] === '0' && value[1] !== '.' && !value.startsWith('0.')) {
      return oldValue;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num <= 0 || num > 24) return oldValue;
      if (value.includes('.') && value.split('.')[1]?.length > 2) return oldValue;
    }
    return value;
  };

  const validateClusterId = (value, oldValue) => {
    let filtered = value.replace(/[^0-9, ]/g, '');
    filtered = filtered.replace(/,{2,}/g, ',').replace(/^,|,$/g, '');
    const parts = filtered.split(/[ ,]+/);
    for (let part of parts) {
      if (part !== '' && !/^[1-9][0-9]{0,3}$/.test(part)) {
        return oldValue !== undefined ? oldValue : filtered;
      }
    }
    return filtered;
  };

  const validateCropName = (value) => {
    if (value.length > 255) return value.slice(0, 255);
    return value;
  };

  const validateGeoLocation = (value) => {
    if (value.length > 256) return value.slice(0, 256);
    return value;
  };

  const validateRemarks = (value) => {
    if (value.length > 1000) return value.slice(0, 1000);
    return value;
  };

  const { userId: paramUserId, month: monthParam, year: yearParam } = location.state || {};
  const currentUserId = authservice.userid();

  // ---------- Role Detection (mirrors TourDiary.jsx) ----------
  const role = authservice.getrole();
  const isFieldDataCollector = role === "Field Data Collector";
  const isFieldInspector = role === "Field Inspector";
  const isTalukLevelApprover = role === "Taluk Level Approver";
  const isDistrictLevelApprover = role === "District Level Approver";
  const isDistrictLevelDataViewer = role === "District Level Data Viewer";
  // District Level roles fetch taluks first, then zones by taluk
  const isDistrictLevelRole = isDistrictLevelApprover || isDistrictLevelDataViewer;
  // Field Inspector / Taluk Level Approver use the zone dropdown API directly
  const isZoneDropdownRole = isFieldInspector || isTalukLevelApprover;

  // ---------- Entry Type (Working / Holiday / Week Off / Leave / Training / Others) ----------
  const ENTRY_TYPES = [
    { value: 'WORKING', label: 'WORKING' },
    { value: 'WEEK_OFF', label: 'WEEK OFF' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'LEAVE', label: 'Leave' },
    { value: 'TRAINING', label: 'Training' },
    { value: 'OTHER', label: 'Others' },
  ];

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, eventId: null });
  const [fullMonthStatus, setFullMonthStatus] = useState(null);
  const [fullMonthModalOpen, setFullMonthModalOpen] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatHeaderDate = (dateKey) => {
    if (!dateKey) return "";
    try {
      const parts = String(dateKey).split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", weekday: "short" });
      }
      const d = new Date(dateKey);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", weekday: "short" });
      }
    } catch (e) { }
    return String(dateKey);
  };

  const openDeleteDialog = (id) => setDeleteDialog({ open: true, eventId: id });
  const closeDeleteDialog = () => setDeleteDialog({ open: false, eventId: null });

  const handleDeleteEvent = async (eventId) => {
    if (!eventId) return;
    setDeleteLoading(true);
    try {
      const response = await tourDiaryService.deleteActualTour(eventId);
      const isSuccess = response && (
        !response.message ||
        response.message === "Tour deleted successfully" ||
        (typeof response === "string" && response.toLowerCase().includes("success")) ||
        response.status === 200 || response.status === "SUCCESS"
      );

      if (isSuccess && !response.error) {
        setSnackbar({ open: true, message: response.message || "Tour deleted successfully", severity: "success" });
        setTourEntries(prev => prev.filter(entry => entry.id !== eventId));
        closeDeleteDialog();
        if (detailModalOpen && selectedEntry?.id === eventId) {
          closeDetailModal();
        }
        fetchUserTourEntries(false);
      } else {
        setSnackbar({ open: true, message: response.message || "Failed to delete tour entry", severity: "error" });
      }
    } catch (err) {
      console.error("Error deleting tour entry:", err);
      setSnackbar({ open: true, message: err.message || "Failed to delete tour entry", severity: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submittingMonth, setSubmittingMonth] = useState(false);
  const [zoneIdForSubmission, setZoneIdForSubmission] = useState("");
  const [availableZones, setAvailableZones] = useState([]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingZoneId, setPendingZoneId] = useState("");

  const [clusters, setClusters] = useState([]);
  const [selectedClusterId, setSelectedClusterId] = useState("");
  const [editSelectedClusterId, setEditSelectedClusterId] = useState("");

  // Entry Type (Working / Holiday / Week Off / Leave / Training / Others)
  const [entryType, setEntryType] = useState('WORKING');
  const [editEntryType, setEditEntryType] = useState('WORKING');

  // Taluk / Zone role-based selection (mirrors TourDiary.jsx)
  const [taluks, setTaluks] = useState([]);
  const [selectedTalukId, setSelectedTalukId] = useState(null);
  const [editSelectedTalukId, setEditSelectedTalukId] = useState(null);
  const [roleBasedZones, setRoleBasedZones] = useState([]);
  const [taluksLoading, setTaluksLoading] = useState(false);
  const [isZoneDropdownLoading, setIsZoneDropdownLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(false);
  // Add this with other state declarations
  const [purposeLandType, setPurposeLandType] = useState("");
  const [editPurposeLandType, setEditPurposeLandType] = useState("");

  const [isOfficeDuty, setIsOfficeDuty] = useState(false);
  const [editIsOfficeDuty, setEditIsOfficeDuty] = useState(false);
  // Add new states
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [agriYear, setAgriYear] = useState("2025-2026");
  const [filteredClusters, setFilteredClusters] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [isOtherScheme, setIsOtherScheme] = useState(false);


  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualEntryDate, setManualEntryDate] = useState(null);
  const [manualFormData, setManualFormData] = useState({
    entryType: "WORKING",
    purposeId: "",
    zoneId: "",
    clusterId: "",
    seasonId: "",
    landType: "",
    remark: "",
    distance: "",
    hours: "",
    geoLocation: "",
    cropId: "" // Add cropId
  });


  // Update editFormData
  const [editFormData, setEditFormData] = useState({
    id: null,
    distance: "",
    hours: "",
    remark: "",
    reportEntryType: "",
    entryType: "WORKING",
    schemeId: "",
    purposeId: "",
    zoneId: "",
    clusterId: "",
    seasonId: "",
    landType: "",
    geoLocation: "",
    cropId: "" // Add cropId
  });

  const [advanceTourForDate, setAdvanceTourForDate] = useState([]);
  const [advanceTourLoading, setAdvanceTourLoading] = useState(false);
  const [isAdvanceChanged, setIsAdvanceChanged] = useState(false);
  const [changeReason, setChangeReason] = useState("");

  const fetchAdvanceTourProgram = async (userId, dateInput) => {
    if (!userId || !dateInput) {
      setAdvanceTourForDate([]);
      return;
    }
    setAdvanceTourLoading(true);
    try {
      let dateStr = "";
      if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
        dateStr = dateInput.split('T')[0];
      } else {
        const d = new Date(dateInput);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        }
      }

      if (dateStr) {
        const data = await tourDiaryService.getAdvanceTourByDate(userId, dateStr);
        setAdvanceTourForDate(Array.isArray(data) ? data : []);
      } else {
        setAdvanceTourForDate([]);
      }
    } catch (err) {
      console.error("Error fetching advance tour for date:", err);
      setAdvanceTourForDate([]);
    } finally {
      setAdvanceTourLoading(false);
    }
  };

  const getActiveZone = () => {
    const zoneId = authservice.getzone();
    return zoneId;
  };





  const [purposes, setPurposes] = useState([]);
  const [zones, setZones] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [editSelectedScheme, setEditSelectedScheme] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

  const canSubmitMonth = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    if (selectedYear > currentYear) return false;
    if (selectedYear === currentYear && selectedMonth > currentMonth) return false;
    const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
    return today > lastDayOfMonth;
  };

  const fetchClusters = async (zoneId) => {
    if (!zoneId) {
      setClusters([]);
      setFilteredClusters([]);
      return;
    }

    try {
      const year = authservice.agriyear() || "2025-2026";
      const response = await tourDiaryService.getClusters(zoneId, year);

      if (response && Array.isArray(response)) {
        setClusters(response);
        // Filter by land type if a purpose is selected
        filterClustersByLandType(response);
      } else {
        setClusters([]);
        setFilteredClusters([]);
      }
    } catch (error) {
      console.error("Error fetching clusters:", error);
      setClusters([]);
      setFilteredClusters([]);
    }
  };

  const filterClustersByLandType = (allClusters, landType = null) => {
    // If office duty, don't filter clusters
    if (isOfficeDuty) {
      setFilteredClusters([]);
      return;
    }

    if (!manualFormData.purposeId) {
      setFilteredClusters(allClusters || []);
      return;
    }

    // Find selected purpose
    const selectedPurpose = purposes.find(p => p.id === Number(manualFormData.purposeId));

    if (!selectedPurpose) {
      setFilteredClusters(allClusters || []);
      return;
    }

    const purposeLandType = landType !== null ? landType : selectedPurpose.landtype;

    // If landtype is NULL, show all clusters
    if (purposeLandType === null || purposeLandType === undefined) {
      setFilteredClusters(allClusters || []);
      return;
    }

    // Map landtype: 1 = WET, 2 = DRY, 3 = EXTRA (show all)
    const landTypeMap = {
      1: 'Wet',
      2: 'Dry',
      3: 'Extra' // Show all clusters
    };

    const landTypeToFilter = landTypeMap[purposeLandType];

    if (landTypeToFilter === 'Extra' || landTypeToFilter === undefined) {
      // For land type 3 or undefined, show all clusters
      setFilteredClusters(allClusters || []);
    } else {
      // Filter clusters by land type
      const filtered = (allClusters || []).filter(
        cluster => cluster.landType && cluster.landType.toLowerCase() === landTypeToFilter.toLowerCase()
      );
      setFilteredClusters(filtered);
    }
  };
  // In the handleSubmitMonth function
  const handleSubmitMonth = async () => {

    // const zoneId = authservice.getzone();
    // if (!zoneId) {
    //   setSnackbar({
    //     open: true,
    //     message: "No active zone found. Please select a zone first.",
    //     severity: "error"
    //   });
    //   return;
    // }
    // setPendingZoneId(zoneId);
    setConfirmDialogOpen(true);
  };
  // Fetch clusters when zone changes
  useEffect(() => {
    if (manualFormData.zoneId) {
      fetchClusters(manualFormData.zoneId);
    } else {
      setClusters([]);
      setFilteredClusters([]);
    }
  }, [manualFormData.zoneId]);

  // Filter clusters when purpose changes
  useEffect(() => {
    if (clusters.length > 0) {
      filterClustersByLandType(clusters);
    }
  }, [manualFormData.purposeId, purposes]);

  // Fetch crops when purpose land type is 3 (EXTRA)
  useEffect(() => {
    if (purposeLandType === 3 || editPurposeLandType === 3) {
      if (crops.length === 0) {
        fetchCrops();
      }
    } else {
      setCrops([]);
    }
  }, [purposeLandType, editPurposeLandType, crops.length]);
  // In handleConfirmSubmit, update success message
  const handleConfirmSubmit = async () => {
    setConfirmDialogOpen(false);
    setSubmittingMonth(true);
    try {
      const submitId = fullMonthStatus?.id || fullMonthStatus?.fullMonthId || fullMonthStatus?.submitId || fullMonthStatus?.fullMonthSubmitId || null;
      const response = await tourDiaryService.submitFullMonth(
        selectedUserId, selectedMonth, selectedYear, pendingZoneId, submitId
      );
      console.log(response, "response");
      let rawMsg = typeof response === 'string'
        ? response
        : (typeof response?.data === 'string' ? response.data : (response?.message || response?.data?.message || ""));
      const message = typeof rawMsg === 'string'
        ? rawMsg.replace(/\s*using same submission id:\s*\d+/gi, '').replace(/\s*using same submission id.*$/gi, '').trim()
        : rawMsg;
      console.log("message", message);
      const isError = response?.error === true || (typeof message === "string" && (
        message.toLowerCase().includes("missing") ||
        message.toLowerCase().includes("no entries") ||
        message.toLowerCase().includes("already submitted") ||
        message.toLowerCase().includes("allowed only after") ||
        message.toLowerCase().includes("failed")
      ));

      const isWarning = typeof message === "string" &&
        message.toLowerCase().includes("late");

      if (isError) {
        setResultDialog({
          open: true,
          type: "error",
          title: "Full Month Submission Failed",
          message
        });
      } else if (isWarning) {
        setResultDialog({
          open: true,
          type: "warning",
          title: "Full Month Submitted Late",
          message
        });
        await fetchUserTourEntries();
        await fetchFullMonthStatus();
      } else {
        setResultDialog({
          open: true,
          type: "success",
          title: "Full Month Submission Successful",
          message: message || "Full month submitted successfully"
        });
        await fetchUserTourEntries();
        await fetchFullMonthStatus();
      }

    } catch (error) {
      setResultDialog({
        open: true,
        type: "error",
        title: "Submission Error",
        message: error.message || "An error occurred during submission"
      });
    } finally {
      setSubmittingMonth(false);
      setPendingZoneId("");
    }
  };

  const fetchUserTourEntries = async (showLoader = false) => {
    if (!selectedUserId) { setError("No user selected"); setLoading(false); return; }
    if (showLoader) setLoading(true);
    setError("");
    try {
      const response = await tourDiaryService.getTourEntries(selectedUserId, selectedMonth, selectedYear);
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
        if (response.message !== "No entries found") setError(response.message);
      } else {
        setTourEntries([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "An error occurred while fetching data");
      setTourEntries([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchPurposesAndZones = async () => {
    try {
      const schemesRes = await tourDiaryService.getAllSchemes();
      if (schemesRes && !schemesRes.message) {
        setSchemes(Array.isArray(schemesRes) ? schemesRes : []);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

  const fetchPurposesByScheme = async (schemeId) => {
    if (!schemeId) { setPurposes([]); return; }
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
  const fetchCrops = async () => {

    setCropsLoading(true);
    try {
      const year = authservice.agriyear() || "2025-2026";
      const response = await tourDiaryService.getCrops(year);
      if (response && Array.isArray(response)) {
        setCrops(response);
      } else if (response && Array.isArray(response.payload)) {
        setCrops(response.payload);
      } else {
        setCrops([]);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
      setCrops([]);
    } finally {
      setCropsLoading(false);
    }
  };
  // Field Data Collector - assigned zones API (existing behaviour)
  const fetchZones = async () => {
    setZonesLoading(true);
    try {
      // Field Inspector / Taluk Level Approver -> zone dropdown API
      if (isZoneDropdownRole) {
        await fetchZoneDropdownZones();
        return;
      }
      // District Level roles -> taluks first, then zones by selected taluk
      if (isDistrictLevelRole) {
        await fetchTaluks();
        return;
      }
      // Default (Field Data Collector and others) -> assigned zones
      const zonesRes = await tourDiaryService.getAssignedZones(selectedUserId);
      if (zonesRes && !zonesRes.error && Array.isArray(zonesRes)) {
        setZones(zonesRes);
        setRoleBasedZones(zonesRes);
      } else if (zonesRes && zonesRes.data && Array.isArray(zonesRes.data)) {
        setZones(zonesRes.data);
        setRoleBasedZones(zonesRes.data);
      } else {
        setZones([]);
        setRoleBasedZones([]);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setZones([]);
      setRoleBasedZones([]);
    } finally {
      setZonesLoading(false);
    }
  };

  // Field Inspector & Taluk Level Approver - zone dropdown API
  const fetchZoneDropdownZones = async () => {
    setIsZoneDropdownLoading(true);
    try {
      const response = await tourDiaryService.getZoneDropdown();
      if (response && Array.isArray(response) && response.length > 0) {
        const mappedZones = response.map(zone => ({
          zoneId: zone.zoneId,
          zoneName: zone.zoneNameEn || zone.zoneName,
          zoneType: zone.zoneType
        }));
        setZones(mappedZones);
        setRoleBasedZones(mappedZones);
      } else {
        setZones([]);
        setRoleBasedZones([]);
      }
    } catch (error) {
      console.error("Error fetching zone dropdown:", error);
      setZones([]);
      setRoleBasedZones([]);
    } finally {
      setIsZoneDropdownLoading(false);
      setZonesLoading(false);
    }
  };

  // District Level roles - fetch taluks first
  const fetchTaluks = async () => {
    setTaluksLoading(true);
    try {
      const response = await tourDiaryService.getTalukDropdown();
      if (response && Array.isArray(response) && response.length > 0) {
        setTaluks(response);
        // Auto-select first taluk if only one is available
        if (response.length === 1) {
          setSelectedTalukId(response[0].talukId);
          setEditSelectedTalukId(response[0].talukId);
          await fetchZonesByTaluk(response[0].talukId);
        }
      } else {
        setTaluks([]);
      }
    } catch (error) {
      console.error("Error fetching taluks:", error);
      setTaluks([]);
    } finally {
      setTaluksLoading(false);
      setZonesLoading(false);
    }
  };

  // District Level roles - fetch zones for a selected taluk
  const fetchZonesByTaluk = async (talukId) => {
    if (!talukId) {
      setZones([]);
      setRoleBasedZones([]);
      return;
    }
    setIsZoneDropdownLoading(true);
    try {
      const response = await tourDiaryService.getZonesByTaluk(talukId);
      if (response && Array.isArray(response) && response.length > 0) {
        const mappedZones = response.map(zone => ({
          zoneId: zone.zoneId,
          zoneName: zone.zoneNameEn || zone.zoneName,
          zoneType: zone.zoneType
        }));
        setZones(mappedZones);
        setRoleBasedZones(mappedZones);
      } else {
        setZones([]);
        setRoleBasedZones([]);
      }
    } catch (error) {
      console.error("Error fetching zones by taluk:", error);
      setZones([]);
      setRoleBasedZones([]);
    } finally {
      setIsZoneDropdownLoading(false);
    }
  };

  useEffect(() => {
    if (editFormData.zoneId) {
      fetchClusters(editFormData.zoneId);
    } else {
      setClusters([]);
    }
  }, [editFormData.zoneId]);
  const fetchFullMonthStatus = async () => {
    if (!selectedUserId) return;
    try {
      console.log("selectedUserId:" + selectedUserId)
      console.log("selectedYear:" + selectedYear,)
      console.log("selectedMonth:" + selectedMonth)
      const response = await tourDiaryService.getFullYearView(selectedUserId, selectedYear);
      if (response && !response.error && Array.isArray(response)) {
        const currentMonthData = response.find(
          item => item.month === selectedMonth && item.year === selectedYear
        );
        console.log("currentMonthData:", currentMonthData);
        console.log(
          "currentMonthData full details:",
          JSON.stringify(currentMonthData, null, 2)
        );
        setFullMonthStatus(currentMonthData || null);
      } else {
        setFullMonthStatus(null);
      }
    } catch (error) {
      console.error("Error fetching month status:", error);
      setFullMonthStatus(null);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchUserTourEntries(true);
      fetchZones();
      fetchFullMonthStatus();
    }
    fetchPurposesAndZones();
  }, [selectedUserId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedScheme) { fetchPurposesByScheme(selectedScheme); } else { setPurposes([]); }
  }, [selectedScheme]);

  useEffect(() => {
    if (editSelectedScheme) { fetchPurposesByScheme(editSelectedScheme); } else { setPurposes([]); }
  }, [editSelectedScheme]);

  const handleBack = () => navigate(-1);

  const handleMonthChange = (offset) => {
    let newMonth = selectedMonth + offset;
    let newYear = selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    else if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleViewEntryDetails = (entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    if (isMonthSubmitted()) {
      setSnackbar({ open: true, message: "Full Month has already been submitted. You cannot edit entries for this period.", severity: "info" });
      return;
    }
    if (entry.reportEntryType === "AUTO CAPTURED") {
      setEditFormData({
        id: entry.id,
        distance: entry.distance || "",
        hours: entry.hours || "",
        remark: entry.remark || "",
        // reportEntryType: entry.reportEntryType,
        reportEntryType: "AUTO CAPTURED",
      });
    } else {
      const entryTypeValue = entry.entryType || 'WORKING';
      setEditEntryType(entryTypeValue);
      console.log("Editing entry:", entry);

      const fetchedTalukId = entry.talukId || entry.taluk_id || entry.talukNo || null;
      if (fetchedTalukId) {
        setEditSelectedTalukId(fetchedTalukId);
      }

      setEditFormData({
        id: entry.id,
        distance: entry.distance || "",
        hours: entry.hours || "",
        remark: entry.remark || "",
        reportEntryType: entry.reportEntryType,
        entryType: entryTypeValue,
        schemeId: entry.schemesId || "",
        purposeId: entry.purposeId || "",
        talukId: fetchedTalukId || "",
        zoneId: entry.zoneId || "",
        clusterId: entry.clusterId || "",
        seasonId: entry.seasonNo || entry.seasonId || "",
        landType: entry.landType || "",
        geoLocation: entry.geoLocation || "",
        cropId: entry.cropId || "",
      });
      setIsOtherScheme(entry.schemesId === 10);
      setIsAdvanceChanged(entry.isAdvanceChanged === true || entry.isAdvanceChanged === "true");
      setChangeReason(entry.changeReason || "");

      const entryDate = entry.createdAt || entry.actionDate || manualEntryDate;
      if (entryDate) {
        fetchAdvanceTourProgram(selectedUserId, entryDate);
      }

      // Fetch clusters for the selected zone (only relevant for WORKING entries)
      if (entry.zoneId) {
        fetchClusters(entry.zoneId);
      }

      if (entry.schemesId) {
        setEditSelectedScheme(entry.schemesId);
        tourDiaryService.getActivePurposes(entry.schemesId).then((data) => {
          if (data && Array.isArray(data) && !data.message) {
            setPurposes(data);
            const foundPurpose = data.find(p => p.id === Number(entry.purposeId));
            if (foundPurpose) {
              setEditPurposeLandType(foundPurpose.landtype || "");
              setEditIsOfficeDuty(foundPurpose.duty === false);
            }
          }
        });
      } else {
        setEditSelectedScheme("");
        setEditIsOfficeDuty(false);
      }

      // Ensure the role-appropriate zone list is available for editing
      if (isDistrictLevelRole) {
        fetchTaluks();
        if (fetchedTalukId) {
          fetchZonesByTaluk(fetchedTalukId);
        }
      } else {
        fetchZones();
      }
    }
    setEditModalOpen(true);
  };

  const handleSaveAutoCapturedEdit = async () => {
    if (!editFormData.distance || editFormData.distance === "") {
      setSnackbar({ open: true, message: "Distance is required for AUTO CAPTURED entries", severity: "error" });
      return;
    }
    if (!editFormData.hours || editFormData.hours === "") {
      setSnackbar({ open: true, message: "Hours is required for AUTO CAPTURED entries", severity: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        id: editFormData.id,
        distance: editFormData.distance ? parseFloat(editFormData.distance) : null,
        hours: editFormData.hours ? parseFloat(editFormData.hours) : null
      };
      const response = await tourDiaryService.updateSystemTourEntry(payload);
      if (response && response.id) {
        setSnackbar({ open: true, message: "Tour entry updated successfully", severity: "success" });
        setEditModalOpen(false);
        await fetchUserTourEntries();
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
  const getLandTypeLabel = (landtype) => {
    if (landtype === 1) return 'WET';
    if (landtype === 2) return 'DRY';
    if (landtype === 3) return 'EXTRA';
    return 'Unknown';
  };
  const handleSaveManualEdit = async () => {
    const isNonWorking = editEntryType !== 'WORKING';

    // Non-WORKING entries (Holiday, Week Off, Leave, Training, Others) only need remarks
    if (isNonWorking) {
      const isRemarksOptional = editEntryType === 'HOLIDAY' || editEntryType === 'LEAVE';
      if (!isRemarksOptional && (!editFormData.remark || editFormData.remark.trim() === "")) {
        setSnackbar({ open: true, message: `Remarks is required for ${editEntryType} entries`, severity: "error" });
        return;
      }
    } else if (isOtherScheme) {
      // For "Others" scheme, only remarks is required
      if (!editFormData.remark || editFormData.remark.trim() === "") {
        setSnackbar({ open: true, message: "Remarks is required for Others scheme", severity: "error" });
        return;
      }
    } else if (editIsOfficeDuty) {
      // For duty === false (Office Duty / Conference), purpose and remarks are required
      if (!editFormData.purposeId) {
        setSnackbar({ open: true, message: "Purpose is required", severity: "error" });
        return;
      }
      if (!editFormData.remark || editFormData.remark.trim() === "") {
        setSnackbar({ open: true, message: "Remarks is required", severity: "error" });
        return;
      }
    } else {
      // Normal validation for other schemes (duty === true)
      if (!editFormData.distance || editFormData.distance === "") {
        setSnackbar({ open: true, message: "Distance is required for MANUAL entries", severity: "error" });
        return;
      }
      if (!editFormData.hours || editFormData.hours === "") {
        setSnackbar({ open: true, message: "Hours is required for MANUAL entries", severity: "error" });
        return;
      }
    }

    setSubmitting(true);
    try {
      const skipDetails = isNonWorking || isOtherScheme || editIsOfficeDuty;

      const hasAdvanceTour = advanceTourForDate && advanceTourForDate.length > 0;
      const sendChange = !isFieldDataCollector && hasAdvanceTour && isAdvanceChanged;

      if (sendChange && (!changeReason || changeReason.trim() === "")) {
        setSnackbar({ open: true, message: "Reason for changing Advance Tour Program is required", severity: "error" });
        return;
      }

      const payload = {
        id: editFormData.id,
        userId: selectedUserId,
        entryType: editEntryType,
        schemeId: isNonWorking ? null : Number(editFormData.schemeId),
        purposeId: isNonWorking ? null : Number(editFormData.purposeId),
        talukId: skipDetails ? null : (editSelectedTalukId ? Number(editSelectedTalukId) : (editFormData.talukId ? Number(editFormData.talukId) : null)),
        zoneId: skipDetails ? null : Number(editFormData.zoneId),
        clusterId: skipDetails ? null : (editFormData.clusterId ? Number(editFormData.clusterId) : null),
        seasonId: skipDetails ? null : (editFormData.seasonId ? Number(editFormData.seasonId) : 1),
        landType: skipDetails ? null : editFormData.landType,
        geoLocation: skipDetails ? null : (editFormData.geoLocation || "N/A"),
        remark: editFormData.remark,
        distance: skipDetails ? null : (editFormData.distance ? parseFloat(editFormData.distance) : null),
        hours: skipDetails ? null : (editFormData.hours ? parseFloat(editFormData.hours) : null),
        cropId: skipDetails ? null : (editFormData.cropId ? Number(editFormData.cropId) : null),
        isAdvanceChanged: sendChange ? true : (hasAdvanceTour ? false : undefined),
        changeReason: sendChange ? changeReason : undefined
      };

      const response = await tourDiaryService.saveOrUpdateManualEntry(payload);
      if (response && (response.id || response.message === "Tour updated successfully")) {
        setSnackbar({ open: true, message: response.message || "Tour entry updated successfully", severity: "success" });
        setEditModalOpen(false);
        await fetchUserTourEntries(false);
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

  const handleOpenManualEntry = async (dateKey) => {
    if (isMonthSubmitted()) {
      setSnackbar({ open: true, message: "Full Month has already been submitted. You cannot add new entries for this period.", severity: "info" });
      return;
    }
    setManualEntryDate(dateKey);

    let defaultEntryType = 'WORKING';
    if (dateKey) {
      const parts = String(dateKey).split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        if (d.getDay() === 0) {
          defaultEntryType = 'HOLIDAY';
        }
      } else {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime()) && d.getDay() === 0) {
          defaultEntryType = 'HOLIDAY';
        }
      }
    }

    setEntryType(defaultEntryType);
    setManualFormData({
      entryType: defaultEntryType,
      purposeId: "", zoneId: "", clusterId: "", seasonId: "",
      landType: "", remark: "", distance: "", hours: "",
      geoLocation: ""
    });
    setPurposeLandType(""); // Reset purpose land type
    setSelectedScheme("");
    setIsOtherScheme(false);
    setIsAdvanceChanged(false);
    setChangeReason("");
    setClusters([]);
    setFilteredClusters([]);
    if (isDistrictLevelRole) {
      setSelectedTalukId(null);
    }
    await fetchZones();
    fetchAdvanceTourProgram(selectedUserId, dateKey);
    setManualEntryOpen(true);
  };
  const handleSaveManualEntry = async () => {
    const isNonWorking = entryType !== 'WORKING';

    // Non-WORKING entries (Holiday, Week Off, Leave, Training, Others) only need remarks
    if (isNonWorking) {
      const isRemarksOptional = entryType === 'HOLIDAY' || entryType === 'LEAVE';
      if (!isRemarksOptional && (!manualFormData.remark || manualFormData.remark.trim() === "")) {
        setSnackbar({ open: true, message: `Remarks is required for ${entryType} entries`, severity: "error" });
        return;
      }
    } else if (isOtherScheme) {
      // For "Others" scheme, only remarks is required
      if (!manualFormData.remark || manualFormData.remark.trim() === "") {
        setSnackbar({ open: true, message: "Remarks is required for Others scheme", severity: "error" });
        return;
      }
    } else if (isOfficeDuty) {
      // For duty === false (Office Duty / Conference), purpose and remarks are required
      if (!manualFormData.purposeId) {
        setSnackbar({ open: true, message: "Purpose is required", severity: "error" });
        return;
      }
      if (!manualFormData.remark || manualFormData.remark.trim() === "") {
        setSnackbar({ open: true, message: "Remarks is required", severity: "error" });
        return;
      }
    } else {
      // Normal validation for other schemes (duty === true)
      if (!manualFormData.purposeId || !manualFormData.zoneId || !selectedScheme) {
        setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
        return;
      }
      if (!manualFormData.distance || manualFormData.distance === "") {
        setSnackbar({ open: true, message: "Distance is required for MANUAL entries", severity: "error" });
        return;
      }
      if (!manualFormData.hours || manualFormData.hours === "") {
        setSnackbar({ open: true, message: "Hours is required for MANUAL entries", severity: "error" });
        return;
      }
    }

    setSubmitting(true);
    try {
      let formattedDate = null;
      if (manualEntryDate) {
        const dateToUse = new Date(manualEntryDate);
        if (!isNaN(dateToUse.getTime())) {
          dateToUse.setHours(12, 0, 0, 0);
          formattedDate = dateToUse.toISOString();
        }
      }
      if (!formattedDate) formattedDate = new Date().toISOString();

      const skipDetails = isNonWorking || isOtherScheme || isOfficeDuty;

      const hasAdvanceTour = advanceTourForDate && advanceTourForDate.length > 0;
      const sendChange = !isFieldDataCollector && hasAdvanceTour && isAdvanceChanged;

      if (sendChange && (!changeReason || changeReason.trim() === "")) {
        setSnackbar({ open: true, message: "Reason for changing Advance Tour Program is required", severity: "error" });
        return;
      }

      const payload = {
        userId: selectedUserId,
        entryType,
        schemeId: isNonWorking ? null : Number(selectedScheme),
        purposeId: isNonWorking ? null : Number(manualFormData.purposeId),
        talukId: skipDetails ? null : (selectedTalukId ? Number(selectedTalukId) : (manualFormData.talukId ? Number(manualFormData.talukId) : null)),
        zoneId: skipDetails ? null : Number(manualFormData.zoneId),
        clusterId: skipDetails ? null : (manualFormData.clusterId ? Number(manualFormData.clusterId) : null),
        seasonId: skipDetails ? null : Number(manualFormData.seasonId || 1),
        landType: skipDetails ? null : manualFormData.landType,
        geoLocation: skipDetails ? null : manualFormData.geoLocation || "",
        remark: manualFormData.remark,
        distance: skipDetails ? null : (manualFormData.distance ? parseFloat(manualFormData.distance) : null),
        hours: skipDetails ? null : (manualFormData.hours ? parseFloat(manualFormData.hours) : null),
        cropId: skipDetails ? null : (manualFormData.cropId ? Number(manualFormData.cropId) : null),
        createdAt: formattedDate,
        isAdvanceChanged: sendChange ? true : (hasAdvanceTour ? false : undefined),
        changeReason: sendChange ? changeReason : undefined
      };

      const response = await tourDiaryService.saveOrUpdateManualEntry(payload);
      if (response && (response.id || response.message === "Tour added successfully")) {
        setSnackbar({ open: true, message: response.message || "Tour entry added successfully", severity: "success" });
        setManualEntryOpen(false);
        await fetchUserTourEntries(false);
      } else {
        setSnackbar({ open: true, message: response.message || "Failed to add tour entry", severity: "error" });
      }
    } catch (error) {
      console.error("Error creating entry:", error);
      setSnackbar({ open: true, message: error.message || "Failed to add tour entry", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const closeDetailModal = () => { setDetailModalOpen(false); setSelectedEntry(null); };
  console.log("fullMonthStatus", fullMonthStatus)
  // Add this helper function to check if the month is already submitted and locked
  const isMonthSubmitted = () => {
    if (fullMonthStatus) {
      // If verification is REJECTED, re-submission is NOT allowed. Keep locked.
      const isVerificationRejected =
        fullMonthStatus.verified_status === 'REJECTED' ||
        fullMonthStatus.verifiedStatus === 'REJECTED';

      if (isVerificationRejected) {
        return true; // Locked, re-submission never allowed if verified status is REJECTED
      }

      // Re-submission / editing is ONLY allowed if the approver rejected it
      const isApproverRejected =
        fullMonthStatus.approved_status === 'REJECTED' ||
        fullMonthStatus.approvedStatus === 'REJECTED' ||
        fullMonthStatus.admin_status === 'REJECTED' ||
        fullMonthStatus.adminStatus === 'REJECTED' ||
        fullMonthStatus.status === 'REJECTED';

      if (isApproverRejected) {
        return false; // Re-open for entry editing and re-submission
      }

      if (fullMonthStatus.status === "SUBMIT" || fullMonthStatus.status === "SUBMITTED" || fullMonthStatus.fullMonthId || fullMonthStatus.id) {
        return true;
      }
    }
    return tourEntries.some(entry => entry.submitted === true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditSelectedScheme("");
    setEditEntryType('WORKING');
    setEditSelectedTalukId(null);
    setEditFormData({
      id: null, distance: "", hours: "", remark: "", reportEntryType: "",
      entryType: "WORKING",
      schemeId: "", purposeId: "", talukId: "", zoneId: "", clusterId: "", seasonId: "",
      landType: "", cropName: "", geoLocation: ""
    });
  };

  const closeSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const isSunday = (year, month, day) => new Date(year, month - 1, day).getDay() === 0;

  const isSecondSaturday = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    if (date.getDay() !== 6) return false;
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
    return day === firstSaturday + 7;
  };

  const getEntriesForDay = (day) =>
    tourEntries.filter(entry => {
      try {
        const d = new Date(entry.createdAt);
        return d.getDate() === day && d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      } catch (e) { return false; }
    });

  const formatDateKey = (day) =>
    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // ============================ TABLE RENDER ============================
  const renderTableRows = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const isSun = isSunday(selectedYear, selectedMonth, day);
      const is2ndSat = isSecondSaturday(selectedYear, selectedMonth, day);
      const isFirstHalf = day <= 15;
      const dateObj = new Date(selectedYear, selectedMonth - 1, day);
      const dayName = dateObj.toLocaleString('default', { weekday: 'short' });
      const dayEvents = getEntriesForDay(day);

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
            height: '20px', fontSize: '0.65rem', fontWeight: 'bold',
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



      if (dayEvents.length === 0) {
        rows.push(
          <TableRow key={`day-${day}`} sx={{ backgroundColor: rowBg, '&:hover': { filter: 'brightness(0.97)' } }}>
            <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap', borderBottom: `1px solid ${theme.palette.divider}` }}>
              {dateLabel}
            </TableCell>
            <TableCell sx={{ py: 1, px: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
              {halfChip}
            </TableCell>
            <TableCell colSpan={6} sx={{ py: 1, px: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                No entries
              </Typography>
            </TableCell>
            <TableCell sx={{ py: 1, px: 1, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
              {/* empty actions */}
            </TableCell>
            <TableCell sx={{ py: 1, px: 1, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Tooltip title={isMonthSubmitted() ? "Locked — Full month submitted" : "Add manual entry"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (isMonthSubmitted()) {
                        setSnackbar({ open: true, message: "Full Month has already been submitted. You cannot add new entries for this period.", severity: "info" });
                        return;
                      }
                      handleOpenManualEntry(dateKey);
                    }}
                    disabled={isMonthSubmitted()}
                    sx={{
                      backgroundColor: isMonthSubmitted() ? '#ccc' : '#1976d2', color: '#fff', width: 26, height: 26,
                      '&:hover': { backgroundColor: isMonthSubmitted() ? '#ccc' : '#1565c0' }
                    }}
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      } else {
        dayEvents.forEach((event, idx) => {
          const isLast = idx === dayEvents.length - 1;
          const isFirst = idx === 0;
          const cellBorderBottom = isLast
            ? `2px solid ${theme.palette.divider}`
            : `1.5px solid ${theme.palette.mode === 'dark' ? '#1976d2' : '#2196f3'}`;

          const entryTypeColor =
            event.reportEntryType === 'AUTO CAPTURED' ? '#2196f3' :
              event.reportEntryType === 'MANUAL' ? '#ff9800' : '#95a5a6';

          rows.push(
            <TableRow
              key={`event-${event.id || `${day}-${idx}`}`}
              sx={{ backgroundColor: rowBg, '&:hover': { filter: 'brightness(0.97)' }, cursor: 'pointer' }}
              onClick={() => handleViewEntryDetails(event)}
            >
              {/* Date – only on first row, rowSpan */}
              {isFirst && (
                <TableCell
                  rowSpan={dayEvents.length}
                  sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap', verticalAlign: 'middle', borderBottom: `2px solid ${theme.palette.divider}` }}
                >
                  {dateLabel}
                </TableCell>
              )}
              {/* FH/SH – only on first row */}
              {isFirst && (
                <TableCell
                  rowSpan={dayEvents.length}
                  sx={{ py: 1, px: 1, verticalAlign: 'middle', borderBottom: `2px solid ${theme.palette.divider}` }}
                >
                  {halfChip}
                </TableCell>
              )}
              {/* Entry Type */}
              <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                  <Chip
                    label={event.reportEntryType === 'AUTO CAPTURED' ? 'AUTO CAPTURED' : event.reportEntryType}
                    size="small"
                    sx={{
                      fontSize: '0.65rem', height: '20px',
                      backgroundColor: entryTypeColor,
                      color: 'white',
                      '& .MuiChip-label': { px: 0.75 }
                    }}
                  />
                  {event.entryType && event.entryType !== 'WORKING' && (
                    <Chip
                      label={ENTRY_TYPES.find(t => t.value === event.entryType)?.label || event.entryType}
                      size="small"
                      sx={{
                        fontSize: '0.6rem', height: '18px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  )}
                  {(event.isAdvanceChanged === true || event.isAdvanceChanged === "true") && (
                    <Tooltip title={event.changeReason ? `Change Reason: ${event.changeReason}` : "Advance Tour Program Changed"}>
                      <Chip
                        label="Changed from Advance"
                        size="small"
                        color="warning"
                        sx={{ fontSize: '0.6rem', height: '18px', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              {/* Zone */}
              <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                <Typography variant="caption">{event.zoneName || (event.zoneId ? `Zone ${event.zoneId}` : '—')}</Typography>
              </TableCell>
              {/* Purpose */}
              <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                <Typography variant="caption">{event.purposeName || '—'}</Typography>
              </TableCell>
              {/* Cluster */}
              <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                <Typography variant="caption">{event.clusterNo || event.clusterNumber || event.clusterName || event.clusterId || '—'}</Typography>
              </TableCell>
              {/* Distance / Hours */}
              <TableCell sx={{ py: 0.75, px: 1, borderBottom: cellBorderBottom }}>
                <Typography variant="caption">
                  {event.distance ? `${event.distance} km` : '—'}
                  {event.distance && event.hours ? ' / ' : ''}
                  {event.hours ? `${event.hours} h` : ''}
                  {!event.distance && !event.hours ? '' : ''}
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
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleViewEntryDetails(event); }}
                    sx={{ mr: 0.5, color: theme.palette.primary.main }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isMonthSubmitted() ? "Locked — Full month submitted" : "Edit"}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMonthSubmitted()) {
                          setSnackbar({ open: true, message: "Full Month has already been submitted. You cannot edit entries for this period.", severity: "info" });
                          return;
                        }
                        handleEditEntry(event);
                      }}
                      disabled={isMonthSubmitted()}
                      sx={{ mr: 0.5, color: isMonthSubmitted() ? 'text.disabled' : theme.palette.warning.main }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={isMonthSubmitted() ? "Locked — Full month submitted" : "Delete"}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMonthSubmitted()) {
                          setSnackbar({ open: true, message: "Full Month has already been submitted. You cannot delete entries for this period.", severity: "info" });
                          return;
                        }
                        openDeleteDialog(event.id);
                      }}
                      disabled={deleteLoading || isMonthSubmitted()}
                      sx={{ color: isMonthSubmitted() ? 'text.disabled' : theme.palette.error.main }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
              {/* + button — only on last row */}
              {isLast && (
                <TableCell sx={{ py: 1, px: 1, textAlign: 'center', verticalAlign: 'middle', borderBottom: cellBorderBottom }}>
                  <Tooltip title={isMonthSubmitted() ? "Locked — Full month submitted" : "Add manual entry"}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMonthSubmitted()) {
                            setSnackbar({ open: true, message: "Full Month has already been submitted. You cannot add new entries for this period.", severity: "info" });
                            return;
                          }
                          handleOpenManualEntry(dateKey);
                        }}
                        disabled={isMonthSubmitted()}
                        sx={{
                          backgroundColor: isMonthSubmitted() ? '#ccc' : '#1976d2', color: '#fff', width: 26, height: 26,
                          '&:hover': { backgroundColor: isMonthSubmitted() ? '#ccc' : '#1565c0' }
                        }}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              )}
              {/* Spacer cell for non-last rows */}
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
  if (!currentUserId) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}><Breadcrumb /></Grid>
        <Grid item xs={12}>
          <MainCard>
            <Alert severity="error">Please login to view tour details</Alert>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/login")} variant="contained" sx={{ mt: 2 }}>
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
        <Grid item xs={12}><Breadcrumb /></Grid>
        <Grid item xs={12}>
          <MainCard>
            <Alert severity="error">No user selected</Alert>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
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
        <MainCard>
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <Box>
              <Typography variant="h3" align="center" sx={{ marginBottom: 3, color: theme.palette.text.primary }}>
                Actual Tour Diary
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.action.hover, borderColor: theme.palette.divider }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Full Month Status:
                  </Typography>
                  <Chip
                    label={
                      (fullMonthStatus && (
                        fullMonthStatus.verified_status === 'REJECTED' ||
                        fullMonthStatus.verifiedStatus === 'REJECTED'
                      ))
                        ? '❌ Verification Rejected — Locked'
                        : isMonthSubmitted()
                          ? '✅ Full Month Submitted'
                          : (fullMonthStatus && (
                            fullMonthStatus.approved_status === 'REJECTED' ||
                            fullMonthStatus.approvedStatus === 'REJECTED' ||
                            fullMonthStatus.admin_status === 'REJECTED' ||
                            fullMonthStatus.adminStatus === 'REJECTED' ||
                            fullMonthStatus.status === 'REJECTED'
                          ))
                            ? '❌ Submission Rejected — Re-entry Allowed'
                            : '⏳ Pending Submission'
                    }
                    color={
                      (fullMonthStatus && (
                        fullMonthStatus.verified_status === 'REJECTED' ||
                        fullMonthStatus.verifiedStatus === 'REJECTED'
                      ))
                        ? 'error'
                        : isMonthSubmitted()
                          ? 'success'
                          : (fullMonthStatus && (
                            fullMonthStatus.approved_status === 'REJECTED' ||
                            fullMonthStatus.approvedStatus === 'REJECTED' ||
                            fullMonthStatus.admin_status === 'REJECTED' ||
                            fullMonthStatus.adminStatus === 'REJECTED' ||
                            fullMonthStatus.status === 'REJECTED'
                          ))
                            ? 'error'
                            : 'warning'
                    }
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  {fullMonthStatus && (
                    <>
                      {!["Taluk Level Approver", "District Level Approver", "District Level Data Viewer"].includes(role) && (
                        <Chip
                          label={`Verification: ${fullMonthStatus.verified_status || fullMonthStatus.verifiedStatus || 'PENDING'}`}
                          size="small"
                          color={
                            (fullMonthStatus.verified_status || fullMonthStatus.verifiedStatus) === 'APPROVED' ? 'success' :
                              (fullMonthStatus.verified_status || fullMonthStatus.verifiedStatus) === 'REJECTED' ? 'error' : 'warning'
                          }
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      <Chip
                        label={`Admin Approval: ${fullMonthStatus.approved_status || fullMonthStatus.approvedStatus || fullMonthStatus.admin_status || fullMonthStatus.adminStatus || 'PENDING'}`}
                        size="small"
                        color={
                          (fullMonthStatus.approved_status || fullMonthStatus.approvedStatus || fullMonthStatus.admin_status || fullMonthStatus.adminStatus) === 'APPROVED' ? 'success' :
                            (fullMonthStatus.approved_status || fullMonthStatus.approvedStatus || fullMonthStatus.admin_status || fullMonthStatus.adminStatus) === 'REJECTED' ? 'error' : 'warning'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </>
                  )}
                  {fullMonthStatus && (
                    <Tooltip title="View Remarks & Submission Details">
                      <IconButton
                        size="small"
                        onClick={() => setFullMonthModalOpen(true)}
                        sx={{ color: theme.palette.info.main, ml: 0.5 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
              <Box
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 2, position: 'relative', minHeight: '70px'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '250px', justifyContent: 'flex-start' }}>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' }, whiteSpace: 'nowrap', minWidth: '80px' }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleMonthChange(-1)}
                    sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' }, whiteSpace: 'nowrap', minWidth: '80px' }}
                  >
                    Prev
                  </Button>
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.text.primary, textAlign: 'center', fontWeight: 500,
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap'
                  }}
                >
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '250px', justifyContent: 'flex-end' }}>
                  <Tooltip title={isMonthSubmitted() ? "Full Month has already been submitted" : "Submit Full Month"}>
                    <span>
                      <Button
                        variant="contained"
                        onClick={handleSubmitMonth}
                        disabled={submittingMonth || isMonthSubmitted()}
                        sx={{
                          backgroundColor: isMonthSubmitted() ? '#888' : '#27ae60',
                          '&:hover': { backgroundColor: isMonthSubmitted() ? '#888' : '#229954' },
                          whiteSpace: 'nowrap',
                          minWidth: '140px'
                        }}
                        startIcon={submittingMonth ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        {submittingMonth
                          ? "Submitting..."
                          : isMonthSubmitted()
                            ? "Month Submitted"
                            : (fullMonthStatus && (
                              fullMonthStatus.approved_status === 'REJECTED' ||
                              fullMonthStatus.approvedStatus === 'REJECTED' ||
                              fullMonthStatus.admin_status === 'REJECTED' ||
                              fullMonthStatus.adminStatus === 'REJECTED' ||
                              (fullMonthStatus.status === 'REJECTED' && fullMonthStatus.verified_status !== 'REJECTED' && fullMonthStatus.verifiedStatus !== 'REJECTED')
                            ))
                              ? "Re-submit Full Month"
                              : "Submit Full Month"}
                      </Button>
                    </span>
                  </Tooltip>
                  <Button
                    variant="contained"
                    onClick={() => handleMonthChange(1)}
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
                  { color: '#2196f3', label: 'AUTO CAPTURED' },
                  { color: '#ff9800', label: 'MANUAL ENTRY' },
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

            {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Scrollable Table */}
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Date', 'FH/SH', 'Entry Type', 'Zone', 'Purpose', 'Cluster No', 'Distance / Hours', 'Remarks', 'Actions'].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap',
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f3f7',
                          borderBottom: `2px solid ${theme.palette.divider}`, px: 1.5
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap',
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f3f7',
                        borderBottom: `2px solid ${theme.palette.divider}`, px: 1, textAlign: 'center'
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

      {/* ==================== ENTRY DETAILS MODAL ==================== */}
      <Modal
        open={detailModalOpen}
        onClose={closeDetailModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card
          sx={{
            width: '90%', maxWidth: '500px', padding: 3, borderRadius: 2,
            backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24]
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Tour Entry Details</Typography>
            <IconButton onClick={closeDetailModal} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(selectedEntry.createdAt).toLocaleString('en-GB')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">Entry Type</Typography>
                <Chip
                  label={selectedEntry.reportEntryType === 'AUTO CAPTURED' ? 'AUTO CAPTURED' : selectedEntry.reportEntryType} size="small"
                  sx={{ backgroundColor: selectedEntry.reportEntryType === "AUTO CAPTURED" ? '#2196f3' : '#ff9800', color: 'white', mt: 0.5 }}
                />
              </Grid>
              {selectedEntry.entryType && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Working / Holiday</Typography>
                  <Chip
                    label={ENTRY_TYPES.find(t => t.value === selectedEntry.entryType)?.label || selectedEntry.entryType}
                    size="small"
                    sx={{ backgroundColor: selectedEntry.entryType === 'WORKING' ? '#27ae60' : '#e74c3c', color: 'white', mt: 0.5 }}
                  />
                </Grid>
              )}
              {selectedEntry.purposeName && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Purpose</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.purposeName}</Typography>
                </Grid>
              )}
              {/* {selectedEntry.zoneId && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Zone ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.zoneId}</Typography>
                </Grid>
              )} */}
              {selectedEntry.zoneName && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Zone Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.zoneName}</Typography>
                </Grid>
              )}
              {(selectedEntry.clusterNo || selectedEntry.clusterNumber || selectedEntry.clusterName || selectedEntry.clusterId) && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Cluster No</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.clusterNo || selectedEntry.clusterNumber || selectedEntry.clusterName || selectedEntry.clusterId}
                  </Typography>
                </Grid>
              )}
              {(selectedEntry.cropName || selectedEntry.cropNameEn || selectedEntry.cceId) && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Crop Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.cropNameEn && selectedEntry.cropNameMal
                      ? `${selectedEntry.cropNameEn} (${selectedEntry.cropNameMal})`
                      : selectedEntry.cropNameEn || selectedEntry.cropName || selectedEntry.cceId}
                  </Typography>
                </Grid>
              )}
              {selectedEntry.distance && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Distance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.distance} km</Typography>
                </Grid>
              )}
              {selectedEntry.hours && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Hours</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.hours}</Typography>
                </Grid>
              )}
              {selectedEntry.geoLocation && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.geoLocation}</Typography>
                </Grid>
              )}
              {selectedEntry.remark && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">Remarks</Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, backgroundColor: theme.palette.action.hover, borderRadius: 1 }}>
                    <Typography variant="body1">{selectedEntry.remark}</Typography>
                  </Paper>
                </Grid>
              )}
              {(selectedEntry.isAdvanceChanged === true || selectedEntry.isAdvanceChanged === "true") && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ borderRadius: 1.5, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Advance Tour Program Changed
                    </Typography>
                    {selectedEntry.changeReason && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>Reason for Change:</strong> {selectedEntry.changeReason}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            {selectedEntry && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  const idToDelete = selectedEntry.id;
                  closeDetailModal();
                  openDeleteDialog(idToDelete);
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="contained" onClick={closeDetailModal} sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' } }}>
              Close
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== EDIT MODAL - SYSTEM ENTRY ==================== */}
      <Modal
        open={editModalOpen && (editFormData.reportEntryType === "AUTO CAPTURED" || editFormData.reportEntryType === "AUTO CAPTURED")}
        onClose={closeEditModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card
          sx={{
            width: '90%', maxWidth: '500px', padding: 3, borderRadius: 2,
            backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24]
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Edit AUTO CAPTURED Tour Entry</Typography>
            <IconButton onClick={closeEditModal} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" sx={{ mb: 2 }}>AUTO CAPTURED entries can only edit Distance and Hours</Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Distance (km)" value={editFormData.distance}
                onChange={(e) => {
                  const newValue = validateDistance(e.target.value, editFormData.distance);
                  setEditFormData({ ...editFormData, distance: newValue });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Hours" value={editFormData.hours}
                onChange={(e) => {
                  const newValue = validateHours(e.target.value, editFormData.hours);
                  setEditFormData({ ...editFormData, hours: newValue });
                }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={closeEditModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveAutoCapturedEdit} disabled={submitting} startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#229954' } }}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== EDIT MODAL - MANUAL ENTRY ==================== */}
      <Modal
        open={editModalOpen && editFormData.reportEntryType === "MANUAL"}
        onClose={closeEditModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card
          sx={{
            width: '90%', maxWidth: '600px', padding: 3, borderRadius: 2,
            backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24],
            maxHeight: '80vh', overflow: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Edit Manual Tour Entry</Typography>
              {manualEntryDate && (
                <Chip
                  label={formatHeaderDate(manualEntryDate)}
                  color="primary"
                  size="small"
                  icon={<EventIcon />}
                  sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}
                />
              )}
            </Box>
            <IconButton onClick={closeEditModal} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Advance Tour Program Details & Change Toggle */}

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderColor: alpha(theme.palette.primary.main, 0.2)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" /> Advance Tour Program Details
              </Typography>
              {advanceTourLoading && <CircularProgress size={18} />}
            </Box>

            {advanceTourLoading ? (
              <Typography variant="body2" color="text.secondary">Loading Advance Tour Program...</Typography>
            ) : advanceTourForDate && advanceTourForDate.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}>
                  {advanceTourForDate.map((item, idx) => (
                    <Paper key={item.id || idx} elevation={0} sx={{ p: 1.5, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, borderRadius: 1.5 }}>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Entry Type</Typography>
                          <Chip label={item.entryType || 'WORKING'} size="small" color={item.entryType === 'WORKING' ? "success" : "error"} variant="outlined" sx={{ fontWeight: 600 }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Scheme</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.schemeName || item.schemesName || (item.schemeId === 10 || item.schemesId === 10 || !item.purposeName ? 'Others' : '—')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Purpose</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.purposeName || item.purpose || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Location / Place</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.location || item.place || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Zone</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.zoneName || (item.zoneId ? `Zone ${item.zoneId}` : '—')}</Typography>
                        </Grid>
                        {item.status && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                            <Chip label={item.status} size="small" color="info" variant="outlined" sx={{ height: '20px', fontSize: '0.65rem' }} />
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">Planned Remarks</Typography>
                          <Typography variant="body2">{item.remark || item.remarks || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>

                {!isFieldDataCollector && (
                  <>
                    <Divider sx={{ my: 1.5 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAdvanceChanged}
                          onChange={(e) => setIsAdvanceChanged(e.target.checked)}
                          color="warning"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isAdvanceChanged ? theme.palette.warning.dark : 'text.primary' }}>
                          Change Tour Program (Any difference from Advance Program?)
                        </Typography>
                      }
                    />

                    {isAdvanceChanged && (
                      <Box sx={{ mt: 1.5 }}>
                        <TextField
                          fullWidth
                          required
                          multiline
                          rows={2}
                          label="Reason for Changing Advance Tour Program"
                          placeholder="Enter reason why actual tour differs from advance program..."
                          value={changeReason}
                          onChange={(e) => setChangeReason(validateRemarks(e.target.value))}
                          error={isAdvanceChanged && !changeReason.trim()}
                          helperText={isAdvanceChanged && !changeReason.trim() ? "Reason is required when Change Tour Program is enabled" : ""}
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', my: 0.5 }}>
                No Advance Tour Program planned for this date.
              </Typography>
            )}
          </Paper>

          <Grid container spacing={2}>

            {/* Entry Type - Always visible */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Entry Type</InputLabel>
                <Select
                  value={editEntryType}
                  label="Entry Type"
                  onChange={(e) => {
                    const newEntryType = e.target.value;
                    setEditEntryType(newEntryType);
                    if (newEntryType !== 'WORKING') {
                      setEditSelectedScheme("");
                      setIsOtherScheme(false);
                      setEditFormData(prev => ({
                        ...prev,
                        entryType: newEntryType,
                        schemeId: "",
                        purposeId: "",
                        zoneId: "",
                        clusterId: "",
                        cropId: "",
                        distance: "",
                        hours: "",
                        geoLocation: ""
                      }));
                    } else {
                      setEditFormData(prev => ({ ...prev, entryType: newEntryType }));
                    }
                  }}
                >
                  {ENTRY_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {editEntryType === 'WORKING' && (
              <>
                {/* Scheme */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Scheme</InputLabel>
                    <Select
                      value={editFormData.schemeId}
                      onChange={(e) => {
                        const schemeId = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          schemeId: schemeId,
                          purposeId: ""
                        });
                        setEditSelectedScheme(schemeId);
                        setIsOtherScheme(schemeId === 10);
                        if (schemeId === 10) {
                          setEditFormData({
                            ...editFormData,
                            schemeId: schemeId,
                            purposeId: "",
                            zoneId: "",
                            clusterId: "",
                            cropId: "",
                            distance: "",
                            hours: "",
                            geoLocation: ""
                          });
                        }
                      }}
                      label="Scheme"
                    >
                      {schemes.map((scheme) => (
                        <MenuItem key={scheme.id} value={scheme.id}>{scheme.schemeName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Purpose - Hidden when "Others" is selected */}
                {!isOtherScheme && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Purpose</InputLabel>
                      <Select
                        value={editFormData.purposeId}
                        onChange={(e) => {
                          const selectedPurpose = purposes.find(p => p.id === Number(e.target.value));
                          setEditFormData({
                            ...editFormData,
                            purposeId: e.target.value
                          });
                          setEditPurposeLandType(selectedPurpose?.landtype || "");
                        }}
                        label="Purpose"
                        disabled={!editFormData.schemeId || isOtherScheme}
                      >
                        {purposes.length === 0 ? (
                          <MenuItem disabled>Select scheme first</MenuItem>
                        ) : (
                          purposes.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.purposeName} {p.landtype ? `(${p.landtype === 1 ? 'WET' : p.landtype === 2 ? 'DRY' : 'EXTRA'})` : ''}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Taluk - Only for District Level roles (when duty is true) */}
                {!isOtherScheme && !editIsOfficeDuty && isDistrictLevelRole && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Taluk</InputLabel>
                      <Select
                        value={editSelectedTalukId || ''}
                        label="Taluk"
                        onChange={(e) => {
                          const talukId = e.target.value;
                          setEditSelectedTalukId(talukId);
                          setEditFormData({ ...editFormData, zoneId: "", clusterId: "" });
                          setClusters([]);
                          setFilteredClusters([]);
                          fetchZonesByTaluk(talukId);
                        }}
                      >
                        {taluks.map((taluk) => (
                          <MenuItem key={taluk.talukId} value={taluk.talukId}>
                            {taluk.talukName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Zone - Only shown when duty is true */}
                {!isOtherScheme && !editIsOfficeDuty && (!isDistrictLevelRole || editSelectedTalukId) && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Zone</InputLabel>
                      <Select
                        value={editFormData.zoneId}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, zoneId: e.target.value });
                          setClusters([]);
                          setFilteredClusters([]);
                        }}
                        label="Zone"
                        disabled={isOtherScheme || zonesLoading || isZoneDropdownLoading}
                      >
                        {zones.map((zone) => (
                          <MenuItem key={zone.zoneId} value={zone.zoneId}>
                            {zone.zoneName || zone.name || `Zone ${zone.zoneId}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Cluster - Only shown when duty is true */}
                {!isOtherScheme && !editIsOfficeDuty && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={Boolean(editFormData.zoneId && editFormData.purposeId && filteredClusters.length === 0)}>
                      <InputLabel>Cluster Number</InputLabel>
                      <Select
                        value={editFormData.clusterId}
                        onChange={(e) => {
                          const selectedCluster = filteredClusters.find(c => c.clusterId === e.target.value);
                          setEditFormData({
                            ...editFormData,
                            clusterId: e.target.value
                          });
                        }}
                        label="Cluster Number"
                        disabled={!editFormData.zoneId || !editFormData.purposeId || isOtherScheme}
                      >
                        {!editFormData.zoneId ? (
                          <MenuItem disabled>Please select a zone first</MenuItem>
                        ) : !editFormData.purposeId ? (
                          <MenuItem disabled>Please select a purpose first</MenuItem>
                        ) : filteredClusters.length === 0 ? (
                          <MenuItem disabled>No clusters found for the selected zone/purpose</MenuItem>
                        ) : (
                          filteredClusters.map((cluster) => (
                            <MenuItem key={cluster.clusterId} value={cluster.clusterId}>
                              Cluster {cluster.clusterNumber} - {cluster.landType}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {editFormData.zoneId && editFormData.purposeId && filteredClusters.length === 0 && (
                        <FormHelperText sx={{ fontWeight: 600, mt: 0.5 }}>
                          No clusters found for the selected zone
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )}

                {/* Crop - Only when purpose land type is 3 and duty is true */}
                {!isOtherScheme && !editIsOfficeDuty && editPurposeLandType === 3 && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Crop</InputLabel>
                      <Select
                        value={editFormData.cropId}
                        onChange={(e) => {
                          setEditFormData({
                            ...editFormData,
                            cropId: e.target.value
                          });
                        }}
                        label="Crop"
                        disabled={cropsLoading}
                      >
                        {cropsLoading ? (
                          <MenuItem disabled>Loading crops...</MenuItem>
                        ) : crops.length === 0 ? (
                          <MenuItem disabled>No crops available</MenuItem>
                        ) : (
                          crops.map((crop) => (
                            <MenuItem key={crop.cceId || crop.cropId} value={crop.cceId}>
                              {crop.cropNameEn && crop.cropNameMal
                                ? `${crop.cropNameEn} (${crop.cropNameMal})`
                                : crop.cropNameEn || crop.cropNameMal || crop.cropName || `Crop ${crop.cceId}`}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Distance - Only shown when duty is true */}
                {!isOtherScheme && !editIsOfficeDuty && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Distance (km)"
                      value={editFormData.distance}
                      onChange={(e) => {
                        const v = validateDistance(e.target.value, editFormData.distance);
                        if (v !== undefined) setEditFormData({ ...editFormData, distance: v });
                      }}
                    />
                  </Grid>
                )}

                {/* Hours - Only shown when duty is true */}
                {!isOtherScheme && !editIsOfficeDuty && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hours"
                      value={editFormData.hours}
                      onChange={(e) => {
                        const v = validateHours(e.target.value, editFormData.hours);
                        if (v !== undefined) setEditFormData({ ...editFormData, hours: v });
                      }}
                    />
                  </Grid>
                )}

                {/* Location - Only shown when duty is true */}
                {!isOtherScheme && !editIsOfficeDuty && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      placeholder="e.g., 10.8505,76.2711"
                      value={editFormData.geoLocation}
                      onChange={(e) => setEditFormData({ ...editFormData, geoLocation: validateGeoLocation(e.target.value) })}
                    />
                  </Grid>
                )}
              </>
            )}

            {/* Remarks - Always visible */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={(editEntryType === 'HOLIDAY' || editEntryType === 'LEAVE') ? "Remarks" : "Remarks *"}
                multiline
                rows={(isOtherScheme || editEntryType !== 'WORKING') ? 6 : 3}
                value={editFormData.remark}
                onChange={(e) => setEditFormData({ ...editFormData, remark: validateRemarks(e.target.value) })}
                required={!(editEntryType === 'HOLIDAY' || editEntryType === 'LEAVE')}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={closeEditModal}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveManualEdit} disabled={submitting} startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#229954' } }}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== ADD MANUAL ENTRY MODAL ==================== */}

      <Modal
        open={manualEntryOpen}
        onClose={() => setManualEntryOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card
          sx={{
            width: '90%', maxWidth: '600px', padding: 3, borderRadius: 2,
            backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24],
            maxHeight: '80vh', overflow: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Add Manual Tour Entry</Typography>
              {manualEntryDate && (
                <Chip
                  label={formatHeaderDate(manualEntryDate)}
                  color="primary"
                  size="small"
                  icon={<EventIcon />}
                  sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}
                />
              )}
            </Box>
            <IconButton onClick={() => setManualEntryOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Advance Tour Program Details & Change Toggle */}

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderColor: alpha(theme.palette.primary.main, 0.2)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" /> Advance Tour Program Details
              </Typography>
              {advanceTourLoading && <CircularProgress size={18} />}
            </Box>

            {advanceTourLoading ? (
              <Typography variant="body2" color="text.secondary">Loading Advance Tour Program...</Typography>
            ) : advanceTourForDate && advanceTourForDate.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}>
                  {advanceTourForDate.map((item, idx) => (
                    <Paper key={item.id || idx} elevation={0} sx={{ p: 1.5, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, borderRadius: 1.5 }}>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Entry Type</Typography>
                          <Chip label={item.entryType || 'WORKING'} size="small" color={item.entryType === 'WORKING' ? "success" : "error"} variant="outlined" sx={{ fontWeight: 600 }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Scheme</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.schemeName || item.schemesName || (item.schemeId === 10 || item.schemesId === 10 || !item.purposeName ? 'Others' : '—')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Purpose</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.purposeName || item.purpose || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Location / Place</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.location || item.place || '—'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" display="block">Zone</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.zoneName || (item.zoneId ? `Zone ${item.zoneId}` : '—')}</Typography>
                        </Grid>
                        {item.status && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                            <Chip label={item.status} size="small" color="info" variant="outlined" sx={{ height: '20px', fontSize: '0.65rem' }} />
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">Planned Remarks</Typography>
                          <Typography variant="body2">{item.remark || item.remarks || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>

                {!isFieldDataCollector && (
                  <>
                    <Divider sx={{ my: 1.5 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAdvanceChanged}
                          onChange={(e) => setIsAdvanceChanged(e.target.checked)}
                          color="warning"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isAdvanceChanged ? theme.palette.warning.dark : 'text.primary' }}>
                          Change Tour Program (Any difference from Advance Program?)
                        </Typography>
                      }
                    />

                    {isAdvanceChanged && (
                      <Box sx={{ mt: 1.5 }}>
                        <TextField
                          fullWidth
                          required
                          multiline
                          rows={2}
                          label="Reason for Changing Advance Tour Program"
                          placeholder="Enter reason why actual tour differs from advance program..."
                          value={changeReason}
                          onChange={(e) => setChangeReason(validateRemarks(e.target.value))}
                          error={isAdvanceChanged && !changeReason.trim()}
                          helperText={isAdvanceChanged && !changeReason.trim() ? "Reason is required when Change Tour Program is enabled" : ""}
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', my: 0.5 }}>
                No Advance Tour Program planned for this date.
              </Typography>
            )}
          </Paper>


          <Grid container spacing={2}>
            {/* Entry Type - Always visible */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Entry Type</InputLabel>
                <Select
                  value={entryType}
                  label="Entry Type"
                  onChange={(e) => {
                    const newEntryType = e.target.value;
                    setEntryType(newEntryType);
                    setManualFormData(prev => ({ ...prev, entryType: newEntryType }));
                    // Reset WORKING-only fields when switching away from WORKING
                    if (newEntryType !== 'WORKING') {
                      setSelectedScheme("");
                      setIsOtherScheme(false);
                      setManualFormData(prev => ({
                        ...prev,
                        entryType: newEntryType,
                        purposeId: "",
                        zoneId: "",
                        clusterId: "",
                        cropId: "",
                        distance: "",
                        hours: "",
                        geoLocation: ""
                      }));
                    }
                  }}
                >
                  {ENTRY_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {entryType === 'WORKING' && (
              <>
                {/* Scheme - Always visible */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Scheme</InputLabel>
                    <Select
                      value={selectedScheme}
                      onChange={(e) => {
                        const schemeId = e.target.value;
                        setSelectedScheme(schemeId);
                        setIsOtherScheme(schemeId === 10);
                        if (schemeId === 10) {
                          setManualFormData({
                            ...manualFormData,
                            purposeId: "",
                            zoneId: "",
                            clusterId: "",
                            cropId: "",
                            distance: "",
                            hours: "",
                            geoLocation: ""
                          });
                        }
                      }}
                      label="Scheme"
                    >
                      {schemes.map((scheme) => (
                        <MenuItem key={scheme.id} value={scheme.id}>{scheme.schemeName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Purpose - Hidden when "Others" is selected */}
                {!isOtherScheme && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Purpose</InputLabel>
                      <Select
                        value={manualFormData.purposeId}
                        onChange={(e) => {
                          const selectedPurpose = purposes.find(p => p.id === Number(e.target.value));
                          const landtype = selectedPurpose?.landtype;
                          const duty = selectedPurpose?.duty;

                          // Check if it's office duty/conference (duty = false)
                          const isOfficeDutyType = duty === false;

                          setIsOfficeDuty(isOfficeDutyType);
                          setPurposeLandType(landtype || "");

                          setManualFormData({
                            ...manualFormData,
                            purposeId: e.target.value,
                            cropId: "",
                            clusterId: "",
                            zoneId: isOfficeDutyType ? "" : manualFormData.zoneId,
                            distance: isOfficeDutyType ? "" : manualFormData.distance,
                            hours: isOfficeDutyType ? "" : manualFormData.hours,
                            geoLocation: isOfficeDutyType ? "" : manualFormData.geoLocation
                          });

                          // Reset clusters when purpose changes
                          setManualFormData(prev => ({ ...prev, clusterId: "" }));

                          // If office duty, clear clusters and crops
                          if (isOfficeDutyType) {
                            setFilteredClusters([]);
                            setCrops([]);
                          } else {
                            // Filter clusters based on land type
                            if (clusters.length > 0) {
                              filterClustersByLandType(clusters, landtype);
                            }
                          }
                        }}
                        label="Purpose"
                        disabled={!selectedScheme || isOtherScheme}
                      >
                        {purposes.length === 0 ? (
                          <MenuItem disabled>Select scheme first</MenuItem>
                        ) : (
                          purposes.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.purposeName}
                              {p.landtype ? ` (${p.landtype === 1 ? 'WET' : p.landtype === 2 ? 'DRY' : 'EXTRA'})` : ''}
                              {p.duty === false ? ' (Office/Conference)' : ''}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Taluk - Only for District Level roles (when duty is true) */}
                {!isOtherScheme && !isOfficeDuty && isDistrictLevelRole && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Taluk</InputLabel>
                      <Select
                        value={selectedTalukId || ''}
                        label="Taluk"
                        onChange={(e) => {
                          const talukId = e.target.value;
                          setSelectedTalukId(talukId);
                          setManualFormData({ ...manualFormData, zoneId: "", clusterId: "" });
                          setClusters([]);
                          setFilteredClusters([]);
                          fetchZonesByTaluk(talukId);
                        }}
                      >
                        {taluks.map((taluk) => (
                          <MenuItem key={taluk.talukId} value={taluk.talukId}>
                            {taluk.talukName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Zone - Only shown when duty is true */}
                {!isOtherScheme && !isOfficeDuty && (!isDistrictLevelRole || selectedTalukId) && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Zone</InputLabel>
                      <Select
                        value={manualFormData.zoneId}
                        onChange={(e) => {
                          setManualFormData({ ...manualFormData, zoneId: e.target.value, clusterId: "" });
                          setClusters([]);
                          setFilteredClusters([]);
                        }}
                        label="Zone"
                        disabled={isOtherScheme || zonesLoading || isZoneDropdownLoading}
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
                )}

                {/* Cluster - Only shown when duty is true */}
                {!isOtherScheme && !isOfficeDuty && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={Boolean(manualFormData.zoneId && manualFormData.purposeId && filteredClusters.length === 0)}>
                      <InputLabel>Cluster Number</InputLabel>
                      <Select
                        value={manualFormData.clusterId}
                        onChange={(e) => {
                          const selectedCluster = filteredClusters.find(c => c.clusterId === e.target.value);
                          setManualFormData({
                            ...manualFormData,
                            clusterId: e.target.value
                          });
                        }}
                        label="Cluster Number"
                        disabled={!manualFormData.zoneId || !manualFormData.purposeId || isOtherScheme}
                      >
                        {!manualFormData.zoneId ? (
                          <MenuItem disabled>Please select a zone first</MenuItem>
                        ) : !manualFormData.purposeId ? (
                          <MenuItem disabled>Please select a purpose first</MenuItem>
                        ) : filteredClusters.length === 0 ? (
                          <MenuItem disabled>No clusters found for the selected zone/purpose</MenuItem>
                        ) : (
                          filteredClusters.map((cluster) => (
                            <MenuItem key={cluster.clusterId} value={cluster.clusterId}>
                              Cluster {cluster.clusterNumber} - {cluster.landType}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {manualFormData.zoneId && manualFormData.purposeId && filteredClusters.length === 0 && (
                        <FormHelperText sx={{ fontWeight: 600, mt: 0.5 }}>
                          No clusters found for the selected zone
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )}

                {/* Crop - Only when purpose land type is 3 (EXTRA) and duty is true */}
                {!isOtherScheme && !isOfficeDuty && purposeLandType === 3 && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Crop</InputLabel>
                      <Select
                        value={manualFormData.cropId}
                        onChange={(e) => {
                          setManualFormData({
                            ...manualFormData,
                            cropId: e.target.value
                          });
                        }}
                        label="Crop"
                        disabled={cropsLoading}
                      >
                        {cropsLoading ? (
                          <MenuItem disabled>Loading crops...</MenuItem>
                        ) : crops.length === 0 ? (
                          <MenuItem disabled>No crops available</MenuItem>
                        ) : (
                          crops.map((crop) => (
                            <MenuItem key={crop.cceId || crop.cropId} value={crop.cceId}>
                              {crop.cropNameEn && crop.cropNameMal
                                ? `${crop.cropNameEn} (${crop.cropNameMal})`
                                : crop.cropNameEn || crop.cropNameMal || crop.cropName || `Crop ${crop.cceId}`}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Distance - Only shown when duty is true */}
                {!isOtherScheme && !isOfficeDuty && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Distance (km) *"
                      type="text"
                      value={manualFormData.distance}
                      onChange={(e) => {
                        const v = validateDistance(e.target.value, manualFormData.distance);
                        if (v !== undefined) setManualFormData({ ...manualFormData, distance: v });
                      }}
                    />
                  </Grid>
                )}

                {/* Hours - Only shown when duty is true */}
                {!isOtherScheme && !isOfficeDuty && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hours (hr) *"
                      type="text"
                      value={manualFormData.hours}
                      onChange={(e) => {
                        const v = validateHours(e.target.value, manualFormData.hours);
                        if (v !== undefined) setManualFormData({ ...manualFormData, hours: v });
                      }}
                    />
                  </Grid>
                )}

                {/* Location - Only shown when duty is true */}
                {!isOtherScheme && !isOfficeDuty && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      placeholder="e.g., 10.8505,76.2711"
                      value={manualFormData.geoLocation}
                      onChange={(e) => setManualFormData({ ...manualFormData, geoLocation: validateGeoLocation(e.target.value) })}
                    />
                  </Grid>
                )}
              </>
            )}

            {/* Remarks - Always visible, required for all except Holiday and Leave */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={(entryType === 'HOLIDAY' || entryType === 'LEAVE') ? "Remarks" : "Remarks *"}
                multiline
                rows={(isOtherScheme || entryType !== 'WORKING') ? 6 : 3}
                value={manualFormData.remark}
                onChange={(e) => setManualFormData({ ...manualFormData, remark: validateRemarks(e.target.value) })}
                required={!(entryType === 'HOLIDAY' || entryType === 'LEAVE')}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="outlined" onClick={() => setManualEntryOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveManualEntry}
              disabled={submitting}
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#27ae60', '&:hover': { backgroundColor: '#229954' } }}
            >
              {submitting ? "Saving..." : "Save Entry"}
            </Button>
          </Box>
        </Card>
      </Modal>

      <Snackbar
        open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ==================== ZONE SELECTION DIALOG FOR SUBMISSION ==================== */}
      <Modal
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card
          sx={{
            width: '90%', maxWidth: '500px', padding: 3, borderRadius: 2,
            backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24]
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Select Zone for Submission</Typography>
            <IconButton onClick={() => setSubmitDialogOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Multiple zones found. Please select the zone for {monthNames[selectedMonth - 1]} {selectedYear} submission.
          </Typography>
          <List>
            {availableZones.map((zone) => (
              <React.Fragment key={zone.zoneId}>
                <ListItem button onClick={() => { }} sx={{ borderRadius: 1, mb: 1, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                  <ListItemText primary={zone.zoneName || `Zone ${zone.zoneId}`} secondary={`Zone ID: ${zone.zoneId}`} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          </Box>
        </Card>
      </Modal>
      {/* ==================== SUBMIT CONFIRMATION DIALOG ==================== */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 400 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <EventIcon sx={{ color: '#27ae60', fontSize: 28 }} />
          <Typography variant="h4">Confirm Full Month Submission</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ color: 'text.primary', mb: 2 }}>
            Are you sure you want to submit the <strong>entire month</strong> of{' '}
            <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong>?
          </DialogContentText>
          <Box sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1e2e1e' : '#f0faf0',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#2e7d32' : '#c8e6c9'}`,
            borderRadius: 1.5, px: 2, py: 1.5, mb: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              This will submit all entries for the full month (both First Half and Second Half)
            </Typography>
          </Box>
          <Alert severity="warning" sx={{ py: 0.5 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)} sx={{ minWidth: 90 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSubmit}
            disabled={submittingMonth}
            startIcon={submittingMonth ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              minWidth: 110,
              backgroundColor: '#27ae60',
              '&:hover': { backgroundColor: '#229954' }
            }}
          >
            {submittingMonth ? "Submitting..." : "Submit Full Month"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== RESULT DIALOG (Success / Error / Warning) ========== */}
      <Dialog
        open={resultDialog.open}
        onClose={() => setResultDialog(prev => ({ ...prev, open: false }))}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 380 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          {resultDialog.type === 'success' && <CheckCircleOutlineIcon sx={{ color: '#27ae60', fontSize: 28 }} />}
          {resultDialog.type === 'error' && <ErrorOutlineIcon sx={{ color: '#d32f2f', fontSize: 28 }} />}
          {resultDialog.type === 'warning' && <WarningAmberIcon sx={{ color: '#f57c00', fontSize: 28 }} />}
          <Typography variant="h4" sx={{
            color: resultDialog.type === 'success' ? '#27ae60'
              : resultDialog.type === 'error' ? '#d32f2f'
                : '#f57c00'
          }}>
            {resultDialog.title}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1.5,
            backgroundColor:
              resultDialog.type === 'success' ? (theme.palette.mode === 'dark' ? '#1e2e1e' : '#f0faf0') :
                resultDialog.type === 'error' ? (theme.palette.mode === 'dark' ? '#2e1e1e' : '#fff0f0') :
                  (theme.palette.mode === 'dark' ? '#2e2a1e' : '#fff8f0'),
            border: `1px solid ${resultDialog.type === 'success' ? '#c8e6c9' :
              resultDialog.type === 'error' ? '#ffcdd2' : '#ffe0b2'
              }`,
            borderRadius: 1.5, px: 2, py: 2
          }}>
            <DialogContentText sx={{
              color: theme.palette.text.primary, fontWeight: 500, whiteSpace: 'pre-wrap'
            }}>
              {resultDialog.message}
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            variant="contained"
            onClick={() => setResultDialog(prev => ({ ...prev, open: false }))}
            sx={{
              minWidth: 90,
              backgroundColor:
                resultDialog.type === 'success' ? '#27ae60' :
                  resultDialog.type === 'error' ? '#d32f2f' : '#f57c00',
              '&:hover': {
                backgroundColor:
                  resultDialog.type === 'success' ? '#229954' :
                    resultDialog.type === 'error' ? '#b71c1c' : '#e65100'
              }
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
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tour entry?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeDeleteDialog} variant="outlined" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteEvent(deleteDialog.eventId)}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== FULL MONTH REMARKS & STATUS MODAL ==================== */}
      <Dialog
        open={fullMonthModalOpen}
        onClose={() => setFullMonthModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Full Month Remarks & Details
            </Typography>
          </Box>
          <IconButton onClick={() => setFullMonthModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          {fullMonthStatus ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Submission Information */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                  Submission Details
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                    <Chip
                      label={fullMonthStatus.status || (isMonthSubmitted() ? 'SUBMITTED' : 'PENDING')}
                      color={isMonthSubmitted() ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 'bold', mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Submitted At</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(fullMonthStatus.submitted_at || fullMonthStatus.submittedAt)}
                    </Typography>
                  </Grid>
                  {fullMonthStatus.late !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Submission Timing</Typography>
                      <Chip
                        label={fullMonthStatus.late ? 'Late Submission' : 'On Time'}
                        color={fullMonthStatus.late ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Verification Details */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    Verification Status
                  </Typography>
                  <Chip
                    label={fullMonthStatus.verified_status || fullMonthStatus.verifiedStatus || 'PENDING'}
                    size="small"
                    color={
                      (fullMonthStatus.verified_status || fullMonthStatus.verifiedStatus) === 'APPROVED' ? 'success' :
                        (fullMonthStatus.verified_status || fullMonthStatus.verifiedStatus) === 'REJECTED' ? 'error' : 'warning'
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">Verified At</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(fullMonthStatus.verified_at || fullMonthStatus.verifiedAt)}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" display="block">Verified Remark</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: (fullMonthStatus.verified_remark || fullMonthStatus.verifiedRemark || fullMonthStatus.verificationRemark) ? 'normal' : 'italic',
                      color: (fullMonthStatus.verified_remark || fullMonthStatus.verifiedRemark || fullMonthStatus.verificationRemark) ? 'text.primary' : 'text.disabled'
                    }}
                  >
                    {(fullMonthStatus.verified_remark || fullMonthStatus.verifiedRemark || fullMonthStatus.verificationRemark) || 'No verified remark provided.'}
                  </Typography>
                </Paper>
              </Paper>

              {/* Admin / Approved Details */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                    Admin Approval Status
                  </Typography>
                  <Chip
                    label={fullMonthStatus.approved_status || fullMonthStatus.approvedStatus || fullMonthStatus.admin_status || fullMonthStatus.adminStatus || 'PENDING'}
                    size="small"
                    color={
                      (fullMonthStatus.approved_status || fullMonthStatus.approvedStatus || fullMonthStatus.admin_status || fullMonthStatus.adminStatus) === 'APPROVED' ? 'success' :
                        (fullMonthStatus.approved_status || fullMonthStatus.approvedStatus || fullMonthStatus.admin_status || fullMonthStatus.adminStatus) === 'REJECTED' ? 'error' : 'warning'
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">Approved At</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(fullMonthStatus.approved_at || fullMonthStatus.approvedAt || fullMonthStatus.admin_at)}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" display="block">Admin Remark</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: (fullMonthStatus.approved_remark || fullMonthStatus.approvedRemark || fullMonthStatus.admin_remark || fullMonthStatus.adminRemark) ? 'normal' : 'italic',
                      color: (fullMonthStatus.approved_remark || fullMonthStatus.approvedRemark || fullMonthStatus.admin_remark || fullMonthStatus.adminRemark) ? 'text.primary' : 'text.disabled'
                    }}
                  >
                    {(fullMonthStatus.approved_remark || fullMonthStatus.approvedRemark || fullMonthStatus.admin_remark || fullMonthStatus.adminRemark) || 'No admin remark provided.'}
                  </Typography>
                </Paper>
              </Paper>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No full month status information available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setFullMonthModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserTourDiaryDetail;
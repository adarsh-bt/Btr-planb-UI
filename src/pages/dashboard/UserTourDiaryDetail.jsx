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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Card,
  Modal,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardContent
} from "@mui/material";
import MainCard from "components/MainCard";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import tourDiaryService from "pages/authentication/services/tourdiaryservice";
import authservice from "pages/authentication/services/authservice";
import Breadcrumb from "routes/Breadcrumb";

const UserTourDiaryDetail = () => {
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
  const [selectedYear, setSelectedYear] = useState(yearParam || getLocalStorageYear(selectedMonth));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tourEntries, setTourEntries] = useState([]);
  const [userDetails, setUserDetails] = useState(userInfo || null);
  const [schemes, setSchemes] = useState([]);
  const [allPurposes, setAllPurposes] = useState([]);
  const [fullMonthStatus, setFullMonthStatus] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // Default to 'table'

  // Verification dialog states
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('APPROVED');
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Approval dialog states
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState('APPROVED');
  const [adminRemark, setAdminRemark] = useState("");
  const [approvingMonth, setApprovingMonth] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'info',
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
  const canVerify = () => {
    if (roleName === "Field Data Collector" && loggedInRole === "Field Inspector") {
      return true;
    }
    if (roleName === "Field Inspector" && loggedInRole === "Taluk Level Approver") {
      return true;
    }
    return false;
  };

  const canApprove = () => {
    if (roleName === "Field Data Collector" && loggedInRole === "Taluk Level Approver") {
      return true;
    }
    if (roleName === "Field Inspector" && loggedInRole === "District Level Approver") {
      return true;
    }
    if (roleName === "Taluk Level Approver" && loggedInRole === "District Level Approver") {
      return true;
    }
    if (roleName === "District Level Data Viewer" && loggedInRole === "District Level Approver") {
      return true;
    }
    if (roleName === "District Level Approver" && loggedInRole === "IT Admin") {
      return true;
    }
    return false;
  };

  // ============================================================
  // FETCH FUNCTIONS
  // ============================================================
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

  const fetchSchemesAndPurposes = async () => {
    try {
      const schemesData = await tourDiaryService.getAllSchemes();
      if (schemesData && !schemesData.message && Array.isArray(schemesData)) {
        setSchemes(schemesData);
        const allPurposesData = [];
        for (const scheme of schemesData) {
          const purposesData = await tourDiaryService.getActivePurposes(scheme.id);
          if (purposesData && !purposesData.message && Array.isArray(purposesData)) {
            allPurposesData.push(...purposesData);
          }
        }
        const uniquePurposes = Array.from(
          new Map(allPurposesData.map(p => [p.id, p])).values()
        );
        setAllPurposes(uniquePurposes);
      }
    } catch (error) {
      console.error("Error fetching schemes/purposes:", error);
    }
  };

  const fetchFullMonthStatus = async () => {
    if (!userId) return;
    try {
      const response = await tourDiaryService.getFullYearView(userId, selectedYear);
      if (response && !response.error && Array.isArray(response)) {
        const currentMonthData = response.find(
          item => item.month === selectedMonth && item.year === selectedYear
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

  const fetchUserTourEntries = async () => {
    if (!userId) {
      setError("No user selected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await tourDiaryService.getTourEntries(userId, selectedMonth, selectedYear);
      if (response && Array.isArray(response) && !response.message) {
        setTourEntries(response);
        if (response.length > 0 && !userDetails) {
          const firstEntry = response[0];
          setUserDetails({
            name: firstEntry.userName || firstEntry.name || 'N/A',
            empNumber: firstEntry.empNumber || firstEntry.employeeId || 'N/A',
            designation: firstEntry.designation || 'N/A',
            officelocation: firstEntry.officeLocation || firstEntry.location || 'N/A'
          });
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

  const [advanceEntries, setAdvanceEntries] = useState([]);

  const fetchAdvanceEntries = async () => {
    if (!userId) return;
    try {
      const response = await tourDiaryService.getAdvancedTourByFilter(userId, selectedMonth, selectedYear);
      if (response && Array.isArray(response)) {
        setAdvanceEntries(response);
      } else {
        setAdvanceEntries([]);
      }
    } catch (err) {
      console.error("Failed to fetch advance tour entries", err);
      setAdvanceEntries([]);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchSchemesAndPurposes();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserTourEntries();
      fetchAdvanceEntries();
      fetchFullMonthStatus();
    }
  }, [userId, selectedMonth, selectedYear]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleBack = () => navigate(-1);

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
    setTablePage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTablePage(0);
  };

  const handleTableChangePage = (event, newPage) => setTablePage(newPage);
  const handleTableChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  const handleDateClick = (day) => {
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = getEntriesForDate(day);
    setSelectedDate(dateKey);
    setSelectedDayEvents(dayEvents);
    setDayModalOpen(true);
  };

  const handleViewEntryDetails = (entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
  };

  const closeDayModal = () => {
    setDayModalOpen(false);
    setSelectedDate(null);
    setSelectedDayEvents([]);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedEntry(null);
  };

  // Verification Action
  const handleOpenVerificationDialog = () => {
    setVerificationStatus('APPROVED');
    setVerificationRemarks('');
    setVerificationDialogOpen(true);
  };

  const performVerification = async () => {
    const adminId = authservice.userid();
    if (!adminId) {
      setSnackbar({ open: true, message: "User session expired. Please login again.", severity: "error" });
      return;
    }

    const submissionId = fullMonthStatus?.fullMonthId || fullMonthStatus?.id;
    if (!submissionId) {
      setSnackbar({ open: true, message: "No submission found for this month", severity: "error" });
      return;
    }

    setVerificationLoading(true);
    try {
      const payload = {
        submissionId: submissionId,
        verifiedBy: adminId,
        verificationRemark: verificationRemarks.trim() || `Verified ${verificationStatus} for Full Month`,
        verifiedStatus: verificationStatus
      };

      const response = await tourDiaryService.saveOrUpdateVerification(payload);

      if (!response.error) {
        setSnackbar({ open: true, message: `Full Month verification ${verificationStatus} successfully`, severity: "success" });
        setVerificationDialogOpen(false);
        await fetchFullMonthStatus();
        await fetchUserTourEntries();
      } else {
        setSnackbar({ open: true, message: response.message || "Failed to process verification", severity: "error" });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setSnackbar({ open: true, message: err.message || "Failed to process verification", severity: "error" });
    } finally {
      setVerificationLoading(false);
    }
  };

  // Approval Action
  const handleOpenApprovalDialog = () => {
    setAdminStatus('APPROVED');
    setAdminRemark("");
    setApprovalModalOpen(true);
  };

  const performApproval = async () => {
    const adminId = authservice.userid();
    if (!adminId) {
      setSnackbar({ open: true, message: "Admin ID not found. Please login again.", severity: "error" });
      return;
    }

    const fullMonthId = fullMonthStatus?.fullMonthId || fullMonthStatus?.id;
    if (!fullMonthId) {
      setSnackbar({ open: true, message: "No month submission found for approval", severity: "error" });
      return;
    }

    setApprovingMonth(true);
    try {
      const response = await tourDiaryService.approveFullMonth(
        fullMonthId,
        adminId,
        adminRemark.trim() || `Full month ${adminStatus}`,
        adminStatus
      );

      const isSuccess = response && !response.error && (
        typeof response === 'string' ? response.toLowerCase().includes("success") : true
      );

      if (isSuccess) {
        setSnackbar({ open: true, message: typeof response === 'string' ? response : "Full month approval submitted successfully", severity: "success" });
        setApprovalModalOpen(false);
        await fetchFullMonthStatus();
        await fetchUserTourEntries();
      } else {
        setSnackbar({ open: true, message: response.message || "Failed to submit approval", severity: "error" });
      }
    } catch (err) {
      console.error("Error approving month:", err);
      setSnackbar({ open: true, message: err.message || "An error occurred during approval", severity: "error" });
    } finally {
      setApprovingMonth(false);
    }
  };

  // Helper Functions
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

  const isSunday = (year, month, day) => new Date(year, month - 1, day).getDay() === 0;

  const isSecondSaturday = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    if (date.getDay() !== 6) return false;
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstSaturday = firstDayOfMonth.getDay() === 6 ? 1 : (6 - firstDayOfMonth.getDay() + 1);
    return day === firstSaturday + 7;
  };

  const getPurposeName = (purposeId) => {
    if (!purposeId) return '—';
    const purpose = allPurposes.find(p => p.id === Number(purposeId));
    return purpose ? purpose.purposeName : '—';
  };

  const getStatusChip = (status, labelPrefix = '') => {
    const statusMap = {
      'APPROVED': { color: 'success', label: 'Approved' },
      'REJECTED': { color: 'error', label: 'Rejected' },
      'PENDING': { color: 'warning', label: 'Pending' },
      'SUBMIT': { color: 'info', label: 'Submitted' },
      'SUBMITTED': { color: 'info', label: 'Submitted' },
      'DRAFT': { color: 'default', label: 'Draft' }
    };

    const config = statusMap[status] || statusMap['PENDING'];
    const labelText = labelPrefix ? `${labelPrefix}: ${config.label}` : config.label;

    return (
      <Chip
        label={labelText}
        size="small"
        color={config.color}
        sx={{
          height: '22px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          '& .MuiChip-label': { px: 0.75 }
        }}
      />
    );
  };

  // ============================================================
  // RENDER TABLE VIEW
  // ============================================================
  const renderTableView = () => {
    const allEntriesWithDetails = [];

    tourEntries.forEach(entry => {
      try {
        const date = new Date(entry.createdAt);
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        const dayName = dayNames[dayOfWeek];
        const month = date.getMonth();
        const isSun = isSunday(selectedYear, selectedMonth, day);
        const is2ndSat = isSecondSaturday(selectedYear, selectedMonth, day);
        const formattedDateWithDay = `${String(day).padStart(2, '0')} ${monthNames[month].substring(0, 3)}, ${dayName}`;

        allEntriesWithDetails.push({
          ...entry,
          day,
          dayName,
          isSun,
          is2ndSat,
          formattedDateWithDay,
          purposeName: entry.purposeName || getPurposeName(entry.purposeId),
          zoneName: entry.zoneName || (entry.zoneId ? `Zone ${entry.zoneId}` : '—'),
          remark: entry.remark || '—',
          entryType: entry.entryType || 'WORKING'
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
        (entry.zoneName && entry.zoneName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.purposeName && entry.purposeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.remark && entry.remark.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      : allEntriesWithDetails;

    const paginatedEntries = filteredEntries.slice(
      tablePage * rowsPerPage,
      tablePage * rowsPerPage + rowsPerPage
    );

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
                placeholder="Search by date, zone, purpose, remark..."
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
            <Table sx={{ minWidth: 800 }} size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#04255e' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Zone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entry Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Program Change</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purpose</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cluster No</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Distance / Hours</TableCell>
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
                          <Typography variant="body2">{entry.zoneName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={entry.entryType}
                            size="small"
                            sx={{
                              bgcolor: entry.entryType === 'WORKING' ? '#27ae60' : '#e74c3c',
                              color: 'white',
                              fontWeight: 500,
                              height: '22px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {(entry.isAdvanceChanged === true || entry.isAdvanceChanged === "true") ? (
                            <Tooltip title={entry.changeReason ? `Reason: ${entry.changeReason}` : "Program Changed from Advance Tour"}>
                              <Chip
                                label="Changed"
                                color="warning"
                                size="small"
                                sx={{ fontWeight: 'bold', fontSize: '0.7rem', height: '22px' }}
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{entry.purposeName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{entry.clusterId || entry.clusterNo || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.distance ? `${entry.distance} km` : '—'}
                            {entry.distance && entry.hours ? ' / ' : ''}
                            {entry.hours ? `${entry.hours} h` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.remark}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewEntryDetails(entry);
                              }}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: '#e3f2fd' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

  // ============================================================
  // RENDER CALENDAR VIEW
  // ============================================================
  const renderCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <Grid item xs={12 / 7} key={`empty-${i}`}>
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
        <Grid item xs={12 / 7} key={day}>
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

  // ============================================================
  // MAIN RETURN
  // ============================================================
  if (!userId && !loading) {
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
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Title Header */}
            <Typography variant="h3" align="center" sx={{ mb: 3, color: theme.palette.text.primary }}>
              Actual Tour Diary Management
            </Typography>

            {/* Navigation Header */}
            <Box
              sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 2, position: 'relative', minHeight: '60px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' } }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleMonthChange(-1)}
                  sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' } }}
                >
                  Prev
                </Button>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.text.primary, fontWeight: 500,
                  position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap'
                }}
              >
                {monthNames[selectedMonth - 1]} {selectedYear}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleMonthChange(1)}
                  sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' } }}
                >
                  Next
                </Button>
              </Box>
            </Box>

            {/* User Info Header Card */}
            {userDetails && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Employee Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{userDetails.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Employee No / ID</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{userDetails.empNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Designation</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{userDetails.designation || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Office Location</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{userDetails.officelocation || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Full Month Status & Action Bar */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, borderColor: theme.palette.primary.light }}>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Full Month Status:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      {getStatusChip(fullMonthStatus?.status || 'PENDING', 'Submission')}
                      {getStatusChip(fullMonthStatus?.verifiedStatus || 'PENDING', 'Verification')}
                      {getStatusChip(fullMonthStatus?.adminStatus || 'PENDING', 'Approval')}
                      {tourEntries.some(e => e.isAdvanceChanged === true || e.isAdvanceChanged === "true") && (
                        <Chip
                          label={`${tourEntries.filter(e => e.isAdvanceChanged === true || e.isAdvanceChanged === "true").length} Program Changes`}
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                    {canVerify() && (
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<VerifiedUserIcon />}
                        onClick={handleOpenVerificationDialog}
                        disabled={!fullMonthStatus || (fullMonthStatus.status !== "SUBMIT" && fullMonthStatus.status !== "SUBMITTED")}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Verify Month
                      </Button>
                    )}
                    {canApprove() && (
                      <Button
                        variant="contained"
                        onClick={handleOpenApprovalDialog}
                        disabled={!fullMonthStatus || (fullMonthStatus.status !== "SUBMIT" && fullMonthStatus.status !== "SUBMITTED") || approvingMonth}
                        startIcon={approvingMonth ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                        sx={{
                          backgroundColor: '#8e44ad',
                          '&:hover': { backgroundColor: '#6c3483' },
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {approvingMonth ? "Approving..." : "Approve Month"}
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* View Mode Toggle Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={viewMode === 'table' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('table')}
                  size="small"
                >
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('calendar')}
                  size="small"
                >
                  Calendar View
                </Button>
              </Stack>

              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 14, height: 14, backgroundColor: theme.palette.mode === 'dark' ? '#4a2a2a' : '#ffe6e6', border: `1px solid ${theme.palette.divider}`, borderRadius: '3px' }} />
                  <Typography variant="caption">Sunday</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 14, height: 14, backgroundColor: theme.palette.mode === 'dark' ? '#4a3a2a' : '#fff4e6', border: `1px solid ${theme.palette.divider}`, borderRadius: '3px' }} />
                  <Typography variant="caption">2nd Saturday</Typography>
                </Box>
              </Box>
            </Box>

            {/* Loading & Error States */}
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="250px">
                <CircularProgress />
              </Box>
            )}

            {error && !loading && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {/* Main Content Area: Table vs Calendar */}
            {!loading && !error && (
              <>
                {viewMode === 'table' ? renderTableView() : (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={0.125}>
                      {dayNames.map(day => (
                        <Grid item xs={12 / 7} key={day}>
                          <Box
                            sx={{
                              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f0f3f7',
                              padding: '10px', textAlign: 'center', fontWeight: 600, border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{day}</Typography>
                          </Box>
                        </Grid>
                      ))}
                      {renderCalendar()}
                    </Grid>
                  </Box>
                )}
              </>
            )}

          </Box>
        </MainCard>
      </Grid>

      {/* ==================== DAY VIEW MODAL ==================== */}
      <Modal open={dayModalOpen} onClose={closeDayModal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: '90%', maxWidth: '600px', padding: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24], maxHeight: '80vh', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
              Tour Entries – {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
            <IconButton onClick={closeDayModal} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedDayEvents.length === 0 ? (
            <Alert severity="info">No tour entries recorded for this day.</Alert>
          ) : (
            <List>
              {selectedDayEvents.map((event, idx) => (
                <React.Fragment key={event.id || idx}>
                  {idx > 0 && <Divider sx={{ my: 1 }} />}
                  <ListItem button onClick={() => handleViewEntryDetails(event)} sx={{ borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{event.purposeName || getPurposeName(event.purposeId)}</Typography>
                          <Chip label={event.entryType || 'WORKING'} size="small" color={event.entryType === 'WORKING' ? 'success' : 'error'} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {event.zoneName || `Zone ${event.zoneId}`} {event.distance ? `• ${event.distance} km` : ''} {event.remark ? `• ${event.remark}` : ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" onClick={closeDayModal}>Close</Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== ENTRY DETAILS MODAL ==================== */}
      <Modal open={detailModalOpen} onClose={closeDetailModal} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: '90%', maxWidth: '500px', padding: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Tour Entry Details</Typography>
            <IconButton onClick={closeDetailModal} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {selectedEntry && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{new Date(selectedEntry.createdAt).toLocaleString('en-GB')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Entry Type</Typography>
                <Chip label={selectedEntry.entryType || 'WORKING'} size="small" color={selectedEntry.entryType === 'WORKING' ? 'success' : 'error'} sx={{ mt: 0.5 }} />
              </Grid>
              {selectedEntry.purposeName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Purpose</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.purposeName}</Typography>
                </Grid>
              )}
              {selectedEntry.zoneName && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Zone</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.zoneName}</Typography>
                </Grid>
              )}
              {(selectedEntry.clusterId || selectedEntry.clusterNo) && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cluster No</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.clusterId || selectedEntry.clusterNo}</Typography>
                </Grid>
              )}
              {selectedEntry.distance && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Distance</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.distance} km</Typography>
                </Grid>
              )}
              {selectedEntry.hours && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Hours</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedEntry.hours} h</Typography>
                </Grid>
              )}
              {selectedEntry.remark && (
                <Grid item xs={12}>
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
              {/* Advance Tour Comparison for this Date */}
              {(() => {
                const entryDate = new Date(selectedEntry.createdAt).getDate();
                const matchedAdvance = advanceEntries.filter(adv => {
                  const d = new Date(adv.createdAt || adv.actionDate);
                  return d.getDate() === entryDate;
                });
                if (matchedAdvance.length === 0) return null;
                return (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: theme.palette.mode === 'dark' ? '#1a2a3a' : '#f0f4f8', borderRadius: 1.5, border: `1px solid ${theme.palette.primary.light}` }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventIcon fontSize="small" /> Planned Advance Tour Details (For Verification Comparison)
                      </Typography>
                      {matchedAdvance.map((adv, idx) => (
                        <Box key={adv.id || idx} sx={{ mt: 0.5, p: 1, bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Type:</strong> {adv.entryType || 'WORKING'} {adv.location ? ` | Location: ${adv.location}` : ''}
                          </Typography>
                          {adv.remark && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              <strong>Planned Remarks:</strong> {adv.remark}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                );
              })()}
            </Grid>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={closeDetailModal} sx={{ backgroundColor: '#2980b9', '&:hover': { backgroundColor: '#1f6391' } }}>Close</Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== VERIFICATION MODAL ==================== */}
      <Modal open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: '90%', maxWidth: '500px', padding: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Verify Full Month Tour Diary</Typography>
            <IconButton onClick={() => setVerificationDialogOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            User: <strong>{userDetails?.name || 'N/A'}</strong> ({monthNames[selectedMonth - 1]} {selectedYear})
          </Typography>

          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Verification Decision</InputLabel>
            <Select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} label="Verification Decision">
              <MenuItem value="APPROVED">APPROVE</MenuItem>
              <MenuItem value="REJECTED">REJECT</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth label="Verification Remark (Optional)" multiline rows={3}
            value={verificationRemarks} onChange={(e) => setVerificationRemarks(e.target.value)}
            placeholder="Enter verification comments..." sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => setVerificationDialogOpen(false)} disabled={verificationLoading}>Cancel</Button>
            <Button
              variant="contained" color={verificationStatus === 'APPROVED' ? 'success' : 'error'}
              onClick={performVerification} disabled={verificationLoading}
              startIcon={verificationLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {verificationLoading ? "Submitting..." : `Confirm ${verificationStatus}`}
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== APPROVAL MODAL ==================== */}
      <Modal open={approvalModalOpen} onClose={() => setApprovalModalOpen(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ width: '90%', maxWidth: '500px', padding: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[24] }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Approve Full Month Tour Diary</Typography>
            <IconButton onClick={() => setApprovalModalOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            User: <strong>{userDetails?.name || 'N/A'}</strong> ({monthNames[selectedMonth - 1]} {selectedYear})
          </Typography>

          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Approval Decision</InputLabel>
            <Select value={adminStatus} onChange={(e) => setAdminStatus(e.target.value)} label="Approval Decision">
              <MenuItem value="APPROVED">APPROVE</MenuItem>
              <MenuItem value="REJECTED">REJECT</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth label="Admin Remark (Optional)" multiline rows={3}
            value={adminRemark} onChange={(e) => setAdminRemark(e.target.value)}
            placeholder="Enter approval comments..." sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => setApprovalModalOpen(false)} disabled={approvingMonth}>Cancel</Button>
            <Button
              variant="contained" onClick={performApproval} disabled={approvingMonth}
              sx={{ backgroundColor: adminStatus === 'APPROVED' ? '#8e44ad' : '#d32f2f', '&:hover': { backgroundColor: adminStatus === 'APPROVED' ? '#6c3483' : '#b71c1c' } }}
              startIcon={approvingMonth ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {approvingMonth ? "Submitting..." : `Confirm ${adminStatus}`}
            </Button>
          </Box>
        </Card>
      </Modal>

      {/* ==================== SNACKBAR NOTIFICATION ==================== */}
      <Snackbar
        open={snackbar.open} autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default UserTourDiaryDetail;
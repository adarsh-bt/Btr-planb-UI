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
  CardContent,
  CircularProgress
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import tourDiaryService from "pages/authentication/services/tourdiaryservice";
import Breadcrumb from "routes/Breadcrumb";
import MainCard from "components/MainCard";

const UserTourDiaryDetail = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get userId and month/year from location state
  const { userId, month: monthParam, year: yearParam } = location.state || {};
  const [selectedMonth, setSelectedMonth] = useState(monthParam || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(yearParam || new Date().getFullYear());
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tourEntries, setTourEntries] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  
  // Modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch tour entries
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
      
      if (response && Array.isArray(response)) {
        setTourEntries(response);
        
        // Set user details from first entry if available
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

  useEffect(() => {
    fetchUserTourEntries();
  }, [userId, selectedMonth, selectedYear]);

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

  // Helper functions
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
    // For normal tour diary, we might not have entryType, so return default
    return '#3498db';
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
                        <strong>Zone:</strong> {event.zoneName}
                      </Typography>
                    )}
                    {event.remark && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Remark:</strong> {event.remark}
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
              </ListItemSecondaryAction>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  // If no userId, show error
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
          <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Calendar Header with Navigation */}
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
              {/* Left section with back button */}
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

              {/* Center - Month/Year */}
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

              {/* Right section with navigation */}
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
                  Has Reports
                </Typography>
              </Box>
            </Box>

            {/* Loading State */}
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
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

            {/* Calendar */}
            {!loading && !error && (
              <>
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
        </Card>
      </Modal>

      {/* ==================== ENTRY DETAILS MODAL ==================== */}
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
              
              {selectedEntry.purposeName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Purpose</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.purposeName}
                  </Typography>
                </Grid>
              )}
              
              {selectedEntry.zoneName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Zone</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedEntry.zoneName}
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
    </Grid>
  );
};

export default UserTourDiaryDetail;
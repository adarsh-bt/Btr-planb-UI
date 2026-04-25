import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Divider
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import tourDiaryService from "pages/authentication/services/tourdiaryservice";
import Breadcrumb from "routes/Breadcrumb";

const UserAdvancedTourDiarySubmissions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);

  // Fetch submissions when component mounts or year changes
  useEffect(() => {
    if (!userId) {
      setError("No user selected");
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await tourDiaryService.getAdminSubmissionView(userId, selectedYear);
        
        if (response.error) {
          setError(response.message || "Failed to fetch submissions");
          setSubmissions([]);
        } else {
          setSubmissions(response.data || []);
          
          // Extract unique years from the data if available
          const uniqueYears = [...new Set((response.data || []).map(item => item.year))];
          if (uniqueYears.length > 0) {
            setYears(uniqueYears);
          } else {
            // Default to current year if no years in data
            setYears([selectedYear]);
          }
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId, selectedYear]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleViewDetailedDiary = (month) => {
  // Navigate to detailed calendar view for admin approval
  navigate("/approval_manage/advancedtourdiary/user-details", { 
    state: { 
      userId: userId,
      month: month,
      year: selectedYear
    } 
  });
};

  // If no userId, show error
  if (!userId) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Breadcrumb />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              No user selected. Please go back and select a user.
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Go Back
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getStatusChip = (submitted) => {
    return submitted ? (
      <Chip
        icon={<CheckCircleIcon />}
        label="Submitted"
        color="success"
        size="small"
        sx={{ fontWeight: "bold", width: "100%" }}
      />
    ) : (
      <Chip
        icon={<CancelIcon />}
        label="Not Submitted"
        color="default"
        size="small"
        sx={{ fontWeight: "bold", width: "100%" }}
      />
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Header with back button */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              size="small"
            >
              Back
            </Button>
            
            <Typography variant="h4" sx={{ color: "#04255e", fontWeight: "bold" }}>
              ATP Submissions
            </Typography>
            
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.length > 0 ? (
                  years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))
                ) : (
                  <MenuItem value={selectedYear}>{selectedYear}</MenuItem>
                )}
                {/* Add option to select other years if needed */}
                <MenuItem value={2025}>2025</MenuItem>
                <MenuItem value={2026}>2026</MenuItem>
                <MenuItem value={2024}>2024</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              <strong>User ID:</strong> {userId}
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : submissions.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tour diary submissions found for this user in {selectedYear}.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {submissions.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.month}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: "100%",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4
                      },
                      position: "relative",
                      border: item.firstHalfSubmitted && item.secondHalfSubmitted 
                        ? "2px solid #4caf50" 
                        : "none"
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: "#04255e", 
                          fontWeight: "bold",
                          borderBottom: "2px solid #04255e",
                          pb: 1,
                          mb: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        {monthNames[item.month - 1]} {item.year}
                        {item.firstHalfSubmitted && item.secondHalfSubmitted && (
                          <CheckCircleIcon color="success" fontSize="small" />
                        )}
                      </Typography>
                      
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: "bold" }}>
                            First Half (1st - 15th)
                          </Typography>
                          {getStatusChip(item.firstHalfSubmitted)}
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: "bold" }}>
                            Second Half (16th - End)
                          </Typography>
                          {getStatusChip(item.secondHalfSubmitted)}
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetailedDiary(item.month)}
                          sx={{ mt: 1 }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default UserAdvancedTourDiarySubmissions;
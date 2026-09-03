import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
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

  // 1. Retrieve and parse the Agri Year from localStorage (e.g., "2025-2026")
  const agriYear = localStorage.getItem("activeAgriYear") || "";
  const [startYear, endYear] = agriYear ? agriYear.split('-').map(Number) : [null, null];

  useEffect(() => {
    if (!userId) {
      setError("No user selected");
      setLoading(false);
      return;
    }

    if (!agriYear || !startYear || !endYear) {
      setError("Active Agricultural Year is missing or invalid in local storage.");
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch data for both calendar years spanning the agricultural year
        const [startYearResponse, endYearResponse] = await Promise.all([
          tourDiaryService.getAdminSubmissionView(userId, startYear),
          tourDiaryService.getAdminSubmissionView(userId, endYear)
        ]);

        let combinedData = [];

        if (!startYearResponse.error && startYearResponse.data) {
          // Filter for July (7) to December (12) from the start year
          const startYearMonths = startYearResponse.data.filter(
            (item) => item.month >= 7 && item.month <= 12
          );
          combinedData = [...combinedData, ...startYearMonths];
        }

        if (!endYearResponse.error && endYearResponse.data) {
          // Filter for January (1) to June (6) from the end year
          const endYearMonths = endYearResponse.data.filter(
            (item) => item.month >= 1 && item.month <= 6
          );
          combinedData = [...combinedData, ...endYearMonths];
        }

        // 2. Generate the sequential Agricultural sequence (July -> Dec, Jan -> Jun)
        // This ensures the custom sort handles chronological ordering spanning across two calendar years
        const getAgriMonthOrder = (month) => (month >= 7 ? month - 7 : month + 5);

        combinedData.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return getAgriMonthOrder(a.month) - getAgriMonthOrder(b.month);
        });

        setSubmissions(combinedData);

        // Handle error responses if both calls fail
        if (startYearResponse.error && endYearResponse.error) {
          setError(startYearResponse.message || "Failed to fetch submissions");
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId, agriYear, startYear, endYear]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewDetailedDiary = (month, targetYear) => {
    navigate("/approval_manage/advancedtourdiary/user-details", { 
      state: { 
        userId: userId,
        month: month,
        year: targetYear
      } 
    });
  };

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
      <Breadcrumb />
      <Grid item xs={12}></Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
              ATP Submissions ({agriYear})
            </Typography>
            
            <Box sx={{ minWidth: 120 }}></Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : submissions.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tour diary submissions found for this user in the agricultural year {agriYear}.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {submissions.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${item.year}-${item.month}`}>
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
                          onClick={() => handleViewDetailedDiary(item.month, item.year)}
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
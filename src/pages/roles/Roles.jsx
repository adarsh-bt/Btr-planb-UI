import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Chip,
  Avatar,
  MenuItem,
  FormControl,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MainCard from "components/MainCard";
import Breadcrumb from "routes/Breadcrumb";

// User data
const userData = {
  name: "Robin Roy",
  designation: "Taluk Static Officer",
  id: "SN5684123984",
  email: "robinsamuelroy@gmail.com",
  phone: "8848496707",
  officeType: "Taluk",
  officeLocation: "Tvm",
  dateOfJoin: "09-05-2024",
  dateOfBirth: "09-11-1995",
  schemes: ["Earas", "Price"],
  role: "Field Data Collector",
  registerDate: "06-09-2025",
  status: "Activated",
  activeDate: "13/05/2009",
  profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Default Profile Pic
};

const Roles = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedScheme, setSelectedScheme] = useState(userData.schemes[0]);
  const [selectedRole, setSelectedRole] = useState(userData.role);
  const [office, setOffice] = useState(userData.officeLocation);
  const [officeType, setOfficeType] = useState(userData.officeType);
  const [userStatus, setUserStatus] = useState("active");

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle form submission
  const handleChangeSubmit = () => {
    console.log("Changes Submitted:", {
      scheme: selectedScheme,
      role: selectedRole,
      office,
      officeType,
      status: userStatus,
    });
    alert("Changes applied successfully!");
  };

  return (
    <Grid container spacing={3}>
      {/* Breadcrumb */}
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        {/* Page Title */}
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Role Info
        </Typography>

        {/* Main Card to Hold User Details */}
        <MainCard title="">
          <Grid container spacing={4}>
            {/* Left Section - User Profile */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Paper
                elevation={3}
                sx={{
                  padding: 3,
                  textAlign: "center",
                  borderRadius: 2,
                }}
              >
                {/* Profile Picture */}
                <Avatar
                  src={userData.profilePic}
                  alt={userData.name}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: "0 auto 1rem",
                  }}
                />
                {/* User Name */}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: 0.5 }}
                >
                  {userData.name}
                </Typography>
                {/* User Designation */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ marginBottom: 1 }}
                >
                  {userData.designation}
                </Typography>
                {/* Pen Number / User ID */}
                <Typography variant="body2" color="text.primary">
                  <strong>Pen Number:</strong> {userData.id}
                </Typography>
              </Paper>
            </Grid>

            {/* Right Section - Details and Actions */}
            <Grid item xs={12} sm={8} md={9} lg={9}>
              {/* Tabs - Details and Actions */}
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Details" />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      Actions <EditIcon fontSize="small" sx={{ ml: 1 }} />
                    </Box>
                  }
                />
              </Tabs>

              {/* Details Tab Content */}
              {tabValue === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    {[
                      { label: "Email", value: userData.email },
                      { label: "Phone Number", value: userData.phone },
                      { label: "Office Type", value: userData.officeType },
                      { label: "Office Location", value: userData.officeLocation },
                      { label: "Date Of Join", value: userData.dateOfJoin },
                      { label: "Date Of Birth", value: userData.dateOfBirth },
                      {
                        label: "Schemes",
                        value: userData.schemes.join(" | "),
                      },
                      { label: "Roles", value: userData.role },
                      { label: "Register Date", value: userData.registerDate },
                      {
                        label: "Status History",
                        value: (
                          <Chip
                            label={userData.status}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: "bold", color: "#ffffff" }}
                          />
                        ),
                      },
                      { label: "Active Date", value: userData.activeDate },
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <TextField
                          label={item.label}
                          value={item.value}
                          variant="outlined"
                          fullWidth
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Actions Tab Content */}
              {tabValue === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    {/* Change Schemes */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography variant="body2">Change Schemes</Typography>
                        <Select
                          value={selectedScheme}
                          onChange={(e) => setSelectedScheme(e.target.value)}
                        >
                          <MenuItem value="Earas">Earas</MenuItem>
                          <MenuItem value="Price">Price</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Change Roles */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <Typography variant="body2">Change Roles</Typography>
                        <Select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <MenuItem value="Field Data Collector">
                            Field Data Collector
                          </MenuItem>
                          <MenuItem value="Taluk Officer">Taluk Officer</MenuItem>
                          <MenuItem value="District Admin">
                            District Admin
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Change Office */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Change Office"
                        value={office}
                        onChange={(e) => setOffice(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    {/* Change Office Type */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Change Office Type"
                        value={officeType}
                        onChange={(e) => setOfficeType(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    {/* User Activation */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        User Activation
                      </Typography>
                      <RadioGroup
                        row
                        value={userStatus}
                        onChange={(e) => setUserStatus(e.target.value)}
                      >
                        <FormControlLabel
                          value="active"
                          control={<Radio />}
                          label="Active"
                        />
                        <FormControlLabel
                          value="inactive"
                          control={<Radio />}
                          label="Inactive"
                        />
                      </RadioGroup>
                    </Grid>

                    {/* Change Button */}
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChangeSubmit}
                        sx={{ mt: 2 }}
                      >
                        Change
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default Roles;

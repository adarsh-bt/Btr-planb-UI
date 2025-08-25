import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Divider } from '@mui/material';
import ChangePassword from './ChangePassword';
import profileService from 'pages/profile/profileservice';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [value, setValue] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub;
        const response = await profileService.fetchUserById(userId);
        setUserData(response.payload);
      } catch (err) {
        console.error('Failed to fetch user details.', err);
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePasswordSubmit = (data) => {
    console.log('Password change data:', data);
    // Handle password change logic
  };

  // CustomTabPanel component embedded directly inside Profile.js
  const CustomTabPanel = ({ children, value, index, ...other }) => {
    return (
      <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="Profile Sections" variant="scrollable" scrollButtons="auto" centered>
          <Tab label="Professional Details" />
          <Tab label="Change Password" />
        </Tabs>
      </Box>

      {/* Tab 1: Professional Details */}
      <CustomTabPanel value={value} index={0}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Professional Details
          </Typography>
          {userData ? (
            <Box>
              <Typography>
                <strong>PEN Number:</strong> {userData.penNumber}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Designation:</strong> {userData.designation}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Date of Joining:</strong> {userData.dateOfJoining}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Office of Joining:</strong> {userData.officeToJoining}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Date of Birth:</strong> {userData.dateOfBirth}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Personal Email:</strong> {userData.email}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Mobile Number:</strong> {userData.mobileNumber}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary" textAlign="center">
              Loading...
            </Typography>
          )}
        </Paper>
      </CustomTabPanel>

      {/* Tab 2: Change Password */}
      <CustomTabPanel value={value} index={1}>
        <ChangePassword onSubmit={handlePasswordSubmit} />
      </CustomTabPanel>
    </Box>
  );
};

export default Profile;

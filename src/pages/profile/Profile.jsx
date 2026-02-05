import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, 
  Grid, Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert, Snackbar 
} from '@mui/material';
  import EditIcon from '@mui/icons-material/Edit';
import authservice from 'pages/authentication/services/authservice';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { jwtDecode } from 'jwt-decode';
import Breadcrumb from 'routes/Breadcrumb';
import ChangePassword from './ChangePassword';
import profileService from 'pages/profile/profileservice';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Reusable InfoRow Component
const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    py: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': { borderBottom: 'none' }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
      <Box sx={{ 
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center'
      }}>
        {icon}
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', minWidth: 140 }}>
        {label}
      </Typography>
    </Box>
    <Typography 
      variant="body1" 
      sx={{ 
        fontWeight: 500, 
        color: 'text.secondary',
        textAlign: 'right',
        flex: 1
      }}
    >
      {value || 'Not provided'}
    </Typography>
  </Box>
);

// Reusable StatBox Component
const StatBox = ({ label, value, color, icon }) => (
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      borderRadius: 2,
      backgroundColor: `${color}15`,
      border: `1px solid ${color}30`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px ${color}20`
      }
    }}
  >
    <Box sx={{ 
      color: color,
      fontSize: 32,
      mb: 1
    }}>
      {icon}
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, color: color, mb: 0.5 }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
      {label}
    </Typography>
  </Paper>
);

// CustomTabPanel component
const CustomTabPanel = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const EditProfileModal = ({ open, onClose, formData, setFormData, onSubmit }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit Profile
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <TextField
          fullWidth
          label="Personal Email"
          margin="normal"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <TextField
          fullWidth
          label="Mobile Number"
          margin="normal"
          value={formData.mobileNumber}
          onChange={(e) =>
            setFormData({ ...formData, mobileNumber: e.target.value })
          }
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reusable Alert Modal Component
const AlertModal = ({ open, onClose, title, message, severity = "success" }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose}
        severity={severity}
        sx={{ 
          width: '100%',
          fontWeight: 600,
          '& .MuiAlert-icon': {
            fontSize: 28
          }
        }}
        icon={
          severity === 'success' ? (
            <CheckCircleOutlineIcon fontSize="inherit" />
          ) : (
            <ErrorOutlineIcon fontSize="inherit" />
          )
        }
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {message && (
          <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
            {message}
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
};

const Profile = () => {
  const [value, setValue] = useState(0);
  const [userData, setUserData] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  // Add these new state variables
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    severity: 'success',
    title: '',
    message: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobileNumber: ''
  });


useEffect(() => {
  if (userData && editOpen) {
    setEditForm({
      name: userData.name || '',
      email: userData.email || '',
      mobileNumber: userData.mobileNumber || ''
    });
  }
}, [editOpen, userData]);


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

  const handleProfileUpdate = async () => {
  try {
    const userId = authservice.userid();
    if (!userId) {
      throw new Error('Session expired. Please login again.');
    }

    const payload = {
      userId: userId,
      name: editForm.name,
      email: editForm.email,
      mobileNumber: editForm.mobileNumber
    };

    // Show loading in modal/UI
    // (Add loading state if needed: const [updating, setUpdating] = useState(false);)

    const response = await profileService.updateProfile(payload);

    if (!response.success) {
      throw new Error(response.message || 'Update failed');
    }

    // CRITICAL: Refetch fresh data instead of optimistic update
    const refreshedResponse = await profileService.fetchUserById(userId);
    setUserData(refreshedResponse.payload);  // Use real server data

    setEditOpen(false);
    // Show success modal instead of alert
      setAlertConfig({
        severity: 'success',
        title: 'Profile Updated!',
        message: response.message || 'Your profile has been successfully updated.'
      });
      setAlertOpen(true);

    } catch (err) {
      console.error('Profile update error:', err);
      
      // Rollback form to original if needed
      if (userData && editOpen) {
        setEditForm({
          name: userData.name || '',
          email: userData.email || '',
          mobileNumber: userData.mobileNumber || ''
        });
      }
      
      // Show error modal instead of alert
      setAlertConfig({
        severity: 'error',
        title: 'Update Failed',
        message: err.message || 'Profile update failed. Email may already exist.'
      });
      setAlertOpen(true);
    }
  };

  // Alert close handler
  const handleAlertClose = () => {
    setAlertOpen(false);
  };




  return (
    
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        {/* Header Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          }
        }}>
          <AccountCircleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 1 }}>
            User Profile
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
            Manage your professional information and security settings
          </Typography>
        </Box>

        {/* Tabs Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            mb: 3
          }}
        >
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)'
          }}>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="Profile Sections" 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 2,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: '#667eea',
                    fontWeight: 700,
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#667eea',
                  height: 3,
                  borderRadius: '2px 2px 0 0'
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon sx={{ fontSize: 20 }} />
                    Professional Details
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon sx={{ fontSize: 20 }} />
                    Change Password
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* Tab 1: Professional Details */}
          <CustomTabPanel value={value} index={0}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'primary.light'
              }}>
                <BadgeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                    Professional Details
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your employment information and personal details
                  </Typography>
                </Box>
              </Box>

              {userData ? (
                <Grid container spacing={3}>
                  {/* Personal Information Section */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                        border: '1px solid',
                        borderColor: 'primary.100',
                        height: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <PersonIcon sx={{ fontSize: 20 }} />
                          Personal Information
                        </Typography>

                        {/* Improved Edit Profile Button */}
  <Button
    variant="contained"
    size="small"
    startIcon={<EditIcon />} // Add this import at top
    onClick={() => setEditOpen(true)}
    sx={{
      borderRadius: 2,
      py: 0.75,
      px: 2,
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: 'none',
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      '&:hover': {
        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
        transform: 'translateY(-1px)',
      },
      color: 'white',
      height: 36,
    }}
  >
    Edit Profile
  </Button>
                      </Box>

                      
                      <Box sx={{ space: 2 }}>
                        <InfoRow label="Full Name" value={userData.name} icon={<PersonOutlineIcon />} />
                       <InfoRow label="Date of Birth"
                              value={
                                userData.dateOfBirth
                                  ? new Date(userData.dateOfBirth).toLocaleDateString()
                                  : 'N/A'}
                              icon={<CakeIcon />}/>
                        <InfoRow label="Personal Email" value={userData.email} icon={<EmailIcon />} />
                        <InfoRow label="Mobile Number" value={userData.mobileNumber} icon={<PhoneIcon />} />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Professional Information Section */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                        border: '1px solid',
                        borderColor: 'success.100',
                        height: '100%'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'success.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon sx={{ fontSize: 20 }} />
                        Professional Information
                      </Typography>
                      
                      <Box sx={{ space: 2 }}>
                        <InfoRow label="Employee Number" value={userData.penNumber} icon={<BadgeOutlinedIcon />} />
                        <InfoRow label="Designation" value={userData.designation} icon={<WorkOutlineIcon />} />
                       <InfoRow label="Date of Joining" value={
                                  userData.dateOfJoining
                                    ? new Date(userData.dateOfJoining).toLocaleDateString()
                                    : 'N/A'
                                }
                                icon={<EventAvailableIcon />}
                              />
                        <InfoRow label="Office Location" value={userData.officelocation} icon={<LocationOnIcon />} />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Quick Stats */}
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%)',
                        border: '1px solid',
                        borderColor: 'warning.100'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon sx={{ fontSize: 20 }} />
                        Profile Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <StatBox 
                            label="Profile Completion" 
                            value="100%" 
                            color="#4caf50"
                            icon={<VerifiedIcon />}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <StatBox 
                            label="Account Status" 
                            value="Active" 
                            color="#2196f3"
                            icon={<CheckCircleIcon />}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <StatBox 
                            label="Last Updated" 
                            value={new Date().toLocaleDateString()} 
                            color="#ff9800"
                            icon={<UpdateIcon />}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <StatBox 
                            label="Member Since" 
                            value={new Date(userData.dateOfJoining).toLocaleDateString()} 
                            color="#9c27b0"
                            icon={<CalendarTodayIcon />}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={50} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Loading your profile information...
                  </Typography>
                </Box>
              )}
            </Paper>
          </CustomTabPanel>

          {/* Tab 2: Change Password */}
          <CustomTabPanel value={value} index={1}>
            <ChangePassword onSubmit={handlePasswordSubmit} />
          </CustomTabPanel>
        </Paper>
      </Grid>
      <AlertModal
        open={alertOpen}
        onClose={handleAlertClose}
        title={alertConfig.title}
        message={alertConfig.message}
        severity={alertConfig.severity}
      />
      <EditProfileModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      formData={editForm}
      setFormData={setEditForm}
      onSubmit={handleProfileUpdate}
    />
    </Grid>

    

  );
  

};

export default Profile;
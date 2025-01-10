import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Tabs, Tab, Typography, TextField, Button, Paper, Divider, Modal, LinearProgress, IconButton, InputAdornment } from '@mui/material';
import { strengthIndicator, strengthColor } from 'utils/password-strength';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Profile = () => {
  const [value, setValue] = useState(0);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState({ label: '', color: '' });
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = () => {
    setOtpModalOpen(true);
  };

  const handleOtpClose = () => {
    setOtpModalOpen(false);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsTypingPassword(true);
    const strengthValue = strengthIndicator(newPassword);
    setStrength(strengthValue);
    const { label, color } = strengthColor(strengthValue);
    setStrengthLabel({ label, color });
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordVisibilityToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isSubmitDisabled = !(password && confirmPassword && oldPassword) || password !== confirmPassword;

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', mt: 4 }}>
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Profile Sections"
          variant="scrollable"
          scrollButtons="auto"
          centered
        >
          <Tab label="Personal Details" {...a11yProps(0)} />
          <Tab label="Professional Details" {...a11yProps(1)} />
          <Tab label="Edit Profile" {...a11yProps(2)} />
          <Tab label="Change Password" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Personal Details */}
      <CustomTabPanel value={value} index={0}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Personal Details
          </Typography>
          <Box>
            <Typography><strong>Gender</strong></Typography>
            <Typography>Male</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Date Of Birth</strong></Typography>
            <Typography>15/05/1996</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Personal Email</strong></Typography>
            <Typography>robin.roy@duk.ac.in</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Contact Number</strong></Typography>
            <Typography>9778396357</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Blood Group</strong></Typography>
            <Typography>O+</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Address</strong></Typography>
            <Typography>123 Street, City, State, ZIP</Typography>
          </Box>
        </Paper>
      </CustomTabPanel>

      {/* Professional Details */}
      <CustomTabPanel value={value} index={1}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Professional Details
          </Typography>
          <Box>
            <Typography><strong>Employee Code</strong></Typography>
            <Typography>EMP12345</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>UAN Number</strong></Typography>
            <Typography>123456789012</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Member ID</strong></Typography>
            <Typography>MEM123456</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Official Email ID</strong></Typography>
            <Typography>official@example.com</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Employment Type</strong></Typography>
            <Typography>Full-Time</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Staff Type</strong></Typography>
            <Typography>Permanent</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Department</strong></Typography>
            <Typography>IT</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Designation</strong></Typography>
            <Typography>Software Engineer</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Reporting Officer</strong></Typography>
            <Typography>John Doe</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Date of Joining</strong></Typography>
            <Typography>01/01/2020</Typography>
          </Box>
        </Paper>
      </CustomTabPanel>

      {/* Edit Profile */}
      <CustomTabPanel value={value} index={2}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Edit Profile
          </Typography>
          <form>
            <TextField fullWidth margin="normal" label="About Me" multiline rows={3} placeholder="Tell us about yourself" />
            <TextField fullWidth margin="normal" label="Personal Email ID" defaultValue="example@example.com" />
            <TextField fullWidth margin="normal" label="Contact Number" defaultValue="1234567890" />
            <TextField fullWidth margin="normal" label="Blood Group" defaultValue="B+" />
            <TextField fullWidth margin="normal" label="Address" multiline rows={3} defaultValue="123 Street, City, State, ZIP" />
            <TextField fullWidth margin="normal" label="Room Number" defaultValue="101" />
            <TextField fullWidth margin="normal" label="Telephone Extension" defaultValue="1234" />
            <Button variant="contained" color="primary" sx={{ mt: 3 }} fullWidth>
              Save Changes
            </Button>
          </form>
        </Paper>
      </CustomTabPanel>

      {/* Change Password */}
      <CustomTabPanel value={value} index={3}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Change Password
          </Typography>
          <form>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TextField
                margin="normal"
                type="password"
                label="Old Password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                sx={{ width: { xs: '100%', sm: 350 }, mb: 2 }}
              />
              <TextField
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                value={password}
                onChange={handlePasswordChange}
                sx={{ width: { xs: '100%', sm: 350 }, mb: 2 }}
                helperText={strengthLabel.label}
                FormHelperTextProps={{
                  sx: { color: strengthLabel.color },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePasswordVisibilityToggle}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {isTypingPassword && (  // Show progress bar only when typing
                <LinearProgress
                  variant="determinate"
                  value={(strength / 5) * 100}
                  sx={{
                    width: { xs: '50%', sm: 300 },
                    mb: 2,
                    height: 5,
                    borderRadius: 2,
                    backgroundColor: 'gray',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: strengthLabel.color,
                    },
                  }}
                />
              )}
              <TextField
                margin="normal"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                sx={{ width: { xs: '100%', sm: 350 }, mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleConfirmPasswordVisibilityToggle}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 3, width: { xs: '100%', sm: 200 } }}
                disabled={isSubmitDisabled}
              >
                Submit
              </Button>
            </Box>
          </form>
        </Paper>
      </CustomTabPanel>

      {/* OTP Modal */}
      <Modal
        open={otpModalOpen}
        onClose={handleOtpClose}
        aria-labelledby="otp-modal-title"
        aria-describedby="otp-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" id="otp-modal-title" sx={{ mb: 2 }}>
            Enter OTP
          </Typography>
          <TextField fullWidth margin="normal" label="OTP" />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleOtpClose}
            fullWidth
          >
            Verify
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;

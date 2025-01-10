import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Stack, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { strengthIndicator, strengthColor } from 'utils/password-strength'; // Ensure these functions are exported correctly

const ForgotPassword = ({ onBack }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle change for new password input field
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    // Calculate password strength
    const strength = strengthIndicator(password);
    setPasswordStrength(strength);
  };

  // Handle change for confirm password input field
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Handle password reset submission
  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      console.log('Password reset:', newPassword);
      // Handle password reset logic
    } else {
      alert('Passwords do not match!');
    }
  };

  // Determine if the reset button should be enabled
  const isResetButtonEnabled = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4, textAlign: 'center' }}>
        Reset Password
      </Typography>

      <Stack spacing={2} alignItems="center">
        {/* New Password Field */}
        <TextField
          fullWidth
          variant="outlined"
          label="New Password"
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={handleNewPasswordChange}
          sx={{
            borderRadius: '10px',
            mb: 2
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Show Password Strength Text */}
        {newPassword.length > 0 && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Typography variant="body2" sx={{ color: strengthColor(passwordStrength).color, mt: 1, textAlign: 'center' }}>
              {strengthColor(passwordStrength).label}
            </Typography>
          </Box>
        )}

        {/* Confirm Password Field */}
        <TextField
          fullWidth
          variant="outlined"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          sx={{
            borderRadius: '10px',
            mb: 2
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Reset Password Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '20px',
            maxWidth: '200px',
            mx: 'auto'
          }}
          onClick={handlePasswordResetSubmit}
          disabled={!isResetButtonEnabled}
        >
          Reset Password
        </Button>

        {/* Back to Sign In Button */}
        <Button fullWidth variant="text" color="primary" sx={{ mt: 2 }} onClick={onBack}>
          Back to Sign In
        </Button>
      </Stack>
    </Box>
  );
};

export default ForgotPassword;

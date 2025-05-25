import React, { useState } from 'react';

import { TextField, Button, Typography, Box, Grid, Stack, Alert, CircularProgress, InputAdornment } from '@mui/material';
import authservice from '../services/authservice';
import LockIcon from '@mui/icons-material/Lock';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Email validation function

const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// Password validation function
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (password.length > 16) errors.push('no more than 16 characters');
  if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('a number');
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) errors.push('a special character');
  if (/\s/.test(password)) errors.push('no spaces');
  return errors;
}

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Password Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array to hold each OTP digit
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Central dynamic heading based on the step
  const getHeading = () => {
    switch (step) {
      case 1:
        return 'Find Your Account'; // Email entry step
      case 2:
        return 'Verify OTP'; // OTP verification step
      case 3:
        return 'Reset Password'; // Password reset step
      default:
        return '';
    }
  };

  // Email submit handler with validation
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
   const trimmedEmail = email.trim();
  
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    
    const userData = await authservice.email_verification(trimmedEmail);
    setIsLoading(false);
    if (userData.status === 200) {
      setEmail(userData.data.payload.id);
      setError('');
      setStep(2);
    } else {
      setError(userData.message);
    }
  };

  const handleOtpChange = (index) => async (e) => {
    const value = e.target.value;

    // Allow only digits and ensure the input length is 1
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Trigger OTP verification when OTP input changes

      // Automatically focus on the next input field if the current field is filled
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const isOtpValid = otp.every((digit) => /^\d$/.test(digit));
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const otpValue = otp.join(''); // Join the OTP digits together
      if (otpValue.length === otp.length) {
        const response = await authservice.verify_otp(email, otpValue);
        if (response.statusCode === 200) {
          setError('');
          setStep(3); // Proceed to next step if OTP is correct
        } else {
          setError(response.message); // Show error message if OTP is invalid
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('An error occurred while verifying OTP.');
    }

    console.log('OTP submitted:', otp.join(''));
    // setStep(3); // Move to the next step for entering new password
  };

  // Password reset handler with validation
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length > 0) {
      setError('Password must contain ' + validationErrors.join(', ') + '.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
 
    const trimmedPassword = newPassword.trim();
    const response = await authservice.password_reset(email, trimmedPassword);
    if (response.status === 200) {
      setSuccess('Password Successfully changed');
      setError('');
    } else {
      setError(response.message);
      setSuccess('');
    }
  };

  // Prevent spaces and max length in password fields
  const handlePasswordChange = (setter) => (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) setter(value);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
      {' '}
      {/* Centering the box */}
      {/* Dynamic Main Heading */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4, textAlign: 'center' }}>
        {getHeading()}
      </Typography>
      <Stack spacing={2} alignItems="center">
        {step === 1 && (
          <>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
              Enter your registered email address to receive a One-Time Password (OTP).
            </Typography>
            {error && (
              <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
                <center>
                  <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content' }}>
                    {error}
                  </Alert>
                </center>
              </Stack>
            )}

            <TextField
              fullWidth
              variant="outlined"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              sx={{
                borderRadius: '10px',
                mb: 2 // Add margin bottom for spacing
              }}
              error={!!error}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                borderRadius: '20px',
                maxWidth: '200px',
                mx: 'auto'
              }} // Center the button with controlled width
              onClick={handleEmailSubmit}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>

            <Typography variant="body2">
              <a href="/" style={{ textDecoration: 'none' }}>
                Back to Login
              </a>
            </Typography>
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
              Enter the OTP sent to your email.
            </Typography>
            {error && (
              <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
                <center>
                  <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content' }}>
                    {error}
                  </Alert>
                </center>
              </Stack>
            )}
            <Grid container spacing={1} justifyContent="center">
              {otp.map((digit, index) => (
                <Grid item key={index}>
                  <TextField
                    variant="outlined"
                    id={`otp-${index}`}
                    value={digit}
                    onChange={handleOtpChange(index)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', width: '20px' }
                    }}
                    sx={{
                      borderRadius: '20px',
                      mb: 2 // Add margin bottom for spacing
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                borderRadius: '20px',
                maxWidth: '200px',
                mx: 'auto' // Center the button with controlled width
              }}
              onClick={handleOtpSubmit}
              disabled={!isOtpValid} // Disable button if OTP is invalid
            >
              Verify OTP
            </Button>
            <Typography variant="body2">
              <a href="/" style={{ textDecoration: 'none' }}>
                Back to Login
              </a>
            </Typography>
          </>
        )}

        {step === 3 && (
          <>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
              Enter your new password.
            </Typography>

            {/* Display error message if passwords don't match */}
            {error && (
              <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
                <center>
                  <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content' }}>
                    {error}
                  </Alert>
                </center>
              </Stack>
            )}
            {success && (
              <Stack sx={{ width: '100%' }} spacing={2}>
                <center>
                  {/* icon={<CheckIcon fontSize="inherit" />} */}
                  <Alert severity="success" sx={{ textAlign: 'center', width: 'max-content' }}>
                    {success}
                  </Alert>
                </center>
              </Stack>
            )}
            <TextField
              fullWidth
              variant="outlined"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                if (e.target.value.length <= 16) {
                  setNewPassword(e.target.value);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)} // Toggle visibility
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <VisibilityOff sx={{ fontSize: '18px' }} /> // Smaller icon size
                      ) : (
                        <Visibility sx={{ fontSize: '18px' }} /> // Smaller icon size
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                borderRadius: '20px',
                mb: 2 // Add margin bottom for spacing
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                if (e.target.value.length <= 16) {
                  setConfirmPassword(e.target.value);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{
                borderRadius: '20px',
                mb: 2 // Add margin bottom for spacing
              }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                borderRadius: '20px',
                maxWidth: '200px',
                mx: 'auto'
              }} // Center the button with controlled width
              onClick={handlePasswordResetSubmit}
            >
              Reset Password
            </Button>

            <Button fullWidth variant="text" color="primary" sx={{ mt: 2 }} onClick={onBack}>
              Back to Sign In
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ForgotPassword;

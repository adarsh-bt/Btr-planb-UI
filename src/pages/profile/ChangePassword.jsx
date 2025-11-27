import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid, Stack, Alert, Paper, IconButton, InputAdornment } from '@mui/material';
import profileService from 'pages/profile/profileservice';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';

import { jwtDecode } from 'jwt-decode';

const ChangePassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});


  // Step 1: Email Verification
 const handleEmailSubmit = async (e) => {
  e.preventDefault();

  if (!email) {
    setError('Please enter your email address.');
    return;
  }

  setLoading(true); // start loading

  try {
    const response = await profileService.emailVerification(email);
    if (response.status === 200) {
      setError('');
      setStep(2);
    } else {
      setError(response.message);
    }
  } catch (error) {
    setError('Failed to send OTP.');
  } finally {
    setLoading(false); // stop loading regardless of result
  }
};


  // Step 2: Handle OTP Submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Enter a valid 6-digit OTP.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.sub;

      const response = await profileService.verifyOtp(userId, otpValue);
      if (response.statusCode === 200) {
        setSuccess('OTP Verified');
        setError('');
        setStep(3);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Error verifying OTP.');
    }
  };

  //has done validation for OP,NP,CP (ie)it gets accept only all 3 feilds are filled.
  // Step 3: Password Reset
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.sub; // Extract userId from the decoded token

      // Create the password change request payload
      console.log('userId :', oldPassword);
      const passwordCheckRequest = {
        userId: userId,
        currentPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };

      const response = await profileService.changePassword(passwordCheckRequest); // Calling the backend service
      console.log('Backend response:', response); // Log the full response

      // Handling the response from the backend
      if (response.status === 200) {
        setSuccess('Password changed successfully!');
        setStep(4); // Proceed to the next step, if applicable
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error details:', error); // Log the error details
      setError('Error updating password.');
    }
  };

const validatePasswords = () => {
  let isValid = true;
  const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" };

  if (!oldPassword) {
    newErrors.oldPassword = "Old password is required";
    isValid = false;
  }

  if (!newPassword) {
    newErrors.newPassword = "New password is required";
    isValid = false;
  }

  if (!confirmPassword) {
    newErrors.confirmPassword = "Confirm password is required";
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        {step === 1 ? 'Verify Email' : step === 2 ? 'Enter OTP' : 'Change Password'}
      </Typography>

      <Stack spacing={2} alignItems="center">
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Step 1: Email Verification */}
      {step === 1 && (
              <>
              <TextField
              variant="outlined"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              sx={{ width: '400px' }}
              disabled={loading}
              inputProps={{maxLength:250}}
            />


    {loading ? (
      <CircularProgress size={24} sx={{ mt: 2 }} />
    ) : (
      <Button variant="contained" color="primary" onClick={handleEmailSubmit}>
        Send OTP
      </Button>
    )}
  </>
)}


        {/* Step 2: OTP Verification */}
        {step === 2 && (
  <>
    <Typography variant="body2">Enter the OTP sent to your email.</Typography>
    <Grid container spacing={1} justifyContent="center">
      {otp.map((digit, index) => (
        <Grid item key={index}>
          <TextField
            variant="outlined"
            value={digit}
            onChange={(e) => {
              const newOtp = [...otp];
              newOtp[index] = e.target.value.slice(-1); // Accept only one digit
              setOtp(newOtp);

              // Move to the next input if the current one is filled
              if (e.target.value && index < otp.length - 1) {
                document.getElementById(`otp-${index + 1}`)?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !otp[index] && index > 0) {
                document.getElementById(`otp-${index - 1}`)?.focus();
              }
            }}
            inputProps={{
              maxLength: 1,
              style: { textAlign: 'center', width: '20px', fontSize: '15px' },
            }}
            id={`otp-${index}`}
          />
        </Grid>
      ))}
    </Grid>
    <Button variant="contained" color="primary" onClick={handleOtpSubmit}>
      Verify OTP
    </Button>
  </>
)}


        {/* Step 3: Change Password */}
        {step === 3 && (
          <>
            <TextField
              fullWidth
              variant="outlined"
              type="password"
              label="Old Password"
              value={oldPassword}
              onChange={(e) =>{ setOldPassword(e.target.value); setError("")}}
              inputProps={{maxLength:16}}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword}
            />
            <TextField
              fullWidth
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              label="New Password"
              value={newPassword}
              onChange={(e) => {setNewPassword(e.target.value);setError("");}}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              inputProps={{minLength: 8, maxLength: 16}}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />
            <TextField
              fullWidth
              variant="outlined"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {setConfirmPassword(e.target.value);setError("");}}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              inputProps={{minLength: 8, maxLength: 16}}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}

            />
            <Button variant="contained" color="primary" onClick={handlePasswordResetSubmit}>
              Change Password
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default ChangePassword;

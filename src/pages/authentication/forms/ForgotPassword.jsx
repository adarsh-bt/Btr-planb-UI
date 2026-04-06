import React, { useState } from 'react';

import { TextField, Button, Typography, Box, Grid, Stack, Alert, CircularProgress, InputAdornment } from '@mui/material';
import authservice from '../services/authservice';
import LockIcon from '@mui/icons-material/Lock';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Email validation function

const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// Password validation function - MODIFIED to return an object of booleans
function validatePassword(password) {
    const errors = {
        length: password.length < 8 || password.length > 16,
        uppercase: !/[A-Z]/.test(password),
        lowercase: !/[a-z]/.test(password),
        number: !/[0-9]/.test(password),
        specialChar: !/[!@#$%^&*(),.?\":{}|<>]/.test(password),
        noSpaces: /\s/.test(password),
    };
    return errors;
}

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Password Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array to hold each OTP digit
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [globalError, setGlobalError] = useState(''); // For general errors like email not found, OTP invalid
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
  setGlobalError('');
  setSuccess('');

  const input = email.trim();

  if (!input) {
    setGlobalError('Please enter your email');
    return;
  }

  // ✅ If only digits → validate phone
  if (/^\d+$/.test(input)) {
    if (input.length !== 10) {
      setGlobalError('Phone number must be exactly 10 digits.');
      return;
    }
  } 
  // ✅ Otherwise validate email
  else {
    if (!isValidEmail(input)) {
      setGlobalError('Please enter a valid email address.');
      return;
    }
  }

  setIsLoading(true);

  try {
    const userData = await authservice.email_verification(input);
   

    setIsLoading(false);

    if (userData && userData.payload.id) {
      setEmail(userData.payload.id); 
      setGlobalError('');
      setStep(2);
    } else {
      setGlobalError(userData?.message || 'Something went wrong');
    }
  } catch (error) {
    setIsLoading(false);
    setGlobalError('Server error. Please try again.');
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
    setGlobalError('');
    setSuccess('');
    

    try {
      const otpValue = otp.join(''); // Join the OTP digits together
      if (otpValue.length === otp.length) {
        const userLogin = {
          userid: email,
          otp: otpValue
        };
        const response = await authservice.verify_otp(userLogin);
        if (response.statusCode === 200) {
          setGlobalError('');
          setStep(3); // Proceed to next step if OTP is correct
        } else {
          setGlobalError(response.message); // Show error message if OTP is invalid
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setGlobalError('An error occurred while verifying OTP.');
    }

    
    // setStep(3); // Move to the next step for entering new password
  };

  // Password reset handler with validation
    const handlePasswordResetSubmit = async (e) => {
        e.preventDefault();
        setGlobalError('');
        setSuccess('');
        setPasswordError(''); // Clear previous password errors

        const validationResults = validatePassword(newPassword);

        // Prioritize and set the first encountered password error
        if (validationResults.length) {
            setPasswordError('Password must be between 8 and 16 characters.');
            return;
        }
        if (validationResults.uppercase) {
            setPasswordError('Password must contain an uppercase letter.');
            return;
        }
        if (validationResults.lowercase) {
            setPasswordError('Password must contain a lowercase letter.');
            return;
        }
        if (validationResults.number) {
            setPasswordError('Password must contain a number.');
            return;
        }
        if (validationResults.specialChar) {
            setPasswordError('Password must contain a special character.');
            return;
        }
        if (validationResults.noSpaces) {
            setPasswordError('Password must not contain spaces.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

    const trimmedPassword = newPassword.trim();
    const userLogin = {
      userid: email,
      password: trimmedPassword
    };
    const response = await authservice.password_reset(userLogin);
    if (response.status === 200) {
      setSuccess('Password Successfully changed');
      setGlobalError('');
    } else {
      setGlobalError(response.message);
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
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4, textAlign: 'center' , fontSize: '2rem'}}>
        {getHeading()}
      </Typography>
      <Stack spacing={2} alignItems="center">
        {step === 1 && (
          <>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', fontSize: '0.9rem' }}>
              Enter your registered Email or Mobile Number to receive a One-Time Password (OTP).
            </Typography>
            {globalError && (
              <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
                <center>
                  <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content' }}>
                    {globalError}
                  </Alert>
                </center>
              </Stack>
            )}

            <TextField
              fullWidth
              variant="outlined"
              label="Email or Mobile Number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              sx={{
                borderRadius: '10px',
                mb: 2 // Add margin bottom for spacing
              }}
              error={!!globalError}
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

            <Typography variant="body2"  sx={{ fontSize: '0.9rem' }}>
              <a href="/" style={{ textDecoration: 'none' }}>
                Back to Login
              </a>
            </Typography>
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', fontSize: '1rem'  }}>
              Enter the OTP sent to your email.
            </Typography>
            {globalError && (
              <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
                <center>
                  <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content', fontSize: '0.9rem' }}>
                    {globalError}
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
                      style: { textAlign: 'center', width: '20px', fontSize: '1.2rem'  }
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
                mx: 'auto',
                fontSize: '1rem'
              }}
              onClick={handleOtpSubmit}
              disabled={!isOtpValid} // Disable button if OTP is invalid
            >
              Verify OTP
            </Button>
            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
              <a href="/" style={{ textDecoration: 'none' }}>
                Back to Login
              </a>
            </Typography>
          </>
        )}

        {step === 3 && (
  <>
    <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', fontSize: '1rem' }}>
      Enter your new password.
    </Typography>

    {/* Display error message if passwords don't match */}
    {passwordError && (
      <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
        <center>
          <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content', fontSize: '0.9rem' }}>
            {passwordError}
          </Alert>
        </center>
      </Stack>
    )}

    {/* Display general errors and success message */}
    {globalError && !passwordError && (
      <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
        <center>
          <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content', fontSize: '0.9rem' }}>
            {globalError}
          </Alert>
        </center>
      </Stack>
    )}

    {success && (
      <Stack sx={{ width: '100%' }} spacing={2}>
        <center>
          <Alert severity="success" sx={{ textAlign: 'center', width: 'max-content', fontSize: '0.9rem' }}>
            {success}
          </Alert>
        </center>
      </Stack>
    )}

    {/* Conditionally render password fields and reset button only when success is empty/false */}
    {!success && (
      <>
        <TextField
          fullWidth
          variant="outlined"
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => {
            handlePasswordChange(setNewPassword)(e);
            setPasswordError('');
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: '1.2rem' }} />
                  ) : (
                    <Visibility sx={{ fontSize: '1.2rem' }} />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            borderRadius: '20px',
            mb: 2,
            '& .MuiInputBase-input': { fontSize: '1rem' },
            '& .MuiInputLabel-root': { fontSize: '1rem' }
          }}
        />

        <TextField
          fullWidth
          variant="outlined"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => {
            handlePasswordChange(setConfirmPassword)(e);
            setPasswordError('');
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ fontSize: '1.2rem' }} />
              </InputAdornment>
            )
          }}
          sx={{
            borderRadius: '20px',
            mb: 2,
            '& .MuiInputBase-input': { fontSize: '1rem' },
            '& .MuiInputLabel-root': { fontSize: '1rem' }
          }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '20px',
            maxWidth: '200px',
            mx: 'auto',
            fontSize: '1rem'
          }}
          onClick={handlePasswordResetSubmit}
        >
          Reset Password
        </Button>
      </>
    )}

    {/* Back to Sign In button - always visible for navigation */}
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

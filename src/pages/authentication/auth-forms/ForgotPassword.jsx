import React, { useState } from 'react';

import { TextField, Button, Typography, Box, Grid, Stack, Alert,CircularProgress } from '@mui/material';
import authservice from "../authservice";


const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Password Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array to hold each OTP digit
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
    } else {
      setIsLoading(true); // Set loading to true when the process starts
      const userData = await authservice.email_verification(email);
      setIsLoading(false); // Reset loading state once the process finishes

      if (userData.status == 200) {
        setEmail(userData.data.payload.id);
        setError('');
        setStep(2); // Move to the OTP step
      } else {
        setError(userData.message);
      }
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
  
  const isOtpValid = otp.every(digit => /^\d$/.test(digit));
  const handleOtpSubmit =  async (e) => {
    e.preventDefault();

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
      console.error("Error verifying OTP:", error);
      setError("An error occurred while verifying OTP.");
    }

    console.log('OTP submitted:', otp.join(''));
    // setStep(3); // Move to the next step for entering new password
  };

 

// password re-enter section
const handlePasswordResetSubmit = async (e) => {
  e.preventDefault();
  
  if (newPassword !== confirmPassword) {
    setError('Passwords do not match');
  } else {
    setError('');
  
    const response = await authservice.password_reset(email, newPassword);
    if (response.status === 200) {
      setSuccess("Password Successfully changed") // Proceed to next step if OTP is correct
    } else {
      setError(response.message); // Show error message if OTP is invalid
    }
  }
};

// const onBack = () => {
//   // Logic for going back to sign-in page
// };

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}> {/* Centering the box */}
      
      {/* Dynamic Main Heading */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4, textAlign: 'center' }}>
        {getHeading()}
      </Typography>

      <Stack spacing={2} alignItems="center">
        {step === 1 && (
          <>
            <Typography variant="body2" sx={{ color:'#666', textAlign:'center' }}>
              Enter your registered email address to receive a One-Time Password (OTP).
            </Typography>
            {error &&  <Stack sx={{ width: '100%',background:'#fff1f0' }} spacing={2}>
     <center>
      <Alert severity="error"  sx={{ textAlign: 'center',width:'max-content' }}>{error}</Alert></center>
    </Stack>}

            <TextField
              fullWidth
              variant="outlined"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              sx={{
                borderRadius:'10px', 
                mb :2 // Add margin bottom for spacing 
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ 
                borderRadius:'20px', 
                maxWidth:'200px', 
                mx:'auto' 
              }} // Center the button with controlled width 
              onClick={handleEmailSubmit}
              disabled={isLoading}
            >
               {isLoading ? (
    <CircularProgress size={24} />
  ) : (
    'Send OTP'
  )}
            </Button>
           
            <Typography variant="body2">
    <a href="/" style={{textDecoration:'none'}}>Back to Login</a>
</Typography>

          </>
        )}

        {step === 2 && (
          <>
      <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
        Enter the OTP sent to your email.
      </Typography>
      {error &&  <Stack sx={{ width: '100%',background:'#fff1f0' }} spacing={2}>
     <center>
      <Alert severity="error"  sx={{ textAlign: 'center',width:'max-content' }}>{error}</Alert></center>
    </Stack>}
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
                style: { textAlign: 'center', width: '20px' },
              }}
              sx={{
                borderRadius: '20px',
                mb: 2, // Add margin bottom for spacing
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
          mx: 'auto', // Center the button with controlled width
        }}
        onClick={handleOtpSubmit}
        disabled={!isOtpValid} // Disable button if OTP is invalid
      >
        Verify OTP
      </Button>
      <Typography variant="body2">
    <a href="/" style={{textDecoration:'none'}}>Back to Login</a>
</Typography>
</>
        )}

        {step === 3 && (
          <>
      <Typography variant="body2" sx={{ color:'#666', textAlign:'center' }}>
        Enter your new password.
      </Typography>
      
      {/* Display error message if passwords don't match */}
      {error &&  <Stack sx={{ width: '100%',background:'#fff1f0' }} spacing={2}>
     <center>
      <Alert severity="error"  sx={{ textAlign: 'center',width:'max-content' }}>{error}</Alert></center>
    </Stack>}
    {success &&  <Stack sx={{ width: '100%' }} spacing={2}>
     <center>
     {/* icon={<CheckIcon fontSize="inherit" />} */}
     <Alert  severity="success" sx={{ textAlign: 'center',width:'max-content' }}>{success}</Alert></center>
    </Stack>}
      <TextField 
        fullWidth 
        variant='outlined'
        label='New Password'
        type='password'
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{
          borderRadius:'20px',
          mb: 2 // Add margin bottom for spacing 
        }}
      />
      
      <TextField 
        fullWidth 
        variant='outlined'
        label='Confirm Password'
        type='password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{
          borderRadius:'20px',
          mb: 2 // Add margin bottom for spacing 
        }}
      />
      
      <Button 
        fullWidth 
        variant='contained'
        color='primary'
        sx={{ 
          borderRadius:'20px', 
          maxWidth:'200px', 
          mx:'auto'  
        }} // Center the button with controlled width 
        onClick={handlePasswordResetSubmit}
      >
        Reset Password 
      </Button>
      
      <Button 
        fullWidth 
        variant='text'
        color='primary'
        sx={{ mt :2 }}
        onClick={onBack}
      >
        Back to Sign In 
      </Button>
    </>
         )}
       </Stack>  
     </Box>  
   );  
};  

export default ForgotPassword;  

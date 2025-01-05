import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid, Stack } from '@mui/material';

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Password Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array to hold each OTP digit
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setStep(2); // Move to OTP step
  };

  const handleOtpChange = (index) => (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    console.log('OTP submitted:', otp.join(''));
    setStep(3); // Move to the next step for entering new password
  };

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      console.log('Password reset:', newPassword);
    } else {
      alert('Passwords do not match!');
    }
  };

  const isResetButtonEnabled = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

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
            >
              Send OTP
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Typography variant="body2" sx={{ color:'#666', textAlign:'center' }}>
              Enter the OTP sent to your email.
            </Typography>
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
                      style:{ textAlign:'center', width:'20px'},
                    }}
                    sx={{
                      borderRadius:'20px',
                      mb :2 // Add margin bottom for spacing 
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
                borderRadius:'20px', 
                maxWidth:'200px', 
                mx:'auto' 
              }} // Center the button with controlled width 
              onClick={handleOtpSubmit}
            >
              Verify OTP
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Typography variant="body2" sx={{ color:'#666', textAlign:'center' }}>
              Enter your new password.
            </Typography>
            <TextField 
               fullWidth 
               variant='outlined'
               label='New Password'
               type='password'
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               sx={{
                 borderRadius:'20px',
                 mb :2 // Add margin bottom for spacing 
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
                 mb :2 // Add margin bottom for spacing 
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
               disabled={!isResetButtonEnabled}
             >
               Reset Password 
             </Button>
             <Button 
               fullWidth 
               variant='text'
               color='primary'
               sx={{ mt :2}}
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

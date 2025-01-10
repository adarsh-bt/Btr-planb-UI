import React, { useState } from 'react';
import { Grid, Paper, Avatar, Typography, TextField, Button, Box, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Register from './auth-forms/Register';
import logo from "./images/logo.png";
import ForgotPassword from './auth-forms/ForgotPassword'; // Make sure the path is correct


const SignInSide = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);  // State for toggling Register form

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
  };

  const handleRegisterClick = () => {
    setIsRegister(true);  // Show Register form
  };

  const handleBackToSignInFromRegister = () => {
    setIsRegister(false);  // Go back to SignIn form
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid
        item
        xs={12}
        sm={12}
        md={7}
        lg={7}
        sx={{
          background: 'linear-gradient(142deg, rgba(42,110,193,1) 15%, rgba(22,77,155,1) 28%, rgba(14,63,139,1) 41%, rgba(5,48,122,1) 64%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="area" >
      <div style={{ textAlign: "center" }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "160px",
              height: "80px",
              borderRadius: "50%",
              marginBottom: "16px",
              marginTop:'2rem'
            }}
          />
            <Typography
              variant="h1"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                px: 4,
                textAlign: 'center',
                marginBottom: '5rem'
              }}
            >
              AIDEA
            </Typography>
          </div>
        </div>
      </Grid>
      <Grid
        item
        xs={12}
        sm={12}
        md={5}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }} />
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
          {isForgotPassword ? '' : isRegister ? 'Register' : 'Sign In'}
        </Typography>

        {isForgotPassword ? (
          <ForgotPassword onBack={handleBackToSignIn} />
        ) : isRegister ? (
          <Register onBack={handleBackToSignInFromRegister} />
        ) : (
          <SignInForm onForgotPasswordClick={handleForgotPasswordClick} onRegisterClick={handleRegisterClick} />
        )}
      </Grid>
    </Grid>
  );
};

const SignInForm = ({ onForgotPasswordClick, onRegisterClick }) => (
  <Box component="form" noValidate sx={{ mt: 1, width: '100%', maxWidth: '400px', mx: 'auto' }}>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="email"
      label="Email Address"
      name="email"
      autoComplete="email"
      autoFocus
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <EmailIcon />
          </InputAdornment>
        )
      }}
      sx={{ mb: 2, borderRadius: '10px' }}
    />
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type="password"
      id="password"
      autoComplete="current-password"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LockIcon />
          </InputAdornment>
        )
      }}
      sx={{ mb: 2, borderRadius: '10px' }}
    />
    <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{
          p: 1.5,
          borderRadius: '20px',
          width: '100%',
          maxWidth: '200px',
          '&:hover': {
            backgroundColor: 'primary.dark',
            color: 'white'
          }
        }}
      >
        Sign In
      </Button>
    </Box>
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs textAlign="left">
          <Typography variant="body2" onClick={onForgotPasswordClick} sx={{ color: 'blue', cursor: 'pointer' }}>
            Forgot password?
          </Typography>
        </Grid>
        <Grid item textAlign="right">
          <Typography variant="body2" onClick={onRegisterClick} sx={{ color: 'blue', cursor: 'pointer' }}>
            {"Don't have an account? Register Now"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default SignInSide;

import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Alert,
  Stack
} from '@mui/material';
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ForgotPassword from './auth-forms/ForgotPassword'; // Ensure this path is correct

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import logo from './images/logo.png'; // Import the logo image
import loginimg from './images/profile.gif'; // Import the login image
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Register from './auth-forms/Register';

import IconButton from '@mui/material/IconButton';

import './login.css';

import authservice from './authservice';

const SignInSide = () => {
  // login state

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // State for toggling Register form

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setIsRegister(false); // Reset register state when going back
  };

  const handleRegisterClick = () => {
    setIsRegister(true); // Show Register form
  };

  return (
    <Grid className="main" container>
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
        <div style={{ textAlign: 'center' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: '160px',
              height: '80px',
              borderRadius: '50%',
              marginBottom: '16px',
              marginTop: '2rem'
            }}
          />
          <Typography
            variant="h1"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              textAlign: 'center',
              // marginTop: "1rem",
              marginBottom: '5rem'
            }}
          >
            AIDEA
          </Typography>
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
          borderRadius: '0px 20px 20px 0px', // Increased border radius for a softer look
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Avatar alt="User Login" src={loginimg} sx={{ width: 80, height: 80, marginBottom: '.5rem' }} />

        {/* Dynamic Heading */}
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
          {isForgotPassword ? '' : isRegister ? 'Register' : 'Sign In'}
        </Typography>

        {isForgotPassword ? (
          <ForgotPassword onBack={handleBackToSignIn} />
        ) : isRegister ? (
          <Register onBack={handleBackToSignIn} />
        ) : (
          <SignInForm
            onForgotPasswordClick={handleForgotPasswordClick}
            onRegisterClick={handleRegisterClick} // Pass the handleRegisterClick function here
          />
        )}
      </Grid>
    </Grid>
  );
};

const SignInForm = ({ onForgotPasswordClick, onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // New state for loading

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username && password) {
      try {
        const userData = await authservice.login(username, password);

        if (userData.payload && userData.payload.token && typeof userData.payload.token === 'string') {
          localStorage.setItem('token', userData.payload.token);
          navigate('/dashboard');
        } else {
          setError(userData.message || 'Login failed');
        }
      } catch (error) {
        console.error('Error during login:', error);
        setError(error.message || 'An error occurred during login');
      }
    } else {
      if (!username) {
        setError('Enter your email');
      } else {
        setError('Enter your password');
      }
    }
  };

  return (
    <Box
      component="form"
      noValidate
      sx={{ mt: 1, width: '100%', maxWidth: '400px', mx: 'auto' }}
      onSubmit={handleSubmit} // Attach handleSubmit to form submit
    >
      {error && (
        <Stack sx={{ width: '100%', background: '#fff1f0' }} spacing={2}>
          <center>
            <Alert severity="error" sx={{ textAlign: 'center', width: 'max-content' }}>
              {error}
            </Alert>
          </center>
        </Stack>
      )}{' '}
      {/* Show error message if any */}
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        value={username} // Use username state for the email input
        onChange={(e) => {
          if (e.target.value.length <= 30) {
            setUsername(e.target.value); // Update state if length is <= 50
          }
        }}
        autoComplete="email"
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '1rem'
          }
        }}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'} // Toggle between text and password
        id="password"
        value={password} // Use password state for the password input
        onChange={(e) => {
          if (e.target.value.length <= 16) {
            setPassword(e.target.value); // Update state if length is <= 16
          }
        }}
        autoComplete="current-password"
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
        maxLength={16}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '1rem'
          }
        }}
      />
      {/* Remember Me Checkbox */}
      <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
      {/* Centered Sign In Button */}
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
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
      {/* Add spacing between the button and links */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs textAlign="left">
            <Typography variant="body2" onClick={onForgotPasswordClick} sx={{ color: 'blue', cursor: 'pointer', position: 'absolute' }}>
              Forgot password?
            </Typography>
          </Grid>

          <Grid item textAlign="right">
            <Typography variant="body2" onClick={onRegisterClick} sx={{ color: 'blue', cursor: 'pointer' }}>
              {'Register new User'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SignInSide;

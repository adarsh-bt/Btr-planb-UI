import React, { useState, useContext, createContext, useEffect } from 'react';
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
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ForgotPassword from './ForgotPassword'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Register from './Register';
import logo from '../images/govt.png'; // Import the logo image
import loginimg from '../images/login.png'; // Import the login image
import bg1 from '../images/bg1.jpg'; // Import the background image
import duklogo from '../images/duk_icon.png'; // Import the DUK logo image
import cdtilogo from '../images/cdti_icon.png'; // Import the CDTI logo image
import { keyframes } from '@emotion/react';
import '../login.css';
import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
import IconButton from '@mui/material/IconButton';
import authservice from '../services/authservice';

const fadeIn = keyframes`
    0% { opacity: 0; transform: translateY(50px); }
    100% { opacity: 1; transform: translateY(0); }
`;

const SignInSide = () => {
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
      {isRegister}
      <Grid
        item
        xs={12}
        sm={12}
        md={7}
        lg={7}
        sx={{
          backgroundImage: `url(${bg1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img className="logo_gov" src={logo} alt="Logo" />

          <Typography
            className="deparment"
            variant="h3"
            sx={{
              color: '#fff',
              px: 4,
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            Department of Economics & Statistics
          </Typography>

          <Typography variant="h3" className="deparment">
            Government of Kerala
          </Typography>

          <Typography
            variant="h3"
            className="deparment"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              textAlign: 'center',
              marginBottom: '3rem',
              animation: `${fadeIn} 1.5s ease-out`
            }}
          >
            Application for Intelligent Data Engineering and Analytics (AIDEA)
          </Typography>

          <Typography className="duk_logo_typ">
            <img className="duk_logo" src={duklogo} alt="DUK Logo" />
            <img className="cdti_logo" src={cdtilogo} alt="CDTI Logo" />
          </Typography>
          <Box className="copy_right" sx={{ color: 'text.disabled' }}>
            © 2025 AIDEA CDTI-DUK. All rights reserved.
          </Box>
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
          backgroundColor: 'rgb(250, 251, 252)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: '0px 20px 20px 0px', // Increased border radius for a softer look
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Avatar alt="User Login" src={loginimg} sx={{ width: 50, height: 50, marginBottom: '.5rem' }} />

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
  const [rememberMe, setRememberMe] = useState(false); // State for remember me
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const { setPermissions, setLoading, setError: setPermissionsError } = useContext(PermissionsContext);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  useEffect(() => {
    // Load saved credentials if rememberMe is true
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';

    if (isRemembered && savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (username && password) {
    const trimmedEmail = username.trim();
    const trimmedPassword = password.trim();
    try {
      setIsLoading(true);
      const userLogin = {
        username: trimmedEmail,
        password: trimmedPassword
      };
      const userData = await authservice.login(userLogin);
      setIsLoading(false);

      if (userData.payload && userData.payload.token && typeof userData.payload.token === 'string') {
        localStorage.setItem('token', userData.payload.token);
        localStorage.setItem('user', userData.payload.username);

        // Save credentials if rememberMe is checked
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
          localStorage.setItem('rememberedPassword', password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }

        // --- FIX: Fetch permissions after login ---
        setLoading(true);
        try {
          const permissionsData = await authservice.fetchPermissions(userData.payload.token);
          setPermissions(permissionsData); // Update context and localStorage
          setLoading(false);
          navigate('/'); // Redirect to home/dashboard
        } catch (permissionsError) {
          setPermissionsError(permissionsError.message);
          setLoading(false);
          // Optionally navigate or show error
        }
      } else {
        setError(userData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message || 'An error occurred during login');
      setIsLoading(false);
    }
  } else {
    setError(username ? 'Enter your password' : 'Enter your email');
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
          if (e.target.value.length <= 255) {
            setUsername(e.target.value); // Update state if length is <= 255
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
      <FormControlLabel
        control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={handleRememberMeChange} />}
        label="Remember me"
      />
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
          disabled={isLoading}
        >
          {isLoading ? <Typography sx={{ color: 'blue' }}>Logging...</Typography> : 'Login'}
        </Button>
      </Box>
      {/* Add spacing between the button and links */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs textAlign="left">
            <Typography variant="body2" onClick={onForgotPasswordClick} sx={{ color: 'blue', cursor: 'pointer' }}>
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

import React, { useState , useContext, createContext} from 'react';
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
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ForgotPassword from './ForgotPassword'; // Ensure this path is correct
// Import the logo image
// Import the login image
import { useNavigate} from 'react-router-dom'; 
import CircularProgress from '@mui/material/CircularProgress';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Register from './Register';
import logo from "../images/govt.png"; // Import the logo image
import loginimg from "../images/login.png"; // Import the login image
import bg1 from "../images/bg1.jpg"; // Import the background image
import duklogo from "../images/duk_icon.png"; // Import the DUK logo image
import cdtilogo from "../images/cdti_icon.png"; // Import the DUK logo image
import { keyframes } from '@emotion/react';
import '../login.css'

import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext'

import IconButton from '@mui/material/IconButton';



import authservice from '../services/authservice';


const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(50px); }
  100% { opacity: 1; transform: translateY(0); }
`;


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
          backgroundImage: `url(${bg1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        
          
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "180px",
              height: "140px",
              // borderRadius: "50%",
              marginBottom: "16px",
              marginTop:'2rem'
              
            }}
          />

          <Typography
              variant="h3"
              sx={{
                color: '#fff',
                // fontWeight: 'bold',
                px: 4,
                textAlign: "center",
                // marginTop: "1rem",
                // marginBottom:'2rem',
                
                // marginTop: "1rem",
                marginBottom: '1rem'
              }}
            >
              Department of Economics & Statistics
          </Typography>

          <Typography
              variant="h3"
              sx={{
                color: '#fff',
                // fontWeight: 'bold',
                px: 4,
                textAlign: "center",
                // marginTop: "1rem",
                // marginBottom:'2rem',
                
                // marginTop: "1rem",
                marginBottom: '5rem'
              }}
            >
              Government of Kerala
          </Typography>

          
          <Typography variant="h3"  sx={{
              color: "#fff",
              fontWeight: "bold",
              px: 4,
              textAlign: "center",
              // marginTop: "1rem",
              marginBottom:'3rem',
              animation: `${fadeIn} 1.5s ease-out`,
              
            }}>Application for Intelligent Data Engineering and Analytics (AIDEA)</Typography>
        
        <Typography style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "3rem" }}>
        <img
        src={duklogo}
        alt="DUK Logo"
        style={{
          width: "120px",
          height: "60px",
          padding:".7rem",
          borderRadius: "5px", // Adds border radius for a polished look
          // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Shadow for logos
        
        }}
      />
         {/* <img
        src={deslogo}
        alt="DES Logo"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
         
        }}
      /> */}
     <img
        src={cdtilogo}
        alt="DUK Logo"
        style={{
          width: "120px",
          height: "60px",
          padding: ".7rem",
          borderRadius: "5px",
          marginTop: "-8px" // Lifts the logo slightly
        }}
      />

          {/* <Typography variant="p"  sx={{
              color: "#fff",
            }}>CDTI</Typography> */}
        </Typography>
        <Box sx={{ color: 'text.disabled' }}>© 2025 AIDEA CDTI-DUK. All rights reserved.</Box>

        
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
          backgroundColor: "rgb(250, 251, 252)",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: '0px 20px 20px 0px', // Increased border radius for a softer look
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
      <Avatar
            alt="User Login"
            src={loginimg}
            sx={{ width: 50, height: 50,marginBottom:'.5rem' }}
            />

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
  const [isLoading, setIsLoading] = useState(false); // New state for loading

 
  const { setPermissions, setLoading, setError: setPermissionsError } = useContext(PermissionsContext); // Access the context update functions

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

const handleSubmit = async (e) => {
  e.preventDefault();

  if (username && password) {
    try {
      setIsLoading(true);
      const userLogin = {
        username: username,
        password: password,
      };
      const userData = await authservice.login(userLogin);
      setIsLoading(false);

      if (userData.payload && userData.payload.token && typeof userData.payload.token === 'string') {
        localStorage.setItem('token', userData.payload.token);
        localStorage.setItem('user', userData.payload.username);

        // After successful login, fetch the user's permissions
        setLoading(true); // Set loading state in PermissionsContext
        try {
          const permissionsResponse = await fetch('http://localhost:8081/user-access/user-state/userpremissions', {
            headers: {
              'Authorization': `Bearer ${userData.payload.token}`, // If your API requires a token
              'Content-Type': 'application/json', // Adjust content type as needed
            },
          });

          if (!permissionsResponse.ok) {
            throw new Error(`HTTP error! status: ${permissionsResponse.status}`);
          }

          const permissionsData = await permissionsResponse.json();
          console.log("premisio  ",permissionsData)
          setPermissions(permissionsData); // Update the permissions in the context
          setLoading(false); // Reset loading state
          navigate('/'); // Redirect to the home page
        } catch (permissionsError) {
          console.error('Error fetching permissions after login:', permissionsError);
          setError(permissionsError); // Set error in PermissionsContext
          setLoading(false);
          navigate('/'); // Consider your navigation strategy here
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
      {/* <FormControlLabel
        control={<Checkbox value="remember" color="primary" />}
        label="Remember me"
      /> */}

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
      color: 'white',
    },
  }}
  disabled={isLoading}
>
  {isLoading ? (
     <Typography sx={{color:'blue'}}>Logging...</Typography>
    ) : (
      'Login'
    )}
</Button>

      </Box>
      {/* Add spacing between the button and links */}
      <Box sx={{ mt: 4 }} >
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
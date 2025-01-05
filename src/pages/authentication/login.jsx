import React, { useState } from "react";
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
} from "@mui/material";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ForgotPassword from "./auth-forms/ForgotPassword"; // Ensure this path is correct
import logo from "./images/logo.png"; // Import the logo image
import { Link} from 'react-router-dom'; 

import './login.css'
import { width } from "@mui/system";

const SignInSide = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid
        item
        xs={12}
        sm={12}
        md={7}
        lg={7}
        sx={{
          background:
            "linear-gradient(142deg, rgba(42,110,193,1) 15%, rgba(22,77,155,1) 28%, rgba(14,63,139,1) 41%, rgba(5,48,122,1) 64%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          
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
              color: "#fff",
              fontWeight: "bold",
              px: 4,
              textAlign: "center",
              // marginTop: "1rem",
              marginBottom:'5rem',
              
            }}
          >
            AIDEA
          </Typography>
        </div>
            <ul className="circles">
                    <li><img src="https://icon-library.com/images/rice-icon/rice-icon-22.jpg" style={{width:'5rem'}}></img></li>
                    <li><img src="https://icons.veryicon.com/png/o/food--drinks/crops-1/crop-millet-1.png" style={{width:'6rem'}}></img></li>
                    <li><img src="https://cdn1.iconfinder.com/data/icons/farming-agriculture-3/42/field-512.png" style={{width:'7rem'}}></img></li>
                    <li><img src="https://cdn-icons-png.freepik.com/512/4413/4413142.png" style={{width:'4rem'}}></img></li>
                    <li><img src="https://cdn1.iconfinder.com/data/icons/graph-1/100/03-512.png" style={{width:'4rem'}}></img></li>
                  
                
                   
                  
                    <li><img src="https://cdn-icons-png.flaticon.com/512/2152/2152477.png" style={{width:'8rem'}}></img></li>
                    <li><img src="https://cdn1.iconfinder.com/data/icons/farming-outline-2/512/Agriculture_farming_gardening_water_tablet_digital_smart_farm-512.png" style={{width:'8rem'}}></img></li>
                    <li><img src="https://cdn-icons-png.flaticon.com/512/17212/17212370.png" style={{width:'5rem'}}></img></li>
                    <li><img src="https://cdn-icons-png.flaticon.com/512/17485/17485427.png" style={{width:'5rem'}}></img></li>
                    <li><img src="https://cdn-icons-png.freepik.com/256/9428/9428533.png?semt=ais_hybrid" style={{width:'5rem'}}></img></li>
                
                   
            </ul>
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          borderRadius: "20px", // Increased border radius for a softer look
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          {/* <LockOutlinedIcon /> */}
        </Avatar>

        {/* Dynamic Heading */}
        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
        >
          {isForgotPassword ? "" : "Sign In"}
        </Typography>

        {isForgotPassword ? (
          <ForgotPassword onBack={handleBackToSignIn} />
        ) : (
          <SignInForm onForgotPasswordClick={handleForgotPasswordClick} />
        )}
      </Grid>
    </Grid>
  );
};

const SignInForm = ({ onForgotPasswordClick }) => (
  <Box
    component="form"
    noValidate
    sx={{ mt: 1, width: "100%", maxWidth: "400px", mx: "auto" }}
  >
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
        ),
      }}
      sx={{ mb: 2, borderRadius: "10px" }} // Rounded corners for input
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
        ),
      }}
      sx={{ mb: 2, borderRadius: "10px" }} // Rounded corners for input
    />

    {/* Remember Me Checkbox */}
    <FormControlLabel
      control={<Checkbox value="remember" color="primary" />}
      label="Remember me"
    />

    {/* Centered Sign In Button */}
    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
      <Button
      component={Link} to="/"
        type="submit"
        variant="contained"
        color="primary"
        sx={{
          p: 1.5,
          borderRadius: "20px", // More rounded corners for button
          width: "100%", // Make button full width within its container
          maxWidth: "200px", // Set max width for button to maintain size consistency
          "&:hover": {
            backgroundColor: "primary.dark",
            color:"white"
          },
        }}
      >
        Sign In
      </Button>
    </Box>

    {/* Add spacing between the button and links */}
    <Box sx={{ mt: 4 }}>
      {" "}
      {/* Increased margin top for more space */}
      <Grid container spacing={2}>
        <Grid item xs textAlign="left">
          <Typography variant="body2" onClick={onForgotPasswordClick} sx={{color:"blue",cursor:"pointer",position:'absolute'}}>
            Forgot password?
          </Typography>
        </Grid>

        <Grid item textAlign="right">
          <Typography href="#" variant="body2">
            {"Don't have an account? Sign Up"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default SignInSide;

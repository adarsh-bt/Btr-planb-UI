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
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Divider,
    Backdrop,
    Fade  
    
} from '@mui/material';
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import ForgotPassword from './ForgotPassword'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Register from './Register';
import des_logo from "../images/DES_logo.png"; 
import logo from "../images/logo.png"; // Import the logo image
import loginimg from "../images/login.png"; // Import the login image
import bg1 from "../images/bg1.jpg"; // Import the background image
import duklogo from "../images/duk_icon.png"; // Import the DUK logo image
import cdtilogo from "../images/cdti_icon.png"; // Import the CDTI logo image
import deslogo from "../images/des.png"; // Import the CDTI logo image
import { keyframes } from '@emotion/react';
import '../login.css'
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext'
import IconButton from '@mui/material/IconButton';
import authservice from '../services/authservice';
import mainapi from 'api/mainapi';
import CelebrationIcon from '@mui/icons-material/Celebration';

const fadeIn = keyframes`
0% { opacity: 0; transform: translateY(50px); }
100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { text-shadow: 0 0 8px rgba(255,210,63,0.6); }
  50% { text-shadow: 0 0 18px rgba(255,210,63,1); }
  100% { text-shadow: 0 0 8px rgba(255,210,63,0.6); }
`;

const confettiFall = keyframes`
  0% { 
    transform: translateY(-100vh) rotate(0deg); 
    opacity: 1; 
  }
  100% { 
    transform: translateY(100vh) rotate(720deg); 
    opacity: 0; 
  }
`;

// curtain panels
const curtainOpenLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

const curtainOpenRight = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(100%); }
`;

// ------------------ Inauguration overlay ------------------

const InaugurationCeremony = ({ onComplete }) => {
  const [step, setStep] = useState(-1);          // -1 = text not started yet
  const [showConfetti, setShowConfetti] = useState(false);
  const [curtainDone, setCurtainDone] = useState(false);

  const steps = [
    {
    text: (
      <>
        Introducing{" "}
        <span
          style={{
            color: "#ffd23f",
            fontWeight: "bold",
            textShadow: "0 0 12px rgba(255,210,63,0.9)"
          }}
        >
          Application for Intelligent Data Engineering and Analytics (AIDEA)
        </span>
      </>
    ),
    delay: 1100
  },
   { 
  text: "Officially Launched by", 
  delay: 1000,
  variant: "h4",  // Keep h4 structure
  sx: {           // Add custom override
    fontSize: '1.8rem',  // Smaller than default h4 (2.125rem)
    lineHeight: 1.2
  }
},

    {
    text: (
      <span
        style={{
          color: "#3f1111ff",           // deep ceremonial red
          fontWeight: "bold",
          textShadow: "0 0 10px rgba(198,40,40,0.8)"
        }}
      >
        Hon&apos;ble Chief Minister Pinarayi Vijayan
      </span>
    ),
    delay: 1100
  }
  ];

  useEffect(() => {
  // after curtain opens, start text sequence
  if (!curtainDone) {
    // curtain duration 2s + small padding
    const t = setTimeout(() => setCurtainDone(true), 4500);
    return () => clearTimeout(t);
  }

  // curtain is done: start text if not started
  if (curtainDone && step === -1) {
    setStep(0);
    return;
  }

  // run through text steps
  if (curtainDone && step >= 0 && step < steps.length - 1) {
    const t = setTimeout(
      () => setStep((s) => s + 1),
      steps[step]?.delay || 1000
    );
    return () => clearTimeout(t);
  }

  // after last text, show confetti, then close
  if (curtainDone && step === steps.length - 1 && !showConfetti) {
    const t = setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setTimeout(() => onComplete(), 1500); // go to official page (login)
      }, 2000);
    }, 800); // small pause after final text
    return () => clearTimeout(t);
  }
}, [curtainDone, step, showConfetti, steps, onComplete]);


  return (
    <Backdrop
      open={true}
      sx={{
        zIndex: 9999,
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #ff6b35 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        position: 'relative'
      }}
    >
      {/* glowing background dots */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden'
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: '#ffd23f',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: '0 0 18px #ffd23f',
              animation: `${pulse} ${1 + Math.random() * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </Box>

      <Fade in={true} timeout={800}>
  <Box
    sx={{
      position: 'relative',
      zIndex: 2,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    {/* logo */}
    <Box sx={{ mb: 4 }}>
      <img
      src={des_logo}
      alt="AIDEA Logo"
      style={{
        width: '200px',
        height: '200px',
        borderRadius: '20%',
        boxShadow: `
          0 0 30px rgba(255,210,63,0.8),
          0 0 60px rgba(255,210,63,0.6),
          inset 0 0 20px rgba(255,255,255,0.2)
        `,
        animation: `${pulse} 2s ease-in-out infinite`,
      }}
    />
    </Box>

    {/* TEXT ONLY AFTER CURTAIN DONE */}
    {curtainDone &&
      steps.slice(0, step + 1).map((s, index) => (
        <Fade in={index <= step} timeout={500} key={index}>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 3,
              textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
              animation: step === index ? `${pulse} 1s infinite` : 'none',
            }}
          >
            {s.text}
          </Typography>
        </Fade>
      ))}

    {/* FULL‑PAGE CURTAIN SHOWN WHILE !curtainDone */}
    {!curtainDone && (
      <Fade in={true} timeout={700}>
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden',zIndex: 3, }}>
          {/* stage text in middle */}
          <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                overflow: 'hidden',
                height: '100vh',  // Ensure full viewport height
                width: '100vw',   // Ensure full viewport width
                top: 0,
                left: 0
            }}>
            <Typography
              variant="h4"
              sx={{
                color: '#a7b52bff',
                fontWeight: 'bold',
                textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
              }}
            >
              Launching . . .
            </Typography>
          </Box>

          

          {/* left curtain */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: `
                repeating-linear-gradient(
                  90deg,
                  #8b0000 0px,
                  #a00000 3px,
                  #6d0000 6px,
                  #500000 9px,
                  #6d0000 12px,
                  #a00000 15px,
                  #8b0000 18px,
                  #6d0000 21px,
                  #500000 24px,
                  #400000 27px,
                  #500000 30px,
                  #6d0000 33px,
                  #8b0000 36px
                ),
                radial-gradient(ellipse at 20% 50%, rgba(200,50,50,0.3), transparent 70%),
                radial-gradient(ellipse at 80% 30%, rgba(255,100,100,0.15), transparent 50%),
                linear-gradient(180deg, #700000 0%, #4a0000 100%)
              `,
              boxShadow: `
                inset -8px 0 20px rgba(0,0,0,0.6),
                inset 4px 0 15px rgba(255,255,255,0.05),
                8px 0 30px rgba(0,0,0,0.8)
              `,
              animation: `${curtainOpenLeft} 5s ease-in-out forwards`,
              transformOrigin: 'left center',
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '15%',
                background: 'linear-gradient(180deg, rgba(139,0,0,0.9) 0%, transparent 100%)',
                borderBottom: '3px solid rgba(80,0,0,0.6)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: `
                  repeating-linear-gradient(
                    180deg,
                    transparent 0px,
                    rgba(0,0,0,0.15) 40px,
                    transparent 80px
                  )
                `,
                pointerEvents: 'none'
              }
            }}
          />

          {/* right curtain */}
<Box
  sx={{
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    background: `
      repeating-linear-gradient(
        90deg,
        #8b0000 0px,
        #a00000 3px,
        #6d0000 6px,
        #500000 9px,
        #6d0000 12px,
        #a00000 15px,
        #8b0000 18px,
        #6d0000 21px,
        #500000 24px,
        #400000 27px,
        #500000 30px,
        #6d0000 33px,
        #8b0000 36px
      ),
      radial-gradient(ellipse at 20% 50%, rgba(200,50,50,0.3), transparent 70%),
      radial-gradient(ellipse at 80% 30%, rgba(255,100,100,0.15), transparent 50%),
      linear-gradient(180deg, #700000 0%, #4a0000 100%)
    `,
    boxShadow: `
      inset 8px 0 20px rgba(0,0,0,0.6),
      inset -4px 0 15px rgba(255,255,255,0.05),
      -8px 0 30px rgba(0,0,0,0.8)
    `,
    animation: `${curtainOpenRight} 5s ease-in-out forwards`,
    transformOrigin: 'right center',
    zIndex: 2,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '15%',
      background: 'linear-gradient(180deg, rgba(139,0,0,0.9) 0%, transparent 100%)',
      borderBottom: '3px solid rgba(80,0,0,0.6)'
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: `
        repeating-linear-gradient(
          180deg,
          transparent 0px,
          rgba(0,0,0,0.15) 40px,
          transparent 80px
        )
      `,
      pointerEvents: 'none'
    }
  }}
/>

        </Box>
      </Fade>
    )}

    <Typography
      variant="h6"
      sx={{
        color: 'rgba(255,255,255,0.95)',
        mt: 2,
        fontStyle: 'italic',
        fontWeight: 600,
        textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
      }}
    >
      December 24, 2025
    </Typography>

    {showConfetti && (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {/* confetti boxes here */}
      </Box>
    )}
  </Box>
</Fade>


    </Backdrop>
  );
};

const SignInSide = () => {
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [showInauguration, setShowInauguration] = useState(false);
    const [showInaugurateButton, setShowInaugurateButton] = useState(true);

    const handleForgotPasswordClick = () => {
        setIsForgotPassword(true);
    };

    const handleBackToSignIn = () => {
        setIsForgotPassword(false);
        setIsRegister(false);
    };

    const handleRegisterClick = () => {
        setIsRegister(true);
    };

    const handleInaugurate = () => {
        setShowInaugurateButton(false);
        setShowInauguration(true);
    };

    const handleInaugurationComplete = () => {
        setShowInauguration(false);
    };

    // first screen: inauguration button only
  if (showInaugurateButton) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #edeef0ff 0%, #f8f8f8ff 100%)',
          flexDirection: 'column',
          gap: 1.5,
          px: 2
        }}
      >
        <Box sx={{ mb: 1 }}>
          <img
            src={des_logo}
            alt="AIDEA Logo"
            style={{ width: '200px', height: '200px' }}
          />
        </Box>
        <Typography
          variant="h2"
          sx={{
            color: '#0e0c21ff',
            textAlign: 'center',
            fontWeight: 'bold',
            textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
            mb: 0.5, // Reduced from 2
          lineHeight: 1.1 // Tighter line height
          }}
        >
          AIDEA
        </Typography>
        <Typography
        variant="h4" // Smaller than h4
        sx={{ 
          color: 'rgba(11, 48, 19, 0.95)', 
          textAlign: 'center', 
          mb: 0.5, // Reduced from 4
          fontWeight: 500,
          lineHeight: 1.2
        }}
      >
        Department of Economics & Statistics
      </Typography>
        <Typography
        variant="h5" // Smaller than h4
        sx={{ 
          color: 'rgba(153, 28, 22, 0.95)', 
          textAlign: 'center', 
          mb: 2, // Reduced from 4
          fontWeight: 600,
          lineHeight: 1.2
        }}
      >
        Inauguration by Hon'ble Chief Minister Pinarayi Vijayan
      </Typography>
        <Button
          onClick={handleInaugurate}
          variant="contained"
          size="large"
          sx={{
            px: 6,
            py: 2,
            borderRadius: '50px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ff6b35, #ffd23f)',
            boxShadow: '0 12px 40px rgba(255,107,53,0.5)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ffd23f, #ff6b35)',
              transform: 'translateY(-2px)',
              boxShadow: '0 16px 48px rgba(255,107,53,0.7)'
            }
          }}
          startIcon={<CelebrationIcon />}
        >
          🪔 Start Ceremony
        </Button>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(32, 29, 29, 0.85)',
            textAlign: 'center',
            maxWidth: 600
          }}
        >
          Experience the inauguration curtain opening before entering the application.
        </Typography>
      </Box>
    );
  }

    return (
        <>
    {showInauguration && (
      <InaugurationCeremony onComplete={handleInaugurationComplete} />
    )}

    {!showInauguration && (
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
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Stack
                    spacing={3}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ textAlign: 'center', width: '100%', maxWidth: '80%' }}
                >
                    <img
                        className='logo_gov'
                        src={logo}
                        alt="Logo"
                    />
                    <Typography
                        className='deparment'
                        variant="h3"
                        sx={{ color: '#fff', px: 4, textAlign: "center" }}
                    >
                        Department of Economics & Statistics
                    </Typography>
                    <Typography variant="h3" className='deparment'>
                        Government of Kerala
                    </Typography>
                    <Typography
                        variant="h3"
                        className='deparment'
                        sx={{
                            color: "#fff",
                            fontWeight: "bold",
                            px: 4,
                            textAlign: "center",
                            animation: `${fadeIn} 1.5s ease-out`,
                        }}
                    >
                        Application for Intelligent Data Engineering and Analytics (AIDEA)
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 5 }}>
                        <Typography className='duk_logo_typ'>
                            <img className='duk_logo' src={duklogo} alt="DUK Logo" />
                            <img className='des_logo' src={deslogo} alt="DES Logo" />
                            <img className='cdti_logo' src={cdtilogo} alt="CDTI Logo" />
                        </Typography>
                        <Box className="copy_right" sx={{ color: 'text.disabled' }}>
                            © 2025 AIDEA CDTI-DUK. All rights reserved.
                        </Box>
                    </Stack>
                </Stack>
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
                    borderRadius: '0px 20px 20px 0px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
            >
                <Avatar
                    alt="User Login"
                    src={loginimg}
                    sx={{ width: 50, height: 50, marginBottom: '.5rem' }}
                />
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
                    {isForgotPassword ? '' : isRegister ? 'Registration' : 'Sign In'}
                </Typography>
                {isForgotPassword ? (
                    <ForgotPassword onBack={handleBackToSignIn} />
                ) : isRegister ? (
                    <Register onBack={handleBackToSignIn} />
                ) : (
                    <SignInForm
                        onForgotPasswordClick={handleForgotPasswordClick}
                        onRegisterClick={handleRegisterClick}
                    />
                )}
            </Grid>
        </Grid>
        )}
  </>
    );
    
};


const SignInForm = ({ onForgotPasswordClick, onRegisterClick }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // const { setPermissions, setLoading: setPermissionsLoading, setError: setPermissionsError } = useContext(PermissionsContext);
    const [showPassword, setShowPassword] = useState(false);

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [loginAttemptData, setLoginAttemptData] = useState(null);

    useEffect(() => {
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

    const handleConfirmDialogClose = () => {
        setOpenConfirmDialog(false);
        setLoginAttemptData(null);
    };

    const handleConfirmSwitchLogin = async () => {
        setOpenConfirmDialog(false);
        if (loginAttemptData) {
            try {
                setIsLoading(true);
                const forceLoginData = { ...loginAttemptData, forceLogin: true };
                const userData = await authservice.login(forceLoginData);
                setIsLoading(false);

                if (userData.payload && typeof userData.payload.token === 'string') {
                    const { token, username: userNameFromApi } = userData.payload;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', userNameFromApi);
                    console.log("  >   name   > "+userNameFromApi)
                    if (rememberMe) {
                        localStorage.setItem('rememberedUsername', username);
                        localStorage.setItem('rememberedPassword', password);
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('rememberedUsername');
                        localStorage.removeItem('rememberedPassword');
                        localStorage.removeItem('rememberMe');
                    }

                    setIsLoading(true);
                    try {
                        const BASE_URL = mainapi.USER_API;
                        const permissionsResponse = await fetch(
                            `${BASE_URL}/user-accesss/user-state/userpremissions`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                    //     if (!permissionsResponse.ok) {
                    //         throw new Error(`HTTP error! status: ${permissionsResponse.status}`);
                    //     }

                        const permissionsData = await permissionsResponse.json();
                        setPermissions(permissionsData);
                        setIsLoading(false);
                        // navigate('/');
                          window.location.href = '/';
                    } catch (permissionsError) {
                        console.error('Error fetching permissions:', permissionsError);
                        setError(permissionsError.message || 'Failed to load permissions');
                        setIsLoading(false);
                        // navigate('/');
                          window.location.href = '/';
                    }
                } else {
                    setError(userData.message || 'Login failed after forced login attempt');
                }
            } catch (error) {
                console.error('Error during forced login:', error);
                setError(error.message || 'An error occurred during forced login');
                setIsLoading(false);
            } finally {
                setLoginAttemptData(null);
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError(username ? 'Enter your password' : 'Enter your email');
            return;
        }

        const trimmedEmail = username.trim();
        const trimmedPassword = password.trim();
        const userLogin = { username: trimmedEmail, password: trimmedPassword };

        try {
            setIsLoading(true);
            let userData = await authservice.login(userLogin);
            setIsLoading(false);
            if (userData.message === "User already logged in elsewhere") {
               
                setLoginAttemptData(userLogin);
                setOpenConfirmDialog(true);
                return;
            }

            if (userData.payload && typeof userData.payload.token === 'string') {
                const { token, username: userNameFromApi } = userData.payload;
                localStorage.setItem('token', token);
                localStorage.setItem('user', userNameFromApi);

                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                    localStorage.setItem('rememberedPassword', password);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedPassword');
                    localStorage.removeItem('rememberMe');
                }

                setIsLoading(true);
                try {
                    const BASE_URL = mainapi.USER_API;
                    const permissionsResponse = await fetch(
                        `${BASE_URL}/user-accesss/user-state/userpremissions`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (!permissionsResponse.ok) {
                        throw new Error(`HTTP error! status: ${permissionsResponse.status}`);
                    }

                    const permissionsData = await permissionsResponse.json();
                    setPermissions(permissionsData);
                    setIsLoading(false);
                    // navigate('/');
                     window.location.href = '/';

                } catch (permissionsError) {
                    console.error('Error fetching permissions:', permissionsError);
                    // setError(permissionsError.message || 'Failed to load permissions');
                    setIsLoading(false);
                    // navigate('/');
                     window.location.href = '/';
                }
            } else {
                setError(userData.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError(error.message || 'An error occurred during login');
            setIsLoading(false);
        }
    };


    return (
        <Box
            component="form"
            noValidate
            sx={{ mt: 1, width: '100%', maxWidth: '400px', mx: 'auto' }}
            onSubmit={handleSubmit}
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
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={username}
                onChange={(e) => {
                    if (e.target.value.length <= 256) {
                        setUsername(e.target.value);
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
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => {
                    if (e.target.value.length <= 16) {
                        setPassword(e.target.value);
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
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                                aria-label="toggle password visibility"
                            >
                                {showPassword ? (
                                    <VisibilityOff sx={{ fontSize: '18px' }} />
                                ) : (
                                    <Visibility sx={{ fontSize: '18px' }} />
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
            <FormControlLabel
                control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={handleRememberMeChange} />}
                label="Remember me"
            />

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
                        <Typography sx={{ color: 'blue' }}>Logging...</Typography>
                    ) : (
                        'Login'
                    )}
                </Button>
            </Box>
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

            {/* Enhanced MUI Confirmation Dialog */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleConfirmDialogClose}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                sx={{ '& .MuiDialog-paper': { borderRadius: '15px' } }} // Rounded corners for the dialog paper
            >
                <DialogTitle id="confirm-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main', pb: 1 }}>
                    <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h6" component="span" fontWeight="bold">Already Logged In</Typography>
                </DialogTitle>
                <Divider /> {/* Visual separation */}
                <DialogContent sx={{ pt: 2, pb: 2 }}>
                    <DialogContentText id="confirm-dialog-description" sx={{ color: 'text.secondary' }}>
                        You are currently logged in on another device.
                        <br />
                        Do you want to force log in here, which will log you out from your previous session?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-around' }}>
                    <Button
                        onClick={handleConfirmDialogClose}
                        variant="outlined"
                        color="secondary"
                        sx={{ borderRadius: '20px', minWidth: '100px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmSwitchLogin}
                        variant="contained"
                        color="primary"
                        autoFocus
                        sx={{ borderRadius: '20px', minWidth: '100px' }}
                    >
                        Force Login
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SignInSide;
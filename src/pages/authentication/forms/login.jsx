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
    Divider
    
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
import logo from "../images/govt.png"; // Import the logo image
import loginimg from "../images/login.png"; // Import the login image
import bg1 from "../images/bg1.jpg"; // Import the background image
import duklogo from "../images/duk_icon.png"; // Import the DUK logo image
import cdtilogo from "../images/cdti_icon.png"; // Import the CDTI logo image
import { keyframes } from '@emotion/react';
import '../login.css'
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext'
import IconButton from '@mui/material/IconButton';
import authservice from '../services/authservice';
import mainapi from 'api/mainapi';

const fadeIn = keyframes`
0% { opacity: 0; transform: translateY(50px); }
100% { opacity: 1; transform: translateY(0); }
`;

const SignInSide = () => {
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

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
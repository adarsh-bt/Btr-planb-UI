import {React,useState,useEffect,useRef} from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    Paper,
    useMediaQuery,
    useTheme
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import des_logo from "../images/des.png"; // Ensure this path is correct
import deslogo from "../images/des2.png"; 
import logo from "../images/gok_logo1.png";
import duk_logo from "../images/Duk-Logo.png";
import cdti_logo from "../images/cdti_icon.png"
import ConfettiCanvas from './ConfettiCanvas';
// --- Animations ---

const floatAnimation = `
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glowPulse = `
  0% { box-shadow: 0 0 10px rgba(255, 167, 38, 0.2); }
  50% { box-shadow: 0 0 30px rgba(255, 167, 38, 0.6), 0 0 10px rgba(255, 255, 255, 0.4); }
  100% { box-shadow: 0 0 10px rgba(255, 167, 38, 0.2); }
`;

const bgShift = `
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const InaugurationLandingPage = ({ onInaugurate }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    useEffect(() => {
    const targetDate = new Date('December 24, 2025 23:00:00'); // 11:00 PM, 24th

    const timer = setInterval(() => {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            clearInterval(timer);
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        });
    }, 1000);

    return () => clearInterval(timer);
}, []);

useEffect(() => {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onInaugurate(); // same action as button click
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, [onInaugurate]);

    return (
        <>
          <ConfettiCanvas />
        <Box
            sx={{
                height: '100%', // Dynamic viewport height (fixes mobile scroll issues)
                width: '100vw',
                overflow: 'hidden', // Strictly no scroll
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#050511', // Deep tech black/blue
            }}
        >
            {/* --- 1. Background Layer --- */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    background: `
                        radial-gradient(circle at 50% 0%, rgba(113, 133, 249, 0.15), transparent 50%),
                        radial-gradient(circle at 100% 100%, rgba(255, 107, 53, 0.1), transparent 40%),
                        linear-gradient(180deg, rgba(6, 6, 127, 0.9) 0%, #070781ff 100%)
                    `,
                }}
            />
            
            {/* Tech Grid Overlay (Subtle Data feel) */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                }}
            />

            {/* Moving Ambient Orbs */}
            <Box sx={{
                position: 'absolute', top: '20%', left: '15%', width: '30vw', height: '30vw',
                background: '#7c4dff', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%',
                animation: `${floatAnimation} 8s ease-in-out infinite alternate`
            }} />
            <Box sx={{
                position: 'absolute', bottom: '10%', right: '10%', width: '25vw', height: '25vw',
                background: '#ff6b35', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%',
                animation: `${floatAnimation} 6s ease-in-out infinite alternate-reverse`
            }} />

            {/* --- 2. Main Content Container --- */}
            <Container 
                maxWidth="lg" 
                sx={{ 
                    height: '100%', 
                    position: 'relative', 
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between', // Pushes content to edges
                    alignItems: 'center',
                    py: isMobile ? 2 : 4
                }}
            >
                
                {/* --- Top Section: Department & Logo --- */}
                <Stack alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  
                    
                   
                     <img
                        className='logo_gov'
                        src={logo}
                        alt="Logo"
                    />
                      <Typography 
                        variant="overline" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.6)', 
                            letterSpacing: '0.2em',
                            fontSize: isMobile ? '0.6rem' : '0.8rem',
                            textAlign: 'center'
                        }}
                    >
                        Government of Kerala
                    </Typography>
                </Stack>


                {/* --- Middle Section: Hero Title --- */}
                <Stack alignItems="center" sx={{ textAlign: 'center', position: 'relative' }}>
                    {/* Decorative glow behind title */}
                    
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '120%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(255,210,63,0.15) 0%, transparent 70%)',
                        zIndex: -1
                    }} />

                    <Typography
                        variant="h1"
                        sx={{
                            fontFamily: '"Inter", "Roboto", sans-serif',
                            fontWeight: 900,
                            fontSize: isMobile ? '3.5rem' : '6rem',
                            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #a0a0a0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                            mb: 1,
                            filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))'
                        }}
                    >
                        AIDEA
                    </Typography>
                    
                    <Typography
                        variant="h5"
                        sx={{
                            background: 'linear-gradient(90deg, #ff6b35, #ffd23f)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            fontSize: isMobile ? '0.8rem' : '1.2rem',
                            mb: 3
                        }}
                    >
                       Application for Intelligent Data Engineering & Analytics
                    </Typography>

                    {/* Horizontal Divider */}
                    <Box sx={{ width: '60px', height: '4px', background: '#ffd23f', borderRadius: '2px', opacity: 0.8 }} />
                </Stack>
              <Stack direction="row" spacing={3}>
    <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px',
            px: 3,
            py: 1,
        }}
    >
        <Box sx={{ width: 70, height: 70, borderRadius: '50%', overflow: 'hidden' }}>
            <img
                src={deslogo}
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover',}}
            />
        </Box>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
            Dept. of Economics & Statistics
        </Typography>
    </Stack>

    <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px',
            px: 3,
            py: 1,
        }}
    >
        <Box sx={{ width: 150, height: 50, borderRadius: '4%', overflow: 'hidden' }}>
            <img
                src={duk_logo}
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </Box>
        {/* <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
            Digital University Kerala
        </Typography> */}
    </Stack>

     <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50px',
            px: 3,
            py: 1,
        }}
    >
        <Box sx={{ width: 200, height: 60, borderRadius: '4%', overflow: 'hidden' }}>
            <img
                src={cdti_logo}
                alt="Logo"
                style={{ width: '10rem', height: '3.5rem', objectFit: 'cover' }}
            />
        </Box>
        {/* <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
            Digital University Kerala
        </Typography> */}
    </Stack>
</Stack>

{/* <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
    {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ].map((item) => (
        <Box
            key={item.label}
            sx={{
                minWidth: 70,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '14px',
                px: 2,
                py: 1.5,
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffd23f' }}>
                {item.value}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)' }}>
                {item.label.toUpperCase()}
            </Typography>
        </Box>
    ))}
</Stack> */}

                {/* --- Bottom Section: CM Card & Action --- */}
                <Stack spacing={4} alignItems="center" sx={{ width: '100%', maxWidth: '600px' }}>
                    
                    {/* Glass Card for CM */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            p: isMobile ? 2 : 4,
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Gold Border Top */}
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #ffd23f, transparent)' }} />

                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                            Officially Inaugurating By
                        </Typography>
                        
                        <Typography variant={isMobile ? "h4" : "h3"} 
                            sx={{ 
                                fontWeight: 800, 
                                color: '#fff',
                                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                mb: 0.5,
                                fontSize: isMobile ? '1.8rem' : '2.5rem'
                            }}
                        >
                            Shri. Pinarayi Vijayan
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: '#ffd23f', fontWeight: 500, fontSize: isMobile ? '1rem' : '1.25rem' }}>
                            Hon'ble Chief Minister
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 1)', mt: 2, fontStyle: 'italic' }}>
                            January 03, 2026 • Thiruvananthapuram
                        </Typography>
                    </Paper>

                    {/* Launch Button */}
                    <Button
                    autoFocus
                        onClick={onInaugurate}
                        variant="contained"
                        size="large"
                        endIcon={<AutoAwesomeIcon />}
                        sx={{
                            borderRadius: '50px',
                            px: 6,
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            background: 'linear-gradient(270deg, #ff6b35, #f50057, #ff6b35)',
                            backgroundSize: '200% 200%',
                            animation: `${bgShift} 3s ease infinite, ${glowPulse} 2s infinite`,
                            boxShadow: '0 10px 30px rgba(245, 0, 87, 0.3)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            textTransform: 'none',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            }
                        }}
                    >
                        Click to Launch
                    </Button>
                </Stack>
            </Container>
        </Box>
        </>
    );
};

export default InaugurationLandingPage;
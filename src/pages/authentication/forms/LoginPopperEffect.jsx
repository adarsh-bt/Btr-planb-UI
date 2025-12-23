import React from 'react';
import { Box, keyframes } from '@mui/material';

const popperRibbon = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  40% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  60% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
  100% {
    transform: scale(0) rotate(720deg);
    opacity: 0;
  }
`;

const confettiFall = keyframes`
  0% { 
    transform: translateY(-100vh) translateX(0) rotate(0deg); 
    opacity: 1; 
  }
  70% {
    opacity: 1;
  }
  100% { 
    transform: translateY(100vh) translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 720}deg); 
    opacity: 0; 
  }
`;

const LoginPopperEffect = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Main popper base */}
      <Box
        sx={{
          position: 'absolute',
          width: '60px',
          height: '120px',
          background: 'linear-gradient(45deg, #ff4444, #ff8844)',
          borderRadius: '30px 30px 10px 10px',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          animation: `${popperRibbon} 1.5s ease-out forwards`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '30px',
            background: 'linear-gradient(45deg, #ffff44, #ffaa44)',
            borderRadius: '10px 10px 5px 5px',
          }
        }}
      />
      
      {/* Ribbon burst */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '4px',
            height: '60px',
            background: i % 3 === 0 ? '#ff4444' : i % 3 === 1 ? '#44ff44' : '#4444ff',
            top: '40%',
            left: '50%',
            transformOrigin: 'bottom center',
            transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-30px)`,
            opacity: 0,
            animation: `
              ${confettiFall} 2s ease-out forwards ${i * 0.1}s,
              ${popperRibbon} 1.5s ease-out forwards
            `,
            borderRadius: '2px',
            boxShadow: '0 0 10px currentColor',
          }}
        />
      ))}
      
      {/* Sparkles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Box
          key={`sparkle-${i}`}
          sx={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            background: ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff'][i % 5],
            top: '40%',
            left: '50%',
            borderRadius: '50%',
            opacity: 0,
            animation: `
              ${confettiFall} 1.5s ease-out forwards ${i * 0.02}s
            `,
            boxShadow: '0 0 8px currentColor',
          }}
        />
      ))}
    </Box>
  );
};

export default LoginPopperEffect;
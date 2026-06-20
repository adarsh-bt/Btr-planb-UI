import React, { useState, useEffect } from 'react';
import { Box, Backdrop } from '@mui/material';
import '../login.css'; // Make sure this includes the above CSS

const LoginCurtain = ({ onFinish }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    // Start the curtain animation sequence
    const timer1 = setTimeout(() => {
      setIsOpen(true);
      setIsExpanded(true);
    }, 500);

    const timer2 = setTimeout(() => {
      setShowTitle(true);
    }, 2000);

    // Complete the animation and call onFinish
    const timer3 = setTimeout(() => {
      onFinish();
    }, 8000); // Total animation duration

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  return (
    <Backdrop
      open={true}
      sx={{
        zIndex: 9999,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box 
        className={`theatrical-curtain-container ${isExpanded ? 'expand' : ''}`}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className={`theatrical-curtain ${isOpen ? 'open' : ''}`}>
          <div className="ground theatrical-ground"></div>
          <div className="left"></div>
          <div className="right"></div>
        </div>
        
        {showTitle && (
          <h1 className="theatrical-title">
            AIDEA
          </h1>
        )}
      </Box>
    </Backdrop>
  );
};

export default LoginCurtain;
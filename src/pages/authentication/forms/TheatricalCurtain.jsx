import React, { useState, useEffect } from 'react';
import { Box, Backdrop, Typography } from '@mui/material';
import '../login.css';
import aieda from '../images/aidea.png';

const TheatricalCurtain = ({ onFinish, title = "AIDEA" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => {
      setIsOpen(true);
    }, 100);

    const timer2 = setTimeout(() => {
      setIsExpanded(true);
    }, 300);

    const timer3 = setTimeout(() => {
      setShowTitle(true);
    }, 2500);

    const timer4 = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <Backdrop
      open={true}
      sx={{
        zIndex: 9999,
       background: 'linear-gradient(180deg, #0e45bbff, #73b1f8ff)',
      }}
    >
      <Box 
        className={`theatrical-curtain-container ${isExpanded ? 'expand' : ''}`}
      >
        <div className={`theatrical-curtain ${isOpen ? 'open' : ''}`}>
          <div className="theatrical-ground"></div>
          <div className="left"></div>
          <div className="right"></div>
        </div>
        
      {showTitle && (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      zIndex: 10,
    }}
  >
    {/* Logo */}
    <Box
      component="img"
      src={aieda}
      alt="AIDEA Logo"
      sx={{
        width: 180,
        height: 'auto',
        animation: 'fadeInScale 1.5s ease forwards',
        borderRadius: '50%',
      }}
    />

    {/* Title */}
    <Typography
      className="theatrical-title"
      sx={{
        fontFamily: "'Open Sans', sans-serif",
        fontSize: { xs: '4rem', md: '8rem', lg: '12rem' },
        fontWeight: 700,
        color: 'white',
        letterSpacing: '0.15em',
        animation: 'fadeInUp 1.5s ease forwards',
      }}
    >
      {title}
    </Typography>
  </Box>
)}

      </Box>
    </Backdrop>
  );
};

export default TheatricalCurtain;
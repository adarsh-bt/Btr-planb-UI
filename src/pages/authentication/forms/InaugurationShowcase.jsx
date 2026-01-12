import React, { useEffect, useState } from "react";
import { Box, Typography, Fade, } from "@mui/material";
import cmImg from "../images/CM.jpg"; // CM photo
import gokLogo from "../images/gok_logo1.png";


const TypingText = React.memo(
  ({ text, variant = "h4", delay = 50, onDone, sx }) => {
    const [displayed, setDisplayed] = useState("");
    const doneRef = React.useRef(false);

    useEffect(() => {
      setDisplayed("");
      doneRef.current = false;

      let index = 0;
      const interval = setInterval(() => {
        index++;
        setDisplayed(text.slice(0, index));

        if (index === text.length && !doneRef.current) {
          doneRef.current = true;
          clearInterval(interval);
          onDone && onDone();
        }
      }, delay);

      return () => clearInterval(interval);
      // 👇 INTENTIONALLY exclude onDone
    }, [text, delay]);

    return (
      <Typography variant={variant} sx={sx}>
        {displayed}
      </Typography>
    );
  }
);


const InaugurationShowcase = ({ onFinish }) => {
  const [typingDone, setTypingDone] = useState(false);
  const [counter, setCounter] = useState(3);

  useEffect(() => {
    if (!typingDone) return;

    if (counter < 0) {
      onFinish();
      return;
    }

    const timer = setTimeout(() => {
      setCounter((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, typingDone, onFinish]);

  return (
    <Fade in timeout={1000}>
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          px: 3
        }}
      >
        <Box maxWidth={900}>
          <img src={gokLogo} alt="GoK" width={100} />

          <TypingText
            text="AIDEA"
            variant="h3"
            delay={80}
            sx={{ mt: 2, fontWeight: "bold" }}
          />

          <TypingText
            text="Application for Intelligent Data Engineering and Analytics"
            variant="h6"
            delay={30}
            sx={{ opacity: 0.9, mt: 1 }}
          />

          <Box sx={{ mt: 4 }}>
            <img
              src={cmImg}
              alt="Honourable Chief Minister"
              style={{
                width: "200px",
                borderRadius: "50%",
                boxShadow: "0 0 25px rgba(255,255,255,0.6)"
              }}
            />
          </Box>

          <TypingText
            text="Inaugurated by"
            variant="h5"
            delay={60}
            sx={{ mt: 3, fontWeight: 600 }}
          />

          <TypingText
            text={`Hon’ble Chief Minister\nShri Pinarayi Vijayan`}
            variant="h4"
            delay={70}
            sx={{
              color: "#ffd23f",
              fontWeight: "bold",
              whiteSpace: "pre-line",
              textShadow: "0 0 12px rgba(255,210,63,0.9)"
            }}
            onDone={() => setTypingDone(true)}
          />

          <Typography variant="h6" sx={{ mt: 4 }}>
            Department of Economics & Statistics  
            <br />
            Government of Kerala
          </Typography>

          {typingDone && (
            <Box sx={{ mt: 5 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "'Courier New', monospace",
                  color: "#f5ac0eff",
                  fontSize: "6em",
                  animation: "pulse 1s infinite"
                }}
              >
                {counter >= 0 ? counter : "Welcome"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};



export default InaugurationShowcase;

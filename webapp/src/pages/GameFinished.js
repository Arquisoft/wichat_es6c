import React, { useState, useEffect, useRef } from "react";
import { useTheme } from '@mui/material/styles';

import { Button, Typography, Stack, Box, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from 'react-confetti';
import { useTranslation } from "react-i18next";

import { keyframes } from "@mui/system";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const GameFinished = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [gameType, setGameType] = useState('normal');
  const videoRef = useRef(null);
  const theme = useTheme();

  const winningSoundRef = useRef(new Audio("/sound/winning.mp3")); // Ajusta la ruta

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  //const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    if (location.state) {
      setScore(location.state.score);
      setTotalTime(location.state.totalTime);
      setMaxScore(location.state.maxScore);
      setGameType(location.state.gameType);
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location]);

  // Efecto para reproducir sonido si hay confeti
  useEffect(() => {
    if (maxScore > 0 && score >= (maxScore / 2)) {
      console.log(score, maxScore / 2);

      const winningAudio = winningSoundRef.current;
      winningAudio.volume = 1;
      const playPromise = winningAudio.play();
      if (playPromise !== null && playPromise !== undefined) {
        playPromise.catch((error) => {
          // Silenciosamente ignorar el error si autoplay está bloqueado
          if (error.name !== 'AbortError') {
            console.warn('Autoplay bloqueado:', error.message);
          }
        });
      }
    }
  }, [score, maxScore]);

  const handleRestart = () => {
    navigate('/game-mode', { state: { type: gameType } });
  };

  const handleGoToHistorical = () => {
    navigate('/history');
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.5; // Reduce la velocidad si es necesario
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(error => {
          console.warn("Auto-play was prevented:", error);
        });
      }
    }
  }, []);

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={isMobile ? 1.3 : 3}
      sx={{
        textAlign: "center",
        ...(isMobile ? { maxHeight: "100%" } : { height: "100%" })
      }}
    >
      {/* Confetti */}
      {score >= (maxScore / 2) && <Confetti width={windowWidth} height={windowHeight} />}

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          animation: `${pulse} 2s infinite`,
          fontSize: { xs: "3rem", md: "3rem" },
          position: "relative",
          color: 'white',
          borderRadius: '11px',
          backgroundColor: '#6A0DAD',
          top: { xs: "1vh", md: "-7vw" }
        }}
      >
        {t("GameFinished.gameOver")}
      </Typography>

      {/* Final score */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ position: "relative", top: { xs: "-2vh", md: "-50px" } }}
      >,
        {/* Video de fondo - Configuración idéntica a HomePage */}
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            transform: "translate(-50%, -50%)",
            zIndex: -1,
            objectFit: "cover",
            opacity: 0.7,
          }}
        >
          <source src="/videos/background_white_small.mp4" type="video/mp4" />
        </Box>

        {/* Capa oscura para mejorar legibilidad - Configuración idéntica */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.09)",
            zIndex: -1,
          }}
        />

        {/* Score */}
        <Box
          sx={{
            padding: 3,
            border: '2px solid #9b33c0',
            borderRadius: 2,
            backgroundColor: '#c7f28e',
            textAlign: 'center',
            boxShadow: 3,
            width: { xs: '80%', md: '20%' },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: "1rem", md: "1.25rem" } }}>
            {t("GameFinished.socoreAchieved")}
          </Typography>
          <Typography variant="h5" sx={{ color: '#040502', marginTop: 1 }}>
            {score} / {maxScore}
          </Typography>
        </Box>

        {/* Total time */}
        <Box
          sx={{
            padding: 3,
            border: '2px solid #9b33c0',
            borderRadius: 2,
            backgroundColor: '#e3f2fd',
            textAlign: 'center',
            boxShadow: 3,
            width: { xs: '80%', md: '20%' },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: "1rem", md: "1.25rem" } }}>
            {t("GameFinished.totalTime")}
          </Typography>
          <Typography variant="h5" sx={{ color: '#040502', marginTop: 1 }}>
            {totalTime} {t("GameFinished.seconds")}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
        <Button
          variant="contained"
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            px: 4, // padding horizontal
            py: 2, // padding vertical
            backgroundColor: '#9b33c0',
            minWidth: { xs: '150px', md: '200px' } // tamaño mínimo pero NO ensancha todo
          }}
          onClick={handleRestart}
        >
          {t("GameFinished.playAgain")}
        </Button>

        <Button
          variant="contained"
          sx={{
            fontSize: { xs: "1rem", md: "1.2rem" },
            px: 4,
            py: 2,
            backgroundColor: '#e2a4f5',
            color: 'black',
            minWidth: { xs: '150px', md: '200px' }
          }}
          onClick={handleGoToHistorical}
        >
          {t("GameFinished.viewHistory")}
        </Button>
      </Stack>
    </Stack>
  );
};

export default GameFinished;

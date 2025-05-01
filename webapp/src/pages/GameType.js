import React, {  useEffect, useRef } from "react";
import { Button, Stack, Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function GameType() {
  const { t } = useTranslation();
  const videoRef = useRef(null);

  const buttonList = [
    { text: t("GameType.normal"), type: 'normal', imageSrc: '/images/gameMode/default-type.jpg' },
    { text: t("GameType.vs"), type: 'vs', imageSrc: '/images/gameMode/vs-ia.jpg' }
  ];

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallScreen = useMediaQuery('(max-width:400px)');
  const handleGameMode = (item) => {
    navigate("/game-mode", { state: { type: item.type } });
  };
  const handleGoBack = () => {
    navigate('/homepage');
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
    <Box sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
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

      {/* Contenido principal (se mantiene igual que tu versión original) */}
      <Stack
        direction="column"
        alignItems="center"
        spacing={{ xs: 2, sm: 4 }}
        sx={{
          width: "100%",
          justifyContent: "center",
          height: "100%",
          px: { xs: 1, sm: 2 },
          pt: { xs: 6, sm: 8 },
          pb: { xs: 4, sm: 6 },
          boxSizing: 'border-box',
          overflow: 'auto',
        }}
      >

        <Button
          variant="outlined"
          onClick={handleGoBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            position: "absolute",
            top: "4%",
            left: "5%",
            width: { xs: "40%", sm: "20%" },
            fontSize: { xs: "0.8rem", sm: "1rem" },
            textTransform: "none",
            color: "#ffffff",
            border: "0.1rem solid rgba(255, 255, 255, 0.4)",
            borderRadius: "1rem",
            fontWeight: "bold",
            background: "rgba(128, 0, 128, 0.48)",
            boxShadow: "0 0.5rem 1.5rem rgba(106, 13, 173, 0.53)",
            transition: "all 0.4s ease",
            "&:hover": {
              background: "rgba(128, 0, 128, 0.4)",
              borderColor: "rgba(255, 255, 255, 0.6)",
              transform: "scale(1.08)",
              boxShadow: "0 0.6rem 1.8rem rgba(75, 0, 130, 0.5)",
            },
          }}
        >
          {t("GameMode.goBack")}
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '2.5rem' },
            textAlign: 'center',
            letterSpacing: { xs: 'normal', sm: '1px' },
            px: 1,
            color: 'white',
            backgroundColor: '#6A0DAD',
            borderRadius: '11px',
            mb: { xs: 3, sm: 4 },
            mt: { xs: 2, sm: 3 }
          }}
        >
          {t("GameType.chooseGame")}
        </Typography>

        <Stack
          direction={isSmallScreen ? 'column' : 'row'}
          spacing={{ xs: 3, sm: 4 }}
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '100%',
            maxWidth: '1200px',
            p: { xs: 1, sm: 0 }
          }}
        >
          {buttonList.map((item, index) => (
            <Button
              key={index}
              variant="contained"
              onClick={() => handleGameMode(item)}
              sx={{
                width: { xs: '90%', sm: '300px', md: '350px' },
                height: { xs: isVerySmallScreen ? '150px' : '180px', sm: '300px', md: '350px' },
                minWidth: 'unset',
                fontSize: '16px',
                textTransform: 'none',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  transform: { xs: 'none', sm: 'scale(1.02)' },
                  boxShadow: 4
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Box
                component="img"
                src={item.imageSrc}
                alt={item.text}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  filter: 'brightness(0.8)',
                  '&:hover': {
                    filter: 'brightness(1)'
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  p: 1,
                  textAlign: 'center',
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  fontWeight: 'bold'
                }}
              >
                {item.text}
              </Box>
            </Button>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default GameType;
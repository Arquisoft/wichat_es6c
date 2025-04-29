import { React, useState, useEffect, useMemo, useRef } from 'react';
import { Button, Stack, Typography, Box, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

function GameMode() {
  const [gameType, setGameType] = useState('');
  const [buttonList, setButtonList] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const videoRef = useRef(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallScreen = useMediaQuery('(max-width:400px)');
  const normalButtonList = useMemo(() => [
    { text: t('GameMode.countryText'), path: '/game', mode: 'country', name: "country", imageSrc: '/images/gameMode/pais-gameMode.jpg' },
    { text: t('GameMode.flagText'), path: '/game', mode: 'flag', name: "flag", imageSrc: '/images/gameMode/flag-gameMode.jpg' },
  ], [t]);

  const vsButtonList = useMemo(() => [
    { text: t('GameMode.countryText'), path: '/game-vs', mode: 'country', name: "country", imageSrc: '/images/gameMode/pais-gameMode.jpg' },
  ], [t]);

  useEffect(() => {
    if (location.state?.type) {
      setGameType(location.state.type);
    }
  }, [location]);

  useEffect(() => {
    if (gameType === 'normal') {
      setButtonList(normalButtonList);
    } else if (gameType === 'vs') {
      setButtonList(vsButtonList);
    }
  }, [gameType, normalButtonList, vsButtonList]);


  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.5; // Reduce la velocidad si es necesario
      video.play().catch(error => {
        console.log("Auto-play was prevented:", error);
      });
    }
  }, []);


  const handleGameMode = (item) => {
    navigate(item.path, { state: { mode: item.mode, name: item.name } });
  };
  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={{ xs: 2, sm: 4 }}
      sx={{
        width: "100%",
        justifyContent: "center",
        height: "100%",
        px: { xs: 1, sm: 2 },
        pt: { xs: 6, sm: 8 }, // Aumentado el padding top para bajar el título
        pb: { xs: 4, sm: 6 }, // Ajustado el padding bottom
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >

      {/* Video de fondo */}
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

      {/* Capa oscura para mejorar legibilidad */}
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
          mb: { xs: 3, sm: 4 }, // Aumentado el margin bottom para separar más del contenido
          mt: { xs: 2, sm: 3 } // Añadido margin top adicional
        }}
      >
        {t("GameMode.chooseTheme")}
      </Typography>

      <Stack
        direction={isSmallScreen ? 'column' : 'row'}
        spacing={{ xs: 3, sm: 4 }} // Aumentado el spacing entre botones
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
  );
}

export default GameMode;
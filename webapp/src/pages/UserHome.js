import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardActionArea,
  CardContent, 
  CardMedia,
  IconButton,
  useTheme
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SessionContext } from "../SessionContext";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { username } = useContext(SessionContext);
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);

  const gameModes = [
    { 
      title: t('GameType.normal'), 
      description: t('GameType.normalDescription'),
      image: '/images/gameMode/default-type.jpg',
      type: 'normal'
    },
    { 
      title: t('GameType.vs'), 
      description: t('GameType.vsDescription'),
      image: '/images/gameMode/vs-ia.jpg',
      type: 'vs'
    }
  ];

  const maxSteps = gameModes.length;

  // Efecto para el autoplay
  useEffect(() => {
    let interval;
    if (autoPlay && !hovered) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % maxSteps);
      }, 2000); // Cambia cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [autoPlay, hovered, maxSteps]);

  const handleNext = () => {
    setAutoPlay(false);
    setActiveStep((prev) => (prev + 1) % maxSteps);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const handleBack = () => {
    setAutoPlay(false);
    setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const handleGameModeSelect = (type) => {
    navigate('/game-mode', { state: { type } });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: theme.palette.background.default
    }}>
      <Box sx={{ 
        flexGrow: 1, 
        display: "flex",
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
      }}>
        {username && (
          <Typography variant="h4" sx={{ marginBottom: 2, color: theme.palette.text.primary }}>
            {t('UserHome.welcome', { username })}
          </Typography>
        )}

        {/* Carrusel mejorado */}
        <Box 
          sx={{ 
            width: { xs: '80%', sm: '60%', md: '40%' }, // Tamaños relativos según el tamaño de la pantalla
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
            margin: '0 auto', // Centrar horizontalmente
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardActionArea onClick={() => handleGameModeSelect(gameModes[activeStep].type)}>
            <Card sx={{ height: '100%' }}> {/* Asegurar que el Card ocupe todo el espacio disponible */}
              <CardMedia
                component="img"
                sx={{
                  width: '100%', // Imagen adaptada al ancho del contenedor
                  height: 'auto', // Ajustar altura automáticamente
                  maxHeight: { xs: '200px', sm: '250px', md: '300px' }, // Limitar altura en pantallas pequeñas
                  objectFit: 'cover', // Ajustar la imagen al contenedor
                  aspectRatio: '4/3', // Mantener proporción más compacta
                }}
                image={gameModes[activeStep].image}
                alt={gameModes[activeStep].title}
              />
              <CardContent sx={{ 
                backgroundColor: theme.palette.background.paper,
                padding: { xs: 1, sm: 2 }, // Reducir padding en pantallas pequeñas
              }}>
                <Typography gutterBottom variant="h6" component="div" color="text.primary" textAlign="center">
                  {gameModes[activeStep].title}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {gameModes[activeStep].description}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>

          {/* Controles de navegación */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'absolute',
            top: '35%',
            width: '95%',
            transform: 'translateY(-50%)',
            px: 1, // Reducir padding horizontal
          }}>
            <IconButton
              size="1rem" // Reducir tamaño del botón
              onClick={(e) => {
                e.stopPropagation();
                handleBack();
              }}
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <KeyboardArrowLeft fontSize="small" />
            </IconButton>
            
            <IconButton
              size="1rem" // Reducir tamaño del botón
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <KeyboardArrowRight fontSize="small" />
            </IconButton>
          </Box>

          {/* Indicadores de posición */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            bottom: 8, // Reducir espacio inferior
            width: '100%',
            gap: 0.5, // Reducir espacio entre indicadores
          }}>
            {gameModes.map((_, index) => (
              <Box
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoPlay(false);
                  setActiveStep(index);
                  setTimeout(() => setAutoPlay(true), 10000);
                }}
                sx={{
                  width: { xs: 6, sm: 8 }, // Tamaño más pequeño
                  height: { xs: 6, sm: 8 }, // Tamaño más pequeño
                  borderRadius: '50%',
                  backgroundColor: index === activeStep ? theme.palette.primary.main : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="large"
          sx={{ 
            fontSize: { xs: '0.5 rem', sm: '1 rem', md: '2 rem' }, 
            px: 3, 
            py: 1.5,
            mt: 2
          }} 
          onClick={() => navigate('/game-type')}
        >
          {t('UserHome.moreOptions')}
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
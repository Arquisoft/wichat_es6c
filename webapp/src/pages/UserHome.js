import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Avatar,
  Grid,
  LinearProgress,
  Skeleton,
  useMediaQuery
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SessionContext } from "../SessionContext";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import AIGreeting from "../components/AIGreeting";
import axios from "axios";
import { createTheme } from '@mui/material/styles';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { username } = useContext(SessionContext);
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const videoRef = useRef(null);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#6A0DAD',  // Color morado
        dark: '#4A0D80',  // Morado más oscuro para hover
        light: '#8E24AA', // Morado más claro
      },
    },
  });
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const gameModes = [
    {
      title: t("GameType.normal"),
      description: t("GameType.normalDescription"),
      image: "/images/gameMode/default-type.jpg",
      type: "normal",
    },
    {
      title: t("GameType.vs"),
      description: t("GameType.vsDescription"),
      image: "/images/gameMode/vs-ia.jpg",
      type: "vs",
    },
  ];

  const maxSteps = gameModes.length;

  // Efecto para el autoplay
  useEffect(() => {
    let interval;
    if (autoPlay && !hovered) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % maxSteps);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, hovered, maxSteps]);

  // Efecto para cargar datos del usuario
  useEffect(() => {
    if (username) {
      setLoadingStats(true);
      console.log("Fetching user stats and profile for:", username);
      Promise.all([
        axios.get(
          `http://localhost:8000/getUserStats`, { params: { username } })
        ,
        axios.get(
          `${process.env.HISTORY_SERVICE_URL || "http://localhost:8000"}/user/profile/${username}`
        ),
      ])
        .then(([statsRes, profileRes]) => {
          setUserStats(statsRes.data);
          setUserProfile(profileRes.data);
        })
        .finally(() => setLoadingStats(false));
    }
  }, [username]);

  // Efecto para manejar la reproducción del video
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
    navigate("/game-mode", { state: { type } });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
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

      {/* Contenido principal */}
      <Grid
        container
        spacing={2}
        sx={{
          height: "100vh",
          p: { xs: 2, md: 4 },
          overflow: "auto",
          alignItems: "flex-start",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Columna izquierda - LLM */}
        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflow: "hidden",
            p: { xs: 1, sm: 2 },
          }}
        >
          {username && <AIGreeting />}
        </Grid>

        {/* Contenido principal - Centrado */}
        <Grid
          item
          xs={12}
          lg={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflow: "hidden",
            p: { xs: 1, sm: 2 },
            height: "100%",
          }}
        >
          {/* Carrusel */}
          <Box
            sx={{
              width: { xs: "90%", sm: "70%", md: "30%", lg: "50%" },
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 3,
              mb: 2,
              mt: { xs: 2, sm: 4 },
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CardActionArea onClick={() => handleGameModeSelect(gameModes[activeStep].type)}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                  image={gameModes[activeStep].image}
                  alt={gameModes[activeStep].title}
                />
                <CardContent
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    padding: { xs: 1, sm: 2 },
                  }}
                >
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    color="text.primary"
                    textAlign="center"
                    sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                  >
                    {gameModes[activeStep].title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {gameModes[activeStep].description}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>

            {/* Controles de navegación */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                position: "absolute",
                top: "35%",
                width: "95%",
                transform: "translateY(-50%)",
                px: 1,
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                sx={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.7)",
                  },
                }}
              >
                <KeyboardArrowLeft fontSize="small" />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                sx={{
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.7)",
                  },
                }}
              >
                <KeyboardArrowRight fontSize="small" />
              </IconButton>
            </Box>

            {/* Indicadores de posición */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                position: "absolute",
                bottom: 8,
                width: "100%",
                gap: 0.5,
              }}
            >
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
                    width: { xs: 6, sm: 10, md: 12, lg: 14 },
                    height: { xs: 6, sm: 10, md: 12, lg: 14 },
                    borderRadius: "50%",
                    backgroundColor: index === activeStep ? theme.palette.primary.main : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Botón más opciones */}
          {!isMobile && (
            <Button
              variant="outlined"
              size="large"
              sx={{
                mt: 3,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: { xs: "0.875rem", sm: "1rem" },
                width: { xs: "90%", sm: "70%", md: "30%", lg: "40%" },
                color: 'white',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: 'white'
                },
              }}
              onClick={() => navigate("/game-type")}
            >
              {t("UserHome.moreOptions")}
            </Button>
          )}
        </Grid>

        {/* Columna derecha - Info usuario */}
        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            p: { xs: 1, sm: 2 },
          }}
        >
          {loadingStats ? (
            <Box>
              <Skeleton variant="rectangular" width="100%" height={"100%"} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={"100%"} />
            </Box>
          ) : username && userProfile ? (
            <Box>
              {/* Tarjeta de perfil compacta */}
              <Card sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, height: "100%", width: "100%" }}>
                  <Avatar src={userProfile.profilePicture} sx={{ width: "30%", height: "50%", mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">{userProfile.name || username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{username}
                    </Typography>
                  </Box>
                </Box>
                {userProfile.description && (
                  <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                    "{userProfile.description}"
                  </Typography>
                )}
              </Card>

              {/* Estadísticas */}
              {userStats && (
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('History.generalStats')}
                  </Typography>

                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2">{t('History.totalGames')}</Typography>
                      <Typography variant="h6">{userStats.totalGames || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{t('History.correct')}</Typography>
                      <Typography variant="h6">
                        {userStats.totalCorrect
                          ? `${((userStats.totalCorrect / (userStats.totalWrong + userStats.totalCorrect)) * 100).toFixed(2)}%`
                          : "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(((userStats.totalCorrect / (userStats.totalWrong + userStats.totalCorrect)) * 100).toFixed(2))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                      backgroundColor: "red",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "blue",
                      },
                    }}
                  />
                  <Typography variant="caption">
                    {t('History.correct')} / {t('History.incorrect')}: {userStats.totalCorrect || 0} / {userStats.totalWrong || 0}
                  </Typography>
                </Card>
              )}
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
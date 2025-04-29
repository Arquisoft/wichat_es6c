import { React, useState, useEffect, useMemo } from 'react';
import { Button, Stack, Typography, Box, useMediaQuery } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function GameMode() {
  const [gameType, setGameType] = useState('');
  const [buttonList, setButtonList] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const normalButtonList = useMemo(() => [
    { text: 'Países', path: '/game', mode: 'country', name: "country", imageSrc: '/images/gameMode/pais-gameMode.jpg' },
    { text: 'Famosos', path: '/game', mode: 'famous_people', name: "celebrity", imageSrc: '/images/gameMode/famous-gameMode.jpg' },
    { text: 'Banderas', path: '/game', mode: 'flag', name: "flag", imageSrc: '/images/gameMode/flag-gameMode.jpg' },
  ], []);

  const vsButtonList = useMemo(() => [
    { text: 'Famosos', path: '/game', mode: 'famous_people', name: "famous people", imageSrc: '/images/gameMode/famous-gameMode.jpg' },
    { text: 'Banderas', path: '/game-vs', mode: 'flag', name: "country", imageSrc: '/images/gameMode/pais-gameMode.jpg' },
  ], []);

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

  const handleGameMode = (item) => {
    navigate(item.path, { state: { mode: item.mode, name: item.name } });
  };
  const handleGoBack = () => {
    navigate('/game-type');
  };

  
  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={4}
      sx={{
        width: "100%",
        justifyContent: "center",
        height: "100%",
        px: "5%",
        py: "5%",
        boxSizing: 'border-box',
        position: 'relative'
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
          color: '#0a0a0a',
          fontSize: { xs: '2rem', sm: '2.5rem' },
          textAlign: 'center',
          letterSpacing: '1px',
        }}
      >
        {t("GameMode.chooseTheme")}
      </Typography>

      <Stack
        direction={isSmallScreen ? 'column' : 'row'}
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{ width: '100%' }}
      >
        {buttonList.map((item, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={() => handleGameMode(item)}
            sx={{
              width: { xs: '80%', sm: '300px' },
              height: { xs: '200px', sm: '350px' },
              fontSize: '16px',
              textTransform: 'none',
              padding: 0,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
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
              }}
            />
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

export default GameMode;

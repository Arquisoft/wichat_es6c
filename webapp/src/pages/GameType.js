import React from 'react';
import { Button, Stack, Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function GameType() {
  const buttonList = [
    { text: 'Normal', type: 'normal', imageSrc: '/images/gameMode/default-type.jpg' },
    { text: 'VS IA', type: 'vs', imageSrc: '/images/gameMode/vs-ia.jpg' }
  ];

  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGameMode = (item) => {
    navigate("/game-mode", { state: { type: item.type } });
  };

  const handleGoBack = () => {
    navigate('/homepage');
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
        backgroundColor: '#f5f5f5', // Fondo adaptable
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
          fontSize: { xs: '1.8rem', sm: '2.5rem' }, // Tamaño responsivo
          textAlign: 'center',
          letterSpacing: '1px',
        }}
      >
        {t("GameType.chooseGame")}
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
              width: { xs: '90%', sm: '40%' },
              height: { xs: '25vh', sm: '35vh', md: "45vh" },
              fontSize: '16px',
              textTransform: 'none',
              padding: 0,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Sombra para mejor visibilidad
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
                objectPosition: 'center',
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

export default GameType;

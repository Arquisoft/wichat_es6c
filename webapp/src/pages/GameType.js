import React from 'react';
import { Button, Stack, Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';



function GameType() {

  const { t } = useTranslation();

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
        pt: { xs: 6, sm: 8 },
        pb: { xs: 4, sm: 6 },
        boxSizing: 'border-box',
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#0a0a0a',
          fontSize: { xs: '1.5rem', sm: '2.5rem' },
          textAlign: 'center',
          letterSpacing: { xs: 'normal', sm: '1px' },
          px: 1,
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
  );
}

export default GameType;
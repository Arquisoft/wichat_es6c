import React from 'react';
import { Button, Stack, Typography, Box, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

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

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={4}
      sx={{
        width: "100%",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        py: 4,
        boxSizing: 'border-box',
      }}
    >
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
              width: { xs: '80vw', sm: '300px' },
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

export default GameType;

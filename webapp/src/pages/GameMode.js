import { React, useState, useEffect, useMemo } from 'react';
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const normalButtonList = useMemo(() => [
    { text: 'Países', path: '/game', mode: 'country', name: "country", imageSrc: '/images/gameMode/pais-gameMode.jpg' },
    { text: 'Banderas', path: '/game', mode: 'flag', name: "flag", imageSrc: '/images/gameMode/flag-gameMode.jpg' },
  ], []);

  const vsButtonList = useMemo(() => [
    { text: 'Países', path: '/game-vs', mode: 'country', name: "country", imageSrc: '/images/gameMode/pais-gameMode.jpg' },
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

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={4}
      sx={{
        width: "100%",
        justifyContent: "center",
        height: "100%",
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

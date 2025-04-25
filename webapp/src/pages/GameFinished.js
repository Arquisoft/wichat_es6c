import React, { useState, useEffect, useRef } from "react";
import { Button, Typography, Stack, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from 'react-confetti';
import { useTranslation } from "react-i18next";

const GameFinished = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [gameType, setGameType] = useState('normal');

  const { t } = useTranslation();

  const winningSoundRef = useRef(new Audio("/sound/winning.mp3")); // Ajusta la ruta


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
    if (score >= 5) {


      const winningAudio = winningSoundRef.current;
      winningAudio.volume = 1;
      winningAudio.play();

      
    }
  }, [score]);

  const handleRestart = () => {
    navigate('/game-mode', { state: { type: gameType } });
  };

  const handleGoToHistorical = () => {
    navigate('/history');
  };

  return (
    <Stack alignItems="center" justifyContent="center" spacing={4} sx={{ height: "100vh", textAlign: "center" }}>
      {score >= 5 && <Confetti width={windowWidth} height={windowHeight} />}

      <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: "3rem", position: "relative", top: "-7vw" }}>
        {t("GameFinished.gameOver")}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, position: "relative", top: "-100px" }}>
        <Box sx={{
          padding: 3,
          border: '2px solid #9b33c0',
          borderRadius: 2,
          backgroundColor: '#c7f28e',
          textAlign: 'center',
          boxShadow: 3,
          width: '200px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t("GameFinished.socoreAchieved")}</Typography>
          <Typography variant="h5" sx={{ color: '#040502', marginTop: 1 }}>
            {score} / {maxScore}
          </Typography>
        </Box>

        <Box sx={{
          padding: 3,
          border: '2px solid #9b33c0',
          borderRadius: 2,
          backgroundColor: '#e3f2fd',
          textAlign: 'center',
          boxShadow: 3,
          width: '200px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t("GameFinished.totalTime")}</Typography>
          <Typography variant="h5" sx={{ color: '#040502', marginTop: 1 }}>
            {totalTime} {t("GameFinished.seconds")}
          </Typography>
        </Box>
      </Box>

      <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
        <Button variant="contained" sx={{ fontSize: "1.2rem", px: 6, py: 2, backgroundColor: '#9b33c0' }} onClick={handleRestart}>
          {t("GameFinished.playAgain")}
        </Button>
        <Button variant="contained" sx={{ fontSize: "1.2rem", px: 1, py: 2, backgroundColor: '#e2a4f5', color: 'black' }} onClick={handleGoToHistorical}>
          {t("GameFinished.viewHistory")}
        </Button>
      </Stack>
    </Stack>
  );
};

export default GameFinished;

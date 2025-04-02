import React, { useState, useEffect } from "react";
import { Button, Typography, Stack, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from 'react-confetti';

const GameFinished = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    if (location.state) {
      setScore(location.state.score);
      setTotalTime(location.state.totalTime);
      setMaxScore(location.state.maxScore);
    }

    // Handle the size of the window - confetti
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location]);

  const handleRestart = () => {
    navigate('/game-Mode'); 
  };

  const handleGoToHistorical = () => {
    navigate('/history'); 
  };

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={4}
      sx={{ height: "100vh", textAlign: "center"}}
    >

      {/* Confetti */}
      {score >= 5 && <Confetti width={windowWidth} height={windowHeight} />}

      {/* Title */}
      <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: "3rem", position: "relative",  top: "-200px"}}>
        ¡Juego Terminado!
      </Typography>

      {/* Final score */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, position: "relative",  top: "-100px"}}>
        {/* Score */}
        <Box sx={{
          padding: 3,
          border: '2px solid #9b33c0',
          borderRadius: 2,
          backgroundColor: '#c7f28e',
          textAlign: 'center',
          boxShadow: 3,
          width: '200px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Puntuación Final</Typography>
          <Typography variant="h5" sx={{ color: '#040502', marginTop: 1 }}>
            {score} / {maxScore}
          </Typography>
        </Box>

        {/* Total time */}
        <Box sx={{
          padding: 3,
          border: '2px solid #9b33c0',
          borderRadius: 2,
          backgroundColor: '#e3f2fd',
          textAlign: 'center',
          boxShadow: 3,
          width: '200px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tiempo Total</Typography>
          <Typography variant="h5" sx={{ color: '#040502', marginTop: 1 }}>
            {totalTime} segundos
          </Typography>
        </Box>
      </Box>

      {/* Buttons */}
      <Stack direction="column" spacing={2} sx={{ alignItems: "center" }}>
        <Button variant="contained" 
          sx={{ fontSize: "1.2rem", px: 6, py: 2, backgroundColor: '#9b33c0'}}
          onClick={handleRestart}>
          Volver a jugar
        </Button>
        <Button variant="contained" 
          sx={{ fontSize: "1.2rem", px: 1, py: 2, backgroundColor: '#e2a4f5', color: 'black'}}
          onClick={handleGoToHistorical}>
          Consultar historial
        </Button>
      </Stack>
    </Stack>
  );
};

export default GameFinished;


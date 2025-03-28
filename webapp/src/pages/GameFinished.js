import React, { useState, useEffect } from "react";
import { Button, Typography, Stack, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const GameFinished = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  useEffect(() => {
    if (location.state) {
      setScore(location.state.score);
      setTotalTime(location.state.totalTime);
      setMaxScore(location.state.maxScore);
    }
  }, [location]);

  const handleRestart = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={4}
      sx={{ height: "100vh", textAlign: "center" }}
    >
      {/* Title */}
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        ¡Juego Terminado!
      </Typography>

      {/* Final score */}
      <Box>
        <Typography variant="h6">
          Puntuación final: {score} / {maxScore}
        </Typography>
        <Typography variant="h6">
          Tiempo total: {totalTime} segundos
        </Typography>
      </Box>

      {/* Buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleRestart}
          sx={{
            backgroundColor: "#6A0DAD", // Morado oscuro
            "&:hover": {
              backgroundColor: "#5A0C9A", // Morado más oscuro al pasar el mouse
            },
          }}
        >
          Volver a jugar
        </Button>
        <Button
          variant="outlined"
          onClick={handleGoToLogin}
          sx={{
            color: "#6A0DAD", // Texto morado
            borderColor: "#6A0DAD", // Borde morado
            "&:hover": {
              backgroundColor: "#F3E5F5", // Fondo morado claro al pasar el mouse
              borderColor: "#5A0C9A", // Borde morado más oscuro
            },
          }}
        >
          Iniciar sesión
        </Button>
      </Stack>
    </Stack>
  );
};

export default GameFinished;


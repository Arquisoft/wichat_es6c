import React, { useState, useEffect } from "react";
import { Button, Stack, Typography, Box } from "@mui/material";
import axios from "axios"; 
import { useLocation, useNavigate } from 'react-router-dom';

import React from "react";
import { Container, Box, Typography } from "@mui/material";
import Chat from "../components/Chat";

function Game() {
  const QUESTION_TIME = 10;
  const TOTAL_ROUNDS = 10;

  const location = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameMode, setGameMode] = useState('');
  const [round, setRound] = useState(1);
  const [totalTime, setTotalTime] = useState(0);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  // Datos de la pregunta e imagen
  const [questionData, setQuestionData] = useState(null);

  // Temporizador
  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Total timer
  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(totalTimer);
  }, []);

  useEffect(() => {
    if (location.state && location.state.mode) {
      setGameMode(location.state.mode);
    }
  }, []);

  const fetchQuestion = async () => {
    try {
      if (!gameMode || round > TOTAL_ROUNDS) return;
      const response = await axios.get(`${apiEndpoint}/questions/${gameMode}`);
      setQuestionData(response.data); 
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  useEffect(() => {
    if (gameMode) {
      fetchQuestion(); // Llama a la función para obtener la pregunta solo si gameMode está definido
    }
  }, [gameMode]); 

  // Función para manejar las respuestas
  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    if (round < TOTAL_ROUNDS) {
      setRound(prevRound => prevRound + 1);
      fetchQuestion();
      setTimeLeft(QUESTION_TIME);
    } else {
      navigate('/gameFinished');
    }
  };

  // Si no tenemos datos de la pregunta aún, mostramos "Cargando..."
  if (!questionData) {
    return <Typography variant="h4">Cargando...</Typography>;
  }

  return (
    <Stack alignItems="center" justifyContent="center" spacing={4} sx={{ height: "100vh", textAlign: "center" }}>
      {/* Tiempo en la parte izquierda de la imagen */}
      <Box
        sx={{
          position: "absolute",
          top: "12vh",  // 5% de la altura de la ventana
          left: "5vw", // 5% del ancho de la ventana
          padding: "1vw",
          border: "2px solid red",
          borderRadius: "0.5vw",
        }}
      >
        <Typography variant="h6">Tiempo: {timeLeft}s</Typography>
      </Box>

      {/* Puntuación en la parte derecha de la imagen */}
      <Box
        sx={{
          position: "absolute",
          top: "7.5vh",  // 5% de la altura de la ventana
          right: "5vw", // 5% del ancho de la ventana
          padding: "1vw",
          border: "2px solid black",
          borderRadius: "0.5vw",
        }}
      >
        <Typography variant="h6">Puntuación: {score}</Typography>
      </Box>

      {/* Round counter */}
      <Box
        sx={{
          position: "absolute",
          top: "5vh", 
          left: "50%", 
          transform: "translateX(-50%)", // Centra el contador de rondas
          padding: "0.5vw",
          border: "2px solid green",
          borderRadius: "0.5vw",
        }}
      >
      <Typography variant="h6">Ronda {round} de {TOTAL_ROUNDS}</Typography>
      </Box>

       {/* Total round counter */}
       <Box
        sx={{
          position: "absolute",
          top: "5vh", 
          left: "70%", 
          transform: "translateX(-50%)", // Centra el contador de rondas
          padding: "0.5vw",
          border: "1px solid blue",
          borderRadius: "0.3vw",
          minWidth: "10vw",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontSize: "0.8rem" }}>
          Tiempo Total: {totalTime}s
        </Typography>
      </Box>

      {/* Pregunta sobre la imagen */}
      <Typography variant="h5" sx={{ marginTop: "10vh", zIndex: 10, position: "absolute", top: "12vh" }}>
        {questionData.question}
      </Typography>

      {/* Imagen más grande, sin ocupar toda la pantalla */}
      <Box
        sx={{
          width: "80vw",   // 80% del ancho de la ventana
          height: "60vh",   // 40% de la altura de la ventana
          backgroundColor: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "1vw", // Radio de bordes relativo
          boxShadow: 3,
          position: "relative",
        }}
      >
        {questionData.imageUrl ? (
          <img src={questionData.imageUrl} alt="Imagen del país" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Typography variant="h6">Imagen no disponible</Typography>
        )}
      </Box>

      {/* Response options */}
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" sx={{ marginTop: "2vh" }}>
        {questionData.options && questionData.options.length > 0 && questionData.options.map((option, index) => (
          <Button
            key={index}
            variant="contained"
            sx={{ minWidth: "20vw", padding: "2vh" }}  
            onClick={() => handleAnswer(option === questionData.correctAnswer)} 
          >
            {option}
          </Button>
        ))}
      </Stack>
    </Stack> 


function Game() {
  return (
    <Box display="flex" height="100vh" >
      {/* Contenido principal */}
      <Box flex={1} maxWidth="66%" textAlign="center" p="5%" >
        <Typography variant="h3" gutterBottom fontSize="3.2vw">
          Chat con IA
        </Typography>
        <Typography variant="body1" fontSize="1.25vw">
          Bienvenido a la interacción con el modelo de IA. Escribe tus preguntas en el chat.
        </Typography>
      </Box>

      {/* Chat fijado al borde derecho con bordes redondeados y sombra en la parte superior e inferior */}
      <Box 
        width="25vw" 
        height="88vh" 
        position="fixed" 
        right="2.5%" 
        top="2.5%"
        
        boxShadow="0px 5vh 1vh rgba(0, 0, 0, 0.2), 0px -0.5vh 1vh rgba(0, 0, 0, 0.2)"
        p="2%"
        borderRadius="4%"
      >
        <Chat />
      </Box>
    </Box>
  );
}

export default Game;

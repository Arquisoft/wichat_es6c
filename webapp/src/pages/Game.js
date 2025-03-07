import React, { useState, useEffect } from "react";
import { Button, Stack, Typography, Box } from "@mui/material";
import axios from "axios"; 
import {  useLocation } from 'react-router-dom';

function Game() {
  const QUESTION_TIME = 20;

  const location = useLocation();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameMode, setGameMode] = useState('');


  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


  // Datos de la pregunta e imagen
  const [questionData, setQuestionData] = useState(null);

  // Temporizador
  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);


  useEffect(() => {
    if (location.state && location.state.mode) {
      setGameMode(location.state.mode);
     
    }
  },[]);

  const fetchQuestion = async () => {
    try {
      if(!gameMode) return;
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
  }, [gameMode]); // Dependencia de gameMode

  // Función para manejar las respuestas
  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }
   
    fetchQuestion();
    setTimeLeft(QUESTION_TIME);
  };

  // Si no tenemos datos de la pregunta aún, mostramos "Cargando..."
  if (!questionData) {
    return <Typography variant="h4">Cargando...</Typography>;
  }

  return (
    <Stack alignItems="center" justifyContent="center" spacing={4} sx={{ height: "100vh", textAlign: "center" }}>
      {/* Tiempo en la parte superior izquierda */}
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          left: "5%",
          padding: "15px",
          border: "2px solid red",
          borderRadius: "5px",
        }}
      >
        <Typography variant="h4">Tiempo: {timeLeft}s</Typography>
      </Box>

      {/* Puntuación en la parte superior derecha */}
      <Box
        sx={{
          position: "absolute",
          top: "15%",
          right: "5%",
          padding: "10px",
          border: "2px solid black",
          borderRadius: "5px",
        }}
      >
        <Typography variant="h6">Puntuación: {score}</Typography>
        <Typography variant="h6">Acertadas: {correctAnswers}</Typography>
        <Typography variant="h6">Fallidas: {wrongAnswers}</Typography>
      </Box>

      {/* Pregunta */}
      <Typography variant="h5">{questionData.question}</Typography>

      {/* Imagen (se llena desde el backend) */}
      <Box
        sx={{
          width: "60%",
          height: "250px",
          backgroundColor: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
          boxShadow: 3,
        }}
      >
        {questionData.imageUrl ? (
          <img src={questionData.imageUrl} alt="Imagen del país" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Typography variant="h6">Imagen no disponible</Typography>
        )}
      </Box>

      {/* Opciones de respuesta */}
      <Stack direction="row" spacing={2}>
        {questionData.options.map((option, index) => (
          <Button
            key={index}
            variant="contained"
            sx={{ minWidth: "120px", padding: "10px" }}
            onClick={() => handleAnswer(option.text === questionData.correctAnswer)} // Comprobamos si la opción es correcta
          >
            {option.text}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

export default Game;

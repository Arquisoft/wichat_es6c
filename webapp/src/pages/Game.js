import React, { useState, useEffect } from "react";
import { Button, Stack, Typography, Box } from "@mui/material";
import axios from "axios"; 
import { useLocation, useNavigate } from 'react-router-dom';
import ChatIcon from "@mui/icons-material/Chat"; 
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
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
  const [chatOpen, setChatOpen] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


  useEffect(() => {
    if (location.state && location.state.mode) {
      setGameMode(location.state.mode);
    }
  }, []);

  useEffect(() => {
    if (gameMode) {
      fetchQuestion(); // Llama a la función para obtener la pregunta solo si gameMode está definido
    }
  }, [gameMode]); 

  // Temporizador
  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(totalTimer);
  }, []);

  const fetchQuestion = async () => {
    try {
      if (!gameMode || round > TOTAL_ROUNDS) return;
      const response = await axios.get(`${apiEndpoint}/questions/${gameMode}`);
      setQuestionData(response.data);
      setImageLoaded(false);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

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

  const handleImageLoad = () => {
    setImageLoaded(true); // Marcar como cargada una vez que la imagen se carga
    setTimeLeft(QUESTION_TIME); // Reiniciar el temporizador solo después de cargar la imagen
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
          width: "80vw",   
          height: "60vh",  
          backgroundColor: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "1vw", 
          boxShadow: 3,
          position: "relative",
        }}
      >
        {questionData.imageUrl ? (
          <img  src={questionData.imageUrl} 
                alt="Imagen del país" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                onLoad={handleImageLoad} //call handleImage when the image is ready
          />
        ) : (
          <Typography variant="h6">Imagen no disponible</Typography>
        )}
      </Box>

      {/* Response options */}
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" sx={{ marginTop: "2vh" }}>
        {imageLoaded && questionData.options && questionData.options.length > 0 && questionData.options.map((option, index) => (
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

      {/* Botón flotante para abrir/cerrar el chat */}
      <IconButton 
        onClick={() => setChatOpen(!chatOpen)} 
        sx={{
          position: "fixed",
          bottom: "5vh",
          right: "5vw",
          backgroundColor: "white",
          borderRadius: "50%",
          boxShadow: 3,
          width: "60px",
          height: "60px",
          zIndex: 1000,
        }}
      >
        {chatOpen ? <CloseIcon fontSize="large" /> : <ChatIcon fontSize="large" />}
      </IconButton>

      {/* Contenedor del chat (desplegable) */}
      <Box
        sx={{
          position: "fixed",
          bottom: "12vh",
          right: chatOpen ? "5vw" : "-30vw", // Se oculta cuando está cerrado
          width: "25vw",
          height: "70vh",
          backgroundColor: "white",
          borderRadius: "1vw",
          boxShadow: 3,
          transition: "right 0.3s ease-in-out",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 999,
        }}
      >
        {chatOpen && <Chat />}
      </Box>

    </Stack> 
  )
}

export default Game;

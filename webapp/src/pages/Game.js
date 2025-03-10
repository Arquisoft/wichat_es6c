import React, { useState, useEffect } from "react";
import { IconButton, Button, Stack, Typography, Box, CircularProgress, LinearProgress } from "@mui/material";
import axios from "axios"; 
import { useLocation, useNavigate } from 'react-router-dom';
import ChatIcon from "@mui/icons-material/Chat"; 
import CloseIcon from "@mui/icons-material/Close";
import Chat from "../components/Chat";

function Game() {
  const QUESTION_TIME = 15;
  const TOTAL_ROUNDS = 10;

  const location = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameMode, setGameMode] = useState('');
  const [round, setRound] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const [progress, setProgress] = useState(100);


  const [questionData, setQuestionData] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';



  const handleImageLoad = () => {
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.1;
      setImageOpacity(opacity);
      if (opacity >= 1) {
        clearInterval(fadeIn);
        setImageLoaded(true);
      }
    }, 100); 
  };

  useEffect(() => {
    if (location.state?.mode) {
      setGameMode(location.state.mode);
    }
  }, [location.state]);

  useEffect(() => {
    if (gameMode) {
      fetchQuestion();
    }
  }, [gameMode]);

  useEffect(() => {
    if (!questionData || !imageLoaded) return;
  
    if (timeLeft === 0) {
      handleAnswer(false);
      return;
    }
  
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1); 
      setProgress(timeLeft / QUESTION_TIME * 100);
      }, 1000);
  
    return () => clearInterval(timer); 
  }, [timeLeft, questionData, imageLoaded]);
  

  useEffect(() => {
    if (!questionData || !imageLoaded) return;
  
    const totalTimer = setInterval(() => {
      setTotalTime((t) => t + 1); 
    }, 1000);
  
    return () => clearInterval(totalTimer); 
  }, [questionData, imageLoaded]);
  

  const fetchQuestion = async () => {
    try {
      if (round > TOTAL_ROUNDS) return;
      setImageLoaded(false);
      const response = await axios.get(`${apiEndpoint}/questions/${gameMode}`);
      setQuestionData(response.data); 
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);

    if (round < TOTAL_ROUNDS) {
      setRound(round + 1);
      fetchQuestion();
      setTimeLeft(QUESTION_TIME);
    } else {
      navigate('/game-finished');
    }
  };

  if (!questionData) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
        <Typography variant="h4" sx={{ marginTop: 2 }}>Cargando ronda...</Typography>
        <CircularProgress />

      </Stack>
    );
  }

  return (
    <Stack alignItems="center" justifyContent="center" 
          sx={{ height: "93.5vh",
            backgroundImage: "url('/background-quiz.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
           }}>
      {/* Contenedor principal con transparencia */}
      <Box
        sx={{
          width: "50vw",
          minHeight: "60vh",
          backgroundColor: "rgb(255, 255, 255)", 
          backdropFilter: "blur(10px)",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {/* Pregunta */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          {questionData.question}
        </Typography>

        {/* Imagen */}
        <Box 
          sx={{ 
            width: "80%", 
            height: "40vh", 
            overflow: "hidden", 
            borderRadius: "10px", 
            position: "relative", // Necesario para centrar el mensaje de carga
            backgroundColor: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {questionData.imageUrl && (
            <img 
              src={questionData.imageUrl} 
              alt="Imagen de la pregunta"
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover", 
                opacity: imageOpacity, 
                transition: "opacity 0.5s ease-in-out" 
              }}
              onLoad={handleImageLoad}
            />
          )}

          {!imageLoaded && (
            <Stack 
              alignItems="center" 
              justifyContent="center" 
              sx={{ 
                position: "absolute", 
                width: "100%", 
                height: "100%", 
                backgroundColor: "rgba(255, 255, 255, 0.7)", 
                display: "flex",
                flexDirection: "column" 
              }}
            >
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 1, color: "#666" }}>
                {round > 1 ? "Cargando siguiente imagen..." : "Cargando imagen..."}  
              </Typography>
            </Stack>
          )}
        </Box>
          
         {/* Barra de progreso de tiempo */}
         <Box sx={{ width: "80%", mt: 2,  visibility: imageLoaded ? "visible" : "hidden" }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: "10px", borderRadius: "5px" }}
          />
        </Box>

        {/* Opciones de respuesta */}
        <Stack direction="column" spacing={2} sx={{ width: "100%", marginTop: "1.5rem", visibility: imageLoaded ? "visible" : "hidden"}}>
          {questionData.options?.map((option, index) => (
            <Button 
              key={index} 
              variant="contained" 
              sx={{ width: "100%" }} 
              onClick={() => handleAnswer(option === questionData.correctAnswer)}
            >
              {option}
            </Button>
          ))}
        </Stack>
      </Box>


      <IconButton onClick={() => setChatOpen(!chatOpen)} sx={{ position: "fixed", bottom: "5vh", right: "8vw", backgroundColor: "white", borderRadius: "50%", boxShadow: 3, width: "60px", height: "60px", zIndex: 10000 }}>
          {chatOpen ? <CloseIcon fontSize="large" /> : <ChatIcon fontSize="large" />}
        </IconButton>

        <Box sx={{ position: "fixed", bottom: "12vh", right: chatOpen ? "5vw" : "-30vw", width: "25vw", height: "70vh", backgroundColor: "white", borderRadius: "1vw", boxShadow: 3, transition: "right 0.3s ease-in-out", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 999 }}>
          {chatOpen && <Chat />}
        </Box>

      {/* Indicadores de tiempo y puntuación */}
      <Box
        sx={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "space-around",
          width: "40vw",
          color: "white",
          fontWeight: "bold",
          textAlign: "center"
        }}
      >
        {/*<Typography variant="h6">Tiempo: {timeLeft}s</Typography> */}
        <Typography variant="h6">Puntuación: {score}</Typography>
        <Typography variant="h6">Ronda {round}/{TOTAL_ROUNDS}</Typography>
      </Box>
    </Stack>
  );
}

export default Game;

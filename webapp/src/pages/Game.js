import React, { useState, useEffect } from "react";
import { IconButton, Button, Stack, Typography, Box, CircularProgress, LinearProgress } from "@mui/material";
import axios from "axios"; 
import { useLocation, useNavigate } from 'react-router-dom';
import ChatIcon from "@mui/icons-material/Chat"; 
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star"; 
import Chat from "../components/Chat";
import { motion, AnimatePresence } from "framer-motion";

function Game() {
  const QUESTION_TIME = 60;
  const TOTAL_ROUNDS = 10;
  const BASE_SCORE = 10;
  const FEEDBACK_QUESTIONS_TIME = 2000; // 2 segundos (2000 ms)
  const TRANSITION_ROUND_TIME = 3000; // 5 segundos (5000 ms)
  
  
  const MULTIPLIER_HIGH = 2.0;
  const MULTIPLIER_MEDIUM = 1.5;
  const MULTIPLIER_LOW = 1.0;
  const TIME_THRESHOLD_HIGH = 10;
  const TIME_THRESHOLD_MEDIUM = 5;

  const location = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameMode, setGameMode] = useState('');
  const [round, setRound] = useState(1);
  const [totalTime, setTotalTime] = useState(0);


  const [questionData, setQuestionData] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);

  const [showTransition, setShowTransition] = useState(false); 
  const [tempScore, setTempScore] = useState(0); 
  const [starAnimation, setStarAnimation] = useState(false);
  

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false); 


  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  
  const getTimeMultiplierScore = (timeLeft) => {
    if (timeLeft >= TIME_THRESHOLD_HIGH) return MULTIPLIER_HIGH;
    if (timeLeft >= TIME_THRESHOLD_MEDIUM) return MULTIPLIER_MEDIUM;
    return MULTIPLIER_LOW;
  };

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
    if (!questionData || !imageLoaded || starAnimation ||showFeedback || showTransition) return;

    let timeUpTriggered = false; 

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (!timeUpTriggered) {
            timeUpTriggered = true; 
            handleTimeUp(); 
          }
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });

      setTotalTime((t) => t + 1);
    }, 1000);


    return () => clearInterval(timer); 
  }, [timeLeft, questionData, imageLoaded, showFeedback, showTransition]);

  const handleTimeUp = () => {
    if (showFeedback || showTransition || starAnimation) return; 
    console.log("Se ejecuta porque se acabo el tiempo");
   

    setShowFeedback(true);
    setSelectedAnswer(null); 

    setTimeout(() => {
      setShowFeedback(false); 
      setShowTransition(true);
      setStarAnimation(true); 

      setTimeout(() => {
        setShowTransition(false); 
        setStarAnimation(false); 

        if (round < TOTAL_ROUNDS) {
          setRound((prevRound) => prevRound + 1); 
          setTimeLeft(QUESTION_TIME); 
          fetchQuestion();
        } else {
          navigate('/game-finished'); 
        }
      }, TRANSITION_ROUND_TIME); 
    }, FEEDBACK_QUESTIONS_TIME); 
  };

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

  const handleAnswer = (isCorrect, selectedOption) => {
    setSelectedAnswer(selectedOption);
    setShowFeedback(true);

   

    if (isCorrect) {
      const multiplier = getTimeMultiplierScore(timeLeft);
      const pointsEarned = BASE_SCORE * multiplier;
      setTempScore(pointsEarned);
      setScore((prevScore) => prevScore + pointsEarned);
    } else {
      setTempScore(0);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setShowTransition(true);
      setStarAnimation(true);

      setTimeout(() => {
        setShowTransition(false);
        setStarAnimation(false);

        if (round < TOTAL_ROUNDS) {
          setRound((prevRound) => prevRound + 1);
          fetchQuestion();
          setTimeLeft(QUESTION_TIME); 
          setSelectedAnswer(null);
        } else {
          navigate('/game-finished');
        }
      }, TRANSITION_ROUND_TIME);
    }, FEEDBACK_QUESTIONS_TIME);
  };


  if (!questionData) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
        <Typography variant="h4" sx={{ marginTop: 2 }}>Cargando ronda...</Typography>
        <CircularProgress />

      </Stack>
    );
  }

  // Pantalla de transición
  const TransitionScreen = ({ score, tempScore, starAnimation }) => {
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "10rem", 
            height: "10rem", 
          }}
        >
          <Box
            sx={{
              position: "absolute", 
              animation: starAnimation ? "pulse 1s infinite" : "none", 
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.5)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          >
            <StarIcon sx={{ fontSize: "12rem", color: "#FFD700" }} /> 
          </Box>
  
          <AnimatePresence>
            {starAnimation && (
              <motion.div
                
                style={{
                  position: "absolute",
                  top: "35%",
                  left: "33%",
                  fontSize: "2.5rem", 
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                +{tempScore}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
  
        {/* Puntuación total */}
        <Typography variant="h5" sx={{ mt: 5, color: "#666" }}>
          Puntuación total: {score}
        </Typography>
      </Box>
    );
  };

  
  return (
    <Stack alignItems="center" justifyContent="center" 
          sx={{ height: "93.5vh",
            backgroundImage: "url('/background-quiz.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
         }}>



    {/* Pantalla de transición */}
    {showTransition && (
      <TransitionScreen score={score} tempScore={tempScore} starAnimation={starAnimation} />
    )}


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
            display: "inline-block", // Ajusta el ancho al contenido (la imagen)
            height: "32vh", 
            overflow: "hidden", 
            borderRadius: "10px", 
            position: "relative", 
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
                width: "auto", 
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
          

      {/* Tiempo restante */}
      <Box
        sx={{
          position: "absolute",
          top: "35%",
          left: "-25%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "15vh",
          height: "15vh",
          borderRadius: "50%",
          backgroundColor: "orange",
          
          boxShadow: 3,
          zIndex: 1000,
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="white" fontSize="2rem">
          {timeLeft}
        </Typography>
      </Box>


        {/* Opciones de respuesta */}
        <Stack direction="column" spacing={2} sx={{ width: "100%", marginTop: "1.5rem", visibility: imageLoaded ? "visible" : "hidden"}}>
          {questionData.options?.map((option, index) => {
            const isSelected = selectedAnswer === option; 
            const isCorrect = option === questionData.correctAnswer;

            return (
              <Button
                key={index}
                variant="contained"
                sx={{
                  width: "100%",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  backgroundColor:
                    showFeedback && isSelected
                      ? isCorrect
                        ? "green" 
                        : "red" 
                      : showFeedback && isCorrect
                      ? "green"
                      : "primary", 
                  color: "white",
                  "&:hover": {
                    backgroundColor:
                      showFeedback && isSelected
                        ? isCorrect
                          ? "green"
                          : "red"
                        : showFeedback && isCorrect
                        ? "green"
                        : "primary",
                  },
                  "&.Mui-disabled": { 
                    backgroundColor:
                      showFeedback && isSelected
                        ? isCorrect
                          ? "green"
                          : "red"
                        : showFeedback && isCorrect
                        ? "green"
                        : "primary",
                    color: "white",
                    opacity: 1, 
                  },
                  position: "relative",
                }}
                onClick={() => handleAnswer(isCorrect, option)}
                disabled={showFeedback} 
              >
                {showFeedback && isSelected && (
                  <Box
                    sx={{
                      position: "absolute", 
                      left: "1rem", 
                    }}
                  >
                    {isCorrect ? "\u2714" : "\u274C"} 
                  </Box>
                )}
                {showFeedback && isCorrect && !isSelected && (
                  <Box
                    sx={{
                      position: "absolute", 
                      left: "1rem", 
                    }}
                  >
                    {"\u2714"} 
                  </Box>
                )}

                {option}
              </Button>
            );
          })}
        </Stack>


        <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
        {round} de {TOTAL_ROUNDS} rondas
      </Typography>

      </Box>


      <IconButton onClick={() => setChatOpen(!chatOpen)} sx={{ position: "fixed", bottom: "5vh", right: "8vw", backgroundColor: "white", borderRadius: "50%", boxShadow: 3, width: "60px", height: "60px", zIndex: 10000 }}>
          {chatOpen ? <CloseIcon fontSize="large" /> : <ChatIcon fontSize="large" />}
        </IconButton>

        <Box sx={{ position: "fixed", bottom: "12vh", right: chatOpen ? "5vw" : "-30vw", width: "24vw", height: "70vh", backgroundColor: "white", borderRadius: "1vw", boxShadow: 3, transition: "right 0.3s ease-in-out", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 999 }}>
        {chatOpen && (
        <Box sx={{ 
          flexShrink: 0,  // Evita que crezca
          maxHeight: "100%",  // Asegura que el contenido no exceda la altura del contenedor
          overflowY: "auto"  // Permite scroll si el contenido es grande
        }}>
          <Chat questionData={questionData} />
        </Box>
        )}
</Box>

     
    </Stack>
  );
}

export default Game;

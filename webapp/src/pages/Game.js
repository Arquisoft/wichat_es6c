import React, { useState, useEffect,useContext, useCallback } from "react";
import { IconButton, Button, Stack, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import Chat from "../components/Chat";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import i18n from "i18next";
import { SessionContext } from "../SessionContext";
function Game() {
  const QUESTION_TIME = 60;
  const TOTAL_ROUNDS = 10;
  const BASE_SCORE = 10;
  const FEEDBACK_QUESTIONS_TIME = 1000; // 1 segundo (1000 ms)
  const TRANSITION_ROUND_TIME = 3000; // 3 segundos (3000 ms)


  const MULTIPLIER_HIGH = 2.0;
  const MULTIPLIER_MEDIUM = 1.5;
  const MULTIPLIER_LOW = 1.0;
  const TIME_THRESHOLD_HIGH = 45;
  const TIME_THRESHOLD_MEDIUM = 25;

  const location = useLocation();
  const navigate = useNavigate();

  const { username } = useContext(SessionContext);

  const { t } = useTranslation();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameMode, setGameMode] = useState('');
  const [round, setRound] = useState(1);
  const [totalTime, setTotalTime] = useState(0);


  const [questionData, setQuestionData] = useState(null);
  const [nextQuestionData, setNextQuestionData] = useState(null); // Estado para la pregunta precargada
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = 0;

  const [chatOpen, setChatOpen] = useState(false);

  const [showTransition, setShowTransition] = useState(false);
  const [tempScore, setTempScore] = useState(0);
  const [starAnimation, setStarAnimation] = useState(false);
  const [corectAnswers, setCorrectAnswers] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false); // Nuevo estado para controlar la animación


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

      // Actualizar directamente el estilo del elemento en lugar de usar el estado
      const imgElement = document.querySelector("img[alt='Imagen de la pregunta']");
      if (imgElement) {
        imgElement.style.opacity = opacity;
      }

      if (opacity >= 1) {
        clearInterval(fadeIn);
        setImageLoaded(true); // Marcar la imagen como cargada
      }
    }, 100);
  };

  const preloadNextQuestion = useCallback(async () => {

    try {
      const lang = i18n.language; 
      const response = await axios.get(`${apiEndpoint}/questions/${lang}/${gameMode}`);
      setNextQuestionData(response.data); // Guardar la pregunta precargada
    } catch (error) {
      console.error("Error preloading next question:", error);
    }
  }, [apiEndpoint, gameMode, setNextQuestionData]);

  const fetchQuestion = useCallback(async () => {
    console.log("fetchQuestion ejecutado");
    try {
      if (round > TOTAL_ROUNDS) return;
      setImageLoaded(false);
      const lang = i18n.language; 
      const response = await axios.get(`${apiEndpoint}/questions/${lang}/${gameMode}`);
      setQuestionData(response.data);

      // Iniciar la precarga de la siguiente pregunta
      preloadNextQuestion();
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  }, [round, TOTAL_ROUNDS, apiEndpoint, gameMode, preloadNextQuestion]);

  const createUserHistory = useCallback(async (score, totalTime, corectAnswers, gameMode) => {
    try {
      console.log("Se ejecuta el createUserHistory con los siguientes datos: ", score, totalTime, corectAnswers, gameMode);
      const response = await axios.post(
        `${apiEndpoint}/createUserHistory`,
        {
          username: username,
          correctAnswers: corectAnswers,
          wrongAnswers: TOTAL_ROUNDS - corectAnswers,
          time: totalTime,
          score: score,
          gameMode: gameMode
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Respuesta del servidor:" + response.data);
    } catch (error) {
      console.error('Error completo:', {
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }, [apiEndpoint, username]);

  const handleNextRound = useCallback(() => {
    console.log("handleNextRound ejecutado");
    if (nextQuestionData) {
      setQuestionData(nextQuestionData); // Usar la pregunta precargada
      setNextQuestionData(null); // Limpiar la pregunta precargada

      // Iniciar la precarga de la siguiente pregunta
      preloadNextQuestion();
    } else {
      fetchQuestion(); // Si no hay pregunta precargada, cargar una nueva
    }

    setRound((prevRound) => prevRound + 1); // Incrementar la ronda
    setTimeLeft(QUESTION_TIME); // Reiniciar el tiempo
    setSelectedAnswer(null); // Reiniciar la respuesta seleccionada
  }, [nextQuestionData, fetchQuestion, preloadNextQuestion]);

  const handleTimeUp = useCallback(() => {
    if (showFeedback || showTransition || starAnimation) return;

    setShowFeedback(true);
    setSelectedAnswer(null);

    setTimeout(() => {
      setShowFeedback(false);
      setShowTransition(true);

      // Activar la animación de la estrella solo si no está ya activa
      if (!starAnimation) {
        setStarAnimation(true);
      }

      // Iniciar la carga de la siguiente pregunta e imagen al inicio de la animación
      if (round < TOTAL_ROUNDS) {
        handleNextRound(); // Cargar la siguiente pregunta y avanzar la ronda
      }

      // Finalizar la animación de la estrella después de un tiempo fijo
      setTimeout(() => {
        setStarAnimation(false); // Desactivar la animación de la estrella
        setShowTransition(false);

        if (round >= TOTAL_ROUNDS) {
          let maxScore = TOTAL_ROUNDS * BASE_SCORE * MULTIPLIER_HIGH;
          try {
            createUserHistory(score, totalTime, round, gameMode);
            navigate('/game-finished', { state: { score: score, totalTime: totalTime, maxScore: maxScore } });
          } catch (error) {
            console.error(error);
          }

        }
      }, TRANSITION_ROUND_TIME); // Duración fija para la animación
    }, FEEDBACK_QUESTIONS_TIME);
  }, [showFeedback, showTransition, starAnimation, handleNextRound, round, TOTAL_ROUNDS, score, totalTime, navigate, createUserHistory, gameMode]);

  useEffect(() => {
    if (location.state?.mode) {
      setGameMode(location.state.mode);
    }
  }, [location.state]);

  useEffect(() => {
    if (gameMode && round === 1) {
      fetchQuestion();
    }
  }, [gameMode, fetchQuestion,round]);

  useEffect(() => {
    if (!questionData || !imageLoaded || starAnimation || showFeedback || showTransition) return;

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
  }, [timeLeft, questionData, imageLoaded, showFeedback, showTransition, handleTimeUp, starAnimation]);

  useEffect(() => {
    if (animationComplete && imageLoaded) {
      setAnimationComplete(false); // Resetear el estado de la animación
      setTimeLeft(QUESTION_TIME); // Iniciar el temporizador solo después de que todo esté listo
    }
  }, [animationComplete, imageLoaded]);

  const handleAnswer = (isCorrect, selectedOption) => {
    setSelectedAnswer(selectedOption);
    setShowFeedback(true);
    let correct = corectAnswers;
    let thisScore = score;

    if (isCorrect) {
      correct = corectAnswers + 1;
      setCorrectAnswers(correct);
      const multiplier = getTimeMultiplierScore(timeLeft);
      const pointsEarned = BASE_SCORE * multiplier;
      setTempScore(pointsEarned);
      thisScore = score + pointsEarned;
      setScore(thisScore);
    } else {
      setTempScore(0);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setShowTransition(true);

      // Activar la animación de la estrella solo si no está ya activa
      if (!starAnimation) {
        setStarAnimation(true);
      }

      // Iniciar la carga de la siguiente pregunta e imagen al inicio de la animación
      if (round < TOTAL_ROUNDS) {
        handleNextRound(); // Cargar la siguiente pregunta y precargar la imagen
      }

      setTimeout(() => {
        setShowTransition(false);
        setStarAnimation(false);

        if (round >= TOTAL_ROUNDS) {
          let maxScore = TOTAL_ROUNDS * BASE_SCORE * MULTIPLIER_HIGH;
          try {
            createUserHistory(thisScore, totalTime, correct, gameMode);
            navigate('/game-finished', { state: { score: thisScore, totalTime: totalTime, maxScore: maxScore } });
          } catch (error) {
            console.error(error);
          }
        }
      }, TRANSITION_ROUND_TIME);
    }, FEEDBACK_QUESTIONS_TIME);
  };


  if (!questionData) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
        <Typography variant="h4" sx={{ marginTop: 2 }}>{t("Game.loading")}</Typography>
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

          {starAnimation && (
            <motion.div
              style={{
                position: "absolute",
                top: "50%", // Centrar verticalmente
                left: "50%", // Centrar horizontalmente
                transform: "translate(-50%, -50%)", // Ajustar para centrar completamente
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              +{tempScore}
            </motion.div>
          )}
        </Box>

        {/* Puntuación total */}
        <Typography
          variant="h5"
          sx={{
            mt: 5,
            color: "#666",
            textAlign: "center",
          }}
        >
          {t("Game.totalScore")}{':'} {score}
        </Typography>
      </Box>
    );
  };


  return (
    <Stack alignItems="center" justifyContent="center"
      sx={{
        height: "93.5vh",
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
            width: "80%",
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
                {round > 1 ? t("Game.loadingImage") : t("Game.loadingNextImage")}
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
        <Stack direction="column" spacing={2} sx={{ width: "100%", marginTop: "1.5rem", visibility: imageLoaded ? "visible" : "hidden" }}>
          {questionData.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === questionData.correctAnswer;

            const backgroundColor = "#6A0DAD";
            const hoverColor = "#8F6BAF";


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
                        : backgroundColor,
                  color: "white",
                  "&:hover": {
                    backgroundColor:
                      showFeedback && isSelected
                        ? isCorrect
                          ? "green"
                          : "red"
                        : showFeedback && isCorrect
                          ? "green"
                          : hoverColor,
                  },
                  "&.Mui-disabled": {
                    backgroundColor:
                      showFeedback && isSelected
                        ? isCorrect
                          ? "green"
                          : "red"
                        : showFeedback && isCorrect
                          ? "green"
                          : backgroundColor,
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
          {t("Game.rounds",{round, TOTAL_ROUNDS})}

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
            <Chat questionData={questionData} header={"Knowing that there is a picture of " + questionData.correctAnswer + " and the user thinks that is one of these " + questionData.options + " answer vaguely to this without revealing the answer in a short phrase:"} />
          </Box>
        )}
      </Box>


    </Stack>
  );
}

export default Game;
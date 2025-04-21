import React, { useState, useEffect, useContext, useCallback } from "react";
import { Stack, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

import StarIcon from "@mui/icons-material/Star";
import Chat from "../components/Chat";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";

import { SessionContext } from "../SessionContext";

import i18n from "i18next";

function Game() {
  const QUESTION_TIME = 60;
  const TOTAL_ROUNDS = 10;
  const BASE_SCORE = 10;
  const FEEDBACK_QUESTIONS_TIME = 1; // 1 segundo (1000 ms)
  const TRANSITION_ROUND_TIME = 2000; // 3 segundos (3000 ms)


  const MULTIPLIER_HIGH = 2.0;
  const MULTIPLIER_MEDIUM = 1.5;
  const MULTIPLIER_LOW = 1.0;
  const TIME_THRESHOLD_HIGH = 45;
  const TIME_THRESHOLD_MEDIUM = 25;

  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameMode, setGameMode] = useState('');
  const [gameModeName, setGameModeName] = useState(''); // Estado para el tipo de juego
  const [round, setRound] = useState(1);
  const [totalTime, setTotalTime] = useState(0);


  const {  username } = useContext(SessionContext);

  const [questionData, setQuestionData] = useState(null);
  const [nextQuestionData, setNextQuestionData] = useState(null); // Estado para la pregunta precargada
  const [imageLoaded, setImageLoaded] = useState(false);

  const [showTransition, setShowTransition] = useState(false);
  const [tempScore, setTempScore] = useState(0);
  const [starAnimation, setStarAnimation] = useState(false);
  const [corectAnswers, setCorrectAnswers] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false); // Nuevo estado para controlar la animación

  const [showFeedback, setShowFeedback] = useState(false);

  const [userMessages, setUserMessages] = useState([]); // Nuevo estado para almacenar todos los mensajes del usuario en la ronda actual

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


  const getTimeMultiplierScore = (timeLeft) => {
    if (timeLeft >= TIME_THRESHOLD_HIGH) return MULTIPLIER_HIGH;
    if (timeLeft >= TIME_THRESHOLD_MEDIUM) return MULTIPLIER_MEDIUM;
    return MULTIPLIER_LOW;
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
    setQuestionData(null);
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
      console.log("Se ejecuta el createUserHistory con los siguientes datos: ", score, totalTime, corectAnswers, gameMode, "vs");
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
    setUserMessages([]); // Vaciar los mensajes del usuario al cambiar de ronda
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


  }, [nextQuestionData, fetchQuestion, preloadNextQuestion]);

  const handleTimeUp = useCallback(() => {
    if (showFeedback || showTransition || starAnimation) return;
    setShowFeedback(true);

    setTempScore(0);
    setTimeout(() => {
      setShowFeedback(false);
      //setShowTransition(true);

      // Skip star animation when time runs out
      if (round < TOTAL_ROUNDS) {
        handleNextRound(); // Cargar la siguiente pregunta y avanzar la ronda
      }

      setTimeout(() => {
        setShowTransition(false);

        if (round >= TOTAL_ROUNDS) {
          let maxScore = TOTAL_ROUNDS * BASE_SCORE * MULTIPLIER_HIGH;
          try {
            createUserHistory(score, totalTime, round, gameMode, "vs");
            navigate('/game-finished', { state: { score: score, totalTime: totalTime, maxScore: maxScore, gameType: "vs" } });
          } catch (error) {
            console.error(error);
          }
        }
      }, TRANSITION_ROUND_TIME); // Duración fija para la transición
    }, FEEDBACK_QUESTIONS_TIME);
  }, [showFeedback, showTransition, starAnimation, handleNextRound, round, TOTAL_ROUNDS, score, totalTime, navigate, createUserHistory, gameMode]);

  useEffect(() => {
    if (location.state?.mode) {
      setGameMode(location.state.mode);
      setGameModeName(location.state.name); // Guardar el nombre del modo de juego
    }
  }, [location.state]);

  useEffect(() => {
    if (gameMode && round === 1) {
      fetchQuestion();
    }
  }, [gameMode, fetchQuestion, round]);

  useEffect(() => {
    if (!questionData || starAnimation || showFeedback || showTransition) return;

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
            createUserHistory(thisScore, totalTime, correct, gameMode, "vs");
            navigate('/game-finished', { state: { score: score, totalTime: totalTime, maxScore: maxScore, gameType: "vs" } });
          } catch (error) {
            console.error(error);
          }
        }
      }, TRANSITION_ROUND_TIME);
    }, FEEDBACK_QUESTIONS_TIME);
  };


  const handleUserMessage = (message) => {
    console.log("Mensaje:", message);
    setUserMessages((prevMessages) => [...prevMessages, message]); // Agregar el mensaje al historial de la ronda
    if (message.toLowerCase().includes(questionData.correctAnswer.toLowerCase())) {
      console.log("El usuario eligió la opción incorrecta según la respuesta del chat.");
      setTimeLeft(0);
    }
  };

  const handleBotResponse = (response) => {
    console.log("Respuesta del bot:", response);

    if (questionData !== null && response.toLowerCase().includes(questionData.correctAnswer.toLowerCase())) {
      console.log("El usuario eligió la opción correcta según la respuesta del chat.");
      handleAnswer(true);
    }
  };

  if (!questionData) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
        <Typography variant="h4" sx={{ marginTop: 2 }}>{t("Game-VS.loading")}</Typography>
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
          {t("Game-VS.totalScore")}: {score}
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
          width: "23vw",
          minHeight: "10vh",
          backgroundColor: "rgb(255, 255, 255)",
          backdropFilter: "blur(10px)",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {/* Pregunta */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          {t("Game-VS.describeMode-" + gameModeName)}
        </Typography>

        {/* Respuesta correcta */}
        <Box
          sx={{
            width: "60%", // Reducir el ancho de la caja
            minHeight: "10vh", // Altura mínima de la caja
            maxHeight: "auto", // Permitir que crezca si es necesario
            overflow: "hidden",
            borderRadius: "10px",
            position: "relative",
            backgroundColor: timeLeft === 0 ? "red" : "#6A0DAD", // Change to red if time runs out
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem", // Agregar padding para evitar que el texto toque los bordes
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "white",
              textAlign: "center", // Centrar el texto
              wordWrap: "break-word", // Permitir que el texto se ajuste si es muy largo
            }}
          >
            {questionData.correctAnswer}
          </Typography>
        </Box>

        {/* Tiempo restante */}
        <Box
          sx={{
            position: "absolute",
            top: "20%", // Increased separation from the answer box
            left: "-100%", // Adjusted position for better visibility
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
        <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
          {t("Game-VS.rounds", { round, TOTAL_ROUNDS })}
        </Typography>

      </Box>


      <Box
        sx={{
          position: "fixed",
          bottom: "12vh",
          right: "5vw",
          width: "24vw",
          height: "70vh",
          backgroundColor: "white",
          borderRadius: "1vw",
          boxShadow: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 999,
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          <Chat
            questionData={questionData}
            onUserMessage={handleUserMessage}
            onBotResponse={handleBotResponse}
            header={
              "Tienes que adivinar un " +
              questionData.category +
              ". Intenta usar menos de 15 palabras. Te doy las siguientes pistas: " +
              userMessages.join(", ")
            }
          />
        </Box>
      </Box>


    </Stack>
  );
}

export default Game;
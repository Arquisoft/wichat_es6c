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

  const TransitionScreen = ({ score, tempScore, starAnimation }) => (
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
          width: "10%",
          height: "10%",
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
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            +{tempScore}
          </motion.div>
        )}
      </Box>

      <Typography variant="h5" sx={{ mt: 5, color: "#666", textAlign: "center" }}>
        {t("Game-VS.totalScore")}: {score}
      </Typography>
    </Box>
  );

  return (
    <Stack
      direction={{ xs: "row", md: "row" }} // Mantener las columnas en fila
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundImage: "url('/background-quiz.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        position: "relative",
        gap: { xs: 2, md: 0 }, // Espaciado entre columnas en pantallas pequeñas
      }}
    >
      {/* Columna izquierda: Temporizador y Pregunta */}
      <Stack
        direction={{ xs: "column", md: "row" }} // Apilar verticalmente en pantallas pequeñas
        sx={{
          flex: { xs: 2, md: 3 },
          gap: 1, 
          padding: "1rem",
        }}
      >
        {/* Temporizador */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "1rem",
            flex: { xs: 2, md: 1 }, // Crece más en pantallas pequeñas
          }}
        >
          <Box
            sx={{
              width: { xs: "8rem", md: "6rem" }, // Crece en pantallas pequeñas
              height: { xs: "8rem", md: "6rem" },
              borderRadius: "50%",
              backgroundColor: "orange",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 3,
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.1)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          >
            <Typography variant="h4" color="white" fontWeight="bold">
              {timeLeft}
            </Typography>
          </Box>
        </Box>

        {/* Pregunta */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center", // Centrar la pregunta verticalmente
            padding: "2rem",
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: "1rem",
            textAlign: "center",
            boxShadow: 5,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            {t("Game-VS.describeMode-" + gameModeName)}
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "white",
              backgroundColor: timeLeft === 0 ? "red" : "#6A0DAD",
              borderRadius: "10px",
              padding: "1rem",
              mt: 3,
              width: "100%",
              wordWrap: "break-word",
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            {questionData.correctAnswer}
          </Typography>
        </Box>
      </Stack>

      {/* Columna derecha: Chat */}
      <Box
        sx={{
          flex: { xs: 5, md: 3 }, // Ocupa más espacio en pantallas grandes
          backgroundColor: "white",
          borderLeft: "3px solid #ccc",
          display: "flex",
          flexDirection: "column",
          height: "90%",
          overflow: "hidden",
          padding: "2rem",
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

      {/* Pantalla de Transición */}
      {showTransition && (
        <TransitionScreen score={score} tempScore={tempScore} starAnimation={starAnimation} />
      )}
    </Stack>
  );
}

export default Game;

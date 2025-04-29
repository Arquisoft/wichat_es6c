import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { IconButton, Button, Stack, Typography, Box, CircularProgress, useMediaQuery} from "@mui/material";
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

  const audioRef = useRef(null); // Referencia para el audio
  const hurryAudioRef = useRef(null);
  const failAudioRef = useRef(null); // Referencia para el sonido de fallo
  const correctAudioRef = useRef(null); // Referencia para el sonido de respuesta correcta
  const chooseAudioRef = useRef(null); // Referencia para el sonido de elección
  const [hurryMode, setHurryMode] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [gameMode, setGameMode] = useState('');
  const [gameModeName, setGameModeName] = useState(''); // Estado para el tipo de juego
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

  const isMobile = useMediaQuery('(max-width:1065px)');


  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  //const [volumeLevel, setVolumeLevel] = useState(0.3); // Ajusta el nivel de volumen entre 0.0 y 1.0
  const volumeLevel = 0.3; // Ajusta el nivel de volumen entre 0.0 y 1.0
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
    setHurryMode(false);
    if (hurryAudioRef.current) hurryAudioRef.current.pause();

  }, [nextQuestionData, fetchQuestion, preloadNextQuestion]);

  const handleTimeUp = useCallback(() => {
    if (showFeedback || showTransition || starAnimation) return;

    if (failAudioRef.current) {
      failAudioRef.current.currentTime = 0;
      failAudioRef.current.volume = volumeLevel; // Ajustar volumen reducido  
      const playPromise = failAudioRef.current.play();
      if (playPromise !== null && playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error reproduciendo el sonido de fallo:", error);
        });
      }
    }

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
            navigate('/game-finished', { state: { score: score, totalTime: totalTime, maxScore: maxScore, gameType: "normal" } });
          } catch (error) {
            console.error(error);
          }

        }
      }, TRANSITION_ROUND_TIME); // Duración fija para la animación
    }, FEEDBACK_QUESTIONS_TIME);
  }, [showFeedback, showTransition, starAnimation, handleNextRound, round, TOTAL_ROUNDS, score, totalTime, navigate, createUserHistory, gameMode,volumeLevel]);

  useEffect(() => {
    console.log("volumen:", volumeLevel);
    if (!audioRef.current) return; // Asegurarse de que la referencia del audio esté disponible
    const audio = audioRef.current;
    if (hurryMode || starAnimation || showFeedback || showTransition) {
      audio.volume = volumeLevel * 0.1; // Ajustar volumen reducido
    } else {
      audio.volume = 1; // Ajustar volumen normal
      console.log("volumen audio:", audio.volume);
    }

    const playPromise = audio.play();
    if (playPromise !== null && playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error al reproducir el audio:", error);
      });
    }

    return () => {
      if(audio){
        audio.pause();
      }
      
    };
  }, [audioRef, hurryMode, starAnimation, showFeedback, showTransition, volumeLevel]); // Agregar dependencias aquí

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
    if (timeLeft === 12 && !hurryMode) {
      setHurryMode(true);

      if (hurryAudioRef.current) {
        hurryAudioRef.current.currentTime = 0;
        hurryAudioRef.current.volume = volumeLevel; // Ajustar volumen reducido
        const playPromise = hurryAudioRef.current.play();
        if (playPromise !== null && playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error reproduciendo el sonido de prisa:", error);
          });
        }
      }
      if (audioRef.current) {
        //audioRef.current.pause();
      }
    }
  }, [timeLeft, hurryMode,volumeLevel]);

  useEffect(() => {
    if (animationComplete && imageLoaded) {
      setAnimationComplete(false); // Resetear el estado de la animación
      setTimeLeft(QUESTION_TIME); // Iniciar el temporizador solo después de que todo esté listo
    }
  }, [animationComplete, imageLoaded]);

  const handleAnswer = (isCorrect, selectedOption) => {
    if (chooseAudioRef.current) {
      chooseAudioRef.current.currentTime = 0;
      chooseAudioRef.current.volume = volumeLevel; // Ajustar volumen reducido
      const playPromise = chooseAudioRef.current.play();
      if (playPromise !== null && playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error reproduciendo el sonido de elección:", error);
        });
      }
    }

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
        if (isCorrect && correctAudioRef.current) {
          correctAudioRef.current.currentTime = 0;
          correctAudioRef.current.volume = volumeLevel; // Ajustar volumen reducido
          const playPromise = correctAudioRef.current.play();
          if (playPromise !== null && playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error reproduciendo el sonido de acierto:", error);
            });
          }
        } else {
          if (failAudioRef.current) {
            failAudioRef.current.currentTime = 0;
            failAudioRef.current.volume = volumeLevel; // Ajustar volumen reducido
            const playPromise = failAudioRef.current.play();
            if (playPromise !== null && playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error("Error reproduciendo el sonido de fallo:", error);
              });
            }
          }
        }
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
            navigate('/game-finished', { state: { score: thisScore, totalTime: totalTime, maxScore: maxScore, gameType: "normal" } });
          } catch (error) {
            console.error(error);
          }
        }
      }, TRANSITION_ROUND_TIME);
    }, FEEDBACK_QUESTIONS_TIME);
  };


  if (!questionData) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
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
        height: "75%",
        backgroundImage: "url('/background-quiz.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>


      {/* Sonido de fondo */}
      <audio ref={audioRef} src="sound/bg_sound.wav" loop autoPlay />
      <audio ref={hurryAudioRef} src="sound/hurry_sound.mp3" />
      {/* Sonido de fallo */}
      <audio ref={failAudioRef} src="sound/fail.wav" />
      {/* Sonido de acierto */}
      <audio ref={correctAudioRef} src="sound/correct.mp3" />
      {/* Sonido de elección */}
      <audio ref={chooseAudioRef} src="sound/choose.mp3" />
      {/* Pantalla de transición */}
      {showTransition && (
        <TransitionScreen score={score} tempScore={tempScore} starAnimation={starAnimation} />
      )}


      {/* Contenedor principal con transparencia */}
      <Box
        sx={{
          width: "50%",
          height: "85%",
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
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            mb: 2, 
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }, // Tamaño de fuente adaptable
            textAlign: { xs: 'center', sm: 'left' } // Alineación adaptable
          }}
        >
          {questionData.question}
        </Typography>

        {/* Imagen */}
        <Box
          sx={{
            width: "80%", 
            height: "60%", 
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
            top: { xs: "5%", sm: "18%", md: "20%" }, 
            left: { xs: "-20%", sm: "-25%", md: "-30%" }, 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: "3rem", sm: "5rem", md: "8rem" }, // Tamaño adaptable
            height: { xs: "3rem", sm: "5rem", md: "8rem" }, // Tamaño adaptable
            borderRadius: "50%",
            backgroundColor: "orange",
            boxShadow: 3,
            zIndex: 1000,
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.1)" },
              "100%": { transform: "scale(1)" }
            },
            // Ajustes adicionales para pantallas pequeñas
            "@media (max-width: 600px)": {
              top: "5%", // Más cerca del borde superior en pantallas muy pequeñas
              left: "-20%", // Más centrado horizontalmente
            }
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="white"
            fontSize={{ xs: "1.5rem", sm: "2rem", md: "3rem" }} // Texto adaptable
          >
            {timeLeft}
          </Typography>
        </Box>

        {/* Opciones de respuesta */}
        <Stack 
          direction="column" 
          spacing={2} 
          sx={{ 
            width: "100%", 
            height: "40%", // Ahora ocupa el 40% del espacio
            marginTop: "1.5rem", 
            visibility: imageLoaded ? "visible" : "hidden", 
            alignItems: "center", // Centrar horizontalmente
            justifyContent: "center" // Centrar verticalmente
          }}
        >
          {questionData.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === questionData.correctAnswer;

            const backgroundColor = "#6A0DAD";
            const hoverColor = "#8F6BAF";

            return (
              <Button
                key={index}
                variant="contained"
                data-testid={`option-${index}`}
                sx={{
                  width: "80%",
                  height: "2rem",
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
          {t("Game.rounds", { round, TOTAL_ROUNDS })}

        </Typography>

      </Box>


      <IconButton 
        onClick={() => setChatOpen(!chatOpen)} 
        aria-label={chatOpen ? 'close chat' : 'open chat'}
        sx={{ 
          position: "fixed", 
          bottom: "5%", 
          right: "8%", 
          backgroundColor: "white", 
          borderRadius: "50%", 
          boxShadow: 3, 
          width: "60px", 
          height: "60px", 
          zIndex: 10000,
          // Responsive
          '@media (max-width: 1065px)': {
            right: "20px",
            bottom: "20px"
          }
        }}>
        {chatOpen ? <CloseIcon fontSize="large" /> : <ChatIcon fontSize="large" />}
      </IconButton>

      <Box sx={{ 
        position: "fixed", 
        bottom: "12%", 
          right: chatOpen ? "5%" : "-30%", 
          width: "24%", 
          height: "70%", 
          backgroundColor: "white", 
          borderRadius: "1%", 
          boxShadow: 3, 
          transition: "right 0.3s ease-in-out", 
          overflow: "hidden", 
          display: "flex", 
          flexDirection: "column", 
          zIndex: 999,
          // Responsive
          '@media (max-width: 1065px)': {
            width: "90vw",
            right: chatOpen ? "5%" : "-100%",
            bottom: "auto",
            top: "50%",
            transform: "translateY(-50%)",
            height: "70%"
          }
        }}>
          {chatOpen && (
            <Box sx={{
              flexShrink: 0,
              height: "100%",
              overflowY: "auto"
            }}>
              <Chat questionData={questionData} 
                    header={"Knowing that there is a picture of the " + gameModeName +" "+ questionData.correctAnswer + " and the user thinks that may be one of these " + questionData.options + ", answer vaguely to this WITHOUT EVER revealing the answer, in a short phrase:"}                    
                    isMobile={isMobile}
                    hideHeader={false}
              />
            </Box>
          )}
          </Box>
    </Stack>
  );
}

export default Game;
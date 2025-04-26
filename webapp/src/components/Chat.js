import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import axios from "axios";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";


function Chat({ questionData, header, onUserMessage, onBotResponse, ignoreChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Indicador para mostrar que el bot está escribiendo
  const messagesEndRef = useRef(null); // Ref para hacer scroll al final

  const { t } = useTranslation(); // Inicializa la traducción

  const sendMessage = async () => {
    if (!input.trim()) return; // No enviar mensajes si ignoreChat es verdadero

    const userMessage = { role: "user", content: input };
    console.log("Mensaje del usuario:", userMessage.content);
    setMessages((prev) => [...prev, userMessage]);
    onUserMessage && onUserMessage(userMessage.content); // Llamar al callback con el mensaje del usuario

    setInput("");
    console.log(questionData);
    if (
      userMessage.content.toLowerCase().includes(questionData.correctAnswer.toLowerCase()) || 
      (questionData.enAnswer && userMessage.content.toLowerCase().includes(questionData.enAnswer.toLowerCase())) || 
      (questionData.esAnswer && userMessage.content.toLowerCase().includes(questionData.esAnswer.toLowerCase()))
    ) return;
    setIsTyping(true); // Activar indicador de que el bot está escribiendo

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    try {
      let petition = header + input;
      console.log("Petición al LLM:", petition);
      const response = await axios.post(
        `${apiEndpoint}/askllm`,
        {
          question: petition,
          model: "empathy"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      const botMessage = { role: "assistant", content: "" };

      setMessages((prev) => [...prev, botMessage]);

      // Usamos Typewriter para escribir el mensaje lentamente
      const text = data.answer || t("ChatLLM.noResponse");
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = text;
        return newMessages;
      });

      onBotResponse && onBotResponse(text); // Llamar al callback con la respuesta del bot
      setIsTyping(false); // Terminar el estado de "escribiendo"

    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  };

  // Hacer scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Container maxWidth="md" sx={{ height: "69vh", display: "flex", flexDirection: "column" }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ py: 2, bgcolor: "#9b33c0", color: "white", borderRadius: 2 }}>
        {t("ChatLLM.chatTitle")}
      </Typography>

      {/* Contenedor del chat */}
      <Box
        sx={{
          flexGrow: 1,
          borderRadius: 2,
          padding: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          bgcolor: "white",
          boxShadow: 3,
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              maxWidth: "75%",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              bgcolor: msg.role === "user" ? "#0078ff" : "#e1e1e1",
              color: msg.role === "user" ? "white" : "black",
              padding: 1.5,
              borderRadius: 2,
              marginBottom: 1,
            }}
          >
            {msg.role === "assistant" ? (
              // Usamos Typewriter solo para los mensajes del bot
              <Typewriter
                words={[msg.content]} // Aquí le pasamos el contenido del mensaje
                cursor
                cursorStyle="|"
                typeSpeed={15} // Velocidad de escritura
              />
            ) : (
              <Typography variant="body1">{msg.content}</Typography>
            )}
          </Box>
        ))}

        {isTyping && (
          <Box sx={{ alignSelf: "flex-start", padding: 1.5, borderRadius: 2, maxWidth: "40%" }}>
            <Typography variant="body1">
              <CircularProgress size={14} sx={{ mr: 1 }} />{t("ChatLLM.typing")}
            </Typography>
          </Box>
        )}

        {/* Elemento invisible para hacer scroll hacia abajo */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Entrada de texto */}
      <Box
        sx={{
          //bgcolor: "white",
          padding: 2,
          //borderTop: "1px solid gray",
          display: "flex",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          label={t("ChatLLM.typeMessage")}
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          variant="contained"
          style={{ backgroundColor: '#9b33c0', color: 'white' }}
          onClick={sendMessage} >
          {t("ChatLLM.sendMessage")}
        </Button>
      </Box>
    </Container>
  );
}
Chat.propTypes = {
  questionData: PropTypes.shape({
    correctAnswer: PropTypes.string.isRequired,
    enAnswer: PropTypes.string,  // Propiedad opcional
    esAnswer: PropTypes.string   // Propiedad opcional
  }).isRequired,
  header: PropTypes.string.isRequired,
  onUserMessage: PropTypes.func,
  onBotResponse: PropTypes.func,
  ignoreChat: PropTypes.bool
};
export default Chat;

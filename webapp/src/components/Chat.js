import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import axios from "axios";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

function Chat({ questionData, header, onUserMessage, onBotResponse, ignoreChat, isMobile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Indicador para mostrar que el bot está escribiendo
  const messagesEndRef = useRef(null); // Ref para hacer scroll al final

  const { t } = useTranslation(); // Inicializa la traducción

  const sendMessage = async () => {
    if (!input.trim()) return; // No enviar mensajes si ignoreChat es verdadero

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    onUserMessage && onUserMessage(userMessage.content); // Llamar al callback con el mensaje del usuario

    setInput("");
    if (userMessage.content.toLowerCase().includes(questionData.correctAnswer.toLowerCase())) return;
    setIsTyping(true); // Activar indicador de que el bot está escribiendo

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    try {
      let petition = header + input;
      console.log("Petición al LLM:", petition);
      const response = await axios.post(
        `${apiEndpoint}/askllm`,
        { question: header + input, model: "empathy" },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botMessage = { role: "assistant", content: response.data?.answer || t("ChatLLM.noResponse") };
      setMessages((prev) => [...prev, botMessage]);
      onBotResponse?.(botMessage.content);
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container maxWidth="md" sx={{
      height: isMobile ? "70vh" : "69vh",
      display: "flex",
      flexDirection: "column",
      p: isMobile ? 0 : 1,
      ...(isMobile && { width: "100%", maxWidth: "none" })
    }}>
      <Typography variant="h4" align="center" gutterBottom sx={{
        py: 2,
        bgcolor: "#9b33c0",
        color: "white",
        borderRadius: 2,
        fontSize: isMobile ? "1.5rem" : "2rem"
      }}>
        {t("ChatLLM.chatTitle")}
      </Typography>

      <Box sx={{
        flexGrow: 1,
        borderRadius: 2,
        p: 2,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        boxShadow: 3,
        ...(isMobile && { borderRadius: 0, boxShadow: "none" })
      }}>
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
              mb: 1,
              ...(isMobile && { maxWidth: "85%" })
            }}
          >
            {msg.role === "assistant" ? (
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
              <CircularProgress size={14} sx={{ mr: 1 }} />
              {t("ChatLLM.typing")}
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 1, bgcolor: "background.paper" }}>
        <TextField
          fullWidth
          label={t("ChatLLM.typeMessage")}
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          size={isMobile ? "small" : "medium"}
        />
        <Button
          variant="contained"
          sx={{ bgcolor: "#9b33c0", color: "white", "&:hover": { bgcolor: "#7a2a8e" } }}
          onClick={sendMessage}
          size={isMobile ? "small" : "medium"}
        >
          {t("ChatLLM.sendMessage")}
        </Button>
      </Box>
    </Container>
  );
}

Chat.propTypes = {
  questionData: PropTypes.shape({
    correctAnswer: PropTypes.string.isRequired
  }).isRequired,
  header: PropTypes.string.isRequired,
  onUserMessage: PropTypes.func,
  onBotResponse: PropTypes.func,
  ignoreChat: PropTypes.bool,
  isMobile: PropTypes.bool
};

export default Chat;
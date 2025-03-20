import React, { useState, useEffect, useRef } from "react";
import { Box, Container, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import axios from "axios";
function Chat({ questionData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("empathy");
  const [isTyping, setIsTyping] = useState(false); // Indicador para mostrar que el bot está escribiendo
  const API_KEY = process.env.REACT_APP_LLM_API_KEY; // Usa .env en producción
  const messagesEndRef = useRef(null); // Ref para hacer scroll al final

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    
    const userMessage = { role: "user", content: input  };
    console.log("Mensaje del usuario:", userMessage.content);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true); // Activar indicador de que el bot está escribiendo

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    try {
     let petition="The user is being shown a picture of "+ questionData.correctAnswer+". You have to help him guess the photo wthout revealing the answer. For that, you MUST NEVER USE ANY of the following words ("+questionData.options+"). Answer vaguely, in a short phrase and in the same language to the next question: "+input;
      const response = await axios.post(
        
        `${apiEndpoint}/askllm`,
        {
          question: petition,
          apiKey: API_KEY,
          model: model
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
      const text = data.answer || "No response";
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = text;
        return newMessages;
      });

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
      <Typography variant="h4" align="center" gutterBottom sx={{ py: 2, bgcolor: "#0078ff", color: "white", borderRadius: 2 }}>
        Chat con IA
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
          <Box sx={{ alignSelf: "flex-start",  padding: 1.5, borderRadius: 2, maxWidth: "40%" }}>
            <Typography variant="body1">
              <CircularProgress size={14} sx={{ mr: 1 }} /> Escribiendo...
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
          label="Escribe tu mensaje..."
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" color="primary" onClick={sendMessage}>
          Enviar
        </Button>
      </Box>
    </Container>
  );
}

export default Chat;

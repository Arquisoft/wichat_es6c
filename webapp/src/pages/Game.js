import React from "react";
import { Container, Box, Typography } from "@mui/material";
import Chat from "../components/Chat";

function Game() {
  return (
    <Box display="flex" height="100vh" >
      {/* Contenido principal */}
      <Box flex={1} maxWidth="66%" textAlign="center" p="5%" >
        <Typography variant="h3" gutterBottom fontSize="3.2vw">
          Chat con IA
        </Typography>
        <Typography variant="body1" fontSize="1.25vw">
          Bienvenido a la interacción con el modelo de IA. Escribe tus preguntas en el chat.
        </Typography>
      </Box>

      {/* Chat fijado al borde derecho con bordes redondeados y sombra en la parte superior e inferior */}
      <Box 
        width="25vw" 
        height="88vh" 
        position="fixed" 
        right="2.5%" 
        top="2.5%"
        
        boxShadow="0px 5vh 1vh rgba(0, 0, 0, 0.2), 0px -0.5vh 1vh rgba(0, 0, 0, 0.2)"
        p="2%"
        borderRadius="4%"
      >
        <Chat />
      </Box>
    </Box>
  );
}

export default Game;

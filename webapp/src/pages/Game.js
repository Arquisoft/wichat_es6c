import React from "react";
import { Container, Box, Typography } from "@mui/material";
import Chat from "../components/Chat";

function Game() {
  return (
    <Container maxWidth="lg">
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="flex-start"
        mt={5}
      >
        {/* Contenido principal */}
        <Box flex={1} maxWidth="500px" textAlign="center">
          <Typography variant="h3" gutterBottom>
            Chat con IA
          </Typography>
          <Typography variant="body1">
            Bienvenido a la interacción con el modelo de IA. Escribe tus preguntas en el chat.
          </Typography>
        </Box>

        {/* Chat alineado a la derecha */}
        <Box width="400px">
          <Chat />
        </Box>
      </Box>
    </Container>
  );
}

export default Game;
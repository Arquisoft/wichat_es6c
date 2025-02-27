import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function GameMode() {
  // Lista de tuplas (texto del botón, ruta)
  const buttonList = [
    { text: 'País', path: '/', mode: 'country' },
    { text: 'Monumento', path: '/', mode: 'monuments' }
  ];

  return (
    <Stack
      direction="column" // Dirección de la pila para todo (título arriba, botones abajo)
      alignItems="center" // Centra los elementos horizontalmente
      spacing={3} // Espacio entre el título y los botones
      sx={{ width: "100%", justifyContent: "center", height: "100vh" }}
    >
      {/* Título encima de los botones */}
      <Typography variant="h4" sx={{ marginBottom: '20px' }}>
        Elige el modo de Juego
      </Typography>

      {/* Stack para los botones en fila */}
      <Stack
        direction="row" // Los botones estarán en una fila
        spacing={2} // Espaciado entre botones
        alignItems="center" // Alineación vertical de los botones
        sx={{ width: "100%", justifyContent: "center" }} // Asegura que los botones estén centrados
      >
        {/* Iterar sobre la lista y crear un botón por cada elemento */}
        {buttonList.map((item, index) => (
          <Button
            key={index}
            variant="contained"
            component={Link}
            to={{
              pathname: item.path,
              state: { mode: item.mode }  // Pasamos la variable 'mode' como parte del state
            }}
            sx={{
              width: "10vw", // Mantén el ancho que ya tenías antes
              height: "30vh", // Mantén la altura que ya tenías antes
              fontSize: '150%', // Tamaño de la fuente ajustado para mayor visibilidad
              textAlign: "center",
              textTransform: 'none', // Evita que el texto se transforme a mayúsculas
              padding: '20px', // Ajusta el padding para que no quede demasiado pequeño el texto
              whiteSpace: 'normal', // Permite que el texto se ajuste
            }}
          >
            {item.text}  {/* Texto del botón */}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

export default GameMode;

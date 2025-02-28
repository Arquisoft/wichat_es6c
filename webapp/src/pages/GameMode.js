import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function GameMode() {
  // List of tuples. Saves the text, the path and the game mode of the buttons.
  const buttonList = [
    { text: 'País', path: '/', mode: 'country' },
    { text: 'Monumento', path: '/', mode: 'monuments' }
  ];

  return (
    <Stack
      direction="column" 
      alignItems="center" 
      spacing={3} 
      sx={{ width: "100%", justifyContent: "center", height: "100vh" }}
    >
     
      <Typography variant="h4" sx={{ marginBottom: '20px' }}>
        Elige el modo de juego
      </Typography>

      {/* Stack for adding the buttons */}
      <Stack
        direction="row" 
        spacing={2} 
        alignItems="center" 
        sx={{ width: "100%", justifyContent: "center" }} 
      >
        {/* Creates a new button for each element in buttonList*/}
        {buttonList.map((item, index) => (
          <Button
            key={index}
            variant="contained"
            component={Link}
            to={{
              pathname: item.path,
              state: { mode: item.mode }  // Gives the varible mode to the game component
            }}
            sx={{
              width: "10vw", 
              height: "30vh", 
              fontSize: '150%', 
              textAlign: "center",
              textTransform: 'none', 
              padding: '20px', 
              whiteSpace: 'normal', 
            }}
          >
            {item.text}  {/* Sows the text of the button */}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

export default GameMode;

import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function GameMode() {
  // List of tuples. Saves the text, the path and the game mode of the buttons.
  const buttonList = [
    { text: 'País', path: '/game', mode: 'country' },
    { text: 'Monumento', path: '/game', mode: 'monument' }
  ];

  const navigate = useNavigate();
  
  const handleGameMode = (item) => {
    
    navigate(item.path, { state: { mode: item.mode } });
  };

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
            onClick={() => handleGameMode(item)}
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

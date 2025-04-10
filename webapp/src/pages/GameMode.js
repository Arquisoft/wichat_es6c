import {React,useState,useEffect} from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';


function GameMode() {
  const [gameType, setGameType] = useState('');
  const location = useLocation();
  const [buttonList, setButtonList] = useState([]);
  // List of tuples. Saves the text, the path and the game mode of the buttons.
  const normalButtonList = [
    { text: 'Países', path: '/game', mode: 'country' ,name:"país", imageSrc: '/images/gameMode/pais-gameMode.jpg'},
  ];
  const vsButtonList = [
    { text: 'Países', path: '/game-vs', mode: 'country',name:"país" , imageSrc: '/images/gameMode/pais-gameMode.jpg'},
  ];

  useEffect(() => {
    if (location.state?.type) {
        
        setGameType(location.state.type);
    }
}, [location]);

useEffect(() => {
    if (gameType === 'normal') {
      setButtonList(normalButtonList);
    } else if (gameType === 'vs') {
      setButtonList(vsButtonList);
    }
}, [gameType]);

  const navigate = useNavigate();
  
  const handleGameMode = (item) => {
    navigate(item.path, { state: { mode: item.mode, name:item.name } });
  };

  return (
    <Stack
      direction="column" 
      alignItems="center" 
      spacing={3} 
      sx={{ width: "100%", justifyContent: "center", height: "100vh" }}
    >
     <Typography
        variant="h4"
        sx={{
          marginBottom: '40px', 
          fontWeight: 'bold', 
          color: '#0a0a0a', 
          fontSize: '2.5rem', 
          letterSpacing: '1px', 
          textAlign: 'center', 
        }}
      >
        Elige una temática
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
              width: "300px",  
              height: "350px", 
              fontSize: '16px',
              textAlign: "center",
              textTransform: 'none',
              padding: '0',  
              position: 'relative',
              overflow: 'hidden',  
            }}
          >
            <Box 
              component="img"
              src={item.imageSrc}  
              alt={item.text}
              sx={{
                width: '100%',  
                height: '100%', 
                objectFit: 'cover', 
                position: 'absolute',  
                top: 0,
                left: 0, 
              }}
            />
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

export default GameMode;

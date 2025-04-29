import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function GameType() {

  // List of tuples. Saves the text, the path and the game mode of the buttons.
  const buttonList = [
    { text: 'Normal', type: 'normal', imageSrc: '/images/gameMode/default-type.jpg' },
    { text: 'VS IA', type: 'vs', imageSrc: '/images/gameMode/vs-ia.jpg' }
  ];

  const handleGoBack = () => {
    navigate('/homepage');
  };

  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleGameMode = (item) => {

    navigate("/game-mode", { state: { type: item.type } });
  };

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={4}
      sx={{
        width: "100%",
        justifyContent: "center",
        height: "100%",
        px: "5%",
        py: "5%",
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <Button
        variant="outlined"
        onClick={handleGoBack}
        startIcon={<ArrowBackIcon />}
        sx={{
          position: "absolute",
          top: "4%",
          left: "5%",
          width: { xs: "40%", sm: "20%" },
          fontSize: { xs: "0.8rem", sm: "1rem" },
          textTransform: "none",
          color: "#ffffff",
          border: "0.1rem solid rgba(255, 255, 255, 0.4)",
          borderRadius: "1rem",
          fontWeight: "bold",
          background: "rgba(128, 0, 128, 0.48)",
          boxShadow: "0 0.5rem 1.5rem rgba(106, 13, 173, 0.53)",
          transition: "all 0.4s ease",
          "&:hover": {
            background: "rgba(128, 0, 128, 0.4)",
            borderColor: "rgba(255, 255, 255, 0.6)",
            transform: "scale(1.08)",
            boxShadow: "0 0.6rem 1.8rem rgba(75, 0, 130, 0.5)",
          },
        }}
      >
        {t("GameMode.goBack")}
      </Button>


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
        {t("GameType.chooseGame")}
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

export default GameType;

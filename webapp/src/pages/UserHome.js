import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage = () => {

  const { t } = useTranslation();
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');

    if (storedSessionId) {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername);
    }
  }, []);


  const gameModes = async () => {
    navigate('/game-type');

  }
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {username && (
          <Typography variant="h4" sx={{ marginBottom: 2 }}>
            {t('UserHome.welcome', { username })} 
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          sx={{ fontSize: "1.2rem", px: 5, py: 2, backgroundColor: '#9b33c0' }} onClick={gameModes} >
          {t('UserHome.play')}
        </Button>
      </Box>
    </Box>
  );

};

export default HomePage;

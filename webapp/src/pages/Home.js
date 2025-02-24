import React, { useState } from 'react';
import { Container, CssBaseline, Typography, Link, Box } from '@mui/material';
import Login from './Login';
import AddUser from './Register';

const Home = () => {
  const [showLogin, setShowLogin] = useState(true);

  // Función que alterna entre las vistas de Login y Register
  const handleToggleView = () => {
    setShowLogin(!showLogin);
  };

  return (
    <Container component="main" maxWidth="xs">
    

      {showLogin ? <Login /> : <AddUser />}

      <Box sx={{ textAlign: "center", marginTop: 2 }}>
        {showLogin && (
          <>
            <Typography variant="body2" color="textSecondary">
              ¿No tienes una cuenta?{" "}
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={handleToggleView} 
            >
              Regístrate aquí.
            </Link>
          </>
        ) }
      </Box>
    </Container>
  );
};

export default Home;

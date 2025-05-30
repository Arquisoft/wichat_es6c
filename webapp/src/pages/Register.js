import React, { useState, useRef,useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Divider, Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { SessionContext } from '../SessionContext';
import { useTranslation } from 'react-i18next';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { createSession } = useContext(SessionContext);
  const videoRef = useRef(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/user`, {
        username,
        password,
        name,
        surname
      });

      await axios.post(`${apiEndpoint}/login`, { username, password });
      setOpenSnackbar(true);
      createSession(username);
      navigate('/homepage');
    } catch (error) {
      setError(error.response.data.error);
    }
  };

    useEffect(() => {
      const video = videoRef.current;
      if (video) {
        video.playbackRate = 0.5; // Reduce la velocidad si es necesario
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(error => {
            console.warn("Auto-play was prevented:", error);
          });
        }
      }
    }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: { xs: '90%', sm: '90%', md: "35%" }, // 90% en pantallas pequeñas, 30% en pantallas más grandes
        height: { xs: '100%' }, // Ajusta el alto automáticamente en móviles, 80% en pantallas más grandes
      }}
    >
      <Box
        sx={{
          p: { xs: '5%', sm: '10%' },
          marginTop: '5%',
          marginBottom: '0%',
          borderRadius: '1rem',
          boxShadow: 3,
          backgroundColor: '#fff',
          width: '100%',
          height: 'auto', // Asegura que el Box ocupe todo el alto del contenedor
        }}
      >

        {/* Video de fondo - Configuración idéntica a HomePage */}
        <Box
          component="video"
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            minWidth: "100%",
            minHeight: "100%",
            width: "auto",
            height: "auto",
            transform: "translate(-50%, -50%)",
            zIndex: -1,
            objectFit: "cover",
            opacity: 0.7,
          }}
        >
          <source src="/videos/background_white_small.mp4" type="video/mp4" />
        </Box>

        {/* Capa oscura para mejorar legibilidad - Configuración idéntica */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.09)",
            zIndex: -1,
          }}
        />

        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{ marginBottom: '2%', fontWeight: 'bold' }}
        >
          {t('Register.signUp')}
        </Typography>

        {/* Form Fields */}
        <TextField
          name="username"
          margin="normal"
          fullWidth
          label={t('Register.user')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            marginBottom: '2%',
            width: '100%', // Asegura que ocupe todo el ancho disponible
            height: '10%',
            alignSelf: 'center', // Centra el campo en su contenedor
          }}
        />
        <TextField
          name="password"
          margin="normal"
          fullWidth
          label={t('Register.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            marginBottom: '2%',
            width: '100%',
            height: '10%',
            alignSelf: 'center',
          }}
        />
        <TextField
          name="name"
          margin="normal"
          fullWidth
          label={t('Register.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            marginBottom: '2%',
            width: '100%',
            height: '10%',
            alignSelf: 'center',
          }}
        />
        <TextField
          name="surname"
          margin="normal"
          fullWidth
          label={t('Register.surname')}
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          sx={{
            marginBottom: '2%',
            width: '100%',
            height: '10%',
            alignSelf: 'center',
          }}
        />

        {/* Register Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={addUser}
          sx={{
            marginTop: '5%',
            padding: '12px',
            fontWeight: 'bold',
            borderRadius: '8px',
            backgroundColor: '#9b33c0',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          {t('Register.submit')}
        </Button>

        {/* Snackbar Messages */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message="User added successfully"
        />
        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError('')}
            message={`Error: ${error}`}
          />
        )}

        {/* Divider and Login Link */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '5%',
          }}
        >
          <Divider sx={{ width: '100%', marginBottom: '5%' }} />
          <Typography variant="body2">
            {t('Register.textForm')}{' '}
            <Link
              to="/login"
              variant="body2"
              sx={{ color: '#1976d2', textDecoration: 'none' }}
            >
              {t('Register.textFormLink')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default AddUser;


// src/components/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Box, Divider, Container, Typography, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { SessionContext } from '../SessionContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { createSession } = useContext(SessionContext);
  const { t } = useTranslation();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      if (!username) {
        setError({ field: 'username', message: 'Username is required' });
        return;
      }
      if (!password) {
        setError({ field: 'password', message: 'Password is required' });
        return;
      }

      const response = await axios.post(`${apiEndpoint}/login`, { username, password });
      if (response) createSession(username);
      navigate('/homepage');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setError({ field: 'general', message: error.response.data.error });
        } else if (error.response.status === 401) {
          setError({ field: 'general', message: t('Login.notValidUserOrPassword') });
        } else {
          setError({ field: 'general', message: t('Login.unknownError') });
        }
      } else if (error.request) {
        setError({ field: 'general', message: t('Login.nonRespnse') });
      } else {
        setError({ field: 'general', message: t('Login.errorRequest') });
      }
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        mt: '2vh',
        mb: '4vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: { xs: '90%', sm: '90%' , md: "35%"  }, // 90% en pantallas pequeñas, 30% en pantallas más grandes
        height: { xs: 'auto'}, // Ajusta el alto automáticamente en móviles, 80% en pantallas más grandes
      }}
    >
      <Box
        sx={{
          p: { xs: '5%', sm: '10%' },
          borderRadius: '1rem',
          boxShadow: 3,
          backgroundColor: '#fff',
          width: '100%',
          height: '100%', // Asegura que el Box ocupe todo el alto del contenedor
        }}
      >
        <Typography component="h1" variant="h5" align="center" sx={{ mb: '2vh', fontWeight: 'bold' }}>
          {t('Login.sigIn')}
        </Typography>

        {error && error.field === 'general' && (
          <Typography variant="body2" color="error" sx={{ mb: '2vh' }}>
            {error.message}
          </Typography>
        )}

        <TextField
          name="username"
          fullWidth
          label={t('Login.user')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: '2vh' }}
        />
        {error && error.field === 'username' && (
          <Typography variant="body2" color="error" sx={{ mb: '2vh' }}>
            {error.message}
          </Typography>
        )}

        <TextField
          name="password"
          fullWidth
          label={t('Login.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: '2vh' }}
        />
        {error && error.field === 'password' && (
          <Typography variant="body2" color="error" sx={{ mb: '2vh' }}>
            {error.message}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={loginUser}
          sx={{
            mt: '1vh',
            py: '1.5vh',
            fontWeight: 'bold',
            borderRadius: '1rem',
            backgroundColor: '#9b33c0',
            '&:hover': { backgroundColor: '#7e2a9c' },
          }}
        >
          {t('Login.sigInConfirm')}
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '3vh' }}>
          <Divider sx={{ width: '100%', mb: '1vh' }} />
          <Typography variant="body2">
            {t('Login.textForm')}{' '}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
              {t('Login.textFormLink')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;

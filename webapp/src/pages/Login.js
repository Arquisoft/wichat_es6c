// src/components/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Box, Divider, Container, Typography, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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

      createSession(username);
      navigate('/homepage');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setError({ field: 'general', message: error.response.data.error });
        } else if (error.response.status === 401) {
          setError({ field: 'general', message: 'Usuario o contraseña incorrectos' });
        } else {
          setError({ field: 'general', message: 'Error desconocido del servidor' });
        }
      } else if (error.request) {
        setError({ field: 'general', message: 'No se recibió respuesta del servidor' });
      } else {
        setError({ field: 'general', message: 'Error al enviar la solicitud' });
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: '0.8rem' }}>

      <Box sx={{ padding: '2rem', borderRadius: '8px', boxShadow: 3, backgroundColor: '#fff', width: '100%' }}>
        <Typography component="h1" variant="h4" align="center" sx={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
          {t('Login.sigIn')}

        </Typography>

        {error && error.field === 'general' && (
          <Typography variant="body2" color="error" sx={{ marginBottom: '0.5rem' }}>
            {error.message}
          </Typography>
        )}

        <TextField
          name="username"
          margin="normal"
          fullWidth
          label={t('Login.user')}

          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ marginBottom: '0.5rem' }}
        />
        {error && error.field === 'username' && (
          <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
            {error.message}
          </Typography>
        )}

        <TextField
          name="password"
          margin="normal"
          fullWidth
          label={t('Login.password')}

          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: '0.5rem' }}
        />
        {error && error.field === 'password' && (
          <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
            {error.message}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={loginUser}
          sx={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            fontWeight: 'bold',
            borderRadius: '0.5rem',
            backgroundColor: '#9b33c0',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          {t('Login.sigInConfirm')}

        </Button>
        {/* Divider and Login Link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 3 }}>
          <Divider sx={{ width: '100%', marginBottom: 1 }} />
          <Typography variant="body2">
            {t('Login.textForm')}
            {' '}
            <Link to="/register" variant="body2" sx={{ color: '#1976d2', textDecoration: 'none' }}>
              {t('Login.textFormLink')}

            </Link>
          </Typography>
        </Box>

      </Box>

    </Container>
  );
};

export default Login;

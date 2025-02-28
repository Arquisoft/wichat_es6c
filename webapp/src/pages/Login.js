// src/components/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import {  Box, Divider,Container, Typography, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom'; 
import { Typewriter } from "react-simple-typewriter";
import { SessionContext } from '../SessionContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const {createSession} = useContext(SessionContext);


  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

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
      
      const question = "Please, generate a greeting message for a student called " + username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
      const model = "empathy"

      if (apiKey==='None'){
        setMessage("LLM API key is not set. Cannot contact the LLM.");
      }
      else{
        const message = await axios.post(`${apiEndpoint}/askllm`, { question, model, apiKey })
        setMessage(message.data.answer);
      }
      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);
      createSession(username);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError({ field: 'general', message: error.response.data.error });
      }else if(error.response && error.response.status === 401){
        setError({ field: 'general', message: 'Usuario o contraseña incorrectos' });
      }
      else{
        setError(error.response.data.error);
      }
      
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: '0.8rem' }}>
      {loginSuccess ? (
        <div>
          <Typewriter
            words={[message]} // Pass your message as an array of strings
            cursor
            cursorStyle="|"
            typeSpeed={50} // Typing speed in ms
          />
          <Typography component="p" variant="body1" sx={{ textAlign: 'center', marginTop: '0.5rem' }}>
            Your account was created on {new Date(createdAt).toLocaleDateString()}.
          </Typography>
        </div>
      ) : (
        <Box sx={{ padding: '2rem', borderRadius: '8px', boxShadow: 3, backgroundColor: '#fff', width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" sx={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Login
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
            label="Username"
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
            label="Password"
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
              marginTop: '0.5rem', // Equivalente a 2px en rem
              padding: '0.75rem', // 12px en rem
              fontWeight: 'bold',
              borderRadius: '0.5rem', // 8px en rem
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            Login
          </Button>
            {/* Divider and Login Link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 3 }}>
          <Divider sx={{ width: '100%', marginBottom: 1 }} />
          <Typography variant="body2">
            ¿Aún no te has registrado?{' '}
            <Link to="/register" variant="body2" sx={{ color: '#1976d2', textDecoration: 'none' }}>
              Registro aquí
            </Link>
          </Typography>
        </Box>
          
        </Box>
      )}
    </Container>
  );
};

export default Login;

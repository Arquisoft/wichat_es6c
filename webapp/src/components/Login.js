// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button } from '@mui/material';
import { Typewriter } from "react-simple-typewriter";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const loginUser = async () => {
    try {

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

    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(error.response.data.error[1].toString());
        setError({ field: 'general', message: "Invalid format username or password" });
      } else if (error.response && error.response.status === 401) {
        setError({ field: 'general', message: 'Invalid credentials' });
      } else {
        setError({ field: 'general', message: 'An unexpected error occurred' });
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
        <div>
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
        
        </div>
      )}
    </Container>
  );
};

export default Login;

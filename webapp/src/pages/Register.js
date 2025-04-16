import React, { useState, useContext } from 'react';
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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
      <Box sx={{ padding: '2rem', borderRadius: '8px', boxShadow: 3, backgroundColor: '#fff', width: '100%' }}>
        <Typography component="h1" variant="h4" align="center" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
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
          sx={{ marginBottom: 2 }}
        />
        <TextField
          name="password"
          margin="normal"
          fullWidth
          label={t('Register.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          name="name"
          margin="normal"
          fullWidth
          label={t('Register.name')}

          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          name="surname"
          margin="normal"
          fullWidth
          label={t('Register.surname')}
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        {/* Register Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={addUser}
          sx={{
            marginTop: 2,
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
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
        )}

        {/* Divider and Login Link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 3 }}>
          <Divider sx={{ width: '100%', marginBottom: 1 }} />
          <Typography variant="body2">
            {t('Register.textForm')}{' '}

            <Link to="/login" variant="body2" sx={{ color: '#1976d2', textDecoration: 'none' }}>
            {t('Register.textFormLink')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default AddUser;


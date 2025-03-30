import React, { useState, useContext, useEffect } from 'react';
import { Container, Snackbar, Button } from '@mui/material'; // Añade Button
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import AddUser from './Register';
import { SessionContext } from '../SessionContext';

const Home = () => {
  const location = useLocation();
  const { sessionId } = useContext(SessionContext);
  const navigate = useNavigate();
  const [showLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (sessionId) {
      navigate('/homepage');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      setOpenSnackbar(true);
    }
  }, [location.state]);

  // Function to toggle between login and registration views
  const toggleView = () => {
    setShowLogin(prev => !prev); 
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Container component="main" maxWidth="xs">
        {showLogin ? <Login /> : <AddUser />}
        
        {/*  Button to toggle between Login and Register */}
        <Button 
          fullWidth
          onClick={toggleView}
          sx={{ mt: 2 }}
        >
        </Button>
      </Container>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar} 
        message={message}
      />
    </>
  );
};

export default Home; 
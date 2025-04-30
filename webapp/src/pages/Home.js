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
  const [showLogin, setShowLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    console.log('Session ID:', sessionId); // Log the session ID to the console
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
      <Container 
        component="main" 
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }} // Ajusta el diseño
      >
        {showLogin ? <Login /> : <AddUser />}
        
        {/* Botón para alternar entre Login y Register */}
        <Button 
          fullWidth
          onClick={toggleView}
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
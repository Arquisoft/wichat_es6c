import React, { useState, useContext, useEffect } from 'react';
import { Container,Snackbar } from '@mui/material';
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
    if (sessionId) {
      navigate('/homepage');
    }
  }, [sessionId, navigate]);


  
  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage(location.state.message);
      setOpenSnackbar(true);
    }
  },[location.state]);


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
    <Container component="main" maxWidth="xs">
      {showLogin ? <Login /> : <AddUser />}

     
    </Container>

    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message={message}/>
    </>
  );
};

export default Home;

import React from 'react';
import {Routes, Route } from 'react-router-dom';  
import { Box } from '@mui/material'; 
//import NavBar from './components/NavBar';  
//import Footer from './components/Footer'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 

function App() {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* <NavBar /> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      {/* <Footer /> */}
    </Box>
  );
}

export default App;

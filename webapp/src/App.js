import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import { Box } from '@mui/material'; 
//import NavBar from './components/NavBar';  
//import Footer from './components/Footer'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import UserHome from './pages/UserHome';
import PrivateRoute from './pages/PrivateRoute';
import Home from './pages/Home';

function App() {

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
           {/* <NavBar /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/userhome" element={<PrivateRoute element={UserHome} />} />
          </Routes>
          {/* <Footer /> */}
      </Box>
    </Router>
  );
}

export default App;

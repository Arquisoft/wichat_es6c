import React from 'react';
import {Routes, Route } from 'react-router-dom';  
import { Box } from '@mui/material'; 
import NavBar from "./components/NavBar"; 
//import Footer from './components/Footer'; 
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import UserHome from './pages/UserHome';
import PrivateRoute from './pages/PrivateRoute';
import Home from './pages/Home';
import GameMode from './pages/GameMode';
import Game from './pages/Game';
import GameFinished from './pages/GameFinished';
import History from './pages/History'; 

function App() {

  return (

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          { <NavBar />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/homepage" element={<PrivateRoute element={UserHome} />} />
            <Route path="/game-mode" element={<PrivateRoute element={GameMode} />} />
            <Route path="/game" element={<PrivateRoute element={Game} />} />
            <Route path="/game-finished" element={<PrivateRoute element={GameFinished} />} />
            <Route path="/history" element={<PrivateRoute element={History} />} />
          </Routes>
          
          {/* <Footer /> */}
      </Box>
   
  );
}

export default App;

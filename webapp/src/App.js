import React, { useState } from 'react';
import Register from '../pages/Register';
import Login from '../pages/Login';


function App() {

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeProvider theme={theme}>
          <NavBar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
        </ThemeProvider>
      </Box>
    </Router>
  );
}

export default App;

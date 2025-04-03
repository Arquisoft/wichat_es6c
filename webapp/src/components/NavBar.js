import React, { useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Divider, Box } from "@mui/material";
import { MoreVert, History, Person, Settings, Logout, Description } from "@mui/icons-material";
import { SessionContext } from '../SessionContext';
import { useNavigate } from 'react-router-dom';

const NavMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const navigate = useNavigate();   
  const { sessionId, destroySession } = useContext(SessionContext);

  const logout = async () => {
    destroySession();
    setAnchorEl(null);
    navigate('/', { state: { message: "Se ha cerrado sesión con éxito" } });
  };

  const handleLogin = () => navigate('/login');  
  const handleRegister = () => navigate('/register');  
  const handleHistory = () => navigate('/history');

  return (
    <AppBar position="static" sx={{ backgroundColor: "#9b33c0" }}> 
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src="/icon-app.ico" alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />          
          <Typography variant="h6">WICHAT</Typography>
        </Box>

        <Box>
          {sessionId ? ( 
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>
                  <Person sx={{ mr: 1 }} /> Perfil
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <Settings sx={{ mr: 1 }} /> Ajustes
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleHistory}>
                  <History sx={{ mr: 1 }} /> Ver Histórico
                </MenuItem>
                <Divider />
                <MenuItem component="a" href="http://localhost:8000/api-doc" target="_blank" rel="noopener noreferrer">
                  <Description sx={{ mr: 1 }} /> 📄 API Docs
                </MenuItem>
                <Divider />
                <MenuItem onClick={logout}>
                  <Logout sx={{ mr: 1 }} /> Cerrar Sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLogin}
                sx={{
                  borderColor: "white", 
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "25px",
                  '&:hover': {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)", 
                  },
                }}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="contained"
                onClick={handleRegister}
                sx={{
                  backgroundColor: "white",
                  color: "black", 
                  padding: "10px 20px",
                  borderRadius: "25px",
                  '&:hover': {
                    backgroundColor: "rgba(255, 255, 255, 0.8)", 
                  },
                }}
              >
                Crear Cuenta
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavMenu;

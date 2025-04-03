import React, { useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from "@mui/material";
import { History, Person, Settings, Logout, Description, MoreVert } from "@mui/icons-material";
import { SessionContext } from '../SessionContext';
import { useNavigate } from 'react-router-dom';

const NavMenu = () => {
  const navigate = useNavigate();
  const { sessionId, destroySession } = useContext(SessionContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const logout = () => {
    destroySession();
    navigate('/', { state: { message: "Se ha cerrado sesión con éxito" } });
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#9b33c0" }}> 
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo y Nombre */}
        <IconButton onClick={() => navigate("/")} sx={{ p: 0, background: "transparent" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src="/icon-app.ico" alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
            <Typography variant="h6" sx={{ color: "white" }}>WICHAT</Typography>
          </Box>
        </IconButton>

        {/* Menú de navegación */}
        {sessionId ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" startIcon={<Person />} onClick={() => navigate('/history')}>
              Perfil
            </Button>
            <Button color="inherit" startIcon={<Logout />} onClick={logout}>
              Cerrar Sesión
            </Button>

            {/* Menú de configuración */}
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                <Settings sx={{ mr: 1 }} /> Ajustes
              </MenuItem>
              <Divider />
              <MenuItem component="a" href="http://localhost:8000/api-doc" target="_blank" rel="noopener noreferrer">
                <Description sx={{ mr: 1 }} /> API Docs
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: "white", borderColor: "white" }}>
              Iniciar Sesión
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')} sx={{ backgroundColor: "white", color: "black" }}>
              Crear Cuenta
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavMenu;

import React, { useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from "@mui/material";
import { Person, Settings, Logout, Description, MoreVert } from "@mui/icons-material";
import { SessionContext } from '../SessionContext';
import { useNavigate } from 'react-router-dom';
import "../styles/style.css"; // Importar el archivo CSS

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
    <AppBar className="nav-menu"> 
      <Toolbar  className="nav-menu-toolbar">
        {/* Logo y Nombre */}
        <IconButton onClick={() => navigate("/")} className="nav-menu-logo">
          <Box  className="nav-menu-logo-box">
            <img src="/icon-app.ico" alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} className="nav-menu-logo-icon" />
            <Typography variant="h6" sx={{ color: "white" }} className="nav-menu-logo-name">WICHAT</Typography>
          </Box>
        </IconButton>

        {/* Menú de navegación */}
        {sessionId ? (
          <Box  className="nav-menu-buttons">
            <Button color="inherit" startIcon={<Person />} onClick={() => navigate('/history')} className="nav-menu-history">
              Perfil
            </Button>
            <Button color="inherit" startIcon={<Logout />} onClick={logout} className="nav-menu-logout">
              Cerrar Sesión
            </Button>

            {/* Menú de configuración */}
            <IconButton color="inherit" onClick={handleMenuOpen} className="nav-menu-settings">
              <MoreVert />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} className="nav-menu-dropdown">
              <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }} >
                <Settings sx={{ mr: 1 }} /> Ajustes
              </MenuItem>
              <Divider />
              <MenuItem component="a" href="http://localhost:8000/api-doc" target="_blank" rel="noopener noreferrer"  >
                <Description sx={{ mr: 1 }} /> API Docs
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box  className="nav-menu-login-buttons">
            <Button variant="outlined" onClick={() => navigate('/login')} sx={{ color: "white", borderColor: "white" }} className="nav-menu-login">
              Iniciar Sesión
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')} sx={{ backgroundColor: "white", color: "black" }} className="nav-menu-register">
              Crear Cuenta
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavMenu;

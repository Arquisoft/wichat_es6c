import React, { useState, useContext } from "react";
import { AppBar,Snackbar, Toolbar, Typography, IconButton, Menu, MenuItem, Divider, Box } from "@mui/material";
import { MoreVert, History, Person, Settings, Logout } from "@mui/icons-material";
import logo from "../logo.svg";
import { SessionContext } from '../SessionContext';
import { useNavigate } from 'react-router-dom';
const NavMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const navigate = useNavigate();   
  const {destroySession} = useContext(SessionContext);


  const logout = async () => {

    
      destroySession();
      setAnchorEl(null);
      navigate('/', {state: {message: "Se ha cerrado sesión con éxito"}});
     

  };

  

  return (
  
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
         
         <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <Typography variant="h6">WICHAT</Typography>
        </Box>

       
        <Box>
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
            <MenuItem onClick={handleMenuClose}>
              <History sx={{ mr: 1 }} /> Ver Histórico
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <Logout sx={{ mr: 1 }} /> Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>


  
    
  );
};

export default NavMenu;

import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Button, Box } from "@mui/material";
import { MoreVert, History, Person, Settings } from "@mui/icons-material";

const HomePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
         
          <Typography variant="h6">WICHAT</Typography>

          {/* Menú */}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>
              <History sx={{ mr: 1 }} /> Ver Histórico
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Person sx={{ mr: 1 }} /> Perfil
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} /> Ajustes
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

     
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Button variant="contained" size="large" sx={{ fontSize: "1.2rem", px: 5, py: 2 }}>
          Jugar
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;

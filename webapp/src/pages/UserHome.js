import React from "react";
import { Box, Button } from "@mui/material";
import NavBar from "../components/NavBar"; // Importa la barra de navegación

const HomePage = () => {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
     
      <NavBar />

      
      <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Button variant="contained" size="large" sx={{ fontSize: "1.2rem", px: 5, py: 2 }}>
          Jugar
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;

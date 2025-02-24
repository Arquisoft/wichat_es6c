import React, { useState, useEffect} from 'react';
import { Box, Button, Typography} from "@mui/material";
import NavBar from "../components/NavBar"; 
import Cookies from 'js-cookie';

const HomePage = () => {

    const [username, setUsername] = useState(null); 

    useEffect(() => {
        const cookie = Cookies.get('cookie'); 
        if (cookie) {
          const { username } = JSON.parse(cookie); 
          setUsername(username); 
        }
      }, []); 

      return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <NavBar />
          
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            {username && ( 
              <Typography variant="h4" sx={{ marginBottom: 2 }}>
                ¡Bienvenido! {username}
              </Typography>
            )}
      
            <Button variant="contained" size="large" sx={{ fontSize: "1.2rem", px: 5, py: 2 }} >
              Jugar
            </Button>
          </Box>
        </Box>
      );
      
    };

export default HomePage;

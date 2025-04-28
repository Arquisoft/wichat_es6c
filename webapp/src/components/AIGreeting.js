import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { Typewriter } from "react-simple-typewriter";
import { useTranslation } from 'react-i18next';

const AIGreeting = () => {
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const header = t("AIGreeting.message");
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
        const response = await axios.post(`${apiEndpoint}/askllm`, {
          question: header,
          model: "empathy"
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        setGreeting(response.data?.answer || "¡Hola! ¡Espero que tengas un gran día!");
      } catch (error) {
        console.error("Error al obtener el saludo:", error);
        setGreeting("¡Hola! ¡Espero que tengas un gran día!");
      } finally {
        setLoading(false);
      }
    };

    fetchGreeting();
  }, [header]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
    sx={{ p: { xs: "1em", }, backgroundColor: "background.paper", borderRadius: 2, boxShadow: 3 }}>
      <Typography
        variant="h6"
        color="text.primary"
        textAlign="center"
        fontSize={{ xs: "0.8rem", sm: "1rem", md: "1.2rem", lg: "1.8rem" }}
      >
        <Typewriter
          words={[greeting]}
          cursor
          cursorStyle="|"
          typeSpeed={20}
        />
      </Typography>
    </Box>
  );
};

export default AIGreeting;

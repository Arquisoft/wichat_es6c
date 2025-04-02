import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Typography, Button, Table, Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UserHistory() {
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const historyServiceUrl = process.env.HISTORY_SERVICE_URL || 'http://localhost:8007';

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');

    if (storedSessionId) {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername);
    }
  }, []);

  const fetchHistory = async () => {
    if (!username) return;
    setLoading(true);
    try {
      // Llamar al Gateway en lugar del servicio directamente
      const response = await axios.get(historyServiceUrl + '/getUserHistory', {
        params: { username },
      });

      setHistory(response.data.history); // Guardar los datos en el estado
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };


  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Historial de Usuario
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Usuario: <strong>{username}</strong>
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>

        <Button
          variant="contained"
          color="primary"
          onClick={fetchHistory}
          disabled={loading}
          sx={{
            mb: 3,
            backgroundColor: "#6A0DAD",
            "&:hover": {
              backgroundColor: "#5A0C9A",
            },
          }}
        >
          {loading ? "Cargando..." : "Ver Historial"}
        </Button>


        <Button
          variant="contained"
          color="secondary"
          onClick={goToHomepage}
          sx={{
            mb: 3,
            backgroundColor: "white",
            color: "black",
            '&:hover': {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
          }}
        >
          Menú Principal
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ display: "block", margin: "auto", mt: 2 }} />}

      {
        history.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>Correctas</strong></TableCell>
                  <TableCell align="center"><strong>Incorrectas</strong></TableCell>
                  <TableCell align="center"><strong>Tiempo (s)</strong></TableCell>
                  <TableCell align="center"><strong>Puntaje</strong></TableCell>
                  <TableCell align="center"><strong>Modo de Juego</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{item.correctAnswers}</TableCell>
                    <TableCell align="center">{item.wrongAnswers}</TableCell>
                    <TableCell align="center">{item.time}</TableCell>
                    <TableCell align="center">{item.score}</TableCell>
                    <TableCell align="center">{item.gameMode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          !loading && <Typography variant="body1" sx={{ mt: 2 }}>No hay historial disponible.</Typography>
        )
      }
    </Container >
  );
}

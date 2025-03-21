import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, CircularProgress, Container } from "@mui/material";

export default function UserHistory() {
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8005/getUserHistory", { username });
      setHistory(response.data.history);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3, bgcolor: "background.paper", boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>Historial de Partidas</Typography>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TextField
          label="Nombre de usuario"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={fetchHistory}>
          Buscar
        </Button>
      </div>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modo</TableCell>
                <TableCell>Correctas</TableCell>
                <TableCell>Falladas</TableCell>
                <TableCell>Tiempo</TableCell>
                <TableCell>Puntaje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length > 0 ? (
                history.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.gameMode}</TableCell>
                    <TableCell>{entry.preguntasCorrectas}</TableCell>
                    <TableCell>{entry.preguntasFalladas}</TableCell>
                    <TableCell>{entry.time}s</TableCell>
                    <TableCell>{entry.score}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay historial disponible</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}

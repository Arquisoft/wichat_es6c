import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Button, Table, Box, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Card, CardContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UserHistory() {
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const historyServiceUrl = process.env.HISTORY_SERVICE_URL || 'http://localhost:8007';

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const fetchHistory = async () => {
    if (!username) return;
    setLoading(true);
    setHistory([]);       // 🔹 Limpiar historial anterior
    setStats(null);       // 🔹 Limpiar estadísticas
    setLeaderboard([]);   // 🔹 Limpiar ranking
    try {
      const response = await axios.get(`${historyServiceUrl}/getUserHistory`, { params: { username } });
      setHistory(response.data.history);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    if (!username) return;
    setLoading(true);
    setHistory([]);       // 🔹 Limpiar historial
    setStats(null);       // 🔹 Limpiar estadísticas anteriores
    setLeaderboard([]);   // 🔹 Limpiar ranking
    try {
      const response = await axios.get(`${historyServiceUrl}/getUserStats`, { params: { username } });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    setHistory([]);       // 🔹 Limpiar historial
    setStats(null);       // 🔹 Limpiar estadísticas
    setLeaderboard([]);   // 🔹 Limpiar ranking anterior antes de cargar el nuevo
    try {
      const response = await axios.get(`${historyServiceUrl}/getLeaderboard`);
      setLeaderboard(response.data.topPlayers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToHomepage = () => navigate('/homepage');

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
          sx={{ backgroundColor: "#6200ea", color: "#fff", "&:hover": { backgroundColor: "#5a00d6" } }}
          onClick={fetchHistory}
          disabled={loading}
        >
          Ver Historial
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#ff9800", color: "#fff", "&:hover": { backgroundColor: "#e68900" } }}
          onClick={fetchStats}
          disabled={loading}
        >
          Ver Estadísticas
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#4caf50", color: "#fff", "&:hover": { backgroundColor: "#43a047" } }}
          onClick={fetchLeaderboard}
          disabled={loading}
        >
          Ver Ranking
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#bdbdbd", color: "black", "&:hover": { backgroundColor: "#9e9e9e" } }}
          onClick={goToHomepage}
        >
          Menú Principal
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ display: "block", margin: "auto", mt: 2 }} />}

      {stats && (
        <Card sx={{ mt: 3, p: 2, backgroundColor: "#f3f3f3" }}>
          <CardContent>
            <Typography variant="h5">Estadísticas Generales</Typography>
            <Typography>Total Partidas: {stats.totalGames}</Typography>
            <Typography>Respuestas Correctas: {stats.totalCorrect}</Typography>
            <Typography>Respuestas Incorrectas: {stats.totalWrong}</Typography>
            <Typography>Tiempo Total: {stats.totalTime} segundos</Typography>
            <Typography>Promedio de puntos: {stats.averageScore.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center"><strong>Correctas</strong></TableCell>
                <TableCell align="center"><strong>Incorrectas</strong></TableCell>
                <TableCell align="center"><strong>Tiempo (s)</strong></TableCell>
                <TableCell align="center"><strong>Puntos</strong></TableCell>
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
      )}

      {leaderboard.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>Ranking Global</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>Posición</strong></TableCell>
                  <TableCell align="center"><strong>Usuario</strong></TableCell>
                  <TableCell align="center"><strong>Puntos</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((player, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{player.username}</TableCell>
                    <TableCell align="center">{player.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}

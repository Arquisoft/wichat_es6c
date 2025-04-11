import { useState, useEffect } from "react";
import axios from "axios";
import {  Container, Typography, Button, Table, Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Card, CardContent, Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

export default function UserHistory() {
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const fetchHistory = async () => {
    if (!username) return;
    setLoading(true);
    setHistory([]);       
    setStats(null);       
    setLeaderboard([]);   
    try {
      const response = await axios.get(`${apiEndpoint}/getUserHistory`, { params: { username } });
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
    setHistory([]);       
    setStats(null);       
    setLeaderboard([]);   
    try {
      const response = await axios.get(`${apiEndpoint}/getUserStats`, { params: { username } });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    setHistory([]);       
    setStats(null);       
    setLeaderboard([]);   
    try {
      const response = await axios.get(`${apiEndpoint}/getLeaderboard`);
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
        <Typography variant="h5" gutterBottom>Estadísticas Generales</Typography>
        
        <Grid container spacing={3}>
          {/* Gráfico de torta para respuestas correctas/incorrectas */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Distribución de respuestas</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Correctas', value: stats.totalCorrect },
                    { name: 'Incorrectas', value: stats.totalWrong }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key="correct" fill="#4caf50" />
                  <Cell key="wrong" fill="#ff5722" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          {/* Gráfico de torta para respuestas correctas/incorrectas */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Distribución de respuestas</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Perdidas', value: stats.totalCorrect },
                    { name: 'Ganadas', value: stats.totalWrong }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell key="correct" fill="#4caf50" />
                  <Cell key="wrong" fill="#ff5722" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          {/* Estadísticas numéricas con diseño mejorado */}
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Card sx={{ backgroundColor: '#6200ea', color: 'white', p: 2 }}>
                  <Typography>Total Partidas</Typography>
                  <Typography variant="h4">{stats.totalGames}</Typography>
                </Card>
              </Grid>
              <Grid item>
                <Card sx={{ backgroundColor: '#4caf50', color: 'white', p: 2 }}>
                  <Typography>Promedio de puntos</Typography>
                  <Typography variant="h4">{stats.averageScore.toFixed(2)}</Typography>
                </Card>
              </Grid>
              <Grid item>
                <Card sx={{ backgroundColor: '#ff9800', color: 'white', p: 2 }}>
                  <Typography>Tiempo Total</Typography>
                  <Typography variant="h4">{stats.totalTime}s</Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
  <Box sx={{ mt: 3, height: { xs: 300, sm: 400, md: 500 } }}> {/* Dynamic height based on screen size */}
    <Typography variant="h5" gutterBottom>Ranking Global</Typography>
    <ResponsiveContainer width="100%" height="70%"> {/* Adjust height dynamically */}
      <BarChart
        data={leaderboard}
        layout="vertical"
        margin={{ left: 100 }}
      >
        <XAxis type="number" />
        <YAxis type="category" dataKey="username" />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Bar dataKey="score" fill="#4caf50">
          {leaderboard.map((entry, index) => (
            <Cell key={index} fill={index < 3 ? '#2e7d32' : '#4caf50'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </Box>
)}
    </Container>
  );
}

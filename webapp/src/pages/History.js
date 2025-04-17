import { useState, useEffect } from "react";
import axios from "axios";
import {  Container, Typography, Button, Table, Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Card, CardContent, Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import {
  PersonIcon,
  ScoreIcon,
  CheckCircleIcon,
  VideogameAssetIcon
} from '@mui/icons-material';

export default function UserHistory() {
  const [username, setUsername] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState({
    topPlayers: [],
    userPosition: null
  });
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const [sortCriteria, setSortCriteria] = useState('totalScore');
  

  const gatewayService = process.env.HISTORY_SERVICE_URL || 'http://localhost:8000';

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserProfile(storedUsername); // Llamar para cargar el perfil
    }
  }, []);

  const fetchUserProfile = async (user) => {
    try {
      const response = await axios.get(`http://localhost:8000/user/profile/${user}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchHistory = async () => {
    if (!username) return;
    setLoading(true);
    setHistory([]);       
    setStats(null);       
    setLeaderboard({ topPlayers: [], userPosition: null });
    try {
      const response = await axios.get(`${gatewayService}/getUserHistory`, { params: { username } });
      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    if (!username) console.error("No tiene nombre de usuario.");
    setLoading(true);
    setHistory([]);       // Limpiar historial
    setStats(null);       // Limpiar estadísticas anteriores
    setLeaderboard({ topPlayers: [], userPosition: null });  
    try {
      console.log("Fetching stats for user:", username);
      const response = await axios.get(`${gatewayService}/getUserStats`, { params: { username } });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchLeaderboard = async (criteria = sortCriteria) => {
    setLoading(true);
    setHistory([]);       
    setStats(null);
    setLeaderboard({ topPlayers: [], userPosition: null });
    
    try {
      const response = await axios.get(`${gatewayService}/getLeaderboard`, {
        params: { 
          sortBy: criteria,
          username: localStorage.getItem('username')
        }
      });
  
      setLeaderboard({
        topPlayers: response.data.topPlayers || [],
        userPosition: response.data.userPosition || null
      });
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Error al cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  // Función para colores de ranking
  const getRankColor = (rank) => {
    const colors = {
      1: { bg: 'rgba(255, 215, 0, 0.3)', border: '1px solid rgba(255, 215, 0, 0.6)' },
      2: { bg: 'rgba(192, 192, 192, 0.3)', border: '1px solid rgba(192, 192, 192, 0.6)' },
      3: { bg: 'rgba(205, 127, 50, 0.3)', border: '1px solid rgba(205, 127, 50, 0.6)' },
      default: { bg: 'rgba(160, 204, 172, 0.3)', border: '1px solid rgba(160, 204, 172, 0.3)' }
    };
    
    return colors[rank] || colors.default;
  };
  
  const handleSort = async (criteria) => {
    // Usamos el valor actualizado inmediatamente en lugar de esperar al estado
    await fetchLeaderboard(criteria); // Pasamos el criterio directamente
    setSortCriteria(criteria); // Actualizamos el estado para futuras llamadas
  };

  const updateUserInfo = async (event) => {
    event.preventDefault();
    setLoading(true);
    const updatedUser = {
      name: name,           
      surname: surname,       
      profilePicture: profilePicture, 
      description: description,   
    };
  
    try {
      // Llamamos al Gateway para actualizar el perfil
      const result = await updateUserProfile(userProfile.username, updatedUser); 
      setUserProfile(result.user); // Actualizar el perfil con los nuevos datos
      alert('Perfil actualizado correctamente');
      setEditMode(false); // Desactivar el modo de edición
      navigate('/profile'); // Redirigir al perfil o donde lo desees
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    } finally {
      setLoading(false);
    }
  };
  const updateUserProfile = async (username, updatedUser) => {
    try {
      const response = await axios.put(`${gatewayService}/user/update/profile/${username}`, updatedUser);
      console.log('Perfil actualizado:', response.data);
      return response.data; // Devolver los datos del perfil actualizado
    } catch (error) {
      throw new Error('Error al actualizar el perfil: ' + error.response?.data?.error || error.message);
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
  
      {userProfile && !editMode && (
        <Card sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, boxShadow: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
          {/* Imagen de perfil con borde redondeado */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 3 }}>
            <img
              src={userProfile.profilePicture}
              alt="User Avatar"
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.15)',
              }}
            />
          </Box>
  
          {/* Información del usuario */}
          <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              {userProfile.name} {userProfile.surname}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: '400px' }}>
              {userProfile.description}
            </Typography>
          </Box>
  
          {/* Botón para editar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ml: 3 }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ marginTop: 1, color: "#6200ea", borderColor: "#6200ea" }}
              onClick={() => setEditMode(true)} // Cambia el modo a editar
            >
              Editar Perfil
            </Button>
          </Box>
        </Card>
      )}
  
      {/* Formulario de edición de perfil */}
      {editMode && (
        <Card sx={{ mb: 3, p: 3, backgroundColor: '#f9f9f9', boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            Editar Perfil
          </Typography>
          <form onSubmit={updateUserInfo}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Apellido"
                variant="outlined"
                fullWidth
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
              <TextField
                label="URL de la imagen"
                variant="outlined"
                fullWidth
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
              />
              <TextField
                label="Descripción"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                sx={{
                  backgroundColor: '#6200ea',
                  '&:hover': { backgroundColor: '#5a00d6' },
                }}
              >
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </Button>
            </Box>
          </form>
        </Card>
      )}
  
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
          onClick={() => {
            fetchLeaderboard(); // Siempre usa el sortCriteria actual
          }}
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
        <Card sx={{ mt: 3, p: { xs: 2, sm: 3 }, backgroundColor: "#f3f3f3" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Estadísticas Generales</Typography>
            
            {stats.totalGames > 0 ? (
              <Grid container spacing={3} alignItems="stretch">
                {/* Gráfico de torta a la izquierda */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Distribución de respuestas</Typography>
                  <Box sx={{ width: '100%', height: { xs: 250, sm: 300 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Correctas', value: stats.totalCorrect || 0 },
                            { name: 'Incorrectas', value: stats.totalWrong || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius="40%"
                          outerRadius="60%"
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
                  </Box>
                </Grid>

                {/* Estadísticas a la derecha */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2} direction="column" justifyContent="center">
                    <Grid item>
                      <Card sx={{ backgroundColor: '#6200ea', color: 'white', p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1">Total Partidas</Typography>
                        <Typography variant="h4">{stats.totalGames || 0}</Typography>
                      </Card>
                    </Grid>
                    <Grid item>
                      <Card sx={{ backgroundColor: '#4caf50', color: 'white', p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1">Promedio de puntos</Typography>
                        <Typography variant="h4">{stats?.averageScore?.toFixed(2) ?? '0.00'}</Typography>
                      </Card>
                    </Grid>
                    <Grid item>
                      <Card sx={{ backgroundColor: '#ff9800', color: 'white', p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1">Tiempo Total</Typography>
                        <Typography variant="h4">{stats.totalTime || 0}s</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No hay estadísticas disponibles.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {history.length === 0 && !loading && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          No hay partidas en el historial.
        </Typography>
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

      {leaderboard.topPlayers.length === 0 && !loading && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          No hay datos de ranking disponibles.
        </Typography>
      )}
  
      {leaderboard.topPlayers.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>Ranking Global</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: 'background.default',
                  '& th': {
                    fontWeight: 'fontWeightBold',
                    padding: { xs: '0.5rem', sm: '0.75rem', md: '1rem' },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    textAlign: 'left', // Alineación horizontal izquierda
                    verticalAlign: 'bottom', // Alineación vertical inferior
                    borderBottom: '2px solid',
                    borderColor: 'divider'
                  }
                }}>
                  {/* Posición */}
                  <TableCell sx={{ 
                    width: { xs: '3em', md: '5em' },
                    pl: { xs: 1, md: 2 } // Padding izquierdo ajustado
                  }}>
                    Posición
                  </TableCell>
                  
                  {/* Usuario */}
                  <TableCell 
                    onClick={() => handleSort('_id')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    Usuario
                  </TableCell>
                  
                  {/* Puntuación Total */}
                  <TableCell 
                    onClick={() => handleSort('totalScore')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    Puntuación
                  </TableCell>
                  
                  {/* % Aciertos */}
                  <TableCell 
                    onClick={() => handleSort('accuracy')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    % Aciertos
                  </TableCell>
                  
                  {/* Correctas */}
                  <TableCell 
                    onClick={() => handleSort('totalCorrect')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    Correctas
                  </TableCell>
                  
                  {/* Partidas */}
                  <TableCell 
                    onClick={() => handleSort('totalGames')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    Partidas
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.topPlayers.map((user, index) => (
                  <TableRow key={user._id}
                  sx={{backgroundColor: getRankColor(user.globalRank).bg
                    , border: getRankColor(user.globalRank).border,
                    '&:hover': {
                      backgroundColor: getRankColor(user.globalRank).bg.replace('0.3', '0.5'),
                      transform: 'scale(1.03)'
                    },
                  }}
                  >
                    <TableCell>{user.globalRank}</TableCell>
                    <TableCell>{user._id}</TableCell>
                    <TableCell>{user.totalScore}</TableCell>
                    <TableCell>{user.accuracy?.toFixed(2)}%</TableCell>
                    <TableCell>{user.totalCorrect}</TableCell>
                    <TableCell>{user.totalGames}</TableCell>
                  </TableRow>
                ))}
                
                {leaderboard.userPosition && (
                  <TableRow sx={{ 
                    backgroundColor: getRankColor(leaderboard.userPosition.globalRank).bg,
                    border: getRankColor(leaderboard.userPosition.globalRank).border,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      transform: 'scale(1.01)'
                    },
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#ff9800'
                    }
                  }}>
                    <TableCell>{leaderboard.userPosition.globalRank}</TableCell>
                    <TableCell>{leaderboard.userPosition._id} (Tú)</TableCell>
                    <TableCell>{leaderboard.userPosition.totalScore}</TableCell>
                    <TableCell>{leaderboard.userPosition.accuracy?.toFixed(2) ?? '0.00'}%</TableCell>
                    <TableCell>{leaderboard.userPosition.totalCorrect || 0}</TableCell>
                    <TableCell>{leaderboard.userPosition.totalGames || 0}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
  
}

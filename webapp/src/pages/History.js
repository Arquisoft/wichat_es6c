import { useEffect, useState, useRef, useContext, useCallback } from "react";
import axios from "axios";
import {
  Container, Alert, Typography, Button, Table, Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Card, CardContent, Grid, TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { useTranslation, Trans } from 'react-i18next';
import { SessionContext } from "../SessionContext";

export default function UserHistory() {
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
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [historyAccessed, setHistoryAccessed] = useState(false);
  const [rankingAccessed, setRankingAccessed] = useState(false);

  const { t } = useTranslation();
  const { username } = useContext(SessionContext);
  const gatewayService = process.env.HISTORY_SERVICE_URL || 'http://localhost:8000';
  const videoRef = useRef(null);


  // Función de validación
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = t('History.nameRequired')
    if (!surname.trim()) newErrors.surname = t('History.surnameRequired')
    if (profilePicture && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(profilePicture)) {
      newErrors.profilePicture = t('History.urlNotValid')
    }
    if (description.length > 200) newErrors.description = t('History.maxCharacters')
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserProfile = useCallback(async (user) => {
    try {
      const response = await axios.get(`${gatewayService}/user/profile/${user}`);
      setUserProfile(response.data);

      // Solo actualiza los campos si NO estamos en modo edición
      if (!editMode) {
        setName(response.data.name || '');
        setSurname(response.data.surname || '');
        setProfilePicture(response.data.profilePicture || '');
        setDescription(response.data.description || '');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [editMode, gatewayService]);

  useEffect(() => {
    if (username) {
      fetchUserProfile(username); // Llamar para cargar el perfil
    }
    
  }, [username,editMode,userProfile,fetchUserProfile]);


  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.5; // Reduce la velocidad si es necesario
      const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(error => {
        console.warn("Auto-play was prevented:", error);
      });
    }
    }
  }, []);

  const fetchHistory = async () => {
    if (!username) return;
    setLoading(true);
    setHistory([]);
    setStats(null);
    setLeaderboard({ topPlayers: [], userPosition: null });
    try {
      const response = await axios.get(`${gatewayService}/getUserHistory`, { params: { username } });
      setHistory(response.data.history || []);
      if (response.data.history?.length > 0) {
        setHistoryAccessed(true); // Marcar como accedido
      }
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

      if (response.data.topPlayers?.length > 0) {
        setRankingAccessed(true); // Marcar como accedido
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para colores de ranking
  const getRankColor = (rank) => {
    const colors = {
      1: { bg: '#FFD700', border: '1px solid #FFD700' }, // Oro sólido
      2: { bg: '#C0C0C0', border: '1px solid #C0C0C0' }, // Plata sólida
      3: { bg: '#CD7F32', border: '1px solid #CD7F32' }, // Bronce sólido
      default: { bg: '#A0CCAC', border: '1px solid #A0CCAC' } // Verde sólido
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

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const updatedUser = {
        name: name.trim(),
        surname: surname.trim(),
        profilePicture: profilePicture.trim(),
        description: description.trim(),
      };

      await updateUserProfile(username, updatedUser);

      // Actualiza el perfil y cierra edición
      setUserProfile(prev => ({
        ...prev,
        ...updatedUser
      }));

      setSuccessMessage(t('History.profileUpdated'));
      setTimeout(() => setEditMode(false), 1500);

    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setErrors({
        server: error.message.includes("Error al actualizar el perfil:")
          ? error.message.split(": ")[1]
          : "Error al actualizar el perfil"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (username, updatedUser) => {
    try {
      const response = await axios.put(
        `${gatewayService}/user/update/profile/${username}`,
        updatedUser,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 200) {
        return response.data;
      }

      throw new Error(response.data.error || 'Error desconocido');

    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const goToHomepage = () => navigate('/homepage');

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>

      {/* Video de fondo - Configuración idéntica a HomePage */}
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
          objectFit: "cover",
          opacity: 0.7,
        }}
      >
        <source src="/videos/background_white_small.mp4" type="video/mp4" />
      </Box>

      {/* Capa oscura para mejorar legibilidad - Configuración idéntica */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",

          backgroundColor: "rgba(255, 255, 255, 0.09)",
          zIndex: -1,
        }}
      />

      <Typography variant="h4"

        sx={{
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#6A0DAD',
          borderRadius: '11px',

        }}

        gutterBottom>
        {t('History.title')}
      </Typography>
      <Typography variant="subtitle1" sx={{
        fontWeight: 'medium',
        color: 'white',
        backgroundColor: '#6A0DAD',
        borderRadius: '11px',
             }} gutterBottom>
        <Trans
          i18nKey="History.usernameDisplay"

          values={{ username }}
          components={{
            strong: <strong style={{ color: '#FFD700' }} />
          }}
        /> </Typography>

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
              {t('History.editProfile')}
            </Button>
          </Box>
        </Card>
      )}

      {/* Formulario de edición de perfil */}
      {editMode && (
        <Card sx={{ mb: 3, p: 3, backgroundColor: '#f9f9f9', boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            {t('History.editProfile')}
          </Typography>

          {/* Mensaje de éxito/error general */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <form onSubmit={updateUserInfo}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('History.name')}
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                label={t('History.surname')}
                variant="outlined"
                fullWidth
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                error={!!errors.surname}
                helperText={errors.surname}
              />

              <TextField
                label={t('History.urlImage')}
                variant="outlined"
                fullWidth
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                error={!!errors.profilePicture}
                helperText={errors.profilePicture || `${t('History.ex')} https://ejemplo.com/imagen.jpg`}
              />

              <TextField
                label={t('History.description')}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${description.length}/200`}
                inputProps={{ maxLength: 200 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setEditMode(false);
                  setErrors({});
                  setSuccessMessage('');
                }}
              >
                {t('History.cancel')}
              </Button>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                sx={{
                  backgroundColor: '#6200ea',
                  '&:hover': { backgroundColor: '#5a00d6' },
                  minWidth: 150
                }}
              >
                {loading ? t("History.updating") : t("History.saveChanges")}
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
          {t("History.viewHistory")}
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#ff9800", color: "#fff", "&:hover": { backgroundColor: "#e68900" } }}
          onClick={fetchStats}
          disabled={loading}
        >
          {t("History.viewStats")}
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#4caf50", color: "#fff", "&:hover": { backgroundColor: "#43a047" } }}
          onClick={() => {
            fetchLeaderboard(); // Siempre usa el sortCriteria actual
          }}
          disabled={loading}
        >
          {t("History.viewRanking")}
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#bdbdbd", color: "black", "&:hover": { backgroundColor: "#9e9e9e" } }}
          onClick={goToHomepage}
        >
          {t("History.mainPage")}

        </Button>
      </Box>

      {loading && <CircularProgress sx={{ display: "block", margin: "auto", mt: 2 }} />}

      {stats && (
        <Card sx={{ mt: 3, p: { xs: 2, sm: 3 }, backgroundColor: "#f3f3f3" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>{t("History.generalStats")}</Typography>


            {stats.totalGames > 0 ? (
              <Grid container spacing={3} alignItems="stretch">
                {/* Gráfico de torta a la izquierda */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>{t("History.distributionAnswers")}</Typography>
                  <Box sx={{ width: '100%', height: { xs: 250, sm: 300 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: t('History.correct'), value: stats.totalCorrect || 0 },
                            { name: t('History.incorrect'), value: stats.totalWrong || 0 }
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
                        <Typography variant="subtitle1">{t("History.totalGames")}
                        </Typography>
                        <Typography variant="h4">{stats.totalGames || 0}</Typography>
                      </Card>
                    </Grid>
                    <Grid item>
                      <Card sx={{ backgroundColor: '#4caf50', color: 'white', p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1">{t("History.averageScore")}
                        </Typography>
                        <Typography variant="h4">{stats?.averageScore?.toFixed(2) ?? '0.00'}</Typography>
                      </Card>
                    </Grid>
                    <Grid item>
                      <Card sx={{ backgroundColor: '#ff9800', color: 'white', p: 2, textAlign: 'center' }}>
                        <Typography variant="subtitle1">{t("History.totalTime")}
                        </Typography>
                        <Typography variant="h4">{stats.totalTime || 0}s</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                {t("History.nonStatsAvailable")}
              </Typography>
            )}
          </CardContent>
        </Card>
      )
      }

      {history.length === 0 && !loading && !historyAccessed && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          {t("History.nonGames")}
        </Typography>
      )}

      {history.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center"><strong>{t('History.correct')}</strong></TableCell>
                <TableCell align="center"><strong>{t('History.incorrect')}</strong></TableCell>
                <TableCell align="center"><strong>{t('History.time')}</strong></TableCell>
                <TableCell align="center"><strong>{t('History.score')}</strong></TableCell>
                <TableCell align="center"><strong>{t('History.gameMode')}</strong></TableCell>
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

      {leaderboard.topPlayers.length === 0 && !loading && !rankingAccessed && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          {t("History.nonRanking")}
        </Typography>
      )}

      {leaderboard.topPlayers.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              backgroundColor: 'white',
              color: 'black',
              padding: '0.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {t('History.globalRanking')}
          </Typography>
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
                    {t('History.position')}
                  </TableCell>

                  {/* Usuario */}
                  <TableCell
                    onClick={() => handleSort('_id')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {t('History.user')}
                  </TableCell>

                  {/* Puntuación Total */}
                  <TableCell
                    onClick={() => handleSort('totalScore')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {t('History.score')}
                  </TableCell>

                  {/* % Aciertos */}
                  <TableCell
                    onClick={() => handleSort('accuracy')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {t('History.percentageHits')}
                  </TableCell>

                  {/* Correctas */}
                  <TableCell
                    onClick={() => handleSort('totalCorrect')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {t('History.correct')}
                  </TableCell>

                  {/* Partidas */}
                  <TableCell
                    onClick={() => handleSort('totalGames')}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {t('History.games')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.topPlayers.map((user, index) => (
                  <TableRow key={user._id}
                    sx={{
                      backgroundColor: getRankColor(user.globalRank).bg
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
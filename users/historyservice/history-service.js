const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa CORS
const UserHistory = require('./history-model')
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yaml')

require('dotenv').config();

const app = express();
const port = 8007;

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

//crea un elemento history si no existe 
app.post('/createUserHistory', async (req, res) => {
  try {
    const { 
      username, 
      correctAnswers, 
      wrongAnswers, 
      time, 
      score, 
      gameMode 
    } = req.body;

    // Validación básica
    if (!username) {
      return res.status(400).json({ error: "Username es requerido." });
    }

    const newUserHistory = new UserHistory({
      username: username.toString(),
      correctAnswers: correctAnswers || 0,
      wrongAnswers: wrongAnswers || 0,
      time: time || 0,
      score: score || 0,
      gameMode: gameMode || 'Country',
    });

    await newUserHistory.save();
    res.json(newUserHistory);
    console.log('Historial guardado correctamente.');

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getUserHistory", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Se requiere un username" });
    }
    
    // CAMBIA History por UserHistory
    const history = await UserHistory.find({ username });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas de usuario
app.get('/getUserStats', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Se requiere un username" });
    
    const history = await UserHistory.find({ username });
    if (!history.length) return res.status(404).json({ error: "No hay datos para este usuario" });
    
    const totalGames = history.length;
    const totalCorrect = history.reduce((sum, game) => sum + game.correctAnswers, 0);
    const totalWrong = history.reduce((sum, game) => sum + game.wrongAnswers, 0);
    const totalTime = history.reduce((sum, game) => sum + game.time, 0);
    const averageScore = history.reduce((sum, game) => sum + game.score, 0) / totalGames;
    
    res.json({ totalGames, totalCorrect, totalWrong, totalTime, averageScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/getLeaderboard', async (req, res) => {
  try {
    const { sortBy = 'totalScore', username } = req.query;
    
    // Pipeline para todos los usuarios (sin limitar)
    const fullPipeline = [

      {
        $group: {
          _id: "$username",
          totalScore: { $sum: "$score" },
          totalCorrect: { $sum: "$correctAnswers" },
          totalWrong: { $sum: "$wrongAnswers" },
          totalGames: { $sum: 1 },
          avgTime: { $avg: "$time" }
        }
      },
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $eq: [{ $add: ["$totalCorrect", "$totalWrong"] }, 0] },
              0,
              { 
                $multiply: [
                  { $divide: ["$totalCorrect", { $add: ["$totalCorrect", "$totalWrong"] }] },
                  100
                ]
              }
            ]
          }
        }
      },
      {
        $setWindowFields: {
          sortBy: { [sortBy]: -1 },
          output: {
            globalRank: { $rank: {} }
          }
        }
      }
    ];

    // Obtener todos los usuarios con su ranking global
    const allPlayers = await UserHistory.aggregate(fullPipeline);
    
    // Ordenar y limitar a top 10
    const topPlayers = allPlayers
      .sort((a, b) => b[sortBy] - a[sortBy])
      .slice(0, 10);

    // Buscar usuario específico
    let userPosition = null;
    if (username) {
      userPosition = allPlayers.find(p => p._id === username);
      
      // Eliminar datos innecesarios si existe en el top 10
      if(userPosition && topPlayers.some(p => p._id === username)) {
        userPosition = null;
      }
    }

    res.json({ 
      topPlayers,
      userPosition: userPosition 
        ? { ...userPosition, globalRank: userPosition.globalRank } 
        : null 
    });
    
  } catch (error) {
    console.error('Error en getLeaderboard:', error);
    res.status(500).json({ 
      error: "Error en el servidor",
      details: error.message 
    });
  }
});

const server = app.listen(port, () => {
  console.log(`History Service listening at http://localhost:${port}`);
});

module.exports = server
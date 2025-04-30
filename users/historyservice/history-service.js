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
    if (history.length==0) return res.json({ totalGames:0, totalCorrect:0, totalWrong:0, totalTime:0, averageScore:0 });
    const totalGames = history.length;
    const totalCorrect = history.reduce((sum, game) => sum + game.correctAnswers, 0);
    const totalWrong = history.reduce((sum, game) => sum + game.wrongAnswers, 0);
    const totalTime = history.reduce((sum, game) => sum + game.time, 0);
    let averageScore =0;
    if(totalGames != 0) {
    averageScore = history.reduce((sum, game) => sum + game.score, 0) / totalGames;
    }
    res.json({ totalGames, totalCorrect, totalWrong, totalTime, averageScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/getLeaderboard', async (req, res) => {
  try {
    const { sortBy = 'totalScore', username } = req.query;

    // Validar sortBy
    const validSortFields = ['totalScore', 'accuracy', 'avgTime', 'totalGames', 'totalCorrect','_id','username'];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ error: `Campo sortBy inválido: ${sortBy}` });
    }

    // Pipeline de agregación
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
                  {
                    $divide: ["$totalCorrect", { $add: ["$totalCorrect", "$totalWrong"] }]
                  },
                  100
                ]
              }
            ]
          }
        }
      }
    ];

    const allPlayers = await UserHistory.aggregate(fullPipeline);

    // Ordenar por múltiples criterios
    allPlayers.sort((a, b) => {
      if (b[sortBy] !== a[sortBy]) return b[sortBy] - a[sortBy]; // principal
      if (a.avgTime !== b.avgTime) return a.avgTime - b.avgTime; // menor es mejor
      if (b.totalGames !== a.totalGames) return b.totalGames - a.totalGames; // más mejor
      return a._id.localeCompare(b._id); // alfabético
    });

    // Asignar ranking
    let currentRank = 1;
    let lastValue = null;
    for (let i = 0; i < allPlayers.length; i++) {
      const current = allPlayers[i];
      const key = [current[sortBy], current.avgTime, current.totalGames, current._id].join('|');

      if (key !== lastValue) {
        currentRank = i + 1;
        lastValue = key;
      }
      current.globalRank = currentRank;
    }

    // Obtener el top 10 ya con el ranking correcto
    const topPlayers = allPlayers.slice(0, 10);

    // Buscar usuario actual
    let userPosition = null;
    if (username) {
      const user = allPlayers.find(p => p._id === username);

      // Si está fuera del top 10, lo devolvemos al final
      if (user && !topPlayers.some(p => p._id === username)) {
        userPosition = { ...user };
      }
    }

    res.json({
      topPlayers,
      userPosition
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
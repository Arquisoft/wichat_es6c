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
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Obtener estadísticas de usuario
app.get('/getUserStats', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Se requiere un username" });
    
    const history = await UserHistory.find({ username });
    if (!history.length) return res.json({ message: "No hay datos para este usuario" });
    
    const totalGames = history.length;
    const totalCorrect = history.reduce((sum, game) => sum + game.correctAnswers, 0);
    const totalWrong = history.reduce((sum, game) => sum + game.wrongAnswers, 0);
    const totalTime = history.reduce((sum, game) => sum + game.time, 0);
    const averageScore = history.reduce((sum, game) => sum + game.score, 0) / totalGames;
    
    res.json({ totalGames, totalCorrect, totalWrong, totalTime, averageScore });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get('/getLeaderboard', async (req, res) => {
  try {
    const topPlayers = await UserHistory.aggregate([
      // Ordenar todos los registros por score de forma descendente
      { $sort: { score: -1 } },
      // Agrupar por username y tomar el primer documento (con el score más alto)
      {
        $group: {
          _id: "$username",
          doc: { $first: "$$ROOT" }
        }
      },
      // Reemplazar la raíz del documento por el contenido de 'doc'
      { $replaceRoot: { newRoot: "$doc" } },
      // Volver a ordenar los resultados (porque el group pierde el orden)
      { $sort: { score: -1 } },
      // Limitar a 10 resultados
      { $limit: 10 }
    ]);

    res.json({ topPlayers });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

const server = app.listen(port, () => {
  console.log(`History Service listening at http://localhost:${port}`);
});

module.exports = server
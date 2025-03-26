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
app.use(bodyParser.json());

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
      preguntasCorrectas: correctAnswers || 0,
      preguntasFalladas: wrongAnswers || 0,
      time: time || 0,
      score: score || 0,
      gameMode: gameMode || 'Country',
    });

    await newUserHistory.save();
    res.json({ message: 'Historial guardado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/getUserHistory', async (req, res) => {
  try {
    const { username } = req.body;

    // Convertir el nombre de usuario en una cadena
    const safeUsername = username.toString();

    const history = await UserHistory.find({ username: safeUsername });
    res.json({history: history});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`History Service listening at http://localhost:${port}`);
});
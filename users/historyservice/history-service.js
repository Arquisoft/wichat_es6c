const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserHistory = require('./history-model')
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yaml')

require('dotenv').config();

const app = express();
const port = 8005;

// Middleware to parse JSON in request body
app.use(bodyParser.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);

//crea un elemento history si no existe 
app.post('/createUserHistory', async (req, res) => {
  try {
    const { username } = req.body;

    // Convertir el nombre de usuario en una cadena
    const safeUsername = username.toString();

      const newUserHistory = new UserHistory({
        username: safeUsername,
        preguntasCorrectas: 0,
        preguntasFalladas: 0,
        time: 0,
        score: 0,
        gameMode: 'Country',
      });
      await newUserHistory.save();

    // Respuesta inmediata al cliente indicando que la operación se ha completado con éxito
    res.json({ message: 'Historial de partida creado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/getUserHistory', async (req, res) => {
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
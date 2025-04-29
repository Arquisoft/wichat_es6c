const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express'); 
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const historyServiceUrl = process.env.HISTORY_SERVICE_URL || 'http://localhost:8007';

app.use(cors());
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({includeMethod: true});
app.use(metricsMiddleware);

const handleErrors = (res, error) => {
  if (error.response && error.response.status) {
    res.status(error.response.status).json({ error: error.response.data.error });
  } else if (error.message) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

//-----Questions WIKIDATA endpoint----

app.get('/questions/:lang/:category', async (req, res) => {
  try{
      const category = req.params.category;
      const lang = req.params.lang;
      const questionResponse = await axios.get(questionServiceUrl+`/getQuestionsDb/${lang}/${category}`);
      res.json(questionResponse.data);
  }catch (error) {
    handleErrors(res, error);
  }
});

app.post("/questions/validate", async (req,res) => {

  try{

    const { questionId, selectedAnswer} = req.body;

    const question = await axios.post(questionServiceUrl + `/validate/${questionId}`);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;
    axios.get(questionServiceUrl + `/delete/${questionId}`);

    res.json({isCorrect});
  }catch(error){
    handleErrors(res,error);
  }
});

//-----------------------------

//-----User Games History endpoint----

app.post('/createUserHistory', async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body); 
      // Reenviar la solicitud POST al servicio de ranking para crear un ranking para el usuario
      const historyResponse = await axios.post(historyServiceUrl+'/createUserHistory', req.body);
      res.json(historyResponse.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ha fallado algo en el servidor',
      details: error.message,
    });
  }
});

app.get("/getUserHistory", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.query); 
    const { username } = req.query; // Obtener el parámetro de la URL
    if (!username) {
      return res.status(400).json({ error: "Se requiere un username" });
    }

    // Reenviar la petición al microservicio de historial
    const response = await axios.get(`${historyServiceUrl}/getUserHistory`, {
      params: { username }, // Pasar el parámetro como query
    });

    res.json(response.data); // Enviar la respuesta al cliente
  } catch (error) {
    console.error("Error en Gateway:", error.response?.data || error.message);
    res.status(500).json({ error: "Error en el servidor del Gateway" });
  }
});

// Obtener estadísticas de usuario
app.get('/getUserStats', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Se requiere un username" });
    
    const response = await axios.get(`${historyServiceUrl}/getUserStats`, { params: { username } });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estadísticas", details: error.message });
  }
});

// Obtener ranking global
app.get('/getLeaderboard', async (req, res) => {
  try {
    const { sortBy, username } = req.query;
    const response = await axios.get(`${historyServiceUrl}/getLeaderboard`, {
      params: { 
        sortBy,
        username
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error en gateway /getLeaderboard:', error.response?.data || error.message);
    res.status(500).json({ 
      error: "Error al obtener ranking",
      details: error.response?.data?.error || error.message 
    });
  }
});

//-----------------------------
//-----User Service endpoint----
app.get('/user/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const response = await axios.get(`${userServiceUrl}/user/profile/${username}`);
    res.json(response.data);
  } catch (error) {
    handleErrors(res, error);
  }
});
//-----------------------------

//-----User Service endpoint para actualizar el perfil del usuario---- 
app.put('/user/update/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { name, surname, profilePicture, description } = req.body;

    const response = await axios.put(`${userServiceUrl}/user/update/profile/${username}`, {
      name,
      surname,
      profilePicture,
      description
    });

    res.json(response.data); // Devolver la respuesta del servicio de usuarios
  } catch (error) {
    handleErrors(res, error); // Manejar cualquier error que ocurra
  }
});

//-----User Service endpoint----

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl+'/login', req.body);
    res.json(authResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});

app.post('/user', async (req, res) => {
  try {
    const userUrl = new URL(`/user/`, userServiceUrl);
    const userResponse = await axios.post(userUrl.href, req.body);
    res.json(userResponse.data);
  } catch (error) {
    handleErrors(res, error);
  }
});


app.post('/askllm', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl+'/ask', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

// Read the OpenAPI YAML file synchronously
openapiPath='./openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}


// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server

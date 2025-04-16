const express = require('express');


const dataService = require('./question-data-service');
const generateService = require('./question-generate-service');
const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());

app.get('/getQuestionsDb/:category', async (req, res) => {
  try {
    const category = req.params.category;

    // Verificar y generar preguntas si es necesario
    const questionsToGenerate = 20;
    let numberQuestions = await dataService.getNumberQuestionsByCategory(category);
    console.log(`Número de preguntas en la base de datos: ${numberQuestions} para la categoría: ${category}`);

    if (numberQuestions < 5) {
      generateService.generateQuestionsByCategory(category, questionsToGenerate - numberQuestions);

      // Esperar hasta que haya al menos 10 preguntas en la base de datos
      const maxRetries = 100; // Máximo de intentos
      const retryDelay = 1000; // 1 segundo entre intentos
      let retries = 0;

      while (numberQuestions < 4 && maxRetries > retries) {
        console.log(`Esperando más preguntas en la categoría: ${category}. Intento ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        numberQuestions = await dataService.getNumberQuestionsByCategory(category);
        retries++;
      }
    }

    const question = await dataService.getRandomQuestionByCategory(category);

    if (!question) {
      return res.status(404).json({ message: "There are no more questions available." });
    }

    await dataService.deleteQuestionById(question._id);
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Question Service listening at http://localhost:${port}`);
});



module.exports = server
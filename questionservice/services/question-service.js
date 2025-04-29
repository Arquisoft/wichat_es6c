const express = require('express');


const dataService = require('./question-data-service');
const generateService = require('./question-generate-service');
const app = express();
const port = 8004;
var repeatedAnswers = [];
// Middleware to parse JSON in request body
app.use(express.json());

app.post('/questions', async (req, res) => {

  try {
    const questions = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar un array de preguntas.' });
    }
    await dataService.saveQuestions(questions);


    res.status(200).json({ message: 'Questions added successfully'});

  } catch (error) {
    res.status(500).json({ error: error.message });

  }
})



app.get('/getQuestionsDb/:lang/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const language = req.params.lang;
    // Verificar y generar preguntas si es necesario
    const questionsToGenerate = 20;
    let numberQuestions = await dataService.getNumberQuestionsByCategory(language, category);
    console.log(`Número de preguntas en la base de datos: ${numberQuestions} para la categoría: ${category} y el idioma ${language}`);

    if (numberQuestions < 5) {
      await generateService.generateQuestionsByCategory(category, language, questionsToGenerate - numberQuestions);

      // Esperar hasta que haya al menos 5 preguntas en la base de datos
      const maxRetries = 100; // Máximo de intentos
      const retryDelay = 1000; // 1 segundo entre intentos
      let retries = 0;

      while (numberQuestions < 4 && maxRetries > retries) {
        console.log(`Esperando más preguntas en la categoría: ${category} e idioma ${language} Intento ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        numberQuestions = await dataService.getNumberQuestionsByCategory(language, category);
        retries++;
      }
    }

    const question = await dataService.getRandomQuestionByCategory(language, category, repeatedAnswers);
    
    if (!question) {
      return res.status(404).json({ message: "There are no more questions available." });
    }
    if(repeatedAnswers.includes(question.correctAnswer)){
      repeatedAnswers=[];
    }
    repeatedAnswers.push(question.correctAnswer);
    
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
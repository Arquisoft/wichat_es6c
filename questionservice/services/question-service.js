const express = require('express');


const dataService = require('./question-data-service');
const generateService = require('./question-generate-service');
const app = express();
const port = 8004;
var repeatedAnswers = [];
// Middleware to parse JSON in request body
app.use(express.json());


app.post("/validate", async (req, res) => {

  try {

    let questionId = req.body.questionId;
    let selectedAnswer = req.body.selectedAnswer;
    
    console.log("id " + questionId);
    console.log("selected " + selectedAnswer);
    const question = await dataService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    console.log("respuesta correcta " + question.enAnswer);
    console.log("respuesta correcta " + question.esAnswer);

    let isCorrect = question.enAnswer === selectedAnswer;
    let correct = question.enAnswer;
    if(question.language === 'es'){
     isCorrect =  question.esAnswer === selectedAnswer;
     correct = question.esAnswer;
    }
    res.json({
      isCorrect,
      correct
    });
  } catch (error) {
    res.status(500).json({ error: error.message });

  }
});

app.delete("/delete/:id", async (req, res) => {

  try {
    const questionId = req.params.id;

    await dataService.deleteQuestionById(questionId);

  } catch (error) {
    res.status(500).json({ error: error.message });

  }


});
app.get('/getQuestionsDb/:lang/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const language = req.params.lang;
    // Verificar y generar preguntas si es necesario
    const questionsToGenerate = 20;
    let numberQuestions = await dataService.getNumberQuestionsByCategory(language, category);
    console.log(`Número de preguntas en la base de datos: ${numberQuestions} para la categoría: ${category} y el idioma ${language}`);

    if (numberQuestions < 5) {
      generateService.generateQuestionsByCategory(category, language, questionsToGenerate - numberQuestions);

      // Esperar hasta que haya al menos 10 preguntas en la base de datos
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
    repeatedAnswers.push(question.correctAnswer);
    if (repeatedAnswers.includes(question.correctAnswer)) {
      repeatedAnswers = [];
    }
    //await dataService.deleteQuestionById(question._id);
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const server = app.listen(port, () => {
  console.log(`Question Service listening at http://localhost:${port}`);
});



module.exports = server
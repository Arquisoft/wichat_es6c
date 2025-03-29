const express = require('express');


const dataService = require('./question-data-service');
const generateService = require('./question-generate-service');
const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());


app.get('/getQuestionsDb/:category', async (req, res) => {
  try{
    const questionsToGenerate = 50;

    const category = req.params.category;
    const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
    console.log("Numero de preguntas " + numberQuestions + " category " + category);
    if(numberQuestions < 10){
        await generateService.generateQuestionsByCategory(category,questionsToGenerate);
    }

    const question = await dataService.getRandomQuestionByCategory(category);

    if (!question) {
      return res.status(404).json({ message: "There are no more questions available." });
    }

    
    dataService.deleteQuestionById(question._id);
    
    res.json(question);


  }catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`Question Service listening at http://localhost:${port}`);
});



module.exports = server
const express = require('express');


const dataService = require('./dataservice/question-data-service');
const generateService = require('./generateservice/question-generate-service');
const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());



app.get('/getQuestionsDb/:category', async (req, res) => {


  try{

    const questionsToGenerate =10;

    const category = req.params.category;
    const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
    console.log("Numero de cuestiones " + numberQuestions);
    if(numberQuestions == 0){
        await generateService.generateQuestionsByCategory(category,questionsToGenerate);
    }
    const  question = await dataService.getRandomQuestionByCategory(category);
    res.json(question);

  }catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});



module.exports = server
const express = require('express');

const Question = require('../dataservice/question-model')

const dataService = require('./question-data-service');
const generateService = require('./question-generate-service');
const app = express();
const port = 8004;

// Middleware to parse JSON in request body
app.use(express.json());



app.get('/getQuestionsDb/:category', async (req, res) => {


  try{

    const category = req.params.category;

    const numberQuestions = dataService.getNumberQuestionsByCategory(category);
    
    if(numberQuestions == 0){
        await generateService.generateQuestionsByCategory(category,10);
    }
    const  question = await dataService.getQuestionsByCategory(category);
    res.json(question);

  }catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});



module.exports = server
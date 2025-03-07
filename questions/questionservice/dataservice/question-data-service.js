
const mongoose = require('mongoose');
const Question = require('../question-model')


// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);


module.exports = {
    getNumberQuestionsByCategory: async function(category){
        try{

            const numberQuestions = await Question.countDocuments({category: category});
            return numberQuestions;

        }catch (error) {
            res.status(500).json({ error: error.message });

        }

    },

    saveQuestion: async function(question){
        try{

            const newQuestion = new Question(question);
            await newQuestion.save();

        }catch (error) {
            res.status(500).json({ error: error.message });

        }
    },

    getRandomQuestionByCategory: async function(categoryParam) {
        try {
            const question = await Question.aggregate([
                { $match: { category: categoryParam } },
                { $sample: { size: 1 } } // Seleccionar un documento aleatorio
            ]);
    
            return question.length > 0 ? question[0] : null; 
        } catch (error) {
            console.error("Error fetching random question:", error);
            throw new Error(error.message);
        }
    }
    
};


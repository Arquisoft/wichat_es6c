
const mongoose = require('mongoose');
const Question = require('../models/question-model')


// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);


module.exports = {
    getNumberQuestionsByCategory: async function (language, category) {
        try {

            const numberQuestions = await Question.countDocuments({ category: category, language: language });
            return numberQuestions;

        } catch (error) {
            console.error("Error counting questions:", error);
            throw new Error(error.message);

        }

    },

    saveQuestion: async function (question) {
        try {

            const newQuestion = new Question(question);
            await newQuestion.save();

        } catch (error) {
            console.error("Error saving question:", error);
            throw new Error(error.message);

        }
    },

    saveQuestions: async function (questions) {
        try {
            await Question.insertMany(questions);
            console.log(`Questions ${JSON.stringify(questions,null,2)} added successfully`);
        } catch (error) {
            console.error("Error saving questions:", error);
            throw new Error(error.message);
        }
    },
    /**
     * Deletes a question from the database.
     * @param {id} str - The id of the document to be removed
     */
    deleteQuestionById: async function (id) {
        try {
            await Question.findByIdAndDelete(id);
            console.log(`Question ${id} deleted successfully`);

        } catch (error) {
            console.error('Error deleting question:', error.message);
            throw new Error(error.message);
        }
    },

  

    getRandomQuestionByCategory: async function (language, categoryParam) {
        try {
            const question = await Question.aggregate([
                { $match: { category: categoryParam } },
                { $match: { language: language } },
                { $sample: { size: 1 } } // Select a random document
            ]);

            return question.length > 0 ? question[0] : null;
        } catch (error) {
            console.error("Error fetching random question:", error);
            throw new Error(error.message);
        }
    }

};


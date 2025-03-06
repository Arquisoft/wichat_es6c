
const mongoose = require('mongoose');
const Question = require('./question-model')


// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);


module.exports = {
    getNumberQuestionsByCategory: async function(category){
        try{

            const numberQuestions = await Question.countDocuments({category: category});
            return numberQuestions;

        }catch (error) {
            res.status(500).json({ error: error.message });

        }

    }
};


// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });
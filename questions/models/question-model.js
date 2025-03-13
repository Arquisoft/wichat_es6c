const mongoose = require('mongoose');

const questionsSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    category: String,
    imageUrl: {type: String}
});


const Question = mongoose.model('Question', questionsSchema);

module.exports = Question   
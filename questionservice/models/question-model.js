const mongoose = require('mongoose');

const questionsSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    category: String,
    language: String,
    imageUrl: {type: String},
    enAnswer: {type: String},
    esAnswer: {type: String}
});


const Question = mongoose.model('Question', questionsSchema);

module.exports = Question   
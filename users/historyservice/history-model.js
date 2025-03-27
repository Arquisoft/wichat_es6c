const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    wrongAnswers: { 
      type: Number,
      required: true,
      default: 0,
    },
    time: {
      type: Number,
      required: true,
      default: 0,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    gameMode: {
      type: String,
      required: true,
      default: 'Country',
    }
});

const GameHistory = mongoose.model('User2', historySchema);

module.exports = GameHistory
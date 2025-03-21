const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
      degfault: 0,
    },
    wrongAnswers: { 
      type: Number,
      required: true,
      degfault: 0,
    },
    time: {
      type: Number,
      required: true,
      degfault: 0,
    },
    score: {
      type: Number,
      required: true,
      degfault: 0,
    },
    gameMode: {
      type: String,
      required: true,
      degfault: 'Country',
    }
});

const GameHistory = mongoose.model('User', historySchema);

module.exports = GameHistory
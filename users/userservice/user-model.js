const mongoose = require('mongoose');
const { profile } = require('winston');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    surname: { 
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: 'https://i.pinimg.com/originals/67/2c/d6/672cd616936e481ef2632306731a87cd.jpg', 
    },
    description: {
      type: String,
      default: 'Hola, soy un nuevo usuario!', 
    },
    createdAt: {
      type: Date,
      default: Date.now, 
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User
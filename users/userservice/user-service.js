// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model')

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);


function registerValidators(user, username, password, name, surname){
    if (user != null) {
      throw new Error('Invalid username');
    }

    // Email validation
    if (username.trim().length < 4) {
        throw new Error('The username must be at least 4 characters long');
    }

    // Password validation
    if (password.trim().length < 8) {
        throw new Error('The password must be at least 8 characters long');
    }
    if (!/\d/.test(password)) {
        throw new Error('The password must contain at least one numeric character');
    }
    if (!/[A-Z]/.test(password)) {
        throw new Error('The password must contain at least one uppercase letter');
    }

    // Name validation
    if (!name.trim()) {
        throw new Error('The name cannot be empty or contain only spaces');
    }
    
    // Surname validation
    if (!surname.trim()) {
        throw new Error('The surname cannot be empty or contain only spaces');
    }
}

app.post('/user', async (req, res) => {
    try {
        const { username, password, name, surname } = req.body;

        const usernameReq = req.body.username.toString();
        const user = await User.findOne({ usernameReq });
        if(user){
            throw new Error(`El usuario "${req.body.username}" ya existe.`);
        }

        registerValidators(user, username, password, name, surname);

        // Encrypt the password before saving it
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            name: req.body.name,
            surname: req.body.surname,
        });

        await newUser.save();
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
}});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server
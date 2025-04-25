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

        const sanitizedUsername = username.toString();
        const user = await User.findOne({ username: sanitizedUsername });

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

app.get('/user/profile/:username', async (req, res) => {
    try {
      const { username } = req.params;
  
      const user = await User.findOne({ username }).select('-password');
  
      if (!user) {
        throw new Error(`No se encontró el usuario "${username}".`);
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Ruta para actualizar el perfil del usuario
app.put('/user/update/profile/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const { name, surname, profilePicture, description } = req.body;
  
      // Buscar el usuario por el nombre de usuario
      const user = await User.findOne({ username });
  
      if (!user) {
        throw new Error(`No se encontró el usuario "${username}"`);
      }
  
      // Validar los datos antes de hacer la actualización
      validateUserProfileUpdate(name, surname, profilePicture, description);
  
      // Actualizar los campos que vienen en la solicitud
      user.name = name || user.name;
      user.surname = surname || user.surname;
      user.profilePicture = profilePicture || user.profilePicture;
      user.description = description || user.description;
  
      // Guardar los cambios en el usuario
      await user.save();
  
      // Devolver el usuario actualizado sin la contraseña
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Validation helper function
function validateUserProfileUpdate(name, surname, profilePicture, description) {
    if (!name.trim()) {
      throw new Error('El nombre no puede estar vacío');
    }
  
    if (!surname.trim()) {
      throw new Error('El apellido no puede estar vacío');
    }
    
    // Opcionalmente podrías validar la URL de la imagen (profilePicture)
    // y la descripción, si quieres asegurarte de que no estén vacíos o sean válidos.
  }

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
  });

module.exports = server
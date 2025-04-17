// File: questionservice/services/question-service.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
var dataService = "";
const Question = require('../models/question-model');
const questions = [
  {
    question: "¿A qué país pertenece esta imagen?",
    options: ["Singapur", "Guatemala", "Paraguay", "Polonia"],
    correctAnswer: "Polonia",
    category: "country",
    language: "es",
    imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Szczecin%20aerial%203a.jpg"
  },
  {
    question: "¿A qué país pertenece esta imagen?",
    options: ["Turquía", "Islandia", "Nauru", "Uzbekistán"],
    correctAnswer: "Turquía",
    category: "country",
    language: "es",
    imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Byzantine%20Constantinople-en.png"
  },
  {
    question: "¿A qué país pertenece esta imagen?",
    options: ["Australia", "Indonesia", "República Dominicana", "Finlandia"],
    correctAnswer: "Australia",
    category: "country",
    language: "es",
    imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Channel%20Island%20NT.jpg"
  }
];

let mongoServer;

beforeAll(async () => {
  // Inicia MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Sobrescribe la variable de entorno MONGODB_URI para usar la base de datos en memoria
  process.env.MONGODB_URI = uri;
  dataService = require('../services/question-data-service');


});

beforeEach(async () => {
  // Rellena la base de datos con tres preguntas (actualmente iguales, pero fácil de modificar)
  for (const question of questions) {
    let newQuestion = new Question(question); // Crea una nueva instancia de la pregunta
    // Guarda la pregunta en la base de datos
    await newQuestion.save();
  }
});

afterAll(async () => {
  // Cierra la conexión y detén el servidor en memoria
  await mongoose.connection.close(); // Asegura que todas las conexiones de Mongoose se cierren
  await mongoServer.stop(); // Detiene el servidor MongoDB en memoria
  await mongoose.disconnect();

});

afterEach(async () => {
  if (mongoose.connection.readyState === 0) { // Si la conexión está cerrada
    const uri = mongoServer.getUri(); // Obtén la URI del servidor en memoria
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  // Limpia todas las colecciones después de cada prueba
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Question Data Service', () => {
  it('should return the number of questions by category', async () => {
    const numberQuestions = await dataService.getNumberQuestionsByCategory('es','country');
    expect(numberQuestions).toBe(3);
  }
  );

  it('should add a question for an existant category', async () => {
    let newQuestion = {
      question: "¿A qué país pertenece esta imagen?",
      options: ["Polonia", "España", "Italia", "Finlandia"],
      correctAnswer: "Finlandia",
      category: "country",
      language: "es",
      imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Channel%20Island%20NT.jpg"
    };
    await dataService.saveQuestion(newQuestion);
    const numberQuestions = await dataService.getNumberQuestionsByCategory('es','country');
    expect(numberQuestions).toBe(4);
  }
  );

  it('should add a question for a new category', async () => {
    let newQuestion = {
      question: "Pregunta de prueba",
      options: ["Polonia", "España", "Italia", "Finlandia"],
      correctAnswer: "Finlandia",
      category: "test",
      language: "es",
      imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Channel%20Island%20NT.jpg"
    };
    await dataService.saveQuestion(newQuestion);
    const numberQuestions = await dataService.getNumberQuestionsByCategory('es','test');
    expect(numberQuestions).toBe(1);
  }
  );

  it('should return a random question of an existant category', async () => {
    const randomQuestion = await dataService.getRandomQuestionByCategory('es','country');
    
    const isQuestionValid = questions.some(
      (q) =>
        q.question === randomQuestion.question &&
        q.correctAnswer === randomQuestion.correctAnswer &&
        q.category === randomQuestion.category &&
        JSON.stringify(q.options) === JSON.stringify(randomQuestion.options) &&
        q.imageUrl === randomQuestion.imageUrl
    );

    expect(isQuestionValid).toBe(true);
  }
  );

  it('should delete a question from its category', async () => {
    const randomQuestion = await dataService.getRandomQuestionByCategory('es','country');
    await dataService.deleteQuestionById(randomQuestion._id);
    const numberQuestions = await dataService.getNumberQuestionsByCategory('es','country');
    expect(numberQuestions).toBe(2);
  }
  );

  it('should return null from an empty category', async () => {
    const randomQuestion = await dataService.getRandomQuestionByCategory('es','prueba');
    // Verifica que no haya preguntas en la categoría "prueba"
    expect(randomQuestion).toBe(null);
  }
  );

  it('should throw an error if the database connection fails when counting questions', async () => {
    await mongoose.disconnect();

    await expect(dataService.getNumberQuestionsByCategory('es', 'country'))
        .rejects
        .toThrow('Client must be connected before running operations');
  }
  );

  it('should throw an error if the database connection fails when deleting a question', async () => {
    await mongoose.disconnect();
    let newQuestion = {
      question: "Pregunta de prueba",
      options: ["Polonia", "España", "Italia", "Finlandia"],
      correctAnswer: "Finlandia",
      category: "test",
      language: "es",
      imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Channel%20Island%20NT.jpg"
    };
    await expect(dataService.saveQuestion(newQuestion))
        .rejects
        .toThrow('Client must be connected before running operations');
  }
  );

  it('should throw an error if the database connection fails when saving a question', async () => {
    const randomQuestion = await dataService.getRandomQuestionByCategory('es', 'country');
    await mongoose.disconnect();

    await expect(dataService.deleteQuestionById(randomQuestion._id))
        .rejects
        .toThrow('Client must be connected before running operations');
  }
  );

  it('should throw an error if the database connection fails when geting a question', async () => {
    await mongoose.disconnect();

    await expect(dataService.getRandomQuestionByCategory('es', 'country'))
        .rejects
        .toThrow('Client must be connected before running operations');
  }
  );
});
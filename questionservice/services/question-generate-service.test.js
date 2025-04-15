const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Question = require('../models/question-model');
const axios = require('axios');
var generateService = "";
let mongoServer;
const questions = [
    {
      question: "¿A qué país pertenece esta imagen?",
      options: ["Singapur", "Guatemala", "Paraguay", "Polonia"],
      correctAnswer: "Polonia",
      category: "country",
      imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Szczecin%20aerial%203a.jpg"
    },
    {
      question: "¿A qué país pertenece esta imagen?",
      options: ["Turquía", "Islandia", "Nauru", "Uzbekistán"],
      correctAnswer: "Turquía",
      category: "country",
      imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Byzantine%20Constantinople-en.png"
    },
    {
      question: "¿A qué país pertenece esta imagen?",
      options: ["Australia", "Indonesia", "República Dominicana", "Finlandia"],
      correctAnswer: "Australia",
      category: "country",
      imageUrl: "http://commons.wikimedia.org/wiki/Special:FilePath/Channel%20Island%20NT.jpg"
    }
  ];

const testResponse = {
    data: {
        results: {
            bindings: [
                {
                    cityLabel: { value: "Madrid" },
                    countryLabel: { value: "España" },
                    image: { value: "http://fakeurl.com/madrid.jpg" }
                },
                {
                    cityLabel: { value: "París" },
                    countryLabel: { value: "Francia" },
                    image: { value: "http://fakeurl.com/paris.jpg" }
                }
            ]
        }
    }
};

const testOptions = {
    data: {
        results: {
            bindings: [
                {
                    countryLabel: { value: "Rusia" }  
                },
                {
                    countryLabel: { value: "Australia" }  
                },
                {
                    countryLabel: { value: "Turquía" }  
                }
            ]
        }
    }
};

beforeAll(async () => {
  // Inicia MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Sobrescribe la variable de entorno MONGODB_URI para usar la base de datos en memoria
  process.env.MONGODB_URI = uri;
  generateService = require('./question-generate-service');
  
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


jest.mock('axios');

describe('Question Generate Service', () => {
    axios.get.mockImplementation((url, config) => {
        if (url.startsWith('https://query.wikidata')) {
            if (config.params.query.includes('LIMIT 100')) {
                // Mock response for getIncorrectCountries
                return Promise.resolve(testOptions);
            } else if (config.params.query.includes('ORDER BY RAND()')) {
                // Mock response for getImagesFromWikidata
                return Promise.resolve(testResponse);
            }
        }
        return Promise.reject(new Error('Unexpected URL'));
    });

    it('should get images from Wikidata', async () => {
      
        const category = 'country';
        const numImages = 2;
        const questions = await generateService.generateQuestionsByCategory(category, numImages);

        // Verifica que el número de preguntas generadas sea correcto
        expect(questions.length).toBe(numImages);

        // Verifica que las preguntas generadas coincidan con los datos simulados
        expect(questions[0].question).toContain('¿A qué país pertenece esta imagen?');
        expect(questions[0].options).toContain('España');
        expect(questions[0].correctAnswer).toBe('España');
        expect(questions[0].imageUrl).toBe('http://fakeurl.com/madrid.jpg');
        expect(questions[0].category).toBe('country');
        expect(questions[1].question).toContain('¿A qué país pertenece esta imagen?');
        expect(questions[1].options).toContain('Francia');
        expect(questions[1].correctAnswer).toBe('Francia');
        expect(questions[1].imageUrl).toBe('http://fakeurl.com/paris.jpg');
        expect(questions[1].category).toBe('country');

    });

    it('should give error when category does not exist', async () => {
        const category = 'country';
        const numImages = 2;
        
        // Verifica que el número de preguntas generadas sea correcto
        await expect(generateService.generateQuestionsByCategory(" ", numImages))
        .rejects
        .toThrow("The given category does not exist: ");
    });

    it('should give error when invalid number of images', async () => {
        const category = 'country';
        const numImages = -2;
        
        // Verifica que el número de preguntas generadas sea correcto
        await expect(generateService.generateQuestionsByCategory(category, numImages))
        .rejects
        .toThrow("numImages must be a positive number");
    });

    it('should return an empty array when no images found', async () => {
      axios.get.mockImplementation((url, config) => {
                  if (url.startsWith('https://query.wikidata')) {
                      if (config.params.query.includes('LIMIT 100')) {
                          // Mock empty response for getIncorrectCountries
                          return Promise.resolve({ data: { results: { bindings: [] } } });
                      } else if (config.params.query.includes('ORDER BY RAND()')) {
                          // Mock empty response for getImagesFromWikidata
                          return Promise.resolve({ data: { results: { bindings: [] } } });
                      }
                  }
                  return Promise.reject(new Error('Unexpected URL'));
              });
        const category = 'country';
        const numImages = 2;
        
        // Verifica que el número de preguntas generadas sea correcto
        const questions = await generateService.generateQuestionsByCategory(category, numImages);

        // Verifica que el número de preguntas generadas sea correcto
        expect(questions.length).toBe(0);
    });

    
});
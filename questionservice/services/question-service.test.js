const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Question = require('../models/question-model');
const axios = require('axios');
var app = "";
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
    app = require('./question-service');

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
    await app.close(); // Cierra el servidor Express
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

    it('should return a random question when asking', async () => {
        var countries=["España","Francia","Polonia","Australia","Turquía"];
        const response = await request(app)
            .get('/getQuestionsDb/country')
            ;

        expect(response.statusCode).toBe(200);
        
        expect(countries).toContainEqual(response.body.correctAnswer);
        
    });

    it('should return an error if there are no questions', async () => {
        // Limpia la base de datos antes de ejecutar el test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }

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

        const response = await request(app)
            .get('/getQuestionsDb/country');

        expect(response.statusCode).toBe(500); // Expect a 400 Bad Request status
        expect(response.body.error).toBe("There are no more questions available."); // Verify the error message
    }, 1200);
});
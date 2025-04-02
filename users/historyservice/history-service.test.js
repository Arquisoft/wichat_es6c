const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UserHistory = require('./history-model');

let mongoServer;
let app;



beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;

    console.log('MongoDB conectado:', mongoUri);

    app = require('./history-service');
});


afterAll(async () => {
    if (app && app.close) {
      await app.close(); 
    }
    if (mongoServer) {
      await mongoServer.stop(); 
    }
  });
  
beforeEach(async () => {
    await UserHistory.deleteMany({});
});

describe('History Service /POST', () => {
    it('Should create user history on POST /createUserHistory', async () => {

        const newHistory = {

            username: 'Cucurella',
            correctAnswers: 1,
            wrongAnswers: 9,
            time: 20,
            score: 10,
            gameMode: 'country'
        };


        const response = await request(app).post('/createUserHistory').send(newHistory);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', 'Cucurella');
        expect(response.body).toHaveProperty('correctAnswers', 1);
        expect(response.body).toHaveProperty('wrongAnswers', 9);
        expect(response.body).toHaveProperty('score', 10);
        expect(response.body).toHaveProperty('time', 20);
        expect(response.body).toHaveProperty('gameMode', 'country');

        const historyInDB = await UserHistory.findOne({ username: 'Cucurella' });

        expect(historyInDB).not.toBeNull();
        expect(historyInDB.username).toBe('Cucurella');

    },15000);
});

describe('History Service /GET', () => {
    it('Should return user history on GET /getUserHistory', async () => {
        const testHistory = {
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        };
        await UserHistory.create(testHistory);

        const response = await request(app).get('/getUserHistory').query({ username: 'Cucurella' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('history');
        expect(response.body.history).toBeInstanceOf(Array);
        expect(response.body.history.length).toBe(1);
        expect(response.body.history[0]).toMatchObject(testHistory);
    });


});
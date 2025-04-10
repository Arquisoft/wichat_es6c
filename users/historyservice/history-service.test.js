const request = require('supertest');
const mongoose = require('mongoose');
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
    if (app ) {
      await app.close(); 
    }
    if (mongoServer) {
      await mongoose.connection.close(); // Asegura que todas las conexiones de Mongoose se cierren
        await mongoServer.stop(); // Detiene el servidor MongoDB en memoria
        await mongoose.disconnect();
    }
   
  });
  
beforeEach(async () => {
    if (mongoose.connection.readyState === 0) { // Si la conexión está cerrada
        const uri = mongoServer.getUri(); // Obtén la URI del servidor en memoria
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      }
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

    });

    it ('Should return 400 if username is not provided', async () => {
        const newHistory = {
            correctAnswers: 1,
            wrongAnswers: 9,
            time: 20,
            score: 10,
            gameMode: 'country'
        };

        const response = await request(app).post('/createUserHistory').send(newHistory);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Username es requerido.');
    }
    );

    it('Should create user history with default values if not provided', async () => {

        const newHistory = {
            username: 'Cucurella',
        };
        const response = await request(app).post('/createUserHistory').send(newHistory);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', 'Cucurella');
        expect(response.body).toHaveProperty('correctAnswers', 0);
        expect(response.body).toHaveProperty('wrongAnswers', 0);
        expect(response.body).toHaveProperty('score', 0);
        expect(response.body).toHaveProperty('time', 0);
        expect(response.body).toHaveProperty('gameMode', 'Country');
        const historyInDB = await UserHistory.findOne({ username: 'Cucurella' });
        expect(historyInDB).not.toBeNull();
        expect(historyInDB.username).toBe('Cucurella');
    });

    it('Should return 500 if there is a connection error', async () => {

        const newHistory = {
            username: 'Cucurella',
            correctAnswers: 1,
            wrongAnswers: 9,
            time: 20,
            score: 10,
            gameMode: 'country'
        };

        await mongoose.disconnect();
        const response = await request(app).post('/createUserHistory').send(newHistory);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Client must be connected before running operations');
    });

});

describe('History Service /GET UserHistory', () => {
    it('Should return user history when asked', async () => {
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
    it('Should return empty array if no history found', async () => {
        const response = await request(app).get('/getUserHistory').query({ username: 'NonExistentUser' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('history');
        expect(response.body.history).toBeInstanceOf(Array);
        expect(response.body.history.length).toBe(0);
    });

    it('Should return error 400 if not usarname provided', async () => {
        const testHistory = {
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        };
        await UserHistory.create(testHistory);

        const response = await request(app).get('/getUserHistory').query({ });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Se requiere un username');
    });

    it('Should return error 500 if there is a connection error', async () => {
        const testHistory = {
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        };
        await UserHistory.create(testHistory);
        await mongoose.disconnect();
        const response = await request(app).get('/getUserHistory').query({username: 'Cucurella' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Client must be connected before running operations');
    });
});

describe('History Service /GET UserStats', () => {
    it('Should return user stats when asked', async () => {
        const testHistories = [{
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        },{
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        }];

        for (const history of testHistories) {
            await UserHistory.create(history);
        }

        const response = await request(app).get('/getUserStats').query({ username: 'Cucurella' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('totalGames', 2);
        expect(response.body).toHaveProperty('totalCorrect', 10);
        expect(response.body).toHaveProperty('totalWrong', 10);
        expect(response.body).toHaveProperty('totalTime', 100);
        expect(response.body).toHaveProperty('averageScore', 100);
    });
    it('Should return error 404 if th username does not have games', async () => {
        const response = await request(app).get('/getUserStats').query({ username: 'NonExistentUser' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("No hay datos para este usuario");
    });

    it('Should return error 400 if not usarname provided', async () => {
        const testHistory = {
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        };
        await UserHistory.create(testHistory);

        const response = await request(app).get('/getUserStats').query({ });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Se requiere un username');
    });

    it('Should return error 500 if there is a connection error', async () => {
        const testHistory = {
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        };
        await UserHistory.create(testHistory);
        await mongoose.disconnect();
        const response = await request(app).get('/getUserStats').query({username: 'Cucurella' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Client must be connected before running operations');
    });
});

describe('History Service /GET Leaderboard', () => {
    it('Should return the 10 players with the most points', async () => {
        const testHistories = [{
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        },{
            username: 'Embape',
            correctAnswers: 4,
            wrongAnswers: 6,
            time: 40,
            score: 80,
            gameMode: 'country',
        },{
            username: 'Ronaldo',
            correctAnswers: 10,
            wrongAnswers: 0,
            time: 100,
            score: 200,
            gameMode: 'country',
        },{
            username: 'Maradona',
            correctAnswers: 9,
            wrongAnswers: 1,
            time: 40,
            score: 180,
            gameMode: 'country',
        },{
            username: 'Pelé',
            correctAnswers: 8,
            wrongAnswers: 2,
            time: 40,
            score: 160,
            gameMode: 'country',
        },{
            username: 'Casillas',
            correctAnswers: 7,
            wrongAnswers: 3,
            time: 40,
            score: 140,
            gameMode: 'country',
        },{
            username: 'Rodri',
            correctAnswers: 6,
            wrongAnswers: 4,
            time: 40,
            score: 120,
            gameMode: 'country',
        },{
            username: 'Piqué',
            correctAnswers: 3,
            wrongAnswers: 7,
            time: 40,
            score: 60,
            gameMode: 'country',
        },{
            username: 'Messi',
            correctAnswers: 2,
            wrongAnswers: 8,
            time: 40,
            score: 40,
            gameMode: 'country',
        },{
            username: 'Iniesta',
            correctAnswers: 10,
            wrongAnswers: 0,
            time: 120,
            score: 200,
            gameMode: 'country',
        },{
            username: 'Cazorla',
            correctAnswers: 0,
            wrongAnswers: 10,
            time: 120,
            score: 0,
            gameMode: 'country',
        }];

        for (const history of testHistories) {
            await UserHistory.create(history);
        }

        const response = await request(app).get('/getLeaderboard').query({ username: 'Cucurella' });

        expect(response.status).toBe(200);
        expect(response.body.topPlayers.length).toBe(10);
        expect(response.body.topPlayers[0].username).toBe('Ronaldo');
        expect(response.body.topPlayers[1].username).toBe('Iniesta');
        expect(response.body.topPlayers[2].username).toBe('Maradona');
        expect(response.body.topPlayers[3].username).toBe('Pelé');
        expect(response.body.topPlayers[4].username).toBe('Casillas');
        expect(response.body.topPlayers[5].username).toBe('Rodri');
        expect(response.body.topPlayers[6].username).toBe('Cucurella');
        expect(response.body.topPlayers[7].username).toBe('Embape');
        expect(response.body.topPlayers[8].username).toBe('Piqué');
        expect(response.body.topPlayers[9].username).toBe('Messi');


    });
    it('Should return all players ordered by points if there are 10 or less', async () => {
        const testHistories = [{
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        },{
            username: 'Embape',
            correctAnswers: 4,
            wrongAnswers: 6,
            time: 40,
            score: 80,
            gameMode: 'country',
        },{
            username: 'Ronaldo',
            correctAnswers: 10,
            wrongAnswers: 0,
            time: 100,
            score: 200,
            gameMode: 'country',
        },{
            username: 'Maradona',
            correctAnswers: 9,
            wrongAnswers: 1,
            time: 40,
            score: 180,
            gameMode: 'country',
        },{
            username: 'Pelé',
            correctAnswers: 8,
            wrongAnswers: 2,
            time: 40,
            score: 160,
            gameMode: 'country',
        },{
            username: 'Casillas',
            correctAnswers: 7,
            wrongAnswers: 3,
            time: 40,
            score: 140,
            gameMode: 'country',
        },{
            username: 'Rodri',
            correctAnswers: 6,
            wrongAnswers: 4,
            time: 40,
            score: 120,
            gameMode: 'country',
        },{
            username: 'Piqué',
            correctAnswers: 3,
            wrongAnswers: 7,
            time: 40,
            score: 60,
            gameMode: 'country',
        },{
            username: 'Iniesta',
            correctAnswers: 10,
            wrongAnswers: 0,
            time: 120,
            score: 200,
            gameMode: 'country',
        }];

        for (const history of testHistories) {
            await UserHistory.create(history);
        }

        const response = await request(app).get('/getLeaderboard').query({ username: 'Cucurella' });

        expect(response.status).toBe(200);
        expect(response.body.topPlayers.length).toBe(9);
        expect(response.body.topPlayers[0].username).toBe('Ronaldo');
        expect(response.body.topPlayers[1].username).toBe('Iniesta');
        expect(response.body.topPlayers[2].username).toBe('Maradona');
        expect(response.body.topPlayers[3].username).toBe('Pelé');
        expect(response.body.topPlayers[4].username).toBe('Casillas');
        expect(response.body.topPlayers[5].username).toBe('Rodri');
        expect(response.body.topPlayers[6].username).toBe('Cucurella');
        expect(response.body.topPlayers[7].username).toBe('Embape');
        expect(response.body.topPlayers[8].username).toBe('Piqué');
    });
    it('Should return error 500 if there is a connection error', async () => {
        const testHistories = [{
            username: 'Cucurella',
            correctAnswers: 5,
            wrongAnswers: 5,
            time: 50,
            score: 100,
            gameMode: 'country',
        },{
            username: 'Embape',
            correctAnswers: 4,
            wrongAnswers: 6,
            time: 40,
            score: 80,
            gameMode: 'country',
        },{
            username: 'Ronaldo',
            correctAnswers: 10,
            wrongAnswers: 0,
            time: 100,
            score: 200,
            gameMode: 'country',
        }];

        for (const history of testHistories) {
            await UserHistory.create(history);
        }
        await mongoose.disconnect();
        const response = await request(app).get('/getLeaderboard');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Client must be connected before running operations');
    });
    it('should return an empty array if there are no players', async () => {
        const response = await request(app).get('/getLeaderboard');

        expect(response.status).toBe(200);
        expect(response.body.topPlayers.length).toBe(0);
    });
    
});
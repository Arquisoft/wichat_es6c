const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service');

// Close the app after all tests are done
afterAll(async () => {
  app.close();
});

// Mock axios
jest.mock('axios');

describe('Gateway Service', () => {
  // Set up mocked responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/user/')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/ask')) {
      return Promise.resolve({ data: { answer: 'llmanswer' } });
    }
  });

  // Test /health endpoint
  it('should respond with status 200 for /health endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  // Test /login endpoint with valid credentials
  it('should forward /login request to auth service', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'Newpassword1234567' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  // Test /login endpoint with invalid credentials
  it('should /login return 401 if credentials are invalid', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { error: 'Invalid credentials' }
      }
    });

    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongPassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  // Test /user endpoint
  it('should forward add user request to user service', async () => {
    const response = await request(app)
      .post('/user')
      .send({
        username: 'newuser',
        password: 'Newpassword1234567',
        name: 'newname',
        surname: 'newsurname'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  it('should handle /user errors and respond with appropriate status and message', async () => {
    // Mock the user service to return a 400 error (e.g., username already exists)
    axios.post.mockImplementationOnce(() =>
      Promise.reject({
        response: {
          status: 400,
          data: { error: 'Username already exists' }
        }
      })
    );

    // Send the request to the gateway
    const response = await request(app).post('/user').send({
      username: 'testuser',
      password: 'Password1234',
      name: 'Test',
      surname: 'User'
    });

    // Expect the status code to be forwarded correctly
    expect(response.status).toBe(400);

    // Expect the error message to be returned properly
    expect(response.body).toHaveProperty('error', 'Username already exists');
  });


  // Test /askllm endpoint
  it('should forward askllm request to the LLM service', async () => {
    const response = await request(app)
      .post('/askllm')
      .send({
        question: 'question',
        apiKey: 'apiKey',
        model: 'gemini'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.answer).toBe('llmanswer');
  });


  it('should return error response if the LLM service fails', async () => {
    // Mock the failed response from the LLM service
    axios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { error: 'Internal server error' }
      }
    });

    // Send a POST request to the /askllm endpoint
    const response = await request(app)
      .post('/askllm')
      .send({
        question: 'What is the capital of France?',
        apiKey: 'some-api-key',
        model: 'gemini'
      });

    // Verify that the status code is 500 (Internal Server Error)
    expect(response.status).toBe(500);

    // Verify that the error message is returned as expected
    expect(response.body).toHaveProperty('error', 'Internal server error');
  });

  it('should respond with status 200 for /questions/:lang/:category endpoint', async () => {
    // Mock the external service to return sample data
    axios.get.mockResolvedValueOnce({
      data: [
        { question: '¿A qué país pertenece esta imagen?', answer: 'Paris' },
      ]
    });

    // Corrected endpoint with both lang and category
    const response = await request(app).get('/questions/es/country');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { question: '¿A qué país pertenece esta imagen?', answer: 'Paris' },
    ]);
  });


  it('should handle /questions/:lang/:category errors and respond with appropriate status and message', async () => {
    // Force axios to throw an error as if the microservice failed
    axios.get.mockRejectedValueOnce(new Error('Something went wrong'));

    // Use the correct route: /questions/:lang/:category
    const response = await request(app).get('/questions/es/country');

    // Expect a 500 status code
    expect(response.status).toBe(500);

    // Expect the error message to be properly returned
    expect(response.body).toHaveProperty('error', 'Something went wrong');
  });


  it('should forward the createUserHistory request to the history service', async () => {
    // Mock the successful response from the history service
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: 'User history created successfully' }
    });

    // Send a POST request to the /createUserHistory endpoint
    const response = await request(app)
      .post('/createUserHistory')
      .send({
        username: 'testuser',
        game: 'country',
        score: 100
      });

    // Verify that the status code is 200 (OK)
    expect(response.status).toBe(200);

    // Verify that the response contains the expected success data
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User history created successfully');
  });

  it('should handle errors and respond with status 500 if the history service fails', async () => {
    // Mock axios to simulate a failure response from the history service
    axios.post.mockRejectedValueOnce(new Error('Failed to create user history'));

    // Send a POST request to the /createUserHistory endpoint
    const response = await request(app)
      .post('/createUserHistory')
      .send({
        username: 'testuser',
        game: 'country',
        score: 100
      });

    // Check that the status code is 500 (Internal Server Error)
    expect(response.status).toBe(500);

    // Check that the error message is as expected
    expect(response.body).toHaveProperty('error', 'Failed to create user history');
  });

  it('should forward the getUserHistory request to the history service', async () => {
    // Mock the successful response from the history service
    axios.get.mockResolvedValueOnce({
      data: { history: [{ game: 'country', score: 100 }] }
    });

    // Send a GET request to the /getUserHistory endpoint with a username query parameter
    const response = await request(app)
      .get('/getUserHistory')
      .query({ username: 'testuser' });

    // Verify that the status code is 200 (OK)
    expect(response.status).toBe(200);

    // Verify that the response contains the expected data
    expect(response.body.history).toEqual([{ game: 'country', score: 100 }]);
  });

  it('should return 400 if the username query parameter is missing in getUserHistory ', async () => {
    // Send a GET request without a username query parameter
    const response = await request(app)
      .get('/getUserHistory');

    // Verify that the status code is 400 (Bad Request)
    expect(response.status).toBe(400);

    // Verify that the error message is returned as expected
    expect(response.body).toHaveProperty('error', 'Se requiere un username');
  });

  it('should return 500 if the getUserHistory service fails', async () => {
    // Mock axios to simulate a failure response from the history service
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch user history'));

    // Send a GET request with a username query parameter
    const response = await request(app)
      .get('/getUserHistory')
      .query({ username: 'testuser' });

    // Verify that the status code is 500 (Internal Server Error)
    expect(response.status).toBe(500);

    // Verify that the error message is returned as expected
    expect(response.body).toHaveProperty('error', 'Error en el servidor del Gateway');
  });

  it('should forward the getUserStats request to the history service', async () => {
    // Mock the successful response from the history service
    axios.get.mockResolvedValueOnce({
      data: { stats: { gamesPlayed: 10, highScore: 200 } }
    });

    // Send a GET request to the /getUserStats endpoint with a username query parameter
    const response = await request(app)
      .get('/getUserStats')
      .query({ username: 'testuser' });

    // Verify that the status code is 200 (OK)
    expect(response.status).toBe(200);

    // Verify that the response contains the expected data
    expect(response.body.stats).toEqual({ gamesPlayed: 10, highScore: 200 });
  });

  it('should return 400 if the username query parameter is missing in getUserStats', async () => {
    // Send a GET request without a username query parameter
    const response = await request(app)
      .get('/getUserStats');

    // Verify that the status code is 400 (Bad Request)
    expect(response.status).toBe(400);

    // Verify that the error message is returned as expected
    expect(response.body).toHaveProperty('error', 'Se requiere un username');
  });

  it('should return 500 if the history service fails', async () => {
    // Mock axios to simulate a failure response from the history service
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch user stats'));

    // Send a GET request with a username query parameter
    const response = await request(app)
      .get('/getUserStats')
      .query({ username: 'testuser' });

    // Verify that the status code is 500 (Internal Server Error)
    expect(response.status).toBe(500);

    // Verify that the error message is returned as expected
    expect(response.body).toHaveProperty('error', 'Failed to fetch user stats');
  });

  it('should forward the getLeaderboard request to the history service', async () => {
    // Mock the successful response from the history service
    axios.get.mockResolvedValueOnce({
      data: { leaderboard: [{ username: 'testuser', score: 100 }] }
    });

    // Send a GET request to the /getLeaderboard endpoint
    const response = await request(app)
      .get('/getLeaderboard');

    // Verify that the status code is 200 (OK)
    expect(response.status).toBe(200);

    // Verify that the response contains the expected data
    expect(response.body.leaderboard).toEqual([{ username: 'testuser', score: 100 }]);
  });

  it('should return 500 if the history service fails', async () => {
    // Mock axios to simulate a failure response from the history service
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch leaderboard'));

    // Send a GET request to the /getLeaderboard endpoint
    const response = await request(app)
      .get('/getLeaderboard');

    // Verify that the status code is 500 (Internal Server Error)
    expect(response.status).toBe(500);

    // Verify that the error message is returned as expected
    expect(response.body).toHaveProperty('error', 'Error al obtener ranking');
  });

  it('should fetch user profile from the user service', async () => {
    axios.get.mockResolvedValueOnce({
      data: { username: 'testuser', name: 'Test', surname: 'User' },
    });

    const response = await request(app).get('/user/profile/testuser');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ username: 'testuser', name: 'Test', surname: 'User' });

    expect(axios.get).toHaveBeenCalledWith('http://localhost:8001/user/profile/testuser');
  });

  it('should handle errors from the user service', async () => {
    axios.get.mockRejectedValueOnce(new Error('Error fetching user profile'));

    const response = await request(app).get('/user/profile/testuser');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error fetching user profile');
  });

  it('should update user profile in the user service', async () => {
    axios.put.mockResolvedValueOnce({
      data: { username: 'testuser', name: 'UpdatedName', surname: 'UpdatedSurname' },
    });

    const updatedProfile = {
      name: 'UpdatedName',
      surname: 'UpdatedSurname',
      profilePicture: 'http://new-picture.com',
      description: 'Updated description',
    };

    const response = await request(app).put('/user/update/profile/testuser').send(updatedProfile);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ username: 'testuser', name: 'UpdatedName', surname: 'UpdatedSurname' });

    expect(axios.put).toHaveBeenCalledWith('http://localhost:8001/user/update/profile/testuser', updatedProfile);
  });

  it('should handle errors when updating user profile', async () => {
    axios.put.mockRejectedValueOnce(new Error('Error updating user profile'));

    const updatedProfile = {
      name: 'UpdatedName',
      surname: 'UpdatedSurname',
      profilePicture: 'http://new-picture.com',
      description: 'Updated description',
    };

    const response = await request(app).put('/user/update/profile/testuser').send(updatedProfile);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error updating user profile');
  });

  it('should forward the /questions request to the question service', async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: 'Questions added successfully' },
    });

    const questions = [
      {
        question: "Which country does this image belong to?",
        options: ["Singapore", "Guatemala", "Paraguay", "Poland"],
        correctAnswer: "Poland",
        category: "country",
        language: "en",
        imageUrl: "http://example.com/image.jpg",
      },
    ];

    const response = await request(app)
      .post('/questions')
      .send({ questions });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Questions added successfully' });


    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8004/questions',
      { questions }
    );
  });

  it('should handle errors from the question service', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to add questions'));

    const questions = [
      {
        question: "Which country does this image belong to?",
        options: ["Singapore", "Guatemala", "Paraguay", "Poland"],
        correctAnswer: "Poland",
        category: "country",
        language: "en",
        imageUrl: "http://example.com/image.jpg",
      },
    ];

    const response = await request(app)
      .post('/questions')
      .send({ questions });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to add questions');
  });
});
